import type { CanvasTheme } from "./types";

// [WHY] Thumbnail artwork themes are original designs and separate from the
// Risograph system that skins the app UI - the canvas is the user's artwork.
export const CANVAS_THEMES: CanvasTheme[] = [
  {
    id: "riso-paper",
    label: "Riso paper",
    background: { type: "solid", color: "#f4f1ea" },
    ink: "#1d1d1b",
    accent: "#ff48b0",
    accentAlt: "#0078bf",
    sub: "#5f5f56",
  },
  {
    id: "ink-night",
    label: "Ink night",
    background: { type: "gradient", from: "#101826", to: "#1d2a44", angle: 135 },
    ink: "#fbf9f3",
    accent: "#ff48b0",
    accentAlt: "#4aa3df",
    sub: "#b8c2d4",
  },
  {
    id: "fluoro",
    label: "Fluoro",
    background: { type: "gradient", from: "#1d1d1b", to: "#3c3c38", angle: 160 },
    ink: "#fbf9f3",
    accent: "#ff48b0",
    accentAlt: "#ffd21f",
    sub: "#d8d4c8",
  },
];

export function themeById(id: string): CanvasTheme {
  const found = CANVAS_THEMES.find((t) => t.id === id);
  if (!found) throw new Error(`unknown theme id: ${id}`);
  return found;
}
