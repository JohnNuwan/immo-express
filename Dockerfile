# ============================================
# Immo-Express NODUS — Dockerfile
# Multi-stage build : backend Node.js + static
# EVA Agent · NODUS SYSTEMS
# ============================================

# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy backend
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev

# Copy frontend static files
COPY . .

# ---- Stage 2: Runtime ----
FROM node:22-alpine

WORKDIR /app

# Install runtime deps
RUN apk add --no-cache dumb-init tini

# Copy from builder
COPY --from=builder /app /app

# Create data directory
RUN mkdir -p /app/backend/data

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_SECRET=nodus-systems-eva-secret-2026

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start
CMD ["tini", "--", "node", "backend/src/server.js"]