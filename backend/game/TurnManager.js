const PHASES = ['stand', 'draw', 'soul', 'main', 'end']
const SOULS_PER_TURN = 2
const OPENING_HAND_SIZE = 5

class TurnManager {
  constructor(player1, player2, p1GoesFirst) {
    this.player1 = player1
    this.player2 = player2
    this.player1.isFirstPlayer = p1GoesFirst
    this.player2.isFirstPlayer = !p1GoesFirst

    const second = p1GoesFirst ? player2 : player1
    second.addSouls(1)

    for (const p of [player1, player2]) {
      for (let i = 0; i < OPENING_HAND_SIZE; i++) p.drawCard()
    }

    this.activePlayer = p1GoesFirst ? player1 : player2
    this.turnNumber = 1
    this.currentPhase = null
    this.gameOver = false
    this.winner = null
    this.log = []

    this._addLog(`Jogo iniciado. ${this.activePlayer.playerName} começa.`)
  }

  get defendingPlayer() {
    return this.activePlayer === this.player1 ? this.player2 : this.player1
  }

  _addLog(msg) {
    this.log.push(msg)
    console.log(msg)
  }

  // Avança automaticamente pelas fases não-interativas (Stand, Draw, Soul) até chegar na Main
  advanceUntilMain() {
    while (!this.gameOver && this.currentPhase !== 'main') {
      this.advancePhase()
    }
  }

  // Chamado 1x, depois do mulligan de ambos, pra começar de fato o turno 1
  beginFirstTurn() {
    this.setPhase('soul') // regra: 1º turno pula Stand e Draw
    this.advanceUntilMain()
  }

  // Encerra o turno de fato a partir da Main Phase, numa única chamada
  // (antes, advancePhase() só ia de 'main' pra 'end', sem processar o fim do turno)
  endMainPhase() {
    if (this.gameOver || this.currentPhase !== 'main') return
    this._endPhaseCleanup()
    this._endTurn()
  }

  advancePhase() {
    if (this.gameOver) return

    switch (this.currentPhase) {
      case 'stand':
        this.activePlayer.standAll()
        this.setPhase('draw')
        break

      case 'draw': {
        const result = this.activePlayer.drawCard()
        if (!result.success) {
          this._endGame(this.defendingPlayer)
          return
        }
        this.setPhase('soul')
        break
      }

      case 'soul':
        this.activePlayer.addSouls(SOULS_PER_TURN)
        this.setPhase('main')
        break

      case 'main':
        this.setPhase('end')
        break

      case 'end':
        this._endPhaseCleanup()
        this._endTurn()
        break
    }
  }

  _endPhaseCleanup() {
    for (const pal of this.activePlayer.basePals) pal.damageMarked = 0
    for (const s of this.activePlayer.baseStructures) s.damageMarked = 0
  }

  _endTurn() {
    this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1
    this.turnNumber++
    this._addLog(`--- Turno ${this.turnNumber}: vez de ${this.activePlayer.playerName} ---`)
    this.setPhase('stand')
    this.advanceUntilMain()
  }

  setPhase(phase) {
    this.currentPhase = phase
    this._addLog(`[${this.activePlayer.playerName}] Fase: ${phase}`)
  }

  // ---------- Combate ----------

  attackPlayer(attackerPalInstance) {
    if (!attackerPalInstance.isStanding) {
      return { success: false, reason: 'PAL_RESTED' }
    }
    attackerPalInstance.rest()
    const defender = this.defendingPlayer
    const strike = attackerPalInstance.data.strike

    const revealed = []
    for (let i = 0; i < strike; i++) {
      if (defender.deck.length === 0) {
        this._endGame(this.activePlayer)
        return { success: true, gameEnded: true }
      }
      revealed.push(defender.deck.shift())
    }

    const canceled = revealed.some(c => c.is_lucky)
    let damageDealt = 0

    if (!canceled) {
      defender.life -= strike
      damageDealt = strike
    }

    defender.graveyard.push(...revealed)

    if (defender.life <= 0) {
      this._endGame(this.activePlayer)
      return { success: true, canceled, damageDealt, revealed, gameEnded: true }
    }

    return { success: true, canceled, damageDealt, revealed, gameEnded: false }
  }

  // Ataca um Pal Rested do oponente (regra: só Pals Rested podem ser alvo)
  attackOpponentPal(attackerInstance, targetInstance) {
    if (!attackerInstance.isStanding) {
      return { success: false, reason: 'ATTACKER_RESTED' }
    }
    if (targetInstance.isStanding) {
      return { success: false, reason: 'TARGET_NOT_RESTED' }
    }
    attackerInstance.rest()
    const result = this.resolveBattle(attackerInstance, targetInstance)
    return { success: true, ...result }
  }

  resolveBattle(attackerInstance, defenderInstance) {
    defenderInstance.damageMarked += attackerInstance.data.power
    attackerInstance.damageMarked += defenderInstance.data.power

    const results = { attackerDestroyed: false, defenderDestroyed: false }

    if (defenderInstance.isDestroyed) {
      this._removePal(defenderInstance)
      results.defenderDestroyed = true
    }
    if (attackerInstance.isDestroyed) {
      this._removePal(attackerInstance)
      results.attackerDestroyed = true
    }
    return results
  }

  _removePal(palInstance) {
    for (const p of [this.player1, this.player2]) {
      const idx = p.basePals.indexOf(palInstance)
      if (idx !== -1) {
        p.basePals.splice(idx, 1)
        p.graveyard.push(palInstance.data)
        break
      }
    }
  }

  _endGame(winner) {
    this.gameOver = true
    this.winner = winner
    this._addLog(`${winner.playerName} VENCEU!`)
  }
}

module.exports = { TurnManager, PHASES }