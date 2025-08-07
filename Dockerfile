# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Expose port 8080 (Hugging Face Spaces default)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "preview"]