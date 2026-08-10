// Converte o texto de "effect_text" das cartas em dados estruturados que o EffectEngine sabe executar.
// Cobertura: keywords estáticas, fórmulas CONT simples e gatilhos AUTO (OnDeploy/OnAttack/graveyard) mais comuns.
// Tudo que não é reconhecido cai em `unhandled` sem quebrar (ACT, Quick, Interrupt, modais, variáveis X, night, etc).

const KEYWORD_NAMES = ['Assault', 'Taunt', 'Stealth', 'Vigilance', 'Breakthrough', 'Retaliate', 'Nocturnal']

const TARGET_PATTERNS = [
  {
    // Motor só resolve escolha de 1 alvo por vez — "up to X" OU "up to N" fixo (N>1) viram a MESMA
    // repetição (escolhe 1, repete N/X vezes — ver `repeatsX`/`repeatsFixed` em parseClauseBody).
    // ", and " OU só "," (sem "and") — "Choose 1 Pal, it gets Power..." não usa "and" antes de "it gets"
    re: /Choose up to (\d+|X) (?:◇(\d+) or (less|greater) )?(of your opponent's |of your |your )?Pals?( in the stand state)?(?:,\s*and\s+|,\s*|\s+and\s+)/i,
    build: m => {
      const raw = parseAmount(m[1])
      const target = { mode: 'choose', upTo: true, count: 1, side: sideFromPrefix(m[4]), filter: buildFilter(m[2], m[3], m[5]) }
      if (raw === 'X') target.repeatsX = true
      else if (raw > 1) { target.repeatsX = true; target.repeatsFixed = raw }
      return target
    }
  },
  {
    re: /Choose (\d+|X) (?:◇(\d+) or (less|greater) )?(of your opponent's |of your |your )?Pals?(?:,\s*and\s+|,\s*|\s+and\s+)/i,
    build: m => {
      const raw = parseAmount(m[1])
      if (typeof raw === 'number' && raw > 1) return null
      const target = { mode: 'choose', upTo: false, count: 1, side: sideFromPrefix(m[4]), filter: buildFilter(m[2], m[3]) }
      if (raw === 'X') target.repeatsX = true
      return target
    }
  },
  {
    // "Choose 1 cost X or less Pal, and exile it. X is equal to the cost of the assigned Pal +2."
    // (Viewing Cage) — mesma ideia do "◇N or less" acima, só que com o custo escrito por extenso e
    // resolvido por fórmula (X), não um número fixo — ver `filter.costMaxFormula` em resolveChooseAction.
    re: /Choose (1|up to 1) cost X or (less|greater) (of your opponent's |of your |your )?Pals?(?:,\s*and\s+|,\s*|\s+and\s+)/i,
    build: m => {
      const target = { mode: 'choose', upTo: /up to/i.test(m[1]), count: 1, side: sideFromPrefix(m[3]), filter: {} }
      if (/less/i.test(m[2])) target.filter.costMax = 'X'
      else target.filter.costMin = 'X'
      return target
    }
  },
  {
    re: /Choose all of your main name 《([^》]+)》 Pals?,? and /i,
    build: m => ({ mode: 'all', side: 'own', filter: { palName: m[1] } })
  },
  {
    re: /Choose all of your (?:other )?(red|blue|green|yellow|purple|white|black) Pals?,? and /i,
    build: m => ({ mode: 'all', side: 'own', filter: { color: m[1].toLowerCase() } })
  },
  {
    re: /Choose all of your opponent's (?:◇(\d+) or (less|greater) )?Pals?,? and /i,
    build: m => ({ mode: 'all', side: 'opponent', filter: buildFilter(m[1], m[2]) })
  },
  {
    re: /Choose all of your Pals?,? and /i,
    build: () => ({ mode: 'all', side: 'own', filter: {} })
  },
  {
    re: /Choose all Pals?(?: with Power (\d+) or less)?,? and /i,
    build: m => ({ mode: 'all', side: 'any', filter: m[1] ? { powerMax: parseInt(m[1], 10) } : {} })
  }
]

const CONT_FORMULA_PATTERNS = [
  {
    re: /^This card gets Power \+(\d+) for each of your structures\.?$/i,
    build: m => ({ type: 'perStructure', scope: 'self', amount: +m[1] })
  },
  {
    re: /^This card gets Power \+(\d+) for each of your main name 《([^》]+)》 Pals?\.?$/i,
    build: m => ({ type: 'nameCountBuff', scope: 'self', amount: +m[1], palName: m[2] })
  },
  {
    re: /^All of your main name 《([^》]+)》 Pals get Power \+(\d+)\.?$/i,
    build: m => ({ type: 'nameBuff', scope: 'team', palName: m[1], amount: +m[2] })
  },
  {
    re: /^All of your other (red|blue|green|yellow|purple|white|black) Pals get Power \+(\d+)\.?$/i,
    build: m => ({ type: 'colorBuff', scope: 'team', color: m[1].toLowerCase(), amount: +m[2], excludeSelf: true })
  },
  {
    re: /^All of your (red|blue|green|yellow|purple|white|black) Pals get Power \+(\d+)\.?$/i,
    build: m => ({ type: 'colorBuff', scope: 'team', color: m[1].toLowerCase(), amount: +m[2], excludeSelf: false })
  },
  {
    re: /^If you have (\d+) or more souls, this card gets Power \+(\d+)(?:\/Strike \+(\d+))?/i,
    build: m => ({ type: 'soulThreshold', scope: 'self', souls: +m[1], power: +m[2], strike: m[3] ? +m[3] : 0 })
  },
  {
    re: /^This card cannot be attacked by ◇(\d+) or (less|greater) Pals\.?/i,
    build: m => ({ type: 'attackRestriction', scope: 'self', cost: +m[1], cmp: m[2].toLowerCase() })
  },
  {
    re: /^While this card is in the rest state, it is night\.?$/i,
    build: () => ({ type: 'nightWhileResting', scope: 'self' })
  },
  {
    re: /^If it is night, all of your opponent's Pals get Power (-\d+)/i,
    build: m => ({ type: 'nightDebuffOpponent', scope: 'self', amount: +m[1] })
  },
  {
    re: /^If this card is in the rest state, all of your opponent's Pals get Strike (-\d+)/i,
    build: m => ({ type: 'restingDebuffOpponent', scope: 'self', amount: +m[1] })
  },
  {
    re: /^If it is night, your Pal's AUTO activates twice\.?$/i,
    build: () => ({ type: 'doubleAutoAtNight', scope: 'self' })
  },
  {
    // "CONT When your red card would deal Damage other than battle damage to a Pal, deal +200 Damage
    // instead (Strengthens this card's ability too)." (Suzaku – Hellfire Wings) — bônus no dano de
    // ações "damage" (nunca dano de batalha, que nem passa por 'applyAction') vindas de carta vermelha
    // sua; "Strengthens this card's ability too" já cai de graça (Suzaku entra na própria soma via fieldCardsOf).
    re: /^When your red card would deal Damage other than battle damage to a Pal, deal \+(\d+) Damage instead\s*\.?$/i,
    build: m => ({ type: 'redNonBattleDamageBonus', scope: 'self', amount: +m[1] })
  }
]

// "X" vira a string 'X' (resolvida depois, por fórmula ou escolha do jogador); número normal vira Number
function parseAmount(str) {
  return /^x$/i.test(str) ? 'X' : parseInt(str, 10)
}

function sideFromPrefix(prefix) {
  if (!prefix) return 'any'
  return /opponent/i.test(prefix) ? 'opponent' : 'own'
}

function buildFilter(costNum, costCmp, standingFlag) {
  const filter = {}
  if (costNum) {
    if (/less/i.test(costCmp)) filter.costMax = parseInt(costNum, 10)
    else filter.costMin = parseInt(costNum, 10)
  }
  if (standingFlag) filter.standingOnly = true
  return filter
}

function stripAsides(text) {
  return text.replace(/\([^)]*\)/g, ' ').replace(/〈[^〉]*〉/g, ' ').trim()
}

function findTargetMatch(sentence) {
  let best = null
  for (const pattern of TARGET_PATTERNS) {
    const m = pattern.re.exec(sentence)
    if (!m) continue
    const target = pattern.build(m)
    if (!target) continue
    if (!best || m.index < best.index) {
      best = { index: m.index, length: m[0].length, target }
    }
  }
  return best
}

function parseTargetedActions(text, target) {
  const actions = []
  let m
  if ((m = /deal (\d+) Damage/i.exec(text))) actions.push({ type: 'damage', amount: +m[1], target })
  else if ((m = /gets? (\d+|X) Damage\b/i.exec(text))) actions.push({ type: 'damage', amount: parseAmount(m[1]), target })
  if ((m = /Power ([+-]\d+)/i.exec(text))) actions.push({ type: 'buffPower', amount: +m[1], duration: 'endOfTurn', target })
  if ((m = /Strike ([+-]\d+)/i.exec(text))) actions.push({ type: 'buffStrike', amount: +m[1], duration: 'endOfTurn', target })
  if (/\brest (it|them|this card)\b/i.test(text)) actions.push({ type: 'rest', target })
  if (/\bstand (it|them)\b/i.test(text)) actions.push({ type: 'stand', target })
  if (/put (it|them) into the graveyard/i.test(text)) actions.push({ type: 'destroy', target })
  if (/cannot block/i.test(text)) actions.push({ type: 'preventBlock', target })
  if (/return (it|them) to hand/i.test(text)) actions.push({ type: 'returnToHand', target })
  if (/\bexile it\b/i.test(text)) actions.push({ type: 'exile', target })
  if (/\bbutcher it\b/i.test(text)) actions.push({ type: 'butcher', target })
  return actions
}

function parseUntargetedActions(text) {
  const actions = []
  let m
  if ((m = /Get (\d+) Material\b/i.exec(text))) actions.push({ type: 'gainMaterial', amount: +m[1] })
  if ((m = /Get (\d+) Ingredient\b/i.exec(text))) actions.push({ type: 'gainIngredient', amount: +m[1] })
  if ((m = /Get either (\d+) Material or (\d+) Ingredient\b/i.exec(text))) {
    actions.push({ type: 'chooseResourceEither', materialAmount: +m[1], ingredientAmount: +m[2] })
  }
  if ((m = /Draw (\d+|X) card/i.exec(text))) actions.push({ type: 'draw', amount: parseAmount(m[1]) })
  if ((m = /[Gg]ain (\d+) life/i.exec(text))) actions.push({ type: 'gainLife', amount: +m[1] })
  if ((m = /[Cc]hoose (\d+) souls?,? and stand them/i.exec(text))) actions.push({ type: 'standSouls', amount: +m[1] })
  if ((m = /Increase your soul by (\d+) cards? in the rest state/i.exec(text))) actions.push({ type: 'addRestedSoul', amount: +m[1] })
  // "chooses" = escolha real de quem descarta/destrói, não decisão automática do motor (mesmo pro
  // bot — só que a escolha do bot usa uma heurística simples em vez de abrir um popup pra ele).
  if (/your opponent chooses 1 card from (?:their|your) hand,? and discards it/i.test(text)) {
    actions.push({ type: 'opponentDiscardChoice' })
  } else if (/choose 1 card from your hand,? and discards? it/i.test(text)) {
    actions.push({ type: 'discardOwnHandChoice' })
  } else if (/\byou may discard (?:\d+|a) cards? from hand\b/i.test(text)) {
    // "You may discard 1 card from hand. If you discarded this way, ..." (Lovander) — diferente de
    // "discard N cards from hand" (sem "you may"): aqui é OPCIONAL e a carta é ESCOLHIDA, não aleatória.
    actions.push({ type: 'discardOwnHandChoice', optional: true })
  } else if ((m = /\bdiscard (\d+|a) cards? from hand\b/i.exec(text))) {
    actions.push({ type: 'discardOwnHandRandom', amount: /a/i.test(m[1]) ? 1 : +m[1] })
  }
  if (/your opponent chooses 1 of their Pals,? and puts? it into the graveyard/i.test(text)) {
    actions.push({ type: 'opponentDestroyChoice' })
  }
  if (/it becomes night until the end of the opponent's next turn/i.test(text)) actions.push({ type: 'setNight' })
  // "Reduce the cost of playing your next gear from hand by X until end of turn." (Primitive Furnace) —
  // X vem do custo "Consume X Material" (context.chosenAmount), sem fórmula própria; "does not become
  // ◇0 or less" (o piso de custo 1) é aplicado na hora de deployar a gear, não aqui no parse.
  if ((m = /Reduce the cost of playing your next gear from hand by (\d+|X)\b/i.exec(text))) {
    actions.push({ type: 'discountNextGear', amount: parseAmount(m[1]) })
  }
  if (/deploy the Pal exiled by this card into the owner's base in the rest state/i.test(text)) {
    actions.push({ type: 'returnExiledToField' })
  }
  if (/return all Pals exiled by this card to the owner's hand/i.test(text)) {
    actions.push({ type: 'returnExiledToHand' })
  }
  return actions
}

function parseSentence(sentence) {
  for (const p of PRECONDITION_PATTERNS) {
    const m = p.re.exec(sentence)
    if (m) {
      const inner = parseSentence(sentence.slice(m[0].length))
      for (const a of inner) a.precondition = p.id
      return inner
    }
  }
  if (/^If /i.test(sentence)) return [] // condições não avaliadas nesta fase — não aplica incondicionalmente
  const targetHit = findTargetMatch(sentence)
  if (targetHit) {
    const before = sentence.slice(0, targetHit.index)
    const after = sentence.slice(targetHit.index + targetHit.length)
    // `after` pode ter uma ação sem alvo encadeada depois ("...it gets Power +200, and you get 1 Material")
    return [...parseUntargetedActions(before), ...parseTargetedActions(after, targetHit.target), ...parseUntargetedActions(after)]
  }
  const selfIdx = sentence.search(/\b(?:This card|It) gets\b/i)
  if (selfIdx !== -1) {
    const before = sentence.slice(0, selfIdx)
    const after = sentence.slice(selfIdx)
    return [...parseUntargetedActions(before), ...parseTargetedActions(after, { mode: 'self' }), ...parseUntargetedActions(after)]
  }
  if (/\bStand this card\b/i.test(sentence)) {
    const before = sentence.replace(/\bStand this card\b/i, '')
    return [...parseUntargetedActions(before), markOptionalIfYouMay(sentence, { type: 'stand', target: { mode: 'self' } })]
  }
  if (/\bExile the assigned Pal\b/i.test(sentence)) {
    const before = sentence.replace(/\bExile the assigned Pal\b/i, '')
    return [...parseUntargetedActions(before), markOptionalIfYouMay(sentence, { type: 'exile', target: { mode: 'contextPal' } })]
  }
  // "AUTO At the end of the battle this card attacked, you may return this card to hand." (Bushi –
  // Ephemeral Blade) — "you may" aqui é diferente do "you may discard N cards" (que já tem sua própria
  // checagem, com popup de ESCOLHA DE CARTA); aqui não há escolha de alvo nenhuma (self/contextPal),
  // só uma confirmação simples — ver `optional` em resolveClauseActions/applyAction.
  if (/\breturn this card to hand\b/i.test(sentence)) {
    const before = sentence.replace(/\breturn this card to hand\b/i, '')
    return [...parseUntargetedActions(before), markOptionalIfYouMay(sentence, { type: 'returnToHand', target: { mode: 'self' } })]
  }
  if (/\bput this card into the graveyard\b/i.test(sentence)) {
    const before = sentence.replace(/\bput this card into the graveyard\b/i, '')
    return [...parseUntargetedActions(before), markOptionalIfYouMay(sentence, { type: 'destroy', target: { mode: 'self' } })]
  }
  return parseUntargetedActions(sentence)
}

// "you may {verbo}" antes de uma ação SEM alvo escolhido (self/contextPal) — ao contrário de "you may
// choose/discard N ..." (que já abrem um popup de escolha próprio e cobrem a opcionalidade sozinhos),
// essas ações de sentença fixa (Stand this card, Exile the assigned Pal, return this card to hand, put
// this card into the graveyard) rodavam incondicionalmente mesmo com "you may" no texto.
function markOptionalIfYouMay(sentence, action) {
  if (/\byou may\b/i.test(sentence)) action.optional = true
  return action
}

// "X is equal to ..." — só as fórmulas que algum efeito suportado realmente consegue usar
// (contagem de structures/gears/souls do próprio controlador, ou o custo de um Pal do contexto
// da própria habilidade — o Pal usado pra pagar "assign"/"butcher", ou o Pal que acabou de ser
// abatido — pra filtrar busca no cemitério)
function parseXFormula(text) {
  if (/number of your structures/i.test(text)) return { type: 'countStructures' }
  if (/number of your gears|your number of gears/i.test(text)) return { type: 'countGears' }
  if (/number of your souls|your number of souls/i.test(text)) return { type: 'countSouls' }
  if (/this card's power/i.test(text)) return { type: 'selfPower' }
  // "X is equal to the number of different card names among your structures with 《Antique》 in their
  // card names" (Antique Curtain) — nomes DISTINTOS (não a quantidade de cópias) entre suas structures
  // cujo nome contém o substring.
  let m2 = /number of different card names among your structures with 《([^》]+)》 in their card names/i.exec(text)
  if (m2) return { type: 'distinctStructureNameSubstring', substring: m2[1] }
  let m
  if ((m = /cost of the assigned Pal\s*([+-]\s*\d+)?/i.exec(text))) {
    return { type: 'costOfContextPal', modifier: m[1] ? parseInt(m[1].replace(/\s/g, ''), 10) : 0 }
  }
  if ((m = /cost of the butchered Pal\s*([+-]\s*\d+)?/i.exec(text))) {
    return { type: 'costOfContextPal', modifier: m[1] ? parseInt(m[1].replace(/\s/g, ''), 10) : 0 }
  }
  return null
}

// Dicionário fechado de condições "If ..." que dá pra checar direto no estado do jogo —
// qualquer outra condição continua caindo fora (guarda mais abaixo em parseSentence).
const PRECONDITION_PATTERNS = [
  { re: /^if you have a 〈Nocturnal〉 Pal in the rest state,\s*/i, id: 'hasRestingNocturnal' },
  { re: /^if there are no Pals exiled by this card in the exile zone,\s*/i, id: 'noExiledByThis' },
  { re: /^if it is night,\s*/i, id: 'isNight' },
  // "If you have not played any other cards during this game, draw 2 cards." (The Adventure Begins) —
  // ver PlayerState.cardsPlayedThisGame, incrementado nos 4 pontos de entrada de "jogar carta da mão".
  { re: /^if you have not played any other cards? during this game,\s*/i, id: 'noOtherCardsPlayedThisGame' }
]

// Extrai uma precondição do dicionário fechado ANTES de stripAsides — algumas (ex: `hasRestingNocturnal`)
// dependem do literal 〈Nocturnal〉, que stripAsides removeria antes do regex sequer rodar. Por isso todo
// ponto de entrada de cláusula (pushClause/parseActLine) precisa checar isto no texto CRU, não no já-limpo.
function extractPrecondition(rawBody) {
  const trimmed = rawBody.trim()
  for (const p of PRECONDITION_PATTERNS) {
    const m = p.re.exec(trimmed)
    if (m) return { id: p.id, rest: trimmed.slice(m[0].length) }
  }
  return null
}

// "Choose 1 Pal, and it gets Power +200 until end of turn. If its main name is 《Foxparks》, it gets
// the skill in 〈〉 until end of turn. 〈AUTO OnAttack Choose up to 1 Pal, and deal 700 Damage〉." (Foxparks'
// Harness) — concede uma habilidade temporária ao Pal escolhido, condicionada ao nome principal dele.
// Precisa rodar no texto CRU (antes de stripAsides, que apagaria o conteúdo de 〈〉) — mesmo motivo do
// hasRestingNocturnal acima.
function parseGrantSkillIfMainNameClause(rawBody) {
  const m = /^(.*?)\.\s*If its main name is 《([^》]+)》,\s*it gets the skill in 〈\s*〉 until end of turn\.\s*〈\s*AUTO\s+(OnAttack|OnDeploy)\b\s*(.*?)\s*〉\.?$/i.exec(rawBody.trim())
  if (!m) return null

  const baseActions = parseClauseBody(stripAsides(m[1]) + '.')
  const chooseAction = baseActions.find(a => a.target && a.target.mode === 'choose')
  if (!chooseAction) return null

  const grantedActions = parseClauseBody(stripAsides(m[4]) + '.')
  if (!grantedActions.length) return null

  baseActions.push({
    type: 'grantSkillIfMainName',
    target: chooseAction.target,
    palName: m[2],
    triggerType: m[3].toLowerCase() === 'onattack' ? 'onAttack' : 'onDeploy',
    grantedActions
  })
  return baseActions
}

// "Choose 1 Pal, and it gets Power +200 until end of turn. If its main name is 《Pengullet》, instead it
// gets Power +500 and the skill in 〈〉 until end of turn. 〈ACT [Rest this card] Choose all of your
// opponent's Pals, and they get X Damage. X is equal to this card's Power. Put this card into the
// graveyard〉." (Pengullet Rocket Launcher) — diferente da Foxparks' Harness: o buff é SUBSTITUÍDO (não
// somado) e a habilidade concedida é uma ACT própria (não um gatilho AUTO) — ver 'grantedActs' no
// EffectEngine, que funciona como uma 2a entrada em getAllActAbilities() só pra essa instância.
function parseReplaceBuffAndGrantActIfMainNameClause(rawBody) {
  const m = /^Choose 1 Pal, and it gets Power \+(\d+) until end of turn\.\s*If its main name is 《([^》]+)》,\s*instead it gets Power \+(\d+) and the skill in 〈\s*〉 until end of turn\.\s*〈\s*(ACT\s*\[[^\]]*\][^〉]*)〉\.?$/i.exec(rawBody.trim())
  if (!m) return null

  const grantedAbility = parseActLine(m[4].replace(/^ACT\s*/i, ''))
  if (!grantedAbility) return null
  grantedAbility.description = m[4].trim()

  const target = { mode: 'choose', upTo: false, count: 1, side: 'any', filter: {} }
  return [
    { type: 'buffPower', amount: +m[1], duration: 'endOfTurn', target },
    {
      type: 'replaceBuffAndGrantActIfMainName',
      target,
      palName: m[2],
      defaultAmount: +m[1],
      replacementAmount: +m[3],
      grantedAbility
    }
  ]
}

// "Choose 1 Pal, and it gets Power +200 until end of turn. If its main name is 《Digtoise》, get either
// 2 Material or 2 Ingredient." (Digtoise's Headband) — a consequência é pro CASTER (não pro Pal
// escolhido), só condicionada ao nome principal dele — por isso não usa 'grantSkill'/'replaceBuff'.
function parseMainNameResourceChoiceClause(rawBody) {
  const m = /^(.*?)\.\s*If its main name is 《([^》]+)》,\s*get either (\d+) Material or (\d+) Ingredient\.?$/i.exec(rawBody.trim())
  if (!m) return null

  const baseActions = parseClauseBody(stripAsides(m[1]) + '.')
  const chooseAction = baseActions.find(a => a.target && a.target.mode === 'choose')
  if (!chooseAction) return null

  baseActions.push({
    type: 'runIfMainName',
    target: chooseAction.target,
    palName: m[2],
    thenActions: [{ type: 'chooseResourceEither', materialAmount: +m[3], ingredientAmount: +m[4] }]
  })
  return baseActions
}

// "The Pal assigned to this card gets the skill in 〈〉 until the end of the opponent's next turn.
// 〈CONT Taunt (...)〉." (No Pals Beyond Sign) — sem condição de nome, e o alvo é o Pal pago como custo
// ("Assign 1 Pal"), não uma escolha nova — reaproveita o mode 'contextPal' já usado por 'Exile the
// assigned Pal' em parseSentence.
function parseGrantTauntToAssignedClause(rawBody) {
  const m = /^The Pal assigned to this card gets the skill in 〈\s*〉 until the end of the opponent's next turn\.\s*〈\s*CONT\s+Taunt\b[^〉]*〉\.?$/i.exec(rawBody.trim())
  if (!m) return null
  return [{ type: 'grantTauntUntilOpponentNextTurn', target: { mode: 'contextPal' } }]
}

// "This card gets Power +500 and the skill in 〈〉 until end of turn." / "Until end of turn, this card
// gets Power +500, and the skill in 〈〉." / "Choose 1 Pal, and it gets Power +200 and the skill in
// 〈〉 until end of turn." — concede uma KEYWORD estática (Breakthrough/Assault/Stealth/Vigilance) até
// o fim do turno, pra si mesma ou pro Pal escolhido. (Digtoise x2, Gumoss, Cawgnito Hat, Grappling Gun)
function parseGrantKeywordBuffClause(rawBody) {
  const trimmed = rawBody.trim()
  const keywordAfter = m => {
    const kw = /〈\s*(?:AUTO|CONT)\s+([A-Za-z]+)\b[^〉]*〉\.?$/i.exec(m)
    return kw ? normalizeKeywordName(kw[1]) : null
  }

  let m = /^Choose 1 Pal, and it gets Power \+(\d+) and the skill in 〈\s*〉 until end of turn\.\s*(.*)$/i.exec(trimmed)
  if (m) {
    const keyword = keywordAfter(m[2])
    if (!keyword) return null
    const target = { mode: 'choose', upTo: false, count: 1, side: 'any', filter: {} }
    return [
      { type: 'buffPower', amount: +m[1], duration: 'endOfTurn', target },
      { type: 'grantKeywordUntilEndOfTurn', target, keyword }
    ]
  }

  m = /^(?:This card|It) gets Power \+(\d+) and the skill in 〈\s*〉 until end of turn\.\s*(.*)$/i.exec(trimmed)
  if (!m) m = /^Until end of turn, this card gets Power \+(\d+),? and the skill in 〈\s*〉\.\s*(.*)$/i.exec(trimmed)
  if (m) {
    const keyword = keywordAfter(m[2])
    if (!keyword) return null
    const target = { mode: 'self' }
    return [
      { type: 'buffPower', amount: +m[1], duration: 'endOfTurn', target },
      { type: 'grantKeywordUntilEndOfTurn', target, keyword }
    ]
  }

  return null
}

// "Choose up to 1 ◇6 or less Pal, and rest it. While this card is in the base, that card does not
// stand." (Relaxaurus – Hungry Gunner) — trava persistente: o Pal escolhido não levanta enquanto ESTA
// carta (a fonte) continuar em campo, não só até o próximo stand phase. Libera quando a fonte sai
// (ver _releaseStandLocksFrom em TurnManager, chamado de _sendToGraveyard/_returnToHand).
function parseRestAndLockStandingClause(rawBody) {
  const m = /^(.*?)\.\s*While this card is in the base, that card does not stand\.?$/i.exec(rawBody.trim())
  if (!m) return null
  const baseActions = parseClauseBody(stripAsides(m[1]) + '.')
  const restAction = baseActions.find(a => a.type === 'rest' && a.target && a.target.mode === 'choose')
  if (!restAction) return null
  baseActions.push({ type: 'lockStandingWhileOnField', target: restAction.target })
  return baseActions
}

// "..., and rest it. That card does not stand during your opponent's next stand phase." (Jormuntide –
// Surging Sea Serpent) / "Choose 1 Pal, and it gets Strike -3 until end of turn. That card does not
// stand during your opponent's next stand phase." (Crystal Breath) / "Choose up to 2 ◇6 or less Pals,
// and rest them. Those cards do not stand during your opponent's next stand phase." (Hot Spring, alvo
// múltiplo — singular/plural) — trava de UM turno só (ao contrário da Relaxaurus, que trava enquanto
// ela ficar em campo): pula só a PRÓXIMA vez que o dono do Pal escolhido tiver um stand phase, depois
// libera sozinho — não precisa de "rest" no texto base (Crystal Breath nem tem), só precisa existir
// ALGUM alvo "choose" na cláusula pra amarrar a trava.
function parseSkipNextStandClause(rawBody) {
  const m = /^(.*?)\.\s*(?:That card does not|Those cards do not) stand during your opponent's next stand phase\.?$/i.exec(rawBody.trim())
  if (!m) return null
  const baseActions = parseClauseBody(stripAsides(m[1]) + '.')
  const chooseAction = baseActions.find(a => a.target && a.target.mode === 'choose')
  if (!chooseAction) return null
  baseActions.push({ type: 'skipNextStandPhase', target: chooseAction.target })
  return baseActions
}

// "If you have 3 or more Pals with 《My First》 in their different card names, choose all of your
// Pals, and they get Power +1000/Strike +5 until end of turn." (The Adventure Begins) — threshold de
// NOMES DISTINTOS contendo um substring (não uma contagem simples de cartas, e não uma fórmula de X);
// por isso vira uma precondição paramétrica própria (objeto, não string id), em vez de entrar no
// dicionário fechado PRECONDITION_PATTERNS (que só carrega um id fixo sem parâmetros).
function parseDistinctNameThresholdClause(rawBody) {
  const m = /^If you have (\d+) or more Pals with 《([^》]+)》 in their different card names,\s*(.*)$/i.exec(rawBody.trim())
  if (!m) return null
  const actions = parseClauseBody(stripAsides(m[3]))
  if (!actions.length) return null
  const precondition = { id: 'distinctPalNameSubstring', min: +m[1], substring: m[2] }
  for (const a of actions) a.precondition = precondition
  return actions
}

// "Choose up to 2 Pals without 〈Interrupt〉 from your graveyard, and return them to hand. It becomes
// night until the end of the opponent's next turn." (Black Marketeer) — o filtro "without 〈X〉" usa
// marcação 〈〉 pra carregar a keyword excluída, então precisa ler o corpo CRU (stripAsides apagaria);
// "it becomes night" não depende da escolha, por isso entra ANTES do cardSelect no array retornado
// (cardSelect sempre precisa ser a ÚLTIMA ação resolvida numa cláusula — ver resolveClauseActions).
function parseGraveyardExcludeKeywordClause(rawBody) {
  const m = /^Choose (up to \d+|\d+) Pals? without 〈([^〉]+)〉 from your graveyard,?\s*and return (?:it|them) to hand\.\s*(.*)$/i.exec(rawBody.trim())
  if (!m) return null
  const maxPicks = parseInt(/\d+/.exec(m[1])[0], 10)
  const cardSelectAction = {
    type: 'cardSelect', source: 'graveyard', mandatory: !/up to/i.test(m[1]), maxPicks,
    filter: { cardTypes: ['Pal'], excludeKeyword: m[2] }, destination: 'hand', remainder: null, zeroBonus: null
  }
  const restActions = m[3] ? parseClauseBody(stripAsides(m[3])) : []
  return [...restActions, cardSelectAction]
}

// "Stand all Pals assigned this turn. Until end of turn, your Pals cannot be assigned, and must
// attack as much as possible (Includes Pals deployed after activating this ability)." (Alarm Bell) —
// 3 efeitos de estado do JOGADOR (não de um alvo escolhido): reerguer quem foi assinalado neste
// turno, bloquear novos "assign" até o fim do turno, e forçar ataque com tudo que ficar em pé.
function parseStandAssignedForceAttackClause(rawBody) {
  const m = /^Stand all Pals assigned this turn\.\s*Until end of turn, your Pals cannot be assigned, and must attack as much as possible\b/i.exec(rawBody.trim())
  if (!m) return null
  return [
    { type: 'standAllAssignedThisTurn' },
    { type: 'preventAssignUntilEndOfTurn' },
    { type: 'mustAttackAllUntilEndOfTurn' }
  ]
}

// "Declare 1 card name. Choose all of your cards, and they get that declared card name in addition
// until end of turn." (Antique Dresser) — abre um modal com os nomes principais já presentes no seu
// campo pro jogador escolher; a aplicação em si (grantedNamesUntilEndOfTurn) roda no engine.
function parseDeclareNameClause(rawBody) {
  if (!/^Declare 1 card name\.\s*Choose all of your cards,?\s*and they get that declared card name in addition until end of turn\.?$/i.test(rawBody.trim())) return null
  return [{ type: 'declareNameForTeam' }]
}

function parseClauseBodyTopLevel(rawBody) {
  const declareName = parseDeclareNameClause(rawBody)
  if (declareName) return declareName

  const graveyardExcludeKeyword = parseGraveyardExcludeKeywordClause(rawBody)
  if (graveyardExcludeKeyword) return graveyardExcludeKeyword

  const distinctNameThreshold = parseDistinctNameThresholdClause(rawBody)
  if (distinctNameThreshold) return distinctNameThreshold

  const replaceBuffAndGrantAct = parseReplaceBuffAndGrantActIfMainNameClause(rawBody)
  if (replaceBuffAndGrantAct) return replaceBuffAndGrantAct

  const grantSkill = parseGrantSkillIfMainNameClause(rawBody)
  if (grantSkill) return grantSkill

  const mainNameResourceChoice = parseMainNameResourceChoiceClause(rawBody)
  if (mainNameResourceChoice) return mainNameResourceChoice

  const grantTaunt = parseGrantTauntToAssignedClause(rawBody)
  if (grantTaunt) return grantTaunt

  const grantKeywordBuff = parseGrantKeywordBuffClause(rawBody)
  if (grantKeywordBuff) return grantKeywordBuff

  const restAndLockStanding = parseRestAndLockStandingClause(rawBody)
  if (restAndLockStanding) return restAndLockStanding

  const skipNextStand = parseSkipNextStandClause(rawBody)
  if (skipNextStand) return skipNextStand

  const standAssignedForceAttack = parseStandAssignedForceAttackClause(rawBody)
  if (standAssignedForceAttack) return standAssignedForceAttack

  const pre = extractPrecondition(rawBody)
  if (pre) {
    const actions = parseClauseBody(stripAsides(pre.rest))
    for (const a of actions) a.precondition = pre.id
    return actions
  }
  return parseClauseBody(stripAsides(rawBody))
}

// Filtro de carta (deck/cemitério/mão) — reaproveita costMax/costMin, e acrescenta tipo/cor/nome/etc.
function parseCardFilterText(text) {
  const filter = {}
  let m
  if (/cost X or less/i.test(text)) filter.costMax = 'X'
  else if (/\bcost X\b/i.test(text)) filter.costExact = 'X'
  else if ((m = /◇(\d+) or (less|greater)/i.exec(text))) {
    if (/less/i.test(m[2])) filter.costMax = +m[1]
    else filter.costMin = +m[1]
  }
  if (/\bnormal\b/i.test(text)) filter.normalOnly = true
  if ((m = /main name 《([^》]+)》/i.exec(text))) filter.palName = m[1]
  if (/\bdragon\b/i.test(text)) filter.typepalDragon = true
  if ((m = /\b(red|blue|green|yellow|purple|white|black)\b/i.exec(text))) filter.color = m[1].toLowerCase()
  const types = []
  if (/\bpals?\b/i.test(text)) types.push('Pal')
  if (/\bstructures?\b/i.test(text)) types.push('Structure')
  if (/\bgears?\b/i.test(text)) types.push('Gear')
  if (types.length) filter.cardTypes = types
  return filter
}

// Reveal/Look at o topo do deck, buscar no cemitério, ou jogar direto da mão — vira uma ação só
// (`cardSelect`), tratada por fora do modelo de "target" (não escolhe um Pal em campo, escolhe
// uma carta de uma zona). Roda ANTES da quebra em sentenças porque alguns formatos atravessam
// mais de uma frase (ex: "...you may deploy it. If you did not deploy it, add it to hand.").
function parseCardSelectClause(body) {
  let m

  // "Reveal the top card..., and if it is a X, you may deploy it. If you did not deploy it, add it to hand."
  m = /^Reveal the top card of your deck,?\s*(?:and\s+)?if it is a (.+?),\s*you may deploy it\.\s*If you did not deploy it,\s*add it to hand\.?$/i.exec(body)
  if (m) {
    return { type: 'cardSelect', source: 'deckTop', count: 1, filter: parseCardFilterText(m[1]), destination: 'deploy', remainder: 'hand', zeroBonus: null }
  }

  // "Look at the top card..., and if that is a X, you may play it with its cost reduced by N."
  m = /^Look at the top card of your deck,?\s*and if that is a (.+?),\s*you may play it with its cost reduced by (\d+)\.?/i.exec(body)
  if (m) {
    return { type: 'cardSelect', source: 'deckTop', count: 1, filter: parseCardFilterText(m[1]), destination: 'deployDiscount', discountAmount: +m[2], remainder: 'putBack', zeroBonus: null }
  }

  // "Reveal the top card..., add it to hand if it is a X, otherwise put it into the graveyard." (sem escolha)
  m = /^Reveal the top card of your deck,?\s*add it to hand if it is a (.+?),\s*otherwise put it into the graveyard\.?$/i.exec(body)
  if (m) {
    return { type: 'cardRevealBranch', filter: parseCardFilterText(m[1]), onMatch: 'hand', onNoMatch: 'graveyard' }
  }

  // "Look at/Reveal the top N cards..., choose (up to) 1+ X from among them and {add to hand|deploy
  //  it/them}, and {shuffle the rest with the deck|put the remaining cards into the graveyard}. [If 0,
  //  bônus.]" — "up to 2" (Reptyro Cryst) exige escolher mais de uma carta da mesma revelação, não só 1.
  m = /^(?:Look at|Reveal) the top (\d+) cards? of your deck,?\s*choose (up to \d+|\d+) (.+?) from among them and (add (?:it|them) to hand|deploy (?:it|them)),?\s*and (shuffle the rest of the cards with the deck|put the remaining cards? into the graveyard)\.?(?:\s*If you (?:choose|chose) 0 cards?,\s*(.+?)\.?)?$/i.exec(body)
  if (m) {
    const zeroBonus = m[6] ? parseClauseBody(m[6]) : null
    const maxPicks = parseInt(/\d+/.exec(m[2])[0], 10)
    return {
      type: 'cardSelect', source: 'deckTop', count: +m[1], mandatory: !/up to/i.test(m[2]), maxPicks,
      filter: parseCardFilterText(m[3]), destination: /deploy/i.test(m[4]) ? 'deploy' : 'hand',
      remainder: /shuffle/i.test(m[5]) ? 'shuffle' : 'graveyard',
      zeroBonus: zeroBonus && zeroBonus.length ? zeroBonus : null
    }
  }

  // "Choose (up to) 1 X from your graveyard, and deploy it in the rest state. [X is equal to ...]"
  m = /^Choose (1|up to 1) (.+?) from your graveyard,?\s*and deploy it in the rest state\.?/i.exec(body)
  if (m) {
    const filter = parseCardFilterText(m[2])
    if (filter.costMax === 'X' || filter.costExact === 'X') {
      const formula = extractXFormula(body)
      if (!formula) return null // X sem fórmula reconhecida aqui não tem como perguntar ao jogador — fora de escopo
      if (filter.costMax === 'X') filter.costMaxFormula = formula
      else filter.costExactFormula = formula
    }
    return { type: 'cardSelect', source: 'graveyard', mandatory: !/up to/i.test(m[1]), filter, destination: 'deployRested', remainder: null, zeroBonus: null }
  }

  // "Choose (up to) 1 [normal] X from your graveyard, and return it to hand. [Your opponent chooses
  // 1 card from their hand, and discards it.]" — a 2a frase (quando existe) é encadeada via `andThen`,
  // já que o cardSelect precisa pausar pra escolha do cemitério ANTES de rodar o descarte do oponente.
  m = /^Choose (1|up to 1) (.+?) from your graveyard,?\s*and return it to hand\.?(?:\s*(Your opponent chooses 1 card from (?:their|your) hand,?\s*and discards it)\.?)?$/i.exec(body)
  if (m) {
    const action = { type: 'cardSelect', source: 'graveyard', mandatory: !/up to/i.test(m[1]), filter: parseCardFilterText(m[2]), destination: 'hand', remainder: null, zeroBonus: null }
    if (m[3]) action.andThen = [{ type: 'opponentDiscardChoice' }]
    return action
  }

  // "Choose (up to) 1 X from (your) hand, and deploy it."
  m = /^Choose (1|up to 1) (.+?) from (?:your )?hand,?\s*and deploy it\.?$/i.exec(body)
  if (m) {
    return { type: 'cardSelect', source: 'hand', mandatory: !/up to/i.test(m[1]), filter: parseCardFilterText(m[2]), destination: 'deploy', remainder: null, zeroBonus: null }
  }

  // "Draw N cards, choose (up to) 1 card from your hand, and put it on the top of the deck." —
  // única forma no dataset onde o cardSelect aparece JUNTO com outra ação na mesma sentença (sem
  // ponto no meio); por isso retorna um ARRAY (a ação anterior roda direto, o cardSelect por último).
  m = /^Draw (\d+) cards?,?\s*choose (up to 1|1) cards? from (?:your )?hand,?\s*and put (?:it|them) on(?: to)? the top of the deck\.?$/i.exec(body)
  if (m) {
    return [
      { type: 'draw', amount: +m[1] },
      { type: 'cardSelect', source: 'hand', mandatory: !/up to/i.test(m[2]), filter: {}, destination: 'topOfDeck', remainder: null, zeroBonus: null }
    ]
  }

  // "You may reveal 1 card from your hand. If you revealed a X this way, {consequência}."
  // Revela sem mudar de zona — a consequência só roda se a carta escolhida bater no filtro.
  m = /^You may reveal 1 card from (?:your )?hand\.\s*If you revealed a (.+?) this way,\s*(.+?)\.?$/i.exec(body)
  if (m) {
    const then = parseClauseBody(m[2] + '.')
    if (!then.length) return null
    return {
      type: 'cardSelect', source: 'hand', mandatory: false, filter: {}, destination: 'revealOnly',
      remainder: null, zeroBonus: null, checkFilter: parseCardFilterText(m[1]), then
    }
  }

  return null
}

function extractXFormula(body) {
  const m = /X is equal to ([^.]+)\.?/i.exec(body)
  return m ? parseXFormula(m[1].trim()) : null
}

// "{Ação opcional}. If you {discarded/butchered} ... this way, {consequência}." — a consequência
// só roda em tempo de execução se a ação principal realmente aconteceu (ver EffectEngine).
function parseThenClause(body) {
  const m = /^(.*?)\.\s*If you (?:discarded|butchered|put)(?: 1 or more (?:cards|Pals))? this way,?\s*(.*)$/i.exec(body)
  if (!m) return null
  const primary = parseClauseBody(m[1] + '.')
  const consequence = parseClauseBody(m[2])
  if (!primary.length || !consequence.length) return null
  primary.then = consequence
  return primary
}

// "Increase your soul by N card(s) in the rest state. If there were M or more souls before increasing,
// choose K souls, and stand them." (Feed Box) — precisa do total de souls ANTES do aumento; como a
// 1a ação já muda esse total, não dá pra checar isso como uma precondição "depois" — vira uma ação
// combinada só, com a 2a ação carregando o threshold pra o motor conferir o valor pré-aumento.
function parseSoulThresholdClause(body) {
  const m = /^Increase your soul by (\d+) cards? in the rest state\.\s*If there were (\d+) or more souls before increasing,\s*choose (\d+) souls?,?\s*and stand them\.?$/i.exec(body)
  if (!m) return null
  return [
    { type: 'addRestedSoul', amount: +m[1] },
    { type: 'standSoulsIfThreshold', standAmount: +m[3], threshold: +m[2] }
  ]
}

function parseClauseBody(body) {
  const cleaned = body.replace(/\.$/, '').trim()
  if (!cleaned) return []

  const cardSelect = parseCardSelectClause(cleaned)
  if (cardSelect) return Array.isArray(cardSelect) ? cardSelect : [cardSelect]

  const soulThreshold = parseSoulThresholdClause(cleaned)
  if (soulThreshold) return soulThreshold

  const thenResult = parseThenClause(cleaned)
  if (thenResult) return thenResult

  const sentences = cleaned.split(/\.\s+/).map(s => s.trim()).filter(Boolean)
  const actions = []
  for (const sentence of sentences) actions.push(...parseSentence(sentence))
  if (!actions.length) return actions

  const usesXAmount = actions.some(a => a.amount === 'X')
  const usesXRepeat = actions.some(a => a.target && a.target.repeatsX)
  // "Choose 1 cost X or less Pal, and exile it." (Viewing Cage) — X no FILTRO do alvo (não na
  // quantidade escolhida nem na repetição), resolvido em resolveChooseAction via costMaxFormula/costMinFormula.
  const usesXFilterCost = actions.some(a => a.target && a.target.filter && (a.target.filter.costMax === 'X' || a.target.filter.costMin === 'X'))
  if (usesXAmount || usesXRepeat || usesXFilterCost) {
    // "Choose up to 2 ◇6 or less Pals, ..." (Hot Spring) — número FIXO (não X), mesma repetição
    // "escolhe 1, repete N vezes" já usada pra "up to X", só que a fórmula já é conhecida de cara.
    const fixedRepeat = actions.map(a => a.target && a.target.repeatsFixed).find(v => v != null)
    const formula = fixedRepeat != null ? { type: 'fixed', value: fixedRepeat } : extractXFormula(cleaned) // null = X escolhido pelo jogador ao pagar o custo, não uma fórmula
    if (usesXAmount) for (const a of actions) if (a.amount === 'X') a.amountFormula = formula
    if (usesXRepeat) {
      actions.repeats = true
      actions.repeatFormula = formula
      for (const a of actions) if (a.target) { delete a.target.repeatsX; delete a.target.repeatsFixed }
    }
    if (usesXFilterCost && formula) {
      for (const a of actions) {
        if (!a.target || !a.target.filter) continue
        if (a.target.filter.costMax === 'X') { a.target.filter.costMaxFormula = formula; delete a.target.filter.costMax }
        if (a.target.filter.costMin === 'X') { a.target.filter.costMinFormula = formula; delete a.target.filter.costMin }
      }
    }
  }
  return actions
}

// "Perform 〈ação〉 X times" (ou N times) — o miolo entre 〈〉 é a cláusula repetida, não um "skill grant"
function parsePerformXTimes(text) {
  const m = /Perform\s+〈([^〉]*)〉\s*(\d+|X)\s*times/i.exec(text)
  if (!m) return null
  const innerActions = parseClauseBody(stripAsides(m[1]))
  if (!innerActions.length) return null
  const raw = parseAmount(m[2])
  innerActions.repeats = true
  innerActions.repeatFormula = typeof raw === 'number' ? { type: 'fixed', value: raw } : null
  return innerActions
}

function parseContFormula(text) {
  // Precisa checar ANTES de stripAsides — esse conceder-skill usa 〈〉 pra carregar a keyword concedida,
  // e stripAsides removeria justamente esse trecho.
  if (/^All of your Pals get the skill in 〈\s*〉\.\s*〈CONT Nocturnal/i.test(text)) {
    return { type: 'grantNocturnalToTeam', scope: 'self' }
  }
  const cleaned = stripAsides(text)
  for (const pattern of CONT_FORMULA_PATTERNS) {
    const m = pattern.re.exec(cleaned)
    if (m) return pattern.build(m)
  }
  return null
}

function normalizeKeywordName(name) {
  return name[0].toUpperCase() + name.slice(1).toLowerCase()
}

// ---------- ACT (habilidades ativadas manualmente, com custo entre [...]) ----------

const CIRCLED_DIGITS = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5, '⑥': 6, '⑦': 7, '⑧': 8, '⑨': 9 }

function parseCostItem(item) {
  let m
  if (/^Rest this card$/i.test(item)) return { type: 'restSelf' }
  if (/^Consume X Material$/i.test(item)) return { type: 'consumeMaterialX' }
  if (/^Consume X Ingredient$/i.test(item)) return { type: 'consumeIngredientX' }
  if ((m = /^Consume (\d+) Material$/i.exec(item))) return { type: 'consumeMaterial', amount: +m[1] }
  if ((m = /^Consume (\d+) Ingredient$/i.exec(item))) return { type: 'consumeIngredient', amount: +m[1] }
  if ((m = /^Assign (\d+) Pals?$/i.exec(item))) return { type: 'assignPal', amount: +m[1] }
  if (/^Butcher 1 (?:other )?Pal$/i.test(item)) return { type: 'butcherPal' }
  if (/^Discard X cards? from hand$/i.test(item)) return { type: 'discardHandX' }
  if ((m = /^Discard (\d+) cards? from hand$/i.exec(item))) return { type: 'discardHand', amount: +m[1] }
  if (/^Discard 1 structure from hand$/i.test(item)) return { type: 'discardHandType', amount: 1, cardType: 'Structure' }
  if (/^[①②③④⑤⑥⑦⑧⑨]$/.test(item)) return { type: 'soulCost', amount: CIRCLED_DIGITS[item] }
  if ((m = /^Put the top (\d+) cards? of the deck into the graveyard$/i.exec(item))) return { type: 'millTopCards', amount: +m[1] }
  return null
}

function parseCostGroup(raw) {
  const items = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (!items.length) return null
  const parsed = []
  for (const item of items) {
    const costItem = parseCostItem(item)
    if (!costItem) return null
    parsed.push(costItem)
  }
  return parsed
}

// body = tudo depois de "ACT " (já sem o "Interrupt", tratado antes de chamar isso)
function parseActLine(body) {
  let text = body.trim()
  let oncePerTurn = false
  const onceMatch = /^1\/Turn\s+/i.exec(text)
  if (onceMatch) {
    oncePerTurn = true
    text = text.slice(onceMatch[0].length)
  }

  const costGroups = []
  let rest = text
  while (true) {
    const bracketMatch = /^\[([^\]]*)\]\s*/.exec(rest)
    if (!bracketMatch) return null // ACT sem custo reconhecível no início — fora de escopo
    const items = parseCostGroup(bracketMatch[1])
    if (!items) return null
    costGroups.push(items)
    rest = rest.slice(bracketMatch[0].length)
    const orMatch = /^OR\s+/i.exec(rest)
    if (!orMatch) break
    rest = rest.slice(orMatch[0].length)
  }

  const actions = parsePerformXTimes(rest) || parseClauseBodyTopLevel(rest)
  if (!actions.length) return null
  return { oncePerTurn, costGroups, actions }
}

// X sem fórmula reconhecida só é seguro fora do custo de um ACT (onde o jogador escolhe o valor
// ao pagar) — em qualquer gatilho automático (AUTO/onPlay/Quick/modal) não existe esse passo de
// escolha, então uma "fórmula" que não bateu com nada resolveria pra 0 silenciosamente. Melhor
// cair em unhandled do que fingir que funciona.
function hasUnresolvedX(actions) {
  if (actions.repeats && !actions.repeatFormula) return true
  if (actions.some(a => a.amount === 'X' && !a.amountFormula)) return true
  return actions.some(a => a.target && a.target.filter && (a.target.filter.costMax === 'X' || a.target.filter.costMin === 'X'))
}

function pushClause(bucket, body, unhandled) {
  const actions = parseClauseBodyTopLevel(body)
  if (actions.length && !hasUnresolvedX(actions)) { bucket.push(actions); return actions }
  unhandled.push(body)
  return null
}

function classifyLine(line, result) {
  let m

  // "AUTO Brave 300 (OnAttack This card gets Power +300 until end of turn)" — mecanismo fixo, já
  // aplicado direto no EffectEngine (runTrigger onAttack) a partir só do valor; a aside não é lida.
  if ((m = /^AUTO\s+Brave\s+(\d+)\b/i.exec(line))) {
    result.keywords.push({ name: 'Brave', value: +m[1] })
    return
  }
  // "AUTO Serious 400 (OnAssign Choose 1 Pal, and it gets Power +400 until end of turn)" (Rooby,
  // Teafant, Tanzee) — ao contrário de Brave, o alvo pode ser QUALQUER Pal (não só a própria carta),
  // então precisa mesmo interpretar a aside como um gatilho 'onAssign' de verdade, não hardcoded.
  if ((m = /^AUTO\s+Serious\s+(\d+)\s*\(OnAssign\s+([^)]*)\)/i.exec(line))) {
    result.keywords.push({ name: 'Serious', value: +m[1] })
    const actions = parseClauseBodyTopLevel(m[2])
    if (actions.length && !hasUnresolvedX(actions)) result.onAssign.push(actions)
    else result.unhandled.push(line)
    return
  }
  if ((m = /^AUTO\s+Serious\s+(\d+)\b/i.exec(line))) {
    result.keywords.push({ name: 'Serious', value: +m[1] })
    return
  }

  const keywordAlt = KEYWORD_NAMES.join('|')
  if ((m = new RegExp(`^(?:AUTO|CONT)\\s+(${keywordAlt})\\b`, 'i').exec(line))) {
    result.keywords.push({ name: normalizeKeywordName(m[1]) })
    return
  }

  if ((m = /^AUTO\s+OnDeploy\b\s*(.*)$/i.exec(line))) {
    pushClause(result.onDeploy, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+OnAttack\b\s*(.*)$/i.exec(line))) {
    pushClause(result.onAttack, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+When this card is put into the graveyard,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onGraveyard, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+When this card leaves the base,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onLeaveBase, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+When this card attacks a structure,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onAttackStructure, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+At the end of your turn,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onEndOfTurn, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+When this card is attacked,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onAttacked, m[1], result.unhandled)
    return
  }
  if ((m = /^AUTO\s+At the end of the battle this card attacked,?\s*(.*)$/i.exec(line))) {
    pushClause(result.onEndOfBattleAttacked, m[1], result.unhandled)
    return
  }
  // Gatilhos "globais" — observam QUALQUER carta sua (não só a própria) sendo deployada/abatida
  if ((m = /^AUTO\s+When your (?:(red|blue|green|yellow|purple|white|black)|〈([^〉]+)〉)?\s*Pal is deployed,?\s*(.*)$/i.exec(line))) {
    const condition = m[1] ? { color: m[1].toLowerCase() } : (m[2] ? { keyword: m[2] } : {})
    const actions = parseClauseBodyTopLevel(m[3])
    if (actions.length && !hasUnresolvedX(actions)) result.onAllyDeploy.push({ condition, actions })
    else result.unhandled.push(line)
    return
  }
  if ((m = /^AUTO\s+When your Pal is butchered,?\s*(.*)$/i.exec(line))) {
    const actions = parseClauseBodyTopLevel(m[1])
    if (actions.length && !hasUnresolvedX(actions)) result.onAllyButcher.push({ condition: {}, actions })
    else result.unhandled.push(line)
    return
  }
  // "AUTO When this card is assigned to a 「Farming」 structure, draw 1 card." (Mau Cryst, Dumud) —
  // diferente do Serious (onAssign incondicional): só dispara se a STRUCTURE/GEAR de destino tiver
  // esse work_keyword. Precisa saber o destino em tempo de execução, daí a categoria própria.
  if ((m = /^AUTO\s+When this card is assigned to an? 「([^」]+)」 structure,?\s*(.*)$/i.exec(line))) {
    const actions = parseClauseBodyTopLevel(m[2])
    if (actions.length && !hasUnresolvedX(actions)) result.onAssignToWorkStructure.push({ workKeyword: m[1], actions })
    else result.unhandled.push(line)
    return
  }
  if (/^ACT\s+Interrupt\b/i.test(line)) {
    // Custo e efeito de Interrupt são fixos pela regra 12.8.2 — só precisa marcar que a carta tem a habilidade
    result.hasInterrupt = true
    return
  }
  if ((m = /^ACT\s+(.*)$/i.exec(line))) {
    const parsedAct = parseActLine(m[1])
    // Descrição crua (texto original da linha) — usada pelo front pra listar qual ACT é qual quando
    // a carta tem mais de uma (ex: Primitive Furnace, Breeding Farm).
    if (parsedAct) { parsedAct.description = line.trim(); result.act.push(parsedAct); return }
    result.unhandled.push(line)
    return
  }
  if ((m = /^Quick\s+(.*)$/i.exec(line))) {
    // Keyword Quick: pode ser jogada no Quick Step (12.2), além de continuar jogável normalmente como Event
    const actions = pushClause(result.quick, m[1], result.unhandled)
    if (actions) result.onPlay.push(actions)
    return
  }
  if ((m = /^CONT\s+(.*)$/i.exec(line))) {
    const formula = parseContFormula(m[1])
    if (formula) { result.cont.push(formula); return }
    result.unhandled.push(line)
    return
  }

  // Linha sem prefixo reconhecido — típico de carta Event (efeito resolve direto ao jogar).
  // Não cai aqui nenhuma linha com AUTO/ACT/CONT/Quick/Interrupt — mesmo que o sub-gatilho não seja
  // um dos reconhecidos acima (ex: "AUTO When your red Pal is deployed"), pra não tratar gatilho
  // alheio a esta carta como se fosse resolução imediata.
  if (!/^(AUTO|ACT|CONT|Quick|Interrupt)\b/i.test(line)) {
    const actions = parseClauseBodyTopLevel(line)
    if (actions.length && !hasUnresolvedX(actions)) { result.onPlay.push(actions); return }
  }
  result.unhandled.push(line)
}

// "Choose 1 of the following:" + bullets "・" — cada bullet usa a mesma gramática de sempre.
// Bullets cujo verbo não é reconhecido ainda ficam com actions:[] (opção vira um no-op se escolhida,
// mas continua listada com o texto real pro jogador ver).
function parseModalBlock(effectText) {
  const lines = effectText.split('\n').map(l => l.trim()).filter(Boolean)
  if (!/^Choose \d+ of the following:?$/i.test(lines[0])) return null
  const bulletLines = lines.slice(1).filter(l => l.startsWith('・'))
  if (!bulletLines.length) return null

  const options = bulletLines.map(bullet => {
    const description = bullet.replace(/^・/, '').trim()
    const actions = parseClauseBody(stripAsides(description))
    return { description, actions: hasUnresolvedX(actions) ? [] : actions }
  })
  return options.some(o => o.actions.length > 0) ? options : null
}

function parseEffectText(effectText) {
  const result = {
    keywords: [], cont: [], onDeploy: [], onAttack: [], onGraveyard: [], onLeaveBase: [], onAttackStructure: [],
    onEndOfTurn: [], onAttacked: [], onEndOfBattleAttacked: [], onAllyDeploy: [], onAllyButcher: [], onAssign: [],
    onAssignToWorkStructure: [],
    onPlay: [], act: [], quick: [], hasInterrupt: false, modal: null, unhandled: []
  }
  if (!effectText || !effectText.trim()) return result

  const modalOptions = parseModalBlock(effectText)
  if (modalOptions) {
    result.modal = modalOptions
    return result
  }
  if (/Choose \d+ of the following/i.test(effectText) || /^・/m.test(effectText)) {
    result.unhandled.push(effectText) // modal sem nenhuma opção reconhecível
    return result
  }

  const lines = effectText.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) classifyLine(line, result)
  return result
}

module.exports = { parseEffectText }
