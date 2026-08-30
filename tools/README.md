# Updating the catalogue navigation

`tools/taxonomy.mjs` defines the seven parent categories, their display labels,
product families and destinations. Add new families here before adding product
records in `tools/generate-product-pages.mjs`. Set `page` only for an existing
family/detail page; otherwise supply a catalogue `search` term. A family can
exist before product listings; do not create placeholder products or SKUs.

Regenerate the catalogue and synchronize every static page header:

```sh
node tools/generate-product-pages.mjs
node tools/update-navigation.mjs
node tools/validate-site.mjs
node tools/validate-site.mjs --browser
```

The browser checks require Playwright and its Chromium browser. An installed
Chrome or Edge can be selected with `BENCHVALE_BROWSER_CHANNEL=chrome` or
`msedge`. `NODE_PATH` may point to an existing Playwright installation.
`BENCHVALE_SCREENSHOT_DIR` optionally saves desktop and mobile screenshots.

The customer-care page generator also imports the shared header renderer.
Run `update-navigation.mjs` after changing taxonomy to refresh all other pages.
The generated HTML keeps category names and links available without requiring
client-side header rendering. `script.js` provides disclosure interactions and
catalogue filtering; `navigation.css` owns the responsive header layout.

## Category landing pages and family results

`products.html?category=<slug>` renders only the category breadcrumb, support
card, introduction, technical visual, and Product Families. A `search` parameter
on a category URL does not bring back the general catalogue body. Unknown or
empty category values receive a compact category-not-found state.

`tools/category-layout.mjs` generates inert landing templates from the taxonomy.
`category-page.js` mounts the matching template and removes the general body
before shared catalogue behavior runs. `category-page.css` styles only that
layout. Category/family icons and short descriptions live in the taxonomy.

Family links use their dedicated detail page where available. Otherwise
`products.html?filter=<slug>&search=<term>` opens the general catalogue with
both filters applied; reserving `category` for landing pages prevents a family
link from looping back to its category card. Plain `?search=` is unchanged.

Quote Cart links to the existing quote form and displays the count from the
existing saved-product list. It adds no checkout or server-side behavior.

## Grouped navigation directories

All seven product categories use a flat `groups` array alongside their existing
catalogue data. Each group has a `name` and an `items` array. Catalogue items
reference an existing family by name, keeping its label, dedicated page, and
search destination in one place:

```js
{
  name: 'Vials & Closures',
  items: [{ family: 'Autosampler Vials' }, { family: 'Caps & Septa' }]
}
```

`directoryItem` rejects unknown family references. Analytical's existing sourcing
topics keep their direct `name` and `search`/`page` definitions unchanged. The
renderer also retains its simpler `families` fallback for unmigrated inputs.

To expand any category, append one object to its `groups` array in
`tools/taxonomy.mjs`, then run `node tools/update-navigation.mjs` to refresh the
static pages. No renderer or CSS edits are needed. The renderer creates one
`section.mega-group` per object and distributes groups sequentially into real
column containers. Balanced chunking gives earlier columns the remainder:
4 groups become 2/1/1, 5 become 2/2/1, and 6 become 2/2/2 on desktop.
The same algorithm generates 3-, 2-, and 1-column variants. CSS displays only
the variant matching the existing navigation breakpoint; inactive variants are
hidden from both display and keyboard navigation. No runtime regrouping is needed.
Categories with two groups use two populated desktop columns and leave the third
empty; the shared three-column frame stays the same without inventing products.

Groups stack at the top of each column. A short 144px navy rule with 6px of space
above and below on desktop (9px on tablet/mobile) automatically separates adjacent
groups in the same column. Desktop links use approximately 21.5px rows, with
tighter heading spacing; touch layouts retain their existing 44px minimum rows.
Spectroscopy follows Analytical Instruments in the taxonomy and therefore
immediately follows it in column one for the current four groups. No group has
a column field or hardcoded position.

Directory panels size to their content instead of spanning the navigation.
Desktop content starts 17px inside the panel, with three 230px columns and no
grid gap, occupying 690px inside a 724px panel. Navy separators and 14px inner
column padding distinguish neighboring columns. On desktop, the fixed directory
extends from the category navigation to 24px above the viewport bottom. White
background exists only inside the compact panel: there is no separate backdrop,
and the page remains visible to its right and below it. Columns stretch to fill
the panel, extending their navy separators to its bottom; long directories
scroll inside the panel. The shared navigation script measures the navigation's
bottom and the active label on open, resize, header resize, and page scroll. The
panel follows its label, clamped to the viewport with 24px right clearance, so
the pointer can move directly into menus near the right end of the navigation.
Analytical retains its original left position. Header backdrop blur is disabled only while the overlay
is open so it cannot change the fixed positioning reference.

Moving the pointer out (unless focus remains inside), clicking outside, or
pressing Escape closes the menu. Hover and
keyboard navigation between categories remain available. Directory menus have
no footer link or divider; their main navigation label links to the category page.
Tablet and mobile variants use two and one real columns, with one vertical
separator on tablet and none on mobile. The existing mobile accordion behavior
is unchanged, including content-based height and 50px bottom padding. All product
categories share these styles and omit the footer link.

Grouped sourcing topics remain separate from verified catalogue `families`.
For direct topics, `directoryUrl` uses a dedicated `page` if supplied, otherwise
the category URL plus `search`; Analytical's destinations are unchanged. For
`{ family: '...' }` references, it delegates to `familyUrl`, preserving both the
existing detail pages and `products.html?filter=...&search=...` catalogue links.
Add catalogue families only when verified data becomes available.

Browser validation covers 3, 4, 5, 6, and 8 groups using in-memory taxonomy fixtures;
those fixtures are never written to the catalogue or generated site. It also
checks every category at desktop, tablet, and mobile widths, label-to-panel
pointer travel, preserved family links, and taxonomy-only expansion in each menu.
