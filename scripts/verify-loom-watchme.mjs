import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.env.APP_URL ?? "http://localhost:3100";
const out = "/tmp/loom-verify";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
page.setDefaultTimeout(15000);
await page.goto(base, { waitUntil: "networkidle" });
const canvas = () => page.locator('[data-testid="main-canvas"]');
const settle = () => page.waitForTimeout(250);
const pixels = async () => canvas().evaluate((c) => c.toDataURL());

const loomToggle = () => page.locator("label.toggle", { hasText: "Loom logo" }).locator("input");
const playToggle = () =>
  page.locator("label.toggle", { hasText: "Play button" }).locator("input");

const diffBox = async (a, b) =>
  page.evaluate(
    async ([sa, sb]) => {
      const load = (src) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = src;
        });
      const [ia, ib] = await Promise.all([load(sa), load(sb)]);
      const grab = (img) => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const x = c.getContext("2d");
        x.drawImage(img, 0, 0);
        return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
      };
      const A = grab(ia);
      const B = grab(ib);
      let minX = 1e9,
        minY = 1e9,
        maxX = -1,
        maxY = -1,
        count = 0;
      for (let y = 0; y < A.h; y++) {
        for (let x = 0; x < A.w; x++) {
          const i = (y * A.w + x) * 4;
          const d =
            Math.abs(A.d[i] - B.d[i]) +
            Math.abs(A.d[i + 1] - B.d[i + 1]) +
            Math.abs(A.d[i + 2] - B.d[i + 2]);
          if (d > 30) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      return { w: A.w, h: A.h, count, minX, minY, maxX, maxY };
    },
    [a, b],
  );

// --- result (portfolio default): button anchor is [0.5, 0.66] of 1000x750.
await page.locator(".style-options button").filter({ hasText: "Result + screenshot" }).click();
await settle();

const playOn = await pixels();
await canvas().screenshot({ path: `${out}/01-result-play.png` });

await loomToggle().click();
await settle();
const loomLight = await pixels();
await canvas().screenshot({ path: `${out}/02-result-loom-light.png` });
assert.equal(await playToggle().isChecked(), false, "play toggle off when loom on");
assert.equal(await loomToggle().isChecked(), true, "loom toggle on");

await page.selectOption("#loom-variant", "dark");
await settle();
const loomDark = await pixels();
await canvas().screenshot({ path: `${out}/03-result-loom-dark.png` });
await page.selectOption("#loom-variant", "image");
await page.waitForTimeout(700);
const loomImage = await pixels();
await canvas().screenshot({ path: `${out}/04-result-loom-image.png` });

await loomToggle().click();
await settle();
const bothOff = await pixels();
await canvas().screenshot({ path: `${out}/05-result-neither.png` });

assert.notEqual(loomLight, playOn, "loom light differs from play");
assert.notEqual(loomDark, loomLight, "dark differs from light");
assert.notEqual(loomImage, loomLight, "image differs from light");
assert.notEqual(bothOff, loomLight, "neither differs from loom");

await playToggle().click();
await settle();
assert.equal(await pixels(), playOn, "play restored exactly");

// Loom confined to the button slot: loom-on vs both-off changes pixels only
// around the [0.5, 0.66] anchor (the bare callout button), and crucially NOT
// in the header-pill band (y < 170) where the stray badge used to render.
const d1 = await diffBox(loomLight, bothOff);
console.log("result loom-vs-neither:", JSON.stringify(d1));
assert.ok(d1.count > 500, "loom changes pixels somewhere");
assert.ok(d1.minY > 170, "no loom pixels in the header band");
assert.ok(d1.minX > d1.w * 0.25 && d1.maxX < d1.w * 0.75, "diff horizontally around the anchor");
assert.ok(d1.minY > d1.h * 0.4 && d1.maxY < d1.h * 0.9, "diff vertically around the anchor");

// loom replaces the play button in the same slot.
const d2 = await diffBox(loomLight, playOn);
console.log("result loom-vs-play:", JSON.stringify(d2));
assert.ok(d2.count > 500, "loom differs from play at the button");
assert.ok(d2.minY > 170, "play-vs-loom diff only at the button slot");

// --- meet (intro): big centre video button. Loom replaces it there.
await page.locator(".mode-selector button").filter({ hasText: "Intro video thumbnail" }).click();
await settle();
await page.locator(".style-options button").filter({ hasText: "Meet me" }).click();
await settle();
const meetPlay = await pixels();
await canvas().screenshot({ path: `${out}/06-meet-play.png` });
await playToggle().click();
await settle();
const meetNeither = await pixels();
await loomToggle().click();
await settle();
const meetLoom = await pixels();
await canvas().screenshot({ path: `${out}/07-meet-loom.png` });
assert.notEqual(meetLoom, meetNeither, "meet: loom renders at the video button slot");
const d3 = await diffBox(meetLoom, meetNeither);
console.log("meet loom-vs-neither:", JSON.stringify(d3));
// anchor: centre of the desktop frame on the right half of a 1280x720 canvas
assert.ok(d3.minX > d3.w * 0.5, "meet loom diff on the frame side");
assert.ok(d3.count > 500, "meet loom draws pixels");
assert.notEqual(meetPlay, meetNeither, "meet: play overlay renders");

// --- Toggle layout: switch right-aligned on the same row as its label.
const layout = await page.evaluate(() => {
  const out = {};
  for (const name of ["Play button", "Loom logo", "Curved arrow"]) {
    const label = [...document.querySelectorAll("label.toggle")].find((l) =>
      l.textContent.trim().startsWith(name),
    );
    if (!label) continue;
    const span = label.querySelector("span").getBoundingClientRect();
    const input = label.querySelector("input").getBoundingClientRect();
    out[name] = {
      labelLeft: span.left,
      switchRight: input.right,
      labelMidY: (span.top + span.bottom) / 2,
      switchMidY: (input.top + input.bottom) / 2,
      rowWidth: label.getBoundingClientRect().width,
      switchWidth: input.width,
    };
  }
  return out;
});
console.log("toggle layout:", JSON.stringify(layout));
for (const [name, m] of Object.entries(layout)) {
  assert.ok(Math.abs(m.labelMidY - m.switchMidY) < 6, `${name}: toggle on the same row as label`);
  assert.ok(m.switchRight > m.labelLeft + m.rowWidth * 0.5, `${name}: switch on the right side`);
  assert.ok(m.switchWidth <= 48, `${name}: compact switch, not a stretched bar`);
}

const playSection = page.locator("fieldset.field", { hasText: "Play button" });
await playSection.screenshot({ path: `${out}/09-controls-play.png` });
await loomToggle().click();
await settle();
const loomSection = page.locator("fieldset.field", { hasText: "Loom logo" });
await loomSection.screenshot({ path: `${out}/10-controls-loom.png` });

await browser.close();
console.log("ALL CHECKS PASSED");
