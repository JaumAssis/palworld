// IA compartilhada pelos dois fluxos de bot — vs-Bot (server.js, socket bot:*) e o substituto de
// fila online (ver BOT_QUEUE_FALLBACK_MS em server.js). Escrita uma vez só aqui em vez de duplicada
// nos dois lugares. Sempre server-autoritativo: só lê o estado do motor (TurnManager/PlayerState/
// EffectEngine), nunca aceita nada vindo do cliente.
const EffectEngine = require('./effects/EffectEngine')

// Ritmo do vs-Bot preserva o "sentimento" de jogo que já existia (5s por ação, dá tempo do jogador
// acompanhar); o online usa um ritmo mais rápido, já que o humano ali está esperando na fila, não
// controlando o próprio turno.
const VS_PLAYER_TIMING = { deploy: 5000, act: 3000, attack: 5000, endTurn: 2000 }
const DEFAULT_TIMING = { deploy: 1500, act: 1200, attack: 1500, endTurn: 1200 }

// Sempre escolhe ir primeiro ao ganhar o Jokenpô — extraído aqui só pra não repetir a mesma
// constante hardcoded em mais de um lugar (bot:chooseOrder e o driver da fila online).
function decideGoFirst() {
  return true
}

// true = mantém a mão inicial. Heurística inalterada: mantém se tiver pelo menos 2 cartas de
// custo <= 3 (jogáveis logo de cara), senão mulliga.
function decideMulligan(hand) {
  return hand.filter(c => c.cost <= 3).length >= 2
}

// Habilidade cujo ÚNICO jeito de pagar é descansar a própria carta — pra um Pal em pé, isso custa
// o corpo dele como atacante OU bloqueador reservado nesse turno, então o bot evita (quase sempre
// pior negócio que atacar/bloquear com ele). Não se aplica a Pal já descansado (não tem o que perder).
function abilityAlwaysRequiresRest(ability) {
  return ability.costGroups.every(group => group.some(item => item.type === 'restSelf'))
}

// Idem pro custo de abater (butcher) — evita esvaziar demais o próprio campo.
function abilityRequiresButcherWithFewPals(ability, self) {
  return self.basePals.length < 3 && ability.costGroups.every(group => group.some(item => item.type === 'butcherPal'))
}

// Escolhe a próxima carta da mão a jogar (no máximo 1 por chamada — chooseAction é chamado de novo
// depois de cada deploy, então uma carta recém-comprada por soulDraw já entra na leitura seguinte).
function chooseDeploy(self) {
  const candidates = []
  for (const card of self.hand) {
    if (card.card_type === 'Pal') {
      if (card.cost <= self.soulsStanding) candidates.push({ score: 50, kind: 'deployPal', card })
    } else if (card.card_type === 'Structure') {
      // Structure pontua acima de Pal: mais durável (não entra na troca de combate) e costuma
      // habilitar os motores de assign (Breeding Farm etc.) que o resto da IA já sabe usar via ACT.
      if (card.cost <= self.soulsStanding) candidates.push({ score: 60, kind: 'deployStructure', card })
    } else if (card.card_type === 'Gear') {
      const discount = Math.min(self.nextGearDiscount || 0, Math.max(0, card.cost - 1))
      if (card.cost - discount <= self.soulsStanding) {
        // Gear que não buffa/equipa nada em campo é carta perdida — só vale bem com Pal já em campo.
        candidates.push({ score: self.basePals.length >= 1 ? 40 : 10, kind: 'deployGear', card })
      }
    } else if (card.card_type === 'Event' && card.cost <= self.soulsStanding) {
      const parsed = EffectEngine.getParsedEffects(card)
      // Só joga Event que o parser entende de verdade (onPlay ou modal) — uma carta cujo único
      // efeito é Quick/Interrupt (joga na mão do oponente, não na própria main phase) fica de fora,
      // e uma carta sem nenhum efeito reconhecido também (perderia a carta à toa).
      if (parsed.onPlay.length > 0 || parsed.modal) {
        candidates.push({ score: 45, kind: 'playEvent', card })
      }
    }
  }
  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.score - a.score || (b.card.cost || 0) - (a.card.cost || 0))
  return candidates[0]
}

// Escolhe a próxima habilidade ACT a ativar, se houver alguma que valha a pena e seja pagável.
function chooseAct(self) {
  const zones = [
    ['basePals', self.basePals, 55],
    ['baseStructures', self.baseStructures, 70],
    ['baseGear', self.baseGear, 70]
  ]
  let best = null
  for (const [zone, instances, baseScore] of zones) {
    instances.forEach((instance, index) => {
      const abilities = EffectEngine.getAllActAbilities(instance)
      abilities.forEach((ability, actIndex) => {
        if (!EffectEngine.canActivateAbility(instance, self, actIndex)) return
        if (zone === 'basePals' && instance.isStanding && abilityAlwaysRequiresRest(ability)) return
        if (abilityRequiresButcherWithFewPals(ability, self)) return
        if (!best || baseScore > best.score) best = { score: baseScore, kind: 'activateAct', zone, index, actIndex }
      })
    })
  }
  return best
}

// Decide quem ataca neste turno e quem fica reservado em pé pra poder bloquear no turno do
// oponente. Reavaliado a cada chamada de chooseAction (barato, e correto: `reserved` é sempre o
// subconjunto de MAIOR power entre os Pals em pé, e Pals reservados nunca atacam nem saem do
// campo por conta própria — então o conjunto não muda entre uma chamada e a próxima, só encolhe
// conforme os atacantes vão descansando).
function planAttacks(tm, self, opponent) {
  const standing = self.basePals.filter(p => p.isStanding)
  if (standing.length === 0) return { attackers: [], reserved: [] }

  const byPowerDesc = [...standing].sort((a, b) => b.effectivePower(self, opponent) - a.effectivePower(self, opponent))

  // "must attack as much as possible" (Alarm Bell) — TurnManager.endMainPhase() recusa terminar o
  // turno enquanto sobrar Pal em pé nesse estado; reservar bloqueador aqui quebraria essa regra.
  if (self.mustAttackAllUntilEndOfTurn) return { attackers: byPowerDesc, reserved: [] }

  const totalStrike = standing.reduce((sum, p) => sum + p.effectiveStrike(self, opponent), 0)
  const isLethal = totalStrike >= opponent.life

  let reserveCount
  if (isLethal) {
    reserveCount = 0 // fecha o jogo agora, não segura nada
  } else if (self.life <= 4) {
    reserveCount = standing.length // vida crítica: tartaruga total, não ataca com nada
  } else if (tm.turnNumber <= 4) {
    reserveCount = 0 // turnos iniciais: agressão, ainda não há o que defender de verdade
  } else {
    reserveCount = Math.min(2, Math.ceil(Math.max(1, opponent.basePals.length) / 2), Math.max(0, standing.length - 1))
  }

  return { reserved: byPowerDesc.slice(0, reserveCount), attackers: byPowerDesc.slice(reserveCount) }
}

// Alvo do ataque: Taunt é obrigatório quando presente; senão prefere abater de graça (o Pal
// descansado mais forte do oponente que esse atacante consegue destruir sem perder a troca);
// sem alvo assim, ataca a cara do oponente.
function chooseAttackTarget(self, opponent, attackerPal) {
  const forced = EffectEngine.getForcedTauntTargets(opponent, attackerPal)
  if (forced.length > 0) return forced[0]

  const attackerPower = attackerPal.effectivePower(self, opponent)
  const freeKills = opponent.basePals
    .filter(p => EffectEngine.canBeAttackedBy(p, attackerPal) && p.effectivePower(opponent, self) < attackerPower)
    .sort((a, b) => b.effectivePower(opponent, self) - a.effectivePower(opponent, self))

  if (freeKills.length > 0) return { type: 'pal', instance: freeKills[0] }
  return { type: 'player' }
}

// Decisão pura — só lê o estado do motor, nenhum efeito colateral. Devolve a próxima ação a
// executar neste turno, ou { kind: 'endTurn' } quando não sobra nada melhor a fazer.
function chooseAction(tm, self, opponent) {
  const deploy = chooseDeploy(self)
  if (deploy) return deploy

  const act = chooseAct(self)
  if (act) return act

  if (self.soulsStanding >= 3 && !self.soulDrawUsedThisTurn) {
    return { kind: 'soulDraw' }
  }

  const { attackers } = planAttacks(tm, self, opponent)
  if (attackers.length > 0) {
    const pal = attackers[0]
    return { kind: 'attack', pal, target: chooseAttackTarget(self, opponent, pal) }
  }

  return { kind: 'endTurn' }
}

// Executa a ação escolhida, pelas MESMAS APIs que os handlers do jogador humano usam — sempre com
// isBot:true, então o motor auto-resolve toda a cadeia (assign/discard/butcher/alvo/modal) sem
// nunca abrir um pendingEffect que ninguém resolveria.
async function performAction(action, { tm, self, opponent, emit }) {
  switch (action.kind) {
    case 'deployPal': {
      const result = self.tryDeployPal(action.card)
      if (result.success) {
        tm._addLog(`${self.playerName} jogou ${action.card.name}.`)
        tm.runDeployFollowups(self, opponent, result.instance, true)
      }
      return
    }
    case 'deployStructure': {
      const result = self.tryDeployStructure(action.card)
      if (result.success) {
        tm._addLog(`${self.playerName} jogou ${action.card.name}.`)
        EffectEngine.runTrigger(tm, 'onDeploy', result.instance, self, opponent, { isBot: true })
      }
      return
    }
    case 'deployGear': {
      const result = self.tryDeployGear(action.card)
      if (result.success) {
        tm._addLog(`${self.playerName} jogou ${action.card.name}.`)
        EffectEngine.runTrigger(tm, 'onDeploy', result.instance, self, opponent, { isBot: true })
      }
      return
    }
    case 'playEvent': {
      const card = action.card
      if (!self.paySoulCost(card.cost)) return
      self.hand = self.hand.filter(c => c !== card)
      self.graveyard.push(card)
      self.cardsPlayedThisGame = (self.cardsPlayedThisGame || 0) + 1
      tm._addLog(`${self.playerName} jogou ${card.name}.`)
      const eventInstance = { data: card, tempPowerBonus: 0, tempStrikeBonus: 0 }
      const startedModal = EffectEngine.startModalChoice(tm, eventInstance, self, opponent, { isBot: true })
      if (!startedModal) {
        EffectEngine.runTrigger(tm, 'onPlay', eventInstance, self, opponent, { isBot: true })
      }
      return
    }
    case 'activateAct': {
      EffectEngine.activateAbility(tm, self[action.zone][action.index], self, opponent, action.actIndex, { isBot: true })
      return
    }
    case 'soulDraw': {
      self.drawWithSoulCost(3)
      return
    }
    case 'attack': {
      const result = tm.declareAttack(action.pal, action.target, { isBot: true })
      // Guarda a referência ANTES de emitir — emit() já entrega o estado pausado pro cliente, que
      // pode reagir (e resolver a batalha) antes mesmo do await abaixo rodar; ler tm.pendingBattle
      // de novo depois do emit() arriscaria pegar null se isso já tiver acontecido.
      const battle = tm.pendingBattle
      if (result.paused && battle) {
        emit() // avisa o oponente que há bloqueio/Quick Step pendente pra ele decidir
        await battle.waitPromise
      }
      return
    }
  }
}

// Loop do turno inteiro: escolhe -> espera o tempo de ritmo -> executa -> emite estado -> repete,
// até não sobrar ação melhor que encerrar o turno. `isAlive()` é checado antes de cada ação (o
// chamador decide o que isso significa — ver runOnlineBotTurn/runBotTurnWithDelays em server.js);
// teto de iterações é só uma rede de segurança contra um card mal pontuado girar pra sempre.
const MAX_TURN_ITERATIONS = 30

async function playTurn({ tm, self, opponent, emit, isAlive, delay, timing = DEFAULT_TIMING }) {
  for (let i = 0; i < MAX_TURN_ITERATIONS; i++) {
    if (!isAlive() || tm.gameOver) return
    const action = chooseAction(tm, self, opponent)

    if (action.kind === 'endTurn') {
      await delay(timing.endTurn)
      if (!isAlive() || tm.gameOver) return
      const result = tm.endMainPhase()
      emit()
      // Alarm Bell etc. baixou DURANTE o turno (mustAttackAllUntilEndOfTurn) — na próxima volta
      // do loop, planAttacks já enxerga a flag e devolve 'attack' pra cada Pal em pé restante.
      if (!result.success && result.reason === 'MUST_ATTACK') continue
      return
    }

    const timingKey = action.kind === 'attack' ? 'attack' : (action.kind === 'activateAct' ? 'act' : 'deploy')
    await delay(timing[timingKey])
    if (!isAlive() || tm.gameOver) return

    await performAction(action, { tm, self, opponent, emit })
    emit()

    if (!isAlive() || tm.gameOver) return
    if (tm.activePlayer !== self) return // algum trigger já passou a vez sozinho (raro, defensivo)
  }
}

module.exports = {
  DEFAULT_TIMING,
  VS_PLAYER_TIMING,
  decideGoFirst,
  decideMulligan,
  chooseAction,
  playTurn
}
