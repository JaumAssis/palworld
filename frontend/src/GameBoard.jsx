import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'

const API_URL = 'http://localhost:3001'

// Conexão única e persistente durante toda a vida da aba — sem connect/disconnect manual
const socket = io(API_URL)

const CHOICE_LABELS = { rock: '✊ Pedra', paper: '✋ Papel', scissors: '✌️ Tesoura' }

function CardSlot({ label, width = '80px', height = '112px', highlight = false }) {
  return (
    <div style={{
      width, height,
      border: highlight ? '2px solid #ffd54a' : '1px solid rgba(255,255,255,0.5)',
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: '11px', fontWeight: 600,
      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(3px)',
      textShadow: '0 1px 3px rgba(0,0,0,0.6)'
    }}>
      {label}
    </div>
  )
}

function PalCard({ pal, width = '78px', selected = false, onClick, clickable = false }) {
  return (
    <div onClick={onClick} style={{
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

function StructureGearRow({ structures, gear, cardWidth = '70px', cardHeight = '98px' }) {
  if (structures.length === 0 && gear.length === 0) return null
  // A arte de Structure/Gear já vem deitada no arquivo original — não giramos,
  // só invertemos largura/altura pra ocupar o mesmo "tamanho" de área que um Pal, na horizontal.
  const landscapeWidth = cardHeight
  const landscapeHeight = cardWidth
  return (
    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'flex-end' }}>
      {structures.map((s, i) => (
        <div key={'s' + i} style={{ position: 'relative', width: landscapeWidth, height: landscapeHeight }}>
          <img src={s.imageUrl} alt={s.name} title={s.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
          {s.damageMarked > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(200,0,0,0.85)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
              -{s.damageMarked}
            </span>
          )}
        </div>
      ))}
      {gear.map((g, i) => (
        <div key={'g' + i} style={{ width: landscapeWidth, height: landscapeHeight }}>
          <img src={g.imageUrl} alt={g.name} title={g.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
        </div>
      ))}
    </div>
  )
}

function Overlay({ children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', maxWidth: '420px', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  )
}

function GameBoard() {
  const [stage, setStage] = useState('selectDeck')
  const [decks, setDecks] = useState([])
  const [rpsResult, setRpsResult] = useState(null)
  const [mulliganHand, setMulliganHand] = useState([])
  const [gameState, setGameState] = useState(null)
  const [soulImageUrl, setSoulImageUrl] = useState(null)
  const [selectedPalIndex, setSelectedPalIndex] = useState(null)
  const [draggedPalIndex, setDraggedPalIndex] = useState(null)

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
    })

    socket.on('bot:error', (err) => {
      alert(err.message)
    })

    return () => {
      socket.off('bot:rpsPrompt')
      socket.off('bot:rpsResult')
      socket.off('bot:mulliganPrompt')
      socket.off('bot:state')
      socket.off('bot:error')
    }
  }, [])

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
    if (draggedPalIndex === null) return
    socket.emit('bot:attackPal', { attackerIndex: draggedPalIndex, targetIndex })
    setDraggedPalIndex(null)
    setSelectedPalIndex(null)
  }

  const attackWithPal = (palIndex) => {
    socket.emit('bot:attack', { palIndex })
    setSelectedPalIndex(null)
  }

  if (stage === 'selectDeck') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Link to="/"><button style={{ marginBottom: '16px' }}>← Voltar ao Menu</button></Link>
        <h2>Escolha seu deck pra enfrentar o Bot</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
          {decks.map(d => (
            <button key={d.id} onClick={() => startMatch(d.id)} style={{ padding: '14px 20px' }}>
              {d.name}
            </button>
          ))}
        </div>
        {decks.length === 0 && <p>Nenhum deck salvo ainda. Vá em "Montar Deck" primeiro.</p>}
      </div>
    )
  }

  if (stage === 'rps' || stage === 'waitingBotOrder') {
    return (
      <Overlay>
        <h2>🪨📄✂️ Jokenpô!</h2>
        <p>Quem ganhar decide quem começa a partida.</p>
        {!rpsResult && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => sendRPS(key)} style={{ padding: '12px 16px' }}>{label}</button>
            ))}
          </div>
        )}
        {rpsResult && (
          <div style={{ marginTop: '16px' }}>
            <p>Você: {CHOICE_LABELS[rpsResult.playerChoice]} vs Bot: {CHOICE_LABELS[rpsResult.botChoice]}</p>
            {rpsResult.result === 'draw' && <p><strong>Empate!</strong> Escolha de novo.</p>}
            {rpsResult.result === 'win' && <p><strong>Você venceu o Jokenpô!</strong></p>}
            {rpsResult.result === 'lose' && <p><strong>O Bot venceu o Jokenpô</strong> e escolheu ir primeiro.</p>}
          </div>
        )}
        {rpsResult?.result === 'draw' && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            {Object.entries(CHOICE_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => sendRPS(key)} style={{ padding: '12px 16px' }}>{label}</button>
            ))}
          </div>
        )}
      </Overlay>
    )
  }

  if (stage === 'chooseOrder') {
    return (
      <Overlay>
        <h2>Você venceu o Jokenpô!</h2>
        <p>Prefere jogar primeiro ou em segundo?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={() => chooseOrder(true)} style={{ padding: '12px 20px' }}>Ir primeiro</button>
          <button onClick={() => chooseOrder(false)} style={{ padding: '12px 20px' }}>Ir em segundo</button>
        </div>
      </Overlay>
    )
  }

  if (stage === 'mulligan') {
    return (
      <Overlay>
        <h2>Sua mão inicial</h2>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
          {mulliganHand.map(c => (
            <img key={c.card_number} src={c.image_url} alt={c.name} style={{ width: '70px', borderRadius: '6px' }} />
          ))}
        </div>
        <p>Deseja manter essa mão ou fazer mulligan (embaralhar e comprar 5 novas)?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
          <button onClick={() => decideMulligan(true)} style={{ padding: '12px 20px' }}>Manter mão</button>
          <button onClick={() => decideMulligan(false)} style={{ padding: '12px 20px' }}>Mulligan</button>
        </div>
      </Overlay>
    )
  }

  if (stage === 'gameOver') {
    return (
      <Overlay>
        <h2>{gameState.winner === 'Você' ? '🎉 Você venceu!' : '💀 Você perdeu!'}</h2>
        <Link to="/"><button style={{ marginTop: '16px', padding: '12px 20px' }}>Voltar ao Menu</button></Link>
      </Overlay>
    )
  }

  if (!gameState) return <p style={{ padding: '2rem' }}>Carregando partida...</p>

  const { player, bot, hand, currentPhase, turnNumber, isPlayerTurn } = gameState

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
    <div style={{
      height: '100vh', width: '100%', overflow: 'hidden',
      background: "url('/playmat.webp') center / cover no-repeat fixed",
      padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/"><button style={{ fontSize: '12px' }}>← Sair da Partida</button></Link>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
          Turno {turnNumber} — {isPlayerTurn ? 'sua vez' : 'vez do bot'}
        </div>
      </div>

      {/* ---------- BOT ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🤖 {bot.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={`Deck (${bot.deckCount})`} width="56px" height="76px" />
            <CardSlot label={`Cemitério (${bot.graveyardCount})`} width="56px" height="76px" />
          </div>
          <SoulRow standing={bot.soulsStanding} rested={bot.soulsRested} />
          <SoulCount standing={bot.soulsStanding} rested={bot.soulsRested} />
          <span style={{ color: '#fff', fontSize: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            ❤️ {bot.life} | Mão: {bot.handCount}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', minHeight: '90px', marginTop: '6px' }}>
          {bot.basePals.map((p, i) => (
            <div key={i}
                 onDragOver={e => !p.isStanding && e.preventDefault()}
                 onDrop={() => !p.isStanding && handleDropOnEnemyPal(i)}
                 style={{ outline: (!p.isStanding && draggedPalIndex !== null) ? '2px dashed #ffd54a' : 'none', borderRadius: '8px' }}>
              <PalCard pal={p} width="62px" />
            </div>
          ))}
          <StructureGearRow structures={bot.baseStructures || []} gear={bot.baseGear || []} cardWidth="62px" cardHeight="86px" />
        </div>
      </div>

      {/* ---------- JOGADOR ---------- */}
      <div style={{ background: 'rgba(10,15,25,0.45)', backdropFilter: 'blur(4px)', borderRadius: '12px', padding: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flex: 1, minHeight: '90px' }}>
          {player.basePals.map((p, i) => (
            <div key={i}
                 draggable={p.isStanding && isPlayerTurn && currentPhase === 'main'}
                 onDragStart={() => setDraggedPalIndex(i)}
                 onDragEnd={() => setDraggedPalIndex(null)}>
              <PalCard pal={p} width="70px" selected={selectedPalIndex === i}
                       clickable={p.isStanding && isPlayerTurn && currentPhase === 'main'}
                       onClick={() => p.isStanding && isPlayerTurn && currentPhase === 'main' && setSelectedPalIndex(i)} />
            </div>
          ))}
          <StructureGearRow structures={player.baseStructures || []} gear={player.baseGear || []} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
          <strong style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', fontSize: '13px' }}>🧑 {player.playerName}</strong>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CardSlot label={`Deck (${player.deckCount})`} width="56px" height="76px" />
            <CardSlot label={`Cemitério (${player.graveyardCount})`} width="56px" height="76px" />
          </div>
          <ResourceCounter resources={player.resources} />
          <SoulRow standing={player.soulsStanding} rested={player.soulsRested} />
          <SoulCount standing={player.soulsStanding} rested={player.soulsRested} />
          <span style={{ color: '#fff', fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>❤️ {player.life}</span>
        </div>
      </div>

      {/* ---------- BOTÕES DE AÇÃO (fora do vidro) ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={drawWithSouls}
                disabled={!isPlayerTurn || currentPhase !== 'main' || player.soulsStanding < 3}
                style={{ padding: '6px 14px', fontSize: '12px' }}>
          🔮 Comprar carta (3 Souls)
        </button>
        {selectedPalIndex !== null ? (
          <button onClick={() => attackWithPal(selectedPalIndex)} style={{ padding: '6px 16px', fontSize: '13px' }}>
            ⚔️ Atacar o Bot com esse Pal
          </button>
        ) : (
          <button onClick={advancePhase} disabled={!isPlayerTurn} style={{ padding: '6px 20px', fontSize: '13px' }}>
            Encerrar Turno →
          </button>
        )}
      </div>

      {/* ---------- MÃO ---------- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {hand.map(card => {
          const isLandscapeArt = card.card_type === 'Structure' || card.card_type === 'Gear'
          return (
            <div key={card.card_number}
                 onClick={() => isPlayerTurn && currentPhase === 'main' && handleHandCardClick(card)}
                 title={card.name}
                 style={{
                   width: '64px', height: '90px', borderRadius: '6px', cursor: 'pointer',
                   boxShadow: '0 2px 6px rgba(0,0,0,0.4)', transition: 'transform 0.1s', flexShrink: 0,
                   position: 'relative', overflow: 'hidden'
                 }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
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
    </div>
  )
}

export default GameBoard