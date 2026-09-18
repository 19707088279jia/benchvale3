/* ChromVale Shopify Storefront configuration.
 * Set publicStorefrontToken to the PUBLIC Storefront API access token only.
 * Never place an Admin API token or Storefront private token in browser code.
 */
window.CHROMVALE_SHOPIFY_CONFIG = Object.freeze({
  storeDomain: "ubtqyk-kk.myshopify.com",
  apiVersion: "2026-07",
  publicStorefrontToken: window.CHROMVALE_SHOPIFY_PUBLIC_TOKEN || "a219e1174ba8044ce3f3cef91148c9a5",
});
