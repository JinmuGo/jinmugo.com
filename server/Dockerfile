FROM node:22-alpine AS base
# Build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies (compiles better-sqlite3 native binding)
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm rebuild better-sqlite3

# Build TypeScript
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/src/db ./src/db

RUN mkdir -p /app/data

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "pnpm db:push && node dist/index.js"]
