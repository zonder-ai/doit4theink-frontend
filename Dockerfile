FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json ./

# Install dependencies with full output for debugging
RUN npm install --verbose

# Copy source files
COPY . .

# Show debugging information
RUN echo "Node.js version:" && node --version
RUN echo "NPM version:" && npm --version
RUN echo "Contents of directory:" && ls -la
RUN echo "Environment:" && env

# Build the app with more verbose output
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production

# Run build with more debugging
RUN npm run build --verbose || (echo "Build failed with exit code $?" && cat /tmp/npm-debug.log || true && exit 1)

# Configure for production
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the app
CMD ["npm", "start"]
