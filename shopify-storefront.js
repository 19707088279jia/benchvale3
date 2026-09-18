/* Reusable Shopify Storefront API client and persisted Shopify cart store. */
(() => {
  "use strict";

  const SHOPIFY_CART_ID_KEY = "chromvaleShopifyCartId";
  const LEGACY_LOCAL_CART_KEY = "chromvaleCart";
  const BLOCKED_TEST_PRODUCT_SKUS = new Set(["CV-TEST-001"]);
  const BLOCKED_TEST_PRODUCT_TITLES = new Set(["chromvale test product"]);

  const PRODUCT_FIELDS = `
    id
    handle
    title
    description
    featuredImage { url altText width height }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        price { amount currencyCode }
        image { url altText width height }
        selectedOptions { name value }
      }
    }
  `;

  const CART_FIELDS = `
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          amountPerQuantity { amount currencyCode }
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            availableForSale
            price { amount currencyCode }
            image { url altText width height }
            selectedOptions { name value }
            product {
              title
              handle
              featuredImage { url altText width height }
            }
          }
        }
      }
    }
  `;

  const PRODUCT_QUERY = `
    query ChromValeProductByHandle($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }
  `;
  const CART_QUERY = `
    query ChromValeCart($id: ID!) {
      cart(id: $id) { ${CART_FIELDS} }
    }
  `;
  const CART_CREATE_MUTATION = `
    mutation ChromValeCartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { code field message }
        warnings { message }
      }
    }
  `;
  const CART_LINES_ADD_MUTATION = `
    mutation ChromValeCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { code field message }
        warnings { message }
      }
    }
  `;
  const CART_LINES_UPDATE_MUTATION = `
    mutation ChromValeCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { code field message }
        warnings { message }
      }
    }
  `;
  const CART_LINES_REMOVE_MUTATION = `
    mutation ChromValeCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
        userErrors { code field message }
        warnings { message }
      }
    }
  `;
  const CART_ATTRIBUTES_UPDATE_MUTATION = `
    mutation ChromValeCartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
      cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart { ${CART_FIELDS} }
        userErrors { code field message }
        warnings { message }
      }
    }
  `;

  class ShopifyStorefrontError extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "ShopifyStorefrontError";
      this.status = options.status || null;
      this.userErrors = options.userErrors || [];
    }
  }

  const normalizeConfig = (source = {}) => {
    const storeDomain = String(source.storeDomain || "").trim().toLowerCase();
    const apiVersion = String(source.apiVersion || "").trim();
    const publicStorefrontToken = String(source.publicStorefrontToken || "").trim();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(storeDomain)) throw new ShopifyStorefrontError("Shopify Storefront store domain is not configured correctly.");
    if (!/^\d{4}-\d{2}$/.test(apiVersion)) throw new ShopifyStorefrontError("Shopify Storefront API version is not configured correctly.");
    if (!publicStorefrontToken) throw new ShopifyStorefrontError("Shopify public Storefront API access token is not configured.");
    return Object.freeze({ storeDomain, apiVersion, publicStorefrontToken });
  };

  const createStorefrontClient = (sourceConfig) => {
    const config = normalizeConfig(sourceConfig);
    const endpoint = `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`;

    const request = async (query, variables = {}) => {
      let response;
      try {
        response = await window.fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": config.publicStorefrontToken,
          },
          body: JSON.stringify({ query, variables }),
        });
      } catch {
        throw new ShopifyStorefrontError("Unable to reach Shopify. Check your connection and try again.");
      }
      if (!response.ok) throw new ShopifyStorefrontError(`Shopify Storefront request failed (${response.status}).`, { status: response.status });
      const payload = await response.json();
      if (Array.isArray(payload.errors) && payload.errors.length) {
        throw new ShopifyStorefrontError(payload.errors.map((error) => error.message).filter(Boolean).join(" ") || "Shopify Storefront returned an error.");
      }
      return payload.data || {};
    };

    const mutationCart = (data, field) => {
      const result = data?.[field];
      if (!result) throw new ShopifyStorefrontError("Shopify did not return a cart result.");
      const userErrors = Array.isArray(result.userErrors) ? result.userErrors : [];
      if (userErrors.length) {
        throw new ShopifyStorefrontError(userErrors.map((error) => error.message).filter(Boolean).join(" ") || "Shopify could not update the cart.", { userErrors });
      }
      if (!result.cart) throw new ShopifyStorefrontError("The Shopify cart is no longer available.");
      return result.cart;
    };

    const getProductByHandle = async (handle) => {
      const normalizedHandle = String(handle || "").trim();
      if (!normalizedHandle) throw new ShopifyStorefrontError("A Shopify product handle is required.");
      return (await request(PRODUCT_QUERY, { handle: normalizedHandle })).product || null;
    };
    const getFirstAvailableVariant = async (handle, preferredSku = "") => {
      const product = await getProductByHandle(handle);
      if (!product) throw new ShopifyStorefrontError(`Shopify product “${handle}” was not found.`);
      const variants = Array.isArray(product.variants?.nodes) ? product.variants.nodes : [];
      const variant = variants.find((candidate) => candidate.availableForSale && preferredSku && candidate.sku === preferredSku)
        || variants.find((candidate) => candidate.availableForSale);
      if (!variant) throw new ShopifyStorefrontError(`Shopify product “${handle}” has no available variant.`);
      return Object.freeze({ product, variant });
    };
    const getCart = async (id) => {
      const cartId = String(id || "").trim();
      if (!cartId) return null;
      return (await request(CART_QUERY, { id: cartId })).cart || null;
    };
    const createCart = async (lines = []) => mutationCart(await request(CART_CREATE_MUTATION, { input: { lines } }), "cartCreate");
    const cartLinesAdd = async (cartId, lines) => mutationCart(await request(CART_LINES_ADD_MUTATION, { cartId, lines }), "cartLinesAdd");
    const cartLinesUpdate = async (cartId, lines) => mutationCart(await request(CART_LINES_UPDATE_MUTATION, { cartId, lines }), "cartLinesUpdate");
    const cartLinesRemove = async (cartId, lineIds) => mutationCart(await request(CART_LINES_REMOVE_MUTATION, { cartId, lineIds }), "cartLinesRemove");
    const cartAttributesUpdate = async (cartId, attributes) => mutationCart(await request(CART_ATTRIBUTES_UPDATE_MUTATION, { cartId, attributes }), "cartAttributesUpdate");

    return Object.freeze({ endpoint, request, getProductByHandle, getFirstAvailableVariant, getCart, createCart, cartLinesAdd, cartLinesUpdate, cartLinesRemove, cartAttributesUpdate });
  };

  const createCartStore = (client, storage = window.localStorage) => {
    let snapshot = null;
    let restoreRequest = null;

    const normalizedIdentifier = (value) => String(value || "").trim().toLowerCase();
    const isBlockedTestLine = (line) => {
      const merchandise = line?.merchandise || {};
      return BLOCKED_TEST_PRODUCT_SKUS.has(String(merchandise.sku || "").trim().toUpperCase())
        || BLOCKED_TEST_PRODUCT_TITLES.has(normalizedIdentifier(merchandise.product?.title));
    };
    const removeBlockedTestLines = async (cart) => {
      if (!cart?.id) return cart;
      const blockedLineIds = (cart.lines?.nodes || []).filter(isBlockedTestLine).map((line) => line.id).filter(Boolean);
      if (!blockedLineIds.length) return cart;
      return client.cartLinesRemove(cart.id, blockedLineIds);
    };

    const readId = () => {
      try { return String(storage.getItem(SHOPIFY_CART_ID_KEY) || "").trim(); } catch { return ""; }
    };
    const save = (cart) => {
      snapshot = cart || null;
      try {
        if (cart?.id) storage.setItem(SHOPIFY_CART_ID_KEY, cart.id);
        else storage.removeItem(SHOPIFY_CART_ID_KEY);
        storage.removeItem(LEGACY_LOCAL_CART_KEY);
      } catch { /* Shopify remains usable in the current tab. */ }
      window.dispatchEvent(new CustomEvent("chromvale:shopify-cart-updated", { detail: { cart: snapshot } }));
      return snapshot;
    };
    const create = async (lines = []) => save(await removeBlockedTestLines(await client.createCart(lines)));
    const restore = async ({ recreateInvalid = true, force = false } = {}) => {
      if (snapshot && !force) return snapshot;
      if (restoreRequest && !force) return restoreRequest;
      const cartId = readId();
      if (!cartId) return null;
      restoreRequest = (async () => {
        const cart = await client.getCart(cartId);
        if (cart) return save(await removeBlockedTestLines(cart));
        save(null);
        return recreateInvalid ? create() : null;
      })();
      try { return await restoreRequest; } finally { restoreRequest = null; }
    };
    const addLines = async (lines) => {
      const normalized = Array.isArray(lines) ? lines.filter((line) => line?.merchandiseId && Number.isInteger(Number(line.quantity)) && Number(line.quantity) > 0).map((line) => ({ merchandiseId: line.merchandiseId, quantity: Number(line.quantity) })) : [];
      if (!normalized.length) throw new ShopifyStorefrontError("A valid product variant and quantity are required.");
      let cart = await restore({ recreateInvalid: false, force: true });
      if (!cart) return create(normalized);
      try {
        return save(await removeBlockedTestLines(await client.cartLinesAdd(cart.id, normalized)));
      } catch (error) {
        if (!(error instanceof ShopifyStorefrontError) || !error.userErrors.length) throw error;
        save(null);
        return create(normalized);
      }
    };
    const updateLines = async (lines) => {
      const cart = await restore({ force: true });
      if (!cart) return create();
      try { return save(await client.cartLinesUpdate(cart.id, lines)); }
      catch (error) {
        if (!(error instanceof ShopifyStorefrontError) || !error.userErrors.length) throw error;
        save(null);
        return create();
      }
    };
    const removeLines = async (lineIds) => {
      const cart = await restore({ force: true });
      if (!cart) return create();
      try { return save(await client.cartLinesRemove(cart.id, lineIds)); }
      catch (error) {
        if (!(error instanceof ShopifyStorefrontError) || !error.userErrors.length) throw error;
        save(null);
        return create();
      }
    };
    const updateAttributes = async (attributes) => {
      const normalized = Array.isArray(attributes)
        ? attributes
          .map(({ key, value } = {}) => ({ key: String(key || "").trim(), value: String(value || "").trim() }))
          .filter(({ key }) => key)
        : [];
      if (!normalized.length) throw new ShopifyStorefrontError("At least one valid cart attribute is required.");
      const cart = await restore({ force: true });
      if (!cart?.id) throw new ShopifyStorefrontError("Your Shopify cart is empty.");
      return save(await client.cartAttributesUpdate(cart.id, normalized));
    };
    const checkout = async () => {
      const cart = await restore({ force: true });
      if (!cart?.totalQuantity || !cart.checkoutUrl) throw new ShopifyStorefrontError("Your Shopify cart is empty.");
      const checkoutUrl = new URL(cart.checkoutUrl);
      if (checkoutUrl.protocol !== "https:") throw new ShopifyStorefrontError("Shopify returned an invalid checkout URL.");
      return checkoutUrl.href;
    };

    return Object.freeze({ key: SHOPIFY_CART_ID_KEY, readId, save, create, restore, addLines, updateLines, removeLines, updateAttributes, checkout, get snapshot() { return snapshot; } });
  };

  window.ChromValeShopify = Object.freeze({ SHOPIFY_CART_ID_KEY, ShopifyStorefrontError, createStorefrontClient, createCartStore });
})();
