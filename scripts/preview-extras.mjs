import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const dir = "/downloads/extras-preview";
await mkdir(dir, { recursive: true });
const server = await createServer({ server: { port: 3101 }, appType: "custom" });
await server.listen();
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await browser.newPage();
await p.goto("http://localhost:3101/src/app/fonts.css");
await p.setContent('<link rel="stylesheet" href="/src/app/fonts.css"><canvas></canvas>');
const face = `data:image/jpeg;base64,${(await readFile("/downloads/demo-portrait.jpg")).toString("base64")}`;
const result = await p.evaluate(async (face) => {
  const { initialState, STYLES, changeStyle } = await import("/src/lib/thumbnail/model.ts");
  const { drawThumbnail, artworkFonts } = await import("/src/lib/thumbnail/render.ts");
  await artworkFonts();
  await document.fonts.ready;
  const fi = new Image();
  fi.src = face;
  await fi.decode();
  const dash = document.createElement("canvas");
  dash.width = 1400;
  dash.height = 1000;
  const d = dash.getContext("2d");
  d.fillStyle = "#f3f5fa";
  d.fillRect(0, 0, 1400, 1000);
  d.fillStyle = "#151d35";
  d.fillRect(0, 0, 240, 1000);
  d.font = "bold 30px Arial";
  d.fillStyle = "#fff";
  d.fillText("NOVA", 44, 70);
  d.font = "22px Arial";
  ["Overview", "Analytics", "Customers", "Projects", "Settings"].forEach((x, i) => {
    d.fillStyle = i === 0 ? "#95a9ff" : "#aab1c3";
    d.fillText(x, 36, 160 + i * 72);
  });
  d.fillStyle = "#1d2c47";
  d.font = "bold 40px Arial";
  d.fillText("Project overview", 290, 85);
  d.font = "20px Arial";
  d.fillStyle = "#7b879e";
  d.fillText("A clear picture of your business", 290, 128);
  for (let i = 0; i < 3; i++) {
    d.fillStyle = "#fff";
    d.beginPath();
    d.roundRect(290 + i * 350, 180, 320, 165, 14);
    d.fill();
    d.fillStyle = "#7b879e";
    d.fillText(["Revenue", "Active users", "Conversion"][i], 318 + i * 350, 225);
    d.fillStyle = "#1d2c47";
    d.font = "bold 40px Arial";
    d.fillText(["$24,680", "1,842", "6.4%"][i], 318 + i * 350, 294);
    d.font = "20px Arial";
  }
  d.fillStyle = "#fff";
  d.beginPath();
  d.roundRect(290, 390, 1020, 380, 16);
  d.fill();
  d.fillStyle = "#1d2c47";
  d.font = "bold 24px Arial";
  d.fillText("Performance", 320, 438);
  d.strokeStyle = "#e5e9f2";
  d.lineWidth = 2;
  for (let y = 490; y < 750; y += 60) {
    d.beginPath();
    d.moveTo(320, y);
    d.lineTo(1275, y);
    d.stroke();
  }
  d.strokeStyle = "#6e67e8";
  d.lineWidth = 7;
  d.beginPath();
  [670, 640, 652, 598, 613, 557, 570, 520, 534, 476].forEach((y, i) => {
    if (i) d.lineTo(335 + i * 100, y);
    else d.moveTo(335, y);
  });
  d.stroke();
  d.fillStyle = "#fff";
  d.beginPath();
  d.roundRect(290, 805, 1020, 150, 16);
  d.fill();
  d.fillStyle = "#1d2c47";
  d.fillText("Recent activity", 320, 850);
  d.fillStyle = "#7b879e";
  d.font = "20px Arial";
  d.fillText("New workspace created", 320, 904);
  d.fillText("Today, 10:42", 1080, 904);
  const sh = new Image();
  sh.src = dash.toDataURL();
  await sh.decode();
  const canvas = document.querySelector("canvas");
  const saved = [];
  let checks = 0;
  const warnings = [];
  let tag = "";
  const base = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...r) {
    if (this.canvas === canvas && text) {
      const m = this.measureText(text);
      const left =
        this.textAlign === "center"
          ? x - m.width / 2
          : this.textAlign === "right"
            ? x - m.width
            : x;
      if (
        left < -2 ||
        left + m.width > canvas.width + 2 ||
        y - m.actualBoundingBoxAscent < -2 ||
        y + m.actualBoundingBoxDescent > canvas.height + 2
      )
        warnings.push({ tag, text, x, y });
    }
    return base.call(this, text, x, y, ...r);
  };
  for (const spec of STYLES.filter((s) => s.mode !== "profile")) {
    let s = changeStyle(initialState(spec.mode), spec.id);
    s = {
      ...s,
      face: { ...s.face, image: fi, y: 25 },
      shot: { ...s.shot, image: sh },
      browserFrame: true,
    };
    for (const originalLayout of ["stat", "reviews"].includes(spec.id) ? [false, true] : [false])
      for (const size of spec.mode === "portfolio" ? ["4x3", "16x9"] : ["16x9"])
        for (const font of ["original", "Montserrat", "Manrope", "Anton"])
          for (const backdrop of ["glow", "clean"])
            for (const portraitShape of ["rounded", "square", "circle"])
              for (let mask = 0; mask < 4; mask++) {
                tag = [spec.id, size, font, originalLayout, backdrop, portraitShape, mask].join(
                  "/",
                );
                drawThumbnail(canvas, {
                  ...s,
                  size,
                  font,
                  originalLayout,
                  backdrop,
                  portraitShape,
                  arrow: !!(mask & 1),
                  play: !!(mask & 2),
                });
                checks++;
                if (
                  size === (spec.mode === "portfolio" ? "4x3" : "16x9") &&
                  font === "original" &&
                  backdrop === "glow" &&
                  portraitShape === "rounded" &&
                  mask === 2
                )
                  saved.push({
                    name: `${spec.mode}-${spec.id}${originalLayout ? "-original" : ""}.png`,
                    data: canvas.toDataURL(),
                  });
              }
  }
  for (const spec of STYLES.filter((s) => s.mode !== "profile")) {
    const state = changeStyle(initialState(spec.mode), spec.id);
    drawThumbnail(canvas, state);
    saved.push({ name: `empty-${spec.mode}-${spec.id}.png`, data: canvas.toDataURL() });
  }
  return { saved, checks, warnings };
}, face);
for (const { name, data } of result.saved)
  await writeFile(`${dir}/${name}`, Buffer.from(data.split(",")[1], "base64"));
delete result.saved;
await writeFile(`${dir}/results.json`, JSON.stringify(result, null, 2));
console.log(result);
await browser.close();
await server.close();
