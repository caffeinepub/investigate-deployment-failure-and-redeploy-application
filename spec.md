# INDIE TAMIL MUSIC PRODUCTION

## Current State
The platform uses a purple/fire-accent dark theme via OKLCH CSS variables in index.css. The dark mode palette uses deep purple backgrounds (~282° hue) with fire-orange accents (~50° hue) for cinematic borders.

## Requested Changes (Diff)

### Add
- Neon Noir theme: dark navy backgrounds, electric purple/cyan accent colors, glowing borders

### Modify
- `index.css`: Update dark mode OKLCH CSS variables to Neon Noir palette:
  - Background: deep navy (hue ~240–250, low chroma)
  - Primary accent: electric purple (hue ~280–290, high chroma)
  - Secondary accent: cyan (hue ~195–205, high chroma)
  - Cards: dark slate navy
  - Borders: subtle navy with purple glow
  - Text: cool white / blue-white
  - Fire accent variables updated to cyan/purple glow instead of orange

### Remove
- Nothing removed

## Implementation Plan
1. Update `src/frontend/src/index.css` dark mode variables to Neon Noir OKLCH values
2. Ensure light mode stays reasonable (or update to match)
3. Validate build
