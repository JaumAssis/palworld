const { PalInstance, StructureInstance, GearInstance } = require('./CardInstance')
const EffectEngine = require('./effects/EffectEngine')

const MAX_PALS_IN_BASE = 5

// Lista de habilidades ACT (fixas + concedidas) dessa instância, pro front decidir se mostra o
// badge de ativar e — quando há mais de 1 — qual delas oferecer (ex: Primitive Furnace, Breeding Farm).
function buildActsInfo(instance, ownerState) {
  return EffectEngine.getAllActAbilities(instance).map((ability, i) => ({
    index: i,
    description: ability.description || null,
    available: EffectEngine.canActivateAbility(instance, ownerState, i)
  }))
}

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
    this.nextGearDiscount = 0 // "Reduce the cost of playing your next gear from hand by X until end of turn" (Primitive Furnace)
    this.assignedThisTurn = [] // Pals descansados por custo "[Assign N Pal(s)]" neste turno (Alarm Bell)
    this.cannotAssignUntilEndOfTurn = false // "Your Pals cannot be assigned" até o fim do turno (Alarm Bell)
    this.mustAttackAllUntilEndOfTurn = false // "must attack as much as possible" até o fim do turno (Alarm Bell)
    // "If you have not played any other cards during this game, ..." (The Adventure Begins) — conta
    // toda carta jogada da mão (Pal/Structure/Gear aqui; Event/Quick incrementado em server.js/EffectEngine).
    this.cardsPlayedThisGame = 0
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
    this.assignedThisTurn = []
    this.cannotAssignUntilEndOfTurn = false
    this.mustAttackAllUntilEndOfTurn = false
    for (const pal of this.basePals) {
      // "That card does not stand during your opponent's next stand phase" (Jormuntide, Crystal
      // Breath) — pula SÓ esta vez e libera a flag; nas próximas o Pal volta a levantar normalmente.
      if (pal.skipNextOwnStandPhase) pal.skipNextOwnStandPhase = false
      else pal.stand()
      pal.actUsedThisTurn.clear()
    }
    for (const s of this.baseStructures) { s.stand(); s.actUsedThisTurn.clear() }
    for (const g of this.baseGear) { g.stand(); g.actUsedThisTurn.clear() }
  }

  // Regra 11.5 (Overloaded Pals Resolution): passar de 5 Pals NÃO bloqueia o deploy — o Pal recém
  // colocado fica garantido, e o excesso é resolvido depois (TurnManager.checkOverloadedPals),
  // escolhendo qual dos OUTROS Pals já em campo vai pro cemitério.
  tryDeployPal(card) {
    if (!this.paySoulCost(card.cost)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.hand = this.hand.filter(c => c !== card)
    this.cardsPlayedThisGame++
    const instance = new PalInstance(card)
    this.basePals.push(instance)
    return { success: true, instance }
  }

  tryDeployStructure(card) {
    if (!this.paySoulCost(card.cost)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.hand = this.hand.filter(c => c !== card)
    this.cardsPlayedThisGame++
    const instance = new StructureInstance(card)
    this.baseStructures.push(instance)
    return { success: true, instance }
  }

  tryDeployGear(card) {
    // "Reduce the cost of playing your next gear from hand by X... It does not become ◇0 or less"
    // (Primitive Furnace) — desconto nunca deixa o custo final abaixo de 1.
    const discount = Math.min(this.nextGearDiscount || 0, Math.max(0, card.cost - 1))
    if (!this.paySoulCost(card.cost - discount)) {
      return { success: false, reason: 'NOT_ENOUGH_SOUL' }
    }
    this.nextGearDiscount = 0
    this.hand = this.hand.filter(c => c !== card)
    this.cardsPlayedThisGame++
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
      // Cemitério é informação pública na regra (cartas descartadas ficam viradas pra cima) —
      // manda a lista pra dar pra ver o que tem lá, não só a contagem.
      graveyard: this.graveyard.map(c => ({ cardNumber: c.card_number, name: c.name, imageUrl: c.image_url })),
      basePals: this.basePals.map(p => ({
        cardNumber: p.data.card_number, name: p.data.name,
        isStanding: p.isStanding, damageMarked: p.damageMarked, power: p.effectivePower(this, opponentState),
        powerBonus: p.effectivePower(this, opponentState) - p.data.power,
        imageUrl: p.data.image_url,
        acts: buildActsInfo(p, this),
        hasAssault: EffectEngine.hasKeywordOrGranted(p, 'Assault')
      })),
      baseStructures: this.baseStructures.map(s => ({
        cardNumber: s.data.card_number, name: s.data.name, damageMarked: s.damageMarked,
        imageUrl: s.data.image_url, isStanding: s.isStanding,
        acts: buildActsInfo(s, this)
      })),
      baseGear: this.baseGear.map(g => ({
        cardNumber: g.data.card_number, name: g.data.name, imageUrl: g.data.image_url,
        isStanding: g.isStanding,
        acts: buildActsInfo(g, this)
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