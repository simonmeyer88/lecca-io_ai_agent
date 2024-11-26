# Use the official Node.js image as the base
FROM node:20.6.0-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY . .

# Increase the Node.js heap size
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install pnpm
RUN npm install -g pnpm

# Install nest
RUN npm install -g @nestjs/cli

# Install nx
RUN npm install -g nx

# Install dependencies for production
# This will install all app dependencies, including UI. We'll fix this in the future.
RUN pnpm install --frozen-lockfile

# Reset NX cache. We will want to fix this in the future. But it's giving an error.
# "NX Failed to process project graph. Run "nx reset" to fix this. Please report the issue if you keep seeing it."
RUN pnpm exec nx reset

# Build the project
RUN pnpm exec nx run server:build

# Expose the port 
EXPOSE 9094

# Start the application
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm exec nx run server:serve --configuration=production"]

