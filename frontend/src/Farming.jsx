import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'

const API_URL = 'http://localhost:3001'

function CardPicker({ onSelect, onClose, ownedPals, selectedNumbers, requiredKeywords }) {
  const { t } = useLanguage()
  const filtered = requiredKeywords
    ? ownedPals.filter(c => (c.workKeywords || []).some(k => requiredKeywords.includes(k.toLowerCase())))
    : ownedPals

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '20px', width: '520px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>{t('choosePalKeywordsTitle')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
          {filtered.map(card => {
            const already = selectedNumbers.includes(card.card_number)
            return (
              <div key={card.card_number} onClick={() => !already && onSelect(card)}
                   style={{ cursor: already ? 'not-allowed' : 'pointer', opacity: already ? 0.4 : 1, textAlign: 'center' }}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '6px' }} />
                <p style={{ fontSize: '10px', margin: '4px 0 0', fontWeight: 600 }}>{card.name}</p>
                <p style={{ fontSize: '9px', margin: 0, color: '#777' }}>{(card.workKeywords || []).join(', ') || '—'}</p>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <p style={{ color: '#999' }}>{t('noPalsWithSkill')}</p>}
      </div>
    </div>
  )
}

function Farming({ onClose } = {}) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [ownedPals, setOwnedPals] = useState([])
  const [selected, setSelected] = useState([])
  const [picking, setPicking] = useState(false)
  const [repeatWanted, setRepeatWanted] = useState(false)
  const [status, setStatus] = useState(null)
  const [player, setPlayer] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [errorMsg, setErrorMsg] = useState('')
  const [kindlingPal, setKindlingPal] = useState(null)
  const [pickingKindling, setPickingKindling] = useState(false)
  const [ovenStatus, setOvenStatus] = useState(null)
  const [ovenError, setOvenError] = useState('')

  useEffect(() => {
    loadOwnedPals()
    loadStatus()
    loadPlayer()
    loadOvenStatus()
    const clockInterval = setInterval(() => setNow(Date.now()), 1000)
    const pollInterval = setInterval(() => { loadStatus(); loadPlayer(); loadOvenStatus(); loadOwnedPals() }, 4000)
    const openTimeout = setTimeout(() => setIsOpen(true), 100)
    return () => { clearInterval(clockInterval); clearInterval(pollInterval); clearTimeout(openTimeout) }
  }, [])

  function loadPlayer() {
    fetch(`${API_URL}/api/player`).then(r => r.json()).then(setPlayer)
  }

  function loadOwnedPals() {
    Promise.all([
      fetch(`${API_URL}/api/cards`).then(r => r.json()),
      fetch(`${API_URL}/api/player/cards`).then(r => r.json())
    ]).then(([allCards, owned]) => {
      // só mostra Pals com pelo menos 1 cópia disponível — as ocupadas em outra tarefa não aparecem
      const availableNumbers = new Set(owned.filter(o => o.quantity - o.reserved > 0).map(o => o.card_number))
      Promise.all(
        allCards.filter(c => c.card_type === 'Pal' && availableNumbers.has(c.card_number))
          .map(c => fetch(`${API_URL}/api/cards/${c.card_number}`).then(r => r.json()).then(full => ({
            ...c, workKeywords: full.extra_data ? (JSON.parse(full.extra_data)?.data?.work_keywords || []) : []
          })))
      ).then(setOwnedPals)
    })
  }

  function loadStatus() {
    fetch(`${API_URL}/api/farming/status`).then(r => r.json()).then(setStatus)
  }

  function loadOvenStatus() {
    fetch(`${API_URL}/api/farming/oven-status`).then(r => r.json()).then(setOvenStatus)
  }

  const addPal = (card) => {
    if (selected.length >= 3) return
    setSelected([...selected, card])
    setPicking(false)
  }
  const removePal = (cardNumber) => setSelected(selected.filter(c => c.card_number !== cardNumber))

  const allKeywords = selected.flatMap(c => (c.workKeywords || []).map(k => k.toLowerCase()))
  const hasFarming = allKeywords.includes('farming')
  const hasHarvesting = allKeywords.includes('harvesting')
  const hasCollecting = allKeywords.includes('collecting')
  const canStart = hasFarming && hasHarvesting && selected.length > 0

  const startFarming = () => {
    setErrorMsg('')
    fetch(`${API_URL}/api/farming/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumbers: selected.map(c => c.card_number), repeat: repeatWanted })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setSelected([])
        loadStatus()
        loadOwnedPals()
      })
      .catch(err => setErrorMsg(err.message))
  }

  const claim = () => {
    fetch(`${API_URL}/api/farming/claim`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus(); loadPlayer(); loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const stopRepeat = () => {
    fetch(`${API_URL}/api/farming/stop-repeat`, { method: 'POST' }).then(loadStatus)
  }

  const bake = (type) => {
    if (!kindlingPal) { alert(t('chooseKindlingFirst')); return }
    setOvenError('')
    fetch(`${API_URL}/api/farming/bake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, kindlingCardNumber: kindlingPal.card_number })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        loadOvenStatus()
        loadOwnedPals()
      })
      .catch(err => setOvenError(err.message))
  }

  const claimOven = () => {
    fetch(`${API_URL}/api/farming/oven-claim`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        loadOvenStatus()
        loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const formatCountdown = (readyTime) => {
    const diff = new Date(readyTime).getTime() - now
    if (diff <= 0) return t('countdownMinSec')
    const m = Math.floor(diff / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${m}m ${s}s`
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
          backgroundImage: 'url(/feno.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          overflow: 'hidden', position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s ease, opacity 0.35s ease',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#3a2410', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>🌱 Farming</h2>
            {onClose
              ? <button onClick={onClose} style={{ fontSize: '13px', color: '#5c3418', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{t('exit')}</button>
              : <Link to="/" style={{ fontSize: '13px', color: '#5c3418', textDecoration: 'none', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{t('exit')}</Link>}
          </div>
          <div style={{ padding: '0 16px 16px', overflowY: 'auto', flex: 1, textAlign: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '16px', padding: '14px', marginBottom: '16px' }}>
      <p style={{ color: '#777' }}>{t('farmingIntro')}</p>

      {player && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
          <span>{t('wheatLabel')} <strong>{player.wheat}</strong></span>
          <span>{t('lettuceLabel')} <strong>{player.lettuce}</strong></span>
          <span>{t('tomatoLabel')} <strong>{player.tomato}</strong></span>
        </div>
      )}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
            {selected.map(card => (
              <div key={card.card_number} onClick={() => removePal(card.card_number)} style={{ cursor: 'pointer', width: '90px' }} title={t('clickToRemove')}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '8px' }} />
                <p style={{ fontSize: '9px', margin: '2px 0 0' }}>{(card.workKeywords || []).join(', ')}</p>
              </div>
            ))}
            {selected.length < 3 && (
              <div onClick={() => setPicking(true)} style={{ cursor: 'pointer', width: '90px', height: '126px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                {t('addPalPlaceholder')}
              </div>
            )}
          </div>

          <p style={{ fontSize: '12px' }}>
            {t('keywordStatus', { farming: hasFarming ? '✅' : '❌', harvesting: hasHarvesting ? '✅' : '❌', collecting: hasCollecting ? '✅' : '❌' })}
          </p>

          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '10px 0' }}>
            <input type="checkbox" checked={repeatWanted} onChange={e => setRepeatWanted(e.target.checked)} disabled={!hasCollecting} />
            {t('repeatCheckbox')}
          </label>

          <button onClick={startFarming} disabled={!canStart} style={{ padding: '12px 30px', opacity: canStart ? 1 : 0.5 }}>
            {t('startFarming')}
          </button>
          {errorMsg && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{errorMsg}</p>}
        </>
      )}

      {status && status.active && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            {status.pals.map(p => <img key={p.card_number} src={p.image_url} alt="" style={{ width: '70px', borderRadius: '6px' }} />)}
          </div>

          {status.repeat ? (
            <>
              <h3>{t('autoHarvesting')}</h3>
              <p>{t('harvestsDone', { n: status.harvestCount })}</p>
              <p>{t('nextIn', { time: formatCountdown(status.readyTime) })}</p>
              <button onClick={stopRepeat} style={{ padding: '8px 16px', fontSize: '12px' }}>{t('stopRepeat')}</button>
            </>
          ) : status.isReady ? (
            <>
              <h3>{t('readyToHarvest')}</h3>
              <button onClick={claim} style={{ padding: '12px 30px' }}>{t('harvest')}</button>
            </>
          ) : (
            <>
              <h3>{t('growing')}</h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCountdown(status.readyTime)}</p>
              <div style={{ width: '100%', maxWidth: '400px', margin: '10px auto', background: '#eee', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, ((now - new Date(status.startTime).getTime()) / (new Date(status.readyTime).getTime() - new Date(status.startTime).getTime())) * 100)}%`,
                  height: '100%', background: 'linear-gradient(90deg, #7cb342, #aed581)', transition: 'width 1s linear'
                }} />
              </div>
            </>
          )}
        </div>
      )}
      </div>

      <div style={{
        marginTop: '24px', borderRadius: '16px', padding: '16px',
        backgroundImage: 'url(/fire.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        borderTop: '3px solid #2b160a'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.88)', borderRadius: '12px', padding: '14px' }}>
        <h3 style={{ marginTop: 0 }}>{t('ovenTitle')}</h3>

        {ovenStatus && ovenStatus.active ? (
          <div>
            <div style={{ marginBottom: '10px' }}>
              {ovenStatus.kindlingPal && (
                <img src={ovenStatus.kindlingPal.image_url} alt={ovenStatus.kindlingPal.name} style={{ width: '60px', borderRadius: '6px' }} />
              )}
            </div>
            <img src={ovenStatus.type === 'special_cake' ? '/Special_Cake_icon.webp' : '/Cake_icon.webp'} alt="" style={{ width: '50px' }} />
            {ovenStatus.isReady ? (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('ovenReady')}</h4>
                <button onClick={claimOven} style={{ padding: '10px 24px' }}>{t('takeFromOven')}</button>
              </>
            ) : (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('baking')}</h4>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatCountdown(ovenStatus.readyTime)}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              {kindlingPal ? (
                <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', display: 'inline-block' }} title={t('clickToSwap')}>
                  <img src={kindlingPal.image_url} alt={kindlingPal.name} style={{ width: '60px', borderRadius: '6px' }} />
                  <p style={{ fontSize: '10px', margin: '2px 0 0' }}>{t('kindlingSuffix', { name: kindlingPal.name })}</p>
                </div>
              ) : (
                <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', width: '60px', height: '84px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '0 auto', fontSize: '10px', textAlign: 'center' }}>
                  {t('addKindlingPlaceholder')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <img src="/Cake_icon.webp" alt="Cake" style={{ width: '50px' }} />
                <p style={{ fontSize: '12px' }}>{t('ingredientsFor10')}</p>
                <button onClick={() => bake('cake')} disabled={!player || !kindlingPal || player.wheat < 10 || player.lettuce < 10 || player.tomato < 10}>
                  {t('bakeCake')}
                </button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <img src="/Special_Cake_icon.webp" alt="Special Cake" style={{ width: '50px' }} />
                <p style={{ fontSize: '12px' }}>{t('ingredientsFor30')}</p>
                <button onClick={() => bake('special_cake')} disabled={!player || !kindlingPal || player.wheat < 30 || player.lettuce < 30 || player.tomato < 30}>
                  {t('bakeSpecialCake')}
                </button>
              </div>
            </div>
            {ovenError && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>{ovenError}</p>}
          </>
        )}
        </div>
      </div>

      {pickingKindling && (
        <CardPicker
          ownedPals={ownedPals}
          selectedNumbers={[]}
          requiredKeywords={['kindling']}
          onClose={() => setPickingKindling(false)}
          onSelect={(card) => { setKindlingPal(card); setPickingKindling(false) }}
        />
      )}

      {picking && (
        <CardPicker
          ownedPals={ownedPals}
          selectedNumbers={selected.map(c => c.card_number)}
          requiredKeywords={['farming', 'harvesting', 'collecting']}
          onClose={() => setPicking(false)}
          onSelect={addPal}
        />
      )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Farming