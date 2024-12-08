# Build stage
FROM node:20.6.0-alpine AS builder

WORKDIR /app

# Copy workspace configuration and root config files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./
COPY jest.preset.js eslint.config.js ./
COPY packages/ui ./packages/ui

# Install pnpm and other global dependencies
RUN npm install -g pnpm nx

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build UI
RUN pnpm exec nx run ui:build

# Production stage
FROM nginx:alpine

# Copy built static files to nginx serve directory
COPY --from=builder /app/dist/packages/ui /usr/share/nginx/html

# Copy nginx config if you have custom configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]