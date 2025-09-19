# Frontend Dockerfile (multi-stage build)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=deps /app/dist .
# Simple default Nginx config tweak could be added for SPA routing
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
