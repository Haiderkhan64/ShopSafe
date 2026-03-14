# ShopSafe

Full-stack e-commerce platform with real-time cart synchronization, Stripe payments, and headless CMS content management.

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

## Features

- 🛍️ Product catalog with category filtering and search
- 🛒 Smart shopping cart (local persistence + server sync)
- 💳 Stripe checkout with webhook confirmation
- 🔐 Clerk authentication with user profiles
- 📦 Order management and history
- 🎫 Coupon codes and sales campaigns
- 🎨 Responsive UI with dark mode
- ⚡ Real-time cart sync across devices
- 📊 Admin dashboard via Sanity Studio

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 15 (App Router)        |
| Language  | TypeScript 5.9                 |
| Styling   | Tailwind CSS 3.4 + Shadcn UI   |
| Database  | PostgreSQL + Prisma 6.18       |
| CMS       | Sanity 3.99                    |
| Auth      | Clerk 6.34                     |
| Payments  | Stripe 18.5                    |
| State     | Zustand 5.0 (with persistence) |
| Forms     | React Hook Form + Zod          |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Accounts: [Clerk](https://clerk.com), [Sanity](https://sanity.io), [Stripe](https://stripe.com)

### Quick Start

```bash
# Clone repo
git clone https://github.com/Haiderkhan64/ShopSafe.git
cd ShopSafe

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

Visit:

- App: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=skXXXXXXX  # Needs write access

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shopsafe

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From webhook endpoint
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Local Stripe Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (whsec_...) to .env.local
```

## Architecture

### Project Structure

```
ShopSafe/
├── app/
│   ├── (auth)/           # Auth pages (sign-in, sign-up, onboarding)
│   ├── (store)/          # Store pages (products, cart, orders, checkout)
│   ├── api/              # API routes
│   │   ├── cart/         # Cart sync endpoints
│   │   ├── stripe/       # Stripe webhook handler
│   │   └── user/         # User CRUD operations
│   └── studio/           # Sanity Studio admin
│
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── forms/            # Form components
│   └── shared/           # Shared components (Header, etc)
│
├── hooks/
│   ├── useCartSync.ts    # Cart synchronization logic
│   └── useUserData.ts    # User data fetching
│
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── stripe.ts         # Stripe client setup
│   └── formatCurrency.ts # Utility functions
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
│
├── sanity/
│   ├── schemaTypes/      # Content type definitions
│   │   ├── productType.ts
│   │   ├── categoryType.ts
│   │   ├── orderType.ts
│   │   └── salesType.ts
│   └── lib/
│       ├── client.ts     # Sanity client
│       └── products/     # Product query helpers
│
└── store/
    └── index.ts          # Zustand basket store
```

### Data Flow

#### Cart Synchronization Strategy

The app uses a **local-first** approach with server reconciliation:

```
Anonymous User:
  localStorage ──────────────────> UI
                (Zustand persist)

Authenticated User (Login):
  localStorage ─┐
                ├──> Merge Logic ──> PostgreSQL ──> UI
  PostgreSQL ───┘     (quantities sum)

Authenticated User (Subsequent visits):
  PostgreSQL ────────────────────> localStorage ──> UI
```

**Implementation (`store/index.ts`):**

- `addItem()`: Optimistically updates local state
- `mergeWithServer()`: Syncs localStorage → PostgreSQL on login
- `hydrateFromServer()`: Loads PostgreSQL → localStorage if local is empty
- `syncToServer()`: Background sync for authenticated operations

#### Database Schema

```prisma
// Key models (simplified)

model User {
  id        String     @id @default(cuid())
  clerkId   String     @unique
  email     String     @unique
  cartItems CartItem[]
  orders    Order[]
}

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String   // References Sanity product
  quantity  Int
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, productId])
}

model Order {
  id                      String      @id @default(cuid())
  userId                  String
  stripeCheckoutSessionId String      @unique
  totalPrice              Float
  status                  OrderStatus
  items                   OrderItem[]
}
```

**Note:** Product data lives in Sanity CMS, not PostgreSQL. The database only stores references (productId) and transactional data.

### API Routes

| Endpoint              | Method | Purpose                      |
| --------------------- | ------ | ---------------------------- |
| `/api/cart`           | GET    | Fetch user's cart from DB    |
| `/api/cart/merge`     | POST   | Merge local cart with server |
| `/api/cart/merge`     | PATCH  | Sync single item add/remove  |
| `/api/cart/clear`     | POST   | Clear user's cart            |
| `/api/products/[id]`  | GET    | Fetch product by ID          |
| `/api/stripe/webhook` | POST   | Handle Stripe events         |
| `/api/user/create`    | POST   | Create user on Clerk signup  |

## Development

### Available Scripts

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npx prisma studio        # Open Prisma Studio (DB GUI)
npx prisma migrate dev   # Create new migration
```

### Adding a New Feature

1. **Create database migration** (if needed):

   ```bash
   npx prisma migrate dev --name add_feature_name
   ```

2. **Add Sanity schema** (if content-related):

   ```typescript
   // sanity/schemaTypes/featureType.ts
   export const featureType = defineType({
     name: 'feature',
     title: 'Feature',
     type: 'document',
     fields: [...]
   })
   ```

3. **Create API route**:

   ```typescript
   // app/api/feature/route.ts
   export async function GET(req: Request) {
     const { userId } = auth();
     // Implementation
   }
   ```

4. **Build UI components** in `components/`

5. **Add page** in `app/(store)/feature/page.tsx`

### Code Conventions

- **Naming**: camelCase for functions, PascalCase for components
- **Imports**: Absolute paths via `@/` alias
- **Styling**: Tailwind utilities only (no custom CSS unless necessary)
- **Types**: Define interfaces in component files or `sanity.types.ts`
- **Errors**: Use try-catch with proper error messages

**Commit Messages:**

```
feat: add product filtering by price
fix: resolve cart sync race condition
refactor: extract cart logic to custom hook
docs: update deployment instructions
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "feat: initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variables (same as `.env.local`)
   - Deploy

3. **Setup Production Webhooks**

   **Stripe:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Copy signing secret → add to Vercel env as `STRIPE_WEBHOOK_SECRET`

   **Clerk (optional):**
   - Dashboard → Webhooks → Add endpoint
   - URL: `https://your-domain.vercel.app/api/user/create`
   - Event: `user.created`

4. **Database Migration**
   ```bash
   # In your project root
   npx prisma migrate deploy
   ```

### Docker Deployment

```bash
# Build image
docker build -t shopsafe .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..." \
  shopsafe
```

Or use `docker-compose.yml` for full stack setup.

## Troubleshooting

### Cart Not Syncing

**Symptom:** Items added to cart don't persist after login

**Fix:**

1. Check browser console for sync errors
2. Verify `CLERK_SECRET_KEY` in `.env.local`
3. Ensure PostgreSQL is running and `DATABASE_URL` is correct
4. Check `useCartSync` hook is mounted in layout

### Stripe Webhook Failures

**Symptom:** Orders not created after payment

**Fix:**

1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check webhook endpoint logs in Stripe dashboard
3. Ensure webhook URL is publicly accessible (use ngrok for local testing)
4. Verify events `checkout.session.completed` is selected

### Sanity Studio Access Issues

**Symptom:** 403 errors when accessing `/studio`

**Fix:**

1. Verify `SANITY_API_TOKEN` has write permissions
2. Check Sanity project ID matches `NEXT_PUBLIC_SANITY_PROJECT_ID`
3. Ensure dataset exists: `npx sanity dataset list`

### Database Connection Errors

**Symptom:** Prisma client errors

**Fix:**

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push
```

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test locally
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

**PR Guidelines:**

- Include tests if applicable
- Update documentation
- Follow existing code style
- Ensure `npm run lint` passes

## License

This project is private and proprietary.

## Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) - React framework
- [Stripe](https://stripe.com/) - Payment processing
- [Clerk](https://clerk.com/) - Authentication
- [Sanity](https://sanity.io/) - Content management
- [Prisma](https://www.prisma.io/) - Database ORM
- [Shadcn UI](https://ui.shadcn.com/) - UI components

---

**Maintained by [@Haiderkhan64](https://github.com/Haiderkhan64)**

For questions or issues, please [open an issue](https://github.com/Haiderkhan64/ShopSafe/issues).
