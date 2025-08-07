# Use Node.js 18 as base image
FROM node:18-alpine

# Create app directory and set user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy all source files
COPY --chown=nextjs:nodejs . .

# Build the application
RUN npm run build

# Expose port 8080 (Hugging Face Spaces default)
EXPOSE 8080

# Start the application in preview mode
CMD ["npm", "run", "preview"]