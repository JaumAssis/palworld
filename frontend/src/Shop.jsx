import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'
import BlackMarket from './BlackMarket'

// Ângulos fixos das faíscas da animação de abertura (não Math.random() a cada render, senão elas
// "pulariam" de posição toda vez que algo no componente atualizasse durante a animação).
const BOOSTER_SPARKLES = Array.from({ length: 10 }, (_, i) => ({ angle: i * 36, delay: (i % 5) * 0.06 }))
const BOOSTER_OPEN_ANIMATION_MS = 1300

const SHOP_STYLE_TAG = (
  <style>{`
    @keyframes shopPackSpin { 0% { transform: rotate(0deg) scale(0.75); } 60% { transform: rotate(620deg) scale(1.2); } 100% { transform: rotate(720deg) scale(1); } }
    @keyframes shopPackGlow { 0%, 100% { box-shadow: 0 0 22px 6px rgba(255,215,106,0.45); } 50% { box-shadow: 0 0 55px 20px rgba(255,215,106,0.95); } }
    @keyframes shopSparkleBurst { 0% { transform: translate(0, 0) scale(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(var(--sx), var(--sy)) scale(1); opacity: 0; } }
    .shop-pack-icon { animation: shopPackSpin ${BOOSTER_OPEN_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), shopPackGlow 0.6s ease-in-out infinite; }
    .shop-sparkle { animation: shopSparkleBurst ${BOOSTER_OPEN_ANIMATION_MS}ms ease-out; }
  `}</style>
)

// Ícone girando + brilhando, soltando faíscas — mostrado por BOOSTER_OPEN_ANIMATION_MS antes da
// revelação de verdade das cartas (em vez de aparecerem instantaneamente sem nenhum efeito).
function BoosterOpeningAnimation() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100
    }}>
      {SHOP_STYLE_TAG}
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {BOOSTER_SPARKLES.map(({ angle, delay }, i) => {
          const rad = (angle * Math.PI) / 180
          const sx = Math.cos(rad) * 110
          const sy = Math.sin(rad) * 110
          return (
            <span
              key={i}
              className="shop-sparkle"
              style={{
                position: 'absolute', fontSize: '22px', animationDelay: `${delay}s`,
                '--sx': `${sx}px`, '--sy': `${sy}px`
              }}
            >✨</span>
          )
        })}
        <div className="shop-pack-icon" style={{
          fontSize: '64px', width: '90px', height: '90px', borderRadius: '18px',
          background: 'linear-gradient(145deg, #ffe08a, #c99a4e)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>📦</div>
      </div>
    </div>
  )
}

function Shop({ onClose } = {}) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [player, setPlayer] = useState(null)
  const [buying, setBuying] = useState(false)
  const [openingAnimation, setOpeningAnimation] = useState(false)
  const [revealedCards, setRevealedCards] = useState(null)
  const [error, setError] = useState('')
  const [buyingTD, setBuyingTD] = useState(null)
  const [view, setView] = useState('boosters')
  const [showMarket, setShowMarket] = useState(false)
  const [spinning, setSpinning] = useState(false)

  // Segura a revelação de verdade até a animação de abrir o pacote terminar — os dados já
  // chegaram do servidor, só a exibição é adiada pro efeito ficar visível por completo.
  const revealAfterAnimation = (cards) => {
    setOpeningAnimation(true)
    setTimeout(() => {
      setOpeningAnimation(false)
      setRevealedCards(cards)
    }, BOOSTER_OPEN_ANIMATION_MS)
  }

  // Giro de "passagem secreta": troca o conteúdo no meio da animação, quando o painel está de perfil.
  const toggleMarket = () => {
    setSpinning(true)
    setTimeout(() => setShowMarket(v => !v), 400)
    setTimeout(() => setSpinning(false), 800)
  }

  const exitShop = () => { if (onClose) onClose(); else navigate('/') }

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
        revealAfterAnimation(data.cards)
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
        revealAfterAnimation(data.cards)
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
        width: 'min(420px, 92vw)', height: 'min(840px, 92vh)', background: '#000', borderRadius: '36px',
        padding: '10px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', position: 'relative', flexShrink: 0,
        perspective: '1200px'
      }}>
        <div className={spinning ? 'market-portal-spin' : ''} style={{ width: '100%', height: '100%' }}>
        <div style={{
          width: '100%', height: '100%', background: showMarket ? '#1a1410' : '#f2f2f7', borderRadius: '28px',
          overflow: 'hidden', position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s ease, opacity 0.35s ease'
        }}>
          {showMarket ? (
            <BlackMarket onExit={exitShop} />
          ) : (
          <>
          <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)' }}>{t('shopTitle')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="shop-flag-button" type="button" onClick={toggleMarket}>🏴‍☠️</button>
              {onClose
                ? <button onClick={onClose} style={{ fontSize: 'var(--fs-sm)', color: '#007aff', background: 'none', border: 'none', cursor: 'pointer' }}>{t('exit')}</button>
                : <Link to="/" style={{ fontSize: 'var(--fs-sm)', color: '#007aff', textDecoration: 'none' }}>{t('exit')}</Link>}
            </div>
          </div>

          {player && (
            <div style={{ display: 'flex', gap: '10px', padding: '0 16px 12px', alignItems: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '10px', padding: 'var(--sp-xs) var(--sp-md)', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src="/gold-coin.png" alt="Gold" style={{ width: 'clamp(16px, 1.7vw, 22px)', height: 'clamp(16px, 1.7vw, 22px)' }} />
                <strong style={{ fontSize: 'var(--fs-sm)' }}>{player.gold_coins}</strong>
              </div>
              <div style={{ background: '#fff', borderRadius: '10px', padding: 'var(--sp-xs) var(--sp-md)', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <img src="/pal-fluid.png" alt={t('palFluidAlt')} style={{ width: 'clamp(16px, 1.7vw, 22px)', height: 'clamp(16px, 1.7vw, 22px)' }} />
                <strong style={{ fontSize: 'var(--fs-sm)' }}>{player.pal_fluid}</strong>
              </div>
              <button
                onClick={() => setView(v => v === 'boosters' ? 'items' : 'boosters')}
                style={{ marginLeft: 'auto', padding: 'var(--sp-xs) var(--sp-md)', borderRadius: '10px', border: 'none', background: '#333', color: '#fff', fontSize: 'var(--fs-2xs)', fontWeight: 600 }}>
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
                <div key={item.key} style={{ background: '#fff', borderRadius: '14px', padding: 'var(--sp-sm)', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <img src={item.img} alt={item.name} style={{ width: 'clamp(42px, 4.5vw, 62px)', height: 'clamp(42px, 4.5vw, 62px)' }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 'var(--fs-2xs)', color: '#777' }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => buyItem(item.key)}
                    disabled={!player || player.pal_fluid < item.price}
                    style={{ padding: 'var(--sp-xs) var(--sp-sm)', borderRadius: '8px', border: 'none', background: '#007aff', color: '#fff', fontWeight: 600, fontSize: 'var(--fs-2xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.price} <img src="/pal-fluid.png" alt="" style={{ width: 'clamp(11px, 1.2vw, 16px)' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
            <div style={{ background: '#fff', borderRadius: '16px', padding: 'var(--sp-lg)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <img src="/booster-bp01.png" alt="Dawn of Palpagos Booster Pack"
                   style={{ width: 'clamp(115px, 13vw, 170px)', margin: '0 auto 12px', display: 'block' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: 'var(--fs-md)' }}>Dawn of Palpagos</h3>
              <p style={{ fontSize: 'var(--fs-2xs)', color: '#777', margin: '0 0 12px' }}>{t('boosterPackDesc')}</p>

              <button
                onClick={buyBooster}
                disabled={buying || !player || player.gold_coins < 100}
                style={{
                  width: '100%', padding: 'var(--sp-sm)', borderRadius: '10px', border: 'none',
                  background: '#007aff', color: '#fff', fontWeight: 600, fontSize: 'var(--fs-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  cursor: 'pointer', opacity: (buying || (player && player.gold_coins < 100)) ? 0.5 : 1
                }}>
                {buying ? t('opening') : <>{t('buyFor100')} <img src="/gold-coin.png" alt="" style={{ width: 'clamp(14px, 1.5vw, 20px)' }} /></>}
              </button>

              {error && <p style={{ color: 'red', fontSize: 'var(--fs-2xs)', marginTop: '8px' }}>{error}</p>}
            </div>

            {/* ---------- TRIAL DECKS ---------- */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', marginBottom: '16px' }}>
              {[
                { code: 'TD01', name: 'Red・Blue', img: '/trialdeck-red-blue.png', bought: player?.bought_td01 },
                { code: 'TD02', name: 'Green・Purple', img: '/trialdeck-green-purple.png', bought: player?.bought_td02 }
              ].map(td => (
                <div key={td.code} style={{ flex: 1, background: '#fff', borderRadius: '14px', padding: 'var(--sp-xs)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  <img src={td.img} alt={td.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                  <p style={{ fontSize: 'var(--fs-2xs)', fontWeight: 600, margin: '0 0 8px' }}>{td.name}</p>
                  <button
                    onClick={() => buyTrialDeck(td.code)}
                    disabled={td.bought || buyingTD === td.code || !player || player.gold_coins < 500}
                    style={{
                      width: '100%', padding: 'var(--sp-xs)', borderRadius: '8px', border: 'none',
                      background: td.bought ? '#ccc' : '#34c759', color: '#fff', fontWeight: 600, fontSize: 'var(--fs-2xs)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: td.bought ? 'default' : 'pointer'
                    }}>
                    {td.bought ? t('alreadyBought') : buyingTD === td.code ? t('opening') : <>500 <img src="/gold-coin.png" alt="" style={{ width: 'clamp(11px, 1.2vw, 16px)' }} /></>}
                  </button>
                </div>
              ))}
            </div>
            </>
          )}
          </div>
          </>
          )}
        </div>
        </div>
      </div>

      {openingAnimation && <BoosterOpeningAnimation />}

      {revealedCards && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: 'var(--sp-xl)', maxWidth: 'var(--panel-w-md)', maxHeight: '85vh',
            overflowY: 'auto', textAlign: 'center', boxSizing: 'border-box'
          }}>
            <h3 style={{ marginTop: 0, fontSize: 'var(--fs-lg)' }}>{t('cardsObtained')}</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {revealedCards.map((c, i) => (
                <div key={i} style={{ width: 'clamp(68px, 7.5vw, 100px)' }}>
                  <img src={c.image_url} alt={c.name} style={{ width: '100%', borderRadius: '6px' }} />
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0' }}>{c.rarity}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setRevealedCards(null)} style={{ padding: 'var(--sp-sm) var(--sp-lg)', fontSize: 'var(--fs-sm)', position: 'sticky', bottom: 0 }}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shop