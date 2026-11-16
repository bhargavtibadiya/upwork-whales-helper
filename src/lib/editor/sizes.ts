import type { CanvasSize, ModeId } from "./types";

export const SIZES: CanvasSize[] = [
  { id: "1x1", label: "Square 1000 x 1000", width: 1000, height: 1000 },
  { id: "4x3", label: "Portfolio 1000 x 750", width: 1000, height: 750 },
  { id: "16x9", label: "Video 1280 x 720", width: 1280, height: 720 },
];

export interface ModeSpec {
  id: ModeId;
  label: string;
  description: string;
  sizeIds: string[];
  defaultSizeId: string;
}

export const MODES: ModeSpec[] = [
  {
    id: "profile",
    label: "Profile picture",
    description: "Your Upwork photo with a ring",
    sizeIds: ["1x1"],
    defaultSizeId: "1x1",
  },
  {
    id: "portfolio",
    label: "Portfolio thumbnail",
    description: "For a project in your portfolio",
    sizeIds: ["4x3", "16x9"],
    defaultSizeId: "4x3",
  },
  {
    id: "intro",
    label: "Intro video thumbnail",
    description: "For the video on your profile",
    sizeIds: ["16x9"],
    defaultSizeId: "16x9",
  },
];

export function sizeById(id: string): CanvasSize {
  const found = SIZES.find((s) => s.id === id);
  if (!found) throw new Error(`unknown size id: ${id}`);
  return found;
}

export function modeById(id: ModeId): ModeSpec {
  const found = MODES.find((m) => m.id === id);
  if (!found) throw new Error(`unknown mode id: ${id}`);
  return found;
}
