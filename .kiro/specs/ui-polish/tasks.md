# Implementation Plan: UI Polish

## Overview

Iterative application of all impeccable design commands across the entire app. Each phase focuses on a specific quality dimension, commits frequently, and verifies with the detector before moving to the next phase.

## Tasks

- [ ] 1. Typography alignment
  - [ ] 1.1 Fix off-ramp font sizes (11px, 15px, 10px, 2.5rem, 1.2rem, 1.075rem)
    - Map each to nearest type ramp value or document as intentional
    - Files: message.tsx, landing.tsx, product-mock.tsx, sign-in-button.tsx, globals.css
    - _Requirements: 1_
  - [ ] 1.2 Fix font weights (remaining font-semibold instances)
    - _Requirements: 1_

- [ ] 2. Layout and spacing
  - [ ] 2.1 Audit spacing consistency across components
    - Ensure 8px grid alignment
    - _Requirements: 6_
  - [ ] 2.2 Fix responsive breakpoint transitions
    - _Requirements: 4_

- [ ] 3. Accessibility hardening
  - [ ] 3.1 Add ARIA live region to chat message list
    - _Requirements: 2_
  - [ ] 3.2 Verify all interactive elements have focus indicators
    - _Requirements: 2_
  - [ ] 3.3 Ensure touch targets meet 44px minimum on mobile
    - _Requirements: 2, 4_

- [ ] 4. Animation refinement
  - [ ] 4.1 Ensure all panel transitions use --neu-ease
    - _Requirements: 3_
  - [ ] 4.2 Add micro-interactions to interactive elements missing them
    - _Requirements: 3_
  - [ ] 4.3 Verify reduced-motion support is comprehensive
    - _Requirements: 3_

- [ ] 5. UX copy and error states
  - [ ] 5.1 Review all error messages for clarity and recovery guidance
    - _Requirements: 5, 7_
  - [ ] 5.2 Review empty states for helpfulness
    - _Requirements: 5, 7_
  - [ ] 5.3 Review button labels and placeholder text
    - _Requirements: 5_

- [ ] 6. Visual polish
  - [ ] 6.1 Ensure border-radius consistency with scale
    - _Requirements: 6_
  - [ ] 6.2 Check color token usage (no raw palette colors remaining)
    - _Requirements: 6_

- [ ] 7. Final verification
  - [ ] 7.1 Run detector, confirm zero critical findings
    - _Requirements: 6_
  - [ ] 7.2 Run build, confirm passes
    - _Requirements: all_

## Notes

- Commit after each sub-task
- Work autonomously without stopping for confirmation
- Use subagents for parallel analysis where possible
- Each task references specific requirements for traceability
