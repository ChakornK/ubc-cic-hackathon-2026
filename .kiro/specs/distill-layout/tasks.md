# Implementation Plan: Distill & Layout

## Overview

Strip visual noise and fix spacing rhythm across all pages. Focus on removing redundant elements that communicate nothing, consolidating repeated patterns, and aligning spacing to the 4px/8px grid.

## Tasks

- [ ] 1. Landing page distill
  - Remove duplicate "Free to use" copy (keep only CTA-adjacent one)
  - Remove scroll-hint arrow (full-height hero already signals scrollability)
  - Remove second ambient texture in hero (keep TopoTexture OR circle, not both)
  - Simplify footer trust badges (plain text, remove neu-raised container)
  - Remove redundant hero school icon (header + CTA buttons are sufficient)
  - _Files: src/components/landing/landing.tsx_

- [ ] 2. Landing page layout fixes
  - Normalize hero spacing rhythm (mt-7→mt-8, mt-10→mt-10, mt-4 stays)
  - Fix capability card padding (py-7→py-8 to align to grid)
  - Ensure section padding is self-contained (not relying on adjacent sections)
  - _Files: src/components/landing/landing.tsx_

- [ ] 3. Chat app distill
  - Remove always-"Active" badge (communicates nothing)
  - Remove "Grounded in UBC data" subtitle from chat header
  - Remove redundant "You" label under user messages
  - Collapse repeated "Reogent" avatar+name when consecutive assistant messages
  - _Files: src/components/chat/chat-panel.tsx, src/components/chat/message.tsx_

- [ ] 4. Chat app layout fixes
  - Fix off-grid spacing: py-3.5→py-3 in chat header, p-5→p-6 in message area
  - Fix assistant bubble padding: py-3.5→py-3
  - Normalize message max-widths (user 85%, assistant 88% — unified asymmetry)
  - _Files: src/components/chat/chat-panel.tsx, src/components/chat/message.tsx_

- [ ] 5. Session sidebar distill + layout
  - Remove school icon from sidebar header (already in app header)
  - Remove "Your conversation history" subtitle (redundant under "Sessions")
  - Fix header padding asymmetry (pt-2→pt-3 to match pb-4→pb-3)
  - _Files: src/components/shell/session-sidebar.tsx_

- [ ] 6. Auth pages layout fixes
  - Remove redundant icon-link (back nav already covers navigation)
  - Fix spacing rhythm: mb-6→mb-8, mb-2→mb-2, mb-8→mb-6 (even out)
  - _Files: app/login/page.tsx, app/signup/page.tsx_

- [ ] 7. User menu layout fixes
  - Normalize horizontal padding to consistent px-2.5 throughout
  - _Files: src/components/shell/user-menu.tsx_

- [ ] 8. Map panel distill
  - Remove redundant map icon from collapsed rail (text "Campus map" is sufficient)
  - Remove separator line in collapsed rail
  - _Files: src/components/map/map-panel.tsx_

- [ ] 9. Verify build passes
  - Run npm run build
  - Run detector
  - _Requirements: all_
