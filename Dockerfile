FROM node:alpine

EXPOSE 3000

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build static assets
RUN npm run build-assets

# Start the Node.js application
CMD ["npm", "start"]
