# Implementation Plan: Design Consistency

## Overview

Surgical class-swap pass across 5 component files to align with DESIGN.md. No logic changes, no new files, no new dependencies. Each task is a single file edit.

## Tasks

- [ ] 1. Map floating controls → `.glass-neu-compact`
  - Replace ad-hoc `bg-surface/90 shadow-sm backdrop-blur-sm` with `.glass-neu-compact` on GlassButton, RouteInfoCard, and ZoomControl in `src/components/map/map-panel.tsx`
  - Fix mobile bottom sheet: add `.neu-panel`, remove `shadow-lg`, change easing to `[transition-timing-function:var(--neu-ease)]`
  - _Requirements: 1, 7_

- [ ] 2. Building popup: glass material + semantic colors
  - [ ] 2.1 Replace popup container material with `.glass-neu-compact` and `rounded-2xl`
    - File: `src/components/map/building-popup.tsx:161`
    - _Requirements: 1_
  - [ ] 2.2 Replace raw status dot colors
    - `bg-emerald-500` → `bg-secondary`, `bg-red-500` → `bg-error`
    - File: `src/components/map/building-popup.tsx:101`
    - _Requirements: 3_
  - [ ] 2.3 Fix section heading font weight
    - `font-semibold` → `font-medium`
    - File: `src/components/map/building-popup.tsx:126`
    - _Requirements: 6_

- [ ] 3. Sidebar nav items
  - [ ] 3.1 Fix height and padding
    - `min-h-10` → `h-9`, add `py-2`
    - File: `src/components/shell/session-sidebar.tsx:127`
    - _Requirements: 2_
  - [ ] 3.2 Fix active state
    - Remove `.neu-raised border-border-subtle bg-surface border` → `bg-accent-subtle text-primary`
    - File: `src/components/shell/session-sidebar.tsx:129`
    - _Requirements: 2_
  - [ ] 3.3 Fix hover state
    - `hover:bg-surface-container` → `hover:bg-surface-container-high`
    - File: `src/components/shell/session-sidebar.tsx:130`
    - _Requirements: 2_

- [ ] 4. Tool renderers accessibility
  - Add contextual `aria-label` to all "Show on map" buttons
  - Walking distance: `aria-label={`Show route from ${from} to ${to} on map`}`
  - Building: `aria-label={`Show ${building.name} on map`}`
  - Places: `aria-label={`Show ${count} places on map`}`
  - File: `src/components/chat/tool-renderers.tsx:175,207,248`
  - _Requirements: 4_

- [ ] 5. Chat panel suggestion buttons
  - Replace `.neu-button bg-surface text-primary rounded-xl` with `border border-primary text-primary rounded-full hover:bg-accent-subtle transition-colors duration-150`
  - File: `src/components/chat/chat-panel.tsx:327`
  - _Requirements: 5_

- [ ] 6. Minor fixes
  - [ ] 6.1 User bubble: add `border-border-subtle`
    - File: `src/components/chat/message.tsx:62`
    - _Requirements: 7_
  - [ ] 6.2 Assistant avatar: `font-semibold` → `font-medium`
    - File: `src/components/chat/message.tsx:177`
    - _Requirements: 6_

- [ ] 7. Verify build passes
  - Run `npm run build`
  - Confirm no type errors or broken class references
  - _Requirements: all_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Line numbers are approximate — verify before editing
- Each task references specific requirements for traceability
- All changes are class swaps or attribute additions — no logic changes
- Dark mode should be tested visually after each file change
