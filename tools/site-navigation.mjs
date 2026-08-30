import { categories, categoryUrl, familyUrl, directoryItem, directoryUrl } from './taxonomy.mjs';
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
// Split in source order; earlier columns receive the remainder (4 -> 2/1/1).
export function splitGroups(groups, columnCount) {
  const size = Math.floor(groups.length / columnCount);
  const remainder = groups.length % columnCount;
  let offset = 0;
  return Array.from({ length: columnCount }, (_, index) => {
    const count = size + (index < remainder ? 1 : 0);
    const column = groups.slice(offset, offset + count);
    offset += count;
    return column;
  });
}
const groupMarkup = (category, group, link) => `<section class="mega-group"><h3>${esc(group.name)}</h3><ul>${group.items.map(topic => `<li><a href="${link(directoryUrl(category, topic))}">${esc(directoryItem(category, topic).name)}</a></li>`).join('')}</ul></section>`;
// All responsive variants come from one taxonomy. CSS exposes just one variant,
// so no browser-side regrouping or manual column assignments are necessary.
const megaContent = (c, link) => Array.isArray(c.groups)
  ? [3, 2, 1].map(count => `<div class="mega-directory-columns" data-columns="${count}">${splitGroups(c.groups, count).map(column => `<div class="mega-directory-column">${column.map(group => groupMarkup(c, group, link)).join('')}</div>`).join('')}</div>`).join('')
  : `<div class="mega-content"><div class="mega-intro"><h2>${esc(c.name)}</h2><p>${esc(c.description)}</p></div><div class="mega-families"><h3>Product families</h3>${c.families.length ? `<ul>${c.families.map(f => `<li><a href="${link(familyUrl(c,f))}">${esc(f.name)}</a></li>`).join('')}</ul>` : '<p>No product families are currently listed.</p>'}</div></div>`;
// Directory labels already link to their category; only family menus keep a footer link.
const megaFooter = (c, link) => Array.isArray(c.groups) ? '' : `<a class="mega-view-all" href="${link(categoryUrl(c))}">View All ${esc(c.name)} <span aria-hidden="true">→</span></a>`;
export function header(depth = '') {
  const link = (url) => esc(depth + url);
  return `<header class="site-header category-header">
  <div class="container category-header-top">
    <a href="${depth}index.html" class="brand"><svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="1.4"/><path d="M20 2v7M20 31v7M2 20h7M31 20h7" stroke="currentColor" stroke-width="1.4"/><circle cx="20" cy="20" r="3" fill="#0f8a8a"/></svg><span class="brand-text"><span class="brand-name">Benchvale Scientific</span><span class="brand-sub">Laboratory Products &amp; Equipment</span></span></a>
    <form class="category-search" role="search" action="${depth}products.html" method="get"><label class="nav-sr-only" for="homeSearch">Search products, models, and applications</label><input id="homeSearch" name="search" type="search" placeholder="Search products, models, applications..."/><button type="submit" aria-label="Search products"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button></form>
    <div class="header-quote-actions"><a class="header-quote-cart" href="${depth}quote.html">Quote Cart <span data-quote-count aria-live="polite" aria-atomic="true">0</span></a><a href="${depth}quote.html" class="btn btn-primary header-quote">Request a Quote</a></div>
    <button class="category-nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primaryNav">Menu <span aria-hidden="true">☰</span></button>
  </div>
  <nav class="category-nav" id="primaryNav" aria-label="Primary"><ul class="category-nav-list">
  ${categories.map(c => `<li class="category-nav-item"><div class="category-nav-label"><a href="${link(categoryUrl(c))}">${esc(c.navLabel)}</a><button class="category-disclosure" type="button" aria-label="Show ${esc(c.name)} categories" aria-controls="mega-${c.anchor}" aria-expanded="false"><span aria-hidden="true">⌄</span></button></div>
  <div class="mega-menu${Array.isArray(c.groups) ? ' mega-menu-directory' : ''}" id="mega-${c.anchor}" hidden>${megaContent(c, link)}${megaFooter(c, link)}</div></li>`).join('\n')}
  ${['Services','Promotions','About','Contact'].map(n=>`<li class="category-nav-item"><div class="category-nav-label"><a href="${depth}${n.toLowerCase()}.html">${n}</a></div></li>`).join('')}
  </ul></nav></header>`;
}
