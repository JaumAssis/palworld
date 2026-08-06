import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'

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
  const { t, lang } = useLanguage()
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_URL}/api/decks`)
      .then(res => res.json())
      .then(data => { setDecks(data); setLoading(false) })
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>{t('decksLoading')}</p>

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/"><button style={{ marginBottom: '20px' }}>{t('backToMenu')}</button></Link>
      <h1 style={{
        marginBottom: '20px', fontFamily: "'Rye', Georgia, serif", fontSize: '30px',
        color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
        textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
      }}>{t('myDecksTitle')}</h1>

      {decks.length === 0 && (
        <p style={{ color: '#d9c4a3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('noDecksSaved')}</p>
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
                border: '3px solid #c99a4e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: '#fff'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35)'
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
                <span style={{
                  position: 'absolute', top: '8px', right: '8px', fontSize: '10px', fontWeight: 700,
                  padding: '3px 8px', borderRadius: '999px', color: '#fff',
                  background: deck.mode === 'rank' ? '#a5541b' : '#3f6b3f'
                }}>{deck.mode === 'rank' ? '🏆 Rank' : '🎲 Normal'}</span>
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{deck.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  {t('createdAt', { date: new Date(deck.created_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US') })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}

// ---------- Detalhe de 1 deck ----------
function DeckDetail() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [zoomCard, setZoomCard] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/decks/${id}`)
      .then(res => res.json())
      .then(data => { setDeck(data); setLoading(false) })
  }, [id])

  if (loading) return <p style={{ padding: '2rem' }}>{t('deckLoading')}</p>
  if (!deck) return <p style={{ padding: '2rem' }}>{t('deckNotFound')}</p>

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

  const CardTile = ({ card, count }) => (
    <div key={card.card_number} style={{ textAlign: 'center' }}>
      <div
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={() => setZoomCard(card)}
      >
        <img src={card.image_url} alt={card.name}
             style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', border: '2px solid #c99a4e' }}
             onError={e => e.target.style.display = 'none'} />
        <span style={{
          position: 'absolute', bottom: '4px', right: '4px',
          background: 'rgba(0,0,0,0.75)', color: '#fff',
          fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px'
        }}>x{count}</span>
      </div>
      <p style={{ fontSize: '11px', margin: '4px 0 0', color: '#d9c4a3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{card.name}</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link to="/mydecks"><button style={{ marginBottom: '16px' }}>{t('backToDecks')}</button></Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h1 style={{
          margin: 0, fontFamily: "'Rye', Georgia, serif", fontSize: '28px',
          color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
          textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
        }}>{deck.name}</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {deck.colors.map(c => <ColorChip key={c} color={c} />)}
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', color: '#fff',
          background: deck.mode === 'rank' ? '#a5541b' : '#3f6b3f'
        }}>{deck.mode === 'rank' ? '🏆 Rank' : '🎲 Normal'}</span>
      </div>

      <h3 style={{ marginBottom: '10px', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('mainDeckCount', { n: deck.mainDeck.length })}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '30px'
      }}>
        {mainGrouped.map(({ card, count }) => (
          <CardTile key={card.card_number} card={card} count={count} />
        ))}
      </div>

      <h3 style={{ marginBottom: '10px', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('soulDeckCount', { n: deck.soulDeck.length })}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {soulGrouped.map(({ card, count }) => (
          <CardTile key={card.card_number} card={card} count={count} />
        ))}
      </div>
    </div>

      {zoomCard && (
        <div onClick={() => setZoomCard(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'zoom-out'
        }}>
          <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <img src={zoomCard.image_url} alt={zoomCard.name}
                 style={{
                   maxWidth: '90vw', maxHeight: '80vh', borderRadius: '14px',
                   border: '4px solid #c99a4e', boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
                 }} />
            <p style={{
              marginTop: '12px', color: '#f3e2b3', fontSize: '16px',
              textShadow: '2px 2px 0 #000'
            }}>{zoomCard.name}</p>
            <button onClick={() => setZoomCard(null)} style={{ marginTop: '8px', padding: '8px 18px' }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DeckList, DeckDetail }