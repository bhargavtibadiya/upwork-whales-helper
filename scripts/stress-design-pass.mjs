import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const dir = process.env.EVIDENCE_DIR ?? "/downloads/upwork-stress";
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
const face =
  "data:image/jpeg;base64," +
  (await readFile(process.env.FACE_FIXTURE ?? "tests/fixtures/fixture-face.png")).toString(
    "base64",
  );
const shot =
  "data:image/png;base64," +
  (await readFile(process.env.SHOT_FIXTURE ?? "tests/fixtures/fixture-grid.png")).toString(
    "base64",
  );
const result = await p.evaluate(
  async ({ face, shot }) => {
    const { initialState, STYLES, changeStyle, setField } = await import(
      "/src/lib/thumbnail/model.ts"
    );
    const { drawThumbnail, artworkFonts } = await import("/src/lib/thumbnail/render.ts");
    await document.fonts.ready;
    await artworkFonts();
    const fi = new Image(),
      sh = new Image();
    fi.src = face;
    sh.src = shot;
    await Promise.all([fi.decode(), sh.decode()]);
    const canvas = document.querySelector("canvas"),
      warnings = [],
      saved = [];
    let checks = 0;
    const baseFill = CanvasRenderingContext2D.prototype.fillText;
    let tag = "";
    CanvasRenderingContext2D.prototype.fillText = function (t, x, y, ...rest) {
      const m = this.measureText(t);
      const left =
        this.textAlign === "center"
          ? x - m.width / 2
          : this.textAlign === "right"
            ? x - m.width
            : x;
      if (
        this.canvas === canvas &&
        t &&
        (left < -2 ||
          left + m.width > canvas.width + 2 ||
          y - m.actualBoundingBoxAscent < -2 ||
          y + m.actualBoundingBoxDescent > canvas.height + 2)
      )
        warnings.push({ tag, text: t, x, y, left, width: m.width, height: canvas.height });
      return baseFill.call(this, t, x, y, ...rest);
    };
    for (const spec of STYLES.filter((s) => s.mode !== "profile"))
      for (const size of spec.mode === "portfolio" ? ["4x3", "16x9"] : ["16x9"])
        for (const font of ["original", "Montserrat", "Manrope", "Anton"])
          for (const text of ["default", "short", "long"]) {
            let state = changeStyle(initialState(spec.mode), spec.id);
            state = {
              ...state,
              size,
              font,
              face: { ...state.face, image: fi },
              shot: { ...state.shot, image: sh },
            };
            if (text !== "default")
              for (const key of spec.fields.flatMap((k) =>
                k === "stats"
                  ? [1, 2, 3].flatMap((n) => [`stat${n}v`, `stat${n}l`])
                  : k === "chips"
                    ? [1, 2, 3, 4].map((n) => `chip${n}`)
                    : [k],
              )) {
                state = setField(
                  state,
                  key,
                  text === "short"
                    ? "A"
                    : key.match(/stat\dv/)
                      ? "1234567890"
                      : key.match(/stat\dl/)
                        ? "Very long stat label"
                        : key === "quote"
                          ? "A detailed client quote that takes up the full available input length without crossing content."
                          : key === "services"
                            ? "Strategy · Development · Deployment · Integrations · Support"
                            : key === "name"
                              ? "Alexandra Montgomery"
                              : key === "role"
                                ? "Full-stack developer and AI specialist"
                                : "TRANSFORM YOUR BUSINESS",
                );
              }
            for (let mask = 0; mask < 32; mask++) {
              tag = `${spec.id}/${size}/${font}/${text}/${mask}`;
              const extras = Object.fromEntries(
                ["arrow", "play", "sparkles", "stars", "border"].map((key, i) => [
                  key,
                  Boolean(mask & (1 << i)),
                ]),
              );
              drawThumbnail(canvas, { ...state, ...extras });
              checks++;
              if (
                mask === 31 &&
                ((font === "Manrope" && text === "long") ||
                  (["cover", "signature"].includes(spec.id) && text !== "long"))
              )
                saved.push({
                  name: `${spec.mode}-${spec.id}-${size}-${font}-${text}-stress.png`,
                  data: canvas.toDataURL(),
                });
            }
          }
    CanvasRenderingContext2D.prototype.fillText = baseFill;
    return { checks, warnings, saved };
  },
  { face, shot },
);
for (const { name, data } of result.saved)
  await writeFile(dir + "/" + name, Buffer.from(data.split(",")[1], "base64"));
delete result.saved;
await writeFile(dir + "/results.json", JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({
    checks: result.checks,
    warnings: result.warnings.slice(0, 30),
    totalWarnings: result.warnings.length,
  }),
);
await browser.close();
await server.close();
