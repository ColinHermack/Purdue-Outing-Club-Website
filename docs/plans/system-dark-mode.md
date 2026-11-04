# Follow system dark mode, remove toggle

## Context

Dark mode is a manual toggle (`ThemeSwitch` in the navbar), default light. Goal: theme follows the OS `prefers-color-scheme` automatically, toggle removed.

## Approach

Keep `next-themes` (already installed). It already adds/removes the `.dark` class that `styles/globals.css` and HeroUI v3 key off, and it injects a pre-hydration script, so no flash of wrong theme. Only config changes: switch to system mode. No new deps, no CSS variant rewrite.

## Changes

1. `app/layout.tsx:48`: `themeProps={{ attribute: "class", defaultTheme: "system", enableSystem: true, storageKey: "theme-system" }}`.
   - New `storageKey` on purpose: users who clicked the old toggle have `theme=light|dark` in localStorage, which would override the OS preference forever now that there is no toggle to clear it. Fresh key ignores it. Nothing writes to it, so system always wins.
2. `components/navbar.tsx`: delete the `ThemeSwitch` import (line 18) and both usages (lines 85 and 98, desktop and mobile). Check the `mr-8` spacing and mobile row still look right after removal.
3. Delete `components/theme-switch.tsx`. Check whether its sun/moon icons are exported from a shared icons file and now unused; delete only if so.
4. `styles/globals.css` comment (lines 7-10): reword to say `.dark` is set by next-themes from the system preference. Keep the `@custom-variant`.
5. `CLAUDE.md` line 43: "light by default" becomes "follows system color scheme". README needs no change.

## Skipped

- Dropping `next-themes` for pure CSS `prefers-color-scheme`: HeroUI v3 dark tokens live under `.dark`, so we would duplicate them in a media query. Not worth it.
- Unit test: no logic, config only.

## Verification

- `npm run typecheck`, `npx eslint .`, `npm test`.
- `npm run dev`, open `https://localhost:3000/`. Flip OS appearance (or Chrome DevTools, Rendering, "Emulate prefers-color-scheme") and confirm `<html>` toggles `.dark` live with no reload.
- Set `localStorage.theme = "light"` while OS is dark, reload: page stays dark (stale value ignored).
- Hard reload in dark OS: no white flash.
- Navbar has no toggle on desktop and mobile widths.
