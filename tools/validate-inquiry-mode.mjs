import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const config = read("shopify-config.js");
const shared = read("script.js");
const directOrder = read("direct-order.js");
const category = read("products/category-template.js");
const quote = read("quote.html");
const cart = read("cart.html");
const checkout = read("checkout.html");
const paymentRedirect = read("payment-placeholder.html");
const orderRedirect = read("order-confirmation.html");
const privacy = read("privacy.html");
const terms = read("terms-of-sale.html");
const home = read("index.html");

assert.match(config, /salesMode:\s*"inquiry-only"/);
assert.match(config, /commerceEnabled:\s*false/);
assert.match(shared, /const inquiryOnlyMode = true/);
assert.match(shared, /link\.textContent = "Request Availability"/);
assert.match(shared, /Online checkout is paused and no payment is collected/);
assert.match(shared, /This is not an order and no payment is due/);
assert.match(directOrder, /CHROMVALE_INQUIRY_ONLY !== false/);
assert.match(directOrder, /commerceEnabled !== true/);

assert.doesNotMatch(category, /data-family-add-to-cart|Add to Cart|\.addLines\(/);
assert.match(category, /Availability and pricing confirmed by quotation/);
assert.match(category, /Request Availability/);

assert.match(quote, /action="https:\/\/formspree\.io\/f\/maennaka"/);
assert.match(quote, /id="quoteInquiryConfirmation"[^>]+required/);
assert.match(quote, /This form is a non-binding inquiry, not an order/);
assert.match(quote, /No payment is collected/);

for (const [name, source] of [["cart.html", cart], ["checkout.html", checkout]]) {
  assert.doesNotMatch(source, /direct-order\.js|proceedToCheckout|continueToShopifyCheckout|Shopify Checkout/, `${name} must not start checkout`);
  assert.match(source, /href="quote\.html"/, `${name} must lead to the inquiry form`);
  assert.match(source, /No (?:cart or )?payment/, `${name} must explain that payment is disabled`);
}

for (const [name, source] of [["payment-placeholder.html", paymentRedirect], ["order-confirmation.html", orderRedirect]]) {
  assert.match(source, /url=quote\.html/gi, `${name} must redirect to the inquiry form`);
  assert.doesNotMatch(source, /url=checkout\.html/i, `${name} must not redirect to checkout`);
}

assert.match(privacy, /Online checkout\s+is currently disabled/);
assert.match(terms, /Inquiry-Only Website/);
assert.match(terms, /non-binding inquiry only/);
assert.match(terms, /No payment is collected through the public website/);
assert.match(home, /CAD \$439 EACH/);
assert.match(home, /selected 4\.6 × 150 mm analytical HPLC columns/i);
assert.match(home, /Shipping and applicable taxes extra/);

console.log("PASS inquiry-only gate: checkout is disabled, quote submission is non-binding, and legacy purchase routes lead to the availability form.");
