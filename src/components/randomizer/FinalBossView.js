import { escapeHtml } from "../../utils.js";
import { KINGDOM_COLORS } from "../../data/organisms.js";

export function renderFinalBossView(container, context) {
  const { run, draft, onBack, onSurvive, onDraftInput } = context;
  const phase = run.phase || "warning";

  container.innerHTML = `
    <section class="randomizer-playview randomizer-boss-view ${phase === "reveal" ? "is-revealed" : ""}" data-sound-hook="final-boss">
      <div class="randomizer-boss-stage ${phase !== "warning" ? "is-hidden" : ""}">
        <div class="randomizer-boss-message">
          <p>FINAL BOSS</p>
          <h2>YOU HAVE NO CONTROL</h2>
          <span>The system is choosing for you.</span>
        </div>
      </div>

      <div class="randomizer-boss-stage randomizer-boss-glitch-stage ${phase !== "glitch" ? "is-hidden" : ""}">
        <div class="randomizer-boss-flicker"></div>
        <div class="randomizer-boss-distortion"></div>
        <div class="randomizer-boss-message glitch-text" data-text="ADAPT FAST">ADAPT FAST</div>
      </div>

      <div class="randomizer-boss-reveal ${phase === "reveal" ? "" : "is-hidden"}">
        <div class="randomizer-view-topbar randomizer-view-topbar-dark">
          <button class="btn-ghost randomizer-back-btn" type="button" data-action="back">Back to modes</button>
          <div class="randomizer-view-meta">
            <span class="randomizer-chip randomizer-chip-danger">FINAL BOSS</span>
            <span class="randomizer-chip">${escapeHtml(run.system.name)}</span>
          </div>
        </div>

        <div class="randomizer-boss-split">
          <article class="randomizer-boss-panel randomizer-boss-problem">
            <p class="randomizer-section-label">Problem</p>
            <h3>${escapeHtml(run.problem.title)}</h3>
            <p>${escapeHtml(run.problem.prompt)}</p>
            <strong>${escapeHtml(run.problem.pressure)}</strong>
          </article>

          <article class="randomizer-boss-panel randomizer-boss-organism" style="--boss-accent:${KINGDOM_COLORS[run.organism.category]};">
            <img src="${escapeHtml(run.organism.imagePath)}" alt="${escapeHtml(run.organism.name)}" loading="lazy" decoding="async">
            <div class="randomizer-boss-organism-copy">
              <p>${escapeHtml(run.organism.category)}</p>
              <h3>${escapeHtml(run.organism.name)}</h3>
              <span>${escapeHtml(run.organism.principle)}</span>
            </div>
          </article>
        </div>

        <section class="randomizer-boss-brief">
          <div>
            <p class="randomizer-section-label">Locked instruction</p>
            <h3>Design your system under pressure.</h3>
            <p>${escapeHtml(run.system.prompt)}</p>
          </div>
          <button class="btn randomizer-survive-btn" type="button" data-action="survive" data-sound-action="survive">Survive</button>
        </section>

        <section class="randomizer-output-shell randomizer-output-shell-dark">
          <div class="randomizer-output-head">
            <div>
              <p class="randomizer-section-label">Output</p>
              <h3>Name the system before the signal collapses.</h3>
            </div>
            <span class="randomizer-draft-note">Saved locally</span>
          </div>

          <div class="randomizer-output-grid">
            <label class="randomizer-field">
              <span>Your system name</span>
              <input type="text" name="title" value="${escapeHtml(draft.title)}" placeholder="Give the boss run a name">
            </label>
            <label class="randomizer-field">
              <span>How does it work?</span>
              <textarea name="description" rows="6" placeholder="Describe how you adapt to the constraint and make it perform.">${escapeHtml(draft.description)}</textarea>
            </label>
            <label class="randomizer-field">
              <span>Sketch placeholder</span>
              <textarea name="sketch" rows="4" placeholder="Describe the sketch, framing, sections, or interactions.">${escapeHtml(draft.sketch)}</textarea>
            </label>
          </div>
        </section>
      </div>
    </section>
  `;

  container.querySelector('[data-action="back"]')?.addEventListener("click", onBack);
  container.querySelector('[data-action="survive"]')?.addEventListener("click", onSurvive);
  container.querySelectorAll(".randomizer-field input, .randomizer-field textarea").forEach((field) => {
    field.addEventListener("input", (event) => {
      onDraftInput(event.target.name, event.target.value);
    });
  });
}
