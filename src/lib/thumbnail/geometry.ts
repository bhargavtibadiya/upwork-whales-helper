import type { Box } from "./brush";

// Fit a desktop screenshot without changing its inner 16:9 image ratio.
// Browser chrome sits outside that image area.
export function desktopFrame(bounds: Box, border: number, chrome = 0): Box {
  const [x, y, width, height] = bounds;
  const innerWidth = Math.max(
    1,
    Math.min(width - 2 * border, ((height - 2 * border - chrome) * 16) / 9),
  );
  const w = innerWidth + 2 * border;
  const h = (innerWidth * 9) / 16 + 2 * border + chrome;
  return [x + (width - w) / 2, y + (height - h) / 2, w, h];
}

export function playCenter(
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
  offsetX = 0,
  offsetY = 0,
): [number, number] {
  const inset = radius + (8 * width) / 1280;
  return [
    Math.max(inset, Math.min(width - inset, x + (width * offsetX) / 100)),
    Math.max(inset, Math.min(height - inset, y + (height * offsetY) / 100)),
  ];
}
