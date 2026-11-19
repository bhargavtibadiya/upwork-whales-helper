// Official Loom brand assets supplied by the project owner: the mark geometry
// below is the exact path data from the supplied Loom_Symbol SVG (62x62
// viewBox), so the drawn badge matches the real logo instead of a hand-drawn
// approximation. The full-colour badge is the owner-supplied JPG, bundled at
// /loom-badge.jpg and loaded once per page.

export const LOOM_BADGE_SRC = "/loom-badge.jpg";
export const LOOM_BRAND_BLUE = "#1868DB";
export const LOOM_MARK_LIGHT = "#222222";
export const LOOM_MARK_DARK = "#FFFFFF";

// Exact path data from the supplied Loom_Symbol SVG (line breaks removed).
const LOOM_MARK_PATH =
  "M62,27.6H43.9l15.7-9.1l-3.4-6l-15.7,9.1l9.1-15.7l-6-3.5l-9.1,15.7V0h-6.9v18.1" +
  "L18.5,2.4l-6,3.4l9.1,15.7L5.9,12.5l-3.4,6l15.7,9.1H0v6.9h18.1L2.4,43.5l3.4,6" +
  "l15.7-9.1l-9.1,15.7l6,3.4l9.1-15.7V62h6.9V43.9l9.1,15.7l6-3.4l-9.1-15.7" +
  "l15.7,9.1l3.4-6l-15.7-9.1H62L62,27.6L62,27.6z " +
  "M31,40.4c-5.2,0-9.4-4.2-9.4-9.4c0-5.2,4.2-9.4,9.4-9.4c5.2,0,9.4,4.2,9.4,9.4" +
  "C40.4,36.2,36.2,40.4,31,40.4z";

let cachedPath: Path2D | null = null;

export function loomMarkPath(): Path2D | null {
  if (typeof Path2D === "undefined") return null;
  if (!cachedPath) cachedPath = new Path2D(LOOM_MARK_PATH);
  return cachedPath;
}

let badge: HTMLImageElement | null = null;
let requested = false;
const listeners = new Set<() => void>();

function ensureBadge(): void {
  if (requested || typeof Image === "undefined") return;
  requested = true;
  const element = new Image();
  element.onload = () => {
    badge = element;
    for (const listener of listeners) listener();
    listeners.clear();
  };
  element.src = LOOM_BADGE_SRC;
}

// The badge image once loaded, or null while it is still on the way. Render
// callers fall back to the dark SVG variant so the canvas is never blank.
export function loomBadgeImage(): HTMLImageElement | null {
  ensureBadge();
  return badge;
}

// Ask for a callback as soon as the badge image is ready so the preview can
// repaint with the image variant.
export function onLoomBadgeReady(listener: () => void): void {
  if (badge) return;
  listeners.add(listener);
  ensureBadge();
}
