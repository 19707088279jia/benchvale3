import { categories, categoryUrl, familyUrl } from "./taxonomy.mjs";
import { header } from "./site-navigation.mjs";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

const walk = (directory) => readdirSync(directory).flatMap((entry) => {
  if (entry === ".git" || entry === "tools") return [];
  const path = resolve(directory, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const htmlFiles = walk(root).filter((path) => extname(path).toLowerCase() === ".html");
const getIds = (html) => new Set(Array.from(html.matchAll(/\sid=["']([^"']+)["']/g), (match) => match[1]));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relativeFile = file.slice(root.length + 1);
  const references = Array.from(html.matchAll(/\s(?:href|src|action)=["']([^"']+)["']/g), (match) => match[1]);
  const seenIds = new Set();
  for (const [, id] of html.matchAll(/\sid=["']([^"']+)["']/g)) {
    if (seenIds.has(id)) failures.push(`${relativeFile}: duplicate id="${id}"`);
    seenIds.add(id);
  }

  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) continue;
    const [pathAndQuery, hash = ""] = reference.split("#", 2);
    const localPath = pathAndQuery.split("?", 1)[0];
    let target = localPath ? resolve(dirname(file), decodeURIComponent(localPath)) : file;
    if (localPath.endsWith("/")) target = resolve(target, "index.html");
    if (!existsSync(target)) {
      failures.push(`${relativeFile}: missing target for ${reference}`);
      continue;
    }
    if (hash && extname(target).toLowerCase() === ".html") {
      const ids = getIds(readFileSync(target, "utf8"));
      if (!ids.has(decodeURIComponent(hash))) failures.push(`${relativeFile}: missing #${hash} in ${target.slice(root.length + 1)}`);
    }
  }

  if (!html.includes(header(dirname(file) === resolve(root, "products") ? "../" : "")) || !html.includes("Request a Quote")) {
    failures.push(`${relativeFile}: missing shared category navigation or RFQ path`);
  }
  if (!html.includes("Laboratory Products &amp; Equipment")) failures.push(`${relativeFile}: distributor identity missing`);
  if (html.includes("jiafeng@benchvalescientific.com")) failures.push(`${relativeFile}: outdated public email remains`);
}

const productsIndex = readFileSync(resolve(root, "products.html"), "utf8");
const expectedCategories = categories.map(c => c.anchor);
for (const category of expectedCategories) {
  if (!productsIndex.includes(`id="${category}"`)) failures.push(`products.html: missing fixed category ${category}`);
}
for (const enhancement of ["productSearch", "data-product-filter", "data-product-card", "data-search"]) {
  if (!productsIndex.includes(enhancement)) failures.push(`products.html: missing catalogue enhancement ${enhancement}`);
}
for (const internalPhrase of ["Catalogue status", "Product Architecture", "Initial Product Records", "fixed categories", "Pricing Logic", "supplier quote → landed cost"]) {
  if (productsIndex.includes(internalPhrase)) failures.push(`products.html: internal project wording remains: ${internalPhrase}`);
}

const productFiles = htmlFiles.filter((path) => dirname(path) === resolve(root, "products"));
if (productFiles.length !== 14) failures.push(`Expected 14 product pages; found ${productFiles.length}`);
const requiredProductFields = ["Manufacturer", "Manufacturer Cat.No.", "Benchvale SKU", "Description", "Specifications", "Pack size", "Documents / Datasheet", "Availability", "Shipping", "Warranty", "Request a Quote", "Add to Quote", "Add to Cart"];
for (const productFile of productFiles) {
  const html = readFileSync(productFile, "utf8");
  for (const field of requiredProductFields) {
    if (!html.includes(field)) failures.push(`${productFile.slice(root.length + 1)}: missing ${field}`);
  }
  if (!html.includes("Request a Quote</strong>") || !html.includes("Technical product-class illustration")) failures.push(`${productFile.slice(root.length + 1)}: quote-only price or technical illustration missing`);
  const catNo = html.match(/Manufacturer Cat\.No\.<\/dt><dd>([^<]+)<\/dd>/)?.[1];
  const allowedCatNos = ["Manufacturer model pending", "55301", "52010, 53010, 52200, 53200"];
  if (!catNo || !allowedCatNos.includes(catNo)) failures.push(`${productFile.slice(root.length + 1)}: unapproved manufacturer Cat.No. value ${catNo || "missing"}`);
}

const quote = readFileSync(resolve(root, "quote.html"), "utf8");
for (const field of ["name", "organization", "email", "product[]", "productQuantity[]", "postalCode", "requiredDate", "notes"]) {
  if (!quote.includes(`name="${field}"`)) failures.push(`quote.html: missing RFQ field ${field}`);
}
if (!readFileSync(resolve(root, "script.js"), "utf8").includes("mailto:quotes@benchvalescientific.com")) failures.push("script.js: RFQ mailto destination missing");
for (const quoteFeature of ["benchvaleQuoteProducts", "data-product-card", "data-product-filter"]) {
  if (!readFileSync(resolve(root, "script.js"), "utf8").includes(quoteFeature)) failures.push(`script.js: missing storefront behavior ${quoteFeature}`);
}
if (readFileSync(resolve(root, "CNAME"), "utf8").trim() !== "benchvalescientific.com") failures.push("CNAME: custom domain changed");

const home = readFileSync(resolve(root, "index.html"), "utf8");
for (const section of ["Featured Promotions", "Services"]) {
  if (!home.includes(section)) failures.push(`index.html: missing storefront section ${section}`);
}
for (const [className, count] of [["home-service-card", 6], ["home-promotion-card", 6]]) {
  if (home.split(`class="${className}"`).length - 1 !== count) failures.push(`index.html: expected ${count} ${className} elements`);
}
if (home.includes('class="featured-products-section')) failures.push("index.html: duplicate standalone Featured Products section remains");
const sectionClasses = (html) => Array.from((html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "").matchAll(/<section\s+class="([^"\s]+)/g), (match) => match[1]);
if (sectionClasses(home).join(",") !== "home-slider,home-services,home-promotions") {
  failures.push("index.html: only the carousel and Services / Featured Promotions sections should remain");
}
if (!/class="[^"]*\bhome-explore-link\b[^"]*"[^>]*>\s*<a href="explore.html">Explore Products &amp; Services →<\/a>/.test(home)) {
  failures.push("index.html: subtle Explore Products & Services link missing");
}
if (!home.includes('<footer class="site-footer">')) failures.push("index.html: normal site footer missing");
if (!/<form[^>]*role="search"[^>]*action="products.html"[^>]*method="get"/.test(home) || !home.includes('name="search"')) {
  failures.push("index.html: homepage search must submit a search query to products.html");
}

const explorePath = resolve(root, "explore.html");
const explore = existsSync(explorePath) ? readFileSync(explorePath, "utf8") : "";
const movedSections = ["home-shop-section", "why-buy-section", "home-industries-section", "home-sourcing-section", "cta-band"];
if (sectionClasses(explore).join(",") !== ["page-hero", ...movedSections].join(",")) {
  failures.push("explore.html: intro and five moved sections must each appear once, in the requested order");
}
for (const className of movedSections) {
  if (home.includes(`class="${className}`)) failures.push(`index.html: moved ${className} section is duplicated on the homepage`);
}
for (const content of ["<title>Explore Benchvale | Laboratory Products, Industries &amp; Sourcing</title>", "Products, purchasing support, and laboratory solutions", "Shop by Category", "Why Buy from Benchvale", "Laboratories Served", "Sourcing Support", '<footer class="site-footer">']) {
  if (!explore.includes(content)) failures.push(`explore.html: missing ${content}`);
}
// Every family link is checked by the HTML link scan above. Validate taxonomy coverage too.
for (const c of categories) {
  if (!productsIndex.includes(`data-product-filter="${c.anchor}"`)) failures.push(`Missing ${c.name} filter`);
  for (const f of c.families) {
    if (!f.page && !f.search) failures.push(`Missing destination for ${f.name}`);
  }
}
if (productsIndex.includes('data-category="laboratory-equipment"')) failures.push("Equipment category remains");
if (productsIndex.includes('data-category="analytical"')) failures.push("Analytical must not have invented initial listings");

const petri = readFileSync(resolve(root, "products", "90mm-petri-dish.html"), "utf8");
for (const fact of ["RUNLAB", "55301", "90 × 15 mm", "high-transparency PS", "EO sterile", "Triple vent", "10/pack; 500/case"]) {
  if (!petri.includes(fact)) failures.push(`90mm-petri-dish.html: missing confirmed fact ${fact}`);
}
const tips = readFileSync(resolve(root, "products", "pipette-tips.html"), "utf8");
for (const fact of ["52010", "53010", "52200", "53200", "Rainin LTS-compatible", "10 µL and 200 µL", "Standard and filtered", "mapping", "Under supplier confirmation"]) {
  if (!tips.includes(fact)) failures.push(`pipette-tips.html: missing or unclear confirmed fact ${fact}`);
}

notes.push(`${htmlFiles.length} HTML pages scanned`);
notes.push(`${productFiles.length} product pages checked`);
notes.push("All local href/src/action targets and internal anchors checked");
notes.push("No duplicate IDs on any page; Explore section order and navigation checked");
notes.push("Homepage service/promotion counts, section order, and search form checked");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS\n${notes.join("\n")}`);
}

if (process.argv.includes("--browser") && !failures.length) {
  const {validateBrowser} = await import("./validate-browser.mjs");
  await validateBrowser(root, htmlFiles);
}
