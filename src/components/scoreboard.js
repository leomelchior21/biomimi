import { escapeHtml } from "../utils.js";

const MEDALS = ["🥇", "🥈", "🥉"];

export function renderScoreboard(container, players, { title = "Scoreboard", subtitle = "" } = {}) {
  const sorted = [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  container.className = "scoreboard";
  container.innerHTML = `
    <p class="panel-eyebrow">${title}</p>
    ${subtitle ? `<p class="scoreboard-sub">${subtitle}</p>` : ""}
    <div class="scoreboard-list">
      ${sorted.map((player, index) => `
        <div class="scoreboard-item ${player.isSelf ? "scoreboard-self" : ""}">
          <div class="score-rank">${MEDALS[index] || index + 1}</div>
          <div class="scoreboard-player-info">
            <strong>${escapeHtml(player.name)}${player.isSelf ? " <span class='arena-you'>(You)</span>" : ""}</strong>
            ${player.lastRoundPoints != null
              ? `<span class="score-delta">+${player.lastRoundPoints}</span>`
              : ""}
          </div>
          <div class="score-value">${player.score}</div>
        </div>
      `).join("")}
    </div>
  `;
}
