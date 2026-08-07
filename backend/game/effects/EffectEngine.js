// Runtime dos efeitos: recebe os dados já estruturados pelo EffectParser e realmente altera o estado
// da partida (dano, buffs, recursos, gatilhos, habilidades ACT, X, modais, night/exile). Ponto único
// chamado por TurnManager/PlayerState/server.js.

const { parseEffectText } = require('./EffectParser')

function getParsedEffects(cardData) {
  if (!cardData) {
    return {
      keywords: [], cont: [], onDeploy: [], onAttack: [], onGraveyard: [], onLeaveBase: [], onAttackStructure: [],
      onPlay: [], act: [], quick: [], hasInterrupt: false, modal: null
    }
  }
  if (!cardData._parsedEffects) {
    cardData._parsedEffects = parseEffectText(cardData.effect_text || '')
  }
  return cardData._parsedEffects
}

function hasKeyword(cardData, name) {
  return getParsedEffects(cardData).keywords.some(k => k.name.toLowerCase() === name.toLowerCase())
}

function getKeywordValue(cardData, name) {
  const kw = getParsedEffects(cardData).keywords.find(k => k.name.toLowerCase() === name.toLowerCase())
  return kw ? kw.value : null
}

function cardColors(cardData) {
  return (cardData.colors || []).map(c => String(c).toLowerCase())
}

function isNightFor(state) {
  return !!(state.turnManagerRef && state.turnManagerRef.isNight)
}

// Dicionário fechado de condições checáveis (ver EffectParser PRECONDITION_PATTERNS) — qualquer
// precondição não listada aqui simplesmente não é reconhecida em tempo de parse, então nunca chega aqui.
function checkPrecondition(id, sourceInstance, casterState, opponentState) {
  switch (id) {
    case 'hasRestingNocturnal':
      return casterState.basePals.some(p => !p.isStanding && hasKeyword(p.data, 'Nocturnal'))
    case 'noExiledByThis':
      return !(sourceInstance.exiledCards && sourceInstance.exiledCards.length)
    case 'isNight':
      return isNightFor(casterState)
    default:
      return true
  }
}

// Cartas em campo do jogador que podem ter CONT (Structure/Gear também concedem CONT ao time, ex:
// Lamp — 〈CONT doubleAutoAtNight〉/〈CONT grantNocturnalToTeam〉 — não só Pals).
function fieldCardsOf(state) {
  return [...state.basePals, ...state.baseStructures, ...state.baseGear]
}

function hasContOfType(state, contType) {
  return fieldCardsOf(state).some(c => getParsedEffects(c.data).cont.some(f => f.type === contType))
}

// ---------- Power/Strike efetivos (base + buff temporário + fórmulas CONT) ----------

function computeContinuousBonuses(instance, ownerState, opponentState) {
  let power = 0
  let strike = 0
  const ownFormulas = getParsedEffects(instance.data).cont
  const night = isNightFor(ownerState)

  for (const f of ownFormulas) {
    if (f.type === 'perStructure') power += f.amount * ownerState.baseStructures.length
    if (f.type === 'nameCountBuff') {
      const count = ownerState.basePals.filter(p => p.data.pal_name === f.palName).length
      power += f.amount * count
    }
    if (f.type === 'soulThreshold' && ownerState.totalSouls >= f.souls) {
      power += f.power
      strike += f.strike
    }
    if (f.type === 'colorBuff' && !f.excludeSelf && cardColors(instance.data).includes(f.color)) power += f.amount
    if (f.type === 'nameBuff' && instance.data.pal_name === f.palName) power += f.amount
  }

  if (night && (hasKeyword(instance.data, 'Nocturnal') || hasContOfType(ownerState, 'grantNocturnalToTeam'))) power += 300

  for (const other of ownerState.basePals) {
    if (other === instance) continue
    for (const f of getParsedEffects(other.data).cont) {
      if (f.type === 'colorBuff' && cardColors(instance.data).includes(f.color)) power += f.amount
      if (f.type === 'nameBuff' && instance.data.pal_name === f.palName) power += f.amount
    }
  }

  if (isNightFor(opponentState)) {
    for (const enemy of opponentState.basePals) {
      for (const f of getParsedEffects(enemy.data).cont) {
        if (f.type === 'nightDebuffOpponent') power += f.amount
      }
    }
  }

  // "If this card is in the rest state, all of your opponent's Pals get Strike -N" — independe de night;
  // do ponto de vista de `instance`, a carta descansada mora no lado adversário (opponentState).
  for (const enemy of opponentState.basePals) {
    if (enemy.isStanding) continue
    for (const f of getParsedEffects(enemy.data).cont) {
      if (f.type === 'restingDebuffOpponent') strike += f.amount
    }
  }

  return { power, strike }
}

function getEffectivePower(instance, ownerState, opponentState) {
  const bonus = computeContinuousBonuses(instance, ownerState, opponentState)
  return instance.data.power + (instance.tempPowerBonus || 0) + bonus.power
}

function getEffectiveStrike(instance, ownerState, opponentState) {
  const bonus = computeContinuousBonuses(instance, ownerState, opponentState)
  return instance.data.strike + (instance.tempStrikeBonus || 0) + bonus.strike
}

// ---------- Regras de alvo (Assault / restrição de custo / Taunt) ----------

function canBeAttackedBy(targetInstance, attackerInstance) {
  for (const f of getParsedEffects(targetInstance.data).cont) {
    if (f.type === 'attackRestriction') {
      const attackerCost = attackerInstance.data.cost
      if (f.cmp === 'less' && attackerCost <= f.cost) return false
      if (f.cmp === 'greater' && attackerCost >= f.cost) return false
    }
  }
  if (!targetInstance.isStanding) return true
  return hasKeyword(attackerInstance.data, 'Assault')
}

function getForcedTauntTargets(defendingState, attackerInstance) {
  return defendingState.basePals.filter(p => hasKeyword(p.data, 'Taunt') && canBeAttackedBy(p, attackerInstance))
}

// ---------- Block Declaration Step (9.4) ----------

function getValidBlockers(battle) {
  if (hasKeyword(battle.attackerInstance.data, 'Stealth')) return [] // "cannot be blocked" (12.11.2)
  const currentTargetInstance = battle.target.type === 'pal' ? battle.target.instance : null
  return battle.defenderState.basePals.filter(p =>
    p.isStanding && p !== currentTargetInstance && !p.cannotBlockUntilEndOfTurn
  )
}

// Bloqueia com o Pal em pé de maior Power se a troca for favorável/neutra, ou se o ataque
// (direto ao jogador) fosse deixar a vida do bot em 0 ou menos — heurística simples, documentada no plano.
function pickBotBlocker(battle, candidates) {
  if (!candidates.length) return null
  const attackerPower = getEffectivePower(battle.attackerInstance, battle.attackerState, battle.defenderState)
  const sorted = [...candidates].sort((a, b) =>
    getEffectivePower(b, battle.defenderState, battle.attackerState) - getEffectivePower(a, battle.defenderState, battle.attackerState)
  )
  const best = sorted[0]
  const bestPower = getEffectivePower(best, battle.defenderState, battle.attackerState)
  const wouldDie = battle.target.type === 'player' &&
    (battle.defenderState.life - getEffectiveStrike(battle.attackerInstance, battle.attackerState, battle.defenderState)) <= 0
  return (bestPower >= attackerPower || wouldDie) ? best : null
}

// ---------- Quick Step (9.5) / Interrupt (12.8) ----------

function canPayInterrupt(state) {
  return state.soulsStanding >= 1 || state.hand.length >= 2
}

function getPlayableQuickCards(state) {
  const options = []
  for (const card of state.hand) {
    const parsed = getParsedEffects(card)
    if (parsed.quick.length > 0 && state.soulsStanding >= (card.cost || 0)) options.push({ card, kind: 'quick' })
    if (parsed.hasInterrupt && canPayInterrupt(state)) options.push({ card, kind: 'interrupt' })
  }
  return options
}

function playQuickCard(turnManager, card, defenderState, attackerState) {
  defenderState.hand = defenderState.hand.filter(c => c !== card)
  defenderState.paySoulCost(card.cost || 0)
  defenderState.graveyard.push(card)
  turnManager._addLog(`${defenderState.playerName} jogou ${card.name} (Quick).`)

  const wrapper = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 }
  for (const clauseActions of getParsedEffects(card).quick) {
    const result = resolveRepeatableClause(turnManager, clauseActions, wrapper, defenderState, attackerState, false)
    if (result.paused) return { paused: true }
  }
  return { paused: false }
}

// ---------- Seleção de alvos para ações de efeito ----------

function matchesFilter(instance, filter = {}) {
  if (filter.standingOnly && !instance.isStanding) return false
  if (filter.costMax != null && instance.data.cost > filter.costMax) return false
  if (filter.costMin != null && instance.data.cost < filter.costMin) return false
  if (filter.powerMax != null && instance.data.power > filter.powerMax) return false
  if (filter.color && !cardColors(instance.data).includes(filter.color)) return false
  if (filter.palName && instance.data.pal_name !== filter.palName) return false
  return true
}

function computeValidTargets(spec, sourceInstance, casterState, opponentState) {
  if (spec.mode === 'self' || spec.mode === 'contextPal') return [{ owner: 'caster', instance: sourceInstance }]

  const pools = []
  if (spec.side === 'own' || spec.side === 'any') pools.push(...casterState.basePals.map(instance => ({ owner: 'caster', instance })))
  if (spec.side === 'opponent' || spec.side === 'any') pools.push(...opponentState.basePals.map(instance => ({ owner: 'opponent', instance })))
  return pools.filter(({ instance }) => matchesFilter(instance, spec.filter))
}

function ownerStateOf(instance, casterState, opponentState) {
  return casterState.basePals.includes(instance) ? casterState : opponentState
}

function randomDiscard(state) {
  if (state.hand.length === 0) return null
  const idx = Math.floor(Math.random() * state.hand.length)
  const [card] = state.hand.splice(idx, 1)
  state.graveyard.push(card)
  return card
}

function discardRandomN(state, n) {
  for (let i = 0; i < n; i++) randomDiscard(state)
}

function discardRandomOfType(state, cardType, n) {
  for (let i = 0; i < n; i++) {
    const idx = state.hand.findIndex(c => c.card_type === cardType)
    if (idx === -1) break
    state.graveyard.push(state.hand.splice(idx, 1)[0])
  }
}

function millTopCards(state, n) {
  for (let i = 0; i < n && state.deck.length > 0; i++) state.graveyard.push(state.deck.shift())
}

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ---------- Filtro de carta "de zona" (deck/cemitério/mão) — opera em CardData cru, não em instância ----------

function matchesCardFilter(card, filter = {}) {
  if (!card) return false
  if (filter.cardTypes && filter.cardTypes.length && !filter.cardTypes.includes(card.card_type)) return false
  if (typeof filter.costMax === 'number' && card.cost > filter.costMax) return false
  if (typeof filter.costMin === 'number' && card.cost < filter.costMin) return false
  if (typeof filter.costExact === 'number' && card.cost !== filter.costExact) return false
  if (filter.normalOnly && card.is_lucky) return false
  if (filter.palName && card.pal_name !== filter.palName) return false
  if (filter.typepalDragon && !(card.typepal || []).map(t => String(t).toLowerCase()).includes('dragon')) return false
  if (filter.color && !cardColors(card).includes(filter.color)) return false
  return true
}

// Resolve costMaxFormula/costExactFormula (ex: "cost of the assigned/butchered Pal") em número antes
// de filtrar — só existe quando a fórmula bate com algo reconhecido (ver EffectParser extractXFormula).
function resolveCardFilterDynamic(filter = {}, casterState, context) {
  const resolved = { ...filter }
  if (filter.costMaxFormula) resolved.costMax = resolveFormulaValue(filter.costMaxFormula, casterState, context)
  if (filter.costExactFormula) resolved.costExact = resolveFormulaValue(filter.costExactFormula, casterState, context)
  return resolved
}

// ---------- Variáveis X: fórmula (contagem do tabuleiro) ou escolha do jogador ----------

function resolveFormulaValue(formula, casterState, context) {
  if (!formula) return null
  switch (formula.type) {
    case 'countStructures': return casterState.baseStructures.length
    case 'countGears': return casterState.baseGear.length
    case 'countSouls': return casterState.totalSouls
    case 'fixed': return formula.value
    case 'costOfContextPal':
      if (!context || !context.contextPal) return null
      return Math.max(0, (context.contextPal.data.cost || 0) + (formula.modifier || 0))
    default: return null
  }
}

function resolveXAmount(formula, casterState, context) {
  const viaFormula = resolveFormulaValue(formula, casterState, context)
  if (viaFormula != null) return viaFormula
  return context && context.chosenAmount != null ? context.chosenAmount : 0
}

// ---------- Execução das ações ----------

function pickWeakest(instances) {
  if (!instances.length) return null
  return instances.reduce((a, b) => ((b.data.power || 0) < (a.data.power || 0) ? b : a))
}

// Retorna se a ação de fato teve efeito (usado pela consequência "então..." — só roda se a ação
// principal realmente aconteceu, ex: só ganha vida se algo foi descartado).
function applyAction(turnManager, action, sourceInstance, casterState, opponentState, resolvedInstance, context = {}) {
  if (action.precondition && !checkPrecondition(action.precondition, sourceInstance, casterState, opponentState)) return false

  const spec = action.target
  let targets = []
  if (spec) {
    if (spec.mode === 'self') targets = [sourceInstance]
    else if (spec.mode === 'contextPal') targets = context.contextPal ? [context.contextPal] : []
    else if (spec.mode === 'all') targets = computeValidTargets(spec, sourceInstance, casterState, opponentState).map(c => c.instance)
    else if (resolvedInstance) targets = [resolvedInstance]
  }

  const amount = action.amount === 'X' ? resolveXAmount(action.amountFormula, casterState, context) : action.amount

  switch (action.type) {
    case 'damage':
      for (const t of targets) {
        t.damageMarked += amount
        const ownerState = ownerStateOf(t, casterState, opponentState)
        const otherState = ownerState === casterState ? opponentState : casterState
        turnManager._addLog(`${sourceInstance.data.name} causou ${amount} de dano em ${t.data.name}.`)
        turnManager.checkAndRemoveIfDestroyed(t, ownerState, otherState)
      }
      return targets.length > 0
    case 'buffPower':
      for (const t of targets) t.tempPowerBonus += amount
      return targets.length > 0
    case 'buffStrike':
      for (const t of targets) t.tempStrikeBonus += amount
      return targets.length > 0
    case 'rest':
      for (const t of targets) t.rest()
      return targets.length > 0
    case 'stand':
      for (const t of targets) t.stand()
      return targets.length > 0
    case 'destroy':
      for (const t of targets) turnManager._sendToGraveyard(t, ownerStateOf(t, casterState, opponentState))
      return targets.length > 0
    case 'preventBlock':
      for (const t of targets) t.cannotBlockUntilEndOfTurn = true
      return targets.length > 0
    case 'returnToHand':
      for (const t of targets) turnManager._returnToHand(t, ownerStateOf(t, casterState, opponentState))
      return targets.length > 0
    case 'butcher':
      for (const t of targets) {
        const owner = ownerStateOf(t, casterState, opponentState)
        const butcheredData = t.data
        turnManager._sendToGraveyard(t, owner)
        notifyAllyButcher(turnManager, owner, owner === casterState ? opponentState : casterState, owner !== turnManager.player1, butcheredData)
      }
      return targets.length > 0
    case 'opponentDestroyWeakest': {
      const weakest = pickWeakest(opponentState.basePals)
      if (weakest) turnManager._sendToGraveyard(weakest, opponentState)
      return !!weakest
    }
    case 'exile':
      for (const t of targets) {
        const owner = ownerStateOf(t, casterState, opponentState)
        const idx = owner.basePals.indexOf(t)
        if (idx !== -1) {
          owner.basePals.splice(idx, 1)
          sourceInstance.exiledCards = sourceInstance.exiledCards || []
          sourceInstance.exiledCards.push({ data: t.data, ownerState: owner })
        }
      }
      return targets.length > 0
    case 'returnExiledToField':
      turnManager.returnExiledPals(sourceInstance, 'field')
      return true
    case 'returnExiledToHand':
      turnManager.returnExiledPals(sourceInstance, 'hand')
      return true
    case 'setNight':
      turnManager.nightUntilTurn = turnManager.turnNumber + 1
      turnManager._addLog('Anoiteceu.')
      return true
    case 'draw':
      for (let i = 0; i < amount; i++) casterState.drawCard()
      return true
    case 'gainLife':
      casterState.life += amount
      return true
    case 'gainMaterial':
      casterState.gainMaterial(amount)
      turnManager._addLog(`${casterState.playerName} ganhou ${amount} Material.`)
      return true
    case 'gainIngredient':
      casterState.gainIngredient(amount)
      turnManager._addLog(`${casterState.playerName} ganhou ${amount} Ingredient.`)
      return true
    case 'standSouls':
      casterState.standSouls(amount)
      return true
    case 'addRestedSoul':
      context.soulsBeforeAddRestedSoul = casterState.totalSouls
      casterState.addRestedSoul(amount)
      return true
    case 'standSoulsIfThreshold': {
      const before = context.soulsBeforeAddRestedSoul != null ? context.soulsBeforeAddRestedSoul : casterState.totalSouls
      if (before < action.threshold) return false
      casterState.standSouls(action.standAmount)
      return true
    }
    case 'opponentDiscardRandom': {
      const discarded = randomDiscard(opponentState)
      if (discarded) turnManager._addLog(`${opponentState.playerName} descartou ${discarded.name} (efeito de ${sourceInstance.data.name}).`)
      return !!discarded
    }
    case 'discardOwnHandRandom': {
      const discarded = randomDiscard(casterState)
      if (discarded) turnManager._addLog(`${casterState.playerName} descartou ${discarded.name} (efeito de ${sourceInstance.data.name}).`)
      return !!discarded
    }
    default:
      return false
  }
}

function pickBotTarget(candidates, siblingActions) {
  const isHarmful = siblingActions.some(a =>
    a.type === 'damage' || a.type === 'destroy' || a.type === 'rest' || a.type === 'preventBlock' ||
    (a.type === 'buffPower' && a.amount < 0) || (a.type === 'buffStrike' && a.amount < 0)
  )
  const sorted = [...candidates].sort((a, b) => (b.instance.data.power || 0) - (a.instance.data.power || 0))
  const preferred = isHarmful ? sorted.find(c => c.owner === 'opponent') : sorted.find(c => c.owner === 'caster')
  return preferred || sorted[0]
}

// player1/player2 do TurnManager são SEMPRE, respectivamente, quem joga (humano) e o bot —
// server.js sempre constrói `new TurnManager(playerState, botState, ...)` nessa ordem.
function absoluteTarget(turnManager, casterState, candidate) {
  const isCasterPlayer = casterState === turnManager.player1
  const candidateIsCaster = candidate.owner === 'caster'
  const owner = candidateIsCaster === isCasterPlayer ? 'player' : 'bot'
  const stateForCandidate = owner === 'player' ? turnManager.player1 : turnManager.player2
  return { owner, index: stateForCandidate.basePals.indexOf(candidate.instance) }
}

// ---------- Resolução de uma lista de ações (gatilho AUTO, corpo de ACT, Quick ou opção modal) ----------

function resolveClauseActions(turnManager, clauseActions, instance, casterState, opponentState, isBot, context = {}) {
  if (clauseActions.length === 1 && clauseActions[0].type === 'cardRevealBranch') {
    applyCardRevealBranch(turnManager, clauseActions[0], instance, casterState)
    return { paused: false }
  }
  // cardSelect normalmente é a única ação da cláusula, mas em "Draw N, choose 1 card from hand,
  // and put it on top of the deck" ele vem depois de outra ação na MESMA sentença — as ações antes
  // dele rodam direto; ele sempre precisa ser a ÚLTIMA (nenhuma carta atual tem ação depois dele).
  const cardSelectIdx = clauseActions.findIndex(a => a.type === 'cardSelect')
  if (cardSelectIdx !== -1) {
    for (let i = 0; i < cardSelectIdx; i++) {
      applyAction(turnManager, clauseActions[i], instance, casterState, opponentState, null, context)
    }
    return startCardChoice(turnManager, clauseActions[cardSelectIdx], instance, casterState, opponentState, isBot, context)
  }

  // "Your opponent chooses 1 card from their hand, and discards it" / "choose 1 card from your
  // hand, and discard it" — quem descarta é quem o texto diz (não necessariamente o `casterState`),
  // e a escolha é DELA, não decidida pelo motor. Reaproveita o cardSelect com destino 'discard'.
  const handDiscardIdx = clauseActions.findIndex(a => a.type === 'opponentDiscardChoice' || a.type === 'discardOwnHandChoice')
  if (handDiscardIdx !== -1) {
    for (let i = 0; i < handDiscardIdx; i++) {
      applyAction(turnManager, clauseActions[i], instance, casterState, opponentState, null, context)
    }
    const chooserState = clauseActions[handDiscardIdx].type === 'opponentDiscardChoice' ? opponentState : casterState
    const chooserIsBot = chooserState === turnManager.player2
    const discardAction = { type: 'cardSelect', source: 'hand', mandatory: true, filter: {}, destination: 'discard', remainder: null, zeroBonus: null }
    return startCardChoice(turnManager, discardAction, instance, chooserState, casterState, chooserIsBot, {})
  }

  // "Your opponent chooses 1 of their Pals, and puts it into the graveyard" — mesma lógica, só que
  // o alvo é um Pal em campo (reaproveita o sistema de target genérico, só invertendo quem escolhe).
  const opponentDestroyIdx = clauseActions.findIndex(a => a.type === 'opponentDestroyChoice')
  if (opponentDestroyIdx !== -1) {
    for (let i = 0; i < opponentDestroyIdx; i++) {
      applyAction(turnManager, clauseActions[i], instance, casterState, opponentState, null, context)
    }
    if (!opponentState.basePals.length) return { paused: false }
    if (opponentState === turnManager.player2) {
      // heurística própria pro bot (sacrifica o mais fraco) — NÃO reaproveita pickBotTarget, que
      // pra ações "destroy" prefere alvo do lado 'opponent' e erraria escolhendo o mais forte aqui.
      const weakest = pickWeakest(opponentState.basePals)
      if (weakest) turnManager._sendToGraveyard(weakest, opponentState)
      return { paused: false }
    }
    const destroyAction = { type: 'destroy', target: { mode: 'choose', upTo: false, count: 1, side: 'own', filter: {} } }
    return resolveClauseActions(turnManager, [destroyAction], instance, opponentState, casterState, false, {})
  }

  const chooseAction = clauseActions.find(a => a.target && a.target.mode === 'choose')
  if (!chooseAction) {
    let thenTrigger = false
    for (const action of clauseActions) {
      if (applyAction(turnManager, action, instance, casterState, opponentState, null, context)) thenTrigger = true
    }
    if (clauseActions.then && thenTrigger) {
      resolveRepeatableClause(turnManager, clauseActions.then, instance, casterState, opponentState, isBot, context)
    }
    return { paused: false }
  }

  const spec = chooseAction.target
  const candidates = computeValidTargets(spec, instance, casterState, opponentState)
  const siblingActions = clauseActions.filter(a => a.target === spec)

  if (candidates.length === 0) return { paused: false }

  if (isBot) {
    const chosen = pickBotTarget(candidates, siblingActions)
    let thenTrigger = false
    for (const action of siblingActions) {
      if (applyAction(turnManager, action, instance, casterState, opponentState, chosen.instance, context)) thenTrigger = true
    }
    if (clauseActions.then && thenTrigger) {
      resolveRepeatableClause(turnManager, clauseActions.then, instance, casterState, opponentState, isBot, context)
    }
    return { paused: false }
  }

  turnManager.pendingEffect = {
    kind: 'effect',
    sourceCardName: instance.data.name,
    description: instance.data.effect_text,
    optional: !!spec.upTo,
    actions: siblingActions,
    then: clauseActions.then || null,
    instance, casterState, opponentState, context,
    validTargets: candidates.map(c => absoluteTarget(turnManager, casterState, c))
  }
  return { paused: true }
}

// Uma cláusula pode precisar se repetir N vezes ("Perform ... X times" / "Choose up to X Pals...") —
// N vem de fórmula (contagem do tabuleiro) ou do valor que o jogador escolheu ao pagar o custo.
// Cada repetição pode pausar esperando alvo; ao resolver, a próxima já é encadeada automaticamente.
function resolveRepeatableClause(turnManager, clauseActions, instance, casterState, opponentState, isBot, context = {}) {
  if (clauseActions.length && clauseActions[0].precondition &&
    !checkPrecondition(clauseActions[0].precondition, instance, casterState, opponentState)) {
    return { paused: false }
  }
  if (!clauseActions.repeats) {
    return resolveClauseActions(turnManager, clauseActions, instance, casterState, opponentState, isBot, context)
  }
  const total = resolveXAmount(clauseActions.repeatFormula, casterState, context)
  return runRepeatIterations(turnManager, clauseActions, instance, casterState, opponentState, isBot, context, total, 0)
}

function runRepeatIterations(turnManager, clauseActions, instance, casterState, opponentState, isBot, context, total, index) {
  if (index >= total) return { paused: false }
  const result = resolveClauseActions(turnManager, clauseActions, instance, casterState, opponentState, isBot, context)
  if (result.paused) {
    turnManager.pendingEffect.repeat = { clauseActions, instance, casterState, opponentState, isBot, context, total, index: index + 1 }
    return { paused: true }
  }
  return runRepeatIterations(turnManager, clauseActions, instance, casterState, opponentState, isBot, context, total, index + 1)
}

// ---------- Escolha de carta de uma zona (topo do deck / cemitério / mão) — ação `cardSelect` ----------

// Variante sem escolha do jogador: revela 1, manda pra A ou B automaticamente conforme o filtro.
function applyCardRevealBranch(turnManager, action, instance, casterState) {
  if (casterState.deck.length === 0) return
  const card = casterState.deck.shift()
  if (matchesCardFilter(card, action.filter)) casterState.hand.push(card)
  else casterState.graveyard.push(card)
  turnManager._addLog(`${casterState.playerName} revelou ${card.name}.`)
}

function startCardChoice(turnManager, action, instance, casterState, opponentState, isBot, context = {}) {
  const resolvedFilter = resolveCardFilterDynamic(action.filter, casterState, context)
  const resolvedAction = { ...action, filter: resolvedFilter }

  let revealed = null
  let matching
  if (action.source === 'deckTop') {
    const n = Math.min(action.count || 1, casterState.deck.length)
    revealed = casterState.deck.slice(0, n)
    matching = revealed.filter(c => matchesCardFilter(c, resolvedFilter))
  } else if (action.source === 'graveyard') {
    matching = casterState.graveyard.filter(c => matchesCardFilter(c, resolvedFilter))
  } else if (action.source === 'hand') {
    matching = casterState.hand.filter(c => matchesCardFilter(c, resolvedFilter))
  } else {
    return { paused: false }
  }

  if (isBot) {
    const chosen = matching.length ? matching[0] : null
    finishCardChoice(turnManager, resolvedAction, instance, casterState, opponentState, context, revealed, chosen)
    return { paused: false }
  }

  // Deck vazio (nada foi de fato revelado) — não há o que mostrar, resolve direto.
  if (action.source === 'deckTop' && revealed.length === 0) {
    finishCardChoice(turnManager, resolvedAction, instance, casterState, opponentState, context, revealed, null)
    return { paused: false }
  }

  // "Look at/Reveal the top N cards" sempre mostra o que foi revelado, mesmo quando nada bate no
  // filtro — só resolve sozinho, sem popup, quando a fonte é cemitério/mão (busca direta, sem
  // "olhar N antes" pra mostrar) e não achou nada.
  if (action.source !== 'deckTop' && !matching.length) {
    finishCardChoice(turnManager, resolvedAction, instance, casterState, opponentState, context, revealed, null)
    return { paused: false }
  }

  // Quem não bate no filtro aparece desabilitada, em vez de simplesmente desaparecer sem explicação.
  const displayPool = action.source === 'deckTop' ? revealed : matching
  const cards = displayPool.map(card => ({ card, selectable: matching.includes(card) }))

  turnManager.pendingEffect = {
    kind: 'cardChoice',
    sourceCardName: instance.data.name,
    description: instance.data.effect_text,
    optional: !action.mandatory || !matching.length,
    action: resolvedAction, instance, casterState, opponentState, context, revealed,
    cards
  }
  return { paused: true }
}

function resolveCardChoice(turnManager, choice) {
  const pending = turnManager.pendingEffect
  if (!pending || pending.kind !== 'cardChoice') return
  let chosenCard = null
  if (!choice.skip) {
    const entry = pending.cards[choice.index]
    if (!entry || !entry.selectable) return
    chosenCard = entry.card
  } else if (!pending.optional) {
    return
  }
  turnManager.pendingEffect = null
  finishCardChoice(turnManager, pending.action, pending.instance, pending.casterState, pending.opponentState, pending.context, pending.revealed, chosenCard)
  if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
}

function finishCardChoice(turnManager, action, instance, casterState, opponentState, context, revealed, chosenCard) {
  if (action.source === 'deckTop') {
    casterState.deck.splice(0, revealed.length)
    const remainder = chosenCard ? revealed.filter(c => c !== chosenCard) : revealed
    if (chosenCard) applyCardDestination(turnManager, action, casterState, opponentState, instance, chosenCard)
    if (remainder.length) {
      if (action.remainder === 'shuffle') casterState.deck = shuffleArray([...remainder, ...casterState.deck])
      else if (action.remainder === 'graveyard') casterState.graveyard.push(...remainder)
      else if (action.remainder === 'putBack') casterState.deck.unshift(...remainder)
      else if (action.remainder === 'hand') casterState.hand.push(...remainder)
    }
  } else if (action.source === 'graveyard') {
    if (chosenCard) {
      casterState.graveyard = casterState.graveyard.filter(c => c !== chosenCard)
      applyCardDestination(turnManager, action, casterState, opponentState, instance, chosenCard)
    }
  } else if (action.source === 'hand') {
    if (chosenCard && action.destination !== 'revealOnly') {
      casterState.hand = casterState.hand.filter(c => c !== chosenCard)
    }
    if (chosenCard) applyCardDestination(turnManager, action, casterState, opponentState, instance, chosenCard)
  }

  if (!chosenCard && action.zeroBonus) {
    resolveRepeatableClause(turnManager, action.zeroBonus, instance, casterState, opponentState, false, context)
  }

  // "Your opponent chooses 1 card from their hand, and discards it" — roda depois da escolha do
  // cemitério/mão (não é condicional a ter escolhido algo, então roda mesmo se `chosenCard` for null).
  if (action.andThen) {
    resolveRepeatableClause(turnManager, action.andThen, instance, casterState, opponentState, false, context)
  }
}

function applyCardDestination(turnManager, action, casterState, opponentState, instance, card) {
  switch (action.destination) {
    case 'hand':
      casterState.hand.push(card)
      turnManager._addLog(`${casterState.playerName} adicionou ${card.name} à mão.`)
      break
    case 'deploy':
      turnManager.deployCardFree(casterState, opponentState, card)
      break
    case 'deployDiscount':
      turnManager.deployCardFree(casterState, opponentState, card, { payCost: true, discount: action.discountAmount || 0 })
      break
    case 'deployRested':
      turnManager.deployCardFree(casterState, opponentState, card, { rested: true })
      break
    case 'revealOnly':
      turnManager._addLog(`${casterState.playerName} revelou ${card.name}.`)
      if (action.checkFilter && action.then && matchesCardFilter(card, action.checkFilter)) {
        resolveRepeatableClause(turnManager, action.then, instance, casterState, opponentState, false, {})
      }
      break
    case 'topOfDeck':
      casterState.deck.unshift(card)
      turnManager._addLog(`${casterState.playerName} colocou ${card.name} no topo do deck.`)
      break
    case 'discard':
      casterState.graveyard.push(card)
      turnManager._addLog(`${casterState.playerName} descartou ${card.name} (efeito de ${instance.data.name}).`)
      break
  }
}

// ---------- Gatilho "global": observa QUALQUER carta sua sendo deployada/abatida (não só a própria) ----------

function checkAllyDeployCondition(condition, deployedCardData) {
  if (!condition) return true
  if (condition.color) return cardColors(deployedCardData).includes(condition.color)
  if (condition.keyword) return hasKeyword(deployedCardData, condition.keyword)
  return true
}

function allWatcherInstances(casterState) {
  return [...casterState.basePals, ...casterState.baseStructures, ...casterState.baseGear]
}

function notifyAllyDeploy(turnManager, casterState, opponentState, deployedInstance, { isBot } = {}) {
  for (const watcher of allWatcherInstances(casterState)) {
    if (watcher === deployedInstance) continue
    const clauses = getParsedEffects(watcher.data).onAllyDeploy || []
    for (const entry of clauses) {
      if (!checkAllyDeployCondition(entry.condition, deployedInstance.data)) continue
      resolveRepeatableClause(turnManager, entry.actions, watcher, casterState, opponentState, isBot, { contextPal: deployedInstance })
    }
  }
}

function notifyAllyButcher(turnManager, casterState, opponentState, isBot, butcheredCardData) {
  for (const watcher of allWatcherInstances(casterState)) {
    const clauses = getParsedEffects(watcher.data).onAllyButcher || []
    for (const entry of clauses) {
      resolveRepeatableClause(turnManager, entry.actions, watcher, casterState, opponentState, isBot, { contextPal: { data: butcheredCardData } })
    }
  }
}

// ---------- Gatilhos AUTO ----------

// "If it is night, your Pal's AUTO activates twice" — dobra a execução de qualquer bucket AUTO
// enquanto o jogador controlar essa carta e for noite (Event/Quick não contam, só AUTO).
function shouldDoubleAuto(triggerName, casterState) {
  if (triggerName === 'onPlay' || triggerName === 'quick') return false
  if (!isNightFor(casterState)) return false
  return hasContOfType(casterState, 'doubleAutoAtNight')
}

function runTrigger(turnManager, triggerName, instance, casterState, opponentState, { isBot } = {}) {
  if (triggerName === 'onAttack') {
    const brave = getKeywordValue(instance.data, 'Brave')
    if (brave) instance.tempPowerBonus += brave
  }

  const clauses = getParsedEffects(instance.data)[triggerName] || []
  const repeatCount = shouldDoubleAuto(triggerName, casterState) ? 2 : 1
  for (let rep = 0; rep < repeatCount; rep++) {
    for (const clauseActions of clauses) {
      const result = resolveRepeatableClause(turnManager, clauseActions, instance, casterState, opponentState, isBot)
      if (result.paused) return { paused: true }
    }
  }
  return { paused: false }
}

// ---------- Efeitos modais ("Choose 1 of the following") ----------

function startModalChoice(turnManager, instance, casterState, opponentState) {
  const options = getParsedEffects(instance.data).modal
  if (!options) return false
  turnManager.pendingEffect = {
    kind: 'modal',
    sourceCardName: instance.data.name,
    description: instance.data.effect_text,
    options,
    instance, casterState, opponentState
  }
  return true
}

function resolveModalChoice(turnManager, optionIndex) {
  const pending = turnManager.pendingEffect
  if (!pending || pending.kind !== 'modal') return
  turnManager.pendingEffect = null
  const option = pending.options[optionIndex]
  if (!option) return
  resolveRepeatableClause(turnManager, option.actions, pending.instance, pending.casterState, pending.opponentState, false, {})
  if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
}

// ---------- Habilidades ACT (ativadas manualmente, com custo) ----------

const VARIABLE_COST_TYPES = ['consumeMaterialX', 'consumeIngredientX', 'discardHandX']

function maxForVariableCost(item, casterState) {
  switch (item.type) {
    case 'consumeMaterialX': return casterState.material
    case 'consumeIngredientX': return casterState.ingredient
    case 'discardHandX': return casterState.hand.length
    default: return 0
  }
}

function canPayCostItem(item, instance, casterState) {
  switch (item.type) {
    case 'restSelf': return instance.isStanding
    case 'consumeMaterial': return casterState.material >= item.amount
    case 'consumeIngredient': return casterState.ingredient >= item.amount
    case 'consumeMaterialX': return casterState.material >= 1
    case 'consumeIngredientX': return casterState.ingredient >= 1
    case 'discardHandX': return casterState.hand.length >= 1
    case 'assignPal': return casterState.basePals.some(p => p !== instance && p.isStanding)
    case 'butcherPal': return casterState.basePals.some(p => p !== instance)
    case 'discardHand': return casterState.hand.length >= item.amount
    case 'discardHandType': return casterState.hand.filter(c => c.card_type === item.cardType).length >= item.amount
    case 'soulCost': return casterState.soulsStanding >= item.amount
    case 'millTopCards': return true
    default: return false
  }
}

function canPayCostGroup(group, instance, casterState) {
  return group.every(item => canPayCostItem(item, instance, casterState))
}

function getActAbilities(cardData) {
  return getParsedEffects(cardData).act
}

function canActivateAbility(instance, casterState, actIndex = 0) {
  const ability = getActAbilities(instance.data)[actIndex]
  if (!ability) return false
  if (ability.oncePerTurn && instance.actUsedThisTurn) return false
  return ability.costGroups.some(g => canPayCostGroup(g, instance, casterState))
}

function payCostGroup(turnManager, group, context, pickedInstance, instance, casterState) {
  for (const item of group) {
    switch (item.type) {
      case 'restSelf': instance.rest(); break
      case 'consumeMaterial': casterState.material -= item.amount; break
      case 'consumeIngredient': casterState.ingredient -= item.amount; break
      case 'consumeMaterialX': casterState.material -= context.chosenAmount; break
      case 'consumeIngredientX': casterState.ingredient -= context.chosenAmount; break
      case 'assignPal': if (pickedInstance) pickedInstance.rest(); break
      case 'butcherPal': if (pickedInstance) turnManager._sendToGraveyard(pickedInstance, casterState); break
      case 'discardHand': discardRandomN(casterState, item.amount); break
      case 'discardHandX': discardRandomN(casterState, context.chosenAmount); break
      case 'discardHandType': discardRandomOfType(casterState, item.cardType, item.amount); break
      case 'soulCost': casterState.paySoulCost(item.amount); break
      case 'millTopCards': millTopCards(casterState, item.amount); break
    }
  }
}

function finishActivation(turnManager, ability, group, context, pickedInstance, instance, casterState, opponentState, isBot) {
  if (pickedInstance) context.contextPal = pickedInstance
  const butcheredData = pickedInstance && group.some(item => item.type === 'butcherPal') ? pickedInstance.data : null
  payCostGroup(turnManager, group, context, pickedInstance, instance, casterState)
  if (butcheredData) notifyAllyButcher(turnManager, casterState, opponentState, isBot, butcheredData)
  if (ability.oncePerTurn) instance.actUsedThisTurn = true
  const result = resolveRepeatableClause(turnManager, ability.actions, instance, casterState, opponentState, isBot, context)
  return { success: true, ...result }
}

function proceedActivation(turnManager, ability, group, context, instance, casterState, opponentState, isBot) {
  const varItem = group.find(item => VARIABLE_COST_TYPES.includes(item.type))
  if (varItem && context.chosenAmount == null) {
    const max = maxForVariableCost(varItem, casterState)
    if (max < 1) return { success: false, reason: 'CANNOT_PAY' }

    if (isBot) {
      context.chosenAmount = 1
    } else {
      turnManager.pendingEffect = {
        kind: 'amount',
        sourceCardName: instance.data.name,
        description: instance.data.effect_text,
        min: 1, max,
        ability, group, context, instance, casterState, opponentState
      }
      return { success: true, paused: true }
    }
  }

  const pickItem = group.find(item => item.type === 'assignPal' || item.type === 'butcherPal')
  if (pickItem) {
    const candidates = casterState.basePals.filter(p =>
      p !== instance && (pickItem.type !== 'assignPal' || p.isStanding)
    )
    if (!candidates.length) return { success: false, reason: 'CANNOT_PAY' }

    if (isBot) {
      const chosen = candidates.reduce((a, b) => (b.data.power < a.data.power ? b : a))
      return finishActivation(turnManager, ability, group, context, chosen, instance, casterState, opponentState, isBot)
    }

    turnManager.pendingEffect = {
      kind: 'cost',
      sourceCardName: instance.data.name,
      description: instance.data.effect_text,
      optional: false,
      ability, group, context, instance, casterState, opponentState,
      validTargets: candidates.map(p => absoluteTarget(turnManager, casterState, { owner: 'caster', instance: p }))
    }
    return { success: true, paused: true }
  }

  return finishActivation(turnManager, ability, group, context, null, instance, casterState, opponentState, isBot)
}

function activateAbility(turnManager, instance, casterState, opponentState, actIndex = 0, { isBot } = {}) {
  const ability = getActAbilities(instance.data)[actIndex]
  if (!ability) return { success: false, reason: 'NO_ABILITY' }
  if (ability.oncePerTurn && instance.actUsedThisTurn) return { success: false, reason: 'ALREADY_USED' }

  const group = ability.costGroups.find(g => canPayCostGroup(g, instance, casterState))
  if (!group) return { success: false, reason: 'CANNOT_PAY' }

  return proceedActivation(turnManager, ability, group, {}, instance, casterState, opponentState, isBot)
}

// ---------- Retomada de efeito/custo/quantidade pendente ----------

function continuePendingEffect(turnManager, choice) {
  const pending = turnManager.pendingEffect
  if (!pending) return
  turnManager.pendingEffect = null

  if (choice.skip) {
    turnManager._resumeAttackAfterTrigger()
    return
  }

  if (pending.kind === 'amount') {
    const amount = Math.max(pending.min, Math.min(pending.max, parseInt(choice.amount, 10) || pending.min))
    pending.context.chosenAmount = amount
    proceedActivation(turnManager, pending.ability, pending.group, pending.context, pending.instance, pending.casterState, pending.opponentState, false)
    if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
    return
  }

  const targetState = choice.owner === 'player' ? turnManager.player1 : turnManager.player2
  const chosenInstance = targetState.basePals[choice.index]
  if (!chosenInstance) {
    turnManager._resumeAttackAfterTrigger()
    return
  }

  if (pending.kind === 'cost') {
    finishActivation(turnManager, pending.ability, pending.group, pending.context, chosenInstance, pending.instance, pending.casterState, pending.opponentState, false)
    if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
    return
  }

  // kind === 'effect'
  let thenTrigger = false
  for (const action of pending.actions) {
    if (applyAction(turnManager, action, pending.instance, pending.casterState, pending.opponentState, chosenInstance, pending.context || {})) thenTrigger = true
  }
  if (pending.then && thenTrigger) {
    resolveRepeatableClause(turnManager, pending.then, pending.instance, pending.casterState, pending.opponentState, false, pending.context || {})
  }
  if (pending.repeat) {
    const r = pending.repeat
    runRepeatIterations(turnManager, r.clauseActions, r.instance, r.casterState, r.opponentState, r.isBot, r.context, r.total, r.index)
  }
  if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
}

module.exports = {
  getParsedEffects,
  hasKeyword,
  getKeywordValue,
  getEffectivePower,
  getEffectiveStrike,
  canBeAttackedBy,
  getForcedTauntTargets,
  runTrigger,
  continuePendingEffect,
  getActAbilities,
  canActivateAbility,
  activateAbility,
  getValidBlockers,
  pickBotBlocker,
  getPlayableQuickCards,
  playQuickCard,
  startModalChoice,
  resolveModalChoice,
  resolveCardChoice,
  notifyAllyDeploy
}
