import { escapeHtml } from "../../utils.js";

const CARD_DECOR = {
  simple: `
    <span class="rc-decor rc-calm-orb" aria-hidden="true"></span>
    <span class="rc-decor rc-calm-ring" aria-hidden="true"></span>
    <span class="rc-decor rc-calm-leaf rc-calm-leaf-a" aria-hidden="true"></span>
    <span class="rc-decor rc-calm-leaf rc-calm-leaf-b" aria-hidden="true"></span>
  `,
  maker: `
    <span class="rc-decor rc-moderate-grid" aria-hidden="true"></span>
    <span class="rc-decor rc-moderate-orbit" aria-hidden="true"></span>
    <span class="rc-decor rc-moderate-node rc-moderate-node-a" aria-hidden="true"></span>
    <span class="rc-decor rc-moderate-node rc-moderate-node-b" aria-hidden="true"></span>
    <span class="rc-decor rc-moderate-node rc-moderate-node-c" aria-hidden="true"></span>
  `,
  boss: `
    <span class="rc-decor rc-chaotic-rift" aria-hidden="true"></span>
    <span class="rc-decor rc-chaotic-scan" aria-hidden="true"></span>
    <span class="rc-decor rc-chaotic-shard rc-chaotic-shard-a" aria-hidden="true"></span>
    <span class="rc-decor rc-chaotic-shard rc-chaotic-shard-b" aria-hidden="true"></span>
    <span class="rc-decor rc-chaotic-glitch" aria-hidden="true"></span>
  `,
};

export function createModeCard(mode, onOpen) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `randomizer-mode-card randomizer-mode-${mode.id}`;
  element.innerHTML = `
    <span class="randomizer-mode-square-border" aria-hidden="true"></span>
    <span class="randomizer-mode-square-surface" aria-hidden="true"></span>
    <span class="randomizer-mode-square-glow" aria-hidden="true"></span>
    ${CARD_DECOR[mode.id] || ""}
    <div class="randomizer-mode-square-copy">
      <span class="randomizer-mode-square-title">${escapeHtml(mode.title)}</span>
      <span class="randomizer-mode-square-tagline">${escapeHtml(mode.tagline)}</span>
    </div>
  `;
  element.addEventListener("click", onOpen);
  return element;
}
