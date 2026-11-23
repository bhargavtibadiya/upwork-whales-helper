import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.env.APP_URL ?? "http://localhost:3104";
const canonical = "https://upworkhelper.vercel.app/";
const response = await fetch(base);
assert.equal(response.status, 200);
const html = await response.text();
for (const value of [
  'rel="canonical"',
  'property="og:image"',
  'name="twitter:card"',
  "application/ld+json",
]) {
  assert.ok(html.includes(value), `server HTML contains ${value}`);
}
assert.ok(!response.headers.get("x-robots-tag")?.includes("noindex"));
const robots = await fetch(`${base}/robots.txt`);
assert.equal(robots.status, 200);
assert.ok((await robots.text()).includes(`Sitemap: ${canonical}sitemap.xml`));
const sitemap = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemap.status, 200);
assert.ok((await sitemap.text()).includes(`<loc>${canonical}</loc>`));
const image = await fetch(`${base}/social-preview.png`);
assert.equal(image.status, 200);
assert.ok(image.headers.get("content-type").includes("image/png"));
const imageBytes = Buffer.from(await image.arrayBuffer());
assert.equal(imageBytes.readUInt32BE(16), 1200);
assert.equal(imageBytes.readUInt32BE(20), 630);
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.locator('[data-testid="main-canvas"]').waitFor();
  const presetUrl = page.url();
  assert.equal(
    new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).href,
    canonical,
  );
  assert.equal(
    new URL(await page.locator('meta[property="og:url"]').getAttribute("content")).href,
    canonical,
  );
  assert.equal(
    await page.locator('meta[name="twitter:card"]').getAttribute("content"),
    "summary_large_image",
  );
  assert.equal(await page.locator("h1").count(), 1);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  assert.equal(schema["@type"], "WebApplication");
  assert.equal(schema.url, canonical);
  assert.equal(schema.aggregateRating, undefined);
  await page.goto(presetUrl);
  await page.locator('[data-testid="main-canvas"]').waitFor();
  assert.equal(
    new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).href,
    canonical,
  );
  await mkdir("/downloads/helper-seo", { recursive: true });
  await page.screenshot({ path: "/downloads/helper-seo/homepage.png" });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: server HTML, canonical/preset, social metadata, schema, robots, sitemap, image dimensions and browser hydration",
  );
} finally {
  await browser.close();
}
