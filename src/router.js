import { renderExploreMode } from "./modes/exploreMode.js";
import { renderMissionGenerator } from "./modes/missionGenerator.js";
import { renderWhatIsBiomimicry } from "./modes/whatIsBiomimicry.js";

const routes = {
  what: renderWhatIsBiomimicry,
  explore: renderExploreMode,
  mission: renderMissionGenerator,
};

export function createRouter({ root, navSelector }) {
  let cleanup = null;
  const navLinks = [...document.querySelectorAll(navSelector)];

  function setActive(route) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.routeLink === route);
    });
  }

  function render() {
    const route = window.location.hash.replace(/^#\//, "") || "explore";
    const renderer = routes[route] || routes.explore;

    if (typeof cleanup === "function") {
      cleanup();
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    setActive(route in routes ? route : "explore");
    cleanup = renderer(root);
  }

  if (!window.location.hash) {
    window.location.hash = "#/explore";
  }

  window.addEventListener("hashchange", render);
  render();
}
