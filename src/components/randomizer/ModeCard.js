function createParticles(count = 8) {
  return Array.from({ length: count }, (_, index) => {
    const x = 8 + ((index * 11) % 84);
    const y = 10 + ((index * 17) % 76);
    const delay = `${index * 0.55}s`;
    const duration = `${5 + (index % 4)}s`;
    return `<span class="randomizer-mode-particle" style="--x:${x}%;--y:${y}%;--delay:${delay};--duration:${duration};"></span>`;
  }).join("");
}

export function createModeCard(mode, onSelect) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `randomizer-mode-card randomizer-mode-${mode.id}`;
  element.setAttribute("data-mode-card", mode.id);
  element.innerHTML = `
    <span class="randomizer-mode-border" aria-hidden="true"></span>
    <span class="randomizer-mode-surface" aria-hidden="true"></span>
    <span class="randomizer-mode-noise" aria-hidden="true"></span>
    <span class="randomizer-mode-particles" aria-hidden="true">${createParticles(mode.id === "maker" ? 10 : 8)}</span>
    <span class="randomizer-mode-visual" aria-hidden="true">
      ${mode.id === "maker" ? `
        <span class="randomizer-mode-maker-grid"></span>
        <span class="randomizer-maker-silhouettes">
          <span></span><span></span><span></span>
        </span>
      ` : ""}
      ${mode.id === "boss" ? `
        <span class="randomizer-boss-scan"></span>
        <span class="randomizer-boss-glitch"></span>
      ` : ""}
    </span>
    <span class="randomizer-mode-copy">
      <span class="randomizer-mode-kicker">${mode.kicker}</span>
      <strong>${mode.title}</strong>
      <span>${mode.description}</span>
    </span>
  `;
  element.addEventListener("click", () => onSelect(mode.id));
  return element;
}
