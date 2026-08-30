import { header } from "./site-navigation.mjs";
import { applyServiceLayout } from "./service-layout.mjs";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pages = [
  {
    slug: "shipping",
    eyebrow: "Shipping",
    title: "Shipping is confirmed with each quotation",
    description: "How Benchvale Scientific confirms availability, destination, freight requirements, and delivery details for laboratory products and equipment.",
    intro: "Shipping arrangements depend on the exact product, quantity, supplier location, destination postal code, dimensions or weight, and any special handling requirements. Applicable details are reviewed before an order is approved.",
    sections: [
      ["Quote-stage review", ["Benchvale confirms supplier availability and the order configuration before presenting shipping information.", "The quotation identifies the shipping assumptions available at that stage. Changes to quantity, destination, access, or timing may require a revised quote."]],
      ["What affects shipping", ["Product quantity and pack or case configuration", "Destination postal code and delivery location", "Product dimensions, weight, fragility, temperature sensitivity, or regulated handling where applicable", "Supplier origin, lead time, and available carrier service", "Equipment unloading, lift-gate, inside-delivery, installation, or electrical considerations where applicable"]],
      ["Availability and timing", ["Catalogue presence does not mean an item is in stock. Availability and lead time remain under supplier confirmation until quoted.", "Requested dates help us evaluate options but are not delivery guarantees. A delivery estimate is confirmed only with the applicable quotation or order communication."]],
      ["Receiving an order", ["Inspect the shipment promptly and keep the packaging and shipping documents if damage, shortage, or an incorrect item is suspected.", "Contact eric@benchvalescientific.com with the order reference, affected item, quantity, photos where useful, and a description of the issue. Do not return material before receiving RMA or return instructions."]],
    ],
  },
  {
    slug: "returns",
    eyebrow: "Returns & RMA",
    title: "Contact us before returning any product",
    description: "Benchvale Scientific return and RMA framework for laboratory products and equipment.",
    intro: "Return eligibility is product-, supplier-, condition-, and issue-specific. An assessment and written RMA or return instruction is required before anything is shipped back.",
    sections: [
      ["Start with an assessment", ["Email eric@benchvalescientific.com with the order reference, product, quantity, reason for the request, and relevant photos or technical observations.", "For suspected equipment failure, Benchvale may first request troubleshooting information so the probable cause and appropriate support route can be assessed."]],
      ["Return eligibility", ["Eligibility depends on the confirmed order terms, supplier requirements, product condition, packaging, elapsed time, and reason for return.", "Opened, used, damaged, specially ordered, custom-configured, temperature-sensitive, regulated, or otherwise restricted products may have limited or no return eligibility. The applicable status is assessed rather than assumed.", "No return period, restocking amount, or refund outcome is published as a universal promise; those details must be confirmed for the specific case."]],
      ["RMA process", ["1. Submit the issue and order details.", "2. Allow Benchvale to troubleshoot or assess the failure cause where applicable.", "3. Receive written RMA or return instructions before shipping.", "4. Package and ship only as instructed, using the provided reference.", "5. Benchvale or the applicable supplier assesses the returned item before a repair, replacement, credit, or other resolution is decided."]],
      ["Shipping damage or order discrepancy", ["Preserve the shipping carton, labels, and internal packaging.", "Report the affected item, visible damage, shortage, or discrepancy as soon as practical with supporting photos where available.", "Benchvale will review the carrier, supplier, and order information and advise the next step."]],
    ],
  },
  {
    slug: "warranty",
    eyebrow: "Warranty",
    title: "Assessment first, resolution after the cause is understood",
    description: "Benchvale Scientific warranty framework, including potentially covered defects, normal exclusions, troubleshooting, assessment, and RMA.",
    intro: "Warranty terms vary by manufacturer, supplier, and product. Benchvale does not publish or imply a universal warranty period; the applicable term must be confirmed in the quotation, order documentation, or verified manufacturer material.",
    sections: [
      ["Potentially covered", ["A failure caused by a normal manufacturing, material, or workmanship defect may be potentially covered under the applicable manufacturer or supplier warranty.", "Coverage is not decided from the symptom alone. The product, order, operating conditions, and probable failure cause must be assessed."]],
      ["Normally excluded", ["Accident or shipping damage outside an applicable carrier claim", "Misuse, abuse, or negligence", "Improper installation, operation, maintenance, or storage", "Incompatible or incorrect power supply", "Unauthorized modification, repair, disassembly, or alteration", "Normal wear, consumable use, or conditions excluded by the applicable manufacturer or supplier terms"]],
      ["Troubleshooting and RMA", ["Contact eric@benchvalescientific.com with the order reference, product identification, symptoms, operating conditions, and any relevant photos or readings.", "Benchvale may request basic troubleshooting, documentation, or isolation steps and will assess the likely cause or coordinate supplier support where applicable.", "Do not disassemble or return the product unless instructed. Written RMA or return instructions are required before shipment."]],
      ["Repair or replacement decision", ["Repair, replacement, credit, or another resolution is considered only after troubleshooting, failure-cause assessment, and the applicable RMA review.", "A specific outcome cannot be promised before the assessment is complete and the relevant manufacturer or supplier terms are confirmed."]],
      ["Warranty period", ["No universal warranty period is published on this website.", "For a product under consideration, request the verified warranty term with the quotation. For an existing order, refer to the quotation, order documentation, and any verified manufacturer warranty supplied with the product."]],
    ],
  },
  {
    slug: "terms",
    eyebrow: "Terms",
    title: "Website, quotation, and ordering terms",
    description: "Terms for using the Benchvale Scientific website and requesting quotations for laboratory products and equipment.",
    intro: "This website is a static product-information and inquiry channel. It does not provide server-side ordering or payment processing, and submitting an RFQ does not create an order.",
    sections: [
      ["Product information", ["Benchvale publishes verified manufacturer details where they are available and clearly marks supplier-dependent information as “Manufacturer model pending” or “Under supplier confirmation.”", "Product images, descriptions, and category records support inquiry and comparison. The applicable manufacturer model, Cat.No., specifications, pack size, documents, availability, shipping, warranty, and commercial terms must be confirmed in the quotation before purchase.", "No certification, sterility claim, document, model number, Cat.No., warranty period, or price should be inferred when it is not expressly stated."]],
      ["Pricing", ["Public selling prices are not currently published. Product pages display “Request a Quote.”", "Benchvale reviews supplier cost, logistics, and comparable Canadian market information before presenting a selling price. Quotes may include stated assumptions, validity, taxes, shipping, and other product-specific terms."]],
      ["RFQs and orders", ["The RFQ form prepares an email on the user's device and does not submit information to a Benchvale web server.", "An RFQ is a request for information and pricing, not an acceptance, purchase order, or reservation of stock.", "No product is ordered until the laboratory has reviewed the applicable specifications and commercial terms and Benchvale has received written approval or an accepted order through the agreed process."]],
      ["Availability and substitutions", ["Catalogue presence does not indicate stock. Availability, lead time, minimum order quantity, and supplier status are confirmed at quote stage.", "Benchvale will not knowingly substitute a materially different product without presenting the relevant information for review."]],
      ["Shipping, returns, and warranty", ["Shipping is confirmed against destination and order requirements. See the Shipping page.", "Returns require assessment and written RMA or return instructions. See Returns & RMA.", "Warranty coverage and duration are product-specific. See the Warranty framework."]],
      ["Website use and changes", ["Users should provide accurate contact and requirement information and should not attempt to interfere with the website's operation.", "Benchvale may update catalogue records, policies, and website content as supplier information and business processes develop. The version applicable to an accepted order is established by the related quotation and order documentation."]],
    ],
  },
];

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const renderBody = (section) => {
  const [heading, points] = section;
  const allParagraphs = points.every((point) => !/^\d\./.test(point)) && points.length <= 2;
  const content = allParagraphs
    ? points.map((point) => `<p>${escapeHtml(point)}</p>`).join("")
    : `<ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`;
  return `<section class="content-section"><h2>${escapeHtml(heading)}</h2>${content}</section>`;
};

const pageTemplate = (page) => `<!DOCTYPE html>
<html lang="en-CA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.eyebrow)} | Benchvale Scientific</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <link rel="canonical" href="https://benchvalescientific.com/${page.slug}.html" />
  <meta property="og:type" content="website" /><meta property="og:title" content="${escapeHtml(page.eyebrow)} | Benchvale Scientific" /><meta property="og:description" content="${escapeHtml(page.description)}" /><meta property="og:url" content="https://benchvalescientific.com/${page.slug}.html" />
  <meta name="theme-color" content="#0a1f33" /><link rel="icon" href="images/favicon.svg" type="image/svg+xml" /><link rel="stylesheet" href="styles.css" /><link rel="stylesheet" href="navigation.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header()}
  <main id="main">
    <section class="page-hero content-page-hero"><div class="container"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p class="lede max-prose">${escapeHtml(page.intro)}</p><p class="privacy-updated">Last updated: August 2026</p></div></section>
    <section><div class="container content-layout"><nav class="content-nav" aria-label="Customer care"><strong>Customer Care</strong><ul><li><a href="shipping.html"${page.slug === "shipping" ? ' aria-current="page"' : ""}>Shipping</a></li><li><a href="returns.html"${page.slug === "returns" ? ' aria-current="page"' : ""}>Returns &amp; RMA</a></li><li><a href="warranty.html"${page.slug === "warranty" ? ' aria-current="page"' : ""}>Warranty</a></li><li><a href="terms.html"${page.slug === "terms" ? ' aria-current="page"' : ""}>Terms</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="contact.html">Contact</a></li></ul></nav><article class="content-panel"><div class="content-section"><div class="policy-callout"><p>Questions about this page can be directed to <a href="mailto:eric@benchvalescientific.com">eric@benchvalescientific.com</a>. Product and pricing requests should use <a href="quote.html">Request a Quote</a>.</p></div></div>${page.sections.map(renderBody).join("")}</article></div></section>
    <section class="cta-band"><div class="container cta-band-inner"><div><h2>Need product-specific confirmation?</h2><p>Ask for the applicable product, shipping, return, documentation, or warranty terms with your quotation.</p></div><div class="cta-band-actions"><a href="quote.html" class="btn btn-on-dark">Request a Quote</a><a href="mailto:eric@benchvalescientific.com" class="btn btn-outline-on-dark">General Contact</a></div></div></section>
  </main>
  <footer class="site-footer"><div class="container"><div class="footer-grid"><div><span class="footer-brand-name">Benchvale Scientific</span><p>Laboratory Products &amp; Equipment</p><p>Ontario, Canada</p></div><div><span class="footer-heading">Contact</span><ul><li><a href="mailto:eric@benchvalescientific.com">eric@benchvalescientific.com</a></li><li><a href="mailto:quotes@benchvalescientific.com">quotes@benchvalescientific.com</a></li></ul></div><div><span class="footer-heading">Navigate</span><ul><li><a href="products.html">Products</a></li><li><a href="equipment.html">Equipment</a></li><li><a href="sourcing.html">Sourcing</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="quote.html">Request a Quote</a></li><li><a href="shipping.html">Shipping</a></li><li><a href="returns.html">Returns &amp; RMA</a></li><li><a href="warranty.html">Warranty</a></li><li><a href="terms.html">Terms</a></li><li><a href="privacy.html">Privacy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; <span data-year></span> Benchvale Scientific. Ontario, Canada.</span><span><a href="terms.html">Terms</a> · <a href="privacy.html">Privacy</a></span></div></div></footer>
  <script src="script.js"></script>
</body>
</html>`;

for (const page of pages) {
  writeFileSync(resolve(repositoryRoot, `${page.slug}.html`), applyServiceLayout(pageTemplate(page), `${page.slug}.html`), "utf8");
}

console.log(`Generated ${pages.length} customer-care pages.`);
