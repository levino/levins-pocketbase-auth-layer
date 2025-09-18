# PocketBase Auth Layer - GitHub Copilot Instructions

**ALWAYS follow these instructions first and only search for additional context if the information here is incomplete or found to be in error.**

PocketBase Auth Layer is an Express.js application that provides OAuth authentication for static websites using PocketBase as the backend. It supports GitHub, Google, and Microsoft OAuth providers and protects static content behind group-based access control.

## Working Effectively

### Environment Setup
**Required:** Node.js 20+ (preferably 22+) and npm 10+

Install dependencies:
```bash
npm install
```

### Build and Test Workflow
**ALWAYS** run these commands to validate your changes:

1. **Install dependencies** (if not done):
   ```bash
   npm install
   ```
   - Takes: ~10 seconds
   - Must run after any package.json changes

2. **Build the project**:
   ```bash
   npm run build
   ```
   - Takes: ~0.3 seconds (very fast - just copies CSS files)
   - Creates `build/public/infima.css` from node_modules

3. **Run tests**:
   ```bash
   npm test
   ```
   - Takes: ~1 second (Vitest is very fast)
   - Includes unit tests for Express routes and authentication logic

4. **Lint and format**:
   ```bash
   npx biome check
   npx biome format --write .
   npx biome lint --write .
   ```
   - Each takes: ~0.4 seconds (Biome is extremely fast)
   - **ALWAYS** run `npx biome ci` before committing - this is what CI runs

### Development Workflow

#### Start Development Server
For developing the auth templates and testing the UI:
```bash
npm run dev
```
- Starts Vite development server on http://localhost:5173/
- Opens login.html by default
- Takes: ~0.3 seconds to start
- Serves views/ directory with live reload

#### Start Application Server
To run the actual auth application:

**Option 1: Using tsx (recommended):**
```bash
# Install tsx temporarily
npm install tsx --no-save

# Set environment variables
export POCKETBASE_URL=http://localhost:8090
export POCKETBASE_GROUP=members

# Run the app
npx tsx app.ts
```

**Option 2: Compile to JavaScript first:**
```bash
# Compile TypeScript
npx tsc

# Set environment variables  
export POCKETBASE_URL=http://localhost:8090
export POCKETBASE_GROUP=members

# Run compiled JavaScript
node app.js

# Clean up compiled files when done
rm -f *.js
```

**Note:** `npm start` requires Node.js 22+ due to `--experimental-strip-types` flag. Use tsx or compilation for older Node versions.

The application runs on http://localhost:3000 by default.

### Required Environment Variables
- `POCKETBASE_URL`: URL of your PocketBase instance (required)
- `POCKETBASE_GROUP`: Group field name for access control (required)
- `POCKETBASE_URL_MICROSOFT`: Optional separate PocketBase URL for Microsoft OAuth
- `PORT`: Server port (default: 3000)

## Validation Scenarios

**ALWAYS test these scenarios after making changes:**

1. **Authentication Flow Test:**
   ```bash
   # Start the app with test environment
   export POCKETBASE_URL=http://localhost:8090
   export POCKETBASE_GROUP=members
   npx tsx app.ts
   ```
   - Navigate to http://localhost:3000
   - Should show login page with OAuth buttons
   - Verify all three OAuth providers (GitHub, Google, Microsoft) are visible
   - **Note:** Without a running PocketBase instance, OAuth won't work, but the login page should display correctly

2. **API Endpoints Test:**
   ```bash
   curl http://localhost:3000/api/cookie -X POST -H "Content-Type: application/json" -d '{"token":"test"}'
   curl http://localhost:3000/api/logout -X POST
   ```

3. **Static Asset Serving:**
   - Verify `/public/infima.css` is accessible at http://localhost:3000/public/infima.css
   - Ensure build assets are created: `ls -la build/public/`

## Docker Deployment

**WARNING:** Docker build currently fails in Alpine environment due to npm issues (~71 seconds timeout before failure).

**Known Issue:** `npm ci --only=production` and `npm ci --omit=dev` both fail in node:alpine with "Exit handler never called!" error.

**Workaround:** Use a different base image or install dependencies outside Docker:
```dockerfile
FROM node:20-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build-assets
CMD ["npx", "tsx", "app.ts"]
```

## Key Files and Structure

### Core Application Files
- `app.ts` - Application entry point (starts Express server)
- `index.ts` - Express app factory with authentication middleware
- `index.test.ts` - Unit tests for authentication and routing logic

### Configuration Files  
- `package.json` - Dependencies and scripts
- `biome.json` - Linting and formatting configuration (uses Biome instead of ESLint/Prettier)
- `vitest.config.ts` - Test configuration (uses Vitest instead of Jest)
- `tsconfig.json` - TypeScript configuration
- `vite.config.js` - Development server configuration for auth templates

### Authentication Templates
- `views/login.html` - OAuth login page with GitHub, Google, Microsoft buttons
- `views/not_a_member.html` - Access denied page for users not in required group

### Build Outputs
- `build/public/` - Static assets for production (CSS from node_modules)
- `views/public/public/` - Development assets (created by copy-assets script)

## CI/CD Pipeline

GitHub Actions workflows:
- `.github/workflows/ci.yml` - Runs `biome ci` and `npm test`
- `.github/workflows/docker-publish.yml` - Docker build and publish (currently broken)
- `.github/workflows/release.yml` - Release management with changesets

**CRITICAL:** Always run `npx biome ci` locally before pushing. CI will fail if linting/formatting issues exist.

## Common Tasks

### Adding New OAuth Providers
1. Modify login.html to add new OAuth button
2. Add JavaScript logic for new provider authentication
3. Update environment variable documentation in README
4. Test authentication flow

### Modifying Static Asset Handling
- Public assets go in `/build/public/` directory
- Protected assets go in `/build/` directory  
- Update Express static middleware in `index.ts` if needed

### Debugging Authentication Issues
1. Check PocketBase connection: verify `POCKETBASE_URL` is accessible
2. Verify group membership: check `POCKETBASE_GROUP` environment variable
3. Inspect cookies: authentication uses HTTP-only cookies via PocketBase authStore
4. Review logs: application logs authentication attempts and errors

## Dependencies Overview
- **Runtime:** express, pocketbase, cookie-parser, hbs, ejs, dotenv
- **Build:** vite, vite-plugin-handlebars  
- **Testing:** vitest, supertest
- **Linting:** @biomejs/biome (replaces ESLint + Prettier)
- **Styling:** infima (CSS framework)

## Troubleshooting

### "npm start" fails with "bad option: --experimental-strip-types"
- **Solution:** Use `npx tsx app.ts` or compile to JavaScript first with `npx tsc`
- **Cause:** Node.js version < 22 doesn't support TypeScript execution flag

### Docker build times out after ~71 seconds
- **Solution:** Use different base image (node:bookworm-slim instead of node:alpine)
- **Cause:** Known npm issue in Alpine environment

### Tests fail with module resolution errors
- **Solution:** Ensure vitest.config.ts alias is set correctly: `"./index.js": "./index.ts"`
- **Note:** Tests import `.js` files but execute `.ts` files via alias

### OAuth authentication doesn't work
- **Requirements:** PocketBase instance must be running and accessible
- **Check:** Environment variables are set correctly
- **Debug:** Verify PocketBase OAuth provider configuration

## File Change Impact Guide

- **Changes to `index.ts`:** Run tests immediately (`npm test`)
- **Changes to auth templates (`views/`):** Test with `npm run dev`
- **Changes to `package.json`:** Run `npm install` and full test suite
- **Changes to any TypeScript:** Run `npx biome ci` before committing
- **Changes to static assets:** Run `npm run build` to verify build process