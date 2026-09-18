import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "products.html"), "utf8");
const expected = ["C18A", "C18C", "C18D", "C4C", "PFP", "PE", "NH", "Amide", "CN", "HILIC-A / Diol", "SIL", "Specialty"];
for (const family of expected) assert(html.includes(`${family} Columns`), `Missing ${family} Columns card`);
assert.equal((html.match(/products\/category\.html\?category=/g) || []).length, 11, "All 11 standard families use the shared template");
assert(html.includes('href="products/specialty/index.html"'), "Specialty has one direct overview link");
assert.equal((html.match(/class="featured-family-card"/g) || []).length, 1, "C18A remains the single featured card");
assert.equal((html.match(/class="column-family-card phase-family-card"/g) || []).length, 11, "The remaining families use 11 consistent cards");

const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname).replace(/^\/+/, "") || "products.html";
  let file = resolve(root, pathname);
  if (!file.startsWith(`${root}${sep}`)) return response.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
  if (!existsSync(file)) return response.writeHead(404).end();
  response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
  response.end(readFileSync(file));
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const require = createRequire(resolve(dirname(process.execPath), "..", "node_modules", "playwright", "package.json"));
const { chromium } = require("playwright");
let browser;
try {
  const candidates = [process.env.CHROMVALE_BROWSER_PATH, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].filter(Boolean);
  const executablePath = candidates.find(existsSync);
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = `http://127.0.0.1:${server.address().port}/`;
  await page.goto(`${base}products.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".featured-family-card, .phase-family-card").count(), 12);
  await page.goto(`${base}products.html?search=00001-255`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".featured-family-card:not([hidden]), .phase-family-card:not([hidden])").count(), 1, "Part No. search identifies C18A");
  assert((await page.locator(".product-directory-search-status").textContent()).includes("1 column family"));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${base}products.html`, { waitUntil: "networkidle" });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal overflow at 320px");
  console.log("PASS Products directory: 12 complete family entries, shared routing, Part No. search, and responsive layout.");
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}
