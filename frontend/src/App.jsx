import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import CardGrid from './CardGrid'
import DeckBuilder from './DeckBuilder'
import { DeckList, DeckDetail } from './MyDecks'
import GameBoard from './GameBoard'
import MyCollection from './MyCollection'
import Shop from './Shop'
import Breeding from './Breeding'
import Farming from './Farming'

const API_URL = 'http://localhost:3001'

function MissionsPopup({ onClose }) {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMissions = () => {
    fetch(`${API_URL}/api/missions/today`).then(r => r.json()).then(data => {
      setMissions(data)
      setLoading(false)
    })
  }

  useEffect(() => { loadMissions() }, [])

  const claim = (missionId) => {
    fetch(`${API_URL}/api/missions/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId })
    }).then(() => loadMissions())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '380px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: '20px',
        padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>📅 Missões Diárias</h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        {loading && <p>Carregando...</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {missions.map(m => {
            const pct = Math.min(100, (m.currentValue / m.target_value) * 100)
            return (
              <div key={m.id} style={{
                border: '1px solid #eee', borderRadius: '10px', padding: '10px',
                background: m.claimed ? '#f5f5f5' : '#fff'
              }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600 }}>{m.description}</p>
                <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: m.completed ? '#34c759' : '#007aff', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {m.currentValue} / {m.target_value} — 🪙{m.reward_gold} {m.reward_fluid > 0 && `💧${m.reward_fluid}`}
                  </span>
                  {m.completed && !m.claimed && (
                    <button onClick={() => claim(m.id)} style={{ padding: '4px 12px', fontSize: '12px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      Resgatar
                    </button>
                  )}
                  {m.claimed && <span style={{ fontSize: '11px', color: '#34c759' }}>✓ Resgatado</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MainMenu() {
  const [player, setPlayer] = useState(null)
  const [showMissions, setShowMissions] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/player`).then(r => r.json()).then(setPlayer)
  }, [])

  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', position: 'relative', boxSizing: 'border-box' }}>
      <h1>Palworld TCG</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        <Link to="/catalog"><button style={{ width: '100%', padding: '12px' }}>📚 Catálogo</button></Link>
        <Link to="/mycollection"><button style={{ width: '100%', padding: '12px' }}>📖 Coleção</button></Link>
        <Link to="/deckbuilder"><button style={{ width: '100%', padding: '12px' }}>Montar Deck</button></Link>
        <Link to="/mydecks"><button style={{ width: '100%', padding: '12px' }}>Meus Decks</button></Link>
        <button style={{ width: '100%', padding: '12px' }} disabled>Encontrar Partida (em breve)</button>
        <Link to="/game"><button style={{ width: '100%', padding: '12px' }}>Partida contra Bot</button></Link>
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
        <Link to="/shop"><button style={{ padding: '12px 20px' }}>🛍️ Loja</button></Link>
        <Link to="/farming"><button style={{ padding: '12px 20px' }}>🌱 Farming</button></Link>
        <Link to="/breeding">
          <button style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/egg.png" alt="Breeding" style={{ width: '28px', height: '28px' }} />
            Breeding
          </button>
        </Link>
        <button onClick={() => setShowMissions(true)} style={{ padding: '12px 20px' }}>📅 Missões Diárias</button>
      </div>

      {showMissions && <MissionsPopup onClose={() => setShowMissions(false)} />}

      {player && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <div style={{ background: '#f0f0f0', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src="/gold-coin.png" alt="Gold" style={{ width: '18px', height: '18px' }} />
            <strong>{player.gold_coins}</strong>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src="/pal-fluid.png" alt="Fluido de Pal" style={{ width: '18px', height: '18px' }} />
            <strong>{player.pal_fluid}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/catalog" element={<CardGrid />} />
        <Route path="/mycollection" element={<MyCollection />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/breeding" element={<Breeding />} />
        <Route path="/farming" element={<Farming />} />
        <Route path="/deckbuilder" element={<DeckBuilder />} />
        <Route path="/mydecks" element={<DeckList />} />
        <Route path="/mydecks/:id" element={<DeckDetail />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App