# Specification

## Summary
**Goal:** Support multiple artist profiles per user and ensure all created profiles are visible and manageable in the admin artist panel.

**Planned changes:**
- Replace the backend’s single `artistProfiles : Map<Principal, ArtistProfile>` storage with a multi-profile model where each artist profile has a stable unique ID and an owner Principal.
- Add backend APIs for the authenticated user to create, list, update, and delete artist profiles by profile ID with authorization checks.
- Update admin/team backend APIs to list and manage all artist profiles across all users (including multiple profiles per user) with appropriate access control.
- Implement Motoko upgrade migration to preserve existing single-profile data by converting it into a single entry in the new multi-profile storage.
- Update the user dashboard UI to list artist profiles and allow create/edit/delete actions using the existing fields and photo upload.
- Update the admin artist panel UI to show every artist profile, support search across name fields and owner Principal, and edit profiles unambiguously by ID.
- Extend React Query hooks to support the new list/create/update/delete APIs for users and the global list/edit flows for admins, including correct cache invalidation.

**User-visible outcome:** Users can manage multiple artist profiles from their dashboard, and admins can see, search, and edit every artist profile (including multiple profiles per user) in the admin artist panel.
