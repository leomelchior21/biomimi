import { ORGANISMS, STAT_KEYS, STAT_LABELS } from "../data/organisms.js";
import { MISSIONS } from "../data/missions.js";
import { createClientPeer, createHostPeer, createRoomCode } from "./peerConnection.js";
import { shuffle } from "../utils.js";

const TOTAL_ROUNDS = 6;
const POINTS_BY_PLACE = [3, 2, 1, 0];

const CHALLENGES = MISSIONS.slice(0, Math.min(TOTAL_ROUNDS, MISSIONS.length)).map((mission) => ({
  id: mission.id,
  title: mission.title,
  focusStat: mission.statFocus,
  tags: mission.tags,
  prompt: mission.description,
  difficulty: mission.difficulty,
  category: mission.category,
}));

function safeSend(connection, payload) {
  if (!connection || connection.open === false) {
    return;
  }
  try {
    connection.send(payload);
  } catch (err) {
    console.warn("[safeSend] failed to send message:", err);
  }
}

function overlapCount(a, b) {
  const set = new Set(a);
  return b.filter((tag) => set.has(tag)).length;
}

function snapshotFor(controller, viewerId) {
  const players = [...controller.players.values()].map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    ready: player.ready,
    connected: player.connected,
    isSelf: player.id === viewerId,
    lastRoundPoints: player.lastRoundPoints,
  }));

  return {
    roomCode: controller.roomCode,
    stage: controller.stage,
    role: viewerId === controller.hostId ? "host" : "client",
    players,
    canStart: players.length >= 2 && players.length <= 4 && players.every((player) => player.ready),
    statusLabel: controller.stage === "round" ? "Round live" : controller.stage === "insight" ? "Insight review" : controller.stage === "final" ? "Match complete" : "Lobby",
    roundNumber: controller.stage === "lobby" ? 0 : controller.roundIndex + 1,
    totalRounds: TOTAL_ROUNDS,
    challenge: controller.currentRound?.challenge ?? null,
    currentCard: controller.stage === "round" ? controller.currentRound.assignments[viewerId] ?? null : null,
    submittedChoice: controller.stage === "round" ? controller.currentRound.choices[viewerId] ?? null : null,
    pendingPlayers: controller.currentRound ? players.filter((player) => controller.currentRound.choices[player.id] == null).map((player) => player.name) : [],
    insight: controller.insight,
    finalStandings: controller.finalStandings,
  };
}

function emit(controller, onState) {
  onState(snapshotFor(controller, controller.hostId));
  controller.connections.forEach((connection, playerId) => {
    safeSend(connection, { type: "SYNC", payload: snapshotFor(controller, playerId) });
  });
}

function prepareRound(controller, onState) {
  const challenge = CHALLENGES[controller.roundIndex];
  const assignments = {};
  const choices = {};
  const activePlayers = [...controller.players.values()].filter((player) => player.connected);

  if (controller.deck.length < activePlayers.length) {
    controller.deck = shuffle(ORGANISMS);
  }

  activePlayers.forEach((player) => {
    assignments[player.id] = controller.deck.pop();
    choices[player.id] = null;
    player.lastRoundPoints = null;
  });

  controller.currentRound = { challenge, assignments, choices };
  controller.stage = "round";
  controller.insight = null;
  emit(controller, onState);
}

function resolveRound(controller, onState) {
  const { challenge, assignments, choices } = controller.currentRound;
  const placements = Object.entries(assignments).map(([playerId, card]) => {
    const selectedStat = choices[playerId];
    const base = card.stats[selectedStat];
    const focusBonus = selectedStat === challenge.focusStat ? 10 : 0;
    const tagBonus = Math.min(overlapCount(card.tags, challenge.tags) * 4, 12);
    const total = base + focusBonus + tagBonus;
    return { playerId, playerName: controller.players.get(playerId).name, card, selectedStat, base, focusBonus, tagBonus, total };
  }).sort((a, b) => b.total - a.total || b.base - a.base || a.playerName.localeCompare(b.playerName));

  placements.forEach((entry, index) => {
    entry.place = index + 1;
    entry.pointsAwarded = POINTS_BY_PLACE[index] ?? 0;
    const player = controller.players.get(entry.playerId);
    player.score += entry.pointsAwarded;
    player.lastRoundPoints = entry.pointsAwarded;
  });

  controller.stage = "insight";
  controller.insight = {
    challenge,
    winner: placements[0],
    placements,
    designInsightTitle: `${placements[0].card.name} wins ${challenge.title}`,
    designInsightBody: `${placements[0].card.name} scored with ${STAT_LABELS[placements[0].selectedStat].toLowerCase()} and matched the challenge through ${placements[0].card.principle.toLowerCase()}. ${placements[0].card.designTakeaway}`,
  };
  emit(controller, onState);
}

function maybeResolve(controller, onState) {
  if (Object.values(controller.currentRound.choices).every((choice) => choice != null)) {
    resolveRound(controller, onState);
  } else {
    emit(controller, onState);
  }
}

export function hostRoom({ name, onState, onError }) {
  const controller = {
    roomCode: createRoomCode(),
    hostId: null,
    stage: "lobby",
    roundIndex: -1,
    currentRound: null,
    deck: [],
    players: new Map(),
    connections: new Map(),
    insight: null,
    finalStandings: null,
    peer: null,
  };

  const { peer, peerId } = createHostPeer(controller.roomCode, {
    onOpen: () => {
      controller.peer = peer;
      controller.hostId = peerId;
      controller.players.set(peerId, { id: peerId, name, score: 0, ready: true, connected: true, lastRoundPoints: null });
      emit(controller, onState);
    },
    onConnection: (connection) => {
      connection.on("data", (message) => {
        if (!message?.type) {
          return;
        }
        if (message.type === "HELLO") {
          if (controller.players.size >= 4) {
            safeSend(connection, { type: "ERROR", message: "This room is already full." });
            connection.close();
            return;
          }
          connection.playerId = message.playerId;
          controller.connections.set(message.playerId, connection);
          controller.players.set(message.playerId, { id: message.playerId, name: message.name || "Player", score: 0, ready: false, connected: true, lastRoundPoints: null });
          emit(controller, onState);
        }
        if (message.type === "READY") {
          const player = controller.players.get(connection.playerId);
          if (player) {
            player.ready = Boolean(message.ready);
            emit(controller, onState);
          }
        }
        if (message.type === "CHOICE" && controller.stage === "round" && STAT_KEYS.includes(message.stat) && controller.currentRound.choices[connection.playerId] == null) {
          controller.currentRound.choices[connection.playerId] = message.stat;
          maybeResolve(controller, onState);
        }
      });
      connection.on("close", () => {
        const player = controller.players.get(connection.playerId);
        if (player) {
          player.connected = false;
          player.ready = false;
        }
        controller.connections.delete(connection.playerId);
        emit(controller, onState);
      });
    },
    onError: (error) => onError(error.message || String(error)),
  });

  return {
    leave() {
      controller.connections.forEach((connection) => connection.close());
      controller.peer?.destroy();
    },
    setReady(ready) {
      controller.players.get(controller.hostId).ready = ready;
      emit(controller, onState);
    },
    startMatch() {
      if (![...controller.players.values()].every((player) => player.ready) || controller.players.size < 2) {
        onError("Everyone needs to be ready before the match can start.");
        return;
      }
      controller.players.forEach((player) => {
        player.score = 0;
        player.lastRoundPoints = null;
      });
      controller.deck = shuffle(ORGANISMS);
      controller.roundIndex = 0;
      controller.finalStandings = null;
      prepareRound(controller, onState);
    },
    submitChoice(stat) {
      if (controller.stage === "round" && STAT_KEYS.includes(stat) && controller.currentRound.choices[controller.hostId] == null) {
        controller.currentRound.choices[controller.hostId] = stat;
        maybeResolve(controller, onState);
      }
    },
    nextRound() {
      if (controller.stage !== "insight") {
        return;
      }
      if (controller.roundIndex >= TOTAL_ROUNDS - 1) {
        controller.stage = "final";
        controller.finalStandings = [...controller.players.values()].map((player) => ({
          id: player.id,
          name: player.name,
          score: player.score,
          ready: player.ready,
          connected: player.connected,
          lastRoundPoints: player.lastRoundPoints,
        })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        emit(controller, onState);
        return;
      }
      controller.roundIndex += 1;
      prepareRound(controller, onState);
    },
    restart() {
      controller.players.forEach((player) => {
        player.score = 0;
        player.lastRoundPoints = null;
        player.ready = true;
      });
      controller.deck = shuffle(ORGANISMS);
      controller.roundIndex = 0;
      controller.finalStandings = null;
      prepareRound(controller, onState);
    },
  };
}

export function soloRoom({ name, onState }) {
  const PLAYER_ID = "solo";
  const ctrl = {
    stage: "round",
    roundIndex: 0,
    round: null,
    deck: [],
    score: 0,
    lastRoundPoints: null,
    insight: null,
    finalStandings: null,
  };

  function snap() {
    return {
      roomCode: "SOLO",
      stage: ctrl.stage,
      role: "host",
      isSolo: true,
      players: [{ id: PLAYER_ID, name, score: ctrl.score, ready: true, connected: true, isSelf: true, lastRoundPoints: ctrl.lastRoundPoints }],
      canStart: false,
      statusLabel: ctrl.stage === "round" ? "Solo round" : ctrl.stage === "insight" ? "Insight" : "Complete",
      roundNumber: ctrl.roundIndex + 1,
      totalRounds: TOTAL_ROUNDS,
      challenge: ctrl.round?.challenge ?? null,
      currentCard: ctrl.stage === "round" ? ctrl.round?.card ?? null : null,
      submittedChoice: ctrl.stage === "round" ? ctrl.round?.choice ?? null : null,
      pendingPlayers: [],
      insight: ctrl.insight,
      finalStandings: ctrl.finalStandings,
    };
  }

  function startRound() {
    if (ctrl.deck.length < 1) ctrl.deck = shuffle(ORGANISMS);
    const card = ctrl.deck.pop();
    ctrl.round = { challenge: CHALLENGES[ctrl.roundIndex], card, choice: null };
    ctrl.stage = "round";
    ctrl.insight = null;
    onState(snap());
  }

  function resolveRound(stat) {
    const { challenge, card } = ctrl.round;
    const base = card.stats[stat];
    const focusBonus = stat === challenge.focusStat ? 10 : 0;
    const tagBonus = Math.min(overlapCount(card.tags, challenge.tags) * 4, 12);
    const total = base + focusBonus + tagBonus;
    ctrl.lastRoundPoints = total;
    ctrl.score += total;
    ctrl.stage = "insight";
    const entry = { playerId: PLAYER_ID, playerName: name, card, selectedStat: stat, base, focusBonus, tagBonus, total, place: 1, pointsAwarded: total };
    ctrl.insight = {
      challenge,
      winner: entry,
      placements: [entry],
      designInsightTitle: `${card.name} — ${challenge.title}`,
      designInsightBody: `${card.name} scored ${total} points using ${STAT_LABELS[stat].toLowerCase()}. ${card.designTakeaway}`,
    };
    onState(snap());
  }

  ctrl.deck = shuffle(ORGANISMS);
  startRound();

  return {
    leave() {},
    setReady() {},
    startMatch() {},
    submitChoice(stat) {
      if (ctrl.stage === "round" && STAT_KEYS.includes(stat) && !ctrl.round.choice) {
        ctrl.round.choice = stat;
        resolveRound(stat);
      }
    },
    nextRound() {
      if (ctrl.stage !== "insight") return;
      if (ctrl.roundIndex >= TOTAL_ROUNDS - 1) {
        ctrl.stage = "final";
        ctrl.finalStandings = [{ id: PLAYER_ID, name, score: ctrl.score, ready: true, connected: true, isSelf: true, lastRoundPoints: ctrl.lastRoundPoints }];
        onState(snap());
        return;
      }
      ctrl.roundIndex += 1;
      startRound();
    },
    restart() {
      ctrl.roundIndex = 0;
      ctrl.score = 0;
      ctrl.lastRoundPoints = null;
      ctrl.deck = shuffle(ORGANISMS);
      startRound();
    },
  };
}

export function joinRoom({ name, code, onState, onError }) {
  let connection = null;
  let peer = null;
  const clientId = Math.random().toString(36).slice(2, 6).toUpperCase();
  const { peer: createdPeer, peerId, hostId } = createClientPeer(code.toUpperCase(), clientId, {
    onOpen: () => {
      peer = createdPeer;
      connection = peer.connect(hostId);
      connection.on("open", () => safeSend(connection, { type: "HELLO", playerId: peerId, name }));
      connection.on("data", (message) => {
        if (message.type === "SYNC") {
          onState(message.payload);
        }
        if (message.type === "ERROR") {
          onError(message.message);
        }
      });
      connection.on("close", () => onError("Disconnected from the host room."));
    },
    onError: (error) => onError(error.message || String(error)),
  });

  return {
    leave() {
      connection?.close();
      peer?.destroy();
    },
    setReady(ready) {
      safeSend(connection, { type: "READY", ready });
    },
    startMatch() {},
    submitChoice(stat) {
      safeSend(connection, { type: "CHOICE", stat });
    },
    nextRound() {},
    restart() {},
  };
}
