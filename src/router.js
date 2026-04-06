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

  function getRouteInfo() {
    const path = window.location.hash.replace(/^#\//, "") || "explore";
    const segments = path.split("/").filter(Boolean);
    const route = segments[0] || "explore";
    return { path, route, segments };
  }

  function setActive(route) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.routeLink === route);
    });
  }

  function render() {
    const routeInfo = getRouteInfo();
    const renderer = routes[routeInfo.route] || routes.explore;

    if (typeof cleanup === "function") {
      cleanup();
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    setActive(routeInfo.route in routes ? routeInfo.route : "explore");
    cleanup = renderer(root, routeInfo);
  }

  if (!window.location.hash) {
    window.location.hash = "#/explore";
  }

  window.addEventListener("hashchange", render);
  render();
}
