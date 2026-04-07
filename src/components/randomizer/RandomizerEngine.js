import { RANDOMIZER_MISSION_POOLS } from "../../data/randomizerMissions.js";
import { ORGANISMS, KINGDOM_COLORS } from "../../data/organisms.js";
import { shuffle, escapeHtml } from "../../utils.js";
import { createModeCard } from "./ModeCard.js";

const MODES = [
  {
    id: "simple",
    slug: "starter",
    title: "Starter Mission",
    tagline: "Choose a guide. Frame the challenge.",
    vibe: "calm",
  },
  {
    id: "maker",
    slug: "maker",
    title: "Maker Mission",
    tagline: "Invent a city system.",
    vibe: "moderate",
  },
  {
    id: "boss",
    slug: "final-boss",
    title: "Final Boss",
    tagline: "No choices. Just adapt.",
    vibe: "chaotic",
  },
];

function createDeck(modeId, excludeId = null) {
  const pool = RANDOMIZER_MISSION_POOLS[modeId] || [];
  const available = excludeId ? pool.filter((m) => m.id !== excludeId) : pool;
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

function drawMission(modeId) {
  const modeState = state.modes[modeId];
  if (!modeState.deck.length) {
    modeState.deck = createDeck(modeId, modeState.mission?.id ?? null);
  }
  return modeState.deck.pop() || (RANDOMIZER_MISSION_POOLS[modeId] || [])[0] || null;
}

function drawCandidateOrganisms(count = 3) {
  return shuffle([...ORGANISMS]).slice(0, count);
}

function drawOrganism() {
  return ORGANISMS[Math.floor(Math.random() * ORGANISMS.length)];
}

/* ─── Loading stages ─────────────────────────────────────────────────────── */

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
      <p class="randomizer-sprout-label">Growing mission…</p>
    </div>
  `;
}

function renderGlassStage() {
  return `
    <div class="randomizer-glass-stage" aria-live="polite">
      <div class="randomizer-glass-crystal" aria-hidden="true">
        <span class="randomizer-glass-shard randomizer-glass-shard-a"></span>
        <span class="randomizer-glass-shard randomizer-glass-shard-b"></span>
        <span class="randomizer-glass-shard randomizer-glass-shard-c"></span>
        <span class="randomizer-glass-core"></span>
      </div>
      <p class="randomizer-glass-label">Forming mission…</p>
    </div>
  `;
}

function renderBossWarningStage() {
  return `
    <div class="randomizer-boss-warning-screen" aria-live="polite">
      <p class="randomizer-boss-warning-eyebrow">Final Boss</p>
      <h2 class="randomizer-boss-warning-title">YOU HAVE<br>NO CONTROL</h2>
      <p class="randomizer-boss-warning-sub">The system is choosing for you.</p>
    </div>
  `;
}

function renderBossGlitchStage() {
  return `
    <div class="randomizer-boss-glitch-screen" aria-hidden="true">
      <div class="randomizer-boss-glitch-lines"></div>
      <div class="randomizer-boss-glitch-noise"></div>
      <p class="randomizer-boss-glitch-text glitch-text" data-text="ADAPT FAST">ADAPT FAST</p>
    </div>
  `;
}

/* ─── Mission renders ─────────────────────────────────────────────────────── */

function renderOrganismPicker(organisms) {
  return `
    <div class="randomizer-organism-choice">
      <p class="randomizer-organism-choice-label">Choose your BioMimi guide</p>
      <div class="randomizer-organism-grid">
        ${organisms.map((org) => `
          <button
            class="randomizer-org-card"
            type="button"
            data-action="pick-organism"
            data-organism-id="${escapeHtml(org.id)}"
            style="--org-accent:${escapeHtml(KINGDOM_COLORS[org.category])};"
          >
            <div class="randomizer-org-image-wrap">
              <img src="${escapeHtml(org.imagePath)}" alt="${escapeHtml(org.name)}" loading="lazy" decoding="async">
              <div class="randomizer-org-image-overlay"></div>
            </div>
            <div class="randomizer-org-copy">
              <p class="randomizer-org-kingdom">${escapeHtml(org.category)}</p>
              <strong class="randomizer-org-name">${escapeHtml(org.name)}</strong>
              <span class="randomizer-org-principle">${escapeHtml(org.principle)}</span>
            </div>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderStarterMission(mission, modeState) {
  const { candidateOrganisms, selectedOrganism } = modeState;

  const problemCard = `
    <div class="randomizer-starter-problem">
      <p class="randomizer-mission-area">${escapeHtml(mission.area)} city challenge</p>
      <h3 class="randomizer-starter-problem-title">${escapeHtml(mission.problem)}</h3>
      <p class="randomizer-starter-brief">${escapeHtml(mission.brief)}</p>
    </div>
  `;

  if (!selectedOrganism) {
    return `
      <article class="randomizer-starter-mission" aria-live="polite">
        ${problemCard}
        ${renderOrganismPicker(candidateOrganisms)}
      </article>
    `;
  }

  const prompts = [
    { kicker: "Pressure map", title: "Read the city", body: mission.questions[0] },
    { kicker: `${selectedOrganism.name} clue`, title: "Borrow the strategy", body: mission.questions[1] },
    { kicker: "Prototype test", title: "Push the idea", body: mission.questions[2] },
  ];

  return `
    <article class="randomizer-starter-mission randomizer-starter-mission-chosen" aria-live="polite">
      ${problemCard}
      <div class="randomizer-starter-chosen">
        <div class="randomizer-chosen-card" style="--org-accent:${escapeHtml(KINGDOM_COLORS[selectedOrganism.category])};">
          <img src="${escapeHtml(selectedOrganism.imagePath)}" alt="${escapeHtml(selectedOrganism.name)}" loading="lazy" decoding="async">
          <div class="randomizer-chosen-overlay"></div>
          <div class="randomizer-chosen-info">
            <p>${escapeHtml(selectedOrganism.category)}</p>
            <strong>${escapeHtml(selectedOrganism.name)}</strong>
            <span>${escapeHtml(selectedOrganism.principle)}</span>
          </div>
        </div>
        <div class="randomizer-starter-prompts">
          ${prompts.map((p) => `
            <article class="randomizer-starter-prompt">
              <p class="randomizer-starter-prompt-kicker">${escapeHtml(p.kicker)}</p>
              <h4>${escapeHtml(p.title)}</h4>
              <p>${escapeHtml(p.body)}</p>
            </article>
          `).join("")}
        </div>
      </div>
      <div class="randomizer-starter-actions">
        <button class="randomizer-mission-regenerate" type="button" data-action="generate">Generate another mission</button>
      </div>
    </article>
  `;
}

function renderMakerMission(mission) {
  const prompts = [
    { kicker: "System scope", title: "Frame the city", body: mission.questions[0] },
    { kicker: "Flow design", title: "Connect the flows", body: mission.questions[1] },
    { kicker: "Realism check", title: "Ground the idea", body: mission.questions[2] },
  ];

  return `
    <article class="randomizer-maker-mission" aria-live="polite">
      <div class="randomizer-maker-header">
        <span class="randomizer-maker-system-badge">${escapeHtml(mission.area)}</span>
        <h3 class="randomizer-maker-problem">${escapeHtml(mission.problem)}</h3>
        <p class="randomizer-maker-brief">${escapeHtml(mission.brief)}</p>
        <button class="randomizer-mission-regenerate" type="button" data-action="generate">New challenge</button>
      </div>
      <div class="randomizer-maker-panels-grid">
        ${prompts.map((p, i) => `
          <article class="randomizer-maker-panel${i === 0 ? " randomizer-maker-panel-feature" : ""}">
            <p class="randomizer-maker-panel-kicker">${escapeHtml(p.kicker)}</p>
            <h4>${escapeHtml(p.title)}</h4>
            <p>${escapeHtml(p.body)}</p>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

function renderBossMission(mission, organism) {
  return `
    <article class="randomizer-boss-mission" aria-live="polite">
      <div class="randomizer-boss-split">
        <div class="randomizer-boss-problem-panel">
          <p class="randomizer-mission-area">${escapeHtml(mission.area)} emergency</p>
          <h3>${escapeHtml(mission.problem)}</h3>
          <p>${escapeHtml(mission.brief)}</p>
        </div>
        <div class="randomizer-boss-org-panel" style="--boss-accent:${escapeHtml(KINGDOM_COLORS[organism.category])};">
          <img src="${escapeHtml(organism.imagePath)}" alt="${escapeHtml(organism.name)}" loading="lazy" decoding="async">
          <div class="randomizer-boss-org-overlay"></div>
          <div class="randomizer-boss-org-info">
            <p>${escapeHtml(organism.category)}</p>
            <strong>${escapeHtml(organism.name)}</strong>
            <span>${escapeHtml(organism.principle)}</span>
          </div>
        </div>
      </div>
      <div class="randomizer-boss-questions">
        ${mission.questions.map((q, i) => `
          <div class="randomizer-boss-question">
            <span class="randomizer-boss-q-number">0${i + 1}</span>
            <p>${escapeHtml(q)}</p>
          </div>
        `).join("")}
      </div>
      <div class="randomizer-boss-mission-footer">
        <button class="randomizer-mission-regenerate randomizer-boss-regen" type="button" data-action="generate">Survive Again</button>
      </div>
    </article>
  `;
}

/* ─── Engine ──────────────────────────────────────────────────────────────── */

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

  function goHome() {
    window.location.hash = "#/mission";
  }

  function openMode(modeId) {
    const mode = MODES.find((m) => m.id === modeId);
    if (!mode) return;
    const modeState = state.modes[modeId];
    if (modeState) {
      clearTimer(modeState);
      modeState.mission = null;
      modeState.isGenerating = false;
      modeState.selectedOrganism = null;
      modeState.candidateOrganisms = [];
      modeState.assignedOrganism = null;
      modeState.bossPhase = "idle";
    }
    window.location.hash = `#/mission/${mode.slug}`;
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
          modeState.mission = drawMission(modeId);
          modeState.assignedOrganism = drawOrganism();
          modeState.bossPhase = "reveal";
          modeState.isGenerating = false;
          modeState.timer = null;
          render();
        }, 2000);
      }, 2200);
      return;
    }

    render();

    const duration = modeId === "maker" ? 2800 : 3600;
    modeState.timer = window.setTimeout(() => {
      modeState.mission = drawMission(modeId);
      if (modeId === "simple") {
        modeState.candidateOrganisms = drawCandidateOrganisms(3);
      }
      modeState.isGenerating = false;
      modeState.timer = null;
      render();
    }, duration);
  }

  function renderHome() {
    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-hero">
          <div class="randomizer-hero-glow randomizer-hero-glow-a"></div>
          <div class="randomizer-hero-glow randomizer-hero-glow-b"></div>
          <p class="randomizer-hero-kicker">BioMimis</p>
          <h1>RANDOMIZER</h1>
          <p class="randomizer-hero-subtitle">Choose one mode to open a city mission for your class.</p>
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
    const showGenerateBtn = !modeState.isGenerating && !modeState.mission;
    const isBossLoading = mode.id === "boss" && modeState.isGenerating;

    let bodyMarkup = "";
    if (modeState.isGenerating) {
      if (mode.id === "boss") {
        bodyMarkup = modeState.bossPhase === "glitch"
          ? renderBossGlitchStage()
          : renderBossWarningStage();
      } else if (mode.id === "maker") {
        bodyMarkup = renderGlassStage();
      } else {
        bodyMarkup = renderSproutStage();
      }
    } else if (modeState.mission) {
      if (mode.id === "simple") {
        bodyMarkup = renderStarterMission(modeState.mission, modeState);
      } else if (mode.id === "maker") {
        bodyMarkup = renderMakerMission(modeState.mission);
      } else if (mode.id === "boss") {
        bodyMarkup = renderBossMission(modeState.mission, modeState.assignedOrganism);
      }
    }

    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-mode-screen randomizer-mode-screen-${escapeHtml(mode.id)}${isBossLoading ? " is-boss-loading" : ""}">
          <div class="randomizer-mode-screen-topbar">
            <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
          </div>
          <div class="randomizer-mode-screen-head">
            <h2>${escapeHtml(mode.title)}</h2>
          </div>
          ${showGenerateBtn ? `
            <div class="randomizer-mode-screen-cta">
              <button class="randomizer-generate-btn" type="button" data-action="generate">Generate Mission</button>
            </div>
          ` : ""}
          ${bodyMarkup ? `<div class="randomizer-mode-screen-body">${bodyMarkup}</div>` : ""}
        </section>
      </section>
    `;

    root.querySelector('[data-action="back"]')?.addEventListener("click", goHome);
    root.querySelector('[data-action="generate"]')?.addEventListener("click", () => generateMission(mode.id));
    root.querySelectorAll('[data-action="pick-organism"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const org = modeState.candidateOrganisms.find((o) => o.id === btn.dataset.organismId);
        if (org) {
          modeState.selectedOrganism = org;
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
