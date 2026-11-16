import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const local = process.env.APP_URL ?? "http://localhost:3100";
const reference = process.env.REFERENCE_URL ?? "https://upwork-whales-thumbnail-maker.vercel.app";
const output = process.env.EVIDENCE_DIR ?? "/tmp/thumbnail-comparison";
const fixtureDir = new URL("../tests/fixtures/", import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const styles = [
  [
    "intro",
    [
      ["meet", "Meet me"],
      ["banner", "Title banner"],
      ["hello", "Big hello"],
      ["proof", "Watch this + proof"],
    ],
  ],
  [
    "portfolio",
    [
      ["result", "Result + screenshot"],
      ["stat", "Face + big stat"],
      ["reviews", "Client results"],
    ],
  ],
  ["profile", [["profile", null]]],
];
const snapshots = {};
const metrics = {};
try {
  for (const [version, url] of [
    ["reference", reference],
    ["local", local],
  ]) {
    const original = version === "reference";
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    for (const edited of [false, true]) {
      await page.goto(`${url}/#intro`, { waitUntil: "networkidle" });
      await page.reload({ waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      if (edited) {
        for (const kind of ["face", "shot"]) {
          await page
            .locator(original ? `#file-${kind}` : `#upload-${kind}`)
            .setInputFiles(`${fixtureDir}/fixture-${kind === "face" ? "face" : "grid"}.png`);
          await page.waitForTimeout(150);
        }
        for (const [kind, key, steps] of [
          ["face", "zoom", 65],
          ["face", "x", 22],
          ["face", "y", 75],
          ["shot", "zoom", 40],
          ["shot", "x", 65],
          ["shot", "y", 30],
        ]) {
          const field = original
            ? page.locator(`#up-${kind} input[data-k="${key}"]`)
            : page.getByRole("slider", {
                name: `${kind === "face" ? "Photo" : "Screenshot"} ${key === "zoom" ? "Zoom" : key === "x" ? "Left / right" : "Up / down"}`,
                exact: true,
              });
          await field.focus();
          await page.keyboard.press("Home");
          for (let n = 0; n < steps; n++) await page.keyboard.press("ArrowRight");
        }
        await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Bhargav");
        await page.getByRole("textbox", { name: "Big text", exact: true }).fill("LET’S BUILD");
        await page
          .getByRole("textbox", { name: "What you do", exact: true })
          .fill("Full Stack Developer");
      }
      for (const [mode, choices] of styles) {
        const modeName =
          mode === "intro"
            ? "Intro video thumbnail"
            : mode === "portfolio"
              ? "Portfolio thumbnail"
              : "Profile picture";
        await page
          .locator(original ? "#modeSeg button" : ".mode-selector button")
          .filter({ hasText: modeName })
          .click();
        for (const [id, label] of choices) {
          if (label)
            await page
              .locator(original ? "#layouts button" : ".style-options button")
              .filter({ hasText: label })
              .click();
          await page.waitForTimeout(200);
          const key = `${edited ? "uploaded" : "default"}-${id}`;
          const data = await page
            .locator(original ? "#c" : '[data-testid="main-canvas"]')
            .evaluate((canvas) => canvas.toDataURL());
          snapshots[`${version}-${key}`] = data;
          await writeFile(
            `${output}/${version}-${key}.png`,
            Buffer.from(data.split(",")[1], "base64"),
          );
          await page.screenshot({ path: `${output}/page-${version}-${key}.png`, fullPage: true });
        }
      }
    }
    await page.close();
  }
  const comparison = await browser.newPage();
  for (const [key, data] of Object.entries(snapshots)) {
    if (!key.startsWith("local-")) continue;
    const state = key.slice(6);
    metrics[state] = await comparison.evaluate(
      async ({ a, b }) => {
        const load = async (src) => {
          const image = new Image();
          image.src = src;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0);
          return {
            width: image.width,
            height: image.height,
            pixels: ctx.getImageData(0, 0, image.width, image.height).data,
          };
        };
        const left = await load(a),
          right = await load(b);
        if (left.width !== right.width || left.height !== right.height)
          throw new Error("Output dimensions differ");
        let total = 0,
          different = 0;
        for (let i = 0; i < left.pixels.length; i += 4) {
          let max = 0;
          for (let channel = 0; channel < 3; channel++) {
            const diff = Math.abs(left.pixels[i + channel] - right.pixels[i + channel]);
            total += diff;
            max = Math.max(max, diff);
          }
          if (max > 20) different++;
        }
        return {
          meanRgbError: total / (left.width * left.height * 3),
          pixelsOver20Percent: (different / (left.width * left.height)) * 100,
        };
      },
      { a: snapshots[`reference-${state}`], b: data },
    );
    assert.ok(metrics[state].meanRgbError < 1, `${state}: artwork differs beyond tolerance`);
    assert.ok(metrics[state].pixelsOver20Percent < 1, `${state}: too many changed pixels`);
  }
  await writeFile(`${output}/metrics.json`, JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
}
