---
"levins-pocketbase-auth-layer": patch
---

Add logout functionality with logout button and API endpoint

- Added POST /api/logout endpoint that clears the authentication cookie and redirects to home page
- Added logout button ("Ausloggen") to the not_a_member.html page for users who want to switch accounts
- Users can now properly log out and clear their session when needed