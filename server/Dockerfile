FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server ./server
COPY lib ./lib

EXPOSE 8080

CMD ["node", "server/multiplayer-server.ts"]
