# Specification

## Summary
**Goal:** Update the public landing page hero logo and add podcast show + multi-episode submission flows with admin review.

**Planned changes:**
- Replace the homepage/landing-page hero logo image only (do not change the global header/navbar logo) using the provided uploaded logo asset.
- Add backend models and methods for podcast shows owned by the creating user (title, podcast type audio/video, description, category, language) and listing a user’s shows.
- Add backend models and methods for podcast episodes within a show, supporting multi-episode uploads over time with fields (title, description, 18+ toggle, explicit toggle, promotional toggle, episode type trailer/full/bonus, season number, episode number) plus uploads for artwork, thumbnail, and audio/video media file; enforce that only the show owner can add episodes.
- Add a "Submit Your Podcast" section in the user dashboard with a show creation form, shows list, and a separate episode form per show (English UI text only).
- Add an admin dashboard section dedicated to podcast submissions (separate from music submissions) to browse shows and episodes and download episode assets (artwork/thumbnail/media), restricted to admins only.
- If stable storage schema changes, add a conditional backend state migration to preserve existing stored data and safely initialize podcast storage.

**User-visible outcome:** Users can create podcast shows from their dashboard and upload multiple audio/video episodes (with metadata and assets) at any time, while admins can review podcast submissions and download episode files; the landing page hero logo displays the updated uploaded logo.
