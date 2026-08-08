import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

function Shop({ onClose } = {}) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [player, setPlayer] = useState(null)
  const [buying, setBuying] = useState(false)
  const [revealedCards, setRevealedCards] = useState(null)
  const [error, setError] = useState('')
  const [buyingTD, setBuyingTD] = useState(null)
  const [view, setView] = useState('boosters')

  useEffect(() => {
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
    const t = setTimeout(() => setIsOpen(true), 100)
    return () => clearTimeout(t)
  }, [])

  const buyTrialDeck = (setCode) => {
    setError('')
    setBuyingTD(setCode)
    apiFetch('/api/shop/buy-trial-deck', {
      method: 'POST',
      body: JSON.stringify({ setCode })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('buyError'))
        setPlayer(p => ({ ...p, gold_coins: data.goldCoins, pal_fluid: data.palFluid, [`bought_${setCode.toLowerCase()}`]: 1 }))
        setRevealedCards(data.cards)
        setBuyingTD(null)
      })
      .catch(err => {
        setError(err.message)
        setBuyingTD(null)
      })
  }

  const buyItem = (item) => {
    apiFetch('/api/shop/buy-item', {
      method: 'POST',
      body: JSON.stringify({ item })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
      })
      .catch(err => alert(err.message))
  }

  const buyBooster = () => {
    setError('')
    setBuying(true)
    apiFetch('/api/shop/open-booster', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('buyError'))
        setPlayer(p => ({ ...p, gold_coins: data.goldCoins, pal_fluid: data.palFluid }))
        setRevealedCards(data.cards)
        setBuying(false)
      })
      .catch(err => {
        setError(err.message)
        setBuying(false)
      })
  }

  return (
    <div style={{
      minHeight: '100vh', background: onClose ? 'transparent' : '#1a1a2e',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      boxSizing: 'border-box', overflow: 'auto'
    }}>
      <div style={{
        width: 'min(360px, 92vw)', height: 'min(720px, 92vh)', background: '#000', borderRadius: '36px',
        padding: '10px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', position: 'relative', flexShrink: 0
      }}>
        <div style={{
          width: '100%', height: '100%', background: '#f2f2f7', borderRadius: '28px',
          overflow: 'hidden', position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s ease, opacity 0.35s ease'
        }}>
          <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{t('shopTitle')}</h2>
            {onClose
              ? <button onClick={onClose} style={{ fontSize: '13px', color: '#007aff', background: 'none', border: 'none', cursor: 'pointer' }}>{t('exit')}</button>
              : <Link to="/" style={{ fontSize: '13px', color: '#007aff', textDecoration: 'none' }}>{t('exit')}</Link>}
          </div>

          {player && (
            <div style={{ display: 'flex', gap: '10px', padding: '0 16px 12px', alignItems: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src="/gold-coin.png" alt="Gold" style={{ width: '18px', height: '18px' }} />
                <strong style={{ fontSize: '14px' }}>{player.gold_coins}</strong>
              </div>
              <div style={{ background: '#fff', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src="/pal-fluid.png" alt={t('palFluidAlt')} style={{ width: '18px', height: '18px' }} />
                <strong style={{ fontSize: '14px' }}>{player.pal_fluid}</strong>
              </div>
              <button
                onClick={() => setView(v => v === 'boosters' ? 'items' : 'boosters')}
                style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {view === 'boosters' ? t('viewItems') : t('viewBoosters')}
              </button>
            </div>
          )}

          <div style={{ padding: '0 16px', overflowY: 'auto', height: 'calc(100% - 150px)' }}>
          {view === 'items' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'cake', name: 'Cake', img: '/Cake_icon.webp', desc: t('cakeDesc'), price: 15 },
                { key: 'special_cake', name: 'Special Cake', img: '/Special_Cake_icon.webp', desc: t('specialCakeDesc'), price: 30 }
              ].map(item => (
                <div key={item.key} style={{ background: '#fff', borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <img src={item.img} alt={item.name} style={{ width: '50px', height: '50px' }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#777' }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => buyItem(item.key)}
                    disabled={!player || player.pal_fluid < item.price}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#007aff', color: '#fff', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.price} <img src="/pal-fluid.png" alt="" style={{ width: '13px' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <img src="/booster-bp01.png" alt="Dawn of Palpagos Booster Pack"
                   style={{ width: '140px', margin: '0 auto 12px', display: 'block' }} />
              <h3 style={{ margin: '0 0 4px' }}>Dawn of Palpagos</h3>
              <p style={{ fontSize: '12px', color: '#777', margin: '0 0 12px' }}>{t('boosterPackDesc')}</p>

              <button
                onClick={buyBooster}
                disabled={buying || !player || player.gold_coins < 100}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#007aff', color: '#fff', fontWeight: 600, fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  cursor: 'pointer', opacity: (buying || (player && player.gold_coins < 100)) ? 0.5 : 1
                }}>
                {buying ? t('opening') : <>{t('buyFor100')} <img src="/gold-coin.png" alt="" style={{ width: '16px' }} /></>}
              </button>

              {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
            </div>

            {/* ---------- TRIAL DECKS ---------- */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', marginBottom: '16px' }}>
              {[
                { code: 'TD01', name: 'Red・Blue', img: '/trialdeck-red-blue.png', bought: player?.bought_td01 },
                { code: 'TD02', name: 'Green・Purple', img: '/trialdeck-green-purple.png', bought: player?.bought_td02 }
              ].map(td => (
                <div key={td.code} style={{ flex: 1, background: '#fff', borderRadius: '14px', padding: '10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <img src={td.img} alt={td.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 8px' }}>{td.name}</p>
                  <button
                    onClick={() => buyTrialDeck(td.code)}
                    disabled={td.bought || buyingTD === td.code || !player || player.gold_coins < 500}
                    style={{
                      width: '100%', padding: '8px', borderRadius: '8px', border: 'none',
                      background: td.bought ? '#ccc' : '#34c759', color: '#fff', fontWeight: 600, fontSize: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: td.bought ? 'default' : 'pointer'
                    }}>
                    {td.bought ? t('alreadyBought') : buyingTD === td.code ? t('opening') : <>500 <img src="/gold-coin.png" alt="" style={{ width: '13px' }} /></>}
                  </button>
                </div>
              ))}
            </div>
            </>
          )}
          </div>
        </div>
      </div>

      {revealedCards && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '480px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>{t('cardsObtained')}</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {revealedCards.map((c, i) => (
                <div key={i} style={{ width: '80px' }}>
                  <img src={c.image_url} alt={c.name} style={{ width: '100%', borderRadius: '6px' }} />
                  <p style={{ fontSize: '10px', margin: '4px 0 0' }}>{c.rarity}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setRevealedCards(null)} style={{ padding: '10px 24px' }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop