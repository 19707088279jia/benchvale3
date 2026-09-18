# Maintaining the ChromVale site

## Primary navigation

`tools/site-navigation.mjs` is the single source for the shared header. Its
`navigationItems` array defines the four flat primary links, in order:

1. HPLC Columns
2. Services
3. About
4. Contact

The primary navigation intentionally has no category dropdowns or disclosure
arrows. `script.js` only controls the existing Menu button below the 1280px
breakpoint. `navigation.css` retains the established header layout, typography,
colors, search field, Quote Cart, and Request a Quote presentation.

After changing the shared header, synchronize every root and product HTML page:

```sh
node tools/update-navigation.mjs
```

The product generator imports the same header renderer, so newly generated
product pages receive the current navigation automatically.

## Catalogue generation

`tools/taxonomy.mjs` and `tools/generate-product-pages.mjs` continue to own the
existing catalogue data and product-category landing pages. Navigation changes
do not require or imply changes to product data.

## Quote Cart demo catalogue

`demo-hplc-products.js` contains the 20 explicitly marked DEMO / PLACEHOLDER
HPLC column records used by the Quote Cart selector. Each record stores a stable
`id`, placeholder `sku`, product `name`, `chemistry`, `particleSize`, `poreSize`,
`dimensions`, numeric `unitPrice`, and `isDemo: true` marker.

To replace the demo catalogue later, update that array with verified records and
retain stable IDs for products that already exist. The selector, line-item table,
subtotal, and localStorage persistence consume the same fields automatically.
Remove the demo warning and `isDemo` labels only after the values have been
commercially verified.

Quote Cart state remains under the existing `chromvaleQuoteProducts` localStorage
key. The current structured format stores product identity, specification, unit
price, quantity, SKU, and demo status. Earlier string-only entries are migrated
in the browser and continue to appear as quote-only lines.

Regenerate product pages only when their source data changes:

```sh
node tools/generate-product-pages.mjs
node tools/update-navigation.mjs
```

## Validation

Run static validation, including all local links and anchors:

```sh
node tools/validate-site.mjs
```

Run the same validation plus browser checks:

```sh
node tools/validate-site.mjs --browser
```

The browser checks require Playwright and Chromium. Set
`CHROMVALE_BROWSER_CHANNEL=chrome` or `msedge` to use an installed browser.
`NODE_PATH` may point to an existing Playwright installation.
`CHROMVALE_SCREENSHOT_DIR` optionally saves desktop and mobile navigation
screenshots.

Run the focused Services navigation and Quote Cart regression checks with:

```sh
node tools/validate-services-navigation.mjs
node tools/validate-services-navigation.mjs --browser
```

The focused browser check accepts `CHROMVALE_BROWSER_PATH` for an installed
Chrome or Edge executable. Set `CHROMVALE_SCREENSHOT_DIR` to capture desktop
and mobile renders of all four Services pages.
