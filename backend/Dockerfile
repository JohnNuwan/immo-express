# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# ---- Runtime Stage ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY package.json server.js config.js database.js ./
COPY middleware ./middleware
COPY routes ./routes

# Expose API port
EXPOSE 8000

# Run as non-root user
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

CMD ["node", "server.js"]