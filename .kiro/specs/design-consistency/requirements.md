# Requirements Document

## Introduction

Align all UI components with the refreshed DESIGN.md ("The Soft Instrument" neumorphic system). The codebase is ~90% aligned — this spec covers the remaining drift: map floating controls missing `.glass-neu-compact`, sidebar nav item over-styling, raw Tailwind colors outside the token system, accessibility gaps in interactive tool results, and component styling inconsistencies (suggestion pills, bottom sheet, font weights).

## Glossary

- **Neumorphic surface class**: One of `.neu-panel`, `.neu-raised`, `.neu-inset`, `.neu-button`, `.neu-primary-button` — composed CSS classes carrying multi-shadow recipes with edge highlights.
- **Glass-neumorphic material**: One of `.glass-neu`, `.glass-neu-strong`, `.glass-neu-inset`, `.glass-neu-compact` — combines backdrop-filter, gradient overlay, and composed shadows.
- **Semantic color token**: A CSS custom property from the design system (e.g., `--primary`, `--error`, `--secondary`) mapped to Tailwind utilities via `@theme inline`.
- **Dual-tier shadow**: The intentional architecture where Tier 1 (Tailwind shadow utilities) handles quick elevation and Tier 2 (`.neu-*` classes) handles composed surfaces.
- **`--neu-ease`**: `cubic-bezier(0.16, 1, 0.3, 1)` — the standard panel animation easing.

## Requirements

### Requirement 1: Map floating controls use glass-neumorphic material

**User Story:** As a user viewing the map, I want floating controls (zoom, route info, buttons) to feel cohesive with the rest of the neumorphic UI, so that the map panel doesn't look like a different design system.

#### Acceptance Criteria

1. WHEN a floating control (GlassButton, RouteInfoCard, ZoomControl) is rendered over the map, THE UI SHALL apply `.glass-neu-compact` instead of ad-hoc `bg-surface/90 shadow-sm backdrop-blur-sm`.
2. WHEN the building popup is rendered, THE UI SHALL apply `.glass-neu-compact` with `rounded-2xl` (16px radius per panel spec).
3. THE floating controls SHALL NOT use raw `shadow-sm`, `shadow-md`, `shadow-lg`, `backdrop-blur-sm`, or `bg-surface/90` — all material properties come from the glass class.

### Requirement 2: Sidebar navigation matches spec

**User Story:** As a user navigating between sessions, I want nav items to feel consistent with the design system — flat active states, correct sizing.

#### Acceptance Criteria

1. THE sidebar nav items SHALL use height `h-9` (36px) with padding `px-3 py-2`.
2. WHEN a nav item is active, THE UI SHALL style it with `bg-accent-subtle text-primary` — no neumorphic elevation, no border, no `.neu-raised`.
3. WHEN a nav item is hovered (inactive), THE UI SHALL apply `bg-surface-container-high` (not `bg-surface-container`).

### Requirement 3: All colors use semantic tokens

**User Story:** As a user in dark mode, I want all UI colors to flip correctly, so that no raw Tailwind palette colors (emerald-500, red-500) appear unstyled.

#### Acceptance Criteria

1. WHEN a status dot indicates "free", THE UI SHALL use `bg-secondary` (not `bg-emerald-500`).
2. WHEN a status dot indicates "occupied", THE UI SHALL use `bg-error` (not `bg-red-500`).
3. THE codebase SHALL NOT contain raw Tailwind color classes (e.g., `bg-emerald-*`, `bg-red-*`, `text-blue-*`) in UI components — all colors reference the semantic token system.

### Requirement 4: Tool result buttons are accessible

**User Story:** As a screen reader user, I want to distinguish between multiple "Show on map" buttons in a conversation, so that I can navigate to the correct one.

#### Acceptance Criteria

1. WHEN a "Show on map" button is rendered for a walking distance result, THE button SHALL have `aria-label` describing the route (e.g., "Show route from ICCS to Buchanan on map").
2. WHEN a "Show on map" button is rendered for a building result, THE button SHALL have `aria-label` describing the building (e.g., "Show Hugh Dempster Pavilion on map").
3. WHEN a "Show on map" button is rendered for places results, THE button SHALL have `aria-label` describing the result set (e.g., "Show 3 places on map").

### Requirement 5: Suggestion buttons use pill pattern

**User Story:** As a user seeing suggested follow-up actions, I want them to look like quick-action pills (outlined, rounded-full), not like raised neumorphic buttons.

#### Acceptance Criteria

1. THE suggestion buttons in the chat panel SHALL use `border border-primary text-primary rounded-full hover:bg-accent-subtle transition-colors` styling.
2. THE suggestion buttons SHALL NOT use `.neu-button` or `rounded-xl`.

### Requirement 6: Font weights follow Weight-Not-Bold rule

**User Story:** As a user, I want consistent visual weight across the UI — no jarring bold elements that break the soft instrument feel.

#### Acceptance Criteria

1. THE assistant avatar badge SHALL use `font-medium` (500), not `font-semibold` (600).
2. THE building popup section headings SHALL use `font-medium` (500), not `font-semibold` (600).
3. ONLY structural page/section headings (Title, Heading in the type scale) SHALL use weight 500+.

### Requirement 7: Bottom sheet uses correct neumorphic surface and easing

**User Story:** As a mobile user, I want the map bottom sheet to feel like it belongs to the neumorphic system — proper shadow, proper animation easing.

#### Acceptance Criteria

1. WHEN the mobile bottom sheet is rendered, THE UI SHALL apply `.neu-panel` class (not raw `shadow-lg`).
2. THE bottom sheet transition SHALL use `--neu-ease` timing function (not `ease-out`).
3. THE user message bubble SHALL include explicit `border-border-subtle` class.
