const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const Database = require('better-sqlite3');
const { PlayerState, shuffle } = require('./game/PlayerState');
const { TurnManager } = require('./game/TurnManager');
const { resolveRPS, randomChoice } = require('./game/RockPaperScissors');
const EffectEngine = require('./game/effects/EffectEngine');

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, 'palworld.db'));

// Serve as imagens das cartas como arquivos estáticos
// http://localhost:3001/cardart/BP01-001.png
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
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

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
    image_url: `http://localhost:3001/${row.image_path}`
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
    image_url: `http://localhost:3001/${row.image_path}`
  });
});

// Salva um novo deck
app.post('/api/decks', (req, res) => {
  const { name, mainDeckCardNumbers, soulDeckCardNumbers, colors, mode } = req.body;

  if (!name || !mainDeckCardNumbers || !soulDeckCardNumbers) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const deckMode = mode === 'rank' ? 'rank' : 'normal';

  if (deckMode === 'rank') {
    const counts = {};
    for (const num of mainDeckCardNumbers) counts[num] = (counts[num] || 0) + 1;
    for (const [num, needed] of Object.entries(counts)) {
      if (getAvailableQuantity(num) < needed) {
        return res.status(400).json({ error: `Deck Rank inválido: você não tem ${needed} cópia(s) disponível(is) de ${num}.` });
      }
    }
  }

  const stmt = db.prepare(`
    INSERT INTO decks (name, main_deck, soul_deck, colors, mode)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    JSON.stringify(mainDeckCardNumbers),
    JSON.stringify(soulDeckCardNumbers),
    JSON.stringify(colors || []),
    deckMode
  );

  res.json({ id: result.lastInsertRowid, message: 'Deck salvo com sucesso.' });
});

// Lista todos os decks salvos (resumo, com os 2 primeiros Lucky Pals pra exibição)
app.get('/api/decks', (req, res) => {
  const rows = db.prepare('SELECT id, name, colors, main_deck, created_at, mode FROM decks ORDER BY created_at DESC').all();
  const getCard = db.prepare('SELECT * FROM cards WHERE card_number = ?');

  const decks = rows.map(r => {
    const mainNumbers = JSON.parse(r.main_deck);
    const uniqueCards = [...new Map(mainNumbers.map(num => [num, getCard.get(num)])).values()];

    const luckyPals = uniqueCards
      .filter(c => c && c.is_lucky && c.card_type === 'Pal')
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 2)
      .map(c => ({ name: c.name, image_url: `http://localhost:3001/${c.image_path}` }));

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
      image_url: `http://localhost:3001/${c.image_path}`
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

// ---------- ECONOMIA: moedas, coleção do jogador, loja de boosters ----------

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY,
    gold_coins INTEGER NOT NULL DEFAULT 500,
    pal_fluid INTEGER NOT NULL DEFAULT 0
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS player_cards (
    card_number TEXT PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 0
  )
`);
// Cria o jogador único (id=1) se ainda não existir — sem sistema de login por enquanto
if (!db.prepare('SELECT id FROM players WHERE id = 1').get()) {
  db.prepare('INSERT INTO players (id, gold_coins, pal_fluid) VALUES (1, 500, 0)').run();
}
// Cópias "reservadas" (ocupadas em Breeding/Farming/Forno) — contam pra posse (limite de 4 e Fluido
// de Pal ao exceder), mas ficam indisponíveis pra outra tarefa até serem liberadas de volta.
try { db.exec('ALTER TABLE player_cards ADD COLUMN reserved INTEGER NOT NULL DEFAULT 0'); } catch (e) {}

function getAvailableQuantity(cardNumber) {
  const row = db.prepare('SELECT quantity, reserved FROM player_cards WHERE card_number = ?').get(cardNumber);
  if (!row) return 0;
  return row.quantity - row.reserved;
}

// Agrupa números repetidos (ex.: os 2 pais do Breeding sendo a mesma carta) antes de checar/reservar
function groupCounts(cardNumbers) {
  const counts = {};
  for (const num of cardNumbers) counts[num] = (counts[num] || 0) + 1;
  return counts;
}

function hasEnoughAvailable(cardNumbers) {
  return Object.entries(groupCounts(cardNumbers)).every(([num, needed]) => getAvailableQuantity(num) >= needed);
}

function reserveCards(cardNumbers) {
  for (const [num, count] of Object.entries(groupCounts(cardNumbers))) {
    db.prepare('UPDATE player_cards SET reserved = reserved + ? WHERE card_number = ?').run(count, num);
  }
}

function releaseCards(cardNumbers) {
  for (const [num, count] of Object.entries(groupCounts(cardNumbers))) {
    db.prepare('UPDATE player_cards SET reserved = MAX(0, reserved - ?) WHERE card_number = ?').run(count, num);
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

// ---------- FARMING ----------
// Requisitos de work_keywords: "Farming" cobre plantar+regar, "Collecting" cobre colheita.
// "Transporting" é quem permite ligar o Repetir (colhe e reinicia sozinho).

db.exec(`
  CREATE TABLE IF NOT EXISTS farming_slot (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pal_card_numbers TEXT,
    start_time TEXT,
    ready_time TEXT,
    duration_ms INTEGER,
    repeat_on INTEGER DEFAULT 0,
    harvest_count INTEGER DEFAULT 0
  )
`);

function getActiveFarmingSlot() {
  return db.prepare('SELECT * FROM farming_slot WHERE id = 1').get();
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

app.post('/api/farming/start', (req, res) => {
  if (getActiveFarmingSlot()) return res.status(400).json({ error: 'Já existe um Farming em andamento.' });

  const { cardNumbers, repeat } = req.body;
  if (!Array.isArray(cardNumbers) || cardNumbers.length < 1 || cardNumbers.length > 3) {
    return res.status(400).json({ error: 'Escolha de 1 a 3 Pals.' });
  }

  const cards = cardNumbers.map(num => db.prepare("SELECT * FROM cards WHERE card_number = ? AND card_type = 'Pal'").get(num));
  if (cards.some(c => !c)) return res.status(400).json({ error: 'Carta inválida.' });

  if (!hasEnoughAvailable(cardNumbers)) {
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
    INSERT INTO farming_slot (id, pal_card_numbers, start_time, ready_time, duration_ms, repeat_on, harvest_count)
    VALUES (1, ?, ?, ?, ?, ?, 0)
  `).run(JSON.stringify(cardNumbers), startTime.toISOString(), readyTime.toISOString(), durationMs, repeat ? 1 : 0);

  reserveCards(cardNumbers);

  res.json({ readyTime: readyTime.toISOString() });
});

function harvestIngredients() {
  db.prepare('UPDATE players SET wheat = wheat + 5, lettuce = lettuce + 5, tomato = tomato + 5 WHERE id = 1').run();
}

app.get('/api/farming/status', (req, res) => {
  let slot = getActiveFarmingSlot();
  if (!slot) return res.json({ active: false });

  let isReady = new Date() >= new Date(slot.ready_time);

  // Repetir ligado: colhe e reinicia sozinho, sem precisar de clique
  while (isReady && slot.repeat_on) {
    harvestIngredients();
    const newStart = new Date(slot.ready_time);
    const newReady = new Date(newStart.getTime() + slot.duration_ms);
    db.prepare('UPDATE farming_slot SET start_time = ?, ready_time = ?, harvest_count = harvest_count + 1 WHERE id = 1')
      .run(newStart.toISOString(), newReady.toISOString());
    slot = getActiveFarmingSlot();
    isReady = new Date() >= new Date(slot.ready_time);
  }

  const cardsInfo = JSON.parse(slot.pal_card_numbers).map(num => {
    const c = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(num);
    return { ...c, colors: JSON.parse(c.colors), image_url: `http://localhost:3001/${c.image_path}` };
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

app.post('/api/farming/claim', (req, res) => {
  const slot = getActiveFarmingSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Farming em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });

  harvestIngredients();
  releaseCards(JSON.parse(slot.pal_card_numbers));
  db.prepare('DELETE FROM farming_slot WHERE id = 1').run(); // sem repetir, encerra e libera o slot

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  res.json({ wheat: player.wheat, lettuce: player.lettuce, tomato: player.tomato });
});

app.post('/api/farming/stop-repeat', (req, res) => {
  const slot = getActiveFarmingSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Farming em andamento.' });
  db.prepare('UPDATE farming_slot SET repeat_on = 0 WHERE id = 1').run();
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
    id INTEGER PRIMARY KEY CHECK (id = 1),
    type TEXT,
    kindling_card_number TEXT,
    start_time TEXT,
    ready_time TEXT
  )
`);

function getActiveOvenSlot() {
  return db.prepare('SELECT * FROM oven_slot WHERE id = 1').get();
}

app.post('/api/farming/bake', (req, res) => {
  if (getActiveOvenSlot()) return res.status(400).json({ error: 'Já existe algo assando no forno.' });

  const { type, kindlingCardNumber } = req.body;
  const recipe = OVEN_RECIPES[type];
  if (!recipe) return res.status(400).json({ error: 'Receita inválida.' });

  if (!kindlingCardNumber) return res.status(400).json({ error: 'Escolha um Pal com Kindling pra acender o forno.' });
  if (getAvailableQuantity(kindlingCardNumber) < 1) return res.status(400).json({ error: 'Você não tem esse Pal disponível (ele pode estar ocupado em outra tarefa).' });
  const kindlingCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(kindlingCardNumber);
  const keywords = getPalWorkKeywords(kindlingCardNumber);
  if (!keywords.includes('kindling')) return res.status(400).json({ error: 'Esse Pal não tem "Kindling".' });

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  if (player.wheat < recipe.amount || player.lettuce < recipe.amount || player.tomato < recipe.amount) {
    return res.status(400).json({ error: `Precisa de ${recipe.amount} de cada ingrediente.` });
  }

  db.prepare(`
    UPDATE players SET wheat = wheat - ?, lettuce = lettuce - ?, tomato = tomato - ?
    WHERE id = 1
  `).run(recipe.amount, recipe.amount, recipe.amount);

  const reductionMinutes = computeBakeReductionMinutes(kindlingCard?.cost ?? 0);
  const durationMs = Math.max(0, (OVEN_BASE_MINUTES - reductionMinutes) * 60 * 1000);
  const startTime = new Date();
  const readyTime = new Date(startTime.getTime() + durationMs);

  db.prepare(`
    INSERT INTO oven_slot (id, type, kindling_card_number, start_time, ready_time)
    VALUES (1, ?, ?, ?, ?)
  `).run(type, kindlingCardNumber, startTime.toISOString(), readyTime.toISOString());

  reserveCards([kindlingCardNumber]);

  res.json({ ...db.prepare('SELECT * FROM players WHERE id = 1').get(), readyTime: readyTime.toISOString() });
});

app.get('/api/farming/oven-status', (req, res) => {
  const slot = getActiveOvenSlot();
  if (!slot) return res.json({ active: false });

  const kindlingCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.kindling_card_number);

  res.json({
    active: true,
    type: slot.type,
    kindlingPal: kindlingCard ? { ...kindlingCard, colors: JSON.parse(kindlingCard.colors), image_url: `http://localhost:3001/${kindlingCard.image_path}` } : null,
    startTime: slot.start_time,
    readyTime: slot.ready_time,
    isReady: new Date() >= new Date(slot.ready_time)
  });
});

app.post('/api/farming/oven-claim', (req, res) => {
  const slot = getActiveOvenSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Forno em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });

  const recipe = OVEN_RECIPES[slot.type];
  db.prepare(`UPDATE players SET ${recipe.column} = ${recipe.column} + 1 WHERE id = 1`).run();
  releaseCards([slot.kindling_card_number]);
  db.prepare('DELETE FROM oven_slot WHERE id = 1').run();

  res.json(db.prepare('SELECT * FROM players WHERE id = 1').get());
});

const ITEM_PRICES = { cake: 15, special_cake: 30 }; // preço em Fluido de Pal

app.post('/api/shop/buy-item', (req, res) => {
  const { item } = req.body;
  if (!ITEM_PRICES[item]) return res.status(400).json({ error: 'Item inválido.' });

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  const price = ITEM_PRICES[item];
  if (player.pal_fluid < price) return res.status(400).json({ error: 'Fluido de Pal insuficiente.' });

  const column = item === 'cake' ? 'cake_count' : 'special_cake_count';
  db.prepare(`UPDATE players SET pal_fluid = pal_fluid - ?, ${column} = ${column} + 1 WHERE id = 1`).run(price);

  res.json(db.prepare('SELECT * FROM players WHERE id = 1').get());
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

app.get('/api/player', (req, res) => {
  res.json(db.prepare('SELECT * FROM players WHERE id = 1').get());
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

// Chance de "upgrade" pra uma variante Altered Art mais rara, se ela existir pra esse Pal
// (aplicado tanto no Breeding quanto nos boosters)
function maybeUpgradeToVariant(baseCard) {
  const osrCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(`${baseCard.card_number}-OSR`);
  if (osrCard && Math.random() < 0.05) return osrCard; // 5% de chance

  const sspCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(`${baseCard.card_number}-SSP`);
  if (sspCard && Math.random() < 0.02) return sspCard; // 2% de chance

  return baseCard;
}

// Carrega a tabela real de breeding (extraída dos arquivos do jogo via PalCalc/paldex, MIT license)
const breedingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'real_breeding_table.json'), 'utf-8'));

db.exec(`
  CREATE TABLE IF NOT EXISTS breeding_slot (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    parent1 TEXT,
    parent2 TEXT,
    start_time TEXT,
    ready_time TEXT,
    result_card_number TEXT,
    claimed INTEGER DEFAULT 0
  )
`);

function getActiveBreedingSlot() {
  return db.prepare('SELECT * FROM breeding_slot WHERE id = 1').get();
}

function closestByBreedingPower(targetRank) {
  const allPals = db.prepare("SELECT * FROM cards WHERE card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").all();
  let best = null;
  let bestDiff = Infinity;
  for (const pal of allPals) {
    const rank = breedingData.breeding_power[pal.pal_name];
    if (rank == null) continue;
    const diff = Math.abs(rank - targetRank);
    if (diff < bestDiff) { best = pal; bestDiff = diff; }
  }
  return best;
}

function computeBreedingResult(parent1Card, parent2Card) {
  const n1 = parent1Card.pal_name;
  const n2 = parent2Card.pal_name;
  const key = [n1, n2].sort().join('|');

  let baseResult;
  const realResultName = breedingData.combo_lookup[key];

  if (realResultName) {
    const cardMatch = db.prepare("SELECT * FROM cards WHERE pal_name = ? AND card_type = 'Pal' AND card_number NOT LIKE '%-%-%'").get(realResultName);
    if (cardMatch) {
      baseResult = cardMatch;
    } else {
      const targetRank = breedingData.all_breeding_power[realResultName];
      baseResult = targetRank != null ? closestByBreedingPower(targetRank) : null;
    }
  }

  if (!baseResult) {
    const rank1 = breedingData.breeding_power[n1];
    const rank2 = breedingData.breeding_power[n2];
    baseResult = closestByBreedingPower((rank1 + rank2) / 2);
  }

  return maybeUpgradeToVariant(baseResult);
}

app.post('/api/breeding/start', (req, res) => {
  const { parent1CardNumber, parent2CardNumber } = req.body;

  if (getActiveBreedingSlot()) {
    return res.status(400).json({ error: 'Já existe um Breeding em andamento.' });
  }

  if (!hasEnoughAvailable([parent1CardNumber, parent2CardNumber])) {
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
    INSERT INTO breeding_slot (id, parent1, parent2, start_time, ready_time, result_card_number, claimed)
    VALUES (1, ?, ?, ?, ?, ?, 0)
  `).run(parent1CardNumber, parent2CardNumber, startTime.toISOString(), readyTime.toISOString(), result.card_number);

  reserveCards([parent1CardNumber, parent2CardNumber]);

  res.json({ readyTime: readyTime.toISOString() });
});

app.post('/api/breeding/cancel', (req, res) => {
  const slot = getActiveBreedingSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });

  releaseCards([slot.parent1, slot.parent2]);
  db.prepare('DELETE FROM breeding_slot WHERE id = 1').run();
  res.json({ cancelled: true });
});

app.post('/api/breeding/use-cake', (req, res) => {
  const { type } = req.body; // 'cake' ou 'special_cake'
  const slot = getActiveBreedingSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });
  if (new Date() >= new Date(slot.ready_time)) return res.status(400).json({ error: 'Esse Breeding já está pronto.' });

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  const column = type === 'special_cake' ? 'special_cake_count' : 'cake_count';
  const reduceMinutes = type === 'special_cake' ? 60 : 10;

  if (!player[column] || player[column] <= 0) {
    return res.status(400).json({ error: 'Você não tem esse item.' });
  }

  db.prepare(`UPDATE players SET ${column} = ${column} - 1 WHERE id = 1`).run();

  let newReady = new Date(slot.ready_time).getTime() - reduceMinutes * 60 * 1000;
  const now = Date.now();
  if (newReady < now) newReady = now; // não deixa "voltar no tempo" além do presente

  db.prepare('UPDATE breeding_slot SET ready_time = ? WHERE id = 1').run(new Date(newReady).toISOString());

  res.json({ newReadyTime: new Date(newReady).toISOString(), cakeCount: player[column] - 1 });
});

app.get('/api/breeding/status', (req, res) => {
  const slot = getActiveBreedingSlot();
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
      is_lucky: !!resultCard.is_lucky, image_url: `http://localhost:3001/${resultCard.image_path}`
    } : null
  });
});

app.post('/api/breeding/claim', (req, res) => {
  const slot = getActiveBreedingSlot();
  if (!slot) return res.status(400).json({ error: 'Nenhum Breeding em andamento.' });
  if (new Date() < new Date(slot.ready_time)) return res.status(400).json({ error: 'Ainda não está pronto.' });
  if (slot.claimed) return res.status(400).json({ error: 'Já coletado.' });

  const resultCard = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(slot.result_card_number);
  const current = db.prepare('SELECT quantity FROM player_cards WHERE card_number = ?').get(slot.result_card_number)?.quantity || 0;

  let fluidGained = 0;
  if (current >= 4) {
    fluidGained = RARITY_FLUID[resultCard.rarity] || 5;
  } else {
    db.prepare(`
      INSERT INTO player_cards (card_number, quantity) VALUES (?, ?)
      ON CONFLICT(card_number) DO UPDATE SET quantity = excluded.quantity
    `).run(slot.result_card_number, current + 1);
  }

  if (fluidGained > 0) {
    const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
    db.prepare('UPDATE players SET pal_fluid = ? WHERE id = 1').run(player.pal_fluid + fluidGained);
  }

  releaseCards([slot.parent1, slot.parent2]);
  db.prepare('DELETE FROM breeding_slot WHERE id = 1').run(); // libera o slot pro próximo Breeding

  res.json({
    card: {
      ...resultCard, colors: JSON.parse(resultCard.colors), keywords: JSON.parse(resultCard.keywords),
      is_lucky: !!resultCard.is_lucky, image_url: `http://localhost:3001/${resultCard.image_path}`
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
    mission_id INTEGER NOT NULL,
    progress_date TEXT NOT NULL,
    current_value INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (mission_id, progress_date)
  )
`);

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
function incrementMission(type, filterValue, amount) {
  const today = todayString();
  const matching = db.prepare('SELECT * FROM missions WHERE type = ? AND (target_filter IS NULL OR target_filter = ?)').all(type, filterValue);

  const getProgress = db.prepare('SELECT * FROM player_mission_progress WHERE mission_id = ? AND progress_date = ?');
  const upsert = db.prepare(`
    INSERT INTO player_mission_progress (mission_id, progress_date, current_value, completed)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(mission_id, progress_date) DO UPDATE SET current_value = excluded.current_value, completed = excluded.completed
  `);

  for (const mission of matching) {
    const existing = getProgress.get(mission.id, today);
    const current = existing ? existing.current_value : 0;
    if (existing && existing.completed) continue; // já bateu a meta, não precisa somar mais
    const newValue = Math.min(current + amount, mission.target_value);
    const completed = newValue >= mission.target_value ? 1 : 0;
    upsert.run(mission.id, today, newValue, completed);
  }
}

// Lista as missões de hoje com progresso do jogador
app.get('/api/missions/today', (req, res) => {
  seedMissions(); // recalcula sozinho se o dia virou desde a última checagem
  const today = todayString();
  const missions = db.prepare('SELECT * FROM missions').all();
  const getProgress = db.prepare('SELECT * FROM player_mission_progress WHERE mission_id = ? AND progress_date = ?');

  const result = missions.map(m => {
    const progress = getProgress.get(m.id, today);
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
app.post('/api/missions/claim', (req, res) => {
  const { missionId } = req.body;
  const today = todayString();

  const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(missionId);
  const progress = db.prepare('SELECT * FROM player_mission_progress WHERE mission_id = ? AND progress_date = ?').get(missionId, today);

  if (!mission || !progress || !progress.completed) {
    return res.status(400).json({ error: 'Missão ainda não completada.' });
  }
  if (progress.claimed) {
    return res.status(400).json({ error: 'Recompensa já resgatada.' });
  }

  db.prepare('UPDATE player_mission_progress SET claimed = 1 WHERE mission_id = ? AND progress_date = ?').run(missionId, today);

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  const newGold = player.gold_coins + mission.reward_gold;
  const newFluid = player.pal_fluid + mission.reward_fluid;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = 1').run(newGold, newFluid);

  res.json({ goldCoins: newGold, palFluid: newFluid });
});

// Compra um Trial Deck (500 moedas, compra única por set, dá 4 cópias de cada carta do set)
app.post('/api/shop/buy-trial-deck', (req, res) => {
  const { setCode } = req.body; // 'TD01' ou 'TD02'
  if (!['TD01', 'TD02'].includes(setCode)) {
    return res.status(400).json({ error: 'Trial deck inválido.' });
  }

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  const boughtField = setCode === 'TD01' ? 'bought_td01' : 'bought_td02';

  if (player[boughtField]) {
    return res.status(400).json({ error: 'Você já comprou este Trial Deck.' });
  }
  if (player.gold_coins < 500) {
    return res.status(400).json({ error: 'Moedas de ouro insuficientes.' });
  }

  const setCards = db.prepare("SELECT * FROM cards WHERE set_code = ? AND card_number NOT LIKE '%-%-%'").all(setCode);

  const getQty = db.prepare('SELECT quantity FROM player_cards WHERE card_number = ?');
  const upsertQty = db.prepare(`
    INSERT INTO player_cards (card_number, quantity) VALUES (?, ?)
    ON CONFLICT(card_number) DO UPDATE SET quantity = excluded.quantity
  `);

  let fluidGained = 0;
  for (const card of setCards) {
    const current = getQty.get(card.card_number)?.quantity || 0;
    const newQty = Math.min(current + 4, 4); // trial deck já entrega no máximo de 4
    if (current >= 4) {
      fluidGained += (RARITY_FLUID[card.rarity] || 5) * 4;
    } else {
      upsertQty.run(card.card_number, newQty);
      // se sobrar copia além de 4 (não deveria, mas por segurança)
    }
  }

  const newGold = player.gold_coins - 500;
  const newFluid = player.pal_fluid + fluidGained;
  db.prepare(`UPDATE players SET gold_coins = ?, pal_fluid = ?, ${boughtField} = 1 WHERE id = 1`).run(newGold, newFluid);

  res.json({
    cards: setCards.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `http://localhost:3001/${c.image_path}`
    })),
    fluidGained,
    goldCoins: newGold,
    palFluid: newFluid
  });
});

// Cartas que o jogador possui e a quantidade de cada uma (pra tela "Coleção")
app.get('/api/player/cards', (req, res) => {
  res.json(db.prepare('SELECT card_number, quantity, reserved FROM player_cards WHERE quantity > 0').all());
});

// Craftar carta com Fluido de Pal (até 4 cópias)
const CRAFT_COSTS = { RR: 100, R: 50, U: 30, C: 15 };

function getCraftCost(card) {
  if (CRAFT_COSTS[card.rarity]) return CRAFT_COSTS[card.rarity];

  if (card.rarity === 'TD') {
    const cost = card.cost ?? 8; // cartas sem custo (Events/Structures sem cost) caem em "demais"
    if (cost >= 1 && cost <= 3) return 15;
    if (cost >= 4 && cost <= 6) return 30;
    if (cost === 7) return 50;
    return 100; // demais
  }

  return null; // outras raridades (SR/SP/OSR/SSP) continuam não-craftáveis por enquanto
}

app.post('/api/collection/craft', (req, res) => {
  const { cardNumber } = req.body;
  const card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(cardNumber);
  if (!card) return res.status(400).json({ error: 'Carta não encontrada.' });

  const cost = getCraftCost(card);
  if (!cost) return res.status(400).json({ error: 'Essa carta não pode ser craftada.' });

  const current = db.prepare('SELECT quantity FROM player_cards WHERE card_number = ?').get(cardNumber)?.quantity || 0;
  if (current >= 4) return res.status(400).json({ error: 'Você já tem o máximo de 4 cópias dessa carta.' });

  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  if (player.pal_fluid < cost) return res.status(400).json({ error: 'Fluido de Pal insuficiente.' });

  db.prepare('UPDATE players SET pal_fluid = pal_fluid - ? WHERE id = 1').run(cost);
  db.prepare(`
    INSERT INTO player_cards (card_number, quantity) VALUES (?, ?)
    ON CONFLICT(card_number) DO UPDATE SET quantity = excluded.quantity
  `).run(cardNumber, current + 1);

  res.json({ newQuantity: current + 1, palFluid: player.pal_fluid - cost });
});

// Abre 1 booster pack: sorteia 5 cartas do set BP01, respeitando raridade.
// Cópias além da 4ª viram Fluido de Pal em vez de empilhar.
app.post('/api/shop/open-booster', (req, res) => {
  const player = db.prepare('SELECT * FROM players WHERE id = 1').get();
  if (player.gold_coins < BOOSTER_PRICE) {
    return res.status(400).json({ error: 'Moedas de ouro insuficientes.' });
  }

  // Exclui variantes de arte paralela (ex: BP01-001-SR), só cartas base do set
  const pool = db.prepare("SELECT * FROM cards WHERE set_code = ? AND card_number NOT LIKE '%-%-%'").all(BOOSTER_SET);

  const getQty = db.prepare('SELECT quantity FROM player_cards WHERE card_number = ?');
  const upsertQty = db.prepare(`
    INSERT INTO player_cards (card_number, quantity) VALUES (?, ?)
    ON CONFLICT(card_number) DO UPDATE SET quantity = excluded.quantity
  `);

  const revealed = [];
  let fluidGained = 0;

  for (let i = 0; i < CARDS_PER_PACK; i++) {
    const card = maybeUpgradeToVariant(weightedRandomCard(pool));
    revealed.push(card);

    const current = getQty.get(card.card_number)?.quantity || 0;
    if (current >= 4) {
      fluidGained += RARITY_FLUID[card.rarity] || 5;
    } else {
      upsertQty.run(card.card_number, current + 1);
    }
  }

  const newGold = player.gold_coins - BOOSTER_PRICE;
  const newFluid = player.pal_fluid + fluidGained;
  db.prepare('UPDATE players SET gold_coins = ?, pal_fluid = ? WHERE id = 1').run(newGold, newFluid);

  res.json({
    cards: revealed.map(c => ({
      ...c, colors: JSON.parse(c.colors), keywords: JSON.parse(c.keywords), is_lucky: !!c.is_lucky,
      image_url: `http://localhost:3001/${c.image_path}`
    })),
    fluidGained,
    goldCoins: newGold,
    palFluid: newFluid
  });
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  let match = null; // { turnManager, playerIsP1, botIsP1 }

  function getCardsByNumbers(numbers) {
    const stmt = db.prepare('SELECT * FROM cards WHERE card_number = ?');
    return numbers.map(num => {
      const c = stmt.get(num);
      let effect_text = null;
      let pal_name = null;
      let typepal = [];
      if (c.extra_data) {
        try {
          const parsed = JSON.parse(c.extra_data)?.data;
          effect_text = parsed?.effect_text || null;
          pal_name = parsed?.pal_name || null;
          typepal = parsed?.typepal || [];
        } catch (e) {}
      }
      return {
        ...c,
        colors: JSON.parse(c.colors),
        keywords: JSON.parse(c.keywords),
        is_lucky: !!c.is_lucky,
        image_url: `http://localhost:3001/${c.image_path}`,
        effect_text,
        pal_name,
        typepal
      };
    });
  }

  let winCounted = false;

  function checkWinMission() {
    if (match && match.turnManager.gameOver && match.turnManager.winner === match.playerState && !winCounted) {
      incrementMission('win_games', null, 1);
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
        const target = tauntTargets.length > 0 ? { type: 'pal', instance: tauntTargets[0] } : { type: 'player' };
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

    tm.endMainPhase();
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
      incrementMission('play_pal', null, 1);
      incrementMission('play_any', null, 1);
      const palTypes = getCardPalTypes(card.card_number);
      for (const type of palTypes) {
        incrementMission('play_pal_type', type, 1);
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
      incrementMission('play_structure', null, 1);
      incrementMission('play_any', null, 1);
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
      incrementMission('play_gear', null, 1);
      incrementMission('play_any', null, 1);
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
    match.playerState.hand = match.playerState.hand.filter(c => c.card_number !== cardNumber);
    match.playerState.graveyard.push(card);
    incrementMission('play_event', null, 1);
    incrementMission('play_any', null, 1);
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
      incrementMission('soul_draw', null, 1);
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
  });

  // 6f2. Jogador escolhe a quantidade de X ao pagar um custo variável (Consume X Material, etc.)
  socket.on('bot:resolveAmount', ({ amount }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingEffect || match.turnManager.pendingEffect.kind !== 'amount') return;
    EffectEngine.continuePendingEffect(match.turnManager, { amount });
    emitState();
  });

  // 6f3. Jogador escolhe uma das opções de um efeito modal ("Choose 1 of the following")
  socket.on('bot:resolveModalChoice', ({ optionIndex }) => {
    if (!match || match.turnManager.gameOver) return;
    if (!match.turnManager.pendingEffect || match.turnManager.pendingEffect.kind !== 'modal') return;
    EffectEngine.resolveModalChoice(match.turnManager, optionIndex);
    emitState();
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
    if (result.damageDealt > 0) incrementMission('deal_damage', null, result.damageDealt);
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