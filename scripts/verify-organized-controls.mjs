import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const out = "/downloads/helper-ui";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let checks = 0;
const check = (x, m) => {
  assert.ok(x, m);
  checks++;
  console.log("PASS", m);
};
try {
  for (const mode of ["portfolio", "intro"]) {
    await page.goto(`${process.env.APP_URL ?? "http://localhost:3104"}/#${mode}`);
    await page.locator('[data-testid="main-canvas"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const styles = await page
      .locator("[data-style]")
      .evaluateAll((es) => es.map((e) => e.dataset.style));
    for (const style of styles) {
      await page.locator(`[data-style="${style}"]`).click();
      check(
        (await page
          .getByRole("heading", { name: "5. Canvas & background", exact: true })
          .count()) === 1,
        `${mode}/${style}: organized canvas section`,
      );
      check(
        (await page.getByText("Finishing touches", { exact: false }).count()) === 0,
        "old catch-all removed",
      );
      check(
        (await page.getByLabel("Play button", { exact: true }).count()) === 1,
        "one play toggle label",
      );
      check(
        (await page.getByLabel("Loom logo", { exact: true }).count()) === 1,
        "one Loom toggle label",
      );
      check(
        (await page
          .locator("legend")
          .filter({ hasText: /^(Play button|Loom logo)$/ })
          .count()) === 0,
        "duplicate legends removed",
      );
      for (const input of await page
        .locator(
          '.field input:not([type]), .field input[type="text"], .field textarea, .field select',
        )
        .all()) {
        check(
          await input.evaluate((e) => {
            const s = getComputedStyle(e);
            return parseFloat(s.borderTopWidth) >= 1 && e.getBoundingClientRect().height >= 44;
          }),
          `${mode}/${style}: editable input has visible boundary`,
        );
      }
    }
    await page.locator(`[data-style="${mode === "portfolio" ? "casestudy" : "meet"}"]`).click();
    await page.getByLabel("Browser-window screenshot", { exact: true }).check();
    await page.getByLabel("Browser address bar URL", { exact: true }).fill("sample.example");
    await page.getByLabel("Project name in image", { exact: true }).fill("Sample project");
    await page.getByLabel("Project name in image", { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ animations: "disabled", path: `${out}/${mode}-desktop-fields.png` });
    await page.getByLabel("Play button", { exact: true }).check();
    await page.getByLabel("Loom logo", { exact: true }).check();
    check(
      !(await page.getByLabel("Play button", { exact: true }).isChecked()),
      "Loom still replaces play",
    );
    await page
      .getByRole("heading", { name: "7. Buttons & overlays", exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ animations: "disabled", path: `${out}/${mode}-desktop-buttons.png` });
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PNG", exact: true }).first().click();
    check((await download).suggestedFilename().endsWith(".png"), "PNG export works");
    await page.setViewportSize({ width: 390, height: 844 });
    for (const theme of ["dark", "light"]) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      await page.getByLabel("Project name in image", { exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ animations: "disabled", path: `${out}/${mode}-mobile-${theme}.png` });
      check(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${mode}/${theme}: no mobile overflow`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  check(errors.length === 0, "no browser errors");
  await writeFile(`${out}/results.json`, JSON.stringify({ checks, errors }, null, 2));
} finally {
  await browser.close();
}
