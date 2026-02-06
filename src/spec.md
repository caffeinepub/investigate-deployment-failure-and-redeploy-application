# Specification

## Summary
**Goal:** Identify and fix the root cause of the latest deployment failure, then perform a clean redeploy so the app builds and runs end-to-end.

**Planned changes:**
- Investigate the failing deploy step (frontend build, backend canister build, dfx configuration, asset canister, or canister/environment IDs) and apply the minimal required code/config fix.
- Add a short repo note documenting the root cause and what was changed to resolve it.
- Perform a clean redeploy and verify the deployed frontend loads and can successfully communicate with the backend canister (anonymous access at minimum).

**User-visible outcome:** The deployed app loads the landing page without a blank screen, shows no critical console errors on load, and can make at least one basic backend query successfully.
