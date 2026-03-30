import { KINGDOM_COLORS, STAT_KEYS, STAT_LABELS } from "../data/organisms.js";

export function createPerformanceBars(card, options = {}) {
  const { compact = false, className = "" } = options;
  const color = KINGDOM_COLORS[card.category || card.kingdom];
  const classes = ["performance-bars", compact ? "is-compact" : "", className].filter(Boolean).join(" ");

  return `
    <div class="${classes}" style="--performance-accent:${color};">
      ${STAT_KEYS.map((stat, index) => {
        const value = card.stats[stat];
        return `
          <div class="performance-bar-card" style="--bar-delay:${index * 60}ms;">
            <div class="performance-bar-head">
              <span>${STAT_LABELS[stat]}</span>
              <strong>${value}</strong>
            </div>
            <div class="performance-bar-track">
              <span class="performance-bar-fill" style="width:${value}%;"></span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
