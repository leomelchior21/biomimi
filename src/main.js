import { createRouter } from "./router.js";
import { initModal } from "./components/modal.js";
import { initLanguageUI } from "./i18n.js";

initModal(document.getElementById("modal-root"));
initLanguageUI();

createRouter({
  root: document.getElementById("app"),
  navSelector: "[data-route-link]",
});
