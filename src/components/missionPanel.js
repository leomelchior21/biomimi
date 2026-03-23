import { t } from "../i18n.js";

export function renderMissionPanel(container, payload) {
  const {
    mission,
    selectedCards,
    missionResult,
    onGenerate,
    onClearMission,
    onTest,
    canTest,
  } = payload;

  container.className = "mission-panel";
  container.innerHTML = `
    <div class="mission-panel-head">
      <div>
        <p class="panel-eyebrow">${t("missionPanelEyebrow")}</p>
        <h3>${mission ? mission.title : t("missionPanelPlaceholder")}</h3>
        <p>${mission ? mission.description : t("missionPanelDesc")}</p>
      </div>
      <div class="action-row">
        <button class="btn" type="button" data-mission-generate>${mission ? t("missionNew") : t("missionGenerate")}</button>
        ${mission ? `<button class="btn-ghost" type="button" data-mission-clear>${t("missionClearBtn")}</button>` : ""}
      </div>
    </div>
    ${mission ? `
      <div class="mission-brief-grid">
        <div class="mission-brief-card">
          <span class="meta-label">${t("missionDifficulty")}</span>
          <strong>${mission.difficulty}</strong>
          <p>${mission.category}</p>
        </div>
        <div class="mission-brief-card">
          <span class="meta-label">${t("missionStatFocus")}</span>
          <strong>${mission.statFocusLabel}</strong>
          <p>${t("missionStatHint")}</p>
        </div>
        <div class="mission-brief-card">
          <span class="meta-label">${t("missionSuggested")}</span>
          <strong>${mission.suggestedOrganisms.length}</strong>
          <p>${mission.suggestedOrganismNames.join(", ")}</p>
        </div>
      </div>
      <div class="mission-tag-row">
        ${mission.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}
      </div>
      <div class="mission-selection-row">
        <div class="mission-selected">
          <span class="meta-label">${t("missionSelectedLabel")}</span>
          <div class="mission-selected-list">
            ${selectedCards.length ? selectedCards.map((card) => `<span class="mission-card-chip">${card.name}</span>`).join("") : `<span class="panel-copy">${t("missionSelectHint")}</span>`}
          </div>
        </div>
        <button class="btn-secondary" type="button" data-mission-test ${canTest ? "" : "disabled"}>${t("missionTestBtn")}</button>
      </div>
      ${missionResult ? `
        <div class="mission-result">
          <div class="mission-result-head">
            <div>
              <span class="meta-label">${t("missionResultLabel")}</span>
              <h4>${missionResult.successLevel}</h4>
            </div>
            <div class="mission-score-pill">${missionResult.totalScore}</div>
          </div>
          <p>${missionResult.explanation}</p>
          <div class="mission-result-bars">
            ${Object.entries(missionResult.metrics).map(([label, value]) => `
              <div class="mission-result-row">
                <span>${label}</span>
                <strong>${value}</strong>
                <div class="score-bar"><span style="width:${value}%; background:linear-gradient(90deg,#8ff0b8,#8be7ff);"></span></div>
              </div>
            `).join("")}
          </div>
          <div class="mission-insight">${missionResult.insight}</div>
        </div>
      ` : ""}
    ` : ""}
  `;

  container.querySelector("[data-mission-generate]").addEventListener("click", onGenerate);
  container.querySelector("[data-mission-clear]")?.addEventListener("click", onClearMission);
  container.querySelector("[data-mission-test]")?.addEventListener("click", onTest);
}
