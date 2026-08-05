export const MAIN_DECK_SIZE = 50
export const SOUL_DECK_SIZE = 10
export const MAX_COPIES_PER_NAME = 4
export const MAX_COLORS = 2
export const MAX_LUCKY_PALS = 8

export function countCopies(deck, card) {
  return deck.filter(c => c.name === card.name).length
}

export function validateMainDeck(mainDeck, chosenColors) {
  const errors = []

  if (mainDeck.length !== MAIN_DECK_SIZE) {
    errors.push(`Main Deck deve ter exatamente ${MAIN_DECK_SIZE} cartas (atual: ${mainDeck.length}).`)
  }

  if (chosenColors.size > MAX_COLORS) {
    errors.push(`Máximo de ${MAX_COLORS} cores permitidas (atual: ${chosenColors.size}).`)
  }

  const uniqueCards = [...new Map(mainDeck.map(c => [c.card_number, c])).values()]
  for (const card of uniqueCards) {
    const isColorless = !card.colors || card.colors.length === 0 || card.colors.includes('Colorless')
    const matchesChosenColor = card.colors?.some(c => chosenColors.has(c))

    if (!isColorless && !matchesChosenColor) {
      errors.push(`${card.name} não pertence às cores escolhidas.`)
    }
  }

  const grouped = {}
  for (const card of mainDeck) {
    grouped[card.name] = (grouped[card.name] || 0) + 1
  }
  for (const [name, count] of Object.entries(grouped)) {
    if (count > MAX_COPIES_PER_NAME) {
      errors.push(`${name} tem ${count} cópias (máximo ${MAX_COPIES_PER_NAME}).`)
    }
  }

  const luckyCount = mainDeck.filter(c => c.is_lucky).length
  if (luckyCount > MAX_LUCKY_PALS) {
    errors.push(`Deck tem ${luckyCount} cartas Lucky (máximo ${MAX_LUCKY_PALS}).`)
  }

  return { isValid: errors.length === 0, errors }
}

export function validateSoulDeck(soulDeck) {
  const errors = []

  if (soulDeck.length !== SOUL_DECK_SIZE) {
    errors.push(`Soul Deck deve ter exatamente ${SOUL_DECK_SIZE} cartas (atual: ${soulDeck.length}).`)
  }

  if (soulDeck.some(c => c.card_type !== 'Soul')) {
    errors.push('Soul Deck só pode conter cartas do tipo Soul.')
  }

  return { isValid: errors.length === 0, errors }
}