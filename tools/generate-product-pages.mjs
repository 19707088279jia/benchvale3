import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productDirectory = resolve(repositoryRoot, "products");

const categories = [
  { name: "Chromatography", anchor: "chromatography", description: "Vials, closures, and consumables for HPLC and GC sample-introduction workflows.", subcategories: ["Autosampler vials", "Caps & septa", "Chromatography consumables"], icon: "vial" },
  { name: "Sample Preparation", anchor: "sample-preparation", description: "Filtration and extraction formats selected around the sample and method.", subcategories: ["Syringe filters", "SPE cartridges", "Filtration supplies"], icon: "filter" },
  { name: "Environmental & Water", anchor: "environmental-water", description: "Containers and supplies for field sampling, water testing, and environmental workflows.", subcategories: ["Sample bottles", "Reagent bottles", "Water-testing supplies"], icon: "bottle" },
  { name: "General Lab", anchor: "general-lab", description: "Routine labware and bench supplies for everyday laboratory work.", subcategories: ["Petri dishes", "Lab containers", "General consumables"], icon: "dish" },
  { name: "Life Science", anchor: "life-science", description: "Centrifuge tubes, microtubes, and related sample-handling formats.", subcategories: ["Centrifuge tubes", "Microtubes", "Sample storage"], icon: "tube" },
  { name: "Pipettes & Liquid Handling", anchor: "liquid-handling", description: "Pipettes, tips, and transfer products for routine liquid handling.", subcategories: ["Pipette tips", "Serological pipettes", "Liquid transfer"], icon: "pipette" },
  { name: "Laboratory Equipment", anchor: "laboratory-equipment", description: "Benchtop instruments and practical equipment sourced to application requirements.", subcategories: ["Mixers & shakers", "Heating & stirring", "Benchtop equipment"], icon: "equipment" },
];

const pending = {
  manufacturer: "Under supplier confirmation",
  catNo: "Manufacturer model pending",
  sku: "Assigned with quotation",
  status: "Manufacturer model pending",
  cardStatus: "Multiple configurations available",
  pack: "Pack size is confirmed for the selected configuration in the quotation.",
  documents: "Manufacturer documentation is available on request for the selected configuration.",
  verified: false,
};

const products = [
  {
    slug: "2ml-autosampler-vial", category: "Chromatography", categoryAnchor: "chromatography", subcategory: "Autosampler vials", visual: "vial",
    name: "2 mL HPLC/GC Autosampler Vial", cardDescription: "Autosampler vials selected for the required instrument, closure, and sample workflow.",
    description: "A 2 mL autosampler vial product family for HPLC and GC sample-introduction workflows. The exact vial construction and instrument or closure compatibility are confirmed against the laboratory's requirements before quotation.",
    highlights: [["Capacity", "2 mL"], ["Workflow", "HPLC / GC autosampler"], ["Selection", "Vial and closure compatibility"]],
    specs: [["Nominal capacity", "2 mL"], ["Intended workflow", "HPLC / GC autosampler"], ["Vial material and colour", "Confirmed for selected configuration"], ["Profile and dimensions", "Confirmed for selected configuration"], ["Closure compatibility", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "autosampler vial sample vial hplc gc chromatography 2ml 2 mL",
    ...pending,
  },
  {
    slug: "9mm-cap-septa", category: "Chromatography", categoryAnchor: "chromatography", subcategory: "Caps & septa", visual: "cap",
    name: "9 mm Cap / Septa", cardDescription: "Autosampler vial closures matched to cap, septum, instrument, and application requirements.",
    description: "A 9 mm autosampler vial closure product family. Cap style, septum construction, vial compatibility, and application requirements are confirmed before a manufacturer model is selected.",
    highlights: [["Closure size", "9 mm"], ["Format", "Cap / septa"], ["Selection", "Matched to vial and instrument"]],
    specs: [["Nominal closure size", "9 mm"], ["Cap style and material", "Confirmed for selected configuration"], ["Septum material and thickness", "Confirmed for selected configuration"], ["Pre-slit configuration", "Confirmed for selected configuration"], ["Vial / instrument compatibility", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "9mm 9 mm cap septa septum vial closure chromatography",
    ...pending,
  },
  {
    slug: "syringe-filters", category: "Sample Preparation", categoryAnchor: "sample-preparation", subcategory: "Syringe filters", visual: "filter",
    name: "Syringe Filters", cardDescription: "Membrane filters selected by solvent system, analyte, pore size, and downstream method.",
    description: "Syringe filters selected around the sample, solvent system, target analytes, filtration objective, and downstream method. Membrane, pore size, diameter, and housing are application- and supplier-specific.",
    highlights: [["Format", "Syringe filter"], ["Selection", "Membrane and pore size"], ["Application", "Sample preparation"]],
    specs: [["Product format", "Syringe filter"], ["Membrane", "Confirmed for selected configuration"], ["Pore size", "Confirmed for selected configuration"], ["Filter diameter", "Confirmed for selected configuration"], ["Housing and connection", "Confirmed for selected configuration"], ["Sterility / certifications", "No claim published; supplier documentation required"]],
    searchTerms: "syringe filter membrane filtration pore size sample preparation",
    ...pending,
  },
  {
    slug: "spe-cartridges", category: "Sample Preparation", categoryAnchor: "sample-preparation", subcategory: "SPE cartridges", visual: "spe",
    name: "SPE Cartridges", cardDescription: "Solid-phase extraction formats selected by chemistry, bed mass, matrix, and method.",
    description: "Solid-phase extraction cartridges selected around the laboratory's method, target analytes, matrix, sorbent chemistry, sample volume, and processing requirements.",
    highlights: [["Format", "SPE cartridge"], ["Selection", "Chemistry and bed mass"], ["Application", "Sample preparation"]],
    specs: [["Product format", "SPE cartridge"], ["Sorbent chemistry", "Confirmed for selected configuration"], ["Bed mass", "Confirmed for selected configuration"], ["Reservoir volume", "Confirmed for selected configuration"], ["Method compatibility", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "spe cartridge solid phase extraction sorbent sample preparation",
    ...pending,
  },
  {
    slug: "15ml-centrifuge-tube", category: "Life Science", categoryAnchor: "life-science", subcategory: "Centrifuge tubes", visual: "tube",
    name: "15 mL Centrifuge Tube", cardDescription: "Centrifuge tubes selected by volume, material, closure, packaging, and performance needs.",
    description: "A 15 mL centrifuge tube product family. Material, cap, graduation, rated performance, packaging, and any sterility or certification requirements are matched to a supplier configuration.",
    highlights: [["Volume", "15 mL"], ["Format", "Centrifuge tube"], ["Selection", "Performance and packaging"]],
    specs: [["Nominal volume", "15 mL"], ["Tube and cap material", "Confirmed for selected configuration"], ["Graduation and writing area", "Confirmed for selected configuration"], ["Maximum RCF", "Confirmed for selected configuration"], ["Sterility and packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "15ml 15 mL centrifuge tube life science conical",
    ...pending,
  },
  {
    slug: "50ml-centrifuge-tube", category: "Life Science", categoryAnchor: "life-science", subcategory: "Centrifuge tubes", visual: "tube",
    name: "50 mL Centrifuge Tube", cardDescription: "Centrifuge tubes selected by volume, material, closure, packaging, and performance needs.",
    description: "A 50 mL centrifuge tube product family. Tube construction, closure, rated performance, packaging, and any sterility or certification requirements are confirmed for the selected configuration.",
    highlights: [["Volume", "50 mL"], ["Format", "Centrifuge tube"], ["Selection", "Performance and packaging"]],
    specs: [["Nominal volume", "50 mL"], ["Tube and cap material", "Confirmed for selected configuration"], ["Graduation and writing area", "Confirmed for selected configuration"], ["Maximum RCF", "Confirmed for selected configuration"], ["Sterility and packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "50ml 50 mL centrifuge tube life science conical",
    ...pending,
  },
  {
    slug: "1-5ml-microtube", category: "Life Science", categoryAnchor: "life-science", subcategory: "Microtubes", visual: "microtube",
    name: "1.5 mL Microtube", cardDescription: "General-purpose microtubes selected by volume, closure, treatment, and packaging needs.",
    description: "A 1.5 mL microtube product family. Tube material, closure design, rated performance, packaging, and treatment or sterility requirements are confirmed for the selected supplier configuration.",
    highlights: [["Volume", "1.5 mL"], ["Format", "Microtube"], ["Selection", "Closure and packaging"]],
    specs: [["Nominal volume", "1.5 mL"], ["Tube and closure material", "Confirmed for selected configuration"], ["Closure design", "Confirmed for selected configuration"], ["Maximum RCF", "Confirmed for selected configuration"], ["Treatment, sterility and packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "1.5ml 1.5 mL microtube microcentrifuge tube life science",
    ...pending,
  },
  {
    slug: "2ml-microtube", category: "Life Science", categoryAnchor: "life-science", subcategory: "Microtubes", visual: "microtube",
    name: "2.0 mL Microtube", cardDescription: "General-purpose microtubes selected by volume, closure, treatment, and packaging needs.",
    description: "A 2.0 mL microtube product family. Tube material, closure design, rated performance, packaging, and treatment or sterility requirements are confirmed for the selected supplier configuration.",
    highlights: [["Volume", "2.0 mL"], ["Format", "Microtube"], ["Selection", "Closure and packaging"]],
    specs: [["Nominal volume", "2.0 mL"], ["Tube and closure material", "Confirmed for selected configuration"], ["Closure design", "Confirmed for selected configuration"], ["Maximum RCF", "Confirmed for selected configuration"], ["Treatment, sterility and packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "2ml 2.0 mL microtube microcentrifuge tube life science",
    ...pending,
  },
  {
    slug: "90mm-petri-dish", category: "General Lab", categoryAnchor: "general-lab", subcategory: "Petri dishes", visual: "dish",
    name: "RUNLAB 90 × 15 mm Sterile Petri Dish", cardDescription: "High-transparency PS, EO sterile, triple vent, 10/pack and 500/case.",
    description: "RUNLAB Cat.No. 55301 is a 90 × 15 mm sterile Petri dish made from high-transparency PS. The confirmed configuration is EO sterile, triple vent, packed 10 dishes per pack and 500 dishes per case.",
    manufacturer: "RUNLAB", catNo: "55301", sku: "Assigned with quotation", status: "Confirmed product information", cardStatus: "Confirmed RUNLAB product", verified: true,
    highlights: [["Dimensions", "90 × 15 mm"], ["Material", "High-transparency PS"], ["Pack", "10/pack · 500/case"]],
    specs: [["Dimensions", "90 × 15 mm"], ["Material", "High-transparency PS"], ["Sterility", "EO sterile"], ["Vent configuration", "Triple vent"], ["Manufacturer Cat.No.", "55301"]],
    pack: "10/pack; 500/case.",
    documents: "A manufacturer datasheet is not published on this page. Request the applicable RUNLAB supplier document with the quotation.",
    searchTerms: "RUNLAB 55301 petri dish 90 15 sterile EO high transparency PS triple vent general lab",
  },
  {
    slug: "serological-pipettes", category: "Pipettes & Liquid Handling", categoryAnchor: "liquid-handling", subcategory: "Serological pipettes", visual: "pipette",
    name: "5 / 10 / 25 mL Serological Pipettes", cardDescription: "Three nominal volumes with construction and packaging confirmed for the selected configuration.",
    description: "A serological pipette product family in 5 mL, 10 mL, and 25 mL nominal volumes. Construction, graduation, packaging, and any sterility or certification requirements are supplier-specific.",
    highlights: [["Volumes", "5 / 10 / 25 mL"], ["Format", "Serological pipettes"], ["Selection", "Packaging and application"]],
    specs: [["Nominal volumes", "5 mL / 10 mL / 25 mL"], ["Material", "Confirmed for selected configuration"], ["Graduation and colour coding", "Confirmed for selected configuration"], ["Plug and tip configuration", "Confirmed for selected configuration"], ["Sterility and packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "5 10 25 mL serological pipette liquid handling transfer",
    ...pending,
  },
  {
    slug: "pipette-tips", category: "Pipettes & Liquid Handling", categoryAnchor: "liquid-handling", subcategory: "Pipette tips", visual: "tips",
    name: "RUNLAB Rainin LTS-Compatible Racked Pipette Tips", cardDescription: "Selected 10 µL and 200 µL standard and filtered racked configurations.",
    description: "Selected RUNLAB racked pipette tips are confirmed as Rainin LTS-compatible across 10 µL and 200 µL standard and filtered configurations. The exact Cat.No.-to-volume and filter mapping remains under supplier confirmation before ordering.",
    manufacturer: "RUNLAB", catNo: "52010, 53010, 52200, 53200", sku: "Assigned with quotation", status: "Confirmed references; configuration mapping pending", cardStatus: "Confirmed RUNLAB references", verified: true,
    highlights: [["Compatibility", "Rainin LTS-compatible"], ["Volumes", "10 µL and 200 µL"], ["Format", "Standard and filtered · racked"]],
    specs: [["Format", "Racked pipette tips"], ["Compatibility", "Rainin LTS-compatible"], ["Selected volumes", "10 µL and 200 µL"], ["Selected configurations", "Standard and filtered"], ["Confirmed Cat.Nos.", "52010, 53010, 52200, 53200"], ["Cat.No.-to-configuration mapping", "Under supplier confirmation"]],
    pack: "Racked format is confirmed. Units per rack and case remain under supplier confirmation.",
    documents: "A manufacturer datasheet is not published on this page. Request the applicable RUNLAB supplier document and exact configuration mapping with the quotation.",
    searchTerms: "RUNLAB Rainin LTS compatible pipette tips racked filtered standard 10 µL 200 µL 52010 53010 52200 53200 liquid handling",
  },
  {
    slug: "hdpe-bottles", category: "Environmental & Water", categoryAnchor: "environmental-water", subcategory: "Sample bottles", visual: "bottle",
    name: "HDPE Sample / Reagent Bottles", cardDescription: "Bottle configurations selected by capacity, closure, packaging, and application.",
    description: "HDPE sample and reagent bottles selected around required capacity, closure, colour, packaging, application, and documentation requirements.",
    highlights: [["Material", "HDPE"], ["Use", "Sample / reagent bottle"], ["Selection", "Capacity and closure"]],
    specs: [["Material", "HDPE"], ["Nominal capacities", "Confirmed for selected configuration"], ["Bottle colour", "Confirmed for selected configuration"], ["Closure type and liner", "Confirmed for selected configuration"], ["Packaging", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "HDPE sample reagent bottle container environmental water",
    ...pending,
  },
  {
    slug: "vortex-mixer", category: "Laboratory Equipment", categoryAnchor: "laboratory-equipment", subcategory: "Mixers & shakers", visual: "vortex",
    name: "Vortex Mixer", cardDescription: "Benchtop mixers sourced to vessel, operating, electrical, and accessory requirements.",
    description: "Benchtop vortex mixers sourced around tube or vessel format, operating mode, speed requirements, accessories, electrical compatibility, delivery, and support needs.",
    highlights: [["Type", "Vortex mixer"], ["Format", "Benchtop equipment"], ["Selection", "Application and power"]],
    specs: [["Equipment type", "Vortex mixer"], ["Operating mode", "Confirmed for selected configuration"], ["Speed range", "Confirmed for selected configuration"], ["Platform and accessories", "Confirmed for selected configuration"], ["Power requirements", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "vortex mixer mixing shaker benchtop laboratory equipment",
    ...pending,
  },
  {
    slug: "hotplate-magnetic-stirrer", category: "Laboratory Equipment", categoryAnchor: "laboratory-equipment", subcategory: "Heating & stirring", visual: "hotplate",
    name: "Hotplate Magnetic Stirrer", cardDescription: "Benchtop heating and stirring equipment sourced to vessel, control, and power needs.",
    description: "Benchtop hotplate magnetic stirrers sourced around vessel size, heating and stirring requirements, plate surface, control needs, electrical compatibility, delivery, and support.",
    highlights: [["Type", "Hotplate magnetic stirrer"], ["Format", "Benchtop equipment"], ["Selection", "Heating, stirring, and power"]],
    specs: [["Equipment type", "Hotplate magnetic stirrer"], ["Heating range and capacity", "Confirmed for selected configuration"], ["Stirring range and capacity", "Confirmed for selected configuration"], ["Plate material and dimensions", "Confirmed for selected configuration"], ["Power requirements", "Confirmed for selected configuration"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    searchTerms: "hotplate magnetic stirrer heating stirring benchtop laboratory equipment",
    ...pending,
  },
];

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const illustration = (type, label = "") => {
  const drawings = {
    vial: '<rect x="39" y="20" width="42" height="18" rx="3"/><path d="M44 38v60c0 10 32 10 32 0V38"/><path d="M48 50h24M50 82h20"/>',
    cap: '<path d="M32 52h56v34c0 12-56 12-56 0z"/><ellipse cx="60" cy="52" rx="28" ry="8"/><ellipse cx="60" cy="52" rx="14" ry="4"/><path d="M40 64h40M40 74h40"/>',
    filter: '<circle cx="59" cy="60" r="24"/><circle cx="59" cy="60" r="15"/><path d="M14 60h21M83 60h23M23 53v14M96 53v14"/>',
    spe: '<path d="M48 16h24l-3 58-9 20-9-20z"/><path d="M44 16h32M49 36h22M51 66h18M56 94v12"/>',
    tube: '<path d="M42 18h36M46 18v62l14 24 14-24V18"/><path d="M49 42h22M50 58h20M52 74h16"/>',
    microtube: '<path d="M36 28h48l-5 48-19 28-19-28z"/><path d="M32 28h56M45 54h30"/><path d="M70 20h30v8H70"/>',
    dish: '<ellipse cx="60" cy="44" rx="40" ry="12"/><path d="M20 44v30c0 16 80 16 80 0V44"/><ellipse cx="60" cy="74" rx="40" ry="12"/>',
    pipette: '<path d="M24 30l66 42M20 38l66 42M24 30l9-14 66 42-9 14M86 80l14 9"/><path d="M45 37l-8 13M58 45l-8 13"/>',
    tips: '<path d="M20 42h80v42H20zM28 34h64v8"/><path d="M34 42v27M48 42v27M62 42v27M76 42v27M90 42v27"/><path d="M31 69l3 16 3-16M45 69l3 16 3-16M59 69l3 16 3-16M73 69l3 16 3-16M87 69l3 16 3-16"/>',
    bottle: '<path d="M44 16h32v16l8 10v60H36V42l8-10z"/><path d="M44 24h32M36 54h48M46 72h28"/>',
    vortex: '<path d="M34 48h52l10 54H24z"/><ellipse cx="60" cy="45" rx="20" ry="8"/><circle cx="60" cy="78" r="6"/><path d="M48 25c7-8 17 8 24 0"/>',
    hotplate: '<path d="M25 52h70l7 50H18z"/><rect x="31" y="24" width="58" height="28" rx="2"/><circle cx="46" cy="78" r="6"/><circle cx="74" cy="78" r="6"/><path d="M40 38h40"/>',
    equipment: '<rect x="26" y="25" width="68" height="72" rx="3"/><path d="M26 55h68M40 40h40"/><circle cx="44" cy="76" r="7"/><circle cx="72" cy="76" r="7"/>',
  };
  return `<div class="technical-illustration technical-illustration-${type}" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><g>${drawings[type] || drawings.equipment}</g></svg>${label ? `<span>${escapeHtml(label)}</span>` : ""}</div>`;
};

const header = (depth = "", active = "products") => `<header class="site-header"><div class="container header-inner"><a href="${depth}index.html" class="brand"><svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.4"/><path d="M20 2v7M20 31v7M2 20h7M31 20h7" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="3" fill="#0f8a8a"/></svg><span class="brand-text"><span class="brand-name">Benchvale Scientific</span><span class="brand-sub">Laboratory Products &amp; Equipment</span></span></a><button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Toggle navigation menu"><span></span><span></span><span></span></button><nav class="primary-nav" id="primaryNav" aria-label="Primary"><ul><li><a href="${depth}products.html"${active === "products" ? ' aria-current="page"' : ""}>Products</a></li><li><a href="${depth}equipment.html">Equipment</a></li><li><a href="${depth}industries.html">Industries</a></li><li><a href="${depth}sourcing.html">Sourcing</a></li><li><a href="${depth}about.html">About</a></li><li><a href="${depth}contact.html">Contact</a></li><li class="nav-cta-mobile"><a href="${depth}quote.html" class="btn btn-primary btn-block">Request a Quote</a></li></ul></nav><div class="nav-actions"><a href="${depth}quote.html" class="btn btn-primary">Request a Quote</a></div></div></header>`;

const footer = (depth = "") => `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><span class="footer-brand-name">Benchvale Scientific</span><p>Laboratory Products &amp; Equipment</p><p>Ontario, Canada</p></div><div><span class="footer-heading">Contact</span><ul><li><a href="mailto:eric@benchvalescientific.com">eric@benchvalescientific.com</a></li><li><a href="mailto:quotes@benchvalescientific.com">quotes@benchvalescientific.com</a></li></ul></div><div><span class="footer-heading">Navigate</span><ul><li><a href="${depth}products.html">Products</a></li><li><a href="${depth}equipment.html">Equipment</a></li><li><a href="${depth}sourcing.html">Sourcing</a></li><li><a href="${depth}about.html">About</a></li><li><a href="${depth}contact.html">Contact</a></li><li><a href="${depth}shipping.html">Shipping</a></li><li><a href="${depth}returns.html">Returns &amp; RMA</a></li><li><a href="${depth}warranty.html">Warranty</a></li><li><a href="${depth}terms.html">Terms</a></li><li><a href="${depth}privacy.html">Privacy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; <span data-year></span> Benchvale Scientific. Ontario, Canada.</span><span><a href="${depth}terms.html">Terms</a> · <a href="${depth}privacy.html">Privacy</a></span></div></div></footer>`;

const categoryCard = (category) => `<article class="shop-category-card" id="${category.anchor}">${illustration(category.icon)}<div class="shop-category-card-copy"><h2>${escapeHtml(category.name)}</h2><p>${escapeHtml(category.description)}</p><ul>${category.subcategories.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><a href="#catalogue" class="category-filter-link" data-category-link="${category.anchor}">View products <span aria-hidden="true">→</span></a></div></article>`;

const productCard = (product) => {
  const meta = product.verified
    ? `<div class="product-card-meta"><span>Manufacturer <strong>${escapeHtml(product.manufacturer)}</strong></span><span>Cat.No. <strong>${escapeHtml(product.catNo)}</strong></span></div>`
    : `<div class="product-card-meta"><span>${escapeHtml(product.cardStatus)}</span><span>${escapeHtml(product.highlights[0][0])} <strong>${escapeHtml(product.highlights[0][1])}</strong></span></div>`;
  const search = `${product.name} ${product.category} ${product.subcategory} ${product.manufacturer} ${product.catNo} ${product.sku} ${product.searchTerms}`.toLowerCase();
  return `<article class="product-card retail-product-card" data-product-card data-category="${product.categoryAnchor}" data-search="${escapeHtml(search)}">${illustration(product.visual)}<div class="retail-product-card-body"><span class="product-card-category">${escapeHtml(product.category)} · ${escapeHtml(product.subcategory)}</span><h3><a href="products/${product.slug}.html">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(product.cardDescription)}</p>${meta}<div class="product-card-actions"><a href="products/${product.slug}.html">View details <span aria-hidden="true">→</span></a><a href="quote.html?product=${encodeURIComponent(product.name)}" class="quote-only-label">Request a Quote</a></div></div></article>`;
};

const productsIndexTemplate = () => `<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laboratory Products | Benchvale Scientific</title>
  <meta name="description" content="Browse laboratory consumables, sample-preparation products, liquid-handling supplies, and benchtop equipment from Benchvale Scientific in Canada." />
  <link rel="canonical" href="https://benchvalescientific.com/products.html" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Laboratory Products | Benchvale Scientific" />
  <meta property="og:description" content="Browse Benchvale laboratory products by category, application, manufacturer reference, or specification." />
  <meta property="og:url" content="https://benchvalescientific.com/products.html" />
  <meta name="theme-color" content="#0a1f33" />
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="products-page">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header()}
  <main id="main">
    <section class="page-hero products-hero"><div class="container products-hero-layout"><div><p class="eyebrow">Laboratory Products</p><h1>Products for analytical, environmental, and life-science laboratories</h1><p class="lede">Browse routine consumables and benchtop equipment, then request a quotation for the exact configuration, quantity, and delivery location your laboratory requires.</p><div class="hero-actions"><a href="#catalogue" class="btn btn-primary">Browse Products</a><a href="quote.html" class="btn btn-secondary">Request a Quote</a></div></div><div class="catalogue-hero-illustration" aria-hidden="true">${illustration("vial")}${illustration("filter")}${illustration("equipment")}</div></div></section>
    <section class="storefront-category-section" aria-labelledby="category-heading"><div class="container"><div class="section-header"><p class="eyebrow">Shop by Category</p><h2 id="category-heading">Find the right product family</h2><p>Start with a category, or use the catalogue search to narrow by product, manufacturer reference, or specification.</p></div><div class="shop-category-grid">${categories.map(categoryCard).join("\n")}</div></div></section>
    <section class="catalogue-section section-alt" id="catalogue" aria-labelledby="catalogue-heading"><div class="container"><div class="catalogue-heading-row"><div><p class="eyebrow">Product Catalogue</p><h2 id="catalogue-heading">Browse all products</h2></div><a href="quote.html" class="btn btn-secondary">Request Multiple Products</a></div><div class="catalogue-toolbar"><div class="catalogue-search"><label for="productSearch">Search products</label><div class="catalogue-search-control"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input type="search" id="productSearch" placeholder="Search product, category, manufacturer, Cat.No., SKU, or specification" autocomplete="off" /></div></div><div class="catalogue-filters" aria-label="Filter products by category"><button type="button" class="filter-button is-active" data-product-filter="all" aria-pressed="true">All</button>${categories.map((category) => `<button type="button" class="filter-button" data-product-filter="${category.anchor}" aria-pressed="false">${escapeHtml(category.name)}</button>`).join("")}</div><p class="catalogue-result-count" id="productSearchStatus" aria-live="polite">Showing ${products.length} products</p></div><div class="product-card-grid retail-product-grid" id="productGrid">${products.map(productCard).join("\n")}</div><div class="catalogue-empty" id="catalogueEmpty" hidden><h3>No matching products found</h3><p>Try a broader search or <a href="quote.html">send us the product requirements</a> for a sourced option.</p></div></div></section>
    <section class="catalogue-help"><div class="container catalogue-help-inner"><div><p class="eyebrow">Need a different configuration?</p><h2>Tell us the specifications that matter</h2><p>Benchvale can review a preferred manufacturer or Cat.No., required documentation, pack size, quantity, postal code, and required date.</p></div><a href="quote.html" class="btn btn-primary">Start an RFQ</a></div></section>
  </main>
  ${footer()}
  <script src="script.js"></script>
</body>
</html>`;

const productTemplate = (product) => {
  const specs = product.specs.map(([label, value]) => `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("\n");
  const highlights = product.highlights.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const quoteHref = `../quote.html?product=${encodeURIComponent(product.name)}`;
  const canonical = `https://benchvalescientific.com/products/${product.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(product.name)} | Benchvale Scientific</title>
  <meta name="description" content="${escapeHtml(product.description)} Request a quote from Benchvale Scientific." />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(product.name)} | Benchvale Scientific" />
  <meta property="og:description" content="Product information and quote request from Benchvale Scientific." />
  <meta property="og:url" content="${canonical}" />
  <meta name="theme-color" content="#0a1f33" />
  <link rel="icon" href="../images/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="../styles.css" />
</head>
<body class="product-detail-page">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header("../")}
  <main id="main">
    <div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="../products.html">Products</a><span aria-hidden="true">/</span><a href="../products.html#${product.categoryAnchor}">${escapeHtml(product.category)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(product.name)}</span></nav></div>
    <section class="product-detail-hero"><div class="container product-detail-layout"><div class="product-visual">${illustration(product.visual, product.subcategory)}<p class="visual-disclaimer">Technical product-class illustration</p></div><div class="product-detail-copy"><span class="product-status-line${product.verified ? " is-confirmed" : ""}">${escapeHtml(product.status)}</span><p class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.subcategory)}</p><h1>${escapeHtml(product.name)}</h1><p class="lede">${escapeHtml(product.description)}</p><dl class="pdp-key-specs">${highlights}</dl><dl class="product-identity-grid"><div class="product-identity-item"><dt>Manufacturer</dt><dd>${escapeHtml(product.manufacturer)}</dd></div><div class="product-identity-item"><dt>Manufacturer Cat.No.</dt><dd>${escapeHtml(product.catNo)}</dd></div><div class="product-identity-item"><dt>Benchvale SKU</dt><dd>${escapeHtml(product.sku)}</dd></div></dl><div class="product-price-status"><span>Price</span><strong>Request a Quote</strong></div><div class="product-purchase-actions"><a class="btn btn-primary" href="${quoteHref}">Request a Quote</a><button class="btn btn-secondary" type="button" data-add-to-quote data-product-name="${escapeHtml(product.name)}">Add to Quote</button></div><p class="purchase-note" data-quote-feedback aria-live="polite">Pricing and availability are confirmed by quotation. Online Add to Cart is not available; use Add to Quote to build a multi-product request.</p></div></div></section>
    <nav class="pdp-section-nav" aria-label="Product information sections"><div class="container"><a href="#description">Overview</a><a href="#specifications">Specifications</a><a href="#documents">Documents</a><a href="#ordering">Ordering &amp; Shipping</a><a href="#warranty">Warranty</a></div></nav>
    <section class="product-information-section"><div class="container product-information-layout"><div class="product-content-stack"><article class="product-info-block" id="description"><p class="product-section-label">Description</p><h2>Product overview</h2><p>${escapeHtml(product.description)}</p></article><article class="product-info-block" id="specifications"><p class="product-section-label">Specifications</p><h2>Technical information</h2><div class="table-scroll"><table class="product-spec-table"><tbody>${specs}</tbody></table></div></article><article class="product-info-block"><p class="product-section-label">Pack size</p><h2>Ordering unit</h2><p>${escapeHtml(product.pack)}</p></article><article class="product-info-block" id="documents"><p class="product-section-label">Documents / Datasheet</p><h2>Manufacturer documentation</h2><div class="document-status"><div><strong>Available on request</strong><p>${escapeHtml(product.documents)}</p><a href="${quoteHref}&request=documentation">Request documentation <span aria-hidden="true">→</span></a></div></div></article></div><aside class="product-service-stack" id="ordering" aria-label="Ordering and support information"><article class="product-service-card"><span class="product-service-kicker">Availability</span><h2>Confirmed with quotation</h2><p>Stock, lead time, minimum order quantity, and suitable alternatives are confirmed for the selected configuration.</p><a href="${quoteHref}">Check availability <span aria-hidden="true">→</span></a></article><article class="product-service-card"><span class="product-service-kicker">Shipping</span><h2>Quoted to destination</h2><p>Method and cost depend on quantity, destination postal code, product handling needs, and supplier conditions.</p><a href="../shipping.html">Shipping information <span aria-hidden="true">→</span></a></article><article class="product-service-card" id="warranty"><span class="product-service-kicker">Warranty</span><h2>Terms confirmed before order</h2><p>Applicable manufacturer or supplier terms are stated in the quotation. Troubleshooting, failure-cause assessment, and RMA review precede a repair or replacement decision.</p><a href="../warranty.html">Warranty framework <span aria-hidden="true">→</span></a></article></aside></div></section>
    <section class="cta-band"><div class="container cta-band-inner"><div><h2>Request this product</h2><p>Include quantity, postal code, required date, and any required specifications or documentation.</p></div><div class="cta-band-actions"><a href="${quoteHref}" class="btn btn-on-dark">Request a Quote</a><a href="mailto:quotes@benchvalescientific.com?subject=${encodeURIComponent(`Request for Quote — ${product.name}`)}" class="btn btn-outline-on-dark">Email RFQ</a></div></div></section>
  </main>
  ${footer("../")}
  <script src="../script.js"></script>
</body>
</html>`;
};

mkdirSync(productDirectory, { recursive: true });
for (const product of products) writeFileSync(resolve(productDirectory, `${product.slug}.html`), productTemplate(product), "utf8");
writeFileSync(resolve(repositoryRoot, "products.html"), productsIndexTemplate(), "utf8");
console.log(`Generated products.html and ${products.length} product pages from one product definition list.`);
