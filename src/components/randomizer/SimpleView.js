import { escapeHtml } from "../../utils.js";
import { KINGDOM_COLORS, STAT_KEYS, STAT_LABELS } from "../../data/organisms.js";

function createStatBars(organism) {
  return STAT_KEYS.slice(0, 3).map((stat) => `
    <div class="randomizer-flip-stat">
      <span>${STAT_LABELS[stat]}</span>
      <div class="randomizer-flip-stat-bar">
        <i style="width:${organism.stats[stat]}%; background:${KINGDOM_COLORS[organism.category]};"></i>
      </div>
    </div>
  `).join("");
}

export function renderSimpleView(container, context) {
  const { run, draft, onBack, onGenerateAgain, onToggleFlip, onDraftInput } = context;

  container.innerHTML = `
    <section class="randomizer-playview randomizer-simple-view">
      <div class="randomizer-view-topbar">
        <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
        <div class="randomizer-view-meta">
          <span class="randomizer-chip">MISSAO SIMPLES</span>
          <span class="randomizer-chip">${escapeHtml(run.system.name)}</span>
        </div>
      </div>

      <div class="randomizer-simple-layout">
        <article class="randomizer-problem-block">
          <p class="randomizer-section-label">Problem</p>
          <h2>${escapeHtml(run.problem.title)}</h2>
          <p>${escapeHtml(run.problem.prompt)}</p>
          <div class="randomizer-problem-pressure">
            <span>Pressure</span>
            <strong>${escapeHtml(run.problem.pressure)}</strong>
          </div>
          <div class="randomizer-tag-row">
            ${run.problem.tags.map((tag) => `<span class="randomizer-soft-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </article>

        <article class="randomizer-center-bridge">
          <div class="randomizer-center-ring">
            <span>Design your system</span>
          </div>
          <p>${escapeHtml(run.system.prompt)}</p>
          <button class="btn randomizer-regen-btn" type="button" data-action="generate">Generate again</button>
        </article>

        <article class="randomizer-flip-card ${run.isFlipped ? "is-flipped" : ""}" data-action="flip" style="--flip-accent:${KINGDOM_COLORS[run.organism.category]};">
          <div class="randomizer-flip-scene">
            <div class="randomizer-flip-face randomizer-flip-front">
              <img src="${escapeHtml(run.organism.imagePath)}" alt="${escapeHtml(run.organism.name)}" loading="lazy" decoding="async">
              <div class="randomizer-flip-overlay"></div>
              <div class="randomizer-flip-copy">
                <p>${escapeHtml(run.organism.category)}</p>
                <h3>${escapeHtml(run.organism.name)}</h3>
                <span>${escapeHtml(run.organism.designTakeaway)}</span>
              </div>
            </div>
            <div class="randomizer-flip-face randomizer-flip-back">
              <div class="randomizer-flip-back-head">
                <p>BioMimi insight</p>
                <strong>${escapeHtml(run.organism.principle)}</strong>
              </div>
              <div class="randomizer-flip-back-copy">
                <span>${escapeHtml(run.organism.architectureExample)}</span>
                <p>${escapeHtml(run.organism.story)}</p>
              </div>
              <div class="randomizer-flip-stats">
                ${createStatBars(run.organism)}
              </div>
            </div>
          </div>
        </article>
      </div>

      <section class="randomizer-output-shell">
        <div class="randomizer-output-head">
          <div>
            <p class="randomizer-section-label">Output</p>
            <h3>Build the concept before it disappears.</h3>
          </div>
          <span class="randomizer-draft-note">Saved locally</span>
        </div>

        <div class="randomizer-output-grid">
          <label class="randomizer-field">
            <span>Your system name</span>
            <input type="text" name="title" value="${escapeHtml(draft.title)}" placeholder="Give the system a name">
          </label>
          <label class="randomizer-field">
            <span>How does it work?</span>
            <textarea name="description" rows="6" placeholder="Explain the flow, behavior, and benefit of your system.">${escapeHtml(draft.description)}</textarea>
          </label>
          <label class="randomizer-field">
            <span>Sketch placeholder</span>
            <textarea name="sketch" rows="4" placeholder="Add a sketch note, label ideas, or leave drawing instructions for later.">${escapeHtml(draft.sketch)}</textarea>
          </label>
        </div>
      </section>
    </section>
  `;

  container.querySelector('[data-action="back"]')?.addEventListener("click", onBack);
  container.querySelector('[data-action="generate"]')?.addEventListener("click", onGenerateAgain);
  container.querySelector('[data-action="flip"]')?.addEventListener("click", onToggleFlip);
  container.querySelectorAll(".randomizer-field input, .randomizer-field textarea").forEach((field) => {
    field.addEventListener("input", (event) => {
      onDraftInput(event.target.name, event.target.value);
    });
  });
}
