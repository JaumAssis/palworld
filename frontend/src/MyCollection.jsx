import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'

const API_URL = 'http://localhost:3001'

function MyCollection() {
  const { t } = useLanguage()
  const [allCards, setAllCards] = useState([])
  const [ownedMap, setOwnedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todos')
  const [onlyOwned, setOnlyOwned] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [palFluid, setPalFluid] = useState(0)
  const [craftMsg, setCraftMsg] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  const CRAFT_COSTS = { RR: 100, R: 50, U: 30, C: 15 }

  const getCraftCost = (card) => {
    if (CRAFT_COSTS[card.rarity]) return CRAFT_COSTS[card.rarity]
    if (card.rarity === 'TD') {
      const cost = card.cost ?? 8
      if (cost >= 1 && cost <= 3) return 15
      if (cost >= 4 && cost <= 6) return 30
      if (cost === 7) return 50
      return 100
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
      owned.forEach(o => { map[o.card_number] = { quantity: o.quantity, reserved: o.reserved } })
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
        setOwnedMap(prev => ({ ...prev, [card.card_number]: { quantity: data.newQuantity, reserved: prev[card.card_number]?.reserved || 0 } }))
        setPalFluid(data.palFluid)
        setSelectedCard(prev => ({ ...prev, qty: data.newQuantity, reserved: prev.reserved || 0, owned: true }))
      })
      .catch(err => setCraftMsg(err.message))
  }

  if (loading) return <p style={{ padding: '2rem' }}>{t('collectionLoading')}</p>

  const totalUnique = allCards.length
  const ownedUnique = Object.keys(ownedMap).length

  const filtered = allCards.filter(c => {
    const matchesType = filterType === 'Todos' || c.card_type === filterType
    const matchesOwned = !onlyOwned || ownedMap[c.card_number]?.quantity > 0
    const matchesSearch = c.name.toLowerCase().includes(search.trim().toLowerCase())
    return matchesType && matchesOwned && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageCards = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeFilterType = (type) => { setFilterType(type); setPage(1) }
  const toggleOnlyOwned = (checked) => { setOnlyOwned(checked); setPage(1) }
  const changeSearch = (value) => { setSearch(value); setPage(1) }

  const TAB_COLORS = {
    Todos: '#8a5a2b',
    Pal: '#3f8f4f',
    Structure: '#6b7280',
    Gear: '#4c6ef5',
    Event: '#a855f7',
    Soul: '#e08e2c'
  }

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: '1.5rem', maxWidth: '620px', margin: '0 auto' }}>
      <Link to="/"><button style={{ marginBottom: '12px' }}>{t('backToMenu')}</button></Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        <h1 style={{
          margin: 0, lineHeight: 1.2, fontFamily: "'Rye', Georgia, serif", fontSize: '30px',
          color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
          textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
        }}>{t('collectionTitle')}</h1>
        <p style={{ color: '#d9c4a3', margin: 0, fontSize: '13px', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('uniqueCardsCollected', { owned: ownedUnique, total: totalUnique })}</p>
      </div>

      {/* ---------- BUSCA + "SÓ AS QUE EU TENHO" ---------- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fdf6e3', border: '2px solid #d4a76a', borderRadius: '8px',
          padding: '6px 10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)'
        }}>
          <span style={{ fontSize: '13px' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => changeSearch(e.target.value)}
            placeholder={t('searchByName')}
            style={{
              border: 'none', background: 'transparent', outline: 'none', fontSize: '13px',
              width: '100%', color: '#5c3418'
            }}
          />
        </div>
        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
          <input type="checkbox" checked={onlyOwned} onChange={e => toggleOnlyOwned(e.target.checked)} />
          {t('onlyOwnedCheckbox')}
        </label>
      </div>

      {/* ---------- LIVRO-ÁLBUM ---------- */}
      <div style={{
        position: 'relative',
        backgroundImage: 'url(/tabua.png)', backgroundSize: 'cover', backgroundPosition: 'center',
        borderRadius: '16px', padding: '16px 34px 16px 16px',
        boxShadow: 'inset 0 0 0 2px #c99a4e, inset 0 0 0 5px #2b160a, 0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {/* argolas de encadernação, estilo álbum de figurinhas */}
        <div style={{
          position: 'absolute', left: '4px', top: '16px', bottom: '16px', width: '10px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', zIndex: 1
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#2b160a',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.15)'
            }} />
          ))}
        </div>

        {/* marcadores de página (abas de índice) */}
        <div style={{
          position: 'absolute', right: '-22px', top: '16px', bottom: '16px', width: '60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', zIndex: 2
        }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => {
            const active = filterType === type
            return (
              <div key={type} onClick={() => changeFilterType(type)}
                   style={{
                     cursor: 'pointer', userSelect: 'none',
                     width: active ? '58px' : '48px',
                     padding: '5px 4px', textAlign: 'center', borderRadius: '0 8px 8px 0',
                     background: TAB_COLORS[type], color: '#fff3d6',
                     fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px',
                     boxShadow: active ? '2px 3px 6px rgba(0,0,0,0.5)' : '2px 2px 4px rgba(0,0,0,0.4)',
                     filter: active ? 'brightness(1.2)' : 'brightness(0.85)',
                     border: '1px solid rgba(0,0,0,0.35)', borderLeft: 'none',
                     transition: 'all 0.15s ease'
                   }}>
                {type === 'Todos' ? t('filterAll') : type}
              </div>
            )
          })}
        </div>

        {/* página de papel com as cartas */}
        <div style={{
          background: '#fdf6e3', borderRadius: '10px', padding: '14px 16px', marginLeft: '14px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            minHeight: '260px'
          }}>
            {pageCards.map(card => {
              const entry = ownedMap[card.card_number]
              const qty = entry?.quantity || 0
              const reserved = Math.min(entry?.reserved || 0, qty)
              const owned = qty > 0
              return (
                <div key={card.card_number}
                     onClick={() => setSelectedCard({ card, qty, reserved, owned })}
                     style={{
                  textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '5px',
                  background: owned ? '#fff' : '#f4f4f4', position: 'relative', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img src={card.image_url} alt={card.name}
                         style={{
                           width: '100%', borderRadius: '5px',
                           filter: owned ? 'none' : 'grayscale(100%)',
                           opacity: owned ? 1 : 0.35
                         }}
                         onError={e => e.target.style.display = 'none'} />
                    {owned && (
                      <span style={{
                        position: 'absolute', bottom: '3px', right: '3px',
                        background: qty >= 4 ? '#2e7d32' : 'rgba(0,0,0,0.75)', color: '#fff',
                        fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '5px'
                      }}>x{Math.min(qty, 4)}</span>
                    )}
                    {reserved > 0 && (
                      <span title={t('reservedTitle')} style={{
                        position: 'absolute', bottom: '3px', left: '3px',
                        background: 'rgba(120,60,10,0.85)', color: '#fff',
                        fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '5px'
                      }}>🔒{reserved}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '10px', margin: '3px 0 0', color: owned ? '#000' : '#999' }}>{card.name}</p>
                </div>
              )
            })}
            {/* preenche slots vazios na última página, mantendo o layout 3x3 */}
            {Array.from({ length: PAGE_SIZE - pageCards.length }).map((_, i) => (
              <div key={'empty' + i} style={{ border: '1px dashed #e0d0b0', borderRadius: '8px', minHeight: '100px' }} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{t('prevPage')}</button>
            <span style={{ fontSize: '12px', color: '#777' }}>{t('pageOf', { current: currentPage, total: totalPages })}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{t('nextPage')}</button>
          </div>
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
              {selectedCard.owned ? t('ownedCopies', { qty: Math.min(selectedCard.qty, 4) }) : t('notOwnedYet')}
            </p>
            {selectedCard.owned && selectedCard.reserved > 0 && (
              <p style={{ color: '#8a5a2b', fontSize: '12px', margin: '0 0 8px' }}>
                {t('reservedCopiesMsg', { reserved: selectedCard.reserved })}
              </p>
            )}

            {(() => {
              const cost = getCraftCost(selectedCard.card)
              const atMax = (selectedCard.qty || 0) >= 4
              const canAfford = palFluid >= (cost || 0)
              const disabled = !cost || atMax || !canAfford

              return (
                <>
                  <p style={{ fontSize: '12px', color: '#555', margin: '0 0 12px' }}>
                    {t('yourPalFluid')} <strong>{palFluid}</strong>
                    {cost && t('costSuffix', { cost })}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleCraft(selectedCard.card)}
                      disabled={disabled}
                      style={{ padding: '10px 20px', fontWeight: 600, opacity: disabled ? 0.5 : 1 }}>
                      {t('craftBtn', { cost })}
                    </button>
                    <button onClick={() => { setSelectedCard(null); setCraftMsg('') }} style={{ padding: '10px 20px' }}>{t('close')}</button>
                  </div>
                  {!cost && <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>{t('cannotCraftRarity')}</p>}
                  {atMax && cost && <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>{t('alreadyMaxCopies')}</p>}
                  {craftMsg && <p style={{ fontSize: '12px', color: 'red', marginTop: '8px' }}>{craftMsg}</p>}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default MyCollection