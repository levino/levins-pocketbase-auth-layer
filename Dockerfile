FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY lib/package.json ./lib/

RUN npm ci --only=production --ignore-scripts -w lib

COPY lib/ ./lib/

WORKDIR /app/lib

CMD ["npm", "start"]
