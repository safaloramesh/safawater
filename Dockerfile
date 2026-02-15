# Step 1: Build the app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# This tells Vite to build even if there are small TS warnings
RUN npm run build || (echo "Build failed, checking logs" && exit 1)
