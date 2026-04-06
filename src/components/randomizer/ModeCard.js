import { escapeHtml } from "../../utils.js";

export function createModeCard(mode, onOpen) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `randomizer-mode-card randomizer-mode-${mode.id}`;
  element.innerHTML = `
    <span class="randomizer-mode-square-border" aria-hidden="true"></span>
    <span class="randomizer-mode-square-surface" aria-hidden="true"></span>
    <span class="randomizer-mode-square-glow" aria-hidden="true"></span>
    <span class="randomizer-mode-square-title">${escapeHtml(mode.title)}</span>
  `;
  element.addEventListener("click", onOpen);
  return element;
}
