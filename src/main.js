import { createRouter } from "./router.js";
import { initModal } from "./components/modal.js";
import { initLanguageUI } from "./i18n.js";

initModal(document.getElementById("modal-root"));
initLanguageUI();

// Hamburger menu toggle
const hamburger = document.getElementById("nav-hamburger");
const topnav = document.getElementById("topnav");
if (hamburger && topnav) {
  hamburger.addEventListener("click", () => {
    const isOpen = topnav.classList.toggle("nav-open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });
  topnav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      topnav.classList.remove("nav-open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
}

createRouter({
  root: document.getElementById("app"),
  navSelector: "[data-route-link]",
});
