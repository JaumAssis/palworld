import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'
import { socket } from './socket'
import {
  CardSlot, PalCard, StructureGearRow, CardChoiceModal, DamageRevealModal, GraveyardModal,
  MatchLogPanel, Overlay, AttackBadge, canAttackPal, THEMED_H2, THEMED_P, THEMED_RESULT_WIN, THEMED_RESULT_LOSE, THEMED_RESULT_NEUTRAL,
  WOOD_H2, WOOD_P, WOOD_PAGE_BACKGROUND, BOARD_WIDTH, BOARD_HEIGHT
} from './GameBoardUI'

function GameBoard() {
  const { t } = useLanguage()
  const CHOICE_LABELS = { rock: t('rockLabel'), paper: t('paperLabel'), scissors: t('scissorsLabel') }
  const [stage, setStage] = useState('selectDeck')
  const [decks, setDecks] = useState([])
  const [rpsResult, setRpsResult] = useState(null)
  const [mulliganHand, setMulliganHand] = useState([])
  const [mulliganZoomCard, setMulliganZoomCard] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [soulImageUrl, setSoulImageUrl] = useState(null)
  const [selectedPalIndex, setSelectedPalIndex] = useState(null)
  const [draggedPalIndex, setDraggedPalIndex] = useState(null)
  const [amountInput, setAmountInput] = useState(1)
  const [actPicker, setActPicker] = useState(null) // { zone, index, acts } — carta com 2+ ACTs (ex: Primitive Furnace)
  const [graveyardView, setGraveyardView] = useState(null) // { ownerName, cards } — popup de "ver cemitério"
  const [zoomCard, setZoomCard] = useState(null)
  const [damageRevealShown, setDamageRevealShown] = useState(null)
  const [boardScale, setBoardScale] = useState(1)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const hoverTimerRef = useRef(null)
  const seenDamageRevealIdRef = useRef(null)
  const damageRevealTimerRef = useRef(null)

  // Encaixe exato (sem multiplicador de "aumento") — é a única forma de garantir que nada corte
  // nas bordas em NENHUMA resolução. Qualquer multiplicador > 1 aplicado aqui sobra pra fora do
  // lado que está "no limite" (normalmente a altura), e o quanto isso corta cabeçalho/botões
  // varia com a barra de navegador/tarefas de cada tela — testamos e ficava inconsistente.
  useEffect(() => {
    const updateScale = () => {
      setBoardScale(Math.min(window.innerWidth / BOARD_WIDTH, window.innerHeight / BOARD_HEIGHT, 1))
      // boardLeftMargin (mais abaixo) depende da largura da janela mesmo quando a escala está
      // travada em 1 (tela grande) — sem isso, redimensionar não recalculava a margem porque
      // boardScale não mudava, e o painel de log ficava com largura desatualizada.
      setViewportWidth(window.innerWidth)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    apiFetch('/api/decks').then(r => r.json()).then(setDecks)
    apiFetch('/api/cards/SOUL-001').then(r => r.json()).then(c => setSoulImageUrl(c.image_url)).catch(() => {})

    socket.on('bot:rpsPrompt', () => setStage('rps'))

    socket.on('bot:rpsResult', (data) => {
      setRpsResult(data)
      if (data.result !== 'draw') {
        // 7s de propósito: dá tempo dos players lerem quem ganhou/perdeu antes de avançar.
        setTimeout(() => setStage(data.result === 'win' ? 'chooseOrder' : 'waitingBotOrder'), 7000)
        if (data.result === 'lose') {
          setTimeout(() => socket.emit('bot:chooseOrder', { goFirst: false }), 7100)
        }
      }
    })

    socket.on('bot:mulliganPrompt', ({ hand }) => {
      setMulliganHand(hand)
      setStage('mulligan')
    })

    socket.on('bot:state', (state) => {
      setGameState(state)
      setStage(state.gameOver ? 'gameOver' : 'playing')
      if (state.pendingEffect?.kind === 'amount') setAmountInput(state.pendingEffect.min ?? 1)
      if (state.lastDamageReveal && state.lastDamageReveal.id !== seenDamageRevealIdRef.current) {
        seenDamageRevealIdRef.current = state.lastDamageReveal.id
        setDamageRevealShown(state.lastDamageReveal)
        clearTimeout(damageRevealTimerRef.current)
        damageRevealTimerRef.current = setTimeout(() => setDamageRevealShown(null), 4500)
      }
    })

    socket.on('bot:error', (err) => {
      alert(err.message)
    })

    return () => {
      clearTimeout(damageRevealTimerRef.current)
      socket.off('bot:rpsPrompt')
      socket.off('bot:rpsResult')
      socket.off('bot:mulliganPrompt')
      socket.off('bot:state')
      socket.off('bot:error')
    }
  }, [])

  // O zoom de hover usa um timer de 2s independente do resto da UI — se um popup de escolha de
  // carta abrir enquanto o mouse ainda está "parado" sobre a carta que iniciou o zoom, o timer
  // dispara depois do popup já aberto. Cancela nesse momento pra não sobrar zoom de outra carta ali.
  useEffect(() => {
    if (gameState?.pendingEffect?.kind === 'cardChoice') cancelHoverZoom()
  }, [gameState?.pendingEffect?.kind])

  const startMatch = (deckId) => {
    socket.emit('bot:start', { deckId })
  }

  const sendRPS = (choice) => {
    setRpsResult(null)
    socket.emit('bot:rpsChoice', { choice })
  }

  const chooseOrder = (goFirst) => {
    socket.emit('bot:chooseOrder', { goFirst })
  }

  const decideMulligan = (keep) => {
    socket.emit('bot:mulliganDecision', { keep })
  }

  const advancePhase = () => socket.emit('bot:advancePhase')

  const deployPal = (cardNumber) => socket.emit('bot:deployPal', { cardNumber })
  const deployStructure = (cardNumber) => socket.emit('bot:deployStructure', { cardNumber })
  const deployGear = (cardNumber) => socket.emit('bot:deployGear', { cardNumber })
  const deployEvent = (cardNumber) => socket.emit('bot:deployEvent', { cardNumber })
  const drawWithSouls = () => socket.emit('bot:drawWithSouls')

  const handleHandCardClick = (card) => {
    if (card.card_type === 'Pal') deployPal(card.card_number)
    else if (card.card_type === 'Structure') deployStructure(card.card_number)
    else if (card.card_type === 'Gear') deployGear(card.card_number)
    else if (card.card_type === 'Event') deployEvent(card.card_number)
  }

  // Compartilhado pelos dois caminhos de atacar um Pal inimigo — arraste (attackerIndex vem de
  // draggedPalIndex) e clique (attackerIndex vem de selectedPalIndex, ver clickAttackReady abaixo).
  const attackPalAt = (attackerIndex, targetIndex) => {
    if (attackerIndex === null || gameState?.pendingEffect) return
    socket.emit('bot:attackPal', { attackerIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }
  const handleDropOnEnemyPal = (targetIndex) => attackPalAt(draggedPalIndex, targetIndex)

  const attackWithPal = (palIndex) => {
    if (gameState?.pendingEffect) return
    socket.emit('bot:attack', { palIndex })
    setSelectedPalIndex(null)
  }

  const isPendingTarget = (owner, index) =>
    !!gameState?.pendingEffect?.validTargets?.some(t => t.owner === owner && t.index === index)

  const resolveEffectTarget = (owner, index) => socket.emit('bot:resolveEffectTarget', { owner, index })
  const skipEffectTarget = () => socket.emit('bot:resolveEffectTarget', { skip: true })

  const activateAbility = (zone, index, actIndex = 0) => {
    if (gameState?.pendingEffect) return
    socket.emit('bot:activateAbility', { zone, index, actIndex })
  }

  // Cartas com só 1 ACT (a maioria) ativam direto; com 2+ (ex: Primitive Furnace, Breeding Farm),
  // abre um seletor pra escolher qual das habilidades usar.
  const handleActivateClick = (zone, index, acts) => {
    if (!acts || acts.length === 0) return
    if (acts.length === 1) { activateAbility(zone, index, acts[0].index); return }
    setActPicker({ zone, index, acts })
  }

  const chooseActFromPicker = (actIndex) => {
    if (!actPicker) return
    activateAbility(actPicker.zone, actPicker.index, actIndex)
    setActPicker(null)
  }

  const resolveBlock = (blockerIndex) => socket.emit('bot:resolveBlock', { blockerIndex })
  const resolveNoBlock = () => socket.emit('bot:resolveBlock', { none: true })
  const playQuickCard = (cardNumber, kind) => socket.emit('bot:resolveQuickStep', { cardNumber, kind })
  const passQuickStep = () => socket.emit('bot:resolveQuickStep', { pass: true })
  const resolveInterruptCost = (method) => socket.emit('bot:resolveInterruptCost', { method })
  const resolveInterruptDiscard = (cardNumber) => socket.emit('bot:resolveInterruptDiscard', { cardNumber })

  const resolveAmount = (amount) => socket.emit('bot:resolveAmount', { amount })
  const resolveModalChoice = (optionIndex) => socket.emit('bot:resolveModalChoice', { optionIndex })

  const resolveCardChoice = (index) => socket.emit('bot:resolveCardChoice', { index })
  const skipCardChoice = () => socket.emit('bot:resolveCardChoice', { skip: true })

  // Mesma ideia de attackPalAt: attackerIndex explícito, não fixo em draggedPalIndex — senão o
  // caminho de clique (que usa selectedPalIndex) seria descartado em silêncio por este guard.
  const attackStructureAt = (attackerIndex, targetIndex) => {
    if (attackerIndex === null || gameState?.pendingEffect || gameState?.pendingBattle) return
    socket.emit('bot:attackStructure', { attackerIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }
  const attackStructure = (targetIndex) => attackStructureAt(draggedPalIndex, targetIndex)

  const startHoverZoom = (imageUrl, name) => {
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setZoomCard({ imageUrl, name }), 500)
  }
  const cancelHoverZoom = () => {
    clearTimeout(hoverTimerRef.current)
    setZoomCard(null)
  }

  if (stage === 'selectDeck') {
    return (
      <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '2rem', textAlign: 'center', background: WOOD_PAGE_BACKGROUND }}>
        <Link to="/"><button className="sign-button" style={{ marginBottom: '20px' }}>{t('backToMenu')}</button></Link>
        <h2 style={WOOD_H2}>{t('gbChooseDeck')}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          {decks.map(d => (
            <button key={d.id} className="sign-button" onClick={() => startMatch(d.id)} style={{ fontSize: '16px' }}>
              {d.name}
            </button>
          ))}
        </div>
        {decks.length === 0 && <p style={WOOD_P}>{t('gbNoDecks')}</p>}
      </div>
    )
  }

  if (stage === 'rps' || stage === 'waitingBotOrder') {
    const rpsAccent = rpsResult ? (rpsResult.result === 'win' ? 'win' : rpsResult.result === 'lose' ? 'lose' : 'neutral') : 'neutral'
    return (
      <Overlay accent={rpsAccent} maxWidth="500px">
        <h2 style={THEMED_H2}>{t('gbRpsTitle')}</h2>
        <p style={THEMED_P}>{t('gbRpsIntro')}</p>
        {!rpsResult && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} className="sign-button" onClick={() => sendRPS(key)} style={{ fontSize: '18px' }}>{label}</button>
            ))}
          </div>
        )}
        {rpsResult && (
          <div style={{ marginTop: '16px' }}>
            <p style={THEMED_P}>{t('gbRpsVs', { player: CHOICE_LABELS[rpsResult.playerChoice], bot: CHOICE_LABELS[rpsResult.botChoice] })}</p>
            {rpsResult.result === 'draw' && <p style={THEMED_RESULT_NEUTRAL}>{t('gbRpsDraw')}</p>}
            {rpsResult.result === 'win' && <p style={THEMED_RESULT_WIN}>🏆 {t('gbRpsWin')}</p>}
            {rpsResult.result === 'lose' && <p style={THEMED_RESULT_LOSE}>{t('gbRpsLose')}</p>}
          </div>
        )}
        {rpsResult?.result === 'draw' && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} className="sign-button" onClick={() => sendRPS(key)} style={{ fontSize: '18px' }}>{label}</button>
            ))}
          </div>
        )}
      </Overlay>
    )
  }

  if (stage === 'chooseOrder') {
    return (
      <Overlay accent="win">
        <h2 style={THEMED_H2}>🏆 {t('gbRpsWin')}</h2>
        <p style={THEMED_P}>{t('gbChooseOrderQuestion')}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
          <button className="sign-button" onClick={() => chooseOrder(true)}>{t('gbGoFirst')}</button>
          <button className="sign-button" onClick={() => chooseOrder(false)}>{t('gbGoSecond')}</button>
        </div>
      </Overlay>
    )
  }

  if (stage === 'mulligan') {
    return (
      <Overlay maxWidth="560px">
        <h2 style={THEMED_H2}>{t('gbMulliganTitle')}</h2>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
          {mulliganHand.map((c, i) => (
            <img key={i} src={c.image_url} alt={c.name} onClick={() => setMulliganZoomCard(c)}
                 style={{ width: '95px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', cursor: 'pointer' }} />
          ))}
        </div>
        <p style={THEMED_P}>{t('gbMulliganQuestion')}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
          <button className="sign-button" onClick={() => decideMulligan(true)}>{t('gbKeepHand')}</button>
          <button className="sign-button" onClick={() => decideMulligan(false)}>{t('gbMulligan')}</button>
        </div>

        {mulliganZoomCard && (
          <div onClick={() => setMulliganZoomCard(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, cursor: 'zoom-out'
          }}>
            <img src={mulliganZoomCard.image_url} alt={mulliganZoomCard.name}
                 style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: '14px', border: '4px solid #c99a4e', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }} />
          </div>
        )}
      </Overlay>
    )
  }

  if (stage === 'gameOver') {
    const won = gameState.winner === 'Você'
    return (
      <Overlay accent={won ? 'win' : 'lose'}>
        <h2 style={won ? THEMED_RESULT_WIN : THEMED_RESULT_LOSE}>{won ? t('gbYouWin') : t('gbYouLose')}</h2>
        <Link to="/"><button className="sign-button" style={{ marginTop: '18px' }}>{t('backToMenu')}</button></Link>
      </Overlay>
    )
  }

  if (!gameState) return <p style={{ padding: '2rem' }}>{t('gbLoadingMatch')}</p>

  const { player, bot, hand, currentPhase, turnNumber, isPlayerTurn, pendingEffect, pendingBattle, log, logTotal } = gameState
  const isValidBlocker = (i) => pendingBattle?.waitingFor === 'block' && pendingBattle.validBlockers.includes(i)
  const quickOptionFor = (cardNumber) =>
    pendingBattle?.waitingFor === 'quick' ? pendingBattle.quickOptions.find(o => o.cardNumber === cardNumber) : null

  // Selecionar um Pal em pé (clique) já É o "modo de mira" — sem estado extra. Enquanto um arraste
  // está em andamento (draggedPalIndex) ele manda em quem é o atacante; clique só assume quando não
  // há arraste ativo. clickAttackReady é o que decide se os alvos ganham contorno/badge de ataque
  // e se o botão do rodapé vira "atacar" em vez de "encerrar turno".
  const canAct = !pendingEffect && !pendingBattle && isPlayerTurn && currentPhase === 'main'
  const attackSourceIndex = draggedPalIndex !== null ? draggedPalIndex : selectedPalIndex
  const attackSource = attackSourceIndex !== null ? player.basePals[attackSourceIndex] : null
  const clickAttackReady = canAct && draggedPalIndex === null && selectedPalIndex !== null && !!attackSource?.isStanding

  const SoulRow = ({ standing, rested }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {Array.from({ length: standing }).map((_, i) => (
        soulImageUrl
          ? <img key={'s' + i} src={soulImageUrl} alt="Soul" style={{ width: '19px', height: '27px', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
          : <div key={'s' + i} style={{ width: '19px', height: '27px', background: '#ffd54a', border: '1px solid #b8860b', borderRadius: '4px' }} />
      ))}
      {Array.from({ length: rested }).map((_, i) => (
        soulImageUrl
          ? <img key={'r' + i} src={soulImageUrl} alt="Soul" style={{ width: '19px', height: '27px', objectFit: 'cover', borderRadius: '4px', transform: 'rotate(90deg)', filter: 'grayscale(100%)', opacity: 0.7 }} />
          : <div key={'r' + i} style={{ width: '19px', height: '27px', background: '#7a7a7a', border: '1px solid #444', borderRadius: '4px', transform: 'rotate(90deg)' }} />
      ))}
    </div>
  )

  const SoulCount = ({ standing, rested }) => (
    <div style={{
      background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '5px 12px',
      color: '#fff', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'
    }}>
      {standing} standing / {rested} rested
    </div>
  )

  // Margem real sobrando à esquerda do tabuleiro escalado (o próprio tabuleiro é centralizado
  // pelo flex do container). O quadro de log nunca pode passar dessa margem, senão sobrepõe o
  // tabuleiro em telas mais estreitas/baixas.
  const boardLeftMargin = Math.max(0, (viewportWidth - BOARD_WIDTH * boardScale) / 2)
  const logPanelWidth = Math.min(160, boardLeftMargin - 10)

  return (
    <div onClick={() => selectedPalIndex !== null && setSelectedPalIndex(null)} style={{
      height: '100vh', width: '100%', overflow: 'hidden', position: 'relative', isolation: 'isolate',
      background: "url('/ambient.webp') center / cover no-repeat fixed",
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'
    }}>
      {/* Camada de "noite" — no nível de FORA do canvas, cobrindo a tela inteira (inclusive a moldura
          de fundo que sobra ao redor do tabuleiro em telas maiores que a referência), não só o
          quadrado do tabuleiro. Mesma imagem do toggle do menu principal, com crossfade suave; só a
          opacidade anima, quem controla é o próprio jogo (cartas com efeito de night). `isolation:
          isolate` no container acima garante que esse z-index negativo não escape pra trás do fundo
          da própria página. */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
        background: "url('/night.png') center / cover no-repeat fixed",
        opacity: gameState.isNight ? 1 : 0,
        transition: 'opacity 1.2s ease'
      }} />

      {/* "Canvas" de tamanho FIXO (BOARD_WIDTH x BOARD_HEIGHT) escalado via CSS transform pra caber
          na janela — a composição/proporção de tudo lá dentro (linha do turno, souls, vida...) é
          sempre a mesma, então a "limpeza" visual não depende mais da resolução: só encolhe/aumenta
          como uma unidade só, em vez de cada linha flex esparramar sozinha conforme a largura. */}
      <div style={{
        width: BOARD_WIDTH + 'px', height: BOARD_HEIGHT + 'px', flexShrink: 0,
        transform: `scale(${boardScale})`, transformOrigin: 'center center',
        position: 'relative',
        padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><button className="sign-button" style={{ fontSize: '12px' }}>{t('gbExitMatch')}</button></Link>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {t('gbTurn', { n: turnNumber, whoseTurn: isPlayerTurn ? t('gbYourTurn') : t('gbOpponentTurnNamed', { name: bot.playerName }) })}
        </div>
      </div>

      {/* ---------- BOT ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🤖 {bot.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: bot.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: bot.graveyardCount })} width="56px" height="76px"
                      onClick={() => setGraveyardView({ ownerName: bot.playerName, cards: bot.graveyard || [] })} />
          </div>
          <SoulRow standing={bot.soulsStanding} rested={bot.soulsRested} />
          <SoulCount standing={bot.soulsStanding} rested={bot.soulsRested} />
          <span style={{ color: '#fff', fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {t('gbMaterial', { n: bot.material ?? 0 })} · {t('gbIngredient', { n: bot.ingredient ?? 0 })}
          </span>
          <span style={{ color: '#fff', fontSize: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {t('gbLifeHand', { life: bot.life, hand: bot.handCount })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minHeight: '90px', marginTop: '6px' }}>
          {bot.basePals.map((p, i) => {
            const isEffectTarget = isPendingTarget('bot', i)
            // canAttackPal (Assault etc.) já considera tanto arraste quanto seleção por clique,
            // já que attackSource é o atacante de qualquer um dos dois caminhos.
            const canTargetThis = canAttackPal(p, attackSource)
            const clickTargetable = clickAttackReady && canTargetThis
            return (
              <div key={i}
                   onDragOver={e => canTargetThis && e.preventDefault()}
                   onDrop={() => canTargetThis && handleDropOnEnemyPal(i)}
                   onClick={() => {
                     if (isEffectTarget) { resolveEffectTarget('bot', i); return }
                     if (clickTargetable) attackPalAt(selectedPalIndex, i)
                   }}
                   style={{
                     position: 'relative',
                     outline: isEffectTarget ? '2px dashed #6cf25a' : ((canTargetThis && (draggedPalIndex !== null || clickTargetable)) ? '2px dashed #ffd54a' : 'none'),
                     borderRadius: '8px', cursor: (isEffectTarget || clickTargetable) ? 'pointer' : 'default'
                   }}>
                <PalCard pal={p} width="62px" onHoverStart={startHoverZoom} onHoverEnd={cancelHoverZoom} />
                {clickTargetable && <AttackBadge onClick={() => attackPalAt(selectedPalIndex, i)} />}
              </div>
            )
          })}
          <StructureGearRow structures={bot.baseStructures || []} gear={bot.baseGear || []} cardWidth="62px" cardHeight="86px"
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom}
                             onDropStructure={attackStructure} dragActive={draggedPalIndex !== null}
                             onAttackStructure={(i) => attackStructureAt(selectedPalIndex, i)} attackActive={clickAttackReady} />
        </div>
      </div>

      {/* ---------- JOGADOR ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1, minHeight: '90px' }}>
          {player.basePals.map((p, i) => {
            const isEffectTarget = isPendingTarget('player', i)
            const isBlockTarget = isValidBlocker(i)
            return (
              <div key={i}
                   draggable={!pendingEffect && !pendingBattle && p.isStanding && isPlayerTurn && currentPhase === 'main'}
                   onDragStart={() => setDraggedPalIndex(i)}
                   onDragEnd={() => setDraggedPalIndex(null)}
                   style={{ outline: (isEffectTarget || isBlockTarget) ? '2px dashed #6cf25a' : 'none', borderRadius: '8px' }}>
                <PalCard pal={p} width="70px" selected={selectedPalIndex === i}
                         clickable={isEffectTarget || isBlockTarget || (p.isStanding && isPlayerTurn && currentPhase === 'main')}
                         onClick={() => {
                           if (isEffectTarget) { resolveEffectTarget('player', i); return }
                           if (isBlockTarget) { resolveBlock(i); return }
                           if (p.isStanding && isPlayerTurn && currentPhase === 'main') {
                             setSelectedPalIndex(prev => (prev === i ? null : i))
                           }
                         }}
                         onActivate={(!pendingEffect && !pendingBattle && isPlayerTurn && currentPhase === 'main') ? () => handleActivateClick('basePals', i, p.acts) : undefined}
                         onHoverStart={startHoverZoom} onHoverEnd={cancelHoverZoom} />
              </div>
            )
          })}
          <StructureGearRow structures={player.baseStructures || []} gear={player.baseGear || []}
                             onActivateStructure={(!pendingEffect && isPlayerTurn && currentPhase === 'main') ? (i) => handleActivateClick('baseStructures', i, player.baseStructures[i].acts) : undefined}
                             onActivateGear={(!pendingEffect && isPlayerTurn && currentPhase === 'main') ? (i) => handleActivateClick('baseGear', i, player.baseGear[i].acts) : undefined}
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {player.playerName === 'Você' ? t('youLabel') : player.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: player.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: player.graveyardCount })} width="56px" height="76px"
                      onClick={() => setGraveyardView({ ownerName: player.playerName === 'Você' ? t('youLabel') : player.playerName, cards: player.graveyard || [] })} />
          </div>
          <span style={{ color: '#fff', fontSize: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {t('gbMaterial', { n: player.material ?? 0 })} · {t('gbIngredient', { n: player.ingredient ?? 0 })}
          </span>
          <SoulRow standing={player.soulsStanding} rested={player.soulsRested} />
          <SoulCount standing={player.soulsStanding} rested={player.soulsRested} />
          <span style={{ color: '#fff', fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>❤️ {player.life}</span>
        </div>
      </div>

      {/* ---------- EFEITO PENDENTE: escolha de alvo ---------- */}
      {pendingEffect && (pendingEffect.kind === 'effect' || pendingEffect.kind === 'cost') && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px',
          fontSize: '12px', textAlign: 'center'
        }}>
          <span>{t('gbEffectChooseTarget')} <strong>{pendingEffect.sourceCardName}</strong> — {pendingEffect.description}</span>
          {pendingEffect.optional && (
            <button onClick={skipEffectTarget} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbEffectSkip')}</button>
          )}
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha de quantidade (custo variável X) ---------- */}
      {pendingEffect?.kind === 'amount' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbAmountPrompt', { name: pendingEffect.sourceCardName })}</span>
          <input type="range" min={pendingEffect.min} max={pendingEffect.max} value={amountInput}
                 onChange={e => setAmountInput(parseInt(e.target.value, 10))} />
          <strong>{amountInput}</strong>
          <button onClick={() => resolveAmount(amountInput)} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbConfirm')}</button>
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha modal ("Choose 1 of the following") ---------- */}
      {pendingEffect?.kind === 'modal' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px'
        }}>
          <span>{t('gbModalPrompt')} <strong>{pendingEffect.sourceCardName}</strong></span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {pendingEffect.options.map((desc, i) => (
              <button key={i} onClick={() => resolveModalChoice(i)} style={{ padding: '4px 10px', fontSize: '11px' }}>{desc}</button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha de carta (topo do deck / cemitério / mão) ---------- */}
      {pendingEffect?.kind === 'cardChoice' && (
        <CardChoiceModal pendingEffect={pendingEffect} onChoose={resolveCardChoice} onSkip={skipCardChoice} t={t} />
      )}

      {/* ---------- ESCOLHA DE QUAL ACT ATIVAR (carta com 2+ habilidades, ex: Primitive Furnace) ---------- */}
      {actPicker && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '6px',
          background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
          maxWidth: '360px', margin: '0 auto'
        }}>
          <span>{t('gbChooseAbilityPrompt')}</span>
          {actPicker.acts.map(a => (
            <button key={a.index} disabled={!a.available} onClick={() => chooseActFromPicker(a.index)}
                    style={{ padding: '4px 10px', fontSize: '11px', textAlign: 'left', opacity: a.available ? 1 : 0.5 }}>
              {a.description || `ACT ${a.index + 1}`}
            </button>
          ))}
          <button onClick={() => setActPicker(null)} style={{ padding: '4px 10px', fontSize: '11px', alignSelf: 'flex-end' }}>{t('close')}</button>
        </div>
      )}

      {/* ---------- POPOUT: cartas reveladas por dano de vida, indo pro cemitério ---------- */}
      {damageRevealShown && (
        <DamageRevealModal reveal={damageRevealShown} onClose={() => setDamageRevealShown(null)} t={t} />
      )}

      {/* ---------- POPOUT: ver as cartas do cemitério (clique no contador) ---------- */}
      {graveyardView && (
        <GraveyardModal view={graveyardView} onClose={() => setGraveyardView(null)} t={t} />
      )}

      {/* ---------- BLOCK DECLARATION STEP ---------- */}
      {pendingBattle?.waitingFor === 'block' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbBlockPrompt', { name: pendingBattle.attackerName, targetType: pendingBattle.targetType, targetName: pendingBattle.targetName })}</span>
          <button onClick={resolveNoBlock} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbNoBlock')}</button>
        </div>
      )}

      {/* ---------- QUICK STEP ---------- */}
      {pendingBattle?.waitingFor === 'quick' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbQuickStepPrompt', { attackerName: pendingBattle.attackerName, targetType: pendingBattle.targetType, targetName: pendingBattle.targetName })}</span>
          <button onClick={passQuickStep} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbPass')}</button>
        </div>
      )}

      {/* ---------- INTERRUPT: como pagar o custo (12.8.2 — 2 formas, jogador escolhe) ---------- */}
      {pendingBattle?.waitingFor === 'interruptCost' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbInterruptCostPrompt', { name: pendingBattle.interruptCard?.name })}</span>
          <button onClick={() => resolveInterruptCost('soul')} style={{ padding: '4px 10px', fontSize: '11px' }}>
            {t('gbInterruptCostSoul')}
          </button>
          <button onClick={() => resolveInterruptCost('discard')} style={{ padding: '4px 10px', fontSize: '11px' }}>
            {t('gbInterruptCostDiscard')}
          </button>
        </div>
      )}

      {/* ---------- INTERRUPT: qual carta extra descartar (clique numa carta da mão abaixo) ---------- */}
      {pendingBattle?.waitingFor === 'interruptDiscardChoice' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbInterruptDiscardPrompt')}</span>
        </div>
      )}

      {/* ---------- MÃO ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {hand.map((card, handIndex) => {
          // Só Structure tem a arte deitada no arquivo original (orientation: 'landscape') — Gear é
          // retrato, igual Pal/Event (mesmo motivo do fix em StructureGearRow, mas aqui é a mão).
          const isLandscapeArt = card.card_type === 'Structure'
          const quickOption = quickOptionFor(card.card_number)
          const isInterruptDiscardChoice = pendingBattle?.waitingFor === 'interruptDiscardChoice'
          return (
            <div key={handIndex}
                 onClick={() => {
                   if (isInterruptDiscardChoice) { resolveInterruptDiscard(card.card_number); return }
                   if (quickOption) { playQuickCard(card.card_number, quickOption.kind); return }
                   if (pendingEffect || pendingBattle) { alert(t('gbBlockedByPending')); return }
                   if (!isPlayerTurn) { alert(t('gbBlockedNotYourTurn')); return }
                   if (currentPhase !== 'main') { alert(t('gbBlockedWrongPhase')); return }
                   handleHandCardClick(card)
                 }}
                 title={card.name}
                 style={{
                   width: '84px', height: '118px', borderRadius: '6px', cursor: 'pointer',
                   boxShadow: '0 2px 6px rgba(0,0,0,0.4)', transition: 'transform 0.1s', flexShrink: 0,
                   position: 'relative', overflow: 'hidden',
                   outline: (quickOption || isInterruptDiscardChoice) ? '2px dashed #6cf25a' : 'none'
                 }}
                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; startHoverZoom(card.image_url, card.name) }}
                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; cancelHoverZoom() }}>
              {isLandscapeArt ? (
                <img src={card.image_url} alt={card.name}
                     style={{
                       position: 'absolute', top: '50%', left: '50%',
                       width: '118px', height: '84px',
                       transform: 'translate(-50%, -50%) rotate(90deg)',
                       borderRadius: '6px'
                     }} />
              ) : (
                <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ---------- BOTÕES DE AÇÃO (abaixo da mão) ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button className="sign-button" onClick={drawWithSouls}
                disabled={!!pendingEffect || !!pendingBattle || !isPlayerTurn || currentPhase !== 'main' || player.soulsStanding < 3 || player.soulDrawUsedThisTurn}
                title={player.soulDrawUsedThisTurn ? t('gbDrawWithSoulsUsed') : undefined}
                style={{ padding: '6px 14px', fontSize: '12px' }}>
          {t('gbDrawWithSouls')}
        </button>
        {clickAttackReady ? (
          <>
            <button className="sign-button" onClick={() => attackWithPal(selectedPalIndex)} disabled={!!pendingEffect || !!pendingBattle} style={{ padding: '6px 16px', fontSize: '13px' }}>
              {t('gbAttackWithPal')}
            </button>
            <button className="sign-button" onClick={() => setSelectedPalIndex(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>
              {t('gbCancelSelection')}
            </button>
            <span className="sign-button" style={{ padding: '6px 14px', fontSize: '12px', pointerEvents: 'none', cursor: 'default' }}>
              {t('gbAttackTargetHint')}
            </span>
          </>
        ) : (
          <button className="sign-button" onClick={advancePhase} disabled={!!pendingEffect || !!pendingBattle || !isPlayerTurn} style={{ padding: '6px 20px', fontSize: '13px' }}>
            {t('gbEndTurn')}
          </button>
        )}
      </div>
      </div>

      {/* ---------- LOG DE JOGADAS ---------- */}
      <MatchLogPanel log={log} logTotal={logTotal} panelWidth={logPanelWidth} t={t} />

      {/* Zoom ao passar o mouse por 0.5s numa carta — zIndex abaixo dos popups (1200) de propósito:
          se um efeito abrir uma escolha enquanto o zoom de outra carta ainda está de pé (o mouse não
          "saiu" de cima do elemento original, já que o popup só cobre por cima sem mover o cursor),
          o zoom não pode ficar por cima bloqueando a visão/cliques nas cartas do popup. */}
      {zoomCard && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 500, pointerEvents: 'none'
        }}>
          <img src={zoomCard.imageUrl} alt={zoomCard.name}
               style={{ maxHeight: '80vh', maxWidth: '80vw', borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.7)' }} />
        </div>
      )}
    </div>
  )
}

export default GameBoard