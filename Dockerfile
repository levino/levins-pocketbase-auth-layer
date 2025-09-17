FROM node:alpine AS builder

EXPOSE 8000

WORKDIR /app

# Copy the server files
COPY server .

# Install production dependencies
RUN npm install --production

# Start the Node.js application
CMD ["npm", "run", "start"]
