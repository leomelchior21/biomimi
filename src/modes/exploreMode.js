import { ORGANISMS, KINGDOM_COLORS } from "../data/organisms.js";
import { renderCardGrid } from "../components/cardGrid.js";
import { renderCompareTray } from "../components/compareTray.js";
import { createPerformanceBars } from "../components/performanceBars.js";
import { shuffle } from "../utils.js";
import { t, subscribeLanguage } from "../i18n.js";

function relatedCards(card) {
  return card.relatedIds.map((id) => ORGANISMS.find((candidate) => candidate.id === id)).filter(Boolean);
}

function createExpandedVisualMarkup(card) {
  return `
    <div class="detail-card-visual" style="background:${KINGDOM_COLORS[card.category]}">
      <img class="detail-card-photo" src="${card.imagePath}" alt="${card.name}" loading="lazy" decoding="async">
    </div>
  `;
}

function randomCard(exceptId = null) {
  const pool = ORGANISMS.filter((card) => card.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function renderExploreMode(root) {
  const shuffledCards = shuffle(ORGANISMS);
  const touchMode = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const VISITED_KEY = "biomimi-visited";
  const visited = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));

  const state = {
    selectedCardId: null,
    shuffledIds: shuffledCards.map((card) => card.id),
    hasAnimatedGrid: false,
    selectedKingdom: null,
    compareIds: [],
  };

  root.innerHTML = `
    <section class="mode-page explore-page">
      <section class="explore-cinematic-hero">
        <div class="explore-hero-orb explore-hero-orb-a"></div>
        <div class="explore-hero-orb explore-hero-orb-b"></div>
        <div class="explore-hero-layout">
          <div class="explore-hero-copy">
            <p class="eyebrow">${t("exploreEyebrow")}</p>
            <h2 class="explore-hero-title">${t("exploreHeroTitle")}</h2>
            <p class="explore-hero-text">${t("exploreHeroText")}</p>
            <div class="explore-hero-actions">
              <button class="btn" type="button" id="inspire-button">${t("exploreInspireBtn")}</button>
              <span class="explore-hero-note">${t("exploreInspireNote")}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="explore-workbench" id="explore-workbench">
        <div class="explore-grid-scroll">
          <div class="explore-toolbar" id="explore-toolbar"></div>
          <div class="card-grid card-grid-masonry" id="explore-grid"></div>
        </div>
        <aside class="detail-panel hidden" id="detail-panel"></aside>
      </section>

      <div id="compare-tray-root" class="compare-tray hidden"></div>
    </section>
  `;

  const toolbar = root.querySelector("#explore-toolbar");
  const grid = root.querySelector("#explore-grid");
  const detailPanel = root.querySelector("#detail-panel");
  const workbench = root.querySelector("#explore-workbench");
  const compareTrayRoot = root.querySelector("#compare-tray-root");

  root.querySelector("#inspire-button").addEventListener("click", () => {
    const card = randomCard(state.selectedCardId);
    state.selectedCardId = card.id;
    render();
  });

  root.addEventListener("click", (event) => {
    if (
      event.target.closest(".specimen-card") ||
      event.target.closest(".detail-panel") ||
      event.target.closest(".explore-toolbar") ||
      event.target.closest("#inspire-button")
    ) {
      return;
    }
    if (state.selectedCardId) {
      state.selectedCardId = null;
      render();
    }
  });

  const KINGDOMS = ["Animals", "Plants", "Microorganisms", "Systems"];
  const KINGDOM_LABELS = {
    Animals: () => t("kingdomAnimals"),
    Plants: () => t("kingdomPlants"),
    Microorganisms: () => t("kingdomMicroorganisms"),
    Systems: () => t("kingdomSystems"),
  };

  function visibleCards() {
    return state.shuffledIds
      .map((id) => ORGANISMS.find((card) => card.id === id))
      .filter(Boolean)
      .filter((card) => !state.selectedKingdom || card.category === state.selectedKingdom);
  }

  function renderDetail(cards) {
    if (!state.selectedCardId) {
      detailPanel.classList.add("hidden");
      workbench.classList.remove("split-active");
      detailPanel.innerHTML = "";
      return;
    }

    const selected = cards.find((card) => card.id === state.selectedCardId) || ORGANISMS.find((card) => card.id === state.selectedCardId);
    if (!selected) {
      state.selectedCardId = null;
      detailPanel.classList.add("hidden");
      workbench.classList.remove("split-active");
      detailPanel.innerHTML = "";
      return;
    }

    const related = relatedCards(selected);

    const isNewCard = detailPanel.dataset.openId !== selected.id;
    detailPanel.classList.remove("hidden");
    workbench.classList.add("split-active");
    detailPanel.style.setProperty("--detail-accent", `var(--${selected.category.toLowerCase()})`);
    detailPanel.dataset.openId = selected.id;
    if (isNewCard && touchMode) {
      workbench.scrollIntoView({ behavior: "smooth", block: "start" });
      toolbar.classList.remove("toolbar-hidden");
    }
    detailPanel.innerHTML = `
      <article class="detail-panel-shell detail-article">
        <div class="detail-panel-head detail-article-head">
          <div>
            <span class="detail-kingdom">${selected.category}</span>
            <h3>${selected.name}</h3>
          </div>
          <button class="btn-ghost" type="button" id="close-detail">${t("detailClose")}</button>
        </div>

        <div class="detail-media detail-hero-media">
          ${createExpandedVisualMarkup(selected)}
        </div>

        <div class="detail-principle-pull">
          <p>${selected.principle}</p>
        </div>

        <section class="detail-content">
          <div class="detail-editorial-grid">
            <div class="detail-editorial-block">
              <span class="detail-col-label">${t("detailNature")}</span>
              <p>${selected.story}</p>
            </div>
            <div class="detail-editorial-block">
              <span class="detail-col-label">${t("detailPrinciple")}</span>
              <p>${selected.designTakeaway}</p>
            </div>
            <div class="detail-editorial-block">
              <span class="detail-col-label">${t("detailApplication")}</span>
              <p>${selected.architectureExample}</p>
            </div>
          </div>

          <section class="detail-block detail-chart-block">
            <span class="meta-label">${t("detailPerformance")}</span>
            ${createPerformanceBars(selected)}
          </section>

          ${related.length > 0 ? `
          <section class="detail-block">
            <span class="meta-label">${t("detailRelated")}</span>
            <div class="detail-related-mini-grid">
              ${related.map((card) => `
                <button class="detail-related-mini" type="button" data-related-id="${card.id}">
                  <img src="${card.imagePath}" alt="${card.name}" loading="lazy" decoding="async">
                  <div>
                    <strong>${card.name}</strong>
                    <span>${card.principle}</span>
                  </div>
                </button>
              `).join("")}
            </div>
          </section>
          ` : ""}
        </section>
      </article>
    `;

    detailPanel.querySelector("#close-detail").addEventListener("click", () => {
      state.selectedCardId = null;
      render();
    });
    detailPanel.querySelectorAll("[data-related-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCardId = button.dataset.relatedId;
        render();
      });
    });
  }

  function render() {
    const cards = visibleCards();

    toolbar.innerHTML = `
      <div class="explore-banner-row">
        <div class="explore-filter-chips" aria-label="${t("exploreFilterAll")}">
          <button class="filter-chip${!state.selectedKingdom ? " active" : ""}" data-kingdom="">${t("exploreFilterAll")}</button>
          ${KINGDOMS.map((k) => `
            <button class="filter-chip${state.selectedKingdom === k ? " active" : ""}" data-kingdom="${k}">${KINGDOM_LABELS[k]()}</button>
          `).join("")}
        </div>
      </div>
    `;

    toolbar.querySelectorAll("[data-kingdom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedKingdom = btn.dataset.kingdom || null;
        state.selectedCardId = null;
        state.hasAnimatedGrid = false;
        render();
      });
    });

    renderDetail(cards);

    if (cards.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">${t("exploreEmpty")}</div>`;
      return;
    }

    renderCardGrid(
      grid,
      cards,
      (card) => ({
        onOpen: () => {
          visited.add(card.id);
          localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
          state.selectedCardId = card.id;
          render();
        },
        onCompare: () => {
          if (state.compareIds.includes(card.id)) {
            state.compareIds = state.compareIds.filter((id) => id !== card.id);
          } else if (state.compareIds.length < 3) {
            state.compareIds = [...state.compareIds, card.id];
          }
          render();
        },
        isSelected: state.selectedCardId === card.id,
        isCompared: state.compareIds.includes(card.id),
        isVisited: visited.has(card.id),
        highlight: null,
      }),
      { animate: !state.hasAnimatedGrid },
    );
    state.hasAnimatedGrid = true;

    const compareCards = state.compareIds
      .map((id) => ORGANISMS.find((c) => c.id === id))
      .filter(Boolean);
    renderCompareTray(compareTrayRoot, compareCards, {
      onRemove: (id) => {
        state.compareIds = state.compareIds.filter((cid) => cid !== id);
        render();
      },
      onClear: () => {
        state.compareIds = [];
        render();
      },
      onOpen: (id) => {
        state.selectedCardId = id;
        state.compareIds = [];
        render();
      },
    });
  }

  const handleKeydown = (e) => {
    if (e.key === "Escape" && state.selectedCardId) {
      state.selectedCardId = null;
      render();
    }
  };
  document.addEventListener("keydown", handleKeydown);

  let lastScrollY = window.scrollY;
  const handleScroll = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    if (delta > 6) {
      toolbar.classList.add("toolbar-hidden");
    } else if (delta < -6) {
      toolbar.classList.remove("toolbar-hidden");
    }
    lastScrollY = currentY;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });

  render();
  const unsubscribe = subscribeLanguage(() => render());

  return () => {
    unsubscribe();
    document.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("scroll", handleScroll);
  };
}
