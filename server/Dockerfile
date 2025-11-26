# Backend Dockerfile - Lightweight Node.js image
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY . .

# Create data directory for SQLite database persistence
RUN mkdir -p /data

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
