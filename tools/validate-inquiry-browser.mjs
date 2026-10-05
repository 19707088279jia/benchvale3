import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!path.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png" };
    response.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
    response.end(readFileSync(path));
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const base = `http://127.0.0.1:${server.address().port}/`;
const require = createRequire(resolve(dirname(process.execPath), "..", "node_modules", "playwright", "package.json"));
const { chromium } = require("playwright");
let browser;

try {
  const browserCandidates = [
    process.env.CHROMVALE_BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);
  const executablePath = browserCandidates.find((candidate) => existsSync(candidate));
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => { window.CHROMVALE_SHOPIFY_PUBLIC_TOKEN = "public-inquiry-test-token"; });
  await context.route("https://ubtqyk-kk.myshopify.com/api/2026-07/graphql.json", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ data: { collection: null, products: { nodes: [] } } }),
  }));

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(base, { waitUntil: "networkidle" });
  assert(await page.locator(".pilot-availability-notice").isVisible());
  assert.equal(await page.locator(".home-price-lead").textContent(), "CAD $439 EACH");
  assert.equal(await page.locator(".home-product-lead").textContent(), "HPLC Columns");
  assert(await page.locator(".home-pilot-terms").isVisible());
  assert.match(await page.locator(".home-slide--hplcone .home-slide-image").getAttribute("src"), /images\/hplc-columns-lab-bench\.png$/);
  assert.match(await page.locator(".home-method-product").getAttribute("src"), /images\/home-method-selection-box-only\.png$/);
  assert.equal(await page.locator(".home-promotion-grid .home-promotion-card").count(), 5);
  assert.equal(await page.locator(".home-family-diagram").count(), 4);
  assert.equal((await page.locator(".home-promotion-price").innerText()).replace(/\s+/g, " ").trim(), "CAD $439 EACH");
  assert.match(await page.locator(".home-promotion-featured-image").getAttribute("src"), /images\/home-c18a-two-boxes-150mm\.png$/);
  assert.match(await page.locator(".header-quote").textContent(), /^Request Availability(?: \(0\))?$/);
  assert.equal(await page.locator(".header-direct-cart, .header-account").count(), 0);
  if (process.env.CHROMVALE_HOME_SCREENSHOT_DIR) {
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "home-banner-1.png"), fullPage: false });
    await page.getByRole("button", { name: "Show banner 2" }).click();
    await page.waitForTimeout(850);
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "home-banner-2.png"), fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Show banner 1" }).click();
    await page.waitForTimeout(850);
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "home-banner-1-mobile.png"), fullPage: false });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator(".home-promotions").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "home-featured-families.png"), fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".home-promotions").scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "home-featured-families-mobile.png"), fullPage: false });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }

  await page.goto(`${base}products.html`, { waitUntil: "networkidle" });
  assert.equal(await page.getByText("PFP Columns", { exact: true }).count(), 0);
  assert.match(await page.locator(".featured-card-visual img").getAttribute("src"), /images\/hplc-columns-lab-bench\.png$/);
  if (process.env.CHROMVALE_HOME_SCREENSHOT_DIR) {
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "products-featured-card.png"), fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: resolve(process.env.CHROMVALE_HOME_SCREENSHOT_DIR, "products-featured-card-mobile.png"), fullPage: false });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }

  await page.goto(`${base}quote.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("main h1").textContent(), "Pilot availability request");
  assert.equal(await page.locator("#quoteInquiryConfirmation").getAttribute("required"), "");
  assert.equal(await page.locator("#quoteForm").getAttribute("action"), "https://formspree.io/f/maennaka");
  assert((await page.locator("main").textContent()).includes("No payment is collected"));
  await page.locator("#addProductItem").click();
  assert(!(await page.locator("#productPicker").textContent()).includes("PFP"));
  await page.locator("#closeProductPicker").click();

  await page.goto(`${base}products/category.html?category=pfp`, { waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/products.html");

  await page.goto(`${base}products/category.html?category=c18a`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request Availability →" }).count(), 21);
  assert.equal(await page.locator("#categorySort option").count(), 2);

  await page.goto(`${base}returns.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".terms-sale-layout").count(), 1);
  assert.equal(await page.locator(".terms-policy-sidebar").count(), 1);
  assert.deepEqual(
    await page.locator(".terms-policy-list .terms-policy-link").allTextContents(),
    ["Terms of Sale", "Return & Refund Policy", "Shipping Policy", "Privacy Policy"],
  );
  assert.deepEqual(
    await page.locator(".terms-policy-list .terms-policy-link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    ["terms-of-sale.html", "returns.html", "shipping-returns.html", "privacy.html"],
  );
  assert.equal(await page.locator('.terms-policy-link[aria-current="page"]').textContent(), "Return & Refund Policy");
  assert.equal(await page.locator('.category-nav-list a[aria-current="page"]').textContent(), "Terms of Sale");
  assert.equal(await page.locator(".policy-group").count(), 4);
  assert(await page.locator(".terms-help-card").isVisible());
  if (process.env.CHROMVALE_POLICY_SCREENSHOT) {
    await page.screenshot({ path: process.env.CHROMVALE_POLICY_SCREENSHOT, fullPage: false });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileSidebar = await page.locator(".terms-policy-sidebar").boundingBox();
  const mobileContent = await page.locator(".policy-content").boundingBox();
  assert(mobileSidebar && mobileContent && mobileContent.y > mobileSidebar.y + mobileSidebar.height, "Policy content must stack below the sidebar on mobile");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "Returns policy must not overflow horizontally on mobile");
  await page.setViewportSize({ width: 1440, height: 1000 });

  for (const policy of [
    { path: "shipping-returns.html", current: "Shipping Policy", groupCount: 12 },
    { path: "privacy.html", current: "Privacy Policy", groupCount: 6 },
  ]) {
    await page.goto(base + policy.path, { waitUntil: "networkidle" });
    assert.deepEqual(
      await page.locator(".terms-policy-list .terms-policy-link").allTextContents(),
      ["Terms of Sale", "Return & Refund Policy", "Shipping Policy", "Privacy Policy"],
    );
    assert.equal(await page.locator('.terms-policy-link[aria-current="page"]').textContent(), policy.current);
    assert.equal(await page.locator('.category-nav-list a[aria-current="page"]').textContent(), "Terms of Sale");
    assert.equal(await page.locator(".policy-group").count(), policy.groupCount);
    if (process.env.CHROMVALE_POLICY_SCREENSHOT_DIR) {
      await page.screenshot({ path: resolve(process.env.CHROMVALE_POLICY_SCREENSHOT_DIR, `${policy.path}.png`), fullPage: false });
    }
  }

  for (const path of ["cart.html", "checkout.html"]) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    assert(await page.getByRole("link", { name: "Request Availability & a Quote" }).isVisible());
    assert.equal(await page.getByRole("button", { name: /checkout|pay/i }).count(), 0);
  }

  assert.deepEqual(errors, []);
  console.log("PASS browser inquiry-only gate: public purchase controls are absent and inquiry routes render correctly.");
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
