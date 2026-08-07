import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useLanguage } from './i18n/LanguageContext'

const API_URL = 'http://localhost:3001'

// Conexão única e persistente durante toda a vida da aba — sem connect/disconnect manual
const socket = io(API_URL)

function CardSlot({ label, width = '80px', height = '112px', highlight = false, imageUrl }) {
  return (
    <div style={{
      width, height, overflow: 'hidden',
      border: highlight ? '2px solid #ffd54a' : '1px solid rgba(255,255,255,0.5)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      color: '#fff', fontSize: '11px', fontWeight: 600,
      background: imageUrl ? `url('${imageUrl}') center / cover no-repeat` : 'rgba(255,255,255,0.12)',
      backdropFilter: imageUrl ? 'none' : 'blur(3px)',
      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
    }}>
      <span style={{
        width: '100%', textAlign: 'center',
        background: imageUrl ? 'rgba(0,0,0,0.55)' : 'transparent',
        padding: imageUrl ? '2px 0' : 0
      }}>{label}</span>
    </div>
  )
}

function AbilityBadge({ onClick }) {
  const { t } = useLanguage()
  return (
    <button onClick={e => { e.stopPropagation(); onClick() }} title={t('gbActivateAbility')} style={{
      position: 'absolute', bottom: '2px', left: '2px', width: '20px', height: '20px',
      borderRadius: '50%', border: 'none', background: '#ffd54a', color: '#3a2a00',
      fontSize: '11px', fontWeight: 700, cursor: 'pointer', lineHeight: '20px', padding: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.5)', zIndex: 2
    }}>⚡</button>
  )
}

function PalCard({ pal, width = '78px', selected = false, onClick, clickable = false, onActivate, onHoverStart, onHoverEnd }) {
  return (
    <div onClick={onClick ? (e) => { e.stopPropagation(); onClick(e) } : undefined}
         onMouseEnter={() => onHoverStart && onHoverStart(pal.imageUrl, pal.name)} onMouseLeave={() => onHoverEnd && onHoverEnd()} style={{
      width, cursor: clickable ? 'pointer' : 'default',
      transform: pal.isStanding ? 'rotate(0deg)' : 'rotate(90deg)',
      transition: 'transform 0.25s ease',
      filter: selected ? 'drop-shadow(0 0 8px #ffd54a)' : 'none',
      position: 'relative'
    }}>
      <img src={pal.imageUrl} alt={pal.name} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
      {pal.damageMarked > 0 && (
        <span style={{
          position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)',
          color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>-{pal.damageMarked}</span>
      )}
      {!!pal.powerBonus && (
        <span title="Power" style={{
          position: 'absolute', top: '4px', left: '4px',
          background: pal.powerBonus > 0 ? 'rgba(52,199,89,0.9)' : 'rgba(255,149,0,0.9)',
          color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>{pal.powerBonus > 0 ? `+${pal.powerBonus}` : pal.powerBonus}</span>
      )}
      {onActivate && pal.hasAct && <AbilityBadge onClick={onActivate} />}
    </div>
  )
}

function EmptySlot({ width = '78px', height = '108px' }) {
  return (
    <div style={{
      width, height, border: '1px dashed rgba(255,255,255,0.4)', borderRadius: '8px',
      background: 'rgba(255,255,255,0.05)'
    }} />
  )
}

function StructureGearRow({
  structures, gear, cardWidth = '70px', cardHeight = '98px', onActivateStructure, onActivateGear,
  onHoverCard, onHoverEnd, onDropStructure, dragActive
}) {
  if (structures.length === 0 && gear.length === 0) return null
  // A arte de Structure/Gear já vem deitada no arquivo original — não giramos,
  // só invertemos largura/altura pra ocupar o mesmo "tamanho" de área que um Pal, na horizontal.
  const landscapeWidth = cardHeight
  const landscapeHeight = cardWidth
  return (
    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'flex-end' }}>
      {structures.map((s, i) => {
        const isDropTarget = !!onDropStructure && !s.isStanding
        return (
          <div key={'s' + i} style={{ position: 'relative', width: landscapeWidth, height: landscapeHeight }}
               onMouseEnter={() => onHoverCard && onHoverCard(s.imageUrl, s.name)}
               onMouseLeave={() => onHoverEnd && onHoverEnd()}
               onDragOver={e => isDropTarget && e.preventDefault()}
               onDrop={() => isDropTarget && onDropStructure(i)}>
            <img src={s.imageUrl} alt={s.name} title={s.name}
                 style={{
                   width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                   outline: (isDropTarget && dragActive) ? '2px dashed #ffd54a' : 'none'
                 }} />
            {s.damageMarked > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                -{s.damageMarked}
              </span>
            )}
            {onActivateStructure && s.hasAct && <AbilityBadge onClick={() => onActivateStructure(i)} />}
          </div>
        )
      })}
      {gear.map((g, i) => (
        <div key={'g' + i} style={{ position: 'relative', width: landscapeWidth, height: landscapeHeight }}
             onMouseEnter={() => onHoverCard && onHoverCard(g.imageUrl, g.name)}
             onMouseLeave={() => onHoverEnd && onHoverEnd()}>
          <img src={g.imageUrl} alt={g.name} title={g.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
          {onActivateGear && g.hasAct && <AbilityBadge onClick={() => onActivateGear(i)} />}
        </div>
      ))}
    </div>
  )
}

// Popout de "escolher carta revelada" (topo do deck / cemitério / mão) — mesmo estilo visual do
// popup de missões diárias: fundo escurecido + card branco centralizado.
function CardChoiceModal({ pendingEffect, onChoose, onSkip, t }) {
  return (
    <div onClick={pendingEffect.optional ? onSkip : undefined} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '440px', maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto',
        background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '16px' }}>{pendingEffect.sourceCardName}</h2>
          {pendingEffect.optional && <button onClick={onSkip} style={{ padding: '4px 10px' }}>✕</button>}
        </div>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{t('gbCardChoicePrompt', { name: pendingEffect.sourceCardName })}</p>
        <p style={{ color: '#999', fontSize: '11px', marginTop: '0' }}>{pendingEffect.description}</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          {pendingEffect.cards.map((c, i) => (
            <img key={i} src={c.imageUrl} alt={c.name}
                 title={c.selectable ? c.name : `${c.name} (${t('gbCardChoiceNotEligible')})`}
                 onClick={() => c.selectable && onChoose(i)}
                 style={{
                   width: '96px', borderRadius: '6px', cursor: c.selectable ? 'pointer' : 'default',
                   border: c.selectable ? '3px solid #34c759' : '3px solid transparent',
                   boxShadow: c.selectable ? '0 0 10px rgba(52,199,89,0.7)' : 'none',
                   filter: c.selectable ? 'none' : 'grayscale(85%) brightness(0.65)',
                   opacity: c.selectable ? 1 : 0.65
                 }} />
          ))}
        </div>
        {pendingEffect.optional && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={onSkip} style={{ padding: '6px 16px', fontSize: '13px' }}>{t('gbEffectSkip')}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Popout informativo: cartas reveladas do deck como checagem de dano de vida, indo pro cemitério —
// mesmo estilo visual das missões, mas fecha sozinho (não exige decisão do jogador).
function DamageRevealModal({ reveal, onClose, t }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '440px', maxWidth: '92vw', maxHeight: '80vh', overflowY: 'auto', textAlign: 'center',
        background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '15px' }}>
            {t('gbDamageRevealTitle', { attacker: reveal.attackerName, defender: reveal.defenderName })}
          </h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
          {reveal.canceled ? t('gbDamageRevealCanceled') : t('gbDamageRevealDealt', { n: reveal.damageDealt })}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          {reveal.cards.map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={c.imageUrl} alt={c.name} title={c.name}
                   style={{ width: '80px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
              {c.isLucky && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '16px' }}>🍀</span>}
            </div>
          ))}
        </div>
        <p style={{ color: '#999', fontSize: '11px', marginTop: '10px', marginBottom: 0 }}>{t('gbDamageRevealToGraveyard')}</p>
      </div>
    </div>
  )
}

// Card temático (pergaminho/madeira, mesma linguagem visual do menu principal) usado nas telas de
// abertura de partida (Jokenpô, escolher ordem, mulligan, vitória/derrota). `accent` colore o brilho
// da borda pra dar feedback imediato (verde = vitória, vermelho = derrota, dourado = neutro).
const OVERLAY_ACCENTS = {
  win: { border: '#3f7a2e', glow: 'rgba(86,196,79,0.55)' },
  lose: { border: '#7a2e2e', glow: 'rgba(214,70,70,0.5)' },
  neutral: { border: '#8a5a2e', glow: 'rgba(201,154,78,0.45)' }
}

// Estilos de texto pra dentro do card de pergaminho — sempre escuros/legíveis, nunca dependem da
// cor de tema claro/escuro do sistema (o card em si é sempre claro).
const THEMED_H2 = { fontFamily: "'Rye', Georgia, serif", color: '#3a2210', fontSize: '22px', margin: '0 0 10px', textShadow: '0 1px 0 rgba(255,255,255,0.35)' }
const THEMED_P = { color: '#4a3220', fontSize: '14px', lineHeight: 1.5, margin: 0 }
const THEMED_RESULT_WIN = { fontFamily: "'Rye', Georgia, serif", color: '#2e5f1f', fontSize: '20px', margin: '8px 0 0', textShadow: '0 1px 0 rgba(255,255,255,0.4)' }
const THEMED_RESULT_LOSE = { fontFamily: "'Rye', Georgia, serif", color: '#7a2e2e', fontSize: '20px', margin: '8px 0 0', textShadow: '0 1px 0 rgba(255,255,255,0.3)' }
const THEMED_RESULT_NEUTRAL = { color: '#6b4d20', fontWeight: 700, fontSize: '15px', margin: '8px 0 0' }

// Texto claro pra usar direto sobre o fundo de madeira escura (fora do card de pergaminho).
const WOOD_H2 = { fontFamily: "'Rye', Georgia, serif", color: '#f3e2b3', fontSize: '26px', textShadow: '1px 1px 0 #000, 0 0 10px rgba(255,200,110,0.25)' }
const WOOD_P = { color: '#d8c6a0', fontSize: '14px' }

// Fundo de madeira escura, reaproveitado em toda tela "fora do tabuleiro" (seleção de deck, Jokenpô,
// escolher ordem, mulligan, vitória/derrota) pra dar uma identidade visual única antes da partida.
const WOOD_PAGE_BACKGROUND = 'radial-gradient(ellipse at 50% -10%, rgba(255,200,120,0.08), transparent 55%), linear-gradient(160deg, #3f2612 0%, #2b1608 60%, #1c0f06 100%)'

function Overlay({ children, accent = 'neutral' }) {
  const a = OVERLAY_ACCENTS[accent] || OVERLAY_ACCENTS.neutral
  return (
    <div style={{
      position: 'fixed', inset: 0, background: WOOD_PAGE_BACKGROUND,
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.28), transparent 60%), linear-gradient(155deg, #ecdcb2 0%, #d8bd86 55%, #c5a468 100%)',
        border: `3px solid ${a.border}`,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '440px',
        textAlign: 'center',
        color: '#2b1608',
        boxShadow: `inset 0 0 0 2px #8a5a2e, inset 0 0 0 5px #2b160a, inset 0 2px 6px rgba(255,255,255,0.35), 0 0 44px ${a.glow}, 0 16px 50px rgba(0,0,0,0.55)`
      }}>
        {children}
      </div>
    </div>
  )
}

function GameBoard() {
  const { t } = useLanguage()
  const CHOICE_LABELS = { rock: t('rockLabel'), paper: t('paperLabel'), scissors: t('scissorsLabel') }
  const [stage, setStage] = useState('selectDeck')
  const [decks, setDecks] = useState([])
  const [rpsResult, setRpsResult] = useState(null)
  const [mulliganHand, setMulliganHand] = useState([])
  const [gameState, setGameState] = useState(null)
  const [soulImageUrl, setSoulImageUrl] = useState(null)
  const [selectedPalIndex, setSelectedPalIndex] = useState(null)
  const [draggedPalIndex, setDraggedPalIndex] = useState(null)
  const [amountInput, setAmountInput] = useState(1)
  const [zoomCard, setZoomCard] = useState(null)
  const [damageRevealShown, setDamageRevealShown] = useState(null)
  const hoverTimerRef = useRef(null)
  const seenDamageRevealIdRef = useRef(null)
  const damageRevealTimerRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/api/decks`).then(r => r.json()).then(setDecks)
    fetch(`${API_URL}/api/cards/SOUL-001`).then(r => r.json()).then(c => setSoulImageUrl(c.image_url)).catch(() => {})

    socket.on('bot:rpsPrompt', () => setStage('rps'))

    socket.on('bot:rpsResult', (data) => {
      setRpsResult(data)
      if (data.result !== 'draw') {
        setTimeout(() => setStage(data.result === 'win' ? 'chooseOrder' : 'waitingBotOrder'), 1200)
        if (data.result === 'lose') {
          setTimeout(() => socket.emit('bot:chooseOrder', { goFirst: false }), 1300)
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
      if (state.pendingEffect?.kind === 'amount') setAmountInput(state.pendingEffect.min || 1)
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

  const handleDropOnEnemyPal = (targetIndex) => {
    if (draggedPalIndex === null || gameState?.pendingEffect) return
    socket.emit('bot:attackPal', { attackerIndex: draggedPalIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }

  const attackWithPal = (palIndex) => {
    if (gameState?.pendingEffect) return
    socket.emit('bot:attack', { palIndex })
    setSelectedPalIndex(null)
  }

  const isPendingTarget = (owner, index) =>
    !!gameState?.pendingEffect?.validTargets?.some(t => t.owner === owner && t.index === index)

  const resolveEffectTarget = (owner, index) => socket.emit('bot:resolveEffectTarget', { owner, index })
  const skipEffectTarget = () => socket.emit('bot:resolveEffectTarget', { skip: true })

  const activateAbility = (zone, index) => {
    if (gameState?.pendingEffect) return
    socket.emit('bot:activateAbility', { zone, index })
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

  const attackStructure = (targetIndex) => {
    if (draggedPalIndex === null || gameState?.pendingEffect || gameState?.pendingBattle) return
    socket.emit('bot:attackStructure', { attackerIndex: draggedPalIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }

  const startHoverZoom = (imageUrl, name) => {
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setZoomCard({ imageUrl, name }), 2000)
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
      <Overlay accent={rpsAccent}>
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
      <Overlay>
        <h2 style={THEMED_H2}>{t('gbMulliganTitle')}</h2>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
          {mulliganHand.map((c, i) => (
            <img key={i} src={c.image_url} alt={c.name} style={{ width: '70px', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }} />
          ))}
        </div>
        <p style={THEMED_P}>{t('gbMulliganQuestion')}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
          <button className="sign-button" onClick={() => decideMulligan(true)}>{t('gbKeepHand')}</button>
          <button className="sign-button" onClick={() => decideMulligan(false)}>{t('gbMulligan')}</button>
        </div>
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

  const { player, bot, hand, currentPhase, turnNumber, isPlayerTurn, pendingEffect, pendingBattle, log } = gameState
  const isValidBlocker = (i) => pendingBattle?.waitingFor === 'block' && pendingBattle.validBlockers.includes(i)
  const quickOptionFor = (cardNumber) =>
    pendingBattle?.waitingFor === 'quick' ? pendingBattle.quickOptions.find(o => o.cardNumber === cardNumber) : null

  const SoulRow = ({ standing, rested }) => (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: standing }).map((_, i) => (
        soulImageUrl
          ? <img key={'s' + i} src={soulImageUrl} alt="Soul" style={{ width: '14px', height: '20px', objectFit: 'cover', borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
          : <div key={'s' + i} style={{ width: '14px', height: '20px', background: '#ffd54a', border: '1px solid #b8860b', borderRadius: '3px' }} />
      ))}
      {Array.from({ length: rested }).map((_, i) => (
        soulImageUrl
          ? <img key={'r' + i} src={soulImageUrl} alt="Soul" style={{ width: '14px', height: '20px', objectFit: 'cover', borderRadius: '3px', transform: 'rotate(90deg)', filter: 'grayscale(100%)', opacity: 0.7 }} />
          : <div key={'r' + i} style={{ width: '14px', height: '20px', background: '#7a7a7a', border: '1px solid #444', borderRadius: '3px', transform: 'rotate(90deg)' }} />
      ))}
    </div>
  )

  const SoulCount = ({ standing, rested }) => (
    <div style={{
      background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '4px 10px',
      color: '#fff', fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'
    }}>
      {standing} standing / {rested} rested
    </div>
  )

  const ResourceCounter = ({ resources }) => (
    <div style={{
      background: 'rgba(0,0,0,0.35)', borderRadius: '8px', padding: '4px 10px',
      display: 'flex', gap: '10px', color: '#fff', fontSize: '12px'
    }}>
      <span>🪵 {resources?.wood ?? 0}</span>
      <span>🍓 {resources?.fruit ?? 0}</span>
    </div>
  )

  return (
    <div onClick={() => selectedPalIndex !== null && setSelectedPalIndex(null)} style={{
      height: '100vh', width: '100%', overflow: 'hidden', position: 'relative', isolation: 'isolate',
      background: "url('/ambient.webp') center / cover no-repeat fixed",
      padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box'
    }}>
      {/* Camada de "noite" — mesma imagem usada no toggle do menu principal, com crossfade suave.
          Só a opacidade anima; quem controla é o próprio jogo (cartas com efeito de night).
          `isolation: isolate` no container acima garante que esse z-index negativo fique confinado
          aqui dentro (atrás do resto do tabuleiro), sem escapar pra trás do fundo da própria página. */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
        background: "url('/night.png') center / cover no-repeat fixed",
        opacity: gameState.isNight ? 1 : 0,
        transition: 'opacity 1.2s ease'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><button style={{ fontSize: '12px' }}>{t('gbExitMatch')}</button></Link>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          {t('gbTurn', { n: turnNumber, whoseTurn: isPlayerTurn ? t('gbYourTurn') : t('gbBotTurn') })}
        </div>
      </div>

      {/* ---------- BOT ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🤖 {bot.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: bot.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: bot.graveyardCount })} width="56px" height="76px" />
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
            return (
              <div key={i}
                   onDragOver={e => !p.isStanding && e.preventDefault()}
                   onDrop={() => !p.isStanding && handleDropOnEnemyPal(i)}
                   onClick={() => isEffectTarget && resolveEffectTarget('bot', i)}
                   style={{
                     outline: isEffectTarget ? '2px dashed #6cf25a' : ((!p.isStanding && draggedPalIndex !== null) ? '2px dashed #ffd54a' : 'none'),
                     borderRadius: '8px', cursor: isEffectTarget ? 'pointer' : 'default'
                   }}>
                <PalCard pal={p} width="62px" onHoverStart={startHoverZoom} onHoverEnd={cancelHoverZoom} />
              </div>
            )
          })}
          <StructureGearRow structures={bot.baseStructures || []} gear={bot.baseGear || []} cardWidth="62px" cardHeight="86px"
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom}
                             onDropStructure={attackStructure} dragActive={draggedPalIndex !== null} />
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
                         onActivate={(!pendingEffect && !pendingBattle && isPlayerTurn && currentPhase === 'main') ? () => activateAbility('basePals', i) : undefined}
                         onHoverStart={startHoverZoom} onHoverEnd={cancelHoverZoom} />
              </div>
            )
          })}
          <StructureGearRow structures={player.baseStructures || []} gear={player.baseGear || []}
                             onActivateStructure={(!pendingEffect && isPlayerTurn && currentPhase === 'main') ? (i) => activateAbility('baseStructures', i) : undefined}
                             onActivateGear={(!pendingEffect && isPlayerTurn && currentPhase === 'main') ? (i) => activateAbility('baseGear', i) : undefined}
                             onHoverCard={startHoverZoom} onHoverEnd={cancelHoverZoom} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {player.playerName === 'Você' ? t('youLabel') : player.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={t('gbDeckCount', { n: player.deckCount })} width="56px" height="76px" imageUrl="/card_fundo.png" />
            <CardSlot label={t('gbGraveyard', { n: player.graveyardCount })} width="56px" height="76px" />
          </div>
          <ResourceCounter resources={player.resources} />
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

      {/* ---------- POPOUT: cartas reveladas por dano de vida, indo pro cemitério ---------- */}
      {damageRevealShown && (
        <DamageRevealModal reveal={damageRevealShown} onClose={() => setDamageRevealShown(null)} t={t} />
      )}

      {/* ---------- BLOCK DECLARATION STEP ---------- */}
      {pendingBattle?.waitingFor === 'block' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbBlockPrompt', { name: pendingBattle.attackerName })}</span>
          <button onClick={resolveNoBlock} style={{ padding: '4px 10px', fontSize: '11px' }}>{t('gbNoBlock')}</button>
        </div>
      )}

      {/* ---------- QUICK STEP ---------- */}
      {pendingBattle?.waitingFor === 'quick' && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px'
        }}>
          <span>{t('gbQuickStepPrompt')}</span>
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

      {/* ---------- BOTÕES DE AÇÃO (fora do vidro) ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={drawWithSouls}
                disabled={!!pendingEffect || !!pendingBattle || !isPlayerTurn || currentPhase !== 'main' || player.soulsStanding < 3 || player.soulDrawUsedThisTurn}
                title={player.soulDrawUsedThisTurn ? t('gbDrawWithSoulsUsed') : undefined}
                style={{ padding: '6px 14px', fontSize: '12px' }}>
          {t('gbDrawWithSouls')}
        </button>
        {selectedPalIndex !== null ? (
          <button onClick={() => attackWithPal(selectedPalIndex)} disabled={!!pendingEffect || !!pendingBattle} style={{ padding: '6px 16px', fontSize: '13px' }}>
            {t('gbAttackWithPal')}
          </button>
        ) : (
          <button onClick={advancePhase} disabled={!!pendingEffect || !!pendingBattle || !isPlayerTurn} style={{ padding: '6px 20px', fontSize: '13px' }}>
            {t('gbEndTurn')}
          </button>
        )}
      </div>

      {/* ---------- MÃO ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {hand.map((card, handIndex) => {
          const isLandscapeArt = card.card_type === 'Structure' || card.card_type === 'Gear'
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
                   width: '64px', height: '90px', borderRadius: '6px', cursor: 'pointer',
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
                       width: '90px', height: '64px',
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

      {log && log.length > 0 && (
        <div style={{
          position: 'absolute', left: '8px', bottom: '8px', maxWidth: '280px',
          background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px',
          borderRadius: '6px', padding: '6px 8px', lineHeight: 1.4, pointerEvents: 'none'
        }}>
          {log.slice(-3).map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* Zoom ao passar o mouse por 2s numa carta — zIndex abaixo dos popups (1200) de propósito:
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