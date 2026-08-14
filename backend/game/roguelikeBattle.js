const { shuffle } = require('./PlayerState')

// Mesmo teto de sempre (não foi pedido pra mudar neste modo, só o limite de cor/Lucky Pals caiu).
const MAX_COPIES_PER_NAME = 4
const REAL_COLORS = ['Red', 'Blue', 'Green', 'Purple']

// Por PROGRESSO na expedição (0 = primeira camada, 1 = última camada comum antes do Boss) em vez
// de número fixo de camada — assim a curva de dificuldade escala igual não importa se a run é
// curta/média/longa (ver EXPEDITION_LENGTHS em roguelikeMap.js). Primeiros 35%: fácil, custo <=4.
// Meio (até 75%): médio, custo <=6. Reta final: difícil, sem teto. Boss: difícil, sem teto, viés
// de cor pra Purple — lore: todos os "vilões" do jogo são contrabandistas de Pals e usam roxo.
function getDepthTier(node, totalLayers) {
  if (node.type === 'boss') return { skill: 'hard', costCap: null, forcePurple: true }
  const progress = totalLayers > 1 ? node.layer / (totalLayers - 1) : 1
  if (progress <= 0.35) return { skill: 'easy', costCap: 4, forcePurple: false }
  if (progress <= 0.75) return { skill: 'medium', costCap: 6, forcePurple: false }
  return { skill: 'hard', costCap: null, forcePurple: false }
}

function pickBotColors(tier) {
  if (tier.forcePurple) {
    const other = shuffle(REAL_COLORS.filter(c => c !== 'Purple'))[0]
    return ['Purple', other]
  }
  return shuffle(REAL_COLORS).slice(0, 2)
}

function countCopiesByName(cardsSoFar) {
  const counts = {}
  for (const c of cardsSoFar) counts[c.name] = (counts[c.name] || 0) + 1
  return counts
}

// Gera o deck de 1 bot de batalha do modo Expedição: mesmo tamanho do deck atual do jogador, 2
// cores (ou Purple forçado pro Boss), respeitando teto de custo por profundidade e o teto de 4
// cópias por nome de sempre. Reembaralha o pool elegível se esgotar antes de bater o tamanho alvo
// (decks tardios da run costumam já ser maiores que um catálogo restrito por custo baixo).
function generateBotDeck(allCards, { size, tier, colors }) {
  const eligible = allCards.filter(card => {
    if (card.card_type === 'Soul') return false
    if (tier.costCap != null && card.cost != null && card.cost > tier.costCap) return false
    const isColorless = !card.colors || card.colors.length === 0 || card.colors.includes('Colorless')
    if (isColorless) return true
    return card.colors.some(c => colors.includes(c))
  })
  if (eligible.length === 0) return []

  const deck = []
  let pool = shuffle(eligible)
  let poolIndex = 0
  let exhaustedRetries = 0
  while (deck.length < size && exhaustedRetries < 3) {
    if (poolIndex >= pool.length) {
      pool = shuffle(eligible)
      poolIndex = 0
      exhaustedRetries++
    }
    const candidate = pool[poolIndex]
    poolIndex++
    const counts = countCopiesByName(deck)
    if ((counts[candidate.name] || 0) >= MAX_COPIES_PER_NAME) continue
    deck.push(candidate)
  }
  return deck.map(c => c.card_number)
}

// Aplica bônus permanentes de power/strike e keywords concedidas (card_modifiers da run, escritos
// pela Bancada de Remédios — Fase 3) na hidratação de cada carta pra 1 partida. Clona em vez de
// mutar o objeto que getCardsByNumbers devolve (ele é reaproveitado por outras rotas/telas). Uma
// keyword concedida vira uma linha extra em effect_text ("CONT <Keyword>") — o parser já lê linha
// por linha (EffectParser.js), então isso passa pelo MESMO caminho de uma keyword impressa de
// verdade (hasKeyword), sem precisar de nenhum campo novo no motor.
function applyCardModifiers(cards, modifiers) {
  if (!modifiers || Object.keys(modifiers).length === 0) return cards
  return cards.map(card => {
    const mod = modifiers[card.card_number]
    if (!mod) return card
    const clone = { ...card }
    if (mod.powerBonus) clone.power = (clone.power || 0) + mod.powerBonus
    if (mod.strikeBonus) clone.strike = (clone.strike || 0) + mod.strikeBonus
    if (mod.grantedKeywords && mod.grantedKeywords.length > 0) {
      const extraLines = mod.grantedKeywords.map(k => `CONT ${k}`).join('\n')
      clone.effect_text = `${clone.effect_text || ''}\n${extraLines}`.trim()
    }
    if (mod.isLucky) clone.is_lucky = true
    return clone
  })
}

// Recompensa de vitória em batalha: 1-de-3, só Structure/Gear/Event (Pal nunca vem daqui — só de
// eventos/loja, ver plano), respeitando o teto de 4 cópias por NOME já presentes no deck da run.
function offerBattleReward(allCards, mainDeck) {
  const byNumber = new Map(allCards.map(c => [c.card_number, c]))
  const nameCounts = {}
  for (const num of mainDeck) {
    const c = byNumber.get(num)
    if (c) nameCounts[c.name] = (nameCounts[c.name] || 0) + 1
  }
  const eligible = allCards.filter(c =>
    (c.card_type === 'Structure' || c.card_type === 'Gear' || c.card_type === 'Event') &&
    (nameCounts[c.name] || 0) < MAX_COPIES_PER_NAME
  )
  return shuffle(eligible).slice(0, 3).map(c => ({
    cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, cost: c.cost, cardType: c.card_type
  }))
}

module.exports = { getDepthTier, pickBotColors, generateBotDeck, applyCardModifiers, offerBattleReward, REAL_COLORS }
