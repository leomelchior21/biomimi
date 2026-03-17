import { ORGANISMS, STAT_KEYS, STAT_LABELS, KINGDOM_COLORS } from "../data/organisms.js";
import { renderCardGrid } from "../components/cardGrid.js";

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
  return `
    <div class="performance-rings">
      ${STAT_KEYS.map((stat) => `
        <div class="performance-ring-card">
          <div class="performance-ring" style="--ring-value:${card.stats[stat]}; --ring-color:${KINGDOM_COLORS[card.category]}">
            <div class="performance-ring-inner">
              <strong>${card.stats[stat]}</strong>
            </div>
          </div>
          <span>${STAT_LABELS[stat]}</span>
        </div>
      `).join("")}
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
  const state = {
    selectedCardId: null,
    flippedCardId: null,
    shuffledIds: shuffledCards.map((card) => card.id),
    hasAnimatedGrid: false,
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
          <aside class="explore-discovery-strip explore-discovery-panel">
            <div class="explore-filter-meta">
              <span class="panel-eyebrow">Explore</span>
              <span id="results-copy"></span>
            </div>
            <div class="explore-random-list" id="explore-random-list"></div>
          </aside>
        </div>
      </section>

      <section class="explore-workbench" id="explore-workbench">
        <div class="explore-grid-scroll">
          <div class="card-grid card-grid-masonry" id="explore-grid"></div>
        </div>
        <aside class="detail-panel hidden" id="detail-panel"></aside>
      </section>
    </section>
  `;

  const resultsCopy = root.querySelector("#results-copy");
  const grid = root.querySelector("#explore-grid");
  const detailPanel = root.querySelector("#detail-panel");
  const workbench = root.querySelector("#explore-workbench");
  const randomList = root.querySelector("#explore-random-list");
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
      event.target.closest(".explore-random-item") ||
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
    return state.shuffledIds
      .map((id) => ORGANISMS.find((card) => card.id === id))
      .filter(Boolean);
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

  function render() {
    const cards = visibleCards();
    resultsCopy.textContent = `${cards.length} organisms in the discovery wall`;
    randomList.innerHTML = cards.slice(0, 7).map((card, index) => `
      <button class="explore-random-item" type="button" data-random-id="${card.id}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${card.name}</strong>
        <em>${card.category}</em>
      </button>
    `).join("");
    randomList.querySelectorAll("[data-random-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCardId = button.dataset.randomId;
        state.flippedCardId = null;
        render();
      });
    });
    renderDetail(cards);

    renderCardGrid(
      grid,
      cards,
      (card) => ({
        onOpen: () => {
          state.selectedCardId = card.id;
          state.flippedCardId = null;
          render();
        },
        onFlip: () => {
          state.flippedCardId = state.flippedCardId === card.id ? null : card.id;
          render();
        },
        isSelected: state.selectedCardId === card.id,
        isFlipped: state.flippedCardId === card.id,
        interactionHint: touchMode ? "Tap again to open" : "Click again to open",
        highlight: null,
      }),
      { animate: !state.hasAnimatedGrid },
    );
    state.hasAnimatedGrid = true;
  }

  render();
  return () => {};
}
