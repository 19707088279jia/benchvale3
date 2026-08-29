/* Benchvale Scientific — shared site behavior (mobile nav, reveal animation, RFQ form) */

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
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

  // Pre-fill the first product when arriving from a product or legacy equipment link.
  const params = new URLSearchParams(window.location.search);
  const requestedProduct = params.get("product") || params.get("equipment");
  const firstProductField = quoteForm.querySelector('input[name="product[]"]');
  if (requestedProduct && firstProductField && !firstProductField.value) {
    firstProductField.value = requestedProduct;
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
