import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const walk = (directory) => readdirSync(directory).flatMap((entry) => {
  if ([".git", "node_modules"].includes(entry)) return [];
  const path = resolve(directory, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const htmlFiles = walk(root).filter((path) => extname(path).toLowerCase() === ".html");
const failures = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relative = file.slice(root.length + 1);
  assert(/<html[^>]+lang="en-CA"/i.test(html), `${relative} must declare en-CA`);
  assert(/<title>.+<\/title>/i.test(html), `${relative} must have a title`);
  if (!/noindex/i.test(html)) {
    if (!/<meta name="description" content="[^"]+"/i.test(html)) failures.push(`${relative}: missing description`);
    if (!/<link rel="canonical" href="https:\/\/chromvale\.ca\//i.test(html)) failures.push(`${relative}: missing canonical`);
  }
  for (const [, href] of html.matchAll(/\shref=["']([^"']+)["']/g)) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(href)) continue;
    const local = href.split(/[?#]/, 1)[0];
    if (!local) continue;
    let target = resolve(dirname(file), decodeURIComponent(local));
    if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, "index.html");
    if (!target.startsWith(`${root}${sep}`) || !existsSync(target)) failures.push(`${relative}: missing local target ${href}`);
  }
}

for (const required of ["robots.txt", "sitemap.xml", "products/column-family-configurations.js", "products/category.html", "products/specialty/index.html"]) assert(existsSync(resolve(root, required)), `${required} must exist`);
const allSource = walk(root).filter((path) => [".html", ".js"].includes(extname(path).toLowerCase()) && !path.includes(`${sep}tools${sep}`)).map((path) => readFileSync(path, "utf8")).join("\n");
assert(!allSource.includes("CHROMVALE_DEMO_HPLC_PRODUCTS"), "Demo HPLC product database must be removed");
assert(!allSource.includes("CV-DEMO-"), "Demo SKUs must be removed");
const quoteAndCatalogueSource = ["quote.html", "script.js", "products/category-template.js", "products/column-family-configurations.js"].map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
assert(!/C\$0(?:\.00)?/.test(quoteAndCatalogueSource), "Zero-dollar catalogue or quotation prices must not be published");
const products = readFileSync(resolve(root, "products.html"), "utf8");
assert.equal((products.match(/products\/category\.html\?category=/g) || []).length, 10);
assert(products.includes('href="products/specialty/index.html"'));
if (failures.length) throw new Error(failures.join("\n"));

console.log(`PASS release gate: ${htmlFiles.length} HTML pages checked, local links resolve, indexable pages have SEO metadata, 11 product-family entries exist, and no demo SKU or zero-price data remains.`);
