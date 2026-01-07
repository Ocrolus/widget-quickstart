# Ocrolus Widget Quickstart - React Frontend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ./frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY ./frontend ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development

# Start development server
CMD ["npm", "start"]
