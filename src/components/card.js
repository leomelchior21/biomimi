import { KINGDOM_COLORS, STAT_KEYS, STAT_LABELS } from "../data/organisms.js";

const visualThemes = {
  Animals: { background: ["#70131f", "#c9253f", "#ff5f77"], accent: "#ffe7eb" },
  Plants: { background: ["#123e2d", "#1f7a50", "#5eca8d"], accent: "#e8fff1" },
  Microorganisms: { background: ["#113a72", "#156ed8", "#39b7ff"], accent: "#e8f6ff" },
  Systems: { background: ["#7b5a0f", "#d59a0e", "#ffd452"], accent: "#fff6d9" },
};

function createVisual(card) {
  return `
    <div class="card-visual">
      <img class="card-photo" src="${card.imagePath}" alt="${card.name}">
    </div>
  `;
}

export function createCardVisualMarkup(card) {
  return createVisual(card);
}

export function getCardSize(card) {
  if (card.category === "Systems" || card.tags.includes("district") || card.tags.includes("urban")) return "feature";
  if (card.tags.includes("coastal") || card.tags.includes("canopy") || card.tags.includes("living-infrastructure")) return "tall";
  if (card.tags.includes("surface") || card.tags.includes("materials") || card.tags.includes("filter")) return "compact";
  return "standard";
}

export function createCard(card, options = {}) {
  const {
    onOpen,
    onFlip,
    onCompare,
    isSelected = false,
    isFlipped = false,
    isCompared = false,
    isVisited = false,
    highlight = null,
    interactionHint = "Click again to open",
  } = options;

  const color = KINGDOM_COLORS[card.category];
  const theme = visualThemes[card.category];
  const element = document.createElement("article");
  const classes = ["specimen-card", `specimen-card-${getCardSize(card)}`];
  const insight = card.designTakeaway || card.principle;
  const topStats = [...STAT_KEYS]
    .sort((left, right) => card.stats[right] - card.stats[left])
    .slice(0, 3);

  if (highlight?.isHighlighted) classes.push("is-highlighted");
  if (highlight?.isSuggested) classes.push("is-suggested");
  if (isSelected) classes.push("is-selected");
  if (isFlipped) classes.push("is-flipped");
  if (isCompared) classes.push("is-compared");

  element.className = classes.join(" ");
  element.style.setProperty("--card-accent", color);
  element.setAttribute("tabindex", "0");
  element.setAttribute("role", "button");
  element.setAttribute("aria-pressed", String(isFlipped));
  element.innerHTML = `
    <div class="card-flip-scene">
      <div class="card-face card-face-front">
        <div class="card-shell card-shell-front">
          <div class="card-media-wrap">
            ${createVisual(card).replace('<img class="card-photo"', '<img class="card-photo" loading="lazy" decoding="async"')}
            <div class="card-cover-overlay" style="--card-tint-start:${theme.background[2]}; --card-tint-mid:${theme.background[1]};"></div>
            <div class="card-grain"></div>
            <div class="card-topbar card-topbar-front">
              <span class="kingdom-chip card-kingdom-pill">${card.category}</span>
              <div class="card-badges">
                ${highlight?.isSuggested ? `<span class="card-mini-badge">Mission Fit</span>` : ""}
                ${isVisited ? `<span class="card-visited-dot" title="Explored"></span>` : ""}
                <span class="card-index">${card.id.toUpperCase()}</span>
              </div>
            </div>
            <div class="card-body card-body-overlay">
              <div class="card-copy-cluster">
                <div class="card-subhead">${card.tags[0] || card.application}</div>
                <h3 class="card-title">${card.name}</h3>
                <p class="card-principle">${insight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-face card-face-back">
        <div class="card-shell card-shell-back" style="background: linear-gradient(160deg, ${theme.background[0]} 0%, ${theme.background[1]} 52%, ${theme.background[2]} 100%);">
          <div class="card-topbar">
            <span class="kingdom-chip card-kingdom-pill">${card.category}</span>
            <span class="card-index">${card.id.toUpperCase()}</span>
          </div>
          <div class="card-back-content">
            <div class="card-back-head">
              <div class="card-subhead">${card.principle}</div>
              <h3 class="card-title">${card.name}</h3>
            </div>
            <div class="card-back-stats">
              ${topStats.map((stat) => `
                <div class="card-back-stat">
                  <div class="card-back-stat-head">
                    <span>${STAT_LABELS[stat]}</span>
                    <strong>${card.stats[stat]}</strong>
                  </div>
                  <div class="card-back-stat-bar"><span style="width:${card.stats[stat]}%"></span></div>
                </div>
              `).join("")}
            </div>
            <div class="card-back-tags">
              ${card.tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("")}
            </div>
            <div class="card-back-footer">
              <p class="card-back-cue">${interactionHint}</p>
              ${onCompare !== undefined ? `<button class="card-compare-btn${isCompared ? " active" : ""}" type="button" data-compare-add>${isCompared ? "Comparing" : "+ Compare"}</button>` : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (event.target.closest("[data-compare-add]")) {
      onCompare?.(card);
      return;
    }
    if (isFlipped) {
      onOpen?.(card);
      return;
    }
    onFlip?.(card);
  });

  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (isFlipped) {
      onOpen?.(card);
      return;
    }
    onFlip?.(card);
  });

  return element;
}

export function createBattleCard(card) {
  const color = KINGDOM_COLORS[card.category];
  const theme = visualThemes[card.category];
  const element = document.createElement("article");
  element.className = "battle-card";
  element.style.setProperty("--card-accent", color);
  element.innerHTML = `
    <div class="card-shell" style="background: ${theme.background[1]};">
      <div class="card-topbar">
        <div>
          <span class="kingdom-chip card-kingdom-pill">${card.category}</span>
        </div>
        <span class="battle-tag">${card.application}</span>
      </div>
      ${createVisual(card)}
      <div class="battle-selection">
        <div>
          <h3 class="card-title">${card.name}</h3>
          <p class="card-principle">${card.description}</p>
        </div>
        <div class="stat-preview">
          ${STAT_KEYS.map((stat) => `
            <div class="stat-preview-row">
              <span class="stat-label">${STAT_LABELS[stat]}</span>
              <span class="stat-value">${card.stats[stat]}</span>
              <div class="stat-bar card-stat-bar"><span style="width:${card.stats[stat]}%; background:${color};"></span></div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  return element;
}
