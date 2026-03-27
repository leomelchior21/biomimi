import { escapeHtml } from "../../utils.js";
import { renderCardGrid } from "../cardGrid.js";

function renderSystemChoices(systems, selectedSystemId) {
  return systems.map((system) => `
    <button class="randomizer-system-chip${selectedSystemId === system.id ? " active" : ""}" type="button" data-system-id="${system.id}">
      <strong>${escapeHtml(system.name)}</strong>
      <span>${escapeHtml(system.prompt)}</span>
    </button>
  `).join("");
}

export function renderMakerView(container, context) {
  const {
    run,
    draft,
    onBack,
    onGenerateAgain,
    onSelectOrganism,
    onSelectSystem,
    onDraftInput,
    createCardOptions,
  } = context;

  container.innerHTML = `
    <section class="randomizer-playview randomizer-maker-view">
      <div class="randomizer-view-topbar">
        <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
        <div class="randomizer-view-meta">
          <span class="randomizer-chip">MISSAO MAKER</span>
          <button class="btn-ghost randomizer-mini-regen" type="button" data-action="problem">New problem</button>
        </div>
      </div>

      <section class="randomizer-maker-problem">
        <div>
          <p class="randomizer-section-label">Problem</p>
          <h2>${escapeHtml(run.problem.title)}</h2>
          <p>${escapeHtml(run.problem.prompt)}</p>
        </div>
        <div class="randomizer-tag-row">
          ${run.problem.tags.map((tag) => `<span class="randomizer-soft-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </section>

      ${run.selectedOrganism ? `
        <section class="randomizer-maker-selected">
          <div class="randomizer-maker-selected-copy">
            <p class="randomizer-section-label">Chosen BioMimi</p>
            <h3>${escapeHtml(run.selectedOrganism.name)}</h3>
            <p>${escapeHtml(run.selectedOrganism.designTakeaway)}</p>
          </div>
          <div class="randomizer-maker-selected-system">
            <div class="randomizer-maker-bridge">
              <span>Design your system</span>
              <p>Select one system direction to frame the concept.</p>
            </div>
            <div class="randomizer-system-grid">
              ${renderSystemChoices(run.availableSystems, run.system?.id ?? null)}
            </div>
          </div>
        </section>
      ` : `
        <section class="randomizer-maker-prompt">
          <div class="randomizer-maker-bridge">
            <span>Choose nature. Build your system.</span>
            <p>Select a BioMimi card below to expand the challenge.</p>
          </div>
        </section>
      `}

      <section class="randomizer-maker-grid-shell">
        <div class="randomizer-output-head">
          <div>
            <p class="randomizer-section-label">BioMimi grid</p>
            <h3>Explore and lock one strategy.</h3>
          </div>
          <span class="randomizer-draft-note">Hover to inspect, click to choose</span>
        </div>
        <div class="card-grid card-grid-masonry randomizer-maker-grid" id="randomizer-maker-grid"></div>
      </section>

      ${run.selectedOrganism ? `
        <section class="randomizer-output-shell">
          <div class="randomizer-output-head">
            <div>
              <p class="randomizer-section-label">Output</p>
              <h3>Turn the selection into a clear concept.</h3>
            </div>
            <span class="randomizer-draft-note">Saved locally</span>
          </div>

          <div class="randomizer-output-grid">
            <label class="randomizer-field">
              <span>Your system name</span>
              <input type="text" name="title" value="${escapeHtml(draft.title)}" placeholder="Name the system">
            </label>
            <label class="randomizer-field">
              <span>How does it work?</span>
              <textarea name="description" rows="6" placeholder="Describe how the organism principle becomes an applied system.">${escapeHtml(draft.description)}</textarea>
            </label>
            <label class="randomizer-field">
              <span>Sketch placeholder</span>
              <textarea name="sketch" rows="4" placeholder="Add a diagram note, spatial move, or material list.">${escapeHtml(draft.sketch)}</textarea>
            </label>
          </div>
        </section>
      ` : ""}
    </section>
  `;

  container.querySelector('[data-action="back"]')?.addEventListener("click", onBack);
  container.querySelector('[data-action="problem"]')?.addEventListener("click", onGenerateAgain);
  container.querySelectorAll("[data-system-id]").forEach((button) => {
    button.addEventListener("click", () => onSelectSystem(button.dataset.systemId));
  });
  container.querySelectorAll(".randomizer-field input, .randomizer-field textarea").forEach((field) => {
    field.addEventListener("input", (event) => {
      onDraftInput(event.target.name, event.target.value);
    });
  });

  const grid = container.querySelector("#randomizer-maker-grid");
  renderCardGrid(
    grid,
    run.organisms,
    (card) => createCardOptions(card, onSelectOrganism),
    { animate: true },
  );
}
