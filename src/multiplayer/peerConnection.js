const ROOM_PREFIX = "BIOMIMI";

function requirePeer() {
  if (!window.Peer) {
    throw new Error("PeerJS failed to load. Refresh the page and try again.");
  }
}

export function createRoomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function createHostPeer(code, handlers) {
  requirePeer();
  const peerId = `${ROOM_PREFIX}-${code}-HOST`;
  const peer = new window.Peer(peerId);
  wirePeer(peer, handlers);
  return { peer, peerId };
}

export function createClientPeer(code, clientId, handlers) {
  requirePeer();
  const peerId = `${ROOM_PREFIX}-${code}-${clientId}`;
  const peer = new window.Peer(peerId);
  wirePeer(peer, handlers);
  return { peer, peerId, hostId: `${ROOM_PREFIX}-${code}-HOST` };
}

function wirePeer(peer, handlers) {
  handlers.onOpen && peer.on("open", handlers.onOpen);
  handlers.onConnection && peer.on("connection", handlers.onConnection);
  handlers.onError && peer.on("error", handlers.onError);
  handlers.onClose && peer.on("close", handlers.onClose);
}
