import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { categories, familyUrl } from "./taxonomy.mjs";
import { navigationItems } from "./site-navigation.mjs";

// Install Playwright locally or provide its package directory through NODE_PATH.
export async function validateBrowser(root, files) {
  const require = createRequire(import.meta.url);
  const { chromium } = require("playwright");
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp" };
      res.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
      res.end(readFileSync(path));
    } catch {
      res.writeHead(404).end();
    }
  });

  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROMVALE_BROWSER_CHANNEL ? { channel: process.env.CHROMVALE_BROWSER_CHANNEL } : {}),
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}/`;
    const go = (path) => page.goto(base + path);
    const visibleProducts = () => page.locator("[data-product-card]:visible").count();
    const checkOverflow = async (label) => assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Horizontal overflow: ${label}`,
    );
    const expectedLabels = navigationItems.map(({ label }) => label);

    const checkNavigation = async (depth = "") => {
      assert.deepEqual(await page.locator(".category-nav-label > a").allTextContents(), expectedLabels);
      assert.deepEqual(
        await page.locator(".category-nav-label > a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        navigationItems.map(({ href }) => depth + href),
      );
      assert.equal(await page.locator(".category-nav-item").count(), 5);
      assert.equal(await page.locator(".category-disclosure, .mega-menu").count(), 0);
      assert.equal(await page.locator(".brand-name").textContent(), "ChromVale Scientific");
      assert.equal(await page.locator(".category-search").getAttribute("action"), depth + "products.html");
      assert.equal(await page.locator(".category-search input").getAttribute("placeholder"), "Search products, models, applications...");
      assert.equal(await page.locator(".header-quote-cart").getAttribute("href"), depth + "quote.html");
      assert.equal(await page.locator(".header-quote").getAttribute("href"), depth + "quote.html");
    };

    await go("products.html");
    const inventory = await page.locator("[data-product-card]").evaluateAll((cards) => cards.map((card) => ({
      category: card.dataset.category,
      search: card.dataset.search,
    })));
    const checkCategory = async (category) => {
      assert.equal(await page.locator("main h1").textContent(), category.name);
      assert.equal(await page.locator("main h1").count(), 1);
      assert.equal(await page.locator(".category-family-card").count(), category.families.length);
      assert.equal(await page.locator(".category-families > h2").textContent(), "Product Families");
      assert.equal(await page.locator("main section").count(), 2);
      assert.equal(await page.locator("main .category-support a").count(), 5);
      assert.equal(await page.locator("main .category-breadcrumb [aria-current=\"page\"]").textContent(), category.name);
      assert.equal(await page.locator("main [data-product-card], main .catalogue-toolbar, main .cta-band").count(), 0);
      assert(await page.locator(".header-quote-cart").isVisible());
      assert(await page.locator(".header-quote").isVisible());
      assert(await page.locator(".site-footer").isVisible());
      const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
      assert.equal(new Set(ids).size, ids.length);
    };

    for (const category of categories) {
      await go(`products.html?category=${category.anchor}`);
      await checkCategory(category);
      for (const family of category.families) {
        assert.equal(
          await page.locator(".category-family-card").filter({ has: page.getByRole("heading", { name: family.name, exact: true }) }).getAttribute("href"),
          familyUrl(category, family),
        );
      }
    }

    for (const category of categories) {
      for (const family of category.families) {
        const response = await go(familyUrl(category, family));
        assert(response.ok());
        if (family.page) {
          assert(await page.locator("[data-add-to-quote]").isVisible());
        } else {
          const count = inventory.filter((item) => item.category === category.anchor && item.search.includes(family.search)).length;
          assert.equal(await visibleProducts(), count, `${category.name} / ${family.name}`);
          assert.equal(await page.locator(`[data-product-filter="${category.anchor}"]`).getAttribute("aria-pressed"), "true");
          assert.equal(await page.locator("#catalogueEmpty").isVisible(), count === 0);
        }
      }
    }

    await go("products.html?search=vial");
    assert.equal(await visibleProducts(), inventory.filter((item) => item.search.includes("vial")).length);
    await go("products.html?category=invalid");
    assert.equal(await page.locator("main h1").textContent(), "Category not found");
    await go("products.html");
    assert.equal(await visibleProducts(), 14);
    await page.locator("[data-product-filter=\"general-lab\"]").click();
    assert.equal(await visibleProducts(), 3);
    await page.locator("#productSearch").fill("vortex");
    assert.equal(await visibleProducts(), 1);

    // Desktop navigation is a single flat row with exactly five links.
    for (const width of [1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await go("index.html");
      await checkNavigation();
      assert(await page.locator("#primaryNav").isVisible());
      assert(!(await page.locator("#navToggle").isVisible()));
      const topPositions = await page.locator(".category-nav-label > a").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().top));
      assert.equal(new Set(topPositions).size, 1, "Desktop links must form one navigation row");
      await checkOverflow(`desktop navigation at ${width}`);
    }

    // Each primary destination exists; the quality route retains its clean page shell.
    for (const { href, label } of navigationItems) {
      const response = await go(href);
      assert(response.ok(), `${label} destination loads`);
      await checkNavigation();
    }
    for (const [path, title] of [["quality-qc.html", "Quality & QC"]]) {
      await go(path);
      assert.equal(await page.locator("main h1").textContent(), title);
      assert.equal(await page.locator("main section").count(), 1);
      assert.equal(await page.locator("main .content-panel, main .content-section").count(), 0);
    }

    const servicePages = ["services.html", "product-sourcing.html", "documentation-support.html", "shipping-returns.html"];
    const serviceDestinations = ["services.html", "product-sourcing.html", "documentation-support.html", "shipping-returns.html", "quote.html", "contact.html"];
    for (const path of servicePages) {
      const response = await go(path);
      assert(response.ok(), `${path} loads`);
      const rows = page.locator('.services-sidebar nav[aria-label="Services navigation"] a');
      assert.deepEqual(await rows.evaluateAll((links) => links.map((link) => link.getAttribute("href"))), serviceDestinations);
      assert.equal(await page.locator('.services-sidebar nav a[aria-current="page"]').count(), 1);
      assert.equal(await page.locator('.services-sidebar nav a[aria-current="page"]').getAttribute("href"), path);
    }

    // Search behavior remains unchanged.
    await go("index.html");
    await page.locator("#homeSearch").fill("vial");
    await Promise.all([
      page.waitForURL("**/products.html?search=vial"),
      page.locator(".category-search button").click(),
    ]);
    assert((await visibleProducts()) > 0);

    // Mobile/tablet retains the existing Menu control and exposes the same five plain links.
    for (const width of [320, 375, 768, 1024, 1279]) {
      await page.setViewportSize({ width, height: 900 });
      await go("index.html");
      assert(!(await page.locator("#primaryNav").isVisible()));
      assert(await page.locator("#navToggle").isVisible());
      await page.locator("#navToggle").click();
      assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"), "true");
      assert(await page.locator("#primaryNav").isVisible());
      await checkNavigation();
      const rowHeights = await page.locator(".category-nav-label > a").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
      assert(rowHeights.every((height) => height >= 48));
      await page.locator(".category-nav-label > a").first().focus();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#navToggle").getAttribute("aria-expanded"), "false");
      assert(!(await page.locator("#primaryNav").isVisible()));
      await checkOverflow(`mobile navigation at ${width}`);
    }

    const touchContext = await browser.newContext({ viewport: { width: 375, height: 900 }, isMobile: true, hasTouch: true });
    const touch = await touchContext.newPage();
    await touch.goto(base + "index.html");
    await touch.locator("#navToggle").tap();
    await Promise.all([
      touch.waitForURL("**/shipping-returns.html"),
      touch.getByRole("link", { name: "Shipping & Returns", exact: true }).tap(),
    ]);
    assert(new URL(touch.url()).pathname.endsWith("/shipping-returns.html"));
    await touchContext.close();

    // Quote Cart demo selector, quantities, subtotal, distinct-line count, and persistence.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go("quote.html");
    await page.evaluate(() => localStorage.removeItem("chromvaleQuoteProducts"));
    await page.reload();
    assert.equal(await page.locator("main .page-hero").count(), 0);
    assert.equal(await page.locator("main h1").textContent(), "Products *");
    assert((await page.locator("#addProductItem").textContent()).includes("Add HPLC Column"));
    assert((await page.locator("#addProductItem").boundingBox()).height >= 50);
    const firstPurposePositions = await page.evaluate(() => ({
      products: document.querySelector(".product-request-field").getBoundingClientRect().top,
      customer: document.querySelector(".quote-customer-heading").getBoundingClientRect().top,
    }));
    assert(firstPurposePositions.products < firstPurposePositions.customer, "Products appear before customer information");
    assert.equal(await page.locator("[data-product-row]").count(), 0);
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$0 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(0)");

    await page.locator("#addProductItem").click();
    assert(await page.locator("#productPicker").isVisible());
    assert.equal(await page.locator("[data-select-demo-product]").count(), 20);
    for (const query of ["C18", "3 µm", "4.6 × 250 mm", "CV-DEMO-CN-013"]) {
      await page.locator("#productPickerSearch").fill(query);
      assert((await page.locator("[data-select-demo-product]").count()) > 0, `Demo search finds ${query}`);
    }
    await page.locator("#productPickerSearch").fill("ChromVale C18 Standard");
    await page.locator("[data-select-demo-product]").filter({ hasText: "ChromVale C18 Standard" }).click();
    assert.equal(await page.locator("[data-product-row]").count(), 1);
    assert.equal(await page.locator("[data-quote-quantity]").inputValue(), "1");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$499 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");

    // Selecting the same product again increments quantity without adding a row.
    await page.locator("#addProductItem").click();
    await page.locator("#productPickerSearch").fill("CV-DEMO-C18-001");
    await page.locator("[data-select-demo-product]").click();
    assert.equal(await page.locator("[data-product-row]").count(), 1);
    assert.equal(await page.locator("[data-quote-quantity]").inputValue(), "2");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$998 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");

    await page.locator("#addProductItem").click();
    await page.locator("#productPickerSearch").fill("ChromVale C8 Standard");
    await page.locator("[data-select-demo-product]").filter({ hasText: "ChromVale C8 Standard" }).click();
    assert.equal(await page.locator("[data-product-row]").count(), 2);
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(2)");
    const quantityInputs = page.locator("[data-quote-quantity]");
    await quantityInputs.nth(0).fill("10");
    await quantityInputs.nth(1).fill("5");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$7,235 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(2)", "Header count uses distinct line items");
    await quantityInputs.nth(0).fill("1.5");
    assert(!(await quantityInputs.nth(0).evaluate((input) => input.checkValidity())), "Fractional quantities are invalid");
    await quantityInputs.nth(0).fill("3");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$3,742 CAD");

    const storedLines = await page.evaluate(() => JSON.parse(localStorage.getItem("chromvaleQuoteProducts")));
    assert.deepEqual(storedLines.map(({ id, quantity }) => ({ id, quantity })), [
      { id: "demo-c18-standard", quantity: 3 },
      { id: "demo-c8-standard", quantity: 5 },
    ]);
    await page.reload();
    assert.deepEqual(await page.locator("[data-quote-quantity]").evaluateAll((inputs) => inputs.map((input) => input.value)), ["3", "5"]);
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$3,742 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(2)");
    await page.locator("[data-remove-product]").nth(1).click();
    assert.equal(await page.locator("[data-product-row]").count(), 1);
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$1,497 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");
    await page.locator("#clearQuoteProducts").click();
    assert.equal(await page.locator("[data-product-row]").count(), 0);

    // Existing catalogue-page additions migrate into the structured cart.
    await go("products/2ml-autosampler-vial.html");
    await checkNavigation("../");
    await page.locator("[data-add-to-quote]").click();
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");
    await go("products.html");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");
    await Promise.all([page.waitForURL("**/quote.html"), page.locator(".header-quote-cart").click()]);
    assert.equal(await page.locator("input[name=\"product[]\"]").first().inputValue(), "2 mL HPLC/GC Autosampler Vial");
    assert.equal(await page.locator(".quote-unit-price").textContent(), "Quote");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$0 CAD");
    await page.locator("#clearQuoteProducts").click();
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(0)");

    // Mobile product selection, quantity editing, removal, and overflow.
    await page.setViewportSize({ width: 375, height: 900 });
    await go("quote.html");
    assert((await page.locator("#addProductItem").boundingBox()).height >= 50);
    await page.locator("#addProductItem").click();
    const pickerBox = await page.locator("#productPicker").boundingBox();
    assert(pickerBox.width <= 375 && pickerBox.x >= 0, "Product picker fits the mobile viewport");
    await page.locator("#productPickerSearch").fill("CV-DEMO-PFP-015");
    assert.equal(await page.locator("[data-select-demo-product]").count(), 1);
    await page.locator("[data-select-demo-product]").click();
    await page.locator("[data-quote-quantity]").fill("4");
    assert.equal(await page.locator("#quoteCartSubtotal").textContent(), "C$2,196 CAD");
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(1)");
    await checkOverflow("mobile Quote Cart with product card");
    await page.locator("[data-remove-product]").click();
    assert.equal(await page.locator("[data-product-row]").count(), 0);
    assert.equal(await page.locator("[data-quote-count]").textContent(), "(0)");

    // Homepage carousel is unaffected.
    await go("index.html");
    const activeSlide = () => page.locator(".home-slide.is-active").evaluate((element) => [...element.parentNode.children].indexOf(element));
    const firstSlide = await activeSlide();
    await page.locator(".home-slider-next").click();
    assert.notEqual(await activeSlide(), firstSlide);
    await page.locator(".home-slider-prev").click();
    assert.equal(await activeSlide(), firstSlide);

    // Check every HTML page across mobile, breakpoint, and desktop sizes.
    for (const width of [320, 768, 1279, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of files) {
        const path = relative(root, file).split(sep).join("/");
        await go(path);
        await checkNavigation(path.startsWith("products/") ? "../" : "");
        await checkOverflow(`${path} at ${width}`);
      }
    }

    if (process.env.CHROMVALE_SCREENSHOT_DIR) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await go("index.html");
      await page.screenshot({ path: resolve(process.env.CHROMVALE_SCREENSHOT_DIR, "navigation-desktop.png") });
      await page.setViewportSize({ width: 375, height: 900 });
      await go("index.html");
      await page.locator("#navToggle").click();
      await page.screenshot({ path: resolve(process.env.CHROMVALE_SCREENSHOT_DIR, "navigation-mobile.png") });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await go("quote.html");
      await page.evaluate(() => {
        const products = window.CHROMVALE_DEMO_HPLC_PRODUCTS.slice(0, 2).map((product, index) => ({
          ...product,
          specification: [product.particleSize, product.poreSize, product.dimensions].join(" · "),
          quantity: index + 2,
        }));
        localStorage.setItem("chromvaleQuoteProducts", JSON.stringify(products));
      });
      await page.reload();
      await page.locator(".product-request-field").scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(process.env.CHROMVALE_SCREENSHOT_DIR, "quote-cart-desktop.png") });
      await page.setViewportSize({ width: 375, height: 1000 });
      await page.reload();
      await page.locator(".product-request-field").scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(process.env.CHROMVALE_SCREENSHOT_DIR, "quote-cart-mobile.png") });
    }

    assert.deepEqual(errors, [], "Browser JavaScript errors");
    console.log("PASS browser: Quote Cart selection/search, duplicate handling, manual quantities, subtotal, removal, distinct count, persistence, catalogue compatibility, and desktop/mobile behavior.");
  } finally {
    await browser?.close();
    await new Promise((closed) => server.close(closed));
  }
}
