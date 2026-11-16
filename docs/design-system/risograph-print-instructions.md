# Risograph Print - Construction Instructions & AI Prompting Guide
> Version 1.0 - Theme 25 in the catalog - slug `risograph-print`

---

## Table of Contents

1. [Design Philosophy & Core Rules](#1-design-philosophy--core-rules)
2. [Font Law](#2-font-law)
3. [Color Application Rules](#3-color-application-rules)
4. [Border Radius Decision Framework](#4-border-radius-decision-framework)
5. [Shadow & Elevation Rules](#5-shadow--elevation-rules)
6. [Component Construction Guides](#6-component-construction-guides)
7. [Interactive States](#7-interactive-states)
8. [Layout Rules](#8-layout-rules)
9. [Anti-Patterns](#9-anti-patterns)
10. [AI Prompting Guide](#10-ai-prompting-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)

---

## 1. Design Philosophy & Core Rules

Riso duplicator output: warm paper, ink blue and fluorescent pink drums, visible misregistration and grain.

### The Rules
1. Two inks only: blue and pink over warm paper.
2. Misregistration is a feature: offsets sit a few pixels off.
3. No solid black; the deepest tone is the blue drum.
4. Space Grotesk headlines, Work Sans body.
5. Grain and overprint textures stay on heroes and dividers, never under text.

---

## 2. Font Law

Use only Space Grotesk and Work Sans. Fallback stacks end in `system-ui, sans-serif`.

- Display and headings: Space Grotesk, per the type scale in the design-system doc.
- Body: Work Sans.
- Labels, buttons and badges: Work Sans.
- Never mix in a font from another system. If a glyph is missing, fall back, do not swap families.

---

## 3. Color Application Rules

|Use|Token|Value|
|---|---|---|
|Warm paper|`--ds-color-bg-base`|`#f4f1ea`|
|Cards and panels|`--ds-color-bg-surface`|`#fbf9f3`|
|Inputs, wells|`--ds-color-bg-sunken`|`#e9e5da`|
|Blue drum action|`--ds-color-primary`|`#ff48b0`|
|Pink drum secondary|`--ds-btn-secondary-bg`|`#0078bf`|
|Blue ink text|`--ds-color-text-primary`|`#1d1d1b`|
|Supporting ink|`--ds-color-text-secondary`|`#3c3c38`|

- Body text `#1e2b6b` on paper `#fdf8ee`: 10.8:1.
- Pink `#ff5c8a` is a fill with paper or blue foregrounds, never body text on paper.
- Overprints (blue over pink) pass as decorative shapes; text never sits on the overlap.
- Never type a raw hex or font name in a component. Read the token.

---

## 4. Border Radius Decision Framework

- `--ds-radius-badge` = `2px`
- `--ds-radius-sm` = `2px`
- `--ds-radius-md` = `2px`
- `--ds-radius-lg` = `2px`
- `--ds-radius-xl` = `4px`
- `--ds-radius-full` = `9999px`

Small 6px corners, like trimmed prints; badges may round fully.

---

## 5. Shadow & Elevation Rules

- `--ds-shadow-card` = `6px 6px 0 #0078bf`
- `--ds-shadow-dropdown` = `4px 4px 0 #ff48b0`
- `--ds-shadow-modal` = `8px 8px 0 #0078bf`
- `--ds-shadow-focus` = `3px 3px 0 #0078bf`
- `--ds-shadow-btn-hover` = `4px 4px 0 #0078bf`

---

## 6. Component Construction Guides

- **Buttons:** Blue drum fill with a 2px pink offset ghost behind it; active state closes the registration gap.
- **Inputs:** Paper fields with a blue 2px border; focus ring is pink at 45% alpha.
- **Cards:** Paper panel with a 2px blue border and a pink offset shadow, 6px corners.
- **Badges:** Pink fill, blue text or inverse, 2px blue border.
- **Tables:** Header row is the blue drum with paper text; container border 2px blue.

---

## 7. Interactive States

- Hover: `--ds-color-primary-hover` fill plus `--ds-shadow-btn-hover`.
- Active: `--ds-btn-active-transform` with the active tone.
- Focus: always `--ds-focus-ring`, visible on every interactive element.
- Disabled: 50% opacity, no shadow, `not-allowed` cursor.

---

## 8. Layout Rules


- Max content width 1040px, 24px gutters.
- Stack to one column below 768px.
- Keep one primary action per section and align it to the same edge as the heading.

---

---

## 9. Anti-Patterns

- Pure black anywhere. The blue drum is the darkest ink.
- Perfect registration. Offsets are the point.
- A third ink colour. Two drums, no more.
- Pink body text on paper. Pink is a fill.
- Glossy or blurred shadows. Riso is matte ink on tooth.
- Thin hairline borders. Riso lines are 2px minimum.

---

## 10. AI Prompting Guide

Ask for the system by name and slug, then state the surfaces you need. The tokens do the rest.

> Build a product page in the Risograph Print system: warm paper background, ink-blue Space Grotesk hero, fluorescent pink badge row, blue primary button with a pink offset ghost, 2px blue borders, Work Sans body.

Always reference tokens (`--ds-*`) in generated code, never raw values. Keep overrides scoped under `[data-ds="risograph-print"]`.

---

## 11. Pre-Ship Checklist

- [ ] Every colour, font, radius and shadow reads from a `--ds-*` token.
- [ ] Overrides are scoped under `[data-ds="risograph-print"]` only.
- [ ] Fonts load via `DESIGN_SYSTEM_FONTS_URL`, not a CSS `@import`.
- [ ] Text contrast passes 4.5:1 (checked in section 3.3 of the design-system doc).
- [ ] Focus rings visible on every interactive element.
- [ ] Two inks only: blue and pink over warm paper.
- [ ] Misregistration is a feature: offsets sit a few pixels off.
- [ ] Cards, tables and bento containers render without clipped corners.
- [ ] Build, lint, typecheck and `verify:seo` pass.
