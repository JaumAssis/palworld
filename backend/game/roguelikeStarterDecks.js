// 5 decks-personagem iniciais do Modo Expedição, transcritos manualmente de
// frontend/public/deck.txt (16 cartas cada). Cada card_number aqui precisa existir na tabela
// `cards` (alguns já são variantes de arte alterada, ex. BP01-019-SR — isso é intencional, o
// deck.txt já foi montado em cima dos card_number reais do banco, não parseamos o .txt em runtime
// pra não depender de um formato de texto frágil em produção).
const ROGUELIKE_STARTER_DECKS = [
  {
    key: 'red',
    cardCounts: {
      'BP01-003': 2,
      'BP01-006': 3,
      'TD01-004': 3,
      'BP01-011': 2,
      'BP01-019-SR': 2,
      'BP01-021': 2,
      'BP01-016': 1,
      'BP01-023': 1
    }
  },
  {
    key: 'blue',
    cardCounts: {
      'BP01-031': 2,
      'BP01-028': 4,
      'TD01-014': 4,
      'BP01-034': 2,
      'BP01-044': 2,
      'TD01-021': 1,
      'BP01-042': 1
    }
  },
  {
    key: 'green',
    cardCounts: {
      'TD02-003-TSR': 4,
      'BP01-059': 4,
      'BP01-058': 2,
      'BP01-057': 2,
      'BP01-069': 2,
      'BP01-066': 2
    }
  },
  {
    key: 'purple',
    cardCounts: {
      'BP01-079': 2,
      'BP01-082': 3,
      'BP01-080-SR': 3,
      'BP01-081': 2,
      'TD02-014': 2,
      'BP01-087': 2,
      'BP01-088-SR': 1,
      'BP01-089': 1
    }
  },
  {
    key: 'neutral',
    cardCounts: {
      'TD01-023': 3,
      'TD02-023': 3,
      'TD02-024': 3,
      'BP01-099': 2,
      'BP01-091': 2,
      'TD01-021': 2,
      'BP01-100': 1
    }
  }
]

const STARTER_DECK_SIZE = 16

function getStarterDeck(key) {
  return ROGUELIKE_STARTER_DECKS.find(d => d.key === key) || null
}

// Expande { card_number: count } num array plano de card_number repetido — é isso que vira o
// `main_deck` inicial da run (mesmo formato usado por Arena: array de card_number, sem objetos).
function expandStarterDeck(deck) {
  const cardNumbers = []
  for (const [cardNumber, count] of Object.entries(deck.cardCounts)) {
    for (let i = 0; i < count; i++) cardNumbers.push(cardNumber)
  }
  return cardNumbers
}

module.exports = {
  ROGUELIKE_STARTER_DECKS,
  STARTER_DECK_SIZE,
  getStarterDeck,
  expandStarterDeck
}
