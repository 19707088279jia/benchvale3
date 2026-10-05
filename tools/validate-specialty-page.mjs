import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const productsHtml = read("products.html");
const pageHtml = read("products/specialty/index.html");
const dataJs = read("products/specialty/specialty-catalogue.js");
const pageJs = read("products/specialty/specialty-page.js");

assert(productsHtml.includes('href="products/specialty/index.html"'));
assert(productsHtml.includes("Explore Specialty Columns →"));
assert(productsHtml.includes("Specialized phases, ion-exchange, chiral, SEC, preparative and application-specific columns."));
assert(pageHtml.includes("Specialized chromatography solutions for alternative selectivity, ion exchange, carbohydrate analysis, chiral separation, size exclusion, preparative purification, and application-specific methods."));
assert(pageHtml.includes("Additional configurations and application-specific recommendations are available upon request."));
assert(!pageHtml.includes("category-filter-panel"), "Specialty must not have a filter sidebar");
assert(!pageHtml.includes("category-collection-features"), "Specialty must not have the main-series feature strip");
assert.equal((pageHtml.match(/class="category-collection-hero-photo"/g) || []).length, 1, "Specialty must use exactly one hero photo");
assert(!/(?:Add to Cart|View Specifications|Part No\.|SKU|Shopify Variant|In Stock)/i.test(pageHtml + dataJs + pageJs), "Specialty must remain family-level and quote-only");

const sandbox = { window: {} };
runInNewContext(dataJs, sandbox);
const families = sandbox.window.CHROMVALE_SPECIALTY_FAMILIES;
assert.equal(families.length, 20, "Specialty catalogue must contain exactly 20 currently offered families");
assert.equal(new Set(families.map(({ name }) => name)).size, 20, "Specialty family names must be unique");
for (const family of families) {
  assert.equal(Object.keys(family).sort().join(","), "description,name", `${family.name} must contain only family-level copy`);
  assert(family.name && family.description);
}
for (const expected of ["HPLCONE® C18(NA)", "HPLCONE® Sugar-Ca", "ChiralONE® Chiral Columns", "HPLCONE® SEC Columns", "MW Oligo Column"]) {
  assert(families.some(({ name }) => name === expected), `Missing ${expected}`);
}
assert(pageJs.includes('productFamily: family.name'));
assert(pageJs.includes('source: "Specialty Columns"'));
assert(pageJs.includes("Source: Specialty Columns"));

const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
const server = createServer((request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  let requestPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (!requestPath) requestPath = "index.html";
  let path = resolve(root, requestPath);
  if (!path.startsWith(`${root}${sep}`) && path !== root) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, "index.html");
  if (!existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[extname(path)] || "application/octet-stream" });
  response.end(readFileSync(path));
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const { port } = server.address();
const base = `http://127.0.0.1:${port}/`;
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
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(`${base}products.html`, { waitUntil: "networkidle" });
  const specialtyCard = page.getByRole("link", { name: /Specialty Columns/ });
  assert.equal(await specialtyCard.getAttribute("href"), "products/specialty/index.html");
  await specialtyCard.click();
  await page.waitForLoadState("networkidle");
  assert.equal(new URL(page.url()).pathname, "/products/specialty/index.html");
  assert.equal(await page.locator(".specialty-family-card").count(), 20);
  assert.equal(await page.getByRole("link", { name: /Request a quotation for/i }).count(), 20);
  assert.equal(await page.locator("main img").count(), 1, "Specialty must contain only its single hero photo");
  assert.equal(await page.locator("main aside, main [class*='filter'], main [class*='accordion']").count(), 0);
  const mainText = await page.locator("main").textContent();
  for (const forbidden of ["Add to Cart", "Part No.", "SKU", "In Stock", "View Specifications"]) assert(!mainText.includes(forbidden));

  const firstQuoteHref = await page.getByRole("link", { name: "Request a quotation for HPLCONE® C18(NA)" }).getAttribute("href");
  const firstQuoteUrl = new URL(firstQuoteHref, page.url());
  assert.equal(firstQuoteUrl.searchParams.get("productFamily"), "HPLCONE® C18(NA)");
  assert.equal(firstQuoteUrl.searchParams.get("source"), "Specialty Columns");
  assert(firstQuoteUrl.searchParams.get("product").includes("Source: Specialty Columns"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-specialty-desktop.png"), fullPage: true });

  await page.goto(`${base}products/category.html?category=specialty`, { waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/products/specialty/index.html", "The legacy Specialty query must resolve to the single final overview");

  await page.goto(firstQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedProduct = await page.locator('[data-product-row] input[name="Product Name[]"]').last().inputValue();
  assert(quotedProduct.includes("HPLCONE® C18(NA)"));
  assert(quotedProduct.includes("Source: Specialty Columns"));

  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto(`${base}products/specialty/`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".specialty-family-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length), 2);

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(`${base}products/specialty/`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".specialty-family-card").count(), 20);
  assert.equal(await page.locator(".specialty-family-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length), 1);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Specialty page must not overflow at 375px");
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-specialty-mobile.png"), fullPage: true });
  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  await context.close();
  console.log("PASS Specialty Columns: 20 family-level quote-only cards, no second-level catalogue UI, complete quote context, and responsive 3/2/1-column layout.");
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}
