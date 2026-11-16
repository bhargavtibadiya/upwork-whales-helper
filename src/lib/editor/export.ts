import { type ImageMap, type RenderableImage, renderDocument } from "./render";
import type { BatchItem, EditorDocument } from "./types";

export const CANVAS_FONT_FAMILIES = ["Anton", "Montserrat", "Space Grotesk", "Work Sans"];

// [WHY] Canvas text only renders correctly once the webfont is loaded; we wait
// for every family the document uses before drawing the export.
export async function ensureFontsLoaded(doc: EditorDocument): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const used = new Set<string>();
  for (const el of doc.elements) {
    if (el.kind === "text") used.add(el.fontFamily);
  }
  used.add("Work Sans");
  const jobs = [...used].map((family) => {
    const probe = el_size_probe(family);
    return document.fonts.load(probe).catch(() => undefined);
  });
  await Promise.all(jobs);
}

function el_size_probe(family: string): string {
  return `700 32px "${family}"`;
}

export function loadImageMap(data: Record<string, string>): Promise<ImageMap> {
  const entries = Object.entries(data);
  const jobs = entries.map(
    ([key, dataUrl]) =>
      new Promise<[string, RenderableImage]>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve([key, img]);
        img.onerror = () => reject(new Error(`image failed to load: ${key}`));
        img.src = dataUrl;
      }),
  );
  return Promise.all(jobs).then((pairs) => Object.fromEntries(pairs));
}

export function renderToCanvas(doc: EditorDocument, images: ImageMap): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = doc.width;
  canvas.height = doc.height;
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("2d context unavailable");
  renderDocument(ctx, doc, images);
  return canvas;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob === null) reject(new Error("PNG encode failed"));
      else resolve(blob);
    }, "image/png");
  });
}

export function fileStem(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "thumbnail"
  );
}

export async function exportDocumentPng(
  doc: EditorDocument,
  images: ImageMap,
  label: string,
): Promise<void> {
  await ensureFontsLoaded(doc);
  const canvas = renderToCanvas(doc, images);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${fileStem(label)}-${doc.width}x${doc.height}.png`);
}

export async function exportBatchZip(items: BatchItem[], images: ImageMap): Promise<void> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const item of items) {
    await ensureFontsLoaded(item.document);
    const canvas = renderToCanvas(item.document, images);
    const blob = await canvasToBlob(canvas);
    zip.file(`${fileStem(item.label)}-${item.document.width}x${item.document.height}.png`, blob);
  }
  const archive = await zip.generateAsync({ type: "blob" });
  downloadBlob(archive, "upwork-whales-batch.zip");
}
