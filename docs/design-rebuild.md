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

## Live feedback follow-up

- Project cover, Project spotlight and Meet me use a 16:9 desktop screenshot viewport. Optional browser chrome is outside that ratio.
- Original Client results centers its heading, rating and stats as one group.
- Horizontal and vertical play-position sliders adjust the overlay from each layout's initial position; zero/reset returns to the initial position. Edge limits keep the control within the canvas. Both sliders apply across all twenty portfolio and intro layouts.
- The specialist and Split intro use dark theme gradients for their portrait panels, distinct from the adjacent composition, rather than a flat accent fill.

Follow-up checks: 19 unit tests; TypeScript, Biome and production build; 103 new slider/reset/extreme/mobile checks; 170 responsive-layout checks; 120 features and real PNG checks; 50 original/overlay checks; 3,264 and 5,760 render cases with no out-of-canvas text warnings. Actual updated artwork and the mobile slider UI inspected before release.

## Custom browser URL and project name follow-up

- The browser-window toggle now offers an editable address-bar URL. The text renders in a white address pill inside the chrome bar; an empty field keeps the plain "PROJECT PREVIEW" bar.
- An optional text-only project name renders as a small dark strip inside the project image. It anchors to a free bottom corner: bottom-left by default, bottom-right on Project spotlight and Minimal showcase, whose cards overlap the image's left edge. An empty field hides it. No logos or client branding are drawn.
- Both options are browser-local like every other edit, apply across every layout with a project screenshot, and are preserved when switching styles.

Follow-up checks: 20 unit tests; TypeScript, Biome and production build; 82 browser checks including URL/strip pixel changes and restore-on-clear; 179 responsive-layout checks; 103 slider/reset checks; 50 original/overlay checks; 5,760 render cases with no out-of-canvas text warnings. Actual preview and exported PNG pixels were inspected for the address pill and the name strip on every screenshot layout at both portfolio sizes and the intro size, confirming the full label stays visible.
