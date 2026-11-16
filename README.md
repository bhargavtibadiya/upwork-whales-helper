# Upwork Whales Helper

A browser-based image editor for Upwork profile assets: ringed profile pictures, portfolio thumbnails and intro-video thumbnails. Inspired by the Upwork Whales thumbnail maker, rebuilt as an original implementation with deeper personalization: movable elements, per-element styling, reusable brand presets and batch export.

Everything renders on an HTML canvas in the browser. There is no backend and no upload of user images.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript 7
- Tailwind CSS v4
- Client-side Canvas 2D rendering, PNG export

## Docs

- [docs/plans/plan.md](docs/plans/plan.md) - project plan and v1 scope
- [docs/rules/](docs/rules) - coding standards every change must follow

## Branches

- `main` - stable. The initial commit is the documentation foundation only.
- `DEV` - active development. All app implementation lands here first.
