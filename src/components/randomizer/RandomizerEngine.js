import { RANDOMIZER_MISSION_POOLS } from "../../data/randomizerMissions.js";
import { shuffle, escapeHtml } from "../../utils.js";
import { createModeCard } from "./ModeCard.js";

const MODES = [
  {
    id: "simple",
    slug: "starter",
    title: "Starter Mission",
    prompt: "Open a first city challenge and let the class frame a clear design direction.",
  },
  {
    id: "maker",
    slug: "maker",
    title: "Maker Mission",
    prompt: "Generate a city systems challenge ready for deeper invention and prototyping.",
  },
  {
    id: "boss",
    slug: "final-boss",
    title: "Final Boss",
    prompt: "Sprout a high-pressure urban mission that needs a fast and resilient response.",
  },
];

function createDeck(modeId, excludeId = null) {
  const pool = RANDOMIZER_MISSION_POOLS[modeId] || [];
  const available = excludeId ? pool.filter((mission) => mission.id !== excludeId) : pool;
  return shuffle(available);
}

function createModeState(modeId) {
  return {
    mission: null,
    deck: createDeck(modeId),
    isGenerating: false,
    timer: null,
  };
}

function createRandomizerState() {
  return {
    modes: Object.fromEntries(MODES.map((mode) => [mode.id, createModeState(mode.id)])),
  };
}

const state = createRandomizerState();

function getModeFromRoute(routeInfo) {
  const segment = routeInfo?.segments?.[1] ?? null;
  return MODES.find((mode) => mode.slug === segment || mode.id === segment) || null;
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

function renderEmptyState(mode) {
  return `
    <div class="randomizer-mode-empty">
      <p class="randomizer-mode-empty-kicker">City mission generator</p>
      <p class="randomizer-mode-empty-copy">${escapeHtml(mode.prompt)}</p>
      <p class="randomizer-mode-empty-note">Every mission focuses on a real urban pressure such as housing, mobility, water, waste, energy, biodiversity, and public space.</p>
    </div>
  `;
}

function renderMission(mission) {
  return `
    <article class="randomizer-mission-shell" aria-live="polite">
      <p class="randomizer-mission-area">${escapeHtml(mission.area)} city challenge</p>
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

export function renderRandomizerEngine(root, routeInfo) {
  function clearTimer(modeState) {
    if (modeState.timer) {
      window.clearTimeout(modeState.timer);
      modeState.timer = null;
    }
  }

  function clearAllTimers() {
    Object.values(state.modes).forEach(clearTimer);
  }

  function drawMission(modeId) {
    const modeState = state.modes[modeId];
    if (!modeState.deck.length) {
      modeState.deck = createDeck(modeId, modeState.mission?.id ?? null);
    }

    return modeState.deck.pop() || (RANDOMIZER_MISSION_POOLS[modeId] || [])[0] || null;
  }

  function openMode(modeId) {
    const mode = MODES.find((entry) => entry.id === modeId);
    if (!mode) return;
    window.location.hash = `#/mission/${mode.slug}`;
  }

  function goHome() {
    window.location.hash = "#/mission";
  }

  function generateMission(modeId) {
    const modeState = state.modes[modeId];
    if (!modeState || modeState.isGenerating) return;

    clearTimer(modeState);
    modeState.isGenerating = true;
    render();

    modeState.timer = window.setTimeout(() => {
      modeState.mission = drawMission(modeId);
      modeState.isGenerating = false;
      modeState.timer = null;
      render();
    }, 10000);
  }

  function renderHome() {
    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-hero">
          <div class="randomizer-hero-glow randomizer-hero-glow-a"></div>
          <div class="randomizer-hero-glow randomizer-hero-glow-b"></div>
          <p class="randomizer-hero-kicker">BioMimis</p>
          <h1>RANDOMIZER</h1>
          <p class="randomizer-hero-subtitle">Choose one mode card to open a city mission page for your students.</p>
        </section>

        <section class="randomizer-mode-grid" id="randomizer-mode-grid"></section>
      </section>
    `;

    const grid = root.querySelector("#randomizer-mode-grid");
    MODES.forEach((mode) => {
      grid.appendChild(createModeCard(mode, () => openMode(mode.id)));
    });
  }

  function renderModeView(mode) {
    const modeState = state.modes[mode.id];
    const bodyMarkup = modeState.isGenerating
      ? renderSproutStage()
      : modeState.mission
        ? renderMission(modeState.mission)
        : renderEmptyState(mode);

    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-mode-screen randomizer-mode-screen-${mode.id}">
          <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
          <div class="randomizer-mode-screen-head">
            <h2>${escapeHtml(mode.title)}</h2>
          </div>
          <div class="randomizer-mode-screen-cta">
            <button class="randomizer-generate-btn" type="button" data-action="generate" ${modeState.isGenerating ? "disabled" : ""}>${modeState.isGenerating ? "Sprouting mission..." : "Generate Mission"}</button>
          </div>
          <div class="randomizer-mode-screen-body">
            ${bodyMarkup}
          </div>
        </section>
      </section>
    `;

    root.querySelector('[data-action="back"]')?.addEventListener("click", goHome);
    root.querySelector('[data-action="generate"]')?.addEventListener("click", () => generateMission(mode.id));
  }

  function render() {
    const activeMode = getModeFromRoute(routeInfo);

    if (!activeMode) {
      renderHome();
      return;
    }

    renderModeView(activeMode);
  }

  render();

  return () => {
    clearAllTimers();
  };
}
