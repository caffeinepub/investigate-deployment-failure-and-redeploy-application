# Specification

## Summary
**Goal:** Add a simplified link in bio feature that allows admins to add streaming platform links to songs and displays them on public song pages after approval.

**Planned changes:**
- Create public song pages at `/song/[song-id]` showing artwork, title, artist name with verification badge, and streaming platform links
- Add Spotify URL and Apple Music URL fields to the song data model
- Add "Manage Links" button to admin song list that opens a dialog for editing streaming platform URLs
- Display streaming platform links as styled buttons with platform logos and brand colors
- Restrict public song page access to only songs with "live" status (approved by admin)
- Render platform logo images from generated assets directory

**User-visible outcome:** Admins can add Spotify and Apple Music links to songs through a "Manage Links" button in the admin dashboard. Once approved, songs have public shareable pages that display the song artwork, title, artist info, and clickable streaming platform buttons with platform-specific styling.
