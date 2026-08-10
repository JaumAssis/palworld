import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

function CardPicker({ onSelect, onClose, ownedPals }) {
  const { t } = useLanguage()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '14px', width: '500px', maxWidth: '90vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px', flexShrink: 0 }}>
          <h3 style={{ margin: 0 }}>{t('choosePalTitle')}</h3>
          <button onClick={onClose} title={t('close')} style={{ background: 'none', border: 'none', fontSize: '20px', lineHeight: 1, color: '#666', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '0 20px 20px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px' }}>
            {ownedPals.map(card => (
              <div key={card.card_number} onClick={() => onSelect(card)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '5 / 7', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
                  <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       onError={e => { e.target.style.visibility = 'hidden' }} />
                </div>
                <p style={{ fontSize: '10px', margin: '4px 0 0' }}>{card.name}</p>
              </div>
            ))}
          </div>
          {ownedPals.length === 0 && <p style={{ color: '#999' }}>{t('noPalsOwned')}</p>}
        </div>
      </div>
    </div>
  )
}

function Breeding({ onClose } = {}) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [ownedPals, setOwnedPals] = useState([])
  const [parent1, setParent1] = useState(null)
  const [parent2, setParent2] = useState(null)
  const [pickingSide, setPickingSide] = useState(null) // 1, 2, ou null
  const [status, setStatus] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [revealedResult, setRevealedResult] = useState(null)
  const [player, setPlayer] = useState(null)

  const useCake = (type) => {
    apiFetch('/api/breeding/use-cake', {
      method: 'POST',
      body: JSON.stringify({ type })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus()
        apiFetch('/api/player').then(r => r.json()).then(setPlayer)
      })
      .catch(err => alert(err.message))
  }

  useEffect(() => {
    loadOwnedPals()
    loadStatus()
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
    const clockInterval = setInterval(() => setNow(Date.now()), 1000)
    const pollInterval = setInterval(() => { loadStatus(); loadOwnedPals() }, 5000) // corrige o "preso" até virar Chocar; também recarrega os Pals disponíveis (podem ter sido liberados em outra tela)
    const openTimeout = setTimeout(() => setIsOpen(true), 100)
    return () => {
      clearInterval(clockInterval)
      clearInterval(pollInterval)
      clearTimeout(openTimeout)
    }
  }, [])

  function loadOwnedPals() {
    Promise.all([
      apiFetch('/api/cards').then(r => r.json()),
      apiFetch('/api/player/cards').then(r => r.json())
    ]).then(([allCards, owned]) => {
      // só mostra Pals com pelo menos 1 cópia disponível — as ocupadas em outra tarefa não aparecem
      const availableNumbers = new Set(owned.filter(o => o.quantity - o.reserved > 0).map(o => o.card_number))
      setOwnedPals(allCards.filter(c => c.card_type === 'Pal' && availableNumbers.has(c.card_number)))
    })
  }

  function loadStatus() {
    apiFetch('/api/breeding/status').then(r => r.json()).then(setStatus)
  }

  const startBreeding = () => {
    apiFetch('/api/breeding/start', {
      method: 'POST',
      body: JSON.stringify({ parent1CardNumber: parent1.card_number, parent2CardNumber: parent2.card_number })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus()
        loadOwnedPals()
        setParent1(null)
        setParent2(null)
      })
      .catch(err => alert(err.message))
  }
  const claimResult = () => {
    apiFetch('/api/breeding/claim', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setRevealedResult(data)
        loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const closeReveal = () => {
    setRevealedResult(null)
    loadStatus()
  }

  const formatCountdown = (readyTime) => {
    const diff = new Date(readyTime).getTime() - now
    if (diff <= 0) return t('countdownReady')
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${h}h ${m}m ${s}s`
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
          width: '100%', height: '100%', borderRadius: '28px',
          backgroundImage: 'url(/tabua.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          overflow: 'hidden', position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s ease, opacity 0.35s ease',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              <img src="/egg.png" alt="Breeding" style={{ width: '24px', height: '24px' }} /> Breeding
            </h2>
            {onClose
              ? <button onClick={onClose} style={{ fontSize: '13px', color: '#ffd479', background: 'none', border: 'none', cursor: 'pointer', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('exit')}</button>
              : <Link to="/" style={{ fontSize: '13px', color: '#ffd479', textDecoration: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('exit')}</Link>}
          </div>
          <div style={{ padding: '0 16px 16px', overflowY: 'auto', flex: 1, textAlign: 'center' }}>
      <p style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: '13px' }}>{t('breedingIntro')}</p>

      {!status && <p>{t('loading')}</p>}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
            <div onClick={() => setPickingSide(1)} style={{ cursor: 'pointer', width: '140px' }}>
              {parent1 ? (
                <img src={parent1.image_url} alt={parent1.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: '140px', height: '196px', border: '2px dashed #f3e2b3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                  {t('choosePalPlaceholder')}
                </div>
              )}
              <p style={{ fontSize: '13px', marginTop: '6px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{parent1?.name || t('parent1Fallback')}</p>
            </div>

            <div style={{ fontSize: '32px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>+</div>

            <div onClick={() => setPickingSide(2)} style={{ cursor: 'pointer', width: '140px' }}>
              {parent2 ? (
                <img src={parent2.image_url} alt={parent2.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: '140px', height: '196px', border: '2px dashed #f3e2b3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                  {t('choosePalPlaceholder')}
                </div>
              )}
              <p style={{ fontSize: '13px', marginTop: '6px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{parent2?.name || t('parent2Fallback')}</p>
            </div>
          </div>

          <button
            onClick={startBreeding}
            disabled={!parent1 || !parent2}
            style={{ padding: '12px 30px', fontSize: '14px', opacity: (!parent1 || !parent2) ? 0.5 : 1 }}>
            <img src="/egg.png" alt="" style={{ width: '18px', height: '18px', verticalAlign: 'middle', marginRight: '6px' }} />
            {t('startBreeding')}
          </button>
        </>
      )}

      {status && status.active && !status.isReady && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
            <img src={status.parent1.image_url} alt="" style={{ width: '100px', borderRadius: '8px', opacity: 0.7 }} />
            <img src="/egg.png" alt="" style={{ width: '60px', height: '60px' }} />
            <img src={status.parent2.image_url} alt="" style={{ width: '100px', borderRadius: '8px', opacity: 0.7 }} />
          </div>
          <h2 style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('hatchingEgg')}</h2>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{formatCountdown(status.readyTime)}</p>

          <div style={{ width: '100%', maxWidth: '400px', margin: '16px auto', background: '#eee', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, ((now - new Date(status.startTime).getTime()) / (new Date(status.readyTime).getTime() - new Date(status.startTime).getTime())) * 100)}%`,
              height: '100%', background: 'linear-gradient(90deg, #ffb347, #ffcc33)', transition: 'width 1s linear'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            <button
              onClick={() => useCake('cake')}
              disabled={!player || player.cake_count <= 0}
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Cake_icon.webp" alt="" style={{ width: '20px' }} /> {t('useCakeBtn', { count: player?.cake_count || 0 })}
            </button>
            <button
              onClick={() => useCake('special_cake')}
              disabled={!player || player.special_cake_count <= 0}
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Special_Cake_icon.webp" alt="" style={{ width: '20px' }} /> {t('useSpecialCakeBtn', { count: player?.special_cake_count || 0 })}
            </button>
          </div>
        </div>
      )}

      {status && status.active && status.isReady && (
        <div style={{ marginTop: '30px' }}>
          <img src="/egg.png" alt="" style={{ width: '80px', height: '80px' }} />
          <h2 style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('eggReady')}</h2>
          <button onClick={claimResult} style={{ padding: '14px 30px', fontSize: '15px' }}>{t('hatchBtn')}</button>
        </div>
      )}

      {pickingSide && (
        <CardPicker
          ownedPals={ownedPals}
          onClose={() => setPickingSide(null)}
          onSelect={(card) => {
            if (pickingSide === 1) setParent1(card); else setParent2(card)
            setPickingSide(null)
          }}
        />
      )}

      {revealedResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center' }}>
            <h2 style={{ color: '#222' }}>{t('hatchedTitle')}</h2>
            <img src={revealedResult.card.image_url} alt={revealedResult.card.name} style={{ width: '180px', borderRadius: '10px', margin: '10px 0' }} />
            <p style={{ fontWeight: 'bold', color: '#222' }}>{revealedResult.card.name}</p>
            {revealedResult.fluidGained > 0 && <p style={{ color: '#222' }}>{t('fluidGainedMsg', { n: revealedResult.fluidGained })}</p>}
            <button onClick={closeReveal} style={{ padding: '10px 24px', marginTop: '10px' }}>{t('close')}</button>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Breeding