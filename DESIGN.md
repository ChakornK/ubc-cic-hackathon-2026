---
name: Reogent
description: AI campus assistant with soft neumorphic depth and molded tactile surfaces
colors:
  background: "#f8f8f6"
  surface: "#fafafa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f4f3f5"
  surface-container: "#eeeeef"
  surface-container-high: "#e8e8e9"
  surface-bright: "#ffffff"
  primary: "#416375"
  primary-container: "#7c9eb2"
  secondary: "#306946"
  secondary-container: "#b3f1c4"
  tertiary: "#7a5733"
  tertiary-container: "#f4e3cf"
  error: "#a04747"
  error-container: "#ffdad6"
  on-surface: "#1a1c1d"
  on-surface-variant: "#42484c"
  muted: "#5c6367"
  outline: "#72787c"
  outline-variant: "#c2c7cc"
  border: "#e8e8e4"
  border-subtle: "#f0f0ec"
  accent-subtle: "#eef4f7"
  surface-tint: "#416375"
  on-primary: "#ffffff"
  on-primary-container: "#103546"
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
  display:
    fontFamily: "Aspekta, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
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
    padding: "8px 12px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Reogent

## Overview

**Creative North Star: "The Soft Instrument"**

Reogent's interface is a precision instrument rendered in soft matte material. Every surface is molded from the same substance — gently dimensional, functional, quietly confident. The neumorphic treatment creates depth through sculpted shadow rather than transparency or decoration. Controls feel pressable. Panels feel lifted. The whole system reads as a single material shaped into different forms for different purposes.

This is modern neumorphism that learned from the excesses of 2020: shadows are warm and diffuse, not dramatic. The glass-material overlays add translucency only where it serves spatial hierarchy (the header floating over content, panels layering over the map). Depth communicates function — recessed means input, raised means action, flat means content.

The dual-shadow architecture is intentional: basic elevation tokens (`--elevation-sm/md/lg`) provide a Tailwind-compatible utility layer, while the refined neumorphic system (`--neu-panel/raised/inset`) handles composed surfaces with multi-shadow recipes. A radial-gradient canvas behind everything gives the "table" warmth and subtle spatial cues.

**Key Characteristics:**

- Molded and tactile — every element feels pressable, shaped from a single soft material
- Content-forward — chat messages and map data are the product; the neumorphic frame never competes
- Dual-layer shadow — utility-level elevation tokens coexist with refined composed neumorphic shadows
- Glass as hierarchy — backdrop-blur materials appear only where layering serves function (header, panels over map)
- Warm shadows — tinted with warm gray `rgba(174, 174, 174, x)` in light mode, never pure black

## Colors

A muted, pastel-inflected palette with a warm gray foundation. Colors support the neumorphic depth model — shadows are tinted warm, highlights run cool-white.

### Primary

- **Steel Cove** (`#416375`): Primary actions, active states, focus rings, surface tint. The single accent color used sparingly for interactive meaning.
- **Cove Container** (`#7c9eb2`): Primary button backgrounds, accent areas, avatar backgrounds. Softer carrier for the primary identity.

### Secondary

- **Campus Green** (`#306946`): Success states, positive feedback, route confirmation.
- **Green Container** (`#b3f1c4`): Success backgrounds, route information panels.

### Tertiary

- **Warm Bark** (`#7a5733`): Warnings, tertiary actions.
- **Bark Container** (`#f4e3cf`): Warning backgrounds, tertiary accents.

### Neutral

- **Background** (`#f8f8f6`): Page ground — the "table" everything sits on. Receives the radial-gradient canvas treatment.
- **Surface** (`#fafafa`): Elevated cards, main content panels. The default resting material.
- **Surface Container Low** (`#f4f3f5`): Sidebar, recessed areas. Reads as pressed into the background.
- **Surface Container** (`#eeeeef`): Content wells, grouped sections, inline code backgrounds.
- **Surface Container High** (`#e8e8e9`): Hover states, pressed states. Darkest neutral surface.
- **Surface Bright** (`#ffffff`): Highest elevation — focused inputs, active elements, dropdown menus.
- **On Surface** (`#1a1c1d`): Primary text. 4.5:1+ on all surfaces.
- **On Surface Variant** (`#42484c`): Secondary text, labels. 4.5:1 on light surfaces.
- **Muted** (`#5c6367`): Meta text, placeholders. Added for WCAG AA compliance where Outline/Outline Variant fall short.
- **Border** (`#e8e8e4`): Standard borders, dividers.
- **Border Subtle** (`#f0f0ec`): Hairlines, soft separators, neumorphic edge accents.
- **Accent Subtle** (`#eef4f7`): Selected nav items, hover backgrounds, user message bubbles.

### Named Rules

**The Warm Shadow Rule.** Neumorphic shadows in light mode use `rgba(174, 174, 174, x)` — never pure black. In dark mode, shadows shift to `rgba(0, 0, 0, x)` with highlights at `rgba(65, 66, 72, 0.48)`.

**The Muted-for-AA Rule.** Where the design calls for subdued text (placeholders, metadata, timestamps), use `--muted` (`#5c6367`) instead of `--outline` or `--outline-variant`, which fail WCAG AA contrast on the light surface hierarchy.

## Typography

**Display Font:** Aspekta Variable (with ui-sans-serif, system-ui fallback)
**Mono Font:** Commit Mono Variable (with ui-monospace, SF Mono, Menlo, Consolas fallback)

**Character:** Aspekta is a clean geometric sans with subtle warmth — modern without being cold, legible at small sizes. Commit Mono is neutral and highly readable for code and structured data. The pairing is workmanlike and precise, matching the "soft instrument" identity.

### Hierarchy

- **Display** (500, 1.875rem, 1.2): Hero headings on landing page. Rare in-app.
- **Title** (500, 1.25rem, 1.3): Page titles, section heads. Letter-spacing -0.02em.
- **Heading** (500, 1rem, 1.4): Card titles, chat session names, assistant message headers.
- **Body** (400, 0.875rem, 1.5): Chat messages, descriptions. The base size for information-dense UI.
- **Body Small** (400, 0.8125rem, 1.5): Secondary info, timestamps, tool badge content.
- **Caption** (450, 0.75rem, 1.4): Labels, metadata, navigation items.
- **Mono** (400, 0.8125rem, 1.5): Course codes, times, building codes, inline code, tool call parameters.

### Named Rules

**The Weight-Not-Bold Rule.** Emphasis uses weight 500–550, never 700+. This keeps the muted, instrument-like feel. Only structural headings go to 600.

**The Mono-for-Data Rule.** Anything that is a structured identifier — `CPSC 110`, `14:30`, `ICCS` — renders in Commit Mono. Data has a different texture than prose.

## Layout

The app shell uses a flexible grid that collapses progressively:

**Desktop (>1024px):** Sidebar (collapsible, 3.75rem–18.5rem) + main content area. Main area splits: chat panel (minmax 22rem, 42fr) + map panel (minmax 3.25rem, 58fr). All transitions use `--neu-ease` (cubic-bezier 0.16, 1, 0.3, 1).

**Tablet (640–1024px):** Sidebar collapses to a trigger button. Chat + map share a CSS grid with animated column collapse.

**Mobile (<640px):** Single column. Map overlays or toggles. Sidebar is a slide-over sheet.

**Spacing rhythm:** Standard Tailwind scale (no custom tokens). Most common values: `gap-2` (8px), `gap-2.5` (10px), `gap-3` (12px), `p-3` (12px), `p-4` (16px), `px-3`/`px-4` for horizontal card padding. 8px grid alignment.

**App shell canvas:** The background carries two subtle radial gradients — `accent-subtle` at top-right (72% opacity, 34% radius) and `primary-container` at bottom-left (10% opacity, 30% radius). This gives the "table" warmth without being decorative.

## Elevation & Depth

The system uses **dual-tier shadows** — both intentional, serving different architectural roles:

### Tier 1: Utility Elevation (Tailwind-mapped)

Basic elevation tokens consumed via `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-inset`, `shadow-glow` Tailwind utilities. Used for quick one-off depth assignments.

| Token               | Light Value                                                                           | Purpose                |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| `--elevation-sm`    | `4px 4px 8px rgba(174,174,174,0.12), -2px -2px 6px rgba(255,255,255,0.8)`             | Cards at rest          |
| `--elevation-md`    | `6px 6px 14px rgba(174,174,174,0.15), -3px -3px 10px rgba(255,255,255,0.9)`           | Hovered cards          |
| `--elevation-lg`    | `8px 8px 20px rgba(174,174,174,0.18), -4px -4px 14px rgba(255,255,255,1)`             | Modals, dropdowns      |
| `--elevation-inset` | `inset 2px 2px 5px rgba(174,174,174,0.15), inset -2px -2px 5px rgba(255,255,255,0.7)` | Recessed inputs        |
| `--elevation-glow`  | `0 4px 14px rgba(65,99,117,0.3)`                                                      | Primary action buttons |

### Tier 2: Refined Neumorphic (composed CSS classes)

Multi-shadow recipes for composed surfaces. Applied via `.neu-panel`, `.neu-raised`, `.neu-inset`, `.neu-button`, `.neu-primary-button` classes. Built from primitive tokens:

| Primitive           | Light                    | Dark                     |
| ------------------- | ------------------------ | ------------------------ |
| `--neu-highlight`   | `rgba(255,255,255,0.92)` | `rgba(65,66,72,0.48)`    |
| `--neu-edge`        | `rgba(255,255,255,0.76)` | `rgba(255,255,255,0.09)` |
| `--neu-shadow`      | `rgba(105,112,116,0.17)` | `rgba(0,0,0,0.42)`       |
| `--neu-shadow-deep` | `rgba(91,99,104,0.24)`   | `rgba(0,0,0,0.6)`        |

Composed shadows:

- `--neu-panel-shadow`: `14px 14px 34px var(--neu-shadow), -10px -10px 27px var(--neu-highlight)` — outer panels, header, cards
- `--neu-raised-shadow`: `8px 8px 19px var(--neu-shadow), -6px -6px 15px var(--neu-highlight)` — buttons, message bubbles
- `--neu-inset-shadow`: `inset 4px 4px 10px var(--neu-shadow), inset -3px -3px 9px var(--neu-highlight)` — sidebar, composer, recessed wells

Every `.neu-*` class also carries `inset 0 1px 0 var(--neu-edge)` — a top-edge highlight simulating the light source from upper-left.

### Glass-Neumorphic Materials

A hybrid layer for surfaces that need translucency + depth. Applied via `.glass-neu`, `.glass-neu-strong`, `.glass-neu-inset`, `.glass-neu-compact`. Combines:

- `backdrop-filter: blur(12–18px) saturate(1.08–1.16)`
- Semi-transparent `background-color` via `color-mix()`
- Diagonal gradient overlays (135–145deg) blending `surface-bright` → `surface` → `accent-subtle`
- Composed shadow underneath (no border — shadow alone defines the edge)

| Class                | Opacity                   | Blur | Use                            |
| -------------------- | ------------------------- | ---- | ------------------------------ |
| `.glass-neu`         | 68% surface               | 18px | Header, collapsed sidebar rail |
| `.glass-neu-strong`  | 82% surface               | 14px | Chat panel, map panel          |
| `.glass-neu-inset`   | 76% surface-container-low | 16px | Sidebar body (recessed)        |
| `.glass-neu-compact` | 74% surface               | 12px | Small floating controls        |

Fallback: `@supports not (backdrop-filter: blur(1px))` → solid `var(--surface)` or `var(--surface-container-low)`.

### Named Rules

**The Dual-Tier Rule.** Tier 1 (elevation utilities) is for quick assignments in markup. Tier 2 (`.neu-*` classes) is for composed surfaces that need multi-shadow recipes + edge highlights. Never mix them on the same element.

**The Light-Source Rule.** The implied light source is always upper-left. Shadows fall bottom-right, highlights sit top-left. Every `.neu-*` class has `inset 0 1px 0 var(--neu-edge)` to reinforce this.

## Shapes

**Form language:** Generously rounded, consistent, functional. Radius increases with element size — small controls get 6–8px, panels get 12–16px, pills get `full`.

- **Panels/Cards:** `rounded-2xl` (16px) — header, chat panel, map panel, sidebar, bottom sheets
- **Buttons/Containers:** `rounded-xl` (12–16px) — action buttons, icon containers, badges
- **Inner controls:** `rounded-lg` (12px) — session items, details blocks, tool cards
- **Small elements:** `rounded-md` (8px) — small icon badges, nav items, inline code
- **Pills:** `rounded-full` — chat input, action chips, dots, avatars, quick-action pills
- **Chat bubbles:** Asymmetric — user: `16px 16px 5px 16px` (flat bottom-right), assistant: `16px 16px 16px 5px` (flat bottom-left)

**Border treatment:** No borders on neumorphic surfaces. The `inset 0 1px 0 var(--neu-edge)` highlight in box-shadow provides the only edge definition. Surfaces emerge from soft shadow alone — no hard lines. Borders exist only on:

- Section dividers (`border-t`/`border-b` hairlines between content sections)
- Outline-style action pills (`border-primary` for interactive affordance)
- State indicators (`border-error` for validation)

## Components

### Buttons

Molded, pressable, dimensional. State communicates through shadow change + micro-transform.

- **Primary:** `bg-primary text-on-primary rounded-xl`. Shadow: `.neu-primary-button` (glow underneath + highlight). Hover: brightness(1.05), translateY(-2px), expanded glow. Active: inset shadow, translateY(1px), scale(0.985).
- **Secondary:** `bg-surface text-on-surface rounded-xl`. Shadow: `.neu-button` (raised). Hover: expanded shadow, translateY(-1px). Active: inset shadow, scale(0.98).
- **Ghost:** Transparent background, `text-on-surface-variant`. No shadow at rest. Hover: subtle surface background.
- **Sizes:** Standard 36px height, Compact 32px, Large 40–44px.

### Cards / Containers

- **Standard card:** `bg-surface rounded-2xl`. Shadow: `.neu-panel` or `.glass-neu-strong`. No border. Padding: 12–16px.
- **Chat panel:** `.glass-neu-strong bg-surface rounded-2xl`. Internal: header bar (border-bottom separator only), message well (`.chat-message-well` — recessed with inset shadows), composer area.

### Inputs / Fields

- **Chat input:** Rounded (`rounded-2xl`). `bg-surface-container-low`. Shadow: `neu-inset` at rest. Focus: ring glow via box-shadow (no border change). Internal: send button right (circular, primary).
- **Composer thinking state:** Animated conic-gradient border mask (`thinking-border-orbit` at 2.4s) with expanded neumorphic glow. A `thinking-orb` (spinning gradient sphere with inset shadow) replaces the send button.

### Navigation

- **Sidebar:** `.neu-inset .glass-neu-inset bg-surface-container-low rounded-2xl`. Width: 3.75rem (collapsed) to 18.5rem (expanded). Collapse/expand animated with `--neu-ease` (380ms).
- **Nav items:** Height 36px, `px-3 py-2 rounded-lg`. Active: `bg-accent-subtle text-primary`. Inactive: `text-on-surface-variant`. Hover: `bg-surface-container-high`.
- **Header:** `.neu-panel .glass-neu bg-surface/90 rounded-2xl border`. Height ~56px. Floats over content with backdrop-blur.

### Chat Messages

- **User bubble:** `.neu-raised bg-accent-subtle rounded-[16px_16px_5px_16px] border border-border-subtle`. Right-aligned, max-width 80%. Padding: 12px 16px.
- **Assistant bubble:** `.neu-raised bg-surface rounded-[16px_16px_16px_5px] border border-border-subtle`. Left-aligned, max-width 85%. Contains structured content blocks (`bg-surface-container-low rounded-lg p-3`) and tool badges.
- **Tool badges:** `bg-surface-container-low border border-border-subtle rounded-md font-mono text-xs`. Padding: 4px 8px.
- **Quick-action pills:** `border border-primary text-primary rounded-full text-xs`. Hover: `bg-accent-subtle`.
- **Message entrance:** `animate-message-in` — 200ms ease-out, opacity 0→1 + translateY(6px→0).

### Signature: Thinking Orb

A spinning gradient sphere that appears during agent processing. Conic-gradient from `primary-container` through `primary` through white-tinted primary, with a neumorphic inner shadow and highlight dot. Reduced-motion: static at 112deg angle.

## Do's and Don'ts

### Do:

- **Do** use `.neu-panel` / `.neu-raised` / `.neu-inset` for composed surfaces — they carry the full edge-highlight + multi-shadow recipe. No `border` class needed.
- **Do** use `--muted` for placeholder and meta text to maintain WCAG AA contrast.
- **Do** let shadow alone define surface edges — the `inset 0 1px 0 var(--neu-edge)` highlight is sufficient.
- **Do** use `--neu-ease` (cubic-bezier 0.16, 1, 0.3, 1) for panel animations — it gives the "molded" feel of elements settling into place.
- **Do** respect `prefers-reduced-motion` — all animations collapse to instant, reveal elements show immediately.
- **Do** use `[data-theme="dark"]` for theme switching, not `prefers-color-scheme` media query.

### Don't:

- **Don't** mix Tier 1 (Tailwind shadow utilities) and Tier 2 (`.neu-*` classes) on the same element.
- **Don't** add `border` to any element with a `.neu-*` or `.glass-neu-*` class — shadows define edges, borders create hard lines that break the softness.
- **Don't** use pure black in shadows — warm gray in light mode, deep neutral in dark mode.
- **Don't** add `backdrop-filter` to elements that don't need layering hierarchy — glass is for panels that float over other content, not for everything.
- **Don't** use `--outline` or `--outline-variant` for text that must pass AA contrast on light surfaces — use `--muted` instead.
- **Don't** apply neumorphic depth to text content itself — depth frames the content, the content stays flat and readable.
- **Don't** animate shadow values directly (GPU-expensive) — animate `transform` and switch shadow classes via state.
