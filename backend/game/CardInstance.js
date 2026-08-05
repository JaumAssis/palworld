class PalInstance {
  constructor(cardData) {
    this.data = cardData
    this.isStanding = true
    this.damageMarked = 0
  }

  get isDestroyed() {
    return this.damageMarked >= this.data.power
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
  }

  get durability() { return this.data.power }
  get isDestroyed() { return this.damageMarked >= this.durability }

  rest() { this.isStanding = false }
  stand() { this.isStanding = true }
}

module.exports = { PalInstance, StructureInstance }