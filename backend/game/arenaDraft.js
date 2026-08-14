const { shuffle } = require('./PlayerState')

// As 4 cores "de verdade" do jogo — Colorless fica de fora da escolha porque ela não conta pro
// limite de MAX_COLORS (deckValidator.js do front): toda carta Colorless já é elegível em
// qualquer deck, não é uma cor que o jogador "escolhe".
const ARENA_COLORS = ['Red', 'Blue', 'Green', 'Purple']
const ARENA_MAIN_DECK_SIZE = 50
const ARENA_MAX_COPIES_PER_NAME = 4
const ARENA_MAX_LUCKY_PALS = 8

// Passo 1 do pré-draft: sorteia e esconde 1 das 4 cores, mostra as outras 3. Não precisa ser
// persistido — é só apresentação/RNG, qualquer uma das 4 cores é uma escolha válida de 1ª cor.
function offerFirstColorTrio() {
  return shuffle(ARENA_COLORS).slice(0, 3)
}

// Passo 2: as 3 cores restantes (todas exceto a já escolhida) — sempre exatamente 3, já que só
// existem 4 cores no total. Determinístico a partir de colorA, não precisa sortear nada aqui.
function offerSecondColorTrio(colorA) {
  return ARENA_COLORS.filter(c => c !== colorA)
}

// Pool elegível pro draft de cartas: nunca Soul (o Soul Deck do Arena é fixo, 10x SOUL-001 —
// só existe 1 carta desse tipo no catálogo hoje, sem variedade real pra draftar), e só cartas
// Colorless ou de uma das 2 cores escolhidas — mesma regra que validateMainDeck usa no front.
function buildEligiblePool(allCards, colors) {
  return allCards.filter(card => {
    if (card.card_type === 'Soul') return false
    const isColorless = !card.colors || card.colors.length === 0 || card.colors.includes('Colorless')
    if (isColorless) return true
    return card.colors.some(c => colors.includes(c))
  })
}

// Conta cópias por NOME (variantes de arte com nomes iguais contam juntas, igual ao countCopies
// do front) e quantos Lucky Pals já estão no deck-em-progresso — base pra filtrar ofertas e
// validar picks contra os mesmos tetos que validateMainDeck usa (4 cópias, 8 Lucky Pals).
function countDeckSoFar(pool, deckCardNumbers) {
  const byNumber = new Map(pool.map(c => [c.card_number, c]))
  const nameCounts = {}
  let luckyCount = 0
  for (const num of deckCardNumbers) {
    const card = byNumber.get(num)
    if (!card) continue // carta de outra cor (não deveria acontecer, mas não quebra a contagem)
    nameCounts[card.name] = (nameCounts[card.name] || 0) + 1
    if (card.is_lucky) luckyCount++
  }
  return { nameCounts, luckyCount }
}

function isCardStillLegal(card, nameCounts, luckyCount) {
  if ((nameCounts[card.name] || 0) >= ARENA_MAX_COPIES_PER_NAME) return false
  if (card.is_lucky && luckyCount >= ARENA_MAX_LUCKY_PALS) return false
  return true
}

// Sorteia até 3 cartas do pool que ainda são legais pra entrar no deck-em-progresso. Pode devolver
// menos de 3 se o pool elegível estiver ficando curto — quem chama decide o que fazer com uma
// oferta de 1 ou 2 (nunca trava o draft por causa disso).
function offerCardTrio(pool, deckCardNumbers) {
  const { nameCounts, luckyCount } = countDeckSoFar(pool, deckCardNumbers)
  const legal = pool.filter(card => isCardStillLegal(card, nameCounts, luckyCount))
  return shuffle(legal).slice(0, 3)
}

// Confere se UM card_number específico ainda é uma escolha legal agora — usado pra revalidar no
// servidor o pick que o cliente mandou, sem confiar que ele só escolheu dentre o que foi oferecido.
function isCardNumberLegalPick(pool, deckCardNumbers, cardNumber) {
  const card = pool.find(c => c.card_number === cardNumber)
  if (!card) return false
  const { nameCounts, luckyCount } = countDeckSoFar(pool, deckCardNumbers)
  return isCardStillLegal(card, nameCounts, luckyCount)
}

// Monta uma run inteira sozinha, sem interação — usada pelo bot substituto de fila da Arena, que
// precisa de um deck temporário e aleatório só pra essa partida (nunca o deck fixo de um bot
// permanente). Mesmas 2 escolhas de cor + mesmo draft de carta que o fluxo interativo usa, só que
// sempre pegando a 1ª opção da oferta em vez de esperar um clique.
function draftRandomDeck(allCards) {
  const colorA = offerFirstColorTrio()[0]
  const colorB = offerSecondColorTrio(colorA)[0]
  const colors = [colorA, colorB]
  const pool = buildEligiblePool(allCards, colors)

  const mainDeck = []
  while (mainDeck.length < ARENA_MAIN_DECK_SIZE) {
    const offer = offerCardTrio(pool, mainDeck)
    if (offer.length === 0) break // pool esgotado (cenário extremo) — fecha com o que der, não trava
    mainDeck.push(offer[0].card_number)
  }
  return { colors, mainDeck }
}

module.exports = {
  ARENA_COLORS,
  ARENA_MAIN_DECK_SIZE,
  ARENA_MAX_COPIES_PER_NAME,
  ARENA_MAX_LUCKY_PALS,
  offerFirstColorTrio,
  offerSecondColorTrio,
  buildEligiblePool,
  offerCardTrio,
  isCardNumberLegalPick,
  draftRandomDeck
}
