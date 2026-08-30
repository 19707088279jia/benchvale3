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
