import { escapeHtml } from "../../utils.js";

export function createModeCard(mode, onOpen) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `randomizer-mode-card randomizer-mode-${mode.id}`;
  element.innerHTML = `
    <span class="randomizer-mode-square-border" aria-hidden="true"></span>
    <span class="randomizer-mode-square-surface" aria-hidden="true"></span>
    <div class="randomizer-mode-square-copy">
      <span class="randomizer-mode-square-badge">${escapeHtml(mode.badge)}</span>
      <span class="randomizer-mode-square-title">${escapeHtml(mode.title)}</span>
      <span class="randomizer-mode-square-tagline">${escapeHtml(mode.tagline)}</span>
    </div>
  `;
  element.addEventListener("click", onOpen);
  return element;
}
