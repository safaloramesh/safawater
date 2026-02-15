# Stage 1: Build (Keep this exactly as you have it)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# --- NEW: PERSISTENT STORAGE SETUP ---
# Create a folder for your data and give it permissions
RUN mkdir -p /usr/share/nginx/html/storage && \
    chmod 777 /usr/share/nginx/html/storage

# Tell Docker this folder should be a persistent volume
VOLUME /usr/share/nginx/html/storage
# -------------------------------------

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
