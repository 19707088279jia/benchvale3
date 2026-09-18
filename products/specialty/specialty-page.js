/* Family-level Specialty Columns overview. */
(() => {
  "use strict";

  const page = document.querySelector("[data-specialty-page]");
  const grid = document.getElementById("specialtyFamilyGrid");
  const families = Array.isArray(window.CHROMVALE_SPECIALTY_FAMILIES)
    ? window.CHROMVALE_SPECIALTY_FAMILIES
    : [];
  if (!page || !grid) return;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const quoteHref = (family) => {
    const params = new URLSearchParams({
      product: `${family.name} — Source: Specialty Columns`,
      productFamily: family.name,
      source: "Specialty Columns",
    });
    return `../../quote.html?${params.toString()}`;
  };

  grid.innerHTML = families.map((family, index) => `
    <article class="specialty-family-card">
      <div class="specialty-card-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</div>
      <div class="specialty-card-copy">
        <h3>${escapeHtml(family.name)}</h3>
        <p>${escapeHtml(family.description)}</p>
      </div>
      <a class="specialty-quote-button" href="${escapeHtml(quoteHref(family))}" aria-label="Request a quotation for ${escapeHtml(family.name)}">Request a Quotation <span aria-hidden="true">→</span></a>
    </article>
  `).join("");

  const count = document.getElementById("specialtyFamilyCount");
  if (count) count.textContent = String(families.length);
})();
