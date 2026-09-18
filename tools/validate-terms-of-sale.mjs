import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const html = read("terms-of-sale.html");
const css = read("terms-of-sale.css");
const js = read("terms-of-sale.js");
const shared = read("script.js");
const legacy = read("terms.html");

for (const file of ["terms-of-sale.html", "terms-of-sale.css", "terms-of-sale.js", "terms.html"]) {
  assert(existsSync(resolve(root, file)), `${file} must exist`);
}

assert(html.includes("Home") && html.includes("Policies") && html.includes("Terms of Sale"), "Breadcrumb and title must be present");
assert(html.includes("Last updated: September 17, 2026"), "Last-updated date must match the supplied copy");
assert.equal((html.match(/<article class="terms-item">/g) || []).length, 18, "Exactly 18 accordion sections are required");
assert.equal((html.match(/class="terms-trigger"/g) || []).length, 18, "Each section needs one trigger");
assert.equal((html.match(/class="terms-panel"/g) || []).length, 18, "Each section needs one panel");
assert.equal((html.match(/Detailed terms for this section will be added here\./g) || []).length, 0, "No placeholder panel copy may remain");
assert(html.includes("Business-to-Business Sales Only."), "Terms must state that ChromVale sells only to business and professional organizations");
assert(html.includes("not for personal, family, or household use"), "Terms must include the purchaser's B2B-use representation");
assert(html.includes("an automated “order received” acknowledgement confirms only that ChromVale has received the order and does not constitute acceptance"), "Automated order-received messages must be distinguished from order acceptance");
assert(html.includes("risk of loss or damage remains with ChromVale until the shipment is delivered to the Customer’s designated delivery address"), "Default shipping risk-transfer point must be explicit");
assert(html.includes("no universal return period applies"), "Return timing must match the product-specific Return Policy");
assert(!html.includes("may be considered for return within thirty (30) days"), "Conflicting universal 30-day return wording must not remain");

for (let number = 1; number <= 18; number += 1) {
  assert(html.includes(`id="terms-trigger-${number}"`), `Trigger ${number} is missing`);
  assert(html.includes(`aria-controls="terms-panel-${number}"`), `Trigger ${number} must control its panel`);
  assert(html.includes(`id="terms-panel-${number}"`), `Panel ${number} is missing`);
  assert(html.includes(`aria-labelledby="terms-trigger-${number}"`), `Panel ${number} must reference its trigger`);
  const panel = html.match(new RegExp(`id="terms-panel-${number}"[\\s\\S]*?<div class="terms-panel-inner">([\\s\\S]*?)</div></div>`));
  assert(panel && /<(?:p|li)>/.test(panel[1]), `Panel ${number} must contain imported legal copy`);
}

for (const heading of ["Scope and Application", "Orders and Acceptance", "Pricing, Taxes and Payment", "Product Specifications and Descriptions", "Technical Selection Assistance", "Customer Responsibilities and Compatibility", "Product Documentation", "Manufacturer Information and Third-Party Data", "Performance Claims and Analytical Results", "Shipping and Delivery", "Inspection, Damage and Shortages", "Returns and Return Authorization", "Limited Product Warranty", "Claims and Technical Investigation", "Exclusive Remedies", "Limitation of Liability", "Laboratory and Analytical Use", "Force Majeure and Governing Law"]) {
  assert(html.includes(`>${heading}<`), `Missing accordion heading: ${heading}`);
}

for (const href of ["terms-of-sale.html", "returns.html", "shipping-returns.html", "privacy.html", "products.html", "quote.html", "services.html", "product-sourcing.html", "documentation-support.html", "about.html", "contact.html"]) {
  assert(html.includes(`href="${href}"`), `Required page link is missing: ${href}`);
  assert(existsSync(resolve(root, href)), `Required link target does not exist: ${href}`);
}

assert.equal((html.match(/class="terms-footer-column"/g) || []).length, 4, "Footer needs Products, Services, Company, and Policies columns");
assert(css.includes("grid-template-columns: minmax(220px, 242px) minmax(0, 1fr)"), "Desktop sidebar/content grid is missing");
assert(css.includes("@media (max-width: 760px)") && css.includes("grid-template-columns: 1fr"), "Mobile stacked layout is missing");
assert(css.includes("prefers-reduced-motion: reduce"), "Reduced-motion support is missing");
assert(js.includes("for (const otherItem of items) if (otherItem !== item) closeItem(otherItem)"), "Accordion must close other open sections");
assert(shared.includes('["Terms of Sale", "terms-of-sale.html"]'), "Shared footer must point to Terms of Sale");
assert(legacy.includes('url=terms-of-sale.html') && legacy.includes('window.location.replace("terms-of-sale.html")'), "Legacy Terms URL must redirect safely");

console.log("PASS Terms of Sale: compact policy layout, 18 populated accessible single-open accordions, real policy links, responsive CSS, five-part footer, and legacy redirect.");
