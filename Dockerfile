# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Start the application
CMD ["npm", "run", "preview"]