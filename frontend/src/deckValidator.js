export const MAIN_DECK_SIZE = 50
export const SOUL_DECK_SIZE = 10
export const MAX_COPIES_PER_NAME = 4
export const MAX_COLORS = 2
export const MAX_LUCKY_PALS = 8

export function countCopies(deck, card) {
  return deck.filter(c => c.name === card.name).length
}

// Algumas cartas têm essa regra impressa (CONT), ex: Beegarde – Knight of the Flower Garden
// ("You may put any number of cards with the same card name as this card into your deck.") — o
// teto de 4 cópias por nome não vale pra elas, só o tamanho total do Main Deck (50) continua
// valendo. Detecta pelo texto em vez de fixar o nome, pra pegar qualquer outra carta futura com a
// mesma regra sem precisar cadastrar cada uma à mão (o /api/cards já manda effect_text pronto).
export function cardAllowsUnlimitedCopies(card) {
  return typeof card.effect_text === 'string' && /any number of cards with the same card name/i.test(card.effect_text)
}

// Erros retornados como { key, params } — o chamador (DeckBuilder) traduz com t(key, params)
export function validateMainDeck(mainDeck, chosenColors) {
  const errors = []

  if (mainDeck.length !== MAIN_DECK_SIZE) {
    errors.push({ key: 'mainDeckSizeError', params: { size: MAIN_DECK_SIZE, current: mainDeck.length } })
  }

  if (chosenColors.size > MAX_COLORS) {
    errors.push({ key: 'maxColorsError', params: { max: MAX_COLORS, current: chosenColors.size } })
  }

  const uniqueCards = [...new Map(mainDeck.map(c => [c.card_number, c])).values()]
  for (const card of uniqueCards) {
    const isColorless = !card.colors || card.colors.length === 0 || card.colors.includes('Colorless')
    const matchesChosenColor = card.colors?.some(c => chosenColors.has(c))

    if (!isColorless && !matchesChosenColor) {
      errors.push({ key: 'cardNotInColorsError', params: { name: card.name } })
    }
  }

  const grouped = {}
  const unlimitedNames = new Set()
  for (const card of mainDeck) {
    grouped[card.name] = (grouped[card.name] || 0) + 1
    if (cardAllowsUnlimitedCopies(card)) unlimitedNames.add(card.name)
  }
  for (const [name, count] of Object.entries(grouped)) {
    if (count > MAX_COPIES_PER_NAME && !unlimitedNames.has(name)) {
      errors.push({ key: 'tooManyCopiesError', params: { name, count, max: MAX_COPIES_PER_NAME } })
    }
  }

  const luckyCount = mainDeck.filter(c => c.is_lucky).length
  if (luckyCount > MAX_LUCKY_PALS) {
    errors.push({ key: 'tooManyLuckyError', params: { count: luckyCount, max: MAX_LUCKY_PALS } })
  }

  return { isValid: errors.length === 0, errors }
}

export function validateSoulDeck(soulDeck) {
  const errors = []

  if (soulDeck.length !== SOUL_DECK_SIZE) {
    errors.push({ key: 'soulDeckSizeError', params: { size: SOUL_DECK_SIZE, current: soulDeck.length } })
  }

  if (soulDeck.some(c => c.card_type !== 'Soul')) {
    errors.push({ key: 'soulDeckOnlySoulError' })
  }

  return { isValid: errors.length === 0, errors }
}