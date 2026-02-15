# --- BUILD STAGE ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# Use --force if there are dependency conflicts
RUN npm install --force 
COPY . .
# Force the base path during the build command itself
RUN npx vite build --base=./

# --- RUN STAGE ---
FROM node:18-alpine
WORKDIR /app
# Check if dist exists before copying
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY package*.json ./
RUN npm install --production

RUN mkdir -p /app/storage && chmod 777 /app/storage
EXPOSE 3000
CMD ["node", "server.js"]
