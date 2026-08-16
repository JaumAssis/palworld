const { shuffle } = require('./PlayerState')

const MAX_COPIES_PER_NAME = 4 // mesmo teto de sempre — não foi pedido pra mudar neste modo

// ---------- Bancada de Medicamentos ----------

// Nocturnal fica de fora do pool: tem mecânica própria de "descansando" (ver EffectParser.js
// KEYWORD_NAMES) que foge do escopo genérico de "keyword estática concedida" deste evento.
const GRANTABLE_KEYWORDS = ['Taunt', 'Stealth', 'Assault', 'Vigilance', 'Breakthrough', 'Retaliate']

const MEDICINE_POWER_BONUS = 300
const MEDICINE_STRIKE_BONUS = 1
const MEDICINE_RARE_CHANCE = 0.15
const MEDICINE_ULTRA_RARE_CHANCE = 0.07

function randomKeyword() {
  return shuffle(GRANTABLE_KEYWORDS)[0]
}

// 3 opções sempre presentes (Power, Strike, Keyword) + 2 rolls independentes: 15% pra uma 4ª opção
// "rara" (bônus de estat + passiva juntos) e 7% pra uma 5ª "raríssima" (passiva + vira Lucky Pal).
function offerMedicineBenchOptions() {
  const options = [
    { key: 'power', powerBonus: MEDICINE_POWER_BONUS },
    { key: 'strike', strikeBonus: MEDICINE_STRIKE_BONUS },
    { key: 'keyword', keyword: randomKeyword() }
  ]
  if (Math.random() < MEDICINE_RARE_CHANCE) {
    const useStrike = Math.random() < 0.5
    options.push({
      key: 'rare',
      keyword: randomKeyword(),
      ...(useStrike ? { strikeBonus: MEDICINE_STRIKE_BONUS } : { powerBonus: MEDICINE_POWER_BONUS })
    })
  }
  if (Math.random() < MEDICINE_ULTRA_RARE_CHANCE) {
    options.push({ key: 'ultra_rare', keyword: randomKeyword(), makeLucky: true })
  }
  return options
}

// Alvos elegíveis: Pals distintos (por card_number) já presentes no deck atual da run — cada cópia
// desse mesmo card_number recebe o modificador nas próximas batalhas (ver applyCardModifiers em
// roguelikeBattle.js, que aplica por card_number a todas as instâncias hidratadas).
function buildMedicineBenchTargets(allCards, mainDeck) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]))
  const seen = new Set()
  const targets = []
  for (const num of mainDeck) {
    if (seen.has(num) || !byNumber.has(num)) continue
    const card = byNumber.get(num)
    if (card.card_type !== 'Pal') continue
    seen.add(num)
    targets.push({ cardNumber: card.card_number, name: card.name, imageUrl: card.image_url, cost: card.cost })
  }
  return targets
}

// Mescla a opção escolhida no card_modifiers da run pro card_number alvo — soma bônus repetidos e
// nunca duplica uma keyword já concedida antes (ex: 2 visitas à bancada com o mesmo Pal).
function applyMedicineBenchOption(modifiers, option, cardNumber) {
  const existing = modifiers[cardNumber] || { powerBonus: 0, strikeBonus: 0, grantedKeywords: [], isLucky: false }
  const updated = {
    powerBonus: existing.powerBonus || 0,
    strikeBonus: existing.strikeBonus || 0,
    grantedKeywords: [...(existing.grantedKeywords || [])],
    isLucky: !!existing.isLucky
  }
  if (option.powerBonus) updated.powerBonus += option.powerBonus
  if (option.strikeBonus) updated.strikeBonus += option.strikeBonus
  if (option.keyword && !updated.grantedKeywords.includes(option.keyword)) updated.grantedKeywords.push(option.keyword)
  if (option.makeLucky) updated.isLucky = true
  return { ...modifiers, [cardNumber]: updated }
}

// ---------- Loja (dogecoin) ----------

const SHOP_TYPES = ['Pal', 'Structure', 'Gear', 'Event']
// Mesmo espírito de CRAFT_COSTS (server.js) — preço por raridade, só que na moeda isolada da run.
// Escala um pouco abaixo do craft real: dogecoin entra mais devagar (só batalhas/eventos concedem).
const SHOP_PRICE_BY_RARITY = { C: 10, U: 20, R: 35, RR: 70, SR: 100, SP: 130, OSR: 160, SSP: 200, TD: 10, TSR: 100, TSP: 130 }
const SHOP_DEFAULT_PRICE = 50

function getShopPrice(card) {
  return SHOP_PRICE_BY_RARITY[card.rarity] ?? SHOP_DEFAULT_PRICE
}

function countNamesInDeck(allCards, mainDeck) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]))
  const counts = {}
  for (const num of mainDeck) {
    const c = byNumber.get(num)
    if (c) counts[c.name] = (counts[c.name] || 0) + 1
  }
  return counts
}

// 3 cartas de cada tipo (Pal/Structure/Gear/Event = até 12 ofertas), respeitando o teto de 4 cópias
// por nome já presentes no deck da run. Cada oferta é comprável 1x (ver `purchased` no pending_choice).
function offerShopStock(allCards, mainDeck) {
  const nameCounts = countNamesInDeck(allCards, mainDeck)
  const stock = []
  for (const type of SHOP_TYPES) {
    const eligible = allCards.filter(c => c.card_type === type && (nameCounts[c.name] || 0) < MAX_COPIES_PER_NAME)
    for (const card of shuffle(eligible).slice(0, 3)) {
      stock.push({
        cardNumber: card.card_number, name: card.name, imageUrl: card.image_url,
        cost: card.cost, cardType: card.card_type, price: getShopPrice(card), purchased: false
      })
    }
  }
  return stock
}

// ---------- Pool de eventos (nó `event`) ----------

const EVENT_SUBTYPES = ['sacrifice', 'black_market', 'rare_chest', 'wild_encounter', 'breeding']
// Mesmos tiers de variante de arte alterada que addAlteredArts.js insere (ver plano) — é o filtro
// usado pelo Encontro Selvagem pra sempre mostrar a arte alterada, nunca a normal.
const ALTERED_ART_RARITIES = ['SR', 'OSR', 'SP', 'SSP', 'TSR']
const REAL_COLORS = ['Red', 'Blue', 'Green', 'Purple']
const RARE_CHEST_DOGECOINS = 150
const WILD_ENCOUNTER_MIN_COST = 6
const WILD_ENCOUNTER_PARTIAL_DOGECOINS = 20

// Pals distintos (por card_number) no deck atual, com quantas cópias — usado por Sacrifício
// (precisa de 1) e Breeding (precisa de 2 cópias reais entre os 2 pais, podendo repetir 1 card_number
// se ele tiver 2+ cópias no deck).
function buildDeckPalTargets(allCards, mainDeck) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]))
  const counts = {}
  const order = []
  for (const num of mainDeck) {
    const card = byNumber.get(num)
    if (!card || card.card_type !== 'Pal') continue
    if (!counts[num]) order.push(num)
    counts[num] = (counts[num] || 0) + 1
  }
  return order.map(num => {
    const c = byNumber.get(num)
    return { cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, cost: c.cost, count: counts[num] }
  })
}

// Sorteia qual dos 5 subtipos abre num nó `event` — só considera os que fazem sentido pro deck
// atual (sacrifice/breeding exigem Pals suficientes; os outros 3 nunca dependem do deck do jogador).
function pickEventSubtype(allCards, mainDeck) {
  const palTargets = buildDeckPalTargets(allCards, mainDeck)
  const canSacrifice = palTargets.length >= 1
  const canBreed = palTargets.length >= 2 || palTargets.some(t => t.count >= 2)
  const candidates = EVENT_SUBTYPES.filter(type => {
    if (type === 'sacrifice') return canSacrifice
    if (type === 'breeding') return canBreed
    return true
  })
  return shuffle(candidates)[0]
}

// --- Sacrifício (estilo Meat Cleaver) ---

// 3 Pals aleatórios de qualquer cor/custo pra oferecer no lugar do sacrificado — sem restrição
// nenhuma (mesmo espírito "sem limite de cor/custo" do resto deste modo).
function offerSacrificeReplacements(allCards) {
  const eligible = allCards.filter(c => c.card_type === 'Pal')
  return shuffle(eligible).slice(0, 3).map(c => ({ cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, cost: c.cost }))
}

// --- Loja Clandestina ---

// 2 cores reais visíveis + símbolo de aleatoriedade (a cor de verdade do slot 'random' só é
// sorteada quando o jogador clica nele, ver resolveBlackMarketColor) — nunca revela antes do clique.
function offerBlackMarketColorChoices() {
  const [colorA, colorB] = shuffle(REAL_COLORS).slice(0, 2)
  return [{ key: 'A', color: colorA }, { key: 'B', color: colorB }, { key: 'random' }]
}

function resolveBlackMarketColor(colorChoices, choiceKey) {
  const picked = colorChoices.find(c => c.key === choiceKey)
  if (!picked) return null
  return picked.color || shuffle(REAL_COLORS)[0]
}

// 3 Pals da cor resolvida em custos distintos (ex: 2/4/8) — se a cor não tiver 3 custos diferentes
// disponíveis, oferece quantos houver (nunca trava o evento por causa disso).
function offerBlackMarketPalsByColor(allCards, color) {
  const eligible = allCards.filter(c => c.card_type === 'Pal' && (c.colors || []).includes(color))
  const distinctCosts = shuffle([...new Set(eligible.map(c => c.cost))]).slice(0, 3)
  return distinctCosts.map(cost => {
    const card = shuffle(eligible.filter(c => c.cost === cost))[0]
    return { cardNumber: card.card_number, name: card.name, imageUrl: card.image_url, cost: card.cost }
  })
}

// --- Baú Raro ---

// Sem escolha — 2 cartas aleatórias de qualquer tipo (nunca Soul) + dogecoins fixos, aplicado na
// hora que o nó é aberto (ver enter-node); o pending_choice aqui é só pra exibir o que foi ganho.
function offerRareChestReward(allCards) {
  const eligible = allCards.filter(c => c.card_type !== 'Soul')
  const cards = shuffle(eligible).slice(0, 2).map(c => ({ cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, cardType: c.card_type }))
  return { cards, dogecoins: RARE_CHEST_DOGECOINS }
}

// --- Encontro Selvagem ---

// 1 carta de arte alterada, custo >=6, de qualquer cor — a "fera" que o jogador precisa superar em Power.
function pickWildEncounterCard(allCards) {
  const eligible = allCards.filter(c =>
    c.card_type === 'Pal' && ALTERED_ART_RARITIES.includes(c.rarity) && c.cost != null && c.cost >= WILD_ENCOUNTER_MIN_COST
  )
  if (eligible.length === 0) return null
  const card = shuffle(eligible)[0]
  return { cardNumber: card.card_number, name: card.name, imageUrl: card.image_url, cost: card.cost, power: card.power }
}

// Cada cópia física do deck vira uma opção selecionável (não só nomes distintos — o jogador pode
// escolher 2 cópias da mesma carta) — só cartas com Power de verdade entram (Pal/Structure; Gear e
// Event não têm Power, não fariam sentido nessa soma).
// `modifiers` (card_modifiers da run) é opcional — soma o powerBonus da Bancada de Remédios ao
// Power de cada cópia antes de oferecer pro Encontro Selvagem. Sem isso, um Pal que já recebeu
// bônus de Power não levava esse bônus pra essa soma, subestimando o Power de verdade do jogador.
function buildWildEncounterDeckCards(allCards, mainDeck, modifiers = {}) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]))
  return mainDeck
    .map((num, index) => ({ index, card: byNumber.get(num) }))
    .filter(({ card }) => card && card.power != null)
    .map(({ index, card }) => ({
      index, cardNumber: card.card_number, name: card.name, imageUrl: card.image_url,
      power: card.power + (modifiers[card.card_number]?.powerBonus || 0)
    }))
}

// --- Breeding ---

// Alvos pro passo de escolher o 2º pai: pode repetir o mesmo card_number do 1º pai SE o deck tiver
// 2+ cópias dele — senão fica de fora (não existe uma 2ª cópia física pra usar).
function buildSecondParentTargets(palTargets, firstParentCardNumber) {
  return palTargets.filter(t => t.cardNumber !== firstParentCardNumber || t.count >= 2)
}

module.exports = {
  GRANTABLE_KEYWORDS,
  offerMedicineBenchOptions,
  buildMedicineBenchTargets,
  applyMedicineBenchOption,
  offerShopStock,
  getShopPrice,
  EVENT_SUBTYPES,
  ALTERED_ART_RARITIES,
  WILD_ENCOUNTER_PARTIAL_DOGECOINS,
  buildDeckPalTargets,
  pickEventSubtype,
  offerSacrificeReplacements,
  offerBlackMarketColorChoices,
  resolveBlackMarketColor,
  offerBlackMarketPalsByColor,
  offerRareChestReward,
  pickWildEncounterCard,
  buildWildEncounterDeckCards,
  buildSecondParentTargets
}
