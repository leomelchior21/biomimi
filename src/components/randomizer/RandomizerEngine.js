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
      <p class="randomizer-mode-empty-note">Each mode has 10 city missions focused on urban pressures such as housing, mobility, water, waste, energy, biodiversity, and public space.</p>
    </div>
  `;
}

function renderMission(mission, mode) {
  const prompts = [
    {
      kicker: "Pressure map",
      title: "Read the city first",
      body: mission.questions[0] || "What is the real pressure shaping this place right now?",
      feature: true,
    },
    {
      kicker: "Nature clue",
      title: "Borrow a strategy",
      body: mission.questions[1] || "What natural strategy could help this place perform better?",
      feature: false,
    },
    {
      kicker: "Prototype test",
      title: "Push the idea",
      body: mission.questions[2] || "What would prove the intervention is working over time?",
      feature: false,
    },
  ];

  return `
    <article class="randomizer-mission-shell randomizer-mission-shell-${escapeHtml(mode.id)}" aria-live="polite">
      <div class="randomizer-mission-top">
        <div class="randomizer-mission-intro">
          <p class="randomizer-mission-area">${escapeHtml(mission.area)} city challenge</p>
          <h3 class="randomizer-mission-problem">${escapeHtml(mission.problem)}</h3>
          <div class="randomizer-mission-actions">
            <button class="randomizer-mission-regenerate" type="button" data-action="generate">Generate another mission</button>
            <span class="randomizer-mission-mode-pill">${escapeHtml(mode.title)}</span>
          </div>
        </div>
        <div class="randomizer-mission-summary">
          <p class="randomizer-mission-cta">${escapeHtml(mission.cta)}</p>
          <p class="randomizer-mission-brief">${escapeHtml(mission.brief)}</p>
        </div>
      </div>
      <div class="randomizer-mission-grid">
        ${prompts.map((prompt, index) => `
          <article class="randomizer-mission-panel ${prompt.feature ? "randomizer-mission-panel-feature" : "randomizer-mission-panel-dark"}">
            <div class="randomizer-mission-panel-copy">
              <p class="randomizer-mission-panel-kicker">${escapeHtml(prompt.kicker)}</p>
              <h4>${escapeHtml(prompt.title)}</h4>
              <p>${escapeHtml(prompt.body)}</p>
            </div>
            ${index === 0 ? `
              <div class="randomizer-mission-bloom" aria-hidden="true">
                <span class="randomizer-mission-bloom-orb"></span>
                <span class="randomizer-mission-bloom-stem"></span>
                <span class="randomizer-mission-bloom-core"></span>
                <span class="randomizer-mission-bloom-petal randomizer-mission-bloom-petal-a"></span>
                <span class="randomizer-mission-bloom-petal randomizer-mission-bloom-petal-b"></span>
                <span class="randomizer-mission-bloom-petal randomizer-mission-bloom-petal-c"></span>
              </div>
            ` : ""}
          </article>
        `).join("")}
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
    const modeState = state.modes[modeId];
    if (modeState) {
      clearTimer(modeState);
      modeState.mission = null;
      modeState.isGenerating = false;
    }
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
    const shouldShowGenerateButton = !modeState.isGenerating && !modeState.mission;
    const bodyMarkup = modeState.isGenerating
      ? renderSproutStage()
      : modeState.mission
        ? renderMission(modeState.mission, mode)
        : renderEmptyState(mode);

    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-mode-screen randomizer-mode-screen-${mode.id}">
          <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
          <div class="randomizer-mode-screen-head">
            <h2>${escapeHtml(mode.title)}</h2>
          </div>
          ${shouldShowGenerateButton ? `
            <div class="randomizer-mode-screen-cta">
              <button class="randomizer-generate-btn" type="button" data-action="generate">Generate Mission</button>
            </div>
          ` : ""}
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
