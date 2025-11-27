FROM node:alpine

WORKDIR /app

COPY package.json ./

RUN npm install --only=production --ignore-scripts

COPY . .

CMD ["npm", "start"]
