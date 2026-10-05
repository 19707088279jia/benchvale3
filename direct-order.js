/* ChromVale real Shopify product, cart, and checkout behavior. */
(() => {
  "use strict";

  // Fail closed: direct ordering can run only after commerce is explicitly re-enabled in both controls.
  if (window.CHROMVALE_INQUIRY_ONLY !== false || window.CHROMVALE_SHOPIFY_CONFIG?.commerceEnabled !== true) return;

  const scriptUrl = new URL(document.currentScript?.src || "direct-order.js", window.location.href);
  const siteRoot = new URL("./", scriptUrl);
  const businessCheckoutUrl = new URL("checkout.html", siteRoot).href;
  const fallbackImage = new URL("images/hplc-column-family-placeholder.svg", siteRoot).href;
  const positiveInteger = (value, fallback = 1) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  };
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const formatMoney = (money) => {
    const amount = Number(money?.amount ?? 0);
    const currency = String(money?.currencyCode || "CAD");
    const prefix = currency === "CAD" ? "C$" : `${currency} `;
    return `${prefix}${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };
  const errorMessage = (error) => error instanceof Error ? error.message : "Unable to update the Shopify cart. Please try again.";

  const setPageError = (message) => {
    const status = document.querySelector("[data-shopify-page-status], #directProductFeedback, #directCartStatus");
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.classList.add("is-error");
  };

  const initializeProductPage = async ({ client, cartStore }) => {
    const page = document.querySelector("[data-direct-product-page]");
    if (!page) return;
    const handle = page.dataset.shopifyProductHandle;
    const preferredSku = page.dataset.shopifyProductSku || "";
    const configuration = document.getElementById("directProductConfiguration");
    const quantityInput = document.getElementById("directProductQuantity");
    const addButton = document.getElementById("directAddToCart");
    const buyButton = document.getElementById("directBuyNow");
    const feedback = document.getElementById("directProductFeedback");
    let product;
    let pending = false;

    const setFeedback = (message, isError = false) => {
      feedback.textContent = message;
      feedback.hidden = !message;
      feedback.classList.toggle("is-error", isError);
    };
    const setPending = (busy, activeButton = null) => {
      pending = busy;
      for (const button of [addButton, buyButton]) {
        if (!button) continue;
        button.disabled = busy;
        button.toggleAttribute("aria-busy", busy && button === activeButton);
      }
      configuration.disabled = busy || !product;
      quantityInput.disabled = busy || !product;
      page.querySelectorAll("[data-quantity-step]").forEach((button) => { button.disabled = busy || !product; });
    };
    const variants = () => Array.isArray(product?.variants?.nodes) ? product.variants.nodes : [];
    const selectedVariant = () => variants().find((variant) => variant.id === configuration.value) || null;
    const variantLabel = (variant) => variant.title === "Default Title" ? "Default variant" : variant.title;
    const updateProductDetails = () => {
      const variant = selectedVariant();
      if (!variant) return;
      document.querySelectorAll("[data-shopify-product-title]").forEach((element) => { element.textContent = product.title; });
      document.querySelectorAll("[data-selected-sku]").forEach((element) => { element.textContent = variant.sku || "—"; });
      document.querySelectorAll("[data-selected-variant]").forEach((element) => { element.textContent = variantLabel(variant); });
      document.querySelectorAll("[data-selected-availability]").forEach((element) => { element.textContent = variant.availableForSale ? "Available" : "Unavailable"; });
      document.querySelectorAll("[data-selected-price]").forEach((element) => { element.textContent = formatMoney(variant.price); });
      document.querySelectorAll("[data-selected-currency]").forEach((element) => { element.textContent = variant.price?.currencyCode || "CAD"; });
      const description = document.querySelector("[data-shopify-product-description]");
      if (description) description.textContent = product.description || "Live Shopify product data for the ChromVale direct ordering workflow.";
      const image = document.querySelector("[data-shopify-product-image]");
      const imageData = variant.image || product.featuredImage;
      if (image && imageData?.url) {
        image.src = imageData.url;
        image.alt = imageData.altText || product.title;
      }
      addButton.disabled = !variant.availableForSale;
      buyButton.disabled = !variant.availableForSale;
    };

    setPending(true);
    try {
      product = await client.getProductByHandle(handle);
      if (!product) throw new Error(`Shopify product “${handle}” was not found.`);
      const productVariants = variants();
      if (!productVariants.length) throw new Error("This Shopify product has no variants.");
      configuration.innerHTML = productVariants.map((variant) => {
        const label = [variantLabel(variant), variant.sku, formatMoney(variant.price)].filter(Boolean).join(" · ");
        return `<option value="${escapeHtml(variant.id)}"${variant.availableForSale ? "" : " disabled"}>${escapeHtml(label)}${variant.availableForSale ? "" : " · Unavailable"}</option>`;
      }).join("");
      const preferred = productVariants.find((variant) => variant.availableForSale && variant.sku === preferredSku)
        || productVariants.find((variant) => variant.availableForSale)
        || productVariants[0];
      configuration.value = preferred.id;
      updateProductDetails();
      document.querySelectorAll("[data-shopify-product-state]").forEach((element) => { element.textContent = "Live Shopify product"; });
      setFeedback("");
    } catch (error) {
      setFeedback(errorMessage(error), true);
    } finally {
      setPending(false);
      updateProductDetails();
    }

    configuration.addEventListener("change", updateProductDetails);
    page.querySelectorAll("[data-quantity-step]").forEach((button) => {
      button.addEventListener("click", () => {
        quantityInput.value = String(Math.max(1, positiveInteger(quantityInput.value) + Number(button.dataset.quantityStep || 0)));
      });
    });
    quantityInput.addEventListener("change", () => { quantityInput.value = String(positiveInteger(quantityInput.value)); });

    const purchase = async (checkout, button) => {
      if (pending) return;
      const variant = selectedVariant();
      if (!variant?.availableForSale) return setFeedback("This Shopify variant is not available for sale.", true);
      const quantity = positiveInteger(quantityInput.value);
      setPending(true, button);
      setFeedback(checkout ? "Adding to Shopify Cart and opening checkout…" : "Adding to Shopify Cart…");
      try {
        const cart = await cartStore.addLines([{ merchandiseId: variant.id, quantity }]);
        if (checkout) window.location.assign(businessCheckoutUrl);
        else setFeedback(`${quantity} × ${product.title} added to Shopify Cart.`);
      } catch (error) {
        setFeedback(errorMessage(error), true);
      } finally {
        if (!checkout || window.location.href.startsWith(siteRoot.href)) setPending(false);
      }
    };
    addButton.addEventListener("click", () => purchase(false, addButton));
    buyButton.addEventListener("click", () => purchase(true, buyButton));
  };

  const initializeCartPage = async ({ cartStore, cart: restoredCart }) => {
    const list = document.getElementById("directCartList");
    if (!list) return;
    const emptyState = document.getElementById("directCartEmpty");
    const loadingState = document.getElementById("directCartLoading");
    const cartContent = document.getElementById("directCartContent");
    const checkoutButton = document.getElementById("proceedToCheckout");
    const status = document.getElementById("directCartStatus");
    let cart = restoredCart;
    let pending = false;

    const setStatus = (message, isError = false) => {
      status.textContent = message;
      status.hidden = !message;
      status.classList.toggle("is-error", isError);
    };
    const lines = () => Array.isArray(cart?.lines?.nodes) ? cart.lines.nodes : [];
    const variantLabel = (merchandise) => merchandise?.title === "Default Title" ? "Default variant" : merchandise?.title || "—";
    const setPending = (busy) => {
      pending = busy;
      list.toggleAttribute("aria-busy", busy);
      list.querySelectorAll("button,input").forEach((control) => { control.disabled = busy; });
      checkoutButton.disabled = busy || !cart?.totalQuantity;
      checkoutButton.toggleAttribute("aria-busy", busy && checkoutButton.dataset.checkoutPending === "true");
    };
    const render = () => {
      list.innerHTML = lines().map((line) => {
        const variant = line.merchandise || {};
        const image = variant.image || variant.product?.featuredImage;
        const name = variant.product?.title || "Shopify product";
        return `<article class="direct-cart-line" data-direct-cart-id="${escapeHtml(line.id)}">
          <img src="${escapeHtml(image?.url || fallbackImage)}" alt="${escapeHtml(image?.altText || name)}" />
          <div class="direct-cart-line-copy">
            <p class="direct-cart-line-kicker">Shopify product</p>
            <h2>${escapeHtml(name)}</h2>
            <dl class="direct-cart-specs">
              <div><dt>Variant</dt><dd>${escapeHtml(variantLabel(variant))}</dd></div>
              <div><dt>SKU</dt><dd>${escapeHtml(variant.sku || "—")}</dd></div>
            </dl>
            <p class="direct-cart-unit-price">Unit price <strong>${formatMoney(line.cost?.amountPerQuantity || variant.price)}</strong></p>
          </div>
          <div class="direct-cart-line-controls">
            <span class="direct-cart-control-label">Quantity</span>
            <div class="quantity-stepper">
              <button type="button" data-cart-change="-1" aria-label="Decrease quantity for ${escapeHtml(name)}">−</button>
              <input type="number" min="1" step="1" inputmode="numeric" value="${line.quantity}" data-cart-quantity aria-label="Quantity for ${escapeHtml(name)}" />
              <button type="button" data-cart-change="1" aria-label="Increase quantity for ${escapeHtml(name)}">+</button>
            </div>
            <strong class="direct-cart-line-total">${formatMoney(line.cost?.totalAmount)}</strong>
            <button type="button" class="direct-cart-remove" data-cart-remove>Remove</button>
          </div>
        </article>`;
      }).join("");
      list.querySelectorAll("img").forEach((imageElement) => {
        imageElement.addEventListener("error", () => {
          if (imageElement.src === fallbackImage) return;
          imageElement.src = fallbackImage;
          imageElement.alt = "HPLC column product image";
        }, { once: true });
      });
      const hasItems = Boolean(cart?.totalQuantity && lines().length);
      loadingState.hidden = true;
      emptyState.hidden = hasItems;
      cartContent.hidden = !hasItems;
      document.querySelectorAll("[data-direct-subtotal]").forEach((element) => { element.textContent = formatMoney(cart?.cost?.subtotalAmount); });
      document.querySelectorAll("[data-direct-estimated-total]").forEach((element) => { element.textContent = formatMoney(cart?.cost?.totalAmount); });
      document.querySelectorAll("[data-direct-item-count]").forEach((element) => { element.textContent = `${cart?.totalQuantity || 0} ${cart?.totalQuantity === 1 ? "item" : "items"}`; });
      checkoutButton.disabled = !hasItems;
      setPending(false);
    };
    const runMutation = async (operation) => {
      if (pending) return;
      setPending(true);
      setStatus("");
      try {
        cart = await operation();
        render();
      } catch (error) {
        setStatus(errorMessage(error), true);
        setPending(false);
      }
    };

    if (!cart && cartStore.readId()) cart = await cartStore.restore({ force: true });
    render();

    list.addEventListener("click", (event) => {
      const lineElement = event.target.closest("[data-direct-cart-id]");
      if (!lineElement) return;
      const line = lines().find((candidate) => candidate.id === lineElement.dataset.directCartId);
      if (!line) return;
      if (event.target.closest("[data-cart-remove]")) return runMutation(() => cartStore.removeLines([line.id]));
      const change = event.target.closest("[data-cart-change]");
      if (!change) return;
      const quantity = Math.max(1, line.quantity + Number(change.dataset.cartChange || 0));
      runMutation(() => cartStore.updateLines([{ id: line.id, quantity }]));
    });
    list.addEventListener("change", (event) => {
      const input = event.target.closest("[data-cart-quantity]");
      const lineElement = event.target.closest("[data-direct-cart-id]");
      if (!input || !lineElement) return;
      input.value = String(positiveInteger(input.value));
      runMutation(() => cartStore.updateLines([{ id: lineElement.dataset.directCartId, quantity: Number(input.value) }]));
    });
    checkoutButton.addEventListener("click", async () => {
      if (pending || !cart?.totalQuantity) return;
      checkoutButton.dataset.checkoutPending = "true";
      setPending(true);
      setStatus("Opening business purchase confirmation…");
      window.location.assign(businessCheckoutUrl);
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== cartStore.key && event.key !== null) return;
      runMutation(async () => await cartStore.restore({ force: true }));
    });
  };

  const initializeCheckoutForward = async ({ cartStore }) => {
    const forward = document.getElementById("shopifyCheckoutForward");
    if (!forward) return;
    const status = forward.querySelector("[data-shopify-page-status]");
    const confirmation = document.getElementById("businessPurchaseConfirmation");
    const continueButton = document.getElementById("continueToShopifyCheckout");
    const spinner = forward.querySelector(".shopify-forward-spinner");
    if (!confirmation || !continueButton || !status) return;

    let pending = false;
    const updateState = () => {
      continueButton.disabled = pending || !confirmation.checked;
      confirmation.disabled = pending;
      continueButton.toggleAttribute("aria-busy", pending);
      spinner?.toggleAttribute("hidden", !pending);
      if (!pending) {
        status.textContent = confirmation.checked
          ? "Ready to continue to secure Shopify Checkout."
          : "Confirmation is required before checkout.";
        status.classList.remove("is-error");
      }
    };

    confirmation.addEventListener("change", updateState);
    continueButton.addEventListener("click", async () => {
      if (pending || !confirmation.checked) {
        status.textContent = "Please confirm that this is an organizational or professional purchase.";
        status.classList.add("is-error");
        return;
      }
      pending = true;
      updateState();
      status.textContent = "Opening secure Shopify Checkout…";
      try {
        await cartStore.updateAttributes([{ key: "B2B purchase confirmation", value: "Confirmed — organizational or professional use only" }]);
        window.location.assign(await cartStore.checkout());
      } catch (error) {
        const message = errorMessage(error);
        pending = false;
        updateState();
        status.textContent = message;
        status.classList.add("is-error");
      }
    });
    updateState();
  };

  const initialize = async () => {
    if (!window.ChromValeShopifyReady) throw new Error("Shopify is not available on this page.");
    const context = await window.ChromValeShopifyReady;
    await initializeProductPage(context);
    await initializeCartPage(context);
    await initializeCheckoutForward(context);
  };
  initialize().catch((error) => setPageError(errorMessage(error)));
})();
