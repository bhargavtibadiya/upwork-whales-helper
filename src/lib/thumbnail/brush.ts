import type { Crop, Palette, ThumbnailState } from "./model";

export interface ArtworkPalette {
  base: string;
  surface: string;
  glow: string;
  alpha: number;
  accent: string;
  line: string;
  foreground: string;
  arrow: string;
  highlight: string;
  triangle: string;
}
export const ARTWORK_PALETTES: Record<Palette, ArtworkPalette> = {
  purple: {
    base: "#0b0a10",
    surface: "#15111F",
    glow: "#6D3EF0",
    alpha: 0.55,
    accent: "#6D3EF0",
    line: "#A184FF",
    foreground: "#ffffff",
    arrow: "#14AE5C",
    highlight: "#A184FF",
    triangle: "#6D3EF0",
  },
  green: {
    base: "#050d0a",
    surface: "#0b1a13",
    glow: "#11843f",
    alpha: 0.62,
    accent: "#0c5a31",
    line: "#2a9a58",
    foreground: "#ffffff",
    arrow: "#FFD21F",
    highlight: "#8BE04E",
    triangle: "#0c5a31",
  },
  blue: {
    base: "#040a1c",
    surface: "#0a1736",
    glow: "#2563EB",
    alpha: 0.58,
    accent: "#1D4ED8",
    line: "#5B9BFF",
    foreground: "#ffffff",
    arrow: "#FFD21F",
    highlight: "#7CC0FF",
    triangle: "#1D4ED8",
  },
  black: {
    base: "#070707",
    surface: "#141414",
    glow: "#d8d2b0",
    alpha: 0.13,
    accent: "#FFD60A",
    line: "#FFD60A",
    foreground: "#111111",
    arrow: "#FFD60A",
    highlight: "#FFD60A",
    triangle: "#111111",
  },
};
export type Box = readonly [number, number, number, number];
export function translucent(hex: string, opacity: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`;
}
export function blend(hex: string, target: string, amount: number): string {
  const a = Number.parseInt(hex.slice(1), 16),
    b = Number.parseInt(target.slice(1), 16);
  return `#${[16, 8, 0]
    .map((shift) =>
      Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
export function cropPlacement(
  sourceWidth: number,
  sourceHeight: number,
  box: Box,
  crop: Pick<Crop, "zoom" | "x" | "y">,
): Box {
  const [x, y, w, h] = box;
  const scale = (Math.max(w / sourceWidth, h / sourceHeight) * crop.zoom) / 100;
  const dw = sourceWidth * scale,
    dh = sourceHeight * scale;
  return [x - ((dw - w) * crop.x) / 100, y - ((dh - h) * crop.y) / 100, dw, dh];
}
export class Brush {
  constructor(
    public ctx: CanvasRenderingContext2D,
    public state: ThumbnailState,
    public width: number,
    public height: number,
  ) {}
  get scale(): number {
    return Math.min(this.width / 1000, this.height / 750);
  }
  get palette(): ArtworkPalette {
    return ARTWORK_PALETTES[this.state.palette];
  }
  rect(box: Box, fill: string | CanvasGradient, radius = 0, stroke?: string, lineWidth = 0): void {
    const c = this.ctx;
    c.beginPath();
    c.roundRect(...box, radius);
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = lineWidth;
      c.stroke();
    }
  }
  circle(
    x: number,
    y: number,
    r: number,
    fill: string | CanvasGradient,
    stroke?: string,
    lineWidth = 0,
  ): void {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = lineWidth;
      c.stroke();
    }
  }
  font(size: number, weight = 700, family = "Montserrat"): void {
    this.ctx.font = `${weight} ${size}px ${family}, Arial, sans-serif`;
  }
  fit(text: string, size: number, width: number, weight = 700, family = "Montserrat"): number {
    this.font(size, weight, family);
    const measured = this.ctx.measureText(text).width;
    const fitted =
      measured > width ? Math.max(6, Math.floor(((size * width) / measured) * 100) / 100) : size;
    this.font(fitted, weight, family);
    return fitted;
  }
  cap(): number {
    return this.ctx.measureText("H").actualBoundingBoxAscent;
  }
  text(
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
    width = Infinity,
    weight = 700,
    align: CanvasTextAlign = "left",
    family = "Montserrat",
  ): number {
    const c = this.ctx;
    this.fit(text, size, width, weight, family);
    c.fillStyle = color;
    c.textAlign = align;
    c.fillText(text, x, y);
    c.textAlign = "left";
    return this.cap();
  }
  shadow(color: string, blur: number, y = 0): void {
    const c = this.ctx;
    c.shadowColor = color;
    c.shadowBlur = blur;
    c.shadowOffsetY = y;
  }
  noShadow(): void {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
  }
  background(cx: number, cy: number, radius: number): void {
    const c = this.ctx,
      t = this.palette,
      w = this.width,
      h = this.height;
    c.fillStyle = t.base;
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.028)";
    for (const polygon of [
      [
        [0, h * 0.08],
        [w * 0.32, 0],
        [w * 0.58, 0],
        [0, h * 0.62],
      ],
      [
        [w, h * 0.12],
        [w, h * 0.58],
        [w * 0.72, h],
        [w * 0.42, h],
      ],
    ]) {
      c.beginPath();
      polygon.forEach(([x, y], i) => {
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      });
      c.closePath();
      c.fill();
    }
    c.save();
    c.translate(cx, cy);
    c.scale(1.35, 1);
    const glow = c.createRadialGradient(0, 0, 0, 0, 0, radius);
    for (const [stop, alpha] of [
      [0, t.alpha],
      [0.45, t.alpha * 0.42],
      [1, 0],
    ])
      glow.addColorStop(stop, translucent(t.glow, alpha));
    c.fillStyle = glow;
    c.fillRect(-cx / 1.35, -cy, w / 1.35, h);
    c.restore();
    const shade = c.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.35,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78,
    );
    shade.addColorStop(0, "transparent");
    shade.addColorStop(1, "rgba(0,0,0,.5)");
    c.fillStyle = shade;
    c.fillRect(0, 0, w, h);
  }
  cover(crop: Crop, box: Box): void {
    if (!crop.image) return;
    this.ctx.drawImage(
      crop.image,
      ...cropPlacement(crop.image.naturalWidth, crop.image.naturalHeight, box, crop),
    );
  }
  placeholder(box: Box): void {
    const [x, y, w, h] = box,
      c = this.ctx,
      s = this.scale;
    const cx = x + w / 2,
      r = Math.min(w * 0.2, h * 0.15),
      cy = y + h * 0.42;
    c.fillStyle = "rgba(255,255,255,0.17)";
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.fill();
    const sw = Math.min(w * 0.86, r * 4.4),
      top = cy + r * 1.3;
    c.beginPath();
    c.roundRect(cx - sw / 2, top, sw, y + h - top + 80 * s, [r * 1.6, r * 1.6, 0, 0]);
    c.fill();
    this.text(
      "Your photo here",
      cx,
      cy - r - 26 * s,
      26 * s,
      "rgba(255,255,255,0.72)",
      w - 40 * s,
      700,
      "center",
    );
  }
  face(box: Box, fade: "left" | "right" | "none" = "none", round = false): void {
    const [x, y, w, h] = box;
    const layer = document.createElement("canvas");
    layer.width = Math.ceil(w);
    layer.height = Math.ceil(h);
    const c = layer.getContext("2d");
    if (!c) return;
    const b = new Brush(c, this.state, this.width, this.height);
    if (round) {
      const glow = c.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h / 2, w / 2);
      glow.addColorStop(0, translucent(this.palette.glow, 0.6));
      glow.addColorStop(1, translucent(this.palette.glow, 0.14));
      c.fillStyle = glow;
      c.fillRect(0, 0, w, h);
    }
    if (this.state.face.image) b.cover(this.state.face, [0, 0, w, h]);
    else b.placeholder([0, 0, w, h]);
    c.globalCompositeOperation = "destination-in";
    if (round) {
      c.beginPath();
      c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
      c.fillStyle = "#000";
      c.fill();
    } else if (fade !== "none") {
      const g = c.createLinearGradient(
        fade === "left" ? 0 : w * 0.7,
        0,
        fade === "left" ? w * 0.3 : w,
        0,
      );
      g.addColorStop(0, fade === "left" ? "transparent" : "#000");
      g.addColorStop(1, fade === "left" ? "#000" : "transparent");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
    this.ctx.drawImage(layer, x, y);
  }
  frame(box: Box, radius: number, border: number, shift = 0, visibleHeight?: number): void {
    const [x, y, w, h] = box,
      c = this.ctx,
      s = this.scale;
    this.shadow("rgba(0,0,0,.55)", 44 * s, 14 * s);
    this.rect(box, "#F5F5F7", radius);
    this.noShadow();
    c.save();
    c.beginPath();
    c.roundRect(
      x + border,
      y + border,
      w - border * 2,
      h - border * 2,
      Math.max(2, radius - border),
    );
    c.clip();
    const inside: Box = [
      x + border,
      y + border,
      w - border * 2,
      Math.min(h - border * 2, visibleHeight ? visibleHeight - border : h),
    ];
    if (this.state.shot.image) {
      c.fillStyle = "#fff";
      c.fillRect(x, y, w, h);
      this.cover(this.state.shot, inside);
    } else {
      c.fillStyle = "#ECEAF3";
      c.fillRect(x, y, w, h);
      const [ix, iy, iw, ih] = inside,
        k = Math.min(1, ih / (300 * s)),
        inset = 16 * s;
      c.strokeStyle = "#B9B2CE";
      c.lineWidth = 3 * s;
      c.setLineDash([14 * s, 10 * s]);
      c.beginPath();
      c.roundRect(ix + inset, iy + inset, iw - inset * 2, ih - inset * 2, 12 * s);
      c.stroke();
      c.setLineDash([]);
      const cx = ix + iw / 2,
        cy = iy + ih / 2 - 26 * s * k + shift,
        iconW = 92 * s * k,
        iconH = 68 * s * k;
      this.rect(
        [cx - iconW / 2, cy - iconH / 2, iconW, iconH],
        "transparent",
        10 * s * k,
        "#8F87AA",
        5 * s * k,
      );
      this.circle(cx + iconW * 0.2, cy - iconH * 0.14, 7 * s * k, "#8F87AA");
      c.fillStyle = "#8F87AA";
      c.beginPath();
      for (const [i, point] of [
        [cx - iconW / 2 + 9 * s * k, cy + iconH / 2 - 9 * s * k],
        [cx - iconW * 0.1, cy],
        [cx + iconW * 0.08, cy + iconH * 0.2],
        [cx + iconW * 0.24, cy + iconH * 0.06],
        [cx + iconW / 2 - 9 * s * k, cy + iconH / 2 - 9 * s * k],
      ].entries()) {
        if (i) c.lineTo(point[0], point[1]);
        else c.moveTo(point[0], point[1]);
      }
      c.closePath();
      c.fill();
      this.text(
        "Your screenshot here",
        cx,
        cy + iconH / 2 + 46 * s * k,
        30 * s * Math.max(0.75, k),
        "#6B6385",
        iw - 60 * s,
        700,
        "center",
      );
    }
    c.restore();
  }
  play(
    cx: number,
    cy: number,
    r: number,
    outline = false,
    background?: string,
    foreground?: string,
  ): void {
    const c = this.ctx,
      t = this.palette,
      s = this.scale,
      fg = foreground ?? (outline ? t.foreground : t.triangle);
    c.save();
    if (outline) {
      this.circle(cx, cy, r - r * 0.07, "transparent", fg, r * 0.14);
    } else {
      this.shadow("rgba(0,0,0,.4)", 24 * s, 6 * s);
      this.circle(cx, cy, r, background ?? "rgba(255,255,255,.96)");
      this.noShadow();
    }
    const left = outline ? -0.24 : -0.26,
      tip = outline ? 0.42 : 0.44,
      top = outline ? 0.38 : 0.4;
    c.lineJoin = "round";
    c.lineWidth = r * (outline ? 0.1 : 0.12);
    c.fillStyle = fg;
    c.strokeStyle = fg;
    c.beginPath();
    c.moveTo(cx + r * left, cy - r * top);
    c.lineTo(cx + r * left, cy + r * top);
    c.lineTo(cx + r * tip, cy);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }
  star(cx: number, cy: number, r: number, color: string): void {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r * 0.48 : r;
      const x = cx + Math.cos(a) * rr,
        y = cy + Math.sin(a) * rr;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.closePath();
    c.fill();
  }
  arrow(from: [number, number], to: [number, number], bend: number, width: number): void {
    const c = this.ctx,
      dx = to[0] - from[0],
      dy = to[1] - from[1],
      length = Math.hypot(dx, dy) || 1;
    const control = [
      (from[0] + to[0]) / 2 + (dy * bend) / length,
      (from[1] + to[1]) / 2 - (dx * bend) / length,
    ];
    const at = (t: number): [number, number] => [
      (1 - t) ** 2 * from[0] + 2 * t * (1 - t) * control[0] + t * t * to[0],
      (1 - t) ** 2 * from[1] + 2 * t * (1 - t) * control[1] + t * t * to[1],
    ];
    const headLength = width * 2.3,
      headHalf = width * 1.25;
    let stop = 1;
    for (let sample = 200; sample > 0; sample--) {
      const t = sample / 200,
        p = at(t);
      if (Math.hypot(to[0] - p[0], to[1] - p[1]) >= headLength) {
        stop = t;
        break;
      }
    }
    const sides: [number, number][][] = [[], []];
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * stop,
        p = at(t),
        tx = 2 * (1 - t) * (control[0] - from[0]) + 2 * t * (to[0] - control[0]),
        ty = 2 * (1 - t) * (control[1] - from[1]) + 2 * t * (to[1] - control[1]),
        len = Math.hypot(tx, ty) || 1,
        half = (width * (0.32 + (0.68 * i) / 40)) / 2;
      for (const sign of [-1, 1])
        sides[sign === -1 ? 0 : 1].push([
          p[0] + ((sign * ty) / len) * half,
          p[1] - ((sign * tx) / len) * half,
        ]);
    }
    const base = at(stop),
      ux = (to[0] - base[0]) / headLength,
      uy = (to[1] - base[1]) / headLength;
    const shapes = [
      sides[0].concat(sides[1].toReversed()),
      [
        [base[0] - uy * headHalf, base[1] + ux * headHalf],
        to,
        [base[0] + uy * headHalf, base[1] - ux * headHalf],
      ],
    ];
    c.save();
    c.lineJoin = "round";
    c.lineCap = "round";
    this.shadow("rgba(0,0,0,.45)", 14 * this.scale, 4 * this.scale);
    const trace = (points: number[][]) => {
      c.beginPath();
      points.forEach(([x, y], i) => {
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      });
      c.closePath();
    };
    c.strokeStyle = "#141006";
    c.lineWidth = width * 0.34;
    for (const shape of shapes) {
      trace(shape);
      c.stroke();
    }
    c.shadowColor = "transparent";
    c.fillStyle = this.palette.arrow;
    for (const shape of shapes) {
      trace(shape);
      c.fill();
    }
    c.restore();
  }
}
