// Runtime dos efeitos: recebe os dados já estruturados pelo EffectParser e realmente altera o estado
// da partida (dano, buffs, recursos, gatilhos, habilidades ACT, X, modais, night/exile). Ponto único
// chamado por TurnManager/PlayerState/server.js.

const { parseEffectText } = require('./EffectParser')

function getParsedEffects(cardData) {
  if (!cardData) {
    return {
      keywords: [], cont: [], onDeploy: [], onAttack: [], onGraveyard: [], onLeaveBase: [], onAttackStructure: [],
      onAssign: [], onAssignToWorkStructure: [], onPlay: [], act: [], quick: [], hasInterrupt: false, modal: null
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

// Keyword estática da carta OU concedida temporariamente até o fim do turno (ex: Digtoise ganhando
// Breakthrough, Gumoss ganhando Assault) — ver 'grantKeywordUntilEndOfTurn' em applyAction.
function hasKeywordOrGranted(instance, name) {
  return hasKeyword(instance.data, name) ||
    !!(instance.grantedKeywordsUntilEndOfTurn && instance.grantedKeywordsUntilEndOfTurn.has(name))
}

// pal_name real da carta OU nome declarado temporariamente até o fim do turno (Antique Dresser —
// "Declare 1 card name. Choose all of your cards, and they get that declared card name in addition
// until end of turn.") — ver 'declareNameForTeam'/'applyDeclaredNameForTeam' em applyAction.
function hasName(instance, name) {
  return instance.data.pal_name === name ||
    !!(instance.grantedNamesUntilEndOfTurn && instance.grantedNamesUntilEndOfTurn.has(name))
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

// Nomes DISTINTOS entre as cartas informadas cujo nome contém `substring` (ex: 《Antique》, 《My First》)
// — usado tanto pela fórmula de X (Antique Curtain) quanto pela precondição de threshold (The Adventure
// Begins), por isso vive fora de qualquer um dos dois.
function countDistinctNamesContaining(instances, substring) {
  const names = new Set(instances.filter(c => (c.data.name || '').includes(substring)).map(c => c.data.name))
  return names.size
}

// Dicionário fechado de condições checáveis (ver EffectParser PRECONDITION_PATTERNS) — qualquer
// precondição não listada aqui simplesmente não é reconhecida em tempo de parse, então nunca chega aqui.
// `precondition` pode ser uma string (id fixo) OU um objeto {id, ...params} (ex: distinctPalNameSubstring
// — ver parseDistinctNameThresholdClause), quando a condição precisa carregar parâmetros do texto.
function checkPrecondition(precondition, sourceInstance, casterState, opponentState) {
  const id = typeof precondition === 'string' ? precondition : precondition.id
  switch (id) {
    case 'hasRestingNocturnal':
      return casterState.basePals.some(p => !p.isStanding && hasKeyword(p.data, 'Nocturnal'))
    case 'noExiledByThis':
      return !(sourceInstance.exiledCards && sourceInstance.exiledCards.length)
    case 'isNight':
      return isNightFor(casterState)
    // "If you have not played any other cards during this game, ..." (The Adventure Begins) — ela
    // mesma já conta como 1 jogada (incrementado antes do onPlay resolver, ver PlayerState/server.js).
    case 'noOtherCardsPlayedThisGame':
      return (casterState.cardsPlayedThisGame || 0) <= 1
    // "If you have N or more Pals with 《X》 in their different card names, ..." (The Adventure Begins)
    case 'distinctPalNameSubstring':
      return countDistinctNamesContaining(casterState.basePals, precondition.substring) >= precondition.min
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

// "CONT When your red card would deal Damage other than battle damage to a Pal, deal +200 Damage
// instead (Strengthens this card's ability too)." (Suzaku – Hellfire Wings) — soma de todas as
// concessões desse tipo no campo de `state` (inclui a própria fonte, por isso o "too" do texto).
function getRedNonBattleDamageBonus(state) {
  let bonus = 0
  for (const c of fieldCardsOf(state)) {
    for (const f of getParsedEffects(c.data).cont) {
      if (f.type === 'redNonBattleDamageBonus') bonus += f.amount
    }
  }
  return bonus
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
      const count = ownerState.basePals.filter(p => hasName(p, f.palName)).length
      power += f.amount * count
    }
    if (f.type === 'soulThreshold' && ownerState.totalSouls >= f.souls) {
      power += f.power
      strike += f.strike
    }
    if (f.type === 'colorBuff' && !f.excludeSelf && cardColors(instance.data).includes(f.color)) power += f.amount
    if (f.type === 'nameBuff' && hasName(instance, f.palName)) power += f.amount
  }

  if (night && (hasKeyword(instance.data, 'Nocturnal') || hasContOfType(ownerState, 'grantNocturnalToTeam'))) power += 300

  // colorBuff/nameBuff concedido por OUTRA carta do time — inclui Structure/Gear (ex: Flame Cauldron,
  // "CONT All of your red Pals get Power +200"), não só outros Pals (mesmo motivo do fieldCardsOf acima).
  for (const other of fieldCardsOf(ownerState)) {
    if (other === instance) continue
    for (const f of getParsedEffects(other.data).cont) {
      if (f.type === 'colorBuff' && cardColors(instance.data).includes(f.color)) power += f.amount
      if (f.type === 'nameBuff' && hasName(instance, f.palName)) power += f.amount
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
  return hasKeywordOrGranted(attackerInstance, 'Assault')
}

// Taunt pode vir da carta (keyword estática) ou de uma concessão temporária (ex: No Pals Beyond Sign —
// "The Pal assigned to this card gets Taunt until the end of the opponent's next turn").
function hasGrantedTaunt(instance, turnManager) {
  return instance.tauntGrantedUntilTurn != null && turnManager.turnNumber <= instance.tauntGrantedUntilTurn
}

// "Your opponent cannot attack other targets if a card with taunt can be targeted for an attack" —
// o texto da keyword diz "a card", não "a Pal": Structure com Taunt (ex: Wooden Wall) força o ataque
// tanto quanto um Pal com Taunt. Structure não tem "estado de combate" (sempre é alvo válido — ver
// declareAttack), então não passa por canBeAttackedBy (que é uma checagem Pal-específica de pé/Assault).
function getForcedTauntTargets(defendingState, attackerInstance) {
  const tm = defendingState.turnManagerRef
  const pals = defendingState.basePals
    .filter(p => (hasKeyword(p.data, 'Taunt') || (tm && hasGrantedTaunt(p, tm))) && canBeAttackedBy(p, attackerInstance))
    .map(instance => ({ type: 'pal', instance }))
  const structures = defendingState.baseStructures
    .filter(s => hasKeyword(s.data, 'Taunt'))
    .map(instance => ({ type: 'structure', instance }))
  return [...pals, ...structures]
}

// ---------- Block Declaration Step (9.4) ----------

function getValidBlockers(battle) {
  if (hasKeywordOrGranted(battle.attackerInstance, 'Stealth')) return [] // "cannot be blocked" (12.11.2)
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
  defenderState.cardsPlayedThisGame = (defenderState.cardsPlayedThisGame || 0) + 1
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
  if (filter.palName && !hasName(instance, filter.palName)) return false
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
  // "Choose up to 2 Pals without 〈Interrupt〉 from your graveyard, ..." (Black Marketeer) — Interrupt
  // não é uma KEYWORD_NAMES normal (Assault/Taunt/...), é o flag `hasInterrupt` à parte (ver classifyLine).
  if (filter.excludeKeyword) {
    const has = /^interrupt$/i.test(filter.excludeKeyword) ? getParsedEffects(card).hasInterrupt : hasKeyword(card, filter.excludeKeyword)
    if (has) return false
  }
  return true
}

// Resolve costMaxFormula/costExactFormula (ex: "cost of the assigned/butchered Pal") em número antes
// de filtrar — só existe quando a fórmula bate com algo reconhecido (ver EffectParser extractXFormula).
function resolveCardFilterDynamic(filter = {}, casterState, context, sourceInstance, opponentState) {
  const resolved = { ...filter }
  if (filter.costMaxFormula) resolved.costMax = resolveFormulaValue(filter.costMaxFormula, casterState, context, sourceInstance, opponentState)
  if (filter.costMinFormula) resolved.costMin = resolveFormulaValue(filter.costMinFormula, casterState, context, sourceInstance, opponentState)
  if (filter.costExactFormula) resolved.costExact = resolveFormulaValue(filter.costExactFormula, casterState, context, sourceInstance, opponentState)
  return resolved
}

// ---------- Variáveis X: fórmula (contagem do tabuleiro) ou escolha do jogador ----------

function resolveFormulaValue(formula, casterState, context, sourceInstance, opponentState) {
  if (!formula) return null
  switch (formula.type) {
    case 'countStructures': return casterState.baseStructures.length
    case 'countGears': return casterState.baseGear.length
    case 'countSouls': return casterState.totalSouls
    case 'fixed': return formula.value
    // "X is equal to the number of different card names among your structures with 《Antique》 in
    // their card names" (Antique Curtain)
    case 'distinctStructureNameSubstring': return countDistinctNamesContaining(casterState.baseStructures, formula.substring)
    case 'costOfContextPal':
      if (!context || !context.contextPal) return null
      return Math.max(0, (context.contextPal.data.cost || 0) + (formula.modifier || 0))
    case 'selfPower':
      return sourceInstance ? getEffectivePower(sourceInstance, casterState, opponentState) : null
    default: return null
  }
}

function resolveXAmount(formula, casterState, context, sourceInstance, opponentState) {
  const viaFormula = resolveFormulaValue(formula, casterState, context, sourceInstance, opponentState)
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

  const amount = action.amount === 'X' ? resolveXAmount(action.amountFormula, casterState, context, sourceInstance, opponentState) : action.amount

  switch (action.type) {
    case 'damage': {
      // Suzaku – Hellfire Wings: dano NÃO-de-batalha (este 'damage' nunca é dano de batalha, que
      // passa por resolveBattle, não por applyAction) vindo de carta vermelha SUA ganha +200.
      const redBonus = cardColors(sourceInstance.data).includes('red') ? getRedNonBattleDamageBonus(casterState) : 0
      const finalAmount = amount + redBonus
      for (const t of targets) {
        t.damageMarked += finalAmount
        const ownerState = ownerStateOf(t, casterState, opponentState)
        const otherState = ownerState === casterState ? opponentState : casterState
        turnManager._addLog(`${sourceInstance.data.name} causou ${finalAmount} de dano em ${t.data.name}.`)
        turnManager.checkAndRemoveIfDestroyed(t, ownerState, otherState)
      }
      return targets.length > 0
    }
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
        notifyAllyButcher(turnManager, owner, owner === casterState ? opponentState : casterState, turnManager.player2IsBot && owner !== turnManager.player1, butcheredData)
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
    case 'discountNextGear':
      casterState.nextGearDiscount = amount
      turnManager._addLog(`${casterState.playerName} reduziu o custo da próxima Gear jogada da mão em ${amount} até o fim do turno.`)
      return true
    // Alarm Bell: 3 efeitos de estado do jogador, não de um alvo escolhido.
    case 'standAllAssignedThisTurn':
      for (const p of casterState.assignedThisTurn) p.stand()
      casterState.assignedThisTurn = []
      return true
    case 'preventAssignUntilEndOfTurn':
      casterState.cannotAssignUntilEndOfTurn = true
      return true
    case 'mustAttackAllUntilEndOfTurn':
      casterState.mustAttackAllUntilEndOfTurn = true
      turnManager._addLog(`${casterState.playerName} precisa atacar com todos os Pals em pé até o fim do turno (Alarm Bell).`)
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
    case 'grantSkillIfMainName': {
      let granted = false
      for (const t of targets) {
        if (!hasName(t, action.palName)) continue
        t.grantedTriggers = t.grantedTriggers || {}
        t.grantedTriggers[action.triggerType] = t.grantedTriggers[action.triggerType] || []
        t.grantedTriggers[action.triggerType].push(action.grantedActions)
        turnManager._addLog(`${t.data.name} ganhou uma habilidade temporária (efeito de ${sourceInstance.data.name}).`)
        granted = true
      }
      return granted
    }
    // Pengullet Rocket Launcher: em vez de somar ao +200 base, o buff do Pal com nome principal
    // batendo é SUBSTITUÍDO por +500, e ele ganha uma ACT própria temporária (grantedActs).
    case 'replaceBuffAndGrantActIfMainName': {
      let matched = false
      for (const t of targets) {
        if (!hasName(t, action.palName)) continue
        matched = true
        t.tempPowerBonus += (action.replacementAmount - action.defaultAmount)
        t.grantedActs = t.grantedActs || []
        t.grantedActs.push(action.grantedAbility)
        turnManager._addLog(`${t.data.name} ganhou Power +${action.replacementAmount} (em vez de +${action.defaultAmount}) e uma habilidade ativada temporária (efeito de ${sourceInstance.data.name}).`)
      }
      return matched
    }
    // Digtoise's Headband: recurso extra pro CASTER (não pro Pal escolhido), condicionado ao nome
    // principal dele — reaproveita a mesma amarração de 'target' que os casos acima, mas as
    // sub-ações não têm alvo próprio (afetam o jogador que ativou, não o Pal escolhido).
    case 'runIfMainName': {
      let matched = false
      for (const t of targets) {
        if (!hasName(t, action.palName)) continue
        matched = true
        for (const sub of action.thenActions) {
          applyAction(turnManager, sub, sourceInstance, casterState, opponentState, null, context)
        }
      }
      return matched
    }
    // No Pals Beyond Sign: concede Taunt ao Pal "assigned" (custo da própria ACT) até o fim do
    // próximo turno do oponente — ver hasGrantedTaunt/getForcedTauntTargets.
    case 'grantTauntUntilOpponentNextTurn':
      for (const t of targets) t.tauntGrantedUntilTurn = turnManager.turnNumber + 1
      return targets.length > 0
    // Digtoise ganhando Breakthrough, Gumoss ganhando Assault, etc. — keyword estática concedida até
    // o fim do turno (não uma cláusula funcional própria, ao contrário de grantSkillIfMainName).
    case 'grantKeywordUntilEndOfTurn':
      for (const t of targets) {
        t.grantedKeywordsUntilEndOfTurn = t.grantedKeywordsUntilEndOfTurn || new Set()
        t.grantedKeywordsUntilEndOfTurn.add(action.keyword)
      }
      return targets.length > 0
    // Relaxaurus – Hungry Gunner: "While this card is in the base, that card does not stand" — trava
    // persistente (não expira no fim do turno); libera em _releaseStandLocksFrom quando a Relaxaurus
    // (sourceInstance) sai de campo.
    case 'lockStandingWhileOnField':
      for (const t of targets) {
        t.standLockedBy = t.standLockedBy || new Set()
        t.standLockedBy.add(sourceInstance)
      }
      return targets.length > 0
    // Jormuntide – Surging Sea Serpent / Crystal Breath: "does not stand during your opponent's next
    // stand phase" — trava de UM turno só (ver PlayerState.standAll, que consome e limpa a flag).
    case 'skipNextStandPhase':
      for (const t of targets) t.skipNextOwnStandPhase = true
      return targets.length > 0
    // Ranch / Digtoise's Headband: escolha do jogador entre 2 recursos — bot usa heurística fixa
    // (Material), jogador humano resolve via o mesmo popup 'modal' já usado por "Choose 1 of the
    // following".
    case 'chooseResourceEither': {
      if (turnManager.player2IsBot && casterState !== turnManager.player1) {
        casterState.gainMaterial(action.materialAmount)
        turnManager._addLog(`${casterState.playerName} ganhou ${action.materialAmount} Material.`)
        return true
      }
      turnManager.pendingEffect = {
        kind: 'modal',
        sourceCardName: sourceInstance.data.name,
        description: sourceInstance.data.effect_text,
        options: [
          { description: `${action.materialAmount} Material`, actions: [{ type: 'gainMaterial', amount: action.materialAmount }] },
          { description: `${action.ingredientAmount} Ingredient`, actions: [{ type: 'gainIngredient', amount: action.ingredientAmount }] }
        ],
        instance: sourceInstance, casterState, opponentState
      }
      return true
    }
    // Antique Dresser: "Declare 1 card name. Choose all of your cards, and they get that declared
    // card name in addition until end of turn." — o nome declarado só é útil se corresponder a algo
    // já em campo (senão nenhum outro efeito vai comparar contra ele), então a lista de opções é
    // formada pelos main names distintos das próprias cartas em campo do jogador.
    case 'declareNameForTeam': {
      const ownNames = [...new Set(fieldCardsOf(casterState).map(c => c.data.pal_name).filter(Boolean))]
      if (!ownNames.length) return false
      if (turnManager.player2IsBot && casterState !== turnManager.player1) {
        for (const c of fieldCardsOf(casterState)) {
          c.grantedNamesUntilEndOfTurn = c.grantedNamesUntilEndOfTurn || new Set()
          c.grantedNamesUntilEndOfTurn.add(ownNames[0])
        }
        return true
      }
      turnManager.pendingEffect = {
        kind: 'modal',
        sourceCardName: sourceInstance.data.name,
        description: sourceInstance.data.effect_text,
        options: ownNames.map(n => ({ description: n, actions: [{ type: 'applyDeclaredNameForTeam', declaredName: n }] })),
        instance: sourceInstance, casterState, opponentState
      }
      return true
    }
    case 'applyDeclaredNameForTeam':
      for (const c of fieldCardsOf(casterState)) {
        c.grantedNamesUntilEndOfTurn = c.grantedNamesUntilEndOfTurn || new Set()
        c.grantedNamesUntilEndOfTurn.add(action.declaredName)
      }
      turnManager._addLog(`${casterState.playerName} declarou o nome "${action.declaredName}" para todas as suas cartas até o fim do turno.`)
      return true
    // Retomada da escolha de custo alternativo de um ACT (Jormuntide Ignis) — ver activateAbility.
    case 'resumeActCostChoice': {
      const result = proceedActivation(turnManager, action.ability, action.group, {}, sourceInstance, casterState, opponentState, false, action.actIndex)
      return !!(result && result.success)
    }
    // Retomada de "you may X" (Bushi – Ephemeral Blade) depois que o jogador confirmou "Sim" no popup —
    // ver resolveClauseActions. `context.optionalResolved` evita reabrir o mesmo popup de novo aqui.
    case 'resumeOptionalClause': {
      const result = resolveClauseActions(turnManager, action.clauseActions, sourceInstance, casterState, opponentState, false, action.context)
      return !result.paused
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

// Descreve pro jogador o que ele está confirmando no popup "you may ..." (Bushi – Ephemeral Blade,
// etc.) — genérico o bastante pra qualquer ação futura que reuse essa mesma marcação `optional`.
function describeOptionalAction(a) {
  switch (a.type) {
    case 'returnToHand': return 'Retornar esta carta para a mão'
    case 'stand': return 'Ficar em pé'
    case 'exile': return 'Exilar'
    case 'destroy': return 'Enviar para o cemitério'
    default: return 'Sim'
  }
}

// Tipos cobertos pela confirmação genérica "you may X" (ver markOptionalIfYouMay) — só ações SEM
// escolha de alvo própria. NÃO inclui discardOwnHandChoice/opponentDiscardChoice/cardSelect (mandatory:
// false), que já resolvem sua própria opcionalidade via popup de escolha com botão de pular.
const OPTIONAL_CONFIRM_TYPES = ['returnToHand', 'stand', 'exile', 'destroy']

function resolveClauseActions(turnManager, clauseActions, instance, casterState, opponentState, isBot, context = {}) {
  // "you may X" (Bushi – Ephemeral Blade: "you may return this card to hand") — ação(ões) marcadas
  // optional:true por parseSentence precisam de confirmação do jogador antes de rodar; sem isso, o
  // "you may" era ignorado e a ação acontecia sempre. Bot: por padrão, opta por fazer (heurística simples).
  if (!context.optionalResolved && clauseActions.some(a => a.optional && OPTIONAL_CONFIRM_TYPES.includes(a.type))) {
    if (isBot) {
      context = { ...context, optionalResolved: true }
    } else {
      const label = clauseActions.filter(a => a.optional).map(describeOptionalAction).join(' e ')
      turnManager.pendingEffect = {
        kind: 'modal',
        sourceCardName: instance.data.name,
        description: instance.data.effect_text,
        options: [
          { description: label, actions: [{ type: 'resumeOptionalClause', clauseActions, context: { ...context, optionalResolved: true } }] },
          { description: 'Não fazer nada', actions: [] }
        ],
        instance, casterState, opponentState
      }
      return { paused: true }
    }
  }
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
    const discardSpec = clauseActions[handDiscardIdx]
    const chooserState = discardSpec.type === 'opponentDiscardChoice' ? opponentState : casterState
    const chooserIsBot = turnManager.player2IsBot && chooserState === turnManager.player2
    // "You may discard 1 card from hand. If you discarded this way, ..." (Lovander) — optional:true
    // deixa pular a escolha (mandatory:false), e `then` só roda se uma carta foi de fato descartada.
    const discardAction = {
      type: 'cardSelect', source: 'hand', mandatory: !discardSpec.optional, filter: {},
      destination: 'discard', remainder: null, zeroBonus: null, then: clauseActions.then || null
    }
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
    if (turnManager.player2IsBot && opponentState === turnManager.player2) {
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
    // "Get either 3 Material or 3 Ingredient, and draw 1 card." (Ranch) — a 1a ação (chooseResourceEither)
    // abre um popup (modal) pro jogador humano; se a 2a ação ("draw") rodasse direto aqui, ela
    // aconteceria ANTES do jogador responder o popup. Por isso para no meio e guarda o resto pra depois.
    let thenTrigger = false
    for (let i = 0; i < clauseActions.length; i++) {
      if (applyAction(turnManager, clauseActions[i], instance, casterState, opponentState, null, context)) thenTrigger = true
      if (turnManager.pendingEffect) {
        turnManager._pendingClauseContinuation = { clauseActions, index: i + 1, instance, casterState, opponentState, isBot, context, thenTrigger }
        return { paused: true }
      }
    }
    if (clauseActions.then && thenTrigger) {
      resolveRepeatableClause(turnManager, clauseActions.then, instance, casterState, opponentState, isBot, context)
    }
    return { paused: false }
  }

  return resolveChooseAction(turnManager, clauseActions, chooseAction, instance, casterState, opponentState, isBot, context)
}

// Continuação de uma cláusula "sem alvo" (!chooseAction) que pausou no meio (ex: chooseResourceEither
// abrindo modal antes de rodar o resto das ações da mesma cláusula).
function resumeClauseContinuation(turnManager, cont) {
  let thenTrigger = cont.thenTrigger
  for (let i = cont.index; i < cont.clauseActions.length; i++) {
    if (applyAction(turnManager, cont.clauseActions[i], cont.instance, cont.casterState, cont.opponentState, null, cont.context)) thenTrigger = true
    if (turnManager.pendingEffect) {
      turnManager._pendingClauseContinuation = { ...cont, index: i + 1, thenTrigger }
      return { paused: true }
    }
  }
  if (cont.clauseActions.then && thenTrigger) {
    resolveRepeatableClause(turnManager, cont.clauseActions.then, cont.instance, cont.casterState, cont.opponentState, cont.isBot, cont.context)
  }
  return { paused: false }
}

function resolveChooseAction(turnManager, clauseActions, chooseAction, instance, casterState, opponentState, isBot, context) {
  const spec = chooseAction.target
  // "Choose 1 cost X or less Pal, and exile it." (Viewing Cage) — o filtro de custo do ALVO (não da
  // busca em zona, que já tinha resolveCardFilterDynamic) pode depender de fórmula (custo do Pal
  // assinalado como custo, etc.) — resolve num filtro NOVO, sem mutar `spec` (compartilhado por todas
  // as siblingActions da cláusula, inclusive em reativações futuras da mesma habilidade).
  const needsFilterResolve = spec.filter && (spec.filter.costMaxFormula || spec.filter.costMinFormula)
  const resolvedSpec = needsFilterResolve
    ? { ...spec, filter: resolveCardFilterDynamic(spec.filter, casterState, context, instance, opponentState) }
    : spec
  const candidates = computeValidTargets(resolvedSpec, instance, casterState, opponentState)
  // "Choose up to 1 Pal, and deal 800 Damage. Choose all of your Pals, and they get Strike +1..."
  // (Weapon Workbench) — a 2a ação não depende do alvo escolhido (target.mode !== 'choose': all/self/
  // contextPal/sem alvo), então roda de qualquer forma, não só quando compartilha a MESMA referência
  // de `spec` (caso das ações "it gets X, and it gets Y" no mesmo Pal escolhido).
  const siblingActions = clauseActions.filter(a => a.target === spec || !(a.target && a.target.mode === 'choose'))
  const independentActions = siblingActions.filter(a => a.target !== spec)

  if (candidates.length === 0) {
    // Sem alvo válido pra escolha (opcional ou não) — as ações independentes ainda acontecem.
    let thenTrigger = false
    for (const action of independentActions) {
      if (applyAction(turnManager, action, instance, casterState, opponentState, null, context)) thenTrigger = true
    }
    if (clauseActions.then && thenTrigger) {
      resolveRepeatableClause(turnManager, clauseActions.then, instance, casterState, opponentState, isBot, context)
    }
    return { paused: false }
  }

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
  const total = resolveXAmount(clauseActions.repeatFormula, casterState, context, instance, opponentState)
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
    revealed = matching // busca direta na zona (não é "revelação" de topo) — mesma lista serve pra ambos
  } else if (action.source === 'hand') {
    matching = casterState.hand.filter(c => matchesCardFilter(c, resolvedFilter))
    revealed = matching
  } else {
    return { paused: false }
  }

  // "choose up to 2 X from among them and deploy them" (Reptyro Cryst) / "Choose up to 2 Pals without
  // 〈Interrupt〉 from your graveyard, and return them to hand" (Black Marketeer) — mais de 1 escolha
  // da mesma revelação/busca, pra qualquer fonte (deckTop, graveyard ou hand).
  const maxPicks = action.maxPicks || 1

  if (isBot) {
    if (maxPicks > 1) {
      finishMultiCardChoice(turnManager, resolvedAction, instance, casterState, opponentState, context, revealed, matching.slice(0, maxPicks))
      return { paused: false }
    }
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
    // Conjunto ORIGINAL revelado (nunca encolhe) — usado só pro tamanho do splice/remainder no fim de
    // um multi-pick (ver finishMultiCardChoice); `revealed` acima pode ir encolhendo a cada rodada só
    // pra exibição (ver resolveCardChoice), e reusar ele lá causava dessincronia com o deck real
    // (Reptyro Cryst: "choose up to 2" perdia/duplicava cartas do deck após a 2a escolha).
    originalRevealed: revealed,
    cards,
    pickedCards: [],
    picksLeft: maxPicks
  }
  return { paused: true }
}

function resolveCardChoice(turnManager, choice) {
  const pending = turnManager.pendingEffect
  if (!pending || pending.kind !== 'cardChoice') return

  if (pending.isCostDiscard) return resolveDiscardCostChoice(turnManager, pending, choice)

  // maxPicks<=1 (padrão/quase todas as cartas): fluxo original, uma escolha só e termina. Importante:
  // isso tem que checar `action.maxPicks`, não `picksLeft` — numa sequência multi-pick genuína,
  // picksLeft também chega a 1 na ÚLTIMA rodada, e cair no fluxo original aqui perderia as cartas já
  // escolhidas nas rodadas anteriores (pending.pickedCards), que o `finishCardChoice` de 1-carta não conhece.
  if ((pending.action.maxPicks || 1) <= 1) {
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
    return
  }

  // "choose up to 2 X from among them and deploy them" (Reptyro Cryst) — mais de 1 escolha da MESMA
  // revelação: cada escolha reabre o popup com o restante, até acabar picksLeft ou não sobrar candidato.
  let chosenCard = null
  if (!choice.skip) {
    const entry = pending.cards[choice.index]
    if (!entry || !entry.selectable) return
    chosenCard = entry.card
  } else if (!pending.optional && !pending.pickedCards.length) {
    return
  }

  const pickedCards = chosenCard ? [...pending.pickedCards, chosenCard] : pending.pickedCards
  const remainingRevealed = chosenCard ? pending.revealed.filter(c => c !== chosenCard) : pending.revealed
  const picksLeft = pending.picksLeft - (chosenCard ? 1 : 0)
  const stillMatching = remainingRevealed.filter(c => matchesCardFilter(c, pending.action.filter))

  turnManager.pendingEffect = null

  if (chosenCard && picksLeft > 0 && stillMatching.length) {
    const cards = remainingRevealed.map(card => ({ card, selectable: stillMatching.includes(card) }))
    turnManager.pendingEffect = {
      kind: 'cardChoice',
      sourceCardName: pending.sourceCardName,
      description: pending.description,
      optional: true, // já satisfez o mínimo (se era obrigatório) — as escolhas seguintes são sempre opcionais
      action: pending.action, instance: pending.instance, casterState: pending.casterState,
      opponentState: pending.opponentState, context: pending.context, revealed: remainingRevealed,
      originalRevealed: pending.originalRevealed, // nunca encolhe — ver comentário em startCardChoice
      cards, pickedCards, picksLeft
    }
    return
  }

  finishMultiCardChoice(turnManager, pending.action, pending.instance, pending.casterState, pending.opponentState, pending.context, pending.originalRevealed, pickedCards)
  if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
}

// Variante de finishCardChoice pra 0-N cartas escolhidas da MESMA revelação/busca (deckTop, graveyard
// ou hand — graveyard/hand não têm "remainder": a carta não escolhida simplesmente continua na zona).
function finishMultiCardChoice(turnManager, action, instance, casterState, opponentState, context, revealed, chosenCards) {
  if (action.source === 'deckTop') {
    casterState.deck.splice(0, revealed.length)
  } else if (action.source === 'graveyard') {
    casterState.graveyard = casterState.graveyard.filter(c => !chosenCards.includes(c))
  } else if (action.source === 'hand') {
    casterState.hand = casterState.hand.filter(c => !chosenCards.includes(c))
  }
  const remainder = action.source === 'deckTop' ? revealed.filter(c => !chosenCards.includes(c)) : []
  for (const card of chosenCards) applyCardDestination(turnManager, action, casterState, opponentState, instance, card)
  if (remainder.length) {
    if (action.remainder === 'shuffle') casterState.deck = shuffleArray([...remainder, ...casterState.deck])
    else if (action.remainder === 'graveyard') casterState.graveyard.push(...remainder)
    else if (action.remainder === 'putBack') casterState.deck.unshift(...remainder)
    else if (action.remainder === 'hand') casterState.hand.push(...remainder)
  }
  if (!chosenCards.length && action.zeroBonus) {
    resolveRepeatableClause(turnManager, action.zeroBonus, instance, casterState, opponentState, false, context)
  }
  return { paused: false }
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

  // "You may discard 1 card from hand. If you discarded this way, gain 1 life." (Lovander) — só roda
  // se uma carta foi de fato escolhida/descartada (ao contrário de `andThen`, que é incondicional).
  if (chosenCard && action.then) {
    resolveRepeatableClause(turnManager, action.then, instance, casterState, opponentState, false, context)
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
  const grantedClauses = (instance.grantedTriggers && instance.grantedTriggers[triggerName]) || []
  const allClauses = grantedClauses.length ? [...clauses, ...grantedClauses] : clauses
  const repeatCount = shouldDoubleAuto(triggerName, casterState) ? 2 : 1
  for (let rep = 0; rep < repeatCount; rep++) {
    for (const clauseActions of allClauses) {
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
    case 'assignPal':
      return !casterState.cannotAssignUntilEndOfTurn &&
        casterState.basePals.filter(p => p !== instance && p.isStanding).length >= (item.amount || 1)
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

// Abilities fixas da carta + as concedidas temporariamente a esta instância (ex: Pengullet Rocket
// Launcher) — concatenadas, então actIndex continua servindo pra ambas (fixas primeiro).
function getAllActAbilities(instance) {
  const granted = instance.grantedActs
  return granted && granted.length ? [...getActAbilities(instance.data), ...granted] : getActAbilities(instance.data)
}

function canActivateAbility(instance, casterState, actIndex = 0) {
  const ability = getAllActAbilities(instance)[actIndex]
  if (!ability) return false
  if (ability.oncePerTurn && instance.actUsedThisTurn.has(actIndex)) return false
  return ability.costGroups.some(g => canPayCostGroup(g, instance, casterState))
}

// Descansa um Pal como custo "[Assign N Pal(s)]" E registra em casterState.assignedThisTurn, pra
// "Stand all Pals assigned this turn" (Alarm Bell) saber quem reerguer depois. Único ponto de entrada
// pra isso — os 3 lugares que descansam Pal por custo de assign chamam esta função, nunca .rest() direto.
function markAssigned(casterState, pal) {
  pal.rest()
  casterState.assignedThisTurn.push(pal)
}

function payCostGroup(turnManager, group, context, pickedInstance, instance, casterState) {
  for (const item of group) {
    switch (item.type) {
      case 'restSelf': instance.rest(); break
      case 'consumeMaterial': casterState.material -= item.amount; break
      case 'consumeIngredient': casterState.ingredient -= item.amount; break
      case 'consumeMaterialX': casterState.material -= context.chosenAmount; break
      case 'consumeIngredientX': casterState.ingredient -= context.chosenAmount; break
      // Assign N>1 (ex: Breeding Farm) já resta cada Pal escolhido na hora (ver startAssignPalChoice/
      // continuePendingEffect) — não repete aqui pra não tentar rest() de novo num Pal já descansado.
      case 'assignPal': if (!context.assignCostResolved && pickedInstance) markAssigned(casterState, pickedInstance); break
      case 'butcherPal': if (pickedInstance) turnManager._sendToGraveyard(pickedInstance, casterState); break
      // Se já passou por startDiscardCostChoice (jogador escolheu quais descartar), não descarta
      // de novo aqui — só cai no automático quando não havia escolha real a fazer (ver lá).
      case 'discardHand': if (!context.discardCostResolved) discardRandomN(casterState, item.amount); break
      case 'discardHandX': if (!context.discardCostResolved) discardRandomN(casterState, context.chosenAmount); break
      case 'discardHandType': if (!context.discardCostResolved) discardRandomOfType(casterState, item.cardType, item.amount); break
      case 'soulCost': casterState.paySoulCost(item.amount); break
      case 'millTopCards': millTopCards(casterState, item.amount); break
    }
  }
}

function finishActivation(turnManager, ability, group, context, pickedInstance, instance, casterState, opponentState, isBot, actIndex) {
  if (pickedInstance) context.contextPal = pickedInstance
  const butcheredData = pickedInstance && group.some(item => item.type === 'butcherPal') ? pickedInstance.data : null
  payCostGroup(turnManager, group, context, pickedInstance, instance, casterState)
  if (butcheredData) notifyAllyButcher(turnManager, casterState, opponentState, isBot, butcheredData)
  // Controle de "1/Turn" por habilidade (índice), não por carta — uma carta com 2 ACTs independentes
  // (ex: Primitive Furnace, Breeding Farm) não pode ter uma bloqueando a outra no mesmo turno.
  if (ability.oncePerTurn) instance.actUsedThisTurn.add(actIndex)

  // "AUTO Serious N (OnAssign ...)" (Rooby, Teafant, Tanzee) — incondicional; "AUTO When this card is
  // assigned to a 「Farming」 structure, ..." (Mau Cryst, Dumud) — só dispara se `instance` (a carta
  // sendo ativada, dona do custo de assign) tiver esse work_keyword. Ambos disparam ANTES de resolver
  // a própria habilidade (ex: Weapon Workbench, que também escolhe alvo — daí a cadeia de continuação,
  // pra não perder a pausa de nenhum dos dois).
  const assignedPals = context.assignedPals || (pickedInstance && group.some(item => item.type === 'assignPal') ? [pickedInstance] : [])
  const steps = buildAssignTriggerSteps(assignedPals, instance)
  const result = runAssignTriggersThenAbility(turnManager, steps, 0, ability, instance, casterState, opponentState, isBot, context)
  return { success: true, ...result }
}

function hasWorkKeyword(cardData, keyword) {
  return (cardData.work_keywords || []).some(k => String(k).toLowerCase() === keyword.toLowerCase())
}

// Monta a lista de gatilhos "de assign" a disparar pra este grupo de Pals recém-assinalados, na ordem:
// cada Pal pode ter o onAssign incondicional (Serious) E/OU o onAssignToWorkStructure condicionado ao
// destino (`destinationInstance` = a carta cujo custo está sendo pago, ex: Ranch).
function buildAssignTriggerSteps(assignedPals, destinationInstance) {
  const steps = []
  for (const pal of assignedPals) {
    const parsed = getParsedEffects(pal.data)
    if ((parsed.onAssign || []).length) steps.push({ kind: 'plain', pal })
    for (const entry of parsed.onAssignToWorkStructure || []) {
      if (hasWorkKeyword(destinationInstance.data, entry.workKeyword)) {
        steps.push({ kind: 'workStructure', pal, clauseActions: entry.actions })
      }
    }
  }
  return steps
}

function runAssignStep(turnManager, step, casterState, opponentState, isBot) {
  if (step.kind === 'plain') return runTrigger(turnManager, 'onAssign', step.pal, casterState, opponentState, { isBot })
  return resolveRepeatableClause(turnManager, step.clauseActions, step.pal, casterState, opponentState, isBot)
}

// Dispara os gatilhos de assign em sequência e só resolve as ações da própria habilidade depois de
// todos terminarem — se um deles pausar (ex: "Choose 1 Pal" do Serious pode ser QUALQUER Pal, não só
// o assinalado), guarda a continuação e retoma depois.
function runAssignTriggersThenAbility(turnManager, steps, index, ability, instance, casterState, opponentState, isBot, context) {
  if (index >= steps.length) {
    return resolveRepeatableClause(turnManager, ability.actions, instance, casterState, opponentState, isBot, context)
  }
  const result = runAssignStep(turnManager, steps[index], casterState, opponentState, isBot)
  if (result.paused) {
    turnManager._pendingAssignContinuation = { steps, index: index + 1, ability, instance, casterState, opponentState, isBot, context }
    return { paused: true }
  }
  return runAssignTriggersThenAbility(turnManager, steps, index + 1, ability, instance, casterState, opponentState, isBot, context)
}

function resumeAssignContinuation(turnManager, cont) {
  return runAssignTriggersThenAbility(turnManager, cont.steps, cont.index, cont.ability, cont.instance, cont.casterState, cont.opponentState, cont.isBot, cont.context)
}

function proceedActivation(turnManager, ability, group, context, instance, casterState, opponentState, isBot, actIndex) {
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
        ability, group, context, instance, casterState, opponentState, actIndex
      }
      return { success: true, paused: true }
    }
  }

  const pickItem = group.find(item => item.type === 'assignPal' || item.type === 'butcherPal')
  if (pickItem) {
    // "[assign 2 Pals]" (Breeding Farm) — escolhe mais de 1 Pal pra descansar como custo, um por vez.
    if (pickItem.type === 'assignPal' && (pickItem.amount || 1) > 1) {
      const result = startAssignPalChoice(turnManager, ability, group, context, instance, casterState, opponentState, isBot, pickItem.amount, actIndex)
      if (result) return result
      return finishActivation(turnManager, ability, group, context, null, instance, casterState, opponentState, isBot, actIndex)
    }

    const candidates = casterState.basePals.filter(p =>
      p !== instance && (pickItem.type !== 'assignPal' || p.isStanding)
    )
    if (!candidates.length) return { success: false, reason: 'CANNOT_PAY' }

    if (isBot) {
      const chosen = candidates.reduce((a, b) => (b.data.power < a.data.power ? b : a))
      return finishActivation(turnManager, ability, group, context, chosen, instance, casterState, opponentState, isBot, actIndex)
    }

    turnManager.pendingEffect = {
      kind: 'cost',
      sourceCardName: instance.data.name,
      description: instance.data.effect_text,
      optional: false,
      ability, group, context, instance, casterState, opponentState, actIndex,
      validTargets: candidates.map(p => absoluteTarget(turnManager, casterState, { owner: 'caster', instance: p }))
    }
    return { success: true, paused: true }
  }

  // "[Discard 1 structure from hand]" (Mammorest Cryst), "[Discard 2 cards from hand]" (Jormuntide
  // Ignis), "[Discard X cards from hand]" (Antique Dresser) etc. — deixa o jogador escolher QUAIS
  // descartar, em vez do automático (só cai no automático quando não há escolha real, ver a função).
  const discardItem = group.find(item => ['discardHand', 'discardHandType', 'discardHandX'].includes(item.type))
  if (discardItem && !context.discardCostResolved) {
    const paused = startDiscardCostChoice(turnManager, ability, group, context, instance, casterState, opponentState, isBot, discardItem, actIndex)
    if (paused) return paused
  }

  return finishActivation(turnManager, ability, group, context, null, instance, casterState, opponentState, isBot, actIndex)
}

// "[assign N Pals]" com N>1 (só a Breeding Farm hoje) — descansa N Pals escolhidos um por vez, cada
// escolha reabre o popup de custo (kind:'cost') com o restante, até completar N. Se N candidatos
// exatos == N necessários (sem escolha real) ou for o bot, resolve direto sem popup. Retorna null
// quando o chamador deve seguir pro finishActivation normal (custo já 100% resolvido aqui).
function startAssignPalChoice(turnManager, ability, group, context, instance, casterState, opponentState, isBot, amount, actIndex) {
  const candidates = casterState.basePals.filter(p => p !== instance && p.isStanding)
  if (candidates.length < amount) return { success: false, reason: 'CANNOT_PAY' }

  if (isBot || candidates.length === amount) {
    const chosen = isBot
      ? [...candidates].sort((a, b) => (a.data.power || 0) - (b.data.power || 0)).slice(0, amount)
      : candidates.slice(0, amount)
    for (const p of chosen) markAssigned(casterState, p)
    context.assignCostResolved = true
    context.assignedPals = chosen
    return null
  }

  turnManager.pendingEffect = {
    kind: 'cost',
    sourceCardName: instance.data.name,
    description: instance.data.effect_text,
    optional: false,
    ability, group, context, instance, casterState, opponentState, actIndex,
    assignAmount: amount, assignChosen: [],
    validTargets: candidates.map(p => absoluteTarget(turnManager, casterState, { owner: 'caster', instance: p }))
  }
  return { success: true, paused: true }
}

// Abre a escolha (reaproveita o popup de 'cardChoice' — mesmo componente do front, mesmo evento
// bot:resolveCardChoice) de qual(is) carta(s) da mão descartar pra pagar o custo. Retorna null quando
// não há escolha real a fazer (só existem N cartas válidas pra descartar N) — nesse caso o chamador
// segue pro finishActivation normal, que descarta automaticamente via payCostGroup.
function startDiscardCostChoice(turnManager, ability, group, context, instance, casterState, opponentState, isBot, discardItem, actIndex) {
  const amount = discardItem.type === 'discardHandX' ? context.chosenAmount : discardItem.amount
  const filter = discardItem.type === 'discardHandType' ? { cardTypes: [discardItem.cardType] } : {}
  const matching = casterState.hand.filter(c => matchesCardFilter(c, filter))

  if (matching.length <= amount) return null

  if (isBot) {
    for (const card of matching.slice(0, amount)) {
      casterState.hand = casterState.hand.filter(c => c !== card)
      casterState.graveyard.push(card)
    }
    context.discardCostResolved = true
    return finishActivation(turnManager, ability, group, context, null, instance, casterState, opponentState, isBot, actIndex)
  }

  turnManager.pendingEffect = {
    kind: 'cardChoice',
    isCostDiscard: true,
    sourceCardName: instance.data.name,
    description: instance.data.effect_text,
    optional: false,
    cards: casterState.hand.map(card => ({ card, selectable: matching.includes(card) })),
    ability, group, context, instance, casterState, opponentState, actIndex,
    filter, amount, chosen: []
  }
  return { success: true, paused: true }
}

// Continuação de startDiscardCostChoice: descarta a carta escolhida, e se ainda faltar (amount>1,
// ex: Jormuntide Ignis descarta 2), reabre o mesmo popup com a mão atualizada; senão retoma o
// pagamento do resto do custo + a habilidade em si via finishActivation.
function resolveDiscardCostChoice(turnManager, pending, choice) {
  const entry = choice.skip ? null : pending.cards[choice.index]
  if (!choice.skip && (!entry || !entry.selectable)) return
  turnManager.pendingEffect = null

  const chosen = entry ? [...pending.chosen, entry.card] : pending.chosen
  if (entry) {
    pending.casterState.hand = pending.casterState.hand.filter(c => c !== entry.card)
    pending.casterState.graveyard.push(entry.card)
  }

  const stillMatching = pending.casterState.hand.filter(c => matchesCardFilter(c, pending.filter))
  if (entry && chosen.length < pending.amount && stillMatching.length) {
    turnManager.pendingEffect = {
      ...pending,
      chosen,
      cards: pending.casterState.hand.map(card => ({ card, selectable: stillMatching.includes(card) }))
    }
    return
  }

  pending.context.discardCostResolved = true
  finishActivation(turnManager, pending.ability, pending.group, pending.context, null, pending.instance, pending.casterState, pending.opponentState, false, pending.actIndex)
  if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
}

function describeCostItem(item) {
  switch (item.type) {
    case 'soulCost': return `Pagar ${item.amount} Soul${item.amount > 1 ? 's' : ''}`
    case 'restSelf': return 'Descansar esta carta'
    case 'consumeMaterial': return `Gastar ${item.amount} Material`
    case 'consumeIngredient': return `Gastar ${item.amount} Ingredient`
    case 'consumeMaterialX': return 'Gastar Material'
    case 'consumeIngredientX': return 'Gastar Ingredient'
    case 'assignPal': return `Assinalar ${item.amount || 1} Pal(s)`
    case 'butcherPal': return 'Abater 1 Pal'
    case 'discardHand': return `Descartar ${item.amount} carta${item.amount > 1 ? 's' : ''} da mão`
    case 'discardHandX': return 'Descartar cartas da mão'
    case 'discardHandType': return `Descartar ${item.amount} ${item.cardType}(s) da mão`
    case 'millTopCards': return `Colocar as ${item.amount} cartas do topo do deck no cemitério`
    default: return item.type
  }
}

function describeCostGroup(group) {
  return group.map(describeCostItem).join(' + ')
}

// "ACT 1/Turn [③] OR [Discard 2 cards from hand] Stand this card." (Jormuntide Ignis) — quando MAIS
// de um custo alternativo é pagável ao mesmo tempo, quem escolhe é o JOGADOR (o bot usa a 1a opção
// pagável), não o motor sozinho — antes o `.find` sempre travava na 1a opção da lista sem perguntar.
function activateAbility(turnManager, instance, casterState, opponentState, actIndex = 0, { isBot } = {}) {
  const ability = getAllActAbilities(instance)[actIndex]
  if (!ability) return { success: false, reason: 'NO_ABILITY' }
  if (ability.oncePerTurn && instance.actUsedThisTurn.has(actIndex)) return { success: false, reason: 'ALREADY_USED' }

  const payableGroups = ability.costGroups.filter(g => canPayCostGroup(g, instance, casterState))
  if (!payableGroups.length) return { success: false, reason: 'CANNOT_PAY' }

  if (payableGroups.length > 1 && !isBot) {
    turnManager.pendingEffect = {
      kind: 'modal',
      sourceCardName: instance.data.name,
      description: instance.data.effect_text,
      options: payableGroups.map(group => ({
        description: describeCostGroup(group),
        actions: [{ type: 'resumeActCostChoice', ability, group, actIndex }]
      })),
      instance, casterState, opponentState
    }
    return { success: true, paused: true }
  }

  return proceedActivation(turnManager, ability, payableGroups[0], {}, instance, casterState, opponentState, isBot, actIndex)
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
    proceedActivation(turnManager, pending.ability, pending.group, pending.context, pending.instance, pending.casterState, pending.opponentState, false, pending.actIndex)
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
    // "[assign N Pals]" (Breeding Farm) — descansa o escolhido já, e se faltar reabre o mesmo popup
    // com o restante; só chama finishActivation quando os N já foram escolhidos.
    if (pending.assignAmount) {
      markAssigned(pending.casterState, chosenInstance)
      const assignChosen = [...pending.assignChosen, chosenInstance]
      if (assignChosen.length < pending.assignAmount) {
        const remaining = pending.casterState.basePals.filter(p => p !== pending.instance && p.isStanding)
        turnManager.pendingEffect = {
          ...pending,
          assignChosen,
          validTargets: remaining.map(p => absoluteTarget(turnManager, pending.casterState, { owner: 'caster', instance: p }))
        }
        return
      }
      pending.context.assignCostResolved = true
      pending.context.assignedPals = assignChosen
      finishActivation(turnManager, pending.ability, pending.group, pending.context, null, pending.instance, pending.casterState, pending.opponentState, false, pending.actIndex)
      if (!turnManager.pendingEffect) turnManager._resumeAttackAfterTrigger()
      return
    }

    finishActivation(turnManager, pending.ability, pending.group, pending.context, chosenInstance, pending.instance, pending.casterState, pending.opponentState, false, pending.actIndex)
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
  hasKeywordOrGranted,
  getKeywordValue,
  getEffectivePower,
  getEffectiveStrike,
  canBeAttackedBy,
  getForcedTauntTargets,
  runTrigger,
  continuePendingEffect,
  getActAbilities,
  getAllActAbilities,
  canActivateAbility,
  activateAbility,
  getValidBlockers,
  pickBotBlocker,
  getPlayableQuickCards,
  playQuickCard,
  startModalChoice,
  resolveModalChoice,
  resolveCardChoice,
  notifyAllyDeploy,
  resumeAssignContinuation,
  resumeClauseContinuation
}
