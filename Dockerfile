FROM node:alpine AS builder

EXPOSE 8000

WORKDIR /app

# Copy the server files
COPY server .

# Install all dependencies (including dev for build)
RUN npm install

# Build static assets (CSS)
RUN npm run build

# Start the Node.js application
CMD ["npm", "run", "start"]
