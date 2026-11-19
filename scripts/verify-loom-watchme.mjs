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
// Webfonts and decoded images land asynchronously and re-render the canvas.
// Capture until two consecutive frames match so equality assertions compare
// settled renders, not a mid-font-load frame.
const stablePixels = async () => {
  let prev = await pixels();
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await settle();
    const next = await pixels();
    if (next === prev) return next;
    prev = next;
  }
  return prev;
};

const loomToggle = () => page.locator("label.toggle", { hasText: "Loom logo" }).locator("input");
const playToggle = () => page.locator("label.toggle", { hasText: "Play button" }).locator("input");
const labelToggle = () =>
  page.locator("label.toggle", { hasText: "Show button label" }).locator("input");

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

const playOn = await stablePixels();
await canvas().screenshot({ path: `${out}/01-result-play.png` });

await loomToggle().click();
await settle();
const loomLight = await pixels();
await canvas().screenshot({ path: `${out}/02-result-loom-light.png` });
assert.equal(await playToggle().isChecked(), false, "play toggle off when loom on");
assert.equal(await loomToggle().isChecked(), true, "loom toggle on");
assert.equal(await labelToggle().isChecked(), true, "loom turns the button label on");

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
const loomOff = await pixels();
await canvas().screenshot({ path: `${out}/05-result-loom-off.png` });

assert.notEqual(loomLight, playOn, "loom light differs from play");
assert.notEqual(loomDark, loomLight, "dark differs from light");
assert.notEqual(loomImage, loomLight, "image differs from light");
assert.notEqual(loomOff, loomLight, "loom off differs from loom on");

await labelToggle().click(); // undo the label Loom auto-enabled
await settle();
await playToggle().click();
await settle();
assert.equal(await stablePixels(), playOn, "play restored exactly");

// Loom confined to the labelled button: loom-on vs loom-off changes pixels
// only around the [0.5, 0.66] anchor, never in the header-pill band (y < 170).
const d1 = await diffBox(loomLight, loomOff);
console.log("result loom-vs-off:", JSON.stringify(d1));
assert.ok(d1.count > 500, "loom changes pixels somewhere");
assert.ok(d1.minY > 170, "no loom pixels in the header band");
assert.ok(d1.minX > d1.w * 0.2 && d1.maxX < d1.w * 0.8, "diff horizontally around the anchor");
assert.ok(d1.minY > d1.h * 0.4 && d1.maxY < d1.h * 0.9, "diff vertically around the anchor");

// Label off while loom on: the Loom badge is fully suppressed, canvas equals
// the no-overlay render pixel for pixel.
await loomToggle().click(); // loom on (label auto-on)
await settle();
await labelToggle().click(); // label off
await settle();
const loomLabelOff = await stablePixels();
await canvas().screenshot({ path: `${out}/06-result-loom-label-off.png` });
// reference: everything off
await loomToggle().click(); // loom off
await settle();
const allOff = await stablePixels();
assert.equal(loomLabelOff, allOff, "label-off suppresses the Loom badge entirely");

// --- meet (intro): icon-only centre video button. Loom suppressed there too.
await page.locator(".mode-selector button").filter({ hasText: "Intro video thumbnail" }).click();
await settle();
await page.locator(".style-options button").filter({ hasText: "Meet me" }).click();
await settle();
// Play may carry over from the previous style, so set it explicitly.
if (!(await playToggle().isChecked())) {
  await playToggle().click();
  await settle();
}
const meetPlay = await stablePixels();
await playToggle().click(); // play off: no overlay at all
await settle();
const meetNeither = await stablePixels();
await loomToggle().click();
await settle();
const meetLoom = await stablePixels();
await canvas().screenshot({ path: `${out}/07-meet-loom.png` });
assert.equal(meetLoom, meetNeither, "meet: loom never floats standalone on the media");
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

await browser.close();
console.log("ALL CHECKS PASSED");
