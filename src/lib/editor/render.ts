import type { EditorDocument, ElementBounds, ImageElement, ShapeElement, TextElement } from "./types";

// [WHY] Images arrive as a caller-supplied map so this module stays pure logic:
// the browser passes HTMLImageElement, tests can pass any CanvasImageSource.
export type RenderableImage = CanvasImageSource & { readonly width: number; readonly height: number };
export type ImageMap = Record<string, RenderableImage>;

export interface RenderResult {
  bounds: Record<string, ElementBounds>;
}

export function canvasFont(el: Pick<TextElement, "fontWeight" | "fontSize" | "fontFamily">): string {
  return `${el.fontWeight} ${el.fontSize}px "${el.fontFamily}", sans-serif`;
}

export function wrapLines(ctx: CanvasRenderingContext2D, el: TextElement): string[] {
  const content = el.uppercase ? el.text.toUpperCase() : el.text;
  const raw = content.split("\n");
  if (el.maxWidth === null) return raw;
  const lines: string[] = [];
  for (const paragraph of raw) {
    const words = paragraph.split(" ");
    let current = "";
    for (const word of words) {
      const attempt = current === "" ? word : `${current} ${word}`;
      if (ctx.measureText(attempt).width <= el.maxWidth || current === "") {
        current = attempt;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, doc: EditorDocument): void {
  const bg = doc.background;
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, doc.width, doc.height);
    return;
  }
  const rad = (bg.angle * Math.PI) / 180;
  const cx = doc.width / 2;
  const cy = doc.height / 2;
  const r = Math.hypot(doc.width, doc.height) / 2;
  const grad = ctx.createLinearGradient(
    cx - Math.cos(rad) * r,
    cy - Math.sin(rad) * r,
    cx + Math.cos(rad) * r,
    cy + Math.sin(rad) * r,
  );
  grad.addColorStop(0, bg.from);
  grad.addColorStop(1, bg.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, doc.width, doc.height);
}

function drawShape(ctx: CanvasRenderingContext2D, el: ShapeElement): ElementBounds {
  const left = el.x - el.width / 2;
  const top = el.y - el.height / 2;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.rotate((el.rotation * Math.PI) / 180);
  ctx.fillStyle = el.fill;
  if (el.shape === "rect") {
    ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
  } else if (el.shape === "pill") {
    const radius = el.height / 2;
    ctx.beginPath();
    ctx.roundRect(-el.width / 2, -el.height / 2, el.width, el.height, radius);
    ctx.fill();
  } else if (el.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, el.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -el.height / 2);
    ctx.lineTo(el.width / 2, el.height / 2);
    ctx.lineTo(-el.width / 2, el.height / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  return { x: left, y: top, width: el.width, height: el.height };
}

function drawImage(ctx: CanvasRenderingContext2D, el: ImageElement, images: ImageMap): ElementBounds {
  const left = el.x - el.width / 2;
  const top = el.y - el.height / 2;
  ctx.save();
  ctx.beginPath();
  if (el.circle) {
    ctx.arc(el.x, el.y, el.width / 2, 0, Math.PI * 2);
  } else {
    ctx.rect(left, top, el.width, el.height);
  }
  ctx.clip();
  const source = el.src !== null ? images[el.src] : undefined;
  if (source !== undefined) {
    const sw = Number(source.width);
    const sh = Number(source.height);
    const scale = Math.max(el.width / sw, el.height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.drawImage(source, el.x - dw / 2, el.y - dh / 2, dw, dh);
  } else {
    // [WHY] An empty image slot still shows where the photo will sit.
    ctx.fillStyle = "rgba(127,127,127,0.25)";
    ctx.fillRect(left, top, el.width, el.height);
    ctx.strokeStyle = "rgba(127,127,127,0.8)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(left + 6, top + 6, el.width - 12, el.height - 12);
    ctx.setLineDash([]);
  }
  ctx.restore();
  if (el.borderColor !== null && el.borderWidth > 0) {
    ctx.strokeStyle = el.borderColor;
    ctx.lineWidth = el.borderWidth;
    ctx.beginPath();
    if (el.circle) {
      ctx.arc(el.x, el.y, el.width / 2 + el.borderWidth / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(left - el.borderWidth / 2, top - el.borderWidth / 2, el.width + el.borderWidth, el.height + el.borderWidth);
    }
    ctx.stroke();
  }
  return { x: left, y: top, width: el.width, height: el.height };
}

function drawText(ctx: CanvasRenderingContext2D, el: TextElement): ElementBounds {
  ctx.font = canvasFont(el);
  ctx.fillStyle = el.color;
  ctx.textAlign = el.align;
  ctx.textBaseline = "middle";
  const lines = wrapLines(ctx, el);
  const step = el.fontSize * el.lineHeight;
  const blockHeight = step * lines.length;
  const firstY = el.y - blockHeight / 2 + step / 2;
  let widest = 0;
  lines.forEach((line, index) => {
    widest = Math.max(widest, ctx.measureText(line).width);
    ctx.fillText(line, el.x, firstY + index * step);
  });
  const left = el.align === "center" ? el.x - widest / 2 : el.align === "right" ? el.x - widest : el.x;
  return { x: left, y: el.y - blockHeight / 2, width: widest, height: blockHeight };
}

function drawPlaceholderLabels(ctx: CanvasRenderingContext2D, doc: EditorDocument): void {
  for (const el of doc.elements) {
    if (el.kind !== "image" || el.src !== null) continue;
    const label = el.placeholder;
    if (label === "") continue;
    ctx.font = `600 ${Math.max(16, el.width * 0.06)}px "Work Sans", sans-serif`;
    ctx.fillStyle = "rgba(90,90,90,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, el.x, el.y);
  }
}

export function renderDocument(ctx: CanvasRenderingContext2D, doc: EditorDocument, images: ImageMap): RenderResult {
  const bounds: Record<string, ElementBounds> = {};
  drawBackground(ctx, doc);
  for (const el of doc.elements) {
    if (el.kind === "shape") bounds[el.id] = drawShape(ctx, el);
    else if (el.kind === "image") bounds[el.id] = drawImage(ctx, el, images);
    else bounds[el.id] = drawText(ctx, el);
  }
  drawPlaceholderLabels(ctx, doc);
  return { bounds };
}

export function hitTest(bounds: Record<string, ElementBounds>, doc: EditorDocument, x: number, y: number): string | null {
  // [WHY] Later elements draw on top, so hit testing walks the z-order backwards.
  for (let i = doc.elements.length - 1; i >= 0; i -= 1) {
    const el = doc.elements[i];
    const b = bounds[el.id];
    if (b === undefined) continue;
    if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) return el.id;
  }
  return null;
}
