# ===============================
# 🚧 Stage 1 — Build the Next.js App
# ===============================
FROM node:22-bullseye AS builder

WORKDIR /app

# Install certificates & build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    openssl \
 && rm -rf /var/lib/apt/lists/*

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only dependency files first for caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# ✅ Generate Prisma Client for debian-openssl-1.1.x
RUN npx prisma generate

# Copy all files to the container
COPY . .

# ✅ Ensure HTTPS certificates are recognized
RUN update-ca-certificates

# Build Next.js
RUN npm run build

# ===============================
# 🚀 Stage 2 — Run Production Server
# ===============================
FROM node:22-bullseye

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
 && rm -rf /var/lib/apt/lists/* \
 && update-ca-certificates

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# ✅ Generate Prisma Client again in production environment
RUN npx prisma generate

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]