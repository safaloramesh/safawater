# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
# Note: If this fails with 'exit code 2', change your package.json 
# build script from "tsc && vite build" to "vite build"
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the 'dist' folder created by Vite to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
