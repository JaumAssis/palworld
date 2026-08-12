import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

function CardPicker({ onSelect, onClose, ownedPals }) {
  const { t } = useLanguage()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '14px', width: 'var(--panel-w-sm)', maxWidth: '90vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-md) var(--sp-lg) var(--sp-xs)', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--fs-lg)' }}>{t('choosePalTitle')}</h3>
          <button onClick={onClose} title={t('close')} style={{ background: 'none', border: 'none', fontSize: 'var(--fs-lg)', lineHeight: 1, color: '#666', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '0 20px 20px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(75px, 8vw, 110px), 1fr))', gap: 'var(--sp-sm)' }}>
            {ownedPals.map(card => (
              <div key={card.card_number} onClick={() => onSelect(card)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '5 / 7', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
                  <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       onError={e => { e.target.style.visibility = 'hidden' }} />
                </div>
                <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0' }}>{card.name}</p>
              </div>
            ))}
          </div>
          {ownedPals.length === 0 && <p style={{ color: '#999', fontSize: 'var(--fs-sm)' }}>{t('noPalsOwned')}</p>}
        </div>
      </div>
    </div>
  )
}

// Livro de descobertas — só combos que vieram DIRETO da tabela real de breeding (o backend já
// filtra isso, ver result_source em server.js). Uma substituição por falta de carta impressa, ou
// uma combinação fora da tabela real (aproximação por power), nunca aparece aqui.
function DiscoveriesModal({ onClose }) {
  const { t } = useLanguage()
  const [discoveries, setDiscoveries] = useState(null)

  useEffect(() => {
    apiFetch('/api/breeding/discoveries').then(r => r.json()).then(setDiscoveries).catch(() => setDiscoveries([]))
  }, [])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '16px', width: 'var(--panel-w-sm)', maxWidth: '90vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-md) var(--sp-lg) var(--sp-xs)', flexShrink: 0 }}>
          <h3 style={{ margin: 0, color: '#222', fontSize: 'var(--fs-lg)' }}>📖 {t('breedingDiscoveriesTitle')}</h3>
          <button onClick={onClose} title={t('close')} style={{ background: 'none', border: 'none', fontSize: 'var(--fs-lg)', lineHeight: 1, color: '#666', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '0 20px 20px', overflowY: 'auto' }}>
          {!discoveries && <p style={{ color: '#666', fontSize: 'var(--fs-sm)' }}>{t('loading')}</p>}
          {discoveries && discoveries.length === 0 && <p style={{ color: '#999', fontSize: 'var(--fs-sm)' }}>{t('breedingDiscoveriesEmpty')}</p>}
          {discoveries && discoveries.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < discoveries.length - 1 ? '1px solid #eee' : 'none' }}>
              {[d.parent1, d.parent2, d.result].map((c, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {j > 0 && <span style={{ color: '#999', fontSize: 'var(--fs-md)' }}>{j === 2 ? '=' : '+'}</span>}
                  <div style={{ textAlign: 'center', width: 'clamp(56px, 6vw, 80px)' }}>
                    {c ? (
                      <img src={c.image_url} alt={c.name} title={c.name} style={{ width: '100%', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '5 / 7', background: '#eee', borderRadius: '6px' }} />
                    )}
                    <p style={{ fontSize: 'var(--fs-2xs)', margin: '2px 0 0', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
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
  // Contagem regressiva mostrada na tela — decrementada localmente a cada 1s a partir do
  // remainingMs que o SERVIDOR calculou (ver computeTiming em server.js), nunca comparando
  // readyTime com o relógio do próprio navegador. Antes disso, adiantar o relógio do PC fazia a
  // barra mostrar "pronto" cedo demais, e o resgate então falhava (o servidor não confia nisso).
  const [remainingMs, setRemainingMs] = useState(null)
  const [revealedResult, setRevealedResult] = useState(null)
  const [player, setPlayer] = useState(null)
  const [showDiscoveries, setShowDiscoveries] = useState(false)

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
    // Só decrementa o valor que já veio do servidor — nunca lê o relógio absoluto do navegador.
    const tickInterval = setInterval(() => setRemainingMs(ms => (ms == null ? null : Math.max(0, ms - 1000))), 1000)
    const pollInterval = setInterval(() => { loadStatus(); loadOwnedPals() }, 5000) // corrige o "preso" até virar Chocar; também recarrega os Pals disponíveis (podem ter sido liberados em outra tela)
    const openTimeout = setTimeout(() => setIsOpen(true), 100)
    return () => {
      clearInterval(tickInterval)
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
    apiFetch('/api/breeding/status').then(r => r.json()).then(data => {
      setStatus(data)
      if (data.active) setRemainingMs(data.remainingMs)
    })
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

  const formatCountdown = (ms) => {
    if (ms == null || ms <= 0) return t('countdownReady')
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h}h ${m}m ${s}s`
  }

  return (
    <div style={{
      minHeight: '100vh', background: onClose ? 'transparent' : '#1a1a2e',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      boxSizing: 'border-box', overflow: 'auto'
    }}>
      <div style={{
        width: 'min(420px, 92vw)', height: 'min(840px, 92vh)', background: '#000', borderRadius: '36px',
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
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              <img src="/egg.png" alt="Breeding" style={{ width: 'clamp(20px, 2vw, 30px)', height: 'clamp(20px, 2vw, 30px)' }} /> Breeding
            </h2>
            {onClose
              ? <button onClick={onClose} style={{ fontSize: 'var(--fs-sm)', color: '#ffd479', background: 'none', border: 'none', cursor: 'pointer', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('exit')}</button>
              : <Link to="/" style={{ fontSize: 'var(--fs-sm)', color: '#ffd479', textDecoration: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('exit')}</Link>}
          </div>
          <div style={{ padding: '0 16px 16px', overflowY: 'auto', flex: 1, textAlign: 'center' }}>
      <p style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: 'var(--fs-sm)' }}>{t('breedingIntro')}</p>

      {!status && <p>{t('loading')}</p>}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
            <div onClick={() => setPickingSide(1)} style={{ cursor: 'pointer', width: 'clamp(120px, 13vw, 180px)' }}>
              {parent1 ? (
                <img src={parent1.image_url} alt={parent1.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: 'clamp(120px, 13vw, 180px)', height: 'clamp(168px, 18vw, 252px)', border: '2px dashed #f3e2b3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: 'var(--fs-sm)' }}>
                  {t('choosePalPlaceholder')}
                </div>
              )}
              <p style={{ fontSize: 'var(--fs-sm)', marginTop: '6px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{parent1?.name || t('parent1Fallback')}</p>
            </div>

            <div style={{ fontSize: 'var(--fs-xl)', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>+</div>

            <div onClick={() => setPickingSide(2)} style={{ cursor: 'pointer', width: 'clamp(120px, 13vw, 180px)' }}>
              {parent2 ? (
                <img src={parent2.image_url} alt={parent2.name} style={{ width: '100%', borderRadius: '10px' }} />
              ) : (
                <div style={{ width: 'clamp(120px, 13vw, 180px)', height: 'clamp(168px, 18vw, 252px)', border: '2px dashed #f3e2b3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: 'var(--fs-sm)' }}>
                  {t('choosePalPlaceholder')}
                </div>
              )}
              <p style={{ fontSize: 'var(--fs-sm)', marginTop: '6px', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{parent2?.name || t('parent2Fallback')}</p>
            </div>
          </div>

          <button
            onClick={startBreeding}
            disabled={!parent1 || !parent2}
            style={{ padding: 'var(--sp-sm) var(--sp-xl)', fontSize: 'var(--fs-sm)', opacity: (!parent1 || !parent2) ? 0.5 : 1 }}>
            <img src="/egg.png" alt="" style={{ width: '18px', height: '18px', verticalAlign: 'middle', marginRight: '6px' }} />
            {t('startBreeding')}
          </button>

          <div style={{ marginTop: '12px' }}>
            <button onClick={() => setShowDiscoveries(true)} title={t('breedingDiscoveriesTitle')}
                    style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-sm)', background: 'none', border: '1px solid #f3e2b3', color: '#fff3d6', borderRadius: '8px', cursor: 'pointer' }}>
              📖 {t('breedingDiscoveriesTitle')}
            </button>
          </div>
        </>
      )}

      {status && status.active && !status.isReady && (
        <div style={{ marginTop: '30px' }}>
          {/* Mesmos quadros 140x196 de borda tracejada dos slots de escolha (acima), agora
              preenchidos com um recorte da arte de cada pai — só pra dar uma prévia visual do que
              está sendo cruzado, não a carta inteira. */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: 'clamp(120px, 13vw, 180px)', height: 'clamp(168px, 18vw, 252px)', border: '2px dashed #f3e2b3', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={status.parent1.image_url} alt={status.parent1.name}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 0.8 }} />
            </div>
            <img src="/egg.png" alt="" style={{ width: 'clamp(40px, 4vw, 60px)', height: 'clamp(40px, 4vw, 60px)' }} />
            <div style={{ width: 'clamp(120px, 13vw, 180px)', height: 'clamp(168px, 18vw, 252px)', border: '2px dashed #f3e2b3', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={status.parent2.image_url} alt={status.parent2.name}
                   style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 0.8 }} />
            </div>
          </div>
          <h2 style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: 'var(--fs-lg)' }}>{t('hatchingEgg')}</h2>
          <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold', color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{formatCountdown(remainingMs)}</p>

          <div style={{ width: '100%', maxWidth: '400px', margin: '16px auto', background: '#eee', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (1 - (remainingMs ?? status.totalMs) / status.totalMs) * 100)}%`,
              height: '100%', background: 'linear-gradient(90deg, #ffb347, #ffcc33)', transition: 'width 1s linear'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            <button
              onClick={() => useCake('cake')}
              disabled={!player || player.cake_count <= 0}
              style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-2xs)', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Cake_icon.webp" alt="" style={{ width: 'clamp(18px, 2vw, 26px)' }} /> {t('useCakeBtn', { count: player?.cake_count || 0 })}
            </button>
            <button
              onClick={() => useCake('special_cake')}
              disabled={!player || player.special_cake_count <= 0}
              style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-2xs)', display: 'flex', alignItems: 'center', gap: '6px', color: '#000', background: '#fff', border: '1px solid #ccc' }}>
              <img src="/Special_Cake_icon.webp" alt="" style={{ width: 'clamp(18px, 2vw, 26px)' }} /> {t('useSpecialCakeBtn', { count: player?.special_cake_count || 0 })}
            </button>
          </div>
        </div>
      )}

      {status && status.active && status.isReady && (
        <div style={{ marginTop: '30px' }}>
          <img src="/egg.png" alt="" style={{ width: 'clamp(64px, 7vw, 100px)', height: 'clamp(64px, 7vw, 100px)' }} />
          <h2 style={{ color: '#fff3d6', textShadow: '1px 1px 2px rgba(0,0,0,0.7)', fontSize: 'var(--fs-lg)' }}>{t('eggReady')}</h2>
          <button onClick={claimResult} style={{ padding: 'var(--sp-md) var(--sp-xl)', fontSize: 'var(--fs-md)' }}>{t('hatchBtn')}</button>
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
          <div style={{ background: '#fff', borderRadius: '16px', padding: 'var(--sp-xl)', textAlign: 'center' }}>
            <h2 style={{ color: '#222', fontSize: 'var(--fs-xl)' }}>{t('hatchedTitle')}</h2>
            <img src={revealedResult.card.image_url} alt={revealedResult.card.name} style={{ width: 'clamp(150px, 16vw, 220px)', borderRadius: '10px', margin: '10px 0' }} />
            <p style={{ fontWeight: 'bold', color: '#222', fontSize: 'var(--fs-base)' }}>{revealedResult.card.name}</p>
            {revealedResult.fluidGained > 0 && <p style={{ color: '#222', fontSize: 'var(--fs-sm)' }}>{t('fluidGainedMsg', { n: revealedResult.fluidGained })}</p>}
            <button onClick={closeReveal} style={{ padding: 'var(--sp-sm) var(--sp-lg)', fontSize: 'var(--fs-sm)', marginTop: '10px' }}>{t('close')}</button>
          </div>
        </div>
      )}

      {showDiscoveries && <DiscoveriesModal onClose={() => setShowDiscoveries(false)} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Breeding