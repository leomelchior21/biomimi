import { STAT_KEYS, STAT_LABELS } from "../data/organisms.js";
import { renderRadarChart } from "./radarChart.js";
import { t } from "../i18n.js";

export function renderCompareTray(container, cards, { onRemove, onClear, onOpen }) {
  if (!cards.length) {
    container.innerHTML = "";
    container.className = "compare-tray hidden";
    return;
  }

  container.className = "compare-tray";
  container.innerHTML = `
    <div class="compare-tray-head">
      <div>
        <p class="panel-eyebrow">${t("compareTrayLabel")}</p>
        <h3>${cards.length === 1 ? t("comparePickMore") : t("compareTitle")}</h3>
      </div>
      <button class="btn-ghost" type="button" data-compare-clear>${t("compareClear")}</button>
    </div>
    <div class="compare-grid">
      ${cards.map((card) => `
        <article class="compare-card" data-compare-card="${card.id}">
          <div class="compare-card-head">
            <div>
              <strong>${card.name}</strong>
              <div class="panel-copy">${card.principle}</div>
            </div>
            <button class="card-action-btn" type="button" data-compare-remove="${card.id}">${t("compareRemove")}</button>
          </div>
          <canvas class="compare-radar" data-compare-radar="${card.id}"></canvas>
          <div class="compare-details">
            <div><span class="meta-label">${t("compareApplication")}</span><p>${card.architectureExample}</p></div>
            <div><span class="meta-label">${t("compareWhyMatters")}</span><p>${card.designTakeaway}</p></div>
          </div>
          <div class="compare-stat-list">
            ${STAT_KEYS.map((stat) => `
              <div class="compare-stat-row">
                <span>${STAT_LABELS[stat]}</span>
                <strong>${card.stats[stat]}</strong>
              </div>
            `).join("")}
          </div>
          <button class="btn-secondary" type="button" data-compare-open="${card.id}">${t("compareOpenDeep")}</button>
        </article>
      `).join("")}
    </div>
  `;

  container.querySelector("[data-compare-clear]").addEventListener("click", onClear);
  container.querySelectorAll("[data-compare-remove]").forEach((button) => {
    button.addEventListener("click", () => onRemove(button.dataset.compareRemove));
  });
  container.querySelectorAll("[data-compare-open]").forEach((button) => {
    button.addEventListener("click", () => onOpen(button.dataset.compareOpen));
  });
  container.querySelectorAll("[data-compare-radar]").forEach((canvas) => {
    const card = cards.find((item) => item.id === canvas.dataset.compareRadar);
    if (card) {
      renderRadarChart(canvas, card);
    }
  });
}
