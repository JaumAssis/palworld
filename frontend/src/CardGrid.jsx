import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

function CardGrid() {
  const { t } = useLanguage()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)

  useEffect(() => {
    apiFetch('/api/cards')
      .then(res => res.json())
      .then(data => {
        setCards(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao buscar cartas:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>{t('cardGridLoading')}</p>

  const filtered = cards.filter(card => {
    const matchesType = filterType === 'Todos' || card.card_type === filterType
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div style={{
      minHeight: '100vh', width: '100%', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10',
      padding: '1rem', textAlign: 'left', overflowX: 'hidden'
    }}>
      <Link to="/"><button style={{ marginBottom: '12px' }}>{t('backToMenu')}</button></Link>
      <h2 style={{
        fontFamily: "'Rye', Georgia, serif", color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
        textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
      }}>{t('cardGridTitle', { filtered: filtered.length, total: cards.length })}</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['Todos', 'Pal', 'Structure', 'Gear', 'Event'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 12px',
              fontWeight: filterType === type ? 'bold' : 'normal',
              background: filterType === type ? '#333' : '#eee',
              color: filterType === type ? '#fff' : '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {type === 'Todos' ? t('filterAll') : type}
          </button>
        ))}
        <input
          type="text"
          placeholder={t('searchCard')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '6px' }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {filtered.map(card => (
          <div
            key={card.card_number}
            onClick={() => setSelectedCard(card)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px',
              textAlign: 'center',
              background: '#fafafa',
              cursor: 'pointer',
              boxSizing: 'border-box',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <img
              src={card.image_url}
              alt={card.name}
              style={{ width: '100%', borderRadius: '4px', marginBottom: '6px' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>{card.name}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
              {card.card_type} {card.cost !== null ? t('costLabel', { cost: card.cost }) : ''}
            </p>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div onClick={() => setSelectedCard(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'center',
            maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box'
          }}>
            <img
              src={selectedCard.image_url}
              alt={selectedCard.name}
              style={{ height: 'min(75vh, 800px)', maxWidth: '100%', width: 'auto', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <h3 style={{ margin: '12px 0 4px' }}>{selectedCard.name}</h3>
            <p style={{ color: '#777', fontSize: '13px', margin: '0 0 12px' }}>
              {selectedCard.card_type} {selectedCard.cost !== null ? t('costLabel', { cost: selectedCard.cost }) : ''}
            </p>
            <button onClick={() => setSelectedCard(null)} style={{ padding: '10px 20px' }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardGrid