# Plan - Upwork Whales Helper

Status: docs foundation (2026-11-16). Implementation has not started.

## Goal

Our own image editor for Upwork profile assets, with more personalization and editing freedom than the reference tool, and the ability to create multiple images efficiently.

## Reference analysis (what we are improving on)

The reference tool (Upwork Whales thumbnail maker) is a single self-contained client-side page that draws thumbnails on an HTML canvas. Observed capabilities and limits:

- 3 modes: ringed profile picture (1000x1000), portfolio thumbnail (1000x750 or 1280x720), intro-video thumbnail (1280x720)
- 8 fixed layouts, 4 color themes, 2 fonts (Anton, Montserrat)
- Preset text slots only; photo upload with zoom/position only
- No free dragging of elements, no per-element typography or color controls
- No background removal (warns if the photo is not already a transparent PNG)
- No batch or multi-image workflow - one PNG at a time
- No backend; no open-source license found, so we reimplement with original code and assets

## v1 scope (approved direction, to be confirmed against this plan)

- Next.js 16 + TypeScript 7 + Tailwind v4, App Router, no backend
- Canvas editor covering the same three output modes and sizes
- Movable text and image elements (drag to position)
- Per-element font, size, color and style controls
- More layouts than the reference, built as original designs
- Reusable brand presets (save/load a named set of colors, fonts, defaults)
- Batch export: configure once, export multiple PNGs
- All state local (browser); no uploads

## Later (not v1)

- Client-side background removal (evaluate libraries before committing)
- Template gallery, sharing presets as files
- Deployment (owner approval required before anything is deployed)

## Working agreements

- `main` = stable baseline, `DEV` = active development branch
- Coding standards: `docs/rules/` (TypeScript, folder structure, comments, commits, tests)
- Commits authored as `bhargavtibadiya <bhargavptibadiya.tbp@gmail.com>`
