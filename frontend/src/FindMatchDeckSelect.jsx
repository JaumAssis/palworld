import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'
import { socket } from './socket'
import LobbyChat from './LobbyChat'
import {
  CardSlot, PalCard, StructureGearRow, CardChoiceModal, DamageRevealModal, GraveyardModal, ExileModal,
  MatchLogPanel, Overlay, AttackBadge, canAttackPal, THEMED_H2, THEMED_P, THEMED_RESULT_WIN, THEMED_RESULT_LOSE, THEMED_RESULT_NEUTRAL,
  WOOD_H2, WOOD_P, WOOD_PAGE_BACKGROUND, BOARD_WIDTH, BOARD_HEIGHT
} from './GameBoardUI'

// Esse componente cobre o fluxo INTEIRO de uma partida online, do "Encontrar Partida" (fila +
// escolha de deck) até o fim do jogo — mesmo modelo do GameBoard.jsx (partida contra o Bot), só que
// os eventos são match:* (sessão compartilhada entre 2 jogadores reais) em vez de bot:*. A UI do
// tabuleiro em si (cartas, popups, etc.) vem de GameBoardUI pra não duplicar aquele código.

function FindMatchDeckSelect() {
  const { t } = useLanguage()
  const CHOICE_LABELS = { rock: t('rockLabel'), paper: t('paperLabel'), scissors: t('scissorsLabel') }
  const { matchType } = useParams() // 'normal', 'arena' (ranqueada) ou 'arenaDraft' (modo Arena)
  const isArena = matchType === 'arena'
  // Modo Arena (draft): o deck já veio pronto do draft em Arena.jsx (nunca é escolhido aqui) — o
  // arenaRunId chega via state de navegação, não por query string (não precisa aparecer na URL).
  const location = useLocation()
  const isArenaDraft = matchType === 'arenaDraft'
  const arenaRunId = location.state?.arenaRunId

  // ---------- fila / seleção de deck ----------
  const [decks, setDecks] = useState([])
  const [selectedDeckId, setSelectedDeckId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [challengeTarget, setChallengeTarget] = useState(null) // { playerId, username } — clicou num nick
  const [challengeStatus, setChallengeStatus] = useState('') // mensagem de status do desafio que EU mandei
  // Só o setter importa — sempre lido via forma funcional (prev => ...) pra comparar com o
  // challengeId de um "expired" recebido, nunca precisa do valor em render.
  const [, setOutgoingChallengeId] = useState(null)
  const [incomingChallenge, setIncomingChallenge] = useState(null) // { challengeId, fromPlayerId, fromUsername, matchType }

  // ---------- setup da partida (Jokenpô / ordem / mulligan) ----------
  const [stage, setStage] = useState('selecting')
  const [rpsResult, setRpsResult] = useState(null)
  const [rpsSubmitted, setRpsSubmitted] = useState(false)
  const [mulliganHand, setMulliganHand] = useState([])
  const [mulliganGoesFirst, setMulliganGoesFirst] = useState(null)
  const [mulliganZoomCard, setMulliganZoomCard] = useState(null)
  const [opponentLeftMessage, setOpponentLeftMessage] = useState('')
  const [opponentLeftPointsChange, setOpponentLeftPointsChange] = useState(null)

  // ---------- estado de jogo (mesmas variáveis locais do GameBoard.jsx) ----------
  const [gameState, setGameState] = useState(null)
  const [soulImageUrl, setSoulImageUrl] = useState(null)
  const [selectedPalIndex, setSelectedPalIndex] = useState(null)
  const [draggedPalIndex, setDraggedPalIndex] = useState(null)
  const [amountInput, setAmountInput] = useState(1)
  const [actPicker, setActPicker] = useState(null)
  const [graveyardView, setGraveyardView] = useState(null)
  const [exileView, setExileView] = useState(null)
  const [zoomCard, setZoomCard] = useState(null)
  const [damageRevealShown, setDamageRevealShown] = useState(null)
  const [boardScale, setBoardScale] = useState(1)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const hoverTimerRef = useRef(null)
  const seenDamageRevealIdRef = useRef(null)
  const damageRevealTimerRef = useRef(null)
  const stageRef = useRef(stage)
  useEffect(() => { stageRef.current = stage }, [stage])

  useEffect(() => {
    if (!challengeStatus) return
    const timer = setTimeout(() => setChallengeStatus(''), 4000)
    return () => clearTimeout(timer)
  }, [challengeStatus])

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

    socket.on('match:queued', () => setStage('searching'))

    socket.on('match:found', ({ opponentName: name }) => {
      setOpponentName(name)
      setChallengeTarget(null)
      setChallengeStatus('')
      setOutgoingChallengeId(null)
      setIncomingChallenge(null)
      setStage('found')
    })

    socket.on('match:rpsPrompt', () => { setRpsResult(null); setRpsSubmitted(false); setStage('rps') })

    socket.on('match:rpsResult', (data) => {
      setRpsResult(data)
      setRpsSubmitted(false)
      if (data.result !== 'draw') {
        // 7s de propósito: dá tempo dos players lerem quem ganhou/perdeu antes de avançar.
        setTimeout(() => setStage(data.result === 'win' ? 'chooseOrder' : 'waitingOrder'), 7000)
      }
    })

    socket.on('match:mulliganPrompt', ({ hand, goesFirst }) => {
      setMulliganHand(hand)
      setMulliganGoesFirst(goesFirst)
      setStage('mulligan')
    })

    socket.on('match:state', (state) => {
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

    socket.on('match:error', ({ message }) => {
      setErrorMsg(message)
      if (stageRef.current === 'selecting' || stageRef.current === 'searching') setStage('selecting')
      else alert(message)
    })

    socket.on('match:opponentLeft', ({ message, arenaPointsChange: pts }) => {
      setOpponentLeftMessage(message)
      setOpponentLeftPointsChange(pts)
      setStage('opponentLeft')
    })

    // Desafio direto (clicar no nick de alguém no chat)
    socket.on('lobbyChat:challengeSent', ({ challengeId, targetUsername }) => {
      setOutgoingChallengeId(challengeId)
      setChallengeStatus(t('challengeSentMsg', { name: targetUsername }))
    })
    socket.on('lobbyChat:challengeReceived', (data) => setIncomingChallenge(data))
    socket.on('lobbyChat:challengeDenied', ({ byUsername }) => {
      setOutgoingChallengeId(null)
      setChallengeStatus(t('challengeDeniedMsg', { name: byUsername }))
    })
    socket.on('lobbyChat:challengeExpired', ({ challengeId }) => {
      setIncomingChallenge(prev => (prev?.challengeId === challengeId ? null : prev))
      setOutgoingChallengeId(prev => {
        if (prev !== challengeId) return prev
        setChallengeStatus(t('challengeExpiredMsg'))
        return null
      })
    })
    socket.on('lobbyChat:challengeError', ({ message }) => setChallengeStatus(message))

    return () => {
      clearTimeout(damageRevealTimerRef.current)
      socket.off('match:queued')
      socket.off('match:found')
      socket.off('match:rpsPrompt')
      socket.off('match:rpsResult')
      socket.off('match:mulliganPrompt')
      socket.off('match:state')
      socket.off('match:error')
      socket.off('match:opponentLeft')
      socket.off('lobbyChat:challengeSent')
      socket.off('lobbyChat:challengeReceived')
      socket.off('lobbyChat:challengeDenied')
      socket.off('lobbyChat:challengeExpired')
      socket.off('lobbyChat:challengeError')
      // Só cancela a fila se ainda estiver procurando — depois que a partida existe, saindo daqui
      // (ex.: botão voltar) não desfaz a sessão, igual já acontece na partida contra o Bot.
      if (stageRef.current === 'searching') socket.emit('match:cancelFindMatch')
    }
  }, [])

  useEffect(() => {
    if (gameState?.pendingEffect?.kind === 'cardChoice') cancelHoverZoom()
  }, [gameState?.pendingEffect?.kind])

  // ---------- ações: fila / deck ----------
  const visibleDecks = isArena ? decks.filter(d => d.mode === 'rank') : decks

  const findMatch = () => {
    setErrorMsg('')
    if (isArenaDraft) {
      socket.emit('match:findMatch', { matchType: 'arenaDraft', arenaRunId })
      return
    }
    if (!selectedDeckId) return
    socket.emit('match:findMatch', { deckId: selectedDeckId, matchType: isArena ? 'arena' : 'normal' })
  }

  // Modo Arena (draft) não tem etapa de escolher deck — entra na fila sozinho assim que a tela
  // monta. `stage === 'selecting'` continua sendo o estado inicial (só o que é renderizado nele
  // muda, ver mais abaixo) até o servidor confirmar com match:queued.
  useEffect(() => {
    if (isArenaDraft && arenaRunId) {
      socket.emit('match:findMatch', { matchType: 'arenaDraft', arenaRunId })
    }
  }, [isArenaDraft, arenaRunId])

  const cancelSearch = () => {
    socket.emit('match:cancelFindMatch')
    setStage('selecting')
  }

  const sendChallenge = () => {
    if (!selectedDeckId || !challengeTarget) return
    socket.emit('lobbyChat:challenge', {
      targetPlayerId: challengeTarget.playerId,
      deckId: selectedDeckId,
      matchType: isArena ? 'arena' : 'normal'
    })
    setChallengeTarget(null)
  }

  const respondToChallenge = (accept) => {
    if (!incomingChallenge) return
    socket.emit('lobbyChat:challengeRespond', {
      challengeId: incomingChallenge.challengeId,
      accept,
      deckId: selectedDeckId
    })
    setIncomingChallenge(null)
  }

  // ---------- ações: setup (Jokenpô / ordem / mulligan) ----------
  const sendRPS = (choice) => {
    setRpsResult(null)
    setRpsSubmitted(true)
    socket.emit('match:rpsChoice', { choice })
  }

  const chooseOrder = (goFirst) => socket.emit('match:chooseOrder', { goFirst })

  const decideMulligan = (keep) => {
    socket.emit('match:mulliganDecision', { keep })
    setStage('waitingMulligan')
  }

  // ---------- ações: jogo (mesmas do GameBoard.jsx, via match:*) ----------
  const advancePhase = () => socket.emit('match:advancePhase')

  const deployPal = (cardNumber) => socket.emit('match:deployPal', { cardNumber })
  const deployStructure = (cardNumber) => socket.emit('match:deployStructure', { cardNumber })
  const deployGear = (cardNumber) => socket.emit('match:deployGear', { cardNumber })
  const deployEvent = (cardNumber) => socket.emit('match:deployEvent', { cardNumber })
  const drawWithSouls = () => socket.emit('match:drawWithSouls')

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
    socket.emit('match:attackPal', { attackerIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }
  const handleDropOnEnemyPal = (targetIndex) => attackPalAt(draggedPalIndex, targetIndex)

  const attackWithPal = (palIndex) => {
    if (gameState?.pendingEffect) return
    socket.emit('match:attack', { palIndex })
    setSelectedPalIndex(null)
  }

  // owner chega/sai relativo a quem está vendo ('player'=eu / 'bot'=oponente) — o servidor já
  // traduz isso pra cada lado, então essa lógica é idêntica à da partida contra o Bot.
  const isPendingTarget = (owner, index, zone = 'basePals') =>
    !!gameState?.pendingEffect?.isYours &&
    !!gameState?.pendingEffect?.validTargets?.some(t => t.owner === owner && t.index === index && (t.zone || 'basePals') === zone)

  const resolveEffectTarget = (owner, index, zone) => socket.emit('match:resolveEffectTarget', { owner, index, zone })
  const skipEffectTarget = () => socket.emit('match:resolveEffectTarget', { skip: true })

  const activateAbility = (zone, index, actIndex = 0) => {
    if (gameState?.pendingEffect) return
    socket.emit('match:activateAbility', { zone, index, actIndex })
  }

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

  const resolveBlock = (blockerIndex) => socket.emit('match:resolveBlock', { blockerIndex })
  const resolveNoBlock = () => socket.emit('match:resolveBlock', { none: true })
  const playQuickCard = (cardNumber, kind) => socket.emit('match:resolveQuickStep', { cardNumber, kind })
  const passQuickStep = () => socket.emit('match:resolveQuickStep', { pass: true })
  const resolveInterruptCost = (method) => socket.emit('match:resolveInterruptCost', { method })
  const resolveInterruptDiscard = (cardNumber) => socket.emit('match:resolveInterruptDiscard', { cardNumber })

  const resolveAmount = (amount) => socket.emit('match:resolveAmount', { amount })
  const resolveModalChoice = (optionIndex) => socket.emit('match:resolveModalChoice', { optionIndex })

  const resolveCardChoice = (index) => socket.emit('match:resolveCardChoice', { index })
  const skipCardChoice = () => socket.emit('match:resolveCardChoice', { skip: true })

  // Mesma ideia de attackPalAt: attackerIndex explícito, não fixo em draggedPalIndex — senão o
  // caminho de clique (que usa selectedPalIndex) seria descartado em silêncio por este guard.
  const attackStructureAt = (attackerIndex, targetIndex) => {
    if (attackerIndex === null || gameState?.pendingEffect || gameState?.pendingBattle) return
    socket.emit('match:attackStructure', { attackerIndex, targetIndex })
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

  // ================= SELEÇÃO DE DECK =================
  if (stage === 'selecting') {
    // Modo Arena (draft): sem deck pra escolher — o findMatch já foi disparado sozinho (ver efeito
    // acima). Normalmente essa tela só aparece por uma fração de segundo até o servidor confirmar a
    // entrada na fila (stage vira 'searching'), MAS também é pra onde cancelSearch() manda de volta
    // depois de um cancelamento — sem um link de saída aqui, cancelar a busca parecia não fazer nada
    // (o servidor já tinha tirado da fila, só a tela continuava idêntica à de "procurando").
    if (isArenaDraft) {
      return (
        <div style={{
          minHeight: '100vh', boxSizing: 'border-box', padding: '2rem', textAlign: 'center', background: WOOD_PAGE_BACKGROUND,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
        }}>
          <p style={WOOD_P}>{t('findMatchSearching')}</p>
          {errorMsg && <p style={{ ...WOOD_P, color: '#ff8a8a' }}>{errorMsg}</p>}
          <Link to="/arena"><button className="sign-button">{t('findMatchBack')}</button></Link>
        </div>
      )
    }
    return (
      <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '2rem', textAlign: 'center', background: WOOD_PAGE_BACKGROUND }}>
        <Link to="/findmatch"><button className="sign-button" style={{ marginBottom: '20px' }}>{t('findMatchBack')}</button></Link>
        <h2 style={WOOD_H2}>{isArena ? t('findMatchChooseDeckArenaTitle') : t('findMatchChooseDeckNormalTitle')}</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          {visibleDecks.map(d => {
            // Rascunho (faltam cópias) só é bloqueado na Arena — mostra desabilitado com o motivo
            // em vez de simplesmente sumir da lista sem explicação (o backend também recusa isso
            // em match:findMatch, essa é só a checagem espelho no cliente).
            const blockedDraft = isArena && d.isDraft
            return (
              <button
                key={d.id}
                className="sign-button"
                disabled={blockedDraft}
                title={blockedDraft ? t('findMatchDraftBlocked') : undefined}
                onClick={() => !blockedDraft && setSelectedDeckId(d.id)}
                style={{
                  fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                  outline: selectedDeckId === d.id ? '3px solid #ffd76a' : 'none',
                  opacity: blockedDraft ? 0.5 : 1
                }}
              >
                {d.name}
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '10px', color: '#fff3d6',
                  background: d.mode === 'rank' ? '#a5541b' : '#3f6b3f'
                }}>{d.mode === 'rank' ? '🏆 Rank' : '🎲 Normal'}</span>
                {blockedDraft && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', color: '#fff3d6', background: '#888' }}>
                    {t('draftBadge')}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {visibleDecks.length === 0 && (
          <p style={WOOD_P}>{isArena ? t('findMatchNoRankDecks') : t('gbNoDecks')}</p>
        )}

        {errorMsg && <p style={{ ...WOOD_P, color: '#ff8a8a' }}>{errorMsg}</p>}

        {visibleDecks.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <button
              className="sign-button"
              disabled={!selectedDeckId}
              onClick={findMatch}
              style={{ fontSize: '18px', padding: '14px 32px', opacity: selectedDeckId ? 1 : 0.5 }}
            >
              {t('findMatchSearchButton')}
            </button>
          </div>
        )}

        {/* ---------- CHAT ---------- */}
        <LobbyChat onNickClick={(playerId, username) => setChallengeTarget({ playerId, username })} />
        {challengeStatus && <p style={{ color: '#ffd76a', fontSize: '12px', margin: '10px 0 0', textAlign: 'center' }}>{challengeStatus}</p>}

        {challengeTarget && (
          <div onClick={() => setChallengeTarget(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              width: '380px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
              padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
            }}>
              <h3 style={{ marginTop: 0, color: '#222' }}>{t('challengeConfirmQuestion', { name: challengeTarget.username })}</h3>
              {!selectedDeckId && <p style={{ color: '#a5541b', fontSize: '12px' }}>{t('challengeNeedDeckHint')}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={sendChallenge}
                  disabled={!selectedDeckId}
                  style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#a5541b', color: '#fff', border: 'none', borderRadius: '8px', cursor: selectedDeckId ? 'pointer' : 'not-allowed', opacity: selectedDeckId ? 1 : 0.5 }}>
                  {t('challengeConfirmSend')}
                </button>
                <button onClick={() => setChallengeTarget(null)} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#888', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {t('challengeConfirmCancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {incomingChallenge && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
          }}>
            <div style={{
              width: '380px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
              padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
            }}>
              <h3 style={{ marginTop: 0, color: '#222' }}>{t('challengeReceivedQuestion', { name: incomingChallenge.fromUsername })}</h3>
              {!selectedDeckId && <p style={{ color: '#a5541b', fontSize: '12px' }}>{t('challengeNeedDeckHint')}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => respondToChallenge(true)}
                  disabled={!selectedDeckId}
                  style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#3f6b3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: selectedDeckId ? 'pointer' : 'not-allowed', opacity: selectedDeckId ? 1 : 0.5 }}>
                  {t('challengeAccept')}
                </button>
                <button onClick={() => respondToChallenge(false)} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#888', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {t('challengeDeny')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ================= PROCURANDO OPONENTE =================
  if (stage === 'searching' || stage === 'found') {
    return (
      <div style={{
        minHeight: '100vh', boxSizing: 'border-box', padding: '2rem', textAlign: 'center', background: WOOD_PAGE_BACKGROUND,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px'
      }}>
        <h2 style={WOOD_H2}>{stage === 'found' ? t('findMatchFound', { name: opponentName }) : t('findMatchSearching')}</h2>
        {stage === 'searching' && (
          <button className="sign-button" onClick={cancelSearch}>{t('findMatchCancelSearch')}</button>
        )}
      </div>
    )
  }

  // ================= JOKENPÔ =================
  if (stage === 'rps' || stage === 'waitingOrder') {
    const rpsAccent = rpsResult ? (rpsResult.result === 'win' ? 'win' : rpsResult.result === 'lose' ? 'lose' : 'neutral') : 'neutral'
    return (
      <Overlay accent={rpsAccent} maxWidth="500px">
        <h2 style={THEMED_H2}>{t('gbRpsTitle')}</h2>
        <p style={THEMED_P}>{t('gbRpsIntro')}</p>
        {!rpsResult && !rpsSubmitted && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} className="sign-button" onClick={() => sendRPS(key)} style={{ fontSize: '18px' }}>{label}</button>
            ))}
          </div>
        )}
        {rpsSubmitted && !rpsResult && <p style={{ ...THEMED_P, marginTop: '16px' }}>{t('findMatchWaitingOpponent')}</p>}
        {rpsResult && (
          <div style={{ marginTop: '16px' }}>
            <p style={THEMED_P}>{t('findMatchRpsVs', { you: CHOICE_LABELS[rpsResult.yourChoice], opponent: CHOICE_LABELS[rpsResult.opponentChoice] })}</p>
            {rpsResult.result === 'draw' && <p style={THEMED_RESULT_NEUTRAL}>{t('gbRpsDraw')}</p>}
            {rpsResult.result === 'win' && <p style={THEMED_RESULT_WIN}>🏆 {t('gbRpsWin')}</p>}
            {rpsResult.result === 'lose' && <p style={THEMED_RESULT_LOSE}>{t('findMatchRpsLose')}</p>}
          </div>
        )}
        {rpsResult?.result === 'draw' && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} className="sign-button" onClick={() => sendRPS(key)} style={{ fontSize: '18px' }}>{label}</button>
            ))}
          </div>
        )}
        {stage === 'waitingOrder' && <p style={{ ...THEMED_P, marginTop: '14px' }}>{t('findMatchWaitingOpponent')}</p>}
      </Overlay>
    )
  }

  // ================= ESCOLHER ORDEM (só quem ganhou o Jokenpô) =================
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

  // ================= MULLIGAN =================
  if (stage === 'mulligan' || stage === 'waitingMulligan') {
    return (
      <Overlay maxWidth="560px">
        <h2 style={THEMED_H2}>{t('gbMulliganTitle')}</h2>
        {/* Sem isso, quem PERDEU o Jokenpô não tinha nenhum jeito de saber o que o vencedor
            escolheu (ir primeiro ou segundo) antes de decidir o próprio mulligan. */}
        {mulliganGoesFirst != null && (
          <p style={mulliganGoesFirst ? THEMED_RESULT_WIN : THEMED_RESULT_NEUTRAL}>
            {mulliganGoesFirst ? t('gbYouGoFirst') : t('gbYouGoSecond')}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
          {mulliganHand.map((c, i) => (
            <img key={i} src={c.image_url} alt={c.name} onClick={() => setMulliganZoomCard(c)}
                 style={{ width: '95px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', cursor: 'pointer' }} />
          ))}
        </div>
        {stage === 'mulligan' ? (
          <>
            <p style={THEMED_P}>{t('gbMulliganQuestion')}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
              <button className="sign-button" onClick={() => decideMulligan(true)}>{t('gbKeepHand')}</button>
              <button className="sign-button" onClick={() => decideMulligan(false)}>{t('gbMulligan')}</button>
            </div>
          </>
        ) : (
          <p style={THEMED_P}>{t('findMatchWaitingOpponent')}</p>
        )}

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

  // ================= OPONENTE DESCONECTOU =================
  if (stage === 'opponentLeft') {
    return (
      <Overlay accent="win">
        <h2 style={THEMED_RESULT_WIN}>{t('gbYouWin')}</h2>
        {opponentLeftPointsChange != null && (
          <p style={{ ...THEMED_P, fontWeight: 700 }}>{t('arenaPointsChangeLabel', { n: opponentLeftPointsChange })}</p>
        )}
        <p style={THEMED_P}>{opponentLeftMessage}</p>
        <Link to="/"><button className="sign-button" style={{ marginTop: '18px' }}>{t('backToMenu')}</button></Link>
      </Overlay>
    )
  }

  // ================= FIM DE JOGO =================
  if (stage === 'gameOver') {
    const won = !!gameState?.youWon
    const runResult = gameState?.arenaRunResult
    return (
      <Overlay accent={won ? 'win' : 'lose'}>
        <h2 style={won ? THEMED_RESULT_WIN : THEMED_RESULT_LOSE}>{won ? t('gbYouWin') : t('gbYouLose')}</h2>
        {gameState?.arenaPointsChange != null && (
          <p style={{ ...THEMED_P, fontWeight: 700 }}>{t('arenaPointsChangeLabel', { n: gameState.arenaPointsChange })}</p>
        )}
        {runResult && (
          <>
            <p style={{ ...THEMED_P, fontWeight: 700 }}>{t('arenaRunScoreLabel', { wins: runResult.wins, losses: runResult.losses })}</p>
            {runResult.ended ? (
              <Link to="/arena"><button className="sign-button" style={{ marginTop: '10px' }}>{t('arenaSeeResultsButton')}</button></Link>
            ) : (
              <button className="sign-button" style={{ marginTop: '10px' }} onClick={findMatch}>
                {t('arenaNextMatchButton')}
              </button>
            )}
          </>
        )}
        <Link to="/"><button className="sign-button" style={{ marginTop: '18px' }}>{t('backToMenu')}</button></Link>
      </Overlay>
    )
  }

  if (!gameState) return <p style={{ padding: '2rem' }}>{t('gbLoadingMatch')}</p>

  // ================= TABULEIRO =================
  const { player, opponent, hand, currentPhase, turnNumber, isYourTurn, pendingEffect, pendingBattle, log, logTotal } = gameState
  const isValidBlocker = (i) => pendingBattle?.waitingFor === 'block' && pendingBattle.validBlockers.includes(i)
  // Se um Quick Card já jogado abriu uma escolha de alvo por baixo (ex: Dark Cannon), a mão não pode
  // continuar oferecendo outra carta Quick clicável até essa escolha ser resolvida (senão o jogador
  // conseguia disparar 2 Quick Cards ao mesmo tempo, um por cima do outro).
  const quickOptionFor = (cardNumber) =>
    !pendingEffect && pendingBattle?.waitingFor === 'quick' ? pendingBattle.quickOptions.find(o => o.cardNumber === cardNumber) : null

  // Mesma lógica do tabuleiro vs Bot (ver GameBoard.jsx) — selecionar um Pal em pé já é o "modo de
  // mira", sem estado extra. Arraste tem prioridade sobre seleção por clique quando os dois coexistem.
  const canAct = !pendingEffect && !pendingBattle && isYourTurn && currentPhase === 'main'
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
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
        background: "url('/night.png') center / cover no-repeat fixed",
        opacity: gameState.isNight ? 1 : 0,
        transition: 'opacity 1.2s ease'
      }} />

      <div style={{
        width: BOARD_WIDTH + 'px', height: BOARD_HEIGHT + 'px', flexShrink: 0,
        transform: `scale(${boardScale})`, transformOrigin: 'center center',
        position: 'relative',
        padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><button className="sign-button" style={{ fontSize: '12px' }}>{t('gbExitMatch')}</button></Link>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {t('gbTurn', { n: turnNumber, whoseTurn: isYourTurn ? t('gbYourTurn') : t('findMatchOpponentTurn') })}
        </div>
      </div>

      {/* ---------- OPONENTE ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {opponent.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: opponent.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: opponent.graveyardCount })} width="56px" height="76px"
                      onClick={() => setGraveyardView({ ownerName: opponent.playerName, cards: opponent.graveyard || [] })} />
            <CardSlot label={t('gbExile', { n: (opponent.exileZone || []).length })} width="56px" height="76px"
                      onClick={() => setExileView({ ownerName: opponent.playerName, cards: opponent.exileZone || [] })} />
          </div>
          <SoulRow standing={opponent.soulsStanding} rested={opponent.soulsRested} />
          <SoulCount standing={opponent.soulsStanding} rested={opponent.soulsRested} />
          <span style={{ color: '#fff', fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {t('gbMaterial', { n: opponent.material ?? 0 })} · {t('gbIngredient', { n: opponent.ingredient ?? 0 })}
          </span>
          <span style={{ color: '#fff', fontSize: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {t('gbLifeHand', { life: opponent.life, hand: opponent.handCount })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minHeight: '90px', marginTop: '6px' }}>
          {opponent.basePals.map((p, i) => {
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
          <StructureGearRow structures={opponent.baseStructures || []} gear={opponent.baseGear || []} cardWidth="62px" cardHeight="86px"
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom}
                             onDropStructure={attackStructure} dragActive={draggedPalIndex !== null}
                             onAttackStructure={(i) => attackStructureAt(selectedPalIndex, i)} attackActive={clickAttackReady}
                             isEffectTargetStructure={(i) => isPendingTarget('bot', i, 'baseStructures')}
                             onEffectTargetStructure={(i) => resolveEffectTarget('bot', i, 'baseStructures')}
                             isEffectTargetGear={(i) => isPendingTarget('bot', i, 'baseGear')}
                             onEffectTargetGear={(i) => resolveEffectTarget('bot', i, 'baseGear')} />
        </div>
      </div>

      {/* ---------- VOCÊ ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1, minHeight: '90px' }}>
          {player.basePals.map((p, i) => {
            const isEffectTarget = isPendingTarget('player', i)
            const isBlockTarget = isValidBlocker(i)
            return (
              <div key={i}
                   draggable={!pendingEffect && !pendingBattle && p.isStanding && isYourTurn && currentPhase === 'main'}
                   onDragStart={() => setDraggedPalIndex(i)}
                   onDragEnd={() => setDraggedPalIndex(null)}
                   style={{ outline: (isEffectTarget || isBlockTarget) ? '2px dashed #6cf25a' : 'none', borderRadius: '8px' }}>
                <PalCard pal={p} width="70px" selected={selectedPalIndex === i}
                         clickable={isEffectTarget || isBlockTarget || (p.isStanding && isYourTurn && currentPhase === 'main')}
                         onClick={() => {
                           if (isEffectTarget) { resolveEffectTarget('player', i); return }
                           if (isBlockTarget) { resolveBlock(i); return }
                           if (p.isStanding && isYourTurn && currentPhase === 'main') {
                             setSelectedPalIndex(prev => (prev === i ? null : i))
                           }
                         }}
                         onActivate={(!pendingEffect && !pendingBattle && isYourTurn && currentPhase === 'main') ? () => handleActivateClick('basePals', i, p.acts) : undefined}
                         onHoverStart={startHoverZoom} onHoverEnd={cancelHoverZoom} />
              </div>
            )
          })}
          <StructureGearRow structures={player.baseStructures || []} gear={player.baseGear || []}
                             onActivateStructure={(!pendingEffect && isYourTurn && currentPhase === 'main') ? (i) => handleActivateClick('baseStructures', i, player.baseStructures[i].acts) : undefined}
                             onActivateGear={(!pendingEffect && isYourTurn && currentPhase === 'main') ? (i) => handleActivateClick('baseGear', i, player.baseGear[i].acts) : undefined}
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom}
                             isEffectTargetStructure={(i) => isPendingTarget('player', i, 'baseStructures')}
                             onEffectTargetStructure={(i) => resolveEffectTarget('player', i, 'baseStructures')}
                             isEffectTargetGear={(i) => isPendingTarget('player', i, 'baseGear')}
                             onEffectTargetGear={(i) => resolveEffectTarget('player', i, 'baseGear')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {t('youLabel')}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: player.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: player.graveyardCount })} width="56px" height="76px"
                      onClick={() => setGraveyardView({ ownerName: t('youLabel'), cards: player.graveyard || [] })} />
            <CardSlot label={t('gbExile', { n: (player.exileZone || []).length })} width="56px" height="76px"
                      onClick={() => setExileView({ ownerName: t('youLabel'), cards: player.exileZone || [] })} />
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
          {pendingEffect.isYours ? (
            <>
              <span>{t('gbEffectChooseTarget')} <strong>{pendingEffect.sourceCardName}</strong> — {pendingEffect.description}</span>
              {pendingEffect.optional && (
                <button onClick={skipEffectTarget} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbEffectSkip')}</button>
              )}
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha de quantidade (custo variável X) ---------- */}
      {pendingEffect?.kind === 'amount' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          {pendingEffect.isYours ? (
            <>
              <span>{t('gbAmountPrompt', { name: pendingEffect.sourceCardName })}</span>
              <input type="range" min={pendingEffect.min} max={pendingEffect.max} value={amountInput}
                     onChange={e => setAmountInput(parseInt(e.target.value, 10))} />
              <strong>{amountInput}</strong>
              <button onClick={() => resolveAmount(amountInput)} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbConfirm')}</button>
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha modal ("Choose 1 of the following") ---------- */}
      {pendingEffect?.kind === 'modal' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px'
        }}>
          {pendingEffect.isYours ? (
            <>
              <span>{t('gbModalPrompt')} <strong>{pendingEffect.sourceCardName}</strong></span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pendingEffect.options.map((desc, i) => (
                  <button key={i} onClick={() => resolveModalChoice(i)} style={{ padding: '4px 10px', fontSize: '11px' }}>{desc}</button>
                ))}
              </div>
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- EFEITO PENDENTE: escolha de carta (topo do deck / cemitério / mão) ---------- */}
      {pendingEffect?.kind === 'cardChoice' && (
        pendingEffect.isYours ? (
          <CardChoiceModal pendingEffect={pendingEffect} onChoose={resolveCardChoice} onSkip={skipCardChoice} t={t} />
        ) : (
          <div style={{
            display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff',
            borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
          }}>
            <span>{t('findMatchWaitingOpponentCardChoice')}</span>
          </div>
        )
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

      {/* ---------- POPOUT: ver as cartas exiladas (clique no contador) ---------- */}
      {exileView && (
        <ExileModal view={exileView} onClose={() => setExileView(null)} t={t} />
      )}

      {/* ---------- BLOCK DECLARATION STEP ---------- */}
      {pendingBattle?.waitingFor === 'block' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          {pendingBattle.isDefender ? (
            <>
              <span>{t('gbBlockPrompt', { name: pendingBattle.attackerName, targetType: pendingBattle.targetType, targetName: pendingBattle.targetName })}</span>
              <button onClick={resolveNoBlock} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbNoBlock')}</button>
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- QUICK STEP ---------- */}
      {pendingBattle?.waitingFor === 'quick' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          {pendingBattle.isDefender ? (
            <>
              <span>{t('gbQuickStepPrompt', { attackerName: pendingBattle.attackerName, targetType: pendingBattle.targetType, targetName: pendingBattle.targetName })}</span>
              <button onClick={passQuickStep} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbPass')}</button>
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- INTERRUPT: como pagar o custo (12.8.2 — 2 formas, jogador escolhe) ---------- */}
      {pendingBattle?.waitingFor === 'interruptCost' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          {pendingBattle.isDefender ? (
            <>
              <span>{t('gbInterruptCostPrompt', { name: pendingBattle.interruptCard?.name })}</span>
              <button onClick={() => resolveInterruptCost('soul')} style={{ padding: '4px 10px', fontSize: '11px' }}>
                {t('gbInterruptCostSoul')}
              </button>
              <button onClick={() => resolveInterruptCost('discard')} style={{ padding: '4px 10px', fontSize: '11px' }}>
                {t('gbInterruptCostDiscard')}
              </button>
            </>
          ) : (
            <span>{t('findMatchWaitingOpponent')}</span>
          )}
        </div>
      )}

      {/* ---------- INTERRUPT: qual carta extra descartar (clique numa carta da mão abaixo) ---------- */}
      {pendingBattle?.waitingFor === 'interruptDiscardChoice' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{pendingBattle.isDefender ? t('gbInterruptDiscardPrompt') : t('findMatchWaitingOpponent')}</span>
        </div>
      )}

      {/* ---------- MÃO ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {hand.map((card, handIndex) => {
          const isLandscapeArt = card.card_type === 'Structure'
          const quickOption = quickOptionFor(card.card_number)
          const isInterruptDiscardChoice = pendingBattle?.waitingFor === 'interruptDiscardChoice' && pendingBattle.isDefender
          return (
            <div key={handIndex}
                 onClick={() => {
                   if (isInterruptDiscardChoice) { resolveInterruptDiscard(card.card_number); return }
                   if (quickOption) { playQuickCard(card.card_number, quickOption.kind); return }
                   if (pendingEffect || pendingBattle) { alert(t('gbBlockedByPending')); return }
                   if (!isYourTurn) { alert(t('gbBlockedNotYourTurn')); return }
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
                disabled={!!pendingEffect || !!pendingBattle || !isYourTurn || currentPhase !== 'main' || player.soulsStanding < 3 || player.soulDrawUsedThisTurn}
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
          <button className="sign-button" onClick={advancePhase} disabled={!!pendingEffect || !!pendingBattle || !isYourTurn} style={{ padding: '6px 20px', fontSize: '13px' }}>
            {t('gbEndTurn')}
          </button>
        )}
      </div>
      </div>

      {/* ---------- LOG DE JOGADAS ---------- */}
      <MatchLogPanel log={log} logTotal={logTotal} panelWidth={logPanelWidth} t={t} />

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

export default FindMatchDeckSelect
