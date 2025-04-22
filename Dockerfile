FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

# Add development tools and other dependencies
RUN apk add --no-cache libc6-compat python3 make g++ git

# Copy package files and npmrc
COPY package.json package-lock.json* .npmrc ./

# Install dependencies with fallback mechanisms
RUN echo "Installing dependencies..." && \
    npm install --no-audit --prefer-offline --frozen-lockfile --network-timeout=100000 || \
    (echo "Retrying with legacy peer deps..." && \
     npm install --no-audit --prefer-offline --legacy-peer-deps --network-timeout=100000) || \
    (echo "Retrying with clean install..." && \
     npm cache clean --force && \
     npm install --no-audit --prefer-offline --legacy-peer-deps --no-package-lock --network-timeout=100000)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Debug information
RUN echo "Node version: $(node -v)" && echo "NPM version: $(npm -v)"
RUN ls -la

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Set the correct permission for NextJS
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]