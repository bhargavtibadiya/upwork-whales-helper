import { Brush, blend, translucent } from "./brush";
import { compositionCallout, editorial } from "./editorial";
import { desktopFrame, playCenter } from "./geometry";
import { skillIcon } from "./icons";
import { dimensions, fieldValue, type Style, setField, type ThumbnailState } from "./model";

function words(b: Brush, key: string, style: Style = b.state.style): string {
  return fieldValue(b.state, key, style).replace(/\s+/g, " ").trim();
}
function statRows(b: Brush, count = 3): [string, string][] {
  return Array.from({ length: count }, (_, i): [string, string] => [
    words(b, `stat${i + 1}v`),
    words(b, `stat${i + 1}l`),
  ]).filter((row) => row.some(Boolean));
}
function service(
  b: Brush,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  opacity = 0.38,
): void {
  const s = b.scale,
    c = b.ctx;
  b.rect([x, y, w, h], `rgba(0,0,0,${opacity})`, h / 2);
  c.beginPath();
  c.roundRect(x + 1.5 * s, y + 1.5 * s, w - 3 * s, h - 3 * s, h / 2);
  c.strokeStyle = b.palette.line;
  c.lineWidth = 3 * s;
  c.stroke();
  const fitted = b.fit(text, size, w - 56 * s, 600);
  b.text(text, x + w / 2, y + h / 2 + b.cap() / 2, fitted, "#fff", Infinity, 600, "center");
}
function wrapped(b: Brush, text: string, maxWidth: number): string[] {
  const chunks = text.split(" "),
    out: string[] = [];
  let line = "";
  for (const chunk of chunks) {
    const next = line ? `${line} ${chunk}` : chunk;
    if (line && out.length === 0 && b.ctx.measureText(next).width > maxWidth) {
      out.push(line);
      line = chunk;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}
function meet(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w * 0.24, h * 0.5, Math.max(w, h) * 0.36);
  const fade = c.createLinearGradient(0, h * 0.5, 0, h);
  fade.addColorStop(0, "transparent");
  fade.addColorStop(1, "rgba(0,0,0,.78)");
  b.face([0, 0, w * 0.5, h], "right");
  c.fillStyle = fade;
  c.fillRect(0, h * 0.5, w * 0.56, h * 0.5);
  const x = w * 0.5,
    cw = w - m - x;
  const title = words(b, "headline").toUpperCase();
  let cap = 0,
    left = x;
  if (title) {
    b.fit(title, 108 * s, cw, 800);
    cap = b.cap();
    left = x + (cw - c.measureText(title).width) / 2;
  }
  const border = 6 * s;
  const chrome = b.state.browserFrame ? 38 * s : 0;
  const fitted = desktopFrame([x, m, cw, h - 2 * m - (title ? cap + 34 * s : 0)], border, chrome);
  const total = fitted[3] + (title ? cap + 34 * s : 0);
  const top = (h - total) / 2;
  if (title) {
    b.shadow("rgba(0,0,0,.35)", 22 * s, 4 * s);
    b.text(title, left, top + cap, 108 * s, "#fff", cw, 800);
    b.noShadow();
  }
  const box = [fitted[0], top + (title ? cap + 34 * s : 0), fitted[2], fitted[3]] as const;
  b.frame(box, 16 * s, border);
  const [px, py] = playCenter(
    w,
    h,
    box[0] + box[2] / 2,
    box[1] + box[3] / 2,
    50 * s,
    ...b.overlayOffsets(),
  );
  if (b.bareOverlayOn()) b.play(px, py, 50 * s);
  if (b.state.arrow && title)
    b.arrow(
      [left - 18 * s, top + cap * 0.5],
      b.bareOverlayOn() ? [px - 66 * s, py] : [box[0] + box[2] * 0.3, box[1] + box[3] * 0.35],
      -150 * s,
      24 * s,
    );
  let bottom = h - m;
  const role = words(b, "role"),
    name = words(b, "name"),
    max = w * 0.46 - m;
  if (role) {
    const size = b.fit(role, 25 * s, max - 40 * s, 600),
      rc = b.cap(),
      rw = c.measureText(role).width,
      rh = rc + 30 * s;
    b.rect([m, bottom - rh, rw + 40 * s, rh], t.accent, rh / 2);
    b.text(role, m + 20 * s, bottom - rh / 2 + rc / 2, size, t.foreground, Infinity, 600);
    bottom -= rh + 18 * s;
  }
  if (name) {
    b.font(64 * s, 700);
    const prefix = c.measureText("Meet ").width;
    b.font(64 * s, 900);
    const nw = c.measureText(name).width;
    const size = Math.min(64 * s, (64 * s * max) / (prefix + nw));
    b.font(size, 700);
    const pw = c.measureText("Meet ").width;
    b.shadow("rgba(0,0,0,.6)", 18 * s, 3 * s);
    b.text("Meet ", m, bottom, size, "#fff", Infinity, 700);
    b.text(name, m + pw, bottom, size, t.highlight, Infinity, 900);
    b.noShadow();
  }
}
function hello(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx;
  b.background(w * 0.5, h * 0.5, Math.max(w, h) * 0.48);
  const r = Math.min(h * 0.34, w * 0.21),
    cx = w - 82 * s - r,
    cy = h / 2;
  b.circle(cx, cy, r + 26 * s, "transparent", translucent(t.highlight, 0.2), 2 * s);
  b.shadow(translucent(t.highlight, 0.75), 56 * s);
  b.circle(cx, cy, r, t.surface);
  b.noShadow();
  b.face([cx - r, cy - r, r * 2, r * 2], "none", true);
  b.shadow(translucent(t.highlight, 0.9), 26 * s);
  b.circle(cx, cy, r - 4 * s, "transparent", t.highlight, 8 * s);
  b.noShadow();
  const max = w * 0.47 - 60 * s;
  const headline = words(b, "headline"),
    name = words(b, "name"),
    role = words(b, "role");
  const items = [
    { text: headline, size: 320 * s, weight: 900, color: "#fff" },
    { text: name, size: 62 * s, weight: 800, color: "#fff" },
    { text: role, size: 30 * s, weight: 600, color: t.highlight },
  ].map((item, index) => {
    const size = b.fit(item.text, item.size, max, item.weight);
    const metrics = c.measureText(item.text);
    return {
      ...item,
      size,
      ascent: index === 0 ? metrics.actualBoundingBoxAscent : b.cap(),
      descent: index === 0 ? Math.max(0, metrics.actualBoundingBoxDescent) : 0,
      left: metrics.actualBoundingBoxLeft,
      width:
        index === 0
          ? metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
          : metrics.width,
    };
  });
  const gap1 = headline && (name || role) ? 48 * s : 0,
    gap2 = name && role ? 22 * s : 0;
  const total =
    items.reduce((sum, item) => sum + (item.text ? item.ascent + item.descent : 0), 0) +
    gap1 +
    gap2;
  const x = 60 * s + (max - Math.max(...items.map((item) => item.width))) / 2;
  let y = (h - total) / 2;
  items.forEach((item, index) => {
    if (!item.text) return;
    const xx = x + (index === 0 ? item.left : 0);
    if (index === 0) {
      b.shadow(translucent(t.highlight, 0.8), 64 * s);
      b.text(item.text, xx, y + item.ascent, item.size, item.color, Infinity, item.weight);
      b.shadow(translucent(t.highlight, 0.9), 16 * s);
    } else if (index === 1) b.shadow("rgba(0,0,0,.5)", 16 * s, 3 * s);
    b.text(item.text, xx, y + item.ascent, item.size, item.color, Infinity, item.weight);
    b.noShadow();
    y += item.ascent + item.descent + (index === 0 ? gap1 : index === 1 ? gap2 : 0);
  });
}
function proof(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx;
  b.background(w * 0.66, h * 0.42, Math.max(w, h) * 0.42);
  b.face([0, 0, w * 0.48, h], "right");
  const x = w * 0.45,
    cw = w - 46 * s - x,
    cx = x + cw / 2,
    rows = statRows(b, 3),
    n = rows.length;
  const label = words(b, "pill").toUpperCase(),
    svc = words(b, "services"),
    hasPill = Boolean(label || b.overlayOn());
  const ph = hasPill ? 108 * s : 0,
    pad = 30 * s,
    ir = b.overlayOn() ? 35.64 * s : 0,
    ig = b.overlayOn() && label ? 18 * s : 0,
    iw = b.overlayOn() ? ir * 2 + ig : 0;
  const psize = b.fit(label, 80 * s, cw - pad * 2 - iw, 800),
    pw = c.measureText(label).width + iw + pad * 2;
  const bw = n ? Math.min(270 * s, (cw - 18 * s * (n - 1)) / n) : 0,
    inner = bw - 44 * s;
  let vs = 80 * s,
    ls = 23 * s;
  for (const [v] of rows) if (v) vs = Math.min(vs, b.fit(v, 80 * s, inner, 400, "Anton"));
  b.font(ls, 600);
  for (const [, labelText] of rows)
    for (const line of wrapped(b, labelText, inner)) {
      const mw = c.measureText(line).width;
      if (mw > inner) ls = Math.min(ls, (23 * s * inner) / mw);
    }
  b.font(ls, 600);
  const labs = rows.map(([, labelText]) => wrapped(b, labelText, inner)),
    lc = b.cap(),
    lh = lc * 1.5;
  b.font(vs, 400, "Anton");
  const vc = b.cap(),
    lines = Math.max(0, ...labs.map((a) => a.length)),
    hasVal = rows.some((a) => a[0]);
  const content = (hasVal ? vc : 0) + (lines ? (hasVal ? 20 * s : 0) + lc + (lines - 1) * lh : 0),
    bh = n ? Math.max(178 * s, content + 72 * s) : 0;
  const sh = svc ? 66 * s : 0,
    ss = b.fit(svc, 26 * s, cw - 70 * s, 600),
    sw = svc ? Math.min(cw, Math.max(c.measureText(svc).width + 90 * s, cw * 0.62)) : 0;
  const heights = [ph, bh, sh].filter(Boolean),
    sum = heights.reduce((a, b) => a + b, 0),
    gap =
      heights.length > 1
        ? Math.min(56 * s, Math.max(26 * s, (h - 92 * s - sum) / (heights.length - 1)))
        : 0;
  let y = (h - sum - gap * (heights.length - 1)) / 2;
  if (hasPill) {
    b.shadow("rgba(0,0,0,.4)", 30 * s, 8 * s);
    b.rect([cx - pw / 2, y, pw, ph], t.accent, 24 * s);
    b.noShadow();
    let xx = cx - pw / 2 + pad;
    if (b.overlayOn()) {
      b.play(xx + ir, y + ph / 2, ir, true);
      xx += iw;
    }
    b.font(psize, 800);
    b.text(label, xx, y + ph / 2 + b.cap() / 2, psize, t.foreground, Infinity, 800);
    y += ph + gap;
  }
  rows.forEach(([value], i) => {
    const xx = cx - (n * bw + (n - 1) * 18 * s) / 2 + i * (bw + 18 * s);
    b.shadow(translucent(t.line, 0.5), 26 * s);
    b.rect([xx, y, bw, bh], t.surface, 20 * s);
    b.noShadow();
    const g = c.createLinearGradient(0, y, 0, y + bh);
    g.addColorStop(0, translucent(t.glow, 0.32));
    g.addColorStop(1, translucent(t.glow, 0.05));
    b.rect([xx + 1.5 * s, y + 1.5 * s, bw - 3 * s, bh - 3 * s], g, 18.5 * s, t.line, 3 * s);
    let yy = y + (bh - content) / 2;
    if (hasVal) {
      b.shadow("rgba(0,0,0,.35)", 14 * s);
      b.text(value, xx + bw / 2, yy + vc, vs, "#fff", Infinity, 400, "center", "Anton");
      b.noShadow();
      yy += vc + (lines ? 20 * s : 0);
    }
    labs[i].forEach((line, k) => {
      b.text(
        line,
        xx + bw / 2,
        yy + lc + k * lh,
        ls,
        "rgba(255,255,255,.82)",
        Infinity,
        600,
        "center",
      );
    });
  });
  if (n) y += bh + gap;
  if (svc) service(b, svc, cx - sw / 2, y, sw, sh, ss);
}
function banner(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx;
  b.background(w * 0.75, h * 0.42, Math.max(w, h) * 0.38);
  if (b.state.backdrop !== "clean") {
    const grid = c.createLinearGradient(w * 0.3, 0, w, 0);
    grid.addColorStop(0, translucent(t.line, 0));
    grid.addColorStop(1, translucent(t.line, 0.14));
    c.strokeStyle = grid;
    c.lineWidth = Math.max(1, 1.2 * s);
    c.beginPath();
    for (let x = w * 0.3 + 56 * s; x <= w; x += 56 * s) {
      c.moveTo(x, 0);
      c.lineTo(x, h);
    }
    for (let y = 28 * s; y <= h; y += 56 * s) {
      c.moveTo(w * 0.3, y);
      c.lineTo(w, y);
    }
    c.stroke();
  }
  b.face([w * 0.5, 0, w * 0.5, h], "left");
  const x = 54 * s,
    cw = w * 0.55 - x;
  const l1 = words(b, "headline").toUpperCase(),
    l2 = words(b, "headline2").toUpperCase(),
    tag = words(b, "subline").toUpperCase(),
    b1 = words(b, "badge").toUpperCase(),
    b2 = words(b, "badge2");
  const p2 = b.fit(l2, 124 * s, cw, 900),
    c2 = l2 ? b.cap() : 0,
    p1 = b.fit(l1, l2 ? Math.min(86 * s, p2 * 0.82) : 112 * s, cw, 800),
    c1 = l1 ? b.cap() : 0;
  let y = 52 * s;
  b.shadow("rgba(0,0,0,.5)", 20 * s, 4 * s);
  if (l1) {
    b.text(l1, x, y + c1, p1, "#fff", Infinity, 800);
    y += c1 + (l2 ? 22 * s : 0);
  }
  if (l2) {
    b.text(l2, x, y + c2, p2, t.highlight, Infinity, 900);
    y += c2;
  }
  b.noShadow();
  if (tag) {
    b.shadow("rgba(0,0,0,.4)", 18 * s, 5 * s);
    y += l1 || l2 ? 32 * s : 0;
    let tp = 21 * s;
    b.font(tp, 700);
    const tracked = (text: string, space: number) =>
      Array.from(text).reduce((sum, ch) => sum + c.measureText(ch).width, 0) +
      Math.max(0, Array.from(text).length - 1) * space;
    const max = cw - 72 * s;
    if (tracked(tag, tp * 0.16) > max) {
      tp = (tp * max) / tracked(tag, tp * 0.16);
      b.font(tp, 700);
    }
    const tw = tracked(tag, tp * 0.16) + 72 * s;
    c.fillStyle = t.accent;
    c.beginPath();
    c.moveTo(x + 16 * s, y);
    c.lineTo(x + tw, y);
    c.lineTo(x + tw - 16 * s, y + 52 * s);
    c.lineTo(x, y + 52 * s);
    c.closePath();
    c.fill();
    b.noShadow();
    let xx = x + 36 * s;
    c.fillStyle = t.foreground;
    for (const ch of tag) {
      c.fillText(ch, xx, y + 26 * s + b.cap() / 2);
      xx += c.measureText(ch).width + tp * 0.16;
    }
    y += 52 * s;
  }
  const chips = [1, 2, 3, 4]
    .map((i) => ({ text: words(b, `chip${i}`).toUpperCase(), icon: b.state.icons[i - 1] }))
    .filter((item) => item.text);
  const badgeH = b1 || b2 ? 96 * s : 0,
    badgeY = h - 48 * s - badgeH;
  const cell = cw / Math.max(3, chips.length);
  let cp = 18 * s;
  for (const chip of chips) cp = Math.min(cp, b.fit(chip.text, 18 * s, cell - 16 * s, 700));
  b.font(cp, 700);
  const cc = b.cap(),
    rh = 88 * s + 18 * s + cc,
    top = y + Math.max(24 * s, ((badgeH ? badgeY : h - 48 * s) - y - rh) / 2);
  chips.forEach((chip, i) => {
    const cx = x + cell * (i + 0.5),
      cy = top + 44 * s;
    b.shadow(translucent(t.line, 0.55), 22 * s);
    b.circle(cx, cy, 44 * s, t.surface);
    b.noShadow();
    const g = c.createRadialGradient(cx, cy - 22 * s, 0, cx, cy, 44 * s);
    g.addColorStop(0, translucent(t.glow, 0.42));
    g.addColorStop(1, translucent(t.glow, 0.08));
    b.circle(cx, cy, 42.75 * s, g, t.line, 2.5 * s);
    skillIcon(b, chip.icon, cx, cy, 43.12 * s);
    b.text(chip.text, cx, cy + 44 * s + 18 * s + cc, cp, "#fff", Infinity, 700, "center");
    if (i) {
      c.fillStyle = translucent(t.line, 0.3);
      c.fillRect(x + cell * i - s, cy - 33 * s, 2 * s, 77 * s + 18 * s + cc);
    }
  });
  if (badgeH) {
    const pp1 = b.fit(b1, 34 * s, cw * 0.62, 800),
      bc1 = b1 ? b.cap() : 0,
      tw1 = c.measureText(b1).width,
      pp2 = b.fit(b2, 22 * s, cw * 0.62, 600),
      bc2 = b2 ? b.cap() : 0;
    const bw = 128 * s + Math.max(tw1, c.measureText(b2).width);
    b.shadow("rgba(0,0,0,.45)", 24 * s, 6 * s);
    b.rect([x, badgeY, bw, badgeH], "rgba(0,0,0,.5)", 20 * s);
    b.noShadow();
    c.beginPath();
    c.roundRect(x + 1.25 * s, badgeY + 1.25 * s, bw - 2.5 * s, badgeH - 2.5 * s, 19 * s);
    c.strokeStyle = translucent(t.highlight, 0.7);
    c.lineWidth = 2.5 * s;
    c.stroke();
    b.circle(x + 52 * s, badgeY + 48 * s, 30 * s, translucent(t.highlight, 0.16));
    b.star(x + 52 * s, badgeY + 49.5 * s, 19.2 * s, t.highlight);
    let yy = badgeY + 48 * s - (bc1 + bc2 + (b1 && b2 ? 14 * s : 0)) / 2;
    if (b1) {
      b.text(b1, x + 100 * s, yy + bc1, pp1, t.highlight, Infinity, 800);
      yy += bc1 + (b2 ? 14 * s : 0);
    }
    if (b2) b.text(b2, x + 100 * s, yy + bc2, pp2, "rgba(255,255,255,.88)", Infinity, 600);
  }
}
function profile(b: Brush): void {
  const { width: w, height: h } = b,
    c = b.ctx,
    s = b.scale,
    r = b.state.ring;
  const outer = Math.min(w, h) / 2,
    thick = r.thickness * s,
    gap = r.gap === "none" ? 0 : Math.max(9 * s, thick * 0.26),
    inner = outer - thick,
    photo = inner - gap;
  let fill: string | CanvasGradient = r.color;
  if (r.gradient) {
    const g = c.createLinearGradient(0, 0, w, h);
    const gradients: Record<string, readonly [string, string]> = {
      toprated: ["#4D94F8", "#1F57C3"],
      trplus: ["#F45AA0", "#BF1363"],
      whales: ["#A184FF", "#6D3EF0"],
      rising: ["#3EC520", "#0D8A00"],
      gold: ["#FFC53D", "#D9850B"],
      red: ["#F8547C", "#B4123A"],
      teal: ["#2DD4BF", "#0F766E"],
      orange: ["#FB923C", "#C2410C"],
    };
    const stops = gradients[r.preset] ?? [
      blend(r.color, "#ffffff", 0.32),
      blend(r.color, "#000000", 0.22),
    ];
    g.addColorStop(0, stops[0]);
    g.addColorStop(1, stops[1]);
    fill = g;
  }
  b.rect([0, 0, w, h], fill);
  if (gap) b.circle(w / 2, h / 2, inner, r.gap === "dark" ? "#15111F" : "#fff");
  c.save();
  c.beginPath();
  c.arc(w / 2, h / 2, photo, 0, Math.PI * 2);
  c.clip();
  const bg = r.backgroundMode === "keep" ? "#E4E1EC" : r.background;
  let background: string | CanvasGradient = bg;
  if (r.backgroundMode === "gradient") {
    const g = c.createRadialGradient(w / 2, h / 2 - photo * 0.3, 0, w / 2, h / 2, photo * 1.05);
    g.addColorStop(0, blend(bg, "#ffffff", 0.55));
    g.addColorStop(0.6, bg);
    g.addColorStop(1, blend(bg, "#000000", 0.18));
    background = g;
  }
  b.rect([0, 0, w, h], background);
  if (b.state.face.image)
    b.cover(b.state.face, [w / 2 - photo, h / 2 - photo, photo * 2, photo * 2]);
  else {
    const rgb = Number.parseInt(bg.slice(1), 16),
      light = ((rgb >> 16) & 255) * 0.299 + ((rgb >> 8) & 255) * 0.587 + (rgb & 255) * 0.114 > 150;
    const head = photo * 0.34,
      hy = h / 2 - photo * 0.12;
    b.circle(w / 2, hy, head, light ? "rgba(21,17,31,.13)" : "rgba(255,255,255,.17)");
    const top = hy + head * 1.28;
    b.rect(
      [w / 2 - head * 2.1, top, head * 4.2, h / 2 + photo - top + 20 * s],
      light ? "rgba(21,17,31,.13)" : "rgba(255,255,255,.17)",
      head * 1.6,
    );
    b.text(
      "Your photo here",
      w / 2,
      hy - head - 36 * s,
      40 * s,
      light ? "rgba(21,17,31,.55)" : "rgba(255,255,255,.75)",
      photo * 1.2,
      700,
      "center",
    );
  }
  c.restore();
}
function result(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w / 2, h * 0.36, Math.max(w, h) * 0.42);
  const max = w - 2 * (m + (b.state.arrow ? 92 * s : 0));
  const pill = words(b, "pill").toUpperCase(),
    title = words(b, "headline").toUpperCase(),
    sub = words(b, "subline");
  let y = 26 * s,
    pr = w / 2;
  const has = Boolean(pill || b.overlayOn());
  if (has) {
    const ir = 40.6 * s,
      iw = b.overlayOn() ? ir * 2 + (pill ? 20 * s : 0) : 0,
      px = b.fit(pill, 88 * s, max - 64 * s - iw, 800),
      pw = c.measureText(pill).width + iw + 64 * s,
      x = (w - pw) / 2;
    pr = x + pw;
    b.shadow("rgba(0,0,0,.4)", 30 * s, 8 * s);
    b.rect([x, 38 * s, pw, 116 * s], t.accent, 24 * s);
    b.noShadow();
    let xx = x + 32 * s;
    if (b.overlayOn()) {
      b.play(xx + ir, 96 * s, ir, true);
      xx += iw;
    }
    b.font(px, 800);
    b.text(pill, xx, 96 * s + b.cap() / 2, px, t.foreground, Infinity, 800);
    y = 154 * s;
  }
  const top = y + 50 * s;
  let hr = w / 2,
    hc = 0;
  if (title) {
    const p = b.fit(title, 128 * s, max, 800);
    hc = b.cap();
    const hw = c.measureText(title).width;
    hr = (w + hw) / 2;
    b.shadow("rgba(0,0,0,.35)", 24 * s, 4 * s);
    b.text(title, (w - hw) / 2, top + hc, p, "#fff", Infinity, 800);
    b.noShadow();
    y = top + hc;
  }
  if (sub) {
    const px = b.fit(sub, 34 * s, w - 2 * m, 600),
      cap = b.cap();
    b.text(sub, w / 2, y + 24 * s + cap, px, "rgba(255,255,255,.85)", Infinity, 600, "center");
    y += 24 * s + cap;
  }
  const fx = w * (w / h > 1.45 ? 0.15 : 0.07),
    fy = y + 44 * s;
  b.frame([fx, fy, w - 2 * fx, h - fy + 60 * s], 18 * s, 6 * s, 0, h - fy);
  if (b.state.arrow && title) {
    const from: [number, number] = has
        ? [pr + 12 * s, 72.8 * s]
        : [hr + 40 * s, Math.max(14 * s, top - 90 * s)],
      to: [number, number] = [hr + 16 * s, top + hc * 0.5],
      peak = Math.min(w - 18 * s, Math.max(from[0], to[0]) + 70 * s);
    b.arrow(from, to, (to[1] >= from[1] ? 1 : -1) * 2 * (peak - (from[0] + to[0]) / 2), 30 * s);
  }
}
function casestudy(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    c = b.ctx,
    m = 44 * s;
  b.background(w / 2, h * 0.36, Math.max(w, h) * 0.42);
  const max = w - 2 * (m + (b.state.arrow ? 92 * s : 0));
  const badge = words(b, "badge").toUpperCase().trim(),
    title = words(b, "headline").toUpperCase(),
    sub = words(b, "subline");
  const bk = (b.state.badgeSize || 100) / 100;
  let y = 30 * s,
    br = w / 2,
    bc = 0;
  if (badge) {
    const px = b.fit(badge, 30 * s * bk, max - 52 * s * bk, 800),
      cap = b.cap(),
      padX = 26 * s * bk,
      padY = 12 * s * bk,
      bw = c.measureText(badge).width + padX * 2,
      bh = cap + padY * 2,
      x = (w - bw) / 2;
    br = x + bw;
    bc = y + bh / 2;
    const variant = b.state.badgeVariant,
      bg = variant === "white" ? "#FFFFFF" : variant === "dark" ? "#111A3A" : "#2563EB",
      fg = variant === "white" ? "#0B1130" : "#FFFFFF";
    b.shadow("rgba(0,0,0,.35)", 16 * s, 4 * s);
    b.rect(
      [x, y, bw, bh],
      bg,
      bh / 2,
      variant === "dark" ? "rgba(255,255,255,.35)" : undefined,
      2 * s,
    );
    b.noShadow();
    b.font(px, 800);
    b.text(badge, x + padX, y + padY + cap, px, fg, Infinity, 800);
    y += bh + 28 * s;
  }
  const top = y + 30 * s;
  let hr = w / 2,
    hc = 0;
  if (title) {
    const p = b.fit(title, 108 * s, max, 800);
    hc = b.cap();
    const hw = c.measureText(title).width;
    hr = (w + hw) / 2;
    b.shadow("rgba(0,0,0,.35)", 24 * s, 4 * s);
    b.text(title, (w - hw) / 2, top + hc, p, "#fff", Infinity, 800);
    b.noShadow();
    y = top + hc;
  }
  if (sub) {
    const px = b.fit(sub, 30 * s, w - 2 * m, 600),
      cap = b.cap();
    b.text(sub, w / 2, y + 22 * s + cap, px, "rgba(255,255,255,.85)", Infinity, 600, "center");
    y += 22 * s + cap;
  }
  const fx = w * (w / h > 1.45 ? 0.15 : 0.07),
    fy = y + 62 * s;
  b.frame([fx, fy, w - 2 * fx, h - fy + 60 * s], 18 * s, 6 * s, 0, h - fy);
  if (b.state.arrow && title) {
    const from: [number, number] = badge
        ? [br + 12 * s, bc]
        : [hr + 40 * s, Math.max(14 * s, top - 90 * s)],
      to: [number, number] = [hr + 16 * s, top + hc * 0.5],
      peak = Math.min(w - 18 * s, Math.max(from[0], to[0]) + 70 * s);
    b.arrow(from, to, (to[1] >= from[1] ? 1 : -1) * 2 * (peak - (from[0] + to[0]) / 2), 30 * s);
  }
}

function stat(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx;
  b.background(w * 0.22, h * 0.55, Math.max(w, h) * 0.36);
  b.face([0, 0, w * 0.5, h], "right");
  const x = w * 0.5,
    cw = w - 44 * s - x,
    cx = x + cw / 2,
    inner = cw - 68 * s;
  const top = words(b, "pill").toUpperCase(),
    num = words(b, "headline"),
    sub = words(b, "subline"),
    rows = statRows(b),
    svc = words(b, "services");
  const ir = b.overlayOn() ? 34 * s : 0,
    iw = b.overlayOn() ? 84 * s : 0,
    tp = b.fit(top, 90 * s, cw - iw, 800),
    tc = top ? b.cap() : ir * 2,
    tw = c.measureText(top).width;
  const np = b.fit(num, 164 * s, inner, 800),
    nc = num ? b.cap() : 0,
    sp = b.fit(sub, 34 * s, inner, 600),
    sc = sub ? b.cap() : 0;
  let vs = 46 * s,
    ls = 23 * s;
  for (const [v, l] of rows) {
    vs = Math.min(
      vs,
      b.fit(v, 46 * s, rows.length > 1 ? inner / rows.length - 18 * s : inner, 800),
    );
    ls = Math.min(
      ls,
      b.fit(l, 23 * s, rows.length > 1 ? inner / rows.length - 18 * s : inner, 500),
    );
  }
  b.font(vs, 800);
  const vc = b.cap();
  b.font(ls, 500);
  const lc = b.cap();
  const rh = rows.length ? vc + 18 * s + lc * 1.3 : 0;
  const ph =
    num || sub || rows.length
      ? 42 * s +
        nc +
        (sub ? (num ? 30 * s : 0) + sc * 1.25 : 0) +
        (rows.length ? 68 * s + rh : 0) +
        34 * s
      : 0;
  const g1 = (top || b.overlayOn()) && ph ? 34 * s : 0,
    g2 = svc && (ph || top) ? 24 * s : 0,
    sh = svc ? 64 * s : 0;
  let y = Math.max(44 * s, (h - tc - g1 - ph - g2 - sh) / 2);
  if (top || b.overlayOn()) {
    let xx = cx - (iw + tw - (top ? 0 : 16 * s)) / 2;
    if (b.overlayOn()) {
      b.play(xx + ir, y + tc / 2, ir, true);
      xx += iw;
    }
    b.shadow("rgba(0,0,0,.35)", 20 * s);
    b.text(top, xx, y + tc, tp, "#fff", Infinity, 800);
    b.noShadow();
    y += tc + g1;
  }
  if (ph) {
    const grad = c.createLinearGradient(0, y, 0, y + ph);
    grad.addColorStop(0, translucent(t.glow, 0.22));
    grad.addColorStop(1, translucent(t.glow, 0.04));
    b.shadow("rgba(0,0,0,.45)", 40 * s, 12 * s);
    b.rect([x, y, cw, ph], t.surface, 24 * s);
    b.noShadow();
    b.rect([x + 1.5 * s, y + 1.5 * s, cw - 3 * s, ph - 3 * s], grad, 23 * s, t.line, 3 * s);
    let yy = y + 42 * s;
    if (num) {
      b.shadow("rgba(0,0,0,.3)", 18 * s);
      b.text(num, cx, yy + nc, np, "#fff", Infinity, 800, "center");
      b.noShadow();
      yy += nc;
    }
    if (sub) {
      yy += num ? 30 * s : 0;
      b.text(sub, cx, yy + sc, sp, "rgba(255,255,255,.92)", Infinity, 600, "center");
      yy += sc * 1.25;
    }
    if (rows.length) {
      yy += 34 * s;
      c.fillStyle = translucent(t.line, 0.45);
      c.fillRect(x + 34 * s, yy, inner, 2 * s);
      yy += 34 * s;
      rows.forEach(([v, l], i) => {
        const xx = rows.length > 1 ? x + 34 * s + (inner / rows.length) * (i + 0.5) : cx;
        b.text(v, xx, yy + vc, vs, "#fff", Infinity, 800, "center");
        b.text(l, xx, yy + vc + 18 * s + lc, ls, "rgba(255,255,255,.66)", Infinity, 500, "center");
      });
      if (rows.length === 2) {
        c.fillStyle = translucent(t.line, 0.45);
        c.fillRect(cx - s, yy - 4 * s, 2 * s, rh + 8 * s);
      }
    }
    y += ph + g2;
  } else y += g2;
  if (svc) service(b, svc, x, y, cw, sh, 26 * s, 0.3);
}
function reviews(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w * 0.74, h * 0.42, Math.max(w, h) * 0.4);
  b.face([w * 0.42, 0, w * 0.58, h], "left");
  const cw = w * 0.56 - m,
    l1 = words(b, "headline").toUpperCase(),
    l2 = words(b, "subline").toUpperCase(),
    badge = words(b, "badge").toUpperCase(),
    rows = statRows(b),
    bar = words(b, "pill");
  let tp = 116 * s;
  for (const line of [l1, l2]) if (line) tp = Math.min(tp, b.fit(line, 116 * s, cw, 400, "Anton"));
  b.font(tp, 400, "Anton");
  const cap = b.cap(),
    titleH = (l1 ? cap : 0) + (l2 ? cap : 0) + (l1 && l2 ? 18 * s : 0),
    rh = badge ? 96 * s : 44 * s,
    sh = rows.length ? 132 * s : 0,
    bh = bar || b.overlayOn() ? 92 * s : 0,
    by = h - m - bh;
  const gap = 40 * s;
  const contentHeight = titleH + rh + sh + gap * (sh ? 2 : 1);
  let y = Math.max(m, ((bh ? by - 24 * s : h) - contentHeight) / 2);
  if (l1) {
    b.text(l1, m, y + cap, tp, "#fff", Infinity, 400, "left", "Anton");
    y += cap + (l2 ? 18 * s : 0);
  }
  if (l2) {
    b.text(l2, m, y + cap, tp, t.highlight, Infinity, 400, "left", "Anton");
    y += cap;
  }
  y += gap;
  let starsX = m;
  if (badge) {
    const x = m,
      ww = 82 * s;
    c.beginPath();
    c.moveTo(x + ww / 2, y);
    c.lineTo(x + ww, y + rh * 0.15);
    c.lineTo(x + ww, y + rh * 0.52);
    c.quadraticCurveTo(x + ww, y + rh * 0.86, x + ww / 2, y + rh);
    c.quadraticCurveTo(x, y + rh * 0.86, x, y + rh * 0.52);
    c.lineTo(x, y + rh * 0.15);
    c.closePath();
    c.fillStyle = "rgba(0,0,0,.55)";
    c.fill();
    c.strokeStyle = t.highlight;
    c.lineWidth = 3 * s;
    c.stroke();
    b.star(x + ww / 2, y + rh * 0.22, 9 * s, t.highlight);
    const split = badge.split(" "),
      lines = split.length > 3 ? [split[0], split[1], split.slice(2).join(" ")] : split;
    let size = 15 * s;
    for (const line of lines) size = Math.min(size, b.fit(line, 15 * s, ww * 0.72, 800));
    b.font(size, 800);
    const ch = b.cap(),
      lh = ch * 1.35,
      top = y + rh * 0.56 - (lh * (lines.length - 1) + ch) / 2;
    lines.forEach((line, index) => {
      b.text(line, x + ww / 2, top + ch + index * lh, size, "#fff", Infinity, 800, "center");
    });
    starsX += 104 * s;
  }
  for (let i = 0; i < 5; i++)
    b.star(starsX + 21 * s + i * 50 * s, y + rh / 2 + 2 * s, 21 * s, t.highlight);
  y += rh + gap;
  const bw = rows.length > 1 ? (cw - 16 * s * (rows.length - 1)) / rows.length : cw * 0.6;
  rows.forEach(([v, l], i) => {
    const xx = m + i * (bw + 16 * s);
    b.rect([xx, y, bw, sh], "rgba(0,0,0,.5)", 16 * s);
    c.beginPath();
    c.roundRect(xx + s, y + s, bw - 2 * s, sh - 2 * s, 15 * s);
    c.strokeStyle = translucent(t.highlight, 0.6);
    c.lineWidth = 2 * s;
    c.stroke();
    const vp = b.fit(v, 46 * s, bw - 30 * s, 800),
      vc = v ? b.cap() : 0,
      lp = b.fit(l.toUpperCase(), 17 * s, bw - 30 * s, 700),
      lc = l ? b.cap() : 0;
    let yy = y + (sh - vc - lc - (v && l ? 16 * s : 0)) / 2;
    if (v) {
      b.text(v, xx + bw / 2, yy + vc, vp, "#fff", Infinity, 800, "center");
      yy += vc + (l ? 16 * s : 0);
    }
    if (l)
      b.text(
        l.toUpperCase(),
        xx + bw / 2,
        yy + lc,
        lp,
        "rgba(255,255,255,.7)",
        Infinity,
        700,
        "center",
      );
  });
  if (bh) {
    const ww = Math.min(w * 0.64, w - 2 * m - (b.state.arrow ? 90 * s : 0)),
      cy = by + bh / 2;
    b.shadow(translucent(t.line, 0.55), 26 * s);
    b.rect([m, by, ww, bh], "rgba(10,8,18,.86)", 20 * s);
    b.noShadow();
    c.strokeStyle = t.line;
    c.lineWidth = 3 * s;
    c.beginPath();
    c.roundRect(m + 1.5 * s, by + 1.5 * s, ww - 3 * s, bh - 3 * s, 19 * s);
    c.stroke();
    let tx = m + 30 * s;
    if (b.overlayOn()) {
      b.play(tx + 28 * s, cy, 28 * s, false, t.accent, t.foreground);
      tx += 78 * s;
      if (bar) {
        c.fillStyle = "rgba(255,255,255,.22)";
        c.fillRect(tx - 11 * s, cy - 24 * s, 2 * s, 48 * s);
        tx += 10 * s;
      }
    }
    if (bar) {
      const px = b.fit(bar, 38 * s, m + ww - 30 * s - tx, 700);
      b.text(bar, tx, cy + b.cap() / 2, px, "#fff", Infinity, 700);
    }
    if (b.state.arrow)
      b.arrow([m + ww + 74 * s, by - 66 * s], [m + ww + 14 * s, cy - 4 * s], -34 * s, 16 * s);
  }
}
function quote(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    m = 44 * s;
  b.background(w * 0.3, h * 0.4, Math.max(w, h) * 0.4);
  b.face([w * 0.58, 0, w * 0.42, h], "left");
  const x = m,
    cw = w * 0.58 - m - 32 * s;
  const text0 = words(b, "quote"),
    name = words(b, "name"),
    badge = words(b, "badge");
  b.text("\u201C", x - 8 * s, m + 128 * s, 168 * s, t.highlight, Infinity, 900);
  let y = m + 168 * s;
  if (text0) {
    b.font(52 * s, 700);
    const lines = wrapped(b, text0, cw);
    let size = 52 * s;
    for (const line of lines) size = Math.min(size, b.fit(line, 52 * s, cw, 700));
    b.font(size, 700);
    const qc = b.cap(),
      lh = qc * 1.4;
    b.shadow("rgba(0,0,0,.35)", 16 * s, 3 * s);
    lines.forEach((line, i) => {
      b.text(line, x, y + qc + i * lh, size, "#fff", Infinity, 700);
    });
    b.noShadow();
    y += qc + (lines.length - 1) * lh + 34 * s;
  }
  if (name) {
    const size = b.fit(`\u2014 ${name}`, 30 * s, cw, 600);
    b.font(size, 600);
    b.text(`\u2014 ${name}`, x, y + b.cap(), size, "rgba(255,255,255,.85)", Infinity, 600);
    y += b.cap() + 36 * s;
  }
  if (badge) {
    for (let i = 0; i < 5; i++) b.star(x + 18 * s + i * 44 * s, y + 4 * s, 17 * s, t.highlight);
    const size = b.fit(badge, 34 * s, 90 * s, 800);
    b.font(size, 800);
    b.text(
      badge,
      x + 5 * 44 * s + 16 * s,
      y + 4 * s + b.cap() / 2,
      size,
      t.highlight,
      Infinity,
      800,
    );
  }
  if (b.bareOverlayOn()) b.play(x + 46 * s, h - m - 46 * s, 46 * s);
}
function checklist(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w * 0.28, h * 0.45, Math.max(w, h) * 0.38);
  b.face([w * 0.54, 0, w * 0.46, h], "left");
  const x = m,
    cw = w * 0.54 - m - 36 * s;
  const title = words(b, "headline").toUpperCase();
  const items = words(b, "services")
    .split(/[\u00B7,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  let y = m + 8 * s;
  if (title) {
    const size = b.fit(title, 84 * s, cw, 800);
    b.font(size, 800);
    b.shadow("rgba(0,0,0,.35)", 18 * s, 3 * s);
    b.text(title, x, y + b.cap(), size, "#fff", Infinity, 800);
    b.noShadow();
    y += b.cap() + 42 * s;
  }
  const rowH = 62 * s,
    gap = 18 * s;
  items.forEach((item, i) => {
    const yy = y + i * (rowH + gap);
    b.rect([x, yy, cw, rowH], "rgba(0,0,0,.42)", 16 * s);
    c.beginPath();
    c.roundRect(x + 1.25 * s, yy + 1.25 * s, cw - 2.5 * s, rowH - 2.5 * s, 15 * s);
    c.strokeStyle = translucent(t.line, 0.5);
    c.lineWidth = 2 * s;
    c.stroke();
    skillIcon(b, "check", x + 38 * s, yy + rowH / 2, 19 * s);
    const size = b.fit(item, 26 * s, cw - 96 * s, 600);
    b.font(size, 600);
    b.text(item, x + 68 * s, yy + rowH / 2 + b.cap() / 2, size, "#fff", Infinity, 600);
  });
  if (b.state.arrow && title)
    b.arrow([x + cw * 0.72, m + 30 * s], [w * 0.6, h * 0.32], -50 * s, 18 * s);
}
function cover(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w / 2, h * 0.3, Math.max(w, h) * 0.42);
  const pill = words(b, "pill").toUpperCase(),
    title = words(b, "headline"),
    sub = words(b, "subline");
  const fx = m * 0.8,
    fy = h * 0.3;
  b.frame(
    [fx, fy, w - 2 * fx, h - fy + 60 * s],
    18 * s,
    6 * s,
    b.bareOverlayOn() ? 120 * s : 0,
    h - fy,
  );
  const shade = c.createLinearGradient(0, h * 0.52, 0, h);
  shade.addColorStop(0, "transparent");
  shade.addColorStop(1, "rgba(0,0,0,.85)");
  c.fillStyle = shade;
  c.fillRect(fx, h * 0.52, w - 2 * fx, h * 0.48);
  if (b.bareOverlayOn()) b.play(w / 2, fy + (h * 0.5 - fy) / 2, 52 * s);
  let titleTop = h - m;
  if (sub) {
    const size = b.fit(sub, 32 * s, w - 2 * m - 40 * s, 600);
    b.font(size, 600);
    b.shadow("rgba(0,0,0,.5)", 14 * s, 3 * s);
    b.text(sub, m + 20 * s, h - m, size, "rgba(255,255,255,.85)", Infinity, 600);
    b.noShadow();
    titleTop = h - m - b.cap() - 30 * s;
  }
  if (title) {
    const size = b.fit(title, 88 * s, w - 2 * m - 40 * s, 800);
    b.font(size, 800);
    b.shadow("rgba(0,0,0,.5)", 20 * s, 4 * s);
    b.text(title, m + 20 * s, titleTop, size, "#fff", Infinity, 800);
    b.noShadow();
    titleTop -= b.cap();
  }
  if (pill) {
    const size = b.fit(pill, 42 * s, w * 0.5, 800);
    b.font(size, 800);
    const pc = b.cap(),
      pw = c.measureText(pill).width + 64 * s,
      ph = pc + 42 * s;
    b.shadow("rgba(0,0,0,.4)", 26 * s, 6 * s);
    b.rect([m, m, pw, ph], t.accent, 18 * s);
    b.noShadow();
    b.text(pill, m + 32 * s, m + ph / 2 + pc / 2, size, t.foreground, Infinity, 800);
    if (b.state.arrow && title)
      b.arrow([m + pw * 0.5, m + ph + 10 * s], [m + 30 * s, titleTop + 24 * s], -46 * s, 18 * s);
  }
}
function duo(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 44 * s;
  b.background(w * 0.26, h * 0.42, Math.max(w, h) * 0.38);
  b.face([0, 0, w * 0.46, h], "right");
  const x = w * 0.48,
    cw = w - x - m,
    cx = x + cw / 2;
  const title = words(b, "headline").toUpperCase(),
    sub = words(b, "subline"),
    rows = statRows(b);
  let vs = 52 * s,
    ls = 23 * s;
  const cell = (cw - 64 * s) / 2;
  for (const [v, l] of rows) {
    vs = Math.min(vs, b.fit(v, 52 * s, cell - 40 * s, 800));
    ls = Math.min(ls, b.fit(l, 23 * s, cell - 40 * s, 500));
  }
  b.font(vs, 800);
  const vc = rows.length ? b.cap() : 0;
  b.font(ls, 500);
  const lc = rows.length ? b.cap() : 0;
  const statsH = rows.length ? vc + 16 * s + lc + 40 * s : 0;
  const titleSize = title ? b.fit(title, 92 * s, cw - 60 * s, 800) : 0;
  b.font(titleSize, 800);
  const tc = title ? b.cap() : 0;
  const subSize = sub ? b.fit(sub, 34 * s, cw - 60 * s, 600) : 0;
  b.font(subSize, 600);
  const sc = sub ? b.cap() : 0;
  const ph =
    48 * s +
    tc +
    (sub ? (title ? 26 * s : 0) + sc : 0) +
    (rows.length ? 44 * s + statsH : 0) +
    24 * s;
  const y = Math.max(m, (h - ph) / 2);
  const grad = c.createLinearGradient(0, y, 0, y + ph);
  grad.addColorStop(0, translucent(t.glow, 0.24));
  grad.addColorStop(1, translucent(t.glow, 0.05));
  b.shadow("rgba(0,0,0,.45)", 40 * s, 12 * s);
  b.rect([x, y, cw, ph], t.surface, 24 * s);
  b.noShadow();
  b.rect([x + 1.5 * s, y + 1.5 * s, cw - 3 * s, ph - 3 * s], grad, 22.5 * s, t.line, 3 * s);
  let yy = y + 48 * s;
  if (title) {
    b.shadow("rgba(0,0,0,.3)", 16 * s);
    b.text(title, cx, yy + tc, titleSize, "#fff", Infinity, 800, "center");
    b.noShadow();
    yy += tc;
  }
  if (sub) {
    yy += title ? 26 * s : 0;
    b.text(sub, cx, yy + sc, subSize, t.highlight, Infinity, 600, "center");
    yy += sc;
  }
  if (rows.length) {
    yy += 44 * s;
    const strip = rows.length * cell - 12 * s,
      start = cx - strip / 2;
    rows.forEach(([v, l], i) => {
      const xx = start + i * cell,
        bw = cell - 12 * s;
      b.rect([xx, yy, bw, statsH - 8 * s], "rgba(0,0,0,.42)", 14 * s);
      c.beginPath();
      c.roundRect(xx + 1.25 * s, yy + 1.25 * s, bw - 2.5 * s, statsH - 8 * s - 2.5 * s, 13 * s);
      c.strokeStyle = translucent(t.line, 0.5);
      c.lineWidth = 2 * s;
      c.stroke();
      let iy = yy + (statsH - 8 * s - vc - (v && l ? 14 * s : 0) - lc) / 2;
      if (v) {
        b.text(v, xx + bw / 2, iy + vc, vs, "#fff", Infinity, 800, "center");
        iy += vc + (l ? 14 * s : 0);
      }
      if (l) b.text(l, xx + bw / 2, iy + lc, ls, "rgba(255,255,255,.7)", Infinity, 500, "center");
    });
  }
  if (b.bareOverlayOn()) b.play(w * 0.23, h - m - 50 * s, 46 * s);
}
function split(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 56 * s;
  b.background(w * 0.28, h * 0.5, Math.max(w, h) * 0.4);
  b.face([w * 0.55, 0, w * 0.45, h], "left");
  const x = m,
    cw = w * 0.55 - m - 48 * s;
  const pill = words(b, "pill").toUpperCase(),
    name = words(b, "name"),
    role = words(b, "role");
  let y = m;
  if (pill || b.overlayOn()) {
    const ir = b.overlayOn() ? 28 * s : 0,
      iw = b.overlayOn() ? ir * 2 + (pill ? 16 * s : 0) : 0;
    const size = b.fit(pill, 48 * s, cw - iw - 56 * s, 800);
    b.font(size, 800);
    const pc = b.cap(),
      pw = c.measureText(pill).width + iw + 56 * s,
      ph = Math.max(pc, ir * 2) + 36 * s;
    b.shadow("rgba(0,0,0,.4)", 26 * s, 6 * s);
    b.rect([x, y, pw, ph], t.accent, ph / 2);
    b.noShadow();
    let xx = x + 28 * s;
    if (b.overlayOn()) {
      b.play(xx + ir, y + ph / 2, ir, true);
      xx += iw;
    }
    b.text(pill, xx, y + ph / 2 + pc / 2, size, t.foreground, Infinity, 800);
    y += ph + 44 * s;
  }
  if (name) {
    b.font(148 * s, 900);
    const lines = wrapped(b, name, cw);
    let size = 148 * s;
    for (const line of lines) size = Math.min(size, b.fit(line, 148 * s, cw, 900));
    b.font(size, 900);
    const nc = b.cap(),
      lh = nc * 1.15;
    b.shadow("rgba(0,0,0,.35)", 20 * s, 4 * s);
    lines.forEach((line, i) => {
      b.text(line, x, y + nc + i * lh, size, "#fff", Infinity, 900);
    });
    b.noShadow();
    y += nc + (lines.length - 1) * lh + 32 * s;
  }
  if (role) {
    const size = b.fit(role, 34 * s, cw, 600);
    b.font(size, 600);
    b.text(role, x, y + b.cap(), size, t.highlight, Infinity, 600);
    y += b.cap();
  }
  if (b.state.arrow && name)
    b.arrow([x + cw * 0.62, y + 36 * s], [w * 0.62, h * 0.56], 70 * s, 22 * s);
}
function centered(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx;
  b.background(w / 2, h * 0.4, Math.max(w, h) * 0.46);
  const headline = words(b, "headline").toUpperCase(),
    name = words(b, "name"),
    role = words(b, "role");
  const r = h * 0.22,
    cx = w / 2,
    cy = h * 0.36;
  if (headline) {
    const size = b.fit(headline, 38 * s, w * 0.6, 800);
    b.font(size, 800);
    b.text(headline, cx, 40 * s + b.cap(), size, t.highlight, Infinity, 800, "center");
  }
  b.shadow(translucent(t.highlight, 0.75), 50 * s);
  b.circle(cx, cy, r, t.surface);
  b.noShadow();
  b.face([cx - r, cy - r, r * 2, r * 2], "none", true);
  b.shadow(translucent(t.highlight, 0.9), 24 * s);
  b.circle(cx, cy, r - 4 * s, "transparent", t.highlight, 7 * s);
  b.noShadow();
  if (b.bareOverlayOn()) b.play(cx, cy, r * 0.44);
  let y = cy + r + 42 * s;
  if (name) {
    const size = b.fit(name, 116 * s, w * 0.7, 900);
    b.font(size, 900);
    b.shadow("rgba(0,0,0,.35)", 20 * s, 4 * s);
    b.text(name, cx, y + b.cap(), size, "#fff", Infinity, 900, "center");
    b.noShadow();
    y += b.cap() + 28 * s;
  }
  if (role) {
    const size = b.fit(role, 30 * s, w * 0.6, 600);
    b.font(size, 600);
    const rc = b.cap(),
      rw = c.measureText(role).width + 56 * s,
      rh = rc + 34 * s;
    b.rect([cx - rw / 2, y, rw, rh], t.accent, rh / 2);
    b.text(role, cx, y + rh / 2 + rc / 2, size, t.foreground, Infinity, 600, "center");
  }
}
function statline(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 52 * s;
  b.background(w * 0.68, h * 0.4, Math.max(w, h) * 0.4);
  b.face([w * 0.6, 0, w * 0.4, h], "left");
  const x = m,
    cw = w * 0.6 - m - 40 * s;
  const title = words(b, "headline").toUpperCase(),
    svc = words(b, "services"),
    rows = statRows(b, 3),
    n = rows.length;
  const stripH = n ? 148 * s : 0,
    stripY = h - 36 * s - stripH;
  let y = 64 * s;
  if (title) {
    b.font(100 * s, 800);
    const lines = wrapped(b, title, cw);
    let size = 100 * s;
    for (const line of lines) size = Math.min(size, b.fit(line, 100 * s, cw, 800));
    b.font(size, 800);
    const tc = b.cap(),
      lh = tc * 1.18;
    b.shadow("rgba(0,0,0,.35)", 20 * s, 4 * s);
    lines.forEach((line, i) => {
      b.text(line, x, y + tc + i * lh, size, i === 0 ? "#fff" : t.highlight, Infinity, 800);
    });
    b.noShadow();
    y += tc + (lines.length - 1) * lh;
  }
  if (b.bareOverlayOn()) b.play(x + 48 * s, Math.min(y + 68 * s, stripY - 84 * s), 42 * s);
  if (svc) {
    const size = b.fit(svc, 24 * s, cw, 600);
    b.font(size, 600);
    b.text(svc, x, stripY - 26 * s, size, "rgba(255,255,255,.7)", Infinity, 600);
  }
  if (n) {
    b.rect([36 * s, stripY, w - 72 * s, stripH], "rgba(0,0,0,.55)", 22 * s);
    c.beginPath();
    c.roundRect(37.5 * s, stripY + 1.5 * s, w - 75 * s, stripH - 3 * s, 20.5 * s);
    c.strokeStyle = translucent(t.line, 0.55);
    c.lineWidth = 2.5 * s;
    c.stroke();
    const cell = (w - 72 * s) / n;
    let vs = 58 * s,
      ls = 22 * s;
    for (const [v, l] of rows) {
      vs = Math.min(vs, b.fit(v, 58 * s, cell - 60 * s, 400, "Anton"));
      ls = Math.min(ls, b.fit(l, 22 * s, cell - 60 * s, 600));
    }
    b.font(vs, 400, "Anton");
    const vc = b.cap();
    b.font(ls, 600);
    const lc = b.cap();
    rows.forEach(([v, l], i) => {
      const cx = 36 * s + cell * (i + 0.5);
      const content = (v ? vc : 0) + (v && l ? 14 * s : 0) + (l ? lc : 0);
      let yy = stripY + (stripH - content) / 2;
      if (v) {
        b.text(v, cx, yy + vc, vs, "#fff", Infinity, 400, "center", "Anton");
        yy += vc + (l ? 14 * s : 0);
      }
      if (l) b.text(l, cx, yy + lc, ls, "rgba(255,255,255,.75)", Infinity, 600, "center");
      if (i) {
        c.fillStyle = translucent(t.line, 0.35);
        c.fillRect(36 * s + cell * i - s, stripY + 24 * s, 2 * s, stripH - 48 * s);
      }
    });
  }
}
function tagline(b: Brush): void {
  const { width: w, height: h } = b,
    s = b.scale,
    t = b.palette,
    c = b.ctx,
    m = 56 * s;
  b.background(w * 0.3, h * 0.42, Math.max(w, h) * 0.4);
  b.face([w * 0.58, 0, w * 0.42, h], "left");
  const x = m,
    cw = w * 0.58 - m - 44 * s;
  const l1 = words(b, "headline").toUpperCase(),
    l2 = words(b, "headline2").toUpperCase();
  const chips = [1, 2, 3, 4]
    .map((i) => ({ text: words(b, `chip${i}`), icon: b.state.icons[i - 1] }))
    .filter((item) => item.text);
  let y = h * 0.18;
  if (l1) {
    const size = b.fit(l1, 104 * s, cw, 800);
    b.font(size, 800);
    b.shadow("rgba(0,0,0,.4)", 20 * s, 4 * s);
    b.text(l1, x, y + b.cap(), size, "#fff", Infinity, 800);
    b.noShadow();
    y += b.cap() + 18 * s;
  }
  if (l2) {
    const size = b.fit(l2, 104 * s, cw, 900);
    b.font(size, 900);
    b.shadow(translucent(t.highlight, 0.5), 26 * s);
    b.text(l2, x, y + b.cap(), size, t.highlight, Infinity, 900);
    b.noShadow();
    y += b.cap();
  }
  y += 54 * s;
  const perRow = 2,
    pillH = 80 * s,
    gap = 18 * s,
    pillW = (cw - gap) / perRow;
  chips.forEach((chip, i) => {
    const xx = x + (i % perRow) * (pillW + gap),
      yy = y + Math.floor(i / perRow) * (pillH + gap);
    b.rect([xx, yy, pillW, pillH], "rgba(0,0,0,.42)", pillH / 2);
    c.beginPath();
    c.roundRect(xx + 1.25 * s, yy + 1.25 * s, pillW - 2.5 * s, pillH - 2.5 * s, pillH / 2);
    c.strokeStyle = translucent(t.line, 0.5);
    c.lineWidth = 2 * s;
    c.stroke();
    skillIcon(b, chip.icon, xx + 44 * s, yy + pillH / 2, 19 * s);
    const size = b.fit(chip.text, 23 * s, pillW - 96 * s, 700);
    b.font(size, 700);
    b.text(chip.text, xx + 74 * s, yy + pillH / 2 + b.cap() / 2, size, "#fff", Infinity, 700);
  });
  if (b.state.arrow && (l1 || l2))
    b.arrow([x + cw * 0.6, h * 0.22], [w * 0.64, h * 0.42], -60 * s, 20 * s);
}
export async function artworkFonts(): Promise<boolean> {
  const specs = [
    "500 40px Montserrat",
    "600 40px Montserrat",
    "700 40px Montserrat",
    "800 40px Montserrat",
    "900 40px Montserrat",
    "400 40px Anton",
    "700 40px Manrope",
  ];
  await Promise.all(
    specs.map((font) =>
      document.fonts
        .load(font, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%+&·")
        .catch(() => []),
    ),
  );
  return specs.every((font) => document.fonts.check(font, "A"));
}
export function drawThumbnail(
  canvas: HTMLCanvasElement,
  state: ThumbnailState,
  style: Style = state.style,
): void {
  const chosen = { ...state, style };
  const [w, h] = dimensions(chosen);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const c = canvas.getContext("2d");
  if (!c) return;
  c.save();
  c.clearRect(0, 0, w, h);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";
  const redesigned =
    !["profile", "result", "meet", "banner", "hello", "proof", "casestudy"].includes(style) &&
    !(state.originalLayout && ["stat", "reviews"].includes(style));
  // Button words are drawn once, in the image overlay. No duplicate header/button row.
  // The Loom logo is stripped alongside the play button so it can never show
  // up as a stray badge outside the Watch-me button the overlay draws.
  const baseState = ["result", "proof", "stat", "reviews", "split", "casestudy"].includes(style)
    ? { ...setField({ ...chosen, play: false, arrow: false }, "pill", ""), loom: false }
    : chosen;
  const b = new Brush(c, baseState, w, h);
  const painters: Record<Style, (brush: Brush) => void> = {
    profile,
    result,
    casestudy,
    stat,
    reviews,
    quote,
    checklist,
    cover,
    duo,
    meet,
    banner,
    hello,
    proof,
    split,
    centered,
    statline,
    tagline,
    spotlight: editorial,
    beforeafter: editorial,
    minimal: editorial,
    editorial,
    signature: editorial,
  };
  if (redesigned) editorial(b);
  else painters[style](b);
  if (style !== "profile" && style !== "meet") compositionCallout(new Brush(c, chosen, w, h));
  c.restore();
}
