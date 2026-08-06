# Design System

<!-- impeccable:design-schema 1 -->

## Visual Direction

**Muted minimalism.** Soft, pastel-inflected palette. The interface whispers; the conversation and map speak. Every element earns its place through restraint.

### Design Principles

1. **Content-forward**: Chat messages and map data are the product—chrome exists only to frame them
2. **Soft confidence**: No harsh contrasts, no heavy shadows, no visual noise
3. **Functional density**: Show useful information without clutter; whitespace is intentional, not filler
4. **Muted warmth**: Colors feel approachable but never loud

## Color

### Palette

Pastel-inflected, low-saturation colors. Light mode leans warm gray; dark mode leans cool charcoal.

| Role                 | Light Mode | Dark Mode | Usage                                 |
| -------------------- | ---------- | --------- | ------------------------------------- |
| **Background**       | `#F8F8F6`  | `#121214` | Page ground                           |
| **Surface**          | `#FFFFFF`  | `#1A1A1E` | Cards, panels, chat bubbles           |
| **Surface Elevated** | `#FFFFFF`  | `#222226` | Modals, dropdowns                     |
| **Border**           | `#E8E8E4`  | `#2A2A2E` | Dividers, input borders               |
| **Border Subtle**    | `#F0F0EC`  | `#1E1E22` | Hairlines, separators                 |
| **Text Primary**     | `#2D2D2D`  | `#ECECEC` | Headings, body                        |
| **Text Secondary**   | `#6B6B6B`  | `#9A9A9A` | Labels, metadata                      |
| **Text Tertiary**    | `#A0A0A0`  | `#5A5A5A` | Placeholders, disabled                |
| **Accent**           | `#7C9EB2`  | `#8FB4C9` | Links, primary actions, active states |
| **Accent Hover**     | `#6A8A9E`  | `#A3C4D6` | Hover on accent elements              |
| **Accent Subtle**    | `#EEF4F7`  | `#1E2A30` | Accent backgrounds, selections        |
| **Success**          | `#7DB88F`  | `#8FC9A0` | Confirmations, online status          |
| **Warning**          | `#C9A86B`  | `#D4B87A` | Cautions, limits                      |
| **Error**            | `#C48B8B`  | `#D49A9A` | Errors, destructive actions           |

### Color Usage Rules

- **Accent sparingly**: Muted steel blue for interactive elements only—links, primary buttons, focus rings, active nav
- **Semantic colors for meaning**: Success/warning/error only when communicating state, never decorative
- **No color as sole indicator**: Always pair with icon or text for accessibility
- **Map colors are data**: Building highlights, route lines use accent; keep desaturated to match the palette

## Typography

### Font Stack

**Primary**: [Aspekta](https://uncut.wtf/sans-serif/aspekta/) — a variable sans-serif with clean geometry and subtle warmth.

```css
@font-face {
  font-family: "Aspekta";
  src: url("/fonts/Aspekta-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

--font-sans: "Aspekta", ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

### Type Scale

| Name           | Size             | Weight | Line Height | Usage                           |
| -------------- | ---------------- | ------ | ----------- | ------------------------------- |
| **Display**    | 30px / 1.875rem  | 500    | 1.2         | Hero headings (rare)            |
| **Title**      | 20px / 1.25rem   | 500    | 1.3         | Page titles, section heads      |
| **Heading**    | 16px / 1rem      | 500    | 1.4         | Card titles, chat session names |
| **Body**       | 14px / 0.875rem  | 400    | 1.5         | Chat messages, descriptions     |
| **Body Small** | 13px / 0.8125rem | 400    | 1.5         | Secondary info, timestamps      |
| **Caption**    | 12px / 0.75rem   | 450    | 1.4         | Labels, metadata, tool badges   |
| **Mono**       | 13px / 0.8125rem | 400    | 1.5         | Code, course codes, data        |

### Typography Rules

- **14px base** for body text—optimized for dense information
- **Sentence case** for UI labels; Title Case only for proper nouns
- **No italic for emphasis** in UI; use weight or color
- **Mono for data**: Course codes (`CPSC 110`), times (`14:30`), building codes (`ICCS`)
- **Weight 450-500** for emphasis instead of bold—keeps the muted feel

## Spacing

### Scale

```
4px   - xs   - Inline spacing, icon gaps
8px   - sm   - Compact padding, list item gaps
12px  - md   - Standard padding, form gaps
16px  - lg   - Section padding, card padding
24px  - xl   - Major section gaps
32px  - 2xl  - Page margins, panel gaps
48px  - 3xl  - Hero spacing (rare)
```

### Spacing Rules

- **8px grid**: All spacing aligns to multiples of 8px (with 4px for tight situations)
- **Consistent padding**: Cards use 16px padding; inputs use 12px horizontal, 8px vertical
- **Breathing room**: 24px minimum between unrelated sections
- **Dense where useful**: Chat messages can be tighter (8px gap) for conversational flow

## Layout

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + Session picker + User menu      h: 56px    │
├─────────────────────────────────────────────────────────────┤
│                    │                                        │
│   Sessions List    │           Main Content                 │
│   w: 280px         │     (Chat + Map split or stacked)      │
│   (collapsible)    │                                        │
│                    │                                        │
└─────────────────────────────────────────────────────────────┘
```

### Breakpoints

| Name        | Width      | Layout                                    |
| ----------- | ---------- | ----------------------------------------- |
| **Mobile**  | < 640px    | Single column, bottom nav, map as overlay |
| **Tablet**  | 640–1024px | Collapsed sidebar, chat/map toggle        |
| **Desktop** | > 1024px   | Full sidebar, chat + map side-by-side     |

### Panel Behavior

- **Chat panel**: Minimum 360px, maximum 600px, grows to fill on mobile
- **Map panel**: Fills remaining space, minimum 400px on desktop
- **Sidebar**: Fixed 280px on desktop, slide-over drawer on mobile/tablet

## Components

### Buttons

| Variant       | Background  | Text           | Border | Usage                          |
| ------------- | ----------- | -------------- | ------ | ------------------------------ |
| **Primary**   | Accent      | White          | None   | Main actions (Send, Sign in)   |
| **Secondary** | Transparent | Text Primary   | Border | Secondary actions              |
| **Ghost**     | Transparent | Text Secondary | None   | Tertiary actions, icon buttons |
| **Danger**    | Error       | White          | None   | Destructive actions            |

- **Size**: 36px height standard, 32px compact, 40px for primary CTAs
- **Border radius**: 10px
- **Disabled**: 50% opacity, no pointer events

### Inputs

- **Height**: 40px (36px compact)
- **Border**: 1px Border color, 2px Accent on focus
- **Border radius**: 10px
- **Background**: Surface
- **Placeholder**: Text Tertiary
- **Focus ring**: 2px Accent at 40% opacity with 2px offset

### Cards

- **Background**: Surface
- **Border**: 1px Border Subtle
- **Border radius**: 14px
- **Shadow**: None
- **Padding**: 16px

### Chat Messages

```
┌────────────────────────────────────────┐
│ User message                           │  bg: Accent Subtle
│ Right-aligned, rounded corners         │  text: Text Primary
│ Max-width: 80%                         │  radius: 14px 14px 4px 14px
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Assistant message                      │  bg: Surface
│ Left-aligned, includes tool badges     │  border: 1px Border Subtle
│ Max-width: 85%                         │  radius: 14px 14px 14px 4px
└────────────────────────────────────────┘
```

### Tool Badges

When the assistant uses a tool, show a subtle inline badge:

- **Background**: Background (not Surface)
- **Text**: Caption size, Text Secondary
- **Icon**: 14px, matching tool type
- **Border radius**: 6px
- **Padding**: 4px 8px

Example: `[🔍 search_courses]` `[📍 walking_distance]`

### Map

- **Style**: Light, desaturated base map (Carto Positron or Stadia Alidade Smooth)
- **Building highlight**: Accent color fill at 15% opacity, Accent stroke at 60% opacity
- **Route line**: Accent color at 70% opacity, 3px width, rounded caps
- **Markers**: Accent color pins with white center dot
- **Controls**: Minimal—zoom buttons only, bottom-right, ghost style

## Motion

### Principles

- **Purposeful**: Animation communicates state change, not decoration
- **Gentle**: 150ms for micro-interactions, 250ms for panels, 350ms for page transitions
- **Ease**: `ease-out` for entrances, `ease-in-out` for state changes

### Specific Animations

| Element        | Duration | Easing   | Property                          |
| -------------- | -------- | -------- | --------------------------------- |
| Button hover   | 150ms    | ease-out | background-color, opacity         |
| Panel slide    | 250ms    | ease-out | transform                         |
| Message appear | 200ms    | ease-out | opacity, transform (slide up 6px) |
| Route draw     | 500ms    | ease-out | stroke-dashoffset                 |
| Map zoom       | 300ms    | ease-out | handled by map library            |

### Reduced Motion

Respect `prefers-reduced-motion`:

- Disable transform animations
- Keep opacity fades (instant or 100ms)
- Route draws instantly instead of animating

## Iconography

### Style

- **Library**: Lucide React (or similar minimal line icons)
- **Stroke**: 1.5px
- **Size**: 16px inline, 20px standalone, 24px navigation

### Common Icons

| Action         | Icon                             |
| -------------- | -------------------------------- |
| Send message   | `arrow-up` (in circle) or `send` |
| New chat       | `plus`                           |
| Sessions       | `messages-square`                |
| Settings       | `settings`                       |
| Sign out       | `log-out`                        |
| Search courses | `search`                         |
| Course info    | `book-open`                      |
| Tuition        | `dollar-sign`                    |
| Walking        | `footprints` or `navigation`     |
| Building       | `building`                       |
| Map            | `map`                            |
| Loading        | `loader-2` (spinning)            |
| Error          | `alert-circle`                   |
| Success        | `check-circle`                   |

## States

### Loading

- **Chat**: Typing indicator (three dots pulsing gently) in assistant message position
- **Map**: Subtle pulse on affected area
- **Full page**: Centered spinner with "Loading..." text below

### Empty States

- **No sessions**: "Start a conversation" with prominent new chat button
- **No messages**: Brief helper text about what the assistant can do
- **No route**: Map shows buildings but no highlighted route

### Error States

- **API error**: Inline error message in chat with retry button
- **Auth error**: Redirect to sign-in with explanation
- **Map error**: Fallback to text-only walking directions

## Accessibility

### Requirements (WCAG 2.1 AA)

- **Color contrast**: 4.5:1 minimum for body text, 3:1 for large text and UI components
- **Focus visible**: All interactive elements have visible focus indicator (2px Accent ring)
- **Keyboard navigation**: Full functionality without mouse
- **Screen reader**: Proper ARIA labels, live regions for chat updates
- **Reduced motion**: Respect user preference

### Specific Implementations

- **Chat**: Messages in `role="log"` with `aria-live="polite"`
- **Map**: Text summary of route available (e.g., "5 minute walk from ICCS to Buchanan")
- **Tool badges**: Include in screen reader output ("Used search_courses tool")
- **Skip link**: "Skip to chat" at page top

## Dark Mode

- **Default**: Respect `prefers-color-scheme`
- **Toggle**: Available in user menu
- **Persistence**: Store preference in localStorage

### Dark Mode Adjustments

- Reduce image brightness to 90%
- Map uses dark tile variant (Carto Dark Matter or Stadia Alidade Smooth Dark)
- Colors shift cooler in dark mode for reduced eye strain

## Tokens (Tailwind v4)

Tailwind v4 uses CSS-first configuration. Define tokens in your CSS file:

```css
/* app.css or globals.css */
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Aspekta", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Colors - Light Mode (default) */
  --color-background: #f8f8f6;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-border: #e8e8e4;
  --color-border-subtle: #f0f0ec;
  --color-text-primary: #2d2d2d;
  --color-text-secondary: #6b6b6b;
  --color-text-tertiary: #a0a0a0;
  --color-accent: #7c9eb2;
  --color-accent-hover: #6a8a9e;
  --color-accent-subtle: #eef4f7;
  --color-success: #7db88f;
  --color-warning: #c9a86b;
  --color-error: #c48b8b;

  /* Spacing (already default in Tailwind, but explicit for reference) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 250ms ease-out;
  --transition-slow: 350ms ease-in-out;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #121214;
    --color-surface: #1a1a1e;
    --color-surface-elevated: #222226;
    --color-border: #2a2a2e;
    --color-border-subtle: #1e1e22;
    --color-text-primary: #ececec;
    --color-text-secondary: #9a9a9a;
    --color-text-tertiary: #5a5a5a;
    --color-accent: #8fb4c9;
    --color-accent-hover: #a3c4d6;
    --color-accent-subtle: #1e2a30;
    --color-success: #8fc9a0;
    --color-warning: #d4b87a;
    --color-error: #d49a9a;
  }
}

/* Font face */
@font-face {
  font-family: "Aspekta";
  src: url("/fonts/Aspekta-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

### Usage Examples

```html
<!-- Background and text -->
<div class="bg-background text-text-primary">
  <!-- Card -->
  <div class="bg-surface border border-border-subtle rounded-lg p-lg">
    <!-- Primary button -->
    <button
      class="bg-accent hover:bg-accent-hover text-white rounded-md px-lg py-sm transition-[var(--transition-fast)]"
    >
      <!-- Input -->
      <input
        class="bg-surface border border-border rounded-md px-md py-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/40"
      />

      <!-- User message bubble -->
      <div class="bg-accent-subtle text-text-primary rounded-[14px_14px_4px_14px] px-lg py-md max-w-[80%] ml-auto">
        <!-- Assistant message bubble -->
        <div
          class="bg-surface border border-border-subtle text-text-primary rounded-[14px_14px_14px_4px] px-lg py-md max-w-[85%]"
        ></div>
      </div>
    </button>
  </div>
</div>
```

### Font Setup

Download Aspekta from [uncut.wtf](https://uncut.wtf/sans-serif/aspekta/) and place in `/public/fonts/`:

- `Aspekta-Variable.woff2` (variable font, all weights)

Or subset to weights 400, 450, 500 if bundle size is a concern.
