import { familyUrl } from './taxonomy.mjs';
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

// Inert templates are generated from the same taxonomy as the navigation.
// Only the requested category is mounted; general catalogue sections are removed.
export const categoryTemplates = (categories, illustration) => categories.map(category => `<template id="category-page-${category.anchor}" data-category-title="${esc(category.name)}" data-category-description="${esc(category.description)}">
  <div class="category-page-container">
    <nav class="category-breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(category.name)}</span></nav>
    <div class="category-landing-layout">
      <aside class="category-support" aria-label="Quote and product support">
        <h2>Need a quote for ${esc(category.name.toLowerCase())} products?</h2>
        <ul><li><a href="quote.html">Request a Quote</a></li><li><a href="services.html#product-sourcing-support">Product Sourcing Support</a></li><li><a href="services.html#documentation-support">Documentation Support</a></li><li><a href="contact.html">Contact Benchvale</a></li></ul>
        <a href="quote.html" class="btn btn-primary">Request a Quote</a>
      </aside>
      <div class="category-content">
      <section class="category-intro" aria-labelledby="title-${category.anchor}">
        <div><h1 id="title-${category.anchor}">${esc(category.name)}</h1><p>${esc(category.description)}</p></div>
        <div class="category-technical-visual">${illustration(category.icon)}</div>
      </section>
      <section class="category-families" aria-labelledby="families-${category.anchor}">
        <h2 id="families-${category.anchor}">Product Families</h2>
        ${category.families.length ? `<div class="category-family-grid">${category.families.map(family => `<a class="category-family-card" href="${esc(familyUrl(category, family))}">
          ${illustration(family.icon || category.icon)}<h3>${esc(family.name)}</h3>${family.description ? `<p>${esc(family.description)}</p>` : ''}<span class="family-link-label">View Products <span aria-hidden="true">→</span></span>
        </a>`).join('\n')}</div>` : '<p class="category-family-empty">Product families will be added as catalogue information becomes available.</p>'}
      </section>
      </div>
    </div>
  </div>
</template>`).join('\n');
