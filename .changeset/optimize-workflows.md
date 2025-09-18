---
"pocketbase-auth-layer": patch
---

Optimize GitHub Actions workflows and Docker publishing

- Separate Docker publishing from release workflow
- Add comprehensive Docker tags (latest, major, major.minor, full version)
- Simplify release workflow using direct npx commands
- Configure proper trigger conditions for each workflow