FROM node:20-alpine

WORKDIR /app

# copy package manifest and install production deps
COPY package*.json ./
RUN npm ci --production

# copy source
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
