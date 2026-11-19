import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const dir = process.env.EVIDENCE_DIR ?? "/downloads/feedback-controls";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let checks = 0;
const check = (x, m) => {
  assert.ok(x, m);
  checks++;
  console.log("PASS", checks, m);
};
const image = () => page.locator('[data-testid="main-canvas"]').evaluate((c) => c.toDataURL());
async function range(label, value) {
  await page.getByLabel(label, { exact: true }).evaluate((e, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(e, String(v));
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(90);
}
try {
  for (const mode of ["portfolio", "intro"]) {
    await page.goto(`${process.env.APP_URL ?? "http://localhost:3104"}/#${mode}`);
    await page.evaluate(() => document.fonts.ready);
    const ids = await page
      .locator("[data-style]")
      .evaluateAll((es) => es.map((e) => e.dataset.style));
    for (const id of ids) {
      await page.locator(`[data-style="${id}"]`).click();
      await page.waitForTimeout(90);
      const initial = await image();
      await range("Horizontal position", -25);
      check((await image()) !== initial, `${id} horizontal slider moves play`);
      await range("Vertical position", -25);
      const shifted = await image();
      check(shifted !== initial, `${id} vertical slider moves play`);
      await page.getByRole("button", { name: "Reset button position", exact: true }).click();
      await page.waitForTimeout(90);
      check((await image()) === initial, `${id} reset restores exact initial pixels`);
      for (const v of [-100, 100]) {
        await range("Horizontal position", v);
        await range("Vertical position", v);
        check((await image()) !== initial, `${id} extreme ${v} renders`);
      }
      await page.getByRole("button", { name: "Reset button position", exact: true }).click();
    }
  }
  await page.locator('[data-style="editorial"]').click();
  await page.getByLabel("Play button", { exact: true }).uncheck();
  check(
    (await page.getByLabel("Horizontal position", { exact: true }).count()) === 0,
    "position controls hidden when play disabled",
  );
  await page.getByLabel("Play button", { exact: true }).check();
  await page.screenshot({ path: `${dir}/desktop-sliders.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("group", { name: "Watch-me button", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${dir}/mobile-sliders.png` });
  check(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "mobile sliders no horizontal overflow",
  );
  check(errors.length === 0, "no browser exceptions");
  await writeFile(`${dir}/results.json`, JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
