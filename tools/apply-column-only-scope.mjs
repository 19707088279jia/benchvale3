import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));

const activePages = [
  "index.html",
  "products.html",
  "services.html",
  "product-sourcing.html",
  "documentation-support.html",
  "shipping-returns.html",
  "quality-qc.html",
  "about.html",
  "contact.html",
  "quote.html",
  "returns.html",
  "privacy.html",
  "cart.html",
  "checkout.html",
  "order-confirmation.html",
  "payment-placeholder.html",
  "products/category.html",
  "products/c18-hplc-column.html",
  "products/c18a.html",
  "products/specialty/index.html",
];

const retiredPages = [
  "equipment.html",
  "industries.html",
  "explore.html",
  "promotions.html",
  "products/1-5ml-microtube.html",
  "products/15ml-centrifuge-tube.html",
  "products/2ml-autosampler-vial.html",
  "products/2ml-microtube.html",
  "products/50ml-centrifuge-tube.html",
  "products/90mm-petri-dish.html",
  "products/9mm-cap-septa.html",
  "products/hdpe-bottles.html",
  "products/hotplate-magnetic-stirrer.html",
  "products/pipette-tips.html",
  "products/serological-pipettes.html",
  "products/spe-cartridges.html",
  "products/syringe-filters.html",
  "products/vortex-mixer.html",
];

const depthFor = (file) => file.split("/").slice(0, -1).map(() => "../").join("");

const footer = (depth) => `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><span class="footer-brand-name">ChromVale Scientific Inc.</span><p>Operating as ChromVale Scientific</p><p>HPLC Columns for Canadian Laboratories</p><p>Waterloo, Ontario, Canada</p></div><div><span class="footer-heading">Contact</span><ul><li><a href="mailto:quotes@chromvale.com">quotes@chromvale.com</a></li><li><a href="mailto:eric@chromvale.com">eric@chromvale.com</a></li></ul></div><div><span class="footer-heading">Navigate</span><ul><li><a href="${depth}products.html">HPLC Columns</a></li><li><a href="${depth}quality-qc.html">Quality &amp; QC</a></li><li><a href="${depth}shipping-returns.html">Shipping &amp; Returns</a></li><li><a href="${depth}about.html">About</a></li><li><a href="${depth}contact.html">Contact</a></li><li><a href="${depth}quote.html">Request Availability</a></li><li><a href="${depth}terms-of-sale.html">Terms of Sale</a></li><li><a href="${depth}privacy.html">Privacy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; 2026 ChromVale Scientific Inc.</span><span>Operating as ChromVale Scientific</span></div></div></footer>`;

for (const file of activePages) {
  const path = resolve(root, file);
  const html = readFileSync(path, "utf8");
  if (!/<footer class="site-footer">[\s\S]*?<\/footer>/.test(html)) continue;
  writeFileSync(path, html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer(depthFor(file))));
}

for (const file of retiredPages) {
  const path = resolve(root, file);
  let html = readFileSync(path, "utf8");
  const depth = depthFor(file);
  html = html.replace(/\s*<meta name="robots"[^>]*>/gi, "");
  html = html.replace(/\s*<meta http-equiv="refresh"[^>]*data-column-only-redirect[^>]*>/gi, "");
  html = html.replace(/\s*<link rel="canonical"[^>]*>/i, `\n  <link rel="canonical" href="https://chromvale.com/products.html" />`);
  html = html.replace("</head>", `  <meta name="robots" content="noindex, nofollow" />\n  <meta http-equiv="refresh" content="0; url=${depth}products.html" data-column-only-redirect />\n</head>`);
  writeFileSync(path, html);
}

console.log(`Updated ${activePages.length} active footers and retired ${retiredPages.length} non-column pages.`);
