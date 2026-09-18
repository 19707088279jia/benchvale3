/* ChromVale Scientific — shared navigation, catalogue, and static RFQ behavior */

document.querySelectorAll(".brand-sub, .site-footer p").forEach((element) => {
  if (element.textContent.trim() === "Laboratory Products & Equipment") element.textContent = "HPLC Columns for Canadian Laboratories";
  if (element.textContent.trim() === "Ontario, Canada") element.textContent = "Waterloo, Ontario, Canada";
});
const sharedScriptUrl = new URL(document.currentScript?.src || "script.js", window.location.href);
const brandLogoUrl = new URL("images/chromvale-scientific-logo.svg", sharedScriptUrl).href;

// The purchase Cart is backed by Shopify and remains separate from Quote Cart.
const shopifyCartStorageKey = "chromvaleShopifyCartId";
const updateDirectCartCount = (cart = null) => {
  const count = Number.isInteger(Number(cart?.totalQuantity)) ? Number(cart.totalQuantity) : 0;
  document.querySelectorAll("[data-direct-cart-count]").forEach((element) => { element.textContent = `(${count})`; });
};
document.querySelectorAll(".header-quote-actions").forEach((actions) => {
  let cartLink = actions.querySelector(".header-direct-cart");
  if (!cartLink) {
    cartLink = document.createElement("a");
    cartLink.className = "header-direct-cart";
    cartLink.href = new URL("cart.html", sharedScriptUrl).href;
    cartLink.setAttribute("aria-label", "Direct purchase Cart");
    cartLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.2h10.9l2-7.2H6M9 20a1.5 1.5 0 1 0 0 .1M17 20a1.5 1.5 0 1 0 0 .1"/></svg><span>Cart <span data-direct-cart-count aria-live="polite" aria-atomic="true">(0)</span></span>';
    actions.prepend(cartLink);
  }

  if (!actions.querySelector(".header-account")) {
    const accountLink = document.createElement("a");
    accountLink.className = "header-account";
    accountLink.href = "https://shopify.com/99189686345/account";
    accountLink.setAttribute("aria-label", "ChromVale customer account");
    accountLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6"/></svg><span>Account<span class="header-account-signin"> / Sign In</span></span>';
    actions.insertBefore(accountLink, cartLink);
  }
});

const loadSharedScript = (url) => new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = url;
  script.async = false;
  script.addEventListener("load", resolve, { once: true });
  script.addEventListener("error", () => reject(new Error(`Unable to load ${url}`)), { once: true });
  document.head.appendChild(script);
});
const initializeShopify = async () => {
  if (!window.CHROMVALE_SHOPIFY_CONFIG) await loadSharedScript(new URL("shopify-config.js", sharedScriptUrl).href);
  if (!window.ChromValeShopify) await loadSharedScript(new URL("shopify-storefront.js", sharedScriptUrl).href);
  const client = window.ChromValeShopify.createStorefrontClient(window.CHROMVALE_SHOPIFY_CONFIG);
  const cartStore = window.ChromValeShopify.createCartStore(client);
  const cart = await cartStore.restore();
  return Object.freeze({ client, cartStore, cart });
};
window.ChromValeShopifyReady = initializeShopify();
window.ChromValeShopifyReady.then(({ cart }) => updateDirectCartCount(cart), () => updateDirectCartCount());
window.addEventListener("chromvale:shopify-cart-updated", (event) => updateDirectCartCount(event.detail?.cart));
window.addEventListener("storage", (event) => {
  if (event.key !== shopifyCartStorageKey && event.key !== null) return;
  window.ChromValeShopifyReady.then(({ cartStore }) => cartStore.restore({ force: true }).then(updateDirectCartCount, () => updateDirectCartCount()));
});

document.querySelectorAll("a.brand").forEach((brand) => {
  const logo = document.createElement("img");
  logo.className = "brand-logo";
  logo.src = brandLogoUrl;
  logo.alt = "ChromVale Scientific";
  brand.replaceChildren(logo);
});
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  link.href = link.href.replaceAll("benchvalescientific.com", "chromvale.com");
  link.textContent = link.textContent.replaceAll("benchvalescientific.com", "chromvale.com");
});
const publicNavigation = [
  ["HPLC Columns", "products.html"],
  ["Services", "services.html"],
  ["About", "about.html"],
  ["Contact", "contact.html"],
  ["Terms of Sale", "terms-of-sale.html"],
];
document.querySelectorAll(".category-nav-list").forEach((list) => {
  const currentLabels = new Set(Array.from(list.querySelectorAll('a[aria-current="page"]'), (link) => link.textContent.trim()));
  list.innerHTML = publicNavigation.map(([label, href]) => {
    const pageName = window.location.pathname.split("/").filter(Boolean).at(-1) || "index.html";
    const inProducts = label === "HPLC Columns" && (pageName === "products.html" || window.location.pathname.includes("/products/"));
    const inServices = label === "Services" && ["services.html", "product-sourcing.html", "documentation-support.html", "shipping-returns.html", "quality-qc.html"].includes(pageName);
    const isCurrent = currentLabels.has(label) || pageName === href || inProducts || inServices;
    const current = isCurrent ? ' aria-current="page"' : "";
    return `<li class="category-nav-item"><div class="category-nav-label"><a href="${new URL(href, sharedScriptUrl).href}"${current}>${label}</a></div></li>`;
  }).join("");
});
document.querySelectorAll(".category-search").forEach((search) => {
  search.querySelector("input")?.setAttribute("placeholder", "Search HPLC columns...");
  search.querySelector("label")?.replaceChildren("Search HPLC columns");
});
document.querySelectorAll(".site-footer .footer-heading").forEach((heading) => {
  if (heading.textContent.trim() !== "Navigate") return;
  const list = heading.parentElement?.querySelector("ul");
  if (list) list.innerHTML = [
    ["HPLC Columns", "products.html"],
    ["Services", "services.html"],
    ["About", "about.html"],
    ["Contact", "contact.html"],
    ["Terms of Sale", "terms-of-sale.html"],
    ["Privacy", "privacy.html"],
  ].map(([label, href]) => `<li><a href="${new URL(href, sharedScriptUrl).href}">${label}</a></li>`).join("");
});
document.querySelectorAll('.site-footer .footer-bottom a[href$="terms.html"]').forEach((link) => {
  link.href = new URL("terms-of-sale.html", sharedScriptUrl).href;
  link.textContent = "Terms of Sale";
});
document.querySelectorAll(".header-quote").forEach((button) => {
  const count = button.parentElement?.querySelector("[data-quote-count]");
  if (count) button.append(" ", count);
});

// Accessible mobile navigation. Desktop links remain visible without JavaScript.
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
if (navToggle && primaryNav) {
  const closeNavigation = (returnFocus = false) => {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) navToggle.focus();
  };

  navToggle.addEventListener("click", () => {
    const open = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  primaryNav.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    closeNavigation(true);
    event.preventDefault();
  });

  document.addEventListener("pointerdown", event => {
    if (!event.target.closest(".category-header")) closeNavigation();
  });

  window.matchMedia("(min-width: 1280px)").addEventListener("change", () => closeNavigation());
}

// Subtle reveal-on-scroll
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Search and category filters enhance the catalogue; all products remain visible without JavaScript.
(() => {
  const searchInput = document.getElementById("productSearch");
  const cards = Array.from(document.querySelectorAll("[data-product-card]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-product-filter]"));
  const categoryLinks = Array.from(document.querySelectorAll("[data-category-link]"));
  const status = document.getElementById("productSearchStatus");
  const empty = document.getElementById("catalogueEmpty");
  if (!searchInput || !cards.length) return;

  let activeCategory = "all";

  const applyFilters = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("en-CA");
    let visibleCount = 0;

    cards.forEach((card) => {
      const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
      const searchMatch = !query || (card.dataset.search || "").includes(query);
      const visible = categoryMatch && searchMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (status) status.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "product" : "products"}`;
    if (empty) empty.hidden = visibleCount !== 0;
  };

  const selectCategory = (category) => {
    activeCategory = category;
    filterButtons.forEach((button) => {
      const selected = button.dataset.productFilter === category;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    applyFilters();
  };

  searchInput.addEventListener("input", applyFilters);
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    selectCategory(button.dataset.productFilter || "all");
  }));
  categoryLinks.forEach((link) => link.addEventListener("click", () => {
    selectCategory(link.dataset.categoryLink || "all");
  }));

  // The homepage search is a native GET form, so shared search links work on GitHub Pages.
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("search");
  const requestedCategory = params.get("filter");
  const initialCategory = filterButtons.some(button => button.dataset.productFilter === requestedCategory) ? requestedCategory : "all";
  if (initialQuery !== null) searchInput.value = initialQuery;
  selectCategory(initialCategory);

  // Bring visitors from a search link directly to their results, past the category overview.
  if ((initialQuery?.trim() || requestedCategory) && !window.location.hash) {
    searchInput.focus({ preventScroll: true });
    const catalogue = document.getElementById("catalogue");
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
    if (catalogue) {
      window.scrollTo({
        top: catalogue.getBoundingClientRect().top + window.scrollY - headerHeight,
        behavior: "instant",
      });
    }
  }
})();

// Products-directory search. Supports family names, chemistry copy, and confirmed catalogue Part Nos.
(() => {
  const directory = document.querySelector(".hplc-directory-page #families");
  if (!directory) return;
  const cards = Array.from(directory.querySelectorAll(".featured-family-card, .phase-family-card"));
  if (!cards.length) return;
  const query = new URLSearchParams(window.location.search).get("search")?.trim() || "";
  document.querySelectorAll('.category-search input[name="search"]').forEach((input) => { input.value = query; });
  const normalizedQuery = query.toLocaleLowerCase("en-CA");
  let skuFamilySlug = "";
  if (normalizedQuery) {
    for (const [slug, family] of Object.entries(window.CHROMVALE_COLUMN_FAMILIES || {})) {
      if ((family.configurations || []).some(({ partNo }) => String(partNo).toLocaleLowerCase("en-CA").includes(normalizedQuery))) {
        skuFamilySlug = slug;
        break;
      }
    }
  }
  let visibleCount = 0;
  for (const card of cards) {
    const href = card.getAttribute("href") || "";
    const matchesSku = skuFamilySlug && href.includes(`category=${encodeURIComponent(skuFamilySlug)}`);
    const matchesText = !normalizedQuery || card.textContent.toLocaleLowerCase("en-CA").includes(normalizedQuery);
    card.hidden = Boolean(normalizedQuery) && !matchesSku && !matchesText;
    if (!card.hidden) visibleCount += 1;
  }
  if (!normalizedQuery) return;
  const status = document.createElement("p");
  status.className = "product-directory-search-status";
  status.setAttribute("role", "status");
  status.textContent = visibleCount
    ? `Showing ${visibleCount} ${visibleCount === 1 ? "column family" : "column families"} for “${query}”.`
    : `No column family matched “${query}”. Contact ChromVale for application-based selection support.`;
  directory.querySelector(".products-category-heading")?.insertAdjacentElement("afterend", status);
})();

// Quote Cart persistence. Confirmed family configurations are the only built-in catalogue source.
const quoteStorageKey = "chromvaleQuoteProducts";
const quoteCatalogProducts = Object.entries(window.CHROMVALE_COLUMN_FAMILIES || {}).flatMap(([familySlug, family]) =>
  (family.configurations || []).map((configuration, index) => ({
    id: `catalogue-${familySlug}-${configuration.partNo}-${index + 1}`,
    name: family.productName,
    specification: `${configuration.columnType} Column · ${configuration.particleSize} · ${configuration.columnId} I.D. × ${configuration.columnLength}`,
    sku: configuration.partNo,
    columnType: configuration.columnType,
    particleSize: configuration.particleSize,
    columnSize: `${configuration.columnId} I.D. × ${configuration.columnLength}`,
    needsConfirmation: Boolean(configuration.needsConfirmation),
    unitPrice: null,
  }))
);
const quoteItemId = (name) => `catalogue-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const normalizeQuoteItem = (item) => {
  const source = typeof item === "string" ? { name: item } : item;
  if (!source || typeof source !== "object") return null;
  const matchedCatalog = quoteCatalogProducts.find((product) => product.id === source.id || (source.sku && product.sku === source.sku));
  const name = String(source.name || matchedCatalog?.name || "").trim();
  if (!name) return null;
  const parsedQuantity = Number(source.quantity);
  return {
    id: String(source.id || matchedCatalog?.id || quoteItemId(name)),
    name,
    specification: String(source.specification || matchedCatalog?.specification || "Specification to be confirmed"),
    unitPrice: null,
    quantity: Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
    sku: String(source.sku || matchedCatalog?.sku || ""),
    columnType: String(source.columnType || matchedCatalog?.columnType || ""),
    particleSize: String(source.particleSize || matchedCatalog?.particleSize || ""),
    columnSize: String(source.columnSize || matchedCatalog?.columnSize || ""),
    needsConfirmation: Boolean(source.needsConfirmation || matchedCatalog?.needsConfirmation),
    isDemo: false,
  };
};
const normalizeQuoteItems = (items) => {
  const normalized = [];
  for (const source of Array.isArray(items) ? items : []) {
    const item = normalizeQuoteItem(source);
    if (!item) continue;
    const existing = normalized.find((candidate) => candidate.id === item.id || candidate.name.toLowerCase() === item.name.toLowerCase());
    if (existing) existing.quantity += item.quantity;
    else normalized.push(item);
  }
  return normalized;
};
const readQuoteProducts = () => {
  try {
    const storedItems = JSON.parse(window.localStorage.getItem(quoteStorageKey) || "[]");
    const withoutLegacyPlaceholders = Array.isArray(storedItems)
      ? storedItems.filter((item) => !item?.isDemo && !String(item?.sku || "").toUpperCase().startsWith(`CV-${"DEMO"}-`))
      : [];
    return normalizeQuoteItems(withoutLegacyPlaceholders);
  } catch {
    return [];
  }
};
const updateQuoteCount = () => {
  const count = readQuoteProducts().length;
  document.querySelectorAll("[data-quote-count]").forEach((element) => { element.textContent = `(${count})`; });
};
const writeQuoteProducts = (products) => {
  const normalized = normalizeQuoteItems(products);
  try {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify(normalized));
  } catch {
    // The direct quote link still works if browser storage is unavailable.
  }
  updateQuoteCount();
  return normalized;
};
updateQuoteCount();
window.addEventListener("storage", (event) => {
  if (event.key === quoteStorageKey || event.key === null) updateQuoteCount();
});

document.querySelectorAll("[data-add-to-quote]").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.productName?.trim();
    if (!productName) return;
    const products = readQuoteProducts();
    if (!products.some((product) => product.name.toLowerCase() === productName.toLowerCase())) {
      products.push(normalizeQuoteItem(productName));
      writeQuoteProducts(products);
    }
    button.textContent = "Added to Quote";
    button.classList.add("is-added");
    const feedback = document.querySelector("[data-quote-feedback]");
    if (feedback) feedback.innerHTML = `Added to your quote list. <a href="../quote.html">Review quote request</a>.`;
  });
});

// Request for Quote form -> selectable cart plus structured mailto composition.
const quoteForm = document.getElementById("quoteForm");

if (quoteForm) {
  const productList = document.getElementById("productRequestList");
  const addProductButton = document.getElementById("addProductItem");
  const clearQuoteButton = document.getElementById("clearQuoteProducts");
  const emptyCart = document.getElementById("quoteCartEmpty");
  const tableWrap = document.getElementById("quoteCartTableWrap");
  const selectionError = document.getElementById("productSelectionError");
  const picker = document.getElementById("productPicker");
  const pickerSearch = document.getElementById("productPickerSearch");
  const pickerList = document.getElementById("productPickerList");
  const pickerStatus = document.getElementById("productPickerStatus");
  const closePickerButton = document.getElementById("closeProductPicker");
  const escapeQuoteHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const renderCart = () => {
    const products = readQuoteProducts();
    productList.innerHTML = products.map((product, index) => {
      const inputId = `product-quantity-${index + 1}`;
      const meta = [product.sku && `Part No. ${product.sku}`, product.needsConfirmation ? "Catalogue reference requires confirmation" : ""].filter(Boolean).join(" · ");
      return `<tr data-product-row data-product-id="${escapeQuoteHtml(product.id)}" data-product-sku="${escapeQuoteHtml(product.sku)}">
        <td data-label="Product"><strong class="quote-product-name">${escapeQuoteHtml(product.name)}</strong>${meta ? `<span class="quote-product-meta">${escapeQuoteHtml(meta)}</span>` : ""}<input name="product[]" type="hidden" value="${escapeQuoteHtml([product.name, product.specification, product.sku && `Part No. ${product.sku}`].filter(Boolean).join(" — "))}" /></td>
        <td data-label="Specification"><span class="quote-product-specification">${escapeQuoteHtml(product.specification)}</span></td>
        <td data-label="Quantity"><label class="nav-sr-only" for="${inputId}">Quantity for ${escapeQuoteHtml(product.name)}</label><input class="quote-quantity-input" id="${inputId}" name="productQuantity[]" data-quote-quantity type="number" min="1" step="1" inputmode="numeric" value="${product.quantity}" required /></td>
        <td data-label="Remove"><button type="button" class="product-remove-button" data-remove-product aria-label="Remove ${escapeQuoteHtml(product.name)}">Remove</button></td>
      </tr>`;
    }).join("");
    const hasProducts = products.length > 0;
    emptyCart.hidden = hasProducts;
    tableWrap.hidden = !hasProducts;
    clearQuoteButton.hidden = !hasProducts;
  };

  const renderPicker = (query = "") => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = quoteCatalogProducts.filter((product) => {
      const searchable = [product.name, product.specification, product.columnType, product.columnSize, product.particleSize, product.sku].join(" ").toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
    pickerStatus.textContent = `${matches.length} confirmed ${matches.length === 1 ? "configuration" : "configurations"} found`;
    pickerList.innerHTML = matches.length ? matches.map((product) => `<li><button type="button" class="product-picker-option" data-select-catalogue-product="${escapeQuoteHtml(product.id)}"><span class="product-picker-option-name">${escapeQuoteHtml(product.name)}</span><span class="product-picker-option-spec">${escapeQuoteHtml(product.specification)}</span><span class="product-picker-option-meta">Part No. ${escapeQuoteHtml(product.sku)}${product.needsConfirmation ? " · Requires catalogue confirmation" : ""}</span></button></li>`).join("") : '<li class="product-picker-empty">No confirmed catalogue configuration matches that search. Add details in the notes field for a custom request.</li>';
  };

  addProductButton.addEventListener("click", () => {
    pickerSearch.value = "";
    renderPicker();
    picker.showModal();
    pickerSearch.focus();
  });
  closePickerButton.addEventListener("click", () => picker.close());
  picker.addEventListener("click", (event) => {
    if (event.target === picker) picker.close();
    const option = event.target.closest("[data-select-catalogue-product]");
    if (!option) return;
    const selected = quoteCatalogProducts.find((product) => product.id === option.dataset.selectCatalogueProduct);
    if (!selected) return;
    const products = readQuoteProducts();
    const existing = products.find((product) => product.id === selected.id);
    if (existing) existing.quantity += 1;
    else products.push(normalizeQuoteItem(selected));
    writeQuoteProducts(products);
    selectionError.hidden = true;
    renderCart();
    picker.close();
    addProductButton.focus();
  });
  pickerSearch.addEventListener("input", () => renderPicker(pickerSearch.value));

  productList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-quote-quantity]");
    if (!input) return;
    const validQuantity = /^[1-9]\d*$/.test(input.value);
    input.setCustomValidity(validQuantity ? "" : "Enter a positive whole number.");
    if (!validQuantity) return;
    const productId = input.closest("[data-product-row]").dataset.productId;
    const products = readQuoteProducts();
    const product = products.find((item) => item.id === productId);
    if (product) {
      product.quantity = Number(input.value);
      writeQuoteProducts(products);
    }
  });

  productList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-product]");
    if (!removeButton) return;
    const productId = removeButton.closest("[data-product-row]").dataset.productId;
    writeQuoteProducts(readQuoteProducts().filter((product) => product.id !== productId));
    renderCart();
    addProductButton.focus();
  });

  clearQuoteButton.addEventListener("click", () => {
    writeQuoteProducts([]);
    renderCart();
    addProductButton.focus();
  });

  // Pre-fill product/equipment query links and migrate legacy string storage.
  const params = new URLSearchParams(window.location.search);
  const requestedProduct = (params.get("product") || params.get("equipment") || "").trim();
  const requestedPartNo = (params.get("partNo") || "").trim();
  const requestedType = (params.get("type") || "").trim();
  const requestedParticleSize = (params.get("particleSize") || "").trim();
  const requestedColumnSize = (params.get("columnSize") || "").trim();
  const initialProducts = readQuoteProducts();
  if (requestedProduct || requestedPartNo) {
    const matchingCatalog = quoteCatalogProducts.find((product) => product.sku.toLowerCase() === requestedPartNo.toLowerCase());
    const requestedItem = matchingCatalog || {
      name: requestedProduct || "HPLC column configuration",
      specification: [requestedType && `${requestedType} Column`, requestedParticleSize, requestedColumnSize].filter(Boolean).join(" · ") || "Specification to be confirmed",
      sku: requestedPartNo,
      columnType: requestedType,
      particleSize: requestedParticleSize,
      columnSize: requestedColumnSize,
    };
    const normalizedRequestedItem = normalizeQuoteItem(requestedItem);
    if (normalizedRequestedItem && !initialProducts.some((product) =>
      (normalizedRequestedItem.sku && product.sku.toLowerCase() === normalizedRequestedItem.sku.toLowerCase())
      || (!normalizedRequestedItem.sku && product.name.toLowerCase() === normalizedRequestedItem.name.toLowerCase())
    )) initialProducts.push(normalizedRequestedItem);
  }
  writeQuoteProducts(initialProducts);
  renderCart();

  const notesField = params.get("request") === "documentation" && quoteForm.querySelector('[name="notes"]');
  if (notesField && !notesField.value) {
    notesField.value = "Please include the applicable manufacturer documentation / datasheet with the quotation.";
  }

  window.addEventListener("storage", (event) => {
    if (event.key === quoteStorageKey || event.key === null) renderCart();
  });

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const productItems = Array.from(productList.querySelectorAll("[data-product-row]")).map((row) => ({
      product: row.querySelector('input[name="product[]"]')?.value || "",
      specification: row.querySelector(".quote-product-specification")?.textContent || "",
      sku: row.dataset.productSku || "",
      quantity: row.querySelector("[data-quote-quantity]")?.value || "",
    }));
    if (!productItems.length) {
      selectionError.hidden = false;
      addProductButton.focus();
      return;
    }
    selectionError.hidden = true;
    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    const data = new FormData(quoteForm);
    const get = (field) => (data.get(field) || "").toString().trim();
    const subjectProduct = productItems.length === 1 ? productItems[0].product : "Multiple HPLC Columns";
    const productLines = productItems.flatMap((item, index) => [
      `Product ${index + 1}: ${item.product}`,
      `Specification ${index + 1}: ${item.specification}`,
      `Part No. ${index + 1}: ${item.sku || "To be confirmed"}`,
      `Quantity ${index + 1}: ${item.quantity}`,
    ]);
    const bodyLines = [
      "REQUEST FOR QUOTE",
      "",
      `Name: ${get("name")}`,
      `Organization: ${get("organization")}`,
      `Business email: ${get("email")}`,
      `Phone: ${get("phone") || "Not provided"}`,
      `Postal code: ${get("postalCode")}`,
      `Required date: ${get("requiredDate")}`,
      `Business purchase confirmation: ${get("businessPurchase")}`,
      "",
      "PRODUCTS REQUESTED",
      ...productLines,
      "",
      "NOTES / SPECIFICATIONS",
      get("notes") || "None provided",
    ];
    const mailto = `mailto:quotes@chromvale.com?subject=${encodeURIComponent(`Request for Quote — ${subjectProduct}`)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
  });
}

// Homepage featured banner slider — auto-advances and slides horizontally
(() => {
  const slider = document.querySelector('.home-slider');
  if (!slider || slider.dataset.initialized === 'true') return;
  slider.dataset.initialized = 'true';

  const stage = slider.querySelector('.home-slider-stage');
  const slides = Array.from(slider.querySelectorAll('.home-slide'));
  const dots = Array.from(slider.querySelectorAll('.home-slider-dots button'));
  const prev = slider.querySelector('.home-slider-prev');
  const next = slider.querySelector('.home-slider-next');
  if (!stage || !slides.length) return;

  let current = 0;
  let timer = null;
  let touchStartX = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    stage.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((control) => {
        if (!Object.hasOwn(control.dataset, 'sliderTabindex')) {
          control.dataset.sliderTabindex = control.hasAttribute('tabindex') ? control.getAttribute('tabindex') : 'none';
        }
        if (!active) control.setAttribute('tabindex', '-1');
        else if (control.dataset.sliderTabindex === 'none') control.removeAttribute('tabindex');
        else control.setAttribute('tabindex', control.dataset.sliderTabindex);
      });
    });

    slider.classList.toggle('is-light-slide', slides[current].classList.contains('home-slide--light'));

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (slides.length > 1 && !reduceMotion.matches) {
      timer = window.setInterval(() => show(current + 1), 5000);
    }
  };

  const goNext = () => { show(current + 1); start(); };
  const goPrev = () => { show(current - 1); start(); };

  prev?.addEventListener('click', goPrev);
  next?.addEventListener('click', goNext);
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));

  // Keep calls to action stable while the user points at or tabs through them.
  slider.addEventListener('pointerenter', stop);
  slider.addEventListener('pointerleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', (event) => {
    if (!slider.contains(event.relatedTarget)) start();
  });

  // Pause while the tab is hidden, then resume when the user returns.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  reduceMotion.addEventListener?.('change', start);

  // Basic touch swipe on phones/tablets.
  slider.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });

  slider.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) goNext(); else goPrev();
  }, { passive: true });

  show(0);
  start();
})();
