import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3001'

function MyCollection() {
  const [allCards, setAllCards] = useState([])
  const [ownedMap, setOwnedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todos')
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [palFluid, setPalFluid] = useState(0)
  const [craftMsg, setCraftMsg] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  const CRAFT_COSTS = { RR: 50, R: 30, U: 20, C: 10 }

  const getCraftCost = (card) => {
    if (CRAFT_COSTS[card.rarity]) return CRAFT_COSTS[card.rarity]
    if (card.rarity === 'TD') {
      const cost = card.cost ?? 8
      if (cost >= 1 && cost <= 3) return 10
      if (cost >= 4 && cost <= 6) return 20
      if (cost === 7) return 30
      return 50
    }
    return null
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/cards`).then(r => r.json()),
      fetch(`${API_URL}/api/player/cards`).then(r => r.json()),
      fetch(`${API_URL}/api/player`).then(r => r.json())
    ]).then(([cards, owned, player]) => {
      setAllCards(cards)
      const map = {}
      owned.forEach(o => { map[o.card_number] = o.quantity })
      setOwnedMap(map)
      setPalFluid(player.pal_fluid)
      setLoading(false)
    })
  }, [])

  const handleCraft = (card) => {
    setCraftMsg('')
    fetch(`${API_URL}/api/collection/craft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumber: card.card_number })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setOwnedMap(prev => ({ ...prev, [card.card_number]: data.newQuantity }))
        setPalFluid(data.palFluid)
        setSelectedCard(prev => ({ ...prev, qty: data.newQuantity, owned: true }))
      })
      .catch(err => setCraftMsg(err.message))
  }

  if (loading) return <p style={{ padding: '2rem' }}>Carregando álbum...</p>

  const totalUnique = allCards.length
  const ownedUnique = Object.keys(ownedMap).length

  const filtered = allCards.filter(c => {
    const matchesType = filterType === 'Todos' || c.card_type === filterType
    const matchesOwned = !onlyOwned || ownedMap[c.card_number] > 0
    return matchesType && matchesOwned
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageCards = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeFilterType = (type) => { setFilterType(type); setPage(1) }
  const toggleOnlyOwned = (checked) => { setOnlyOwned(checked); setPage(1) }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/"><button style={{ marginBottom: '12px' }}>← Voltar ao Menu</button></Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, lineHeight: 1.2 }}>📖 Coleção</h1>
        <p style={{ color: '#777', margin: 0 }}>{ownedUnique} / {totalUnique} cartas únicas coletadas</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => (
          <button key={type} onClick={() => changeFilterType(type)}
                  style={{ fontWeight: filterType === type ? 'bold' : 'normal' }}>{type}</button>
        ))}
        <label style={{ fontSize: '13px', marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input type="checkbox" checked={onlyOwned} onChange={e => toggleOnlyOwned(e.target.checked)} />
          Só as que eu tenho
        </label>
      </div>

      {/* ---------- PÁGINA DO ÁLBUM (3x3, estilo figurinha) ---------- */}
      <div style={{
        background: '#fdf6e3', border: '10px solid #d4a76a', borderRadius: '14px',
        padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          minHeight: '360px'
        }}>
          {pageCards.map(card => {
            const qty = ownedMap[card.card_number] || 0
            const owned = qty > 0
            return (
              <div key={card.card_number}
                   onClick={() => setSelectedCard({ card, qty, owned })}
                   style={{
                textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px', padding: '8px',
                background: owned ? '#fff' : '#f4f4f4', position: 'relative', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ position: 'relative' }}>
                  <img src={card.image_url} alt={card.name}
                       style={{
                         width: '100%', borderRadius: '6px',
                         filter: owned ? 'none' : 'grayscale(100%)',
                         opacity: owned ? 1 : 0.35
                       }}
                       onError={e => e.target.style.display = 'none'} />
                  {owned && (
                    <span style={{
                      position: 'absolute', bottom: '4px', right: '4px',
                      background: qty >= 4 ? '#2e7d32' : 'rgba(0,0,0,0.75)', color: '#fff',
                      fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px'
                    }}>x{Math.min(qty, 4)}</span>
                  )}
                </div>
                <p style={{ fontSize: '11px', margin: '4px 0 0', color: owned ? '#000' : '#999' }}>{card.name}</p>
              </div>
            )
          })}
          {/* preenche slots vazios na última página, mantendo o layout 3x3 */}
          {Array.from({ length: PAGE_SIZE - pageCards.length }).map((_, i) => (
            <div key={'empty' + i} style={{ border: '1px dashed #e0d0b0', borderRadius: '10px', minHeight: '140px' }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Anterior</button>
          <span style={{ fontSize: '13px', color: '#777' }}>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima →</button>
        </div>
      </div>

      {selectedCard && (
        <div onClick={() => setSelectedCard(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'center', maxWidth: '320px'
          }}>
            <img src={selectedCard.card.image_url} alt={selectedCard.card.name}
                 style={{
                   width: '260px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                   filter: selectedCard.owned ? 'none' : 'grayscale(100%)',
                   opacity: selectedCard.owned ? 1 : 0.5
                 }} />
            <h3 style={{ margin: '12px 0 4px' }}>{selectedCard.card.name}</h3>
            <p style={{ color: '#777', fontSize: '13px', margin: '0 0 8px' }}>
              {selectedCard.owned ? `Você tem ${Math.min(selectedCard.qty, 4)}/4 cópias` : 'Você ainda não tem essa carta'}
            </p>

            {(() => {
              const cost = getCraftCost(selectedCard.card)
              const atMax = (selectedCard.qty || 0) >= 4
              const canAfford = palFluid >= (cost || 0)
              const disabled = !cost || atMax || !canAfford

              return (
                <>
                  <p style={{ fontSize: '12px', color: '#555', margin: '0 0 12px' }}>
                    💧 Seu Fluido de Pal: <strong>{palFluid}</strong>
                    {cost && ` — Custo: ${cost}`}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleCraft(selectedCard.card)}
                      disabled={disabled}
                      style={{ padding: '10px 20px', fontWeight: 600, opacity: disabled ? 0.5 : 1 }}>
                      🛠️ Craftar{cost ? ` (${cost})` : ''}
                    </button>
                    <button onClick={() => { setSelectedCard(null); setCraftMsg('') }} style={{ padding: '10px 20px' }}>Fechar</button>
                  </div>
                  {!cost && <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>Essa raridade não pode ser craftada.</p>}
                  {atMax && cost && <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>Já está no máximo de 4 cópias.</p>}
                  {craftMsg && <p style={{ fontSize: '12px', color: 'red', marginTop: '8px' }}>{craftMsg}</p>}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCollection