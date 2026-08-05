import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

function CardPicker({ onSelect, onClose, ownedPals }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '20px', width: '500px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Escolha um Pal da sua coleção</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
          {ownedPals.map(card => (
            <div key={card.card_number} onClick={() => onSelect(card)} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '6px' }} />
              <p style={{ fontSize: '10px', margin: '4px 0 0' }}>{card.name}</p>
            </div>
          ))}
        </div>
        {ownedPals.length === 0 && <p style={{ color: '#999' }}>Você ainda não tem cartas de Pal na coleção.</p>}
      </div>
    </div>
  )
}

function Breeding() {
  const [ownedPals, setOwnedPals] = useState([])
  const [parent1, setParent1] = useState(null)
  const [parent2, setParent2] = useState(null)
  const [pickingSide, setPickingSide] = useState(null) // 1, 2, ou null
  const [status, setStatus] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [revealedResult, setRevealedResult] = useState(null)
  const [player, setPlayer] = useState(null)

  const useCake = (type) => {
    fetch(`${API_URL}/api/breeding/use-cake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus()
        fetch(`${API_URL}/api/player`).then(r => r.json()).then(setPlayer)
      })
      .catch(err => alert(err.message))
  }

  useEffect(() => {
    loadOwnedPals()
    loadStatus()
    fetch(`${API_URL}/api/player`).then(r => r.json()).then(setPlayer)
    const clockInterval = setInterval(() => setNow(Date.now()), 1000)
    const pollInterval = setInterval(() => loadStatus(), 5000) // corrige o "preso" até virar Chocar
    return () => {
      clearInterval(clockInterval)
      clearInterval(pollInterval)
    }
  }, [])

  function loadOwnedPals() {
    Promise.all([
      fetch(`${API_URL}/api/cards`).then(r => r.json()),
      fetch(`${API_URL}/api/player/cards`).then(r => r.json())
    ]).then(([allCards, owned]) => {
      const ownedNumbers = new Set(owned.map(o => o.card_number))
      setOwnedPals(allCards.filter(c => c.card_type === 'Pal' && ownedNumbers.has(c.card_number)))
    })
  }

  function loadStatus() {
    fetch(`${API_URL}/api/breeding/status`).then(r => r.json()).then(setStatus)
  }

  const startBreeding = () => {
    fetch(`${API_URL}/api/breeding/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent1CardNumber: parent1.card_number, parent2CardNumber: parent2.card_number })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus()
        setParent1(null)
        setParent2(null)
      })
      .catch(err => alert(err.message))
  }
  const finishBreedingNow = async () => {
    try {
      const response = await fetch(`${API_URL}/api/breeding/debug-finish`, {
        method: "POST",
      });

      console.log("Status:", response.status);
      console.log("URL:", response.url);

      const text = await response.text();
      console.log(text);
    } catch (e) {
      console.error(e);
    }
  };
  const claimResult = () => {
    fetch(`${API_URL}/api/breeding/claim`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setRevealedResult(data)
        loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const closeReveal = () => {
    setRevealedResult(null)
    loadStatus()
  }

  const formatCountdown = (readyTime) => {
    const diff = new Date(readyTime).getTime() - now
    if (diff <= 0) return 'Pronto!'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${h}h ${m}m ${s}s`
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <Link to="/"><button style={{ marginBottom: '20px' }}>← Voltar ao Menu</button></Link>
      <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <img src="/egg.png" alt="Breeding" style={{ width: '48px', height: '48px' }} /> Breeding
      </h1>
      <p style={{ color: '#777' }}>Combine 2 Pals da sua coleção pra gerar um novo, baseado na fórmula real do jogo. O tempo varia de 10 minutos a 24h, dependendo da raridade do resultado.</p>

      {!status && <p>Carregando...</p>}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', margin: '30px 0' }}>
            <div onClick={() => setPickingSide(1)} style={{ cursor: 'pointer', width: '140px' }}>
              {parent1 ? (
                <img src={parent1.image_url} alt={parent1.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: '140px', height: '196px', border: '2px dashed #ccc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  + Escolher Pal
                </div>
              )}
              <p style={{ fontSize: '13px', marginTop: '6px' }}>{parent1?.name || 'Pai 1'}</p>
            </div>

            <div style={{ fontSize: '32px' }}>+</div>

            <div onClick={() => setPickingSide(2)} style={{ cursor: 'pointer', width: '140px' }}>
              {parent2 ? (
                <img src={parent2.image_url} alt={parent2.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: '140px', height: '196px', border: '2px dashed #ccc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  + Escolher Pal
                </div>
              )}
              <p style={{ fontSize: '13px', marginTop: '6px' }}>{parent2?.name || 'Pai 2'}</p>
            </div>
          </div>

          <button
            onClick={startBreeding}
            disabled={!parent1 || !parent2}
            style={{ padding: '12px 30px', fontSize: '14px', opacity: (!parent1 || !parent2) ? 0.5 : 1 }}>
            <img src="/egg.png" alt="" style={{ width: '18px', height: '18px', verticalAlign: 'middle', marginRight: '6px' }} />
            Iniciar Breeding
          </button>
        </>
      )}

      {status && status.active && !status.isReady && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <img src={status.parent1.image_url} alt="" style={{ width: '100px', borderRadius: '8px', opacity: 0.7 }} />
            <img src="/egg.png" alt="" style={{ width: '60px', height: '60px' }} />
            <img src={status.parent2.image_url} alt="" style={{ width: '100px', borderRadius: '8px', opacity: 0.7 }} />
          </div>
          <h2>Chocando o ovo...</h2>
          <button
            onClick={finishBreedingNow}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
              🛠 Finalizar Instantaneamente (DEBUG)
          </button>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCountdown(status.readyTime)}</p>

          <div style={{ width: '100%', maxWidth: '400px', margin: '16px auto', background: '#eee', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, ((now - new Date(status.startTime).getTime()) / (new Date(status.readyTime).getTime() - new Date(status.startTime).getTime())) * 100)}%`,
              height: '100%', background: 'linear-gradient(90deg, #ffb347, #ffcc33)', transition: 'width 1s linear'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            <button
              onClick={() => useCake('cake')}
              disabled={!player || player.cake_count <= 0}
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Cake_icon.webp" alt="" style={{ width: '20px' }} /> Usar Cake ({player?.cake_count || 0}) — -10min
            </button>
            <button
              onClick={() => useCake('special_cake')}
              disabled={!player || player.special_cake_count <= 0}
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Special_Cake_icon.webp" alt="" style={{ width: '20px' }} /> Usar Special Cake ({player?.special_cake_count || 0}) — -1h
            </button>
          </div>
        </div>
      )}

      {status && status.active && status.isReady && (
        <div style={{ marginTop: '30px' }}>
          <img src="/egg.png" alt="" style={{ width: '80px', height: '80px' }} />
          <h2>O ovo está pronto pra eclodir!</h2>
          <button onClick={claimResult} style={{ padding: '14px 30px', fontSize: '15px' }}>Chocar</button>
        </div>
      )}

      {pickingSide && (
        <CardPicker
          ownedPals={ownedPals}
          onClose={() => setPickingSide(null)}
          onSelect={(card) => {
            if (pickingSide === 1) setParent1(card); else setParent2(card)
            setPickingSide(null)
          }}
        />
      )}

      {revealedResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
            <h2>🎉 Eclodiu!</h2>
            <img src={revealedResult.card.image_url} alt={revealedResult.card.name} style={{ width: '180px', borderRadius: '10px', margin: '10px 0' }} />
            <p style={{ fontWeight: 'bold' }}>{revealedResult.card.name}</p>
            {revealedResult.fluidGained > 0 && <p>Já tinha 4 cópias — ganhou {revealedResult.fluidGained} 💧 Fluido de Pal</p>}
            <button onClick={closeReveal} style={{ padding: '10px 24px', marginTop: '10px' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Breeding