# =============================================================================
#  ShopSafe — Production Dockerfile
#  Stack: Next.js 16 · Prisma · Sanity · Clerk · Stripe
#
#  BEFORE BUILDING — add this to next.config.ts:
#    const nextConfig: NextConfig = {
#      output: 'standalone',   ← enables the lean runner stage below
#      ...
#    }
#
#  Build:
#    docker build \
#      --build-arg NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
#      --build-arg NEXT_PUBLIC_SANITY_DATASET=production \
#      --build-arg NEXT_PUBLIC_SANITY_API_VERSION=2026-04-27 \
#      --build-arg NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
#      --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx \
#      -t shopsafe:latest .
#
#  Run:
#    docker run -p 3000:3000 --env-file .env.production shopsafe:latest
# =============================================================================

ARG NODE_VERSION=22
# Keep bullseye — schema.prisma targets debian-openssl-1.1.x
ARG DEBIAN_CODENAME=bullseye

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 · deps
# Install & cache npm dependencies + generate the Prisma client.
# This layer is rebuilt only when package-lock.json or prisma/schema changes.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-${DEBIAN_CODENAME}-slim AS deps

WORKDIR /app

# openssl is required by Prisma query engine at generate time
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only the files that affect dependency installation
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# ci = reproducible install; omit scripts that don't apply in Docker
RUN npm ci \
        --prefer-offline \
        --no-audit \
        --no-fund \
    && npx prisma generate

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 · builder
# Compile TypeScript, run Next.js build, produce .next/standalone output.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-${DEBIAN_CODENAME}-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Re-use the installed modules from the deps stage — no re-download
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source (respects .dockerignore — secrets / .env never land here)
COPY . .

# ── Public env vars ─────────────────────────────────────────────────────────
# NEXT_PUBLIC_* values are inlined into client JS bundles at build time.
# Pass them as --build-arg so they never need to be in any .env file on disk.
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_SANITY_API_VERSION
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID \
    NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET \
    NEXT_PUBLIC_SANITY_API_VERSION=$NEXT_PUBLIC_SANITY_API_VERSION \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Dummy values for env vars required by next.config.ts type-checks at build
# time but NOT baked into bundles. Real values are injected at runtime only.
ENV SANITY_API_TOKEN=build-placeholder \
    SANITY_API_READ_TOKEN=build-placeholder \
    CLERK_SECRET_KEY=build-placeholder \
    CLERK_WEBHOOK_SECRET=build-placeholder \
    STRIPE_SECRET_KEY=build-placeholder \
    STRIPE_WEBHOOK_SECRET=build-placeholder \
    DATABASE_URL=build-placeholder

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 · runner  (the image you actually ship)
# Copies only what Next.js standalone output needs — no node_modules, no src.
# Final image is ~200–300 MB instead of 1+ GB.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-${DEBIAN_CODENAME}-slim AS runner

WORKDIR /app

# dumb-init: PID-1 proxy — forwards signals (SIGTERM, etc.) to Node correctly
# so `docker stop` performs a graceful shutdown instead of SIGKILL after 10 s.
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
        dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# ── Non-root user ───────────────────────────────────────────────────────────
# Never run production Node as root. UID/GID 1001 is a safe non-system user.
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs --no-create-home nextjs

# ── Copy standalone bundle ───────────────────────────────────────────────────
# next build --output standalone produces a self-contained server.js with
# its own minimal node_modules. Public assets and static chunks are separate.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Prisma schema is needed if you run `prisma migrate deploy` inside the
# container (e.g. as a Kubernetes init-container or an entrypoint step).
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# ── Runtime env defaults ────────────────────────────────────────────────────
# All secrets are injected at runtime via `--env-file` or orchestrator secrets.
# Never commit real values here.
ENV NODE_ENV=production \
    PORT=3000 \
    # Bind to all interfaces so Docker port-mapping works
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

# ── Health check ─────────────────────────────────────────────────────────────
# start-period gives Next.js time to compile the first request (ISR warm-up).
# Hits the root path — adjust to /api/health if you add a dedicated endpoint.
HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=60s \
    --retries=3 \
    CMD node -e " \
        const http = require('http'); \
        const req = http.request( \
            { hostname: 'localhost', port: 3000, path: '/', timeout: 4000 }, \
            res => process.exit(res.statusCode < 500 ? 0 : 1) \
        ); \
        req.on('error', () => process.exit(1)); \
        req.on('timeout', () => { req.destroy(); process.exit(1); }); \
        req.end(); \
    "

# dumb-init is PID 1; it spawns server.js as a child and proxies all signals.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]