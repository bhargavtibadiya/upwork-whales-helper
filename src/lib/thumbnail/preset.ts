import {
  type Crop,
  changeStyle,
  type ImageKind,
  initialState,
  type Mode,
  PALETTES,
  type Ring,
  STYLES,
  type Style,
  spec,
  type ThumbnailState,
} from "./model";

// URL presets: the whole editor state (minus uploaded image bytes) fits in one
// `?p=` query param, so a link reopens the exact design. Bundled demo images
// under /demo/ are referenced by same-origin path only; a visitor's own
// uploads are never serialised and never leave their browser.

export interface PresetImage {
  src: string;
  zoom: number;
  x: number;
  y: number;
}

export interface Preset {
  v: 1;
  mode: Mode;
  style: Style;
  lastStyle: Record<Mode, Style>;
  palette: ThumbnailState["palette"];
  customPaletteColor: string;
  size: ThumbnailState["size"];
  values: Record<string, string>;
  icons: string[];
  font: ThumbnailState["font"];
  arrow: boolean;
  play: boolean;
  playOffsetX: number;
  playOffsetY: number;
  playSize: number;
  loom: boolean;
  loomVariant: ThumbnailState["loomVariant"];
  loomOffsetX: number;
  loomOffsetY: number;
  loomSize: number;
  calloutText: string;
  overlayLabel: boolean;
  originalLayout: boolean;
  browserFrame: boolean;
  browserUrl: string;
  projectLabel: string;
  portraitShape: ThumbnailState["portraitShape"];
  backdrop: ThumbnailState["backdrop"];
  ring: Ring;
  face?: PresetImage;
  shot?: PresetImage;
}

const MODES: Mode[] = ["profile", "portfolio", "intro"];
const SIZES: ThumbnailState["size"][] = ["4x3", "16x9"];
const FONTS: ThumbnailState["font"][] = ["original", "Montserrat", "Manrope", "Anton"];
const LOOM_VARIANTS: ThumbnailState["loomVariant"][] = ["light", "dark", "image"];
const SHAPES: ThumbnailState["portraitShape"][] = ["rounded", "square", "circle"];
const BACKDROPS: ThumbnailState["backdrop"][] = ["glow", "clean"];
const GAPS: Ring["gap"][] = ["white", "dark", "none"];
const BG_MODES: Ring["backgroundMode"][] = ["keep", "solid", "gradient"];
const ICON_IDS = new Set([
  "code",
  "database",
  "ai",
  "cloud",
  "chart",
  "chat",
  "mobile",
  "gear",
  "search",
  "mail",
  "bolt",
  "video",
  "cart",
  "pen",
  "check",
]);
const STYLE_IDS = new Set(STYLES.map((item) => item.id));
const PALETTE_IDS = new Set(PALETTES.map((item) => item.id));
const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_URL_LENGTH = 7500;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function text(value: unknown, max: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  // Strip control characters so a crafted link cannot smuggle markup or ANSI.
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .slice(0, max);
}

function hex(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX.test(value) ? value : fallback;
}

function oneOf<T>(list: readonly T[], value: unknown, fallback: T): T {
  return list.includes(value as T) ? (value as T) : fallback;
}

function cleanImage(value: unknown): PresetImage | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  const src = text(raw.src, 160);
  // Same-origin bundled assets only: a leading slash, never a scheme or
  // protocol-relative host, so presets cannot pull arbitrary remote images.
  if (!src.startsWith("/") || src.startsWith("//") || src.includes("..")) return undefined;
  return {
    src,
    zoom: clamp(raw.zoom, 50, 400, 100),
    x: clamp(raw.x, 0, 100, 50),
    y: clamp(raw.y, 0, 100, 30),
  };
}

function cleanValues(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (Object.keys(out).length >= 48) break;
    const cleanKey = text(key, 48);
    if (!cleanKey || typeof entry !== "string") continue;
    out[cleanKey] = text(entry, 200);
  }
  return out;
}

export function presetImageFromCrop(crop: Crop): PresetImage | undefined {
  if (!crop.image || !crop.src) return undefined;
  return { src: crop.src, zoom: crop.zoom, x: crop.x, y: crop.y };
}

export function encodePreset(state: ThumbnailState): string {
  const preset: Preset = {
    v: 1,
    mode: state.mode,
    style: state.style,
    lastStyle: state.lastStyle,
    palette: state.palette,
    customPaletteColor: state.customPaletteColor,
    size: state.size,
    values: state.values,
    icons: state.icons,
    font: state.font,
    arrow: state.arrow,
    play: state.loom ? false : state.play,
    playOffsetX: state.playOffsetX,
    playOffsetY: state.playOffsetY,
    playSize: state.playSize,
    loom: state.loom,
    loomVariant: state.loomVariant,
    loomOffsetX: state.loomOffsetX,
    loomOffsetY: state.loomOffsetY,
    loomSize: state.loomSize,
    calloutText: state.calloutText,
    overlayLabel: state.overlayLabel,
    originalLayout: state.originalLayout,
    browserFrame: state.browserFrame,
    browserUrl: state.browserUrl,
    projectLabel: state.projectLabel,
    portraitShape: state.portraitShape,
    backdrop: state.backdrop,
    ring: state.ring,
  };
  const face = presetImageFromCrop(state.face);
  const shot = presetImageFromCrop(state.shot);
  if (face) preset.face = face;
  if (shot) preset.shot = shot;
  return toBase64Url(JSON.stringify(preset));
}

export function decodePreset(search: string): Preset | null {
  try {
    const encoded = new URLSearchParams(search).get("p");
    if (!encoded || encoded.length > MAX_URL_LENGTH) return null;
    const raw = JSON.parse(fromBase64Url(encoded)) as Record<string, unknown>;
    if (raw?.v !== 1 || typeof raw !== "object") return null;
    const mode = oneOf(MODES, raw.mode, "portfolio" as Mode);
    const style = oneOf([...STYLE_IDS] as Style[], raw.style, initialState(mode).style);
    if (spec(style).mode !== mode) return null;
    const base = initialState(mode);
    const lastStyleRaw =
      typeof raw.lastStyle === "object" && raw.lastStyle !== null
        ? (raw.lastStyle as Record<string, unknown>)
        : {};
    const lastStyle = { ...base.lastStyle };
    for (const item of MODES) {
      const candidate = lastStyleRaw[item];
      if (
        typeof candidate === "string" &&
        STYLE_IDS.has(candidate as Style) &&
        spec(candidate as Style).mode === item
      )
        lastStyle[item] = candidate as Style;
    }
    lastStyle[mode] = style;
    const ringRaw =
      typeof raw.ring === "object" && raw.ring !== null
        ? (raw.ring as Record<string, unknown>)
        : {};
    const ring: Ring = {
      color: hex(ringRaw.color, base.ring.color),
      preset: text(ringRaw.preset, 24, base.ring.preset),
      customColor: hex(ringRaw.customColor, base.ring.customColor),
      gradient: ringRaw.gradient === true,
      thickness: clamp(ringRaw.thickness, 18, 110, base.ring.thickness),
      gap: oneOf(GAPS, ringRaw.gap, base.ring.gap),
      backgroundMode: oneOf(BG_MODES, ringRaw.backgroundMode, base.ring.backgroundMode),
      background: hex(ringRaw.background, base.ring.background),
    };
    const icons = Array.isArray(raw.icons)
      ? raw.icons.filter((icon): icon is string => typeof icon === "string" && ICON_IDS.has(icon))
      : base.icons;
    const loom = typeof raw.loom === "boolean" ? raw.loom : raw.playIcon === "loom";
    const preset: Preset = {
      v: 1,
      mode,
      style,
      lastStyle,
      palette: PALETTE_IDS.has(raw.palette as ThumbnailState["palette"])
        ? (raw.palette as ThumbnailState["palette"])
        : base.palette,
      customPaletteColor: hex(raw.customPaletteColor, base.customPaletteColor),
      size: oneOf(SIZES, raw.size, base.size),
      values: cleanValues(raw.values),
      icons: icons.length ? icons.slice(0, 4) : base.icons,
      font: oneOf(FONTS, raw.font, base.font),
      arrow: raw.arrow === true,
      // Play and Loom are mutually exclusive: a Loom badge always wins so a
      // stored link never renders both overlays at once. Links saved before
      // Loom became its own overlay carry `playIcon: "loom"` instead.
      play: loom ? false : raw.play !== false,
      playOffsetX: clamp(raw.playOffsetX, -100, 100, 0),
      playOffsetY: clamp(raw.playOffsetY, -100, 100, 0),
      playSize: clamp(raw.playSize, 50, 200, base.playSize),
      loom,
      loomVariant: oneOf(LOOM_VARIANTS, raw.loomVariant, base.loomVariant),
      loomOffsetX: clamp(raw.loomOffsetX, -100, 100, 0),
      loomOffsetY: clamp(raw.loomOffsetY, -100, 100, 0),
      loomSize: clamp(raw.loomSize, 50, 200, base.loomSize),
      calloutText: text(raw.calloutText, 22, base.calloutText),
      overlayLabel: raw.overlayLabel === true,
      originalLayout: raw.originalLayout === true,
      browserFrame: raw.browserFrame === true,
      browserUrl: text(raw.browserUrl, 48),
      projectLabel: text(raw.projectLabel, 28),
      portraitShape: oneOf(SHAPES, raw.portraitShape, base.portraitShape),
      backdrop: oneOf(BACKDROPS, raw.backdrop, base.backdrop),
      ring,
    };
    const face = cleanImage(raw.face);
    const shot = cleanImage(raw.shot);
    if (face) preset.face = face;
    if (shot) preset.shot = shot;
    return preset;
  } catch {
    return null;
  }
}

export function applyPreset(preset: Preset): ThumbnailState {
  const base = changeStyle(initialState(preset.mode), preset.style);
  return {
    ...base,
    lastStyle: preset.lastStyle,
    palette: preset.palette,
    customPaletteColor: preset.customPaletteColor,
    size: preset.size,
    values: preset.values,
    icons: preset.icons,
    font: preset.font,
    arrow: preset.arrow,
    play: preset.loom ? false : preset.play,
    playOffsetX: preset.playOffsetX,
    playOffsetY: preset.playOffsetY,
    playSize: preset.playSize,
    loom: preset.loom,
    loomVariant: preset.loomVariant,
    loomOffsetX: preset.loomOffsetX,
    loomOffsetY: preset.loomOffsetY,
    loomSize: preset.loomSize,
    calloutText: preset.calloutText,
    overlayLabel: preset.overlayLabel,
    originalLayout: preset.originalLayout,
    browserFrame: preset.browserFrame,
    browserUrl: preset.browserUrl,
    projectLabel: preset.projectLabel,
    portraitShape: preset.portraitShape,
    backdrop: preset.backdrop,
    ring: preset.ring,
    face: preset.face
      ? { ...base.face, zoom: preset.face.zoom, x: preset.face.x, y: preset.face.y }
      : base.face,
    shot: preset.shot
      ? { ...base.shot, zoom: preset.shot.zoom, x: preset.shot.x, y: preset.shot.y }
      : base.shot,
  };
}

export async function loadPresetImage(preset: PresetImage, kind: ImageKind): Promise<Crop | null> {
  try {
    const response = await fetch(preset.src);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    const url = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Preset image could not be opened."));
        element.src = url;
      });
      return {
        image,
        name: preset.src.split("/").pop() ?? `Preset ${kind}`,
        zoom: preset.zoom,
        x: preset.x,
        y: preset.y,
        src: preset.src,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}
