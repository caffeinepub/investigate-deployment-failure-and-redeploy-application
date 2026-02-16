# Specification

## Summary
**Goal:** Show a verified (blue tick) indicator next to verified artists across the app, let admins verify/unverify artists at any time, and allow admins to delete only the artist profile (without removing songs).

**Planned changes:**
- Add and consistently use a shared verified badge UI (via the existing VerifiedBadge component or equivalent) next to artist names wherever artist names are displayed.
- Add backend query support to determine whether a given artist (by owner Principal) is verified, and wire the frontend to use it with React Query invalidation for up-to-date status.
- Update the admin dashboard to allow approving verification requests and also rejecting/unverifying already-approved artists.
- Add an admin-only delete action in Artist Management to remove an artist profile record while leaving all song submissions intact and still visible.
- Add the provided blue tick image as an optimized transparent PNG static asset in the frontend and update the app to reference it consistently (including VerifiedBadge).

**User-visible outcome:** Verified artists display a blue tick next to their name across the UI; admins can verify or unverify artists at any time; admins can delete an artist’s profile without affecting the artist’s songs/submissions.
