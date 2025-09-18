---
"pocketbase-auth-layer": patch
---

Fix Docker build and optimize container image

- Update Dockerfile to work with new root-level project structure
- Exclude unnecessary development files from Docker context via .dockerignore
- Update README.md to reflect current project structure
- Use production-only dependencies in Docker image for smaller size