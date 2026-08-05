import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

function CardPicker({ onSelect, onClose, ownedPals, selectedNumbers, requiredKeywords }) {
  const filtered = requiredKeywords
    ? ownedPals.filter(c => (c.workKeywords || []).some(k => requiredKeywords.includes(k.toLowerCase())))
    : ownedPals

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '20px', width: '520px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Escolha um Pal (mostra os work_keywords dele)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
          {filtered.map(card => {
            const already = selectedNumbers.includes(card.card_number)
            return (
              <div key={card.card_number} onClick={() => !already && onSelect(card)}
                   style={{ cursor: already ? 'not-allowed' : 'pointer', opacity: already ? 0.4 : 1, textAlign: 'center' }}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '6px' }} />
                <p style={{ fontSize: '10px', margin: '4px 0 0', fontWeight: 600 }}>{card.name}</p>
                <p style={{ fontSize: '9px', margin: 0, color: '#777' }}>{(card.workKeywords || []).join(', ') || '—'}</p>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <p style={{ color: '#999' }}>Nenhum Pal seu tem essa habilidade de trabalho ainda.</p>}
      </div>
    </div>
  )
}

function Farming() {
  const [ownedPals, setOwnedPals] = useState([])
  const [selected, setSelected] = useState([])
  const [picking, setPicking] = useState(false)
  const [repeatWanted, setRepeatWanted] = useState(false)
  const [status, setStatus] = useState(null)
  const [player, setPlayer] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [errorMsg, setErrorMsg] = useState('')
  const [kindlingPal, setKindlingPal] = useState(null)
  const [pickingKindling, setPickingKindling] = useState(false)

  useEffect(() => {
    loadOwnedPals()
    loadStatus()
    loadPlayer()
    const clockInterval = setInterval(() => setNow(Date.now()), 1000)
    const pollInterval = setInterval(() => { loadStatus(); loadPlayer() }, 4000)
    return () => { clearInterval(clockInterval); clearInterval(pollInterval) }
  }, [])

  function loadPlayer() {
    fetch(`${API_URL}/api/player`).then(r => r.json()).then(setPlayer)
  }

  function loadOwnedPals() {
    Promise.all([
      fetch(`${API_URL}/api/cards`).then(r => r.json()),
      fetch(`${API_URL}/api/player/cards`).then(r => r.json())
    ]).then(([allCards, owned]) => {
      const ownedNumbers = new Set(owned.map(o => o.card_number))
      Promise.all(
        allCards.filter(c => c.card_type === 'Pal' && ownedNumbers.has(c.card_number))
          .map(c => fetch(`${API_URL}/api/cards/${c.card_number}`).then(r => r.json()).then(full => ({
            ...c, workKeywords: full.extra_data ? (JSON.parse(full.extra_data)?.data?.work_keywords || []) : []
          })))
      ).then(setOwnedPals)
    })
  }

  function loadStatus() {
    fetch(`${API_URL}/api/farming/status`).then(r => r.json()).then(setStatus)
  }

  const addPal = (card) => {
    if (selected.length >= 3) return
    setSelected([...selected, card])
    setPicking(false)
  }
  const removePal = (cardNumber) => setSelected(selected.filter(c => c.card_number !== cardNumber))

  const allKeywords = selected.flatMap(c => (c.workKeywords || []).map(k => k.toLowerCase()))
  const hasFarming = allKeywords.includes('farming')
  const hasHarvesting = allKeywords.includes('harvesting')
  const hasCollecting = allKeywords.includes('collecting')
  const canStart = hasFarming && hasHarvesting && selected.length > 0

  const startFarming = () => {
    setErrorMsg('')
    fetch(`${API_URL}/api/farming/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumbers: selected.map(c => c.card_number), repeat: repeatWanted })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSelected([])
        loadStatus()
      })
      .catch(err => setErrorMsg(err.message))
  }

  const claim = () => {
    fetch(`${API_URL}/api/farming/claim`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus(); loadPlayer()
      })
      .catch(err => alert(err.message))
  }

  const stopRepeat = () => {
    fetch(`${API_URL}/api/farming/stop-repeat`, { method: 'POST' }).then(loadStatus)
  }

  const bake = (type) => {
    if (!kindlingPal) { alert('Escolha um Pal com Kindling primeiro.'); return }
    fetch(`${API_URL}/api/farming/bake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, kindlingCardNumber: kindlingPal.card_number })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
      })
      .catch(err => alert(err.message))
  }

  const formatCountdown = (readyTime) => {
    const diff = new Date(readyTime).getTime() - now
    if (diff <= 0) return 'Pronto!'
    const m = Math.floor(diff / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${m}m ${s}s`
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <Link to="/"><button style={{ marginBottom: '20px' }}>← Voltar ao Menu</button></Link>
      <h1>🌱 Farming</h1>
      <p style={{ color: '#777' }}>Escolha até 3 Pals que cubram "Farming" (plantar/regar) e "Harvesting" (colheita).</p>

      {player && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
          <span>🌾 Trigo: <strong>{player.wheat}</strong></span>
          <span>🥬 Alface: <strong>{player.lettuce}</strong></span>
          <span>🍅 Tomate: <strong>{player.tomato}</strong></span>
        </div>
      )}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
            {selected.map(card => (
              <div key={card.card_number} onClick={() => removePal(card.card_number)} style={{ cursor: 'pointer', width: '90px' }} title="Clique pra remover">
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '8px' }} />
                <p style={{ fontSize: '9px', margin: '2px 0 0' }}>{(card.workKeywords || []).join(', ')}</p>
              </div>
            ))}
            {selected.length < 3 && (
              <div onClick={() => setPicking(true)} style={{ cursor: 'pointer', width: '90px', height: '126px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                + Pal
              </div>
            )}
          </div>

          <p style={{ fontSize: '12px' }}>
            Farming: {hasFarming ? '✅' : '❌'} &nbsp; Harvesting: {hasHarvesting ? '✅' : '❌'} &nbsp; Collecting: {hasCollecting ? '✅' : '❌'}
          </p>

          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '10px 0' }}>
            <input type="checkbox" checked={repeatWanted} onChange={e => setRepeatWanted(e.target.checked)} disabled={!hasCollecting} />
            Repetir automaticamente (precisa de um Pal com Collecting)
          </label>

          <button onClick={startFarming} disabled={!canStart} style={{ padding: '12px 30px', opacity: canStart ? 1 : 0.5 }}>
            🌱 Iniciar Farming
          </button>
          {errorMsg && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{errorMsg}</p>}
        </>
      )}

      {status && status.active && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            {status.pals.map(p => <img key={p.card_number} src={p.image_url} alt="" style={{ width: '70px', borderRadius: '6px' }} />)}
          </div>

          {status.repeat ? (
            <>
              <h3>🔁 Colhendo automaticamente...</h3>
              <p>Colheitas feitas: <strong>{status.harvestCount}</strong></p>
              <p>Próxima em: {formatCountdown(status.readyTime)}</p>
              <button onClick={stopRepeat} style={{ padding: '8px 16px', fontSize: '12px' }}>Parar Repetição</button>
            </>
          ) : status.isReady ? (
            <>
              <h3>🌾 Pronto pra colher!</h3>
              <button onClick={claim} style={{ padding: '12px 30px' }}>Colher</button>
            </>
          ) : (
            <>
              <h3>Cultivando...</h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCountdown(status.readyTime)}</p>
              <div style={{ width: '100%', maxWidth: '400px', margin: '10px auto', background: '#eee', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, ((now - new Date(status.startTime).getTime()) / (new Date(status.readyTime).getTime() - new Date(status.startTime).getTime())) * 100)}%`,
                  height: '100%', background: 'linear-gradient(90deg, #7cb342, #aed581)', transition: 'width 1s linear'
                }} />
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
        <h3>🔥 Forno</h3>

        <div style={{ marginBottom: '16px' }}>
          {kindlingPal ? (
            <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', display: 'inline-block' }} title="Clique pra trocar">
              <img src={kindlingPal.image_url} alt={kindlingPal.name} style={{ width: '60px', borderRadius: '6px' }} />
              <p style={{ fontSize: '10px', margin: '2px 0 0' }}>{kindlingPal.name} (Kindling)</p>
            </div>
          ) : (
            <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', width: '60px', height: '84px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '0 auto', fontSize: '10px', textAlign: 'center' }}>
              + Pal Kindling
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/Cake_icon.webp" alt="Cake" style={{ width: '50px' }} />
            <p style={{ fontSize: '12px' }}>10 de cada ingrediente</p>
            <button onClick={() => bake('cake')} disabled={!player || !kindlingPal || player.wheat < 10 || player.lettuce < 10 || player.tomato < 10}>
              Assar Cake
            </button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src="/Special_Cake_icon.webp" alt="Special Cake" style={{ width: '50px' }} />
            <p style={{ fontSize: '12px' }}>30 de cada ingrediente</p>
            <button onClick={() => bake('special_cake')} disabled={!player || !kindlingPal || player.wheat < 30 || player.lettuce < 30 || player.tomato < 30}>
              Assar Special Cake
            </button>
          </div>
        </div>
      </div>

      {pickingKindling && (
        <CardPicker
          ownedPals={ownedPals}
          selectedNumbers={[]}
          requiredKeywords={['kindling']}
          onClose={() => setPickingKindling(false)}
          onSelect={(card) => { setKindlingPal(card); setPickingKindling(false) }}
        />
      )}

      {picking && (
        <CardPicker
          ownedPals={ownedPals}
          selectedNumbers={selected.map(c => c.card_number)}
          requiredKeywords={['farming', 'harvesting', 'collecting']}
          onClose={() => setPicking(false)}
          onSelect={addPal}
        />
      )}
    </div>
  )
}

export default Farming