# Implementation Plan: Soft Neumorphic Edges

## Overview

Remove hard border lines from neumorphic surfaces, letting shadows alone define edges. The design should feel like surfaces emerge from soft material — no sharp cuts. Keep borders only where they serve functional purposes (inputs, dividers, state indicators).

## Tasks

- [ ] 1. Remove borders from all neu-panel / glass-neu elements
  - Remove `border` class from 22 elements that have `.neu-*` or `.glass-neu-*`
  - The shadow system's `inset 0 1px 0 var(--neu-edge)` highlight provides sufficient edge definition
  - Also update `.neu-panel`, `.neu-raised`, `.neu-inset` CSS to not reference `border-color`
  - _Files: landing.tsx, product-mock.tsx, map-panel.tsx, session-sidebar.tsx, app-shell.tsx, chat-panel.tsx, user-menu.tsx, message.tsx, login/page.tsx, signup/page.tsx_

- [ ] 2. Remove border-color overrides from glass-neu-compact elements
  - Elements with `glass-neu-compact` that also have `border-border-subtle` — the glass class already sets a softer mixed border-color
  - Remove explicit override to let the CSS handle it (or remove border entirely since compact already has shadow)
  - _Files: map-panel.tsx, session-sidebar.tsx, app-shell.tsx_

- [ ] 3. Soften remaining nested borders
  - Product mock inner frame, badges, and tool badges: reduce from full opacity to `/50`
  - Chat message bubbles: remove border, rely on background color contrast alone
  - Empty state icons: remove border (decorative)
  - _Files: product-mock.tsx, message.tsx, chat-panel.tsx_

- [ ] 4. Update CSS classes to remove border-color declarations
  - `.neu-panel`, `.neu-raised`, `.neu-inset` currently set `border-color: var(--border-subtle)` — remove this since elements no longer carry `border`
  - The `inset 0 1px 0 var(--neu-edge)` in box-shadow remains as the sole edge indicator
  - _Files: app/globals.css_

- [ ] 5. Verify build passes
  - Run npm run build
  - Confirm no visual regressions (shadow-only edges still read as defined surfaces)
