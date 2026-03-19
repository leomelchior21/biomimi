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
        <p class="panel-eyebrow">Mission Generator</p>
        <h3>${mission ? mission.title : "Generate a biomimicry mission"}</h3>
        <p>${mission ? mission.description : "Turn the specimen wall into an active design challenge and test your chosen organisms."}</p>
      </div>
      <div class="action-row">
        <button class="btn" type="button" data-mission-generate>${mission ? "New mission" : "Generate mission"}</button>
        ${mission ? `<button class="btn-ghost" type="button" data-mission-clear>Clear mission</button>` : ""}
      </div>
    </div>
    ${mission ? `
      <div class="mission-brief-grid">
        <div class="mission-brief-card">
          <span class="meta-label">Difficulty</span>
          <strong>${mission.difficulty}</strong>
          <p>${mission.category}</p>
        </div>
        <div class="mission-brief-card">
          <span class="meta-label">Stat Focus</span>
          <strong>${mission.statFocusLabel}</strong>
          <p>Scoring rewards strategies that perform well on this dimension.</p>
        </div>
        <div class="mission-brief-card">
          <span class="meta-label">Suggested organisms</span>
          <strong>${mission.suggestedOrganisms.length}</strong>
          <p>${mission.suggestedOrganismNames.join(", ")}</p>
        </div>
      </div>
      <div class="mission-tag-row">
        ${mission.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}
      </div>
      <div class="mission-selection-row">
        <div class="mission-selected">
          <span class="meta-label">Selected solution cards</span>
          <div class="mission-selected-list">
            ${selectedCards.length ? selectedCards.map((card) => `<span class="mission-card-chip">${card.name}</span>`).join("") : `<span class="panel-copy">Select 1-3 cards from the wall.</span>`}
          </div>
        </div>
        <button class="btn-secondary" type="button" data-mission-test ${canTest ? "" : "disabled"}>Test Design</button>
      </div>
      ${missionResult ? `
        <div class="mission-result">
          <div class="mission-result-head">
            <div>
              <span class="meta-label">Result</span>
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
