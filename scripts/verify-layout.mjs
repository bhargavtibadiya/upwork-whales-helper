import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const url = process.env.APP_URL ?? "http://localhost:3100";
const out = process.env.EVIDENCE_DIR ?? "docs/verification/layout-v2";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const checks = [];
function check(label, condition) {
  assert.ok(condition, label);
  checks.push(label);
}
const sizes = [
  ["desktop", 1440, 900],
  ["tablet", 820, 1180],
  ["mobile", 390, 844],
];
const modes = ["profile", "portfolio", "intro"];
try {
  for (const [size, width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    for (const mode of modes) {
      await page.goto(`${url}/#${mode}`);
      await page.waitForSelector(".thumbnail-canvas");
      await page.waitForTimeout(500);
      const tag = `${size}/${mode}`;
      check(
        `${tag}: dark by default`,
        (await page.locator("html").getAttribute("data-theme")) === "dark",
      );
      check(
        `${tag}: header and footer present`,
        (await page.locator("header.site-header").count()) === 1 &&
          (await page.locator("footer.site-footer").count()) === 1,
      );
      check(
        `${tag}: old badge removed`,
        (await page.locator(".brand-badge").count()) === 0 &&
          !(await page.locator("header.site-header").textContent()).includes("Upwork Whales"),
      );
      check(
        `${tag}: no horizontal overflow`,
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      );
      const tabs = page.locator(".mode-tabs button");
      check(
        `${tag}: three tabs, active tab matches hash`,
        (await tabs.count()) === 3 &&
          (await page.locator('.mode-tabs button[aria-pressed="true"]').count()) === 1 &&
          (await tabs.nth(modes.indexOf(mode)).getAttribute("aria-pressed")) === "true",
      );
      const icon = await page.locator(".mode-tabs .mode-icon").first().boundingBox();
      check(`${tag}: mode icons at least 44px`, icon.width >= 44 && icon.height >= 44);
      const order = await page.evaluate(() => {
        const y = (s) => document.querySelector(s)?.getBoundingClientRect().top ?? -1;
        return [y(".hero h1"), y(".mode-tabs"), y(".steps"), y(".app-grid"), y(".site-footer")];
      });
      check(
        `${tag}: hero, tabs, instructions, controls, footer in order`,
        order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])),
      );
      if (mode === "profile") {
        check(
          `${tag}: shortened background label`,
          (await page.getByRole("button", { name: "Keep background", exact: true }).count()) === 1,
        );
      }
      check(
        `${tag}: no clipped control text`,
        await page.evaluate(() =>
          [...document.querySelectorAll(".segments button, .mode-tabs button")].every(
            (b) => b.scrollWidth <= b.clientWidth + 1,
          ),
        ),
      );
      check(
        `${tag}: no overlapping cards in controls column`,
        await page.evaluate(() => {
          const cards = [...document.querySelectorAll(".app-grid .surface")].map((c) =>
            c.getBoundingClientRect(),
          );
          return cards.every((c, i) => i === 0 || c.top >= cards[i - 1].bottom - 1);
        }),
      );
      check(
        `${tag}: clear gap between control cards`,
        await page.evaluate(() => {
          const cards = [...document.querySelectorAll(".controls-column > .surface")].map((c) =>
            c.getBoundingClientRect(),
          );
          return cards.every((c, i) => i === 0 || c.top - cards[i - 1].bottom >= 12);
        }),
      );
      check(
        `${tag}: clear gap between tabs and panel`,
        await page.evaluate(() => {
          const tabs = document.querySelector(".mode-tabs").getBoundingClientRect();
          const panel = document.querySelector(".studio-panel").getBoundingClientRect();
          return panel.top - tabs.bottom >= 16;
        }),
      );
      check(
        `${tag}: slim sticky header`,
        (await page.locator("header.site-header").boundingBox()).height <= 60,
      );
      check(
        `${tag}: new brand name, old name gone`,
        (await page.locator("header.site-header").textContent()).includes("Upwork Helper") &&
          !(await page.locator("body").textContent()).includes("Thumbnail Studio"),
      );
      check(
        `${tag}: owner name in header and footer`,
        (width <= 767 ||
          (await page.locator("header.site-header").textContent()).includes("Bhargav Tibadiya")) &&
          (await page.locator("footer.site-footer").textContent()).includes("Bhargav Tibadiya"),
      );
      if (mode === "profile") {
        check(
          `${tag}: eight ring presets plus custom`,
          (await page.locator(".ring-options .ring-option").count()) === 9,
        );
      } else {
        check(
          `${tag}: style and theme in separate sections`,
          (await page.locator(".style-panel .style-options").count()) === 1 &&
            (await page.locator(".theme-panel .palette-options").count()) === 1,
        );
        check(
          `${tag}: eight theme colours`,
          (await page.locator(".palette-options .palette-option").count()) === 8,
        );
        check(
          `${tag}: expected preset count`,
          (await page.locator(".style-options .style-option").count()) === 10,
        );
        check(
          `${tag}: style picker capped at two rows`,
          await page.evaluate(
            () =>
              new Set(
                [...document.querySelectorAll(".style-options .style-option")].map((b) =>
                  Math.round(b.getBoundingClientRect().top),
                ),
              ).size <= 2,
          ),
        );
      }
      await page.screenshot({ path: `${out}/${size}-${mode}-dark.png`, fullPage: true });
    }
    // header links navigate between modes
    await page.goto(`${url}/#profile`);
    if (width > 767) {
      await page.locator(".header-link", { hasText: "Intro video" }).click();
      await page.waitForTimeout(300);
      check(
        `${size}: header link switches to intro tab`,
        (await page.locator(".mode-tabs button").nth(2).getAttribute("aria-pressed")) === "true",
      );
    }
    // theme toggle
    await page.getByRole("button", { name: /light mode/i }).click();
    check(
      `${size}: toggle switches to light`,
      (await page.locator("html").getAttribute("data-theme")) === "light",
    );
    await page.reload();
    await page.waitForSelector(".thumbnail-canvas");
    check(
      `${size}: light choice persists after reload`,
      (await page.locator("html").getAttribute("data-theme")) === "light",
    );
    await page.screenshot({ path: `${out}/${size}-light.png`, fullPage: true });
    await page.getByRole("button", { name: /dark mode/i }).click();
    check(
      `${size}: toggle returns to dark`,
      (await page.locator("html").getAttribute("data-theme")) === "dark",
    );
    check(`${size}: no browser exceptions`, errors.length === 0);
    await context.close();
  }
  await writeFile(
    `${out}/checks.json`,
    `${JSON.stringify({ count: checks.length, checks }, null, 2)}\n`,
  );
  console.log(`layout checks passed: ${checks.length}`);
} finally {
  await browser.close();
}
