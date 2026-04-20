# ShopSafe

A production-grade e-commerce platform. Secure checkout, fraud detection instrumentation, real-time inventory, and a multi-tab cart that actually works.

Built on Next.js 15, Sanity CMS, PostgreSQL via Prisma, Clerk auth, and Stripe. Two databases on purpose — content and commerce are different problems and treating them as one is how you end up with a mess.

---

## What This Is

ShopSafe is not a starter template. It is a full e-commerce system with:

- A cart that survives page refreshes, sign-in/sign-out transitions, and multiple browser tabs without corrupting itself
- Stripe webhooks that are idempotent at the database level, not the application level
- An onboarding flow with two-layer verification so middleware never blocks legitimate users
- Session tracking for fraud detection analytics
- Sitewide and per-product discount logic that flows from a single function into both the UI and the Stripe line items — no price divergence possible
- Soft and hard user deletion that respects order audit trails

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router, Turbopack) | RSC + Server Actions give us zero-cost server rendering without a separate API layer for most things |
| Content & Products | Sanity CMS | Structured content with live subscriptions. Products, orders, categories, and sales campaigns live here |
| User data & Sessions | PostgreSQL via Prisma | Relational integrity matters for orders, carts, sessions, and fraud flags. Sanity is not a relational database |
| Auth | Clerk | Passkeys, social login, webhooks for lifecycle events. Not worth building yourself |
| Payments | Stripe | Checkout Sessions with server-generated order numbers. The client never touches the order ID |
| State | Zustand + persist middleware | Cart state with a strict two-array invariant. Lightweight, no Redux ceremony |
| Styling | Tailwind CSS + shadcn/ui | Utility classes with a sane component layer. No CSS-in-JS runtime cost |
| Rate Limiting | Upstash Redis (Ratelimit) | Sliding window, per-IP, fails open gracefully when Redis is unavailable |
| Validation | Zod | Every API route validates its input. No raw `req.body` anywhere |

---

## Architecture

### The Two-Database Design

This gets asked about. The answer is straightforward.

**Sanity** owns things that are content: products, categories, orders (after payment), and sales campaigns. It has a CDN, a live subscription API, and a studio UI that non-engineers can use. It is not a relational database. It has no foreign keys, no transactions, and no joins.

**PostgreSQL** owns things that are relational: users, sessions, carts, order items, fraud flags, and the analytics data warehouse. These have foreign key constraints, transactional integrity, and need to support queries that Sanity's GROQ cannot express efficiently.

The tradeoff is that you have two sources of truth for some data (an order exists in both Sanity and implicitly in the Postgres session/cart cleanup logic). The boundary is deliberate: Sanity is the source of truth for order display; Postgres is the source of truth for user state. They do not need to agree on anything except the Clerk user ID and the Sanity product IDs.

### Cart Architecture

The cart is the most complex piece of the system. It has to handle:

- Anonymous users (localStorage only)
- Signed-in users (localStorage + Postgres, merged on sign-in)
- Multiple browser tabs (leader election via BroadcastChannel)
- Page refreshes (Zustand persist middleware, ID-only, never full product objects)
- Auth transitions (sign-in triggers merge, sign-out triggers clear)

The store maintains two arrays in lockstep: `items` (full Sanity product objects, in-memory only) and `_persistedItems` (productId + quantity pairs, written to localStorage). Every mutation goes through a single `mutateCartItem` function that updates both arrays atomically within the Zustand setter. In development, an invariant assertion fires after every mutation to catch any desync immediately.

On sign-in, one tab is elected leader via BroadcastChannel ping/pong. The leader runs `mergeWithServer` (local cart wins on quantity conflicts, server items are included if not in local cart), pushes the merged result back to Postgres, then broadcasts `sync_done` so other tabs can re-hydrate without each making their own merge request.

```
Sign-in
  │
  ├─ Tab A (leader elected via BroadcastChannel)
  │   ├─ fetchRawServerCart()
  │   ├─ merge(local, server) → local wins on conflict
  │   ├─ POST /api/cart/merge
  │   ├─ fetchProductsByIds() → hydrate items[]
  │   └─ broadcast sync_done
  │
  └─ Tab B, C (followers)
      └─ receive sync_done → hydrateFromServer()
```

### Pricing

All discount logic lives in `lib/getEffectivePrice.ts`. It takes a product and an optional sitewide sale percentage. Product-level discounts win over sitewide sales. The result — `discountedPrice`, `originalPrice`, `effectiveDiscount`, `hasDiscount`, `discountAmount` — is consumed by `ProductThumb`, the basket page, and `createCheckoutSession`. The same function, the same inputs, the same output. The customer sees exactly what they are charged.

### Middleware & Onboarding

Middleware is a bad place to do database lookups on every request. This system avoids it with two cookies:

- `onboarding_complete` — long-lived, set after DB confirms onboarding is done
- `ob_verified` — session-scoped, value is the Clerk `sessionId`

On most requests, middleware checks both cookies and fast-paths. Only on first visit after a new Clerk session does it redirect through `/api/set-onboarded`, which does the DB lookup, sets both cookies, and redirects back to the original destination. The slow path runs at most once per Clerk session.

### Stripe Webhook Idempotency

Stripe delivers webhooks at least once. The naive approach — check if an order exists, create if not — has a race window where two concurrent deliveries both read "not exists" before either writes.

This system uses raw SQL `INSERT ... ON CONFLICT DO NOTHING` into `system_configs` keyed by `webhook:checkout:{sessionId}`. The database guarantees exactly one insert succeeds. The handler that gets 0 rows returned stops immediately. The one that gets 1 row continues. No application-level locking required.

Sanity's `createIfNotExists` handles retries at the content layer for the same reason.

---

## Project Structure

```
├── app/
│   ├── (auth)/              # Sign-in, sign-up, onboarding — isolated Clerk appearance
│   ├── (store)/             # Main storefront — scroll-aware header, cart sync
│   │   ├── basket/          # Cart page with Stripe checkout
│   │   ├── categories/      # Category-filtered product grids
│   │   ├── orders/          # Order history (server component, auth-gated)
│   │   ├── product/[slug]/  # Product detail with ISR (15min revalidation)
│   │   ├── search/          # Full-text product search
│   │   └── success/         # Post-payment with order polling
│   ├── api/
│   │   ├── cart/            # GET (fetch), POST /sync (add/remove), POST /merge, POST /clear
│   │   ├── orders/check/    # Polls Sanity for order existence (used by success page)
│   │   ├── products/by-ids/ # Batch Sanity product fetch for cart hydration
│   │   ├── stripe/webhook/  # Payment webhook with idempotency
│   │   ├── track-session/   # Session creation/update for fraud analytics
│   │   ├── end-session/     # Sign-out session close + Clerk webhook handler
│   │   ├── set-onboarded/   # Cookie setter + DB verification (middleware slow path)
│   │   └── user/            # Self-profile CRUD + admin fetch by ID
│   └── studio/              # Sanity Studio embedded at /studio
├── components/
│   ├── shared/Topbar.tsx    # Navigation with passkey creation, sign-out sequence
│   ├── AddToBasketButton    # Quantity control with optimistic updates + server sync
│   ├── ProductThumb         # Card with discount badges, hover overlay
│   └── CartSyncWrapper      # Mounts useCartSync hook at the layout level
├── lib/
│   ├── getEffectivePrice.ts # Single source of truth for all discount logic
│   ├── rate-limit.ts        # Upstash Redis sliding window, fails open
│   ├── stripe.ts            # Stripe client (server-only)
│   ├── prisma.ts            # Prisma client singleton
│   └── constants.ts         # MAX_CART_QUANTITY, revalidation periods
├── sanity/
│   ├── schemaTypes/         # product, order, sale, category, blockContent
│   └── lib/
│       ├── products/        # getAllProducts, getProductBySlug, search, by-category
│       ├── sales/           # getActiveSales, getBestDiscount, getActiveSaleByCouponCode
│       └── orders/          # getMyOrders
├── store/index.ts           # Zustand cart store with full sync architecture
├── hooks/
│   ├── useCartSync.ts       # Leader election + auth transition handler
│   └── useDeviceInfo.ts     # UAParser for session tracking
├── middleware.ts            # Cookie fast-path + onboarding guard
└── prisma/schema.prisma     # Full schema: users, sessions, carts, orders, fraud, DW
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 14+
- A Sanity project
- A Clerk application
- A Stripe account
- Upstash Redis (optional — rate limiting fails open without it)

If you use Nix, there is a `flake.nix` that gives you all of the above (using Podman for containers) with a single `nix develop`.

### Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopsafe"

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-01-01"
SANITY_API_READ_TOKEN="your-read-token"
SANITY_API_TOKEN="your-write-token"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Upstash (optional — rate limiting disabled if absent)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm prisma migrate deploy

# Seed with development data
npm prisma db seed

# Generate Sanity types (after schema changes)
npm typegen

# Start development server
npm dev
```

### Stripe Webhooks (Local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Clerk Webhooks (Local)

Expose your local server with ngrok or similar, then configure in the Clerk dashboard:

- `session.ended` → `https://your-tunnel.ngrok.io/api/end-session/webhook`
- `user.deleted` → `https://your-tunnel.ngrok.io/api/end-session/webhook`

---

## Key Design Decisions

**Why Zustand and not React Query / SWR for cart state?**
Cart state is local-first. React Query is a server-cache synchronisation library — it assumes the server is the source of truth. The cart has three sources of truth depending on auth state: localStorage (anonymous), merged local+server (just signed in), and server (follower tabs after sync). Zustand with explicit sync actions models this cleanly. React Query would require significant contortion.

**Why `_persistedItems` alongside `items`?**
Full Sanity product objects (images, descriptions, block content) are large. Persisting them to localStorage wastes space and goes stale the moment a product is updated in Sanity. Only `productId` and `quantity` are persisted. On every hydration, fresh product objects are fetched from Sanity via `/api/products/by-ids`. The two arrays must always agree on productIds and quantities — the invariant assertion in development catches any violation immediately.

**Why is the order number generated server-side?**
Two reasons. First, a client-generated UUID allows a race condition where a double-click or network retry sends two checkout requests with different order numbers, creating duplicate orders. The server action generates one UUID per invocation. Second, a client-supplied order number is an untrusted input. The server owns the order namespace.

**Why soft-delete users with orders?**
SQL foreign key constraints with `ON DELETE RESTRICT` prevent deleting a user who has orders. The options are: cascade delete (destroys the order audit trail, potentially illegal in some jurisdictions), set null (breaks order attribution), or soft-delete (anonymise PII, preserve the record). Users with no orders are hard-deleted. Users with orders are anonymised. The `user.deleted` Clerk webhook handles this automatically.

**Why embed Sanity Studio at `/studio`?**
Operational convenience. Editors can access the CMS at the same domain without a separate deployment. The route is `force-static` and excluded from the middleware matcher so it never goes through auth checks.

**Why fail open on rate limiting?**
If Upstash Redis is unavailable or unconfigured, `rateLimit()` returns `null` and all requests proceed. A rate limiter that takes down your app when Redis goes cold is worse than no rate limiter at all. The tradeoff is documented and logged in production.

---

## Data Models

### Sanity (Content)

| Schema | Key Fields |
|---|---|
| `product` | name, slug, image, price, discount(%), description, categories[], stock |
| `category` | title, slug, description |
| `order` | orderNumber, clerkUserId, products[], totalPrice, status, stripeIds |
| `sale` | title, couponCode, discountAmount, validFrom, validUntil, isActive |

### PostgreSQL (Operational)

| Model | Purpose |
|---|---|
| `User` | id(clerkId), email, name, role, address, hasCompletedOnboarding |
| `Session` | userId, deviceInfo(JSON), ipAddress, startTime, endTime, isActive |
| `Cart` | userId (1:1) |
| `CartItem` | cartId, productId(sanityId), quantity |
| `Order` | userId, status, total (internal tracking) |
| `Transaction` | orderId, amount, paymentMethod, status, metadata(JSON) |
| `FraudFlag` | transactionId, riskScore, flagged, isConfirmedFraud, source |

The data warehouse models (`UserDim`, `ProductDim`, `TimeDim`, `SalesFact`) support BI queries. They are populated separately from the operational models and can be rebuilt from operational data at any time.

---

## API Reference

All API routes validate input with Zod. All routes that mutate state require a valid Clerk session. Rate limiting is applied where noted.

| Route | Method | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `/api/user` | GET | Required | — | Fetch own profile |
| `/api/user` | POST | Required | 5/min | Create or update own profile |
| `/api/user/[id]` | GET | Required | — | Fetch any user (admin only) |
| `/api/cart` | GET | Required | — | Fetch server cart items |
| `/api/cart/sync` | POST | Required | 30/min | Add or remove single item |
| `/api/cart/merge` | POST | Required | — | Replace server cart with local state |
| `/api/cart/clear` | POST | Required | — | Empty server cart |
| `/api/products/by-ids` | POST | None | — | Batch fetch Sanity products by ID |
| `/api/orders/check` | GET | Required | — | Poll for order existence in Sanity |
| `/api/track-session` | POST | Required | 10/min | Create or update session record |
| `/api/end-session` | POST | Required | — | Close active session on sign-out |
| `/api/end-session/webhook` | POST | Svix sig | — | Clerk webhook: session.ended, user.deleted |
| `/api/stripe/webhook` | POST | Stripe sig | — | Stripe webhook: checkout.session.completed |
| `/api/set-onboarded` | GET | Required | — | DB verify + set onboarding cookies |

---

## Sanity Schema Notes

**Products** have a `discount` field (0–100%) that is per-product and takes precedence over any active sitewide `Sale`. This means you can run a sale campaign while keeping certain products at full price, or discount a single product permanently without creating a sale record.

**Orders** in Sanity are created by the Stripe webhook handler, not by the application. The client never writes to Sanity. The `_id` of each order document is `order-{stripeCheckoutSessionId}`, which makes `createIfNotExists` naturally idempotent.

**Sales** are time-bounded and toggled by `isActive`. `getActiveSales` filters by both the boolean flag and the validity window, then returns results ordered by `discountAmount desc` so the best deal is always `sales[0]`.

---

## Caching Strategy

| Data | Strategy | TTL |
|---|---|---|
| Product listings (home) | ISR | 60 seconds |
| Product detail pages | ISR | 15 minutes |
| Active sales | `sanityFetch` with `revalidate: 0` | Always fresh (live subscription) |
| Category listings | `sanityFetch` with `revalidate: 0` | Always fresh |
| Sanity Studio | `force-static` | Build time |

Live Sanity subscriptions (`SanityLive` component in root layout) push updates to RSC pages without a full refresh. ISR handles the case where the subscription has not yet delivered an update.

---

## Known Issues

**1. Missing `await` on `rateLimit` in `/api/user/route.ts`**

The function is async but the call site does not await it, meaning the rate limit check returns a `Promise` that is always truthy. Rate limiting on the user creation endpoint is currently non-functional.

```typescript
// Broken
const limited = rateLimit(request, { windowMs: 60_000, max: 5 });

// Fix
const limited = await rateLimit(request, { windowMs: 60_000, max: 5 });
```

**2. `/api/user/[id]` missing from middleware bypass list**

Admin requests to this route go through the onboarding redirect check on every request. Add `/api/user(.*)` to `isBypassRoute` in `middleware.ts`.

**3. `OrderBy` component is a no-op**

It writes a `?sort=` query param but nothing reads it. Product ordering is always by name ascending as returned by Sanity.

**4. Quick View button has no handler**

The button in `ProductThumb` renders but does nothing on click.

**5. Duplicate slider image**

`SliderImages.tsx` slide 3 uses the same `srcDesktop` as slide 1 (`Desktop-1.jpg`).

---

## Running in Production

```bash
npm build
npm start
```

Ensure `DATABASE_URL` points to a production PostgreSQL instance with SSL enabled. Run migrations before deployment — never `db push`:

```bash
npm prisma migrate deploy
```

The Sanity write token (`SANITY_API_TOKEN`) used by `backendClient` must have write access to the dataset. It is only used in the Stripe webhook handler and must never be exposed to the client.

---

## License

MIT