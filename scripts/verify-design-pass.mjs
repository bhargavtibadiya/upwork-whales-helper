import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const dir = process.env.EVIDENCE_DIR ?? "/downloads/upwork-review";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const p = await browser.newPage({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
p.setDefaultTimeout(10000);
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const base = process.env.APP_URL ?? "http://localhost:3100";
let count = 0;
const check = (v, msg) => {
  assert.ok(v, msg);
  count++;
  console.log("PASS", count, msg);
};
await p.goto(`${base}/#portfolio`);
await p.evaluate(() => document.fonts.ready);
for (const mode of ["portfolio", "intro"]) {
  await p
    .locator(".mode-selector button")
    .filter({ hasText: mode === "portfolio" ? "Portfolio thumbnail" : "Intro video thumbnail" })
    .click();
  await p.getByLabel("Artwork font", { exact: true }).selectOption("original");
  for (const extra of ["Sparkle accents", "Star strip", "Accent frame"])
    check((await p.getByLabel(extra, { exact: true }).count()) === 0, `${extra} removed`);
  const ids = await p
    .locator(".style-options button")
    .evaluateAll((es) => es.map((e) => ({ id: e.dataset.style, name: e.textContent })));
  check(ids.length === 10, `${mode} has 10 styles`);
  for (const [i, item] of ids.entries()) {
    await p.locator(`[data-style="${item.id}"]`).click();
    for (const kind of ["face", "shot"])
      if (await p.locator(`#upload-${kind}`).count())
        await p
          .locator(`#upload-${kind}`)
          .setInputFiles(
            process.env[`${kind.toUpperCase()}_FIXTURE`] ??
              `tests/fixtures/fixture-${kind === "face" ? "face" : "grid"}.png`,
          );
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(80);
    const canvas = p.locator('[data-testid="main-canvas"]');
    const image = await canvas.evaluate((e) => e.toDataURL());
    await writeFile(
      `${dir}/${mode}-${i}-${item.id}.png`,
      Buffer.from(image.split(",")[1], "base64"),
    );
    if (
      ["stat", "reviews", "duo", "beforeafter", "proof", "statline", "signature"].includes(item.id)
    ) {
      const number = p.getByLabel("Stat 3 number", { exact: true });
      const previous = await number.inputValue();
      await number.fill("987X");
      await p.waitForTimeout(80);
      check(
        image !== (await canvas.evaluate((e) => e.toDataURL())),
        `${item.id} third stat edit changes artwork`,
      );
      await number.fill(previous);
      await p.waitForTimeout(80);
    }
    const [dl] = await Promise.all([
      p.waitForEvent("download"),
      p.getByRole("button", { name: "Download PNG", exact: true }).first().click(),
    ]);
    await dl.saveAs(`${dir}/export-${mode}-${item.id}.png`);
    const exported = await readFile(`${dir}/export-${mode}-${item.id}.png`);
    check(
      await p.evaluate(
        async ({ before, data }) => {
          const img = new Image();
          img.src = data;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          c.getContext("2d").drawImage(img, 0, 0);
          return c.toDataURL() === before;
        },
        { before: image, data: `data:image/png;base64,${exported.toString("base64")}` },
      ),
      `${item.id} export matches preview`,
    );
    check(
      (await canvas.evaluate((e) => e.width)) === (mode === "portfolio" ? 1000 : 1280),
      `${item.id} dimensions`,
    );
    check(
      (await p.locator('[aria-label="Stat 3 number"]').count()) === 0 ||
        (await p.locator('[aria-label="Stat 3 number"]').isVisible()),
      `${item.id} third stat visible`,
    );
    for (const extra of ["Curved arrow", "Play button"])
      check(
        (await p.getByLabel(extra, { exact: true }).count()) === 1,
        `${item.id} extra ${extra}`,
      );
  }
  await p.getByLabel("Background treatment", { exact: true }).selectOption("clean");
  await p.getByLabel("Background treatment", { exact: true }).selectOption("glow");
  if (mode === "portfolio") {
    await p.locator('[data-style="cover"]').click();
    const canvas = p.locator('[data-testid="main-canvas"]');
    const before = await canvas.evaluate((e) => e.toDataURL());
    await p.getByLabel("Browser-window screenshot", { exact: true }).check();
    await p.waitForTimeout(80);
    check(
      before !== (await canvas.evaluate((e) => e.toDataURL())),
      "browser treatment changes pixels",
    );
    await p.locator('[data-style="stat"]').click();
    await p.getByLabel("Layout version", { exact: true }).selectOption("original");
    check(
      await p.getByLabel("Stat 3 number", { exact: true }).isVisible(),
      "original stat supports three stats",
    );
    await p.getByLabel("Layout version", { exact: true }).selectOption("reworked");
    for (const shape of ["square", "circle", "rounded"])
      await p.getByLabel("Portrait shape", { exact: true }).selectOption(shape);
  }
  await p.getByRole("button", { name: "Previous styles", exact: true }).click();
  await p.waitForTimeout(400);
  const before = await p.locator(".style-options").evaluate((e) => e.scrollLeft);
  await p.getByRole("button", { name: "Next styles", exact: true }).click();
  await p.waitForTimeout(400);
  check(
    (await p.locator(".style-options").evaluate((e) => e.scrollLeft)) > before,
    `${mode} carousel scrolls`,
  );
  for (const font of ["Montserrat", "Manrope", "Anton"]) {
    await p.getByLabel("Artwork font", { exact: true }).selectOption(font);
    await p.waitForTimeout(80);
    await writeFile(
      `${dir}/font-${mode}-${font}.png`,
      Buffer.from(
        (await p.locator('[data-testid="main-canvas"]').evaluate((e) => e.toDataURL())).split(
          ",",
        )[1],
        "base64",
      ),
    );
  }

  await p.screenshot({ path: `${dir}/desktop-${mode}.png`, fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({ path: `${dir}/mobile-${mode}.png`, fullPage: true });
  await p.setViewportSize({ width: 1440, height: 1100 });
}
check(errors.length === 0, `no browser exceptions: ${errors.join(",")}`);
await writeFile(`${dir}/results.json`, JSON.stringify({ checks: count, errors }, null, 2));
console.log({ checks: count, errors, dir });
await browser.close();
