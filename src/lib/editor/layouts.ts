import type { CanvasTheme, EditorDocument, EditorElement, ModeId } from "./types";
import { modeById, sizeById } from "./sizes";

export interface LayoutSpec {
  id: string;
  mode: ModeId;
  label: string;
  build: (width: number, height: number, theme: CanvasTheme) => EditorElement[];
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

// [WHY] IDs must stay unique when a layout is rebuilt after edits, so the
// counter is module-level rather than per-document.
export function resetIdCounter(): void {
  counter = 0;
}

function text(partial: Omit<EditorElement & { kind: "text" }, "id" | "kind">): EditorElement {
  return { id: nextId("text"), kind: "text", ...partial };
}

function image(partial: Omit<EditorElement & { kind: "image" }, "id" | "kind">): EditorElement {
  return { id: nextId("image"), kind: "image", ...partial };
}

function shape(partial: Omit<EditorElement & { kind: "shape" }, "id" | "kind">): EditorElement {
  return { id: nextId("shape"), kind: "shape", ...partial };
}

const DISPLAY_FONT = "Anton";
const BODY_FONT = "Montserrat";

const LAYOUTS: LayoutSpec[] = [
  {
    id: "ringed-photo",
    mode: "profile",
    label: "Ringed photo",
    build: (w, h, theme) => [
      shape({ shape: "circle", x: w / 2, y: h / 2, width: w * 0.9, height: w * 0.9, fill: theme.accent, rotation: 0 }),
      image({
        x: w / 2, y: h / 2, width: w * 0.78, height: w * 0.78,
        src: null, circle: true, borderColor: theme.accentAlt, borderWidth: 18,
        placeholder: "Your photo",
      }),
    ],
  },
  {
    id: "photo-badge",
    mode: "profile",
    label: "Photo + badge",
    build: (w, h, theme) => [
      image({
        x: w / 2, y: h * 0.46, width: w * 0.72, height: w * 0.72,
        src: null, circle: true, borderColor: theme.accent, borderWidth: 22,
        placeholder: "Your photo",
      }),
      shape({ shape: "pill", x: w / 2, y: h * 0.86, width: w * 0.56, height: h * 0.11, fill: theme.accent, rotation: 0 }),
      text({
        x: w / 2, y: h * 0.895, text: "AVAILABLE NOW", fontFamily: BODY_FONT, fontSize: w * 0.038,
        fontWeight: 800, color: "#fbf9f3", align: "center", lineHeight: 1.1, maxWidth: w * 0.5, uppercase: true,
      }),
    ],
  },
  {
    id: "shot-headline",
    mode: "portfolio",
    label: "Screenshot + headline",
    build: (w, h, theme) => [
      text({
        x: w * 0.06, y: h * 0.16, text: "WATCH THIS", fontFamily: BODY_FONT, fontSize: h * 0.055,
        fontWeight: 800, color: theme.accent, align: "left", lineHeight: 1, maxWidth: w * 0.6, uppercase: true,
      }),
      text({
        x: w * 0.06, y: h * 0.34, text: "120K CLICKS", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.17),
        fontWeight: 400, color: theme.ink, align: "left", lineHeight: 1, maxWidth: w * 0.9, uppercase: true,
      }),
      shape({ shape: "rect", x: w * 0.5, y: h * 0.66, width: w, height: h * 0.36, fill: theme.accentAlt, rotation: 0 }),
      image({
        x: w * 0.5, y: h * 0.66, width: w * 0.84, height: h * 0.28,
        src: null, circle: false, borderColor: null, borderWidth: 0,
        placeholder: "Screenshot of your work",
      }),
    ],
  },
  {
    id: "big-stat",
    mode: "portfolio",
    label: "Face + big stat",
    build: (w, h, theme) => [
      image({
        x: w * 0.26, y: h * 0.52, width: w * 0.42, height: w * 0.42,
        src: null, circle: true, borderColor: theme.accent, borderWidth: 14,
        placeholder: "Your photo",
      }),
      text({
        x: w * 0.56, y: h * 0.34, text: "$48K", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.24),
        fontWeight: 400, color: theme.ink, align: "left", lineHeight: 1, maxWidth: w * 0.42, uppercase: true,
      }),
      text({
        x: w * 0.56, y: h * 0.52, text: "Organic results delivered", fontFamily: BODY_FONT, fontSize: h * 0.055,
        fontWeight: 600, color: theme.sub, align: "left", lineHeight: 1.25, maxWidth: w * 0.38, uppercase: false,
      }),
      shape({ shape: "rect", x: w * 0.56, y: h * 0.68, width: w * 0.18, height: 8, fill: theme.accent, rotation: 0 }),
    ],
  },
  {
    id: "split-review",
    mode: "portfolio",
    label: "Client results",
    build: (w, h, theme) => [
      shape({ shape: "rect", x: w * 0.34, y: h * 0.5, width: w * 0.68, height: h, fill: theme.accent, rotation: 0 }),
      text({
        x: w * 0.56, y: h * 0.2, text: "CLIENT RESULTS", fontFamily: DISPLAY_FONT, fontSize: h * 0.1,
        fontWeight: 400, color: theme.ink, align: "left", lineHeight: 1.05, maxWidth: w * 0.6, uppercase: true,
      }),
      text({
        x: w * 0.56, y: h * 0.42, text: "& REVIEWS", fontFamily: DISPLAY_FONT, fontSize: h * 0.1,
        fontWeight: 400, color: theme.accentAlt, align: "left", lineHeight: 1.05, maxWidth: w * 0.6, uppercase: true,
      }),
      text({
        x: w * 0.56, y: h * 0.66, text: "$20K+ earned · 100% job success", fontFamily: BODY_FONT, fontSize: h * 0.045,
        fontWeight: 700, color: theme.sub, align: "left", lineHeight: 1.3, maxWidth: w * 0.58, uppercase: false,
      }),
      image({
        x: w * 0.19, y: h * 0.5, width: w * 0.3, height: w * 0.3,
        src: null, circle: true, borderColor: theme.accentAlt, borderWidth: 12,
        placeholder: "Your photo",
      }),
    ],
  },
  {
    id: "meet-me",
    mode: "intro",
    label: "Meet me",
    build: (w, h, theme) => [
      image({
        x: w * 0.24, y: h * 0.52, width: h * 0.62, height: h * 0.62,
        src: null, circle: true, borderColor: theme.accent, borderWidth: 14,
        placeholder: "Your photo",
      }),
      text({
        x: w * 0.48, y: h * 0.32, text: "Alex R.", fontFamily: BODY_FONT, fontSize: h * 0.06,
        fontWeight: 700, color: theme.sub, align: "left", lineHeight: 1.1, maxWidth: w * 0.46, uppercase: false,
      }),
      text({
        x: w * 0.48, y: h * 0.58, text: "CLICK HERE", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.16),
        fontWeight: 400, color: theme.ink, align: "left", lineHeight: 1, maxWidth: w * 0.48, uppercase: true,
      }),
      shape({ shape: "triangle", x: w * 0.88, y: h * 0.82, width: h * 0.12, height: h * 0.12, fill: theme.accent, rotation: 90 }),
    ],
  },
  {
    id: "title-banner",
    mode: "intro",
    label: "Title banner",
    build: (w, h, theme) => [
      shape({ shape: "rect", x: w * 0.06, y: h * 0.14, width: w * 0.055, height: h * 0.72, fill: theme.accent, rotation: 0 }),
      text({
        x: w * 0.15, y: h * 0.32, text: "FULL STACK", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.19),
        fontWeight: 400, color: theme.ink, align: "left", lineHeight: 1, maxWidth: w * 0.7, uppercase: true,
      }),
      text({
        x: w * 0.15, y: h * 0.56, text: "AI DEVELOPER", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.19),
        fontWeight: 400, color: theme.accent, align: "left", lineHeight: 1, maxWidth: w * 0.7, uppercase: true,
      }),
      text({
        x: w * 0.15, y: h * 0.76, text: "From idea to launch", fontFamily: BODY_FONT, fontSize: h * 0.055,
        fontWeight: 600, color: theme.sub, align: "left", lineHeight: 1.2, maxWidth: w * 0.6, uppercase: false,
      }),
    ],
  },
  {
    id: "proof-row",
    mode: "intro",
    label: "Watch + proof",
    build: (w, h, theme) => [
      text({
        x: w * 0.5, y: h * 0.26, text: "WATCH THIS", fontFamily: DISPLAY_FONT, fontSize: Math.round(h * 0.17),
        fontWeight: 400, color: theme.ink, align: "center", lineHeight: 1, maxWidth: w * 0.8, uppercase: true,
      }),
      shape({ shape: "pill", x: w * 0.5, y: h * 0.47, width: w * 0.2, height: h * 0.1, fill: theme.accent, rotation: 0 }),
      text({
        x: w * 0.5, y: h * 0.505, text: "PLAY", fontFamily: BODY_FONT, fontSize: h * 0.05,
        fontWeight: 800, color: "#fbf9f3", align: "center", lineHeight: 1, maxWidth: w * 0.18, uppercase: true,
      }),
      text({
        x: w * 0.5, y: h * 0.74, text: "50+ projects · 5.0 rating · $100K+ earned", fontFamily: BODY_FONT,
        fontSize: h * 0.055, fontWeight: 700, color: theme.sub, align: "center", lineHeight: 1.2,
        maxWidth: w * 0.9, uppercase: false,
      }),
    ],
  },
];

export function layoutsForMode(mode: ModeId): LayoutSpec[] {
  return LAYOUTS.filter((l) => l.mode === mode);
}

export function buildDocument(mode: ModeId, sizeId: string, layoutId: string, theme: CanvasTheme): EditorDocument {
  const size = sizeById(sizeId);
  const layout = LAYOUTS.find((l) => l.id === layoutId && l.mode === mode);
  if (!layout) throw new Error(`unknown layout ${layoutId} for mode ${mode}`);
  if (!modeById(mode).sizeIds.includes(sizeId)) throw new Error(`size ${sizeId} not allowed in mode ${mode}`);
  return {
    mode,
    sizeId,
    width: size.width,
    height: size.height,
    background: theme.background,
    elements: layout.build(size.width, size.height, theme),
  };
}
