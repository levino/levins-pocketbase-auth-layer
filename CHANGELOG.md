# pocketbase-auth-layer

## 1.0.10

### Patch Changes

- f527671: Fix line breaks in HTML templates for better readability

## 1.0.9

### Patch Changes

- 0d993f4: fix wrong route for logout

## 1.0.8

### Patch Changes

- simplify the code

## 1.0.7

### Patch Changes

- 0d7abee: Fix import path

## 1.0.6

### Patch Changes

- 423faa9: and another improvement for the build

## 1.0.5

### Patch Changes

- 8c1ff52: fix the Dockerfile and some deps in order to be able to build.

## 1.0.4

### Patch Changes

- 08dfdb7: Fix Docker build and optimize container image

  - Update Dockerfile to work with new root-level project structure
  - Exclude unnecessary development files from Docker context via .dockerignore
  - Update README.md to reflect current project structure
  - Use production-only dependencies in Docker image for smaller size

## 1.0.3

### Patch Changes

- 63c6181: Fix release workflow to create version tags without npm publishing

  - Use changeset tag command to create GitHub releases for private packages
  - Optimize CI workflow with official Biome GitHub Action for faster linting
  - Separate lint and test jobs for better CI visibility

## 1.0.2

### Patch Changes

- 3d3713e: Bumping the version in hopes to trigger a release - version tag

## 1.0.1

### Patch Changes

- 4e24dd7: Optimize GitHub Actions workflows and Docker publishing

  - Separate Docker publishing from release workflow
  - Add comprehensive Docker tags (latest, major, major.minor, full version)
  - Simplify release workflow using direct npx commands
  - Configure proper trigger conditions for each workflow

## 1.0.0

### Major Changes

- Initial release of PocketBase Auth Layer

  This is the first release of the PocketBase authentication layer, providing a complete authentication solution with OAuth2 providers.

  **Features:**

  - OAuth2 authentication with GitHub, Google, and Microsoft
  - HTTP-only cookie-based session management
  - Group-based access control
  - Responsive login and membership request pages
  - Clean Express.js architecture with factory pattern
  - Comprehensive test suite with Vitest
  - CI/CD pipeline with GitHub Actions
  - Docker support for containerized deployment

  **Breaking Changes:**

  - Initial release, no previous API to maintain compatibility with
