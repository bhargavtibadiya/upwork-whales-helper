# November 17 design rebuild

Rebuild of the added portfolio and intro compositions, approved for live testing on November 17.

## Changes

- Compact heading groups, consistent insets, proportional portrait crops and centered metrics.
- Small play overlays by default. Optional text labels and arrows stay over the media, never in a separate row.
- Screenshot framing, portrait shapes and clean/glow backgrounds replace sparkle/star/frame decorations.
- Original Face + big stat and Client results compositions remain selectable alongside reworked versions. All three stats render in both originals.
- Selected icons render in Title + skills. Five service items remain supported.
- Ten portfolio layouts, ten intro layouts, eight themes, four font settings, crop controls, profile controls and export sizes preserved.

## Verification

TypeScript, Biome, production build and 16 unit tests passed. Local production checks passed: 170 responsive-layout checks, 120 features/font/download checks, 77 interaction/export checks, 50 original-variant/overlay/icon/mobile checks. Render matrices covered 3,264 and 5,760 cases with no out-of-canvas text warnings. Actual preview pixels were inspected for the full sets and larger details. Bounds tests do not prove aesthetic quality.

The demo portrait and sample dashboard shown in the review images are not shipped app content. The portrait source is https://unsplash.com/photos/man-in-white-crew-neck-t-shirt-smiling-644AhjsZNQs . The demo dashboard is original artwork.

The prior design-pass.md describes the earlier release. Detailed visual-research notes from the overnight revision are not included here; this note does not claim those notes were recovered in full.
