# INDIE TAMIL MUSIC PRODUCTION

## Current State
The app uses a Neon Noir theme (dark navy background, electric purple/cyan accents). The root `App.tsx` renders `AppContent` which wraps everything in `ThemeProvider` + `QueryClientProvider`. The `AppContent` component returns `<RouterProvider>`, `<ProfileSetupModal>`, and `<Toaster>`. The default browser cursor is currently active across all pages.

## Requested Changes (Diff)

### Add
- `CustomCursor` component at `src/frontend/src/components/CustomCursor.tsx`
  - Small filled dot (6–8px) rendered at exact mouse position (no lag)
  - Larger hollow ring (~32–36px) that follows with a smooth lag via `requestAnimationFrame`
  - Colors match the Neon Noir theme: dot is electric purple/cyan, ring is same color with opacity
  - On hover over clickable elements (`a`, `button`, `[role="button"]`, `input`, `select`, `textarea`, `label`): ring scales up (1.5–2x) and changes to accent cyan color
  - Desktop-only: hidden on touch devices using `window.matchMedia('(hover: none)')`
  - Uses `pointer-events: none` so it never blocks clicks
  - Rendered via React portal to `document.body`
- Global CSS rule `cursor: none !important` on `html, body, *` — but only injected when the custom cursor is active (non-touch device)

### Modify
- `App.tsx`: Add `<CustomCursor />` inside the `AppContent` return, at the top level alongside `<RouterProvider>` so it persists across all routes and pages

### Remove
- Nothing removed

## Implementation Plan
1. Create `CustomCursor.tsx`:
   - Detect touch device on mount; if touch, render nothing
   - Track mouse position with `mousemove` event listener
   - Animate ring position with `requestAnimationFrame` loop using linear interpolation (lerp factor ~0.12–0.15 for smooth lag)
   - Track hover state with `mouseover`/`mouseout` events checking if target matches clickable selectors
   - Render two `div`s via `createPortal` to `document.body`: dot and ring, both with `position: fixed`, `pointer-events: none`, `z-index: 9999`
   - Inject `cursor: none` style on mount, remove on unmount
2. Add `<CustomCursor />` to `AppContent` return in `App.tsx`
