# Backend Dockerfile (multi-stage)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Install production deps only
RUN npm ci --omit=dev
# Copy build output
COPY --from=deps /app/dist ./dist
# Copy mock and other runtime assets
COPY src/mock ./dist/mock
# Ensure a db.json exists at runtime (create a default if missing)
# This avoids Docker build failures when db.json is gitignored or not present
RUN [ -f /app/db.json ] || echo '{}' > /app/db.json
# Expose port
EXPOSE 4000
CMD ["node","dist/server.js"]
