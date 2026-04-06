import { escapeHtml } from "../../utils.js";

function createParticles(count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const x = 8 + ((index * 11) % 84);
    const y = 10 + ((index * 17) % 76);
    const delay = `${index * 0.55}s`;
    const duration = `${5 + (index % 4)}s`;
    return `<span class="randomizer-mode-particle" style="--x:${x}%;--y:${y}%;--delay:${delay};--duration:${duration};"></span>`;
  }).join("");
}

function renderModeVisual(modeId) {
  if (modeId === "maker") {
    return `
      <span class="randomizer-mode-maker-grid"></span>
      <span class="randomizer-maker-silhouettes">
        <span></span><span></span><span></span>
      </span>
      <span class="randomizer-maker-orbit"></span>
    `;
  }

  if (modeId === "boss") {
    return `
      <span class="randomizer-boss-scan"></span>
      <span class="randomizer-boss-glitch"></span>
      <span class="randomizer-chaos-rift"></span>
    `;
  }

  return `
    <span class="randomizer-mode-bloom"></span>
    <span class="randomizer-mode-bloom randomizer-mode-bloom-b"></span>
  `;
}

function renderSproutStage() {
  return `
    <div class="randomizer-sprout-stage" aria-live="polite">
      <div class="randomizer-sprout-glow"></div>
      <div class="randomizer-sprout-scene" aria-hidden="true">
        <span class="randomizer-sprout-halo"></span>
        <span class="randomizer-sprout-seed"></span>
        <span class="randomizer-sprout-stem"></span>
        <span class="randomizer-sprout-leaf randomizer-sprout-leaf-a"></span>
        <span class="randomizer-sprout-leaf randomizer-sprout-leaf-b"></span>
        <span class="randomizer-sprout-leaf randomizer-sprout-leaf-c"></span>
        <span class="randomizer-sprout-soil"></span>
      </div>
      <p class="randomizer-sprout-label">Sprouting mission...</p>
    </div>
  `;
}

function renderMission(mission) {
  return `
    <article class="randomizer-mission-shell" aria-live="polite">
      <p class="randomizer-mission-cta">${escapeHtml(mission.cta)}</p>
      <h3 class="randomizer-mission-problem">${escapeHtml(mission.problem)}</h3>
      <p class="randomizer-mission-brief">${escapeHtml(mission.brief)}</p>
      <div class="randomizer-mission-questions">
        <p>Guiding questions</p>
        <ol>
          ${mission.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
        </ol>
      </div>
    </article>
  `;
}

export function createModeCard(mode, cardState, onGenerate) {
  const element = document.createElement("article");
  const state = cardState.isGenerating ? "growing" : cardState.mission ? "revealed" : "idle";
  element.className = `randomizer-mode-card randomizer-mode-${mode.id}`;
  element.dataset.state = state;
  element.setAttribute("aria-busy", String(cardState.isGenerating));

  element.innerHTML = `
    <span class="randomizer-mode-border" aria-hidden="true"></span>
    <span class="randomizer-mode-surface" aria-hidden="true"></span>
    <span class="randomizer-mode-noise" aria-hidden="true"></span>
    <span class="randomizer-mode-particles" aria-hidden="true">${createParticles(mode.id === "maker" ? 10 : 8)}</span>
    <span class="randomizer-mode-visual" aria-hidden="true">${renderModeVisual(mode.id)}</span>
    <div class="randomizer-mode-copy">
      <div class="randomizer-mode-head">
        <h2 class="randomizer-mode-title">${escapeHtml(mode.title)}</h2>
      </div>
      <button class="randomizer-generate-btn" type="button" data-action="generate" ${cardState.isGenerating ? "disabled" : ""}>Generate Mission</button>
      <div class="randomizer-mode-body">
        ${cardState.isGenerating ? renderSproutStage() : cardState.mission ? renderMission(cardState.mission) : ""}
      </div>
    </div>
  `;

  element.querySelector('[data-action="generate"]')?.addEventListener("click", onGenerate);
  return element;
}
