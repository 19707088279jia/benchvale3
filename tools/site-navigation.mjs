const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

export const navigationItems = [
  { label: "HPLC Columns", href: "products.html" },
  { label: "Services", href: "services.html" },
  { label: "About", href: "about.html" },
  { label: "Contact", href: "contact.html" },
  { label: "Terms of Sale", href: "terms-of-sale.html" },
];

export function header(depth = "") {
  return `<header class="site-header category-header">
  <div class="container category-header-top">
    <a href="${depth}index.html" class="brand"><svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.4"/><path d="M20 2v7M20 31v7M2 20h7M31 20h7" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="3" fill="#0f8a8a"/></svg><span class="brand-text"><span class="brand-name">ChromVale Scientific</span><span class="brand-sub">HPLC Columns for Canadian Laboratories</span></span></a>
    <form class="category-search" role="search" action="${depth}products.html" method="get"><label class="nav-sr-only" for="homeSearch">Search HPLC columns</label><input id="homeSearch" name="search" type="search" placeholder="Search HPLC columns..."/><button type="submit" aria-label="Search HPLC columns"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button></form>
    <div class="header-quote-actions"><a class="header-quote-cart" href="${depth}quote.html">Quote Cart <span data-quote-count aria-live="polite" aria-atomic="true">(0)</span></a><a href="${depth}quote.html" class="btn btn-primary header-quote">Request a Quote</a></div>
    <button class="category-nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primaryNav">Menu <span aria-hidden="true">☰</span></button>
  </div>
  <nav class="category-nav" id="primaryNav" aria-label="Primary"><ul class="category-nav-list">
  ${navigationItems.map(({ label, href }) => `<li class="category-nav-item"><div class="category-nav-label"><a href="${depth}${href}">${escapeHtml(label)}</a></div></li>`).join("\n  ")}
  </ul></nav></header>`;
}
