import { KINGDOM_COLORS } from "../data/organisms.js";
import { createCard } from "./card.js";
import { createPerformanceBars } from "./performanceBars.js";

let modalRoot = null;

export function initModal(root) {
  modalRoot = root;
  modalRoot.className = "modal-root hidden";
}

export function openCardModal(card, { relatedCards = [], onSelectRelated } = {}) {
  if (!modalRoot) {
    return;
  }

  const color = KINGDOM_COLORS[card.kingdom];
  modalRoot.classList.remove("hidden");
  modalRoot.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-layout">
        <aside class="modal-visual-column">${createCard(card).innerHTML}</aside>
        <section class="modal-main">
          <div class="modal-head">
            <div>
              <p class="panel-eyebrow">Deep Dive</p>
              <h2>${card.name}</h2>
              <div class="challenge-meta">
                <span class="kingdom-chip" style="color:${color}">${card.kingdom}</span>
                <span class="tag-chip">${card.application}</span>
              </div>
            </div>
            <button class="modal-close" type="button" aria-label="Close">×</button>
          </div>

          <p class="modal-copy">${card.description}</p>

          <div class="modal-sections">
            <div class="modal-block"><h4>Biomimicry Principle</h4><p>${card.principle}</p></div>
            <div class="modal-block"><h4>Architecture / Engineering Application</h4><p>${card.architectureExample}</p></div>
            <div class="modal-block"><h4>Design Takeaway</h4><p>${card.designTakeaway}</p></div>
            <div class="modal-block"><h4>Student Story</h4><p>${card.story}</p></div>
            <div class="modal-block">
              <h4>Performance Profile</h4>
              ${createPerformanceBars(card)}
            </div>
            <div class="modal-block"><h4>Tags</h4><div class="tag-row">${card.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div></div>
            <div class="modal-block"><h4>Related Cards</h4><div class="related-grid" id="related-grid"></div></div>
          </div>
        </section>
      </div>
    </div>
  `;

  modalRoot.querySelector(".modal-close").addEventListener("click", closeModal);
  modalRoot.addEventListener("click", handleOverlayClick);

  const relatedGrid = modalRoot.querySelector("#related-grid");
  relatedCards.slice(0, 4).forEach((related) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-card";
    button.innerHTML = `<span class="tiny-label">${related.kingdom}</span><h5>${related.name}</h5><p>${related.principle}</p>`;
    button.addEventListener("click", () => onSelectRelated?.(related));
    relatedGrid.appendChild(button);
  });

  document.body.style.overflow = "hidden";
}

function handleOverlayClick(event) {
  if (event.target === modalRoot) {
    closeModal();
  }
}

export function closeModal() {
  if (!modalRoot) {
    return;
  }

  modalRoot.classList.add("hidden");
  modalRoot.innerHTML = "";
  modalRoot.removeEventListener("click", handleOverlayClick);
  document.body.style.overflow = "";
}
