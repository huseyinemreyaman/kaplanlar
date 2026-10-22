
document.addEventListener("DOMContentLoaded", () => {
    const feedback = document.getElementById("contact-feedback");
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async () => {
            const type = button.dataset.copy;
            const target = document.querySelector(
                type === "phone" ? "[data-phone]" : "[data-email]"
            );

            if (!target || !feedback) return;

            const value = target.textContent.trim();

            try {
                await navigator.clipboard.writeText(value);
                feedback.textContent =
                    type === "phone"
                        ? "Phone number copied."
                        : "Email address copied.";
            } catch {
                feedback.textContent =
                    "Copy is unavailable. Please select and copy the contact details manually.";
            }
        });
    });
});
