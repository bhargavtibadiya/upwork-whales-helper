// [WHY] One document model shared by the canvas renderer, the hit-testing
// geometry helpers and the export pipeline, so preview and export never drift.

export type ModeId = "profile" | "portfolio" | "intro";

export interface CanvasSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextElement {
  id: string;
  kind: "text";
  x: number;
  y: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  maxWidth: number | null;
  uppercase: boolean;
}

export interface ImageElement {
  id: string;
  kind: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  src: string | null;
  circle: boolean;
  borderColor: string | null;
  borderWidth: number;
  placeholder: string;
}

export interface ShapeElement {
  id: string;
  kind: "shape";
  shape: "rect" | "pill" | "circle" | "triangle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

export type EditorElement = TextElement | ImageElement | ShapeElement;

// [WHY] A patch can carry any editable field but never id or kind.
export type ElementPatch = Partial<Omit<TextElement, "id" | "kind">> &
  Partial<Omit<ImageElement, "id" | "kind">> &
  Partial<Omit<ShapeElement, "id" | "kind">>;

export type CanvasBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number };

export interface EditorDocument {
  mode: ModeId;
  sizeId: string;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: EditorElement[];
}

export interface CanvasTheme {
  id: string;
  label: string;
  background: CanvasBackground;
  ink: string;
  accent: string;
  accentAlt: string;
  sub: string;
}

export interface BrandPreset {
  name: string;
  savedAt: string;
  themeId: string;
  fontFamily: string;
  background: CanvasBackground;
}

export interface BatchItem {
  id: string;
  label: string;
  document: EditorDocument;
}
