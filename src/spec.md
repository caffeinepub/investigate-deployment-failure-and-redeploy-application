# Specification

## Summary
**Goal:** Fix admin recognition and post-login routing so the restored admin account lands on and can access the Admin Dashboard.

**Planned changes:**
- Restore backend admin authorization for the Internet Identity user associated with email `yeetmusictamil@gmail.com` so admin-guarded calls succeed.
- Ensure backend provides a reliable admin-status check for the current caller (e.g., an `isCallerAdmin`-style query) returning `true` for the restored admin account.
- Preserve the restored admin assignment across canister upgrades (add minimal migration logic only if needed).
- Update frontend post-login navigation to route admins to `/admin-dashboard` and non-admins to `/user-dashboard`.
- Add frontend protection for `/admin-dashboard` to redirect non-admin users to `/user-dashboard` with a clear English authorization error/toast message.

**User-visible outcome:** After logging in, admins are taken to the Admin Dashboard and can use admin-only features; non-admin users cannot access `/admin-dashboard` and are redirected with an English “not authorized” message.
