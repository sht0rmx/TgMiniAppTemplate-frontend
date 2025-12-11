# --- Base Stage ---
FROM node:lts-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- Development Stage ---
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# --- Builder Stage ---
FROM base AS build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html

# Simplified Nginx config injection
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]