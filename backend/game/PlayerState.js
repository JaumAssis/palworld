const { PalInstance, StructureInstance } = require('./CardInstance')

const MAX_PALS_IN_BASE = 5

class PlayerState {
  constructor(playerName, mainDeck, soulDeck) {
    this.playerName = playerName
    this.life = 10

    this.deck = [...mainDeck]      // array de CardData (já embaralhado antes de passar aqui)
    this.hand = []
    this.graveyard = []

    this.basePals = []             // PalInstance[]
    this.baseStructures = []       // StructureInstance[]
    this.baseGear = []             // CardData[]

    this.soulDeck = [...soulDeck]
    this.soulsStanding = 0
    this.soulsRested = 0
    this.maxSouls = 10

    this.resources = { wood: 0, fruit: 0 }

    this.isFirstPlayer = false
  }

  get totalSouls() { return this.soulsStanding + this.soulsRested }

  drawCard() {
    if (this.deck.length === 0) {
      return { success: false, reason: 'DECK_EMPTY' }
    }
    const card = this.deck.shift()
    this.hand.push(card)
    return { success: true, card }
  }

  addSouls(amount) {
    const spaceLeft = this.maxSouls - this.totalSouls
    const toAdd = Math.min(amount, spaceLeft, this.soulDeck.length)
    for (let i = 0; i < toAdd; i++) {
      this.soulDeck.shift()
      this.soulsStanding++
    }
  }

  paySoulCost(cost) {
    if (this.soulsStanding < cost) return false
    this.soulsStanding -= cost
    this.soulsRested += cost
    return true
  }

  standAll() {
    this.soulsStanding += this.soulsRested
    this.soulsRested = 0
    for (const pal of this.basePals) pal.stand()
  }

  tryDeployPal(card) {
    if (this.basePals.length >= MAX_PALS_IN_BASE) {
      return { success: false, reason: 'BASE_FULL' }
    }
    if (!this.paySoulCost(card.cost)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.hand = this.hand.filter(c => c.card_number !== card.card_number)
    const instance = new PalInstance(card)
    this.basePals.push(instance)
    return { success: true, instance }
  }

  tryDeployStructure(card) {
    if (!this.paySoulCost(card.cost)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.hand = this.hand.filter(c => c.card_number !== card.card_number)
    const instance = new StructureInstance(card)
    this.baseStructures.push(instance)
    return { success: true, instance }
  }

  tryDeployGear(card) {
    if (!this.paySoulCost(card.cost)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.hand = this.hand.filter(c => c.card_number !== card.card_number)
    this.baseGear.push(card)
    return { success: true }
  }

  // Regra: suspender 3 Souls Standing pra comprar 1 carta extra
  drawWithSoulCost(cost = 3) {
    if (this.soulsStanding < cost) return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    this.paySoulCost(cost)
    return this.drawCard()
  }

  // Mulligan: devolve a mão pro fundo do deck, embaralha, compra 5 de novo
  mulligan() {
    this.deck.push(...this.hand)
    this.hand = []
    this.deck = shuffle(this.deck)
    for (let i = 0; i < 5; i++) this.drawCard()
  }

  toPublicState() {
    return {
      playerName: this.playerName,
      life: this.life,
      handCount: this.hand.length,
      deckCount: this.deck.length,
      graveyardCount: this.graveyard.length,
      basePals: this.basePals.map(p => ({
        cardNumber: p.data.card_number, name: p.data.name,
        isStanding: p.isStanding, damageMarked: p.damageMarked, power: p.data.power,
        imageUrl: p.data.image_url
      })),
      baseStructures: this.baseStructures.map(s => ({
        cardNumber: s.data.card_number, name: s.data.name, damageMarked: s.damageMarked,
        imageUrl: s.data.image_url, isStanding: s.isStanding
      })),
      baseGear: this.baseGear.map(g => ({
        cardNumber: g.card_number, name: g.name, imageUrl: g.image_url
      })),
      soulsStanding: this.soulsStanding,
      soulsRested: this.soulsRested,
      resources: this.resources
    }
  }
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

module.exports = { PlayerState, MAX_PALS_IN_BASE, shuffle }