import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const productsHtml = read("products.html");
const templateHtml = read("products/category.html");
const templateJs = read("products/category-template.js");
const familyDataJs = read("products/column-family-configurations.js");
const slugs = ["c18a", "c18c", "c18d", "c4c", "pfp", "pe", "nh", "amide", "cn", "sil", "hilic-diol"];
const expectedTitles = ["C18A Columns", "HPLCONE® C18C HPLC Columns", "HPLCONE® C18D HPLC Columns", "HPLCONE® C4C HPLC Columns", "HPLCONE® PFP HPLC Columns", "HPLCONE® PE HPLC Columns", "HPLCONE® NH HPLC Columns", "HPLCONE® Amide HPLC Columns", "HPLCONE® CN HPLC Columns", "HPLCONE® SIL HPLC Columns", "HPLCONE® Diol HPLC Columns"];

assert.equal((productsHtml.match(/products\/category\.html\?category=/g) || []).length, 11, "The 11 main series must remain linked to the shared configuration template");
assert(productsHtml.includes('href="products/specialty/index.html"'), "Specialty must link directly to its final overview page");
for (const slug of slugs) {
  assert(productsHtml.includes(`products/category.html?category=${slug}`), `Missing Products-page link for ${slug}`);
  assert(templateJs.includes(`${slug === "hilic-diol" ? '"hilic-diol"' : slug}:`), `Missing category config for ${slug}`);
}
assert(!templateHtml.includes("Add to Cart"), "Category template must not add directly to cart");
assert(!/<main[\s\S]*?<img\b/i.test(templateHtml), "Category template must not contain product image areas");
assert(templateHtml.includes("View Specifications") === false, "Product actions must be data-rendered, not duplicated in HTML");
assert(templateJs.includes("View Specifications →"), "Purchasable products need a View Specifications action");
assert(templateJs.includes("Request Quote →"), "Quote-only products need a Request Quote action");
assert(!templateJs.includes("CHROMVALE_DEMO_HPLC_PRODUCTS"), "Demo catalogue data must not feed category results");
assert(!templateJs.includes("C$0"), "Category template must never render zero as a price");
assert(read("products/c18a.html").includes("category.html?category=c18a"), "The retired duplicate C18A page must redirect to the shared family template");
assert(templateHtml.includes('<script src="column-family-configurations.js"></script>'), "Shared family data must load before the shared template");
const familySandbox = { window: {} };
runInNewContext(familyDataJs, familySandbox);
const familyCatalogs = familySandbox.window.CHROMVALE_COLUMN_FAMILIES;
const c18aCatalog = familyCatalogs.c18a;
const c18cCatalog = familyCatalogs.c18c;
const c18dCatalog = familyCatalogs.c18d;
const c4cCatalog = familyCatalogs.c4c;
const pfpCatalog = familyCatalogs.pfp;
const peCatalog = familyCatalogs.pe;
const nhCatalog = familyCatalogs.nh;
const amideCatalog = familyCatalogs.amide;
const diolCatalog = familyCatalogs["hilic-diol"];
const cnCatalog = familyCatalogs.cn;
const silCatalog = familyCatalogs.sil;
assert.equal(c18aCatalog.configurations.length, 21, "C18A catalogue must contain exactly 21 confirmed configurations");
assert.equal(c18aCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 8);
assert.equal(c18aCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 13);
assert.equal(new Set(c18aCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every C18A Part No. must be unique");
assert(!c18aCatalog.configurations.some(({ particleSize }) => particleSize === "10 μm"), "Unlisted 10 μm configurations must not be added");
assert.equal(c18aCatalog.fixedSpecifications.stationaryPhase, "C18 / ODS / Octadecyl");
assert.equal(c18aCatalog.fixedSpecifications.phRange, "1.5–10");
assert.equal(c18cCatalog.configurations.length, 17, "C18C catalogue must contain exactly 17 confirmed configurations");
assert.equal(c18cCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 5);
assert.equal(c18cCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 12);
assert.equal(new Set(c18cCatalog.configurations.map(({ partNo }) => partNo)).size, 17, "Every C18C Part No. must be unique");
assert.deepEqual([...new Set(c18cCatalog.configurations.map(({ particleSize }) => particleSize))], ["5 μm", "10 μm"]);
assert.equal(c18cCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(c18cCatalog.fixedSpecifications.stationaryPhase, "C18 / Octadecyl");
assert.equal(c18cCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(c18cCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(c18cCatalog.fixedSpecifications.carbonLoad, "22%");
assert.equal(c18cCatalog.fixedSpecifications.phRange, "1.5–12");
assert.equal(c18dCatalog.configurations.length, 17, "C18D catalogue must contain exactly 17 confirmed configurations");
assert.equal(c18dCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 4);
assert.equal(c18dCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 13);
assert.equal(new Set(c18dCatalog.configurations.map(({ partNo }) => partNo)).size, 17, "Every C18D Part No. must be unique");
assert.deepEqual([...new Set(c18dCatalog.configurations.map(({ particleSize }) => particleSize))], ["5 μm", "10 μm"]);
assert.equal(c18dCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(c18dCatalog.fixedSpecifications.stationaryPhase, "C18 / Octadecyl");
assert.equal(c18dCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(c18dCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(c18dCatalog.fixedSpecifications.carbonLoad, "14%");
assert.equal(c18dCatalog.fixedSpecifications.endcapped, "Yes / Fully endcapped");
assert.equal(c18dCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(c4cCatalog.configurations.length, 14, "C4C catalogue must contain exactly 14 confirmed configurations");
assert.equal(c4cCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 4);
assert.equal(c4cCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 10);
assert.equal(new Set(c4cCatalog.configurations.map(({ partNo }) => partNo)).size, 14, "Every C4C Part No. must be unique");
assert.deepEqual([...new Set(c4cCatalog.configurations.map(({ particleSize }) => particleSize))], ["5 μm", "10 μm"]);
assert(!c4cCatalog.configurations.some(({ particleSize }) => particleSize === "3 μm"), "Unlisted 3 μm C4C configurations must not be added");
assert.equal(c4cCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(c4cCatalog.fixedSpecifications.stationaryPhase, "C4 / Butyl");
assert.equal(c4cCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(c4cCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(c4cCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(c4cCatalog.fixedSpecifications.carbonLoad, "9%");
assert.equal(c4cCatalog.fixedSpecifications.usp, "L26");
assert.equal(c4cCatalog.fixedSpecifications.phRange, "1.5–12");
assert.equal(pfpCatalog.configurations.length, 21, "PFP catalogue must contain exactly 21 confirmed configurations");
assert.equal(pfpCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(pfpCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(pfpCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every PFP Part No. must be unique");
assert.deepEqual([...new Set(pfpCatalog.configurations.map(({ particleSize }) => particleSize))], ["5 μm", "8 μm", "10 μm"]);
assert(!pfpCatalog.configurations.some(({ particleSize }) => particleSize === "3 μm"), "Unlisted 3 μm PFP configurations must not be added");
assert.equal(pfpCatalog.fixedSpecifications.matrix, "High-purity spherical silica");
assert.equal(pfpCatalog.fixedSpecifications.stationaryPhase, "Pentafluorophenyl / PFP");
assert.equal(pfpCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(pfpCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(pfpCatalog.fixedSpecifications.carbonLoad, "10%");
assert.equal(pfpCatalog.fixedSpecifications.usp, "L43");
assert.equal(pfpCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(peCatalog.configurations.length, 21, "PE catalogue must contain exactly 21 confirmed configurations");
assert.equal(peCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(peCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(peCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every PE Part No. must be unique");
assert.deepEqual([...new Set(peCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(peCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(peCatalog.fixedSpecifications.stationaryPhase, "Phenethyl");
assert.equal(peCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(peCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(peCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(peCatalog.fixedSpecifications.carbonLoad, "11%");
assert.equal(peCatalog.fixedSpecifications.usp, "L11");
assert.equal(peCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(nhCatalog.configurations.length, 21, "NH catalogue must contain exactly 21 confirmed configurations");
assert.equal(nhCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(nhCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(nhCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every NH Part No. must be unique");
assert.deepEqual([...new Set(nhCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(nhCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(nhCatalog.fixedSpecifications.stationaryPhase, "Aminopropyl / NH2");
assert.equal(nhCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(nhCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(nhCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(nhCatalog.fixedSpecifications.carbonLoad, "7%");
assert.equal(nhCatalog.fixedSpecifications.endcapped, "Yes");
assert.equal(nhCatalog.fixedSpecifications.usp, "L8");
assert.equal(nhCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(amideCatalog.configurations.length, 21, "Amide catalogue must contain exactly 21 confirmed configurations");
assert.equal(amideCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(amideCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(amideCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every Amide Part No. must be unique");
assert.deepEqual([...new Set(amideCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(amideCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(amideCatalog.fixedSpecifications.stationaryPhase, "Propyl amide");
assert.equal(amideCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(amideCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(amideCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(amideCatalog.fixedSpecifications.carbonLoad, "9%");
assert.equal(amideCatalog.fixedSpecifications.endcapped, "No");
assert.equal(amideCatalog.fixedSpecifications.usp, "L68");
assert.equal(amideCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(diolCatalog.configurations.length, 21, "Diol catalogue must contain exactly 21 configurations");
assert.equal(diolCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(diolCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(diolCatalog.configurations.map(({ partNo }) => partNo)).size, 20, "Only the explicitly duplicated Diol Part No. may repeat");
assert.equal(diolCatalog.configurations.filter(({ partNo }) => partNo === "00001-841").length, 2, "Diol must retain both catalogue rows using 00001-841");
assert.equal(diolCatalog.configurations.filter(({ needsConfirmation }) => needsConfirmation).length, 2, "Both duplicated 00001-841 rows must require confirmation");
assert(diolCatalog.configurations.filter(({ partNo }) => partNo === "00001-841").every(({ needsConfirmation }) => needsConfirmation));
assert.deepEqual([...new Set(diolCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(diolCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(diolCatalog.fixedSpecifications.stationaryPhase, "Diol");
assert.equal(diolCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(diolCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(diolCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(diolCatalog.fixedSpecifications.carbonLoad, "11%");
assert.equal(diolCatalog.fixedSpecifications.endcapped, "No");
assert.equal(diolCatalog.fixedSpecifications.usp, "L20");
assert.equal(diolCatalog.fixedSpecifications.phRange, "1–7.5");
assert.equal(cnCatalog.configurations.length, 21, "CN catalogue must contain exactly 21 confirmed configurations");
assert.equal(cnCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(cnCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(cnCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every CN Part No. must be unique");
assert.deepEqual([...new Set(cnCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(cnCatalog.configurations.filter(({ needsConfirmation }) => needsConfirmation).length, 7, "Exactly seven 3 μm CN configurations must require confirmation");
assert(cnCatalog.configurations.filter(({ particleSize }) => particleSize === "3 μm").every(({ needsConfirmation }) => needsConfirmation), "Every 3 μm CN configuration must require confirmation");
assert(cnCatalog.configurations.filter(({ particleSize }) => particleSize !== "3 μm").every(({ needsConfirmation }) => !needsConfirmation), "Only 3 μm CN configurations may require confirmation");
assert.equal(cnCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(cnCatalog.fixedSpecifications.stationaryPhase, "Cyanopropyl / CN");
assert.equal(cnCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(cnCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(cnCatalog.fixedSpecifications.carbonLoad, "6%");
assert.equal(cnCatalog.fixedSpecifications.endcapped, "No");
assert.equal(cnCatalog.fixedSpecifications.usp, "L10");
assert.equal(cnCatalog.fixedSpecifications.phRange, "2–7.5");
assert.equal(silCatalog.configurations.length, 21, "SIL catalogue must contain exactly 21 confirmed configurations");
assert.equal(silCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length, 6);
assert.equal(silCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length, 15);
assert.equal(new Set(silCatalog.configurations.map(({ partNo }) => partNo)).size, 21, "Every SIL Part No. must be unique");
assert.deepEqual([...new Set(silCatalog.configurations.map(({ particleSize }) => particleSize))], ["3 μm", "5 μm", "10 μm"]);
assert.equal(silCatalog.fixedSpecifications.matrix, "High-purity porous spherical silica");
assert.equal(silCatalog.fixedSpecifications.stationaryPhase, "Unbonded silica");
assert.equal(silCatalog.fixedSpecifications.particleSizes, "3, 5, 10 μm");
assert.equal(silCatalog.fixedSpecifications.poreSize, "120 Å (12 nm)");
assert.equal(silCatalog.fixedSpecifications.surfaceArea, "300 m²/g");
assert.equal(silCatalog.fixedSpecifications.carbonLoad, "—");
assert.equal(silCatalog.fixedSpecifications.endcapped, "No");
assert.equal(silCatalog.fixedSpecifications.usp, "L3");
assert.equal(silCatalog.fixedSpecifications.phRange, "2–7.5");

const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) return response.writeHead(404).end();
  response.setHeader("Content-Type", contentTypes[extname(file)] || "application/octet-stream");
  response.end(readFileSync(file));
});

const money = (amount) => ({ amount: String(amount), currencyCode: "CAD" });
const metafields = (values) => Object.entries(values).map(([key, value]) => ({ namespace: "specs", key, type: "single_line_text_field", value }));
const products = [
  {
    id: "gid://shopify/Product/c18a",
    handle: "hplcone®-5c18a-hplc-column",
    title: "HPLCONE® 5C18A HPLC Column",
    description: "General-purpose high-surface-area C18 for routine analytical work.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: ["Featured"],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/c18a", title: "Default Title", sku: "00001-255", availableForSale: true, price: money(399), selectedOptions: [] }] },
    metafields: metafields({ particle_size: "5 μm", column_size: "4.6 mm I.D. × 150 mm", pore_size: "100 Å (10 nm)", usp: "L1", ph_range: "1.5–10", coa_available: "Yes" }),
  },
  {
    id: "gid://shopify/Product/c18c",
    handle: "hplcone®-5c18c-hplc-column",
    title: "HPLCONE® 5C18C HPLC Column",
    description: "High-density bonded and fully endcapped C18 for robust reversed-phase separations.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/c18c", title: "Default Title", sku: "00001-161", availableForSale: true, price: money(529), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/c18d",
    handle: "hplcone®-5c18d-hplc-column",
    title: "HPLCONE® 5C18D HPLC Column",
    description: "Aqueous-compatible C18 for hydrophilic and polar compounds.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/c18d", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/c4c",
    handle: "hplcone®-5c4c-hplc-column",
    title: "HPLCONE® 5C4C HPLC Column",
    description: "Butyl-bonded reversed-phase column.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/c4c", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/pfp",
    handle: "hplcone®-5pfp-hplc-column",
    title: "HPLCONE® 5PFP HPLC Column",
    description: "Pentafluorophenyl stationary phase.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/pfp", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/pe",
    handle: "hplcone®-5pe-hplc-column",
    title: "HPLCONE® 5PE HPLC Column",
    description: "Phenethyl-bonded stationary phase.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/pe", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/nh",
    handle: "hplcone®-5nh-hplc-column",
    title: "HPLCONE® 5NH HPLC Column",
    description: "Aminopropyl-bonded column.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/nh", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/amide",
    handle: "hplcone®-5amide-hplc-column",
    title: "HPLCONE® 5Amide HPLC Column",
    description: "Amide-bonded HILIC stationary phase.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [{ id: "gid://shopify/ProductVariant/amide", title: "Default Title", sku: "", availableForSale: false, price: money(0), selectedOptions: [] }] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/diol",
    handle: "hplcone®-5diol-hplc-column",
    title: "HPLCONE® 5Diol HPLC Column",
    description: "Diol-bonded stationary phase.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [
      { id: "gid://shopify/ProductVariant/diol-confirmed", title: "5 μm / 4.6 × 250 mm", sku: "00001-1254", availableForSale: true, price: money(549), selectedOptions: [] },
      { id: "gid://shopify/ProductVariant/diol-unconfirmed", title: "10 μm / duplicated SKU", sku: "00001-841", availableForSale: true, price: money(777), selectedOptions: [] },
    ] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/cn",
    handle: "hplcone®-5cn-hplc-column",
    title: "HPLCONE® 5CN HPLC Column",
    description: "Cyanopropyl-bonded silica column.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [
      { id: "gid://shopify/ProductVariant/cn-confirmed", title: "5 μm / 4.6 × 250 mm", sku: "00001-546", availableForSale: true, price: money(499), selectedOptions: [] },
      { id: "gid://shopify/ProductVariant/cn-unconfirmed", title: "3 μm / 4.6 × 150 mm", sku: "00001-1201", availableForSale: true, price: money(599), selectedOptions: [] },
    ] },
    metafields: [],
  },
  {
    id: "gid://shopify/Product/sil",
    handle: "hplcone®-5sil-hplc-column",
    title: "HPLCONE® 5SIL HPLC Column",
    description: "High-purity unbonded silica column.",
    vendor: "HPLCONE",
    productType: "HPLC Column",
    tags: [],
    onlineStoreUrl: null,
    variants: { nodes: [
      { id: "gid://shopify/ProductVariant/sil-confirmed", title: "5 μm / 4.6 × 250 mm", sku: "00001-467", availableForSale: true, price: money(489), selectedOptions: [] },
    ] },
    metafields: [],
  },
];
let mockCartQuantity = 0;
const mockCart = () => ({
  id: "gid://shopify/Cart/category-template-test?key=public-test",
  checkoutUrl: "https://ubtqyk-kk.myshopify.com/checkouts/category-template-test",
  totalQuantity: mockCartQuantity,
  cost: { subtotalAmount: money(mockCartQuantity * 399), totalAmount: money(mockCartQuantity * 399) },
  lines: { nodes: [] },
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
  await context.addInitScript(() => { window.CHROMVALE_SHOPIFY_PUBLIC_TOKEN = "public-test-token"; });
  const storefrontCalls = [];
  await context.route("https://ubtqyk-kk.myshopify.com/api/2026-07/graphql.json", async (route) => {
    const body = route.request().postDataJSON();
    storefrontCalls.push(body);
    let data = {};
    if (body.query.includes("ChromValeCategoryProducts")) data = { collection: null, products: { nodes: products } };
    else if (body.query.includes("query ChromValeCart")) data = { cart: null };
    else if (body.query.includes("ChromValeCartCreate")) {
      mockCartQuantity = Number(body.variables.input.lines?.[0]?.quantity || 0);
      data = { cartCreate: { cart: mockCart(), userErrors: [], warnings: [] } };
    }
    else throw new Error("Unexpected Storefront operation in category-template test");
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ data }) });
  });

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(`${base}products/category.html?category=c18a`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "C18A Columns");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const fixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["C18 / ODS / Octadecyl", "High-purity porous spherical silica", "100 Å (10 nm)", "450 m²/g", "16%", "L1", "1.5–10", "Up to 100% aqueous mobile phase"]) {
    assert(fixedSpecificationText.includes(confirmedValue), `Missing fixed C18A specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 5, "C18A row structure must remain unchanged");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title").textContent(), "Analytical Columns");
  assert.equal(await page.locator("#category-preparative-title").textContent(), "Preparative Columns");
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "8 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "13 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "C18A rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 20);
  const purchasableRow = page.locator(".category-configuration-row").filter({ hasText: "00001-255" });
  assert.equal(await purchasableRow.locator(".category-configuration-price").textContent(), "C$399.00");
  assert(await purchasableRow.getByRole("button", { name: "Add to Cart" }).isVisible());
  const quoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-438" });
  assert.equal(await quoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const quoteUrl = new URL(await quoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(quoteUrl.searchParams.get("partNo"), "00001-438");
  assert.equal(quoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(quoteUrl.searchParams.get("particleSize"), "3 μm");
  assert.equal(quoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(quoteUrl.searchParams.get("product").includes("Part No. 00001-438"));
  assert.equal(await page.locator("main img").count(), 0, "No product image or placeholder may appear");
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  const particleOptions = await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value));
  assert.deepEqual(particleOptions, ["3 μm", "5 μm", "8 μm"]);
  assert(!particleOptions.includes("10 μm"));
  await page.locator('[data-filter-key="columnType"][value="Preparative"]').check();
  assert.equal(await page.locator("#categoryProductCount").textContent(), "13 configurations");
  assert.equal(await page.locator(".category-configuration-group").count(), 1);
  await page.locator("#categoryClearFilters").click();
  await page.locator('[data-filter-key="particleSize"][value="3 μm"]').check();
  assert.equal(await page.locator("#categoryProductCount").textContent(), "4 configurations");
  await page.locator("#categoryClearFilters").click();
  await purchasableRow.getByRole("button", { name: "Add to Cart" }).click();
  await page.waitForFunction(() => document.querySelector("[data-direct-cart-count]")?.textContent === "(1)");
  assert(storefrontCalls.some(({ query }) => query.includes("ChromValeCartCreate")), "Matched SKU must use the existing Shopify cart flow");
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-category-template-desktop.png"), fullPage: true });

  await page.goto(quoteUrl.href, { waitUntil: "networkidle" });
  const selectedQuoteRow = page.locator("[data-product-row]");
  const quotedProduct = await selectedQuoteRow.locator('input[name="product[]"]').inputValue();
  const quotedSpecification = await selectedQuoteRow.locator(".quote-product-specification").textContent();
  const quotedMeta = await selectedQuoteRow.locator(".quote-product-meta").textContent();
  assert(quotedProduct.includes("HPLCONE® C18A"));
  assert(quotedSpecification.includes("Analytical Column"));
  assert(quotedSpecification.includes("3 μm"));
  assert(quotedSpecification.includes("4.6 mm I.D. × 250 mm"));
  assert(quotedMeta.includes("00001-438"));

  await page.goto(`${base}products/category.html?category=c18c`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® C18C HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "High-density bonded and fully endcapped C18 columns designed for robust reversed-phase separations across a wide pH range.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const c18cFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "C18 / Octadecyl", "5 μm, 10 μm", "120 Å (12 nm)", "300 m²/g", "22%", "Yes", "L1", "1.5–12"]) {
    assert(c18cFixedSpecificationText.includes(confirmedValue), `Missing fixed C18C specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 17);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "C18C rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "5 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "12 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "C18C rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 16);
  const c18cPurchasableRow = page.locator(".category-configuration-row").filter({ hasText: "00001-161" });
  assert.equal(await c18cPurchasableRow.locator(".category-configuration-price").textContent(), "C$529.00");
  assert(await c18cPurchasableRow.getByRole("button", { name: "Add to Cart" }).isVisible());
  const c18cQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-159" });
  assert.equal(await c18cQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const c18cQuoteUrl = new URL(await c18cQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(c18cQuoteUrl.searchParams.get("partNo"), "00001-159");
  assert.equal(c18cQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(c18cQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(c18cQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(c18cQuoteUrl.searchParams.get("product").includes("HPLCONE® C18C"));
  assert(c18cQuoteUrl.searchParams.get("product").includes("Part No. 00001-159"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["50 mm", "100 mm", "150 mm", "250 mm", "300 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "17 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-c18c-desktop.png"), fullPage: true });

  await page.goto(c18cQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedC18cProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® C18C", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-159"]) {
    assert(quotedC18cProduct.includes(value), `C18C quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=c18d`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® C18D HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Aqueous-compatible C18 stationary phase designed for enhanced retention and selectivity of hydrophilic and polar compounds.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const c18dFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "C18 / Octadecyl", "5 μm, 10 μm", "120 Å (12 nm)", "300 m²/g", "14%", "Yes / Fully endcapped", "L1", "2–7.5"]) {
    assert(c18dFixedSpecificationText.includes(confirmedValue), `Missing fixed C18D specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 17);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "C18D rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "4 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "13 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "C18D rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 17);
  const c18dQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-160" });
  assert.equal(await c18dQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const c18dQuoteUrl = new URL(await c18dQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(c18dQuoteUrl.searchParams.get("partNo"), "00001-160");
  assert.equal(c18dQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(c18dQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(c18dQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(c18dQuoteUrl.searchParams.get("product").includes("HPLCONE® C18D"));
  assert(c18dQuoteUrl.searchParams.get("product").includes("Part No. 00001-160"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["50 mm", "100 mm", "150 mm", "250 mm", "300 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "17 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-c18d-desktop.png"), fullPage: true });

  await page.goto(c18dQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedC18dProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® C18D", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-160"]) {
    assert(quotedC18dProduct.includes(value), `C18D quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=c4c`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® C4C HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Butyl-bonded reversed-phase column with enhanced acid and base resistance compared with conventional C4 phases.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const c4cFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "C4 / Butyl", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "9%", "Yes", "L26", "1.5–12"]) {
    assert(c4cFixedSpecificationText.includes(confirmedValue), `Missing fixed C4C specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 14);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "C4C rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "4 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "10 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "C4C rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 14);
  const c4cQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-600" });
  assert.equal(await c4cQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const c4cQuoteUrl = new URL(await c4cQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(c4cQuoteUrl.searchParams.get("partNo"), "00001-600");
  assert.equal(c4cQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(c4cQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(c4cQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(c4cQuoteUrl.searchParams.get("product").includes("HPLCONE® C4C"));
  assert(c4cQuoteUrl.searchParams.get("product").includes("Part No. 00001-600"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "14 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-c4c-desktop.png"), fullPage: true });

  await page.goto(c4cQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedC4cProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® C4C", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-600"]) {
    assert(quotedC4cProduct.includes(value), `C4C quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=pfp`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® PFP HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Pentafluorophenyl stationary phase providing hydrophobic, dipole and π-interaction selectivity for compounds requiring an alternative to conventional C18 or phenyl phases.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 8);
  const pfpFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity spherical silica", "Pentafluorophenyl / PFP", "120 Å (12 nm)", "300 m²/g", "10%", "Yes", "L43", "2–7.5"]) {
    assert(pfpFixedSpecificationText.includes(confirmedValue), `Missing fixed PFP specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "PFP rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "PFP rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 21);
  const pfpQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-480" });
  assert.equal(await pfpQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const pfpQuoteUrl = new URL(await pfpQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(pfpQuoteUrl.searchParams.get("partNo"), "00001-480");
  assert.equal(pfpQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(pfpQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(pfpQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(pfpQuoteUrl.searchParams.get("product").includes("HPLCONE® PFP"));
  assert(pfpQuoteUrl.searchParams.get("product").includes("Part No. 00001-480"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["5 μm", "8 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-pfp-desktop.png"), fullPage: true });

  await page.goto(pfpQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedPfpProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® PFP", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-480"]) {
    assert(quotedPfpProduct.includes(value), `PFP quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=pe`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® PE HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Phenethyl-bonded stationary phase providing hydrophobic and π–π interaction selectivity for aromatic compounds and alternative reversed-phase separations.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const peFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Phenethyl", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "11%", "Yes", "L11", "2–7.5"]) {
    assert(peFixedSpecificationText.includes(confirmedValue), `Missing fixed PE specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "PE rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "PE rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 21);
  const peQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-390" });
  assert.equal(await peQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const peQuoteUrl = new URL(await peQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(peQuoteUrl.searchParams.get("partNo"), "00001-390");
  assert.equal(peQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(peQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(peQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(peQuoteUrl.searchParams.get("product").includes("HPLCONE® PE"));
  assert(peQuoteUrl.searchParams.get("product").includes("Part No. 00001-390"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-pe-desktop.png"), fullPage: true });

  await page.goto(peQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedPeProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® PE", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-390"]) {
    assert(quotedPeProduct.includes(value), `PE quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=nh`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® NH HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Aminopropyl-bonded column for polar compound separations and applications using HILIC or normal-phase conditions.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const nhFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Aminopropyl / NH2", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "7%", "Yes", "L8", "2–7.5"]) {
    assert(nhFixedSpecificationText.includes(confirmedValue), `Missing fixed NH specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "NH rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "NH rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 21);
  const nhQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-268" });
  assert.equal(await nhQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const nhQuoteUrl = new URL(await nhQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(nhQuoteUrl.searchParams.get("partNo"), "00001-268");
  assert.equal(nhQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(nhQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(nhQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(nhQuoteUrl.searchParams.get("product").includes("HPLCONE® NH"));
  assert(nhQuoteUrl.searchParams.get("product").includes("Part No. 00001-268"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-nh-desktop.png"), fullPage: true });

  await page.goto(nhQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedNhProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® NH", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-268"]) {
    assert(quotedNhProduct.includes(value), `NH quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=amide`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® Amide HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Amide-bonded HILIC stationary phase designed for separation of highly polar compounds.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const amideFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Propyl amide", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "9%", "No", "L68", "2–7.5"]) {
    assert(amideFixedSpecificationText.includes(confirmedValue), `Missing fixed Amide specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "Amide rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "Amide rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 21);
  const amideQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-395" });
  assert.equal(await amideQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const amideQuoteUrl = new URL(await amideQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(amideQuoteUrl.searchParams.get("partNo"), "00001-395");
  assert.equal(amideQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(amideQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(amideQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 250 mm");
  assert(amideQuoteUrl.searchParams.get("product").includes("HPLCONE® Amide"));
  assert(amideQuoteUrl.searchParams.get("product").includes("Part No. 00001-395"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-amide-desktop.png"), fullPage: true });

  await page.goto(amideQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedAmideProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® Amide", "Analytical Column", "5 μm", "4.6 mm I.D. × 250 mm", "00001-395"]) {
    assert(quotedAmideProduct.includes(value), `Amide quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=hilic-diol`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® Diol HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Diol-bonded stationary phase for polar compound separations, including peptides, proteins and polar pharmaceutical compounds.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const diolFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Diol", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "11%", "No", "L20", "1–7.5"]) {
    assert(diolFixedSpecificationText.includes(confirmedValue), `Missing fixed Diol specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "Diol rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "Diol rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 20);
  const diolPurchasableRow = page.locator(".category-configuration-row").filter({ hasText: "00001-1254" });
  assert.equal(await diolPurchasableRow.locator(".category-configuration-price").textContent(), "C$549.00");
  assert(await diolPurchasableRow.getByRole("button", { name: "Add to Cart" }).isVisible());
  const duplicateDiolRows = page.locator(".category-configuration-row").filter({ hasText: "00001-841" });
  assert.equal(await duplicateDiolRows.count(), 2, "Both duplicated 00001-841 configurations must render");
  assert.equal(await duplicateDiolRows.getByRole("button", { name: "Add to Cart" }).count(), 0, "Unconfirmed duplicated SKUs must never be purchasable");
  assert.equal(await duplicateDiolRows.getByRole("link", { name: "Request a Quotation →" }).count(), 2);
  assert.deepEqual(await duplicateDiolRows.locator(".category-configuration-pricing").allTextContents(), ["Contact for pricing", "Contact for pricing"]);
  assert.equal(new Set(await duplicateDiolRows.evaluateAll((rows) => rows.map((row) => row.dataset.productId))).size, 2, "Duplicated SKUs still need distinct row identifiers");
  const diolQuoteUrl = new URL(await duplicateDiolRows.first().getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(diolQuoteUrl.searchParams.get("partNo"), "00001-841");
  assert.equal(diolQuoteUrl.searchParams.get("type"), "Preparative");
  assert.equal(diolQuoteUrl.searchParams.get("particleSize"), "10 μm");
  assert.equal(diolQuoteUrl.searchParams.get("columnSize"), "10 mm I.D. × 250 mm");
  assert(diolQuoteUrl.searchParams.get("product").includes("HPLCONE® Diol"));
  assert(diolQuoteUrl.searchParams.get("product").includes("Part No. 00001-841"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-diol-desktop.png"), fullPage: true });

  await page.goto(diolQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedDiolProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® Diol", "Preparative Column", "10 μm", "10 mm I.D. × 250 mm", "00001-841"]) {
    assert(quotedDiolProduct.includes(value), `Diol quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=cn`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® CN HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "Cyanopropyl-bonded silica column providing versatile selectivity for polar, non-polar and aromatic compounds in normal- or reversed-phase applications.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 8);
  const cnFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Cyanopropyl / CN", "120 Å (12 nm)", "300 m²/g", "6%", "No", "L10", "2–7.5"]) {
    assert(cnFixedSpecificationText.includes(confirmedValue), `Missing fixed CN specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "CN rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "CN rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 20);
  const cnPurchasableRow = page.locator(".category-configuration-row").filter({ hasText: "00001-546" });
  assert.equal(await cnPurchasableRow.locator(".category-configuration-price").textContent(), "C$499.00");
  assert(await cnPurchasableRow.getByRole("button", { name: "Add to Cart" }).isVisible());
  const cnConfirmationSkus = ["00001-1201", "00001-1202", "00001-1203", "00001-1204", "00001-1205", "00001-1206", "00001-1207"];
  for (const sku of cnConfirmationSkus) {
    const row = page.locator(".category-configuration-row").filter({ hasText: sku });
    assert.equal(await row.count(), 1);
    assert.equal(await row.getByRole("button", { name: "Add to Cart" }).count(), 0, `${sku} requires confirmation and must not be purchasable`);
    assert.equal(await row.getByRole("link", { name: "Request a Quotation →" }).count(), 1);
  }
  const cnQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-1201" });
  assert.equal(await cnQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const cnQuoteUrl = new URL(await cnQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(cnQuoteUrl.searchParams.get("partNo"), "00001-1201");
  assert.equal(cnQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(cnQuoteUrl.searchParams.get("particleSize"), "3 μm");
  assert.equal(cnQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 150 mm");
  assert(cnQuoteUrl.searchParams.get("product").includes("HPLCONE® CN"));
  assert(cnQuoteUrl.searchParams.get("product").includes("Part No. 00001-1201"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-cn-desktop.png"), fullPage: true });

  await page.goto(cnQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedCnProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® CN", "Analytical Column", "3 μm", "4.6 mm I.D. × 150 mm", "00001-1201"]) {
    assert(quotedCnProduct.includes(value), `CN quote prefill is missing ${value}`);
  }

  await page.goto(`${base}products/category.html?category=sil`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#categoryTitle").textContent(), "HPLCONE® SIL HPLC Columns");
  assert.equal(await page.locator("#categoryDescription").textContent(), "High-purity unbonded silica column for normal-phase chromatography and adsorption-based separations.");
  assert(await page.locator("#categoryFixedSpecifications").isVisible());
  assert.equal(await page.locator("#categoryFixedSpecifications dl > div").count(), 9);
  const silFixedSpecificationText = await page.locator("#categoryFixedSpecifications").textContent();
  for (const confirmedValue of ["High-purity porous spherical silica", "Unbonded silica", "3, 5, 10 μm", "120 Å (12 nm)", "300 m²/g", "—", "No", "L3", "2–7.5"]) {
    assert(silFixedSpecificationText.includes(confirmedValue), `Missing fixed SIL specification: ${confirmedValue}`);
  }
  assert.equal(await page.locator(".category-configuration-row").count(), 21);
  assert.equal(await page.locator(".category-configuration-row").first().locator(".category-product-specs > div").count(), 2, "SIL rows must show only configuration-specific values");
  assert.equal(await page.locator(".category-configuration-group").count(), 2);
  assert.equal(await page.locator("#category-analytical-title + span").textContent(), "6 configurations");
  assert.equal(await page.locator("#category-preparative-title + span").textContent(), "15 configurations");
  assert.equal(await page.locator(".category-product-state").count(), 0, "SIL rows must not show a green Available state");
  assert.equal(await page.getByRole("button", { name: "Add to Cart" }).count(), 1);
  assert.equal(await page.getByRole("link", { name: "Request a Quotation →" }).count(), 20);
  const silPurchasableRow = page.locator(".category-configuration-row").filter({ hasText: "00001-467" });
  assert.equal(await silPurchasableRow.locator(".category-configuration-price").textContent(), "C$489.00");
  assert(await silPurchasableRow.getByRole("button", { name: "Add to Cart" }).isVisible());
  const silQuoteRow = page.locator(".category-configuration-row").filter({ hasText: "00001-1195" });
  assert.equal(await silQuoteRow.locator(".category-configuration-pricing").textContent(), "Contact for pricing");
  const silQuoteUrl = new URL(await silQuoteRow.getByRole("link", { name: "Request a Quotation →" }).getAttribute("href"));
  assert.equal(silQuoteUrl.searchParams.get("partNo"), "00001-1195");
  assert.equal(silQuoteUrl.searchParams.get("type"), "Analytical");
  assert.equal(silQuoteUrl.searchParams.get("particleSize"), "5 μm");
  assert.equal(silQuoteUrl.searchParams.get("columnSize"), "4.6 mm I.D. × 150 mm");
  assert(silQuoteUrl.searchParams.get("product").includes("HPLCONE® SIL"));
  assert(silQuoteUrl.searchParams.get("product").includes("Part No. 00001-1195"));
  assert.equal(await page.locator(".category-filter-group").count(), 4);
  assert.deepEqual(await page.locator(".category-filter-group-toggle").allTextContents(), ["Column Type", "Particle Size", "Column I.D.", "Column Length"]);
  assert.deepEqual(await page.locator('[data-filter-key="particleSize"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["3 μm", "5 μm", "10 μm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnId"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["4.6 mm", "10 mm", "20 mm", "30 mm", "50 mm"]);
  assert.deepEqual(await page.locator('[data-filter-key="columnLength"]').evaluateAll((inputs) => inputs.map((input) => input.value)), ["150 mm", "250 mm"]);
  assert.equal(await page.locator("#categoryProductCount").textContent(), "21 configurations");
  assert.equal(await page.locator("main img").count(), 0);
  assert(!(await page.locator("main").textContent()).includes("View Specifications"));
  assert(!(await page.locator("main").textContent()).includes("Unavailable"));
  assert(!(await page.locator("main").textContent()).includes("C$0"));
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-sil-desktop.png"), fullPage: true });

  await page.goto(silQuoteUrl.href, { waitUntil: "networkidle" });
  const quotedSilProduct = await page.locator('[data-product-row] input[name="product[]"]').last().inputValue();
  for (const value of ["HPLCONE® SIL", "Analytical Column", "5 μm", "4.6 mm I.D. × 150 mm", "00001-1195"]) {
    assert(quotedSilProduct.includes(value), `SIL quote prefill is missing ${value}`);
  }

  for (const [index, categorySlug] of slugs.entries()) {
    await page.goto(`${base}products/category.html?category=${categorySlug}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("#categoryTitle").textContent(), expectedTitles[index], `Template title must update for ${categorySlug}`);
    assert.equal(await page.locator("#categoryBreadcrumbCurrent").textContent(), expectedTitles[index], `Breadcrumb must update for ${categorySlug}`);
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(`${base}products/category.html?category=sil`, { waitUntil: "networkidle" });
  assert(await page.locator("#categoryFilterToggle").isVisible(), "Mobile filter toggle must be visible");
  await page.locator("#categoryFilterToggle").click();
  assert.equal(await page.locator("#categoryFilterToggle").getAttribute("aria-expanded"), "true");
  assert(await page.locator("#categoryFilters").isVisible(), "Mobile filter drawer must open");
  assert(await page.locator(".category-configuration-row .category-row-button").first().isVisible(), "Mobile configuration action must remain visible");
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Category template must not overflow at 375px");
  await page.locator("#categoryFilterScrim").click();
  await page.screenshot({ path: resolve(tmpdir(), "chromvale-sil-mobile.png"), fullPage: false });
  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  await context.close();

  const liveContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const livePage = await liveContext.newPage();
  await livePage.goto(`${base}products/category.html?category=c18a`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveC18aAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveC18aQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveC18aAddButtons.count() + await liveC18aQuoteLinks.count(), 21, "Every C18A configuration must have exactly one action");
  const liveC18aPurchasableSkus = await liveC18aAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  console.log(`LIVE_C18A_PURCHASABLE_SKUS=${liveC18aPurchasableSkus.join(",") || "none"}`);
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert.equal(await livePage.locator("main img").count(), 0);

  await livePage.goto(`${base}products/category.html?category=c18c`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 17);
  const liveC18cAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveC18cQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveC18cAddButtons.count() + await liveC18cQuoteLinks.count(), 17, "Every C18C configuration must have exactly one action");
  const liveC18cPurchasableSkus = await liveC18cAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_C18C_PURCHASABLE_SKUS=${liveC18cPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=c18d`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 17);
  const liveC18dAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveC18dQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveC18dAddButtons.count() + await liveC18dQuoteLinks.count(), 17, "Every C18D configuration must have exactly one action");
  const liveC18dPurchasableSkus = await liveC18dAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_C18D_PURCHASABLE_SKUS=${liveC18dPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=c4c`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 14);
  const liveC4cAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveC4cQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveC4cAddButtons.count() + await liveC4cQuoteLinks.count(), 14, "Every C4C configuration must have exactly one action");
  const liveC4cPurchasableSkus = await liveC4cAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_C4C_PURCHASABLE_SKUS=${liveC4cPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=pfp`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const livePfpAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const livePfpQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await livePfpAddButtons.count() + await livePfpQuoteLinks.count(), 21, "Every PFP configuration must have exactly one action");
  const livePfpPurchasableSkus = await livePfpAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_PFP_PURCHASABLE_SKUS=${livePfpPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=pe`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const livePeAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const livePeQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await livePeAddButtons.count() + await livePeQuoteLinks.count(), 21, "Every PE configuration must have exactly one action");
  const livePePurchasableSkus = await livePeAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_PE_PURCHASABLE_SKUS=${livePePurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=nh`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveNhAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveNhQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveNhAddButtons.count() + await liveNhQuoteLinks.count(), 21, "Every NH configuration must have exactly one action");
  const liveNhPurchasableSkus = await liveNhAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_NH_PURCHASABLE_SKUS=${liveNhPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=amide`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveAmideAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveAmideQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveAmideAddButtons.count() + await liveAmideQuoteLinks.count(), 21, "Every Amide configuration must have exactly one action");
  const liveAmidePurchasableSkus = await liveAmideAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_AMIDE_PURCHASABLE_SKUS=${liveAmidePurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=hilic-diol`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveDiolAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveDiolQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveDiolAddButtons.count() + await liveDiolQuoteLinks.count(), 21, "Every Diol configuration must have exactly one action");
  const liveDiolPurchasableSkus = await liveDiolAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  const liveDuplicateDiolRows = livePage.locator(".category-configuration-row").filter({ hasText: "00001-841" });
  assert.equal(await liveDuplicateDiolRows.count(), 2);
  assert.equal(await liveDuplicateDiolRows.getByRole("button", { name: "Add to Cart" }).count(), 0, "Live Shopify data must not override needsConfirmation");
  assert.equal(await liveDuplicateDiolRows.getByRole("link", { name: "Request a Quotation →" }).count(), 2);
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_DIOL_PURCHASABLE_SKUS=${liveDiolPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=cn`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveCnAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveCnQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveCnAddButtons.count() + await liveCnQuoteLinks.count(), 21, "Every CN configuration must have exactly one action");
  const liveCnPurchasableSkus = await liveCnAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  for (const sku of ["00001-1201", "00001-1202", "00001-1203", "00001-1204", "00001-1205", "00001-1206", "00001-1207"]) {
    const row = livePage.locator(".category-configuration-row").filter({ hasText: sku });
    assert.equal(await row.getByRole("button", { name: "Add to Cart" }).count(), 0, `Live Shopify data must not override needsConfirmation for ${sku}`);
    assert.equal(await row.getByRole("link", { name: "Request a Quotation →" }).count(), 1);
  }
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_CN_PURCHASABLE_SKUS=${liveCnPurchasableSkus.join(",") || "none"}`);

  await livePage.goto(`${base}products/category.html?category=sil`, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await livePage.locator(".category-configuration-row").count(), 21);
  const liveSilAddButtons = livePage.getByRole("button", { name: "Add to Cart" });
  const liveSilQuoteLinks = livePage.getByRole("link", { name: "Request a Quotation →" });
  assert.equal(await liveSilAddButtons.count() + await liveSilQuoteLinks.count(), 21, "Every SIL configuration must have exactly one action");
  const liveSilPurchasableSkus = await liveSilAddButtons.evaluateAll((buttons) => buttons.map((button) => button.closest(".category-configuration-row")?.querySelector(".category-configuration-sku strong")?.textContent || "").filter(Boolean));
  assert.equal(await livePage.locator(".category-product-state").count(), 0);
  assert(!(await livePage.locator("main").textContent()).includes("C$0"));
  console.log(`LIVE_SIL_PURCHASABLE_SKUS=${liveSilPurchasableSkus.join(",") || "none"}`);
  await liveContext.close();

  const fileContext = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const filePage = await fileContext.newPage();
  const fileUrl = pathToFileURL(resolve(root, "products", "category.html"));
  fileUrl.searchParams.set("category", "c18a");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all C18A catalogue configurations");
  assert.equal(await filePage.getByRole("button", { name: "Add to Cart" }).count() + await filePage.getByRole("link", { name: "Request a Quotation →" }).count(), 21);
  fileUrl.searchParams.set("category", "c18c");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 17, "file:// preview should load all C18C catalogue configurations");
  fileUrl.searchParams.set("category", "c18d");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 17, "file:// preview should load all C18D catalogue configurations");
  fileUrl.searchParams.set("category", "c4c");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 14, "file:// preview should load all C4C catalogue configurations");
  fileUrl.searchParams.set("category", "pfp");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all PFP catalogue configurations");
  fileUrl.searchParams.set("category", "pe");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all PE catalogue configurations");
  fileUrl.searchParams.set("category", "nh");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all NH catalogue configurations");
  fileUrl.searchParams.set("category", "amide");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all Amide catalogue configurations");
  fileUrl.searchParams.set("category", "hilic-diol");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all Diol catalogue configurations");
  const fileDuplicateDiolRows = filePage.locator(".category-configuration-row").filter({ hasText: "00001-841" });
  assert.equal(await fileDuplicateDiolRows.count(), 2);
  assert.equal(await fileDuplicateDiolRows.getByRole("button", { name: "Add to Cart" }).count(), 0);
  fileUrl.searchParams.set("category", "cn");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all CN catalogue configurations");
  for (const sku of ["00001-1201", "00001-1202", "00001-1203", "00001-1204", "00001-1205", "00001-1206", "00001-1207"]) {
    assert.equal(await filePage.locator(".category-configuration-row").filter({ hasText: sku }).getByRole("button", { name: "Add to Cart" }).count(), 0);
  }
  fileUrl.searchParams.set("category", "sil");
  await filePage.goto(fileUrl.href, { waitUntil: "networkidle", timeout: 30000 });
  assert.equal(await filePage.locator(".category-configuration-row").count(), 21, "file:// preview should load all SIL catalogue configurations");
  await fileContext.close();

  console.log("PASS shared catalogue template through SIL: SIL has 21 unique configurations, one shared technical profile including the catalogue carbon-load dash, dynamic filters, SKU-matched Shopify actions, full quotation prefill, no zero/unavailable status, responsive layout, and live Shopify verification over HTTP and file preview.");
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}
