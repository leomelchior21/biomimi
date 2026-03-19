export function renderScoreboard(container, players, { title = "Scoreboard", subtitle = "" } = {}) {
  const sorted = [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  container.className = "scoreboard";
  container.innerHTML = `
    <p class="panel-eyebrow">${title}</p>
    <h3>${subtitle || "Six rounds. Ranked classroom play."}</h3>
    <div class="scoreboard-list">
      ${sorted.map((player, index) => `
        <div class="scoreboard-item">
          <div class="score-rank">${index + 1}</div>
          <div>
            <strong>${player.name}${player.isSelf ? " (You)" : ""}</strong>
            <div class="panel-copy">${player.ready ? "Ready" : "Waiting"}${player.lastRoundPoints != null ? ` • +${player.lastRoundPoints} last round` : ""}</div>
          </div>
          <div class="score-value">${player.score}</div>
        </div>
      `).join("")}
    </div>
  `;
}
