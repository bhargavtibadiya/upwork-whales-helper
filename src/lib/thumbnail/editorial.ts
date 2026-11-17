import { type Box, type Brush, translucent } from "./brush";
import { skillIcon } from "./icons";
import { fieldValue } from "./model";

const value = (b: Brush, key: string) => fieldValue(b.state, key).replace(/\s+/g, " ").trim();
const white = "#f8f8fb",
  muted = "#c0bfcd";
function line(
  b: Brush,
  text: string,
  box: Box,
  size: number,
  color = white,
  align: CanvasTextAlign = "left",
  weight = 700,
): number {
  if (!text) return 0;
  const [x, y, w, h] = box,
    c = b.ctx;
  const fitted = b.fit(text, size, w, weight),
    mt = c.measureText(text);
  const asc = mt.actualBoundingBoxAscent,
    desc = mt.actualBoundingBoxDescent;
  b.text(
    text,
    align === "center" ? x + w / 2 : align === "right" ? x + w : x,
    y + (h - asc - desc) / 2 + asc,
    fitted,
    color,
    w,
    weight,
    align,
  );
  return fitted;
}
function block(
  b: Brush,
  text: string,
  box: Box,
  max: number,
  color = white,
  align: CanvasTextAlign = "left",
  vertical: "top" | "center" = "center",
): number {
  if (!text) return 0;
  const [x, y, w, h] = box;
  let size = Math.min(max * b.scale, h),
    lines: string[] = [];
  for (; size > 10; size -= 0.5) {
    b.font(size, 800);
    lines = [];
    let current = "";
    for (const word of text.split(" ")) {
      const next = current ? `${current} ${word}` : word;
      if (current && b.ctx.measureText(next).width > w) {
        lines.push(current);
        current = word;
      } else current = next;
    }
    if (current) lines.push(current);
    if (
      lines.length <= 3 &&
      lines.length * size * 1.12 <= h &&
      lines.every((l) => b.ctx.measureText(l).width <= w)
    )
      break;
  }
  const lh = size * 1.12,
    total = lines.length * lh,
    top = vertical === "top" ? y : y + (h - total) / 2;
  lines.forEach((l, i) => {
    line(b, l, [x, top + i * lh, w, lh], size, color, align, 800);
  });
  return total;
}
function headingPair(b: Brush, a: string, z: string, box: Box, max: number): void {
  if (!z) {
    block(b, a, box, max);
    return;
  }
  if (!a) {
    block(b, z, box, max, b.palette.highlight);
    return;
  }
  const [x, y, w, h] = box;
  let size = max * b.scale;
  while (size > 12) {
    b.font(size, 800);
    if (Math.max(b.ctx.measureText(a).width, b.ctx.measureText(z).width) <= w && size * 2.15 <= h)
      break;
    size -= 0.5;
  }
  const lh = size * 1.08,
    top = y + (h - 2 * lh) / 2;
  line(b, a, [x, top, w, lh], size, white, "left", 800);
  line(b, z, [x, top + lh, w, lh], size, b.palette.highlight, "left", 800);
}
function eyebrow(
  b: Brush,
  text: string,
  x: number,
  y: number,
  w: number,
  color = b.palette.highlight,
): void {
  line(b, text, [x, y, w, b.height * 0.045], 20 * b.scale, color, "left", 700);
}
function portrait(b: Brush, box: Box, circle = false): void {
  let [x, y, w, h] = box;
  circle ||= b.state.portraitShape === "circle";
  if (circle) {
    const side = Math.min(w, h);
    x += (w - side) / 2;
    y += (h - side) / 2;
    w = side;
    h = side;
  }
  const c = b.ctx;
  c.save();
  c.beginPath();
  if (circle) c.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
  else c.roundRect(x, y, w, h, b.state.portraitShape === "square" ? 0 : 20 * b.scale);
  c.clip();
  b.rect([x, y, w, h], b.palette.surface);
  b.face([x, y, w, h], "none");
  c.restore();
}
function screen(b: Brush, box: Box): void {
  b.frame(box, 16 * b.scale, 4 * b.scale);
}
function smallRule(b: Brush, x: number, y: number, w: number, color = b.palette.highlight): void {
  b.rect([x, y, w, 3 * b.scale], color);
}
function metricRows(b: Brush): string[][] {
  return [1, 2, 3]
    .map((i) => [value(b, `stat${i}v`), value(b, `stat${i}l`)])
    .filter((r) => r.some(Boolean));
}
type MetricStyle = "tiles" | "rules" | "paper" | "stack" | "capsule";
function metrics(b: Brush, box: Box, style: MetricStyle): void {
  const [x, y, w, h] = box,
    rows = metricRows(b),
    vertical = style === "stack",
    s = b.scale,
    t = b.palette;
  const gap = style === "rules" ? 0 : 16 * s,
    cw = vertical ? w : (w - gap * (rows.length - 1)) / Math.max(rows.length, 1),
    ch = vertical ? (h - gap * (rows.length - 1)) / Math.max(rows.length, 1) : h;
  const pad = Math.min(24 * s, cw * 0.12),
    labelSizes = rows.map((r) => b.fit(r[1], Math.min(22 * s, ch * 0.2), cw - pad * 2, 600));
  const numberSizes = rows.map((r) => b.fit(r[0], Math.min(58 * s, ch * 0.37), cw - pad * 2, 800));
  const ns = Math.min(...numberSizes),
    ls = Math.min(...labelSizes);
  rows.forEach(([v, l], i) => {
    const xx = x + (vertical ? 0 : i * (cw + gap)),
      yy = y + (vertical ? i * (ch + gap) : 0),
      light = style === "paper";
    if (style === "tiles")
      b.rect(
        [xx, yy, cw, ch],
        translucent(t.highlight, 0.12),
        16 * s,
        translucent(t.line, 0.35),
        s,
      );
    if (light) b.rect([xx, yy, cw, ch], "#f1f0f5", 8 * s);
    if (style === "capsule") b.rect([xx, yy, cw, ch], t.surface, ch * 0.18, t.line, s);
    if (style === "stack") {
      b.rect([xx, yy, cw, ch], translucent(t.highlight, 0.1), 12 * s);
      b.rect([xx, yy, 4 * s, ch], t.highlight, 2 * s);
    }
    if (style === "rules" && i)
      b.rect([xx, yy + ch * 0.18, s, ch * 0.64], translucent(t.line, 0.4));
    b.font(ns, 800);
    const vm = b.ctx.measureText(v),
      va = vm.actualBoundingBoxAscent,
      vd = vm.actualBoundingBoxDescent;
    b.font(ls, 600);
    const lm = b.ctx.measureText(l),
      la = lm.actualBoundingBoxAscent,
      ld = lm.actualBoundingBoxDescent;
    const g = v && l ? 14 * s : 0,
      total = (v ? va + vd : 0) + g + (l ? la + ld : 0),
      top = yy + (ch - total) / 2;
    if (v)
      b.text(
        v,
        xx + cw / 2,
        top + va,
        ns,
        light ? t.base : t.highlight,
        cw - pad * 2,
        800,
        "center",
      );
    if (l)
      b.text(
        l,
        xx + cw / 2,
        top + (v ? va + vd : 0) + g + la,
        ls,
        light ? "#575565" : muted,
        cw - pad * 2,
        600,
        "center",
      );
  });
}
function specialties(b: Brush, text: string, box: Box, numbered = false): void {
  const [x, y, w, h] = box,
    items = text
      .split(/[·,|]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 5),
    gap = 12 * b.scale,
    ch = (h - gap * (items.length - 1)) / Math.max(1, items.length),
    t = b.palette;
  items.forEach((txt, i) => {
    const yy = y + i * (ch + gap),
      r = Math.min(ch * 0.29, 19 * b.scale),
      cx = x + r,
      cy = yy + ch / 2;
    b.circle(cx, cy, r, t.accent);
    line(
      b,
      numbered ? String(i + 1) : "+",
      [cx - r, cy - r, r * 2, r * 2],
      r * 0.95,
      t.foreground,
      "center",
      800,
    );
    line(
      b,
      txt,
      [x + r * 2 + 18 * b.scale, yy, w - r * 2 - 18 * b.scale, ch],
      27 * b.scale,
      white,
      "left",
      600,
    );
    if (i < items.length - 1)
      b.rect(
        [x + r * 2 + 18 * b.scale, yy + ch + gap / 2, w - r * 2 - 18 * b.scale, b.scale],
        translucent(t.line, 0.2),
      );
  });
}

// Each layout has a separate hierarchy. Shared primitives supply measured type and insets,
// not a shared footer or repeated card composition.
export function editorial(b: Brush): void {
  const w = b.width,
    h = b.height,
    m = w * 0.06,
    cw = w - 2 * m,
    t = b.palette,
    s = b.scale,
    id = b.state.style,
    headline = value(b, "headline"),
    sub = value(b, "subline"),
    name = value(b, "name"),
    role = value(b, "role");
  b.background(w * 0.74, h * 0.4, Math.max(w, h) * 0.7);
  if (id === "stat") {
    portrait(b, [w * 0.59, h * 0.09, w * 0.35, h * 0.82]);
    eyebrow(b, "SELECTED RESULTS", m, h * 0.1, w * 0.47);
    block(b, headline, [m, h * 0.22, w * 0.47, h * 0.23], 154);
    block(b, sub, [m, h * 0.46, w * 0.47, h * 0.11], 32, muted);
    metrics(b, [m, h * 0.63, w * 0.47, h * 0.17], "rules");
    line(b, value(b, "services"), [m, h * 0.84, w * 0.47, h * 0.055], 20 * s, muted, "left", 500);
  } else if (id === "reviews") {
    portrait(b, [w * 0.62, h * 0.08, w * 0.32, h * 0.84]);
    eyebrow(b, value(b, "badge"), m, h * 0.09, w * 0.51);
    headingPair(b, headline, sub, [m, h * 0.2, w * 0.51, h * 0.32], 88);
    metrics(b, [m, h * 0.59, w * 0.51, h * 0.24], "tiles");
  } else if (id === "quote") {
    portrait(b, [w * 0.61, h * 0.09, w * 0.33, h * 0.82]);
    eyebrow(b, "CLIENT PERSPECTIVE", m, h * 0.1, w * 0.47);
    line(b, "\u201c", [m, h * 0.19, w * 0.15, h * 0.13], 132 * s, t.highlight, "left", 800);
    block(b, value(b, "quote"), [m, h * 0.31, w * 0.48, h * 0.35], 62);
    smallRule(b, m, h * 0.73, w * 0.08);
    line(b, name, [m, h * 0.77, w * 0.48, h * 0.07], 28 * s);
    line(
      b,
      value(b, "badge") ? `${value(b, "badge")} / 5 client rating` : "",
      [m, h * 0.85, w * 0.48, h * 0.04],
      18 * s,
      t.highlight,
    );
  } else if (id === "checklist") {
    portrait(b, [w * 0.61, h * 0.09, w * 0.33, h * 0.82]);
    eyebrow(b, "WHAT'S INCLUDED", m, h * 0.1, w * 0.49);
    block(b, headline, [m, h * 0.19, w * 0.49, h * 0.22], 82);
    specialties(b, value(b, "services"), [m, h * 0.47, w * 0.49, h * 0.39], true);
  } else if (id === "cover") {
    b.rect([w * 0.39, 0, w * 0.61, h], translucent(t.highlight, 0.07));
    eyebrow(b, value(b, "pill"), m, h * 0.17, w * 0.29);
    block(b, headline, [m, h * 0.26, w * 0.29, h * 0.35], 85);
    block(b, sub, [m, h * 0.66, w * 0.29, h * 0.12], 24, muted);
    screen(b, [w * 0.42, h * 0.14, w * 0.52, h * 0.72]);
  } else if (id === "duo") {
    portrait(b, [m, h * 0.09, w * 0.32, h * 0.82]);
    eyebrow(b, "IMPACT REPORT", w * 0.44, h * 0.09, w * 0.5);
    block(b, headline, [w * 0.44, h * 0.18, w * 0.5, h * 0.18], 90);
    line(b, sub, [w * 0.44, h * 0.38, w * 0.5, h * 0.06], 24 * s, muted);
    metrics(b, [w * 0.44, h * 0.51, w * 0.5, h * 0.36], "stack");
  } else if (id === "spotlight") {
    screen(b, [w * 0.4, h * 0.12, w * 0.54, h * 0.76]);
    b.rect([m, h * 0.16, w * 0.41, h * 0.66], t.surface, 22 * s, translucent(t.line, 0.3), s);
    eyebrow(b, value(b, "pill"), m + w * 0.035, h * 0.2, w * 0.34);
    block(b, headline, [m + w * 0.035, h * 0.29, w * 0.32, h * 0.23], 77);
    block(b, sub, [m + w * 0.035, h * 0.55, w * 0.32, h * 0.13], 25, muted);
    portrait(b, [m + w * 0.035, h * 0.71, h * 0.085, h * 0.085], true);
  } else if (id === "beforeafter") {
    b.rect([w * 0.48, 0, w * 0.52, h], translucent(t.highlight, 0.09));
    headingPair(b, headline, value(b, "headline2"), [m, h * 0.1, w * 0.36, h * 0.29], 86);
    block(b, sub, [m, h * 0.44, w * 0.35, h * 0.13], 29, muted);
    screen(b, [w * 0.53, h * 0.11, w * 0.41, h * 0.53]);
    metrics(b, [m, h * 0.71, cw, h * 0.19], "paper");
  } else if (id === "minimal") {
    b.rect([0, 0, w, h], t.base);
    eyebrow(b, value(b, "pill"), m, h * 0.08, w * 0.45);
    screen(b, [w * 0.22, h * 0.2, w * 0.72, h * 0.58]);
    b.rect([m, h * 0.49, w * 0.43, h * 0.33], t.accent, 14 * s);
    block(b, headline, [m + w * 0.03, h * 0.53, w * 0.37, h * 0.2], 70, t.foreground);
    line(b, sub, [m, h * 0.88, cw, h * 0.05], 23 * s, muted);
  } else if (id === "split") {
    b.rect([w * 0.56, 0, w * 0.44, h], t.accent);
    portrait(b, [w * 0.59, h * 0.07, w * 0.35, h * 0.86]);
    eyebrow(b, "INTRODUCING", m, h * 0.2, w * 0.44);
    block(b, name, [m, h * 0.3, w * 0.44, h * 0.24], 130);
    block(b, role, [m, h * 0.57, w * 0.43, h * 0.13], 38, t.highlight);
    smallRule(b, m, h * 0.77, w * 0.1);
  } else if (id === "centered") {
    const side = h * 0.48,
      px = (w - side) / 2;
    portrait(b, [px, h * 0.1, side, side], true);
    line(b, headline, [w * 0.2, h * 0.62, w * 0.6, h * 0.055], 23 * s, t.highlight, "center", 700);
    block(b, name, [w * 0.14, h * 0.69, w * 0.72, h * 0.13], 100, white, "center");
    line(b, role, [w * 0.16, h * 0.85, w * 0.68, h * 0.07], 30 * s, muted, "center", 600);
  } else if (id === "statline") {
    portrait(b, [w * 0.61, h * 0.07, w * 0.33, h * 0.63]);
    eyebrow(b, "EXPERIENCE, AT A GLANCE", m, h * 0.1, w * 0.49);
    block(b, headline, [m, h * 0.22, w * 0.49, h * 0.29], 103);
    line(b, value(b, "services"), [m, h * 0.56, w * 0.49, h * 0.07], 24 * s, muted);
    metrics(b, [m, h * 0.76, cw, h * 0.17], "rules");
  } else if (id === "tagline") {
    portrait(b, [w * 0.61, h * 0.08, w * 0.33, h * 0.84]);
    headingPair(b, headline, value(b, "headline2"), [m, h * 0.13, w * 0.49, h * 0.32], 98);
    const chips = [1, 2, 3, 4].map((i) => value(b, `chip${i}`));
    chips.forEach((txt, i) => {
      if (!txt) return;
      const xx = m + (i % 2) * w * 0.25,
        yy = h * 0.56 + Math.floor(i / 2) * h * 0.15;
      b.rect([xx, yy, w * 0.23, h * 0.11], t.surface, 12 * s, translucent(t.line, 0.4), s);
      skillIcon(b, b.state.icons[i] || "code", xx + w * 0.034, yy + h * 0.055, 15 * s);
      line(b, txt, [xx + w * 0.065, yy, w * 0.15, h * 0.11], 23 * s, white, "left", 700);
    });
  } else if (id === "editorial") {
    b.rect([0, 0, w * 0.43, h], t.accent);
    portrait(b, [m, h * 0.1, w * 0.31, h * 0.8]);
    eyebrow(b, value(b, "pill"), w * 0.49, h * 0.16, w * 0.45);
    block(b, name, [w * 0.49, h * 0.28, w * 0.45, h * 0.22], 125);
    block(b, role, [w * 0.49, h * 0.53, w * 0.45, h * 0.13], 41, t.highlight);
    smallRule(b, w * 0.49, h * 0.72, w * 0.08);
    line(b, value(b, "services"), [w * 0.49, h * 0.79, w * 0.45, h * 0.07], 24 * s, muted);
  } else if (id === "signature") {
    portrait(b, [w * 0.62, h * 0.09, w * 0.32, h * 0.56], true);
    eyebrow(b, headline, m, h * 0.13, w * 0.49);
    block(b, name, [m, h * 0.26, w * 0.49, h * 0.21], 125);
    block(b, role, [m, h * 0.5, w * 0.49, h * 0.13], 40, t.highlight);
    metrics(b, [m, h * 0.74, cw, h * 0.19], "capsule");
  }
}

const OVERLAY_ANCHORS: Record<string, [number, number]> = {
  result: [0.5, 0.66],
  stat: [0.765, 0.79],
  reviews: [0.78, 0.8],
  quote: [0.775, 0.8],
  checklist: [0.775, 0.8],
  cover: [0.68, 0.51],
  duo: [0.22, 0.8],
  spotlight: [0.76, 0.52],
  beforeafter: [0.735, 0.38],
  minimal: [0.72, 0.48],
  split: [0.765, 0.79],
  centered: [0.5, 0.55],
  statline: [0.775, 0.63],
  tagline: [0.775, 0.8],
  editorial: [0.215, 0.8],
  signature: [0.78, 0.58],
  hello: [0.77, 0.76],
  banner: [0.77, 0.81],
  proof: [0.22, 0.81],
};
export function compositionCallout(b: Brush): void {
  if (!b.state.play && !b.state.arrow) return;
  let anchor = OVERLAY_ANCHORS[b.state.style];
  if (!anchor) return;
  if (b.state.originalLayout && b.state.style === "stat") anchor = [0.24, 0.81];
  const portraitBoxes: Record<string, [number, number, number, number]> = {
    stat: [0.59, 0.09, 0.35, 0.82],
    reviews: [0.62, 0.08, 0.32, 0.84],
    quote: [0.61, 0.09, 0.33, 0.82],
    checklist: [0.61, 0.09, 0.33, 0.82],
    duo: [0.06, 0.09, 0.32, 0.82],
    split: [0.59, 0.07, 0.35, 0.86],
    statline: [0.61, 0.07, 0.33, 0.63],
    tagline: [0.61, 0.08, 0.33, 0.84],
    editorial: [0.06, 0.1, 0.31, 0.8],
  };
  const pb = portraitBoxes[b.state.style];
  if (pb && b.state.portraitShape === "circle" && !b.state.originalLayout) {
    anchor = [
      pb[0] + pb[2] / 2,
      pb[1] + pb[3] / 2 + (Math.min(pb[2] * b.width, pb[3] * b.height) * 0.34) / b.height,
    ];
  }
  const [rx, ry] = anchor,
    w = b.width,
    h = b.height,
    cx = rx * w,
    cy = ry * h,
    s = b.scale,
    r = 33 * s;
  const usePill = ["result", "proof", "stat", "reviews", "split"].includes(b.state.style),
    text = (usePill ? value(b, "pill") : b.state.calloutText).trim();
  const showLabel = b.state.overlayLabel && Boolean(text);
  let overlayLeft = cx - r,
    overlayRight = cx + r;
  if (b.state.play) {
    b.shadow("rgba(0,0,0,.35)", 18 * s, 3 * s);
    if (showLabel) {
      const labelSize = b.fit(text, 23 * s, w * 0.24, 700),
        tw = b.ctx.measureText(text).width,
        pw = tw + r * 2.6,
        xx = Math.max(w * 0.04, Math.min(w * 0.96 - pw, cx - pw / 2));
      overlayLeft = xx;
      overlayRight = xx + pw;
      b.rect([xx, cy - r, pw, r * 2], b.palette.accent, r);
      b.noShadow();
      b.play(xx + r, cy, r * 0.65, true);
      line(b, text, [xx + r * 2.1, cy - r, pw - r * 2.4, r * 2], labelSize, b.palette.foreground);
    } else {
      b.play(cx, cy, r);
      b.noShadow();
    }
  }
  if (b.state.arrow) {
    const direction = cx > w * 0.5 ? -1 : 1,
      edge = b.state.play
        ? direction < 0
          ? overlayLeft - 10 * s
          : overlayRight + 10 * s
        : cx + direction * 8 * s;
    b.arrow(
      [Math.max(18 * s, Math.min(w - 18 * s, edge + direction * 60 * s)), cy + r * 0.8],
      [edge, cy + r * 0.12],
      direction * r * 0.25,
      8 * s,
    );
  }
}
