# Upwork Whales Helper

A browser-local profile-picture and thumbnail maker. The interface uses the supplied Nordic Calm design system; the canvas preserves the reference artwork and its four colour palettes.

## Run

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`#profile`, `#portfolio`, and `#intro` open their corresponding mode. Profile pictures export at 1000 x 1000, intro thumbnails at 1280 x 720, and portfolio thumbnails at 1000 x 750 or 1280 x 720.

The four intro styles are Meet me, Title banner, Big hello, and Watch this + proof. Each has its own fields. Names, roles, images, crop settings, and other shared values survive style switches. Images can be chosen, dropped, or pasted; they are never sent to a server.

## Browser verification

Start the production server, then run:

```sh
npm run build
npm start -- --port 3100
# In another terminal:
CHROME_PATH=/usr/bin/google-chrome npm run test:e2e
```

`APP_URL`, `EVIDENCE_DIR`, and `CHROME_PATH` can override the defaults. The browser test uses the generated fixtures in `tests/fixtures/`, exercises editing and touch controls, and checks downloaded PNGs against preview pixels. See `docs/verification.md` for the latest results and comparison evidence.

## Scope and branches

This repair restores the reference workflow instead of the earlier freeform editor, brand-preset manager, or batch ZIP feature. Those speculative additions are retained in Git history, not mixed into the reference interface.

- `DEV`: review branch for the repair.
- `main`: live production. A push can deploy automatically. Do not merge without explicit approval.

Next.js 16, React 19, TypeScript 7, Tailwind v4, Biome, Canvas 2D. No backend or image-upload API. Fonts are bundled locally with their licenses.
