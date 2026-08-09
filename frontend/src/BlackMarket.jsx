import { useEffect, useState } from 'react'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

// Só as raridades que não são craftáveis (ver CRAFT_COSTS no backend/MyCollection) podem ir
// pro mercado — mesma regra aplicada no servidor em /api/market/listings.
const MARKET_ALLOWED_RARITIES = ['OSR', 'SP', 'SSP', 'TSP']

function BlackMarket({ onExit }) {
  const { t } = useLanguage()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [allCards, setAllCards] = useState([])
  const [ownedMap, setOwnedMap] = useState({})
  const [showNewListing, setShowNewListing] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [priceGold, setPriceGold] = useState('')
  const [priceFluid, setPriceFluid] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [listingToDelete, setListingToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [player, setPlayer] = useState(null)
  const [buyingId, setBuyingId] = useState(null)
  const [buyError, setBuyError] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [zoomCard, setZoomCard] = useState(null)

  const loadListings = () => {
    apiFetch('/api/market/listings').then(r => r.json()).then(setListings)
  }

  const loadOwnedCards = () => {
    apiFetch('/api/player/cards').then(r => r.json()).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.card_number] = { quantity: r.quantity, reserved: r.reserved } })
      setOwnedMap(map)
    })
  }

  useEffect(() => {
    loadListings()
    loadOwnedCards()
    apiFetch('/api/cards').then(r => r.json()).then(setAllCards)
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
  }, [])

  const eligibleCards = allCards.filter(c => {
    if (!MARKET_ALLOWED_RARITIES.includes(c.rarity)) return false
    const owned = ownedMap[c.card_number]
    return owned && (owned.quantity - owned.reserved) > 0
  })

  const openNewListing = () => {
    setSelectedCard(null)
    setPriceGold('')
    setPriceFluid('')
    setFormError('')
    setShowNewListing(true)
  }

  const submitListing = () => {
    const goldNum = priceGold ? parseInt(priceGold, 10) : 0
    const fluidNum = priceFluid ? parseInt(priceFluid, 10) : 0
    const validPrice = (n) => Number.isInteger(n) && n >= 0
    if (!validPrice(goldNum) || !validPrice(fluidNum) || (goldNum <= 0 && fluidNum <= 0)) {
      setFormError(t('blackMarketInvalidPrice'))
      return
    }

    setSubmitting(true)
    setFormError('')
    apiFetch('/api/market/listings', {
      method: 'POST',
      body: JSON.stringify({ cardNumber: selectedCard.card_number, priceGold: goldNum, priceFluid: fluidNum })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('blackMarketListError'))
        setShowNewListing(false)
        setSubmitting(false)
        loadListings()
        loadOwnedCards()
      })
      .catch(err => {
        setFormError(err.message)
        setSubmitting(false)
      })
  }

  const confirmDeleteListing = () => {
    apiFetch(`/api/market/listings/${listingToDelete.id}`, { method: 'DELETE' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('blackMarketDeleteError'))
        setListingToDelete(null)
        loadListings()
        loadOwnedCards()
      })
      .catch(err => setDeleteError(err.message))
  }

  const buyListing = (listing) => {
    setBuyError('')
    setBuyingId(listing.id)
    apiFetch(`/api/market/listings/${listing.id}/buy`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('blackMarketBuyError'))
        setPlayer(p => ({ ...p, gold_coins: data.goldCoins, pal_fluid: data.palFluid }))
        setBuyingId(null)
        loadListings()
        loadOwnedCards()
      })
      .catch(err => {
        setBuyError(err.message)
        setBuyingId(null)
      })
  }

  // Mesma trava do craft/booster: não deixa comprar sem recurso suficiente ou já no máximo de 4 cópias.
  const canBuy = (listing) => {
    if (!player) return false
    const owned = ownedMap[listing.card.card_number]
    if ((owned?.quantity || 0) >= 4) return false
    return player.gold_coins >= listing.priceGold && player.pal_fluid >= listing.priceFluid
  }

  const filteredListings = listings
    .filter(l => !onlyMine || l.isMine)
    .filter(l => l.card.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box', backgroundImage: 'url(/lamp.png)', backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '17px', color: '#f3e2b3', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {t('blackMarketTitle')}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {player && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffcf7a', fontSize: '12px', fontWeight: 700 }}>
                {player.gold_coins} <img src="/gold-coin.png" alt="" style={{ width: '14px' }} />
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7ad0ff', fontSize: '12px', fontWeight: 700 }}>
                {player.pal_fluid} <img src="/pal-fluid.png" alt="" style={{ width: '14px' }} />
              </span>
            </>
          )}
          <button onClick={onExit} style={{ fontSize: '13px', color: '#ffcf7a', background: 'none', border: 'none', cursor: 'pointer' }}>
            {t('exit')}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px 10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <img src="/comerciante_ilegal.png" alt={t('blackMarketNpcAlt')}
             style={{ width: '78px', height: '78px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #c99a4e', flexShrink: 0 }} />
        <div className="market-dark-box" style={{ flex: 1, padding: '10px 12px', color: '#f3e2b3', fontSize: '12px', lineHeight: 1.4 }}>
          {t('blackMarketGreeting')}
        </div>
      </div>

      <div style={{ padding: '0 16px 10px', display: 'flex', gap: '8px' }}>
        <button onClick={openNewListing} className="market-dark-box" style={{
          color: '#ffcf7a', border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
        }}>
          {t('blackMarketNewListing')}
        </button>
        <button
          onClick={() => setOnlyMine(v => !v)}
          className="market-dark-box"
          style={{
            color: onlyMine ? '#1a1410' : '#ffcf7a', background: onlyMine ? '#ffcf7a' : undefined,
            border: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>
          {t('blackMarketMyItemsFilter')}
        </button>
      </div>

      <div style={{ padding: '0 16px 10px' }}>
        <input
          type="text"
          placeholder={t('searchCard')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="market-dark-box"
          style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', color: '#f3e2b3', border: 'none', fontSize: '13px' }}
        />
      </div>

      {buyError && (
        <p style={{ color: '#ff8a8a', fontSize: '12px', textAlign: 'center', margin: '0 16px 8px' }}>{buyError}</p>
      )}

      <div className="market-dark-box" style={{ flex: 1, margin: '0 16px 16px', padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredListings.length === 0 && (
          <p style={{ color: '#d9c4a3', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>{t('blackMarketEmpty')}</p>
        )}
        {filteredListings.map(l => (
          <div key={l.id} style={{
            display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid #c99a4e', borderRadius: '10px', padding: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={l.card.image_url} alt={l.card.name}
                   style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                   onError={e => { e.target.style.display = 'none' }} />
              <div style={{ flex: 1, color: '#f3e2b3' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>{l.card.name}</p>
                <button
                  onClick={() => setZoomCard(l.card)}
                  title={t('blackMarketViewCard')}
                  style={{
                    marginTop: '2px', padding: '1px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                    background: 'rgba(201,154,78,0.25)', border: '1px solid #c99a4e', color: '#d9c4a3', cursor: 'pointer'
                  }}>
                  {l.card.rarity}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                {l.priceGold > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffcf7a', fontWeight: 700, fontSize: '12px' }}>
                    {l.priceGold} <img src="/gold-coin.png" alt="" style={{ width: '13px' }} />
                  </span>
                )}
                {l.priceFluid > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7ad0ff', fontWeight: 700, fontSize: '12px' }}>
                    {l.priceFluid} <img src="/pal-fluid.png" alt="" style={{ width: '13px' }} />
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {l.isMine ? (
                <span
                  onClick={() => { setDeleteError(''); setListingToDelete(l) }}
                  title={t('blackMarketDeleteConfirm', { name: l.card.name })}
                  style={{ cursor: 'pointer', fontSize: '15px' }}
                >🗑️</span>
              ) : (
                <button
                  onClick={() => buyListing(l)}
                  disabled={!canBuy(l) || buyingId === l.id}
                  style={{
                    padding: '5px 12px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700,
                    background: '#34c759', color: '#fff', cursor: (!canBuy(l) || buyingId === l.id) ? 'default' : 'pointer',
                    opacity: (!canBuy(l) || buyingId === l.id) ? 0.5 : 1
                  }}>
                  {buyingId === l.id ? t('blackMarketBuying') : t('blackMarketBuyButton')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewListing && (
        <div onClick={() => !submitting && setShowNewListing(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '85%', maxHeight: '80%', background: '#1a1410', border: '2px solid #c99a4e', borderRadius: '14px',
            padding: '16px', overflowY: 'auto', color: '#f3e2b3', boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px' }}>{t('blackMarketChooseCardTitle')}</h3>

            {eligibleCards.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#d9c4a3' }}>{t('blackMarketNoEligibleCards')}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                {eligibleCards.map(c => (
                  <div key={c.card_number} onClick={() => setSelectedCard(c)}
                       onMouseEnter={() => setHoveredCard(c)}
                       onMouseLeave={() => setHoveredCard(null)}
                       style={{
                         cursor: 'pointer', textAlign: 'center', borderRadius: '8px', padding: '4px',
                         border: selectedCard?.card_number === c.card_number ? '2px solid #ffcf7a' : '2px solid transparent'
                       }}>
                    <img src={c.image_url} alt={c.name} style={{ width: '100%', borderRadius: '4px' }}
                         onError={e => { e.target.style.display = 'none' }} />
                    <p style={{ fontSize: '9px', margin: '4px 0 0' }}>{c.name}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedCard && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px' }}>{t('blackMarketPriceGoldLabel')}</label>
                <input
                  type="number" min="0" value={priceGold}
                  onChange={e => setPriceGold(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px' }}
                />
                <label style={{ fontSize: '12px' }}>{t('blackMarketPriceFluidLabel')}</label>
                <input
                  type="number" min="0" value={priceFluid}
                  onChange={e => setPriceFluid(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: 'none', fontSize: '13px' }}
                />
                <button onClick={submitListing} disabled={submitting} style={{
                  padding: '10px', borderRadius: '8px', border: 'none', background: '#a5541b', color: '#fff3d6',
                  fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1
                }}>
                  {submitting ? t('blackMarketListing') : t('blackMarketListButton')}
                </button>
              </div>
            )}

            {formError && <p style={{ color: '#ff8a8a', fontSize: '12px', marginTop: '8px' }}>{formError}</p>}
          </div>

          {hoveredCard && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 1000, pointerEvents: 'none', textAlign: 'center'
            }}>
              <img src={hoveredCard.image_url} alt={hoveredCard.name}
                   style={{ width: '220px', borderRadius: '10px', border: '3px solid #c99a4e', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} />
              <p style={{ marginTop: '8px', color: '#f3e2b3', fontSize: '13px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{hoveredCard.name}</p>
            </div>
          )}
        </div>
      )}

      {listingToDelete && (
        <div onClick={() => setListingToDelete(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1410', border: '2px solid #c99a4e', borderRadius: '14px',
            padding: '20px', maxWidth: '80%', textAlign: 'center', color: '#f3e2b3'
          }}>
            <p style={{ fontSize: '13px', marginBottom: deleteError ? '8px' : '16px' }}>
              {t('blackMarketDeleteConfirm', { name: listingToDelete.card.name })}
            </p>
            {deleteError && <p style={{ color: '#ff8a8a', fontSize: '12px', marginBottom: '12px' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={confirmDeleteListing} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#a5541b', color: '#fff3d6', fontWeight: 700, cursor: 'pointer' }}>
                {t('blackMarketDeleteYes')}
              </button>
              <button onClick={() => setListingToDelete(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#555', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {t('blackMarketDeleteNo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomCard && (
        <div onClick={() => setZoomCard(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'zoom-out'
        }}>
          <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <img src={zoomCard.image_url} alt={zoomCard.name}
                 style={{ maxWidth: '80vw', maxHeight: '70vh', borderRadius: '14px', border: '4px solid #c99a4e', boxShadow: '0 12px 36px rgba(0,0,0,0.6)' }}
                 onError={e => { e.target.style.display = 'none' }} />
            <p style={{ marginTop: '10px', color: '#f3e2b3', fontSize: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{zoomCard.name}</p>
            <button onClick={() => setZoomCard(null)} style={{ marginTop: '8px', padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#a5541b', color: '#fff3d6', fontWeight: 700, cursor: 'pointer' }}>
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlackMarket
