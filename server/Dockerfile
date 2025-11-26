# Backend Dockerfile - Lightweight Node.js image
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --production; else npm install --production; fi

# Copy source files
COPY . .

# Create data directory for SQLite database persistence
RUN mkdir -p /data

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app /data

# Switch to non-root user
USER nodejs
# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
