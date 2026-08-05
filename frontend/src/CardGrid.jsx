import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

function CardGrid() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/cards`)
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

  if (loading) return <p>Carregando cartas...</p>

  const filtered = cards.filter(card => {
    const matchesType = filterType === 'Todos' || card.card_type === filterType
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div style={{ padding: '1rem', width: '100%', textAlign: 'left' }}>
      <Link to="/"><button style={{ marginBottom: '12px' }}>← Voltar ao Menu</button></Link>
      <h2>Coleção ({filtered.length} / {cards.length})</h2>

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
            {type}
          </button>
        ))}
        <input
          type="text"
          placeholder="Buscar carta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '6px' }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {filtered.map(card => (
          <div key={card.card_number} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
            background: '#fafafa'
          }}>
            <img
              src={card.image_url}
              alt={card.name}
              style={{ width: '100%', borderRadius: '4px', marginBottom: '6px' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>{card.name}</p>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
              {card.card_type} {card.cost !== null ? `- Custo ${card.cost}` : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CardGrid