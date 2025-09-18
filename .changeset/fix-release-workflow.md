---
"pocketbase-auth-layer": patch
---

Fix release workflow to create version tags without npm publishing

- Use changeset tag command to create GitHub releases for private packages
- Optimize CI workflow with official Biome GitHub Action for faster linting
- Separate lint and test jobs for better CI visibility