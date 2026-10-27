(() => {
  "use strict";

  const toggleButton = document.getElementById("faqToggleAll");
  const faqItems = Array.from(document.querySelectorAll(".faq-list details"));

  if (!toggleButton || faqItems.length === 0) return;

  const updateToggleButton = () => {
    const allOpen = faqItems.every((item) => item.open);
    toggleButton.setAttribute("aria-expanded", String(allOpen));
    toggleButton.innerHTML = allOpen
      ? 'Tümünü kapat <span aria-hidden="true">＋</span>'
      : 'Tümünü aç <span aria-hidden="true">＋</span>';
  };

  toggleButton.addEventListener("click", () => {
    const shouldOpen = faqItems.some((item) => !item.open);
    faqItems.forEach((item) => {
      item.open = shouldOpen;
    });
    updateToggleButton();
  });

  faqItems.forEach((item) => {
    item.addEventListener("toggle", updateToggleButton);
  });

  updateToggleButton();
})();
