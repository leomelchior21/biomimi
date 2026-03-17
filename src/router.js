import { renderExploreMode } from "./modes/exploreMode.js";
import { renderMissionGenerator } from "./modes/missionGenerator.js";
import { renderEcosystemBattle } from "./modes/ecosystemBattle.js";

const routes = {
  explore: renderExploreMode,
  mission: renderMissionGenerator,
  battle: renderEcosystemBattle,
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

    setActive(route in routes ? route : "explore");
    cleanup = renderer(root);
  }

  if (!window.location.hash) {
    window.location.hash = "#/explore";
  }

  window.addEventListener("hashchange", render);
  render();
}
