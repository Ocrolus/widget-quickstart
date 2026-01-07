# Ocrolus Widget Quickstart - Node.js Backend
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN chown -R node:node /app

# Copy package files
COPY --chown=node:node ./node/package*.json /app/

# Switch to non-root user
USER node

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=node:node ./node/index.js ./
COPY --chown=node:node ./.env ./

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start the server
CMD ["node", "index.js"]
