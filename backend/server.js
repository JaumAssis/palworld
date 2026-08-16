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
const BotBrain = require('./game/BotBrain');
const { createBotSocketShim } = require('./game/BotSocketShim');
const arenaDraft = require('./game/arenaDraft');
const roguelikeStarterDecks = require('./game/roguelikeStarterDecks');
const roguelikeMap = require('./game/roguelikeMap');
const roguelikeBattle = require('./game/roguelikeBattle');
const roguelikeEvents = require('./game/roguelikeEvents');
const { createAuthRouter } = require('./auth/routes');
const { unusableHash } = require('./auth/passwords');
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

// Correção de dado: algumas cartas foram cadastradas com "eletric" (erro de digitação) em vez de
// "electric" no campo typepal do extra_data — isso fazia a missão "jogue 3 Pals do tipo Electric"
// nunca bater, já que o filtro (PAL_TYPES, mais abaixo) usa a grafia correta. Idempotente: só
// mexe em linhas que ainda têm o typo, então rodar de novo em boots futuros não faz nada. Envolto
// em try/catch porque a tabela `cards` só existe depois de rodar seedDatabase.js manualmente.
try {
  const rows = db.prepare("SELECT card_number, extra_data FROM cards WHERE extra_data LIKE '%eletric%'").all();
  const fixExtraData = db.prepare('UPDATE cards SET extra_data = ? WHERE card_number = ?');
  for (const row of rows) {
    const parsed = JSON.parse(row.extra_data);
    if (!Array.isArray(parsed?.data?.typepal)) continue;
    parsed.data.typepal = parsed.data.typepal.map(t => t === 'eletric' ? 'electric' : t);
    fixExtraData.run(JSON.stringify(parsed), row.card_number);
  }
} catch (e) {}

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
// Deck Rank pode ser salvo mesmo faltando cópias na coleção (fica marcado como rascunho até
// completar via craft) — só existe pra decks 'rank'; decks 'normal' nunca são rascunho.
try { db.exec('ALTER TABLE decks ADD COLUMN is_draft INTEGER NOT NULL DEFAULT 0'); } catch (e) {}

// ---------- Modo Arena: run de draft temporário estilo Hearthstone ----------
// Nunca toca a tabela `decks` de propósito — o deck de uma run de Arena é descartável (nasce do
// draft, morre no fim da run), bem diferente de um deck salvo que aparece em "Meus Decks".
db.exec(`
  CREATE TABLE IF NOT EXISTS arena_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'drafting_cards', -- drafting_cards|ready|in_progress|finished
    -- Emergem organicamente dos picks (ver tryLockColors em arenaDraft.js) — não existe etapa
    -- separada de "escolher cor"; as 2 cores travam sozinhas conforme o jogador vai draftando.
    colors TEXT NOT NULL DEFAULT '[]',    -- JSON com as cores já travadas (cresce até ter 2)
    main_deck TEXT NOT NULL DEFAULT '[]', -- JSON com array de card_number (cresce a cada pick, até 50)
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    reward_tier TEXT,                     -- 'wood'|'bronze'|'silver'|'gold' — só preenchido ao terminar
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    finished_at TEXT
  )
`);

// ---------- Modo Expedição: roguelike solo estilo Slay the Spire ----------
// Também nunca toca `decks` — o deck de uma run nasce de um dos 5 decks-personagem fixos
// (roguelikeStarterDecks.js) e cresce durante a run, morrendo com ela.
db.exec(`
  CREATE TABLE IF NOT EXISTS roguelike_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'traveling', -- traveling|in_battle|in_event|finished_win|finished_dead|finished_forfeit
    starter_deck_key TEXT NOT NULL,
    main_deck TEXT NOT NULL DEFAULT '[]',      -- JSON com array de card_number (cresce durante a run)
    card_modifiers TEXT NOT NULL DEFAULT '{}', -- JSON: { [card_number]: {powerBonus, strikeBonus, grantedKeywords:[]} }
    lives INTEGER NOT NULL DEFAULT 3,
    dogecoins INTEGER NOT NULL DEFAULT 0,      -- moeda isolada da run, nunca persiste além dela
    map TEXT NOT NULL,                         -- JSON do grafo gerado (ver roguelikeMap.js)
    current_node_id TEXT,
    pending_choice TEXT,                       -- JSON: opções já sorteadas esperando o clique do jogador
    result_seen INTEGER NOT NULL DEFAULT 0,    -- vira 1 quando o jogador vê a tela de resultado final (ver acknowledge-result)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    finished_at TEXT
  )
`);

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

// Quantas linhas do log da partida mandamos por emissão de estado (bot:state e match:state) — o
// front mostra só a cauda, mas `logTotal` (tm.log.length, sem corte) sempre acompanha, porque é
// ele que dá pro efeito de autoscroll uma dependência que não satura (log.length parava de mudar
// assim que o corte era atingido). 60 enche o painel e ainda deixa margem de histórico visível,
// com payload de poucos KB por emissão — tm.log em si continua sem teto, a partida é finita.
const MATCH_LOG_TAIL = 60;

// ---------- Bots permanentes (identidades sempre "online") ----------
// Preenchido 1x no boot por seedBotPlayers() (mais abaixo, perto de getCardsByNumbers — precisa
// dela pra validar o deck copiado). Populado ANTES de qualquer conexão de socket real acontecer,
// já que tudo isso roda de forma síncrona durante o carregamento do módulo.
const BOT_REGISTRY = []; // [{ playerId, username, deckId }]

// Quanto tempo um jogador na fila Normal espera antes de um dos 3 bots assumir a partida (ver
// startBotFallbackMatch). Só a fila Normal — a Arena fica só entre jogadores reais, pra ladder de
// rank permanecer íntegra (bots não têm player_cards, não conseguem montar deck Rank de verdade).
const BOT_QUEUE_FALLBACK_MS = 20000;
// Fila do modo Arena (draft) espera só 15s antes do bot assumir — o jogador já pagou um ingresso e
// draftou o deck inteiro pra chegar até aqui, então a espera precisa ser mais curta que a Normal.
const ARENA_DRAFT_BOT_FALLBACK_MS = 15000;
// playerId de bot -> está numa partida agora. Impede o mesmo bot assumir 2 filas ao mesmo tempo.
const botsInMatch = new Set();

// ---------- Matchmaking online: fila de "Encontrar Partida" (Normal / Arena ranqueada / Arena draft) ----------
// Fila em memória, válida enquanto o processo Node estiver de pé — se um dia isso escalar para
// múltiplas instâncias do servidor, precisa virar uma fila compartilhada (ex: Redis) em vez de array local.
const matchQueues = { normal: [], arena: [], arenaDraft: [] };
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
  // Rascunho (is_draft) só bloqueia a Arena — faltam cópias reais das cartas, então não seria
  // possível montar essa mão de verdade. Na Normal, que ignora a coleção do jogador, pode jogar.
  if (matchType === 'arena' && row.is_draft) {
    return { ok: false, message: 'Esse deck é um rascunho (faltam cópias de cartas) — complete-o antes de entrar na Arena.' };
  }
  return { ok: true };
}

function removeFromQueue(playerId) {
  const matchType = queuedPlayers.get(playerId);
  if (!matchType) return;
  const queue = matchQueues[matchType];
  const idx = queue.findIndex(entry => entry.playerId === playerId);
  if (idx !== -1) {
    clearTimeout(queue[idx].botFallbackTimer);
    queue.splice(idx, 1);
  }
  queuedPlayers.delete(playerId);
}

function getUsernameForPlayer(playerId) {
  const row = db.prepare('SELECT u.username FROM users u JOIN players p ON p.user_id = u.id WHERE p.id = ?').get(playerId);
  return row ? row.username : 'Jogador';
}

// ---------- Chat de lobby (tela de "Encontrar Partida", antes de entrar na fila) ----------
// Global mesmo (não é por sala) — o front só ouve os eventos enquanto a tela do chat está montada,
// então não precisa de sala/room separada por matchType. Em memória, some se o processo reiniciar.
const LOBBY_CHAT_HISTORY_MS = 2 * 60 * 60 * 1000; // mantém só as últimas 2 horas de mensagens
const LOBBY_CHAT_MAX_LENGTH = 200;
const LOBBY_CHAT_COOLDOWN_MS = 1500; // anti-spam simples: 1 mensagem por jogador a cada 1.5s
const lobbyChatHistory = [];
const lobbyChatLastSent = new Map(); // playerId -> timestamp da última mensagem enviada

// Tira do histórico qualquer mensagem com mais de 2h — chamada tanto ao mandar uma nova mensagem
// quanto ao entrar (senão alguém que conecta depois de muito tempo sem ninguém falar nada ainda
// veria mensagens antigas demais, já que só limpamos "sob demanda", não com um timer separado).
function pruneLobbyChatHistory() {
  const cutoff = Date.now() - LOBBY_CHAT_HISTORY_MS;
  while (lobbyChatHistory.length && lobbyChatHistory[0].ts < cutoff) {
    lobbyChatHistory.shift();
  }
}

function otherSide(side) { return side === 'A' ? 'B' : 'A'; }

// socket.id -> roomId, pra achar a sessão de dentro dos handlers match:* sem precisar de estado
// por-conexão (a sessão é compartilhada pelos 2 sockets pareados, não pertence a um só).
const socketRoomMap = new Map();

function getSessionBySocket(socket) {
  const roomId = socketRoomMap.get(socket.id);
  return roomId ? onlineSessions.get(roomId) : null;
}

// playerId -> socket ativo (só de quem está logado/conectado agora) — usado pelo desafio direto
// do chat de lobby pra achar o socket de quem foi desafiado sem precisar que ele esteja na fila.
const connectedSockets = new Map();

// ---------- Desafio direto (clicar no nick de alguém no chat de lobby) ----------
// challengeId -> { challengerSocket, challengerPlayerId, challengerDeckId, targetPlayerId, matchType, timeoutHandle }
const pendingChallenges = new Map();
const CHALLENGE_TIMEOUT_MS = 30000;

// Cancela qualquer desafio pendente em que esse playerId esteja envolvido (desconexão de
// qualquer um dos dois lados) e avisa a outra ponta, se ela ainda estiver conectada.
function cancelChallengesFor(playerId) {
  for (const [challengeId, challenge] of pendingChallenges) {
    if (challenge.challengerPlayerId !== playerId && challenge.targetPlayerId !== playerId) continue;
    clearTimeout(challenge.timeoutHandle);
    pendingChallenges.delete(challengeId);

    if (challenge.challengerPlayerId === playerId) {
      const targetSocket = connectedSockets.get(challenge.targetPlayerId);
      if (targetSocket) targetSocket.emit('lobbyChat:challengeExpired', { challengeId });
    } else {
      challenge.challengerSocket.emit('lobbyChat:challengeExpired', { challengeId });
    }
  }
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
// só que os 2 lados são humanos de verdade e cada um tem sua própria progressão de missão). O lado
// bot (substituto de fila) nunca acumula missão diária — isso é só do jogador humano.
function checkOnlineWinMissions(session) {
  const tm = session.turnManager;
  if (!tm.gameOver) return;
  session.winCounted = session.winCounted || {};
  for (const side of ['A', 'B']) {
    if (session.sides[side].isBot) continue;
    if (tm.winner === session.states[side] && !session.winCounted[side]) {
      incrementMission(session.sides[side].playerId, 'win_games', null, 1);
      session.winCounted[side] = true;
    }
  }
  finishArenaRankPoints(session);
  finishArenaDraftRun(session);
  releaseBotFromMatch(session);
}

// Aplica o resultado de 1 partida (vitória ou derrota) numa run de Arena (draft): soma no placar,
// checa se bateu 3 derrotas ou 12 vitórias — se bateu, fecha a run (status 'finished'); senão volta
// pra 'ready', liberando o jogador pra procurar a próxima partida na mesma run. Reaproveitado tanto
// pelo fim natural (finishArenaDraftRun) quanto pelo W.O. de desconexão (ver socket.on('disconnect')).
function applyArenaDraftMatchResult(arenaRunId, won) {
  const run = db.prepare('SELECT * FROM arena_runs WHERE id = ?').get(arenaRunId);
  if (!run) return null;
  const wins = run.wins + (won ? 1 : 0);
  const losses = run.losses + (won ? 0 : 1);
  const ended = losses >= 3 || wins >= 12;
  db.prepare(`
    UPDATE arena_runs SET wins = ?, losses = ?, status = ?,
      finished_at = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE finished_at END
    WHERE id = ?
  `).run(wins, losses, ended ? 'finished' : 'ready', ended ? 1 : 0, arenaRunId);
  return { wins, losses, ended, won };
}

// Fim natural de uma partida de Arena (draft) — o bot substituto de fila nunca tem arenaRunId de
// verdade (o deck dele é temporário, não vem de uma run), então só o lado humano é atualizado.
function finishArenaDraftRun(session) {
  if (session.matchType !== 'arenaDraft' || session.arenaDraftRunApplied) return;
  const tm = session.turnManager;
  if (!tm || !tm.gameOver) return;
  for (const side of ['A', 'B']) {
    const arenaRunId = session.sides[side].arenaRunId;
    if (!arenaRunId) continue;
    const result = applyArenaDraftMatchResult(arenaRunId, tm.winner === session.states[side]);
    if (result) {
      session.arenaRunResult = session.arenaRunResult || {};
      session.arenaRunResult[side] = result;
    }
  }
  session.arenaDraftRunApplied = true;
}

// Aplica o resultado de 1 batalha do Modo Expedição na run: derrota tira 1 vida e já libera o
// próximo trecho do mapa (não há recompensa nem escolha pendente pra resolver); vitória de Boss
// encerra a run em vitória; vitória normal abre a escolha de recompensa (1-de-3, só Structure/
// Gear/Event) — o nó só vira 'cleared' quando o pick for resolvido (ver /api/roguelike/resolve-choice).
// Chamado 1x por partida via checkRoguelikeBattleResult, dentro do emitState() do socket vs Bot.
const ROGUELIKE_BATTLE_WIN_DOGECOINS = 25; // por vitória em batalha — proposta, ajustável

// Fórmula de conversão ao fim de uma run — ajustada depois do feedback de que gold estava fácil
// demais de farmar no Modo Expedição (run começa de graça e derrota não apaga o que já foi
// ganho): 0,25 gold por dogecoin (arredondado pra cima) + 1 de cada ingrediente de farming
// (trigo/alface/tomate) por dogecoin. Função pura — reaproveitada tanto na conversão de verdade
// quanto no preview mostrado em buildRoguelikeRunPayload, pra nunca haver 2 fórmulas divergentes.
function computeRoguelikeDogecoinConversion(dogecoins) {
  return { gold: Math.ceil(dogecoins * 0.25), ingredient: dogecoins };
}

// Converte os dogecoins da run em gold_coins + ingredientes reais — chamado sempre que uma run
// termina (vitória sobre o Boss ou vidas esgotadas), seja pelo fim de uma batalha ou por um evento
// de risco (Encontro Selvagem) que zere as vidas. Dogecoin nunca persiste além da run em si.
function convertRoguelikeDogecoins(playerId, dogecoins) {
  if (dogecoins <= 0) return;
  const { gold, ingredient } = computeRoguelikeDogecoinConversion(dogecoins);
  db.prepare(`
    UPDATE players SET gold_coins = gold_coins + ?, wheat = wheat + ?, lettuce = lettuce + ?, tomato = tomato + ?
    WHERE id = ?
  `).run(gold, ingredient, ingredient, ingredient, playerId);
}

function applyRoguelikeBattleResult(runId, won) {
  const run = db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(runId);
  if (!run) return null;
  const map = JSON.parse(run.map);
  const node = map.nodes[run.current_node_id];

  if (!won) {
    const lives = run.lives - 1;
    if (lives <= 0) {
      convertRoguelikeDogecoins(run.player_id, run.dogecoins);
      db.prepare("UPDATE roguelike_runs SET status = 'finished_dead', lives = 0, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(runId);
      return { outcome: 'finished_dead' };
    }
    // Perder pro Boss com vidas sobrando permite tentar de novo: ele nunca é marcado 'cleared'
    // numa derrota (diferente de uma batalha comum) — como o Boss não tem edgesTo, marcar
    // 'cleared' aqui deixaria o mapa inteiro sem nenhum nó disponível (nem o próprio Boss de
    // novo, nem nada à frente dele), travando a run sem ela ter realmente terminado.
    if (node && node.type === 'boss') {
      db.prepare("UPDATE roguelike_runs SET status = 'traveling', lives = ? WHERE id = ?").run(lives, runId);
      return { outcome: 'lost', lives };
    }
    roguelikeMap.markNodeCleared(map, run.current_node_id);
    db.prepare("UPDATE roguelike_runs SET status = 'traveling', lives = ?, map = ? WHERE id = ?").run(lives, JSON.stringify(map), runId);
    return { outcome: 'lost', lives };
  }

  const dogecoins = run.dogecoins + ROGUELIKE_BATTLE_WIN_DOGECOINS;

  if (node && node.type === 'boss') {
    convertRoguelikeDogecoins(run.player_id, dogecoins);
    db.prepare("UPDATE roguelike_runs SET status = 'finished_win', dogecoins = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(dogecoins, runId);
    return { outcome: 'finished_win' };
  }

  const mainDeck = JSON.parse(run.main_deck);
  const options = roguelikeBattle.offerBattleReward(getAllCardsHydrated(), mainDeck);
  const pendingChoice = { kind: 'battle_reward', options };
  db.prepare("UPDATE roguelike_runs SET status = 'in_event', dogecoins = ?, pending_choice = ? WHERE id = ?").run(dogecoins, JSON.stringify(pendingChoice), runId);
  return { outcome: 'won', pendingChoice };
}

// Aplica pontos de rank 1x só por partida Arena — tanto no fim natural (aqui) quanto no W.O. por
// desconexão (ver socket.on('disconnect')). Partida Normal nunca afeta rank.
function finishArenaRankPoints(session) {
  // Defesa extra: bot nunca joga Arena (a fila só oferece substituto na Normal), então isso nunca
  // deveria disparar pra uma sessão com bot — mas se algo mudar, não deixa pontos reais se moverem.
  if (session.botSide) return;
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
    if (session.sides[side].isBot) continue; // shim não tem cliente nenhum ouvindo match:state
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
      // Só existe em partida Arena (ranqueada), só depois do jogo acabar — quanto ESSE lado ganhou
      // (positivo) ou perdeu (negativo) de pontos de rank nessa partida (ver finishArenaRankPoints).
      arenaPointsChange: session.arenaPointsChange ? session.arenaPointsChange[side] : null,
      // Só existe em partida Arena (draft), só depois do jogo acabar — placar atualizado da run e
      // se ela já terminou (3 derrotas/12 vitórias) — ver finishArenaDraftRun.
      arenaRunResult: session.arenaRunResult ? session.arenaRunResult[side] : null,
      log: tm.log.slice(-MATCH_LOG_TAIL),
      logTotal: tm.log.length,
      pendingEffect: pending ? {
        kind: pending.kind,
        sourceCardName: pending.sourceCardName,
        description: pending.description,
        optional: pending.optional,
        isYours: pending.casterState === self,
        validTargets: pending.validTargets ? pending.validTargets.map(t => ({ owner: mapOwner(t.owner), index: t.index, zone: t.zone })) : null,
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
        // Sem isso, o defensor via só "X está atacando!" sem saber SE é a própria cara dele, um
        // Pal ou uma Structure — o prompt de bloqueio/Quick Step precisa dizer o alvo de verdade.
        targetType: battle.target.type,
        targetName: battle.target.type === 'player' ? null : battle.target.instance.data.name,
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

  maybeRunOnlineBotTurn(session);
}

// Se for a vez do lado bot dessa sessão (substituto de fila), roda o turno dele via BotBrain — 1
// linha no fim de emitMatchState cobre TODOS os handlers match:*, sem duplicar nada deles.
// _botTurnRunning evita reentrância (emitMatchState roda de novo várias vezes DENTRO do próprio
// playTurn, via BotBrain chamando emit()).
function maybeRunOnlineBotTurn(session) {
  if (!session.botSide || session._botTurnRunning) return;
  const tm = session.turnManager;
  if (!tm || tm.gameOver || tm.pendingEffect || tm.pendingBattle) return;
  if (tm.activePlayer !== session.states[session.botSide]) return;
  session._botTurnRunning = true;
  runOnlineBotTurn(session).finally(() => { session._botTurnRunning = false; });
}

async function runOnlineBotTurn(session) {
  const botSide = session.botSide;
  await BotBrain.playTurn({
    tm: session.turnManager,
    self: session.states[botSide],
    opponent: session.states[otherSide(botSide)],
    emit: () => emitMatchState(session),
    isAlive: () => onlineSessions.get(session.roomId) === session && !session.turnManager.gameOver,
    delay,
    timing: BotBrain.DEFAULT_TIMING,
    skill: session.botSkill
  });
}

// Soul Deck fixo do modo Arena (draft) — só existe 1 carta de tipo Soul no catálogo hoje, então
// não há variedade real pra draftar; toda run usa sempre os mesmos 10x SOUL-001.
const ARENA_SOUL_DECK = Array(10).fill('SOUL-001');

// Resolve as cartas (mão + Souls) de um lado da partida, a partir de 3 origens possíveis: um deck
// salvo (entry.deckId — fluxo Normal/Ranqueada), uma run de Arena já draftada (entry.arenaRunId) ou
// um deck temporário gerado na hora pro bot substituto da fila de Arena (entry.arenaTempDeck).
function resolveEntryCards(entry) {
  if (entry.arenaRunId) {
    const run = db.prepare('SELECT main_deck FROM arena_runs WHERE id = ?').get(entry.arenaRunId);
    return {
      mainCards: shuffle(getCardsByNumbers(JSON.parse(run.main_deck))),
      soulCards: shuffle(getCardsByNumbers(ARENA_SOUL_DECK))
    };
  }
  if (entry.arenaTempDeck) {
    return {
      mainCards: shuffle(getCardsByNumbers(entry.arenaTempDeck.mainDeck)),
      soulCards: shuffle(getCardsByNumbers(ARENA_SOUL_DECK))
    };
  }
  const deckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(entry.deckId);
  return {
    mainCards: shuffle(getCardsByNumbers(JSON.parse(deckRow.main_deck))),
    soulCards: shuffle(getCardsByNumbers(JSON.parse(deckRow.soul_deck)))
  };
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
    mulliganDecided: {},
    // b.isBot vem de startBotFallbackMatch — 'a' é sempre o humano (a fila nunca pareia bot com
    // bot), então só o lado B precisa ser checado. null/undefined em toda partida PvP normal.
    botSide: b.isBot ? 'B' : null,
    botPlayerId: b.isBot ? b.playerId : null,
    // 'easy'|'medium'|'hard' — ver BOT_PLAYERS/BotBrain.hasSmartDefense/hasSmartResources. null
    // em toda partida PvP normal (sem lado bot nenhum).
    botSkill: b.isBot ? b.skill : null
  };

  for (const side of ['A', 'B']) {
    const entry = session.sides[side];
    const { mainCards, soulCards } = resolveEntryCards(entry);
    session.states[side] = new PlayerState(getUsernameForPlayer(entry.playerId), mainCards, soulCards);
    socketRoomMap.set(entry.socket.id, roomId);
    // A run de Arena (draft) vira "em partida" assim que a partida começa de verdade — impede o
    // jogador de comprar outro ingresso ou reabrir o draft enquanto essa run está em jogo. Só o
    // lado humano tem arenaRunId de verdade (o bot substituto usa um deck temporário sem run).
    if (entry.arenaRunId) {
      db.prepare("UPDATE arena_runs SET status = 'in_progress' WHERE id = ?").run(entry.arenaRunId);
    }
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
  return session;
}

// ---------- Setup da partida online (Jokenpô / ordem / mulligan), extraído em funções puras ----------
// Extraídas dos handlers match:rpsChoice/chooseOrder/mulliganDecision pra serem chamadas tanto por
// eles quanto pelo driver do bot substituto de fila (handleBotDriverEvent, mais abaixo) — sem isso,
// a lógica de setup teria que ser reimplementada uma 2ª vez só pro bot. Usam sempre
// session.sides[side].socket.emit (nunca um `socket` de closure), porque quem chama pode ser
// qualquer um dos dois lados.

function applyRpsChoice(session, side, choice) {
  if (session.turnManager || !['rock', 'paper', 'scissors'].includes(choice)) return;
  session.rpsChoices[side] = choice;

  const other = otherSide(side);
  if (session.rpsChoices[other] === undefined) {
    session.sides[side].socket.emit('match:rpsWaiting', {});
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
}

// Só quem ganhou o Jokenpô decide a ordem — cria o TurnManager (player2IsBot = true só quando o
// lado B é o substituto de fila; false em toda partida PvP normal) e manda o prompt de mulligan.
function applyChooseOrder(session, side, goFirst) {
  if (session.turnManager || !session.rpsWinnerSide) return;
  if (side !== session.rpsWinnerSide) return;

  const aGoesFirst = side === 'A' ? !!goFirst : !goFirst;
  session.turnManager = new TurnManager(session.states.A, session.states.B, aGoesFirst, session.botSide === 'B');

  for (const s of ['A', 'B']) {
    session.sides[s].socket.emit('match:mulliganPrompt', {
      hand: session.states[s].hand,
      message: 'Deseja fazer mulligan da sua mão inicial?'
    });
  }
}

// Mulligan dos 2 lados (cada um decide o próprio) — só inicia o 1º turno quando ambos decidirem.
function applyMulliganDecision(session, side, keep) {
  if (!session.turnManager || session.turnManager.currentPhase) return;
  if (session.mulliganDecided[side]) return;
  session.mulliganDecided[side] = true;
  if (!keep) session.states[side].mulligan();

  if (!session.mulliganDecided[otherSide(side)]) {
    session.sides[side].socket.emit('match:waitingOpponentMulligan', {});
    return;
  }

  session.turnManager.beginFirstTurn();
  emitMatchState(session);
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
      // Achou humano de verdade pra parear — cancela o timer de substituto de bot dos dois (se
      // sobrar armado, dispararia depois pra uma partida que já nem está mais na fila).
      clearTimeout(a.botFallbackTimer);
      clearTimeout(b.botFallbackTimer);
      queuedPlayers.delete(a.playerId);
      queuedPlayers.delete(b.playerId);
      startOnlineMatch(matchType, a, b);
      tryPairQueue(matchType);
      return;
    }
  }
}

// Chamado quando o jogador (side A, sempre humano) recebe um match:rpsPrompt, match:rpsResult ou
// match:mulliganPrompt vindos do shim (ver createBotDriver) — o bot responde chamando as MESMAS
// funções apply* que os handlers match:rpsChoice/chooseOrder/mulliganDecision usam pro humano,
// então essa lógica de setup nunca é duplicada.
function handleBotDriverEvent(session, botSide, event, payload) {
  const stillAlive = () => onlineSessions.get(session.roomId) === session;
  if (event === 'match:rpsPrompt') {
    delay(1200).then(() => { if (stillAlive()) applyRpsChoice(session, botSide, randomChoice()); });
  } else if (event === 'match:rpsResult') {
    if (payload.result === 'draw') {
      delay(1500).then(() => { if (stillAlive()) applyRpsChoice(session, botSide, randomChoice()); });
    } else if (payload.result === 'win') {
      // Precisa passar dos 7000ms que o cliente espera antes de trocar de tela (FindMatchDeckSelect.jsx)
      // — menos que isso engole a revelação do Jokenpô na tela do humano.
      delay(7500).then(() => { if (stillAlive()) applyChooseOrder(session, botSide, BotBrain.decideGoFirst()); });
    }
  } else if (event === 'match:mulliganPrompt') {
    delay(1500).then(() => { if (stillAlive()) applyMulliganDecision(session, botSide, BotBrain.decideMulligan(payload.hand)); });
  }
  // Outros eventos (match:found, match:opponentLeft etc.) não interessam ao driver — ignorados.
}

// Sorteia 1 dos 3 bots livres (sem deck = fora do sorteio; já em outra partida = fora também).
function pickAvailableBot() {
  const available = BOT_REGISTRY.filter(b => b.deckId && !botsInMatch.has(b.playerId));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// Variante pro substituto da fila de Arena (draft): não exige `deckId` — o deck usado nunca é o
// preset do bot, é sempre um temporário sorteado na hora (ver startArenaDraftBotFallbackMatch). Só
// a identidade (nick, contagem no online) vem do BOT_REGISTRY.
function pickAvailableBotForArenaDraft() {
  const available = BOT_REGISTRY.filter(b => !botsInMatch.has(b.playerId));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// Libera o bot pra próxima partida — chamado tanto no fim natural (checkOnlineWinMissions) quanto
// na desconexão do humano (socket.on('disconnect')). Idempotente via _botReleased: sem isso, um
// humano que fica na tela de fim de jogo aberta (a sessão só é destruída no disconnect) e o
// gameOver disparando de novo em emissões subsequentes tentaria liberar 2x — inofensivo num Set,
// mas o flag deixa a intenção explícita.
function releaseBotFromMatch(session) {
  if (session.botPlayerId && !session._botReleased) {
    botsInMatch.delete(session.botPlayerId);
    session._botReleased = true;
  }
}

// 20s sem parear com humano na fila Normal: um dos 3 bots permanentes assume o lugar. Revalida
// tudo (o jogador pode ter sido pareado, cancelado a busca ou desconectado nesse meio-tempo).
function startBotFallbackMatch(entry) {
  if (queuedPlayers.get(entry.playerId) !== 'normal') return;
  if (!entry.socket.connected) return;

  const bot = pickAvailableBot();
  if (!bot) return; // nenhum bot livre agora — deixa o jogador na fila, ainda pode aparecer um humano

  removeFromQueue(entry.playerId);
  botsInMatch.add(bot.playerId);

  let session; // atribuída logo abaixo, síncrono — o driver só roda depois (setImmediate no shim)
  const shim = createBotSocketShim((event, payload) => handleBotDriverEvent(session, 'B', event, payload));
  session = startOnlineMatch('normal', entry, { socket: shim, playerId: bot.playerId, deckId: bot.deckId, skill: bot.skill, isBot: true });

  console.log(`[bots] "${bot.username}" entrou na fila Normal no lugar de um humano (sem oponente em ${BOT_QUEUE_FALLBACK_MS / 1000}s).`);
}

// 15s sem parear com humano na fila de Arena (draft): um dos 3 bots permanentes assume o lugar,
// mas com um deck TEMPORÁRIO sorteado na hora (2 cores + 50 cartas) — nunca o preset do bot, que
// não faz sentido aqui (a run de Arena de quem ficou na fila também nasceu de um draft aleatório).
function startArenaDraftBotFallbackMatch(entry) {
  if (queuedPlayers.get(entry.playerId) !== 'arenaDraft') return;
  if (!entry.socket.connected) return;

  const bot = pickAvailableBotForArenaDraft();
  if (!bot) return; // nenhum bot livre agora — deixa o jogador na fila, ainda pode aparecer um humano

  removeFromQueue(entry.playerId);
  botsInMatch.add(bot.playerId);

  const { colors, mainDeck } = arenaDraft.draftRandomDeck(getAllCardsHydrated());

  let session;
  const shim = createBotSocketShim((event, payload) => handleBotDriverEvent(session, 'B', event, payload));
  session = startOnlineMatch('arenaDraft', entry, {
    socket: shim, playerId: bot.playerId, arenaTempDeck: { mainDeck }, skill: bot.skill, isBot: true
  });

  console.log(`[bots] "${bot.username}" entrou na fila de Arena no lugar de um humano, com deck temporário aleatório (${colors.join('/')}).`);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Palworld TCG rodando!' });
});

// Retorna todas as cartas do banco — hidratadas com getCardsByNumbers (mesma função usada pra
// montar a mão de uma partida) pra já vir com effect_text/work_keywords/typepal, incluindo o
// fallback por nome pras variantes de arte que não têm extra_data próprio. Catálogo e montar-decks
// usam esses campos pra buscar por texto de efeito e work keyword, não só por nome de carta.
app.get('/api/cards', (req, res) => {
  const numbers = db.prepare('SELECT card_number FROM cards').all().map(r => r.card_number);
  res.json(getCardsByNumbers(numbers));
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

// Salva um novo deck (sempre vinculado a quem salvou — precisa estar logado). Deck Rank pode
// ser salvo faltando cópias — fica marcado como rascunho em vez de ser rejeitado.
app.post('/api/decks', requirePlayer, (req, res) => {
  const { name, mainDeckCardNumbers, soulDeckCardNumbers, colors, mode } = req.body;

  if (!name || !mainDeckCardNumbers || !soulDeckCardNumbers) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const deckMode = mode === 'rank' ? 'rank' : 'normal';
  const isDraft = computeDeckIsDraft(req.playerId, deckMode, mainDeckCardNumbers, soulDeckCardNumbers);

  const stmt = db.prepare(`
    INSERT INTO decks (name, main_deck, soul_deck, colors, mode, player_id, is_draft)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    JSON.stringify(mainDeckCardNumbers),
    JSON.stringify(soulDeckCardNumbers),
    JSON.stringify(colors || []),
    deckMode,
    req.playerId,
    isDraft ? 1 : 0
  );

  res.json({ id: result.lastInsertRowid, isDraft, message: 'Deck salvo com sucesso.' });
});

// Lista os decks preset (compartilhados, player_id NULL) + os próprios decks salvos de quem
// estiver logado. Decks salvos por outros jogadores não aparecem.
app.get('/api/decks', (req, res) => {
  const rows = req.playerId
    ? db.prepare('SELECT id, name, colors, main_deck, created_at, mode, is_draft FROM decks WHERE player_id IS NULL OR player_id = ? ORDER BY created_at DESC').all(req.playerId)
    : db.prepare('SELECT id, name, colors, main_deck, created_at, mode, is_draft FROM decks WHERE player_id IS NULL ORDER BY created_at DESC').all();
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
      isDraft: !!r.is_draft,
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
    isDraft: !!row.is_draft,
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

// Atualiza 1 deck salvo (edição). Só o dono pode editar; decks preset (player_id NULL) nunca
// são editáveis por aqui. Deck Rank pode ficar/virar rascunho aqui também (mesma lógica do POST).
app.put('/api/decks/:id', requirePlayer, (req, res) => {
  const { name, mainDeckCardNumbers, soulDeckCardNumbers, colors, mode } = req.body;

  const existing = db.prepare('SELECT id, player_id FROM decks WHERE id = ?').get(req.params.id);
  if (!existing || existing.player_id !== req.playerId) {
    return res.status(404).json({ error: 'Deck não encontrado.' });
  }

  if (!name || !mainDeckCardNumbers || !soulDeckCardNumbers) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const deckMode = mode === 'rank' ? 'rank' : 'normal';
  const isDraft = computeDeckIsDraft(req.playerId, deckMode, mainDeckCardNumbers, soulDeckCardNumbers);

  db.prepare(`
    UPDATE decks SET name = ?, main_deck = ?, soul_deck = ?, colors = ?, mode = ?, is_draft = ? WHERE id = ?
  `).run(
    name,
    JSON.stringify(mainDeckCardNumbers),
    JSON.stringify(soulDeckCardNumbers),
    JSON.stringify(colors || []),
    deckMode,
    isDraft ? 1 : 0,
    req.params.id
  );

  res.json({ id: existing.id, isDraft, message: 'Deck atualizado com sucesso.' });
});

// Crafta de uma vez todas as cópias que faltam pro Main Deck de um deck Rank (rascunho).
// Raridades não craftáveis (OSR/SP/SSP/TSP) são ignoradas no cálculo — só saem via Breeding/booster/mercado.
app.post('/api/decks/:id/craft-missing', requirePlayer, (req, res) => {
  const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(req.params.id);
  if (!deck || deck.player_id !== req.playerId) {
    return res.status(404).json({ error: 'Deck não encontrado.' });
  }

  const mainNumbers = JSON.parse(deck.main_deck);
  const counts = {};
  for (const num of mainNumbers) counts[num] = (counts[num] || 0) + 1;

  const getCard = db.prepare('SELECT * FROM cards WHERE card_number = ?');
  let totalCost = 0;
  const toCraft = [];

  for (const [cardNumber, needed] of Object.entries(counts)) {
    const card = getCard.get(cardNumber);
    if (!card) continue;
    const cost = getCraftCost(card);
    if (!cost) continue; // não craftável — não entra na conta, o deck pode continuar rascunho por causa dela
    const missing = Math.max(0, needed - getAvailableQuantity(req.playerId, cardNumber));
    if (missing > 0) {
      totalCost += cost * missing;
      toCraft.push({ cardNumber, missing });
    }
  }

  if (toCraft.length === 0) {
    return res.json({ message: 'Nada craftável pendente pra esse deck.', totalCost: 0, palFluid: db.prepare('SELECT pal_fluid FROM players WHERE id = ?').get(req.playerId).pal_fluid });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.pal_fluid < totalCost) {
    return res.status(400).json({ error: 'Fluido de Pal insuficiente pra craftar tudo.', totalCost });
  }

  const craftAll = db.transaction(() => {
    for (const { cardNumber, missing } of toCraft) {
      const current = db.prepare('SELECT quantity FROM player_cards WHERE player_id = ? AND card_number = ?').get(req.playerId, cardNumber)?.quantity || 0;
      db.prepare(`
        INSERT INTO player_cards (player_id, card_number, quantity) VALUES (?, ?, ?)
        ON CONFLICT(player_id, card_number) DO UPDATE SET quantity = excluded.quantity
      `).run(req.playerId, cardNumber, current + missing);
    }
    db.prepare('UPDATE players SET pal_fluid = pal_fluid - ? WHERE id = ?').run(totalCost, req.playerId);

    const stillDraft = computeDeckIsDraft(req.playerId, deck.mode, mainNumbers, JSON.parse(deck.soul_deck));
    db.prepare('UPDATE decks SET is_draft = ? WHERE id = ?').run(stillDraft ? 1 : 0, deck.id);
    return stillDraft;
  });

  const isDraft = craftAll();
  const updatedPlayer = db.prepare('SELECT pal_fluid FROM players WHERE id = ?').get(req.playerId);

  res.json({ message: 'Cartas faltantes craftadas com sucesso.', totalCost, isDraft, palFluid: updatedPlayer.pal_fluid });
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

// Deck Rank vira "rascunho" se faltar qualquer cópia na coleção do jogador (Main Deck OU Soul
// Deck) — igual ao esquema do Hearthstone (dá pra salvar incompleto e completar craftando/
// farmando depois). Decks Normal nunca são rascunho, já que ignoram a coleção de propósito.
// soulDeckCardNumbers é opcional (retrocompatível com chamadas antigas que só checavam o Main
// Deck) — sem ele, a completude do Soul Deck simplesmente não entra na conta.
//
// SOUL-001 fica de fora da checagem de propósito: é um recurso estrutural igual em toda run (a
// Arena e o Modo Expedição já tratam Soul Deck como 10x SOUL-001 fixo, sem checar posse nenhuma —
// ver ARENA_SOUL_DECK). Não tem como "possuir" 10 cópias de verdade: só sai de Trial Deck, e a
// compra de Trial Deck tampa QUALQUER carta em 4 cópias (ver /api/shop/buy-trial-deck) — exigir
// posse aqui deixaria todo Rank deck preso em rascunho pra sempre, por um Soul Deck completo que
// nenhum player jamais conseguiria "completar" de verdade.
function computeDeckIsDraft(playerId, mode, mainDeckCardNumbers, soulDeckCardNumbers = []) {
  if (mode !== 'rank') return false;
  const counts = {};
  for (const num of [...mainDeckCardNumbers, ...soulDeckCardNumbers]) {
    if (num === 'SOUL-001') continue;
    counts[num] = (counts[num] || 0) + 1;
  }
  return Object.entries(counts).some(([num, needed]) => getAvailableQuantity(playerId, num) < needed);
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
// Marca os players dos 3 bots permanentes (ver seedBotPlayers, mais abaixo) — hoje só usado pra
// nunca deixar um bot herdar a linha legada id=1 (reservada pro 1º humano a se registrar).
try { db.exec('ALTER TABLE players ADD COLUMN is_bot INTEGER NOT NULL DEFAULT 0'); } catch (e) {}

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

// Timer sempre calculado com o relógio do SERVIDOR — usado por breeding/farming/oven-status pra
// que o front nunca precise comparar o readyTime com o relógio local do jogador (um relógio do PC
// adiantado fazia a barra/contagem mostrar "pronto" antes da hora, e o resgate then falhava com
// 400 porque o servidor, corretamente, ainda não achava que tinha passado o tempo).
function computeTiming(startTimeIso, readyTimeIso) {
  const totalMs = new Date(readyTimeIso).getTime() - new Date(startTimeIso).getTime();
  const remainingMs = Math.max(0, new Date(readyTimeIso).getTime() - Date.now());
  return { totalMs, remainingMs };
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

  // Repetir ligado: colhe e reinicia sozinho, sem precisar de clique. Teto de ciclos por request —
  // sem ele, um jogador que ficasse offline por dias disparava centenas de writes num único GET.
  // O que passar do teto só é pago no próximo GET (nada é perdido, só espalhado em mais requests).
  const MAX_AUTO_HARVEST_CYCLES_PER_REQUEST = 50;
  let cycles = 0;
  while (isReady && slot.repeat_on && cycles < MAX_AUTO_HARVEST_CYCLES_PER_REQUEST) {
    harvestIngredients(req.playerId);
    const newStart = new Date(slot.ready_time);
    const newReady = new Date(newStart.getTime() + slot.duration_ms);
    db.prepare('UPDATE farming_slot SET start_time = ?, ready_time = ?, harvest_count = harvest_count + 1 WHERE player_id = ?')
      .run(newStart.toISOString(), newReady.toISOString(), req.playerId);
    slot = getActiveFarmingSlot(req.playerId);
    isReady = new Date() >= new Date(slot.ready_time);
    cycles++;
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
    ...computeTiming(slot.start_time, slot.ready_time),
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
    ready_time TEXT,
    quantity INTEGER NOT NULL DEFAULT 1
  )
`);
migrateToPlayerIdPk('oven_slot',
  `CREATE TABLE oven_slot (
    player_id INTEGER PRIMARY KEY,
    type TEXT,
    kindling_card_number TEXT,
    start_time TEXT,
    ready_time TEXT,
    quantity INTEGER NOT NULL DEFAULT 1
  )`,
  ['type', 'kindling_card_number', 'start_time', 'ready_time', 'quantity']
);
try { db.exec('ALTER TABLE oven_slot ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1'); } catch (e) {}

function getActiveOvenSlot(playerId) {
  return db.prepare('SELECT * FROM oven_slot WHERE player_id = ?').get(playerId);
}

app.post('/api/farming/bake', requirePlayer, (req, res) => {
  if (getActiveOvenSlot(req.playerId)) return res.status(400).json({ error: 'Já existe algo assando no forno.' });

  const { type, kindlingCardNumber } = req.body;
  const quantity = Math.floor(Number(req.body.quantity) || 1);
  const recipe = OVEN_RECIPES[type];
  if (!recipe) return res.status(400).json({ error: 'Receita inválida.' });
  if (quantity < 1) return res.status(400).json({ error: 'Quantidade inválida.' });

  if (!kindlingCardNumber) return res.status(400).json({ error: 'Escolha um Pal com Kindling pra acender o forno.' });
  if (getAvailableQuantity(req.playerId, kindlingCardNumber) < 1) return res.status(400).json({ error: 'Você não tem esse Pal disponível (ele pode estar ocupado em outra tarefa).' });
  const kindlingCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(kindlingCardNumber);
  const keywords = getPalWorkKeywords(kindlingCardNumber);
  if (!keywords.includes('kindling')) return res.status(400).json({ error: 'Esse Pal não tem "Kindling".' });

  const totalNeeded = recipe.amount * quantity;
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.wheat < totalNeeded || player.lettuce < totalNeeded || player.tomato < totalNeeded) {
    return res.status(400).json({ error: `Precisa de ${totalNeeded} de cada ingrediente pra fazer ${quantity}.` });
  }

  db.prepare(`
    UPDATE players SET wheat = wheat - ?, lettuce = lettuce - ?, tomato = tomato - ?
    WHERE id = ?
  `).run(totalNeeded, totalNeeded, totalNeeded, req.playerId);

  // O Pal na fornalha reduz o tempo de CADA bolo — a fila inteira demora reductionTime * quantidade.
  const reductionMinutes = computeBakeReductionMinutes(kindlingCard?.cost ?? 0);
  const perUnitMs = Math.max(0, (OVEN_BASE_MINUTES - reductionMinutes) * 60 * 1000);
  const durationMs = perUnitMs * quantity;
  const startTime = new Date();
  const readyTime = new Date(startTime.getTime() + durationMs);

  db.prepare(`
    INSERT INTO oven_slot (player_id, type, kindling_card_number, start_time, ready_time, quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.playerId, type, kindlingCardNumber, startTime.toISOString(), readyTime.toISOString(), quantity);

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
    quantity: slot.quantity,
    kindlingPal: kindlingCard ? { ...kindlingCard, colors: JSON.parse(kindlingCard.colors), image_url: `/${kindlingCard.image_path}` } : null,
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    ...computeTiming(slot.start_time, slot.ready_time),
    isReady: new Date() >= new Date(slot.ready_time)
  });
});

app.post('/api/farming/oven-claim', requirePlayer, (req, res) => {
  const slot = getActiveOvenSlot(req.playerId);
  if (!slot) return res.status(400).json({ error: 'Nenhum Forno em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });

  const recipe = OVEN_RECIPES[slot.type];
  db.prepare(`UPDATE players SET ${recipe.column} = ${recipe.column} + ? WHERE id = ?`).run(slot.quantity, req.playerId);
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

// ---------- Quadro de Ranks (menu inicial) ----------
// Recalcula no máximo 1x por hora, independente de quantos clientes abrem o menu — todo mundo vê
// a mesma tabela até o cache vencer, em vez de consultar o banco a cada abertura do menu.
const RANK_BOARD_CACHE_MS = 60 * 60 * 1000;
let rankBoardCache = null; // { rows: [{playerId, username, points}], expiresAt }

function getRankBoardRows() {
  const now = Date.now();
  if (rankBoardCache && now < rankBoardCache.expiresAt) return rankBoardCache.rows;
  // INNER JOIN com users exclui de propósito qualquer players sem conta vinculada (ex.: a linha
  // legada id=1 antes do primeiro registro) — sem username não tem o que mostrar no quadro.
  const rows = db.prepare(`
    SELECT p.id AS playerId, u.username AS username, p.rank_points AS points
    FROM players p JOIN users u ON u.id = p.user_id
    ORDER BY p.rank_points DESC, p.id ASC
  `).all();
  rankBoardCache = { rows, expiresAt: now + RANK_BOARD_CACHE_MS };
  return rows;
}

// Público (sem requirePlayer) — o quadro aparece no menu pra visitante também. Expõe só
// username/posição/rank, nunca playerId/user_id (minimização de dado pessoal).
app.get('/api/ranks/top', (req, res) => {
  const rows = getRankBoardRows();
  const top = rows.slice(0, 10).map((r, i) => ({
    position: i + 1, username: r.username, rank: getRankInfo(r.points)
  }));

  let you = null;
  if (req.playerId) {
    const myIndex = rows.findIndex(r => r.playerId === req.playerId);
    if (myIndex >= 10) {
      you = { position: myIndex + 1, username: rows[myIndex].username, rank: getRankInfo(rows[myIndex].points) };
    }
  }

  res.json({ top, you });
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
  SR: 8,        // 8 horas
  TSR: 8,       // variante Altered Art de trial deck, tratada como SR
  OSR: 10,      // 10 horas
  SP: 16,       // 16 horas
  TSP: 16,      // variante Altered Art de trial deck, tratada como SP
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
    result_source TEXT,
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
    result_source TEXT,
    claimed INTEGER DEFAULT 0
  )`,
  ['parent1', 'parent2', 'start_time', 'ready_time', 'result_card_number', 'result_source', 'claimed']
);
// 'real_exact' | 'real_substituted' | 'power_approx' — de onde veio o resultado (ver
// computeBreedingResult). Só 'real_exact' entra no registro de descobertas (breeding_discoveries).
try { db.exec('ALTER TABLE breeding_slot ADD COLUMN result_source TEXT'); } catch (e) {}

// ---------- Registro de descobertas de breeding ----------
// Só guarda combinações cujo resultado veio DIRETO da tabela real de breeding (result_source =
// 'real_exact') — uma substituição por power aproximado (Pal sem carta impressa) ou uma combinação
// fora da tabela real não é uma "descoberta" de verdade, é só o sistema chutando a carta mais
// próxima. Par de pais normalizado (ordem alfabética do card_number) pra "A+B" e "B+A" contarem
// como a mesma descoberta.
db.exec(`
  CREATE TABLE IF NOT EXISTS breeding_discoveries (
    player_id INTEGER NOT NULL,
    parent1_card_number TEXT NOT NULL,
    parent2_card_number TEXT NOT NULL,
    result_card_number TEXT NOT NULL,
    discovered_at TEXT NOT NULL,
    PRIMARY KEY (player_id, parent1_card_number, parent2_card_number)
  )
`);

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

// Devolve {card, source} — source diz de ONDE veio o resultado, usado pro registro de descobertas
// (breeding_discoveries) só aceitar combinações que vieram direto da tabela real (ver claim mais
// abaixo): 'real_exact' = combo real e o Pal resultante tem carta impressa; 'real_substituted' =
// combo real mas o Pal não tem carta (substituído por outro de power imediatamente acima);
// 'power_approx' = combo nem está na tabela real, resultado é só a média de power dos pais.
function computeBreedingResult(parent1Card, parent2Card) {
  const n1 = parent1Card.pal_name;
  const n2 = parent2Card.pal_name;
  const key = [n1, n2].sort().join('|');

  let baseResult;
  let source;
  const realResultName = breedingData.combo_lookup[key];

  if (realResultName) {
    // Mesmo caso do Digtoise: pode ter mais de uma impressão do mesmo Pal, sorteia entre elas.
    const cardMatches = db.prepare("SELECT * FROM cards WHERE pal_name = ? AND card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").all(realResultName);
    if (cardMatches.length > 0) {
      baseResult = pickRandom(cardMatches);
      source = 'real_exact';
    } else {
      const targetRank = breedingData.all_breeding_power[realResultName];
      baseResult = targetRank != null ? closestByBreedingPowerAbove(targetRank) : null;
      source = 'real_substituted';
    }
  }

  if (!baseResult) {
    const rank1 = breedingData.breeding_power[n1];
    const rank2 = breedingData.breeding_power[n2];
    baseResult = closestByBreedingPower((rank1 + rank2) / 2);
    source = 'power_approx';
  }

  return { card: maybeUpgradeToVariant(baseResult), source };
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

  const { card: result, source } = computeBreedingResult(card1, card2);
  const startTime = new Date();
  const durationHours = RARITY_DURATION_HOURS[result.rarity] ?? BREEDING_HOURS;
  const readyTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  db.prepare(`
    INSERT INTO breeding_slot (player_id, parent1, parent2, start_time, ready_time, result_card_number, result_source, claimed)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `).run(req.playerId, parent1CardNumber, parent2CardNumber, startTime.toISOString(), readyTime.toISOString(), result.card_number, source);

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
  const parent1Card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.parent1);
  const parent2Card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.parent2);

  res.json({
    active: true,
    // image_path -> image_url, igual ao result mais abaixo — sem isso os quadros de "chocando"
    // no front ficavam com <img src={undefined}> (os pais nunca ganhavam image_url).
    parent1: { ...parent1Card, image_url: `/${parent1Card.image_path}` },
    parent2: { ...parent2Card, image_url: `/${parent2Card.image_path}` },
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    ...computeTiming(slot.start_time, slot.ready_time),
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

  // Só combos que vieram DIRETO da tabela real de breeding (não substituídos por falta de carta
  // impressa, nem aproximados por power) entram no registro de descobertas. Par de pais
  // normalizado (ordem alfabética do card_number) pra "A+B" e "B+A" contarem como a mesma entrada;
  // ON CONFLICT DO NOTHING preserva a primeira descoberta se o jogador cruzar o mesmo par de novo.
  if (slot.result_source === 'real_exact') {
    const [parent1, parent2] = [slot.parent1, slot.parent2].sort();
    db.prepare(`
      INSERT INTO breeding_discoveries (player_id, parent1_card_number, parent2_card_number, result_card_number, discovered_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(player_id, parent1_card_number, parent2_card_number) DO NOTHING
    `).run(req.playerId, parent1, parent2, slot.result_card_number, new Date().toISOString());
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

// Livro de descobertas — combinações já cruzadas com sucesso (result_source = 'real_exact') por
// esse jogador. Devolve as 3 cartas (pai 1 + pai 2 + resultado) já com image_url, pra UI só
// desenhar "carta + carta = carta" sem precisar buscar cada uma separado.
app.get('/api/breeding/discoveries', requirePlayer, (req, res) => {
  const rows = db.prepare(`
    SELECT parent1_card_number, parent2_card_number, result_card_number, discovered_at
    FROM breeding_discoveries WHERE player_id = ? ORDER BY discovered_at DESC
  `).all(req.playerId);

  const getCardBrief = db.prepare('SELECT card_number, name, image_path FROM cards WHERE card_number = ?');
  const brief = (num) => {
    const c = getCardBrief.get(num);
    return c ? { card_number: c.card_number, name: c.name, image_url: `/${c.image_path}` } : null;
  };

  const discoveries = rows.map(r => ({
    parent1: brief(r.parent1_card_number),
    parent2: brief(r.parent2_card_number),
    result: brief(r.result_card_number),
    discoveredAt: r.discovered_at
  }));

  res.json(discoveries);
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
    { code: 'play_2_act_cards', description: 'Jogue 2 cartas com habilidade ACT', type: 'play_effect_tag', target_value: 2, target_filter: 'act', reward_gold: 60, reward_fluid: 5 },
    { code: 'play_2_cont_cards', description: 'Jogue 2 cartas com habilidade CONT', type: 'play_effect_tag', target_value: 2, target_filter: 'cont', reward_gold: 60, reward_fluid: 5 },
    { code: 'play_2_auto_cards', description: 'Jogue 2 cartas com habilidade AUTO', type: 'play_effect_tag', target_value: 2, target_filter: 'auto', reward_gold: 60, reward_fluid: 5 },
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

// ---------- Seed dos 3 bots permanentes ----------
// Cada bot precisa de: uma conta em `users` (login impossível, ver unusableHash), um perfil em
// `players` (pra contar pontos de rank e aparecer com nome em partidas) e UM deck próprio,
// copiado 1x da conta do usuário (nunca lido de novo dali em diante — trocar/apagar o deck
// original depois não afeta o bot). Roda 1x no boot, depois de `players`/`users` existirem
// (colunas is_bot/rank_points) e de getCardsByNumbers existir (usada pra validar a cópia).
// skill ('easy'|'medium'|'hard') alimenta o BotBrain (ver hasSmartDefense/hasSmartResources lá) —
// segue a mesma ordem do rank_points (bibs22 > dudu07 > kaiozin), então o bot mais forte no quadro
// de Ranks também joga melhor. Vale pro substituto de fila (Normal e Arena); a partida direta vs
// Bot ignora isso de propósito e força 'easy' sempre (ver bot:start), por ser modo de aprendizado.
const BOT_PLAYERS = [
  { username: 'dudu07', deckName: 'vermelho', fallbackDeckName: 'Red/Blue First Deck', rankPoints: 320, skill: 'medium' },
  { username: 'kaiozin', deckName: 'penguins', fallbackDeckName: 'Green/Purple First Deck', rankPoints: 180, skill: 'easy' },
  { username: 'bibs22', deckName: 'purple night', fallbackDeckName: 'Green/Purple First Deck', rankPoints: 540, skill: 'hard' }
];

function seedBotPlayers() {
  for (const bot of BOT_PLAYERS) {
    try {
      let userRow = db.prepare('SELECT id, is_bot FROM users WHERE username = ?').get(bot.username);
      if (userRow && !userRow.is_bot) {
        // Um humano já é dono desse nick — nunca sequestrar a conta. Esse bot fica de fora.
        console.warn(`[bots] "${bot.username}" já existe como conta de jogador real — pulando esse bot.`);
        continue;
      }
      if (!userRow) {
        const result = db.prepare('INSERT INTO users (username, password_hash, is_bot) VALUES (?, ?, 1)').run(bot.username, unusableHash());
        userRow = { id: result.lastInsertRowid, is_bot: 1 };
      }

      let playerRow = db.prepare('SELECT id FROM players WHERE user_id = ?').get(userRow.id);
      if (!playerRow) {
        // onUserCreated() de propósito NÃO é chamado aqui — ela deixaria esse bot herdar a linha
        // legada id=1, que é reservada pro primeiro humano a se registrar.
        const result = db.prepare('INSERT INTO players (user_id, gold_coins, pal_fluid, is_bot, rank_points) VALUES (?, 0, 0, 1, ?)').run(userRow.id, bot.rankPoints);
        playerRow = { id: result.lastInsertRowid };
      }

      let deckRow = db.prepare('SELECT id, main_deck, soul_deck FROM decks WHERE player_id = ? LIMIT 1').get(playerRow.id);
      if (!deckRow) {
        // Cascata de origem: deck do usuário (player_id=1) -> deck de mesmo nome de QUALQUER
        // jogador -> preset correspondente (sempre existe, seedDefaultDecks recria a cada boot).
        const source =
          db.prepare('SELECT * FROM decks WHERE name = ? AND player_id = 1').get(bot.deckName) ||
          db.prepare('SELECT * FROM decks WHERE name = ? AND player_id IS NOT NULL ORDER BY id LIMIT 1').get(bot.deckName) ||
          db.prepare('SELECT * FROM decks WHERE name = ? AND player_id IS NULL').get(bot.fallbackDeckName);

        if (!source) {
          console.warn(`[bots] nenhum deck encontrado pra "${bot.username}" (nem "${bot.deckName}" nem o preset "${bot.fallbackDeckName}") — bot fica sem deck, de fora do matchmaking.`);
        } else {
          // Valida que todas as cartas do deck copiado existem de verdade — getCardsByNumbers
          // estoura em card_number inexistente, e sem essa checagem um deck copiado quebrado
          // derrubaria startOnlineMatch dentro de um handler de socket, bem mais tarde.
          try {
            getCardsByNumbers(JSON.parse(source.main_deck));
            getCardsByNumbers(JSON.parse(source.soul_deck));
            // mode sempre 'normal' — estruturalmente impede um deck de bot de valer pra Arena
            // (validateDeckForMatch exige mode==='rank' lá, e bots não têm player_cards pra isso).
            const result = db.prepare(`
              INSERT INTO decks (name, main_deck, soul_deck, colors, mode, player_id, is_draft)
              VALUES (?, ?, ?, ?, 'normal', ?, 0)
            `).run(`${bot.username} (bot)`, source.main_deck, source.soul_deck, source.colors, playerRow.id);
            deckRow = { id: result.lastInsertRowid };
          } catch (e) {
            console.warn(`[bots] deck copiado pra "${bot.username}" tem carta inválida (${e.message}) — bot fica sem deck.`);
          }
        }
      }

      BOT_REGISTRY.push({ playerId: playerRow.id, username: bot.username, deckId: deckRow ? deckRow.id : null, skill: bot.skill });
    } catch (e) {
      // Nunca deixa um bot com problema derrubar o boot do servidor inteiro.
      console.warn(`[bots] falha ao semear "${bot.username}":`, e.message);
    }
  }
}
seedBotPlayers();

// Sorteia 1 dos 3 bots permanentes pra ser o oponente vs-Bot (bot:start) ou o substituto de fila
// (match:findMatch, ver BOT_QUEUE_FALLBACK_MS mais abaixo) — só entre os que têm deck (um bot sem
// deck, por falha no seed, fica de fora do sorteio em vez de quebrar a partida).
function pickVsBotOpponent() {
  const available = BOT_REGISTRY.filter(b => b.deckId);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// Marcador de habilidade no início do effect_text (ex: "ACT Interrupt (...)", "CONT Assault (...)")
// — usado pela missão "jogue N cartas com ACT/CONT/AUTO". Não há coluna própria pra isso no banco,
// é sempre o primeiro token do texto de efeito já parseado (ver getCardsByNumbers).
function effectTagOf(effectText) {
  const match = /^(ACT|CONT|AUTO)\b/.exec(effectText || '');
  return match ? match[1].toLowerCase() : null;
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

// ---------- RECOMPENSA DE LOGIN DIÁRIO (medalha ao lado das missões) ----------
// Ciclo de 7 dias consecutivos: dia 1 começa em 10 moedas e sobe 5 por dia até o dia 5 (30),
// o dia 6 dá 40 — junto com a moeda, cada um desses dias também dá Fluido de Pal, escalando em
// 5 (5, 10, 15, 20, 25, 30) — e o dia 7 dá 1 booster do set BP01. Se o jogador pular um dia (sem
// logar), a sequência quebra e volta pro dia 1. Cada dia só pode ser resgatado uma vez.
const LOGIN_STREAK_REWARDS = {
  1: { gold: 10, fluid: 5 }, 2: { gold: 15, fluid: 10 }, 3: { gold: 20, fluid: 15 }, 4: { gold: 25, fluid: 20 },
  5: { gold: 30, fluid: 25 }, 6: { gold: 40, fluid: 30 }, 7: { booster: true }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS player_login_streak (
    player_id INTEGER PRIMARY KEY,
    current_day INTEGER NOT NULL DEFAULT 0,
    last_login_date TEXT,
    claimed_today INTEGER NOT NULL DEFAULT 0
  )
`);

function yesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Avança a sequência do jogador pro dia de hoje, se ainda não foi feito (idempotente dentro do
// mesmo dia). Não concede a recompensa — isso só acontece explicitamente no /claim.
function getOrAdvanceLoginStreak(playerId) {
  const today = todayString();
  const row = db.prepare('SELECT * FROM player_login_streak WHERE player_id = ?').get(playerId);

  if (!row) {
    db.prepare('INSERT INTO player_login_streak (player_id, current_day, last_login_date, claimed_today) VALUES (?, 1, ?, 0)').run(playerId, today);
    return { currentDay: 1, claimedToday: false };
  }
  if (row.last_login_date === today) {
    return { currentDay: row.current_day, claimedToday: !!row.claimed_today };
  }

  const newDay = row.last_login_date === yesterdayString() ? (row.current_day >= 7 ? 1 : row.current_day + 1) : 1;
  db.prepare('UPDATE player_login_streak SET current_day = ?, last_login_date = ?, claimed_today = 0 WHERE player_id = ?').run(newDay, today, playerId);
  return { currentDay: newDay, claimedToday: false };
}

// Sorteia cartas do booster BP01 e credita na coleção do jogador (cópias além da 4ª viram Fluido
// de Pal) — mesma mecânica do /api/shop/open-booster, reaproveitada aqui pra recompensa do dia 7.
function grantFreeBoosterPack(playerId) {
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
    const current = getQty.get(playerId, card.card_number)?.quantity || 0;
    if (current >= 4) {
      fluidGained += RARITY_FLUID[card.rarity] || 5;
    } else {
      upsertQty.run(playerId, card.card_number, current + 1);
    }
  }
  return {
    cards: revealed.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`
    })),
    fluidGained
  };
}

// Estado da sequência de hoje + a tabela dos 7 dias (pra desenhar a "cartela" no popup)
app.get('/api/login-streak/today', requirePlayer, (req, res) => {
  const { currentDay, claimedToday } = getOrAdvanceLoginStreak(req.playerId);
  res.json({
    currentDay,
    claimedToday,
    rewards: Object.entries(LOGIN_STREAK_REWARDS).map(([day, reward]) => ({ day: Number(day), ...reward }))
  });
});

// Resgata a recompensa do dia atual da sequência
app.post('/api/login-streak/claim', requirePlayer, (req, res) => {
  const { currentDay, claimedToday } = getOrAdvanceLoginStreak(req.playerId);
  if (claimedToday) return res.status(400).json({ error: 'Recompensa de hoje já resgatada.' });

  db.prepare('UPDATE player_login_streak SET claimed_today = 1 WHERE player_id = ?').run(req.playerId);

  const reward = LOGIN_STREAK_REWARDS[currentDay];
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);

  if (reward.booster) {
    const { cards, fluidGained } = grantFreeBoosterPack(req.playerId);
    const newFluid = player.pal_fluid + fluidGained;
    db.prepare('UPDATE players SET pal_fluid = ? WHERE id = ?').run(newFluid, req.playerId);
    return res.json({ currentDay, boosterCards: cards, fluidGained, goldCoins: player.gold_coins, palFluid: newFluid });
  }

  const newGold = player.gold_coins + reward.gold;
  const newFluid = player.pal_fluid + reward.fluid;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = ?').run(newGold, newFluid, req.playerId);
  res.json({ currentDay, goldGained: reward.gold, fluidGained: reward.fluid, goldCoins: newGold, palFluid: newFluid });
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
  if (card.card_type === 'Soul') return null; // Soul nunca é craftável — só existe 1 carta desse tipo, sai só de booster/starter

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

  // Craftar avulso (fora do "Craft All") muda a coleção — recalcula is_draft de todo deck Rank do
  // jogador, senão a flag ficava travada no valor de antes desse craft até o próximo save/Craft All.
  const rankDecks = db.prepare("SELECT id, main_deck, soul_deck FROM decks WHERE player_id = ? AND mode = 'rank'").all(req.playerId);
  for (const d of rankDecks) {
    const stillDraft = computeDeckIsDraft(req.playerId, 'rank', JSON.parse(d.main_deck), JSON.parse(d.soul_deck));
    db.prepare('UPDATE decks SET is_draft = ? WHERE id = ?').run(stillDraft ? 1 : 0, d.id);
  }

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

// Abre 1 pacote de BP01 pra um jogador: sorteia CARDS_PER_PACK cartas ponderadas por raridade,
// credita 1 cópia (ou converte em Fluido de Pal se já tem 4). NÃO mexe em gold_coins — quem chama
// decide se cobra por isso (a loja) ou não (recompensa de baú do modo Arena). Reaproveitado por
// /api/shop/open-booster e por /api/arena/claim-reward.
function openBoosterPackFor(playerId) {
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

    const current = getQty.get(playerId, card.card_number)?.quantity || 0;
    if (current >= 4) {
      fluidGained += RARITY_FLUID[card.rarity] || 5;
    } else {
      upsertQty.run(playerId, card.card_number, current + 1);
    }
  }

  return {
    cards: revealed.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `/${c.image_path}`
    })),
    fluidGained
  };
}

// Abre 1 booster pack: sorteia 5 cartas do set BP01, respeitando raridade.
// Cópias além da 4ª viram Fluido de Pal em vez de empilhar.
app.post('/api/shop/open-booster', requirePlayer, (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.playerId);
  if (player.gold_coins < BOOSTER_PRICE) {
    return res.status(400).json({ error: 'Moedas de ouro insuficientes.' });
  }

  const { cards, fluidGained } = openBoosterPackFor(req.playerId);

  const newGold = player.gold_coins - BOOSTER_PRICE;
  const newFluid = player.pal_fluid + fluidGained;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = ?').run(newGold, newFluid, req.playerId);

  res.json({ cards, fluidGained, goldCoins: newGold, palFluid: newFluid });
});

// ---------- Modo Arena: draft temporário estilo Hearthstone ----------
const ARENA_TICKET_PRICE = 100; // gold_coins por run

function getAllCardsHydrated() {
  const numbers = db.prepare('SELECT card_number FROM cards').all().map(r => r.card_number);
  return getCardsByNumbers(numbers);
}

// Lista enxuta (nome + custo + tipo + is_lucky) na ordem dos picks, com repetição — o front usa
// isso pra montar a lista agrupada, a curva de custo e a contagem por tipo/Lucky Pal, tanto durante
// o draft quanto na tela de "deck pronto".
// `modifiers` é opcional — só o Modo Expedição tem card_modifiers (ex: Bancada de Remédios
// convertendo um Pal em Lucky); Arena nunca passa esse argumento, então isLucky cai no valor
// impresso na carta como sempre.
function buildDraftedCardsList(allCards, mainDeck, modifiers = {}) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]));
  return mainDeck.map(num => {
    const c = byNumber.get(num);
    const mod = modifiers[num];
    return {
      cardNumber: c.card_number, name: c.name, cost: c.cost, cardType: c.card_type,
      isLucky: (mod && mod.isLucky) || c.is_lucky, imageUrl: c.image_url,
      // Só existem de verdade no Modo Expedição (card_modifiers da Bancada de Remédios) — Arena
      // nunca passa `modifiers`, então ficam sempre 0/[] pra ela, sem custo nenhum a mais.
      powerBonus: mod?.powerBonus || 0,
      strikeBonus: mod?.strikeBonus || 0,
      grantedKeywords: mod?.grantedKeywords || []
    };
  });
}

function getActiveArenaRun(playerId) {
  return db.prepare("SELECT * FROM arena_runs WHERE player_id = ? AND status != 'finished' ORDER BY id DESC LIMIT 1").get(playerId);
}

// Run finalizada cujo baú ainda não foi resgatado (reward_tier só é preenchido no resgate, ver
// /api/arena/claim-reward) — sem isso o jogador que termina uma run nunca teria como ver a tela de
// resultado, já que getActiveArenaRun exclui runs 'finished' de propósito.
function getUnclaimedFinishedArenaRun(playerId) {
  return db.prepare("SELECT * FROM arena_runs WHERE player_id = ? AND status = 'finished' AND reward_tier IS NULL ORDER BY id DESC LIMIT 1").get(playerId);
}

// A run "relevante" agora: em andamento (retomável) tem prioridade; senão, a mais recente com baú
// pendente de resgate; senão nenhuma (mostra a tela de comprar ingresso).
function getRelevantArenaRun(playerId) {
  return getActiveArenaRun(playerId) || getUnclaimedFinishedArenaRun(playerId);
}

// Faixa de recompensa por vitórias na run (fixa nos limites exatos combinados: 0-4 Madeira,
// 5-8 Bronze, 9-11 Prata, 12 Ouro — nunca lida do banco, é sempre uma função pura de `wins`).
function computeArenaRewardTier(wins) {
  if (wins >= 12) return 'gold';
  if (wins >= 9) return 'silver';
  if (wins >= 5) return 'bronze';
  return 'wood';
}

// Conteúdo de cada baú — ouro/fluido/ingredientes fixos por tier, pacotes de BP01 só a partir da
// Prata. Ingrediente é o mesmo valor pras 3 colheitas (trigo/alface/tomate), ver /api/arena/claim-reward.
const ARENA_REWARD_TIERS = {
  wood: { gold: 50, fluid: 0, ingredient: 5, boosterPacks: 0 },
  bronze: { gold: 150, fluid: 10, ingredient: 10, boosterPacks: 0 },
  silver: { gold: 300, fluid: 30, ingredient: 15, boosterPacks: 1 },
  gold: { gold: 500, fluid: 60, ingredient: 20, boosterPacks: 2 }
};

// Monta a resposta que o front usa pra decidir qual sub-tela mostrar. A "próxima oferta" (cores ou
// cartas) nunca é persistida — é recalculada aqui na hora a cada chamada (ver comentário da tabela
// arena_runs), então funciona também pra retomar depois de um F5 no meio do draft.
function buildArenaRunPayload(run) {
  if (!run) return { active: false };
  const colors = JSON.parse(run.colors);
  const mainDeck = JSON.parse(run.main_deck);
  const payload = {
    active: true,
    id: run.id,
    status: run.status,
    colors,
    deckCount: mainDeck.length,
    wins: run.wins,
    losses: run.losses
  };

  if (run.status === 'drafting_cards') {
    // Sem restrição de cor enquanto `colors` ainda não travou as 2 (ver buildDraftPool/tryLockColors
    // em arenaDraft.js) — as cores emergem dos próprios picks, não existe mais uma etapa separada.
    const allCards = getAllCardsHydrated();
    const pool = arenaDraft.buildDraftPool(allCards, colors);
    payload.cardOffer = arenaDraft.offerCardTrio(pool, mainDeck).map(c => ({
      cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, cost: c.cost, colors: c.colors
    }));
    payload.draftedCards = buildDraftedCardsList(allCards, mainDeck);
  } else if (run.status === 'ready') {
    // Deck fechado — mesma lista/curva de custo do draft continuam visíveis na tela de "deck pronto".
    payload.draftedCards = buildDraftedCardsList(getAllCardsHydrated(), mainDeck);
  } else if (run.status === 'finished') {
    // Só chega aqui quando o baú ainda não foi resgatado (ver getUnclaimedFinishedArenaRun) — a
    // faixa é só uma prévia pro front mostrar qual baú vai abrir; o resgate de verdade acontece em
    // /api/arena/claim-reward.
    payload.rewardTier = computeArenaRewardTier(run.wins);
  }

  return payload;
}

app.get('/api/arena/status', requirePlayer, (req, res) => {
  res.json(buildArenaRunPayload(getRelevantArenaRun(req.playerId)));
});

// Compra o ingresso (100 gold) e cria a run. Se já existe uma run em andamento OU uma run
// terminada com baú pendente, não cobra de novo — só devolve o estado dela (cobre o clique duplo,
// o F5, e evita deixar uma recompensa pra trás sem querer ao comprar outro ingresso).
app.post('/api/arena/start', requirePlayer, (req, res) => {
  const existing = getRelevantArenaRun(req.playerId);
  if (existing) return res.json(buildArenaRunPayload(existing));

  const player = db.prepare('SELECT gold_coins FROM players WHERE id = ?').get(req.playerId);
  if (player.gold_coins < ARENA_TICKET_PRICE) {
    return res.status(400).json({ error: 'Ouro insuficiente pra comprar o ingresso.' });
  }

  db.prepare('UPDATE players SET gold_coins = gold_coins - ? WHERE id = ?').run(ARENA_TICKET_PRICE, req.playerId);
  const result = db.prepare("INSERT INTO arena_runs (player_id, status) VALUES (?, 'drafting_cards')").run(req.playerId);
  res.json(buildArenaRunPayload(db.prepare('SELECT * FROM arena_runs WHERE id = ?').get(result.lastInsertRowid)));
});

// Desiste da run, travando o baú na faixa correspondente às vitórias já conquistadas até agora
// (mesma faixa que bater 3 derrotas ou 12 vitórias daria — ver computeArenaRewardTier). Só permitido
// com o deck pronto e ENTRE partidas ('ready') — não dá pra desistir no meio do draft (não haveria
// vitória nenhuma pra valer o baú) nem no meio de uma partida em andamento ('in_progress'), que
// exigiria encerrar a sessão online/avisar o oponente. Não mexe em wins/losses, só fecha a run.
app.post('/api/arena/forfeit', requirePlayer, (req, res) => {
  const run = getActiveArenaRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma run de Arena em andamento.' });
  if (run.status !== 'ready') {
    return res.status(400).json({ error: 'Só dá pra desistir entre partidas, com o deck pronto.' });
  }

  db.prepare("UPDATE arena_runs SET status = 'finished', finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(run.id);
  res.json(buildArenaRunPayload(db.prepare('SELECT * FROM arena_runs WHERE id = ?').get(run.id)));
});

// Resgata o baú da run mais recente que terminou e ainda não foi resgatada. Concede ouro/fluido/
// ingredientes fixos por faixa (ver ARENA_REWARD_TIERS) mais N pacotes de BP01 (reaproveitando
// openBoosterPackFor, o mesmo sorteio ponderado por raridade da loja) — e marca reward_tier, que é
// o que faz essa run parar de aparecer (ver getUnclaimedFinishedArenaRun).
app.post('/api/arena/claim-reward', requirePlayer, (req, res) => {
  const run = getUnclaimedFinishedArenaRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma recompensa de Arena pra resgatar agora.' });

  const tier = computeArenaRewardTier(run.wins);
  const reward = ARENA_REWARD_TIERS[tier];

  const cards = [];
  let fluidGained = reward.fluid;
  for (let i = 0; i < reward.boosterPacks; i++) {
    const pack = openBoosterPackFor(req.playerId);
    cards.push(...pack.cards);
    fluidGained += pack.fluidGained;
  }

  db.prepare(`
    UPDATE players SET gold_coins = gold_coins + ?, pal_fluid = pal_fluid + ?,
      wheat = wheat + ?, lettuce = lettuce + ?, tomato = tomato + ?
    WHERE id = ?
  `).run(reward.gold, fluidGained, reward.ingredient, reward.ingredient, reward.ingredient, req.playerId);

  db.prepare('UPDATE arena_runs SET reward_tier = ? WHERE id = ?').run(tier, run.id);

  const player = db.prepare('SELECT gold_coins, pal_fluid FROM players WHERE id = ?').get(req.playerId);
  res.json({
    tier,
    wins: run.wins,
    losses: run.losses,
    gold: reward.gold,
    fluid: fluidGained,
    ingredient: reward.ingredient,
    cards,
    goldCoins: player.gold_coins,
    palFluid: player.pal_fluid
  });
});

// Escolhe 1 carta do draft (até fechar as 50). As 2 cores da run não são mais escolhidas à parte —
// elas travam sozinhas conforme os picks reais acontecem (ver tryLockColors em arenaDraft.js):
// enquanto não travarem as 2, a oferta vem de TODAS as cores; a cor de cada pick que ainda não
// repete uma já travada vira uma das 2 cores da run. Revalida no servidor que a carta é elegível
// pro pool atual (restrito ou não) e ainda cabe nos tetos de cópias/Lucky Pals.
app.post('/api/arena/pick-card', requirePlayer, (req, res) => {
  const { cardNumber } = req.body;
  const run = getActiveArenaRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma run de Arena em andamento.' });
  if (run.status !== 'drafting_cards') return res.status(400).json({ error: 'Essa run não está draftando cartas agora.' });

  const colors = JSON.parse(run.colors);
  const mainDeck = JSON.parse(run.main_deck);
  const allCards = getAllCardsHydrated();
  const pool = arenaDraft.buildDraftPool(allCards, colors);
  if (!arenaDraft.isCardNumberLegalPick(pool, mainDeck, cardNumber)) {
    return res.status(400).json({ error: 'Essa carta não é uma escolha válida agora.' });
  }

  const card = pool.find(c => c.card_number === cardNumber);
  mainDeck.push(cardNumber);
  const newColors = arenaDraft.tryLockColors(colors, card);
  const newStatus = mainDeck.length >= arenaDraft.ARENA_MAIN_DECK_SIZE ? 'ready' : 'drafting_cards';
  db.prepare('UPDATE arena_runs SET main_deck = ?, colors = ?, status = ? WHERE id = ?')
    .run(JSON.stringify(mainDeck), JSON.stringify(newColors), newStatus, run.id);

  res.json(buildArenaRunPayload(db.prepare('SELECT * FROM arena_runs WHERE id = ?').get(run.id)));
});

// ---------- Modo Expedição: rotas de progressão (Fase 1 — escolha de deck e mapa) ----------

function getActiveRoguelikeRun(playerId) {
  return db.prepare("SELECT * FROM roguelike_runs WHERE player_id = ? AND status NOT IN ('finished_win','finished_dead','finished_forfeit') ORDER BY id DESC LIMIT 1").get(playerId);
}

// Run terminada (vitória, derrota ou desistência) cujo resultado o jogador ainda não viu (ver
// /api/roguelike/acknowledge-result) — sem isso a run some de vista assim que termina, já que
// getActiveRoguelikeRun exclui runs finalizadas de propósito.
function getUnclaimedFinishedRoguelikeRun(playerId) {
  return db.prepare("SELECT * FROM roguelike_runs WHERE player_id = ? AND status IN ('finished_win','finished_dead','finished_forfeit') AND result_seen = 0 ORDER BY id DESC LIMIT 1").get(playerId);
}

// A run "relevante" agora: em andamento (retomável) tem prioridade; senão, a mais recente com
// resultado ainda não visto; senão nenhuma (mostra a tela de escolha de personagem).
function getRelevantRoguelikeRun(playerId) {
  return getActiveRoguelikeRun(playerId) || getUnclaimedFinishedRoguelikeRun(playerId);
}

// Sem run relevante: devolve os 5 decks-personagem (com preview das 16 cartas já hidratadas) pra
// tela de escolha. Com run relevante: mapa atual, vidas, dogecoins e o deck (que cresce durante a
// run) — se já terminou, `goldConverted`/`ingredientConverted` mostram quanto os dogecoins
// renderam (ver computeRoguelikeDogecoinConversion), já creditado nos atributos do jogador no
// momento em que a run terminou.
function buildRoguelikeRunPayload(run) {
  if (!run) {
    const allCards = getAllCardsHydrated();
    return {
      active: false,
      starterDecks: roguelikeStarterDecks.ROGUELIKE_STARTER_DECKS.map(d => ({
        key: d.key,
        cards: buildDraftedCardsList(allCards, roguelikeStarterDecks.expandStarterDeck(d))
      }))
    };
  }

  const map = JSON.parse(run.map);
  const mainDeck = JSON.parse(run.main_deck);
  const isFinished = run.status === 'finished_win' || run.status === 'finished_dead' || run.status === 'finished_forfeit';
  const conversion = isFinished ? computeRoguelikeDogecoinConversion(run.dogecoins) : null;
  return {
    active: true,
    id: run.id,
    status: run.status,
    starterDeckKey: run.starter_deck_key,
    deckCount: mainDeck.length,
    draftedCards: buildDraftedCardsList(getAllCardsHydrated(), mainDeck, JSON.parse(run.card_modifiers)),
    lives: run.lives,
    dogecoins: run.dogecoins,
    goldConverted: conversion ? conversion.gold : null,
    ingredientConverted: conversion ? conversion.ingredient : null,
    map,
    currentNodeId: run.current_node_id,
    pendingChoice: run.pending_choice ? JSON.parse(run.pending_choice) : null
  };
}

app.get('/api/roguelike/status', requirePlayer, (req, res) => {
  res.json(buildRoguelikeRunPayload(getRelevantRoguelikeRun(req.playerId)));
});

// Marca o resultado da run finalizada como visto — some da tela de status depois disso, liberando
// a escolha de personagem pra uma expedição nova (mesmo padrão do resgate de baú da Arena, só que
// aqui não há nada pra resgatar de verdade: o ouro já foi creditado no momento em que a run terminou).
app.post('/api/roguelike/acknowledge-result', requirePlayer, (req, res) => {
  const run = getUnclaimedFinishedRoguelikeRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhum resultado de Expedição pra confirmar agora.' });
  db.prepare('UPDATE roguelike_runs SET result_seen = 1 WHERE id = ?').run(run.id);
  res.json(buildRoguelikeRunPayload(getRelevantRoguelikeRun(req.playerId)));
});

// Inicia uma run nova a partir de um dos 5 decks-personagem fixos. Se já existe uma run em
// andamento OU uma run terminada com resultado ainda não visto, não recria — só devolve o estado
// dela (cobre F5 no meio da run e força ver o resultado antes de começar outra expedição).
app.post('/api/roguelike/start', requirePlayer, (req, res) => {
  const existing = getRelevantRoguelikeRun(req.playerId);
  if (existing) return res.json(buildRoguelikeRunPayload(existing));

  const { starterDeckKey, expeditionLength } = req.body;
  const starterDeck = roguelikeStarterDecks.getStarterDeck(starterDeckKey);
  if (!starterDeck) return res.status(400).json({ error: 'Deck inicial inválido.' });

  const mainDeck = roguelikeStarterDecks.expandStarterDeck(starterDeck);
  const map = roguelikeMap.generateMap(expeditionLength);

  const result = db.prepare(`
    INSERT INTO roguelike_runs (player_id, starter_deck_key, main_deck, map)
    VALUES (?, ?, ?, ?)
  `).run(req.playerId, starterDeckKey, JSON.stringify(mainDeck), JSON.stringify(map));

  res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(result.lastInsertRowid)));
});

// Desiste da run atual — converte os dogecoins acumulados (mesma fórmula de sempre) e encerra em
// 'finished_forfeit'. Só permitido fora de uma batalha em andamento ('in_battle'), já que ali existe
// uma partida socket ativa que essa rota não teria como encerrar. Serve tanto pra quem quer parar
// de propósito quanto pra destravar uma run presa (ex: o bug antigo do Boss virar 'cleared' numa
// derrota, já corrigido, mas que deixou gente com uma run sem nenhum nó disponível pra sempre).
app.post('/api/roguelike/forfeit', requirePlayer, (req, res) => {
  const run = getActiveRoguelikeRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma run de Expedição em andamento.' });
  if (run.status === 'in_battle') {
    return res.status(400).json({ error: 'Termine a batalha atual antes de desistir da expedição.' });
  }
  // Desistir custa metade dos dogecoins acumulados (arredondado pra baixo) — só a outra metade
  // passa pela conversão normal (ver computeRoguelikeDogecoinConversion). Grava o valor já
  // penalizado na run, então o payload/resumo final mostram exatamente o que foi convertido.
  const penalizedDogecoins = Math.floor(run.dogecoins / 2);
  convertRoguelikeDogecoins(run.player_id, penalizedDogecoins);
  db.prepare("UPDATE roguelike_runs SET status = 'finished_forfeit', dogecoins = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(penalizedDogecoins, run.id);
  res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
});

// Entra num nó disponível do mapa. Battle/Boss só marcam a run como 'in_battle' — quem realmente
// inicia a partida é o socket 'bot:start' com roguelikeRunId (o cliente navega pro tabuleiro em
// seguida, ver GameBoard.jsx). Os demais tipos (event/shop/medicine_bench) ainda geram um
// pending_choice provisório "em breve" — Fases 3/4 implementam cada mecânica de verdade.
app.post('/api/roguelike/enter-node', requirePlayer, (req, res) => {
  const { nodeId } = req.body;
  const run = getActiveRoguelikeRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma run de Expedição em andamento.' });
  if (run.status !== 'traveling') return res.status(400).json({ error: 'Essa run não está livre pra viajar agora.' });

  const map = JSON.parse(run.map);
  if (!roguelikeMap.canEnterNode(map, nodeId)) {
    return res.status(400).json({ error: 'Esse nó não está disponível agora.' });
  }

  const node = map.nodes[nodeId];
  if (node.type === 'battle' || node.type === 'boss') {
    db.prepare("UPDATE roguelike_runs SET status = 'in_battle', current_node_id = ? WHERE id = ?").run(nodeId, run.id);
    return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
  }

  let pendingChoice;
  if (node.type === 'medicine_bench') {
    pendingChoice = { kind: 'medicine_bench', step: 'choose_option', options: roguelikeEvents.offerMedicineBenchOptions() };
  } else if (node.type === 'shop') {
    const mainDeck = JSON.parse(run.main_deck);
    pendingChoice = { kind: 'shop', options: roguelikeEvents.offerShopStock(getAllCardsHydrated(), mainDeck) };
  } else {
    // node.type === 'event' — sorteia 1 dos 5 subtipos e monta o pending_choice inicial dele.
    const allCards = getAllCardsHydrated();
    const mainDeck = JSON.parse(run.main_deck);
    const subtype = roguelikeEvents.pickEventSubtype(allCards, mainDeck);
    if (subtype === 'sacrifice') {
      pendingChoice = { kind: 'sacrifice', step: 'choose_sacrifice', targets: roguelikeEvents.buildDeckPalTargets(allCards, mainDeck) };
    } else if (subtype === 'black_market') {
      pendingChoice = { kind: 'black_market', step: 'choose_color', colorOptions: roguelikeEvents.offerBlackMarketColorChoices() };
    } else if (subtype === 'rare_chest') {
      // Sem escolha — aplica a recompensa na hora (ver offerRareChestReward); o pending_choice só
      // existe pra mostrar o que foi ganho antes do jogador clicar em continuar.
      const reward = roguelikeEvents.offerRareChestReward(allCards);
      const rewardedDeck = [...mainDeck, ...reward.cards.map(c => c.cardNumber)];
      db.prepare('UPDATE roguelike_runs SET main_deck = ?, dogecoins = dogecoins + ? WHERE id = ?')
        .run(JSON.stringify(rewardedDeck), reward.dogecoins, run.id);
      pendingChoice = { kind: 'rare_chest', cards: reward.cards, dogecoins: reward.dogecoins };
    } else if (subtype === 'wild_encounter') {
      pendingChoice = {
        kind: 'wild_encounter',
        encounterCard: roguelikeEvents.pickWildEncounterCard(allCards),
        deckCards: roguelikeEvents.buildWildEncounterDeckCards(allCards, mainDeck, JSON.parse(run.card_modifiers))
      };
    } else {
      pendingChoice = { kind: 'breeding', step: 'choose_parent1', targets: roguelikeEvents.buildDeckPalTargets(allCards, mainDeck) };
    }
  }

  db.prepare("UPDATE roguelike_runs SET status = 'in_event', current_node_id = ?, pending_choice = ? WHERE id = ?")
    .run(nodeId, JSON.stringify(pendingChoice), run.id);

  res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
});

// Resolve a escolha pendente do nó atual. Kinds:
// - 'battle_reward': exige cardNumber (1 das 3 opções) -> soma ao deck -> libera o mapa.
// - 'medicine_bench': 2 passos — 1º pick escolhe a opção (optionIndex) e pede o alvo; 2º pick
//   (cardNumber) aplica o modificador nesse Pal -> libera o mapa.
// - 'shop': action 'buy' (compra 1 item, permanece na loja) ou 'leave' (sai e libera o mapa).
// - 'coming_soon': evento ainda não implementado (Fase 4) — sem corpo, só libera o mapa.
app.post('/api/roguelike/resolve-choice', requirePlayer, (req, res) => {
  const run = getActiveRoguelikeRun(req.playerId);
  if (!run) return res.status(404).json({ error: 'Nenhuma run de Expedição em andamento.' });
  if (run.status !== 'in_event' || !run.pending_choice) {
    return res.status(400).json({ error: 'Não há nada pendente pra resolver agora.' });
  }

  const pendingChoice = JSON.parse(run.pending_choice);
  let mainDeck = JSON.parse(run.main_deck);

  if (pendingChoice.kind === 'battle_reward') {
    const { cardNumber } = req.body;
    const picked = pendingChoice.options.find(o => o.cardNumber === cardNumber);
    if (!picked) return res.status(400).json({ error: 'Essa carta não é uma opção válida agora.' });
    mainDeck.push(cardNumber);
  } else if (pendingChoice.kind === 'medicine_bench') {
    if (pendingChoice.step === 'choose_option') {
      const { optionIndex } = req.body;
      const chosenOption = pendingChoice.options[optionIndex];
      if (!chosenOption) return res.status(400).json({ error: 'Essa opção não é válida agora.' });
      const targets = roguelikeEvents.buildMedicineBenchTargets(getAllCardsHydrated(), mainDeck);
      if (targets.length === 0) return res.status(400).json({ error: 'Você não tem nenhum Pal no deck pra receber esse efeito.' });
      const nextPendingChoice = { kind: 'medicine_bench', step: 'choose_target', chosenOption, targets };
      db.prepare('UPDATE roguelike_runs SET pending_choice = ? WHERE id = ?').run(JSON.stringify(nextPendingChoice), run.id);
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
    if (pendingChoice.step === 'choose_target') {
      const { cardNumber } = req.body;
      const target = pendingChoice.targets.find(t => t.cardNumber === cardNumber);
      if (!target) return res.status(400).json({ error: 'Esse Pal não é um alvo válido agora.' });
      const modifiers = JSON.parse(run.card_modifiers);
      const updatedModifiers = roguelikeEvents.applyMedicineBenchOption(modifiers, pendingChoice.chosenOption, cardNumber);
      db.prepare('UPDATE roguelike_runs SET card_modifiers = ? WHERE id = ?').run(JSON.stringify(updatedModifiers), run.id);
    } else {
      return res.status(400).json({ error: 'Estado inválido da Bancada de Remédios.' });
    }
  } else if (pendingChoice.kind === 'shop') {
    const { action, cardNumber } = req.body;
    if (action === 'buy') {
      const item = pendingChoice.options.find(o => o.cardNumber === cardNumber && !o.purchased);
      if (!item) return res.status(400).json({ error: 'Esse item não está disponível na loja agora.' });
      if (run.dogecoins < item.price) return res.status(400).json({ error: 'Dogecoins insuficientes.' });
      mainDeck.push(cardNumber);
      item.purchased = true;
      db.prepare('UPDATE roguelike_runs SET main_deck = ?, dogecoins = ?, pending_choice = ? WHERE id = ?')
        .run(JSON.stringify(mainDeck), run.dogecoins - item.price, JSON.stringify(pendingChoice), run.id);
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
    if (action !== 'leave') return res.status(400).json({ error: 'Ação inválida na loja.' });
    // action === 'leave' cai pro fechamento genérico do nó, abaixo.
  } else if (pendingChoice.kind === 'sacrifice') {
    if (pendingChoice.step === 'choose_sacrifice') {
      const { cardNumber } = req.body;
      const target = pendingChoice.targets.find(t => t.cardNumber === cardNumber);
      if (!target) return res.status(400).json({ error: 'Esse Pal não pode ser sacrificado agora.' });
      const nextPendingChoice = { kind: 'sacrifice', step: 'choose_new', sacrificedCardNumber: cardNumber, options: roguelikeEvents.offerSacrificeReplacements(getAllCardsHydrated()) };
      db.prepare('UPDATE roguelike_runs SET pending_choice = ? WHERE id = ?').run(JSON.stringify(nextPendingChoice), run.id);
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
    if (pendingChoice.step === 'choose_new') {
      const { cardNumber } = req.body;
      const picked = pendingChoice.options.find(o => o.cardNumber === cardNumber);
      if (!picked) return res.status(400).json({ error: 'Essa carta não é uma opção válida agora.' });
      const sacrificeIndex = mainDeck.indexOf(pendingChoice.sacrificedCardNumber);
      if (sacrificeIndex !== -1) mainDeck.splice(sacrificeIndex, 1);
      mainDeck.push(cardNumber);
    } else {
      return res.status(400).json({ error: 'Estado inválido do Sacrifício.' });
    }
  } else if (pendingChoice.kind === 'black_market') {
    if (pendingChoice.step === 'choose_color') {
      const { choice } = req.body;
      const color = roguelikeEvents.resolveBlackMarketColor(pendingChoice.colorOptions, choice);
      if (!color) return res.status(400).json({ error: 'Escolha de cor inválida.' });
      const options = roguelikeEvents.offerBlackMarketPalsByColor(getAllCardsHydrated(), color);
      if (options.length === 0) return res.status(400).json({ error: 'Não há Pals dessa cor disponíveis agora.' });
      const nextPendingChoice = { kind: 'black_market', step: 'choose_cost', color, options };
      db.prepare('UPDATE roguelike_runs SET pending_choice = ? WHERE id = ?').run(JSON.stringify(nextPendingChoice), run.id);
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
    if (pendingChoice.step === 'choose_cost') {
      const { cardNumber } = req.body;
      const picked = pendingChoice.options.find(o => o.cardNumber === cardNumber);
      if (!picked) return res.status(400).json({ error: 'Essa carta não é uma opção válida agora.' });
      mainDeck.push(cardNumber);
    } else {
      return res.status(400).json({ error: 'Estado inválido da Loja Clandestina.' });
    }
  } else if (pendingChoice.kind === 'wild_encounter') {
    const { selectedIndexes } = req.body;
    const indexSet = new Set(Array.isArray(selectedIndexes) ? selectedIndexes : []);
    const validEntries = pendingChoice.deckCards.filter(c => indexSet.has(c.index));
    const powerSum = validEntries.reduce((sum, c) => sum + (c.power || 0), 0);
    const targetPower = pendingChoice.encounterCard.power;

    if (powerSum >= targetPower) {
      mainDeck.push(pendingChoice.encounterCard.cardNumber);
    } else if (powerSum >= targetPower / 2) {
      db.prepare('UPDATE roguelike_runs SET dogecoins = dogecoins + ? WHERE id = ?').run(roguelikeEvents.WILD_ENCOUNTER_PARTIAL_DOGECOINS, run.id);
    } else {
      // Não conseguiu nem metade do Power — perde 1 vida, mesma checagem de fim de run que uma
      // derrota de batalha usa (ver applyRoguelikeBattleResult).
      const lives = run.lives - 1;
      const lossMap = JSON.parse(run.map);
      roguelikeMap.markNodeCleared(lossMap, run.current_node_id);
      if (lives <= 0) {
        convertRoguelikeDogecoins(run.player_id, run.dogecoins);
        db.prepare("UPDATE roguelike_runs SET status = 'finished_dead', lives = 0, map = ?, pending_choice = NULL, finished_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(JSON.stringify(lossMap), run.id);
      } else {
        db.prepare("UPDATE roguelike_runs SET status = 'traveling', lives = ?, map = ?, pending_choice = NULL WHERE id = ?")
          .run(lives, JSON.stringify(lossMap), run.id);
      }
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
  } else if (pendingChoice.kind === 'breeding') {
    if (pendingChoice.step === 'choose_parent1') {
      const { cardNumber } = req.body;
      const target = pendingChoice.targets.find(t => t.cardNumber === cardNumber);
      if (!target) return res.status(400).json({ error: 'Esse Pal não é um pai válido agora.' });
      const secondTargets = roguelikeEvents.buildSecondParentTargets(pendingChoice.targets, cardNumber);
      const nextPendingChoice = { kind: 'breeding', step: 'choose_parent2', parent1CardNumber: cardNumber, targets: secondTargets };
      db.prepare('UPDATE roguelike_runs SET pending_choice = ? WHERE id = ?').run(JSON.stringify(nextPendingChoice), run.id);
      return res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
    }
    if (pendingChoice.step === 'choose_parent2') {
      const { cardNumber } = req.body;
      const target = pendingChoice.targets.find(t => t.cardNumber === cardNumber);
      if (!target) return res.status(400).json({ error: 'Esse Pal não é um 2º pai válido agora.' });
      const parent1Row = db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(pendingChoice.parent1CardNumber);
      const parent2Row = db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(cardNumber);
      const { card: resultCard } = computeBreedingResult(parent1Row, parent2Row);
      mainDeck.push(resultCard.card_number);
    } else {
      return res.status(400).json({ error: 'Estado inválido do Breeding.' });
    }
  }
  // pendingChoice.kind === 'rare_chest' (recompensa já aplicada no enter-node) ou 'coming_soon'
  // (Fase 4 ainda incompleta) caem direto no fechamento genérico abaixo, sem nada extra pra fazer.

  const map = JSON.parse(run.map);
  roguelikeMap.markNodeCleared(map, run.current_node_id);
  db.prepare("UPDATE roguelike_runs SET status = 'traveling', map = ?, main_deck = ?, pending_choice = NULL WHERE id = ?")
    .run(JSON.stringify(map), JSON.stringify(mainDeck), run.id);

  res.json(buildRoguelikeRunPayload(db.prepare('SELECT * FROM roguelike_runs WHERE id = ?').get(run.id)));
});

// Contagem de "gente online" pro badge do menu — conexões WebSocket ativas, não contas
// distintas (2 abas da mesma conta contam 2), é só uma estimativa de atividade no site. Os 3 bots
// permanentes (BOT_REGISTRY) somam sempre — eles não têm socket, então nunca entrariam em
// io.engine.clientsCount por conta própria; é assim que o badge nunca mostra menos que eles.
function broadcastOnlineCount() {
  io.emit('online:count', io.engine.clientsCount + BOT_REGISTRY.length);
}

io.on('connection', (socket) => {
  const userId = socket.request.session?.userId;
  const playerId = userId ? resolvePlayerId(userId) : null;

  // Conta pro badge de "gente online" mesmo sem login (ex: alguém ainda na tela de login) — mas
  // sem playerId a conexão não ganha NENHUM dos handlers de jogo abaixo, só existe pra essa contagem.
  broadcastOnlineCount();
  socket.on('disconnect', () => broadcastOnlineCount());
  // Permite ao cliente pedir a contagem de novo sem esperar outra conexão/desconexão mudar o
  // valor — necessário pro badge se recuperar depois de navegar pra longe e voltar (ver LiveContext
  // no front, que fica montado acima do router e reemite isso a cada mount/reconexão).
  socket.on('online:requestCount', () => socket.emit('online:count', io.engine.clientsCount + BOT_REGISTRY.length));

  if (!playerId) return;

  console.log(`Cliente conectado: ${socket.id} (player ${playerId})`);
  // Sobrescreve de propósito se já havia um socket antigo pra esse playerId (2ª aba/reconexão) —
  // o socket mais recente é o que deve receber desafios/mensagens dali pra frente.
  connectedSockets.set(playerId, socket);

  // ---------- Chat de lobby (tela de "Encontrar Partida") ----------
  pruneLobbyChatHistory();
  socket.emit('lobbyChat:history', lobbyChatHistory);

  // Mesma ideia do online:requestCount acima: dá pro cliente pedir o histórico de novo sem
  // depender de uma reconexão de socket (que não acontece ao só navegar de tela dentro da SPA).
  // Fica dentro do bloco autenticado de propósito — visitante sem login não deve poder puxar
  // username+playerId de quem está no chat.
  socket.on('lobbyChat:requestHistory', () => {
    pruneLobbyChatHistory();
    socket.emit('lobbyChat:history', lobbyChatHistory);
  });

  socket.on('lobbyChat:send', ({ text } = {}) => {
    if (typeof text !== 'string') return;
    const trimmed = text.trim().slice(0, LOBBY_CHAT_MAX_LENGTH);
    if (!trimmed) return;

    const now = Date.now();
    const lastSent = lobbyChatLastSent.get(playerId) || 0;
    if (now - lastSent < LOBBY_CHAT_COOLDOWN_MS) {
      socket.emit('lobbyChat:error', { message: 'Aguarde um instante antes de enviar outra mensagem.' });
      return;
    }
    lobbyChatLastSent.set(playerId, now);

    const message = { author: getUsernameForPlayer(playerId), text: trimmed, ts: now, playerId };
    lobbyChatHistory.push(message);
    pruneLobbyChatHistory();

    io.emit('lobbyChat:message', message);
  });

  // Desafio direto: clicar no nick de alguém no chat e chamar pra partida, sem passar pela fila.
  socket.on('lobbyChat:challenge', ({ targetPlayerId, deckId, matchType } = {}) => {
    const type = matchType === 'arena' ? 'arena' : 'normal';
    if (typeof targetPlayerId !== 'number' || targetPlayerId === playerId) return;

    if (getSessionBySocket(socket)) {
      socket.emit('lobbyChat:challengeError', { message: 'Você já está em uma partida.' });
      return;
    }

    const validation = validateDeckForMatch(playerId, deckId, type);
    if (!validation.ok) {
      socket.emit('lobbyChat:challengeError', { message: validation.message });
      return;
    }

    const targetSocket = connectedSockets.get(targetPlayerId);
    if (!targetSocket) {
      socket.emit('lobbyChat:challengeError', { message: 'Esse jogador não está mais online.' });
      return;
    }
    if (getSessionBySocket(targetSocket)) {
      socket.emit('lobbyChat:challengeError', { message: 'Esse jogador já está em uma partida.' });
      return;
    }

    const challengeId = crypto.randomUUID();
    const timeoutHandle = setTimeout(() => {
      pendingChallenges.delete(challengeId);
      socket.emit('lobbyChat:challengeExpired', { challengeId });
      targetSocket.emit('lobbyChat:challengeExpired', { challengeId });
    }, CHALLENGE_TIMEOUT_MS);

    pendingChallenges.set(challengeId, {
      challengeId, challengerSocket: socket, challengerPlayerId: playerId, challengerDeckId: deckId,
      targetPlayerId, matchType: type, timeoutHandle
    });

    targetSocket.emit('lobbyChat:challengeReceived', {
      challengeId, fromPlayerId: playerId, fromUsername: getUsernameForPlayer(playerId), matchType: type
    });
    socket.emit('lobbyChat:challengeSent', { challengeId, targetUsername: getUsernameForPlayer(targetPlayerId) });
  });

  // Quem foi desafiado aceita ou recusa. Aceitar exige um deck próprio válido pro mesmo matchType.
  socket.on('lobbyChat:challengeRespond', ({ challengeId, accept, deckId } = {}) => {
    const challenge = pendingChallenges.get(challengeId);
    if (!challenge || challenge.targetPlayerId !== playerId) return;

    clearTimeout(challenge.timeoutHandle);
    pendingChallenges.delete(challengeId);

    if (!accept) {
      challenge.challengerSocket.emit('lobbyChat:challengeDenied', { byUsername: getUsernameForPlayer(playerId) });
      return;
    }

    if (!challenge.challengerSocket.connected) {
      socket.emit('lobbyChat:challengeError', { message: 'O desafiante desconectou.' });
      return;
    }

    const validation = validateDeckForMatch(playerId, deckId, challenge.matchType);
    if (!validation.ok) {
      socket.emit('lobbyChat:challengeError', { message: validation.message });
      challenge.challengerSocket.emit('lobbyChat:challengeError', { message: 'O desafio não pôde ser aceito.' });
      return;
    }

    removeFromQueue(challenge.challengerPlayerId);
    removeFromQueue(playerId);
    startOnlineMatch(challenge.matchType,
      { socket: challenge.challengerSocket, playerId: challenge.challengerPlayerId, deckId: challenge.challengerDeckId },
      { socket, playerId, deckId }
    );
  });

  // ---------- Matchmaking online: entrar/sair da fila de "Encontrar Partida" ----------
  socket.on('match:findMatch', ({ deckId, matchType, arenaRunId }) => {
    const type = matchType === 'arena' ? 'arena' : (matchType === 'arenaDraft' ? 'arenaDraft' : 'normal');
    if (queuedPlayers.has(playerId)) return; // já está numa fila (ex.: clique duplo)

    let entry;
    if (type === 'arenaDraft') {
      // Deck aqui nunca vem de `decks` — é o main_deck já draftado da run (ver Fase 1). Só o dono
      // da run pode usá-la, e só depois que o draft chegou nas 50 cartas (status 'ready').
      const run = db.prepare('SELECT * FROM arena_runs WHERE id = ? AND player_id = ?').get(arenaRunId, playerId);
      if (!run || run.status !== 'ready') {
        socket.emit('match:error', { message: 'Seu deck de Arena ainda não está pronto.' });
        return;
      }
      entry = { socket, playerId, arenaRunId };
    } else {
      const validation = validateDeckForMatch(playerId, deckId, type);
      if (!validation.ok) {
        socket.emit('match:error', { message: validation.message });
        return;
      }
      entry = { socket, playerId, deckId };
    }

    matchQueues[type].push(entry);
    queuedPlayers.set(playerId, type);
    socket.emit('match:queued', { matchType: type });
    tryPairQueue(type);

    // Normal e Arena (draft) ganham substituto de bot — a Arena ranqueada fica só entre jogadores
    // reais (ver BOT_QUEUE_FALLBACK_MS/ARENA_DRAFT_BOT_FALLBACK_MS). Confere se ainda está na fila
    // DEPOIS do tryPairQueue: pode já ter sido pareado com um humano na mesma tick.
    if (type === 'normal' && queuedPlayers.get(playerId) === 'normal') {
      entry.botFallbackTimer = setTimeout(() => startBotFallbackMatch(entry), BOT_QUEUE_FALLBACK_MS);
    } else if (type === 'arenaDraft' && queuedPlayers.get(playerId) === 'arenaDraft') {
      entry.botFallbackTimer = setTimeout(() => startArenaDraftBotFallbackMatch(entry), ARENA_DRAFT_BOT_FALLBACK_MS);
    }
  });

  socket.on('match:cancelFindMatch', () => {
    removeFromQueue(playerId);
  });

  // ---------- Partida online: Jokenpô + mulligan (setup, antes do TurnManager existir) ----------

  // 1. Cada lado manda sua escolha; só resolve quando os 2 já escolheram (sem bot pra decidir sozinho).
  socket.on('match:rpsChoice', ({ choice }) => {
    const session = getSessionBySocket(socket);
    if (!session) return;
    applyRpsChoice(session, getSideBySocket(session, socket), choice);
  });

  // 2. Só quem ganhou o Jokenpô decide a ordem — cria o TurnManager e manda o prompt de mulligan pros 2.
  socket.on('match:chooseOrder', ({ goFirst }) => {
    const session = getSessionBySocket(socket);
    if (!session) return;
    applyChooseOrder(session, getSideBySocket(session, socket), goFirst);
  });

  // 3. Mulligan dos 2 lados (cada um decide o próprio) — só inicia o 1º turno quando ambos decidirem.
  socket.on('match:mulliganDecision', ({ keep }) => {
    const session = getSessionBySocket(socket);
    if (!session) return;
    applyMulliganDecision(session, getSideBySocket(session, socket), keep);
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
      // `card` já vem hidratado com o typepal correto (com fallback por nome pra variantes de
      // arte, ver getCardsByNumbers) — não precisa reconsultar o banco pelo card_number exato.
      for (const type of card.typepal || []) {
        incrementMission(sidePlayerId, 'play_pal_type', type, 1);
      }
      const effTag = effectTagOf(card.effect_text);
      if (effTag) incrementMission(sidePlayerId, 'play_effect_tag', effTag, 1);
      tm.runDeployFollowups(self, opponent, result.instance, false);
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
      const effTag = effectTagOf(card.effect_text);
      if (effTag) incrementMission(sidePlayerId, 'play_effect_tag', effTag, 1);
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
      const gearEffTag = effectTagOf(card.effect_text);
      if (gearEffTag) incrementMission(sidePlayerId, 'play_effect_tag', gearEffTag, 1);
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
    const eventEffTag = effectTagOf(card.effect_text);
    if (eventEffTag) incrementMission(sidePlayerId, 'play_effect_tag', eventEffTag, 1);
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

  socket.on('match:resolveEffectTarget', ({ owner, index, skip, zone }) => {
    const ctx = matchContext(socket);
    if (!ctx) return;
    const { session, tm, self } = ctx;
    if (tm.gameOver || !tm.pendingEffect || tm.pendingEffect.casterState !== self) return;
    // owner chega relativo a quem está vendo ('player'=eu/'bot'=oponente) — converte pro absoluto
    // (player1/player2) que o EffectEngine espera, antes de mandar pro continuePendingEffect.
    const selfIsPlayer1 = self === tm.player1;
    const absoluteOwner = selfIsPlayer1 ? owner : (owner === 'player' ? 'bot' : 'player');
    if (!skip) {
      // zone diferencia alvo em Structure/Gear de alvo em Pal (ex: Lily's Strategy) — default
      // 'basePals' cobre o formato antigo (cliente que nem manda zone == alvo sempre era Pal).
      const valid = (tm.pendingEffect.validTargets || []).some(t => t.owner === absoluteOwner && t.index === index && (t.zone || 'basePals') === (zone || 'basePals'));
      if (!valid) return;
    } else if (!tm.pendingEffect.optional) {
      return;
    }
    EffectEngine.continuePendingEffect(tm, { owner: absoluteOwner, index, skip, zone });
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
  let roguelikeResultApplied = false;

  function checkWinMission() {
    if (match && match.turnManager.gameOver && match.turnManager.winner === match.playerState && !winCounted) {
      incrementMission(playerId, 'win_games', null, 1);
      winCounted = true;
    }
  }

  // Aplica o resultado da batalha na run do Modo Expedição (vidas, recompensa, fim de run) 1x só
  // por partida — equivalente ao checkWinMission acima, mas só dispara quando a partida nasceu de
  // um roguelikeRunId (ver bot:start). Bot de batalha comum (deckId) nunca tem essa propriedade.
  function checkRoguelikeBattleResult() {
    if (!match || !match.roguelikeRunId || roguelikeResultApplied || !match.turnManager.gameOver) return;
    applyRoguelikeBattleResult(match.roguelikeRunId, match.turnManager.winner === match.playerState);
    roguelikeResultApplied = true;
  }

  function emitState() {
    if (!match) return;
    checkWinMission();
    checkRoguelikeBattleResult();
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
      log: turnManager.log.slice(-MATCH_LOG_TAIL),
      logTotal: turnManager.log.length,
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
        // Sem isso, o jogador via só "X está atacando!" sem saber SE é a própria cara dele, um
        // Pal ou uma Structure — o prompt de bloqueio/Quick Step precisa dizer o alvo de verdade.
        targetType: battle.target.type,
        targetName: battle.target.type === 'player' ? null : battle.target.instance.data.name,
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

  // 1. Cliente pede pra iniciar partida contra bot, passando o id do deck escolhido — OU o id de
  // uma run do Modo Expedição em vez de deckId (batalha/chefe de um nó do mapa, ver
  // /api/roguelike/enter-node). Nunca toca `decks`: o deck vem do main_deck da própria run.
  socket.on('bot:start', ({ deckId, roguelikeRunId }) => {
    // Já existe uma partida em andamento nesse socket (RPS/mulligan em aberto ou jogo já rolando)
    // — nunca reinicia do zero num 2º bot:start. Sem essa trava, qualquer caminho que remonte
    // GameBoard.jsx no meio de uma partida (ex: o jogador aperta "voltar" do navegador durante uma
    // luta do Modo Expedição, cai de volta em /roguelike, que reemite `navigate('/game', ...)`
    // sozinho porque a run continua 'in_battle', remontando GameBoard e reemitindo bot:start)
    // apagava silenciosamente a partida real e começava outra do zero — parecia "o duelo reinicia
    // sozinho". Se o jogo já começou, só resincroniza o estado atual; se ainda está no
    // RPS/mulligan, ignora (o cliente já tem o prompt certo na tela).
    if (match && (!match.turnManager || !match.turnManager.gameOver)) {
      if (match.turnManager) emitState();
      return;
    }

    if (roguelikeRunId) {
      const run = db.prepare('SELECT * FROM roguelike_runs WHERE id = ? AND player_id = ?').get(roguelikeRunId, playerId);
      if (!run || run.status !== 'in_battle') {
        socket.emit('bot:error', { message: 'Essa expedição não está pronta pra uma batalha agora.' });
        return;
      }
      const map = JSON.parse(run.map);
      const node = map.nodes[run.current_node_id];
      const tier = roguelikeBattle.getDepthTier(node, map.commonLayerCount);
      const mainDeckNumbers = JSON.parse(run.main_deck);
      const modifiers = JSON.parse(run.card_modifiers);
      const allCards = getAllCardsHydrated();

      const mainCards = shuffle(roguelikeBattle.applyCardModifiers(getCardsByNumbers(mainDeckNumbers), modifiers));
      const soulCards = shuffle(getCardsByNumbers(ARENA_SOUL_DECK));

      const botColors = roguelikeBattle.pickBotColors(tier);
      const botDeckNumbers = roguelikeBattle.generateBotDeck(allCards, { size: mainDeckNumbers.length, tier, colors: botColors });
      const botMainCards = shuffle(getCardsByNumbers(botDeckNumbers));
      const botSoulCards = shuffle(getCardsByNumbers(ARENA_SOUL_DECK));

      const playerState = new PlayerState('Você', mainCards, soulCards);
      // Nome genérico igual à partida direta normal — o bot de batalha da Expedição não tem
      // identidade de conta nenhuma (não conta pro online, não é um dos 3 bots permanentes).
      const botState = new PlayerState('Bot', botMainCards, botSoulCards);

      match = { playerState, botState, turnManager: null, botPlayerId: null, botSkill: tier.skill, roguelikeRunId: run.id };
      winCounted = false;
      roguelikeResultApplied = false;

      socket.emit('bot:rpsPrompt', { message: 'Jokenpô! Escolha pedra, papel ou tesoura.' });
      return;
    }

    // Mesma checagem de dono/preset usada no matchmaking online — sem isso, qualquer jogador
    // logado conseguia iniciar uma partida vs Bot com o ID de deck de OUTRO jogador (e ver o
    // conteúdo dele na mão/tabuleiro). Partida vs Bot é sempre 'normal' pra fins de validação.
    const validation = validateDeckForMatch(playerId, deckId, 'normal');
    if (!validation.ok) {
      socket.emit('bot:error', { message: validation.message });
      return;
    }
    const bot = pickVsBotOpponent();
    if (!bot) {
      socket.emit('bot:error', { message: 'Nenhum bot disponível pra jogar agora. Tente de novo em instantes.' });
      return;
    }
    const deckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId);
    const botDeckRow = db.prepare('SELECT * FROM decks WHERE id = ?').get(bot.deckId);

    const mainCards = shuffle(getCardsByNumbers(JSON.parse(deckRow.main_deck)));
    const soulCards = shuffle(getCardsByNumbers(JSON.parse(deckRow.soul_deck)));
    // Cada bot joga com O PRÓPRIO deck (sorteado entre os 3 permanentes) — não é mais espelho do
    // deck do jogador.
    const botMainCards = shuffle(getCardsByNumbers(JSON.parse(botDeckRow.main_deck)));
    const botSoulCards = shuffle(getCardsByNumbers(JSON.parse(botDeckRow.soul_deck)));

    const playerState = new PlayerState('Você', mainCards, soulCards);
    // Nome exibido genérico de propósito: na partida direta vs Bot (diferente da fila Normal
    // online, onde o bot substitui um humano de forma invisível), o jogador já sabe que está
    // contra a IA — mas o nick real (dudu07/kaiozin/bibs22) não deve aparecer aqui, só nos Ranks.
    const botState = new PlayerState('Bot', botMainCards, botSoulCards);

    // Sempre 'easy' aqui, de propósito — esse modo é onde o jogador aprende/pratica, então o bot
    // fica no nível mais fácil independente de qual dos 3 permanentes foi sorteado (o nick real
    // ainda varia, mas a habilidade não). O substituto de fila (Normal/Arena) já usa bot.skill.
    match = { playerState, botState, turnManager: null, botPlayerId: bot.playerId, botSkill: 'easy' };
    winCounted = false;
    roguelikeResultApplied = false;

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
  //    Se o bot ganhar, ele decide sozinho (BotBrain.decideGoFirst — sempre escolhe ir primeiro)
  socket.on('bot:chooseOrder', ({ goFirst }) => {
    if (!match) return;

    const playerGoesFirst = match.playerWonRPS ? goFirst : !BotBrain.decideGoFirst();

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

    if (!BotBrain.decideMulligan(match.botState.hand)) {
      match.botState.mulligan();
    }

    match.turnManager.beginFirstTurn();
    emitState();

    // Se o bot começa, ele já joga o turno dele automaticamente
    maybeRunBotTurn();
  });

  // Delegação fina pro cérebro compartilhado (BotBrain) — a decisão de o que jogar/atacar/ativar
  // vive lá (mesmo módulo usado pelo substituto de fila online), aqui só a fiação específica desse
  // socket (playerState/botState do fechamento, emitState, e o critério de "ainda vale a pena agir").
  async function runBotTurnWithDelays() {
    await BotBrain.playTurn({
      tm: match.turnManager,
      self: match.botState,
      opponent: match.playerState,
      emit: emitState,
      isAlive: () => !!match && !match.turnManager.gameOver && socket.connected,
      delay,
      timing: BotBrain.VS_PLAYER_TIMING,
      skill: match.botSkill
    });
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
      // `card` já vem hidratado com o typepal correto (com fallback por nome pra variantes de
      // arte, ver getCardsByNumbers) — não precisa reconsultar o banco pelo card_number exato.
      for (const type of card.typepal || []) {
        incrementMission(playerId, 'play_pal_type', type, 1);
      }
      const effTag = effectTagOf(card.effect_text);
      if (effTag) incrementMission(playerId, 'play_effect_tag', effTag, 1);
      match.turnManager.runDeployFollowups(match.playerState, match.botState, result.instance, false);
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
      const effTag = effectTagOf(card.effect_text);
      if (effTag) incrementMission(playerId, 'play_effect_tag', effTag, 1);
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
      const gearEffTag = effectTagOf(card.effect_text);
      if (gearEffTag) incrementMission(playerId, 'play_effect_tag', gearEffTag, 1);
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
    const eventEffTag = effectTagOf(card.effect_text);
    if (eventEffTag) incrementMission(playerId, 'play_effect_tag', eventEffTag, 1);
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
  socket.on('bot:resolveEffectTarget', ({ owner, index, skip, zone }) => {
    if (!match || match.turnManager.gameOver || !match.turnManager.pendingEffect) return;
    // Sem essa checagem, uma vez que o bot pudesse abrir um pendingEffect (Events modais, ACT com
    // custo de escolha), o cliente conseguia resolver as escolhas do BOT por esse handler — o
    // gêmeo match:* já tinha essa guarda (casterState !== self), aqui faltava.
    if (match.turnManager.pendingEffect.casterState !== match.playerState) return;
    if (!skip) {
      // zone diferencia alvo em Structure/Gear de alvo em Pal (ex: Lily's Strategy) — default
      // 'basePals' cobre o formato antigo (cliente que nem manda zone == alvo sempre era Pal).
      const valid = match.turnManager.pendingEffect.validTargets.some(t => t.owner === owner && t.index === index && (t.zone || 'basePals') === (zone || 'basePals'));
      if (!valid) return;
    } else if (!match.turnManager.pendingEffect.optional) {
      return;
    }
    EffectEngine.continuePendingEffect(match.turnManager, { owner, index, skip, zone });
    emitState();
    maybeRunBotTurn(); // resolver essa escolha pode ter sido o que faltava pra "AUTO At the end of your
    // turn" (ex: Shadowbeak) terminar e só ENTÃO passar a vez — se foi isso, o bot precisa começar a agir.
  });

  // 6f1b. Jogador escolhe uma carta revelada/olhada (topo do deck, cemitério ou mão) ou pula
  socket.on('bot:resolveCardChoice', ({ index, skip }) => {
    if (!match || match.turnManager.gameOver || !match.turnManager.pendingEffect) return;
    if (match.turnManager.pendingEffect.casterState !== match.playerState) return;
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
    if (match.turnManager.pendingEffect.casterState !== match.playerState) return;
    EffectEngine.continuePendingEffect(match.turnManager, { amount });
    emitState();
    maybeRunBotTurn(); // mesmo motivo do resolveEffectTarget acima.
  });

  // 6f3. Jogador escolhe uma das opções de um efeito modal ("Choose 1 of the following")
  socket.on('bot:resolveModalChoice', ({ optionIndex }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingEffect || match.turnManager.pendingEffect.kind !== 'modal') return;
    if (match.turnManager.pendingEffect.casterState !== match.playerState) return;
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
    lobbyChatLastSent.delete(playerId);
    cancelChallengesFor(playerId);
    // Só remove se ainda for O socket atual desse player — evita que uma desconexão da aba antiga
    // apague por engano a entrada de uma reconexão mais nova (2ª aba) que já sobrescreveu a 1ª.
    if (connectedSockets.get(playerId) === socket) connectedSockets.delete(playerId);

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

      // Mesma regra pra Arena (draft): só conta como partida jogada se o jogo já tinha começado.
      // Quem ficou ganha por W.O.; atualiza a run de quem tiver arenaRunId (o bot substituto nunca
      // tem — o deck dele é temporário, sem run nenhuma pra atualizar).
      if (session.matchType === 'arenaDraft' && session.turnManager && !session.arenaDraftRunApplied) {
        for (const s of ['A', 'B']) {
          const arenaRunId = session.sides[s].arenaRunId;
          if (arenaRunId) applyArenaDraftMatchResult(arenaRunId, s === remainingSide);
        }
        session.arenaDraftRunApplied = true;
      }

      session.sides[remainingSide].socket.emit('match:opponentLeft', {
        message: 'Seu oponente desconectou. Você venceu por W.O.',
        arenaPointsChange
      });
      socketRoomMap.delete(session.sides.A.socket.id);
      socketRoomMap.delete(session.sides.B.socket.id);
      onlineSessions.delete(session.roomId);
      // Humano abandonou uma partida com substituto de bot — libera o bot pra próxima fila. Sem
      // isso ele ficaria "preso" em botsInMatch pra sempre (o gameOver que dispara a liberação
      // normal, em checkOnlineWinMissions, nunca roda pra uma sessão que morreu por desconexão).
      releaseBotFromMatch(session);
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