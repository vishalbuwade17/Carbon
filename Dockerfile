# Production Dockerfile for EcoTrack Full-Stack App
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install packages with legacy peer deps for React 19 compatibility
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build production assets for frontend
RUN npm run build

# Expose default API server port
EXPOSE 5000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Command to boot database seeding and start full-stack server
CMD ["node", "server/index.js"]
