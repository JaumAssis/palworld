const { PalInstance, StructureInstance, GearInstance } = require('./CardInstance')
const EffectEngine = require('./effects/EffectEngine')

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

    this.material = 0
    this.ingredient = 0

    this.isFirstPlayer = false
    this.soulDrawUsedThisTurn = false // regra 8.5.2: suspender 3 souls pra comprar só 1x por turno
  }

  gainMaterial(amount) { this.material += amount }
  gainIngredient(amount) { this.ingredient += amount }

  // Efeito "escolha N souls e fique-os em pé" — inverso de paySoulCost
  standSouls(amount) {
    const toStand = Math.min(amount, this.soulsRested)
    this.soulsRested -= toStand
    this.soulsStanding += toStand
  }

  // Efeito "increase your soul by N card(s) in the rest state" — como addSouls, mas entra descansado
  addRestedSoul(amount) {
    const spaceLeft = this.maxSouls - this.totalSouls
    const toAdd = Math.min(amount, spaceLeft, this.soulDeck.length)
    for (let i = 0; i < toAdd; i++) {
      this.soulDeck.shift()
      this.soulsRested++
    }
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
    for (const pal of this.basePals) { pal.stand(); pal.actUsedThisTurn = false }
    for (const s of this.baseStructures) { s.stand(); s.actUsedThisTurn = false }
    for (const g of this.baseGear) { g.stand(); g.actUsedThisTurn = false }
  }

  // Regra 11.5 (Overloaded Pals Resolution): passar de 5 Pals NÃO bloqueia o deploy — o Pal recém
  // colocado fica garantido, e o excesso é resolvido depois (TurnManager.checkOverloadedPals),
  // escolhendo qual dos OUTROS Pals já em campo vai pro cemitério.
  tryDeployPal(card) {
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
    const instance = new GearInstance(card)
    this.baseGear.push(instance)
    return { success: true, instance }
  }

  // Regra 8.5: suspender 3 Souls Standing pra comprar 1 carta extra — só 1x por turno (8.5.2)
  drawWithSoulCost(cost = 3) {
    if (this.soulDrawUsedThisTurn) return { success: false, reason: 'ALREADY_USED' }
    if (this.soulsStanding < cost) return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    this.paySoulCost(cost)
    this.soulDrawUsedThisTurn = true
    return this.drawCard()
  }

  // Mulligan: devolve a mão pro fundo do deck, embaralha, compra 5 de novo
  mulligan() {
    this.deck.push(...this.hand)
    this.hand = []
    this.deck = shuffle(this.deck)
    for (let i = 0; i < 5; i++) this.drawCard()
  }

  toPublicState(opponentState) {
    return {
      playerName: this.playerName,
      life: this.life,
      handCount: this.hand.length,
      deckCount: this.deck.length,
      graveyardCount: this.graveyard.length,
      basePals: this.basePals.map(p => ({
        cardNumber: p.data.card_number, name: p.data.name,
        isStanding: p.isStanding, damageMarked: p.damageMarked, power: p.effectivePower(this, opponentState),
        powerBonus: p.effectivePower(this, opponentState) - p.data.power,
        imageUrl: p.data.image_url,
        hasAct: EffectEngine.getActAbilities(p.data).length > 0,
        actAvailable: EffectEngine.canActivateAbility(p, this)
      })),
      baseStructures: this.baseStructures.map(s => ({
        cardNumber: s.data.card_number, name: s.data.name, damageMarked: s.damageMarked,
        imageUrl: s.data.image_url, isStanding: s.isStanding,
        hasAct: EffectEngine.getActAbilities(s.data).length > 0,
        actAvailable: EffectEngine.canActivateAbility(s, this)
      })),
      baseGear: this.baseGear.map(g => ({
        cardNumber: g.data.card_number, name: g.data.name, imageUrl: g.data.image_url,
        isStanding: g.isStanding,
        hasAct: EffectEngine.getActAbilities(g.data).length > 0,
        actAvailable: EffectEngine.canActivateAbility(g, this)
      })),
      soulsStanding: this.soulsStanding,
      soulsRested: this.soulsRested,
      resources: this.resources,
      material: this.material,
      ingredient: this.ingredient,
      soulDrawUsedThisTurn: this.soulDrawUsedThisTurn
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