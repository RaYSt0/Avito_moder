FROM node:20-alpine AS builder

WORKDIR /app

# Allow overriding API base for build-time
ARG VITE_API_BASE_URL=http://localhost:3001/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# install deps (dev deps needed for build)
COPY package*.json ./
RUN npm ci

# copy sources and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# provide SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
