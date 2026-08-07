# Design System

<!-- impeccable:design-schema 1 -->

## Visual Direction

**Soft neumorphism meets muted minimalism.** The interface has gentle depth—surfaces rise and recede through soft shadows rather than hard borders. Elements feel tactile, like they could be pressed. The palette stays pastel and restrained, but the UI has dimensionality.

This is NOT the heavy-handed neumorphism of 2020 with its dramatic inset/outset shadows. It's a refined, modern interpretation: subtle elevation changes, soft ambient shadows, and a layered surface hierarchy that creates depth without sacrificing clarity or accessibility.

### Design Principles

1. **Soft depth**: Surfaces have gentle elevation. Cards float. Inputs feel pressable. Shadows are diffuse and warm, never harsh.
2. **Content-forward**: Chat messages and map data are the product—the neumorphic treatment frames them without competing.
3. **Tactile affordance**: Interactive elements look touchable. Buttons have subtle dimension. The UI invites interaction.
4. **Muted warmth**: Colors stay soft and approachable. The neumorphic shadows use warm tints, not pure black.
5. **Layered surfaces**: A clear hierarchy of surface levels (background → container-low → container → surface → elevated) creates spatial organization.

## Color

### Palette

Pastel-inflected, low-saturation colors with a warm gray foundation. The palette supports the neumorphic depth model—shadows are tinted warm, highlights are cool.

#### Surface Hierarchy (Light Mode)

The neumorphic approach requires multiple surface levels to create depth:

| Level                      | Color     | Usage                                              |
| -------------------------- | --------- | -------------------------------------------------- |
| **Background**             | `#F8F8F6` | Page ground, the "table" everything sits on        |
| **Surface Container Low**  | `#F4F3F5` | Sidebar, recessed areas                            |
| **Surface Container**      | `#EEEEEF` | Content wells, grouped sections                    |
| **Surface Container High** | `#E8E8E9` | Hover states, pressed states                       |
| **Surface**                | `#FAFAFA` | Elevated cards, main content panels                |
| **Surface Bright**         | `#FFFFFF` | Highest elevation, focused inputs, active elements |

#### Semantic Colors

| Role                     | Light Mode | Dark Mode | Usage                                           |
| ------------------------ | ---------- | --------- | ----------------------------------------------- |
| **Primary**              | `#416375`  | `#A9CBE0` | Primary actions, active states, key UI elements |
| **Primary Container**    | `#7C9EB2`  | `#294B5C` | Primary button backgrounds, accent areas        |
| **On Primary**           | `#FFFFFF`  | `#001E2B` | Text/icons on primary surfaces                  |
| **On Primary Container** | `#103546`  | `#C4E7FD` | Text/icons on primary container                 |
| **Secondary**            | `#306946`  | `#98D4A9` | Success states, positive actions                |
| **Secondary Container**  | `#B3F1C4`  | `#155130` | Success backgrounds, route info                 |
| **Tertiary**             | `#7A5733`  | `#EBBE92` | Warnings, tertiary actions                      |
| **Tertiary Container**   | `#BB9269`  | `#5F401E` | Warning backgrounds                             |
| **Error**                | `#C48B8B`  | `#D49A9A` | Errors, destructive actions                     |
| **Error Container**      | `#FFDAD6`  | `#93000A` | Error backgrounds                               |

#### Text Colors

| Role                   | Light Mode | Dark Mode | Usage                            |
| ---------------------- | ---------- | --------- | -------------------------------- |
| **On Surface**         | `#1A1C1D`  | `#E3E2E4` | Primary text                     |
| **On Surface Variant** | `#42484C`  | `#C2C7CC` | Secondary text, labels, metadata |
| **Outline**            | `#72787C`  | `#8C9297` | Icons, tertiary text             |
| **Outline Variant**    | `#C2C7CC`  | `#42484C` | Disabled text, placeholders      |

#### Border Colors

| Role              | Light Mode | Dark Mode | Usage                      |
| ----------------- | ---------- | --------- | -------------------------- |
| **Border**        | `#E8E8E4`  | `#2A2A2E` | Standard borders, dividers |
| **Border Subtle** | `#F0F0EC`  | `#1E1E22` | Hairlines, soft separators |

#### Accent Colors

| Role              | Light Mode | Dark Mode | Usage                                 |
| ----------------- | ---------- | --------- | ------------------------------------- |
| **Accent Subtle** | `#EEF4F7`  | `#1E2A30` | Selected nav items, hover backgrounds |
| **Surface Tint**  | `#416375`  | `#A9CBE0` | Tint overlay for interactive states   |

### Neumorphic Shadow System

The key to soft neumorphism is layered, diffuse shadows. Light source is top-left.

```css
/* Elevation 1: Subtle lift (cards at rest) */
--shadow-sm: 4px 4px 8px rgba(174, 174, 174, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.8);

/* Elevation 2: Medium lift (hovered cards, panels) */
--shadow-md: 6px 6px 14px rgba(174, 174, 174, 0.15), -3px -3px 10px rgba(255, 255, 255, 0.9);

/* Elevation 3: High lift (modals, dropdowns, map overlays) */
--shadow-lg: 8px 8px 20px rgba(174, 174, 174, 0.18), -4px -4px 14px rgba(255, 255, 255, 1);

/* Inset: Pressed/recessed elements (input fields, pressed buttons) */
--shadow-inset: inset 2px 2px 5px rgba(174, 174, 174, 0.15), inset -2px -2px 5px rgba(255, 255, 255, 0.7);

/* Soft glow: For primary action buttons */
--shadow-glow: 0 4px 14px rgba(65, 99, 117, 0.3);
```

### Color Usage Rules

- **Surface hierarchy creates depth**: Use container levels to show spatial relationships
- **Shadows are warm-tinted**: Never pure black—use warm grays like `rgba(174, 174, 174, x)`
- **Highlights are white**: The "light source" from top-left creates white highlight edges
- **Primary for actions**: Steel blue primary is for interactive elements, not decoration
- **Semantic colors for meaning**: Success/warning/error only when communicating state

## Typography

### Font Stack

**Primary**: [Aspekta](https://uncut.wtf/sans-serif/aspekta/) — a variable sans-serif with clean geometry and subtle warmth.

**Monospace**: [Commit Mono](https://uncut.wtf/monospace/commit-mono/) — a neutral, highly legible monospace for code and data.

```css
@font-face {
  font-family: "Aspekta";
  src: url("/fonts/Aspekta-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: "Commit Mono";
  src: url("/fonts/CommitMono-Variable.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}

--font-sans: "Aspekta", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Commit Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
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

**Neumorphic buttons have subtle lift and respond to interaction with shadow changes.**

| Variant       | Background            | Text               | Shadow          | Usage                                 |
| ------------- | --------------------- | ------------------ | --------------- | ------------------------------------- |
| **Primary**   | Primary (`#416375`)   | On Primary (white) | `--shadow-glow` | Main actions (Send, New Conversation) |
| **Secondary** | Surface Container Low | On Surface         | `--shadow-sm`   | Secondary actions                     |
| **Ghost**     | Transparent           | On Surface Variant | None            | Tertiary actions, icon buttons        |
| **Danger**    | Error                 | White              | `--shadow-sm`   | Destructive actions                   |

**Button states:**

- **Rest**: Subtle lift with `--shadow-sm`
- **Hover**: Increased lift with `--shadow-md`, slight scale (1.02)
- **Active/Pressed**: Inset shadow `--shadow-inset`, scale (0.98)
- **Disabled**: 50% opacity, no shadow, no pointer events

**Sizes:**

- **Standard**: 36px height, 12px horizontal padding
- **Compact**: 32px height, 8px horizontal padding
- **Large**: 40-44px height, 16px horizontal padding (primary CTAs)

**Border radius**: 8px (standard), `full` for icon-only buttons

### Inputs

**Inputs use inset shadows to feel recessed into the surface.**

```
┌─────────────────────────────────────────────┐
│  [icon]  Placeholder text...          [btn] │
└─────────────────────────────────────────────┘
```

- **Height**: 40px standard, 44px for main chat input
- **Background**: Surface Container Low
- **Border**: 1px Border Subtle (rest), 1px Primary (focus)
- **Shadow**: `--shadow-inset` (rest), none (focus)
- **Border radius**: `full` for chat input (pill shape), 10px for form inputs
- **Placeholder**: Outline Variant color
- **Focus**: Remove inset shadow, add 1px Primary border, subtle glow

**Chat input specific:**

- Pill-shaped (`rounded-full`)
- Attach button on left (icon button, ghost)
- Send button on right (icon button, primary, circular)
- Inner padding: 12px left (after attach), 44px right (for send button)

### Cards

**Cards float above the background with soft neumorphic shadows.**

- **Background**: Surface
- **Border**: 1px Border Subtle
- **Border radius**: 12px (standard), 16px (large panels)
- **Shadow**: `--shadow-sm` at rest, `--shadow-md` on hover (if interactive)
- **Padding**: 16px (standard), 12px (compact)

### Chat Panel

The chat panel is a card that contains the conversation:

- **Background**: Surface
- **Border**: 1px Border Subtle
- **Border radius**: 12px
- **Shadow**: `--shadow-sm`
- **Internal structure**:
  - Header bar (session title, actions) — bg: Surface Bright, border-bottom
  - Message area — bg: inherits, scrollable, padding 16px
  - Input area — bg: Surface Bright, border-top, padding 12px

### Chat Messages

**User messages:**

```
┌────────────────────────────────────────┐
│ User message text                      │  bg: Accent Subtle (#EEF4F7)
│ Right-aligned                          │  text: On Surface
│ Max-width: 80%                         │  radius: 16px 16px 4px 16px
│ No border, no shadow                   │  padding: 12px 16px
└────────────────────────────────────────┘
```

**Assistant messages:**

```
┌────────────────────────────────────────┐
│ [avatar] Reogent                 │  Header with avatar + name
├────────────────────────────────────────┤
│ Assistant response text                │  bg: Surface
│ Left-aligned                           │  border: 1px Border Subtle
│ Max-width: 85%                         │  radius: 16px 16px 16px 4px
│ May contain structured content         │  padding: 12px 16px
│                                        │
│ ┌────────────────────────────────────┐ │  Structured content block
│ │ Prerequisite info, etc.            │ │  bg: Surface Container Low
│ └────────────────────────────────────┘ │  radius: 8px, padding: 12px
│                                        │
│ [tool badges row]                      │
├────────────────────────────────────────┤
│ [Quick action] [Quick action]          │  Action pills below message
└────────────────────────────────────────┘
```

**Assistant avatar:**

- Size: 24px circle
- Background: Primary Container
- Icon: 14px, On Primary Container color

### Tool Badges

Inline indicators showing which data tools were used:

- **Background**: Surface Container Low
- **Border**: 1px Border Subtle
- **Text**: Mono font (JetBrains Mono or system mono), 12px, On Surface Variant
- **Icon**: 14px, On Surface Variant
- **Border radius**: 6px
- **Padding**: 4px 8px
- **Layout**: Flex row, 8px gap, wraps

Example: `[🔍 search_courses(course="CPSC 310")]` `[📍 walking_distance(...)]`

### Quick Action Pills

Suggested follow-up actions below assistant messages:

- **Background**: Transparent
- **Border**: 1px Primary
- **Text**: Primary color, Caption size (12px), weight 450
- **Border radius**: `full` (pill shape)
- **Padding**: 6px 12px
- **Hover**: bg Accent Subtle
- **Layout**: Flex row, 8px gap

Examples: "Show on Map", "Check my academic history"

### Structured Content Blocks

For displaying formatted data within assistant messages:

- **Background**: Surface Container Low
- **Border radius**: 8px
- **Padding**: 12px
- **Typography**:
  - Title: Heading size (16px), weight 500
  - Content: Body Small (13px), On Surface Variant
  - Lists: 16px left padding, disc bullets

### Date Separators

Visual breaks between messages from different time periods:

```
─────────────── Today, 10:42 AM ───────────────
```

- **Text**: Caption size (12px), On Surface Variant
- **Background**: Surface Container Low (pill behind text)
- **Border radius**: `full`
- **Padding**: 4px 12px
- **Layout**: Centered, horizontal lines on sides (optional, or just centered pill)

### Map Panel

**The map is contained in a neumorphic card with floating overlay controls.**

- **Container**: Same as cards (Surface, border, radius 12px, shadow-sm)
- **Map tiles**: Light, desaturated (Carto Positron or similar)
- **Border radius**: 12px (clips the map)

**Route styling:**

- **Line**: Primary color, 4-6px width, dashed (`12 8` pattern), rounded caps
- **Origin marker**: Primary filled circle (10px) with white stroke (3px)
- **Destination marker**: Primary filled circle (12px) with white stroke, white inner dot (4px)
- **Labels**: Aspekta 14px weight 600, On Primary Container color, positioned near markers

**Map overlay cards (floating UI):**

_Route info card (top-left):_

```
┌─────────────────────────────────┐
│ [walk icon]  12 min             │  bg: Surface/90% + backdrop-blur
│              950 m via Main Mall│  border: 1px Border Subtle
└─────────────────────────────────┘  radius: 8px, shadow-md, padding: 8px 12px
```

- Icon in Secondary Container background, 18px
- Duration: Heading size, On Surface
- Distance/route: Caption size, On Surface Variant

_Control buttons (top-right, stacked):_

- 40px square buttons
- bg: Surface/90% + backdrop-blur
- border: 1px Border Subtle
- radius: 8px
- Icons: 20px, On Surface Variant (hover: Primary)

_Zoom controls (bottom-right):_

- Combined button group (+ / -)
- Same styling as control buttons
- Divider between buttons

### Sidebar Navigation

**The sidebar uses Surface Container Low as its background to feel recessed.**

- **Background**: Surface Container Low
- **Width**: 280px
- **Border**: right 1px Border Subtle
- **Padding**: 16px vertical, varies horizontal

**Sidebar header:**

- Logo/icon: 40px circle, Primary Container bg, school icon
- Title: "Sessions" in Title size, Primary color
- Subtitle: "AI Assistant" in Body Small, On Surface Variant

**New Conversation button:**

- Full width, Primary style
- Height: 36px
- Icon: `plus` (18px) + "New Conversation"
- Margin: 8px horizontal, 8px bottom

**Navigation items:**

```
┌────────────────────────────────────────┐
│ [icon]  Current Chat                   │  Active: bg Accent Subtle, text Primary
├────────────────────────────────────────┤
│ [icon]  Academic History               │  Inactive: text On Surface Variant
│ [icon]  Campus Map                     │  Hover: bg Surface Container High
│ [icon]  Course Resources               │
└────────────────────────────────────────┘
```

- Height: 36px per item
- Padding: 8px 12px
- Border radius: 8px
- Icon: 20px, 12px gap to text
- Active state: Accent Subtle bg, Primary text, filled icon variant

**Footer links (Help, Settings):**

- Same styling as nav items
- Separated by border-top with 16px margin
- Icons: help, settings

### Header Bar

- **Height**: 56px
- **Background**: Background (not Surface, to separate from content)
- **Border**: bottom 1px Border Subtle
- **Padding**: 0 16px

**Contents:**

- **Left**: Hamburger menu (mobile only), then app title "UBC AI Assistant" in Display size, Primary color
- **Right**: Notification bell (ghost button), Settings (ghost button), User avatar (32px circle, border)

**User avatar:**

- Size: 32px
- Border: 1px Border Subtle
- Border radius: full
- Overflow: hidden (for image)

### Dropdowns & Menus

- **Background**: Surface Bright
- **Border**: 1px Border Subtle
- **Border radius**: 12px
- **Shadow**: `--shadow-lg`
- **Padding**: 8px
- **Item height**: 36px
- **Item hover**: Surface Container High bg
- **Item border radius**: 6px

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

- **Library**: [Mingcute Icons](https://www.mingcute.com/) — rounded, friendly, consistent
- **Style**: Line icons (outline) for navigation, filled for active states
- **Stroke**: 1.5px default weight
- **Size**: 16px inline, 18px in buttons, 20px standalone, 24px navigation

### Icon Usage

| Context          | Size | Style                            |
| ---------------- | ---- | -------------------------------- |
| Inline with text | 16px | Line                             |
| Inside buttons   | 18px | Line (or filled if primary)      |
| Navigation items | 20px | Line (inactive), Filled (active) |
| Header actions   | 20px | Line                             |
| Empty states     | 48px | Line                             |

### Common Icons (Mingcute names)

| Action        | Icon Name                         |
| ------------- | --------------------------------- |
| Send message  | `arrow-up-line` or `send-line`    |
| New chat      | `add-line`                        |
| Chat/Sessions | `chat-1-line` / `chat-1-fill`     |
| History       | `history-line`                    |
| Settings      | `settings-3-line`                 |
| Help          | `question-line`                   |
| Sign out      | `exit-line`                       |
| Search        | `search-line`                     |
| Course/Book   | `book-2-line`                     |
| Tuition/Money | `currency-dollar-line`            |
| Walking/Route | `walk-line` or `route-line`       |
| Location      | `location-line` / `location-fill` |
| Building      | `building-1-line`                 |
| Map           | `map-line`                        |
| Layers        | `layer-line`                      |
| My location   | `aim-line`                        |
| Zoom in       | `add-line`                        |
| Zoom out      | `minimize-line`                   |
| Attach file   | `attachment-line`                 |
| More options  | `more-2-line`                     |
| Notifications | `notification-line`               |
| User/Profile  | `user-3-line`                     |
| Loading       | `loading-line` (animated)         |
| Error         | `alert-line`                      |
| Success       | `check-circle-line`               |
| School        | `school-line`                     |
| Menu          | `menu-line`                       |

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
  /* Fonts */
  --font-sans: "Aspekta", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Commit Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Surface Hierarchy - Light Mode */
  --color-background: #f8f8f6;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f4f3f5;
  --color-surface-container: #eeeeef;
  --color-surface-container-high: #e8e8e9;
  --color-surface: #fafafa;
  --color-surface-bright: #ffffff;

  /* Semantic Colors */
  --color-primary: #416375;
  --color-primary-container: #7c9eb2;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #103546;
  --color-secondary: #306946;
  --color-secondary-container: #b3f1c4;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #00210f;
  --color-tertiary: #7a5733;
  --color-tertiary-container: #bb9269;
  --color-error: #c48b8b;
  --color-error-container: #ffdad6;

  /* Text Colors */
  --color-on-surface: #1a1c1d;
  --color-on-surface-variant: #42484c;
  --color-outline: #72787c;
  --color-outline-variant: #c2c7cc;

  /* Border Colors */
  --color-border: #e8e8e4;
  --color-border-subtle: #f0f0ec;

  /* Accent */
  --color-accent-subtle: #eef4f7;
  --color-surface-tint: #416375;

  /* Neumorphic Shadows */
  --shadow-sm: 4px 4px 8px rgba(174, 174, 174, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.8);
  --shadow-md: 6px 6px 14px rgba(174, 174, 174, 0.15), -3px -3px 10px rgba(255, 255, 255, 0.9);
  --shadow-lg: 8px 8px 20px rgba(174, 174, 174, 0.18), -4px -4px 14px rgba(255, 255, 255, 1);
  --shadow-inset: inset 2px 2px 5px rgba(174, 174, 174, 0.15), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
  --shadow-glow: 0 4px 14px rgba(65, 99, 117, 0.3);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
  --spacing-3xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 350ms ease-in-out;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #121214;
    --color-surface-container-lowest: #0e0e10;
    --color-surface-container-low: #1a1a1e;
    --color-surface-container: #222226;
    --color-surface-container-high: #2c2c30;
    --color-surface: #1a1a1e;
    --color-surface-bright: #2a2a2e;

    --color-primary: #a9cbe0;
    --color-primary-container: #294b5c;
    --color-on-primary: #001e2b;
    --color-on-primary-container: #c4e7fd;
    --color-secondary: #98d4a9;
    --color-secondary-container: #155130;
    --color-tertiary: #ebbe92;
    --color-tertiary-container: #5f401e;
    --color-error: #d49a9a;

    --color-on-surface: #e3e2e4;
    --color-on-surface-variant: #c2c7cc;
    --color-outline: #8c9297;
    --color-outline-variant: #42484c;

    --color-border: #2a2a2e;
    --color-border-subtle: #1e1e22;
    --color-accent-subtle: #1e2a30;
    --color-surface-tint: #a9cbe0;

    /* Dark mode shadows - more subtle */
    --shadow-sm: 4px 4px 8px rgba(0, 0, 0, 0.3), -2px -2px 6px rgba(50, 50, 55, 0.5);
    --shadow-md: 6px 6px 14px rgba(0, 0, 0, 0.35), -3px -3px 10px rgba(50, 50, 55, 0.4);
    --shadow-lg: 8px 8px 20px rgba(0, 0, 0, 0.4), -4px -4px 14px rgba(50, 50, 55, 0.3);
    --shadow-inset: inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(50, 50, 55, 0.3);
    --shadow-glow: 0 4px 14px rgba(169, 203, 224, 0.2);
  }
}

/* Font faces */
@font-face {
  font-family: "Aspekta";
  src: url("/fonts/Aspekta-Variable.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Commit Mono";
  src: url("/fonts/CommitMono-Variable.woff2") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
```

### Usage Examples

```html
<!-- Neumorphic card -->
<div class="bg-surface border-border-subtle p-lg rounded-lg border shadow-[var(--shadow-sm)]">
  <!-- Primary button with glow -->
  <button
    class="bg-primary text-on-primary px-lg py-sm rounded-md shadow-[var(--shadow-glow)] transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] active:shadow-[var(--shadow-inset)]"
  >
    <!-- Recessed input (chat) -->
    <input
      class="bg-surface-container-low border-border-subtle px-md py-sm text-on-surface placeholder:text-outline-variant focus:border-primary rounded-full border shadow-[var(--shadow-inset)] focus:shadow-none"
    />

    <!-- User message bubble -->
    <div class="bg-accent-subtle text-on-surface px-lg py-md ml-auto max-w-[80%] rounded-[16px_16px_4px_16px]">
      <!-- Assistant message bubble -->
      <div
        class="bg-surface border-border-subtle text-on-surface px-lg py-md max-w-[85%] rounded-[16px_16px_16px_4px] border"
      >
        <!-- Tool badge -->
        <div
          class="bg-surface-container-low border-border-subtle px-sm py-xs text-on-surface-variant rounded-md border font-mono text-xs"
        >
          <!-- Quick action pill -->
          <button class="border-primary text-primary px-md py-xs hover:bg-accent-subtle rounded-full border text-xs">
            <!-- Nav item (active) -->
            <a class="bg-accent-subtle text-primary px-md py-sm gap-md flex items-center rounded-lg">
              <!-- Nav item (inactive) -->
              <a
                class="text-on-surface-variant px-md py-sm gap-md hover:bg-surface-container-high flex items-center rounded-lg"
              >
                <!-- Map overlay card -->
                <div
                  class="bg-surface/90 border-border-subtle p-sm rounded-lg border shadow-[var(--shadow-md)] backdrop-blur-sm"
                ></div></a
            ></a>
          </button>
        </div>
      </div>
    </div>
  </button>
</div>
```

### Font Setup

1. **Aspekta**: Download from [uncut.wtf](https://uncut.wtf/sans-serif/aspekta/) and place in `/public/fonts/`
2. **Commit Mono**: Download from [uncut.wtf](https://uncut.wtf/monospace/commit-mono/) and place in `/public/fonts/`
3. **Mingcute Icons**: Install via npm (`@iconify-json/mingcute`) or use CDN
