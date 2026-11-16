# Deployment (Vercel)

The app is a fully client-side Next.js project. Vercel detects the framework
automatically; `vercel.json` pins it explicitly so the project imports cleanly.

## Deploy

1. Import `bhargavtibadiya/upwork-whales-helper` in Vercel (New Project ->
   Import Git Repository).
2. Keep the defaults: Framework Preset `Next.js`, Build Command `next build`,
   Install Command `npm install` (both pinned in `vercel.json`).
3. Deploy the `DEV` branch for a preview, or merge to `main` for production.

No environment variables are required - there is no backend and no secrets.

## Redirects

There are no redirects today: the app has a single route (`/`), so no legacy
paths or aliases exist to forward. Adding blanket rewrites is deliberately
avoided because a SPA-style `/* -> /` rewrite would break Next.js asset and
data routes.

When a real route changes, add an entry to a `redirects` array in
`vercel.json`, for example:

```json
"redirects": [
  { "source": "/old-path", "destination": "/new-path", "permanent": true }
]
```

Use `permanent: true` (308) for moved pages and `permanent: false` (307) for
temporary forwarding.
