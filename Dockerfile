# Stage 1: Build React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx vite build

# Stage 2: Production Server
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY package*.json ./
RUN npm install --production

# Volume Setup
RUN mkdir -p /app/storage && chmod 777 /app/storage
VOLUME /app/storage

EXPOSE 3000
CMD ["node", "server.js"]
