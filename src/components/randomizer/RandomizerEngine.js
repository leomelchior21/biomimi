import { RANDOMIZER_MISSION_POOLS } from "../../data/randomizerMissions.js";
import { shuffle } from "../../utils.js";
import { createModeCard } from "./ModeCard.js";

const MODES = [
  { id: "simple", title: "Starter Mission" },
  { id: "maker", title: "Maker Mission" },
  { id: "boss", title: "Final Boss" },
];

function createDeck(modeId, excludeId = null) {
  const pool = RANDOMIZER_MISSION_POOLS[modeId] || [];
  const available = excludeId ? pool.filter((mission) => mission.id !== excludeId) : pool;
  return shuffle(available);
}

function createCardState(modeId) {
  return {
    mission: null,
    deck: createDeck(modeId),
    isGenerating: false,
    timer: null,
  };
}

export function renderRandomizerEngine(root) {
  const state = {
    cards: Object.fromEntries(MODES.map((mode) => [mode.id, createCardState(mode.id)])),
  };

  function clearTimer(card) {
    if (card.timer) {
      window.clearTimeout(card.timer);
      card.timer = null;
    }
  }

  function clearAllTimers() {
    Object.values(state.cards).forEach(clearTimer);
  }

  function drawMission(modeId) {
    const card = state.cards[modeId];
    if (!card.deck.length) {
      card.deck = createDeck(modeId, card.mission?.id ?? null);
    }

    const nextMission = card.deck.pop();
    if (nextMission) {
      return nextMission;
    }

    return (RANDOMIZER_MISSION_POOLS[modeId] || [])[0] || null;
  }

  function generateMission(modeId) {
    const card = state.cards[modeId];
    if (!card || card.isGenerating) return;

    clearTimer(card);
    card.isGenerating = true;
    render();

    card.timer = window.setTimeout(() => {
      card.mission = drawMission(modeId);
      card.isGenerating = false;
      card.timer = null;
      render();
    }, 5000);
  }

  function render() {
    root.innerHTML = `
      <section class="mode-page randomizer-page">
        <section class="randomizer-hero">
          <div class="randomizer-hero-glow randomizer-hero-glow-a"></div>
          <div class="randomizer-hero-glow randomizer-hero-glow-b"></div>
          <p class="randomizer-hero-kicker">BioMimis</p>
          <h1>RANDOMIZER</h1>
          <p class="randomizer-hero-subtitle">Choose a mode, let the mission grow, and hand your class a fresh challenge. Each card cycles through 20 open-ended prompts.</p>
        </section>

        <section class="randomizer-mode-grid" id="randomizer-mode-grid"></section>
      </section>
    `;

    const grid = root.querySelector("#randomizer-mode-grid");
    MODES.forEach((mode) => {
      grid.appendChild(createModeCard(mode, state.cards[mode.id], () => generateMission(mode.id)));
    });
  }

  render();

  return () => {
    clearAllTimers();
  };
}
