    # Stage 1: Install dependencies
    FROM oven/bun:1 AS deps
    WORKDIR /app
    COPY package.json bun.lockb ./
    RUN bun install --frozen-lockfile


    # Stage 2: Build application
    FROM oven/bun:1 AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN bunx prisma generate
    RUN bun build ./src/server.ts --outdir ./dist --target bun


    # Stage 3: Production image
    FROM oven/bun:1-slim
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=builder /app/package.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/dist ./dist
    EXPOSE 3000
    
    CMD ["bun", "./dist/server.js"]