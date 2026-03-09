# INDIE TAMIL MUSIC PRODUCTION

## Current State

The app is a full-stack music distribution platform for Tamil indie artists on ICP. It includes:
- Song, podcast, video submission workflows with admin moderation
- Artist profile management, verification, and badge system
- Admin dashboard with user management, earnings, analytics, support, blog, chat
- Landing page with Featured Artists carousel, Top Vibing Songs section, subscription plans
- Public "link in bio" pages for approved songs/podcasts
- Admin-managed website logo, fees, and announcements

The backend stores FeaturedArtist and TopVibingSong data. There is no LabelPartner data model yet.

The dashboard UI in Version 97 suffers from color regression (appears mostly black and white).

## Requested Changes (Diff)

### Add
- `LabelPartner` backend type: `id` (Nat), `logoUrl` (Text), `labelName` (Text), `websiteLink` (optional Text), `description` (Text)
- `LabelRelease` backend type: `id` (Nat), `labelId` (Nat), `artworkUrl` (Text), `songTitle` (Text), `artistName` (Text), `streamingLink` (Text)
- Backend functions: `addLabelPartner`, `updateLabelPartner`, `deleteLabelPartner`, `getAllLabelPartners`
- Backend functions: `addLabelRelease`, `updateLabelRelease`, `deleteLabelRelease`, `getLabelReleases(labelId)`, `getAllLabelReleases`
- Admin panel section: "Label Partners" — form to add/edit label partner (logo URL, name, website link optional, description), list of existing partners with edit/delete actions
- Admin panel section per label partner: form to add/edit song releases (artwork URL, song title, artist name, streaming link), list of releases with edit/delete
- Landing page section: horizontal scrollable row of label partner cards (logo, name, description)
- New route `/label/:labelName` — dedicated public label page showing label profile header (logo, name, description, website link) and all linked song releases as cards (artwork, title, artist, streaming link button)

### Modify
- Landing page: add Label Partners section below Top Vibing Songs
- Router: add `/label/:labelName` route
- Dashboard color palette: restore rich colors throughout the admin and user dashboard panels (sidebars, cards, tabs, badges, status indicators); fix any `text-gray-*` or `bg-gray-*` overrides that are causing the black-and-white appearance; ensure cinematic fire-colored glows are visible on forms

### Remove
- Nothing removed

## Implementation Plan

1. Add `LabelPartner` and `LabelRelease` types and CRUD functions to `main.mo` (backend codegen)
2. Wire new backend APIs in frontend `backend.d.ts` bindings (auto-generated)
3. Create `AdminLabelPartnersPanel` component: form to add/edit partners, list, and per-partner release management sub-panel
4. Create `LabelPage` component at `/label/:labelName` route: header with logo/name/description/website, grid of song release cards with streaming links
5. Add `LabelPartnersSection` to landing page: horizontally scrollable cards showing logo, name, description; clicking navigates to `/label/[label-name]`
6. Dashboard color correction: audit all dashboard panel files for gray/monochrome overrides; restore proper Tailwind color tokens (indigo, purple, amber, orange fire glows, etc.) throughout sidebar, cards, and status badges
