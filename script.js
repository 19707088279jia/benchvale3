/* Benchvale Scientific — shared navigation, catalogue, and static RFQ behavior */

// Accessible disclosure navigation. Links navigate; buttons only expand menus.
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
if (navToggle && primaryNav) {
  const desktop = window.matchMedia("(min-width: 1280px)");
  const items = [...primaryNav.querySelectorAll(".category-nav-item")];
  const setOpen = (item, open) => {
    const button = item.querySelector(".category-disclosure");
    const panel = item.querySelector(".mega-menu");
    if (!button || !panel) return;
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    item.classList.toggle("is-open", open);
  };
  const closeAll = () => items.forEach(item => setOpen(item, false));
  const openOnly = (item) => { closeAll(); setOpen(item, true); };
  navToggle.addEventListener("click", () => {
    const open = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    if (!open) closeAll();
  });
  items.forEach(item => {
    const button = item.querySelector(".category-disclosure");
    let pointerOpen = null;
    button?.addEventListener("pointerdown", () => { pointerOpen = button.getAttribute("aria-expanded") !== "true"; });
    button?.addEventListener("click", event => {
      const open = event.detail && pointerOpen !== null ? pointerOpen : button.getAttribute("aria-expanded") !== "true";
      pointerOpen = null;
      closeAll(); setOpen(item, open);
    });
    item.addEventListener("pointerenter", event => {
      if (desktop.matches && event.pointerType === "mouse") openOnly(item);
    });
    item.addEventListener("pointerleave", () => {
      if (desktop.matches && !item.contains(document.activeElement)) setOpen(item, false);
    });
    item.addEventListener("focusin", event => {
      if (desktop.matches && !item.contains(event.relatedTarget)) openOnly(item);
    });
    item.addEventListener("focusout", event => {
      if (desktop.matches && !item.contains(event.relatedTarget)) setOpen(item, false);
    });
  });
  primaryNav.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const item = event.target.closest(".category-nav-item");
    if (item?.querySelector('.category-disclosure[aria-expanded="true"]')) {
      item.querySelector(".category-disclosure").focus();
      closeAll();
    } else {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
    event.preventDefault();
  });
  document.addEventListener("pointerdown", event => {
    if (!event.target.closest(".category-header")) {
      closeAll(); primaryNav.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false");
    }
  });
  desktop.addEventListener("change", () => {
    closeAll(); primaryNav.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false");
  });
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

// A small local quote list lets visitors carry products into the multi-product RFQ form.
const quoteStorageKey = "benchvaleQuoteProducts";
const readQuoteProducts = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(quoteStorageKey) || "[]");
    return Array.isArray(stored) ? stored.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
};
const updateQuoteCount = () => {
  const count = readQuoteProducts().length;
  document.querySelectorAll('[data-quote-count]').forEach(el => { el.textContent = count; });
};
updateQuoteCount();
window.addEventListener('storage', event => { if (event.key === quoteStorageKey || event.key === null) updateQuoteCount(); });
const writeQuoteProducts = (products) => {
  try {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify(products));
  } catch {
    // The direct quote link still works if browser storage is unavailable.
  }
  updateQuoteCount();
};

document.querySelectorAll("[data-add-to-quote]").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.productName?.trim();
    if (!productName) return;
    const products = readQuoteProducts();
    if (!products.includes(productName)) {
      products.push(productName);
      writeQuoteProducts(products);
    }
    button.textContent = "Added to Quote";
    button.classList.add("is-added");
    const feedback = document.querySelector("[data-quote-feedback]");
    if (feedback) feedback.innerHTML = `Added to your quote list. <a href="../quote.html">Review quote request</a>.`;
  });
});

// Request for Quote form -> structured mailto composition (static site; no backend)
const quoteForm = document.getElementById("quoteForm");

if (quoteForm) {
  const productList = document.getElementById("productRequestList");
  const addProductButton = document.getElementById("addProductItem");

  const refreshProductRows = () => {
    const rows = Array.from(quoteForm.querySelectorAll("[data-product-row]"));

    rows.forEach((row, index) => {
      const itemNumber = index + 1;
      const productInput = row.querySelector('input[name="product[]"]');
      const quantityInput = row.querySelector('input[name="productQuantity[]"]');
      const productLabel = row.querySelector(".product-request-input label");
      const quantityLabel = row.querySelector(".product-request-quantity label");
      const removeButton = row.querySelector("[data-remove-product]");

      if (productInput) {
        productInput.id = `product-${itemNumber}`;
      }
      if (quantityInput) {
        quantityInput.id = `product-quantity-${itemNumber}`;
      }
      if (productLabel) {
        productLabel.setAttribute("for", `product-${itemNumber}`);
      }
      if (quantityLabel) {
        quantityLabel.setAttribute("for", `product-quantity-${itemNumber}`);
      }
      if (removeButton) {
        removeButton.hidden = rows.length === 1;
        removeButton.setAttribute("aria-label", `Remove product ${itemNumber}`);
      }
    });
  };

  const createProductRow = () => {
    const row = document.createElement("div");
    row.className = "product-request-row";
    row.setAttribute("data-product-row", "");
    row.innerHTML = `
      <div class="product-request-input">
        <label>Product <span class="required-mark" aria-hidden="true">*</span></label>
        <input name="product[]" type="text" required />
      </div>
      <div class="product-request-quantity">
        <label>Quantity <span class="required-mark" aria-hidden="true">*</span></label>
        <input name="productQuantity[]" type="text" placeholder="e.g., 2 cases" required />
      </div>
      <div class="product-request-actions">
        <button type="button" class="product-remove-button" data-remove-product>Remove</button>
      </div>
    `;
    return row;
  };

  if (productList && addProductButton) {
    // Give the first row the same remove control used by any additional rows.
    const firstRow = productList.querySelector("[data-product-row]");
    if (firstRow && !firstRow.querySelector("[data-remove-product]")) {
      const actions = document.createElement("div");
      actions.className = "product-request-actions";
      actions.innerHTML = '<button type="button" class="product-remove-button" data-remove-product hidden>Remove</button>';
      firstRow.appendChild(actions);
    }

    addProductButton.addEventListener("click", () => {
      const row = createProductRow();
      productList.appendChild(row);
      refreshProductRows();
      row.querySelector('input[name="product[]"]')?.focus();
    });

    productList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-product]");
      if (!removeButton) return;

      const rows = quoteForm.querySelectorAll("[data-product-row]");
      if (rows.length <= 1) return;

      removeButton.closest("[data-product-row]")?.remove();
      refreshProductRows();
    });

    refreshProductRows();
  }

  // Pre-fill requested and locally saved products without requiring a server-side cart.
  const params = new URLSearchParams(window.location.search);
  const requestedProduct = params.get("product") || params.get("equipment");
  const requestedProducts = [...new Set([requestedProduct, ...readQuoteProducts()].filter(Boolean))];
  const firstProductField = quoteForm.querySelector('input[name="product[]"]');
  if (requestedProducts.length && productList && firstProductField) {
    firstProductField.value = requestedProducts[0];
    requestedProducts.slice(1).forEach((productName) => {
      const row = createProductRow();
      const productInput = row.querySelector('input[name="product[]"]');
      if (productInput) productInput.value = productName;
      productList.appendChild(row);
    });
    refreshProductRows();
  }

  const documentationRequest = params.get("request") === "documentation";
  const notesField = quoteForm.querySelector('[name="notes"]');
  if (documentationRequest && notesField && !notesField.value) {
    notesField.value = "Please include the applicable manufacturer documentation / datasheet with the quotation.";
  }

  const clearQuoteButton = document.getElementById("clearQuoteProducts");
  if (clearQuoteButton) {
    clearQuoteButton.hidden = requestedProducts.length === 0;
    clearQuoteButton.addEventListener("click", () => {
      writeQuoteProducts([]);
      const rows = Array.from(quoteForm.querySelectorAll("[data-product-row]"));
      rows.slice(1).forEach((row) => row.remove());
      const remainingProduct = quoteForm.querySelector('input[name="product[]"]');
      const remainingQuantity = quoteForm.querySelector('input[name="productQuantity[]"]');
      if (remainingProduct) remainingProduct.value = "";
      if (remainingQuantity) remainingQuantity.value = "";
      refreshProductRows();
      clearQuoteButton.hidden = true;
      remainingProduct?.focus();
    });
  }

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const get = (field) => (data.get(field) || "").toString().trim();

    const name = get("name");
    const organization = get("organization");
    const email = get("email");
    const phone = get("phone");
    const postalCode = get("postalCode");
    const requiredDate = get("requiredDate");
    const notes = get("notes");

    const productItems = Array.from(quoteForm.querySelectorAll("[data-product-row]")).map((row) => ({
      product: (row.querySelector('input[name="product[]"]')?.value || "").trim(),
      quantity: (row.querySelector('input[name="productQuantity[]"]')?.value || "").trim(),
    }));

    const invalidItem = productItems.find((item) => !item.product || !item.quantity);
    if (!postalCode || !requiredDate || invalidItem) {
      quoteForm.reportValidity();
      return;
    }

    const subjectProduct = productItems.length === 1
      ? productItems[0].product
      : "Multiple Laboratory Products";
    const subject = `Request for Quote — ${subjectProduct || "Laboratory Products"}`;

    const productLines = productItems.flatMap((item, index) => [
      `Product ${index + 1}: ${item.product}`,
      `Quantity ${index + 1}: ${item.quantity}`,
    ]);

    const bodyLines = [
      "REQUEST FOR QUOTE",
      "",
      `Name: ${name}`,
      `Organization: ${organization}`,
      `Business email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Postal code: ${postalCode}`,
      `Required date: ${requiredDate}`,
      "",
      "PRODUCTS REQUESTED",
      ...productLines,
      "",
      "NOTES / SPECIFICATIONS",
      notes || "None provided",
    ];

    const mailto = `mailto:quotes@benchvalescientific.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

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

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    stage.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

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
    if (slides.length > 1) {
      timer = window.setInterval(() => show(current + 1), 5000);
    }
  };

  const goNext = () => { show(current + 1); start(); };
  const goPrev = () => { show(current - 1); start(); };

  prev?.addEventListener('click', goPrev);
  next?.addEventListener('click', goNext);
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));

  // Keep autoplay running even when the mouse rests over the banner.
  // Pause only while the tab is hidden, then resume when the user returns.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

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
