import type { BrandPreset, CanvasBackground } from "./types";

const STORAGE_KEY = "uwh.brandPresets.v1";

function isBackground(value: unknown): value is CanvasBackground {
  if (typeof value !== "object" || value === null) return false;
  const candidate: { type?: unknown } = value;
  return candidate.type === "solid" || candidate.type === "gradient";
}

function isBrandPreset(value: unknown): value is BrandPreset {
  if (typeof value !== "object" || value === null) return false;
  const candidate: {
    name?: unknown;
    savedAt?: unknown;
    themeId?: unknown;
    fontFamily?: unknown;
    background?: unknown;
  } = value;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.savedAt === "string" &&
    typeof candidate.themeId === "string" &&
    typeof candidate.fontFamily === "string" &&
    isBackground(candidate.background)
  );
}

export function loadPresets(): BrandPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: string | null = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBrandPreset);
  } catch {
    return [];
  }
}

export function savePreset(preset: BrandPreset): BrandPreset[] {
  const existing = loadPresets().filter((p) => p.name !== preset.name);
  const next = [...existing, preset];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deletePreset(name: string): BrandPreset[] {
  const next = loadPresets().filter((p) => p.name !== name);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
