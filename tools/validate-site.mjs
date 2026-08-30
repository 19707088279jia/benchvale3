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

  if (!html.includes("Products</a>") || !html.includes("Request a Quote")) {
    failures.push(`${relativeFile}: missing Products navigation or RFQ path`);
  }
  if (!html.includes("Laboratory Products &amp; Equipment")) failures.push(`${relativeFile}: distributor identity missing`);
  if (html.includes("jiafeng@benchvalescientific.com")) failures.push(`${relativeFile}: outdated public email remains`);
}

const productsIndex = readFileSync(resolve(root, "products.html"), "utf8");
const expectedCategories = ["chromatography", "sample-preparation", "environmental-water", "general-lab", "life-science", "liquid-handling", "laboratory-equipment"];
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
for (const section of ["Shop by Category", "Featured Promotions", "Services", "Why Buy from Benchvale", "Sourcing Support"]) {
  if (!home.includes(section)) failures.push(`index.html: missing storefront section ${section}`);
}
for (const [className, count] of [["home-service-card", 6], ["home-promotion-card", 6]]) {
  if (home.split(`class="${className}"`).length - 1 !== count) failures.push(`index.html: expected ${count} ${className} elements`);
}
if (home.includes('class="featured-products-section')) failures.push("index.html: duplicate standalone Featured Products section remains");
if (!(home.indexOf('class="home-slider"') < home.indexOf('class="home-services-promotions"') && home.indexOf('class="home-services-promotions"') < home.indexOf('class="home-shop-section"'))) {
  failures.push("index.html: services/promotions must follow the hero and precede Shop by Category");
}
if (!/<form[^>]*role="search"[^>]*action="products.html"[^>]*method="get"/.test(home) || !home.includes('name="search"')) {
  failures.push("index.html: homepage search must submit a search query to products.html");
}

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
notes.push("Homepage service/promotion counts, section order, and search form checked");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS\n${notes.join("\n")}`);
}
