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

// 1. A preset link fills the editor; "Start fresh" clears every field.
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
  "preset link fills the editor",
  (await page.getByLabel("Project name in image").inputValue()) === "Preset Check",
);
await page.getByRole("button", { name: "Start fresh" }).click();
await page.waitForTimeout(400);
check(
  "start fresh restores default words",
  (await page.getByLabel("Big result").inputValue()) === "120K CLICKS",
);
check(
  "start fresh clears the project label",
  (await page.getByLabel("Project name in image").inputValue()) === "",
);
check(
  "start fresh clears the browser URL field",
  (await page.getByLabel("Browser address bar URL").count()) === 0,
);
check(
  "start fresh restores the default theme",
  (await page.locator('.palette-option[aria-pressed="true"]', { hasText: "Purple" }).count()) === 1,
);
check(
  "address bar still carries a working preset",
  page.url().includes("?p=") && page.url().endsWith("#portfolio"),
);

// 2. The editor keeps working after a reset.
await page.getByLabel("Project name in image").fill("After Reset");
check(
  "editor accepts new input after reset",
  (await page.getByLabel("Project name in image").inputValue()) === "After Reset",
);

// 3. A preset with a bundled demo image; the header logo clears it and the mode.
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
check("preset image is loaded before the reset", (await page.locator(".file-line").count()) === 1);
await page.locator("a.logo").click();
await page.waitForTimeout(600);
check(
  "logo reset returns to the default mode",
  page.url().includes("?p=") && page.url().endsWith("#portfolio"),
);
check(
  "logo reset clears the loaded image",
  (await page.locator(".file-line").count()) === 0,
);
check(
  "logo reset shows the default headline field",
  (await page.getByLabel("Big result").inputValue()) === "120K CLICKS",
);
check("logo reset scrolls to the top", (await page.evaluate(() => window.scrollY)) === 0);

// 4. Resetting on a fresh homepage is a no-op that keeps the editor alive.
await page.getByRole("button", { name: "Start fresh" }).click();
await page.waitForTimeout(300);
check(
  "reset on a fresh editor still renders",
  (await page.locator('[data-testid="main-canvas"]').count()) === 1,
);

// 5. No console errors anywhere in the flow.
check("no page errors", errors.length === 0);
if (errors.length) console.error(errors);

await browser.close();
console.log(`RESET CHECKS OK (${checks.length})`);
