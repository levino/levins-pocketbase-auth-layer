FROM node:alpine AS builder

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=website/package.json,target=package.json \
    --mount=type=cache,target=/root/.npm \
    npm i

# Copy the rest of the source files into the image.
COPY website .

RUN npm run build

FROM node:alpine

EXPOSE 8000

WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /usr/src/app/build /app/build

# Copy the server files
COPY server .

# Install production dependencies
RUN npm install --production

# Start the Node.js application
CMD ["npm", "run", "start"]