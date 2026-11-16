# Nordic Calm - Construction Instructions & AI Prompting Guide
> Version 1.0 - Theme 15 in the catalog - slug `nordic-calm`

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

Quiet cool grey-blue with hairline borders, generous space and a single muted blue accent in Manrope.

### The Rules
1. White space is the main decoration. Prefer more padding over more elements.
2. Borders are 1px hairlines in pale blue-grey. Shadows are barely visible.
3. One accent: muted blue (#3b6a88). Everything else is grey-blue neutral.
4. Headings use light to medium weight (300 to 500). Bold is for tiny labels only.

---

## 2. Font Law

Use only Manrope. Fallback stack ends in `system-ui, sans-serif`.

- Display and headings: Manrope, weight 500, tracking -0.01em.
- Body: Manrope.
- Labels: Manrope, none, weight 500.
- Never mix in a font from another system. If a glyph is missing, fall back, do not swap families.

---

## 3. Color Application Rules

| Use | Token | Value |
|---|---|---|
| Page | `--ds-color-bg-base` | `#eef2f5` |
| Cards | `--ds-color-bg-surface` | `#ffffff` |
| Inputs, wells | `--ds-color-bg-sunken` | `#e4eaf0` |
| Main action | `--ds-color-primary` | `#3b6a88` |
| Secondary action | `--ds-btn-secondary-bg` | `#dfeaf1` |
| Body text | `--ds-color-text-primary` | `#27323d` |
| Supporting text | `--ds-color-text-secondary` | `#4a5a68` |

- One main action per view.
- Never type a raw hex or font name in a component. Read the token.
- Semantic colours (success, warning, error, info) are for status only.

---

## 4. Border Radius Decision Framework

- Badge or chip: 999px.
- Button or input: 8px.
- Card or modal: 10px.
- Anything else: use the nearest token. Never invent a radius.

---

## 5. Shadow & Elevation Rules

- Cards: `0 1px 2px rgba(39,50,61,0.06)`.
- Dropdowns: `0 8px 24px rgba(39,50,61,0.10)`.
- Modals: `0 20px 48px rgba(39,50,61,0.16)`.
- Focus: `0 0 0 3px rgba(59,106,136,0.30)`.
- Do not mix shadow styles from other systems.

---

## 6. Component Construction Guides

**Card:** surface background, 1px border `#dbe3ea`, radius 10px, card shadow, padding 24px.

**Button:** pick one variant. Label style `none`, weight 500. Pressed state is `translateY(1px)`.

**Badge:** label style, semantic background, no shadow.

**Table:** header uses `#e4eaf0` with `#27323d` text. Rows separated by border light.

**Form field:** label above, helper text below in muted colour, error replaces helper text.

---

## 7. Interactive States

| State | Rule |
|---|---|
| Hover | Primary darkens or lightens one step. Shadow `0 2px 6px rgba(39,50,61,0.12)` |
| Active | `translateY(1px)` |
| Focus | `0 0 0 3px rgba(59,106,136,0.30)`, always visible |
| Disabled | Text `#9aa8b4`, no hover |

---

## 8. Layout Rules

- Max content width 1040px, 24px gutters.
- Stack to one column below 768px.
- Keep one primary action per section and align it to the same edge as the heading.

---

## 9. Anti-Patterns

- Do not use saturated colours or gradients.
- Do not use borders thicker than 1px.
- Do not use more than one filled button per section.
- Do not hard-code colours, fonts, radii or shadows in components.
- Do not define tokens at `:root`. Everything stays under `[data-ds="nordic-calm"]`.
- Do not mix components from other design systems on the same page.

---

## 10. AI Prompting Guide

Paste this at the start of a chat:

> Build the UI with the Nordic Calm design system. Read `design-system.md` and `instructions.md` first. Use only the `--ds-*` tokens under `[data-ds="nordic-calm"]`. Fonts: Manrope. Follow every rule in section 1 of instructions.md. Do not add styles that are not in the token sheet. When unsure, ask before inventing.

Good follow-up prompts:
- "Add a pricing section using only Nordic Calm tokens."
- "Check this page against the Nordic Calm anti-pattern list and fix violations."

---

## 11. Pre-Ship Checklist

- [ ] All colours, fonts, radii and shadows come from tokens
- [ ] One main action per view
- [ ] Text contrast is 4.5:1 or better
- [ ] Focus state is visible on every interactive element
- [ ] No rule from section 9 is broken
- [ ] Wrapped in `data-ds="nordic-calm"`
