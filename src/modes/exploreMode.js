import { ORGANISMS, STAT_KEYS, STAT_LABELS, KINGDOM_COLORS } from "../data/organisms.js";
import { renderCardGrid } from "../components/cardGrid.js";
import { renderCompareTray } from "../components/compareTray.js";

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
  const circumference = Math.PI * r; // semicircle arc length

  return `
    <div class="perf-arc-grid">
      ${STAT_KEYS.map((stat) => {
        const value = card.stats[stat];
        const offset = circumference * (1 - value / 100);
        const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
        return `
          <div class="perf-arc-card">
            <svg class="perf-arc-svg" viewBox="0 0 100 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="${arcPath}" fill="none" stroke="rgba(20,32,51,0.08)" stroke-width="8" stroke-linecap="round"/>
              <path
                class="perf-arc-fill"
                d="${arcPath}"
                fill="none"
                stroke="${color}"
                stroke-width="8"
                stroke-linecap="round"
                style="--arc-full:${circumference}; --arc-offset:${offset}; filter:drop-shadow(0 0 5px ${color}88)"
              />
              <text x="${cx}" y="${cy - 4}" text-anchor="middle" dominant-baseline="auto" font-size="15" font-weight="700" fill="#142033" font-family="IBM Plex Mono,monospace">${value}</text>
            </svg>
            <span class="perf-arc-label">${STAT_LABELS[stat]}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function createPerformanceBars(card) {
  return `
    <div class="detail-stat-bars">
      ${STAT_KEYS.map((stat) => `
        <div class="detail-stat-bar-row">
          <div class="detail-stat-bar-head">
            <span>${STAT_LABELS[stat]}</span>
            <strong>${card.stats[stat]}</strong>
          </div>
          <div class="detail-stat-bar-track">
            <span style="width:${card.stats[stat]}%; background:${KINGDOM_COLORS[card.category]}"></span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function randomCard(exceptId = null) {
  const pool = ORGANISMS.filter((card) => card.id !== exceptId);
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function renderExploreMode(root) {
  const shuffledCards = shuffle(ORGANISMS);
  const touchMode = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const VISITED_KEY = "biomimi-visited";
  const visited = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));

  const state = {
    selectedCardId: null,
    flippedCardId: null,
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
            <p class="eyebrow">Museum of Living Design</p>
            <h2 class="explore-hero-title">Nature already solved it.</h2>
            <p class="explore-hero-text">Discover organisms, design principles, and architectural strategies through a living museum of biomimicry.</p>
            <div class="explore-hero-actions">
              <button class="btn" type="button" id="inspire-button">Inspire Me</button>
              <span class="explore-hero-note">Open a random organism in immersive mode.</span>
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
    state.flippedCardId = null;
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

    if (state.flippedCardId) {
      state.flippedCardId = null;
      render();
    }
  });

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

    detailPanel.classList.remove("hidden");
    workbench.classList.add("split-active");
    detailPanel.style.setProperty("--detail-accent", `var(--${selected.category.toLowerCase()})`);
    // On mobile, scroll the detail panel into view
    if (window.matchMedia("(max-width: 1080px)").matches) {
      detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    detailPanel.innerHTML = `
      <article class="detail-panel-shell detail-article">
        <div class="detail-panel-head detail-article-head">
          <div>
            <p class="panel-eyebrow">Design Article</p>
            <h3>${selected.name}</h3>
            <p>${selected.description}</p>
          </div>
          <button class="btn-ghost" type="button" id="close-detail">Close</button>
        </div>

        <div class="detail-media detail-hero-media">
          ${createExpandedVisualMarkup(selected)}
          <div class="detail-media-stats">
            <span class="meta-label">Performance Bars</span>
            ${createPerformanceBars(selected)}
          </div>
        </div>
        <section class="detail-content">
          <section class="detail-story-intro">
            <span class="detail-kingdom">${selected.category}</span>
            <h2>${selected.principle}</h2>
            <p>${selected.story}</p>
          </section>

          <section class="detail-editorial-grid">
            <div class="detail-editorial-block">
              <span class="meta-label">Nature</span>
              <p>${selected.description}</p>
            </div>
            <div class="detail-editorial-block">
              <span class="meta-label">Principle</span>
              <p>${selected.designTakeaway}</p>
            </div>
            <div class="detail-editorial-block">
              <span class="meta-label">Design Application</span>
              <p>${selected.architectureExample}</p>
            </div>
          </section>

          <section class="detail-block detail-chart-block">
            <span class="meta-label">Performance Profile</span>
            ${createPerformanceRings(selected)}
          </section>

          <section class="detail-block">
            <span class="meta-label">Applications</span>
            <p>${selected.architectureExample}</p>
          </section>

          <section class="detail-block">
            <span class="meta-label">Related Strategies</span>
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

  const KINGDOMS = ["Animals", "Plants", "Microorganisms", "Systems"];

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
          placeholder="Search by name, principle or tag…"
          value="${state.search.replace(/"/g, "&quot;")}"
          autocomplete="off"
        >
        <select class="explore-sort-select" id="explore-sort">
          <option value="random"${state.sort === "random" ? " selected" : ""}>Shuffle order</option>
          <option value="name"${state.sort === "name" ? " selected" : ""}>A → Z</option>
          <option value="sustainability"${state.sort === "sustainability" ? " selected" : ""}>Most sustainable</option>
          <option value="innovation"${state.sort === "innovation" ? " selected" : ""}>Most innovative</option>
          <option value="toughness"${state.sort === "toughness" ? " selected" : ""}>Toughest</option>
          <option value="adaptability"${state.sort === "adaptability" ? " selected" : ""}>Most adaptable</option>
        </select>
      </div>
      <div class="explore-chips-row">
        <div class="explore-filter-chips">
          <button class="filter-chip${!state.selectedKingdom ? " active" : ""}" data-kingdom="">All <span>${ORGANISMS.length}</span></button>
          ${KINGDOMS.map((k) => `
            <button class="filter-chip${state.selectedKingdom === k ? " active" : ""}" data-kingdom="${k}">${k}</button>
          `).join("")}
        </div>
        <span class="explore-count">${cards.length} of ${ORGANISMS.length}</span>
      </div>
      ${visitedCount > 0 ? `
        <div class="explore-visited-row">
          <div class="explore-visited-track">
            <div class="explore-visited-fill" style="width:${Math.round((visitedCount / ORGANISMS.length) * 100)}%"></div>
          </div>
          <span class="explore-visited-label">${visitedCount} / ${ORGANISMS.length} explored</span>
        </div>
      ` : ""}
    `;

    if (searchWasFocused) {
      const el = toolbar.querySelector("#explore-search");
      if (el) { el.focus(); const l = el.value.length; el.setSelectionRange(l, l); }
    }

    toolbar.querySelector("#explore-search").addEventListener("input", (e) => {
      state.search = e.target.value;
      state.hasAnimatedGrid = true;
      state.selectedCardId = null;
      state.flippedCardId = null;
      render();
    });

    toolbar.querySelector("#explore-sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      state.hasAnimatedGrid = false;
      render();
    });

    toolbar.querySelectorAll("[data-kingdom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedKingdom = btn.dataset.kingdom || null;
        state.selectedCardId = null;
        state.flippedCardId = null;
        state.hasAnimatedGrid = false;
        render();
      });
    });

    renderDetail(cards);

    if (cards.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No organisms found for this filter.</div>`;
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
          state.flippedCardId = null;
          render();
        },
        onFlip: () => {
          state.flippedCardId = state.flippedCardId === card.id ? null : card.id;
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
        isFlipped: state.flippedCardId === card.id,
        isCompared: state.compareIds.includes(card.id),
        isVisited: visited.has(card.id),
        interactionHint: touchMode ? "Tap again to open" : "Click again to open",
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
    if (e.key === "Escape") {
      if (state.flippedCardId) {
        state.flippedCardId = null;
        render();
      } else if (state.selectedCardId) {
        state.selectedCardId = null;
        render();
      }
    }
  };
  document.addEventListener("keydown", handleKeydown);

  render();
  return () => document.removeEventListener("keydown", handleKeydown);
}
