import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const out = "/downloads/rebuild-final-controls";
await mkdir(out, { recursive: true });
const b = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
p.setDefaultTimeout(10000);
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
let count = 0;
function check(x, m) {
  assert.ok(x, m);
  count++;
  console.log("PASS", count, m);
}
const image = () => p.locator('[data-testid="main-canvas"]').evaluate((e) => e.toDataURL());
const settle = () => p.waitForTimeout(100);
try {
  await p.goto(`${process.env.APP_URL ?? "http://localhost:3100"}/#portfolio`, {
    waitUntil: "networkidle",
  });
  await p.waitForTimeout(500);
  for (const id of ["stat", "reviews"]) {
    await p.locator(`[data-style="${id}"]`).click();
    await p.locator("#upload-face").setInputFiles("/downloads/demo-portrait.jpg");
    for (const v of ["original", "reworked"]) {
      await p.getByLabel("Layout version", { exact: true }).selectOption(v);
      await settle();
      const first = await image();
      await p.getByLabel("Stat 3 number", { exact: true }).fill("765X");
      await settle();
      check(first !== (await image()), `${id}/${v} Stat 3 changes actual pixels`);
      const [d] = await Promise.all([
        p.waitForEvent("download"),
        p.getByRole("button", { name: "Download PNG", exact: true }).first().click(),
      ]);
      const path = `${out}/${id}-${v}.png`;
      await d.saveAs(path);
      const bytes = await readFile(path);
      const png = `data:image/png;base64,${bytes.toString("base64")}`;
      check(
        await p.evaluate(async (data) => {
          const im = new Image();
          im.src = data;
          await im.decode();
          const c = document.createElement("canvas");
          c.width = im.width;
          c.height = im.height;
          c.getContext("2d").drawImage(im, 0, 0);
          return (
            c.toDataURL() === document.querySelector('[data-testid="main-canvas"]').toDataURL()
          );
        }, png),
        `${id}/${v} actual PNG equals preview`,
      );
      await p.getByLabel("Stat 3 number", { exact: true }).fill(v === "original" ? "51+" : "52+");
    }
  }
  await p.locator('[data-style="cover"]').click();
  await p.locator("#upload-shot").setInputFiles("tests/fixtures/fixture-grid.png");
  const plain = await image();
  await p.getByLabel("Browser-window screenshot", { exact: true }).check();
  await settle();
  check(plain !== (await image()), "browser frame changes pixels");
  for (const mode of ["portfolio", "intro"]) {
    await p
      .locator(".mode-selector button")
      .filter({ hasText: mode === "portfolio" ? "Portfolio thumbnail" : "Intro video thumbnail" })
      .click();
    for (const id of await p
      .locator(".style-options button")
      .evaluateAll((es) => es.map((e) => e.dataset.style))) {
      await p.locator(`[data-style="${id}"]`).click();
      if (id === "meet") continue;
      await p.getByLabel("Curved arrow", { exact: true }).uncheck();
      await p.getByLabel("Play button", { exact: true }).check();
      await p.getByLabel("Show button label", { exact: true }).uncheck();
      await settle();
      const icon = await image();
      await p.getByLabel("Show button label", { exact: true }).check();
      await settle();
      check(icon !== (await image()), `${id} optional label changes pixels`);
      await p.getByLabel("Show button label", { exact: true }).uncheck();
      await p.getByLabel("Play button", { exact: true }).uncheck();
      await settle();
      check(icon !== (await image()), `${id} play toggle changes pixels`);
    }
  }
  await p.locator('[data-style="tagline"]').click();
  const icons = [];
  for (const icon of [
    "code",
    "database",
    "ai",
    "cloud",
    "chart",
    "chat",
    "mobile",
    "gear",
    "search",
    "mail",
    "bolt",
    "video",
    "cart",
    "pen",
    "check",
  ]) {
    await p.getByLabel("Skill 1 icon", { exact: true }).selectOption(icon);
    await settle();
    icons.push(await image());
  }
  check(
    new Set(icons).size === 15,
    "all 15 selected icons visibly render in redesigned Title + skills",
  );
  await p.setViewportSize({ width: 390, height: 844 });
  await p.reload();
  await settle();
  await p.screenshot({ path: `${out}/mobile-controls.png`, fullPage: true });
  check(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "fresh mobile no horizontal overflow",
  );
  check(errors.length === 0, "no browser exceptions");
  await writeFile(`${out}/results.json`, JSON.stringify({ checks: count, errors }, null, 2));
} finally {
  await b.close();
}
