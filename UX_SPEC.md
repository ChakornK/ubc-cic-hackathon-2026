# UX Specification

## Overview

Two surfaces: a **Landing Page** (Persuade mode) and the **Main App** (Operate mode). The landing page is cinematic and visually rich—a product reveal page with scroll, motion, and atmosphere. The main app follows DESIGN.md's muted minimalism for focused task completion. Both share the Aspekta font and pastel palette but express them at different intensities.

---

## Surface 1: Landing Page

**Route:** `/`  
**Mode:** Persuade  
**Goal:** A cinematic product page that makes the visitor feel the experience before they sign in.

### Design Vision

This is not a login screen. This is a product reveal.

The landing page should feel like walking into a beautifully lit gallery where the single exhibit is this tool in action. It's cinematic—full-bleed, atmospheric, immersive. The page scrolls. It has rhythm: tension and release, density and air, movement and stillness. Each section earns the next scroll.

**The atmosphere:** The page opens with a full-viewport hero that uses a subtle radial gradient—the warm off-white of Background at the edges softening into a barely-perceptible cool wash of Accent Subtle at the center, creating a soft halo effect behind the headline. This isn't a flat page; it has depth. A faint, large-scale topographic line pattern (inspired by campus maps) sits at 3-4% opacity in the background, drifting with a slow parallax on scroll. It's felt more than seen—a texture that says "this is about a place" without being literal.

**The opening beat:** The hero headline is big. Not startup-landing-page big, but confidently scaled—40px on mobile, 56px on desktop, Aspekta weight 500, Text Primary. Tight letter-spacing (-0.03em). It reads: "Know your campus." Three words. Below it, a subline at 18px in Text Secondary provides the explanation: "Courses, prerequisites, tuition, walking routes—answered instantly from real UBC data." The CTA button sits below with generous spacing, but the hero's job is not to convert immediately—it's to set the tone and pull you into the scroll.

**The proof section:** Below the fold, a large product mock appears. Not a screenshot in a browser frame—a live-feeling recreation of the chat interface, slightly rotated in 3D perspective (2-3 degrees, subtle), with a soft shadow underneath that grounds it. This mock shows a multi-turn conversation: a student asking about walking distance between buildings, the assistant responding with specific meters and minutes, and a miniature map inset showing the highlighted route. The mock is rendered at roughly 70% of viewport width on desktop, centered, floating over a section that shifts to pure white (Surface). The 3D tilt and shadow give it physicality—this isn't a flat card, it's an object you could pick up.

**The features rhythm:** Three capability cards arranged horizontally on desktop (stacked on mobile), each one a tight pairing of an icon, a short label, and one sentence. These are NOT generic feature boxes—they're specific demonstrations:

1. **Course search** — Icon: a subtle grid of dots resolving into rows. Copy: "Find courses by subject, credits, or prerequisites. Filter to exactly what fits your schedule."
2. **Tuition lookup** — Icon: a single clean dollar sign with a subtle ring. Copy: "Per-credit rates by program, student type, and cohort year. No more PDF hunting."
3. **Campus routes** — Icon: two dots connected by a curved line. Copy: "Walking distance and time between any two buildings. See the route on a real map."

These cards use Surface background, a very soft border (Border Subtle), and generous padding (24px). They don't have hover effects—they're informational, not interactive. The icons are custom-drawn in the Accent color at full opacity: simple, geometric, 32px, 1.5px stroke.

**The social proof / trust strip:** A single horizontal line of quiet trust signals. Not testimonials (we have none and won't invent them). Instead: "Built on UBC course data • Updated each term • Powered by Amazon Bedrock" — in Caption size (12px), Text Tertiary, with subtle dot separators. This strip lives between the features and the final CTA. It's the smallest text on the page but it answers "can I trust this?"

**The closing CTA:** The page ends with a full-width section that returns to the Background color with the same subtle radial glow as the hero. The headline here is warmer, more inviting: "Ready to ask?" at 32px. Below it, the sign-in button—larger than you'd expect for a secondary CTA (48px height, max-width 320px, centered), in full Accent color. Below the button: "Sign in with your Google account. Free to use." in Text Tertiary, 13px. The page ends here—no footer clutter, no link grids. A single small "Built for UBC CIC Hackathon 2026" credit in Caption size at the very bottom with 48px breathing room.

**Motion and life:** The page is not static. As you scroll:

- The hero headline fades slightly and shifts up (parallax, 0.3x rate) as you leave it
- The product mock enters the viewport with a gentle scale-up (0.95 → 1.0) and opacity fade over 500ms, triggered once at 20% visibility
- The three feature cards stagger in: each one fades up (translate 20px → 0, opacity 0 → 1) with 100ms delay between them, 400ms duration
- The closing CTA section's radial glow gently pulses once when it enters viewport (opacity 0.03 → 0.06 → 0.03 over 3s)
- All animations respect `prefers-reduced-motion`—fallback is instant visibility, no transforms

**The palette on this page specifically:** While the app uses the muted palette faithfully, the landing page is allowed one indulgence: the Accent color appears more generously. The feature icons, the CTA buttons, subtle gradient touches in the background—the landing page uses Accent as a presence, not just a utility. It's still muted steel blue, still soft, but it's the page's signature rather than a highlight.

**Typography on this page:** The hero uses the Display scale pushed further—56px desktop, 40px mobile, weight 500, tight tracking. Body copy is 16px (one step up from the app's 14px) for better readability in a marketing context. The feature card labels are 15px weight 500. Everything breathes more than the app does—line-heights are 1.4-1.6, paragraphs have 1.2em spacing.

**What this IS:** A product page you'd see from a well-funded design tool or developer product. Think Linear's landing page, Raycast's homepage, Vercel's product pages. Cinematic without being flashy. Beautiful without being decorative. Every visual element demonstrates the product rather than decorating around it.

**What this is NOT:** It is not minimal. It is not a login screen. It is not one viewport. It scrolls, it moves, it builds a case. But it is also not noisy—there are no particle effects, no auto-playing videos, no chatbot widgets, no cookie banners, no newsletter popups. The craft is in the restraint of each individual element combined with the generosity of the overall composition.

### Page Structure

Full-page scroll. Five distinct sections with rhythm between them.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SECTION 1: HERO                                                            │
│  height: 100vh (full viewport)                                              │
│  bg: Background with radial gradient center glow (Accent Subtle → transp)  │
│  + topographic line texture at 3-4% opacity                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                 │        │
│  │                      [flex, centered, col]                      │        │
│  │                                                                 │        │
│  │              "Know your campus."                                │        │
│  │              (56px desktop / 40px mobile / wt 500               │        │
│  │               Text Primary / tracking: -0.03em)                 │        │
│  │                                                                 │        │
│  │                        [20px gap]                               │        │
│  │                                                                 │        │
│  │    "Courses, prerequisites, tuition, walking routes—            │        │
│  │     answered instantly from real UBC data."                     │        │
│  │    (18px / wt 400 / Text Secondary / max-w: 520px / centered)  │        │
│  │                                                                 │        │
│  │                        [40px gap]                               │        │
│  │                                                                 │        │
│  │          ┌─────────────────────────────────┐                    │        │
│  │          │  ○  Sign in with Google         │                    │        │
│  │          └─────────────────────────────────┘                    │        │
│  │          (48px h / max-w: 280px / Accent bg / white text        │        │
│  │           radius: 12px / wt 500 / 15px)                         │        │
│  │                                                                 │        │
│  │                        [16px gap]                               │        │
│  │                                                                 │        │
│  │           "Free to use · Sign in with Google"                   │        │
│  │           (13px / Text Tertiary)                                │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  [scroll indicator: subtle chevron-down, 20px, Text Tertiary,               │
│   positioned absolute bottom 32px center, gentle bounce animation]          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SECTION 2: PRODUCT SHOWCASE                                                │
│  bg: Surface (#FFFFFF)                                                      │
│  padding: 120px vertical (desktop) / 80px (mobile)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                 │        │
│  │         Section label (optional):                               │        │
│  │         "See it in action"                                      │        │
│  │         (13px / Text Tertiary / uppercase / tracking 0.05em     │        │
│  │          / centered / margin-bottom 32px)                       │        │
│  │                                                                 │        │
│  │  ┌───────────────────────────────────────────────────────────┐  │        │
│  │  │                                                           │  │        │
│  │  │              PRODUCT MOCK                                 │  │        │
│  │  │              (see detail below)                           │  │        │
│  │  │                                                           │  │        │
│  │  │              width: min(70vw, 900px)                      │  │        │
│  │  │              centered                                     │  │        │
│  │  │              transform: perspective(1200px)               │  │        │
│  │  │                         rotateX(2deg)                     │  │        │
│  │  │              box-shadow: 0 40px 80px -20px                │  │        │
│  │  │                          rgba(0,0,0,0.08)                 │  │        │
│  │  │              border-radius: 16px                          │  │        │
│  │  │              border: 1px Border Subtle                    │  │        │
│  │  │              overflow: hidden                             │  │        │
│  │  │                                                           │  │        │
│  │  └───────────────────────────────────────────────────────────┘  │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SECTION 3: CAPABILITIES                                                    │
│  bg: Background (#F8F8F6)                                                   │
│  padding: 100px vertical (desktop) / 64px (mobile)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                 │        │
│  │         Section label:                                          │        │
│  │         "What it knows"                                         │        │
│  │         (13px / Text Tertiary / uppercase / tracking 0.05em     │        │
│  │          / centered / margin-bottom 48px)                       │        │
│  │                                                                 │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │        │
│  │  │              │  │              │  │              │          │        │
│  │  │  [icon 32px] │  │  [icon 32px] │  │  [icon 32px] │          │        │
│  │  │              │  │              │  │              │          │        │
│  │  │  Course      │  │  Tuition     │  │  Campus      │          │        │
│  │  │  search      │  │  lookup      │  │  routes      │          │        │
│  │  │              │  │              │  │              │          │        │
│  │  │  "Find..."   │  │  "Per-..."   │  │  "Walking.." │          │        │
│  │  │              │  │              │  │              │          │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │        │
│  │                                                                 │        │
│  │  Cards: bg Surface, border 1px Border Subtle, radius 14px      │        │
│  │  padding 24px, gap 20px between cards                           │        │
│  │  Desktop: 3 columns (grid, 1fr 1fr 1fr, max-w 900px centered)  │        │
│  │  Mobile: stacked vertically, full width                         │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SECTION 4: TRUST STRIP                                                     │
│  bg: Surface (#FFFFFF)                                                      │
│  padding: 40px vertical                                                     │
│  border-top: 1px Border Subtle                                              │
│  border-bottom: 1px Border Subtle                                           │
│                                                                             │
│  "Built on UBC course data · Updated each term · Powered by Amazon Bedrock"│
│  (13px / Text Tertiary / centered / flex with dot separators)               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SECTION 5: CLOSING CTA                                                     │
│  bg: Background with same radial glow as hero                               │
│  padding: 120px vertical (desktop) / 80px (mobile)                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                                                                 │        │
│  │              "Ready to ask?"                                    │        │
│  │              (32px / wt 500 / Text Primary / centered)          │        │
│  │                                                                 │        │
│  │                        [12px gap]                               │        │
│  │                                                                 │        │
│  │         "Your courses, your campus, one conversation."          │        │
│  │         (16px / Text Secondary / centered)                      │        │
│  │                                                                 │        │
│  │                        [36px gap]                               │        │
│  │                                                                 │        │
│  │          ┌─────────────────────────────────┐                    │        │
│  │          │  ○  Sign in with Google         │                    │        │
│  │          └─────────────────────────────────┘                    │        │
│  │          (48px h / max-w: 320px / Accent bg / white text)       │        │
│  │                                                                 │        │
│  │                        [14px gap]                               │        │
│  │                                                                 │        │
│  │    "Sign in with your Google account. Free to use."             │        │
│  │    (13px / Text Tertiary / centered)                            │        │
│  │                                                                 │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│                        [48px gap]                                           │
│                                                                             │
│  "Built for UBC CIC Hackathon 2026"                                        │
│  (12px / Text Tertiary / centered)                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Product Mock (Section 2 Detail)

A realistic recreation of the app interface showing a multi-turn conversation with a walking route result. This is the hero proof—the moment the visitor sees the product working.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Mock container:                                                            │
│    bg: Background (#F8F8F6)                                                 │
│    border: 1px Border Subtle                                                │
│    radius: 16px                                                             │
│    overflow: hidden                                                         │
│    aspect-ratio: 16/10 (desktop) or auto (mobile)                           │
│    transform: perspective(1200px) rotateX(2deg)                             │
│    shadow: 0 40px 80px -20px rgba(0,0,0,0.08),                             │
│            0 16px 40px -12px rgba(0,0,0,0.04)                               │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Mock Header bar                                                      │ │
│  │  bg: Surface / h: 44px / border-bottom: 1px Border Subtle            │ │
│  │  Left: "Reogent" (14px, wt 500)                                 │ │
│  │  Right: avatar circle (24px, bg: Accent Subtle)                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────┬──────────────────────────────┐ │
│  │                                         │                              │ │
│  │  Chat area (60% width)                  │  Map area (40% width)        │ │
│  │  bg: Background                         │  bg: light map tiles         │ │
│  │                                         │                              │ │
│  │  ┌──────────────────────────────────┐   │  ┌────────────────────────┐  │ │
│  │  │ "How far is it from ICCS to      │   │  │                        │  │ │
│  │  │  the Nest?"                 ─────│   │  │   [Simplified map      │  │ │
│  │  └──────────────────────────────────┘   │  │    showing two dots    │  │ │
│  │  (User bubble, Accent Subtle bg)        │  │    connected by a      │  │ │
│  │                                         │  │    curved line in       │  │ │
│  │  ┌──────────────────────────────────┐   │  │    Accent color]       │  │ │
│  │  │ "ICCS to the AMS Nest is about   │   │  │                        │  │ │
│  │  │  650 meters — roughly an 8        │   │  │   "ICCS" label         │  │ │
│  │  │  minute walk heading east         │   │  │   "Nest" label         │  │ │
│  │  │  through campus."                 │   │  │                        │  │ │
│  │  │                                   │   │  └────────────────────────┘  │ │
│  │  │  [📍 walking_distance]            │   │                              │ │
│  │  └──────────────────────────────────┘   │                              │ │
│  │  (Asst bubble, Surface bg, border)      │                              │ │
│  │                                         │                              │ │
│  │  ┌──────────────────────────────────┐   │                              │ │
│  │  │  [Input placeholder]      [↑]   │   │                              │ │
│  │  └──────────────────────────────────┘   │                              │ │
│  │                                         │                              │ │
│  └─────────────────────────────────────────┴──────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Design notes for the mock:**

- The mock uses the real app's tokens and component styles—it IS the app, just static
- The map inset is a simplified illustration: a soft gray ground with two labeled dots and a curved accent-colored line between them. Not a real map render—a clean, graphic representation
- The mock is NOT a screenshot or image—it's built with real HTML/CSS, which means it's crisp at every resolution and matches the app exactly
- On mobile (<640px): the mock loses the 3D perspective (goes flat), shrinks to 90vw, and the map portion is hidden (shows chat only)

### Capability Cards (Section 3 Detail)

Three cards, each a focused demonstration of one tool.

**Card structure:**

```
┌───────────────────────────────────────┐
│  bg: Surface                          │
│  border: 1px Border Subtle            │
│  radius: 14px                         │
│  padding: 28px 24px                   │
│  text-align: center (desktop)         │
│  text-align: left (mobile)            │
│                                       │
│  [Icon: 32px, Accent color, 1.5px]    │
│                                       │
│  [16px gap]                           │
│                                       │
│  "Course search"                      │
│  (15px / wt 500 / Text Primary)       │
│                                       │
│  [8px gap]                            │
│                                       │
│  "Find courses by subject, credits,   │
│   or prerequisites. Filter to         │
│   exactly what fits your schedule."   │
│  (14px / wt 400 / Text Secondary      │
│   / line-height 1.5)                  │
│                                       │
└───────────────────────────────────────┘
```

**Card 1: Course search**

- Icon: A 4×3 grid of small circles (3px) where the top row is Accent and the rest are Border color—representing filtered results rising to the top
- Label: "Course search"
- Copy: "Find courses by subject, credits, or prerequisites. Filter to exactly what fits your schedule."

**Card 2: Tuition lookup**

- Icon: A dollar sign centered in a thin circle (1.5px stroke, Accent)
- Label: "Tuition lookup"
- Copy: "Per-credit rates by program, student type, and cohort year. No more PDF hunting."

**Card 3: Campus routes**

- Icon: Two small circles (6px, filled Accent) connected by a gently curved line (1.5px, Accent)
- Label: "Campus routes"
- Copy: "Walking distance and time between any two buildings. See the route on a real map."

### Background Texture

The topographic line pattern in the hero and closing CTA sections:

- SVG-based, inline or as a CSS background
- Consists of concentric, organic curved lines (like contour lines on a topographic map)
- Stroke: Text Tertiary at 3-4% opacity (barely visible)
- Stroke-width: 1px
- Scale: Lines spaced ~60px apart
- Covers full section, no repeat seams
- Parallax: moves at 0.3x scroll speed (translateY driven by scroll position)
- Purpose: Subconsciously evokes "campus map" / "place" without being literal or distracting

### Radial Gradient (Hero + Closing CTA)

```css
background: radial-gradient(ellipse 60% 50% at 50% 45%, var(--color-accent-subtle) 0%, transparent 70%);
```

- Positioned slightly above center (45% from top)
- Elliptical, wider than tall
- Fades from Accent Subtle (#EEF4F7) to transparent
- Creates a soft halo/glow behind the headline
- In dark mode: same shape, from Accent Subtle dark (#1E2A30) to transparent

### Scroll Animations

All animations use Intersection Observer, trigger once, and respect `prefers-reduced-motion`.

| Element          | Trigger           | Animation                                            | Duration   | Easing                        |
| ---------------- | ----------------- | ---------------------------------------------------- | ---------- | ----------------------------- |
| Hero headline    | On load           | Fade in + translate 0 (starts visible, no animation) | —          | —                             |
| Scroll indicator | On load, 1s delay | Gentle bounce (translateY 0→6px→0)                   | 2s         | ease-in-out, infinite         |
| Product mock     | 20% in viewport   | Scale 0.96→1.0 + opacity 0→1                         | 600ms      | cubic-bezier(0.16, 1, 0.3, 1) |
| Feature card 1   | 20% in viewport   | translateY(24px)→0 + opacity 0→1                     | 500ms      | ease-out                      |
| Feature card 2   | 20% in viewport   | Same, 100ms delay                                    | 500ms      | ease-out                      |
| Feature card 3   | 20% in viewport   | Same, 200ms delay                                    | 500ms      | ease-out                      |
| Closing CTA glow | 30% in viewport   | Opacity pulse 0.03→0.06→0.03                         | 3s         | ease-in-out, once             |
| Hero parallax    | Scroll            | translateY(scrollY \* 0.3)                           | Continuous | linear                        |

**Reduced motion fallback:** All elements render at final state immediately. No transforms, no delays. Scroll indicator is static (no bounce).

### Wordmark

Text-only: "Reogent" (or chosen product name).

- Font: Aspekta
- Weight: 500
- Size: In hero context: part of the nav/header if one exists, or simply the headline carries the identity
- In the mock header: 14px, weight 500
- Color: Text Primary (#2D2D2D)
- Letter-spacing: -0.02em

### Navigation

The landing page has NO traditional navigation bar. The hero IS the first thing you see. However, if a minimal top bar is needed for the wordmark:

- Height: 64px
- Position: fixed, top 0
- Background: transparent → Background (on scroll, with 200ms transition)
- Content: Wordmark left, "Sign in" ghost button right
- Backdrop-filter: blur(8px) when scrolled (with bg at 80% opacity)
- Z-index: 40
- Border-bottom: appears (1px Border Subtle) only after scroll

### Sign-in Button (both instances)

Appears twice: hero and closing CTA.

- Height: 48px
- Max-width: 280px (hero), 320px (closing)
- Background: Accent (#7C9EB2)
- Text: White, 15px, weight 500
- Border-radius: 12px
- Icon: Google "G" multicolor logo (18px), left of text, 10px gap
- Hover: Accent Hover (#6A8A9E), scale 1.02, 150ms ease-out
- Active: Scale 0.98, 80ms
- Focus: 2px ring, Accent at 40% opacity, 3px offset
- Shadow: 0 2px 8px rgba(124, 158, 178, 0.2) — a tinted shadow matching accent

### States

| State                 | Behavior                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Default**           | Full page renders with scroll animations ready                                                                               |
| **Button hover**      | Scale 1.02, bg Accent Hover, tinted shadow intensifies. 150ms ease-out.                                                      |
| **Button active**     | Scale 0.98, 80ms.                                                                                                            |
| **Button loading**    | Text → "Signing in...", spinner (16px, white) replaces Google icon. Pointer-events: none.                                    |
| **Auth error**        | Toast appears top-center: "Couldn't sign in. Try again." (bg: Surface, border: 1px Error at 30%, shadow). Auto-dismisses 5s. |
| **Already signed in** | Immediate redirect to `/chat`. No flash of landing page.                                                                     |

### Responsive Behavior

| Breakpoint      | Adjustments                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **≥1280px**     | Full cinematic experience. Mock at 70vw. Cards in 3-col grid. All parallax active.                                                                                                            |
| **1024–1279px** | Mock at 80vw. Same layout otherwise.                                                                                                                                                          |
| **640–1023px**  | Hero headline: 44px. Mock at 90vw, perspective reduced to 1deg. Cards: 3-col still (tighter).                                                                                                 |
| **<640px**      | Hero headline: 36px. Mock: flat (no perspective), chat-only (no map inset), 95vw. Cards: stacked vertically. Trust strip wraps to 2 lines. Parallax disabled. Section padding: 64px vertical. |
| **<360px**      | Hero headline: 32px. Subline: 16px. Button: full width.                                                                                                                                       |

### Accessibility

- Skip link: "Skip to sign in" → focuses first CTA button
- Buttons: Semantic `<button>`, visible focus rings
- Product mock: `aria-hidden="true"` (decorative demonstration)
- Feature cards: Semantic headings (h3) within a section with h2
- Scroll animations: `prefers-reduced-motion` disables all transforms and parallax
- Color contrast: All text meets WCAG AA. Accent on white button text: verified 3:1+ for large text (15px weight 500 qualifies)
- Page title: "Reogent — AI for your campus"
- Background texture: purely decorative, no alt text needed
- Scroll indicator: `aria-hidden="true"`

### What makes this landing page work

It works because it shows the product being extraordinary without saying it is. The cinematic mock isn't a screenshot with a caption—it's the product itself, rendered at heroic scale, doing the exact thing a student needs. The 3D perspective gives it presence. The subtle parallax and scroll animations create a sense of craft and intentionality that says "someone cared about this."

The three-word headline ("Know your campus.") is confident because it's specific. It's not "AI-powered campus assistant" or "Your intelligent university companion." It's a statement about what YOU will gain. The subline immediately grounds it in specifics—courses, tuition, walking routes.

The rhythm works: big statement → proof at scale → three specifics → trust → close. Each section earns the next scroll. The page builds a case without ever feeling like it's selling. The muted palette keeps everything feeling premium—no bright colors screaming for attention, just confident steel blue and warm grays letting the content and composition do the work.

The background texture (topographic lines) is the single piece of visual poetry. It whispers "this is about a physical place" without ever being literal. It connects the digital product to the real campus it serves.

---

## Surface 2: Main App

**Route:** `/chat` (redirects to `/chat/[session_id]` on session create/select)  
**Mode:** Operate  
**Goal:** Student asks questions, gets grounded answers, sees routes on map.

### Design Vision

The main app embraces soft neumorphism—surfaces have gentle depth, elements feel tactile and pressable, and the interface invites touch. It's a workspace that feels physical despite being digital.

**The neumorphic philosophy:** Instead of flat cards with borders, surfaces float with soft shadows. The light source is top-left, creating highlight edges and shadow depths. Interactive elements respond to touch with shadow changes—buttons sink when pressed, inputs feel recessed. This isn't the heavy neumorphism of 2020; it's refined, subtle, and always in service of usability.

**Three panels on desktop.** The sidebar uses Surface Container Low (`#F4F3F5`) to feel slightly recessed—the filing cabinet built into the wall. The chat panel is a floating card with soft shadow, the primary workspace where conversation flows. The map panel is another floating card, a window into the physical campus that lights up when location becomes relevant.

**The surface hierarchy creates depth:**

- Background (`#F8F8F6`) is the deepest layer—the desk surface
- Surface Container Low (`#F4F3F5`) is recessed—the sidebar, input fields
- Surface (`#FAFAFA`) floats above—cards, panels, message bubbles
- Surface Bright (`#FFFFFF`) is highest—focused inputs, active states

**Typography remains restrained.** Aspekta at 14px for messages, weight 400 for body, weight 500 for emphasis. The neumorphic depth means type can stay quiet—hierarchy comes from elevation, not just size. Tool badges use JetBrains Mono for that data-terminal feel.

**The map panel is contained but alive.** Building markers are subtle until a route activates. The route line is dashed, in Primary color, with labeled endpoints. A floating info card shows duration and distance with a walking icon—glass-morphic, blurred backdrop, hovering over the map.

**Motion is tactile.** Buttons scale down (0.98) and shadow inverts when pressed. Cards lift slightly on hover. Messages slide up gently. The route draws as a dashed line. Everything responds to touch with physical metaphors.

**The vibe:** A well-designed physical planner—the kind with soft-touch covers and quality paper. Surfaces have just enough texture to feel real. You can almost feel the give when you press a button. It's productive and pleasant, never cold or clinical.

**What this IS:** Soft neumorphism applied thoughtfully. Depth through shadows. Tactile feedback. A surface hierarchy that creates spatial organization. Cards that float. Inputs that feel recessed. Buttons that respond.

**What this is NOT:** Heavy-handed neumorphism with aggressive shadows. It's not skeuomorphic—no fake leather or paper textures. It's not flat design either—there's real depth here. And it's not a dashboard—no metrics grids, no notification counts, no widgets.

### Layout: Desktop (≥1024px)

Three-column: Sidebar (280px fixed) + Main content area (Chat + Map side by side, equal flex).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Header (h: 56px, bg: Background, border-bottom: 1px Border Subtle)               │
│                                                                                  │
│  [≡]  UBC AI Assistant                    [🔔] [⚙️] [Avatar]                    │
│  (hamburger on mobile only)               (notifications, settings, user)        │
│  (Display size, Primary color, bold)                                             │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│ ┌────────────┐  ┌─────────────────────────────────────────────────────────────┐  │
│ │            │  │                                                             │  │
│ │  Sidebar   │  │              Main Content Area (gap: 12px)                  │  │
│ │  w: 280px  │  │                                                             │  │
│ │  bg: Surf  │  │  ┌─────────────────────────┐ ┌───────────────────────────┐  │  │
│ │  Cont Low  │  │  │                         │ │                           │  │  │
│ │            │  │  │     Chat Panel          │ │      Map Panel            │  │  │
│ │ ┌────────┐ │  │  │     (neumorphic card)   │ │      (neumorphic card)    │  │  │
│ │ │ [logo] │ │  │  │                         │ │                           │  │  │
│ │ │Sessions│ │  │  │  ┌───────────────────┐  │ │  ┌─────────────────────┐  │  │  │
│ │ └────────┘ │  │  │  │ Chat header       │  │ │  │ Route info overlay  │  │  │  │
│ │            │  │  │  ├───────────────────┤  │ │  └─────────────────────┘  │  │  │
│ │ [+ New   ] │  │  │  │                   │  │ │                           │  │  │
│ │            │  │  │  │ Messages          │  │ │      [Map tiles]          │  │  │
│ │ [Current ] │  │  │  │ (scrollable)      │  │ │      [Route line]         │  │  │
│ │ [History ] │  │  │  │                   │  │ │      [Markers]            │  │  │
│ │ [Map     ] │  │  │  │                   │  │ │                           │  │  │
│ │ [Courses ] │  │  │  ├───────────────────┤  │ │  ┌─────────────────────┐  │  │  │
│ │            │  │  │  │ Input area        │  │ │  │ Zoom controls       │  │  │  │
│ │ ─────────  │  │  │  │ (pill, recessed)  │  │ │  └─────────────────────┘  │  │  │
│ │ [Help    ] │  │  │  └───────────────────┘  │ └───────────────────────────┘  │  │
│ │ [Settings] │  │  │                         │                                │  │
│ │            │  │  └─────────────────────────┘                                │  │
│ └────────────┘  │                                                             │  │
│                 └─────────────────────────────────────────────────────────────┘  │
│  (sidebar has   (main content has padding: 12px, bg: Background)                 │
│   no shadow,                                                                     │
│   just border)                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Key layout details:**

- Sidebar: 280px, bg Surface Container Low, border-right, NO shadow (recessed feel)
- Main content: flex-1, padding 12px, bg Background
- Chat panel: flex-1, neumorphic card (shadow-sm, rounded-xl, border)
- Map panel: flex-1, neumorphic card (shadow-sm, rounded-xl, border)
- Gap between chat and map: 12px

### Layout: Tablet (640px–1023px)

Two-column: Chat + Map stacked or side-by-side. Sidebar as slide-over drawer.

```
┌──────────────────────────────────────────────────────────────────┐
│  [≡]  UBC AI Assistant                    [🔔] [Avatar]          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│  │                         │ │                                 │ │
│  │      Chat Panel         │ │         Map Panel               │ │
│  │      (flex: 1)          │ │         (flex: 1)               │ │
│  │                         │ │                                 │ │
│  └─────────────────────────┘ └─────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Hamburger opens sidebar drawer (280px, slides from left, scrim behind).

### Layout: Mobile (<640px)

Single column: Chat only. Map as bottom sheet when route exists.

```
┌─────────────────────────────────┐
│  [≡]  UBC AI Assistant  [User]  │  h: 56px
├─────────────────────────────────┤
│                                 │
│        Chat messages            │
│        (scrollable)             │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [📍 View route on map]    │  │  (appears when route exists)
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  [Input              ]    [↑]   │  sticky bottom, safe-area-inset
└─────────────────────────────────┘
```

"View route on map" button opens map as bottom sheet (80vh, drag to dismiss).

---

## Component Specifications

### Header

| Property   | Value                             |
| ---------- | --------------------------------- |
| Height     | 56px                              |
| Background | Surface                           |
| Border     | bottom 1px Border Subtle          |
| Padding    | 0 16px (mobile), 0 24px (desktop) |

**Contents:**

- **Left:** Hamburger (mobile/tablet only, 24px icon, Ghost button) + Wordmark (20px, weight 500)
- **Right:** User menu trigger (32px avatar or initials circle, Ghost button style)

**User menu dropdown:**

- Width: 200px
- Items: "Settings" (future), divider, "Sign out"
- Position: right-aligned, below trigger

### Sidebar

**The sidebar is recessed—it uses Surface Container Low to feel built into the wall.**

| Property   | Value                                       |
| ---------- | ------------------------------------------- |
| Width      | 280px                                       |
| Background | Surface Container Low (`#F4F3F5`)           |
| Border     | right 1px Border Subtle                     |
| Padding    | 16px vertical, 8px horizontal for nav items |
| Shadow     | None (recessed, not floating)               |

**Sidebar Header:**

```
┌────────────────────────────────────────┐
│  [40px circle]  Sessions               │
│  (Primary Cont   AI Assistant          │
│   bg, school     (Title / Body-sm)     │
│   icon)                                │
└────────────────────────────────────────┘
```

- Logo circle: 40px, bg Primary Container, icon 20px On Primary Container
- Title: "Sessions" in Title size (20px), Primary color
- Subtitle: "AI Assistant" in Body Small (13px), On Surface Variant

**New Conversation Button:**

- Full width (minus 16px margin), Primary style
- Height: 36px
- Icon: `add-line` (18px) + "New Conversation"
- Background: Primary (`#416375`)
- Text: On Primary (white)
- Shadow: `--shadow-glow`
- Hover: scale 1.02
- Active: scale 0.95, shadow-inset
- Margin: 8px horizontal, 8px bottom

**Navigation Items:**

The sidebar has navigation links, not just session history:

```
┌────────────────────────────────────────┐
│ [chat-fill]  Current Chat              │  ← Active (Accent Subtle bg, Primary text)
│ [history]    Academic History          │  ← Inactive (On Surface Variant text)
│ [map]        Campus Map                │
│ [book]       Course Resources          │
│                                        │
│ ─────────── (border-top) ──────────────│
│                                        │
│ [help]       Help                      │  ← Footer links
│ [settings]   Settings                  │
└────────────────────────────────────────┘
```

| Property         | Active                    | Inactive                         |
| ---------------- | ------------------------- | -------------------------------- |
| Background       | Accent Subtle (`#EEF4F7`) | Transparent                      |
| Text             | Primary (`#416375`)       | On Surface Variant (`#42484C`)   |
| Icon             | Filled variant, Primary   | Line variant, On Surface Variant |
| Height           | 36px                      | 36px                             |
| Padding          | 8px 12px                  | 8px 12px                         |
| Border-radius    | 8px                       | 8px                              |
| Hover (inactive) | Surface Container High bg | —                                |
| Margin           | 0 8px                     | 0 8px                            |

**Footer links:**

- Separated by border-top (1px Border Subtle) with 16px margin above
- Same styling as nav items

### Chat Panel

**The chat panel is a neumorphic card floating over the background.**

| Property      | Value               |
| ------------- | ------------------- |
| Background    | Surface (`#FAFAFA`) |
| Border        | 1px Border Subtle   |
| Border-radius | 12px                |
| Shadow        | `--shadow-sm`       |
| Overflow      | hidden              |

**Chat Header (inside the card):**

```
┌────────────────────────────────────────────────────────────────┐
│  Course Planning & Routing              [more options ⋮]       │
│  Active Session                                                │
└────────────────────────────────────────────────────────────────┘
```

- Background: Surface Bright (`#FFFFFF`)
- Border-bottom: 1px Border Subtle
- Padding: 12px 16px
- Title: Heading size (16px), On Surface
- Subtitle: Body Small (13px), On Surface Variant
- More button: Ghost, 20px icon

**Message container:**

- Background: inherits from panel (Surface)
- Padding: 16px
- Gap between messages: 24px (to accommodate avatars and meta)
- Scroll: overflow-y auto, scroll to bottom on new message

### Date Separator

Visual break between messages from different time periods:

```
                 Today, 10:42 AM
```

- Text: Caption (12px), On Surface Variant
- Background: Surface Container Low (pill)
- Border-radius: full
- Padding: 4px 12px
- Centered in message container
- Margin: 8px 0

### Message Bubble: User

| Property      | Value                     |
| ------------- | ------------------------- |
| Background    | Accent Subtle (`#EEF4F7`) |
| Text color    | On Surface                |
| Font          | Body (14px), weight 400   |
| Padding       | 12px 16px                 |
| Border-radius | 16px 16px 4px 16px        |
| Max-width     | 80%                       |
| Alignment     | right (margin-left: auto) |
| Shadow        | None                      |
| Border        | None                      |

**User attribution:**

- Below bubble, right-aligned
- Text: "You" in Caption (12px), Outline color
- Margin-top: 4px

### Message Bubble: Assistant

**Assistant messages have more structure—avatar, name, content blocks, tool badges, and quick actions.**

```
┌─ Avatar + Name ─────────────────────────────────────────────────┐
│  [24px avatar]  Reogent                                   │
│  (Primary Cont  (Caption, Outline)                              │
│   bg, robot                                                     │
│   icon 14px)                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Message content here. Can be multiple paragraphs.              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CPSC 310 Prerequisites:                                    ││ ← Structured
│  │  • One of CPSC 210, CPEN 221...                             ││   content block
│  │  • One of CPSC 213, CPEN 211...                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  More message text after the structured block.                  │
│                                                                 │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐│
│  │ 🔍 search_courses(...)   │ │ 📍 walking_distance(...)       ││ ← Tool badges
│  └──────────────────────────┘ └────────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Show on Map]  [Check my academic history]                     │ ← Quick actions
└─────────────────────────────────────────────────────────────────┘
```

**Bubble container:**

| Property      | Value                   |
| ------------- | ----------------------- |
| Background    | Surface (`#FAFAFA`)     |
| Border        | 1px Border Subtle       |
| Text color    | On Surface              |
| Font          | Body (14px), weight 400 |
| Padding       | 12px 16px               |
| Border-radius | 16px 16px 16px 4px      |
| Max-width     | 85%                     |
| Alignment     | left                    |

**Avatar + Name row:**

- Margin-bottom: 8px (before bubble)
- Avatar: 24px circle, Primary Container bg, `smart_toy` icon 14px
- Name: "Reogent" in Caption (12px), Outline color
- Gap: 8px between avatar and name

**Structured content block:**

- Background: Surface Container Low
- Border-radius: 8px
- Padding: 12px
- Margin: 8px 0
- Title: Heading (16px), On Surface, margin-bottom 4px
- List: Body Small (13px), On Surface Variant, disc bullets, 16px left padding

**Tool badges container:**

- Margin-top: 12px
- Display: flex, gap 8px, flex-wrap

### Tool Badge

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Background    | Surface Container Low                      |
| Border        | 1px Border Subtle                          |
| Text color    | On Surface Variant                         |
| Font          | Mono (Commit Mono), 12px                   |
| Padding       | 4px 8px                                    |
| Border-radius | 6px                                        |
| Icon          | 14px, On Surface Variant, margin-right 4px |

**Format:** `[icon] tool_name(param="value")`

**Tool icons (Mingcute):**
| Tool | Icon |
|------|------|
| search_courses | `search-line` |
| get_course | `book-2-line` |
| get_tuition | `currency-dollar-line` |
| walking_distance | `location-line` |

### Quick Action Pills

Suggested follow-ups below assistant messages:

| Property      | Value                      |
| ------------- | -------------------------- |
| Background    | Transparent                |
| Border        | 1px Primary                |
| Text color    | Primary                    |
| Font          | Caption (12px), weight 450 |
| Padding       | 6px 12px                   |
| Border-radius | full (pill)                |
| Hover         | bg Accent Subtle           |
| Active        | scale 0.95                 |

- Container: flex row, gap 8px, margin-top 8px
- Examples: "Show on Map", "Check my academic history"

### Chat Input Area

**The input is pill-shaped and feels recessed with an inset shadow.**

| Property             | Value             |
| -------------------- | ----------------- |
| Container bg         | Surface Bright    |
| Container border-top | 1px Border Subtle |
| Container padding    | 12px 16px         |

**Input field:**

```
┌──────────────────────────────────────────────────────────────┐
│  [📎]  Ask about courses, campus, or academic rules...  [↑]  │
└──────────────────────────────────────────────────────────────┘
```

| Property          | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Background        | Surface Container Low                                   |
| Border            | 1px Border Subtle                                       |
| Border-radius     | full (pill)                                             |
| Height            | 40px                                                    |
| Shadow            | `--shadow-inset` (recessed feel)                        |
| Padding           | 10px left (after attach btn), 44px right (for send btn) |
| Placeholder       | "Ask about courses, campus, or academic rules..."       |
| Placeholder color | Outline Variant                                         |
| Font              | Body (14px)                                             |
| Focus             | Remove inset shadow, border becomes Primary             |

**Attach button (left):**

- Position: absolute, left 8px, vertically centered
- Size: 32px touchable area
- Icon: `attachment-line`, 18px, Outline color
- Hover: Primary color

**Send button (right):**

- Position: absolute, right 4px, vertically centered
- Size: 32px × 32px
- Border-radius: full
- Background: Primary
- Icon: `arrow-up-line`, 18px, On Primary (white)
- Hover: Surface Tint, scale 1.05
- Active: scale 0.95
- Disabled (empty input): 50% opacity

**Disclaimer text:**

- Below input, centered
- Text: "AI can make mistakes. Verify important information."
- Font: Caption (12px), Outline Variant
- Margin-top: 8px

### Map Panel

**The map is a neumorphic card with floating glass-morphic overlays.**

| Property      | Value             |
| ------------- | ----------------- |
| Background    | (map tiles)       |
| Border        | 1px Border Subtle |
| Border-radius | 12px              |
| Shadow        | `--shadow-sm`     |
| Overflow      | hidden            |

**Map tiles:**

- Style: Light, desaturated (Carto Positron or custom style)
- Background pattern: Subtle dot grid at 3% opacity when no tiles loaded
- Buildings: Light rectangles with hairline borders

**Route styling:**

- Line: Primary color (`#416375`), 4-6px width
- Dash pattern: `12 8` (dashed line)
- Line cap: round
- Animation: Draw from origin to destination, 600ms ease-out

**Route markers:**

- Origin: 10px circle, Primary fill, 3px white stroke
- Destination: 12px circle, Primary fill, 3px white stroke, 4px white inner dot
- Labels: Aspekta 14px weight 600, On Primary Container, positioned offset from markers

**Route info card (floating, top-left):**

```
┌─────────────────────────────────────┐
│  [🚶 icon]   12 min                 │
│  (Secondary   950 m via Main Mall   │
│   Container                         │
│   bg)                               │
└─────────────────────────────────────┘
```

| Property        | Value                  |
| --------------- | ---------------------- |
| Background      | Surface at 90% opacity |
| Backdrop-filter | blur(8px)              |
| Border          | 1px Border Subtle      |
| Border-radius   | 8px                    |
| Shadow          | `--shadow-md`          |
| Padding         | 8px 12px               |

- Icon container: 32px, Secondary Container bg, `walk-line` icon 18px
- Duration: Heading (16px), On Surface
- Distance: Caption (12px), On Surface Variant

**Map control buttons (floating, top-right):**

- Stacked vertically, 8px gap
- Size: 40px × 40px each
- Background: Surface at 90% opacity + backdrop-blur
- Border: 1px Border Subtle
- Border-radius: 8px
- Shadow: `--shadow-sm`
- Icons: `layer-line`, `aim-line`, 20px, On Surface Variant
- Hover: icon becomes Primary

**Zoom controls (floating, bottom-right):**

- Combined button group (+ / -)
- Same glass-morphic styling
- Divider: 1px Border Subtle between buttons
- Icons: `add-line`, `minimize-line`

| Property   | Value                                   |
| ---------- | --------------------------------------- |
| Background | Surface                                 |
| Border-top | 1px Border Subtle                       |
| Padding    | 16px 24px (desktop), 12px 16px (mobile) |
| Position   | sticky bottom                           |

**Input field:**

- Textarea, auto-grows to max 4 lines
- Min-height: 44px
- Padding: 12px 16px
- Border: 1px Border, 2px Accent on focus
- Border-radius: 12px
- Placeholder: "Ask about courses, tuition, or campus..." (Text Tertiary)
- Font: Body (14px)

**Send button:**

- Position: absolute, right 8px, bottom 8px (inside input container)
- Size: 32px × 32px
- Border-radius: 8px
- Icon: `arrow-up` (18px)
- Default: Ghost style (icon Text Tertiary)
- With content: Primary style (bg Accent, icon white)
- Disabled: 50% opacity when input empty or request in flight

**Keyboard:**

- Enter: Send (if content exists)
- Shift+Enter: Newline
- Cmd/Ctrl+Enter: Always send

### Typing Indicator

Shown in assistant message position while waiting for response.

```
┌─────────────────────────────────┐
│  ●  ●  ●                        │
└─────────────────────────────────┘
```

- Three dots, 6px diameter each, 6px gap
- Color: Text Tertiary
- Animation: opacity pulse (0.4 → 1.0), staggered 150ms, 600ms cycle
- Container: same styling as assistant bubble, min-width 60px

### Empty State (No messages)

Centered in chat panel, vertically centered or 30% from top.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Icon: message-circle]                   │
│                        (48px, Text Tertiary)                │
│                                                             │
│                 "Ask me about UBC"                          │
│                 (Title, 20px, Text Primary)                 │
│                                                             │
│         "I can help with courses, prerequisites,            │
│          tuition costs, and walking routes                  │
│          between campus buildings."                         │
│         (Body, 14px, Text Secondary, max-w 280px)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Map Panel

| Property   | Value                            |
| ---------- | -------------------------------- |
| Background | (map tiles)                      |
| Border     | left 1px Border Subtle (desktop) |
| Min-width  | 400px (desktop)                  |

**Map configuration:**

- Provider: Carto Positron (light) / Carto Dark Matter (dark mode)
- Initial center: UBC campus (49.2606, -123.2460)
- Initial zoom: 15
- Min zoom: 13
- Max zoom: 18

**Building markers:**

- Shape: Circle, 8px diameter
- Fill: Accent at 60% opacity
- Stroke: Accent at 100%, 1.5px
- Hover: Scale to 10px, show tooltip

**Building tooltip:**

- Background: Surface Elevated
- Border: 1px Border
- Border-radius: 8px
- Padding: 8px 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Content: Building name (Heading, 14px) + code (Caption, 12px, Mono, Text Secondary)

**Route line:**

- Color: Accent
- Width: 4px
- Opacity: 80%
- Line cap: round
- Line join: round
- Animation: Draw from origin to destination, 500ms ease-out (respect reduced-motion)

**Route endpoints:**

- Origin: Circle marker with `◯` center
- Destination: Circle marker with pin icon or filled center
- Both: Accent color, 12px diameter, white center icon

**Map controls:**

- Position: bottom-right, 16px from edges
- Zoom in/out: Ghost buttons, 32px, stacked vertically
- No other controls visible

**Route info overlay (mobile bottom sheet header):**

```
┌─────────────────────────────────────────────┐
│  ═══  (drag handle, 32px wide, 4px tall)    │
│                                             │
│  ICCS → Buchanan Tower                      │
│  (Heading, 16px)                            │
│                                             │
│  450m · 6 min walk                          │
│  (Body, 14px, Text Secondary)               │
│                                             │
└─────────────────────────────────────────────┘
```

### User Menu Dropdown

| Property      | Value                       |
| ------------- | --------------------------- |
| Width         | 200px                       |
| Background    | Surface Elevated            |
| Border        | 1px Border                  |
| Border-radius | 12px                        |
| Shadow        | 0 4px 12px rgba(0,0,0,0.08) |
| Padding       | 8px                         |

**Menu items:**

- Height: 36px
- Padding: 8px 12px
- Border-radius: 6px
- Font: Body (14px)
- Hover: bg Accent Subtle
- Icon: 16px, margin-right 8px

**Items:**

1. User email (non-interactive, Text Secondary, truncate)
2. Divider (1px Border Subtle, margin 8px 0)
3. "Sign out" with `log-out` icon

### Sidebar Drawer (Mobile/Tablet)

| Property   | Value                          |
| ---------- | ------------------------------ |
| Width      | 280px                          |
| Background | Surface                        |
| Position   | fixed, left 0, top 0, bottom 0 |
| Transform  | translateX(-100%) when closed  |
| Transition | 250ms ease-out                 |
| Z-index    | 50                             |

**Scrim:**

- Background: rgba(0,0,0,0.3) (light) / rgba(0,0,0,0.5) (dark)
- Position: fixed, inset 0
- Z-index: 49
- Click to close

**Close behavior:**

- Click scrim
- Swipe left on drawer
- Press Escape

### Map Bottom Sheet (Mobile)

| Property      | Value                            |
| ------------- | -------------------------------- |
| Height        | 80vh                             |
| Background    | Surface                          |
| Border-radius | 16px 16px 0 0                    |
| Position      | fixed, bottom 0, left 0, right 0 |
| Transform     | translateY(100%) when closed     |
| Transition    | 300ms ease-out                   |
| Z-index       | 50                               |

**Drag handle:**

- Width: 32px, height: 4px
- Background: Border
- Border-radius: 2px
- Centered, margin-top 8px

**Dismiss:**

- Drag down past 20% threshold
- Tap scrim (same as sidebar)
- Press Escape

---

## Interaction Flows

### Flow 1: First Visit (Unauthenticated)

1. User lands on `/`
2. Sees landing page with sample conversation
3. Clicks "Sign in with Google"
4. Button shows loading state
5. Redirect to Cognito hosted UI → Google OAuth
6. On success: redirect to `/chat`
7. On error: return to `/` with error message

### Flow 2: Return Visit (Authenticated)

1. User lands on `/`
2. Valid session detected
3. Immediate redirect to `/chat` (or last active session)

### Flow 3: Send a Message

1. User types in input field
2. Send button activates (Primary style)
3. User presses Enter or clicks Send
4. Input clears, disabled state
5. User message appears in chat
6. Typing indicator appears
7. Response arrives:
   - Typing indicator removed
   - Assistant message appears with fade-in (200ms)
   - Tool badges shown if tools were used
   - If `walking_distance` was called: route renders on map
8. Input re-enables, focuses

### Flow 4: View Walking Route (Mobile)

1. User asks "How do I get from ICCS to Buchanan?"
2. Response includes walking_distance tool result
3. "View route on map" button appears below assistant message
4. User taps button
5. Map bottom sheet slides up
6. Route animates drawing
7. User can pan/zoom map
8. Drag down or tap scrim to dismiss

### Flow 5: Switch Sessions

1. User clicks session in sidebar (or opens drawer first on mobile)
2. Chat panel shows loading state briefly
3. Messages for selected session load
4. Scroll position: bottom
5. Map clears any previous route
6. Sidebar: new session highlighted

### Flow 6: Create New Session

1. User clicks "+ New chat"
2. New session created (API call)
3. Redirect to `/chat/[new_session_id]`
4. Chat shows empty state
5. Map shows default campus view

### Flow 7: Sign Out

1. User opens user menu
2. Clicks "Sign out"
3. Session cleared
4. Redirect to `/`

---

## Error States

### API Error (Chat)

Appears as system message in chat:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠ Couldn't get a response. Please try again.              │
│                                                             │
│  [Retry]                                                    │
└─────────────────────────────────────────────────────────────┘
```

- Background: Error at 10% opacity
- Border: 1px Error at 30% opacity
- Border-radius: 12px
- Text: Body, Text Primary
- Retry button: Secondary style, compact (32px)

### Session Load Error

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Icon: alert-circle] (48px, Error)             │
│                                                             │
│              "Couldn't load this conversation"              │
│              (Title, Text Primary)                          │
│                                                             │
│              [Try again]    [Start new chat]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Map Load Error

Map panel shows:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [Icon: map-off] (32px, Text Tertiary)          │
│                                                             │
│              "Map unavailable"                              │
│              (Body Small, Text Secondary)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Route info still shown in chat as text fallback:
"450 meters, about 6 minutes walking from ICCS to Buchanan Tower."

### Network Offline

Toast notification at top of viewport:

```
┌─────────────────────────────────────────────────────────────┐
│  ○ You're offline. Some features may not work.             │
└─────────────────────────────────────────────────────────────┘
```

- Background: Warning at 15% opacity
- Border: 1px Warning at 40% opacity
- Text: Body Small, Text Primary
- Position: fixed, top 16px, centered, max-width 400px
- Dismiss: auto-hide when online, or click ✕

---

## Accessibility Specifications

### Keyboard Navigation

| Context      | Key           | Action                      |
| ------------ | ------------- | --------------------------- |
| Global       | Tab           | Move focus forward          |
| Global       | Shift+Tab     | Move focus backward         |
| Global       | Escape        | Close modal/drawer/dropdown |
| Chat input   | Enter         | Send message                |
| Chat input   | Shift+Enter   | Insert newline              |
| Session list | Enter         | Select session              |
| Session list | Arrow Up/Down | Navigate sessions           |
| Dropdown     | Arrow Up/Down | Navigate items              |
| Dropdown     | Enter         | Select item                 |

### Focus Management

- On page load: focus chat input
- After sending message: return focus to input
- Opening drawer: focus first item (New chat button)
- Closing drawer: return focus to trigger (hamburger)
- Opening dropdown: focus first item
- Closing dropdown: return focus to trigger

### ARIA

**Chat messages:**

```html
<div role="log" aria-label="Conversation" aria-live="polite">
  <div role="listitem" aria-label="You said: ...">
    <div role="listitem" aria-label="Assistant said: ... Used tools: search_courses, get_course"></div>
  </div>
</div>
```

**Session list:**

```html
<nav aria-label="Chat sessions">
  <ul role="list">
    <li role="listitem" aria-current="true"><!-- current session --></li>
  </ul>
</nav>
```

**Map:**

```html
<div role="img" aria-label="Campus map showing route from ICCS to Buchanan Tower, 450 meters, 6 minute walk"></div>
```

**Loading states:**

```html
<div role="status" aria-live="polite" aria-label="Loading response"></div>
```

### Screen Reader Announcements

| Event             | Announcement                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| Message sent      | "Message sent"                                                              |
| Response received | "New response from assistant"                                               |
| Tool used         | Included in message: "Used search_courses tool"                             |
| Route displayed   | "Route displayed on map: [origin] to [destination], [distance], [duration]" |
| Error             | "Error: [message]"                                                          |
| Session switched  | "Loaded conversation: [title]"                                              |

### Reduced Motion

When `prefers-reduced-motion: reduce`:

- Message fade-in: instant (no transform)
- Route draw: instant (no animation)
- Drawer/sheet: instant (no slide)
- Typing indicator: static dots (no pulse)

---

## Responsive Breakpoints Summary

| Breakpoint          | Sidebar        | Chat            | Map                      | Input                        |
| ------------------- | -------------- | --------------- | ------------------------ | ---------------------------- |
| ≥1024px (Desktop)   | Visible, 280px | Flex, max 560px | Visible, flex-1          | Bottom of chat panel         |
| 640-1023px (Tablet) | Drawer         | Flex 1          | Flex 1, side-by-side     | Full width bottom            |
| <640px (Mobile)     | Drawer         | Full width      | Bottom sheet (on demand) | Full width bottom, safe-area |

---

## Animation Timing Summary

| Element                 | Duration | Easing      | Trigger             |
| ----------------------- | -------- | ----------- | ------------------- |
| Button hover            | 150ms    | ease-out    | Hover               |
| Message appear          | 200ms    | ease-out    | New message         |
| Drawer open/close       | 250ms    | ease-out    | Toggle              |
| Bottom sheet open/close | 300ms    | ease-out    | Toggle              |
| Route draw              | 500ms    | ease-out    | Route data received |
| Typing dots             | 600ms    | ease-in-out | Loop while loading  |
| Dropdown open           | 150ms    | ease-out    | Click trigger       |

---

## Data Contracts

### Session List Item

```typescript
{
  id: string;
  title: string; // First user message truncated, or "New conversation"
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  message_count: number;
}
```

### Message

```typescript
{
  id: string
  role: 'user' | 'assistant'
  content: string
  tools_used?: {
    name: string          // search_courses | get_course | get_tuition | walking_distance
    input: object
  }[]
  route?: {               // Only present when walking_distance was called
    from_building: string
    to_building: string
    distance_meters: number
    duration_minutes: number
    geojson: GeoJSON.LineString
  }
  created_at: string
}
```

### Building

```typescript
{
  code: string; // e.g., "ICCS"
  name: string; // e.g., "ICICS/CS Building"
  coordinates: [number, number]; // [lng, lat]
}
```

---

## Open Decisions (For Implementation)

1. **Product name/wordmark**: "Reogent" is placeholder
2. **Session grouping**: Spec uses Today/Yesterday/This week/This month/Older
3. **Map tile provider**: Carto Positron recommended, MapTiler or Stadia also acceptable
4. **Typing indicator**: Dots only (no "Assistant is typing..." text)
5. **Message timestamps**: Not shown by default; could add on hover or in message details
