require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');
const { PlayerState, shuffle } = require('./game/PlayerState');
const { TurnManager } = require('./game/TurnManager');
const { resolveRPS, randomChoice } = require('./game/RockPaperScissors');
const EffectEngine = require('./game/effects/EffectEngine');
const { createAuthRouter } = require('./auth/routes');
const SqliteSessionStore = require('./auth/SqliteSessionStore');

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET não configurado — defina em backend/.env (veja .env.example).');
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
// Em produção o Nginx termina o HTTPS e fala com o Node por HTTP simples — sem isso, o Express
// acha que a conexão é insegura (req.secure=false) e recusa a mandar cookie com `secure: true`
// (ver sessionMiddleware abaixo). 1 = confia só no proxy imediato (o próprio Nginx local).
app.set('trust proxy', 1);
// crossOriginResourcePolicy 'same-origin' (padrão do helmet) bloqueia o front (porta 5173)
// de carregar as imagens das cartas servidas pelo back (porta 3001) — são origens diferentes
// de propósito nesse projeto, então relaxamos só essa política.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const db = new Database(path.join(__dirname, 'palworld.db'));
// WAL evita fsync síncrono a cada escrita (o padrão 'delete' bloqueia a thread única do Node —
// perceptível sobretudo no Windows, sob rajadas de requisições concorrentes).
db.pragma('journal_mode = WAL');

const sessionMiddleware = session({
  store: new SqliteSessionStore(db),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true, // idem trust proxy acima — precisa dos dois pra express-session confiar no X-Forwarded-Proto
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
});
app.use(sessionMiddleware);

// Resolve helper genérico usado em migrações de schema (checa se uma coluna já existe antes
// de decidir se precisa reconstruir a tabela — SQLite não suporta ALTER/DROP CONSTRAINT).
function columnExists(table, column) {
  return !!db.prepare('SELECT 1 FROM pragma_table_info(?) WHERE name = ?').get(table, column);
}

// Reconstrói uma tabela que era um singleton (id INTEGER PRIMARY KEY CHECK (id = 1)) pra ter
// player_id como chave — SQLite não suporta ALTER/DROP CONSTRAINT, então tem que recriar.
// A linha existente (se houver) migra pro jogador legado (id=1). No-op se já migrada.
function migrateToPlayerIdPk(table, createNewTableSql, copyColumns) {
  if (columnExists(table, 'player_id')) return;
  db.exec(`ALTER TABLE ${table} RENAME TO ${table}_old`);
  db.exec(createNewTableSql);
  db.exec(`INSERT INTO ${table} (player_id, ${copyColumns.join(', ')}) SELECT 1, ${copyColumns.join(', ')} FROM ${table}_old`);
  db.exec(`DROP TABLE ${table}_old`);
}

// Resolve o id da linha em `players` (perfil de jogo) a partir do id em `users` (identidade/login).
function resolvePlayerId(userId) {
  const row = db.prepare('SELECT id FROM players WHERE user_id = ?').get(userId);
  return row ? row.id : null;
}

// Anexa req.playerId (ou null) em toda requisição — rotas públicas podem usá-lo opcionalmente
// (ex: listar decks incluindo os próprios além dos presets); requirePlayer abaixo é quem bloqueia.
app.use((req, res, next) => {
  req.playerId = req.session.userId ? resolvePlayerId(req.session.userId) : null;
  next();
});

function requirePlayer(req, res, next) {
  if (!req.playerId) return res.status(401).json({ error: 'not_authenticated' });
  next();
}

// Vincula o perfil de jogo (`players`) a um usuário recém-criado. O 1º usuário a se registrar
// herda a linha legada id=1 (dados de quando o app ainda não tinha login); os demais ganham
// uma linha nova com os valores padrão.
function onUserCreated(userId) {
  const legacyRow = db.prepare('SELECT id FROM players WHERE id = 1 AND user_id IS NULL').get();
  if (legacyRow) {
    db.prepare('UPDATE players SET user_id = ? WHERE id = 1').run(userId);
    return;
  }
  db.prepare('INSERT INTO players (user_id, gold_coins, pal_fluid) VALUES (?, 500, 0)').run(userId);
}

app.use('/api/auth', createAuthRouter(db, { onUserCreated }));

// Serve as imagens das cartas como arquivos estáticos
// /cardart/BP01-001.png
app.use('/cardart', express.static(path.join(__dirname, 'public', 'cardart')));

// Cria a tabela de decks salvos (se não existir)
db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    main_deck TEXT NOT NULL,   -- JSON com array de card_number (com repetição)
    soul_deck TEXT NOT NULL,   -- JSON com array de card_number
    colors TEXT NOT NULL,      -- JSON com array de cores escolhidas
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
// 'normal' = deck livre, usa qualquer carta (ignora a coleção do jogador), pra jogo casual.
// 'rank' = montado só com as cópias que o jogador realmente possui e tem disponíveis (não reservadas
// em Breeding/Farming/Forno) no momento da montagem.
try { db.exec("ALTER TABLE decks ADD COLUMN mode TEXT NOT NULL DEFAULT 'normal'"); } catch (e) {}
// NULL = deck preset/compartilhado (os 2 decks iniciais abaixo); preenchido = deck salvo por um jogador.
try { db.exec('ALTER TABLE decks ADD COLUMN player_id INTEGER'); } catch (e) {}

// ---------- Decks pré-montados padrão (criados 1x, se ainda não existirem) ----------
function expandPairs(pairs) {
  const arr = [];
  for (const [num, qty] of pairs) for (let i = 0; i < qty; i++) arr.push(num);
  return arr;
}

function seedDefaultDecks() {
  const deleteByName = db.prepare('DELETE FROM decks WHERE name = ?');
  const insert = db.prepare('INSERT INTO decks (name, main_deck, soul_deck, colors) VALUES (?, ?, ?, ?)');
  const soulDeck = JSON.stringify(Array(10).fill('SOUL-001'));

  {
    const pairs = [
      ['TD01-008', 4], ['BP01-042', 4], ['BP01-021', 4], ['BP01-011', 4], ['TD01-002', 2],
      ['TD01-021', 4], ['TD01-003', 4], ['TD01-014', 2], ['TD01-015', 4], ['TD01-010', 4],
      ['BP01-004', 4], ['BP01-007', 3], ['TD01-017', 4], ['BP01-013', 3]
    ];
    deleteByName.run('Red/Blue First Deck');
    insert.run('Red/Blue First Deck', JSON.stringify(expandPairs(pairs)), soulDeck, JSON.stringify(['Red', 'Blue']));
  }

  {
    const pairs = [
      ['BP01-060', 2], ['TD02-003', 2], ['BP01-072', 2], ['BP01-069', 2], ['BP01-063', 1],
      ['BP01-052', 1], ['BP01-066', 1], ['BP01-065', 1], ['TD02-011', 2], ['TD02-002', 2],
      ['TD02-023', 2], ['TD02-008', 2], ['BP01-096', 1], ['TD02-014', 2], ['TD02-009', 2],
      ['BP01-091', 1], ['TD02-004', 2], ['TD02-015', 2], ['TD02-020', 2], ['TD02-021', 2],
      ['BP01-059', 2], ['BP01-075', 1], ['BP01-050', 1], ['BP01-049', 1], ['BP01-055', 1],
      ['TD02-006', 1], ['TD02-012', 2], ['TD02-018', 1], ['BP01-051', 2], ['BP01-058', 2],
      ['BP01-083', 2]
    ];
    deleteByName.run('Green/Purple First Deck');
    insert.run('Green/Purple First Deck', JSON.stringify(expandPairs(pairs)), soulDeck, JSON.stringify(['Green', 'Purple']));
  }
}
seedDefaultDecks();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
// Compartilha a mesma sessão de login com o socket.io — assim `socket.request.session` dá
// o playerId confiável (vindo do cookie), em vez de confiar em algo que o cliente mandasse.
io.engine.use(sessionMiddleware);

// ---------- Matchmaking online: fila de "Encontrar Partida" (Normal / Arena) ----------
// Fila em memória, válida enquanto o processo Node estiver de pé — se um dia isso escalar para
// múltiplas instâncias do servidor, precisa virar uma fila compartilhada (ex: Redis) em vez de array local.
const matchQueues = { normal: [], arena: [] };
// playerId -> matchType da fila em que está. Evita que o mesmo jogador entre em 2 filas ao mesmo
// tempo e permite tirar da fila rápido (cancelamento/disconnect) sem varrer os arrays.
const queuedPlayers = new Map();
// roomId -> { matchType, players: [{ socket, playerId, deckId }, ...] } — sessões já pareadas,
// aguardando a etapa seguinte (Jokenpô + criação do TurnManager compartilhado).
const onlineSessions = new Map();

// Mesma regra de dono/preset usada em GET /api/decks/:id; Arena só aceita decks Rank (montados só
// com cópias que o jogador realmente possui — ver comentário perto da criação da coluna `mode`).
function validateDeckForMatch(playerId, deckId, matchType) {
  const row = db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId);
  if (!row) return { ok: false, message: 'Deck não encontrado.' };
  if (row.player_id != null && row.player_id !== playerId) return { ok: false, message: 'Deck não encontrado.' };
  if (matchType === 'arena' && (row.mode || 'normal') !== 'rank') {
    return { ok: false, message: 'Só decks Rank valem pra Arena.' };
  }
  return { ok: true };
}

function removeFromQueue(playerId) {
  const matchType = queuedPlayers.get(playerId);
  if (!matchType) return;
  const queue = matchQueues[matchType];
  const idx = queue.findIndex(entry => entry.playerId === playerId);
  if (idx !== -1) queue.splice(idx, 1);
  queuedPlayers.delete(playerId);
}

function getUsernameForPlayer(playerId) {
  const row = db.prepare('SELECT u.username FROM users u JOIN players p ON p.user_id = u.id WHERE p.id = ?').get(playerId);
  return row ? row.username : 'Jogador';
}

function otherSide(side) { return side === 'A' ? 'B' : 'A'; }

// socket.id -> roomId, pra achar a sessão de dentro dos handlers match:* sem precisar de estado
// por-conexão (a sessão é compartilhada pelos 2 sockets pareados, não pertence a um só).
const socketRoomMap = new Map();

function getSessionBySocket(socket) {
  const roomId = socketRoomMap.get(socket.id);
  return roomId ? onlineSessions.get(roomId) : null;
}

function getSideBySocket(session, socket) {
  return session.sides.A.socket === socket ? 'A' : 'B';
}

// Achado comum a todo handler match:* de jogo: sessão + turnManager já criado + quem é "eu"/"o
// oponente" pro socket que chamou. Retorna null se não houver partida em andamento pra esse socket.
function matchContext(socket) {
  const session = getSessionBySocket(socket);
  if (!session || !session.turnManager) return null;
  const side = getSideBySocket(session, socket);
  return {
    session,
    tm: session.turnManager,
    self: session.states[side],
    opponent: session.states[otherSide(side)],
    side,
    playerId: session.sides[side].playerId
  };
}

// Conta vitória pra missão diária de cada jogador real (equivalente ao checkWinMission do modo Bot,
// só que os 2 lados são humanos de verdade e cada um tem sua própria progressão de missão).
function checkOnlineWinMissions(session) {
  const tm = session.turnManager;
  if (!tm.gameOver) return;
  session.winCounted = session.winCounted || {};
  for (const side of ['A', 'B']) {
    if (tm.winner === session.states[side] && !session.winCounted[side]) {
      incrementMission(session.sides[side].playerId, 'win_games', null, 1);
      session.winCounted[side] = true;
    }
  }
  finishArenaRankPoints(session);
}

// Aplica pontos de rank 1x só por partida Arena — tanto no fim natural (aqui) quanto no W.O. por
// desconexão (ver socket.on('disconnect')). Partida Normal nunca afeta rank.
function finishArenaRankPoints(session) {
  if (session.matchType !== 'arena' || session.rankPointsApplied) return;
  const tm = session.turnManager;
  if (!tm || !tm.gameOver) return;
  const winnerSide = tm.winner === session.states.A ? 'A' : 'B';
  const loserSide = otherSide(winnerSide);
  const { gained, lost } = applyArenaRankPoints(session.sides[winnerSide].playerId, session.sides[loserSide].playerId);
  // Guardado por lado pra emitMatchState mandar pra cada socket o delta que É DELE (+gained pro
  // ganhador, -lost pro perdedor) — mostrado embaixo de "Você venceu!"/"Você perdeu!" no front.
  session.arenaPointsChange = { [winnerSide]: gained, [loserSide]: -lost };
  session.rankPointsApplied = true;
}

// Emite o estado da partida pros 2 sockets da sessão, cada um com sua própria perspectiva —
// equivalente ao emitState() do modo Bot, mas chamado 1x por lado em vez de 1x só (o "dono" da
// partida vs Bot é sempre o mesmo socket; aqui os 2 lados são reais e cada um só vê a própria mão).
function emitMatchState(session) {
  const tm = session.turnManager;
  if (!tm) return;
  checkOnlineWinMissions(session);

  // Night (5.3) é um estado contínuo — só loga a transição 1x por sessão (não por lado).
  const currentlyNight = tm.isNight;
  if (session._lastKnownNight === undefined) session._lastKnownNight = currentlyNight;
  if (currentlyNight !== session._lastKnownNight) {
    tm._addLog(currentlyNight ? 'Anoiteceu.' : 'Amanheceu.');
    session._lastKnownNight = currentlyNight;
  }

  const pending = tm.pendingEffect;
  const battle = tm.pendingBattle;

  for (const side of ['A', 'B']) {
    const self = session.states[side];
    const opponent = session.states[otherSide(side)];
    const selfIsPlayer1 = self === tm.player1;
    // absoluteTarget (EffectEngine) rotula os alvos como 'player'=player1/'bot'=player2, sempre —
    // pra quem é player2 (side B), inverte, senão a UI mostraria os PRÓPRIOS Pals marcados como 'bot'.
    const mapOwner = (owner) => (selfIsPlayer1 ? owner : (owner === 'player' ? 'bot' : 'player'));
    const isDefender = !!battle && battle.defenderState === self;

    session.sides[side].socket.emit('match:state', {
      turnNumber: tm.turnNumber,
      currentPhase: tm.currentPhase,
      activePlayer: tm.activePlayer.playerName,
      isYourTurn: tm.activePlayer === self,
      player: self.toPublicState(opponent),
      opponent: opponent.toPublicState(self),
      hand: self.hand, // mão completa só pro dono
      isNight: tm.isNight,
      gameOver: tm.gameOver,
      winner: tm.winner ? tm.winner.playerName : null,
      youWon: tm.winner ? tm.winner === self : null,
      // Só existe em partida Arena, só depois do jogo acabar — quanto ESSE lado ganhou (positivo) ou
      // perdeu (negativo) de pontos de rank nessa partida (ver finishArenaRankPoints).
      arenaPointsChange: session.arenaPointsChange ? session.arenaPointsChange[side] : null,
      log: tm.log.slice(-10),
      pendingEffect: pending ? {
        kind: pending.kind,
        sourceCardName: pending.sourceCardName,
        description: pending.description,
        optional: pending.optional,
        isYours: pending.casterState === self,
        validTargets: pending.validTargets ? pending.validTargets.map(t => ({ owner: mapOwner(t.owner), index: t.index })) : null,
        min: pending.min,
        max: pending.max,
        options: pending.options ? pending.options.map(o => o.description) : null,
        cards: pending.cards ? pending.cards.map(entry => ({
          cardNumber: entry.card.card_number, name: entry.card.name, imageUrl: entry.card.image_url, selectable: entry.selectable
        })) : null
      } : null,
      pendingBattle: battle ? {
        waitingFor: battle.waitingFor,
        attackerName: battle.attackerInstance.data.name,
        isDefender,
        // Quem ataca não decide bloqueio/quick step do outro lado — só o defensor vê as opções.
        validBlockers: isDefender ? (battle.validBlockers || []).map(p => self.basePals.indexOf(p)) : [],
        quickOptions: isDefender ? (battle.quickOptions || []).map(o => ({
          cardNumber: o.card.card_number, name: o.card.name, imageUrl: o.card.image_url, kind: o.kind
        })) : [],
        interruptCard: battle.interruptCard ? {
          cardNumber: battle.interruptCard.card_number, name: battle.interruptCard.name, imageUrl: battle.interruptCard.image_url
        } : null
      } : null,
      lastDamageReveal: tm.lastDamageReveal
    });
  }
}

// Monta os 2 PlayerState (a partir dos decks escolhidos na fila) e entra na sessão pareada — o
// TurnManager só é criado depois do Jokenpô (ver match:chooseOrder), igual ao fluxo do modo Bot.
function startOnlineMatch(matchType, a, b) {
  const roomId = `match_${crypto.randomUUID()}`;
  a.socket.join(roomId);
  b.socket.join(roomId);

  const session = {
    matchType,
    roomId,
    sides: { A: a, B: b },
    states: { A: null, B: null },
    turnManager: null,
    rpsChoices: {},
    mulliganDecided: {}
  };

  for (const side of ['A', 'B']) {
    const entry = session.sides[side];
    const deckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(entry.deckId);
    const mainCards = shuffle(getCardsByNumbers(JSON.parse(deckRow.main_deck)));
    const soulCards = shuffle(getCardsByNumbers(JSON.parse(deckRow.soul_deck)));
    session.states[side] = new PlayerState(getUsernameForPlayer(entry.playerId), mainCards, soulCards);
    socketRoomMap.set(entry.socket.id, roomId);
  }

  onlineSessions.set(roomId, session);

  for (const side of ['A', 'B']) {
    session.sides[side].socket.emit('match:found', {
      matchType,
      opponentName: session.states[otherSide(side)].playerName
    });
    session.sides[side].socket.emit('match:rpsPrompt', { message: 'Jokenpô! Escolha pedra, papel ou tesoura.' });
  }
  console.log(`Partida online pareada (${matchType}): room ${roomId}`);
}

// Pareia os 2 primeiros jogadores de playerId diferentes na fila (evita parear alguém com ele
// mesmo, ex.: 2 abas logadas na mesma conta) e repete recursivamente enquanto sobrar gente pra parear.
function tryPairQueue(matchType) {
  const queue = matchQueues[matchType];
  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      if (queue[i].playerId === queue[j].playerId) continue;
      const [b] = queue.splice(j, 1);
      const [a] = queue.splice(i, 1);
      queuedPlayers.delete(a.playerId);
      queuedPlayers.delete(b.playerId);
      startOnlineMatch(matchType, a, b);
      tryPairQueue(matchType);
      return;
    }
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Palworld TCG rodando!' });
});

// Retorna todas as cartas do banco
app.get('/api/cards', (req, res) => {
  const rows = db.prepare('SELECT * FROM cards').all();

  const cards = rows.map(row => ({
    ...row,
    colors: JSON.parse(row.colors),
    keywords: JSON.parse(row.keywords),
    is_lucky: !!row.is_lucky,
    image_url: `/${row.image_path}`
  }));

  res.json(cards);
});

// Retorna 1 carta específica pelo número (ex: /api/cards/BP01-001)
app.get('/api/cards/:cardNumber', (req, res) => {
  const row = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(req.params.cardNumber);
  if (!row) return res.status(404).json({ error: 'Carta não encontrada' });

  res.json({
    ...row,
    colors: JSON.parse(row.colors),
    keywords: JSON.parse(row.keywords),
    is_lucky: !!row.is_lucky,
    image_url: `/${row.image_path}`
  });
});

// Salva um novo deck (sempre vinculado a quem salvou — precisa estar logado)
app.post('/api/decks', requirePlayer, (req, res) => {
  const { name, mainDeckCardNumbers, soulDeckCardNumbers, colors, mode } = req.body;

  if (!name || !mainDeckCardNumbers || !soulDeckCardNumbers) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const deckMode = mode === 'rank' ? 'rank' : 'normal';

  if (deckMode === 'rank') {
    const counts = {};
    for (const num of mainDeckCardNumbers) counts[num] = (counts[num] || 0) + 1;
    for (const [num, needed] of Object.entries(counts)) {
      if (getAvailableQuantity(req.playerId, num) < needed) {
        return res.status(400).json({ error: `Deck Rank inválido: você não tem ${needed} cópia(s) disponível(is) de ${num}.` });
      }
    }
  }

  const stmt = db.prepare(`
    INSERT INTO decks (name, main_deck, soul_deck, colors, mode, player_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    JSON.stringify(mainDeckCardNumbers),
    JSON.stringify(soulDeckCardNumbers),
    JSON.stringify(colors || []),
    deckMode,
    req.playerId
  );

  res.json({ id: result.lastInsertRowid, message: 'Deck salvo com sucesso.' });
});

// Lista os decks preset (compartilhados, player_id NULL) + os próprios decks salvos de quem
// estiver logado. Decks salvos por outros jogadores não aparecem.
app.get('/api/decks', (req, res) => {
  const rows = req.playerId
    ? db.prepare('SELECT id, name, colors, main_deck, created_at, mode FROM decks WHERE player_id IS NULL OR player_id = ? ORDER BY created_at DESC').all(req.playerId)
    : db.prepare('SELECT id, name, colors, main_deck, created_at, mode FROM decks WHERE player_id IS NULL ORDER BY created_at DESC').all();
  const getCard = db.prepare('SELECT * FROM cards WHERE card_number = ?');

  const decks = rows.map(r => {
    const mainNumbers = JSON.parse(r.main_deck);
    const uniqueCards = [...new Map(mainNumbers.map(num => [num, getCard.get(num)])).values()];

    const luckyPals = uniqueCards
      .filter(c => c && c.is_lucky && c.card_type === 'Pal')
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 2)
      .map(c => ({ name: c.name, image_url: `/${c.image_path}` }));

    return {
      id: r.id,
      name: r.name,
      colors: JSON.parse(r.colors),
      created_at: r.created_at,
      mode: r.mode || 'normal',
      luckyPals
    };
  });

  res.json(decks);
});

// Busca 1 deck específico, já com os dados completos das cartas
app.get('/api/decks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM decks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Deck não encontrado.' });
  // Só o dono vê o próprio deck salvo; presets (player_id NULL) são visíveis a todos.
  if (row.player_id != null && row.player_id !== req.playerId) {
    return res.status(404).json({ error: 'Deck não encontrado.' });
  }

  const mainNumbers = JSON.parse(row.main_deck);
  const soulNumbers = JSON.parse(row.soul_deck);

  const getCard = db.prepare('SELECT * FROM cards WHERE card_number = ?');
  const buildCard = (num) => {
    const c = getCard.get(num);
    return {
      ...c,
      colors: JSON.parse(c.colors),
      keywords: JSON.parse(c.keywords),
      is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`
    };
  };

  res.json({
    id: row.id,
    name: row.name,
    colors: JSON.parse(row.colors),
    mode: row.mode || 'normal',
    mainDeck: mainNumbers.map(buildCard),
    soulDeck: soulNumbers.map(buildCard)
  });
});

// Apaga 1 deck salvo. Só o dono pode apagar; decks preset (player_id NULL) nunca são apagáveis por aqui.
app.delete('/api/decks/:id', requirePlayer, (req, res) => {
  const row = db.prepare('SELECT id, player_id FROM decks WHERE id = ?').get(req.params.id);
  if (!row || row.player_id !== req.playerId) {
    return res.status(404).json({ error: 'Deck não encontrado.' });
  }

  db.prepare('DELETE FROM decks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deck apagado com sucesso.' });
});

// ---------- ECONOMIA: moedas, coleção do jogador, loja de boosters ----------

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    gold_coins INTEGER NOT NULL DEFAULT 500,
    pal_fluid INTEGER NOT NULL DEFAULT 0
  )
`);
// user_id vincula o perfil de jogo à conta (tabela `users`, em auth/routes.js). Fica NULL até
// a linha legada (id=1, de antes do login existir) ser reivindicada por quem se registrar primeiro.
// SQLite não permite ADD COLUMN com UNIQUE direto — a constraint vem de um índice separado.
try { db.exec('ALTER TABLE players ADD COLUMN user_id INTEGER REFERENCES users(id)'); } catch (e) {}
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id)');
// Cria a linha legada (id=1) se ainda não existir — vira o perfil do 1º usuário a se registrar.
if (!db.prepare('SELECT id FROM players WHERE id = 1').get()) {
  db.prepare('INSERT INTO players (id, gold_coins, pal_fluid) VALUES (1, 500, 0)').run();
}

db.exec(`
  CREATE TABLE IF NOT EXISTS player_cards (
    player_id INTEGER NOT NULL,
    card_number TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, card_number)
  )
`);
// Upgrade de banco já existente: schema antigo não tinha player_id (inventário era global).
// Reconstrói a tabela migrando o inventário existente pro jogador legado (id=1).
if (!columnExists('player_cards', 'player_id')) {
  db.exec('ALTER TABLE player_cards RENAME TO player_cards_old');
  db.exec(`
    CREATE TABLE player_cards (
      player_id INTEGER NOT NULL,
      card_number TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      reserved INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (player_id, card_number)
    )
  `);
  db.exec(`
    INSERT INTO player_cards (player_id, card_number, quantity, reserved)
    SELECT 1, card_number, quantity, reserved FROM player_cards_old
  `);
  db.exec('DROP TABLE player_cards_old');
}

function getAvailableQuantity(playerId, cardNumber) {
  const row = db.prepare('SELECT quantity, reserved FROM player_cards WHERE player_id = ? AND card_number = ?').get(playerId, cardNumber);
  if (!row) return 0;
  return row.quantity - row.reserved;
}

// Agrupa números repetidos (ex.: os 2 pais do Breeding sendo a mesma carta) antes de checar/reservar
function groupCounts(cardNumbers) {
  const counts = {};
  for (const num of cardNumbers) counts[num] = (counts[num] || 0) + 1;
  return counts;
}

function hasEnoughAvailable(playerId, cardNumbers) {
  return Object.entries(groupCounts(cardNumbers)).every(([num, needed]) => getAvailableQuantity(playerId, num) >= needed);
}

function reserveCards(playerId, cardNumbers) {
  for (const [num, count] of Object.entries(groupCounts(cardNumbers))) {
    db.prepare('UPDATE player_cards SET reserved = reserved + ? WHERE player_id = ? AND card_number = ?').run(count, playerId, num);
  }
}

function releaseCards(playerId, cardNumbers) {
  for (const [num, count] of Object.entries(groupCounts(cardNumbers))) {
    db.prepare('UPDATE player_cards SET reserved = MAX(0, reserved - ?) WHERE player_id = ? AND card_number = ?').run(count, playerId, num);
  }
}
// Adiciona colunas de controle de trial deck se ainda não existirem (upgrade de banco já existente)
try { db.exec('ALTER TABLE players ADD COLUMN bought_td01 INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN bought_td02 INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN cake_count INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN special_cake_count INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN wheat INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN lettuce INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE players ADD COLUMN tomato INTEGER NOT NULL DEFAULT 0'); } catch (e) {}
// Preferência de tema (dia/noite) do usuário — persiste no perfil pra sobreviver a troca de tela/login em outro dispositivo.
try { db.exec("ALTER TABLE players ADD COLUMN theme TEXT NOT NULL DEFAULT 'day'"); } catch (e) {}
// Pontuação do modo Arena (rank) — nunca fica negativa (ver applyArenaRankPoints).
try { db.exec('ALTER TABLE players ADD COLUMN rank_points INTEGER NOT NULL DEFAULT 0'); } catch (e) {}

// ---------- ARENA: ranks (Bronze → Lenda) ----------
// Limiar (pontos mínimos) pra entrar em cada rank. Pensado pra ~70 vitórias seguidas (sem nenhuma
// derrota) levarem de Bronze até Lenda — na prática, com derrotas misturadas, um jogador com ~60%
// de vitórias leva uns 120-150 jogos pra chegar em Lenda, e uns 15-20 pra chegar em Ouro. Os saltos
// entre ranks crescem (100 → 150 → 200 → 250 → 300 → 400) pra ranks mais altos exigirem mais grind.
const RANK_TIERS = [
  { key: 'bronze', threshold: 0 },
  { key: 'silver', threshold: 100 },
  { key: 'gold', threshold: 250 },
  { key: 'platinum', threshold: 450 },
  { key: 'diamond', threshold: 700 },
  { key: 'master', threshold: 1000 },
  { key: 'legend', threshold: 1400 }
];
// Vitória rende entre 18~24 pontos e derrota custa entre 7~11 — a média (21 / 9) já garante que
// vitória rende mais do que derrota custa, então um jogador com winrate perto de 50% ainda progride
// devagar em vez de ficar estagnado. O valor exato dentro dessas faixas pondera a diferença de
// pontos entre os 2 jogadores no momento da partida (estilo Elo): vencer alguém com MAIS pontos que
// você (upset) rende o máximo da faixa e custa o máximo pra quem perdeu; vencer alguém com MENOS
// pontos (resultado esperado) rende só o mínimo da faixa. Isso pesa mais quem estava "no papel" de
// favorito ou não, em vez de dar sempre a mesma pontuação pra qualquer vitória/derrota.
const ARENA_WIN_POINTS_MIN = 18;
const ARENA_WIN_POINTS_MAX = 24;
const ARENA_LOSS_POINTS_MIN = 7;
const ARENA_LOSS_POINTS_MAX = 11;
// Diferença de pontos (perdedor - ganhador) que já vale o balanço MÁXIMO da faixa pra cada lado —
// 200 pontos é uma distância "grande" na nossa escala de rank (thresholds vão de 0 a 1400).
const ARENA_POINTS_DIFF_SPAN = 200;

// scale vai de -1 (ganhador já tinha muito mais pontos que o perdedor — resultado bem esperado) a
// +1 (ganhador tinha muito menos pontos — upset) e pondera linearmente dentro das faixas acima.
function computeArenaPointsDelta(winnerPoints, loserPoints) {
  const diff = loserPoints - winnerPoints;
  const scale = Math.max(-1, Math.min(1, diff / ARENA_POINTS_DIFF_SPAN));
  const winMid = (ARENA_WIN_POINTS_MIN + ARENA_WIN_POINTS_MAX) / 2;
  const winHalfSpread = (ARENA_WIN_POINTS_MAX - ARENA_WIN_POINTS_MIN) / 2;
  const lossMid = (ARENA_LOSS_POINTS_MIN + ARENA_LOSS_POINTS_MAX) / 2;
  const lossHalfSpread = (ARENA_LOSS_POINTS_MAX - ARENA_LOSS_POINTS_MIN) / 2;
  return {
    gained: Math.round(winMid + winHalfSpread * scale),
    lost: Math.round(lossMid + lossHalfSpread * scale)
  };
}

function getRankInfo(points) {
  let tierIndex = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (points >= RANK_TIERS[i].threshold) tierIndex = i;
  }
  const next = RANK_TIERS[tierIndex + 1] || null;
  return {
    points,
    tierKey: RANK_TIERS[tierIndex].key,
    nextTierKey: next ? next.key : null,
    pointsToNext: next ? next.threshold - points : null,
    isMaxRank: !next
  };
}

// Aplica o resultado de 1 partida Arena — ganhador soma, perdedor perde (nunca abaixo de 0), com o
// valor exato ponderado pela diferença de pontos ATUAL entre os 2 (ver computeArenaPointsDelta).
// Chamado 1x só por partida (ver session.rankPointsApplied nos pontos de chamada, tanto fim natural
// quanto W.O.). Retorna o delta aplicado, útil pra exibir "+22 pontos" etc. no futuro.
function applyArenaRankPoints(winnerPlayerId, loserPlayerId) {
  const getPoints = db.prepare('SELECT rank_points FROM players WHERE id = ?');
  const winnerPoints = getPoints.get(winnerPlayerId)?.rank_points ?? 0;
  const loserPoints = getPoints.get(loserPlayerId)?.rank_points ?? 0;
  const { gained, lost } = computeArenaPointsDelta(winnerPoints, loserPoints);

  db.prepare('UPDATE players SET rank_points = rank_points + ? WHERE id = ?').run(gained, winnerPlayerId);
  db.prepare('UPDATE players SET rank_points = MAX(0, rank_points - ?) WHERE id = ?').run(lost, loserPlayerId);

  return { gained, lost };
}

// ---------- FARMING ----------
// Requisitos de work_keywords: "Farming" cobre plantar+regar, "Collecting" cobre colheita.
// "Transporting" é quem permite ligar o Repetir (colhe e reinicia sozinho).

db.exec(`
  CREATE TABLE IF NOT EXISTS farming_slot (
    player_id INTEGER PRIMARY KEY,
    pal_card_numbers TEXT,
    start_time TEXT,
    ready_time TEXT,
    duration_ms INTEGER,
    repeat_on INTEGER DEFAULT 0,
    harvest_count INTEGER DEFAULT 0
  )
`);
migrateToPlayerIdPk('farming_slot',
  `CREATE TABLE farming_slot (
    player_id INTEGER PRIMARY KEY,
    pal_card_numbers TEXT,
    start_time TEXT,
    ready_time TEXT,
    duration_ms INTEGER,
    repeat_on INTEGER DEFAULT 0,
    harvest_count INTEGER DEFAULT 0
  )`,
  ['pal_card_numbers', 'start_time', 'ready_time', 'duration_ms', 'repeat_on', 'harvest_count']
);

function getActiveFarmingSlot(playerId) {
  return db.prepare('SELECT * FROM farming_slot WHERE player_id = ?').get(playerId);
}

function getPalWorkKeywords(cardNumber) {
  const row = db.prepare('SELECT extra_data FROM cards WHERE card_number = ?').get(cardNumber);
  if (!row || !row.extra_data) return [];
  try {
    const parsed = JSON.parse(row.extra_data);
    return (parsed?.data?.work_keywords || []).map(k => String(k).toLowerCase());
  } catch (e) {
    return [];
  }
}

const FARMING_BASE_MINUTES = 15;

function computeFarmingReductionMinutes(cost) {
  if (cost >= 1 && cost <= 5) return 2;
  if (cost === 6 || cost === 7) return 4;
  return 6; // demais (8+, 0, ou sem custo)
}

app.post('/api/farming/start', requirePlayer, (req, res) => {
  if (getActiveFarmingSlot(req.playerId)) return res.status(400).json({ error: 'Já existe um Farming em andamento.' });

  const { cardNumbers, repeat } = req.body;
  if (!Array.isArray(cardNumbers) || cardNumbers.length < 1 || cardNumbers.length > 3) {
    return res.status(400).json({ error: 'Escolha de 1 a 3 Pals.' });
  }

  const cards = cardNumbers.map(num => db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(num));
  if (cards.some(c => !c)) return res.status(400).json({ error: 'Carta inválida.' });

  if (!hasEnoughAvailable(req.playerId, cardNumbers)) {
    return res.status(400).json({ error: 'Você precisa ter cópias disponíveis de todas as cartas escolhidas (algumas podem estar ocupadas em outra tarefa).' });
  }

  const allKeywords = cardNumbers.flatMap(getPalWorkKeywords);
  if (!allKeywords.includes('farming') || !allKeywords.includes('harvesting')) {
    return res.status(400).json({ error: 'Os Pals escolhidos precisam cobrir "Farming" (plantar/regar) e "Harvesting" (colheita) juntos.' });
  }

  if (repeat && !allKeywords.includes('collecting')) {
    return res.status(400).json({ error: 'Pra ligar o Repetir, um dos Pals precisa ter "Collecting".' });
  }

  let reductionMinutes = 0;
  for (const card of cards) reductionMinutes += computeFarmingReductionMinutes(card.cost ?? 0);

  const durationMs = Math.max(60 * 1000, (FARMING_BASE_MINUTES * 60 - reductionMinutes * 60) * 1000);
  const startTime = new Date();
  const readyTime = new Date(startTime.getTime() + durationMs);

  db.prepare(`
    INSERT INTO farming_slot (player_id, pal_card_numbers, start_time, ready_time, duration_ms, repeat_on, harvest_count)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(req.playerId, JSON.stringify(cardNumbers), startTime.toISOString(), readyTime.toISOString(), durationMs, repeat ? 1 : 0);

  reserveCards(req.playerId, cardNumbers);

  res.json({ readyTime: readyTime.toISOString() });
});

function harvestIngredients(playerId) {
  db.prepare('UPDATE players SET wheat = wheat + 5, lettuce = lettuce + 5, tomato = tomato + 5 WHERE id = ?').run(playerId);
}

app.get('/api/farming/status', requirePlayer, (req, res) => {
  let slot = getActiveFarmingSlot(req.playerId);
  if (!slot) return res.json({ active: false });

  let isReady = new Date() >= new Date(slot.ready_time);

  // Repetir ligado: colhe e reinicia sozinho, sem precisar de clique
  while (isReady && slot.repeat_on) {
    harvestIngredients(req.playerId);
    const newStart = new Date(slot.ready_time);
    const newReady = new Date(newStart.getTime() + slot.duration_ms);
    db.prepare('UPDATE farming_slot SET start_time = ?, ready_time = ?, harvest_count = harvest_count + 1 WHERE player_id = ?')
      .run(newStart.toISOString(), newReady.toISOString(), req.playerId);
    slot = getActiveFarmingSlot(req.playerId);
    isReady = new Date() >= new Date(slot.ready_time);
  }

  const cardsInfo = JSON.parse(slot.pal_card_numbers).map(num => {
    const c = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(num);
    return { ...c, colors: JSON.parse(c.colors), image_url: `/${c.image_path}` };
  });

  res.json({
    active: true,
    pals: cardsInfo,
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    isReady,
    repeat: !!slot.repeat_on,
    harvestCount: slot.harvest_count
  });
});

app.post('/api/farming/claim', requirePlayer, (req, res) => {
  const slot = getActiveFarmingSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Farming em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });

  harvestIngredients(req.playerId);
  releaseCards(req.playerId, JSON.parse(slot.pal_card_numbers));
  db.prepare('DELETE FROM farming_slot WHERE player_id = ?').run(req.playerId); // sem repetir, encerra e libera o slot

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  res.json({ wheat: player.wheat, lettuce: player.lettuce, tomato: player.tomato });
});

app.post('/api/farming/stop-repeat', requirePlayer, (req, res) => {
  const slot = getActiveFarmingSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Farming em andamento.' });
  db.prepare('UPDATE farming_slot SET repeat_on = 0 WHERE player_id = ?').run(req.playerId);
  res.json({ stopped: true });
});

// Forno: transforma ingredientes em Cake / Special Cake
const OVEN_RECIPES = {
  cake: { amount: 10, column: 'cake_count' },
  special_cake: { amount: 30, column: 'special_cake_count' }
};

const OVEN_BASE_MINUTES = 5;

function computeBakeReductionMinutes(cost) {
  if (cost >= 1 && cost <= 4) return 2;
  if (cost >= 5 && cost <= 7) return 3.5;
  if (cost >= 8) return 4;
  return 0; // sem custo
}

db.exec(`
  CREATE TABLE IF NOT EXISTS oven_slot (
    player_id INTEGER PRIMARY KEY,
    type TEXT,
    kindling_card_number TEXT,
    start_time TEXT,
    ready_time TEXT
  )
`);
migrateToPlayerIdPk('oven_slot',
  `CREATE TABLE oven_slot (
    player_id INTEGER PRIMARY KEY,
    type TEXT,
    kindling_card_number TEXT,
    start_time TEXT,
    ready_time TEXT
  )`,
  ['type', 'kindling_card_number', 'start_time', 'ready_time']
);

function getActiveOvenSlot(playerId) {
  return db.prepare('SELECT * FROM oven_slot WHERE player_id = ?').get(playerId);
}

app.post('/api/farming/bake', requirePlayer, (req, res) => {
  if (getActiveOvenSlot(req.playerId)) return res.status(400).json({ error: 'Já existe algo assando no forno.' });

  const { type, kindlingCardNumber } = req.body;
  const recipe = OVEN_RECIPES[type];
  if (!recipe) return res.status(400).json({ error: 'Receita inválida.' });

  if (!kindlingCardNumber) return res.status(400).json({ error: 'Escolha um Pal com Kindling pra acender o forno.' });
  if (getAvailableQuantity(req.playerId, kindlingCardNumber) < 1) return res.status(400).json({ error: 'Você não tem esse Pal disponível (ele pode estar ocupado em outra tarefa).' });
  const kindlingCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(kindlingCardNumber);
  const keywords = getPalWorkKeywords(kindlingCardNumber);
  if (!keywords.includes('kindling')) return res.status(400).json({ error: 'Esse Pal não tem "Kindling".' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.wheat < recipe.amount || player.lettuce < recipe.amount || player.tomato < recipe.amount) {
    return res.status(400).json({ error: `Precisa de ${recipe.amount} de cada ingrediente.` });
  }

  db.prepare(`
    UPDATE players SET wheat = wheat - ?, lettuce = lettuce - ?, tomato = tomato - ?
    WHERE id = ?
  `).run(recipe.amount, recipe.amount, recipe.amount, req.playerId);

  const reductionMinutes = computeBakeReductionMinutes(kindlingCard?.cost ?? 0);
  const durationMs = Math.max(0, (OVEN_BASE_MINUTES - reductionMinutes) * 60 * 1000);
  const startTime = new Date();
  const readyTime = new Date(startTime.getTime() + durationMs);

  db.prepare(`
    INSERT INTO oven_slot (player_id, type, kindling_card_number, start_time, ready_time)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.playerId, type, kindlingCardNumber, startTime.toISOString(), readyTime.toISOString());

  reserveCards(req.playerId, [kindlingCardNumber]);

  res.json({ ...db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId), readyTime: readyTime.toISOString() });
});

app.get('/api/farming/oven-status', requirePlayer, (req, res) => {
  const slot = getActiveOvenSlot(req.playerId);
  if (!slot) return res.json({ active: false });

  const kindlingCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.kindling_card_number);

  res.json({
    active: true,
    type: slot.type,
    kindlingPal: kindlingCard ? { ...kindlingCard, colors: JSON.parse(kindlingCard.colors), image_url: `/${kindlingCard.image_path}` } : null,
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    isReady: new Date() >= new Date(slot.ready_time)
  });
});

app.post('/api/farming/oven-claim', requirePlayer, (req, res) => {
  const slot = getActiveOvenSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Forno em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });

  const recipe = OVEN_RECIPES[slot.type];
  db.prepare(`UPDATE players SET ${recipe.column} = ${recipe.column} + 1 WHERE id = ?`).run(req.playerId);
  releaseCards(req.playerId, [slot.kindling_card_number]);
  db.prepare('DELETE FROM oven_slot WHERE player_id = ?').run(req.playerId);

  res.json(db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId));
});

const ITEM_PRICES = { cake: 15, special_cake: 30 }; // preço em Fluido de Pal

app.post('/api/shop/buy-item', requirePlayer, (req, res) => {
  const { item } = req.body;
  if (!ITEM_PRICES[item]) return res.status(400).json({ error: 'Item inválido.' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  const price = ITEM_PRICES[item];
  if (player.pal_fluid < price) return res.status(400).json({ error: 'Fluido de Pal insuficiente.' });

  const column = item === 'cake' ? 'cake_count' : 'special_cake_count';
  db.prepare(`UPDATE players SET pal_fluid = pal_fluid - ?, ${column} = ${column} + 1 WHERE id = ?`).run(price, req.playerId);

  res.json(db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId));
});

// Quanto de Fluido de Pal o jogador ganha ao "estourar" 4 cópias de uma carta, por raridade
const RARITY_FLUID = { C: 5, U: 10, R: 20, RR: 40, SR: 60, SP: 100, OSR: 150, SSP: 200, TD: 5 };
// Peso de sorteio de cada raridade dentro do booster (quanto maior, mais comum)
const BOOSTER_WEIGHTS = { C: 50, U: 30, R: 12, RR: 5, SR: 2, SP: 0.5, OSR: 0.3, SSP: 0.2 };
const BOOSTER_SET = 'BP01'; // único booster disponível no momento: Dawn of Palpagos
const BOOSTER_PRICE = 100;
const CARDS_PER_PACK = 7;

function weightedRandomCard(pool) {
  const totalWeight = pool.reduce((sum, c) => sum + (BOOSTER_WEIGHTS[c.rarity] || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const card of pool) {
    roll -= (BOOSTER_WEIGHTS[card.rarity] || 1);
    if (roll <= 0) return card;
  }
  return pool[pool.length - 1];
}

app.get('/api/player', requirePlayer, (req, res) => {
  const row = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  res.json({ ...row, rank: getRankInfo(row.rank_points) });
});

app.patch('/api/player/theme', requirePlayer, (req, res) => {
  const { theme } = req.body;
  if (theme !== 'day' && theme !== 'night') return res.status(400).json({ error: 'invalid_theme' });
  db.prepare('UPDATE players SET theme = ? WHERE id = ?').run(theme, req.playerId);
  res.json({ theme });
});

// ---------- BREEDING ----------
// Mecânica própria (não é parte das regras oficiais do TCG), inspirada na fórmula real do
// jogo Palworld: media do "poder" dos 2 pais -> resultado é o Pal cujo poder fica mais perto
// dessa média. Como não temos a tabela oficial de "breeding power" de cada Pal, usamos o
// CUSTO da carta como proxy de poder (é o dado mais próximo que já temos por Pal).

const BREEDING_HOURS = 24; // fallback padrão, caso a raridade não esteja mapeada

// Duração do Breeding de acordo com a raridade do resultado
const RARITY_DURATION_HOURS = {
  C: 10 / 60,   // 10 minutos
  U: 20 / 60,   // 20 minutos
  R: 2,         // 2 horas
  RR: 6,        // 6 horas
  TD: 10 / 60,  // cartas de trial deck tratadas como C
  OSR: 10,      // 10 horas
  SSP: 24       // 24 horas
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Busca a variante de um card_number testando cada sufixo na ordem dada (ex: carta normal usa
// "-SR", a versão de Trial Deck do mesmo Pal usa "-TSR" — nunca as duas ao mesmo tempo).
function findVariantBySuffixes(cardNumber, suffixes) {
  for (const suf of suffixes) {
    const row = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(`${cardNumber}-${suf}`);
    if (row) return row;
  }
  return null;
}

// Chance de "upgrade" pra uma variante Altered Art mais rara, se ela existir pra esse Pal
// (aplicado tanto no Breeding quanto nos boosters — por isso não filtra card_type: no BP01
// também tem Gear/Structure/Event com variante SR/SP, e nenhum deles pode ser resultado de Breeding)
function maybeUpgradeToVariant(baseCard) {
  const osrCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(`${baseCard.card_number}-OSR`);
  if (osrCard && Math.random() < 0.05) return osrCard; // 5% de chance

  const sspCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(`${baseCard.card_number}-SSP`);
  if (sspCard && Math.random() < 0.02) return sspCard; // 2% de chance

  const srCard = findVariantBySuffixes(baseCard.card_number, ['SR', 'TSR']);
  if (srCard && Math.random() < 0.15) return srCard; // 15% de chance

  const spCard = findVariantBySuffixes(baseCard.card_number, ['SP', 'TSP']);
  if (spCard && Math.random() < 0.04) return spCard; // 4% de chance

  return baseCard;
}

// Carrega a tabela real de breeding (extraída dos arquivos do jogo via PalCalc/paldex, MIT license)
const breedingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'real_breeding_table.json'), 'utf-8'));

db.exec(`
  CREATE TABLE IF NOT EXISTS breeding_slot (
    player_id INTEGER PRIMARY KEY,
    parent1 TEXT,
    parent2 TEXT,
    start_time TEXT,
    ready_time TEXT,
    result_card_number TEXT,
    claimed INTEGER DEFAULT 0
  )
`);
migrateToPlayerIdPk('breeding_slot',
  `CREATE TABLE breeding_slot (
    player_id INTEGER PRIMARY KEY,
    parent1 TEXT,
    parent2 TEXT,
    start_time TEXT,
    ready_time TEXT,
    result_card_number TEXT,
    claimed INTEGER DEFAULT 0
  )`,
  ['parent1', 'parent2', 'start_time', 'ready_time', 'result_card_number', 'claimed']
);

function getActiveBreedingSlot(playerId) {
  return db.prepare('SELECT * FROM breeding_slot WHERE player_id = ?').get(playerId);
}

// Pode haver mais de uma carta pra um mesmo Pal (ex: Digtoise tem "Seismic Drillback" e "Keen
// Needleback" como impressões distintas) — junta todas as empatadas no rank mais próximo e
// sorteia entre elas, em vez de sempre devolver a primeira que o SQLite encontrar.
function closestByBreedingPower(targetRank) {
  const allPals = db.prepare("SELECT * FROM cards WHERE card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").all();
  let bestDiff = Infinity;
  let candidates = [];
  for (const pal of allPals) {
    const rank = breedingData.breeding_power[pal.pal_name];
    if (rank == null) continue;
    const diff = Math.abs(rank - targetRank);
    if (diff < bestDiff) {
      bestDiff = diff;
      candidates = [pal];
    } else if (diff === bestDiff) {
      candidates.push(pal);
    }
  }
  return candidates.length ? pickRandom(candidates) : null;
}

// Quando o Pal real do combo (breedingData.combo_lookup) ainda não tem carta impressa no TCG,
// substituímos por um Pal existente de power IMEDIATAMENTE ACIMA (nunca abaixo) do power real
// dele — mesmo critério de empate/sorteio da closestByBreedingPower. Só cai pro mais próximo
// (incluindo abaixo) se não existir nenhuma carta com power maior ou igual.
function closestByBreedingPowerAbove(targetRank) {
  const allPals = db.prepare("SELECT * FROM cards WHERE card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").all();
  let bestDiff = Infinity;
  let candidates = [];
  for (const pal of allPals) {
    const rank = breedingData.breeding_power[pal.pal_name];
    if (rank == null || rank < targetRank) continue;
    const diff = rank - targetRank;
    if (diff < bestDiff) {
      bestDiff = diff;
      candidates = [pal];
    } else if (diff === bestDiff) {
      candidates.push(pal);
    }
  }
  if (candidates.length) return pickRandom(candidates);
  return closestByBreedingPower(targetRank); // fallback: nenhum Pal com power >= alvo
}

function computeBreedingResult(parent1Card, parent2Card) {
  const n1 = parent1Card.pal_name;
  const n2 = parent2Card.pal_name;
  const key = [n1, n2].sort().join('|');

  let baseResult;
  const realResultName = breedingData.combo_lookup[key];

  if (realResultName) {
    // Mesmo caso do Digtoise: pode ter mais de uma impressão do mesmo Pal, sorteia entre elas.
    const cardMatches = db.prepare("SELECT * FROM cards WHERE pal_name = ? AND card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").all(realResultName);
    if (cardMatches.length > 0) {
      baseResult = pickRandom(cardMatches);
    } else {
      const targetRank = breedingData.all_breeding_power[realResultName];
      baseResult = targetRank != null ? closestByBreedingPowerAbove(targetRank) : null;
    }
  }

  if (!baseResult) {
    const rank1 = breedingData.breeding_power[n1];
    const rank2 = breedingData.breeding_power[n2];
    baseResult = closestByBreedingPower((rank1 + rank2) / 2);
  }

  return maybeUpgradeToVariant(baseResult);
}

app.post('/api/breeding/start', requirePlayer, (req, res) => {
  const { parent1CardNumber, parent2CardNumber } = req.body;

  if (getActiveBreedingSlot(req.playerId)) {
    return res.status(400).json({ error: 'Já existe um Breeding em andamento.' });
  }

  if (!hasEnoughAvailable(req.playerId, [parent1CardNumber, parent2CardNumber])) {
    return res.status(400).json({ error: 'Você precisa ter cópias disponíveis das duas cartas escolhidas (elas podem estar ocupadas em outra tarefa).' });
  }

  const card1 = db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(parent1CardNumber);
  const card2 = db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(parent2CardNumber);
  if (!card1 || !card2) {
    return res.status(400).json({ error: 'As duas cartas precisam ser do tipo Pal.' });
  }

  const result = computeBreedingResult(card1, card2);
  const startTime = new Date();
  const durationHours = RARITY_DURATION_HOURS[result.rarity] ?? BREEDING_HOURS;
  const readyTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  db.prepare(`
    INSERT INTO breeding_slot (player_id, parent1, parent2, start_time, ready_time, result_card_number, claimed)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(req.playerId, parent1CardNumber, parent2CardNumber, startTime.toISOString(), readyTime.toISOString(), result.card_number);

  reserveCards(req.playerId, [parent1CardNumber, parent2CardNumber]);

  res.json({ readyTime: readyTime.toISOString() });
});

app.post('/api/breeding/cancel', requirePlayer, (req, res) => {
  const slot = getActiveBreedingSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });

  releaseCards(req.playerId, [slot.parent1, slot.parent2]);
  db.prepare('DELETE FROM breeding_slot WHERE player_id = ?').run(req.playerId);
  res.json({ cancelled: true });
});

app.post('/api/breeding/use-cake', requirePlayer, (req, res) => {
  const { type } = req.body; // 'cake' ou 'special_cake'
  const slot = getActiveBreedingSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });
  if (new Date() >= new Date(slot.ready_time)) return res.status(400).json({ error: 'Esse Breeding já está pronto.' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  const column = type === 'special_cake' ? 'special_cake_count' : 'cake_count';
  const reduceMinutes = type === 'special_cake' ? 60 : 10;

  if (!player[column] || player[column] <= 0) {
    return res.status(400).json({ error: 'Você não tem esse item.' });
  }

  db.prepare(`UPDATE players SET ${column} = ${column} - 1 WHERE id = ?`).run(req.playerId);

  let newReady = new Date(slot.ready_time).getTime() - reduceMinutes * 60 * 1000;
  const now = Date.now();
  if (newReady < now) newReady = now; // não deixa "voltar no tempo" além do presente

  db.prepare('UPDATE breeding_slot SET ready_time = ? WHERE player_id = ?').run(new Date(newReady).toISOString(), req.playerId);

  res.json({ newReadyTime: new Date(newReady).toISOString(), cakeCount: player[column] - 1 });
});

app.get('/api/breeding/status', requirePlayer, (req, res) => {
  const slot = getActiveBreedingSlot(req.playerId);
  if (!slot) return res.json({ active: false });

  const isReady = new Date() >= new Date(slot.ready_time);
  const resultCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.result_card_number);

  res.json({
    active: true,
    parent1: db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.parent1),
    parent2: db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.parent2),
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    isReady,
    claimed: !!slot.claimed,
    // só revela o resultado quando já estiver pronto (mantém a surpresa)
    result: isReady ? {
      ...resultCard, colors: JSON.parse(resultCard.colors), keywords: JSON.parse(resultCard.keywords),
      is_lucky: !!resultCard.is_lucky, image_url: `/${resultCard.image_path}`
    } : null
  });
});

app.post('/api/breeding/claim', requirePlayer, (req, res) => {
  const slot = getActiveBreedingSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });
  if (slot.claimed) return res.status(400).json({ error: 'Já coletado.' });

  const resultCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.result_card_number);
  const current = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?').get(req.playerId, slot.result_card_number)?.quantity || 0;

  let fluidGained = 0;
  if (current >= 4) {
    fluidGained = RARITY_FLUID[resultCard.rarity] || 5;
  } else {
    db.prepare(`
      INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
      ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
    `).run(req.playerId, slot.result_card_number, current + 1);
  }

  if (fluidGained > 0) {
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
    db.prepare('UPDATE players SET pal_fluid = ? WHERE id = ?').run(player.pal_fluid + fluidGained, req.playerId);
  }

  releaseCards(req.playerId, [slot.parent1, slot.parent2]);
  db.prepare('DELETE FROM breeding_slot WHERE player_id = ?').run(req.playerId); // libera o slot pro próximo Breeding

  res.json({
    card: {
      ...resultCard, colors: JSON.parse(resultCard.colors), keywords: JSON.parse(resultCard.keywords),
      is_lucky: !!resultCard.is_lucky, image_url: `/${resultCard.image_path}`
    },
    fluidGained
  });
});

// ---------- MISSÕES DIÁRIAS ----------

db.exec(`
  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    target_filter TEXT,
    reward_gold INTEGER NOT NULL DEFAULT 0,
    reward_fluid INTEGER NOT NULL DEFAULT 0
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS player_mission_progress (
    player_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    progress_date TEXT NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, mission_id, progress_date)
  )
`);
// As missões do dia (`missions`) continuam globais/compartilhadas — todo mundo vê as mesmas
// 5 missões por dia. Só o PROGRESSO em cada uma passa a ser por jogador.
migrateToPlayerIdPk('player_mission_progress',
  `CREATE TABLE player_mission_progress (
    player_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    progress_date TEXT NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, mission_id, progress_date)
  )`,
  ['mission_id', 'progress_date', 'current_value', 'completed', 'claimed']
);

const PAL_TYPES = ['fire', 'water', 'plant', 'electric', 'ice', 'ground', 'dragon', 'dark', 'normal'];

// Pool com todas as missões possíveis — 5 são sorteadas por dia a partir daqui
function buildMissionPool() {
  const pool = [
    { code: 'play_3_pals', description: 'Jogue 3 cartas de Pal', type: 'play_pal', target_value: 3, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'play_6_pals', description: 'Jogue 6 cartas de Pal', type: 'play_pal', target_value: 6, target_filter: null, reward_gold: 70, reward_fluid: 0 },
    { code: 'play_5_any', description: 'Jogue 5 cartas de qualquer tipo', type: 'play_any', target_value: 5, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'play_10_any', description: 'Jogue 10 cartas de qualquer tipo', type: 'play_any', target_value: 10, target_filter: null, reward_gold: 90, reward_fluid: 5 },
    { code: 'play_2_events', description: 'Jogue 2 cartas de Event', type: 'play_event', target_value: 2, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'play_2_structures', description: 'Jogue 2 cartas de Structure', type: 'play_structure', target_value: 2, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'play_2_gear', description: 'Jogue 2 cartas de Gear', type: 'play_gear', target_value: 2, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'deal_20_damage', description: 'Cause 20 de dano em partidas', type: 'deal_damage', target_value: 20, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'deal_30_damage', description: 'Cause 30 de dano em partidas', type: 'deal_damage', target_value: 30, target_filter: null, reward_gold: 50, reward_fluid: 10 },
    { code: 'deal_40_damage', description: 'Cause 40 de dano em partidas', type: 'deal_damage', target_value: 40, target_filter: null, reward_gold: 100, reward_fluid: 10 },
    { code: 'win_1_game', description: 'Vença 1 partida', type: 'win_games', target_value: 1, target_filter: null, reward_gold: 80, reward_fluid: 0 },
    { code: 'win_2_games', description: 'Vença 2 partidas', type: 'win_games', target_value: 2, target_filter: null, reward_gold: 100, reward_fluid: 0 },
    { code: 'soul_draw_2', description: 'Suspenda 3 Souls pra comprar carta 2 vezes', type: 'soul_draw', target_value: 2, target_filter: null, reward_gold: 50, reward_fluid: 0 },
    { code: 'soul_draw_4', description: 'Suspenda 3 Souls pra comprar carta 4 vezes', type: 'soul_draw', target_value: 4, target_filter: null, reward_gold: 70, reward_fluid: 10 },
  ];

  for (const el of PAL_TYPES) {
    const label = el.charAt(0).toUpperCase() + el.slice(1);
    pool.push({
      code: `play_3_${el}_pals`, description: `Jogue 3 Pals do tipo ${label}`,
      type: 'play_pal_type', target_value: 3, target_filter: el, reward_gold: 50, reward_fluid: 10
    });
  }

  return pool;
}

// PRNG determinístico (mesma seed = mesmo resultado sempre), seedado pela data de hoje
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function pickTodaysMissions(count = 5) {
  const pool = buildMissionPool();
  const rng = mulberry32(hashString(todayString()));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// Controla se já sorteamos as missões de hoje (evita re-sortear a cada request)
db.exec(`
  CREATE TABLE IF NOT EXISTS mission_seed_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_seeded_date TEXT
  )
`);

function seedMissions() {
  const state = db.prepare('SELECT last_seeded_date FROM mission_seed_state WHERE id = 1').get();
  if (state && state.last_seeded_date === todayString()) return; // já sorteado hoje, não faz nada

  db.prepare('DELETE FROM missions').run();
  const insert = db.prepare(`
    INSERT INTO missions (code, description, type, target_value, target_filter, reward_gold, reward_fluid)
    VALUES (@code, @description, @type, @target_value, @target_filter, @reward_gold, @reward_fluid)
  `);
  for (const m of pickTodaysMissions(5)) insert.run(m);

  db.prepare(`
    INSERT INTO mission_seed_state (id, last_seeded_date) VALUES (1, ?)
    ON CONFLICT(id) DO UPDATE SET last_seeded_date = excluded.last_seeded_date
  `).run(todayString());
}
seedMissions();

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

const getCardExtraDataStmt = db.prepare('SELECT extra_data FROM cards WHERE name = ? AND extra_data IS NOT NULL LIMIT 1');

// Monta os dados completos de jogo (effect_text, pal_name, typepal, work_keywords, etc.) a partir
// de uma lista de card_number — usado tanto pra montar a partida contra o Bot quanto uma online.
function getCardsByNumbers(numbers) {
  const stmt = db.prepare('SELECT * FROM cards WHERE card_number = ?');
  return numbers.map(num => {
    const c = stmt.get(num);
    let effect_text = null;
    let pal_name = null;
    let typepal = [];
    let work_keywords = [];
    // Variantes de arte/raridade (ex: "BP01-049-OSR", "BP01-049-SSP") são reimpressões da MESMA carta
    // — mesmo custo/poder/cor, só a arte muda — mas no banco elas não têm extra_data próprio (onde
    // fica effect_text/work_keywords/etc). Em vez de cadastrar essas regras de novo pra cada variante,
    // herda do card_number "base" que tem o mesmo nome e já está com extra_data preenchido.
    const extraDataSource = c.extra_data || getCardExtraDataStmt.get(c.name)?.extra_data;
    if (extraDataSource) {
      try {
        const parsed = JSON.parse(extraDataSource)?.data;
        effect_text = parsed?.effect_text || null;
        pal_name = parsed?.pal_name || null;
        typepal = parsed?.typepal || [];
        work_keywords = parsed?.work_keywords || [];
      } catch (e) {}
    }
    return {
      ...c,
      colors: JSON.parse(c.colors),
      keywords: JSON.parse(c.keywords),
      is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`,
      effect_text,
      pal_name,
      typepal,
      work_keywords
    };
  });
}

// Lê o(s) tipo(s) elemental(is) de um Pal a partir do extra_data (campo "typepal" que você cadastrou)
function getCardPalTypes(cardNumber) {
  const row = db.prepare('SELECT extra_data FROM cards WHERE card_number = ?').get(cardNumber);
  if (!row || !row.extra_data) return [];
  try {
    const parsed = JSON.parse(row.extra_data);
    const types = parsed?.data?.typepal || [];
    return types.map(t => String(t).toLowerCase());
  } catch (e) {
    return [];
  }
}

// Incrementa o progresso de toda missão do tipo informado (e filtro, se houver) pro dia de hoje
function incrementMission(playerId, type, filterValue, amount) {
  const today = todayString();
  const matching = db.prepare('SELECT * FROM missions WHERE type = ? AND (target_filter IS NULL OR target_filter = ?)').all(type, filterValue);

  const getProgress = db.prepare('SELECT * FROM player_mission_progress WHERE player_id = ? AND mission_id = ? AND progress_date = ?');
  const upsert = db.prepare(`
    INSERT INTO player_mission_progress (player_id, mission_id, progress_date, current_value, completed)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(player_id, mission_id, progress_date) DO UPDATE SET current_value = excluded.current_value, completed = excluded.completed
  `);

  for (const mission of matching) {
    const existing = getProgress.get(playerId, mission.id, today);
    const current = existing ? existing.current_value : 0;
    if (existing && existing.completed) continue; // já bateu a meta, não precisa somar mais
    const newValue = Math.min(current + amount, mission.target_value);
    const completed = newValue >= mission.target_value ? 1 : 0;
    upsert.run(playerId, mission.id, today, newValue, completed);
  }
}

// Lista as missões de hoje (compartilhadas) com o progresso do jogador logado
app.get('/api/missions/today', requirePlayer, (req, res) => {
  seedMissions(); // recalcula sozinho se o dia virou desde a última checagem
  const today = todayString();
  const missions = db.prepare('SELECT * FROM missions').all();
  const getProgress = db.prepare('SELECT * FROM player_mission_progress WHERE player_id = ? AND mission_id = ? AND progress_date = ?');

  const result = missions.map(m => {
    const progress = getProgress.get(req.playerId, m.id, today);
    return {
      ...m,
      currentValue: progress ? progress.current_value : 0,
      completed: progress ? !!progress.completed : false,
      claimed: progress ? !!progress.claimed : false
    };
  });

  res.json(result);
});

// Resgata a recompensa de uma missão completada
app.post('/api/missions/claim', requirePlayer, (req, res) => {
  const { missionId } = req.body;
  const today = todayString();

  const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(missionId);
  const progress = db.prepare('SELECT * FROM player_mission_progress WHERE player_id = ? AND mission_id = ? AND progress_date = ?').get(req.playerId, missionId, today);

  if (!mission || !progress || !progress.completed) {
    return res.status(400).json({ error: 'Missão ainda não completada.' });
  }
  if (progress.claimed) {
    return res.status(400).json({ error: 'Recompensa já resgatada.' });
  }

  db.prepare('UPDATE player_mission_progress SET claimed = 1 WHERE player_id = ? AND mission_id = ? AND progress_date = ?').run(req.playerId, missionId, today);

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  const newGold = player.gold_coins + mission.reward_gold;
  const newFluid = player.pal_fluid + mission.reward_fluid;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = ?').run(newGold, newFluid, req.playerId);

  res.json({ goldCoins: newGold, palFluid: newFluid });
});

// Compra um Trial Deck (500 moedas, compra única por set, dá 4 cópias de cada carta do set)
app.post('/api/shop/buy-trial-deck', requirePlayer, (req, res) => {
  const { setCode } = req.body; // 'TD01' ou 'TD02'
  if (!['TD01', 'TD02'].includes(setCode)) {
    return res.status(400).json({ error: 'Trial deck inválido.' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  const boughtField = setCode === 'TD01' ? 'bought_td01' : 'bought_td02';

  if (player[boughtField]) {
    return res.status(400).json({ error: 'Você já comprou este Trial Deck.' });
  }
  if (player.gold_coins < 500) {
    return res.status(400).json({ error: 'Moedas de ouro insuficientes.' });
  }

  const setCards = db.prepare("SELECT * FROM cards WHERE set_code = ? AND card_number NOT LIKE '%-%-%'").all(setCode);

  const getQty = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?');
  const upsertQty = db.prepare(`
    INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
    ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
  `);

  let fluidGained = 0;
  for (const card of setCards) {
    const current = getQty.get(req.playerId, card.card_number)?.quantity || 0;
    const newQty = Math.min(current + 4, 4); // trial deck já entrega no máximo de 4
    if (current >= 4) {
      fluidGained += (RARITY_FLUID[card.rarity] || 5) * 4;
    } else {
      upsertQty.run(req.playerId, card.card_number, newQty);
      // se sobrar copia além de 4 (não deveria, mas por segurança)
    }
  }

  const newGold = player.gold_coins - 500;
  const newFluid = player.pal_fluid + fluidGained;
  db.prepare(`UPDATE players SET gold_coins = ?, pal_fluid = ?, ${boughtField} = 1 WHERE id = ?`).run(newGold, newFluid, req.playerId);

  res.json({
    cards: setCards.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`
    })),
    fluidGained,
    goldCoins: newGold,
    palFluid: newFluid
  });
});

// Cartas que o jogador possui e a quantidade de cada uma (pra tela "Coleção")
app.get('/api/player/cards', requirePlayer, (req, res) => {
  res.json(db.prepare('SELECT card_number, quantity, reserved FROM player_cards WHERE player_id = ? AND quantity > 0').all(req.playerId));
});

// Craftar carta com Fluido de Pal (até 4 cópias)
// OSR, SP, SSP e TSP ficam de fora de propósito — só saem via Breeding ou booster, não são craftáveis.
const CRAFT_COSTS = { RR: 100, R: 50, U: 30, C: 15, SR: 150, TSR: 150 };

function getCraftCost(card) {
  if (CRAFT_COSTS[card.rarity]) return CRAFT_COSTS[card.rarity];

  if (card.rarity === 'TD') {
    const cost = card.cost ?? 8; // cartas sem custo (Events/Structures sem cost) caem em "demais"
    if (cost >= 1 && cost <= 3) return 15;
    if (cost >= 4 && cost <= 6) return 30;
    if (cost === 7) return 50;
    return 100; // demais
  }

  return null; // demais raridades (ex: TD sem custo cadastrado) não são craftáveis
}

app.post('/api/collection/craft', requirePlayer, (req, res) => {
  const { cardNumber } = req.body;
  const card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(cardNumber);
  if (!card) return res.status(400).json({ error: 'Carta não encontrada.' });

  const cost = getCraftCost(card);
  if (!cost) return res.status(400).json({ error: 'Essa carta não pode ser craftada.' });

  const current = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?').get(req.playerId, cardNumber)?.quantity || 0;
  if (current >= 4) return res.status(400).json({ error: 'Você já tem o máximo de 4 cópias dessa carta.' });

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.pal_fluid < cost) return res.status(400).json({ error: 'Fluido de Pal insuficiente.' });

  db.prepare('UPDATE players SET pal_fluid = pal_fluid - ? WHERE id = ?').run(cost, req.playerId);
  db.prepare(`
    INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
    ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
  `).run(req.playerId, cardNumber, current + 1);

  res.json({ newQuantity: current + 1, palFluid: player.pal_fluid - cost });
});

// ---------- MERCADO CLANDESTINO (jogador vende carta pra outro jogador) ----------
// Por ora só as raridades que não são craftáveis (fora de CRAFT_COSTS) podem ir pro mercado —
// é a única forma de conseguir esses tiers sem depender só de sorte no Breeding/booster.
const MARKET_ALLOWED_RARITIES = ['OSR', 'SP', 'SSP', 'TSP'];

db.exec(`
  CREATE TABLE IF NOT EXISTS market_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_player_id INTEGER NOT NULL,
    card_number TEXT NOT NULL,
    price_gold INTEGER NOT NULL DEFAULT 0,
    price_fluid INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Anuncia 1 cópia de uma carta no mercado. Quem anuncia escolhe o preço em moedas de ouro,
// em Fluido de Pal, ou nos dois ao mesmo tempo (precisa ter pelo menos um dos dois > 0).
// A cópia fica "reservada" (mesmo esquema já usado por Breeding/Farming/Forno) até a venda
// ser concluída ou o anúncio cancelado (cancelamento via DELETE abaixo; venda ainda não existe).
app.post('/api/market/listings', requirePlayer, (req, res) => {
  const { cardNumber, priceGold, priceFluid } = req.body;
  const card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(cardNumber);
  if (!card) return res.status(400).json({ error: 'Carta não encontrada.' });
  if (!MARKET_ALLOWED_RARITIES.includes(card.rarity)) {
    return res.status(400).json({ error: 'Essa raridade ainda não pode ser vendida no mercado.' });
  }

  const goldNum = priceGold ? Number(priceGold) : 0;
  const fluidNum = priceFluid ? Number(priceFluid) : 0;
  const validPrice = (n) => Number.isInteger(n) && n >= 0;
  if (!validPrice(goldNum) || !validPrice(fluidNum) || (goldNum <= 0 && fluidNum <= 0)) {
    return res.status(400).json({ error: 'Defina um preço válido em ouro e/ou Fluido de Pal.' });
  }

  if (getAvailableQuantity(req.playerId, cardNumber) < 1) {
    return res.status(400).json({ error: 'Você não tem cópias disponíveis dessa carta.' });
  }

  reserveCards(req.playerId, [cardNumber]);
  const result = db.prepare(`
    INSERT INTO market_listings (seller_player_id, card_number, price_gold, price_fluid) VALUES (?, ?, ?, ?)
  `).run(req.playerId, cardNumber, goldNum, fluidNum);

  res.json({ id: result.lastInsertRowid, message: 'Carta anunciada no mercado.' });
});

// Lista todos os anúncios ativos (o próprio jogador também vê os que ele mesmo postou)
app.get('/api/market/listings', requirePlayer, (req, res) => {
  const rows = db.prepare('SELECT * FROM market_listings ORDER BY created_at DESC').all();
  const getCard = db.prepare('SELECT * FROM cards WHERE card_number = ?');

  const listings = rows.map(r => {
    const card = getCard.get(r.card_number);
    return {
      id: r.id,
      priceGold: r.price_gold,
      priceFluid: r.price_fluid,
      isMine: r.seller_player_id === req.playerId,
      card: { card_number: card.card_number, name: card.name, rarity: card.rarity, image_url: `/${card.image_path}` }
    };
  });

  res.json(listings);
});

// Cancela o próprio anúncio e devolve a cópia reservada pra coleção do jogador.
app.delete('/api/market/listings/:id', requirePlayer, (req, res) => {
  const listing = db.prepare('SELECT * FROM market_listings WHERE id = ?').get(req.params.id);
  if (!listing || listing.seller_player_id !== req.playerId) {
    return res.status(404).json({ error: 'Anúncio não encontrado.' });
  }

  releaseCards(req.playerId, [listing.card_number]);
  db.prepare('DELETE FROM market_listings WHERE id = ?').run(req.params.id);

  res.json({ message: 'Anúncio removido.' });
});

// Transfere ouro/fluido do comprador pro vendedor e a carta pro comprador, tudo em 1 transação
// pra não deixar o jogo num estado inconsistente se algo falhar no meio do caminho.
const executeMarketPurchase = db.transaction((listing, buyerId) => {
  db.prepare('UPDATE players SET gold_coins = gold_coins - ?, pal_fluid = pal_fluid - ? WHERE id = ?')
    .run(listing.price_gold, listing.price_fluid, buyerId);
  db.prepare('UPDATE players SET gold_coins = gold_coins + ?, pal_fluid = pal_fluid + ? WHERE id = ?')
    .run(listing.price_gold, listing.price_fluid, listing.seller_player_id);

  // A cópia estava "reservada" desde o anúncio (ver POST /api/market/listings) — agora sai de
  // fato da coleção de quem vendeu.
  db.prepare('UPDATE player_cards SET quantity = quantity - 1, reserved = MAX(0, reserved - 1) WHERE player_id = ? AND card_number = ?')
    .run(listing.seller_player_id, listing.card_number);

  const current = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?').get(buyerId, listing.card_number)?.quantity || 0;
  db.prepare(`
    INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
    ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
  `).run(buyerId, listing.card_number, current + 1);

  db.prepare('DELETE FROM market_listings WHERE id = ?').run(listing.id);

  return current + 1;
});

app.post('/api/market/listings/:id/buy', requirePlayer, (req, res) => {
  const listing = db.prepare('SELECT * FROM market_listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Anúncio não encontrado.' });
  if (listing.seller_player_id === req.playerId) {
    return res.status(400).json({ error: 'Você não pode comprar seu próprio anúncio.' });
  }

  const buyer = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (buyer.gold_coins < listing.price_gold || buyer.pal_fluid < listing.price_fluid) {
    return res.status(400).json({ error: 'Recursos insuficientes pra essa compra.' });
  }

  const current = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?').get(req.playerId, listing.card_number)?.quantity || 0;
  if (current >= 4) {
    return res.status(400).json({ error: 'Você já tem o máximo de 4 cópias dessa carta.' });
  }

  const newQuantity = executeMarketPurchase(listing, req.playerId);
  const updatedBuyer = db.prepare('SELECT gold_coins, pal_fluid FROM players WHERE id = ?').get(req.playerId);

  res.json({ message: 'Carta comprada com sucesso.', newQuantity, goldCoins: updatedBuyer.gold_coins, palFluid: updatedBuyer.pal_fluid });
});

// Abre 1 booster pack: sorteia 5 cartas do set BP01, respeitando raridade.
// Cópias além da 4ª viram Fluido de Pal em vez de empilhar.
app.post('/api/shop/open-booster', requirePlayer, (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.gold_coins < BOOSTER_PRICE) {
    return res.status(400).json({ error: 'Moedas de ouro insuficientes.' });
  }

  // Exclui variantes de arte paralela (ex: BP01-001-SR), só cartas base do set
  const pool = db.prepare("SELECT * FROM cards WHERE set_code = ? AND card_number NOT LIKE '%-%-%'").all(BOOSTER_SET);

  const getQty = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?');
  const upsertQty = db.prepare(`
    INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
    ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
  `);

  const revealed = [];
  let fluidGained = 0;

  for (let i = 0; i < CARDS_PER_PACK; i++) {
    const card = maybeUpgradeToVariant(weightedRandomCard(pool));
    revealed.push(card);

    const current = getQty.get(req.playerId, card.card_number)?.quantity || 0;
    if (current >= 4) {
      fluidGained += RARITY_FLUID[card.rarity] || 5;
    } else {
      upsertQty.run(req.playerId, card.card_number, current + 1);
    }
  }

  const newGold = player.gold_coins - BOOSTER_PRICE;
  const newFluid = player.pal_fluid + fluidGained;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = ?').run(newGold, newFluid, req.playerId);

  res.json({
    cards: revealed.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`
    })),
    fluidGained,
    goldCoins: newGold,
    palFluid: newFluid
  });
});

// Contagem de "gente online" pro badge do menu — conexões WebSocket ativas, não contas
// distintas (2 abas da mesma conta contam 2), é só uma estimativa de atividade no site.
function broadcastOnlineCount() {
  io.emit('online:count', io.engine.clientsCount);
}

io.on('connection', (socket) => {
  const userId = socket.request.session?.userId;
  const playerId = userId ? resolvePlayerId(userId) : null;

  // Conta pro badge de "gente online" mesmo sem login (ex: alguém ainda na tela de login) — mas
  // sem playerId a conexão não ganha NENHUM dos handlers de jogo abaixo, só existe pra essa contagem.
  broadcastOnlineCount();
  socket.on('disconnect', () => broadcastOnlineCount());

  if (!playerId) return;

  console.log(`Cliente conectado: ${socket.id} (player ${playerId})`);

  // ---------- Matchmaking online: entrar/sair da fila de "Encontrar Partida" ----------
  socket.on('match:findMatch', ({ deckId, matchType }) => {
    const type = matchType === 'arena' ? 'arena' : 'normal';
    if (queuedPlayers.has(playerId)) return; // já está numa fila (ex.: clique duplo)

    const validation = validateDeckForMatch(playerId, deckId, type);
    if (!validation.ok) {
      socket.emit('match:error', { message: validation.message });
      return;
    }

    matchQueues[type].push({ socket, playerId, deckId });
    queuedPlayers.set(playerId, type);
    socket.emit('match:queued', { matchType: type });
    tryPairQueue(type);
  });

  socket.on('match:cancelFindMatch', () => {
    removeFromQueue(playerId);
  });

  // ---------- Partida online: Jokenpô + mulligan (setup, antes do TurnManager existir) ----------

  // 1. Cada lado manda sua escolha; só resolve quando os 2 já escolheram (sem bot pra decidir sozinho).
  socket.on('match:rpsChoice', ({ choice }) => {
    const session = getSessionBySocket(socket);
    if (!session || session.turnManager || !['rock', 'paper', 'scissors'].includes(choice)) return;
    const side = getSideBySocket(session, socket);
    session.rpsChoices[side] = choice;

    const other = otherSide(side);
    if (session.rpsChoices[other] === undefined) {
      socket.emit('match:rpsWaiting', {});
      return;
    }

    const result = resolveRPS(session.rpsChoices.A, session.rpsChoices.B);
    if (result === 'draw') {
      for (const s of ['A', 'B']) {
        session.sides[s].socket.emit('match:rpsResult', {
          yourChoice: session.rpsChoices[s], opponentChoice: session.rpsChoices[otherSide(s)], result: 'draw'
        });
      }
      session.rpsChoices = {};
      return;
    }

    session.rpsWinnerSide = result === 'p1' ? 'A' : 'B';
    for (const s of ['A', 'B']) {
      session.sides[s].socket.emit('match:rpsResult', {
        yourChoice: session.rpsChoices[s],
        opponentChoice: session.rpsChoices[otherSide(s)],
        result: session.rpsWinnerSide === s ? 'win' : 'lose'
      });
    }
  });

  // 2. Só quem ganhou o Jokenpô decide a ordem — cria o TurnManager (player2IsBot: false, os 2 lados
  //    são humanos de verdade) e manda o prompt de mulligan pros 2.
  socket.on('match:chooseOrder', ({ goFirst }) => {
    const session = getSessionBySocket(socket);
    if (!session || session.turnManager || !session.rpsWinnerSide) return;
    const side = getSideBySocket(session, socket);
    if (side !== session.rpsWinnerSide) return;

    const aGoesFirst = side === 'A' ? !!goFirst : !goFirst;
    session.turnManager = new TurnManager(session.states.A, session.states.B, aGoesFirst, false);

    for (const s of ['A', 'B']) {
      session.sides[s].socket.emit('match:mulliganPrompt', {
        hand: session.states[s].hand,
        message: 'Deseja fazer mulligan da sua mão inicial?'
      });
    }
  });

  // 3. Mulligan dos 2 lados (cada um decide o próprio) — só inicia o 1º turno quando ambos decidirem.
  socket.on('match:mulliganDecision', ({ keep }) => {
    const session = getSessionBySocket(socket);
    if (!session || !session.turnManager || session.turnManager.currentPhase) return;
    const side = getSideBySocket(session, socket);
    if (session.mulliganDecided[side]) return;
    session.mulliganDecided[side] = true;
    if (!keep) session.states[side].mulligan();

    if (!session.mulliganDecided[otherSide(side)]) {
      socket.emit('match:waitingOpponentMulligan', {});
      return;
    }

    session.turnManager.beginFirstTurn();
    emitMatchState(session);
  });

  // ---------- Partida online: ações de jogo (mesma lógica do modo Bot, sem o lado "bot" fixo) ----------

  const MATCH_DEPLOY_FAIL_MESSAGES = {
    NOT_ENOUGH_SOUL: 'Você não tem Souls em pé suficientes para pagar o custo dessa carta.'
  };

  socket.on('match:advancePhase', () => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;

    const result = tm.endMainPhase();
    if (!result.success) {
      if (result.reason === 'MUST_ATTACK') {
        socket.emit('match:error', { message: 'Alarm Bell: você precisa atacar com todos os Pals em pé antes de encerrar o turno.' });
      }
      return;
    }
    emitMatchState(session);
  });

  socket.on('match:deployPal', ({ cardNumber }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent, playerId: sidePlayerId } = ctx;
    if (tm.gameOver) return;
    if (tm.pendingEffect || tm.pendingBattle) {
      socket.emit('match:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    // Sem essa checagem, o lado que não está na vez conseguia deployar cartas por fora do turno
    // dele (o handler só olhava a MÃO de quem chamou, sem checar de quem é a vez) — mesma checagem
    // já usada em advancePhase/attack/activateAbility.
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    const card = self.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = self.tryDeployPal(card);
    if (result.success) {
      tm._addLog(`${self.playerName} jogou ${card.name}.`);
      incrementMission(sidePlayerId, 'play_pal', null, 1);
      incrementMission(sidePlayerId, 'play_any', null, 1);
      const palTypes = getCardPalTypes(card.card_number);
      for (const type of palTypes) {
        incrementMission(sidePlayerId, 'play_pal_type', type, 1);
      }
      EffectEngine.runTrigger(tm, 'onDeploy', result.instance, self, opponent, { isBot: false });
      EffectEngine.notifyAllyDeploy(tm, self, opponent, result.instance, { isBot: false });
      tm.checkOverloadedPals(self, opponent, result.instance, false);
    } else {
      socket.emit('match:error', { message: MATCH_DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitMatchState(session);
  });

  socket.on('match:deployStructure', ({ cardNumber }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent, playerId: sidePlayerId } = ctx;
    if (tm.gameOver) return;
    if (tm.pendingEffect || tm.pendingBattle) {
      socket.emit('match:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    const card = self.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = self.tryDeployStructure(card);
    if (result.success) {
      tm._addLog(`${self.playerName} jogou ${card.name}.`);
      incrementMission(sidePlayerId, 'play_structure', null, 1);
      incrementMission(sidePlayerId, 'play_any', null, 1);
      EffectEngine.runTrigger(tm, 'onDeploy', result.instance, self, opponent, { isBot: false });
    } else {
      socket.emit('match:error', { message: MATCH_DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitMatchState(session);
  });

  socket.on('match:deployGear', ({ cardNumber }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent, playerId: sidePlayerId } = ctx;
    if (tm.gameOver) return;
    if (tm.pendingEffect || tm.pendingBattle) {
      socket.emit('match:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    const card = self.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = self.tryDeployGear(card);
    if (result.success) {
      tm._addLog(`${self.playerName} jogou ${card.name}.`);
      incrementMission(sidePlayerId, 'play_gear', null, 1);
      incrementMission(sidePlayerId, 'play_any', null, 1);
      const gearInstance = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 };
      EffectEngine.runTrigger(tm, 'onDeploy', gearInstance, self, opponent, { isBot: false });
    } else {
      socket.emit('match:error', { message: MATCH_DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitMatchState(session);
  });

  socket.on('match:deployEvent', ({ cardNumber }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent, playerId: sidePlayerId } = ctx;
    if (tm.gameOver) return;
    if (tm.pendingEffect || tm.pendingBattle) {
      socket.emit('match:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    const card = self.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    if (!self.paySoulCost(card.cost)) {
      socket.emit('match:error', { message: MATCH_DEPLOY_FAIL_MESSAGES.NOT_ENOUGH_SOUL });
      return;
    }
    self.hand = self.hand.filter(c => c !== card);
    self.graveyard.push(card);
    self.cardsPlayedThisGame = (self.cardsPlayedThisGame || 0) + 1;
    tm._addLog(`${self.playerName} jogou ${card.name}.`);
    incrementMission(sidePlayerId, 'play_event', null, 1);
    incrementMission(sidePlayerId, 'play_any', null, 1);
    const eventInstance = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 };
    const startedModal = EffectEngine.startModalChoice(tm, eventInstance, self, opponent);
    if (!startedModal) {
      EffectEngine.runTrigger(tm, 'onPlay', eventInstance, self, opponent, { isBot: false });
    }
    emitMatchState(session);
  });

  socket.on('match:drawWithSouls', () => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, playerId: sidePlayerId } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    const result = self.drawWithSoulCost(3);
    if (result.success) {
      tm._addLog(`${self.playerName} suspendeu 3 Souls pra comprar 1 carta.`);
      incrementMission(sidePlayerId, 'soul_draw', null, 1);
    } else if (result.reason === 'ALREADY_USED') {
      socket.emit('match:error', { message: 'Você já suspendeu Souls pra comprar carta neste turno (só é permitido 1x por turno).' });
    }
    emitMatchState(session);
  });

  socket.on('match:activateAbility', ({ zone, index, actIndex }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self || tm.currentPhase !== 'main') return;
    if (!['basePals', 'baseStructures', 'baseGear'].includes(zone)) return;
    const instance = self[zone][index];
    if (!instance) return;
    const result = EffectEngine.activateAbility(tm, instance, self, opponent, actIndex || 0, { isBot: false });
    if (!result.success) {
      socket.emit('match:error', { message: 'Não foi possível ativar essa habilidade agora.' });
      return;
    }
    tm._addLog(`${self.playerName} ativou uma habilidade de ${instance.data.name}.`);
    emitMatchState(session);
  });

  socket.on('match:resolveEffectTarget', ({ owner, index, skip }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver || !tm.pendingEffect || tm.pendingEffect.casterState !== self) return;
    // owner chega relativo a quem está vendo ('player'=eu/'bot'=oponente) — converte pro absoluto
    // (player1/player2) que o EffectEngine espera, antes de mandar pro continuePendingEffect.
    const selfIsPlayer1 = self === tm.player1;
    const absoluteOwner = selfIsPlayer1 ? owner : (owner === 'player' ? 'bot' : 'player');
    if (!skip) {
      const valid = (tm.pendingEffect.validTargets || []).some(t => t.owner === absoluteOwner && t.index === index);
      if (!valid) return;
    } else if (!tm.pendingEffect.optional) {
      return;
    }
    EffectEngine.continuePendingEffect(tm, { owner: absoluteOwner, index, skip });
    emitMatchState(session);
  });

  socket.on('match:resolveCardChoice', ({ index, skip }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver || !tm.pendingEffect || tm.pendingEffect.casterState !== self) return;
    if (tm.pendingEffect.kind !== 'cardChoice') return;
    if (!skip) {
      if (!tm.pendingEffect.cards[index]?.selectable) return;
    } else if (!tm.pendingEffect.optional) {
      return;
    }
    EffectEngine.resolveCardChoice(tm, { index, skip });
    emitMatchState(session);
  });

  socket.on('match:resolveAmount', ({ amount }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingEffect || tm.pendingEffect.kind !== 'amount' || tm.pendingEffect.casterState !== self) return;
    EffectEngine.continuePendingEffect(tm, { amount });
    emitMatchState(session);
  });

  socket.on('match:resolveModalChoice', ({ optionIndex }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingEffect || tm.pendingEffect.kind !== 'modal' || tm.pendingEffect.casterState !== self) return;
    EffectEngine.resolveModalChoice(tm, optionIndex);
    emitMatchState(session);
  });

  socket.on('match:attack', ({ palIndex }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, playerId: sidePlayerId } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self) return;
    const pal = self.basePals[palIndex];
    if (!pal) return;
    const result = tm.declareAttack(pal, { type: 'player' });
    if (result.reason === 'TAUNT_FORCED') {
      socket.emit('match:error', { message: 'Seu oponente tem uma carta com Taunt que precisa ser atacada primeiro.' });
      return;
    }
    if (result.damageDealt > 0) incrementMission(sidePlayerId, 'deal_damage', null, result.damageDealt);
    emitMatchState(session);
  });

  socket.on('match:attackPal', ({ attackerIndex, targetIndex }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self) return;
    const attacker = self.basePals[attackerIndex];
    const target = opponent.basePals[targetIndex];
    if (!attacker || !target) return;
    const result = tm.declareAttack(attacker, { type: 'pal', instance: target });
    if (result.reason === 'TAUNT_FORCED' || result.reason === 'TARGET_NOT_VALID') {
      socket.emit('match:error', { message: 'Esse Pal não pode ser atacado agora.' });
      return;
    }
    emitMatchState(session);
  });

  socket.on('match:attackStructure', ({ attackerIndex, targetIndex }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self, opponent } = ctx;
    if (tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
    if (tm.activePlayer !== self) return;
    const attacker = self.basePals[attackerIndex];
    const target = opponent.baseStructures[targetIndex];
    if (!attacker || !target) return;
    const result = tm.declareAttack(attacker, { type: 'structure', instance: target });
    if (result.reason === 'TAUNT_FORCED' || result.reason === 'TARGET_NOT_VALID') {
      socket.emit('match:error', { message: 'Essa Structure não pode ser atacada agora.' });
      return;
    }
    emitMatchState(session);
  });

  socket.on('match:resolveBlock', ({ blockerIndex, none }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingBattle || tm.pendingBattle.waitingFor !== 'block' || tm.pendingBattle.defenderState !== self) return;
    tm.resolveBlock({ blockerIndex, none });
    emitMatchState(session);
  });

  socket.on('match:resolveQuickStep', ({ cardNumber, kind, pass }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingBattle || tm.pendingBattle.waitingFor !== 'quick' || tm.pendingBattle.defenderState !== self) return;
    tm.resolveQuickStep({ cardNumber, kind, pass });
    emitMatchState(session);
  });

  socket.on('match:resolveInterruptCost', ({ method }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingBattle || tm.pendingBattle.waitingFor !== 'interruptCost' || tm.pendingBattle.defenderState !== self) return;
    if (method !== 'soul' && method !== 'discard') return;
    tm.resolveInterruptCost({ method });
    emitMatchState(session);
  });

  socket.on('match:resolveInterruptDiscard', ({ cardNumber }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver) return;
    if (!tm.pendingBattle || tm.pendingBattle.waitingFor !== 'interruptDiscardChoice' || tm.pendingBattle.defenderState !== self) return;
    tm.resolveInterruptDiscard({ cardNumber });
    emitMatchState(session);
  });

  let match = null; // { turnManager, playerIsP1, botIsP1 }

  let winCounted = false;

  function checkWinMission() {
    if (match && match.turnManager.gameOver && match.turnManager.winner === match.playerState && !winCounted) {
      incrementMission(playerId, 'win_games', null, 1);
      winCounted = true;
    }
  }

  function emitState() {
    if (!match) return;
    checkWinMission();
    const { turnManager } = match;

    // Night (5.3) é um estado contínuo (ex: Shadowbeak "enquanto descansada, é noite") — não é uma
    // ação única como "It becomes night", então nunca tinha uma linha de log avisando a transição.
    const currentlyNight = turnManager.isNight;
    if (match._lastKnownNight === undefined) match._lastKnownNight = currentlyNight;
    if (currentlyNight !== match._lastKnownNight) {
      turnManager._addLog(currentlyNight ? 'Anoiteceu.' : 'Amanheceu.');
      match._lastKnownNight = currentlyNight;
    }

    const pending = turnManager.pendingEffect;
    const battle = turnManager.pendingBattle;
    socket.emit('bot:state', {
      turnNumber: turnManager.turnNumber,
      currentPhase: turnManager.currentPhase,
      activePlayer: turnManager.activePlayer.playerName,
      isPlayerTurn: turnManager.activePlayer === match.playerState,
      player: match.playerState.toPublicState(match.botState),
      bot: match.botState.toPublicState(match.playerState),
      hand: match.playerState.hand, // mão completa só pro dono
      isNight: turnManager.isNight,
      gameOver: turnManager.gameOver,
      winner: turnManager.winner ? turnManager.winner.playerName : null,
      log: turnManager.log.slice(-10),
      pendingEffect: pending ? {
        kind: pending.kind,
        sourceCardName: pending.sourceCardName,
        description: pending.description,
        optional: pending.optional,
        validTargets: pending.validTargets,
        min: pending.min,
        max: pending.max,
        options: pending.options ? pending.options.map(o => o.description) : null,
        cards: pending.cards ? pending.cards.map(entry => ({
          cardNumber: entry.card.card_number, name: entry.card.name, imageUrl: entry.card.image_url, selectable: entry.selectable
        })) : null
      } : null,
      pendingBattle: battle ? {
        waitingFor: battle.waitingFor,
        attackerName: battle.attackerInstance.data.name,
        validBlockers: (battle.validBlockers || []).map(p => match.playerState.basePals.indexOf(p)),
        quickOptions: (battle.quickOptions || []).map(o => ({
          cardNumber: o.card.card_number, name: o.card.name, imageUrl: o.card.image_url, kind: o.kind
        })),
        interruptCard: battle.interruptCard ? {
          cardNumber: battle.interruptCard.card_number, name: battle.interruptCard.name, imageUrl: battle.interruptCard.image_url
        } : null
      } : null,
      lastDamageReveal: turnManager.lastDamageReveal
    });
  }

  // 1. Cliente pede pra iniciar partida contra bot, passando o id do deck escolhido
  socket.on('bot:start', ({ deckId }) => {
    const deckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId);
    if (!deckRow) {
      socket.emit('bot:error', { message: 'Deck não encontrado.' });
      return;
    }

    const mainNumbers = JSON.parse(deckRow.main_deck);
    const soulNumbers = JSON.parse(deckRow.soul_deck);
    const mainCards = shuffle(getCardsByNumbers(mainNumbers));
    const soulCards = shuffle(getCardsByNumbers(soulNumbers));

    // Bot usa o mesmo deck por enquanto (simplificação inicial)
    const botMainCards = shuffle(getCardsByNumbers(mainNumbers));
    const botSoulCards = shuffle(getCardsByNumbers(soulNumbers));

    const playerState = new PlayerState('Você', mainCards, soulCards);
    const botState = new PlayerState('Bot', botMainCards, botSoulCards);

    match = { playerState, botState, turnManager: null };
    winCounted = false;

    socket.emit('bot:rpsPrompt', { message: 'Jokenpô! Escolha pedra, papel ou tesoura.' });
  });

  // 2. Cliente manda a escolha do Jokenpô
  socket.on('bot:rpsChoice', ({ choice }) => {
    if (!match) return;
    const botChoice = randomChoice();
    const result = resolveRPS(choice, botChoice);

    if (result === 'draw') {
      socket.emit('bot:rpsResult', { playerChoice: choice, botChoice, result: 'draw' });
      return; // cliente deve chamar bot:rpsChoice de novo
    }

    match.playerWonRPS = result === 'p1';
    socket.emit('bot:rpsResult', {
      playerChoice: choice,
      botChoice,
      result: match.playerWonRPS ? 'win' : 'lose'
    });
  });

  // 3. Quem ganhou o Jokenpô escolhe se vai primeiro ou segundo
  //    Se o bot ganhar, ele decide sozinho (sempre escolhe ir primeiro)
  socket.on('bot:chooseOrder', ({ goFirst }) => {
    if (!match) return;

    let playerGoesFirst;
    if (match.playerWonRPS) {
      playerGoesFirst = goFirst;
    } else {
      playerGoesFirst = false; // bot escolhe ir primeiro
    }

    match.turnManager = new TurnManager(match.playerState, match.botState, playerGoesFirst);

    socket.emit('bot:mulliganPrompt', {
      hand: match.playerState.hand,
      message: 'Deseja fazer mulligan da sua mão inicial?'
    });
  });

  // 4. Mulligan (uma vez só, decisão simples: manter ou trocar tudo)
  socket.on('bot:mulliganDecision', ({ keep }) => {
    if (!match) return;

    if (!keep) {
      match.playerState.mulligan();
    }

    // Bot sempre decide sozinho: mantém se tiver custo <= 3 em pelo menos 2 cartas, senão mulliga
    const botPlayableCount = match.botState.hand.filter(c => c.cost <= 3).length;
    if (botPlayableCount < 2) {
      match.botState.mulligan();
    }

    match.turnManager.beginFirstTurn();
    emitState();

    // Se o bot começa, ele já joga o turno dele automaticamente
    maybeRunBotTurn();
  });

  async function runBotTurnWithDelays() {
    const tm = match.turnManager;
    const bot = match.botState;

    // Deploy: 1 Pal por vez, esperando 5s antes de CADA jogada
    let deployedSomething = true;
    while (deployedSomething && !tm.gameOver) {
      deployedSomething = false;
      const playablePal = bot.hand.find(c => c.card_type === 'Pal' && c.cost <= bot.soulsStanding);
      if (playablePal) {
        await delay(5000);
        const result = bot.tryDeployPal(playablePal);
        if (result.success) {
          tm._addLog(`${bot.playerName} jogou ${playablePal.name}.`);
          EffectEngine.runTrigger(tm, 'onDeploy', result.instance, bot, match.playerState, { isBot: true });
          EffectEngine.notifyAllyDeploy(tm, bot, match.playerState, result.instance, { isBot: true });
          tm.checkOverloadedPals(bot, match.playerState, result.instance, true);
        }
        emitState();
        deployedSomething = true;
      }
    }

    // Ataque: 1 Pal por vez, esperando 5s antes de CADA ataque
    for (const pal of [...bot.basePals]) {
      if (pal.isStanding && !tm.gameOver) {
        await delay(5000);
        const tauntTargets = EffectEngine.getForcedTauntTargets(match.playerState, pal);
        // cada entrada já carrega seu próprio type ('pal' ou 'structure' — ex: Wooden Wall)
        const target = tauntTargets.length > 0 ? tauntTargets[0] : { type: 'player' };
        const result = tm.declareAttack(pal, target, { isBot: true });
        emitState();
        // Se pausou (jogador tem escolha de bloqueio/Quick Step), espera ele resolver antes de seguir
        if (result.paused && tm.pendingBattle) {
          await tm.pendingBattle.waitPromise;
          emitState();
        }
      }
    }

    if (!tm.gameOver) {
      await delay(2000); // pequena pausa antes de encerrar o turno
      tm.endMainPhase(); // encerra o turno do bot, já avança sozinho até a Main de quem for a vez
      emitState();
    }

    // Se por algum motivo o bot continuar ativo (não deveria), roda de novo
    if (!tm.gameOver && tm.activePlayer === match.botState) {
      await runBotTurnWithDelays();
    }
  }

  function maybeRunBotTurn() {
    if (!match || match.turnManager.gameOver) return;
    if (match.turnManager.activePlayer === match.botState) {
      runBotTurnWithDelays(); // não aguarda (assíncrono), vai emitindo estado conforme age
    }
  }

  // 5. Jogador clica em "Encerrar Turno" (só age se for a vez dele, na Main Phase)
  socket.on('bot:advancePhase', () => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    const tm = match.turnManager;
    if (tm.activePlayer !== match.playerState || tm.currentPhase !== 'main') {
      console.log(`[DEBUG] Encerrar Turno ignorado — activePlayer=${tm.activePlayer.playerName} phase=${tm.currentPhase}`);
      return;
    }

    const result = tm.endMainPhase();
    if (!result.success) {
      if (result.reason === 'MUST_ATTACK') {
        socket.emit('bot:error', { message: 'Alarm Bell: você precisa atacar com todos os Pals em pé antes de encerrar o turno.' });
      }
      return;
    }
    emitState();
    maybeRunBotTurn();
  });

  // 6. Jogador deploya um Pal da mão
  const DEPLOY_FAIL_MESSAGES = {
    NOT_ENOUGH_SOUL: 'Você não tem Souls em pé suficientes para pagar o custo dessa carta.'
  };

  socket.on('bot:deployPal', ({ cardNumber }) => {
    if (!match || match.turnManager.gameOver) return;
    if (match.turnManager.pendingEffect || match.turnManager.pendingBattle) {
      socket.emit('bot:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    const card = match.playerState.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = match.playerState.tryDeployPal(card);
    if (result.success) {
      match.turnManager._addLog(`${match.playerState.playerName} jogou ${card.name}.`);
      incrementMission(playerId, 'play_pal', null, 1);
      incrementMission(playerId, 'play_any', null, 1);
      const palTypes = getCardPalTypes(card.card_number);
      for (const type of palTypes) {
        incrementMission(playerId, 'play_pal_type', type, 1);
      }
      EffectEngine.runTrigger(match.turnManager, 'onDeploy', result.instance, match.playerState, match.botState, { isBot: false });
      EffectEngine.notifyAllyDeploy(match.turnManager, match.playerState, match.botState, result.instance, { isBot: false });
      match.turnManager.checkOverloadedPals(match.playerState, match.botState, result.instance, false);
    } else {
      socket.emit('bot:error', { message: DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitState();
  });

  // 6b. Jogador deploya uma Structure da mão
  socket.on('bot:deployStructure', ({ cardNumber }) => {
    if (!match || match.turnManager.gameOver) return;
    if (match.turnManager.pendingEffect || match.turnManager.pendingBattle) {
      socket.emit('bot:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    const card = match.playerState.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = match.playerState.tryDeployStructure(card);
    if (result.success) {
      match.turnManager._addLog(`${match.playerState.playerName} jogou ${card.name}.`);
      incrementMission(playerId, 'play_structure', null, 1);
      incrementMission(playerId, 'play_any', null, 1);
      EffectEngine.runTrigger(match.turnManager, 'onDeploy', result.instance, match.playerState, match.botState, { isBot: false });
    } else {
      socket.emit('bot:error', { message: DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitState();
  });

  // 6c. Jogador deploya um Gear da mão
  socket.on('bot:deployGear', ({ cardNumber }) => {
    if (!match || match.turnManager.gameOver) return;
    if (match.turnManager.pendingEffect || match.turnManager.pendingBattle) {
      socket.emit('bot:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    const card = match.playerState.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    const result = match.playerState.tryDeployGear(card);
    if (result.success) {
      match.turnManager._addLog(`${match.playerState.playerName} jogou ${card.name}.`);
      incrementMission(playerId, 'play_gear', null, 1);
      incrementMission(playerId, 'play_any', null, 1);
      const gearInstance = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 };
      EffectEngine.runTrigger(match.turnManager, 'onDeploy', gearInstance, match.playerState, match.botState, { isBot: false });
    } else {
      socket.emit('bot:error', { message: DEPLOY_FAIL_MESSAGES[result.reason] || 'Não foi possível deployar essa carta agora.' });
    }
    emitState();
  });

  // 6e. Jogador joga um Event: paga custo, vai pro cemitério e resolve o efeito (se houver)
  socket.on('bot:deployEvent', ({ cardNumber }) => {
    if (!match || match.turnManager.gameOver) return;
    if (match.turnManager.pendingEffect || match.turnManager.pendingBattle) {
      socket.emit('bot:error', { message: 'Resolva o efeito ou a batalha pendente antes de jogar outra carta.' });
      return;
    }
    const card = match.playerState.hand.find(c => c.card_number === cardNumber);
    if (!card) return;
    if (!match.playerState.paySoulCost(card.cost)) {
      socket.emit('bot:error', { message: DEPLOY_FAIL_MESSAGES.NOT_ENOUGH_SOUL });
      return;
    }
    match.playerState.hand = match.playerState.hand.filter(c => c !== card);
    match.playerState.graveyard.push(card);
    match.playerState.cardsPlayedThisGame = (match.playerState.cardsPlayedThisGame || 0) + 1;
    match.turnManager._addLog(`${match.playerState.playerName} jogou ${card.name}.`);
    incrementMission(playerId, 'play_event', null, 1);
    incrementMission(playerId, 'play_any', null, 1);
    const eventInstance = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 };
    const startedModal = EffectEngine.startModalChoice(match.turnManager, eventInstance, match.playerState, match.botState);
    if (!startedModal) {
      EffectEngine.runTrigger(match.turnManager, 'onPlay', eventInstance, match.playerState, match.botState, { isBot: false });
    }
    emitState();
  });

  // 6d. Jogador suspende 3 Souls pra comprar 1 carta extra
  socket.on('bot:drawWithSouls', () => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    if (match.turnManager.activePlayer !== match.playerState || match.turnManager.currentPhase !== 'main') return;
    const result = match.playerState.drawWithSoulCost(3);
    if (result.success) {
      match.turnManager._addLog(`${match.playerState.playerName} suspendeu 3 Souls pra comprar 1 carta.`);
      incrementMission(playerId, 'soul_draw', null, 1);
    } else if (result.reason === 'ALREADY_USED') {
      socket.emit('bot:error', { message: 'Você já suspendeu Souls pra comprar carta neste turno (só é permitido 1x por turno).' });
    }
    emitState();
  });

  // 6e2. Jogador ativa uma habilidade ACT de um Pal/Structure/Gear em campo
  socket.on('bot:activateAbility', ({ zone, index, actIndex }) => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    if (match.turnManager.activePlayer !== match.playerState || match.turnManager.currentPhase !== 'main') return;
    if (!['basePals', 'baseStructures', 'baseGear'].includes(zone)) return;
    const instance = match.playerState[zone][index];
    if (!instance) return;
    const result = EffectEngine.activateAbility(match.turnManager, instance, match.playerState, match.botState, actIndex || 0, { isBot: false });
    if (!result.success) {
      socket.emit('bot:error', { message: 'Não foi possível ativar essa habilidade agora.' });
      return;
    }
    match.turnManager._addLog(`${match.playerState.playerName} ativou uma habilidade de ${instance.data.name}.`);
    emitState();
  });

  // 6f. Jogador escolhe o alvo de um efeito pendente (ou pula, se opcional)
  socket.on('bot:resolveEffectTarget', ({ owner, index, skip }) => {
    if (!match || match.turnManager.gameOver || !match.turnManager.pendingEffect) return;
    if (!skip) {
      const valid = match.turnManager.pendingEffect.validTargets.some(t => t.owner === owner && t.index === index);
      if (!valid) return;
    } else if (!match.turnManager.pendingEffect.optional) {
      return;
    }
    EffectEngine.continuePendingEffect(match.turnManager, { owner, index, skip });
    emitState();
    maybeRunBotTurn(); // resolver essa escolha pode ter sido o que faltava pra "AUTO At the end of your
    // turn" (ex: Shadowbeak) terminar e só ENTÃO passar a vez — se foi isso, o bot precisa começar a agir.
  });

  // 6f1b. Jogador escolhe uma carta revelada/olhada (topo do deck, cemitério ou mão) ou pula
  socket.on('bot:resolveCardChoice', ({ index, skip }) => {
    if (!match || match.turnManager.gameOver || !match.turnManager.pendingEffect) return;
    if (match.turnManager.pendingEffect.kind !== 'cardChoice') return;
    if (!skip) {
      if (!match.turnManager.pendingEffect.cards[index]?.selectable) return;
    } else if (!match.turnManager.pendingEffect.optional) {
      return;
    }
    EffectEngine.resolveCardChoice(match.turnManager, { index, skip });
    emitState();
    maybeRunBotTurn(); // mesmo motivo do resolveEffectTarget acima.
  });

  // 6f2. Jogador escolhe a quantidade de X ao pagar um custo variável (Consume X Material, etc.)
  socket.on('bot:resolveAmount', ({ amount }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingEffect || match.turnManager.pendingEffect.kind !== 'amount') return;
    EffectEngine.continuePendingEffect(match.turnManager, { amount });
    emitState();
    maybeRunBotTurn(); // mesmo motivo do resolveEffectTarget acima.
  });

  // 6f3. Jogador escolhe uma das opções de um efeito modal ("Choose 1 of the following")
  socket.on('bot:resolveModalChoice', ({ optionIndex }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingEffect || match.turnManager.pendingEffect.kind !== 'modal') return;
    EffectEngine.resolveModalChoice(match.turnManager, optionIndex);
    emitState();
    maybeRunBotTurn(); // mesmo motivo do resolveEffectTarget acima.
  });

  // 7. Jogador ataca o oponente diretamente com um Pal (índice na base)
  socket.on('bot:attack', ({ palIndex }) => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    const pal = match.playerState.basePals[palIndex];
    if (!pal) return;
    const result = match.turnManager.declareAttack(pal, { type: 'player' });
    if (result.reason === 'TAUNT_FORCED') {
      socket.emit('bot:error', { message: 'Seu oponente tem uma carta com Taunt que precisa ser atacada primeiro.' });
      return;
    }
    if (result.damageDealt > 0) incrementMission(playerId, 'deal_damage', null, result.damageDealt);
    checkWinMission();
    emitState();
  });

  // 7b. Jogador ataca um Pal do bot (batalha Pal vs Pal)
  socket.on('bot:attackPal', ({ attackerIndex, targetIndex }) => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    const attacker = match.playerState.basePals[attackerIndex];
    const target = match.botState.basePals[targetIndex];
    if (!attacker || !target) return;
    const result = match.turnManager.declareAttack(attacker, { type: 'pal', instance: target });
    if (result.reason === 'TAUNT_FORCED' || result.reason === 'TARGET_NOT_VALID') {
      socket.emit('bot:error', { message: 'Esse Pal não pode ser atacado agora.' });
      return;
    }
    emitState();
  });

  // 7b2. Jogador ataca uma Structure descansada do bot
  socket.on('bot:attackStructure', ({ attackerIndex, targetIndex }) => {
    if (!match || match.turnManager.gameOver || match.turnManager.pendingEffect || match.turnManager.pendingBattle) return;
    const attacker = match.playerState.basePals[attackerIndex];
    const target = match.botState.baseStructures[targetIndex];
    if (!attacker || !target) return;
    const result = match.turnManager.declareAttack(attacker, { type: 'structure', instance: target });
    if (result.reason === 'TAUNT_FORCED' || result.reason === 'TARGET_NOT_VALID') {
      socket.emit('bot:error', { message: 'Essa Structure não pode ser atacada agora.' });
      return;
    }
    emitState();
  });

  // 7c. Jogador decide se bloqueia o ataque em curso do bot (Block Declaration Step)
  socket.on('bot:resolveBlock', ({ blockerIndex, none }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingBattle || match.turnManager.pendingBattle.waitingFor !== 'block') return;
    match.turnManager.resolveBlock({ blockerIndex, none });
    emitState();
  });

  // 7d. Jogador joga uma carta Quick/Interrupt (ou passa) durante o Quick Step do ataque do bot
  socket.on('bot:resolveQuickStep', ({ cardNumber, kind, pass }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingBattle || match.turnManager.pendingBattle.waitingFor !== 'quick') return;
    match.turnManager.resolveQuickStep({ cardNumber, kind, pass });
    emitState();
  });

  // 7d2. Jogador escolhe COMO pagar o custo do Interrupt (suspender 1 Soul, ou descartar 1 carta extra)
  socket.on('bot:resolveInterruptCost', ({ method }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingBattle || match.turnManager.pendingBattle.waitingFor !== 'interruptCost') return;
    if (method !== 'soul' && method !== 'discard') return;
    match.turnManager.resolveInterruptCost({ method });
    emitState();
  });

  // 7d3. Jogador escolhe QUAL carta extra descartar pro custo do Interrupt (método "descarte")
  socket.on('bot:resolveInterruptDiscard', ({ cardNumber }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingBattle || match.turnManager.pendingBattle.waitingFor !== 'interruptDiscardChoice') return;
    match.turnManager.resolveInterruptDiscard({ cardNumber });
    emitState();
  });

  socket.on('disconnect', () => {
    removeFromQueue(playerId);

    // Partida online em andamento (Jokenpô, mulligan ou jogo): quem ficou avisa que o oponente saiu
    // e a sessão é encerrada — sem reconexão por enquanto, W.O. imediato.
    const session = getSessionBySocket(socket);
    if (session) {
      const side = getSideBySocket(session, socket);
      const remainingSide = otherSide(side);

      // W.O. em Arena também vale pro rank — só se o jogo já tinha começado de fato (Jokenpô/mulligan
      // abandonado não conta ponto pra ninguém, não chegou a ser uma partida jogada).
      let arenaPointsChange = null;
      if (session.matchType === 'arena' && session.turnManager && !session.rankPointsApplied) {
        const { gained } = applyArenaRankPoints(session.sides[remainingSide].playerId, session.sides[side].playerId);
        arenaPointsChange = gained;
        session.rankPointsApplied = true;
      }

      session.sides[remainingSide].socket.emit('match:opponentLeft', {
        message: 'Seu oponente desconectou. Você venceu por W.O.',
        arenaPointsChange
      });
      socketRoomMap.delete(session.sides.A.socket.id);
      socketRoomMap.delete(session.sides.B.socket.id);
      onlineSessions.delete(session.roomId);
    }

    console.log(`Cliente desconectado: ${socket.id}`);
  });

  socket.on('ping', () => {
    socket.emit('pong', { time: new Date().toISOString() });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});