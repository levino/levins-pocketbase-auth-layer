FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production --ignore-scripts

COPY . .

CMD ["npm", "start"]
