import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const serviceLinks = ["services.html", "product-sourcing.html", "documentation-support.html", "shipping-returns.html", "quote.html", "contact.html"];
const pages = [
  { file: "services.html", heading: "If there is a quality issue, we will make it right.", selector: "service-card", count: 5 },
  { file: "product-sourcing.html", heading: "Product Sourcing Support", selector: "sourcing-card", count: 6 },
  { file: "documentation-support.html", heading: "Documentation Support", selector: "documentation-node", count: 6 },
  { file: "shipping-returns.html", heading: "Shipping &amp; Returns", selector: "shipping-info-card", count: 4 },
];

for (const page of pages) {
  assert(existsSync(resolve(root, page.file)), `${page.file} must exist`);
  const html = read(page.file);
  const sidebar = html.match(/<nav aria-label="Services navigation">[\s\S]*?<\/nav>/)?.[0] || "";
  for (const href of serviceLinks) assert(sidebar.includes(`href="${href}"`), `${page.file} sidebar missing ${href}`);
  assert.equal((sidebar.match(/aria-current="page"/g) || []).length, 1, `${page.file} must have one active service row`);
  assert(sidebar.includes(`href="${page.file}" aria-current="page"`), `${page.file} active service row is incorrect`);
  assert(html.includes(`>${page.heading}</h1>`), `${page.file} heading is incorrect`);
  assert.equal((html.match(new RegExp(`<article class="${page.selector}(?:[ "-])`, "g")) || []).length, page.count, `${page.file} content-module count is incorrect`);
}

const documentation = read("documentation-support.html");
for (const copy of ["Manufacturer QC Documentation", "Test Chromatograms", "Certificates of Analysis", "Product Specifications", "Lot &amp; Serial Traceability", "Column Care &amp; Usage Information"]) assert(documentation.includes(copy), `Documentation page missing ${copy}`);
const shipping = read("shipping-returns.html");
for (const copy of ["Shipping Damage", "Missing or Incorrect Items", "Returns &amp; Replacements", "How to Request Support"]) assert(shipping.includes(copy), `Shipping page missing ${copy}`);
assert(shipping.includes("shipping-info-card--priority"), "Shipping Damage must remain visually prioritized");

const quote = read("quote.html");
const shared = read("script.js");
assert(quote.includes('src="products/column-family-configurations.js"'), "Quote page must load confirmed family configurations");
assert(!quote.includes("demo-hplc-products") && !shared.includes("CHROMVALE_DEMO_HPLC_PRODUCTS"), "Demo quote data must not be customer-facing");
assert(!quote.includes("Estimated Subtotal") && !quote.includes("Unit Price"), "Quote-only catalogue must not fabricate pricing");
for (const feature of ["chromvaleQuoteProducts", "data-select-catalogue-product", "data-quote-quantity", "requestedPartNo"]) assert(shared.includes(feature), `Quote behavior missing ${feature}`);

console.log("PASS current services and RFQ architecture: consistent sidebars, current content modules, confirmed catalogue selection, structured Part No. prefill, and no demo pricing.");
