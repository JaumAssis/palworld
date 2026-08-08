const { getEffectivePower, getEffectiveStrike } = require('./effects/EffectEngine')

class PalInstance {
  constructor(cardData) {
    this.data = cardData
    this.isStanding = true
    this.damageMarked = 0
    this.tempPowerBonus = 0
    this.tempStrikeBonus = 0
    this.actUsedThisTurn = new Set() // índices (getAllActAbilities) já usados neste turno — 1 controle por habilidade, não por carta
    this.cannotBlockUntilEndOfTurn = false
    this.grantedTriggers = null // { onAttack: [clauseActions, ...], ... } — habilidades cedidas até fim do turno (ex: Foxparks' Harness)
    this.grantedActs = null // [ability, ...] — ACTs próprias cedidas até fim do turno (ex: Pengullet Rocket Launcher)
    this.tauntGrantedUntilTurn = null // nº do turno-limite pra Taunt cedido (ex: No Pals Beyond Sign) — ver hasGrantedTaunt
    this.grantedKeywordsUntilEndOfTurn = null // Set de keywords cedidas até fim do turno (ex: Digtoise ganha Breakthrough) — ver hasKeywordOrGranted
    this.exiledCards = [] // { data, ownerState }[] — cartas exiladas POR esta carta (ver EffectEngine 'exile')
  }

  get power() { return this.data.power }
  get strike() { return this.data.strike }

  effectivePower(ownerState, opponentState) {
    return getEffectivePower(this, ownerState, opponentState)
  }

  effectiveStrike(ownerState, opponentState) {
    return getEffectiveStrike(this, ownerState, opponentState)
  }

  isDestroyed(ownerState, opponentState) {
    return this.damageMarked >= this.effectivePower(ownerState, opponentState)
  }

  rest() { this.isStanding = false }
  stand() {
    this.isStanding = true
    this.damageMarked = 0
  }
}

class StructureInstance {
  constructor(cardData) {
    this.data = cardData
    this.damageMarked = 0
    this.isStanding = true
    this.tempPowerBonus = 0
    this.tempStrikeBonus = 0
    this.actUsedThisTurn = new Set() // índices (getAllActAbilities) já usados neste turno — 1 controle por habilidade, não por carta
  }

  get durability() { return this.data.power }
  get isDestroyed() { return this.damageMarked >= this.durability }

  rest() { this.isStanding = false }
  stand() { this.isStanding = true }
}

class GearInstance {
  constructor(cardData) {
    this.data = cardData
    this.isStanding = true
    this.tempPowerBonus = 0
    this.tempStrikeBonus = 0
    this.actUsedThisTurn = new Set() // índices (getAllActAbilities) já usados neste turno — 1 controle por habilidade, não por carta
  }

  rest() { this.isStanding = false }
  stand() { this.isStanding = true }
}

module.exports = { PalInstance, StructureInstance, GearInstance }
