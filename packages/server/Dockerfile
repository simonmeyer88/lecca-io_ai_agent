FROM node:20.6.0-alpine AS builder

WORKDIR /app

# Copy workspace configuration and root config files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
COPY jest.preset.js eslint.config.js ./
COPY packages/server ./packages/server/
COPY packages/toolkit ./packages/toolkit/
COPY packages/apps ./packages/apps/


# Install pnpm and other global dependencies
RUN npm install -g pnpm @nestjs/cli nx

# Install dependencies
RUN pnpm install --frozen-lockfile 

# Build server
RUN pnpm exec nx run server:build 

# Production image
FROM node:20.6.0-alpine

WORKDIR /app

# Copy built files and necessary runtime files
COPY --from=builder /app/dist/packages/server ./dist/packages/server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/server/prisma ./prisma


EXPOSE 9094

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/packages/server/main.js"]