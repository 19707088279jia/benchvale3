/* Benchvale Scientific — shared site behavior (mobile nav, reveal animation, quote form) */

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

// Quote request form -> structured mailto composition (no backend available)
const quoteForm = document.getElementById("quoteForm");

if (quoteForm) {
  const equipmentList = document.getElementById("equipmentRequestList");
  const addEquipmentButton = document.getElementById("addEquipmentItem");

  const refreshEquipmentRows = () => {
    const rows = Array.from(quoteForm.querySelectorAll("[data-equipment-row]"));

    rows.forEach((row, index) => {
      const itemNumber = index + 1;
      const equipmentInput = row.querySelector('input[name="equipment[]"]');
      const quantityInput = row.querySelector('input[name="equipmentQuantity[]"]');
      const equipmentLabel = row.querySelector(".equipment-request-input label");
      const quantityLabel = row.querySelector(".equipment-request-quantity label");
      const removeButton = row.querySelector("[data-remove-equipment]");

      if (equipmentInput) {
        equipmentInput.id = `equipment-${itemNumber}`;
      }
      if (quantityInput) {
        quantityInput.id = `equipment-quantity-${itemNumber}`;
      }
      if (equipmentLabel) {
        equipmentLabel.setAttribute("for", `equipment-${itemNumber}`);
      }
      if (quantityLabel) {
        quantityLabel.setAttribute("for", `equipment-quantity-${itemNumber}`);
      }
      if (removeButton) {
        removeButton.hidden = rows.length === 1;
        removeButton.setAttribute("aria-label", `Remove equipment item ${itemNumber}`);
      }
    });
  };

  const createEquipmentRow = () => {
    const row = document.createElement("div");
    row.className = "equipment-request-row";
    row.setAttribute("data-equipment-row", "");
    row.innerHTML = `
      <div class="equipment-request-input">
        <label>Equipment / instrument <span class="required-mark" aria-hidden="true">*</span></label>
        <input name="equipment[]" type="text" required />
      </div>
      <div class="equipment-request-quantity">
        <label>Quantity <span class="required-mark" aria-hidden="true">*</span></label>
        <input name="equipmentQuantity[]" type="number" min="1" step="1" inputmode="numeric" required />
      </div>
      <div class="equipment-request-actions">
        <button type="button" class="equipment-remove-button" data-remove-equipment>Remove</button>
      </div>
    `;
    return row;
  };

  if (equipmentList && addEquipmentButton) {
    // Give the first row the same remove control used by any additional rows.
    const firstRow = equipmentList.querySelector("[data-equipment-row]");
    if (firstRow && !firstRow.querySelector("[data-remove-equipment]")) {
      const actions = document.createElement("div");
      actions.className = "equipment-request-actions";
      actions.innerHTML = '<button type="button" class="equipment-remove-button" data-remove-equipment hidden>Remove</button>';
      firstRow.appendChild(actions);
    }

    addEquipmentButton.addEventListener("click", () => {
      const row = createEquipmentRow();
      equipmentList.appendChild(row);
      refreshEquipmentRows();
      row.querySelector('input[name="equipment[]"]')?.focus();
    });

    equipmentList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-equipment]");
      if (!removeButton) return;

      const rows = quoteForm.querySelectorAll("[data-equipment-row]");
      if (rows.length <= 1) return;

      removeButton.closest("[data-equipment-row]")?.remove();
      refreshEquipmentRows();
    });

    refreshEquipmentRows();
  }

  // Pre-fill the first equipment item when arriving from an equipment category link.
  const params = new URLSearchParams(window.location.search);
  const requestedEquipment = params.get("equipment");
  const firstEquipmentField = quoteForm.querySelector('input[name="equipment[]"]');
  if (requestedEquipment && firstEquipmentField && !firstEquipmentField.value) {
    firstEquipmentField.value = requestedEquipment;
  }

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const get = (field) => (data.get(field) || "").toString().trim();

    const name = get("name");
    const organization = get("organization");
    const email = get("email");
    const phone = get("phone");
    const province = get("province");
    const deliveryAddress = get("deliveryAddress");
    const application = get("application");
    const specifications = get("specifications");
    const manufacturer = get("manufacturer");
    const budget = get("budget");
    const condition = get("condition");
    const timeline = get("timeline");
    const deliveryDate = get("deliveryDate");
    const coordinatedPurchasing = data.get("coordinatedPurchasing") === "Yes";
    const additional = get("additional");

    const equipmentItems = Array.from(quoteForm.querySelectorAll("[data-equipment-row]")).map((row) => ({
      equipment: (row.querySelector('input[name="equipment[]"]')?.value || "").trim(),
      quantity: (row.querySelector('input[name="equipmentQuantity[]"]')?.value || "").trim(),
    }));

    // Defensive validation in addition to native required/min constraints.
    const invalidItem = equipmentItems.find((item) => !item.equipment || !item.quantity || Number(item.quantity) < 1);
    if (!province || !deliveryAddress || invalidItem) {
      quoteForm.reportValidity();
      return;
    }

    const subjectEquipment = equipmentItems.length === 1
      ? equipmentItems[0].equipment
      : "Multiple Laboratory Equipment Items";
    const subject = `Request for Quote — ${subjectEquipment || "Laboratory Equipment"}`;

    const equipmentLines = equipmentItems.flatMap((item, index) => [
      `Equipment ${index + 1}: ${item.equipment}`,
      `Quantity ${index + 1}: ${item.quantity}`,
    ]);

    const bodyLines = [
      "REQUEST FOR QUOTE",
      "",
      `Name: ${name}`,
      `Organization: ${organization}`,
      `Business email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Province / Territory: ${province}`,
      `Delivery address: ${deliveryAddress}`,
      "",
      "EQUIPMENT REQUESTED",
      ...equipmentLines,
      "",
      `Application / intended use: ${application || "Not provided"}`,
      `Technical specifications: ${specifications || "Not provided"}`,
      `Preferred manufacturer: ${manufacturer || "No preference"}`,
      `Budget range: ${budget || "Not provided"}`,
      `New / refurbished / either: ${condition || "Not specified"}`,
      `Timeline: ${timeline || "Not specified"}`,
      `Preferred delivery date: ${deliveryDate || "Not provided"}`,
      `Open to coordinated purchasing: ${coordinatedPurchasing ? "Yes" : "No"}`,
      "",
      `Additional information: ${additional || "None"}`,
    ];

    const mailto = `mailto:quotes@benchvalescientific.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
  });
}
