import { STAT_KEYS, STAT_LABELS, KINGDOM_COLORS, ORGANISMS } from "../data/organisms.js";
import { renderScoreboard } from "../components/scoreboard.js";
import { hostRoom, joinRoom, soloRoom } from "../multiplayer/room.js";
import { escapeHtml } from "../utils.js";
import { t, subscribeLanguage } from "../i18n.js";

const CHALLENGE_THEME = {
  water:          { color: "#38bdf8", label: "Water Systems" },
  architecture:   { color: "#fb923c", label: "Architecture" },
  materials:      { color: "#a78bfa", label: "Materials" },
  "city systems": { color: "#2dd4bf", label: "City Systems" },
  surface:        { color: "#4ade80", label: "Surface Design" },
};

const AVATAR_PALETTE = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function avatarLetter(name) {
  return (name.trim()[0] || "?").toUpperCase();
}

function orgFloats() {
  const picks = [1, 8, 15, 22, 29, 36, 4, 18];
  return picks.map((i, j) => {
    const org = ORGANISMS[i % ORGANISMS.length];
    return `<div class="arena-org-float" style="--fi:${j}; --fx:${j * 13 + 3}%; --ft:${10 + j * 6}%;" aria-hidden="true">
      <img src="${org.imagePath}" alt="">
    </div>`;
  }).join("");
}

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

  function onError(msg) {
    state.error = msg;
    render();
  }

  // ── INTRO ────────────────────────────────────────────────────────────────
  function intro() {
    return `
      <section class="battle-arena-page mode-page">
        <div class="arena-bg" aria-hidden="true">
          <div class="arena-orb arena-orb-a"></div>
          <div class="arena-orb arena-orb-b"></div>
          <div class="arena-orb arena-orb-c"></div>
          ${orgFloats()}
        </div>
        <div class="arena-entry">
          <div class="arena-entry-head">
            <p class="eyebrow arena-eyebrow">${t("battleEyebrow")}</p>
            <h2 class="arena-title">${t("battleTitle")}</h2>
            <p class="arena-sub">${t("battleSubtitle")}</p>
          </div>
          <div class="arena-name-row">
            <label class="arena-name-label">
              <span class="meta-label">${t("battleYourName")}</span>
              <input class="text-input arena-name-input" id="player-name" placeholder="${t("battleNamePlaceholder")}" value="${state.playerName}" autocomplete="off">
            </label>
          </div>
          <div class="arena-paths">
            <div class="arena-path-card arena-path-solo">
              <span class="arena-path-pill">${t("battleSoloPill")}</span>
              <h3>${t("battleSoloTitle")}</h3>
              <p>${t("battleSoloDesc")}</p>
              <button class="btn arena-path-btn" id="solo-mode" type="button">${t("battleSoloBtn")}</button>
            </div>
            <div class="arena-path-card arena-path-host">
              <span class="arena-path-pill">${t("battleHostPill")}</span>
              <h3>${t("battleHostTitle")}</h3>
              <p>${t("battleHostDesc")}</p>
              <button class="btn arena-path-btn" id="create-room" type="button">${t("battleHostBtn")}</button>
            </div>
            <div class="arena-path-card arena-path-join">
              <span class="arena-path-pill">${t("battleJoinPill")}</span>
              <h3>${t("battleJoinTitle")}</h3>
              <p>${t("battleJoinDesc")}</p>
              <input class="text-input arena-code-input" id="room-code" maxlength="4" placeholder="ABCD" value="${state.roomCode}" autocomplete="off">
              <button class="btn-secondary arena-path-btn" id="join-room" type="button">${t("battleJoinBtn")}</button>
            </div>
          </div>
          ${state.error ? `<div class="arena-error">${state.error}</div>` : ""}
        </div>
      </section>
    `;
  }

  // ── LOBBY ────────────────────────────────────────────────────────────────
  function lobby(snapshot) {
    const self = snapshot.players.find((p) => p.isSelf);
    const allReady = snapshot.players.length >= 2 && snapshot.players.every((p) => p.ready);
    const emptySlots = Math.max(0, 4 - snapshot.players.length);
    return `
      <section class="battle-arena-page mode-page">
        <div class="arena-bg" aria-hidden="true">
          <div class="arena-orb arena-orb-a"></div>
          <div class="arena-orb arena-orb-b"></div>
        </div>
        <div class="arena-lobby">
          <div class="arena-lobby-head">
            <p class="eyebrow arena-eyebrow">${snapshot.role === "host" ? t("battleTeacherScreen") : t("battleWaitingRoom")}</p>
            <h2 class="arena-title">${snapshot.role === "host" ? t("battleRoomOpen") : t("battleConnected")}</h2>
          </div>
          <div class="arena-lobby-body">
            <div class="arena-code-block">
              <span class="meta-label">${t("battleRoomCode")}</span>
              <div class="arena-room-code">${snapshot.roomCode}</div>
              <button class="btn-ghost arena-copy-btn" id="copy-code" type="button">${t("battleCopyCode")}</button>
              <p class="arena-lobby-hint">${snapshot.role === "host" ? t("battleShareHint") : t("battleStudentHint")}</p>
            </div>
            <div class="arena-roster-block">
              <span class="meta-label">${snapshot.players.length} / 4 ${t("battlePlayersLabel")}</span>
              <div class="arena-roster">
                ${snapshot.players.map((p) => `
                  <div class="arena-player-slot ${p.connected ? "" : "disconnected"}" style="--av: ${avatarColor(p.name)}">
                    <div class="arena-av">${avatarLetter(p.name)}</div>
                    <div class="arena-player-info">
                      <strong>${escapeHtml(p.name)}${p.isSelf ? ` <span class='arena-you'>${t("battleYou")}</span>` : ""}</strong>
                      <span class="arena-player-status">${p.connected ? (p.ready ? t("battleReadyStatus") : t("battleWaitingStatus")) : t("battleDisconnected")}</span>
                    </div>
                    <div class="arena-ready-dot ${p.ready ? "ready" : ""}"></div>
                  </div>
                `).join("")}
                ${Array.from({ length: emptySlots }, () => `
                  <div class="arena-player-slot arena-slot-empty">
                    <div class="arena-av arena-av-empty">+</div>
                    <span class="arena-player-status">${t("battleWaitingPlayer")}</span>
                  </div>
                `).join("")}
              </div>
              ${allReady ? `<div class="arena-all-ready">${t("battleAllReady")}</div>` : ""}
            </div>
          </div>
          <div class="arena-lobby-actions">
            <button class="${self.ready ? "btn-secondary" : "btn"}" id="toggle-ready" type="button">${self.ready ? t("battleReadyStatus") : t("battleMarkReady")}</button>
            ${snapshot.role === "host" ? `<button class="btn" id="start-match" type="button" ${snapshot.canStart ? "" : "disabled"}>${t("battleStartMatch")}</button>` : ""}
            <button class="btn-ghost" id="leave-room" type="button">${t("battleLeave")}</button>
          </div>
          ${state.error ? `<div class="arena-error">${state.error}</div>` : ""}
        </div>
      </section>
    `;
  }

  // ── ROUND ────────────────────────────────────────────────────────────────
  function round(snapshot) {
    const { challenge, currentCard, submittedChoice } = snapshot;
    const theme = CHALLENGE_THEME[challenge?.category] || { color: "#38bdf8", label: challenge?.category || "" };
    const locked = !!submittedChoice;
    const cardColor = KINGDOM_COLORS[currentCard?.category] || "#8be7ff";

    return `
      <section class="battle-arena-page mode-page">
        <div class="arena-bg" aria-hidden="true">
          <div class="arena-orb arena-orb-a"></div>
          <div class="arena-orb arena-orb-b"></div>
        </div>
        <div class="arena-round-page">

          <div class="arena-challenge-banner" style="--ch: ${theme.color}">
            <div class="arena-ch-meta">
              <span class="arena-ch-category">${theme.label}</span>
              <span class="arena-round-pip">${t("battleRound")} ${snapshot.roundNumber} / ${snapshot.totalRounds}</span>
            </div>
            <h2 class="arena-ch-title">${challenge.title}</h2>
            <p class="arena-ch-prompt">${challenge.prompt}</p>
            <div class="arena-focus-row">
              <span class="meta-label">${t("battleFocusStat")}</span>
              <span class="arena-focus-name">${STAT_LABELS[challenge.focusStat]}</span>
              <span class="arena-focus-hint">${t("battleFocusBonus")}</span>
            </div>
          </div>

          <div class="arena-round-body">
            <div class="arena-card-zone">
              <span class="meta-label">${t("battleSecretOrganism")}</span>
              <div class="arena-battle-card" style="--cc: ${cardColor}">
                <div class="arena-battle-img">
                  <img src="${currentCard.imagePath}" alt="${currentCard.name}" loading="lazy">
                  <div class="arena-battle-overlay">
                    <span class="kingdom-chip">${currentCard.category}</span>
                    <h3>${currentCard.name}</h3>
                    <p>${currentCard.principle}</p>
                  </div>
                </div>
              </div>

              <div class="arena-stat-selector">
                <span class="meta-label">${t("battleChooseStat")}</span>
                <div class="arena-stat-list">
                  ${STAT_KEYS.map((stat) => {
                    const val = currentCard.stats[stat];
                    const isFocus = stat === challenge.focusStat;
                    const isSelected = state.selectedStat === stat;
                    const statColor = isFocus ? theme.color : cardColor;
                    return `
                      <button
                        class="arena-stat-btn ${isSelected ? "selected" : ""} ${isFocus ? "focus" : ""} ${locked ? "locked" : ""}"
                        data-stat="${stat}"
                        type="button"
                        ${locked ? "disabled" : ""}
                        style="--sv: ${val}%; --sc: ${statColor}"
                      >
                        <div class="arena-stat-top">
                          <span class="arena-stat-name">${STAT_LABELS[stat]}</span>
                          <span class="arena-stat-val">${val}</span>
                          ${isFocus ? `<span class="arena-focus-pip">Focus +10</span>` : ""}
                        </div>
                        <div class="arena-stat-bar"><div class="arena-stat-fill"></div></div>
                      </button>
                    `;
                  }).join("")}
                </div>
                <div class="arena-lock-row">
                  <button class="btn arena-lock-btn ${locked ? "is-locked" : ""}" id="submit-choice" type="button" ${state.selectedStat && !locked ? "" : "disabled"}>
                    ${locked ? `${t("battleLocked")} ${STAT_LABELS[submittedChoice]}` : t("battleLockBtn")}
                  </button>
                </div>
              </div>
            </div>

            <div class="arena-round-sidebar">
              ${!snapshot.isSolo ? `
                <div class="arena-waiting-panel">
                  <span class="meta-label">${t("battlePlayersLabel")}</span>
                  <div class="arena-waiting-list">
                    ${snapshot.players.map((p) => {
                      const done = !snapshot.pendingPlayers.includes(p.name);
                      return `
                        <div class="arena-waiting-row ${done ? "done" : "pending"}">
                          <div class="arena-av arena-av-sm" style="--av: ${avatarColor(p.name)}">${avatarLetter(p.name)}</div>
                          <span>${escapeHtml(p.name)}${p.isSelf ? ` ${t("battleYou")}` : ""}</span>
                          <span class="arena-waiting-tick">${done ? "✓" : "…"}</span>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>
              ` : ""}
              <div id="battle-scoreboard"></div>
              <button class="btn-ghost arena-leave-sm" id="leave-room" type="button">${t("battleLeaveMatch")}</button>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  // ── INSIGHT ──────────────────────────────────────────────────────────────
  function insight(snapshot) {
    const ins = snapshot.insight;
    const theme = CHALLENGE_THEME[ins.challenge?.category] || { color: "#38bdf8", label: "" };
    const placesDesc = [...ins.placements]; // already sorted best→worst from room.js
    const staggered = [...placesDesc].reverse(); // reveal worst→best for drama

    return `
      <section class="battle-arena-page mode-page">
        <div class="arena-bg" aria-hidden="true">
          <div class="arena-orb arena-orb-a"></div>
          <div class="arena-orb arena-orb-b"></div>
        </div>
        <div class="arena-reveal-page">
          <div class="arena-reveal-head">
            <span class="meta-label">${t("battleRound")} ${snapshot.roundNumber} ${t("battleReveal")}</span>
            <h2 class="arena-title">${ins.challenge.title}</h2>
          </div>
          <div class="arena-reveal-body">
            <div class="arena-reveal-cards" id="reveal-cards">
              ${staggered.map((entry, i) => {
                const isWinner = entry.place === 1;
                const placeSuffix = entry.place === 1 ? t("battlePlaceSuffix1") : entry.place === 2 ? t("battlePlaceSuffix2") : entry.place === 3 ? t("battlePlaceSuffix3") : t("battlePlaceSuffixOther");
                const placeLabel = `${entry.place}${placeSuffix}`;
                return `
                  <div class="arena-reveal-card ${isWinner ? "is-winner" : ""}" style="--rd: ${i * 320}ms; --rc: ${KINGDOM_COLORS[entry.card.category]}">
                    <div class="arena-rc-img">
                      <img src="${entry.card.imagePath}" alt="${entry.card.name}" loading="lazy">
                      ${isWinner ? `<div class="arena-crown">👑</div>` : ""}
                    </div>
                    <div class="arena-rc-body">
                      <div class="arena-rc-player">
                        <div class="arena-av arena-av-sm" style="--av: ${avatarColor(entry.playerName)}">${avatarLetter(entry.playerName)}</div>
                        <strong>${escapeHtml(entry.playerName)}</strong>
                        <span class="arena-place place-${entry.place}">${placeLabel}</span>
                      </div>
                      <div class="arena-rc-org">
                        <span class="kingdom-chip">${entry.card.category}</span>
                        <h4>${entry.card.name}</h4>
                      </div>
                      <div class="arena-rc-score-row">
                        <span class="arena-rc-stat ${entry.selectedStat === ins.challenge.focusStat ? "is-focus" : ""}">${STAT_LABELS[entry.selectedStat]}</span>
                        <span class="arena-rc-pts">+${entry.pointsAwarded} pts</span>
                      </div>
                      <div class="arena-score-eq">
                        <span>${entry.base}</span>
                        ${entry.focusBonus ? `<span class="arena-bonus focus-bonus">+${entry.focusBonus} focus</span>` : ""}
                        ${entry.tagBonus ? `<span class="arena-bonus tag-bonus">+${entry.tagBonus} tags</span>` : ""}
                        <span class="arena-eq-total">= ${entry.total}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>

            <div class="arena-insight-panel">
              <div class="arena-insight-block" style="--ic: ${theme.color}">
                <span class="meta-label">${t("battleDesignInsight")}</span>
                <h3>${ins.designInsightTitle}</h3>
                <p>${ins.designInsightBody}</p>
              </div>
              <div class="arena-principle-block">
                <span class="meta-label">${t("battleWinningPrinciple")}</span>
                <blockquote class="arena-principle">${ins.winner.card.designTakeaway}</blockquote>
              </div>
              <div class="arena-insight-actions">
                ${snapshot.role === "host" || snapshot.isSolo
                  ? `<button class="btn arena-next-btn" id="next-round" type="button">${snapshot.roundNumber === snapshot.totalRounds ? t("battleSeeFinal") : t("battleNextRound")}</button>`
                  : `<div class="arena-waiting-msg"><div class="arena-dots"><span></span><span></span><span></span></div>${t("battleWaitingHost")}</div>`
                }
                <button class="btn-ghost" id="leave-room" type="button">${t("battleLeave")}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ── FINAL ────────────────────────────────────────────────────────────────
  function final(snapshot) {
    const standings = snapshot.finalStandings || [];
    const top3 = standings.slice(0, 3);
    const rest = standings.slice(3);
    const isSolo = snapshot.isSolo;

    // Podium visual order: 2nd (left), 1st (center), 3rd (right)
    const podiumSlots = [
      { player: top3[1], place: 2, h: 110 },
      { player: top3[0], place: 1, h: 160 },
      { player: top3[2], place: 3, h: 80 },
    ].filter((s) => s.player);

    return `
      <section class="battle-arena-page mode-page">
        <div class="arena-bg" aria-hidden="true">
          <div class="arena-orb arena-orb-a"></div>
          <div class="arena-orb arena-orb-b"></div>
          <div class="arena-orb arena-orb-c"></div>
          <div class="arena-particles" id="arena-particles"></div>
        </div>
        <div class="arena-final-page">
          <div class="arena-final-head">
            <p class="eyebrow arena-eyebrow">${isSolo ? t("battlePracticeComplete") : t("battleMatchComplete")}</p>
            <h2 class="arena-title">${isSolo ? `${t("battleScoreLabel")} ${standings[0]?.score ?? 0}` : t("battleFinalStandings")}</h2>
            <p class="arena-sub">${isSolo ? t("battleSoloFinalDesc") : t("battleMultiFinalDesc")}</p>
          </div>

          ${!isSolo && podiumSlots.length > 0 ? `
            <div class="arena-podium">
              ${podiumSlots.map((slot) => `
                <div class="arena-podium-spot place-${slot.place}" style="--ph: ${slot.h}px; --av: ${avatarColor(slot.player.name)}">
                  <div class="arena-podium-av">${avatarLetter(slot.player.name)}</div>
                  <div class="arena-podium-name">${escapeHtml(slot.player.name)}${slot.player.isSelf ? ` ${t("battleYou")}` : ""}</div>
                  <div class="arena-podium-score">${slot.player.score} pts</div>
                  <div class="arena-podium-base"><span class="arena-podium-rank">#${slot.place}</span></div>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${rest.length > 0 ? `
            <div class="arena-rest">
              ${rest.map((p, i) => `
                <div class="arena-rest-row" style="--av: ${avatarColor(p.name)}">
                  <span class="arena-rest-rank">#${i + 4}</span>
                  <div class="arena-av arena-av-sm">${avatarLetter(p.name)}</div>
                  <span class="arena-rest-name">${escapeHtml(p.name)}${p.isSelf ? ` ${t("battleYou")}` : ""}</span>
                  <span class="arena-rest-score">${p.score} pts</span>
                </div>
              `).join("")}
            </div>
          ` : ""}

          ${isSolo ? `
            <div class="arena-solo-card">
              <span class="meta-label">${t("battleTotalScore")}</span>
              <div class="arena-solo-score">${standings[0]?.score ?? 0}</div>
              <span class="arena-solo-hint">${t("battleScoreFormula")}</span>
            </div>
          ` : ""}

          <div class="arena-final-actions">
            ${snapshot.role === "host" || isSolo ? `<button class="btn" id="restart-match" type="button">${t("battlePlayAgain")}</button>` : ""}
            <button class="btn-ghost" id="leave-room" type="button">${isSolo ? t("battleBackHome") : t("battleLeaveRoom")}</button>
          </div>
        </div>
      </section>
    `;
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  function render() {
    if (!state.snapshot) { root.innerHTML = intro(); wireIntro(); return; }
    if (state.snapshot.stage === "lobby") { root.innerHTML = lobby(state.snapshot); wireLobby(); return; }
    if (state.snapshot.stage === "round") { root.innerHTML = round(state.snapshot); wireRound(); return; }
    if (state.snapshot.stage === "insight") { root.innerHTML = insight(state.snapshot); wireInsight(); return; }
    root.innerHTML = final(state.snapshot);
    wireFinal();
  }

  function leaveToHome() { clearController(); state.error = ""; render(); }

  // ── WIRE ─────────────────────────────────────────────────────────────────
  function wireIntro() {
    root.querySelector("#player-name").addEventListener("input", (e) => { state.playerName = e.target.value; });
    root.querySelector("#room-code").addEventListener("input", (e) => { state.roomCode = e.target.value.toUpperCase(); e.target.value = state.roomCode; });

    root.querySelector("#solo-mode").addEventListener("click", () => {
      clearController();
      try { state.controller = soloRoom({ name: state.playerName.trim() || "Explorer", onState: onSnapshot }); }
      catch (err) { onError(err.message || String(err)); }
    });

    root.querySelector("#create-room").addEventListener("click", () => {
      if (!state.playerName.trim()) { onError(t("battleEnterNameFirst")); return; }
      clearController();
      try { state.controller = hostRoom({ name: state.playerName.trim(), onState: onSnapshot, onError }); }
      catch (err) { onError(err.message || String(err)); }
    });

    root.querySelector("#join-room").addEventListener("click", () => {
      if (!state.playerName.trim()) { onError(t("battleEnterNameFirst")); return; }
      if (state.roomCode.trim().length !== 4) { onError(t("battleEnter4Char")); return; }
      clearController();
      try { state.controller = joinRoom({ name: state.playerName.trim(), code: state.roomCode.trim(), onState: onSnapshot, onError }); }
      catch (err) { onError(err.message || String(err)); }
    });
  }

  function wireLobby() {
    root.querySelector("#copy-code")?.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(state.snapshot.roomCode); }
      catch (_) { onError("Clipboard permission is blocked."); }
    });
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    root.querySelector("#toggle-ready").addEventListener("click", () => {
      const self = state.snapshot.players.find((p) => p.isSelf);
      state.controller?.setReady(!self.ready);
    });
    root.querySelector("#start-match")?.addEventListener("click", () => state.controller?.startMatch());
  }

  function wireRound() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    renderScoreboard(root.querySelector("#battle-scoreboard"), state.snapshot.players, {
      title: t("battleScoreboard"),
      subtitle: `${t("battleRound")} ${state.snapshot.roundNumber} / ${state.snapshot.totalRounds}`,
    });
    root.querySelectorAll("[data-stat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.snapshot.submittedChoice) return;
        state.selectedStat = btn.dataset.stat;
        render();
      });
    });
    root.querySelector("#submit-choice")?.addEventListener("click", () => {
      if (state.selectedStat) state.controller?.submitChoice(state.selectedStat);
    });
  }

  function wireInsight() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    root.querySelector("#next-round")?.addEventListener("click", () => state.controller?.nextRound());
    root.querySelectorAll(".arena-reveal-card").forEach((card) => {
      const delay = parseInt(card.style.getPropertyValue("--rd")) || 0;
      setTimeout(() => card.classList.add("revealed"), delay);
    });
  }

  function wireFinal() {
    root.querySelector("#leave-room").addEventListener("click", leaveToHome);
    root.querySelector("#restart-match")?.addEventListener("click", () => state.controller?.restart());
    spawnParticles();
  }

  function spawnParticles() {
    const container = root.querySelector("#arena-particles");
    if (!container) return;
    const colors = ["#8ff0b8", "#8be7ff", "#f9e94a", "#ff8fc8", "#a78bfa", "#fb923c"];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("div");
      p.className = "arena-particle";
      p.style.cssText = `left:${Math.random() * 100}%; top:${Math.random() * 100}%; background:${colors[i % colors.length]}; animation-delay:${Math.random() * 1400}ms; --dx:${(Math.random() - 0.5) * 280}px; --dy:${(Math.random() - 0.5) * 280}px;`;
      container.appendChild(p);
    }
  }

  render();
  const unsubscribe = subscribeLanguage(() => render());
  return () => {
    unsubscribe();
    clearController();
  };
}
