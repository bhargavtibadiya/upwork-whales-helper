import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.env.APP_URL ?? "http://localhost:3100";
const output = process.env.EVIDENCE_DIR ?? "/tmp/thumbnail-verification";
const fixtures = process.env.FIXTURE_DIR ?? new URL("../tests/fixtures/", import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const checks = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const badRequests = [];
page.on("request", (request) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()))
    badRequests.push(request.url());
});
const main = () => page.locator('[data-testid="main-canvas"]');
const pixels = () => main().evaluate((canvas) => canvas.toDataURL());
const settle = () => page.waitForTimeout(170);
const mode = async (name) => {
  await page.locator(".mode-selector button").filter({ hasText: name }).click();
  await settle();
};
const style = async (name) => {
  await page.locator(".style-options button").filter({ hasText: name }).click();
  await settle();
};
const changeRange = async (label, key) => {
  await page.getByRole("slider", { name: label, exact: true }).focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < key; i++) await page.keyboard.press("ArrowRight");
  await settle();
};
const download = async (label) => {
  const before = await pixels();
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).first().click();
  const d = await waiting;
  const path = `${output}/${label}-${d.suggestedFilename()}`;
  await d.saveAs(path);
  const equality = await page.evaluate(
    async ({ data, path }) => {
      const blob = await fetch(path).then((r) => r.blob());
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.src = url;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = image.width;
      c.height = image.height;
      c.getContext("2d").drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      return { equal: c.toDataURL() === data, width: image.width, height: image.height };
    },
    {
      data: before,
      path: `data:image/png;base64,${Buffer.from(await readFile(path)).toString("base64")}`,
    },
  );
  check(`export matches preview: ${label}`, equality.equal);
  return equality;
};
try {
  await page.goto(`${base}/#intro`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await settle();
  check(
    "intro hash opens correct mode",
    await page
      .locator('.mode-selector button[aria-pressed="true"]')
      .textContent()
      .then((t) => t.includes("Intro video")),
  );
  check("all four intro styles", (await page.locator(".style-options button").count()) === 4);
  const initial = await pixels();
  await page.locator("#upload-face").setInputFiles(`${fixtures}/fixture-face.png`);
  await settle();
  await page.locator("#upload-shot").setInputFiles(`${fixtures}/fixture-grid.png`);
  await settle();
  check("both uploads render", initial !== (await pixels()));
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Bhargav");
  await page.getByRole("textbox", { name: "Big text", exact: true }).fill("LET’S BUILD");
  await page
    .getByRole("textbox", { name: "What you do", exact: true })
    .fill("Full Stack Developer");
  await settle();
  const uploaded = await pixels();
  await changeRange("Photo Zoom", 65);
  await changeRange("Photo Left / right", 22);
  await changeRange("Photo Up / down", 75);
  await changeRange("Screenshot Zoom", 40);
  await changeRange("Screenshot Left / right", 65);
  await changeRange("Screenshot Up / down", 30);
  check("crop sliders change artwork", uploaded !== (await pixels()));
  await page.getByRole("checkbox", { name: "Curved arrow", exact: true }).uncheck();
  await settle();
  const noArrow = await pixels();
  await page.getByRole("checkbox", { name: "Curved arrow", exact: true }).check();
  await settle();
  check("arrow toggle changes pixels", noArrow !== (await pixels()));
  await page.getByRole("checkbox", { name: "Play button", exact: true }).uncheck();
  await settle();
  const noPlay = await pixels();
  await page.getByRole("checkbox", { name: "Play button", exact: true }).check();
  await settle();
  check("play toggle changes pixels", noPlay !== (await pixels()));
  const introStyles = ["Meet me", "Title banner", "Big hello", "Watch this + proof"];
  const rendered = [];
  for (const name of introStyles) {
    await style(name);
    rendered.push(await pixels());
    await page.screenshot({
      path: `${output}/edited-${name.replaceAll(" ", "-")}.png`,
      fullPage: true,
    });
    const png = await download(name.replaceAll(" ", "-"));
    check(`intro dimensions: ${name}`, png.width === 1280 && png.height === 720);
  }
  check("four presets produce distinct outputs", new Set(rendered).size === 4);
  await style("Title banner");
  await page.getByRole("textbox", { name: "Skill 1 label" }).fill("APPS");
  const icons = [];
  for (const value of [
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
    await page.getByRole("combobox", { name: "Skill 1 icon" }).selectOption(value);
    await settle();
    icons.push(await pixels());
  }
  check("all 15 skill icons differ", new Set(icons).size === 15);
  await page.getByRole("textbox", { name: "Badge line 1", exact: true }).fill("");
  await page.getByRole("textbox", { name: "Badge line 2", exact: true }).fill("");
  await settle();
  await download("no-badge");
  await style("Meet me");
  check(
    "name survives preset changes",
    (await page.getByRole("textbox", { name: "Your name", exact: true }).inputValue()) ===
      "Bhargav",
  );
  check(
    "headline remains preset-specific",
    (await page.getByRole("textbox", { name: "Big text", exact: true }).inputValue()) ===
      "LET’S BUILD",
  );
  check(
    "crop survives preset changes",
    (await page.getByRole("slider", { name: "Photo Zoom", exact: true }).inputValue()) === "165",
  );
  const paletteOutputs = [];
  for (const color of ["Whales purple", "Green", "Blue", "Black"]) {
    await page.locator(".palette-options button").filter({ hasText: color }).click();
    await settle();
    paletteOutputs.push(await pixels());
  }
  check("all four artwork palettes differ", new Set(paletteOutputs).size === 4);
  await mode("Portfolio thumbnail");
  for (const name of ["Result + screenshot", "Face + big stat", "Client results"]) {
    await style(name);
    const png = await download(name.replaceAll(" ", "-"));
    check(`portfolio size: ${name}`, png.width === 1000 && png.height === 750);
  }
  await page.getByRole("button", { name: "Video / YouTube", exact: false }).click();
  await settle();
  const wide = await download("portfolio-wide");
  check("portfolio wide size", wide.width === 1280 && wide.height === 720);
  await mode("Profile picture");
  const ring = [];
  for (const name of ["Top Rated", "Top Rated Plus", "Whales purple", "Rising Talent"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await settle();
    ring.push(await pixels());
  }
  check("badge ring colours change pixels", new Set(ring).size === 4);
  await page.getByRole("checkbox", { name: "Gradient ring" }).check();
  await changeRange("Ring thickness", 80);
  await page.getByRole("button", { name: "Dark gap", exact: true }).click();
  await page.getByRole("button", { name: "Soft gradient", exact: true }).click();
  await page.getByRole("button", { name: "Soft mint", exact: true }).click();
  await settle();
  const profile = await download("profile-edited");
  check("profile size", profile.width === 1000 && profile.height === 1000);
  await mode("Intro video thumbnail");
  check(
    "mode keeps last intro style",
    (await page.locator('.style-options button[aria-pressed="true"]').textContent()) === "Meet me",
  );
  await page.locator(".upload-group").first().getByRole("button", { name: "Remove" }).click();
  await settle();
  check(
    "remove image hides crop controls",
    (await page.getByRole("slider", { name: "Photo Zoom", exact: true }).count()) === 0,
  );
  const pasted = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 120;
    c.height = 80;
    const x = c.getContext("2d");
    x.fillStyle = "#d92651";
    x.fillRect(0, 0, 120, 80);
    return c.toDataURL();
  });
  await page.evaluate(async (data) => {
    const blob = await fetch(data).then((r) => r.blob());
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], "pasted.png", { type: "image/png" }));
    window.dispatchEvent(
      new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }),
    );
  }, pasted);
  await settle();
  check(
    "clipboard screenshot is loaded",
    (await page.locator(".file-line").filter({ hasText: "pasted.png" }).count()) === 1,
  );
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 834, 1194],
    ["mobile", 390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await settle();
    check(
      `no horizontal overflow: ${name}`,
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    );
    await page.screenshot({ path: `${output}/final-${name}.png`, fullPage: true });
  }
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await mobile.goto(`${base}/#intro`, { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "Big hello", exact: true }).first().tap();
  check(
    "mobile touch changes preset",
    (await mobile.locator('.style-options button[aria-pressed="true"]').textContent()) ===
      "Big hello",
  );
  await mobile.getByRole("textbox", { name: "Big hello word" }).fill("hey");
  await mobile.locator("#upload-face").setInputFiles(`${fixtures}/fixture-face.png`);
  await mobile.waitForTimeout(200);
  const slider = mobile.getByRole("slider", { name: "Photo Zoom" });
  await slider.scrollIntoViewIfNeeded();
  const bounds = await slider.boundingBox();
  await mobile.touchscreen.tap(bounds.x + bounds.width * 0.7, bounds.y + bounds.height / 2);
  check("mobile touch changes crop", Number(await slider.inputValue()) > 100);
  await mobile.screenshot({ path: `${output}/mobile-touch-edit.png`, fullPage: true });
  await mobile.close();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mode("Profile picture");
  await page.locator("#upload-face").setInputFiles({
    name: "not-image.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await settle();
  check(
    "invalid files show a clear error",
    await page
      .locator(".error-message[role=alert]")
      .textContent()
      .then((text) => text.includes("not an image")),
  );
  await page.locator("#upload-face").setInputFiles(`${fixtures}/fixture-face.png`);
  await settle();
  await page.getByLabel("Custom ring colour", { exact: true }).fill("#f5a524");
  await settle();
  const custom = await pixels();
  await page.getByRole("button", { name: "Top Rated", exact: true }).click();
  await settle();
  check("custom ring changes artwork", custom !== (await pixels()));
  check(
    "custom ring value survives badge change",
    (await page.getByLabel("Custom ring colour", { exact: true }).inputValue()) === "#f5a524",
  );
  const gaps = [];
  for (const label of ["No gap", "White gap", "Dark gap"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await settle();
    gaps.push(await pixels());
  }
  check("all gap options differ", new Set(gaps).size === 3);
  const backgrounds = [];
  for (const label of ["Keep my photo's background", "Solid colour", "Soft gradient"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await settle();
    backgrounds.push(await pixels());
  }
  check("background modes differ with transparent photo", new Set(backgrounds).size === 3);
  await mode("Intro video thumbnail");
  await page
    .locator(".upload-zone")
    .last()
    .evaluate(async (element, data) => {
      const blob = await fetch(data).then((response) => response.blob());
      const transfer = new DataTransfer();
      transfer.items.add(new File([blob], "dropped.png", { type: "image/png" }));
      element.dispatchEvent(
        new DragEvent("drop", { dataTransfer: transfer, bubbles: true, cancelable: true }),
      );
    }, pasted);
  await settle();
  check(
    "drop loads an image",
    (await page.locator(".file-line").filter({ hasText: "dropped.png" }).count()) === 1,
  );
  for (const hash of ["profile", "portfolio", "intro"]) {
    const tab = await browser.newPage();
    await tab.goto(`${base}/#${hash}`, { waitUntil: "networkidle" });
    await tab.waitForTimeout(150);
    check(
      `direct hash opens ${hash}`,
      (await tab.locator("[data-mode]").getAttribute("data-mode")) === hash,
    );
    await tab.close();
  }
  check("no browser exceptions", errors.length === 0);
  check("no image uploads or server writes", badRequests.length === 0);
  console.log(
    JSON.stringify({ checks: checks.length, passed: checks, errors, badRequests }, null, 2),
  );
  await writeFile(
    `${output}/checks.json`,
    JSON.stringify({ checks, errors, badRequests }, null, 2),
  );
} finally {
  await browser.close();
}
