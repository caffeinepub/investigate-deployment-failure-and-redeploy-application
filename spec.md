# INDIE TAMIL MUSIC PRODUCTION

## Current State

The app has:
- `UserDashboard.tsx` — uses shadcn `<Tabs>` with 9 tabs (profiles, submit, submissions, podcast, video, topVibing, analysis, revenue, chat). Tab switching is handled natively by the shadcn Tabs component with no custom `onValueChange` handler.
- `AdminDashboard.tsx` — uses shadcn `<Tabs>` with 14 tabs (artists, songs, podcasts, videos, verification, withdrawals, users, plans, featured, topVibing, labelPartners, adminroles, messages, debug). Same pattern.
- `TeamDashboard.tsx` — exists but appeared empty; follows same pattern.
- `CustomCursor.tsx` — a global component already rendered at app root in `AppContent`.
- `App.tsx` — renders `<CustomCursor />` + `<RouterProvider />` at the top level.
- Video file `transition.mp4` is now in `/assets/transition.mp4` (public folder).

## Requested Changes (Diff)

### Add
- `PanelTransitionContext.tsx` — a React context + provider that exposes `triggerTransition()` function and `isTransitioning` boolean state. When `triggerTransition()` is called, it sets `isTransitioning = true` for exactly 5 seconds, then sets it back to `false`.
- `PanelTransitionOverlay.tsx` — a full-screen fixed overlay component. Renders when `isTransitioning === true`. Shows dark navy background (`bg-[#050818]`) with the `transition.mp4` video centered, autoplay, muted, loop. After 5 seconds the overlay disappears.
- `useTabTransition` hook — a small helper that returns a wrapped `onValueChange` handler: when called, it (1) calls `triggerTransition()`, (2) waits 0ms (next tick), then sets the new tab value.

### Modify
- `App.tsx` — wrap `AppContent` render output with `PanelTransitionProvider`, and render `<PanelTransitionOverlay />` inside it (alongside `<CustomCursor />`).
- `UserDashboard.tsx` — add `useState` for `activeTab`, controlled `Tabs` component with `value={activeTab}` and `onValueChange` wired to `useTabTransition`. The content still switches instantly on the backend — the overlay covers it during the 5s.
- `AdminDashboard.tsx` — same pattern as UserDashboard.
- `TeamDashboard.tsx` — same pattern if it has tabs.

### Remove
- Nothing removed.

## Implementation Plan

1. Create `src/frontend/src/contexts/PanelTransitionContext.tsx` — context with `triggerTransition()` function and `isTransitioning` state (5-second timer using `setTimeout`).
2. Create `src/frontend/src/components/PanelTransitionOverlay.tsx` — full-screen fixed overlay (z-index 9999), only renders when `isTransitioning`. Contains `<video>` tag pointing to `/assets/transition.mp4` with autoplay, muted, loop, centered with flex.
3. Modify `App.tsx` — wrap with `PanelTransitionProvider`, add `<PanelTransitionOverlay />` next to `<CustomCursor />`.
4. Modify `UserDashboard.tsx` — add controlled tab state + call `triggerTransition()` on tab change via `onValueChange`. The actual tab state updates immediately so when the overlay lifts, the new panel is already rendered.
5. Modify `AdminDashboard.tsx` — same as UserDashboard.
6. No backend changes needed.
