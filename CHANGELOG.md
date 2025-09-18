# pocketbase-auth-layer

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
