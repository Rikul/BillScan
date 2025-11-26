# Frontend Dockerfile - Multi-stage build for lightweight image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Accept build arguments for API keys
ARG GEMINI_API_KEY
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG OLLAMA_HOST
ARG OLLAMA_MODEL
ARG OPENAI_MODEL
ARG ANTHROPIC_MODEL
ARG AI_SERVICE

# Set as environment variables for the build
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
ENV OLLAMA_HOST=$OLLAMA_HOST
ENV OLLAMA_MODEL=$OLLAMA_MODEL
ENV OPENAI_MODEL=$OPENAI_MODEL
ENV ANTHROPIC_MODEL=$ANTHROPIC_MODEL
ENV AI_SERVICE=$AI_SERVICE
# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage - serve with lightweight nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
