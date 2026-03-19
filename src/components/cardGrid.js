import { createCard } from "./card.js";
import { animateEntrance } from "../ui/animations.js";

export function renderCardGrid(container, cards, cardOptions, options = {}) {
  const { animate = true } = options;
  container.innerHTML = "";

  if (!cards.length) {
    container.innerHTML = `
      <div class="empty-state">
        No organisms matched this combination. Try a different principle, kingdom, or stat focus.
      </div>
    `;
    return;
  }

  cards.forEach((card) => container.appendChild(createCard(card, cardOptions(card))));
  if (animate) {
    animateEntrance(container);
  }
}
