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

# Build the project
RUN pnpm exec nx run server:build

# Expose the port 
EXPOSE 9094

# Start the application
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/apps/server/main.js"]

