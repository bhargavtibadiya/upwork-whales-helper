# Risograph Print - Complete Design System
> Version 1.0 - Theme 25 in the catalog - slug `risograph-print`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [CSS Custom Properties - Master Token Sheet](#2-css-custom-properties--master-token-sheet)
3. [Color Palette](#3-color-palette)
4. [Typography System](#4-typography-system)
5. [Spacing System](#5-spacing-system)
6. [Border Radius System](#6-border-radius-system)
7. [Shadow & Elevation System](#7-shadow--elevation-system)
8. [Component Specifications](#8-component-specifications)
9. [Layout & Grid System](#9-layout--grid-system)
10. [Animation & Transition Tokens](#10-animation--transition-tokens)
11. [Z-Index System](#11-z-index-system)
12. [Breakpoints](#12-breakpoints)
13. [Icon System](#13-icon-system)
14. [State Definitions](#14-state-definitions)

---

## 1. System Overview

**Design Language:** Risograph Print
**Mode:** Light
**Typefaces:** Space Grotesk + Work Sans
**Personality:** Riso duplicator output: warm paper, ink blue and fluorescent pink drums, visible misregistration and grain.
**Best Suited For:** Indie publishers, art prints, creative studio sites, event programmes, small-press shops

**Core Principles:**
- Two inks only: blue and pink over warm paper.
- Misregistration is a feature: offsets sit a few pixels off.
- No solid black; the deepest tone is the blue drum.
- Space Grotesk headlines, Work Sans body.

---

## 2. CSS Custom Properties - Master Token Sheet

All tokens are scoped under `[data-ds="risograph-print"]`. Nothing is defined at `:root`. The same sheet ships as `tokens.css` in this system's folder.

```css
/*
 * Risograph Print - scoped design-system tokens (Theme 25 in catalog).
 * Two-color overprint, visible grain. Space Grotesk + Work Sans.
 */

[data-ds="risograph-print"] {
  --ds-color-bg-base: #f4f1ea;
  --ds-color-bg-surface: #fbf9f3;
  --ds-color-bg-sunken: #e9e5da;
  --ds-color-bg-secondary: #e9e5da;
  --ds-color-bg-overlay: rgba(29,29,27,0.5);

  --ds-color-primary: #ff48b0;
  --ds-color-primary-hover: #f2359f;
  --ds-color-primary-active: #d92a8d;
  --ds-color-primary-fg: #1d1d1b;

  --ds-color-text-primary: #1d1d1b;
  --ds-color-text-secondary: #3c3c38;
  --ds-color-text-tertiary: #4d4d47;
  --ds-color-text-muted: #5f5f56;
  --ds-color-text-disabled: #9a998c;
  --ds-color-text-inverse: #fbf9f3;

  --ds-color-border-light: #1d1d1b;
  --ds-color-border-medium: #1d1d1b;
  --ds-color-border-strong: #1d1d1b;

  --ds-color-success: #1b7441;
  --ds-color-success-bg: #d7f2e0;
  --ds-color-warning: #8a5700;
  --ds-color-warning-bg: #fff0cc;
  --ds-color-error: #c0262d;
  --ds-color-error-bg: #fde3e4;
  --ds-color-info: #005a8f;
  --ds-color-info-bg: #d8ecfa;

  --ds-font-display: "Space Grotesk", system-ui, sans-serif;
  --ds-font-body: "Work Sans", system-ui, sans-serif;
  --ds-font-label: "Work Sans", system-ui, sans-serif;
  --ds-label-transform: none;
  --ds-label-tracking: 0.01em;
  --ds-label-weight: 700;
  --ds-heading-tracking: -0.01em;
  --ds-heading-weight: 700;

  --ds-radius-badge: 2px;
  --ds-radius-sm: 2px;
  --ds-radius-md: 2px;
  --ds-radius-lg: 2px;
  --ds-radius-xl: 4px;
  --ds-radius-full: 9999px;

  --ds-border-width: 2px;

  /* Misregistration is allowed: shadows offset in the second ink. */
  --ds-shadow-card: 6px 6px 0 #0078bf;
  --ds-shadow-dropdown: 4px 4px 0 #ff48b0;
  --ds-shadow-modal: 8px 8px 0 #0078bf;
  --ds-shadow-focus: 3px 3px 0 #0078bf;
  --ds-shadow-btn-hover: 4px 4px 0 #0078bf;

  --ds-btn-text-transform: none;
  --ds-btn-letter-spacing: 0.01em;
  --ds-btn-font-weight: 700;
  --ds-btn-active-transform: translate(3px, 3px);
  --ds-btn-secondary-bg: #0078bf;
  --ds-btn-secondary-text: #fbf9f3;
  --ds-btn-secondary-border: #1d1d1b;
  --ds-btn-secondary-hover-bg: #006aa8;
  --ds-btn-outline-text: #1d1d1b;
  --ds-btn-outline-border: #1d1d1b;
  --ds-btn-outline-hover-bg: #e9e5da;
  --ds-btn-outline-hover-text: #1d1d1b;

  --ds-table-header-bg: #ff48b0;
  --ds-table-header-text: #1d1d1b;
  --ds-table-header-border-bottom: 2px solid #1d1d1b;
  --ds-table-container-radius: 2px;
  --ds-table-container-border: 2px solid #1d1d1b;

  --ds-focus-ring: 3px 3px 0 #0078bf;

  --ds-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ds-duration-fast: 0ms;
  --ds-duration-base: 120ms;
  --ds-duration-slow: 200ms;
}

/* Flat color only - gradients break the print illusion. Pressed buttons lose the misregistration. */
[data-ds="risograph-print"] .ds-btn:active:not(:disabled) { box-shadow: 0 0 0 #1d1d1b; }
```

---

## 3. Color Palette

### 3.1 Core Colors

|Role|Token|Value|Usage|
|---|---|---|---|
|bg-base|`--ds-color-bg-base`|`#f4f1ea`|Warm paper|
|bg-surface|`--ds-color-bg-surface`|`#fbf9f3`|Cards and panels|
|bg-sunken|`--ds-color-bg-sunken`|`#e9e5da`|Inputs, wells|
|primary|`--ds-color-primary`|`#ff48b0`|Blue drum action|
|secondary-bg|`--ds-btn-secondary-bg`|`#0078bf`|Pink drum secondary|
|text-primary|`--ds-color-text-primary`|`#1d1d1b`|Blue ink text|
|text-secondary|`--ds-color-text-secondary`|`#3c3c38`|Supporting ink|

### 3.2 Semantic Colors

|State|Token|Ink|Background|
|---|---|---|---|
|success|`--ds-color-success`|`#1b7441`|`#d7f2e0`|
|warning|`--ds-color-warning`|`#8a5700`|`#fff0cc`|
|error|`--ds-color-error`|`#c0262d`|`#fde3e4`|
|info|`--ds-color-info`|`#005a8f`|`#d8ecfa`|

### 3.3 Contrast Checks

- Body text `#1e2b6b` on paper `#fdf8ee`: 10.8:1.
- Pink `#ff5c8a` is a fill with paper or blue foregrounds, never body text on paper.
- Overprints (blue over pink) pass as decorative shapes; text never sits on the overlap.

---

## 4. Typography System

### 4.1 Font Families

|Role|Family|Usage|
|---|---|---|
|Display|Space Grotesk|Headings, hero titles|
|Body|Work Sans|Body copy, form fields|
|Label|Work Sans|Buttons, badges, labels|

### 4.2 Type Scale


| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 48-64px | 400 | 0 | Hero title |
| H1 | 36px | 400 | 0 | Page title |
| H2 | 28px | 400 | 0 | Section title |
| H3 | 20px | 400 | 0 | Card title |
| Body | 16px | 400 | 0 | Paragraphs |
| Label | 13px | 700 | 0.01em | Buttons, badges |

Lilita One ships in a single weight (400). Its drawn strokes are already heavy - never synthesise a bolder weight.

### 4.3 Google Fonts Import Block

Fonts load through the shared `DESIGN_SYSTEM_FONTS_URL` in `app/design-systems/fonts.ts`. Never `@import` a remote font URL from CSS; the production bundler drops it.

---

## 5. Spacing System


Base unit: 4px. Use only these steps.

| Token | Value |
|---|---|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |
| space-16 | 64px |

Component padding: card 22px, button 11px 22px (md), input 11px 14px, badge 3px 12px.

---

---

## 6. Border Radius System

|Token|Value|
|---|---|
|badge|`2px`|
|sm|`2px`|
|md|`2px`|
|lg|`2px`|
|xl|`4px`|
|full|`9999px`|

Small 6px corners, like trimmed prints; badges may round fully.

---

## 7. Shadow & Elevation System

|Token|Value|
|---|---|
|card|`6px 6px 0 #0078bf`|
|dropdown|`4px 4px 0 #ff48b0`|
|modal|`8px 8px 0 #0078bf`|
|focus|`3px 3px 0 #0078bf`|
|btn-hover|`4px 4px 0 #0078bf`|

---

## 8. Component Specifications

### 8.1 Buttons

Blue drum fill with a 2px pink offset ghost behind it; active state closes the registration gap.

### 8.2 Form Inputs

Paper fields with a blue 2px border; focus ring is pink at 45% alpha.

### 8.3 Labels

Work Sans 600, sentence case, blue ink.

### 8.4 Card / Surface

Paper panel with a 2px blue border and a pink offset shadow, 6px corners.

### 8.5 Badge

Pink fill, blue text or inverse, 2px blue border.

### 8.6 Checkbox, Radio and Switch

Blue box, pink tick; the tick sits 1px off-register.

### 8.7 Table

Header row is the blue drum with paper text; container border 2px blue.

### 8.8 Dropdown Panel

Paper panel, 2px blue border, pink offset shadow.

---

## 9. Layout & Grid System


| Container | Max width |
|---|---|
| Narrow (forms, articles) | 640px |
| Default | 1040px |
| Wide (dashboards) | 1280px |

12-column grid, 24px gutters on desktop, 16px on mobile.

---

---

## 10. Animation & Transition Tokens


| Token | Value |
|---|---|
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Fast | 0ms |
| Base | 120ms |
| Slow | 200ms |

Animate colour, transform, opacity and shadow only. Never animate layout properties.

---

---

## 11. Z-Index System


| Layer | Value |
|---|---|
| Base | 0 |
| Sticky header | 10 |
| Dropdown | 20 |
| Modal backdrop | 40 |
| Modal | 50 |
| Toast | 60 |

---

---

## 12. Breakpoints


| Name | Min width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

Page padding: 16px below md, 24px at md, 32px at lg and up.

---

---

## 13. Icon System

Icons use 2px strokes; duotone pairs render the same icon offset in blue and pink. Sizes follow the shared scale: 16px inline, 20px in buttons, 24px standalone.

---

## 14. State Definitions

- Hover uses the `--ds-color-primary-hover` and `--ds-shadow-btn-hover` tokens.
- Active applies `--ds-btn-active-transform` and the `--ds-color-primary-active` tone.
- Focus always renders `--ds-focus-ring`; never remove it without a visible replacement.
- Disabled drops to 50% opacity with `not-allowed` cursor and no shadow.
