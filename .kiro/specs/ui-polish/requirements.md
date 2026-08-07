# Requirements Document

## Introduction

Comprehensive UI polish pass applying all impeccable design commands iteratively until the Reogent app achieves production-grade visual quality. Covers typography, layout, accessibility, animations, copy, error states, responsive behavior, and overall design coherence.

## Glossary

- **Type ramp**: The documented font sizes in DESIGN.md (0.75rem, 0.8125rem, 0.875rem, 1rem, 1.25rem, 1.875rem)
- **Off-ramp size**: A font-size used in code but not in the design system type scale
- **Glass material**: `.glass-neu-*` classes providing backdrop-blur + gradient + composed shadow
- **Detector**: `detect.mjs` — automated design system compliance scanner

## Requirements

### Requirement 1: Typography alignment

**User Story:** As a user, I want consistent typography across all surfaces so the UI feels cohesive and intentional.

#### Acceptance Criteria

1. ALL font sizes in component files SHALL use documented type ramp values (0.75rem, 0.8125rem, 0.875rem, 1rem, 1.25rem, 1.875rem) or be explicitly documented as intentional exceptions.
2. THE assistant markdown headings in globals.css SHALL use values from the type ramp or documented clamp() expressions.
3. Font weights SHALL follow the Weight-Not-Bold rule: 400-550 for UI, 600 only for structural headings.

### Requirement 2: Accessibility compliance

**User Story:** As a keyboard/screen-reader user, I want to navigate the entire app without barriers.

#### Acceptance Criteria

1. ALL interactive elements SHALL have visible focus indicators.
2. ALL images and icons SHALL have appropriate alt text or aria-hidden="true".
3. THE chat message list SHALL use appropriate ARIA live regions.
4. Color contrast SHALL meet WCAG 2.1 AA (4.5:1 body text, 3:1 UI components).

### Requirement 3: Animation quality

**User Story:** As a user, I want animations to feel purposeful and polished, communicating state changes without being distracting.

#### Acceptance Criteria

1. ALL panel transitions SHALL use --neu-ease timing function.
2. Interactive elements SHALL have hover/active micro-interactions.
3. prefers-reduced-motion SHALL be respected universally.
4. Animations SHALL NOT exceed 350ms for state changes or 500ms for page transitions.

### Requirement 4: Responsive behavior

**User Story:** As a mobile user, I want the app to work perfectly on all screen sizes without layout breaks.

#### Acceptance Criteria

1. ALL text SHALL remain readable without horizontal scrolling on 320px viewport.
2. Touch targets SHALL be at least 44x44px on mobile.
3. THE layout SHALL transition smoothly between breakpoints without visual jumps.

### Requirement 5: UX copy quality

**User Story:** As a user, I want clear, helpful labels and messages that guide me without confusion.

#### Acceptance Criteria

1. Error messages SHALL describe the problem AND suggest recovery.
2. Empty states SHALL guide the user toward their next action.
3. Button labels SHALL use action verbs (not vague "OK"/"Submit").
4. Placeholder text SHALL be genuinely helpful, not filler.

### Requirement 6: Design coherence

**User Story:** As a user, I want every surface to feel like it belongs to the same product.

#### Acceptance Criteria

1. THE detector SHALL report zero critical findings on final pass.
2. ALL surfaces SHALL use consistent spacing rhythm (8px grid).
3. Border radius SHALL follow the documented scale (6/8/12/16/full).
4. Color usage SHALL follow semantic token system with no raw Tailwind palette colors.

### Requirement 7: Error and edge case handling

**User Story:** As a user encountering problems, I want clear feedback and graceful recovery.

#### Acceptance Criteria

1. Network errors SHALL show inline retry with clear messaging.
2. Empty conversation state SHALL provide helpful onboarding.
3. Map unavailable state SHALL provide text alternatives.
4. Long content SHALL truncate gracefully with indication of overflow.
