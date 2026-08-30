FROM node:22-alpine AS base
# Build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
WORKDIR /app

# Install dependencies (compiles better-sqlite3 native binding)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

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
COPY --from=build /app/drizzle ./drizzle

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/index.js"]
