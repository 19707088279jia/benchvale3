(() => {
  "use strict";

  const accordion = document.querySelector("[data-terms-accordion]");
  if (!accordion) return;

  const items = [...accordion.querySelectorAll(".terms-item")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const closeItem = (item, returnFocus = false) => {
    const trigger = item.querySelector(".terms-trigger");
    const panel = item.querySelector(".terms-panel");
    if (!trigger || !panel || trigger.getAttribute("aria-expanded") !== "true") return;
    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");

    if (reducedMotion.matches) {
      panel.hidden = true;
      panel.style.height = "0px";
    } else {
      panel.style.height = `${panel.scrollHeight}px`;
      requestAnimationFrame(() => { panel.style.height = "0px"; });
      panel.addEventListener("transitionend", () => {
        if (trigger.getAttribute("aria-expanded") === "false") panel.hidden = true;
      }, { once: true });
    }
    if (returnFocus) trigger.focus();
  };

  const openItem = (item) => {
    const trigger = item.querySelector(".terms-trigger");
    const panel = item.querySelector(".terms-panel");
    if (!trigger || !panel) return;
    for (const otherItem of items) if (otherItem !== item) closeItem(otherItem);
    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
    panel.hidden = false;

    if (reducedMotion.matches) {
      panel.style.height = "auto";
    } else {
      panel.style.height = "0px";
      requestAnimationFrame(() => { panel.style.height = `${panel.scrollHeight}px`; });
      panel.addEventListener("transitionend", () => {
        if (trigger.getAttribute("aria-expanded") === "true") panel.style.height = "auto";
      }, { once: true });
    }
  };

  accordion.addEventListener("click", (event) => {
    const trigger = event.target.closest(".terms-trigger");
    if (!trigger || !accordion.contains(trigger)) return;
    const item = trigger.closest(".terms-item");
    if (trigger.getAttribute("aria-expanded") === "true") closeItem(item);
    else openItem(item);
  });

  window.addEventListener("resize", () => {
    const openPanel = accordion.querySelector('.terms-trigger[aria-expanded="true"] + .terms-panel');
    if (openPanel) openPanel.style.height = "auto";
  });
})();
