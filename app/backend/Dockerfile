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
# Copy local DB file so runtime has filesystem persistence
COPY db.json ./db.json
# Expose port
EXPOSE 4000
CMD ["node","dist/server.js"]
