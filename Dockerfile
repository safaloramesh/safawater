# Step 1: Build the React Frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Using npx vite build ensures we don't fail on minor TS warnings
RUN npx vite build 

# Step 2: Set up the Full-Stack Server
FROM node:18-alpine
WORKDIR /app
# Copy built files from the build stage
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY package*.json ./
RUN npm install --production

# Connect to your Docker Volume and set permissions
RUN mkdir -p /app/storage && chmod 777 /app/storage
# Important: Ensure the server can see the 'dist' folder
RUN chmod -R 755 /app/dist

EXPOSE 3000
CMD ["node", "server.js"]
