import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const output = process.env.EVIDENCE_DIR ?? "/tmp/thumbnail-fullsite";
const local = process.env.APP_URL ?? "http://localhost:3100";
const reference = process.env.REFERENCE_URL ?? "https://upwork-whales-thumbnail-maker.vercel.app";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const states = [
  ["intro", "meet", "Meet me"],
  ["intro", "banner", "Title banner"],
  ["intro", "hello", "Big hello"],
  ["intro", "proof", "Watch this + proof"],
  ["portfolio", "result", "Result + screenshot"],
  ["portfolio", "stat", "Face + big stat"],
  ["portfolio", "reviews", "Client results"],
  ["profile", "profile", null],
];
const records = {},
  checks = [];
function check(label, condition) {
  assert.ok(condition, label);
  checks.push(label);
}
try {
  for (const [version, url] of [
    ["reference", reference],
    ["local", local],
  ]) {
    const original = version === "reference";
    for (const [mode, id, label] of states) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.goto(`${url}/#${mode}`, { waitUntil: "networkidle" });
      if (label)
        await page
          .locator(original ? "#layouts button" : ".style-options button")
          .filter({ hasText: label })
          .click();
      await page.evaluate(() => document.fonts.ready);
      const record = {
        mode,
        id,
        fields: await page.locator("input[type=text]:visible").evaluateAll((es) =>
          es.map((e) => ({
            key: e.id.replace(/^(f-|word-)/, ""),
            limit: e.maxLength,
            value: e.value,
          })),
        ),
        selects: await page
          .locator("select:visible")
          .evaluateAll((es) => es.map((e) => [...e.options].map((o) => o.value))),
        toggles: await page
          .locator("input[type=checkbox]:visible")
          .evaluateAll((es) => es.map((e) => e.closest("label")?.textContent.trim())),
        sizes: {},
      };
      for (const [size, width] of [
        ["desktop", 1440],
        ["tablet", 834],
        ["mobile", 390],
      ]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise(requestAnimationFrame);
          }
          window.scrollTo(0, 0);
          await new Promise(requestAnimationFrame);
        });
        await page.screenshot({ path: `${output}/${version}-${id}-${size}.png`, fullPage: true });
        const box = await page.evaluate(
          ({ original }) => {
            const rect = (s) => {
              const e = document.querySelector(s),
                r = e.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            };
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              style: rect(
                original ? "#ringCard:not([hidden]),#styleCard:not([hidden])" : ".style-panel",
              ),
              preview: rect(original ? "#previewCol" : ".preview-column"),
              inputs: rect(original ? "#inputsCol" : ".input-column"),
              header: rect("header"),
              main: rect("main"),
              bodyHeight: document.body.scrollHeight,
            };
          },
          { original },
        );
        record.sizes[size] = box;
        check(`${version} ${id} ${size}: no page overflow`, !box.overflow);
        if (width >= 900)
          check(
            `${version} ${id} ${size}: controls left of preview`,
            box.style.x + box.style.width <= box.preview.x + 1,
          );
        else
          check(
            `${version} ${id} ${size}: style then preview then inputs`,
            box.style.y + box.style.height <= box.preview.y + 1 &&
              box.preview.y + box.preview.height <= box.inputs.y + 1,
          );
        if (version === "local") {
          const dimensions = await page.evaluate(() => {
            const a = document.querySelector(".mode-selector").getBoundingClientRect(),
              b = document.querySelector("header").getBoundingClientRect();
            return { gap: a.y - b.bottom, headerHeight: b.height };
          });
          check(`local ${id} ${size}: header precedes mode selector`, dimensions.gap >= -1);
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page
        .locator(original ? "#previewCol" : ".preview-column")
        .evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 60));
      const stickyTop = await page
        .locator(original ? "#previewCol .sticky" : ".preview-sticky")
        .evaluate((e) => e.getBoundingClientRect().top);
      check(
        `${version} ${id}: desktop preview remains visible while editing`,
        stickyTop >= 0 && stickyTop <= 24,
      );
      if (mode === "profile") {
        const p = original ? "#ringCard" : ".style-panel";
        await page.locator(p).scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/${version}-${id}-controls.png`, fullPage: true });
      }
      records[`${version}-${id}`] = record;
      await page.close();
    }
  }
  await writeFile(`${output}/inventory.json`, JSON.stringify(records, null, 2));
  for (const [, id] of states) {
    const a = records[`reference-${id}`],
      b = records[`local-${id}`];
    check(
      `${id}: same text fields, defaults and length limits`,
      JSON.stringify(a.fields) === JSON.stringify(b.fields),
    );
    check(
      `${id}: same selectable skill icons`,
      JSON.stringify(a.selects) === JSON.stringify(b.selects),
    );
    check(
      `${id}: same extras and checkbox order`,
      JSON.stringify(a.toggles) === JSON.stringify(b.toggles),
    );
  }
  await writeFile(
    `${output}/site-checks.json`,
    JSON.stringify({ checks: checks.length, passed: checks, records }, null, 2),
  );
  console.log(JSON.stringify({ checks: checks.length, passed: true, output }));
} finally {
  await browser.close();
}
