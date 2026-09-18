import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const screenshotDir = resolve(root, "..", "screenshots");
mkdirSync(screenshotDir, { recursive: true });
const read = (path) => readFileSync(resolve(root, path), "utf8");
const configSource = read("shopify-config.js");
const clientSource = read("shopify-storefront.js");
const sharedSource = read("script.js");
const directSource = read("direct-order.js");
const productSource = read("products/c18-hplc-column.html");
const cartSource = read("cart.html");
const checkoutSource = read("checkout.html");

const configuredPublicToken = configSource.match(/publicStorefrontToken:\s*window\.CHROMVALE_SHOPIFY_PUBLIC_TOKEN\s*\|\|\s*"([^"]*)"/)?.[1] || "";
assert(configSource.includes('storeDomain: "ubtqyk-kk.myshopify.com"'), "Shopify store domain must match");
assert(configSource.includes('apiVersion: "2026-07"'), "Storefront API version must be 2026-07");
assert(configuredPublicToken, "Public Storefront token must be configured");
for (const operation of ["cartCreate", "cartLinesAdd", "cartLinesUpdate", "cartLinesRemove", "cart(id: $id)"]) {
  assert(clientSource.includes(operation), `Storefront client must implement ${operation}`);
}
assert(clientSource.includes('const SHOPIFY_CART_ID_KEY = "chromvaleShopifyCartId"'), "Shopify cart ID storage key must exist");
assert(clientSource.includes('"X-Shopify-Storefront-Access-Token"'), "Client must use the public token header");
assert(!clientSource.includes("Shopify-Storefront-Private-Token"), "Client must not use a private token header");
assert(sharedSource.includes('accountLink.href = "https://shopify.com/99189686345/account"'), "Account URL must match");
assert(sharedSource.includes("ChromValeShopifyReady"), "Shared header must initialize Shopify on every page");
assert(productSource.includes('data-shopify-product-handle="chromvale-test-product"'), "Product handle must match");
assert(productSource.includes('data-shopify-product-sku="CV-TEST-001"'), "Test SKU must match");
assert(directSource.includes("cartStore.addLines"), "Product Add to Cart must use Shopify");
assert(directSource.includes("cartStore.updateLines"), "Quantity changes must use Shopify");
assert(directSource.includes("cartStore.removeLines"), "Remove must use Shopify");
assert(directSource.includes("cartStore.checkout"), "Checkout must use Shopify checkoutUrl");
assert(!checkoutSource.includes('id="checkoutForm"') && !checkoutSource.includes("shippingAddress") && !checkoutSource.includes("billingAddress"), "ChromVale checkout must not collect customer or shipping information");
assert(!/<input[^>]+(?:card|cvv|cvc|expiry)/i.test([productSource, cartSource, checkoutSource].join("\n")), "ChromVale must not collect card details");
assert(sharedSource.includes('const quoteStorageKey = "chromvaleQuoteProducts"'), "Quote Cart must remain separate");

const securityScan = [configSource, clientSource, sharedSource, directSource, productSource, cartSource, checkoutSource].join("\n");
for (const forbidden of [/Shopify-Storefront-Private-Token/i, /shpat_[A-Za-z0-9_-]+/, /shpca_[A-Za-z0-9_-]+/, /admin[_-]?(?:api[_-]?)?token\s*[:=]\s*["'][^"']+/i]) {
  assert(!forbidden.test(securityScan), `Private credential pattern found: ${forbidden}`);
}

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === ".git") return [];
  const absolute = resolve(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});
const htmlFiles = walk(root).filter((file) => extname(file) === ".html");
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const references = Array.from(html.matchAll(/\s(?:href|src|action)=["']([^"']+)["']/g), (match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(reference)) continue;
    const local = reference.split(/[?#]/, 1)[0];
    if (!local) continue;
    assert(existsSync(resolve(dirname(file), decodeURIComponent(local))), `${file.slice(root.length + 1)}: missing ${reference}`);
  }
}

const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) return response.writeHead(404).end();
  response.setHeader("Content-Type", contentTypes[extname(file)] || "application/octet-stream");
  response.end(readFileSync(file));
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const launch = () => chromium.launch({ headless: true, ...(process.env.CHROMVALE_BROWSER_CHANNEL ? { channel: process.env.CHROMVALE_BROWSER_CHANNEL } : {}) });
const base = `http://127.0.0.1:${server.address().port}/`;
const checkoutUrl = "https://ubtqyk-kk.myshopify.com/checkouts/chromvale-cart-test";
const variant = {
  id: "gid://shopify/ProductVariant/56050653429833",
  title: "Default Title",
  sku: "CV-TEST-001",
  availableForSale: true,
  price: { amount: "1.0", currencyCode: "CAD" },
  image: null,
  selectedOptions: [{ name: "Title", value: "Default Title" }],
};
const product = { id: "gid://shopify/Product/15762773508169", handle: "chromvale-test-product", title: "ChromVale Test Product", description: "", featuredImage: null, variants: { nodes: [variant] } };
const money = (amount) => ({ amount: String(amount), currencyCode: "CAD" });

let browser;
try {
  browser = await launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => { window.CHROMVALE_SHOPIFY_PUBLIC_TOKEN = "public-test-token"; });
  let cartSequence = 0;
  let cartId = "";
  let lineQuantity = 0;
  const calls = [];
  const mockCart = () => ({
    id: cartId,
    checkoutUrl,
    totalQuantity: lineQuantity,
    cost: { subtotalAmount: money(lineQuantity), totalAmount: money(lineQuantity) },
    lines: { nodes: lineQuantity ? [{ id: "gid://shopify/CartLine/test", quantity: lineQuantity, cost: { amountPerQuantity: money(1), subtotalAmount: money(lineQuantity), totalAmount: money(lineQuantity) }, merchandise: { ...variant, product: { title: product.title, handle: product.handle, featuredImage: null } } }] : [] },
  });
  await context.route("https://ubtqyk-kk.myshopify.com/api/2026-07/graphql.json", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,X-Shopify-Storefront-Access-Token", "Access-Control-Allow-Methods": "POST,OPTIONS" } });
    const body = request.postDataJSON();
    calls.push({ query: body.query, variables: body.variables, publicHeader: request.headers()["x-shopify-storefront-access-token"] });
    let data;
    if (body.query.includes("ChromValeProductByHandle")) data = { product };
    else if (body.query.includes("query ChromValeCart")) data = { cart: body.variables.id === cartId ? mockCart() : null };
    else if (body.query.includes("ChromValeCartCreate")) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));
      cartId = `gid://shopify/Cart/mock-${++cartSequence}?key=mock-secret-key`;
      lineQuantity = Number(body.variables.input.lines?.[0]?.quantity || 0);
      data = { cartCreate: { cart: mockCart(), userErrors: [], warnings: [] } };
    } else if (body.query.includes("ChromValeCartLinesAdd")) {
      lineQuantity += Number(body.variables.lines[0].quantity);
      data = { cartLinesAdd: { cart: mockCart(), userErrors: [], warnings: [] } };
    } else if (body.query.includes("ChromValeCartLinesUpdate")) {
      lineQuantity = Number(body.variables.lines[0].quantity);
      data = { cartLinesUpdate: { cart: mockCart(), userErrors: [], warnings: [] } };
    } else if (body.query.includes("ChromValeCartLinesRemove")) {
      lineQuantity = 0;
      data = { cartLinesRemove: { cart: mockCart(), userErrors: [], warnings: [] } };
    } else throw new Error("Unexpected mock Storefront operation");
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ data }) });
  });
  await context.route(checkoutUrl, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Mock Shopify Checkout</title><h1>Shopify Checkout</h1>" }));

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${base}products/c18-hplc-column.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("[data-shopify-product-title]").first().textContent(), "ChromVale Test Product");
  assert.equal(await page.locator("[data-selected-sku]").first().textContent(), "CV-TEST-001");
  assert.equal(await page.locator("[data-selected-price]").textContent(), "C$1.00 CAD");
  assert(await page.locator(".header-account").isVisible(), "Account must be visible");
  assert.equal(await page.locator(".header-account").getAttribute("href"), "https://shopify.com/99189686345/account");
  assert.equal(await page.locator(".header-account").getAttribute("target"), null, "Account must open in the same tab");
  assert(await page.evaluate(() => document.querySelector(".header-account")?.nextElementSibling?.classList.contains("header-direct-cart")), "Account must be immediately left of Cart");
  await page.screenshot({ path: resolve(screenshotDir, "shopify-product-desktop.png"), fullPage: true });

  await page.evaluate(() => localStorage.setItem("chromvaleQuoteProducts", JSON.stringify([{ id: "quote-preserved", name: "Quote preserved", quantity: 1 }])));
  await page.locator("#directAddToCart").click();
  assert(await page.locator("#directAddToCart").isDisabled(), "Add to Cart must disable while the Shopify request is pending");
  await page.evaluate(() => document.querySelector("#directAddToCart").click());
  await page.waitForFunction(() => document.querySelector("[data-direct-cart-count]")?.textContent === "(1)");
  assert.equal(calls.filter((call) => call.query.includes("ChromValeCartCreate")).length, 1, "Pending Add to Cart must ignore duplicate clicks");
  assert.equal(await page.locator("[data-direct-cart-count]").textContent(), "(1)");
  const savedAfterCreate = await page.evaluate(() => ({ cartId: localStorage.getItem("chromvaleShopifyCartId"), legacy: localStorage.getItem("chromvaleCart"), quote: localStorage.getItem("chromvaleQuoteProducts") }));
  assert(savedAfterCreate.cartId?.includes("gid://shopify/Cart/"), "Full Shopify cart ID must be saved");
  assert.equal(savedAfterCreate.legacy, null, "Legacy local cart must be removed");
  assert(savedAfterCreate.quote?.includes("quote-preserved"), "Quote Cart must remain unchanged");

  await page.goto(`${base}cart.html`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".direct-cart-line").count(), 1);
  assert.equal(await page.locator(".direct-cart-line h2").textContent(), "ChromVale Test Product");
  assert((await page.locator(".direct-cart-specs").textContent()).includes("CV-TEST-001"));
  assert.equal(await page.locator("[data-cart-quantity]").inputValue(), "1");
  assert.equal(await page.locator("[data-direct-subtotal]").textContent(), "C$1.00 CAD");
  await page.locator('[data-cart-change="1"]').click();
  await page.waitForFunction(() => document.querySelector("[data-cart-quantity]")?.value === "2");
  assert.equal(await page.locator("[data-cart-quantity]").inputValue(), "2");
  assert.equal(await page.locator("[data-direct-cart-count]").textContent(), "(2)");
  assert(calls.some((call) => call.query.includes("ChromValeCartLinesUpdate")), "Quantity change must call cartLinesUpdate");
  await page.screenshot({ path: resolve(screenshotDir, "shopify-cart-desktop.png"), fullPage: true });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("[data-cart-quantity]").inputValue(), "2", "Quantity must restore from Shopify after refresh");
  assert.equal(await page.locator("[data-direct-cart-count]").textContent(), "(2)");

  await Promise.all([
    page.waitForURL(checkoutUrl, { waitUntil: "commit" }),
    page.locator("#proceedToCheckout").click(),
  ]);
  assert.equal(page.url(), checkoutUrl, "Checkout must redirect the same tab to Shopify");

  await page.goto(`${base}products/c18-hplc-column.html`, { waitUntil: "networkidle" });
  await page.locator("#directAddToCart").click();
  await page.waitForFunction(() => document.querySelector("[data-direct-cart-count]")?.textContent === "(3)");
  assert(calls.some((call) => call.query.includes("ChromValeCartLinesAdd")), "Existing cart Add to Cart must call cartLinesAdd");
  await page.goto(`${base}cart.html`, { waitUntil: "networkidle" });
  await page.locator("[data-cart-remove]").click();
  await page.locator("#directCartEmpty").waitFor({ state: "visible" });
  assert(await page.locator("#directCartEmpty").isVisible());
  assert(calls.some((call) => call.query.includes("ChromValeCartLinesRemove")), "Remove must call cartLinesRemove");

  await page.evaluate(() => localStorage.setItem("chromvaleShopifyCartId", "gid://shopify/Cart/expired?key=expired"));
  await page.reload({ waitUntil: "networkidle" });
  const replacementId = await page.evaluate(() => localStorage.getItem("chromvaleShopifyCartId"));
  assert(replacementId && !replacementId.includes("expired"), "Expired saved cart must be replaced automatically");

  lineQuantity = 1;
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(`${base}cart.html`, { waitUntil: "networkidle" });
  assert(await page.locator(".direct-cart-line").isVisible(), "Shopify cart line must remain visible on mobile");
  assert(await page.locator("#proceedToCheckout").isVisible(), "Shopify Checkout button must remain visible on mobile");
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Shopify cart must not overflow at 375px");
  await page.screenshot({ path: resolve(screenshotDir, "shopify-cart-mobile.png"), fullPage: true });

  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}index.html`, { waitUntil: "networkidle" });
    for (const selector of [".header-account", ".header-direct-cart", ".header-quote", "#navToggle"]) assert(await page.locator(selector).isVisible(), `${selector} must be visible at ${width}px`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Header must not overflow at ${width}px`);
    if (width === 375) await page.screenshot({ path: resolve(screenshotDir, "shopify-header-mobile.png"), fullPage: false });
  }
  assert(calls.every((call) => call.publicHeader), "Every Storefront request must carry the public token header");
  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  await context.close();

  const liveContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const livePage = await liveContext.newPage();
  await livePage.goto(`${base}products/c18-hplc-column.html`, { waitUntil: "networkidle" });
  assert.equal(await livePage.locator("[data-shopify-product-title]").first().textContent(), "ChromVale Test Product");
  assert.equal(await livePage.locator("[data-selected-sku]").first().textContent(), "CV-TEST-001");
  await livePage.locator("#directAddToCart").click();
  await livePage.waitForFunction(() => document.querySelector("[data-direct-cart-count]")?.textContent === "(1)");
  assert.equal(await livePage.locator("[data-direct-cart-count]").textContent(), "(1)");
  await livePage.goto(`${base}cart.html`, { waitUntil: "networkidle" });
  assert.equal(await livePage.locator("[data-cart-quantity]").inputValue(), "1");
  await livePage.locator('[data-cart-change="1"]').click();
  await livePage.waitForFunction(() => document.querySelector("[data-cart-quantity]")?.value === "2");
  assert.equal(await livePage.locator("[data-cart-quantity]").inputValue(), "2");
  await livePage.reload({ waitUntil: "networkidle" });
  assert.equal(await livePage.locator("[data-cart-quantity]").inputValue(), "2", "Live Shopify cart must restore after refresh");
  await Promise.all([
    livePage.waitForURL((url) => url.protocol === "https:" && (url.hostname.endsWith(".myshopify.com") || url.hostname === "shopify.com" || url.hostname.endsWith(".shopify.com")), { waitUntil: "commit", timeout: 30000 }),
    livePage.locator("#proceedToCheckout").click(),
  ]);
  assert(!livePage.url().startsWith(base), "Live Checkout must leave ChromVale for Shopify");
  await liveContext.close();

  console.log(`PASS Shopify commerce: ${htmlFiles.length} HTML links, real product/variant data, cartCreate/add/update/remove/query/restore, expired-cart recovery, real header quantity, separate Quote Cart, responsive header, and live Shopify Checkout redirect.`);
} finally {
  await browser?.close();
  await new Promise((closed) => server.close(closed));
}
