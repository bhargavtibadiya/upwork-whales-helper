# Reference parity verification

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
