import { RANDOMIZER_MISSION_POOLS } from "../../data/randomizerMissions.js";
import { ORGANISMS, KINGDOM_COLORS } from "../../data/organisms.js";
import { shuffle, escapeHtml } from "../../utils.js";
import { createModeCard } from "./ModeCard.js";

const MODES = [
  {
    id: "simple",
    slug: "starter",
    title: "Starter Mission",
    tagline: "Pick one BioMimi guide.",
    badge: "Guided",
  },
  {
    id: "maker",
    slug: "maker",
    title: "Maker Mission",
    tagline: "Find your own organism.",
    badge: "Independent",
  },
  {
    id: "boss",
    slug: "final-boss",
    title: "Final Boss",
    tagline: "Use it. No reroll.",
    badge: "Creative Challenge",
  },
];

const SKETCHBOOK_STEPS = [
  {
    id: "problem",
    label: "Problem",
    action: "See the problem",
    prompts: ["City problem", "2 or 3 symptoms", "Root cause"],
  },
  {
    id: "nature",
    label: "Nature",
    action: "Learn from nature",
    prompts: ["Organism or system", "Strategy it uses"],
  },
  {
    id: "idea",
    label: "Idea",
    action: "Turn it into design",
    prompts: ["Nature does ___", "We design ___"],
  },
  {
    id: "urban-solution",
    label: "Urban Solution",
    action: "Build the city idea",
    prompts: ["Where it fits", "How it improves the place"],
  },
];

const GENERATION_DURATION = 5000;
const BOSS_WARNING_DURATION = 2500;
const BOSS_GLITCH_DURATION = GENERATION_DURATION - BOSS_WARNING_DURATION;

const ORGANISMS_BY_ID = Object.fromEntries(ORGANISMS.map((organism) => [organism.id, organism]));

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
    candidateOrganisms: [],
    selectedOrganism: null,
    assignedOrganism: null,
    bossPhase: "idle",
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

function getOrganismById(id) {
  return ORGANISMS_BY_ID[id] || null;
}

function getOrganismsByIds(ids = []) {
  return ids.map(getOrganismById).filter(Boolean);
}

function drawMission(modeId) {
  const modeState = state.modes[modeId];
  if (!modeState.deck.length) {
    modeState.deck = createDeck(modeId, modeState.mission?.id ?? null);
  }
  return modeState.deck.pop() || (RANDOMIZER_MISSION_POOLS[modeId] || [])[0] || null;
}

function renderLoadingStage(label, modifier = "") {
  return `
    <div class="randomizer-loading-stage ${modifier}" aria-live="polite">
      <div class="randomizer-loading-visual" aria-hidden="true">
        <div class="randomizer-loading-path">
          <span></span>
        </div>
        <div class="randomizer-loading-deck">
          <span class="randomizer-loading-card randomizer-loading-card-a"></span>
          <span class="randomizer-loading-card randomizer-loading-card-b"></span>
          <span class="randomizer-loading-card randomizer-loading-card-c"></span>
        </div>
        <div class="randomizer-loading-seed">
          <span></span>
        </div>
      </div>
      <div class="randomizer-loading-copy">
        <p>${escapeHtml(label)}</p>
        <span>Problem. Nature. Idea. City.</span>
      </div>
    </div>
  `;
}

function renderBossWarningStage() {
  return `
    <div class="randomizer-boss-warning-screen" aria-live="polite">
      <div class="randomizer-boss-warning-orbit" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="randomizer-boss-warning-eyebrow">Final Boss</p>
      <h2 class="randomizer-boss-warning-title">There is no choice</h2>
      <p class="randomizer-boss-warning-sub">Use it. No reroll.</p>
    </div>
  `;
}

function renderBossGlitchStage() {
  return `
    <div class="randomizer-boss-glitch-screen" aria-hidden="true">
      <div class="randomizer-boss-glitch-lines"></div>
      <div class="randomizer-boss-glitch-noise"></div>
      <div class="randomizer-boss-glitch-rings">
        <span></span>
        <span></span>
      </div>
      <p class="randomizer-boss-glitch-text glitch-text" data-text="ADAPT FAST">ADAPT FAST</p>
    </div>
  `;
}

function renderProblemCard(mission, mode, note = "") {
  return `
    <section class="randomizer-challenge-card randomizer-problem-card">
      <p class="randomizer-card-kicker">${escapeHtml(mode.title)} / ${escapeHtml(mode.badge)}</p>
      <h2>${escapeHtml(mission.title)}</h2>
      <p>${escapeHtml(mission.problem)}</p>
      ${note ? `<span class="randomizer-problem-note">${escapeHtml(note)}</span>` : ""}
    </section>
  `;
}

function renderOrganismCard(organism, options = {}) {
  const {
    action = "",
    selected = false,
    muted = false,
    forced = false,
    label = "",
  } = options;
  const classes = [
    "randomizer-biomimi-card",
    selected ? "is-selected" : "",
    muted ? "is-muted" : "",
    forced ? "is-forced" : "",
  ].filter(Boolean).join(" ");
  const style = `--org-accent:${escapeHtml(KINGDOM_COLORS[organism.category] || "#222222")};`;
  const content = `
    <div class="randomizer-biomimi-image">
      <img src="${escapeHtml(organism.imagePath)}" alt="${escapeHtml(organism.name)}" loading="lazy" decoding="async">
    </div>
    <div class="randomizer-biomimi-copy">
      <p>${escapeHtml(label || organism.category)}</p>
      <strong>${escapeHtml(organism.name)}</strong>
      <span>${escapeHtml(organism.principle)}</span>
    </div>
  `;

  if (action) {
    return `
      <button
        class="${classes}"
        type="button"
        data-action="${escapeHtml(action)}"
        data-organism-id="${escapeHtml(organism.id)}"
        style="${style}"
      >
        ${content}
      </button>
    `;
  }

  return `<article class="${classes}" style="${style}">${content}</article>`;
}

function renderSketchbookCanvas({ locked = false } = {}) {
  if (locked) {
    return `
      <section class="randomizer-sketchbook-strip is-locked" aria-label="Sketchbook steps">
        <div class="randomizer-sketchbook-lock">
          <strong>Pick one BioMimi.</strong>
          <span>Then draw the 4 steps in your sketchbook.</span>
        </div>
      </section>
    `;
  }

  return `
    <section class="randomizer-sketchbook-strip" aria-label="Sketchbook steps">
      <div class="randomizer-sketchbook-note">
        <span>Sketchbook Canvas</span>
        <strong>Draw. Do not type.</strong>
      </div>
      <div class="randomizer-step-grid">
        ${SKETCHBOOK_STEPS.map((step, index) => `
          <article class="randomizer-step-card randomizer-step-${escapeHtml(step.id)}">
            <div class="randomizer-step-head">
              <span class="randomizer-step-number">${index + 1}</span>
              <span class="randomizer-step-icon" aria-hidden="true"></span>
            </div>
            <h4>${escapeHtml(step.label)}</h4>
            <p>${escapeHtml(step.action)}</p>
            <ul>
              ${step.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStarterMission(mode, mission, modeState) {
  const organisms = modeState.candidateOrganisms;
  const selectedOrganism = modeState.selectedOrganism;

  return `
    <article class="randomizer-dashboard randomizer-dashboard-simple" aria-live="polite">
      <div class="randomizer-mission-board randomizer-starter-board">
        ${renderProblemCard(mission, mode, selectedOrganism ? "Use your chosen BioMimi." : "Choose 1 BioMimi card.")}
        <section class="randomizer-challenge-card randomizer-choice-panel">
          <p class="randomizer-card-kicker">${selectedOrganism ? "Chosen Nature" : "Choose Nature"}</p>
          <div class="randomizer-choice-grid">
            ${organisms.map((organism) => renderOrganismCard(organism, {
              action: "pick-organism",
              selected: selectedOrganism?.id === organism.id,
              muted: Boolean(selectedOrganism && selectedOrganism.id !== organism.id),
              label: selectedOrganism?.id === organism.id ? "Chosen" : organism.category,
            })).join("")}
          </div>
        </section>
      </div>
      ${renderSketchbookCanvas({ locked: !selectedOrganism })}
    </article>
  `;
}

function renderMakerMission(mode, mission) {
  return `
    <article class="randomizer-dashboard randomizer-dashboard-maker" aria-live="polite">
      <div class="randomizer-mission-board randomizer-maker-board">
        ${renderProblemCard(mission, mode, "Draw the canvas first. Then explore BioMimis on your own.")}
        <section class="randomizer-challenge-card randomizer-maker-choice-panel">
          <p class="randomizer-card-kicker">Nature Search</p>
          <a class="randomizer-maker-biomimi-link" href="./#/explore" target="_blank" rel="noopener noreferrer">Choose you BioMimi card</a>
        </section>
      </div>
      ${renderSketchbookCanvas()}
    </article>
  `;
}

function renderBossMission(mode, mission, organism) {
  if (!organism) {
    return "";
  }

  return `
    <article class="randomizer-dashboard randomizer-dashboard-boss" aria-live="polite">
      <div class="randomizer-mission-board randomizer-boss-board">
        ${renderProblemCard(mission, mode, "There is no choice. Make the connection.")}
        <section class="randomizer-challenge-card randomizer-forced-panel">
          <p class="randomizer-card-kicker">Forced Nature</p>
          <div class="randomizer-boss-single-card">
            ${renderOrganismCard(organism, { forced: true, label: "Use it" })}
            <a class="randomizer-boss-explore-link" href="./#/explore/${escapeHtml(organism.id)}" target="_blank" rel="noopener noreferrer">Open this BioMimi</a>
          </div>
        </section>
      </div>
      ${renderSketchbookCanvas()}
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

  function resetModeState(modeState) {
    clearTimer(modeState);
    modeState.mission = null;
    modeState.isGenerating = false;
    modeState.selectedOrganism = null;
    modeState.candidateOrganisms = [];
    modeState.assignedOrganism = null;
    modeState.bossPhase = "idle";
  }

  function goHome() {
    window.location.hash = "#/mission";
  }

  function openMode(modeId) {
    const mode = MODES.find((item) => item.id === modeId);
    if (!mode) return;

    const modeState = state.modes[modeId];
    if (modeState) {
      resetModeState(modeState);
    }

    window.location.hash = `#/mission/${mode.slug}`;
  }

  function revealMission(modeId) {
    const modeState = state.modes[modeId];
    const mission = drawMission(modeId);

    modeState.mission = mission;
    modeState.selectedOrganism = null;
    modeState.candidateOrganisms = modeId === "simple"
      ? getOrganismsByIds(mission?.suggestedOrganisms)
      : [];
    modeState.assignedOrganism = modeId === "boss"
      ? getOrganismById(mission?.assignedOrganism)
      : null;
    modeState.isGenerating = false;
    modeState.timer = null;
  }

  function generateMission(modeId) {
    const modeState = state.modes[modeId];
    if (!modeState || modeState.isGenerating) return;

    clearTimer(modeState);
    modeState.isGenerating = true;
    modeState.mission = null;
    modeState.selectedOrganism = null;
    modeState.candidateOrganisms = [];
    modeState.assignedOrganism = null;

    if (modeId === "boss") {
      modeState.bossPhase = "warning";
      render();
      modeState.timer = window.setTimeout(() => {
        modeState.bossPhase = "glitch";
        render();
        modeState.timer = window.setTimeout(() => {
          revealMission(modeId);
          modeState.bossPhase = "reveal";
          render();
        }, BOSS_GLITCH_DURATION);
      }, BOSS_WARNING_DURATION);
      return;
    }

    render();
    modeState.timer = window.setTimeout(() => {
      revealMission(modeId);
      render();
    }, GENERATION_DURATION);
  }

  function renderHome() {
    root.innerHTML = `
      <section class="mode-page randomizer-page randomizer-home-page">
        <section class="randomizer-hero">
          <p class="randomizer-hero-kicker">BioMimis</p>
          <h1>Mission Randomizer</h1>
          <p class="randomizer-hero-subtitle">Choose a mode. Get a city problem. Draw your idea.</p>
        </section>
        <section class="randomizer-mode-grid" id="randomizer-mode-grid"></section>
      </section>
    `;

    const grid = root.querySelector("#randomizer-mode-grid");
    MODES.filter((mode) => mode.id !== "simple").forEach((mode) => {
      grid.appendChild(createModeCard(mode, () => openMode(mode.id)));
    });
  }

  function renderModeView(mode) {
    const modeState = state.modes[mode.id];
    const showGenerateBtn = !modeState.isGenerating && !modeState.mission;
    const isBossLoading = mode.id === "boss" && modeState.isGenerating;

    let bodyMarkup = "";
    if (modeState.isGenerating) {
      if (mode.id === "boss") {
        bodyMarkup = modeState.bossPhase === "glitch"
          ? renderBossGlitchStage()
          : renderBossWarningStage();
      } else {
        const label = mode.id === "maker" ? "Making challenge..." : "Drawing mission...";
        bodyMarkup = renderLoadingStage(label, `randomizer-loading-${mode.id}`);
      }
    } else if (modeState.mission) {
      if (mode.id === "simple") {
        bodyMarkup = renderStarterMission(mode, modeState.mission, modeState);
      } else if (mode.id === "maker") {
        bodyMarkup = renderMakerMission(mode, modeState.mission);
      } else if (mode.id === "boss") {
        bodyMarkup = renderBossMission(mode, modeState.mission, modeState.assignedOrganism);
      }
    }

    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-mode-screen randomizer-mode-screen-${escapeHtml(mode.id)}${isBossLoading ? " is-boss-loading" : ""}">
          <div class="randomizer-mode-screen-topbar">
            <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
          </div>
          ${showGenerateBtn ? `
            <div class="randomizer-mode-launch">
              <span class="randomizer-mode-badge">${escapeHtml(mode.badge)}</span>
              <h2>${escapeHtml(mode.title)}</h2>
              <p>${escapeHtml(mode.tagline)}</p>
              <button class="randomizer-generate-btn" type="button" data-action="generate">
                <span class="randomizer-generate-icon" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
                <span class="randomizer-generate-copy">
                  <strong>Generate Mission</strong>
                  <small>Open a city challenge</small>
                </span>
              </button>
            </div>
          ` : ""}
          ${bodyMarkup ? `<div class="randomizer-mode-screen-body">${bodyMarkup}</div>` : ""}
        </section>
      </section>
    `;

    root.querySelector('[data-action="back"]')?.addEventListener("click", goHome);
    root.querySelectorAll('[data-action="generate"]').forEach((button) => {
      button.addEventListener("click", () => generateMission(mode.id));
    });
    root.querySelectorAll('[data-action="pick-organism"]').forEach((button) => {
      button.addEventListener("click", () => {
        const organism = modeState.candidateOrganisms.find((item) => item.id === button.dataset.organismId);
        if (organism) {
          modeState.selectedOrganism = organism;
          render();
        }
      });
    });
  }

  function render() {
    const activeMode = getModeFromRoute(routeInfo);
    if (!activeMode) {
      renderHome();
    } else {
      renderModeView(activeMode);
    }
  }

  render();

  return () => {
    clearAllTimers();
  };
}
