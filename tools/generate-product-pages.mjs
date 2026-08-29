import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productDirectory = resolve(repositoryRoot, "products");

const pending = {
  manufacturer: "Under supplier confirmation",
  catNo: "Manufacturer model pending",
  sku: "Under supplier confirmation",
  status: "Manufacturer model pending",
  pack: "Under supplier confirmation. State the required unit, pack, or case quantity in the RFQ.",
  documents: "Under supplier confirmation. Request a verified supplier datasheet or applicable product document with the quotation.",
};

const products = [
  {
    slug: "2ml-autosampler-vial", mark: "2 mL", category: "Chromatography", categoryAnchor: "chromatography",
    name: "2 mL HPLC/GC Autosampler Vial",
    description: "A quote-ready sourcing record for 2 mL autosampler vials used in HPLC and GC sample-introduction workflows. The exact vial construction and instrument/closure compatibility are confirmed against the laboratory's requirements before quotation.",
    specs: [["Nominal capacity", "2 mL"], ["Intended workflow", "HPLC / GC autosampler"], ["Vial material and colour", "Under supplier confirmation"], ["Profile and dimensions", "Under supplier confirmation"], ["Closure compatibility", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "9mm-cap-septa", mark: "9 mm", category: "Chromatography", categoryAnchor: "chromatography",
    name: "9 mm Cap / Septa",
    description: "A sourcing record for 9 mm autosampler vial closures. Cap style, septum construction, vial compatibility, and application requirements are confirmed before a manufacturer model is selected.",
    specs: [["Nominal closure size", "9 mm"], ["Cap style and material", "Under supplier confirmation"], ["Septum material and thickness", "Under supplier confirmation"], ["Pre-slit configuration", "Under supplier confirmation"], ["Vial / instrument compatibility", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "syringe-filters", mark: "SF", category: "Sample Preparation", categoryAnchor: "sample-preparation",
    name: "Syringe Filters",
    description: "Syringe filter sourcing based on the sample, solvent system, target analytes, filtration objective, and downstream method. The selected membrane, pore size, diameter, and housing remain supplier- and application-specific.",
    specs: [["Product format", "Syringe filter"], ["Membrane", "Under supplier confirmation"], ["Pore size", "Under supplier confirmation"], ["Filter diameter", "Under supplier confirmation"], ["Housing and connection", "Under supplier confirmation"], ["Sterility / certifications", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "spe-cartridges", mark: "SPE", category: "Sample Preparation", categoryAnchor: "sample-preparation",
    name: "SPE Cartridges",
    description: "Solid-phase extraction cartridge sourcing based on the laboratory's method, target analytes, matrix, sorbent chemistry, sample volume, and processing requirements.",
    specs: [["Product format", "SPE cartridge"], ["Sorbent chemistry", "Under supplier confirmation"], ["Bed mass", "Under supplier confirmation"], ["Reservoir volume", "Under supplier confirmation"], ["Method compatibility", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "15ml-centrifuge-tube", mark: "15", category: "Life Science", categoryAnchor: "life-science",
    name: "15 mL Centrifuge Tube",
    description: "A 15 mL centrifuge tube sourcing record. Material, cap, graduation, rated performance, packaging, and any sterility or certification requirements are matched to a verified supplier configuration.",
    specs: [["Nominal volume", "15 mL"], ["Tube and cap material", "Under supplier confirmation"], ["Graduation and writing area", "Under supplier confirmation"], ["Maximum RCF", "Under supplier confirmation"], ["Sterility and packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "50ml-centrifuge-tube", mark: "50", category: "Life Science", categoryAnchor: "life-science",
    name: "50 mL Centrifuge Tube",
    description: "A 50 mL centrifuge tube sourcing record. The exact tube construction, closure, rated performance, packaging, and any sterility or certification requirements remain supplier-specific.",
    specs: [["Nominal volume", "50 mL"], ["Tube and cap material", "Under supplier confirmation"], ["Graduation and writing area", "Under supplier confirmation"], ["Maximum RCF", "Under supplier confirmation"], ["Sterility and packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "1-5ml-microtube", mark: "1.5", category: "Life Science", categoryAnchor: "life-science",
    name: "1.5 mL Microtube",
    description: "A general 1.5 mL microtube sourcing record. Tube material, closure design, rated performance, packaging, and treatment or sterility requirements are confirmed during supplier selection.",
    specs: [["Nominal volume", "1.5 mL"], ["Tube and closure material", "Under supplier confirmation"], ["Closure design", "Under supplier confirmation"], ["Maximum RCF", "Under supplier confirmation"], ["Treatment, sterility and packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "2ml-microtube", mark: "2.0", category: "Life Science", categoryAnchor: "life-science",
    name: "2.0 mL Microtube",
    description: "A general 2.0 mL microtube sourcing record. Tube material, closure design, rated performance, packaging, and treatment or sterility requirements are confirmed during supplier selection.",
    specs: [["Nominal volume", "2.0 mL"], ["Tube and closure material", "Under supplier confirmation"], ["Closure design", "Under supplier confirmation"], ["Maximum RCF", "Under supplier confirmation"], ["Treatment, sterility and packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "90mm-petri-dish", mark: "90", category: "General Lab", categoryAnchor: "general-lab",
    name: "RUNLAB 90 × 15 mm Sterile Petri Dish",
    description: "RUNLAB Cat.No. 55301 is a 90 × 15 mm sterile Petri dish made from high-transparency PS. The confirmed configuration is EO sterile, triple vent, packed 10 dishes per pack and 500 dishes per case.",
    manufacturer: "RUNLAB", catNo: "55301", sku: "Under supplier confirmation", status: "Verified supplier product information",
    specs: [["Dimensions", "90 × 15 mm"], ["Material", "High-transparency PS"], ["Sterility", "EO sterile"], ["Vent configuration", "Triple vent"], ["Manufacturer Cat.No.", "55301"]],
    pack: "10/pack; 500/case.",
    documents: "A datasheet is not currently published on this page. Request a verified RUNLAB supplier document with the quotation.",
  },
  {
    slug: "serological-pipettes", mark: "5–25", category: "Pipettes & Liquid Handling", categoryAnchor: "liquid-handling",
    name: "5 / 10 / 25 mL Serological Pipettes",
    description: "A sourcing record for serological pipettes in 5 mL, 10 mL, and 25 mL nominal volumes. Construction, graduation, packaging, and any sterility or certification requirements are supplier-specific.",
    specs: [["Nominal volumes", "5 mL / 10 mL / 25 mL"], ["Material", "Under supplier confirmation"], ["Graduation and colour coding", "Under supplier confirmation"], ["Plug and tip configuration", "Under supplier confirmation"], ["Sterility and packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "pipette-tips", mark: "LTS", category: "Pipettes & Liquid Handling", categoryAnchor: "liquid-handling",
    name: "RUNLAB Rainin LTS-Compatible Racked Pipette Tips",
    description: "Selected RUNLAB racked pipette tips are confirmed as Rainin LTS-compatible across 10 µL and 200 µL standard and filtered configurations. The exact Cat.No.-to-volume/filter mapping must be confirmed by the supplier before ordering.",
    manufacturer: "RUNLAB", catNo: "52010, 53010, 52200, 53200", sku: "Under supplier confirmation", status: "Verified supplier references; configuration mapping pending",
    specs: [["Format", "Racked pipette tips"], ["Compatibility", "Rainin LTS-compatible"], ["Selected volumes", "10 µL and 200 µL"], ["Selected configurations", "Standard and filtered"], ["Confirmed Cat.Nos.", "52010, 53010, 52200, 53200"], ["Cat.No.-to-configuration mapping", "Under supplier confirmation"]],
    pack: "Under supplier confirmation. Racked format is confirmed; units per rack and case are not published pending supplier confirmation.",
    documents: "A datasheet is not currently published on this page. Request a verified RUNLAB supplier document and exact configuration mapping with the quotation.",
  },
  {
    slug: "hdpe-bottles", mark: "HDPE", category: "Environmental & Water", categoryAnchor: "environmental-water",
    name: "HDPE Sample / Reagent Bottles",
    description: "HDPE sample and reagent bottle sourcing based on required capacity, closure, colour, packaging, application, and any documentation requirements.",
    specs: [["Material", "HDPE"], ["Nominal capacities", "Under supplier confirmation"], ["Bottle colour", "Under supplier confirmation"], ["Closure type and liner", "Under supplier confirmation"], ["Packaging", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "vortex-mixer", mark: "VM", category: "Laboratory Equipment", categoryAnchor: "laboratory-equipment",
    name: "Vortex Mixer",
    description: "Benchtop vortex mixer sourcing based on tube or vessel format, operating mode, speed requirements, accessories, electrical compatibility, delivery, and support needs.",
    specs: [["Equipment type", "Vortex mixer"], ["Operating mode", "Under supplier confirmation"], ["Speed range", "Under supplier confirmation"], ["Platform and accessories", "Under supplier confirmation"], ["Power requirements", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
  {
    slug: "hotplate-magnetic-stirrer", mark: "HMS", category: "Laboratory Equipment", categoryAnchor: "laboratory-equipment",
    name: "Hotplate Magnetic Stirrer",
    description: "Benchtop hotplate magnetic stirrer sourcing based on vessel size, heating and stirring requirements, plate surface, control needs, electrical compatibility, delivery, and support.",
    specs: [["Equipment type", "Hotplate magnetic stirrer"], ["Heating range and capacity", "Under supplier confirmation"], ["Stirring range and capacity", "Under supplier confirmation"], ["Plate material and dimensions", "Under supplier confirmation"], ["Power requirements", "Under supplier confirmation"], ["Certifications or claims", "No claim published; supplier documentation required"]],
    ...pending,
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const productTemplate = (product) => {
  const specs = product.specs.map(([label, value]) => `<tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("\n                ");
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
  <meta property="og:description" content="Quote-only laboratory product record. Verified and supplier-pending details are clearly identified." />
  <meta property="og:url" content="${canonical}" />
  <meta name="theme-color" content="#0a1f33" />
  <link rel="icon" href="../images/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="../styles.css" />
</head>
<body class="product-detail-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a href="../index.html" class="brand">
        <svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.4"/><path d="M20 2v7M20 31v7M2 20h7M31 20h7" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="3" fill="#0f8a8a"/></svg>
        <span class="brand-text"><span class="brand-name">Benchvale Scientific</span><span class="brand-sub">Laboratory Equipment Sourcing</span></span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="primaryNav" aria-label="Toggle navigation menu"><span></span><span></span><span></span></button>
      <nav class="primary-nav" id="primaryNav" aria-label="Primary"><ul><li><a href="../products.html" aria-current="page">Products</a></li><li><a href="../equipment.html">Equipment</a></li><li><a href="../industries.html">Industries</a></li><li><a href="../sourcing.html">How It Works</a></li><li><a href="../about.html">About</a></li><li><a href="../contact.html">Contact</a></li><li class="nav-cta-mobile"><a href="${quoteHref}" class="btn btn-primary btn-block">Request a Quote</a></li></ul></nav>
      <div class="nav-actions"><a href="${quoteHref}" class="btn btn-primary">Request a Quote</a></div>
    </div>
  </header>

  <main id="main">
    <div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="../products.html">Products</a><span aria-hidden="true">/</span><a href="../products.html#${product.categoryAnchor}">${escapeHtml(product.category)}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(product.name)}</span></nav></div>
    <section class="product-detail-hero">
      <div class="container product-detail-layout">
        <div class="product-visual" aria-hidden="true"><span class="product-visual-code">${escapeHtml(product.category)}</span><span class="product-visual-mark">${escapeHtml(product.mark)}</span><span class="product-visual-foot">Benchvale product record</span></div>
        <div class="product-detail-copy">
          <span class="product-status-line">${escapeHtml(product.status)}</span>
          <p class="eyebrow">${escapeHtml(product.category)}</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p class="lede">${escapeHtml(product.description)}</p>
          <dl class="product-identity-grid">
            <div class="product-identity-item"><dt>Manufacturer</dt><dd>${escapeHtml(product.manufacturer)}</dd></div>
            <div class="product-identity-item"><dt>Manufacturer Cat.No.</dt><dd>${escapeHtml(product.catNo)}</dd></div>
            <div class="product-identity-item"><dt>Benchvale SKU</dt><dd>${escapeHtml(product.sku)}</dd></div>
          </dl>
          <div class="product-price-status"><span>Public price</span><strong>Request a Quote</strong></div>
          <div class="product-purchase-actions"><a class="btn btn-primary" href="${quoteHref}">Request a Quote</a><button class="btn btn-disabled" type="button" disabled aria-describedby="cart-note">Add to Cart — coming later</button></div>
          <p class="purchase-note" id="cart-note">Online checkout is not enabled. No selling price is published on this page.</p>
        </div>
      </div>
    </section>

    <section class="product-information-section">
      <div class="container product-information-layout">
        <div class="product-content-stack">
          <article class="product-info-block"><h2>Description</h2><p>${escapeHtml(product.description)}</p></article>
          <article class="product-info-block"><h2>Specifications</h2><table class="product-spec-table"><tbody>${specs}</tbody></table></article>
          <article class="product-info-block"><h2>Pack size</h2><p>${escapeHtml(product.pack)}</p></article>
          <article class="product-info-block"><h2>Documents / Datasheet</h2><div class="document-status"><div><strong>${product.documents.startsWith("Under supplier confirmation") ? "Under supplier confirmation" : "Document available by request"}</strong><p>${escapeHtml(product.documents)}</p></div></div></article>
        </div>
        <aside class="product-service-stack" aria-label="Ordering and support information">
          <article class="product-service-card"><span class="product-service-kicker">Availability</span><h2>Under supplier confirmation</h2><p>Stock, lead time, minimum order quantity, and substitution options are confirmed during quotation.</p><a href="${quoteHref}">Check availability →</a></article>
          <article class="product-service-card"><span class="product-service-kicker">Shipping</span><h2>Quoted to destination</h2><p>Shipping method and cost are reviewed after quantity, destination postal code, product dimensions or weight, and supplier conditions are confirmed.</p><a href="../shipping.html">Shipping information →</a></article>
          <article class="product-service-card"><span class="product-service-kicker">Warranty</span><h2>No period published</h2><p>Any applicable manufacturer or supplier warranty is confirmed in the quotation. Potential defect coverage requires troubleshooting, failure-cause assessment, and RMA review; exclusions normally include accident, misuse, abuse, negligence, improper installation or operation, incompatible power, and unauthorized modification or disassembly.</p><a href="../warranty.html">Warranty framework →</a></article>
        </aside>
      </div>
    </section>
    <section class="cta-band"><div class="container cta-band-inner"><div><h2>Request this product</h2><p>Include quantity, postal code, required date, and any required specifications or documentation.</p></div><div class="cta-band-actions"><a href="${quoteHref}" class="btn btn-on-dark">Request a Quote</a><a href="mailto:quotes@benchvalescientific.com?subject=${encodeURIComponent(`Request for Quote — ${product.name}`)}" class="btn btn-outline-on-dark">Email RFQ</a></div></div></section>
  </main>

  <footer class="site-footer"><div class="container"><div class="footer-grid"><div><span class="footer-brand-name">Benchvale Scientific</span><p>Laboratory Products &amp; Equipment Sourcing</p><p>Ontario, Canada</p></div><div><span class="footer-heading">Contact</span><ul><li><a href="mailto:eric@benchvalescientific.com">eric@benchvalescientific.com</a></li><li><a href="mailto:quotes@benchvalescientific.com">quotes@benchvalescientific.com</a></li></ul></div><div><span class="footer-heading">Navigate</span><ul><li><a href="../products.html">Products</a></li><li><a href="../equipment.html">Equipment</a></li><li><a href="../about.html">About</a></li><li><a href="../contact.html">Contact</a></li><li><a href="${quoteHref}">Request a Quote</a></li><li><a href="../shipping.html">Shipping</a></li><li><a href="../returns.html">Returns &amp; RMA</a></li><li><a href="../warranty.html">Warranty</a></li><li><a href="../terms.html">Terms</a></li><li><a href="../privacy.html">Privacy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; <span data-year></span> Benchvale Scientific. Ontario, Canada.</span><span><a href="../terms.html">Terms</a> · <a href="../privacy.html">Privacy</a></span></div></div></footer>
  <script src="../script.js"></script>
</body>
</html>`;
};

mkdirSync(productDirectory, { recursive: true });
for (const product of products) {
  writeFileSync(resolve(productDirectory, `${product.slug}.html`), productTemplate(product), "utf8");
}

console.log(`Generated ${products.length} product pages in ${productDirectory}`);
