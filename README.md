# PocketBase Auth Layer

A Docker container that protects static websites with PocketBase authentication using OAuth providers (GitHub, Google, Microsoft).

## ✨ Features

- **OAuth Authentication**: Login with GitHub, Google, or Microsoft
- **Group-based Access Control**: Users must be members of a specific group to access content
- **Static Site Protection**: Serves static files after authentication
- **Responsive Login UI**: Mobile-friendly login interface with FAQ
- **Cookie-based Sessions**: Secure session management
- **Multi-provider Support**: Flexible OAuth provider configuration

## 🚀 Quick Start

### Using as Base Image

The recommended approach is to extend this image and add your static website:

```dockerfile
FROM your-registry/pocketbase-auth-layer:latest

# Copy your static website to the build directory
COPY ./dist /app/build

# Optional: Override views if needed
# COPY ./custom-views /app/views
```

### Multi-stage Build Example

For building and protecting a static site in one Dockerfile:

```dockerfile
# Build stage
FROM node:alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Protection stage
FROM your-registry/pocketbase-auth-layer:latest
COPY --from=builder /app/dist /app/build
```

### Docker Compose

```yaml
version: '3.8'
services:
  protected-site:
    build: .
    ports:
      - "8000:8000"
    environment:
      - POCKETBASE_URL=https://your-pocketbase.example.com
      - POCKETBASE_GROUP=members
      - POCKETBASE_URL_MICROSOFT=https://your-pocketbase-microsoft.example.com
      - PORT=8000
```

## 📁 Directory Structure

```
/app/
├── build/           # Your static website files go here
│   ├── index.html
│   ├── assets/
│   └── public/      # Public assets (CSS, JS, images)
├── views/           # EJS templates for auth pages
│   ├── login.ejs
│   └── not_a_member.ejs
├── server files...
└── package.json
```

## 🔧 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `POCKETBASE_URL` | ✅ | URL of your PocketBase instance | - |
| `POCKETBASE_GROUP` | ✅ | Group field name that users must have | - |
| `POCKETBASE_URL_MICROSOFT` | ❌ | Separate PocketBase URL for Microsoft OAuth | `POCKETBASE_URL` |
| `PORT` | ❌ | Port the server runs on | `3000` |

### Environment Variable Examples

```bash
# Basic setup
POCKETBASE_URL=https://pb.example.com
POCKETBASE_GROUP=premium_members

# With Microsoft OAuth on different instance
POCKETBASE_URL=https://pb.example.com
POCKETBASE_URL_MICROSOFT=https://pb-ms.example.com
POCKETBASE_GROUP=subscribers

# Custom port
PORT=8080
```

## 🔒 How Authentication Works

1. **Unauthenticated Request**: User visits protected site → Redirected to login page
2. **OAuth Login**: User clicks provider button → OAuth flow via PocketBase
3. **Token Exchange**: OAuth token received → Converted to secure cookie
4. **Group Check**: User authenticated → Check if user belongs to required group
5. **Access Granted**: Group member → Serve static content
6. **Access Denied**: Not a group member → Show "not a member" page

## 🏗️ PocketBase Setup

Your PocketBase instance needs:

### Collections

1. **users** collection with OAuth providers configured
2. **groups** collection with fields:
   - `user_id` (relation to users)
   - `[YOUR_GROUP_NAME]` (boolean field matching `POCKETBASE_GROUP`)

### OAuth Configuration

Configure OAuth providers in PocketBase admin:
- GitHub OAuth App
- Google OAuth App
- Microsoft OAuth App (optional)

### Example Group Record

```json
{
  "user_id": "user123",
  "premium_members": true,
  "subscribers": false
}
```

## 🎨 Customization

### Custom Login Page

Replace the login view with your own branding:

```dockerfile
FROM your-registry/pocketbase-auth-layer:latest
COPY ./custom-views/login.ejs /app/views/login.ejs
COPY ./static-site /app/build
```

### Custom Styling

Add your CSS to the `/app/build/public/` directory:

```dockerfile
FROM your-registry/pocketbase-auth-layer:latest
COPY ./dist /app/build
COPY ./custom.css /app/build/public/custom.css
```

### Environment-specific Configuration

```dockerfile
FROM your-registry/pocketbase-auth-layer:latest
COPY ./dist /app/build

# Development
# ENV POCKETBASE_URL=http://localhost:8090

# Production
ENV POCKETBASE_URL=https://prod-pb.example.com
ENV POCKETBASE_GROUP=verified_users
```

## 🚢 Deployment

### Build and Run

```bash
# Build your protected site
docker build -t my-protected-site .

# Run with environment variables
docker run -p 8000:8000 \
  -e POCKETBASE_URL=https://pb.example.com \
  -e POCKETBASE_GROUP=members \
  my-protected-site
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - POCKETBASE_URL=${POCKETBASE_URL}
      - POCKETBASE_GROUP=${POCKETBASE_GROUP}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 📝 API Endpoints

- `GET /` - Serves static content (requires authentication)
- `GET /public/*` - Public assets (CSS, JS, images)
- `POST /api/cookie` - OAuth token to cookie conversion
- `GET /*` - Protected static files

## 🛠️ Development

### Local Development

```bash
# Clone and install
git clone <repo>
cd pocketbase-auth-layer/server
npm install

# Set environment variables
export POCKETBASE_URL=http://localhost:8090
export POCKETBASE_GROUP=members

# Run
npm run dev
```

### Adding Your Static Site

1. Build your static site (React, Vue, vanilla HTML, etc.)
2. Copy the build output to `/app/build` in the container
3. Ensure public assets are in `/app/build/public/`

## 🔍 Troubleshooting

### Common Issues

**Authentication Loop**: Check that `POCKETBASE_URL` is accessible and OAuth is configured

**Group Access Denied**: Verify the user has the correct group field set to `true`

**Assets Not Loading**: Ensure public assets are in `/app/build/public/` directory

**CORS Issues**: Configure PocketBase CORS settings for your domain

### Debug Mode

Add debug logging:

```dockerfile
FROM your-registry/pocketbase-auth-layer:latest
ENV NODE_ENV=development
COPY ./dist /app/build
```

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]