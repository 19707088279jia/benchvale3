import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
for (const file of ["cart.html", "checkout.html", "products/category.html", "products/category-template.js", "products/c18a.html", "products/c18-hplc-column.html", "direct-order.js", "direct-order.css", "shopify-config.js", "shopify-storefront.js"]) {
  assert(existsSync(resolve(root, file)), `${file} must exist`);
}

const direct = read("direct-order.js");
const client = read("shopify-storefront.js");
const shared = read("script.js");
const cart = read("cart.html");
const checkout = read("checkout.html");
const quote = read("quote.html");
const product = read("products/category.html");
const categoryTemplate = read("products/category-template.js");
const legacyProduct = read("products/c18-hplc-column.html");

assert(client.includes('const SHOPIFY_CART_ID_KEY = "chromvaleShopifyCartId"'), "Real Shopify cart ID key must be used");
assert(client.includes('const LEGACY_LOCAL_CART_KEY = "chromvaleCart"'), "Legacy mock cart must be explicitly retired");
assert(client.includes('const BLOCKED_TEST_PRODUCT_SKUS = new Set(["CV-TEST-001"])'), "Known test SKU must be removed before checkout");
assert(client.includes('const BLOCKED_TEST_PRODUCT_TITLES = new Set(["chromvale test product"])'), "Known test product title must be removed before checkout");
assert(client.includes("removeBlockedTestLines"), "Cart restore and checkout must sanitize known test items");
assert(!direct.includes("readCart") && !direct.includes("writeCart") && !direct.includes("normalizeCartItem"), "Direct order must not use a local item-array cart");
for (const method of ["addLines", "updateLines", "removeLines", "updateAttributes", "checkout"]) assert(direct.includes(`cartStore.${method}`), `Direct order must use Shopify ${method}`);
assert(client.includes("cartAttributesUpdate") && client.includes("CART_ATTRIBUTES_UPDATE_MUTATION"), "B2B confirmation must be persisted as a Shopify cart attribute");
assert(direct.includes('key: "B2B purchase confirmation"'), "Checkout must write the B2B confirmation audit attribute before redirecting");
assert(shared.includes('const quoteStorageKey = "chromvaleQuoteProducts"'), "Quote Cart must remain separate");
assert(categoryTemplate.includes("variantsBySku") && categoryTemplate.includes("data-family-add-to-cart"), "Shared family page must match Shopify variants by SKU and expose real Add to Cart actions");
assert(product.includes('id="categoryProductList"') && product.includes('src="category-template.js"'), "Shared category page must render the purchasable family catalogue");
assert(legacyProduct.includes('url=category.html?category=c18a') && legacyProduct.includes('window.location.replace("category.html?category=c18a")'), "Legacy direct product URL must redirect to the shared C18A page");
assert(!cart.includes("View Test Product") && !product.includes("ChromVale Test Product") && !legacyProduct.includes("ChromVale Test Product"), "Customer-facing purchase pages must not expose test products");
for (const id of ["directCartLoading", "directCartEmpty", "directCartContent", "directCartList", "proceedToCheckout", "directCartStatus"]) assert(cart.includes(`id="${id}"`), `Cart page missing ${id}`);
assert(!checkout.includes('id="checkoutForm"') && !checkout.includes("shippingAddress") && checkout.includes('id="shopifyCheckoutForward"'), "Local checkout form must be replaced by Shopify forwarding");
assert(cart.includes("Business purchases only") && cart.includes("Continue to B2B Checkout"), "Cart must clearly disclose the business-only sales policy");
assert(checkout.includes('id="businessPurchaseConfirmation"') && checkout.includes('id="continueToShopifyCheckout"'), "Checkout gateway must require an explicit B2B purchase confirmation");
assert(checkout.includes("not for personal, family, or household use"), "Checkout confirmation must exclude consumer-purpose purchases");
assert(quote.includes('id="quoteBusinessPurchase"') && quote.includes('name="businessPurchase"') && quote.includes("not for personal, family, or household use"), "RFQ flow must require the same B2B-use confirmation");
assert(direct.includes('const businessCheckoutUrl = new URL("checkout.html", siteRoot).href'), "Cart and Buy Now flows must pass through the local B2B confirmation page");
assert(!direct.includes("if (checkout) window.location.assign(cart.checkoutUrl)"), "Buy Now must not bypass the B2B confirmation page");
assert(!direct.includes("window.location.replace(await cartStore.checkout())"), "Checkout gateway must not auto-forward before B2B confirmation");
assert(!/<input[^>]+(?:card|cvv|cvc|expiry)/i.test([cart, checkout, product].join("\n")), "No card fields may exist");
assert(!client.includes("Shopify-Storefront-Private-Token"), "Private Storefront header must not exist");
assert(direct.includes('imageElement.addEventListener("error"'), "Cart thumbnails must fall back when a Shopify image fails to load");

const storageValues = new Map([["chromvaleShopifyCartId", "gid://shopify/Cart/checkout-test"]]);
const storage = {
  getItem: (key) => storageValues.get(key) || null,
  setItem: (key, value) => storageValues.set(key, String(value)),
  removeItem: (key) => storageValues.delete(key),
};
const sandbox = {
  window: { localStorage: storage, dispatchEvent() {} },
  CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  URL,
  Set,
  Object,
  String,
  Number,
  Array,
  Error,
};
runInNewContext(client, sandbox);
const realLine = { id: "line-real", merchandise: { sku: "00001-255", product: { title: "5C18A HPLC Column, 5 μm, 4.6 × 150 mm" } } };
const testSkuLine = { id: "line-test-sku", merchandise: { sku: "CV-TEST-001", product: { title: "Legacy item" } } };
const testTitleLine = { id: "line-test-title", merchandise: { sku: "", product: { title: "ChromVale Test Product" } } };
const originalCart = { id: storageValues.get("chromvaleShopifyCartId"), checkoutUrl: "https://example.myshopify.com/checkout", totalQuantity: 3, lines: { nodes: [realLine, testSkuLine, testTitleLine] } };
let removedLineIds = [];
let persistedAttributes = [];
const sanitizedCart = { ...originalCart, totalQuantity: 1, lines: { nodes: [realLine] } };
const fakeClient = {
  getCart: async () => originalCart,
  cartLinesRemove: async (_cartId, lineIds) => { removedLineIds = lineIds; return sanitizedCart; },
  cartAttributesUpdate: async (_cartId, attributes) => { persistedAttributes = attributes; return sanitizedCart; },
};
const cartStore = sandbox.window.ChromValeShopify.createCartStore(fakeClient, storage);
const restoredCart = await cartStore.restore({ force: true });
assert.deepEqual([...removedLineIds].sort(), ["line-test-sku", "line-test-title"], "Both known test identifiers must be removed from restored carts");
assert.equal(restoredCart.totalQuantity, 1, "Real cart lines must be preserved");
await cartStore.updateAttributes([{ key: "B2B purchase confirmation", value: "Confirmed" }]);
assert.equal(JSON.stringify(persistedAttributes), JSON.stringify([{ key: "B2B purchase confirmation", value: "Confirmed" }]), "B2B confirmation must be persisted to the Shopify cart");

console.log("PASS direct order architecture: SKU-matched family purchasing, test-line removal, mandatory B2B checkout confirmation, Shopify cart operations, image fallback, Quote Cart separation, and no local card collection.");
