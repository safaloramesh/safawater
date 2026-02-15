# Step 1: Build the React Frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Set up the Full-Stack Server
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY package*.json ./
RUN npm install --production

# Connect to your Docker Volume
RUN mkdir -p /app/storage && chmod 777 /app/storage
VOLUME /app/storage

EXPOSE 3000
CMD ["node", "server.js"]
