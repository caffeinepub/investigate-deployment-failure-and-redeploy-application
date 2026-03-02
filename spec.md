# Specification

## Summary
**Goal:** Add a "Top Vibing Songs" feature with backend data model, admin management UI, and public/user-facing display sections.

**Planned changes:**
- Add `TopVibingSong` type to the backend (id, title, artistName, genre, artworkUrl, streamingLink, optional tagline, rank) with stable storage in the main actor
- Expose backend functions: `addTopVibingSong`, `updateTopVibingSong`, `deleteTopVibingSong`, `reorderTopVibingSongs`, and `getTopVibingSongs`
- Support artwork upload using the existing `fileToExternalBlob` / ExternalBlob pattern, storing the resulting URL in `artworkUrl`
- Add a "Top Vibing Songs" section to the Admin Dashboard with an add/edit form (Song Title, Artist Name, Genre, Artwork Upload, Streaming Link, Tagline) and a draggable card list for reordering, editing, and deleting entries
- Display a "Top Vibing Songs" section on the public Landing Page showing ranked cards (artwork, title, artist name, genre, tagline, Listen Now button)
- Display the same "Top Vibing Songs" section inside the User Dashboard as a distinct tab or section

**User-visible outcome:** Admins can manage a curated list of top vibing songs with drag-and-drop ranking; public visitors and authenticated users can browse the ranked songs and click through to streaming links.
