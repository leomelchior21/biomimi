import { ORGANISMS, STAT_KEYS, STAT_LABELS, KINGDOM_COLORS } from "../data/organisms.js";
import { renderCardGrid } from "../components/cardGrid.js";
import { renderCompareTray } from "../components/compareTray.js";
import { shuffle, debounce } from "../utils.js";
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

function createPerformanceRings(card) {
  const color = KINGDOM_COLORS[card.category];
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = Math.PI * r;

  return `
    <div class="perf-arc-grid">
      ${STAT_KEYS.map((stat) => {
        const value = card.stats[stat];
        const offset = circumference * (1 - value / 100);
        const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
        return `
          <div class="perf-arc-card">
            <svg class="perf-arc-svg" viewBox="0 0 100 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="${arcPath}" fill="none" stroke="rgba(20,32,51,0.07)" stroke-width="9" stroke-linecap="round"/>
              <path
                class="perf-arc-fill"
                d="${arcPath}"
                fill="none"
                stroke="${color}"
                stroke-width="9"
                stroke-linecap="round"
                style="--arc-full:${circumference}; --arc-offset:${offset}; filter:drop-shadow(0 0 6px ${color}99)"
              />
              <text x="${cx}" y="${cy - 2}" text-anchor="middle" dominant-baseline="auto" font-size="19" font-weight="700" fill="#142033" font-family="IBM Plex Mono,monospace">${value}</text>
            </svg>
            <span class="perf-arc-label">${STAT_LABELS[stat]}</span>
          </div>
        `;
      }).join("")}
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
    search: "",
    sort: "random",
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
    let cards = state.shuffledIds
      .map((id) => ORGANISMS.find((card) => card.id === id))
      .filter(Boolean)
      .filter((card) => !state.selectedKingdom || card.category === state.selectedKingdom);

    if (state.search) {
      const q = state.search.toLowerCase();
      cards = cards.filter((card) =>
        card.name.toLowerCase().includes(q) ||
        card.principle.toLowerCase().includes(q) ||
        card.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (state.sort === "name") {
      cards = [...cards].sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sort !== "random") {
      cards = [...cards].sort((a, b) => b.stats[state.sort] - a.stats[state.sort]);
    }

    return cards;
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
            ${createPerformanceRings(selected)}
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

    const visitedCount = [...visited].filter((id) => ORGANISMS.some((c) => c.id === id)).length;
    const searchWasFocused = document.activeElement?.id === "explore-search";

    toolbar.innerHTML = `
      <div class="explore-search-row">
        <input
          class="explore-search-input-field"
          type="search"
          id="explore-search"
          placeholder="${t("explorePlaceholder")}"
          value="${state.search.replace(/"/g, "&quot;")}"
          autocomplete="off"
        >
        <select class="explore-sort-select" id="explore-sort">
          <option value="random"${state.sort === "random" ? " selected" : ""}>${t("exploreSortRandom")}</option>
          <option value="name"${state.sort === "name" ? " selected" : ""}>${t("exploreSortAlpha")}</option>
          <option value="sustainability"${state.sort === "sustainability" ? " selected" : ""}>${t("exploreSortSustainability")}</option>
          <option value="innovation"${state.sort === "innovation" ? " selected" : ""}>${t("exploreSortInnovation")}</option>
          <option value="toughness"${state.sort === "toughness" ? " selected" : ""}>${t("exploreSortToughness")}</option>
          <option value="adaptability"${state.sort === "adaptability" ? " selected" : ""}>${t("exploreSortAdaptability")}</option>
        </select>
      </div>
      <div class="explore-chips-row">
        <div class="explore-filter-chips">
          <button class="filter-chip${!state.selectedKingdom ? " active" : ""}" data-kingdom="">${t("exploreFilterAll")} <span>${ORGANISMS.length}</span></button>
          ${KINGDOMS.map((k) => `
            <button class="filter-chip${state.selectedKingdom === k ? " active" : ""}" data-kingdom="${k}">${KINGDOM_LABELS[k]()}</button>
          `).join("")}
        </div>
        <span class="explore-count">${cards.length} of ${ORGANISMS.length}</span>
      </div>
      ${visitedCount > 0 ? `
        <div class="explore-visited-row">
          <div class="explore-visited-track">
            <div class="explore-visited-fill" style="width:${Math.round((visitedCount / ORGANISMS.length) * 100)}%"></div>
          </div>
          <span class="explore-visited-label">${visitedCount} / ${ORGANISMS.length} ${t("exploreExplored")}</span>
        </div>
      ` : ""}
    `;

    if (searchWasFocused) {
      const el = toolbar.querySelector("#explore-search");
      if (el) { el.focus(); const l = el.value.length; el.setSelectionRange(l, l); }
    }

    toolbar.querySelector("#explore-search").addEventListener("input", debounce((e) => {
      state.search = e.target.value;
      state.hasAnimatedGrid = true;
      state.selectedCardId = null;
      render();
    }, 150));

    toolbar.querySelector("#explore-sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      state.hasAnimatedGrid = false;
      render();
    });

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
