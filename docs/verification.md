# Verification

## Preset links (November 17, 2026)

Verified against the local production build (`next build` + `next start`).

- 30 unit tests pass, including 10 preset round-trip, sanitiser and hostile-payload tests.
- 13 browser preset assertions pass (`npm run test:preset`): state restore from `?p=`, URL rewrites on edit and mode switch, bundled demo-image loading, corrupt-preset fallback, no page errors.
- The full existing browser suite (82 checks) passes unchanged, including download-vs-preview pixel equality and the no-server-writes guard.
- Ten example exports were generated from preset links across all three modes; every download matched its preview pixels exactly and each was visually inspected.

## Reference parity verification

Verified November 16, 2026 against the local production build (`next build` followed by `next start`). This repair is on DEV only. Main is live production and was not changed.

## Source and scope

Reference: https://upwork-whales-thumbnail-maker.vercel.app/#intro

The reference's mode selector, style selection, preview, images, words, extras, and profile-ring workflow are restored. The supplied Nordic Calm system replaces Risograph in the interface. The artwork keeps the reference's thumbnail palettes and canvas font families, separate from the Manrope interface.

No reference source or student image assets were copied into the repository. The example strip shows live previews of this implementation's styles instead of reproducing third-party student photographs. The earlier speculative freeform layer editor, brand presets and batch ZIP workflow were removed from the active app; they remain in Git history.

## Checks

- Clean dependency installation, Biome lint, strict TypeScript checks, and production build pass.
- 12 state/crop contract tests pass.
- 51 browser assertions pass against the production server.
- Eight default-state and eight uploaded-image-state artwork comparisons were captured with matching fonts, fields, dimensions and crop settings.
- Five screenshot-adjustment passes fixed arrow geometry, glow, skill-icon scale, ring colour, placeholder geometry, badge/button layout and short-role text alignment.

The browser checks cover all four intro presets, all three portfolio layouts, all four palettes, all 15 skill icons, identity and layout-specific text retention, optional badge removal, uploads, paste, drag/drop, remove, invalid-file errors, zoom and both crop axes, ring presets/custom colour/gradient/thickness/gaps/backgrounds, mode links, export dimensions, and mobile touch editing.

Every downloaded PNG in the browser suite was decoded and compared with the main preview canvas, with exact pixel equality. The suite also verifies no image-upload requests or server writes and no browser exceptions.

Screenshots were inspected at desktop 1440px, tablet 834px and mobile 390px. No horizontal page overflow was found. Mobile preset selection and crop changes were exercised through touch input.

## Comparison results

Mean absolute RGB error, on a 0-255 channel scale:

| Layout | Default | Uploaded and cropped |
| --- | ---: | ---: |
| Meet me | 0.004 | 0.005 |
| Title banner | 0.032 | 0.032 |
| Big hello | 0.180 | 0.020 |
| Watch this + proof | 0.010 | 0.010 |
| Result + screenshot | 0.017 | 0.015 |
| Face + big stat | 0.247 | 0.248 |
| Client results | 0.216 | 0.216 |
| Profile picture | 0.003 | 0.009 |

These are close visual comparisons, not a claim that every artwork pixel matches the reference. Small shadow and icon-edge differences remain. In the default snapshots, fewer than 0.06% of pixels in any layout differed by more than 20 channel levels. The interface intentionally uses Nordic Calm rather than the reference's dark purple styling.

## Evidence

Each comparison has the reference on the left and the local app on the right:

- [Four intro presets, default](verification/default-intro.png)
- [Portfolio and profile, default](verification/default-portfolio-profile.png)
- [Four intro presets, uploaded and cropped](verification/uploaded-intro.png)
- [Portfolio and profile, uploaded and cropped](verification/uploaded-portfolio-profile.png)
- [Desktop](verification/desktop.png)
- [Tablet](verification/tablet.png)
- [Mobile touch editing](verification/mobile-touch.png)

## Repeat

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
npm start -- --port 3100
# In a second terminal, with Chrome installed:
CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
CHROME_PATH=/usr/bin/google-chrome npm run test:compare
```

`test:compare` fetches only the public reference page and uses generated local fixtures. It captures default and uploaded states of every layout, saves full-page screenshots and artwork PNGs, and requires mean RGB error below 1/255 with less than 1% of pixels differing by over 20 channel levels. It cannot replace visual inspection. `EVIDENCE_DIR`, `APP_URL`, `REFERENCE_URL` and `CHROME_PATH` are configurable.

Fonts are bundled locally with their SIL Open Font Licenses. TypeScript's unused checks exclude only Next's generated validator file, which declares framework imports unused even in a valid single-page app; application sources remain checked.

## Complete-site follow-up

The second pass compares whole pages, not only exported artwork. The repeatable `npm run test:site` script captures all eight layout states at 1440px desktop, 834px tablet and 390px mobile for both the live reference and the local production build. It passes 160 checks, covering responsive section order, no overflow, sticky preview visibility while editing, identical text-field order/defaults/length limits, icon options and checkbox order. The existing 51 interaction/export checks and 16 artwork comparisons were rerun after these fixes.

Whole-page comparison found and fixed suppressed header/help spacing, undersized profile preview, incorrect Client results input order, reversed extras order, a portfolio upload label, missing profile-background guidance, and missing big-stat input guidance. Profile tips now retain the reference's four-item, responsive two-column structure. The remaining theme differences are intentional: Nordic Calm's 1040px content cap, 24px cards, Manrope, hairline borders and muted blue replace the reference's wider, saturated purple presentation. The generated example gallery remains the disclosed alternative to copying student photographs.

Full-page comparisons (reference left, implementation right):

| Mode | Desktop | Mobile |
| --- | --- | --- |
| Intro | [Complete intro page](verification/site/meet-desktop.webp) | [Complete mobile intro](verification/site/meet-mobile.webp) |
| Portfolio | [Complete portfolio page](verification/site/result-desktop.webp) | [Complete mobile portfolio](verification/site/result-mobile.webp) |
| Profile | [Complete profile page](verification/site/profile-desktop.webp) | [Complete mobile profile](verification/site/profile-mobile.webp) |

[All 48 full-page captures at original resolution](verification/site/all-layouts-full-pages.zip), including every preset and tablet state. [Machine-readable site checks](verification/site/checks.json).

```sh
# Run against the already-started production server:
npm run test:site
```

For the live deployment, set `APP_URL=https://upwork-whales-helper.vercel.app`. This pass does not claim that Nordic Calm and the reference's original theme are pixel-identical whole pages.
