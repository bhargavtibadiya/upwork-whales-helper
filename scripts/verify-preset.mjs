import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const base = process.env.APP_URL ?? "http://localhost:3100";
const checks = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
  console.log("PASS", checks.length, name);
};
const encode = (preset) =>
  Buffer.from(JSON.stringify(preset), "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

// 1. A preset link restores the design and the address bar keeps the preset.
const preset = {
  v: 1,
  mode: "portfolio",
  style: "result",
  palette: "green",
  values: { "result:pill": "SEE HOW", "result:headline": "42K VISITS" },
  browserFrame: true,
  browserUrl: "preset-check.app",
  projectLabel: "Preset Check",
};
await page.goto(`${base}/?p=${encode(preset)}#portfolio`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
check(
  "preset restores edited words",
  (await page.getByLabel("Big result").inputValue()) === "42K VISITS",
);
check(
  "preset restores the pill",
  (await page.getByLabel("Button text").inputValue()) === "SEE HOW",
);
check(
  "preset restores the theme",
  (await page.locator('.palette-option[aria-pressed="true"]', { hasText: "Green" }).count()) === 1,
);
check(
  "preset restores the browser URL field",
  (await page.getByLabel("Browser address bar URL").inputValue()) === "preset-check.app",
);
check(
  "preset restores the project label",
  (await page.getByLabel("Project name in image").inputValue()) === "Preset Check",
);
check(
  "address bar keeps the preset",
  page.url().includes("?p=") && page.url().endsWith("#portfolio"),
);

// 2. Edits rewrite the URL, so copying the address bar always shares the current design.
const before = new URL(page.url()).searchParams.get("p");
await page.getByLabel("Big result").fill("99K VISITS");
await page.waitForTimeout(400);
const after = new URL(page.url()).searchParams.get("p");
check("editing rewrites the preset in the URL", before !== after && after.length > 0);

// 3. Mode navigation still works and keeps the preset in the URL.
await page.locator(".mode-selector button").filter({ hasText: "Intro video" }).click();
await page.waitForTimeout(400);
check(
  "mode switch keeps the preset in the URL",
  page.url().includes("?p=") && page.url().endsWith("#intro"),
);

// 4. A preset can reference a bundled demo image, which loads into the editor.
const withImage = {
  v: 1,
  mode: "profile",
  style: "profile",
  ring: { preset: "toprated", color: "#2563EB", backgroundMode: "solid", background: "#E6DEFF" },
  face: { src: "/demo/face-ava.png", zoom: 100, x: 50, y: 30 },
};
await page.goto(`${base}/?p=${encode(withImage)}#profile`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".file-line", { timeout: 10000 });
await page.waitForTimeout(600);
check("bundled demo image loads from the preset", (await page.locator(".file-line").count()) === 1);
const ringCanvas = await page.locator('[data-testid="main-canvas"]').evaluate((c) => c.toDataURL());
check("demo image renders on the canvas", ringCanvas.length > 20000);

// 5. A corrupt preset never breaks the editor.
await page.goto(`${base}/?p=%%%broken#portfolio`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
check(
  "corrupt preset still renders the editor",
  (await page.locator('[data-testid="main-canvas"]').count()) === 1,
);
check(
  "corrupt preset falls back to defaults",
  (await page.getByLabel("Big result").inputValue()) === "120K CLICKS",
);

// 6. No console errors anywhere in the flow.
check("no page errors", errors.length === 0);
if (errors.length) console.error(errors);

await browser.close();
console.log(`PRESET CHECKS OK (${checks.length})`);
