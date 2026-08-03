# Day 4: Backend Container Definition
FROM node:18-alpine

WORKDIR /app

# Copy package requirements
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run backend API
CMD ["node", "server.js"]
