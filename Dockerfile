FROM node:alpine

EXPOSE 3000

WORKDIR /app

COPY package.json package-lock.json .

RUN npm i --only=production

# Copy application files
COPY . .

# Build static assets
RUN npm run build-assets

# Start the Node.js application
CMD ["npm", "start"]
