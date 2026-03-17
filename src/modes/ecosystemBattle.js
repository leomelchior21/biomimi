import { STAT_KEYS, STAT_LABELS } from "../data/organisms.js";
import { createBattleCard } from "../components/card.js";
import { renderScoreboard } from "../components/scoreboard.js";
import { hostRoom, joinRoom } from "../multiplayer/room.js";

export function renderEcosystemBattle(root) {
  const state = { controller: null, snapshot: null, playerName: "", roomCode: "", selectedStat: null, error: "" };

  function clearController() {
    state.controller?.leave();
    state.controller = null;
    state.snapshot = null;
    state.selectedStat = null;
  }

  function onSnapshot(snapshot) {
    state.snapshot = snapshot;
    state.error = "";
    state.selectedStat = snapshot.submittedChoice ?? null;
    render();
  }

  function onError(message) {
    state.error = message;
    render();
  }

  function intro() {
    return `
      <section class="battle-layout">
        <section class="battle-stage battle-entry-stage">
          <div class="battle-entry-blob battle-entry-blob-a"></div>
          <div class="battle-entry-blob battle-entry-blob-b"></div>
          <div class="battle-entry-blob battle-entry-blob-c"></div>
          <div class="battle-entry-shell">
          <p class="panel-eyebrow">Join the Lab</p>
          <h3>Create or join a classroom room</h3>
          <p>Pick a name, host a room, or join with a short code from the teacher screen.</p>
          <div class="control-stack">
            <label class="field"><span class="meta-label">Player name</span><input class="text-input" id="player-name" placeholder="Enter your name" value="${state.playerName}"></label>
            <div class="room-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
              <div class="room-card">
                <p class="panel-eyebrow">Host</p><h3>Start a room</h3><p>Create a short room code and wait for students to join.</p>
                <button class="btn" id="create-room" type="button">Create room</button>
              </div>
              <div class="room-card">
                <p class="panel-eyebrow">Join</p><h3>Enter room code</h3><p>Use the code on the host screen to join the same classroom match.</p>
                <label class="field"><span class="meta-label">Room code</span><input class="text-input" id="room-code" maxlength="4" placeholder="ABCD" value="${state.roomCode}"></label>
                <button class="btn-secondary" id="join-room" type="button">Join room</button>
              </div>
            </div>
            ${state.error ? `<div class="battle-status">${state.error}</div>` : ""}
          </div>
          </div>
        </section>
      </section>
    `;
  }

  function lobby(snapshot) {
    const self = snapshot.players.find((player) => player.isSelf);
    return `
      <section class="battle-layout">
        <section class="battle-columns">
          <div class="room-card">
            <p class="panel-eyebrow">Room Ready</p>
            <h3>${snapshot.role === "host" ? "Teacher control panel" : "Connected to room"}</h3>
            <p>${snapshot.role === "host" ? "Share the code, watch ready states, then launch the match." : "When everyone is ready, the host can begin round one."}</p>
            <div class="room-code">${snapshot.roomCode}</div>
            <div class="action-row">
              <button class="btn-ghost" id="copy-code" type="button">Copy code</button>
              <button class="btn-danger" id="leave-room" type="button">Leave room</button>
            </div>
            <div class="action-row">
              <button class="${self.ready ? "btn-secondary" : "btn"}" id="toggle-ready" type="button">${self.ready ? "Ready ✔" : "Mark ready"}</button>
              ${snapshot.role === "host" ? `<button class="btn" id="start-match" type="button" ${snapshot.canStart ? "" : "disabled"}>Start 6-round match</button>` : ""}
            </div>
            ${state.error ? `<div class="battle-status">${state.error}</div>` : ""}
          </div>
          <div class="battle-stage">
            <p class="panel-eyebrow">Player Roster</p>
            <h3>${snapshot.players.length} / 4 connected</h3>
            <p>Everyone needs to mark ready before the host begins.</p>
            <div class="roster">
              ${snapshot.players.map((player) => `
                <div class="roster-player">
                  <div><strong>${player.name}${player.isSelf ? " (You)" : ""}</strong><div class="panel-copy">${player.connected ? "Connected" : "Disconnected"}</div></div>
                  <div class="status-dot ${player.ready ? "ready" : ""}"></div>
                </div>
              `).join("")}
            </div>
          </div>
        </section>
      </section>
    `;
  }

  function round(snapshot) {
    return `
      <section class="battle-layout">
        <section class="battle-columns">
          <aside id="battle-scoreboard"></aside>
          <section class="round-grid">
            <div class="challenge-card">
              <p class="panel-eyebrow">Round ${snapshot.roundNumber} of ${snapshot.totalRounds}</p>
              <h3>${snapshot.challenge.title}</h3>
              <p>${snapshot.challenge.prompt}</p>
              <div class="challenge-meta">
                <span class="challenge-tag">Focus stat: ${STAT_LABELS[snapshot.challenge.focusStat]}</span>
                <span class="tag-chip">${snapshot.challenge.difficulty}</span>
                <span class="tag-chip">${snapshot.challenge.category}</span>
                ${snapshot.challenge.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}
              </div>
            </div>
            <div class="battle-stage">
              <p class="panel-eyebrow">Your Secret Organism</p>
              <h3>Choose the stat you will defend</h3>
              <p>Stat choice is locked once you submit. Cards reveal together after everyone decides.</p>
              <div id="secret-card"></div>
              <button class="btn-danger" id="leave-room" type="button">Leave room</button>
            </div>
          </section>
        </section>
      </section>
    `;
  }

  function insight(snapshot) {
    return `
      <section class="battle-layout">
        <section class="insight-grid">
          <div class="result-card">
            <div><p class="panel-eyebrow">Round ${snapshot.roundNumber} Reveal</p><h3>${snapshot.insight.designInsightTitle}</h3><p>${snapshot.insight.challenge.prompt}</p></div>
            <div class="result-reveal" id="round-results"></div>
          </div>
          <div class="insight-panel">
            <p class="panel-eyebrow">Design Insight</p>
            <h3>${snapshot.insight.winner.playerName} takes the round</h3>
            <p>${snapshot.insight.designInsightBody}</p>
            <div class="battle-status">Winning stat: ${STAT_LABELS[snapshot.insight.winner.selectedStat]} • Base ${snapshot.insight.winner.base} + Focus ${snapshot.insight.winner.focusBonus} + Tag match ${snapshot.insight.winner.tagBonus}</div>
            <div class="battle-footer">
              ${snapshot.role === "host" ? `<button class="btn" id="next-round" type="button">${snapshot.roundNumber === snapshot.totalRounds ? "Finish match" : "Next round"}</button>` : `<div class="battle-status">Waiting for the host to continue to the next round.</div>`}
              <button class="btn-danger" id="leave-room" type="button">Leave room</button>
            </div>
          </div>
        </section>
      </section>
    `;
  }

  function final(snapshot) {
    return `
      <section class="battle-layout">
        <section class="final-grid">
          <div class="hero-panel">
            <p class="eyebrow">Match Complete</p>
            <h2 class="hero-title">Final classroom standings</h2>
            <p class="hero-copy">Six rounds are complete. Use the ranking to discuss why different organisms won in different contexts.</p>
            <div class="battle-footer">
              ${snapshot.role === "host" ? `<button class="btn" id="restart-match" type="button">Play again</button>` : ""}
              <button class="btn-danger" id="leave-room" type="button">Leave room</button>
            </div>
          </div>
          <div id="battle-scoreboard"></div>
        </section>
      </section>
    `;
  }

  function render() {
    if (!state.snapshot) {
      root.innerHTML = intro();
      wireIntro();
      return;
    }

    if (state.snapshot.stage === "lobby") {
      root.innerHTML = lobby(state.snapshot);
      wireLobby();
      return;
    }
    if (state.snapshot.stage === "round") {
      root.innerHTML = round(state.snapshot);
      wireRound();
      return;
    }
    if (state.snapshot.stage === "insight") {
      root.innerHTML = insight(state.snapshot);
      wireInsight();
      return;
    }
    root.innerHTML = final(state.snapshot);
    wireFinal();
  }

  function leaveToHome() {
    clearController();
    state.error = "";
    render();
  }

  function wireIntro() {
    root.querySelector("#player-name").addEventListener("input", (event) => { state.playerName = event.target.value; });
    root.querySelector("#room-code").addEventListener("input", (event) => { state.roomCode = event.target.value.toUpperCase(); event.target.value = state.roomCode; });
    root.querySelector("#create-room").addEventListener("click", () => {
      if (!state.playerName.trim()) {
        onError("Enter a player name before creating a room.");
        return;
      }
      clearController();
      try {
        state.controller = hostRoom({ name: state.playerName.trim(), onState: onSnapshot, onError });
      } catch (error) {
        onError(error.message || String(error));
      }
    });
    root.querySelector("#join-room").addEventListener("click", () => {
      if (!state.playerName.trim()) {
        onError("Enter a player name before joining a room.");
        return;
      }
      if (state.roomCode.trim().length !== 4) {
        onError("Enter the 4-character room code from the host.");
        return;
      }
      clearController();
      try {
        state.controller = joinRoom({ name: state.playerName.trim(), code: state.roomCode.trim(), onState: onSnapshot, onError });
      } catch (error) {
        onError(error.message || String(error));
      }
    });
  }

  function wireLobby() {
    root.querySelector("#copy-code").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(state.snapshot.roomCode); } catch (_) { onError("Clipboard permission is blocked on this browser."); }
    });
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    root.querySelector("#toggle-ready").addEventListener("click", () => {
      const self = state.snapshot.players.find((player) => player.isSelf);
      state.controller?.setReady(!self.ready);
    });
    root.querySelector("#start-match")?.addEventListener("click", () => state.controller?.startMatch());
  }

  function wireRound() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    renderScoreboard(root.querySelector("#battle-scoreboard"), state.snapshot.players, { title: "Live Scoreboard", subtitle: `${state.snapshot.statusLabel} • Round ${state.snapshot.roundNumber}/${state.snapshot.totalRounds}` });

    const secretCardContainer = root.querySelector("#secret-card");
    secretCardContainer.appendChild(createBattleCard(state.snapshot.currentCard));

    const controls = document.createElement("div");
    controls.className = "battle-selection";
    controls.innerHTML = `
      <div class="battle-stat-list">
        ${STAT_KEYS.map((stat) => `
          <button class="battle-stat-button ${state.selectedStat === stat ? "active" : ""}" data-stat="${stat}" type="button" ${state.snapshot.submittedChoice ? "disabled" : ""}>
            <div class="battle-stat-row"><span class="battle-stat-name">${STAT_LABELS[stat]}</span><span class="battle-stat-value">${state.snapshot.currentCard.stats[stat]}</span></div>
          </button>
        `).join("")}
      </div>
      <div class="battle-footer"><button class="btn" id="submit-choice" type="button" ${state.selectedStat && !state.snapshot.submittedChoice ? "" : "disabled"}>Lock in this stat</button></div>
      <div class="battle-status">${state.snapshot.submittedChoice ? `Locked in: ${STAT_LABELS[state.snapshot.submittedChoice]}. Waiting for ${state.snapshot.pendingPlayers.length} player(s).` : state.snapshot.pendingPlayers.length ? `Still waiting on: ${state.snapshot.pendingPlayers.join(", ")}` : "All players are making their choice now."}</div>
    `;
    secretCardContainer.appendChild(controls);

    controls.querySelectorAll("[data-stat]").forEach((button) => {
      button.addEventListener("click", () => {
        if (state.snapshot.submittedChoice) return;
        state.selectedStat = button.dataset.stat;
        render();
      });
    });
    controls.querySelector("#submit-choice").addEventListener("click", () => {
      if (state.selectedStat) state.controller?.submitChoice(state.selectedStat);
    });
  }

  function wireInsight() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    const results = root.querySelector("#round-results");
    state.snapshot.insight.placements.forEach((entry, index) => {
      const article = document.createElement("article");
      article.className = `result-entry ${index === 0 ? "winner" : ""}`;
      article.innerHTML = `<span class="tiny-label">Place ${entry.place} • +${entry.pointsAwarded}</span><h4>${entry.playerName}</h4><p><strong>${entry.card.name}</strong></p><p>${STAT_LABELS[entry.selectedStat]}: ${entry.base}</p><p>Challenge fit bonus: ${entry.focusBonus + entry.tagBonus}</p><p>Total round score: ${entry.total}</p>`;
      results.appendChild(article);
    });
    root.querySelector("#next-round")?.addEventListener("click", () => state.controller?.nextRound());
  }

  function wireFinal() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    renderScoreboard(root.querySelector("#battle-scoreboard"), state.snapshot.finalStandings.map((player) => ({
      ...player,
      isSelf: state.snapshot.players.some((entry) => entry.isSelf && entry.id === player.id),
    })), { title: "Final Standings", subtitle: "Use these rankings to discuss why context changes the best design strategy." });
    root.querySelector("#restart-match")?.addEventListener("click", () => state.controller?.restart());
  }

  render();
  return () => clearController();
}
