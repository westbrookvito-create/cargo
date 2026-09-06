FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
