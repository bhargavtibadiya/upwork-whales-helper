# Project Rules - Upwork Whales Helper

Single source of truth for how this project is built. Agents and humans follow these rules on every change, alongside the universal standards in this folder.

---

## 1. What this project is

A fully client-side image editor for Upwork profile assets (profile picture, portfolio thumbnail, intro-video thumbnail). All rendering happens on an HTML canvas in the browser. User images never leave the browser.

## 2. Stack (pinned to current stable)

- **Next.js 16** (App Router, `src/app/`) with **React 19**
- **TypeScript 7** - strict, per `typescript-standards.md`
- **Tailwind CSS v4** - configured in `src/app/globals.css` via `@import "tailwindcss"`; no `tailwind.config.*`
- Canvas 2D API for all image rendering and PNG export

## 3. No backend

- **Never** add API routes, server actions that persist data, a database, or an upload endpoint.
- Image processing (including any future background removal) must run client-side or be explicitly approved before adding any server dependency.
- `frontend-folder-structure.md` sections about `app/api/` and backend folders do not apply.

## 4. Styling: Tailwind first

- Style UI with Tailwind utility classes on JSX elements. Mobile-first responsive prefixes.
- No `<style jsx>` or ad-hoc CSS-in-JS in components. Keyframes and complex selectors go in `globals.css` as named classes with a one-line `// [WHY]` comment above (see `comments.md`).

## 5. Commits

- Format per `commit.md` (conventional commits, lowercase, <= 20 words).
- Author identity is always the project owner: `bhargavtibadiya <bhargavptibadiya.tbp@gmail.com>`.

## 6. Branches

- `main` holds the stable baseline. The initial commit is the documentation foundation only.
- `DEV` is the working branch for all app implementation. Merge to `main` only when a milestone is verified and the owner asks.

## 7. Testing

- `test-standards.md` applies to pure logic first: canvas geometry, layout calculation, preset serialization, text measurement.
- Its backend/AI sections (NestJS, LLM layers) are not applicable to this project.

## 8. Originality

- This is an original reimplementation. Do not copy code or assets from the reference app (upwork-whales-thumbnail-maker.vercel.app), which has no open-source license. Layout ideas may inform our own original designs.
