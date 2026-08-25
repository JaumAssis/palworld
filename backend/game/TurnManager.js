const EffectEngine = require('./effects/EffectEngine')
const { PalInstance, StructureInstance, GearInstance } = require('./CardInstance')
const { MAX_PALS_IN_BASE } = require('./PlayerState')

const PHASES = ['stand', 'draw', 'soul', 'main', 'end']
const SOULS_PER_TURN = 2
const OPENING_HAND_SIZE = 5

class TurnManager {
  // player2IsBot: true = partida contra o Bot (comportamento original — player2 é sempre a IA);
  // false = partida online entre 2 jogadores reais, onde player2 precisa ser tratado como humano
  // em todo lugar que hoje deriva "isBot" só pela identidade (senão o motor "resolveria sozinho"
  // escolhas do 2º jogador real em vez de pedir a decisão dele).
  constructor(player1, player2, p1GoesFirst, player2IsBot = true) {
    this.player1 = player1
    this.player2 = player2
    this.player2IsBot = player2IsBot
    this.player1.isFirstPlayer = p1GoesFirst
    this.player2.isFirstPlayer = !p1GoesFirst
    this.player1.turnManagerRef = this
    this.player2.turnManagerRef = this
    this.nightUntilTurn = null

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
    this._damageRevealSeq = 0
    this.lastDamageReveal = null

    this._addLog(`Jogo iniciado. ${this.activePlayer.playerName} começa.`)
  }

  get defendingPlayer() {
    return this.activePlayer === this.player1 ? this.player2 : this.player1
  }

  // "It becomes night until the end of the opponent's next turn", ou uma carta específica
  // descansada que faz "while this card is in the rest state, it is night".
  get isNight() {
    if (this.nightUntilTurn != null && this.turnNumber <= this.nightUntilTurn) return true
    for (const p of [this.player1, this.player2]) {
      for (const pal of p.basePals) {
        if (!pal.isStanding && EffectEngine.getParsedEffects(pal.data).cont.some(f => f.type === 'nightWhileResting')) return true
      }
    }
    return false
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
    if (this.gameOver || this.currentPhase !== 'main') return { success: false }
    // "...must attack as much as possible" (Alarm Bell) — não deixa encerrar o turno enquanto
    // sobrar Pal em pé; o bot já ataca com tudo antes de chamar isto, então nunca é bloqueado por isso.
    if (this.activePlayer.mustAttackAllUntilEndOfTurn && this.activePlayer.basePals.some(p => p.isStanding)) {
      return { success: false, reason: 'MUST_ATTACK' }
    }
    // "AUTO At the end of your turn, ..." (Shadowbeak) pode abrir uma escolha (ex: qual Pal butcher) —
    // só passa a vez pro outro jogador DEPOIS que essa escolha (e a cadeia dela) terminar de resolver;
    // ver _pendingEndTurnContinuation/_resumeAttackAfterTrigger.
    const result = this._endPhaseCleanup()
    if (result.paused) return { success: true, paused: true }
    this._endTurn()
    return { success: true }
  }

  advancePhase() {
    if (this.gameOver) return

    switch (this.currentPhase) {
      case 'stand':
        this.activePlayer.standAll()
        this.activePlayer.soulDrawUsedThisTurn = false
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

      case 'end': {
        const result = this._endPhaseCleanup()
        if (!result.paused) this._endTurn()
        break
      }
    }
  }

  _endPhaseCleanup() {
    for (const pal of this.activePlayer.basePals) pal.damageMarked = 0
    for (const s of this.activePlayer.baseStructures) s.damageMarked = 0

    // Buffs "até o fim do turno" valem pra qualquer Pal buffado, não só do jogador ativo
    for (const p of [this.player1, this.player2]) {
      p.nextGearDiscount = 0
      for (const pal of p.basePals) {
        pal.tempPowerBonus = 0
        pal.tempStrikeBonus = 0
        pal.cannotBlockUntilEndOfTurn = false
        pal.grantedTriggers = null
        pal.grantedActs = null
      }
    }

    // Vigilance: fica em pé já no fim do próprio turno (protegido no turno do oponente) — precisa
    // checar ANTES de limpar grantedKeywordsUntilEndOfTurn (Vigilance pode ter sido cedida neste turno).
    for (const pal of this.activePlayer.basePals) {
      if (!pal.isStanding && EffectEngine.hasKeywordOrGranted(pal, 'Vigilance')) pal.stand()
    }

    for (const p of [this.player1, this.player2]) {
      for (const pal of p.basePals) pal.grantedKeywordsUntilEndOfTurn = null
      // "... they get that declared card name in addition until end of turn." (Antique Dresser) —
      // vale pra Pal/Structure/Gear ("all of your cards"), não só Pal.
      for (const c of [...p.basePals, ...p.baseStructures, ...p.baseGear]) c.grantedNamesUntilEndOfTurn = null
    }

    const isBot = this.player2IsBot && this.activePlayer === this.player2
    const opponent = this.activePlayer === this.player1 ? this.player2 : this.player1
    // "AUTO At the end of your turn, ..." não é só de Pal (ex: Shoddy Bed é Structure) — varre tudo
    // que a carta tenha em campo, mesmo padrão do fieldCardsOf usado pra CONT em EffectEngine.
    const fieldCards = [...this.activePlayer.basePals, ...this.activePlayer.baseStructures, ...this.activePlayer.baseGear]
    return this._runEndOfTurnTriggers(fieldCards, 0, this.activePlayer, opponent, isBot)
  }

  // "AUTO At the end of your turn, ..." (Shadowbeak) roda um Pal por vez — se um pausar esperando
  // escolha do jogador, guarda a continuação e SÓ chama _endTurn() depois que todos terminarem
  // (ver endMainPhase/advancePhase e _resumeAttackAfterTrigger).
  _runEndOfTurnTriggers(pals, index, activePlayerState, opponent, isBot) {
    if (index >= pals.length) return { paused: false }
    const result = EffectEngine.runTrigger(this, 'onEndOfTurn', pals[index], activePlayerState, opponent, { isBot })
    if (result.paused) {
      this._pendingEndTurnContinuation = { pals, index: index + 1, activePlayerState, opponent, isBot }
      return { paused: true }
    }
    return this._runEndOfTurnTriggers(pals, index + 1, activePlayerState, opponent, isBot)
  }

  _endTurn() {
    this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1
    this.turnNumber++
    if (this.nightUntilTurn != null && this.turnNumber > this.nightUntilTurn) this.nightUntilTurn = null
    for (const p of [this.player1, this.player2]) {
      for (const pal of p.basePals) {
        if (pal.tauntGrantedUntilTurn != null && this.turnNumber > pal.tauntGrantedUntilTurn) pal.tauntGrantedUntilTurn = null
      }
    }
    this._addLog(`--- Turno ${this.turnNumber}: vez de ${this.activePlayer.playerName} ---`)
    this.setPhase('stand')
    this.advanceUntilMain()
  }

  setPhase(phase) {
    this.currentPhase = phase
    this._addLog(`[${this.activePlayer.playerName}] Fase: ${phase}`)
  }

  // ---------- Combate (9. Battle — Attack Declaration / Block Declaration / Quick Step / Damage / End) ----------

  // target: { type: 'player' } ou { type: 'pal'|'structure', instance }
  declareAttack(attackerInstance, target, { isBot } = {}) {
    if (!attackerInstance.isStanding) {
      return { success: false, reason: 'ATTACKER_RESTED' }
    }
    const attackerState = this.activePlayer
    const defenderState = this.defendingPlayer

    if (target.type === 'pal' && !EffectEngine.canBeAttackedBy(target.instance, attackerInstance)) {
      return { success: false, reason: 'TARGET_NOT_VALID' }
    }
    // Structure (9.2.3): pode ser atacada em qualquer estado — ao contrário do Pal (que só é alvo
    // válido descansado, a menos que o atacante tenha Assault), a Structure não tem "estado de combate"
    // nenhum; `isStanding`/`rest()` nela só existem pro custo das próprias habilidades ACT dela mesma
    // (ex: "[Rest this card]"), não pra elegibilidade de ser atacada.
    // forcedTaunt agora mistura Pal e Structure (Wooden Wall etc.) — cada entrada carrega seu próprio
    // type, então a checagem precisa bater type+instance, não só a instância (ver getForcedTauntTargets).
    const forcedTaunt = EffectEngine.getForcedTauntTargets(defenderState, attackerInstance)
    if (forcedTaunt.length > 0 && !forcedTaunt.some(f => f.type === target.type && f.instance === target.instance)) {
      return { success: false, reason: 'TAUNT_FORCED' }
    }

    const triggerNames = target.type === 'structure' ? ['onAttack', 'onAttackStructure'] : ['onAttack']
    return this._runAttackTriggers(triggerNames, 0, attackerInstance, attackerState, defenderState, target, isBot)
  }

  // Roda onAttack/onAttackStructure em sequência — se um deles pausar esperando o jogador (ex: Elphidran,
  // "you may reveal 1 card from hand"), a batalha (e a revelação de dano por vida) só é montada depois
  // que TODOS os gatilhos de ataque tiverem terminado de resolver (ver _resumeAttackAfterTrigger).
  _runAttackTriggers(triggerNames, index, attackerInstance, attackerState, defenderState, target, isBot) {
    if (index >= triggerNames.length) {
      return this._proceedAttack(attackerInstance, attackerState, defenderState, target, isBot)
    }
    const result = EffectEngine.runTrigger(this, triggerNames[index], attackerInstance, attackerState, defenderState, { isBot })
    if (result.paused) {
      this._pendingAttackContinuation = { triggerNames, index: index + 1, attackerInstance, attackerState, defenderState, target, isBot }
      return { success: true, paused: true }
    }
    return this._runAttackTriggers(triggerNames, index + 1, attackerInstance, attackerState, defenderState, target, isBot)
  }

  // Chamado pelo EffectEngine sempre que um pendingEffect termina de resolver (sem reabrir outro) —
  // retoma a cadeia de gatilhos de ataque, de "assign" (Serious/Mau Cryst) ou de cláusula (Ranch) em
  // andamento, se alguma houver.
  _resumeAttackAfterTrigger() {
    // PRECISA vir antes de qualquer outra continuação: "If it is night, your Pal's AUTO activates
    // twice" (Shadowbeak) e habilidades CEDIDAS que se acumulam (2x Foxparks' Harness no mesmo Pal)
    // fazem um ÚNICO runTrigger(...) precisar de mais de uma pausa (uma cláusula por vez — ver
    // EffectEngine.runTriggerClauses). Quem CHAMOU esse runTrigger (_runAttackTriggers pro onAttack,
    // _runEndOfTurnTriggers pro onEndOfTurn, _runDeployStep pro onDeploy) também guarda a PRÓPRIA
    // continuação assumindo que o runTrigger tinha terminado — se essa checagem de baixo rodasse
    // primeiro, ela "vencia" e pulava direto pro próximo Pal/próxima etapa, perdendo pra sempre a
    // 2a cláusula pendente (ex: a 2a Harness nunca chegava a perguntar o alvo).
    const triggerCont = this._pendingTriggerContinuation
    if (triggerCont) {
      this._pendingTriggerContinuation = null
      const result = EffectEngine.resumeTriggerContinuation(this, triggerCont)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    const cont = this._pendingAttackContinuation
    if (cont) {
      this._pendingAttackContinuation = null
      this._runAttackTriggers(cont.triggerNames, cont.index, cont.attackerInstance, cont.attackerState, cont.defenderState, cont.target, cont.isBot)
      return
    }
    const assignCont = this._pendingAssignContinuation
    if (assignCont) {
      this._pendingAssignContinuation = null
      const result = EffectEngine.resumeAssignContinuation(this, assignCont)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    const clauseCont = this._pendingClauseContinuation
    if (clauseCont) {
      this._pendingClauseContinuation = null
      const result = EffectEngine.resumeClauseContinuation(this, clauseCont)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    // Dark Cannon (Quick com escolha de alvo) — depois que essa escolha resolve, volta pro Quick Step
    // de verdade (recomputa quickOptions), em vez de deixar o jogador preso sem poder seguir a batalha.
    const quickStepCont = this._pendingQuickStepContinuation
    if (quickStepCont) {
      this._pendingQuickStepContinuation = null
      const battle = quickStepCont.battle
      battle.quickOptions = EffectEngine.getPlayableQuickCards(battle.defenderState)
      this.pendingBattle = battle
      return
    }
    // "AUTO When this card is attacked, ..." (Fuack – Manic Wave Ripper) pausou antes do dano ser
    // calculado (raro — só se abrisse uma escolha, o que essa carta não faz, mas outra pode) — precisa
    // terminar de resolver ANTES de seguir pra conta de dano de verdade (ver _resolveDamage).
    const onAttackedCont = this._pendingOnAttackedContinuation
    if (onAttackedCont) {
      this._pendingOnAttackedContinuation = null
      const result = this._resolveDamageAfterOnAttacked(onAttackedCont.battle)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    // Fila de gatilhos DEPOIS do dano (onGraveyard/onLeaveBase/onEndOfBattleAttacked) — ex: Leezpunk
    // perguntando qual carta descartar, seguido de Bushi perguntando se volta pra mão; sem isso, o 2o
    // atropelava o pendingEffect do 1o (ver _resolveDamageAfterOnAttacked/_runDamageTriggerQueue).
    const damageCont = this._pendingDamageTriggerContinuation
    if (damageCont) {
      this._pendingDamageTriggerContinuation = null
      const result = this._runDamageTriggerQueue(damageCont.queue, damageCont.index, damageCont.battle)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    // Elphidran Aqua ("choose 1 card... put on top of deck") seguido da Regra 11.5 (mais de 5 Pals)
    // — o passo de baixo só roda depois que o de cima (se abriu pendingEffect) for resolvido.
    const deployCont = this._pendingDeployContinuation
    if (deployCont) {
      this._pendingDeployContinuation = null
      const result = this._runDeployStep(deployCont.step, deployCont.casterState, deployCont.opponentState, deployCont.instance, deployCont.isBot)
      if (!result.paused && !this.pendingEffect) this._resumeAttackAfterTrigger()
      return
    }
    const endTurnCont = this._pendingEndTurnContinuation
    if (endTurnCont) {
      this._pendingEndTurnContinuation = null
      const result = this._runEndOfTurnTriggers(endTurnCont.pals, endTurnCont.index, endTurnCont.activePlayerState, endTurnCont.opponent, endTurnCont.isBot)
      // Só agora, com todos os "AUTO At the end of your turn" resolvidos, passa a vez de fato.
      if (!result.paused && !this.pendingEffect) this._endTurn()
    }
  }

  _proceedAttack(attackerInstance, attackerState, defenderState, target, isBot) {
    attackerInstance.rest()

    let resolveWait
    const waitPromise = new Promise(resolve => { resolveWait = resolve })
    const battle = {
      attackerInstance, attackerState, defenderState, target,
      nullified: false, blockResolved: false, quickResolved: false,
      waitPromise, resolveWait
    }
    this.pendingBattle = battle
    return this._advanceBattle(battle)
  }

  // Passo 9.4 (Block) e 9.5 (Quick Step) — cada um só pausa de fato se houver escolha real
  // (mesma filosofia do pendingEffect: 0 opções válidas = pula automático).
  _advanceBattle(battle) {
    const defenderIsBot = this.player2IsBot && battle.defenderState === this.player2

    if (!battle.blockResolved) {
      const validBlockers = EffectEngine.getValidBlockers(battle)
      if (validBlockers.length === 0) {
        battle.blockResolved = true
      } else if (defenderIsBot) {
        const chosen = EffectEngine.pickBotBlocker(battle, validBlockers)
        if (chosen) this._applyBlock(battle, chosen)
        battle.blockResolved = true
      } else {
        battle.waitingFor = 'block'
        battle.validBlockers = validBlockers
        this.pendingBattle = battle
        return { success: true, paused: true }
      }
    }

    if (!battle.quickResolved) {
      if (defenderIsBot) {
        battle.quickResolved = true // decisão de escopo: bot nunca joga Quick/Interrupt
      } else {
        const quickOptions = EffectEngine.getPlayableQuickCards(battle.defenderState)
        if (quickOptions.length === 0) {
          battle.quickResolved = true
        } else {
          battle.waitingFor = 'quick'
          battle.quickOptions = quickOptions
          this.pendingBattle = battle
          return { success: true, paused: true }
        }
      }
    }

    // Se o atacante foi destruído/removido durante o Quick Step (ex: Dark Cannon mirando nele
    // mesmo), o ataque não tem mais quem o realize — trata como anulado, sem dano nenhum.
    const attackerGone = !battle.attackerState.basePals.includes(battle.attackerInstance)
    const skipDamage = battle.nullified || attackerGone

    this.pendingBattle = null
    if (skipDamage) {
      battle.resolveWait()
      return { success: true, paused: false, nullified: true }
    }
    // _resolveDamage agora empilha onAttacked/onGraveyard/onLeaveBase/onEndOfBattleAttacked numa fila
    // (ver _runDamageTriggerQueue) em vez de disparar cada um na hora — um gatilho anterior que pausa
    // (ex: Leezpunk perguntando qual carta o oponente descarta) não pode ser atropelado pelo próximo
    // (ex: Bushi perguntando se volta pra mão) só porque ninguém checava pendingEffect no meio do caminho.
    const damageResult = this._resolveDamage(battle)
    if (damageResult.paused) return { success: true, paused: true }
    return { success: true, paused: false, nullified: false, ...damageResult }
  }

  _applyBlock(battle, blockerInstance) {
    blockerInstance.rest()
    battle.target = { type: 'pal', instance: blockerInstance }
    this._addLog(`${battle.defenderState.playerName} bloqueou o ataque de ${battle.attackerInstance.data.name} com ${blockerInstance.data.name}.`)
  }

  // Retomada do Block Declaration Step (chamado pelo handler bot:resolveBlock)
  resolveBlock(choice) {
    const battle = this.pendingBattle
    if (!battle || battle.waitingFor !== 'block') return { success: false }
    if (!choice.none) {
      const chosen = battle.defenderState.basePals[choice.blockerIndex]
      if (!chosen || !battle.validBlockers.includes(chosen)) return { success: false }
      this._applyBlock(battle, chosen)
    }
    battle.blockResolved = true
    return this._advanceBattle(battle)
  }

  // Retomada do Quick Step (chamado pelo handler bot:resolveQuickStep)
  resolveQuickStep(choice) {
    const battle = this.pendingBattle
    if (!battle || battle.waitingFor !== 'quick') return { success: false }
    // battle.waitingFor continua 'quick' durante TODA a escolha de alvo própria de um Quick Card
    // recém-jogado (ex.: Crystal Breath, "Quick Choose 1 Pal...") — playQuickCard abre um
    // pendingEffect e o Quick Step só é retomado de verdade depois que ele for resolvido (ver
    // _pendingQuickStepContinuation). Sem essa checagem, um Pass (ou outro Quick Card) mandado
    // NESSA janela era aceito, terminava a batalha inteira e abandonava esse pendingEffect pra
    // sempre — travando toda ação futura, já que todo handler recusa agir com pendingEffect aberto.
    if (this.pendingEffect) return { success: false }

    if (choice.pass) {
      battle.quickResolved = true
      return this._advanceBattle(battle)
    }

    const option = battle.quickOptions.find(o => o.card.card_number === choice.cardNumber && o.kind === choice.kind)
    if (!option) return { success: false }

    if (option.kind === 'interrupt') {
      // 12.8.2: duas formas de pagar o custo do Interrupt — se AMBAS estiverem disponíveis, o
      // jogador escolhe; se só uma der, usa ela direto (não tem o que perguntar).
      const canSoul = battle.defenderState.soulsStanding >= 1
      const canDiscard = battle.defenderState.hand.length >= 2
      if (canSoul && canDiscard) {
        battle.waitingFor = 'interruptCost'
        battle.interruptCard = option.card
        this.pendingBattle = battle
        return { success: true, paused: true }
      }
      return this._startInterruptPayment(battle, option.card, canSoul ? 'soul' : 'discard')
    }

    // kind === 'quick': joga o Event. Se ele abrir um pendingEffect de escolha de alvo por baixo (ex:
    // Dark Cannon — "Choose 1 ◇5 or less Pal, and put it into the graveyard"), NÃO recomputa
    // quickOptions/reabre o Quick Step ainda — isso só pode acontecer DEPOIS que essa escolha for
    // resolvida (guarda a continuação, ver _resumeAttackAfterTrigger). Sem isso, o pendingEffect da
    // escolha ficava pendurado junto com o próprio Quick Step, e a carta nunca terminava de resolver.
    const result = EffectEngine.playQuickCard(this, option.card, battle.defenderState, battle.attackerState)
    if (result.paused) {
      this._pendingQuickStepContinuation = { battle }
      this.pendingBattle = battle
      return { success: true, paused: true }
    }
    battle.quickOptions = EffectEngine.getPlayableQuickCards(battle.defenderState)
    this.pendingBattle = battle
    return { success: true, paused: true }
  }

  // Retomada de "qual custo pagar" do Interrupt (chamado pelo handler bot:resolveInterruptCost)
  resolveInterruptCost(choice) {
    const battle = this.pendingBattle
    if (!battle || battle.waitingFor !== 'interruptCost') return { success: false }
    if (choice.method === 'soul' && battle.defenderState.soulsStanding < 1) return { success: false }
    if (choice.method === 'discard' && battle.defenderState.hand.length < 2) return { success: false }
    return this._startInterruptPayment(battle, battle.interruptCard, choice.method)
  }

  // Descarta a carta do Interrupt em si (sempre) e paga o restante do custo escolhido. No método
  // "descarte", a carta EXTRA (12.8.2) também é escolhida pelo jogador — só pula a pergunta se
  // houver 0 ou 1 candidata (nada a escolher de fato).
  _startInterruptPayment(battle, card, method) {
    battle.defenderState.hand = battle.defenderState.hand.filter(c => c !== card)
    battle.defenderState.graveyard.push(card)
    battle.interruptCard = card

    if (method === 'soul') {
      battle.defenderState.paySoulCost(1)
      return this._finishInterrupt(battle)
    }

    const others = battle.defenderState.hand
    if (others.length <= 1) {
      if (others.length === 1) {
        battle.defenderState.graveyard.push(others[0])
        battle.defenderState.hand = []
      }
      return this._finishInterrupt(battle)
    }

    battle.waitingFor = 'interruptDiscardChoice'
    this.pendingBattle = battle
    return { success: true, paused: true }
  }

  // Retomada de "qual carta extra descartar" pro custo do Interrupt (bot:resolveInterruptDiscard)
  resolveInterruptDiscard(choice) {
    const battle = this.pendingBattle
    if (!battle || battle.waitingFor !== 'interruptDiscardChoice') return { success: false }
    const idx = battle.defenderState.hand.findIndex(c => c.card_number === choice.cardNumber)
    if (idx === -1) return { success: false }
    const [discarded] = battle.defenderState.hand.splice(idx, 1)
    battle.defenderState.graveyard.push(discarded)
    return this._finishInterrupt(battle)
  }

  _finishInterrupt(battle) {
    battle.nullified = true
    battle.quickResolved = true
    this._addLog(`${battle.defenderState.playerName} ativou Interrupt com ${battle.interruptCard.name} — o ataque foi anulado.`)
    return this._advanceBattle(battle)
  }

  // Passo 9.6 — resolve o dano depois que Block e Quick Step já foram decididos. "AUTO When this card
  // is attacked, ..." (ex: Fuack – Manic Wave Ripper, +300 Power) precisa rodar ANTES do dano ser
  // calculado — o efeito dela pode mudar o próprio Power usado na conta — por isso corre sozinha aqui
  // fora, nunca dentro da fila pós-dano (ver _resolveDamageAfterOnAttacked/_runDamageTriggerQueue, que
  // é pra onGraveyard/onLeaveBase/onEndOfBattleAttacked — esses sim, só depois que o dano já rolou).
  _resolveDamage(battle) {
    if (battle.target.type === 'pal') {
      const { defenderState, attackerState } = battle
      const result = EffectEngine.runTrigger(this, 'onAttacked', battle.target.instance, defenderState, attackerState, { isBot: this.player2IsBot && defenderState === this.player2 })
      if (result.paused) {
        this._pendingOnAttackedContinuation = { battle }
        return { paused: true }
      }
    }
    return this._resolveDamageAfterOnAttacked(battle)
  }

  _resolveDamageAfterOnAttacked(battle) {
    const { attackerInstance, attackerState, defenderState, target } = battle
    const queue = []
    let syncResult

    if (target.type === 'pal') {
      syncResult = this._resolveBattle(attackerInstance, target.instance, queue)
    } else if (target.type === 'structure') {
      // 9.6.3.2 — dano unidirecional, a Structure não bate de volta no atacante
      const power = attackerInstance.effectivePower(attackerState, defenderState)
      target.instance.damageMarked += power
      const structureDestroyed = target.instance.isDestroyed
      this._addLog(`${attackerInstance.data.name} atacou a Structure ${target.instance.data.name} (${power} de dano).`)
      if (structureDestroyed) {
        this._sendToGraveyardQueued(target.instance, defenderState, queue)
        this._addLog(`${target.instance.data.name} foi destruída.`)
      }
      syncResult = { structureDestroyed }
    } else {
      // Alvo é o jogador direto — "vida" nesse jogo é revelar Strike cartas do topo do deck do
      // defensor (regra oficial 11.2.2, ver _resolvePlayerDamage).
      const strike = attackerInstance.effectiveStrike(attackerState, defenderState)
      const { deckedOut, canceled, damageDealt, revealed } = this._resolvePlayerDamage(defenderState, strike)

      if (deckedOut) {
        this._endGame(attackerState)
        syncResult = { gameEnded: true }
      } else {
        if (canceled) {
          this._addLog(`${attackerInstance.data.name} atacou ${defenderState.playerName} diretamente, mas revelou um Lucky Pal — ataque anulado.`)
        } else {
          this._addLog(`${attackerInstance.data.name} atacou ${defenderState.playerName} diretamente e causou ${damageDealt} de dano.`)
        }

        this.lastDamageReveal = {
          id: ++this._damageRevealSeq,
          attackerName: attackerInstance.data.name,
          defenderName: defenderState.playerName,
          canceled,
          damageDealt,
          cards: revealed.map(c => ({ cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, isLucky: !!c.is_lucky }))
        }

        if (defenderState.life <= 0) {
          this._endGame(attackerState)
          syncResult = { canceled, damageDealt, revealed, gameEnded: true }
        } else {
          syncResult = { canceled, damageDealt, revealed, gameEnded: false }
        }
      }
    }

    // "AUTO At the end of the battle this card attacked, ..." (Bushi – Ephemeral Blade) — vale pra
    // qualquer tipo de alvo, sempre por último na fila.
    queue.push({
      name: 'onEndOfBattleAttacked', instance: attackerInstance, casterState: attackerState, opponentState: defenderState,
      isBot: this.player2IsBot && attackerState === this.player2
    })

    const queueResult = this._runDamageTriggerQueue(queue, 0, battle)
    return { ...syncResult, paused: queueResult.paused }
  }

  // Roda a fila de gatilhos da resolução de dano em ordem, um de cada vez — se um pausar esperando
  // o jogador, guarda o resto da fila pra retomar depois (ver _resumeAttackAfterTrigger) e só chama
  // battle.resolveWait() quando TODOS já tiverem rodado, nunca antes (senão o front acha que a
  // batalha terminou enquanto ainda falta resolver uma escolha).
  _runDamageTriggerQueue(queue, index, battle) {
    if (index >= queue.length) {
      battle.resolveWait()
      return { paused: false }
    }
    const step = queue[index]
    const result = EffectEngine.runTrigger(this, step.name, step.instance, step.casterState, step.opponentState, { isBot: step.isBot })
    if (result.paused) {
      this._pendingDamageTriggerContinuation = { queue, index: index + 1, battle }
      return { paused: true }
    }
    return this._runDamageTriggerQueue(queue, index + 1, battle)
  }

  // Resolve `amount` de "damage taken" contra um jogador — regra oficial 11.2.2 (Player Damage
  // Resolution). Usado tanto pelo ataque direto num jogador (_resolveDamageAfterOnAttacked) quanto
  // pelo bônus de dano do Breakthrough (regra 12.14, ver _resolveBattle) — as duas fontes de dano
  // caem no mesmo "damage taken" do jogador (regra 3.2.2) e passam pela MESMA resolução: revela 1
  // carta do topo do deck por vez, e PARA imediatamente se ela tiver o ícone de Lucky Pal (não
  // revela as demais). Só aplica o dano cheio se nenhuma das `amount` cartas reveladas for Lucky
  // Pal. Cartas que o dano "não chegou a revelar" ficam intactas no topo do deck.
  _resolvePlayerDamage(defenderState, amount) {
    const revealed = []
    let deckedOut = false
    let canceled = false
    while (revealed.length < amount) {
      if (defenderState.deck.length === 0) { deckedOut = true; break }
      const card = defenderState.deck.shift()
      revealed.push(card)
      if (card.is_lucky) { canceled = true; break }
    }

    let damageDealt = 0
    if (!deckedOut && !canceled) {
      defenderState.life -= amount
      damageDealt = amount
    }
    defenderState.graveyard.push(...revealed)

    return { deckedOut, canceled, damageDealt, revealed }
  }

  // Resolve dano + destruição entre 2 Pals em batalha — em vez de disparar onGraveyard/onLeaveBase
  // na hora (ver _sendToGraveyardQueued), empilha na MESMA fila de _resolveDamage.
  _resolveBattle(attackerInstance, defenderInstance, queue) {
    const attackerState = this.activePlayer
    const defenderState = this.defendingPlayer

    const attackerPower = attackerInstance.effectivePower(attackerState, defenderState)
    const defenderPower = defenderInstance.effectivePower(defenderState, attackerState)
    defenderInstance.damageMarked += attackerPower
    attackerInstance.damageMarked += defenderPower
    this._addLog(`${attackerInstance.data.name} atacou ${defenderInstance.data.name} (${attackerPower} de dano).`)

    const results = { attackerDestroyed: false, defenderDestroyed: false }

    // Calculado ANTES de qualquer coisa ir pro cemitério de verdade — Retaliate ("when THIS card is
    // put into the graveyard during battle, put the opposing combat Pal into the graveyard", ver
    // Menasting) só precisa agir se o OUTRO lado não fosse morrer de qualquer jeito só pelo dano da
    // própria batalha, e isso precisa ser decidido sem depender de qual bloco (defensor/atacante)
    // roda primeiro logo abaixo.
    const attackerWouldDieFromDamage = attackerInstance.isDestroyed(attackerState, defenderState)

    if (defenderInstance.isDestroyed(defenderState, attackerState)) {
      this._sendToGraveyardQueued(defenderInstance, defenderState, queue)
      results.defenderDestroyed = true
      this._addLog(`${defenderInstance.data.name} foi destruído.`)

      // Regra do Retaliate vale pros 2 lados (o texto da carta não fala em "atacante" nem
      // "defensor", só "this card") — antes só era checado quando quem tinha Retaliate estava
      // atacando; se ele estivesse defendendo (bloqueando, ou sendo o próprio alvo do ataque), o
      // efeito nunca disparava.
      if (!attackerWouldDieFromDamage && EffectEngine.hasKeyword(defenderInstance.data, 'Retaliate')) {
        this._sendToGraveyardQueued(attackerInstance, attackerState, queue)
        results.attackerDestroyed = true
        this._addLog(`${attackerInstance.data.name} foi destruído (Retaliate).`)
      }

      if (EffectEngine.hasKeywordOrGranted(attackerInstance, 'Breakthrough')) {
        const strike = attackerInstance.effectiveStrike(attackerState, defenderState)
        const { deckedOut, canceled, damageDealt, revealed } = this._resolvePlayerDamage(defenderState, strike)

        if (deckedOut) {
          this._endGame(attackerState)
        } else {
          if (canceled) {
            this._addLog(`${attackerInstance.data.name} (Breakthrough) atacou ${defenderState.playerName}, mas revelou um Lucky Pal — dano anulado.`)
          } else {
            this._addLog(`${attackerInstance.data.name} (Breakthrough) causou ${damageDealt} de dano direto em ${defenderState.playerName}.`)
          }

          this.lastDamageReveal = {
            id: ++this._damageRevealSeq,
            attackerName: `${attackerInstance.data.name} (Breakthrough)`,
            defenderName: defenderState.playerName,
            canceled,
            damageDealt,
            cards: revealed.map(c => ({ cardNumber: c.card_number, name: c.name, imageUrl: c.image_url, isLucky: !!c.is_lucky }))
          }

          if (defenderState.life <= 0) this._endGame(attackerState)
        }
      }
    }
    if (attackerWouldDieFromDamage && !results.attackerDestroyed) {
      this._sendToGraveyardQueued(attackerInstance, attackerState, queue)
      results.attackerDestroyed = true
      this._addLog(`${attackerInstance.data.name} foi destruído.`)

      if (!results.defenderDestroyed && EffectEngine.hasKeyword(attackerInstance.data, 'Retaliate')) {
        this._sendToGraveyardQueued(defenderInstance, defenderState, queue)
        results.defenderDestroyed = true
        this._addLog(`${defenderInstance.data.name} foi destruído (Retaliate).`)
      }
    }
    return results
  }


  checkAndRemoveIfDestroyed(instance, ownerState, opponentState) {
    if (instance.isDestroyed(ownerState, opponentState)) {
      this._sendToGraveyard(instance, ownerState)
      return true
    }
    return false
  }

  // "While this card is in the base, that card does not stand" (Relaxaurus – Hungry Gunner) — libera
  // qualquer Pal (de qualquer lado) travado por `leavingInstance`, assim que ela sai de campo.
  _releaseStandLocksFrom(leavingInstance) {
    for (const p of [...this.player1.basePals, ...this.player2.basePals]) {
      if (p.standLockedBy) p.standLockedBy.delete(leavingInstance)
    }
  }

  // Descobre em qual das 3 zonas de campo (Pal/Structure/Gear) uma instância está — onGraveyard/
  // onLeaveBase (Wooden Wall, Hanging Trap, Viewing Cage) valem pra Structure/Gear também, não só Pal.
  _findBaseArray(instance, ownerState) {
    if (ownerState.basePals.includes(instance)) return ownerState.basePals
    if (ownerState.baseStructures.includes(instance)) return ownerState.baseStructures
    if (ownerState.baseGear.includes(instance)) return ownerState.baseGear
    return null
  }

  _sendToGraveyard(instance, ownerState) {
    const array = this._findBaseArray(instance, ownerState)
    if (!array) return
    array.splice(array.indexOf(instance), 1)
    ownerState.graveyard.push(instance.data)
    this._releaseStandLocksFrom(instance)

    const opponentState = ownerState === this.player1 ? this.player2 : this.player1
    const isBot = this.player2IsBot && ownerState !== this.player1
    EffectEngine.runTrigger(this, 'onGraveyard', instance, ownerState, opponentState, { isBot })
    EffectEngine.runTrigger(this, 'onLeaveBase', instance, ownerState, opponentState, { isBot })
  }

  // Variante usada durante resolução de batalha (ver _resolveDamage/_resolveBattle) — em vez de
  // disparar onGraveyard/onLeaveBase na hora (o que atropelava um pendingEffect deixado por um
  // gatilho anterior NA MESMA resolução — ex: Bushi sobrescrevendo a escolha de descarte do
  // Leezpunk), só faz a remoção mecânica e empilha os 2 gatilhos na fila compartilhada.
  _sendToGraveyardQueued(instance, ownerState, queue) {
    const array = this._findBaseArray(instance, ownerState)
    if (!array) return
    array.splice(array.indexOf(instance), 1)
    ownerState.graveyard.push(instance.data)
    this._releaseStandLocksFrom(instance)

    const opponentState = ownerState === this.player1 ? this.player2 : this.player1
    const isBot = this.player2IsBot && ownerState !== this.player1
    queue.push({ name: 'onGraveyard', instance, casterState: ownerState, opponentState, isBot })
    queue.push({ name: 'onLeaveBase', instance, casterState: ownerState, opponentState, isBot })
  }

  _returnToHand(instance, ownerState) {
    const array = this._findBaseArray(instance, ownerState)
    if (array) {
      array.splice(array.indexOf(instance), 1)
      ownerState.hand.push(instance.data)
      this._releaseStandLocksFrom(instance)

      const opponentState = ownerState === this.player1 ? this.player2 : this.player1
      EffectEngine.runTrigger(this, 'onLeaveBase', instance, ownerState, opponentState, { isBot: this.player2IsBot && ownerState !== this.player1 })
      return
    }
    // "AUTO At the end of the battle this card attacked, you may return this card to hand." (Bushi –
    // Ephemeral Blade) — se a carta já morreu NA MESMA batalha (destruição mútua), ela não está mais
    // em nenhuma zona de campo quando esse gatilho de fim de batalha resolve, só no cemitério; a regra
    // ainda deixa resgatar de lá (não é "leaves the base" de novo, por isso sem onLeaveBase aqui).
    const graveyardIdx = ownerState.graveyard.indexOf(instance.data)
    if (graveyardIdx !== -1) {
      ownerState.graveyard.splice(graveyardIdx, 1)
      ownerState.hand.push(instance.data)
    }
  }

  // Devolve os Pals guardados em sourceInstance.exiledCards (exilados POR essa carta) pro campo
  // (em pé... na verdade descansados, "in the rest state") ou pra mão do dono original de cada um.
  returnExiledPals(sourceInstance, destination) {
    const exiled = sourceInstance.exiledCards || []
    for (const rec of exiled) {
      if (destination === 'hand' || rec.ownerState.basePals.length >= MAX_PALS_IN_BASE) {
        rec.ownerState.hand.push(rec.data)
      } else {
        const inst = new PalInstance(rec.data)
        inst.rest()
        rec.ownerState.basePals.push(inst)
      }
    }
    sourceInstance.exiledCards = []
  }

  // Deploy "de efeito" (fora do fluxo normal de jogar da mão) — usado por cardSelect (Chillet, Lyleen,
  // busca no cemitério, etc). `payCost` só é true pra "deploy com desconto" (Elizabee/Beegarde); as
  // demais variantes (deploy grátis, deploy direto do cemitério já descansado) não cobram Soul.
  deployCardFree(casterState, opponentState, cardData, { rested = false, payCost = false, discount = 0 } = {}) {
    if (payCost) {
      const cost = Math.max(0, (cardData.cost || 0) - discount)
      if (!casterState.paySoulCost(cost)) {
        casterState.hand.push(cardData) // não deu pra pagar — devolve pra mão em vez de perder a carta
        return { success: false, reason: 'NOT_ENOUGH_SOUL' }
      }
    }

    const isBot = this.player2IsBot && casterState !== this.player1
    let instance

    if (cardData.card_type === 'Pal') {
      instance = new PalInstance(cardData)
      if (rested) instance.rest()
      casterState.basePals.push(instance)
      this._addLog(`${casterState.playerName} deployou ${cardData.name}.`)
      this.runDeployFollowups(casterState, opponentState, instance, isBot)
    } else if (cardData.card_type === 'Structure') {
      instance = new StructureInstance(cardData)
      if (rested) instance.rest()
      casterState.baseStructures.push(instance)
      this._addLog(`${casterState.playerName} deployou ${cardData.name}.`)
      EffectEngine.runTrigger(this, 'onDeploy', instance, casterState, opponentState, { isBot })
    } else if (cardData.card_type === 'Gear') {
      instance = new GearInstance(cardData)
      if (rested) instance.rest()
      casterState.baseGear.push(instance)
      this._addLog(`${casterState.playerName} deployou ${cardData.name}.`)
      EffectEngine.runTrigger(this, 'onDeploy', instance, casterState, opponentState, { isBot })
    } else {
      casterState.hand.push(cardData)
      return { success: false, reason: 'UNSUPPORTED_TYPE' }
    }

    return { success: true, instance }
  }

  // Depois de deployar um Pal, 3 coisas em ORDEM podem abrir uma escolha do jogador. Regra oficial
  // 10.5.3 (Check Timing): TODAS as rule actions resolvem primeiro (10.5.3.1), e só depois (quando
  // não sobra rule action nenhuma) as automatic abilities (On Deploy, etc.) podem ser jogadas
  // (10.5.3.2). A Regra 11.5 diz explicitamente "Overloaded Pals resolution is a check type rule
  // action" — ou seja, o sacrifício por excesso de 5 Pals tem que resolver ANTES do On Deploy da
  // carta recém-jogada, nunca depois. Ordem: 1) Regra 11.5 (excesso de Pals), 2) onDeploy da própria
  // carta (ex: Elphidran Aqua — "Draw 2 cards, choose 1 card from your hand..."), 3) onAllyDeploy de
  // outras cartas suas que observam qualquer deploy.
  runDeployFollowups(casterState, opponentState, instance, isBot) {
    return this._runDeployStep(0, casterState, opponentState, instance, isBot)
  }

  _runDeployStep(step, casterState, opponentState, instance, isBot) {
    if (step === 0) {
      const result = this.checkOverloadedPals(casterState, opponentState, instance, isBot)
      if (result.paused) {
        this._pendingDeployContinuation = { step: 1, casterState, opponentState, instance, isBot }
        return { paused: true }
      }
      return this._runDeployStep(1, casterState, opponentState, instance, isBot)
    }
    if (step === 1) {
      const result = EffectEngine.runTrigger(this, 'onDeploy', instance, casterState, opponentState, { isBot })
      if (result.paused) {
        this._pendingDeployContinuation = { step: 2, casterState, opponentState, instance, isBot }
        return { paused: true }
      }
      return this._runDeployStep(2, casterState, opponentState, instance, isBot)
    }
    EffectEngine.notifyAllyDeploy(this, casterState, opponentState, instance, { isBot })
    return { paused: !!this.pendingEffect }
  }

  // Regra 11.5 (Overloaded Pals Resolution): passar do limite de 5 Pals não bloqueia o deploy — o
  // Pal recém-colocado (`justDeployed`) fica garantido, e o jogador (dono da base) escolhe qual dos
  // OUTROS Pals já em campo vai pro cemitério até voltar ao limite. Só deployamos 1 Pal por vez neste
  // jogo, então o excedente é sempre exatamente 1.
  checkOverloadedPals(casterState, opponentState, justDeployed, isBot) {
    if (casterState.basePals.length <= MAX_PALS_IN_BASE) return { paused: false }
    const others = casterState.basePals.filter(p => p !== justDeployed)
    const toRemove = others.length - (MAX_PALS_IN_BASE - 1)
    if (toRemove <= 0) return { paused: false }

    if (isBot) {
      const sorted = [...others].sort((a, b) => (a.data.power || 0) - (b.data.power || 0))
      for (let i = 0; i < toRemove; i++) this._sendToGraveyard(sorted[i], casterState)
      return { paused: false }
    }

    const owner = casterState === this.player1 ? 'player' : 'bot'
    this.pendingEffect = {
      kind: 'effect',
      sourceCardName: justDeployed.data.name,
      description: `Sua base excedeu o limite de ${MAX_PALS_IN_BASE} Pals — escolha 1 para enviar ao cemitério.`,
      optional: false,
      actions: [{ type: 'destroy', target: { mode: 'choose' } }],
      instance: justDeployed, casterState, opponentState, context: {},
      validTargets: others.map(p => ({ owner, index: casterState.basePals.indexOf(p) }))
    }
    return { paused: true }
  }

  _endGame(winner) {
    this.gameOver = true
    this.winner = winner
    this._addLog(`${winner.playerName} VENCEU!`)
  }
}

module.exports = { TurnManager, PHASES }
