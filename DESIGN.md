---
name: Reogent
description: AI campus assistant with precision-sculpted neumorphic surfaces
colors:
  background: "#f7f7f5"
  surface: "#fafafa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f3f5"
  surface-container: "#ededef"
  surface-container-high: "#e6e6e8"
  surface-bright: "#ffffff"
  primary: "#4a4e7a"
  primary-container: "#7a7ea8"
  secondary: "#2d6b47"
  secondary-container: "#b0efc2"
  tertiary: "#7a5733"
  tertiary-container: "#f4e3cf"
  error: "#9c4040"
  error-container: "#ffdad6"
  on-surface: "#18191b"
  on-surface-variant: "#3e4348"
  muted: "#5a6066"
  outline: "#6e747a"
  outline-variant: "#bfc4c9"
  border: "#e6e6e2"
  border-subtle: "#efefeb"
  accent-subtle: "#edeef5"
  surface-tint: "#4a4e7a"
  on-primary: "#ffffff"
  on-primary-container: "#1a1d3a"
  on-secondary: "#ffffff"
  on-secondary-container: "#001f0e"
  on-tertiary-container: "#4a3010"
  on-error-container: "#6e2c2c"
  scrim: "rgba(0, 0, 0, 0.3)"
typography:
  body:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  title:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  display:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  caption:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 450
    lineHeight: 1.4
  mono:
    fontFamily: "Commit Mono, ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "36px"
---

# Design System: Reogent

## Overview

**Creative North Star: "The Sculpted Instrument"**

Every surface carries permanent dimension at rest. Raised means interactive. Recessed means input. Flat means content. One material, shaped into different forms for different functions. No decoration, no illustration, no ornament. Quality lives in the precision of shadow, spacing, and type hierarchy.

Shadows are tight and crisp: close offsets (4-6px), controlled blur (10-16px), no bloom. The light source never moves. You can see what is pressable, what is a well, what is content without touching anything. Physical metaphor replaces labels and tutorials.

The character is authoritative and refined. Every radius, shadow recipe, and spacing value repeats from a finite set. Nothing is approximate. The system is small. Its application is rigorous.

**Key Characteristics:**

- Permanent dimension on every surface at rest
- Tight, crisp shadows with close offsets and controlled blur
- Single-material coherence across all elements
- Precision and consistency as the aesthetic itself
- Muted indigo accent, used sparingly, always meaning "interactive"
- Content-forward: the neumorphic frame never competes with chat or map data

## Colors

A cool-neutral palette anchored by muted indigo. Warmth comes from the off-white background, not from color. The indigo provides institutional distinction without corporate coldness.

### Primary

- **Muted Indigo** (`#4a4e7a`): Primary actions, active navigation, focus rings, links, surface tint. Appears on interactive elements only. Its rarity carries the meaning.
- **Indigo Container** (`#7a7ea8`): Avatar backgrounds, accent surfaces, badge backgrounds. Softer carrier for primary identity in larger areas.

### Secondary

- **Campus Verdant** (`#2d6b47`): Success states, route confirmation, positive feedback. Appears when the system confirms something went right.
- **Verdant Container** (`#b0efc2`): Success backgrounds, route info cards, positive notification surfaces.

### Tertiary

- **Warm Bark** (`#7a5733`): Warning states, tertiary accents. Rare. Appears for caution.
- **Bark Container** (`#f4e3cf`): Warning backgrounds.

### Neutral

- **Background** (`#f7f7f5`): Page ground. Carries two subtle radial gradients (accent-subtle at upper-right 72% opacity/34% radius, primary-container at lower-left 10% opacity/30% radius) for warmth.
- **Surface** (`#fafafa`): Default elevated panels. Resting material for cards, chat panel, map panel.
- **Surface Container Low** (`#f3f3f5`): Recessed wells: sidebar body, chat message well, input backgrounds. Reads as pressed into the background.
- **Surface Container** (`#ededef`): Content wells, grouped sections, inline code backgrounds. One step darker for nesting.
- **Surface Container High** (`#e6e6e8`): Hover states, pressed backgrounds. Darkest interactive neutral surface.
- **Surface Bright** (`#ffffff`): Maximum elevation: focused inputs, active dropdowns, tooltips.
- **On Surface** (`#18191b`): Primary text. Near-black with warm undertone. >=7:1 on all surfaces.
- **On Surface Variant** (`#3e4348`): Secondary text, labels, descriptions. >=4.5:1 on all light surfaces.
- **Muted** (`#5a6066`): Meta text, timestamps, placeholders. >=4.5:1 on all surfaces. Replaces outline/outline-variant for text per WCAG AA commitment.
- **Border** (`#e6e6e2`): Standard dividers, section separators, hairlines between content.
- **Border Subtle** (`#efefeb`): Softest separators, neumorphic edge accents, button borders.
- **Accent Subtle** (`#edeef5`): Active nav item background, user message bubble background. Palest indigo tint.

### Named Rules

**The Muted-for-AA Rule.** All subdued text (placeholders, timestamps, metadata, captions) uses `--muted` (`#5a6066`). Never use `--outline` or `--outline-variant` for text. They fail WCAG AA contrast on light surfaces.

**The Indigo Scarcity Rule.** Primary indigo appears on interactive elements and active states. Never on decorative surfaces, background fills, or large areas. Its presence means "actionable" or "current state." Nothing else.

## Typography

**Display Font:** Aspekta Variable (with ui-sans-serif, system-ui fallback)
**Mono Font:** Commit Mono Variable (with ui-monospace, SF Mono, Menlo, Consolas fallback)

**Character:** Aspekta is a clean geometric sans, precise and legible at small sizes. Commit Mono is neutral and readable for structured identifiers. The pairing is workmanlike.

### Hierarchy

- **Display** (500, 1.875rem, 1.2, -0.025em): Landing page hero. Never appears in-app.
- **Title** (500, 1.25rem, 1.3, -0.02em): Page titles, panel headers. One per visible viewport.
- **Heading** (500, 1rem, 1.4): Card titles, session names, assistant message headers. The workhorse.
- **Body** (400, 0.875rem, 1.5): Chat messages, descriptions. Base size. 14px for information density.
- **Body Small** (400, 0.8125rem, 1.5): Secondary info, timestamps, tool badge content, sidebar session previews.
- **Caption** (450, 0.75rem, 1.4): Labels, metadata, navigation group headers, category names.
- **Mono** (400, 0.8125rem, 1.5): Course codes (`CPSC 110`), times (`14:30`), building codes (`ICCS`), inline code, tool parameters. Structured identifiers render in mono.

### Named Rules

**The Weight-Not-Bold Rule.** Emphasis uses weight 500-550. Weight 700+ never appears. Maximum is 600, reserved for landing display and markdown strong.

**The Mono-for-Data Rule.** Structured identifiers (course codes, times, building codes, distances, dollar amounts) render in Commit Mono. Data has a different texture than prose. Enforced in tool renderers and message formatting.

**The 14px-Base Rule.** Body text is 0.875rem (14px). Information-dense tool UI needs tighter text than a reading experience. More content visible without scrolling. Line-height stays at 1.5 for readability.

## Layout

CSS Grid with animated column transitions:

**Desktop (>=1024px):** Two-level grid. Outer: `shell-body` with columns `minmax(3.75rem, 18.5rem) minmax(0, 1fr)` (sidebar + workspace). Inner: `chat-workspace` with columns `minmax(22rem, 42fr) minmax(3.25rem, 58fr)` (chat + visual pane). Sessions collapsed: `minmax(3.75rem, 3.75rem) minmax(0, 1fr)`. Map collapsed: `minmax(0rem, 100fr) minmax(3.25rem, 0fr)`. All transitions use `--neu-ease` (cubic-bezier 0.16, 1, 0.3, 1) at 380-420ms.

**Tablet (640-1024px):** Sidebar is a drawer, not a grid column. Workspace grid active: chat + visual pane share columns. Visual pane collapse supported.

**Mobile (<640px):** Single column. Chat full-width. Sidebar is a slide-over drawer with backdrop scrim. Visual pane becomes an 80vh bottom sheet with drag-to-dismiss (20% threshold).

**Spacing rhythm:** 8px grid. Common values: `gap-2` (8px), `gap-2.5` (10px), `gap-3` (12px). Panel padding: `p-3` (12px) outer, `px-4 py-3` (16/12px) inner sections. Header height: 56px. Sidebar collapsed rail: 3.75rem (60px). Sidebar expanded: 18.5rem (296px).

**Canvas treatment:** `app-shell-canvas` background carries two radial gradients: `accent-subtle` at `86% -8%` (72% opacity, 34% radius) and `primary-container` at `-8% 104%` (10% opacity, 30% radius). Panels float on this canvas.

## Elevation & Depth

Two tiers of shadow plus glass-neumorphic materials. Each tier has a distinct architectural role.

### Tier 1: Utility Elevation (Tailwind-mapped)

Quick-assignment shadows via Tailwind `shadow-*` utilities. For one-off depth on small elements.

| Token               | Light Value                                                                           | Purpose                                     |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `--elevation-sm`    | `4px 4px 8px rgba(174,174,174,0.12), -2px -2px 6px rgba(255,255,255,0.8)`             | Cards at rest, small controls               |
| `--elevation-md`    | `6px 6px 14px rgba(174,174,174,0.15), -3px -3px 10px rgba(255,255,255,0.9)`           | Hovered cards, elevated controls            |
| `--elevation-lg`    | `8px 8px 20px rgba(174,174,174,0.18), -4px -4px 14px rgba(255,255,255,1)`             | Modals, dropdowns, popovers                 |
| `--elevation-inset` | `inset 2px 2px 5px rgba(174,174,174,0.15), inset -2px -2px 5px rgba(255,255,255,0.7)` | Recessed inputs, wells                      |
| `--elevation-glow`  | `0 4px 14px rgba(74,78,122,0.25)`                                                     | Primary action buttons (uses primary color) |

### Tier 2: Refined Neumorphic (composed CSS classes)

Multi-shadow recipes for composed surfaces. Tighter than Tier 1: shadows sit closer to the surface with less spread.

**Primitives:**

| Primitive           | Light                    | Dark                     |
| ------------------- | ------------------------ | ------------------------ |
| `--neu-highlight`   | `rgba(255,255,255,0.68)` | `rgba(65,66,72,0.34)`    |
| `--neu-edge`        | `rgba(255,255,255,0.58)` | `rgba(255,255,255,0.07)` |
| `--neu-shadow`      | `rgba(105,112,116,0.13)` | `rgba(0,0,0,0.32)`       |
| `--neu-shadow-deep` | `rgba(91,99,104,0.18)`   | `rgba(0,0,0,0.45)`       |

**Composed shadows:**

| Recipe                | Value                                                                           | Use                                          |
| --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| `--neu-panel-shadow`  | `8px 8px 22px var(--neu-shadow), -6px -6px 18px var(--neu-highlight)`           | Header, chat panel, map panel, major cards   |
| `--neu-raised-shadow` | `5px 5px 13px var(--neu-shadow), -4px -4px 10px var(--neu-highlight)`           | Buttons, message bubbles, compact controls   |
| `--neu-inset-shadow`  | `inset 3px 3px 7px var(--neu-shadow), inset -2px -2px 6px var(--neu-highlight)` | Sidebar body, composer input, recessed wells |

Every `.neu-*` class carries `inset 0 1px 0 var(--neu-edge)`, a top-edge highlight reinforcing the upper-left light source.

### Glass-Neumorphic Materials

Backdrop-blur translucency + neumorphic depth, combined. Used where panels layer over other content. Never for decoration.

| Class                | Background                           | Blur                | Shadow                                | Use                                  |
| -------------------- | ------------------------------------ | ------------------- | ------------------------------------- | ------------------------------------ |
| `.glass-neu`         | 68% surface + diagonal gradient      | 18px, saturate 1.16 | Panel shadow + inset edge highlights  | Header, collapsed sidebar rail       |
| `.glass-neu-strong`  | 82% surface + diagonal gradient      | 14px, saturate 1.1  | Panel shadow + inset top highlight    | Chat panel, map panel                |
| `.glass-neu-inset`   | 76% surface-container-low + gradient | 16px, saturate 1.08 | Inset shadow + top highlight          | Sidebar body (recessed)              |
| `.glass-neu-compact` | 74% surface + gradient               | 12px, saturate 1.14 | Raised shadow + inset edge highlights | Small floating controls, map buttons |

Fallback: `@supports not (backdrop-filter: blur(1px))` uses solid `var(--surface)` or `var(--surface-container-low)`.

### Named Rules

**The Dual-Tier Rule.** Tier 1 (Tailwind shadow utilities) for one-off assignments. Tier 2 (`.neu-*` classes) for composed surfaces. Never mix on the same element.

**The Light-Source Rule.** Light source is upper-left. Shadows fall bottom-right, highlights sit top-left. Every `.neu-*` class has `inset 0 1px 0 var(--neu-edge)`. No exceptions.

**The Permanent-Dimension Rule.** Neumorphic surfaces carry depth at rest. Hover/active states change the recipe (expand or invert). Depth never starts at zero.

## Shapes

**Form language:** Rounded, consistent per element size. Radius increases with element size: small controls get 6-8px, containers get 12-16px, pills get `9999px`.

- **Major panels** (header, chat panel, map panel, sidebar, bottom sheets): `rounded-2xl` (16px)
- **Action buttons, icon containers, tool badges**: `rounded-xl` (16px)
- **Inner controls** (session items, details blocks, tool cards, nav items): `rounded-lg` (12px)
- **Small elements** (inline code, small badges): `rounded-md` (8px)
- **Pills** (chat input, action chips, avatars, dots): `rounded-full` (9999px)
- **Chat bubbles**, asymmetric corners signal direction:
  - User (right-aligned): `16px 16px 5px 16px`, flat bottom-right means "from me"
  - Assistant (left-aligned): `16px 16px 16px 5px`, flat bottom-left means "from them"

**Border treatment:** No borders on neumorphic surfaces. The `inset 0 1px 0 var(--neu-edge)` top highlight is the only edge definition. Surfaces emerge from shadow. Borders appear on:

- Section dividers (`border-t`/`border-b` hairlines between content sections)
- Outline-style interactive pills (`border border-primary` for action chips)
- State indicators (`border-error` for validation errors)
- `.neu-button` elements (1px `border-subtle` enhances the sculpted edge)

## Components

### Buttons

Sculpted at rest. State changes through shadow transformation + micro-translate.

- **Primary** (`.neu-primary-button`): `bg-primary text-on-primary rounded-xl h-9 px-4`. Shadow: inner white highlight (22% opacity) + colored glow underneath (primary at 22%) + highlight behind. Hover: brightness(1.04), translateY(-1px), expanded glow. Active: inset shadow (dark upper-left, light lower-right), translateY(1px), scale(0.985).
- **Secondary** (`.neu-button`): `bg-surface text-on-surface rounded-xl h-9 px-4 border-subtle`. Shadow: edge highlight + raised shadow. Hover: expanded shadow, translateY(-1px). Active: inset shadow, translateY(1px), scale(0.98).
- **Ghost**: `bg-transparent text-on-surface-variant rounded-xl`. No shadow at rest (the one exception to permanent dimension). Hover: subtle surface background appears.
- **Sizes**: Standard 36px height, Compact 32px, Large 40-44px (mobile touch targets).
- **Transitions**: All properties at 150ms ease-out (color, background-color, box-shadow, transform).

### Cards / Containers

- **Standard panel** (`.glass-neu-strong`): Semi-transparent surface (82%) + diagonal gradient + panel shadow. `rounded-2xl`. No border. Padding: 12-16px.
- **Chat panel**: `.glass-neu-strong rounded-2xl`. Internal: header bar (border-bottom separator, transparent bg), message well (`.chat-message-well`, recessed with deep inset shadows, 72% surface-container-low mixed with background), composer area at bottom.
- **Sidebar** (`.glass-neu-inset`): Recessed material (76% surface-container-low) with inset shadow + top highlight. `rounded-2xl p-2`. Contains session list in a secondary recessed well (`bg-surface-container-low/60 rounded-xl`).

### Inputs / Fields

- **Chat composer** (`.neu-inset .chat-composer`): `bg-surface-container-low rounded-2xl p-1.5`. Recessed at rest via inset shadow. Focus-within: inset shadow + 2px ring glow (primary at 28% opacity). Internal: textarea (transparent, no outline) + send button (circular primary, right-aligned).
- **Thinking state**: Animated conic-gradient border mask (`thinking-border-orbit` at 2.4s infinite). Expanded neumorphic glow (primary at 14%). Send button replaced by the thinking orb.

### Navigation

- **Session sidebar items**: `h-9 px-3 py-2 rounded-lg`. Active: `bg-accent-subtle text-primary`. Inactive: `text-on-surface-variant`. Hover: `bg-surface-container-high text-on-surface`. Transition: all 150ms.
- **Session group headers**: `text-muted uppercase text-xs tracking-[0.05em] font-medium`. Categories: Today, Yesterday, This Week, This Month, Older.
- **Header** (`.glass-neu`): `rounded-2xl h-14 mx-2 sm:mx-3 mt-3`. Floats over content with 18px blur. Contains: menu trigger (mobile), app title with icon, theme toggle + user menu.

### Chat Messages

- **User bubble**: `bg-accent-subtle text-on-surface rounded-[16px_16px_5px_16px] px-4 py-3 text-sm`. Right-aligned, max-width 85%. No neumorphic shadow, flat on the message well surface.
- **Assistant bubble**: `bg-surface rounded-[16px_16px_16px_5px] px-4 py-3`. Left-aligned, max-width 88%. Contains: markdown (`.assistant-markdown`), tool badges, thinking blocks (collapsible), warning cards.
- **Tool badges**: `bg-surface-container-low border border-border-subtle rounded-lg font-mono text-xs px-3 py-2`. Collapsible `<details>` with tool name + spinner (during execution) or chevron (completed).
- **Quick-action pills**: `border border-primary text-primary rounded-full text-xs px-3.5 py-2.5 min-h-[44px]`. Hover: `bg-accent-subtle`. Shown in empty state as conversation starters.
- **Message entrance**: `animate-message-in`, 200ms ease-out, opacity 0 to 1 + translateY(6px to 0).

### Signature: Thinking Orb

Spinning gradient sphere (1.75rem diameter) replacing the send button during agent processing:

- Outer: conic-gradient from primary-container through primary through white-tinted primary (360 degrees), 1.15s linear infinite
- Inner: surface-colored circle (inset 0.28rem) with inset shadow
- Crown: white-tinted dot at top (0.26rem) with primary glow
- Border: 1px primary/border-subtle mix
- Shadow: neumorphic raised shadow + inner edge highlight

Reduced-motion: static, frozen at natural angle.

## Do's and Don'ts

### Do:

- **Do** apply `.neu-panel` / `.neu-raised` / `.neu-inset` for composed surfaces. They carry the full edge-highlight + multi-shadow recipe. No additional `border` needed (except `.neu-button` with its 1px border-subtle).
- **Do** use `--muted` (`#5a6066`) for all subdued text (placeholders, timestamps, metadata). Never `--outline` or `--outline-variant` for text.
- **Do** use `--neu-ease` (cubic-bezier 0.16, 1, 0.3, 1) for all panel/layout animations. Duration: 250-420ms depending on travel distance.
- **Do** respect `prefers-reduced-motion`. All animations collapse to 0.01ms, reveals show at once, the thinking orb freezes.
- **Do** use `[data-theme="dark"]` for theme switching. Never `prefers-color-scheme` media query. The user controls the theme, not the OS.
- **Do** maintain dimension on all surfaces at rest. Neumorphic depth is the resting state, not a hover effect.
- **Do** use asymmetric bubble radii (flat corner on the tail side) to indicate message direction.

### Don't:

- **Don't** mix Tier 1 (`shadow-*` Tailwind utilities) and Tier 2 (`.neu-*` classes) on the same element. One shadow system per element.
- **Don't** add `border` to elements with `.neu-*` or `.glass-neu-*` classes. Shadows define edges. Exception: `.neu-button` uses a designed 1px border-subtle.
- **Don't** use pure black in shadows. Warm gray (`rgba(174,174,174,x)` or `rgba(105,112,116,x)`) in light mode. `rgba(0,0,0,x)` in dark mode only.
- **Don't** apply `backdrop-filter` outside the four `.glass-neu-*` classes. Glass is for panels layering over content.
- **Don't** animate shadow values directly (expensive repaints). Animate `transform` and switch shadow classes via state change.
- **Don't** apply neumorphic depth to text content. Depth frames containers. Content stays flat inside.
- **Don't** use font-weight 700 or above. Maximum is 600 (landing display and markdown strong).
- **Don't** use primary indigo for background fills, decorative accents, or large surfaces. It means "interactive" or "active state."
- **Don't** create new shadow recipes. Use the three composed (panel, raised, inset) or five elevation utilities.
