FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

# Copy application files
COPY . .

# Build static assets
RUN npm run build-assets

# Start the Node.js application
CMD ["npm", "start"]
