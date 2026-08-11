import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'
import { cardMatchesSearch } from './cardSearch'

// Mantém o tamanho compacto que os filtros já tinham antes de virarem sign-button.
const FILTER_BTN_STYLE = { padding: '6px 12px', fontSize: '13px' }
const ACTIVE_FILTER_STYLE = { outline: '2px solid #ffcf7a', outlineOffset: '2px' }

const COLOR_SWATCH = {
  Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a', Colorless: '#888'
}

// Alterna um valor dentro de um Set (multi-seleção dos subfiltros de custo/cor) sem mutar o original.
function toggleInSet(set, value) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function CardGrid() {
  const { t } = useLanguage()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todos')
  // Subfiltros de custo/cor só aparecem com um tipo específico selecionado (não em "Todos") — ver
  // changeType, que os reseta ao trocar de tipo (um custo que existe em Pal pode não existir em Gear).
  const [selectedCosts, setSelectedCosts] = useState(new Set())
  const [selectedColors, setSelectedColors] = useState(new Set())
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

  const changeType = (type) => {
    setFilterType(type)
    setSelectedCosts(new Set())
    setSelectedColors(new Set())
  }

  const cardsOfType = filterType === 'Todos' ? cards : cards.filter(c => c.card_type === filterType)
  const availableCosts = [...new Set(cardsOfType.map(c => c.cost).filter(c => c !== null && c !== undefined))].sort((a, b) => a - b)

  const filtered = cards.filter(card => {
    const matchesType = filterType === 'Todos' || card.card_type === filterType
    const matchesCost = selectedCosts.size === 0 || selectedCosts.has(card.cost)
    const matchesColor = selectedColors.size === 0 || (card.colors || []).some(c => selectedColors.has(c))
    const matchesSearch = cardMatchesSearch(card, search)
    return matchesType && matchesCost && matchesColor && matchesSearch
  })

  return (
    <div style={{
      minHeight: '100vh', width: '100%', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10',
      padding: '1rem', textAlign: 'left', overflowX: 'hidden'
    }}>
      {/* Linha 1: voltar ao menu + busca */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
        <Link to="/"><button className="sign-button">{t('backToMenu')}</button></Link>
        <input
          type="text"
          placeholder={t('searchCard')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '6px' }}
        />
      </div>

      {/* Linha 2: contador + filtros de tipo (sem cor aqui — ela virou subfiltro condicional abaixo) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <h2 style={{
          margin: 0, fontFamily: "'Rye', Georgia, serif", color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
          textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
        }}>{t('cardGridTitle', { filtered: filtered.length, total: cards.length })}</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event'].map(type => (
            <button
              key={type}
              className="sign-button"
              onClick={() => changeType(type)}
              style={{ ...FILTER_BTN_STYLE, ...(filterType === type ? ACTIVE_FILTER_STYLE : {}) }}
            >
              {type === 'Todos' ? t('filterAll') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Linha 3, condicional: subfiltros de Custo e Cor — só com um tipo específico selecionado.
          Multi-seleção dentro de cada grupo (ex: custo 3 e 5 juntos); os dois grupos se combinam
          em E (custo 7 + vermelho = só Pals de custo 7 vermelhos). */}
      {filterType !== 'Todos' && (
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          {availableCosts.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#d9c4a3', fontSize: '12px' }}>{t('costFilterLabel')}</span>
              {availableCosts.map(cost => (
                <button
                  key={cost}
                  className="sign-button"
                  onClick={() => setSelectedCosts(prev => toggleInSet(prev, cost))}
                  style={{ ...FILTER_BTN_STYLE, ...(selectedCosts.has(cost) ? ACTIVE_FILTER_STYLE : {}) }}
                >
                  {cost}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#d9c4a3', fontSize: '12px' }}>{t('colorFilterLabel')}</span>
            {['Red', 'Blue', 'Green', 'Purple', 'Colorless'].map(color => (
              <button
                key={color}
                className="sign-button"
                onClick={() => setSelectedColors(prev => toggleInSet(prev, color))}
                style={{ ...FILTER_BTN_STYLE, ...(selectedColors.has(color) ? ACTIVE_FILTER_STYLE : {}), display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLOR_SWATCH[color], display: 'inline-block' }} />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

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