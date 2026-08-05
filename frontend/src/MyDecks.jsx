import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

const COLOR_STYLES = {
  Red: { bg: '#fde2e1', text: '#c62828' },
  Blue: { bg: '#e1ecfd', text: '#1565c0' },
  Green: { bg: '#e3f5e1', text: '#2e7d32' },
  Purple: { bg: '#ede1fd', text: '#6a1b9a' },
  Colorless: { bg: '#eee', text: '#555' }
}

function ColorChip({ color }) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.Colorless
  return (
    <span style={{
      background: style.bg, color: style.text,
      fontSize: '11px', fontWeight: 600, padding: '3px 10px',
      borderRadius: '999px'
    }}>{color}</span>
  )
}

// ---------- Lista de decks ----------
function DeckList() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_URL}/api/decks`)
      .then(res => res.json())
      .then(data => { setDecks(data); setLoading(false) })
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>Carregando decks...</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/"><button style={{ marginBottom: '20px' }}>← Voltar ao Menu</button></Link>
      <h1 style={{ marginBottom: '20px' }}>Meus Decks</h1>

      {decks.length === 0 && (
        <p style={{ color: '#777' }}>Você ainda não salvou nenhum deck. Vá em "Montar Deck" pra criar o primeiro!</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {decks.map(deck => {
          const gradient = deck.colors.length === 2
            ? `linear-gradient(135deg, ${COLOR_STYLES[deck.colors[0]]?.bg || '#ddd'}, ${COLOR_STYLES[deck.colors[1]]?.bg || '#ddd'})`
            : `linear-gradient(135deg, ${COLOR_STYLES[deck.colors[0]]?.bg || '#ddd'}, #fff)`

          const [palA, palB] = deck.luckyPals || []

          return (
            <div
              key={deck.id}
              onClick={() => navigate(`/mydecks/${deck.id}`)}
              style={{
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: '#fff'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ height: '110px', position: 'relative', background: gradient, overflow: 'hidden' }}>
                {palA && (
                  <img src={palA.image_url} alt={palA.name}
                       style={{
                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                         objectFit: 'cover', objectPosition: 'top',
                         clipPath: palB ? 'polygon(0 0, 60% 0, 40% 100%, 0 100%)' : 'none'
                       }} />
                )}
                {palB && (
                  <img src={palB.image_url} alt={palB.name}
                       style={{
                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                         objectFit: 'cover', objectPosition: 'top',
                         clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                       }} />
                )}
                {palA && palB && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    clipPath: 'polygon(58% 0, 62% 0, 42% 100%, 38% 100%)',
                    background: 'rgba(255,255,255,0.6)'
                  }} />
                )}
                {palA && palB && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.35))'
                  }} />
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '10px', display: 'flex', gap: '6px' }}>
                  {deck.colors.map(c => <ColorChip key={c} color={c} />)}
                </div>
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{deck.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  Criado em {new Date(deck.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Detalhe de 1 deck ----------
function DeckDetail() {
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/decks/${id}`)
      .then(res => res.json())
      .then(data => { setDeck(data); setLoading(false) })
  }, [id])

  if (loading) return <p style={{ padding: '2rem' }}>Carregando deck...</p>
  if (!deck) return <p style={{ padding: '2rem' }}>Deck não encontrado.</p>

  // agrupa por nome pra mostrar x4 etc
  const groupCards = (cards) => Object.values(
    cards.reduce((acc, c) => {
      if (!acc[c.name]) acc[c.name] = { card: c, count: 0 }
      acc[c.name].count++
      return acc
    }, {})
  )

  const mainGrouped = groupCards(deck.mainDeck)
  const soulGrouped = groupCards(deck.soulDeck)

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link to="/mydecks"><button style={{ marginBottom: '16px' }}>← Voltar aos Decks</button></Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>{deck.name}</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {deck.colors.map(c => <ColorChip key={c} color={c} />)}
        </div>
      </div>

      <h3 style={{ marginBottom: '10px' }}>Main Deck ({deck.mainDeck.length} cartas)</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '30px'
      }}>
        {mainGrouped.map(({ card, count }) => (
          <div key={card.card_number} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                   onError={e => e.target.style.display = 'none'} />
              <span style={{
                position: 'absolute', bottom: '4px', right: '4px',
                background: 'rgba(0,0,0,0.75)', color: '#fff',
                fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
              }}>x{count}</span>
            </div>
            <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{card.name}</p>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '10px' }}>Soul Deck ({deck.soulDeck.length} cartas)</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {soulGrouped.map(({ card, count }) => (
          <div key={card.card_number} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                   onError={e => e.target.style.display = 'none'} />
              <span style={{
                position: 'absolute', bottom: '4px', right: '4px',
                background: 'rgba(0,0,0,0.75)', color: '#fff',
                fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
              }}>x{count}</span>
            </div>
            <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { DeckList, DeckDetail }