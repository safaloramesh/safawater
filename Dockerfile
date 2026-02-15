# Stage 1: Build the application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This creates the 'dist' folder
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
# Copy the compiled builder output to Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Add a basic Nginx config to handle SPA routing
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
