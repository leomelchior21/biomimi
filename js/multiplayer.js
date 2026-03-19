/* ============================================================
   FISHUINO MULTIPLAYER — PeerJS star topology, up to 20 players
   Host relays all messages; each player runs their own game.
   ============================================================ */

const ROOM_PREFIX = 'fishuino-r1-';

let _peer = null, _hostConn = null, _clientConns = [];
let _isHost = false, _roomCode = '', _myId = '', _myName = '', _myBoat = '';
let _players = {};   // { peerId: {name,boat,score,phase,lives,status,boatX,hookY,hookAngle} }
let _active = false, _started = false, _syncTimer = 0;
let _roundWinner = '', _readySet = new Set();
let _chaosMode = false;

/* ── helpers ──────────────────────────────────────────────── */
function _pid(code){ return ROOM_PREFIX + code.toUpperCase(); }

function _genCode(){
  const C = 'ABCDEFGHJKMNPQRSTUVWXYZ2345679';
  return Array.from({length:4}, () => C[Math.floor(Math.random()*C.length)]).join('');
}

function _broadcast(msg){
  _clientConns.forEach(c=>{ try{ c.send(msg) }catch(e){} });
}

function _sendToHost(msg){
  if(_hostConn && _hostConn.open) try{ _hostConn.send(msg) }catch(e){}
}

function _myEntry(extra){
  const s = (typeof S!=='undefined'?S:null) || {};
  return (_players[_myId] = Object.assign(
    {name:_myName, boat:_myBoat, score:0, phase:1, lives:2, status:'ready', boatX:0.5},
    _players[_myId] || {},
    {name:_myName, boat:_myBoat, score:s.score||0, phase:(s.phase||0)+1, lives:s.lives!=null?s.lives:2},
    extra || {}
  ));
}

function _status(msg, err){
  const el = document.getElementById('mp-status');
  if(el){ el.textContent = msg; el.style.color = err ? '#ff4466' : '#00ff88'; }
}

/* ── render lobby player list ─────────────────────────────── */
function _renderLobby(){
  const el = document.getElementById('mp-plist');
  if(!el) return;
  el.innerHTML = '';
  Object.values(_players).forEach(p => {
    const boat = (typeof BOATS!=='undefined'?BOATS:[]).find(b=>b.id===p.boat);
    const r = document.createElement('div');
    r.className = 'mp-prow';
    r.innerHTML =
      `<span class="mp-pname">${p.name.slice(0,14)}</span>` +
      `<span class="mp-pboat">${boat?.emoji||'🛥️'}</span>` +
      `<span class="mp-badge${p.status==='host'?' host':''}">${p.status==='host'?'HOST':'READY'}</span>`;
    el.appendChild(r);
  });
  const btn = document.getElementById('mp-start-btn');
  if(btn) btn.disabled = Object.keys(_players).length < 2;
}

/* ── render in-game leaderboard ───────────────────────────── */
function _renderBoard(){
  const el = document.getElementById('mp-lb-body');
  if(!el) return;
  const sorted = Object.values(_players).sort((a,b) => b.score - a.score);
  el.innerHTML = '';
  sorted.forEach((p, i) => {
    const boat = (typeof BOATS!=='undefined'?BOATS:[]).find(b=>b.id===p.boat);
    const icon = p.status==='win'?'🏆':p.status==='out'?'💀':'';
    const r = document.createElement('div');
    r.className = 'mp-lrow' +
      (p.name===_myName?' me':'') +
      (p.status==='out'?' out':'') +
      (p.status==='win'?' win':'');
    r.innerHTML =
      `<span class="mp-lri">${icon||i+1}</span>` +
      `<span class="mp-ln">${p.name.slice(0,9)}</span>` +
      `<span class="mp-lboat2">${boat?.emoji||'🛥️'}</span>` +
      `<span class="mp-ls">${p.score}</span>` +
      `<span class="mp-ll">L${p.phase}</span>`;
    el.appendChild(r);
  });
}

function _showBoard(){
  const el = document.getElementById('mp-leaderboard');
  if(el){ el.style.display = 'block'; _renderBoard(); }
}

function _hideBoard(){
  const el = document.getElementById('mp-leaderboard');
  if(el) el.style.display = 'none';
}

function _closePanel(){
  const p = document.getElementById('mp-panel');
  if(p) p.style.display = 'none';
}

function _doStart(){
  _started = true;
  _showBoard();
  _closePanel();
  const inp = document.getElementById('pin');
  if(inp && _myName) inp.value = _myName;
  window.startGame();
}

/* ── check if all players are done with the round (host only) */
function _checkRoundEnd(){
  if(!_isHost) return;
  const vals = Object.values(_players);
  const allDone = vals.every(p => p.status==='win' || p.status==='out' || p.status==='host');
  if(allDone){
    _broadcast({type:'roundEnd', players:_players, winner:_roundWinner});
    if(window.onMPRoundEnd) window.onMPRoundEnd(_roundWinner);
  }
}

/* ── message handler (both host and client) ───────────────── */
function _handleMsg(msg, fromId){
  if(msg.type === 'join'){
    _players[fromId] = {name:msg.name, boat:msg.boat, score:0, phase:1, lives:2, status:'ready', boatX:0.5};
    _renderLobby();
    _broadcast({type:'sync', players:_players});

  } else if(msg.type === 'update'){
    if(_players[fromId]) Object.assign(_players[fromId], msg.data);
    _broadcast({type:'sync', players:_players});
    _renderBoard();

  } else if(msg.type === 'sync'){
    _players = msg.players;
    _renderBoard();
    _renderLobby();

  } else if(msg.type === 'start'){
    _doStart();

  } else if(msg.type === 'bye'){
    if(_players[fromId]) _players[fromId].status = 'out';
    if(_isHost){ _broadcast({type:'sync', players:_players}); _checkRoundEnd(); }
    _renderBoard();

  } else if(msg.type === 'full'){
    _status('Room is full (20 players max).', true);
    _active = false;
    if(_peer){ try{_peer.destroy()}catch(e){} _peer = null; }

  } else if(msg.type === 'roundWin'){
    if(_players[fromId]){ _players[fromId].status='win'; _players[fromId].score=msg.score; _players[fromId].phase=msg.phase+1; }
    if(_isHost){
      if(!_roundWinner) _roundWinner = _players[fromId]?.name || '';
      _broadcast({type:'sync', players:_players});
      _broadcast({type:'roundAnnounce', winner:_roundWinner});
      _checkRoundEnd();
    }
    _renderBoard();
    if(window.onMPRoundAnnounce) window.onMPRoundAnnounce('🏆 '+(_players[fromId]?.name||'')+ ' finished!');

  } else if(msg.type === 'roundOut'){
    if(_players[fromId]){ _players[fromId].status='out'; _players[fromId].score=msg.score; }
    if(_isHost){ _broadcast({type:'sync', players:_players}); _checkRoundEnd(); }
    _renderBoard();

  } else if(msg.type === 'roundAnnounce'){
    if(window.onMPRoundAnnounce) window.onMPRoundAnnounce('🏆 '+msg.winner+' leads!');

  } else if(msg.type === 'roundEnd'){
    _players = msg.players || _players;
    _renderBoard();
    if(window.onMPRoundEnd) window.onMPRoundEnd(msg.winner || '');

  } else if(msg.type === 'ready'){
    _readySet.add(fromId);
    const total = Object.keys(_players).length;
    if(_isHost && _readySet.size >= total){
      _readySet.clear(); _roundWinner = '';
      Object.values(_players).forEach(p=>{ if(p.status!=='out') p.status='playing'; });
      _broadcast({type:'nextRound', players:_players});
      if(window.onMPNextRound) window.onMPNextRound();
    }

  } else if(msg.type === 'nextRound'){
    _players = msg.players || _players;
    _renderBoard();
    if(window.onMPNextRound) window.onMPNextRound();

  } else if(msg.type === 'launch'){
    if(typeof launchPhase==='function') launchPhase();

  } else if(msg.type === 'chaosSpawn'){
    if(window.applyChaosSpawn) window.applyChaosSpawn(msg.item);

  } else if(msg.type === 'chaosCatch'){
    // Host relays to all other clients
    if(_isHost) _broadcast(msg);
    if(window.removeChaosItem) window.removeChaosItem(msg.chaosId);
  }
}

/* ── push my current state ────────────────────────────────── */
function _pushState(){
  _myEntry();
  // Include boat position and hook state for ghost rendering
  const boatX = window.getMyBoatX ? window.getMyBoatX() : 0.5;
  const hookY = window.getMyHookY ? window.getMyHookY() : 0.5;
  const hookAngle = window.getMyHookAngle ? window.getMyHookAngle() : 0;
  if(_players[_myId]){ _players[_myId].boatX = boatX; _players[_myId].hookY = hookY; _players[_myId].hookAngle = hookAngle; }
  if(_isHost){
    _broadcast({type:'sync', players:_players});
    _renderBoard();
  } else {
    _sendToHost({type:'update', data:_players[_myId]});
  }
}

/* ── init PeerJS peer ─────────────────────────────────────── */
function _initPeer(id, cb){
  if(typeof Peer === 'undefined'){
    _status('PeerJS not loaded — check connection.', true);
    return;
  }
  if(_peer){ try{_peer.destroy()}catch(e){} }
  _peer = id ? new Peer(id, {debug:0}) : new Peer({debug:0});
  _peer.on('open', rid => { _myId = rid; cb(rid); });
  _peer.on('error', e => {
    const m = e.type === 'unavailable-id' ? 'Code taken! Try again.' :
              e.type === 'peer-unavailable' ? 'Room not found.' :
              'Connection error: ' + (e.type||'unknown');
    _status(m, true);
  });
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════ */
const MP = {
  get active()    { return _active;    },
  get started()   { return _started;   },
  get isHost()    { return _isHost;    },
  get chaosMode() { return _chaosMode; },

  createRoom(){
    _isHost  = true;
    _myName  = (document.getElementById('pin')?.value||'').trim() || 'Host';
    _myBoat  = (typeof selectedBoat!=='undefined'?selectedBoat?.id:null) || 'classic';
    _roomCode = _genCode();
    _status('Creating room…');

    _initPeer(_pid(_roomCode), () => {
      _myEntry({status:'host'});
      document.getElementById('mp-code-val').textContent = _roomCode;
      document.getElementById('mp-code-box').style.display = 'block';
      document.getElementById('mp-start-btn').style.display = 'block';
      // Update panel title to reflect chaos mode
      const titleEl = document.querySelector('.mp-panel-title');
      if(titleEl) titleEl.textContent = _chaosMode ? '🔥 CHAOS FISHING — MULTIPLAYER' : '⚡ CIRCUIT RACE — MULTIPLAYER';
      _renderLobby();
      _status('Room ready — share the code!');

      _peer.on('connection', conn => {
        conn.on('open', () => {
          if(_clientConns.length >= 19){ conn.send({type:'full'}); conn.close(); return; }
          _clientConns.push(conn);
          conn.on('data',  m => _handleMsg(m, conn.peer));
          conn.on('close', () => {
            _clientConns = _clientConns.filter(c => c !== conn);
            _handleMsg({type:'bye'}, conn.peer);
          });
        });
      });
    });
    _active = true;
  },

  joinRoom(){
    _isHost = false;
    _myName = (document.getElementById('pin')?.value||'').trim() || 'Fisherman';
    _myBoat = (typeof selectedBoat!=='undefined'?selectedBoat?.id:null) || 'classic';
    const code = (document.getElementById('mp-join-input')?.value||'').trim().toUpperCase();
    if(code.length !== 4){ _status('Enter a 4-letter room code!', true); return; }
    _roomCode = code;
    _status('Connecting…');

    _initPeer(null, () => {
      _hostConn = _peer.connect(_pid(code), {reliable:true});
      _hostConn.on('open', () => {
        _myEntry();
        _hostConn.send({type:'join', name:_myName, boat:_myBoat});
        _status('Joined! Waiting for host…');
        document.getElementById('mp-waiting').style.display = 'flex';
        const bst = document.getElementById('bst');
        if(bst) bst.disabled = true;
      });
      _hostConn.on('data',  m => _handleMsg(m, _pid(code)));
      _hostConn.on('close', () => _status('Host disconnected.', true));
      _hostConn.on('error', () => _status('Could not reach that room.', true));
    });
    _active = true;
  },

  startRace(){
    if(!_isHost) return;
    _broadcast({type:'start'});
    _doStart();
  },

  reset(){
    if(_active){
      _broadcast({type:'bye'});
      _sendToHost({type:'bye'});
    }
    _active = false; _started = false; _isHost = false; _chaosMode = false;
    _players = {}; _clientConns = []; _hostConn = null;
    _myId = ''; _syncTimer = 0; _roundWinner = ''; _readySet.clear();
    if(_peer){ try{_peer.destroy()}catch(e){} _peer = null; }
    _hideBoard();
    const codeBox = document.getElementById('mp-code-box');
    const startBtn = document.getElementById('mp-start-btn');
    const waiting  = document.getElementById('mp-waiting');
    const plist    = document.getElementById('mp-plist');
    if(codeBox)  codeBox.style.display  = 'none';
    if(startBtn) startBtn.style.display = 'none';
    if(waiting)  waiting.style.display  = 'none';
    if(plist)    plist.innerHTML        = '';
    _status('');
  },

  tick(dt){
    if(!_active || !_started) return;
    _syncTimer += dt;
    if(_syncTimer > 800){ _syncTimer = 0; _pushState(); }
  },

  /* round events — called by game.js */
  roundWin(score, phase){
    if(!_active || !_started) return;
    if(_players[_myId]){ _players[_myId].score=score; _players[_myId].phase=phase+1; _players[_myId].status='win'; _players[_myId].boatX=window.getMyBoatX?window.getMyBoatX():0.5; }
    if(_isHost){
      if(!_roundWinner) _roundWinner = _myName;
      _broadcast({type:'sync', players:_players});
      _broadcast({type:'roundAnnounce', winner:_roundWinner});
      _checkRoundEnd();
      _renderBoard();
    } else {
      _sendToHost({type:'roundWin', score, phase});
    }
  },
  roundOut(score){
    if(!_active || !_started) return;
    if(_players[_myId]){ _players[_myId].score=score; _players[_myId].status='out'; }
    if(_isHost){
      _broadcast({type:'sync', players:_players});
      _checkRoundEnd();
      _renderBoard();
    } else {
      _sendToHost({type:'roundOut', score});
    }
  },
  sendReady(){
    const btn = document.getElementById('rre-ready-btn');
    if(btn) btn.disabled = true;
    const wm = document.getElementById('rre-waiting-msg');
    if(wm) wm.style.display = 'block';
    if(_isHost){
      _readySet.add(_myId);
      const total = Object.keys(_players).length;
      if(_readySet.size >= total){
        _readySet.clear(); _roundWinner = '';
        Object.values(_players).forEach(p=>{ if(p.status!=='out') p.status='playing'; });
        _broadcast({type:'nextRound', players:_players});
        if(window.onMPNextRound) window.onMPNextRound();
      }
    } else {
      _sendToHost({type:'ready'});
    }
  },

  /* solo mode callbacks (no round system) */
  onLevelDone(score, phase){
    if(!_active || !_started) return;
    if(_players[_myId]){ _players[_myId].score=score; _players[_myId].phase=phase+1; _players[_myId].status='playing'; }
    _pushState();
  },
  onDied(score){
    if(!_active || !_started) return;
    if(_players[_myId]){ _players[_myId].score=score; _players[_myId].status='out'; }
    _pushState();
  },
  onWin(score){
    if(!_active || !_started) return;
    if(_players[_myId]){ _players[_myId].score=score; _players[_myId].status='win'; }
    _pushState();
  },

  /* chaos mode — enable before room create/join */
  initChaos(){ _chaosMode = true; },

  /* chaos mode — host broadcasts a newly spawned item to all clients */
  chaosSpawn(item){
    if(!_active || !_started || !_isHost) return;
    _broadcast({type:'chaosSpawn', item});
  },

  /* chaos mode — any player caught item, broadcast removal */
  chaosCatch(chaosId){
    if(!_active || !_started) return;
    const msg = {type:'chaosCatch', chaosId};
    if(_isHost) _broadcast(msg);
    else _sendToHost(msg);
  },

  /* host broadcasts round launch to all clients */
  broadcastLaunch(){
    if(!_isHost || !_started) return;
    _broadcast({type:'launch'});
  },

  /* data access for game.js */
  getGhostBoats(){
    return Object.values(_players).filter(p => p.name !== _myName && p.boatX !== undefined);
  },
  getSortedPlayers(){
    return Object.values(_players).sort((a,b) => b.score - a.score);
  },
};

// Make MP accessible as window.MP for legacy checks
window.MP = MP;

/* ── tab switcher (called from HTML) ──────────────────────── */
function mpTab(t){
  document.getElementById('mp-tab-create').style.display = t === 'create' ? 'block' : 'none';
  document.getElementById('mp-tab-join').style.display   = t === 'join'   ? 'block' : 'none';
  document.querySelectorAll('.mp-tab').forEach(b => {
    b.classList.toggle('active',
      (t==='create' && b.dataset.tab==='create') ||
      (t==='join'   && b.dataset.tab==='join'));
  });
}
