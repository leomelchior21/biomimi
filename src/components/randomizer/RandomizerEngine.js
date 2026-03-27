import { ORGANISMS } from "../../data/organisms.js";
import { URBAN_PROBLEMS } from "../../data/problems.js";
import { SYSTEM_CATEGORIES } from "../../data/systems.js";
import { shuffle } from "../../utils.js";
import { createModeCard } from "./ModeCard.js";
import { renderSimpleView } from "./SimpleView.js";
import { renderMakerView } from "./MakerView.js";
import { renderFinalBossView } from "./FinalBossView.js";

const DRAFT_STORAGE_KEY = "biomimi-randomizer-drafts";

const MODES = [
  {
    id: "simple",
    kicker: "Guided thinking",
    title: "MISSAO SIMPLES",
    description: "Get a problem and a living inspiration. Design the system.",
  },
  {
    id: "maker",
    kicker: "Autonomy",
    title: "MISSAO MAKER",
    description: "Start from a problem. Choose nature. Build your system.",
  },
  {
    id: "boss",
    kicker: "Creative chaos",
    title: "FINAL BOSS",
    description: "You don't choose. You adapt.",
  },
];

function randomItem(items, exceptId = null) {
  const pool = exceptId ? items.filter((item) => item.id !== exceptId) : items;
  const source = pool.length ? pool : items;
  return source[Math.floor(Math.random() * source.length)];
}

function readDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeDrafts(drafts) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function makeDraftKey(modeId, run) {
  const organismId = run?.organism?.id || run?.selectedOrganism?.id || "open";
  const systemId = run?.system?.id || "unset";
  const problemId = run?.problem?.id || "none";
  return [modeId, problemId, organismId, systemId].join(":");
}

function getDraft(modeId, run) {
  const drafts = readDrafts();
  return drafts[makeDraftKey(modeId, run)] || { title: "", description: "", sketch: "" };
}

function saveDraft(modeId, run, field, value) {
  const drafts = readDrafts();
  const key = makeDraftKey(modeId, run);
  drafts[key] = {
    ...(drafts[key] || { title: "", description: "", sketch: "" }),
    [field]: value,
  };
  writeDrafts(drafts);
}

function createSimpleRun(previousRun = null) {
  return {
    problem: randomItem(URBAN_PROBLEMS, previousRun?.problem?.id ?? null),
    organism: randomItem(ORGANISMS, previousRun?.organism?.id ?? null),
    system: randomItem(SYSTEM_CATEGORIES, previousRun?.system?.id ?? null),
    isFlipped: false,
  };
}

function createMakerRun(previousRun = null) {
  return {
    problem: randomItem(URBAN_PROBLEMS, previousRun?.problem?.id ?? null),
    organisms: shuffle(ORGANISMS),
    selectedOrganism: null,
    availableSystems: shuffle(SYSTEM_CATEGORIES).slice(0, 4),
    system: null,
  };
}

function createBossRun(previousRun = null) {
  return {
    phase: "warning",
    problem: randomItem(URBAN_PROBLEMS, previousRun?.problem?.id ?? null),
    organism: randomItem(ORGANISMS, previousRun?.organism?.id ?? null),
    system: randomItem(SYSTEM_CATEGORIES, previousRun?.system?.id ?? null),
  };
}

export function renderRandomizerEngine(root) {
  const state = {
    currentMode: null,
    simpleRun: null,
    makerRun: null,
    bossRun: null,
  };

  let bossTimers = [];
  let simpleFlipTimer = null;

  function clearBossTimers() {
    bossTimers.forEach((timer) => window.clearTimeout(timer));
    bossTimers = [];
  }

  function clearSimpleFlipTimer() {
    if (simpleFlipTimer) {
      window.clearTimeout(simpleFlipTimer);
      simpleFlipTimer = null;
    }
  }

  function scheduleSimpleFlip(delay = 260) {
    clearSimpleFlipTimer();
    simpleFlipTimer = window.setTimeout(() => {
      if (!state.simpleRun || state.currentMode !== "simple") return;
      state.simpleRun.isFlipped = true;
      root.querySelector(".randomizer-flip-card")?.classList.add("is-flipped");
      simpleFlipTimer = null;
    }, delay);
  }

  function startBossSequence() {
    clearBossTimers();
    if (!state.bossRun) return;
    state.bossRun.phase = "warning";
    bossTimers.push(
      window.setTimeout(() => {
        if (!state.bossRun) return;
        state.bossRun.phase = "glitch";
        render();
      }, 1250),
    );
    bossTimers.push(
      window.setTimeout(() => {
        if (!state.bossRun) return;
        state.bossRun.phase = "reveal";
        render();
      }, 2450),
    );
  }

  function goHome() {
    state.currentMode = null;
    clearBossTimers();
    clearSimpleFlipTimer();
    render();
  }

  function selectMode(modeId) {
    state.currentMode = modeId;
    if (modeId === "simple") {
      state.simpleRun = createSimpleRun(state.simpleRun);
    }
    if (modeId === "maker") {
      state.makerRun = createMakerRun(state.makerRun);
    }
    if (modeId === "boss") {
      state.bossRun = createBossRun(state.bossRun);
      startBossSequence();
    } else {
      clearBossTimers();
    }
    if (modeId !== "simple") {
      clearSimpleFlipTimer();
    }
    render();
  }

  function createHomeView() {
    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-hero">
          <div class="randomizer-hero-glow randomizer-hero-glow-a"></div>
          <div class="randomizer-hero-glow randomizer-hero-glow-b"></div>
          <p class="randomizer-hero-kicker">BioMimis</p>
          <h1>RANDOMIZER</h1>
          <p class="randomizer-hero-subtitle">Combine problems, nature, and systems to design the future.</p>
        </section>

        <section class="randomizer-mode-grid" id="randomizer-mode-grid"></section>

        <section class="randomizer-lab-note">
          <div>
            <p class="randomizer-section-label">System pool</p>
            <h2>Every run ends with a system prompt.</h2>
          </div>
          <div class="randomizer-system-preview">
            ${SYSTEM_CATEGORIES.map((system) => `<span class="randomizer-soft-tag">${system.name}</span>`).join("")}
          </div>
        </section>
      </section>
    `;

    const grid = root.querySelector("#randomizer-mode-grid");
    MODES.forEach((mode) => {
      grid.appendChild(createModeCard(mode, selectMode));
    });
  }

  function renderSimple() {
    const run = state.simpleRun || createSimpleRun();
    state.simpleRun = run;
    const draft = getDraft("simple", run);

    renderSimpleView(root, {
      run,
      draft,
      onBack: goHome,
      onGenerateAgain: () => {
        state.simpleRun = createSimpleRun(state.simpleRun);
        render();
        scheduleSimpleFlip(360);
      },
      onToggleFlip: () => {
        state.simpleRun.isFlipped = !state.simpleRun.isFlipped;
        root.querySelector(".randomizer-flip-card")?.classList.toggle("is-flipped", state.simpleRun.isFlipped);
      },
      onDraftInput: (field, value) => {
        saveDraft("simple", state.simpleRun, field, value);
      },
    });

    if (!state.simpleRun.isFlipped) {
      scheduleSimpleFlip(260);
    } else {
      clearSimpleFlipTimer();
    }
  }

  function renderMaker() {
    const run = state.makerRun || createMakerRun();
    state.makerRun = run;
    const draft = getDraft("maker", run);

    renderMakerView(root, {
      run,
      draft,
      onBack: goHome,
      onGenerateAgain: () => {
        state.makerRun = createMakerRun(state.makerRun);
        render();
      },
      onSelectOrganism: (card) => {
        state.makerRun.selectedOrganism = card;
        if (!state.makerRun.system) {
          state.makerRun.system = state.makerRun.availableSystems[0];
        }
        render();
      },
      onSelectSystem: (systemId) => {
        state.makerRun.system = state.makerRun.availableSystems.find((item) => item.id === systemId) || state.makerRun.system;
        render();
      },
      onDraftInput: (field, value) => {
        saveDraft("maker", state.makerRun, field, value);
      },
      createCardOptions: (card, onSelectOrganism) => ({
        onOpen: () => onSelectOrganism(card),
        isSelected: state.makerRun?.selectedOrganism?.id === card.id,
        isCompared: false,
        isVisited: false,
        highlight: null,
      }),
    });
  }

  function renderBoss() {
    const run = state.bossRun || createBossRun();
    state.bossRun = run;
    const draft = getDraft("boss", run);

    renderFinalBossView(root, {
      run,
      draft,
      onBack: goHome,
      onSurvive: () => {
        state.bossRun = createBossRun(state.bossRun);
        startBossSequence();
        render();
      },
      onDraftInput: (field, value) => {
        saveDraft("boss", state.bossRun, field, value);
      },
    });
  }

  function render() {
    if (!state.currentMode) {
      createHomeView();
      return;
    }
    if (state.currentMode === "simple") {
      renderSimple();
      return;
    }
    if (state.currentMode === "maker") {
      renderMaker();
      return;
    }
    renderBoss();
  }

  render();

  return () => {
    clearBossTimers();
    clearSimpleFlipTimer();
  };
}
