# Nordic Calm - Complete Design System
> Version 1.0 - Theme 15 in the catalog - slug `nordic-calm`

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

**Design Language:** Nordic Calm
**Mode:** Light
**Typeface:** Manrope
**Personality:** Quiet cool grey-blue with hairline borders, generous space and a single muted blue accent in Manrope.
**Best Suited For:** Productivity tools, note and task apps, settings screens, documentation, calm dashboards

**Core Principles:**
- White space is the main decoration. Prefer more padding over more elements.
- Borders are 1px hairlines in pale blue-grey. Shadows are barely visible.
- One accent: muted blue (#3b6a88). Everything else is grey-blue neutral.
- Headings use light to medium weight (300 to 500). Bold is for tiny labels only.

---

## 2. CSS Custom Properties - Master Token Sheet

All tokens are scoped under `[data-ds="nordic-calm"]`. Nothing is defined at `:root`. The same sheet ships as `tokens.css` in this system's folder.

```css
/*
 * Nordic Calm - scoped design-system tokens (Theme 15 in catalog).
 */

[data-ds="nordic-calm"] {
  --ds-color-bg-base: #eef2f5;
  --ds-color-bg-surface: #ffffff;
  --ds-color-bg-sunken: #e4eaf0;
  --ds-color-bg-secondary: #f6f8fa;
  --ds-color-bg-overlay: rgba(39,50,61,0.35);

  --ds-color-primary: #3b6a88;
  --ds-color-primary-hover: #345d78;
  --ds-color-primary-active: #2e536a;
  --ds-color-primary-fg: #ffffff;

  --ds-color-text-primary: #27323d;
  --ds-color-text-secondary: #4a5a68;
  --ds-color-text-tertiary: #586876;
  --ds-color-text-muted: #586876;
  --ds-color-text-disabled: #9aa8b4;
  --ds-color-text-inverse: #ffffff;

  --ds-color-border-light: #dbe3ea;
  --ds-color-border-medium: #c5d0da;
  --ds-color-border-strong: #8fa1b1;

  --ds-color-success: #1b7441;
  --ds-color-success-bg: #d7f2e0;
  --ds-color-warning: #8a5700;
  --ds-color-warning-bg: #fff0cc;
  --ds-color-error: #c0262d;
  --ds-color-error-bg: #fde3e4;
  --ds-color-info: #1d5fbf;
  --ds-color-info-bg: #dce9fb;

  --ds-font-display: "Manrope", system-ui, sans-serif;
  --ds-font-body: "Manrope", system-ui, sans-serif;
  --ds-font-label: "Manrope", system-ui, sans-serif;
  --ds-label-transform: none;
  --ds-label-tracking: 0.02em;
  --ds-label-weight: 500;
  --ds-heading-tracking: -0.01em;
  --ds-heading-weight: 500;

  --ds-radius-badge: 999px;
  --ds-radius-sm: 6px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 10px;
  --ds-radius-xl: 16px;
  --ds-radius-full: 9999px;

  --ds-border-width: 1px;

  --ds-shadow-card: 0 1px 2px rgba(39,50,61,0.06);
  --ds-shadow-dropdown: 0 8px 24px rgba(39,50,61,0.10);
  --ds-shadow-modal: 0 20px 48px rgba(39,50,61,0.16);
  --ds-shadow-focus: 0 0 0 3px rgba(59,106,136,0.30);
  --ds-shadow-btn-hover: 0 2px 6px rgba(39,50,61,0.12);

  --ds-btn-text-transform: none;
  --ds-btn-letter-spacing: 0em;
  --ds-btn-font-weight: 500;
  --ds-btn-active-transform: translateY(1px);
  --ds-btn-secondary-bg: #dfeaf1;
  --ds-btn-secondary-text: #27323d;
  --ds-btn-secondary-border: #dfeaf1;
  --ds-btn-secondary-hover-bg: #c9d3d9;
  --ds-btn-outline-text: #27323d;
  --ds-btn-outline-border: #8fa1b1;
  --ds-btn-outline-hover-bg: #f6f8fa;
  --ds-btn-outline-hover-text: #27323d;

  --ds-table-header-bg: #e4eaf0;
  --ds-table-header-text: #27323d;
  --ds-table-header-border-bottom: 1px solid #c5d0da;
  --ds-table-container-radius: 10px;
  --ds-table-container-border: 1px solid #dbe3ea;

  --ds-focus-ring: 0 0 0 3px rgba(59,106,136,0.30);

  --ds-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ds-duration-fast: 120ms;
  --ds-duration-base: 200ms;
  --ds-duration-slow: 300ms;
}
```

---

## 3. Color Palette

### 3.1 Core Colors

| Role | Value |
|---|---|
| Page background | `#eef2f5` |
| Surface | `#ffffff` |
| Sunken | `#e4eaf0` |
| Secondary surface | `#f6f8fa` |
| Primary action | `#3b6a88` |
| Primary text on action | `#ffffff` |
| Accent / secondary button | `#dfeaf1` |
| Accent text | `#27323d` |
| Text primary | `#27323d` |
| Text secondary | `#4a5a68` |
| Text muted | `#586876` |
| Border light | `#dbe3ea` |
| Border strong | `#8fa1b1` |

### 3.2 Semantic Colors

| Status | Foreground | Background | Contrast |
|---|---|---|---|
| Success | `#1b7441` | `#d7f2e0` | 4.9:1 |
| Warning | `#8a5700` | `#fff0cc` | 5.4:1 |
| Error | `#c0262d` | `#fde3e4` | 4.9:1 |
| Info | `#1d5fbf` | `#dce9fb` | 5.0:1 |

### 3.3 Contrast Checks

All pairs below meet WCAG AA (4.5:1) for normal text.

| Pair | Colors | Ratio |
|---|---|---|
| Body text | `#27323d` on `#eef2f5` | 11.6:1 |
| Secondary text | `#4a5a68` on `#eef2f5` | 6.3:1 |
| Muted text | `#586876` on `#eef2f5` | 5.1:1 |
| Primary button label | `#ffffff` on `#3b6a88` | 5.8:1 |
| Accent button label | `#27323d` on `#dfeaf1` | 10.7:1 |
| Table header | `#27323d` on `#e4eaf0` | 10.8:1 |

---

## 4. Typography System

### 4.1 Font Families

| Role | Family | Usage |
|---|---|---|
| Display | Manrope | Headings, hero titles |
| Body | Manrope | Body copy, buttons, form fields |
| Label | Manrope | Labels, eyebrows, metadata |

### 4.2 Type Scale

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 48-64px | 500 | -0.01em | Hero title |
| H1 | 36px | 500 | -0.01em | Page title |
| H2 | 28px | 500 | -0.01em | Section title |
| H3 | 20px | 500 | -0.01em | Card title |
| Body | 16px | 400 | 0 | Paragraphs |
| Label | 12px | 500 | 0.02em | Eyebrows, badges (none) |

### 4.3 Google Fonts Import Block

```css
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;700&display=swap");
```

The same URL is loaded by `app/design-systems/fonts.ts`.

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

Component padding: card 20px, button 10px 20px (md), input 10px 14px, badge 2px 10px.

---

## 6. Border Radius System

| Element | Radius |
|---|---|
| Badge | 999px |
| Small controls (checkbox) | 6px |
| Buttons, inputs | 8px |
| Cards, modals | 10px |
| Large panels | 16px |
| Avatars, switches | 9999px |

Border width: 1px.

---

## 7. Shadow & Elevation System

| Level | Value |
|---|---|
| Card | `0 1px 2px rgba(39,50,61,0.06)` |
| Dropdown | `0 8px 24px rgba(39,50,61,0.10)` |
| Modal | `0 20px 48px rgba(39,50,61,0.16)` |
| Focus | `0 0 0 3px rgba(59,106,136,0.30)` |
| Button hover | `0 2px 6px rgba(39,50,61,0.12)` |

---

## 8. Component Specifications

### 8.1 Buttons
- Primary: background `--ds-color-primary`, label `--ds-color-primary-fg`. Hover `#345d78`, active `#2e536a`.
- Secondary: background `#dfeaf1`, label `#27323d`.
- Outline: transparent, border `#8fa1b1`, label `#27323d`.
- Label style: `none` text, weight 500, tracking 0em.
- Active (pressed): `transform: translateY(1px)`.

### 8.2 Form Inputs
Surface background, 1px border `#c5d0da`, radius 8px. Focus uses the focus shadow. Error border `#c0262d`.

### 8.3 Labels
Font Manrope, none, weight 500, tracking 0.02em, colour `#586876`.

### 8.4 Card / Surface
Background `#ffffff`, border 1px `#dbe3ea`, radius 10px, shadow card.

### 8.5 Badge
Pill or 999px radius, label style, semantic backgrounds from section 3.2.

### 8.6 Checkbox, Radio and Switch
Checked fill `#3b6a88`, mark `#ffffff`. Switch track uses border strong when off.

### 8.7 Table
Header background `#e4eaf0`, header text `#27323d`. Container border `1px solid #dbe3ea`, radius 10px.

### 8.8 Dropdown Panel
Surface background, border 1px `#c5d0da`, dropdown shadow, item hover uses `#f6f8fa`.

---

## 9. Layout & Grid System

| Container | Max width |
|---|---|
| Narrow (forms, articles) | 640px |
| Default | 1040px |
| Wide (dashboards) | 1280px |

12-column grid, 24px gutters on desktop, 16px on mobile.

---

## 10. Animation & Transition Tokens

| Token | Value |
|---|---|
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Fast | 120ms |
| Base | 200ms |
| Slow | 300ms |

Animate colour, transform, opacity and shadow only. Never animate layout properties.

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

## 12. Breakpoints

| Name | Min width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

Page padding: 16px below md, 24px at md, 32px at lg and up.

---

## 13. Icon System

Use Lucide icons at 16, 20 or 24px, stroke 2px (1.5px for Nordic Calm if the type is light). Icon colour follows text colour. Never use filled multi-colour icons.

---

## 14. State Definitions

| State | Treatment |
|---|---|
| Hover | Darker or lighter primary (see 8.1), shadow `0 2px 6px rgba(39,50,61,0.12)` |
| Active | `translateY(1px)` |
| Focus | `0 0 0 3px rgba(59,106,136,0.30)` |
| Disabled | Text `#9aa8b4`, no shadow, cursor not-allowed |
| Error | Border `#c0262d`, message in the same colour |
| Success | Border `#1b7441` |
