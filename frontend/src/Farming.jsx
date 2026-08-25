import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

const OVEN_RECIPE_AMOUNTS = { cake: 10, special_cake: 30 }
const WORKBENCH_BAIT_INGREDIENT_COST = 40

function CardPicker({ onSelect, onClose, ownedPals, selectedNumbers, requiredKeywords }) {
  const { t } = useLanguage()
  const hardFiltered = requiredKeywords
    ? ownedPals.filter(c => (c.workKeywords || []).some(k => requiredKeywords.includes(k.toLowerCase())))
    : ownedPals

  // Filtro leve de keyword em cima do filtro fixo acima — só mostra chips pras keywords que
  // fazem sentido nesse contexto (requiredKeywords), pra deixar visível/selecionável qual Pal
  // tem qual keyword de trabalho, em vez de só o texto cinza sem nenhum jeito de filtrar por ele.
  const [selectedKeywords, setSelectedKeywords] = useState(new Set())
  const toggleKeyword = (kw) => setSelectedKeywords(prev => {
    const next = new Set(prev)
    if (next.has(kw)) next.delete(kw); else next.add(kw)
    return next
  })
  // Busca por nome — combina COM o filtro de keyword (os 2 precisam bater), útil quando o jogador
  // tem muitos Pals com a mesma keyword e já sabe qual quer.
  const [nameQuery, setNameQuery] = useState('')
  const byKeyword = selectedKeywords.size === 0
    ? hardFiltered
    : hardFiltered.filter(c => (c.workKeywords || []).some(k => selectedKeywords.has(k.toLowerCase())))
  const filtered = nameQuery.trim()
    ? byKeyword.filter(c => c.name.toLowerCase().includes(nameQuery.trim().toLowerCase()))
    : byKeyword

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '14px', width: 'var(--panel-w-sm)', maxWidth: '90vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-md) var(--sp-lg) var(--sp-xs)', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--fs-lg)', color: '#2b160a' }}>{t('choosePalKeywordsTitle')}</h3>
          <button onClick={onClose} title={t('close')} style={{ background: 'none', border: 'none', fontSize: 'var(--fs-lg)', lineHeight: 1, color: '#666', cursor: 'pointer', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
          <input
            type="text"
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            placeholder={t('searchPalByNamePlaceholder')}
            style={{ width: '100%', padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)', boxSizing: 'border-box' }}
          />
        </div>
        {requiredKeywords && requiredKeywords.length > 1 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '0 20px 10px', flexShrink: 0 }}>
            {requiredKeywords.map(kw => (
              <button
                key={kw}
                onClick={() => toggleKeyword(kw)}
                style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: 'var(--fs-2xs)', cursor: 'pointer',
                  border: selectedKeywords.has(kw) ? '2px solid #a5541b' : '1px solid #ccc',
                  background: selectedKeywords.has(kw) ? '#fde9d2' : '#fff',
                  color: selectedKeywords.has(kw) ? '#a5541b' : '#3a2410', textTransform: 'capitalize'
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        )}
        <div style={{ padding: '0 20px 20px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(85px, 9vw, 120px), 1fr))', gap: 'var(--sp-sm)' }}>
            {filtered.map(card => {
              const already = selectedNumbers.includes(card.card_number)
              return (
                <div key={card.card_number} onClick={() => !already && onSelect(card)}
                     style={{ cursor: already ? 'not-allowed' : 'pointer', opacity: already ? 0.4 : 1, textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '5 / 7', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
                    <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                         onError={e => { e.target.style.visibility = 'hidden' }} />
                  </div>
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0', fontWeight: 600, color: '#2b160a' }}>{card.name}</p>
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: 0, color: '#777' }}>{(card.workKeywords || []).join(', ') || '—'}</p>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && <p style={{ color: '#999', fontSize: 'var(--fs-sm)' }}>{t('noPalsWithSkill')}</p>}
        </div>
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
  // Contagens regressivas decrementadas localmente a partir do remainingMs que o SERVIDOR calculou
  // (ver computeTiming em server.js) — nunca comparando readyTime com o relógio do navegador, senão
  // um relógio do PC adiantado mostra "pronto" cedo demais e o resgate falha (o servidor não confia
  // nisso). Farming e forno rodam em paralelo, cada um com seu próprio contador.
  const [farmRemainingMs, setFarmRemainingMs] = useState(null)
  const [ovenRemainingMs, setOvenRemainingMs] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [kindlingPal, setKindlingPal] = useState(null)
  const [pickingKindling, setPickingKindling] = useState(false)
  const [ovenStatus, setOvenStatus] = useState(null)
  const [ovenError, setOvenError] = useState('')
  const [bakeQty, setBakeQty] = useState({ cake: 1, special_cake: 1 })
  const [crafterPal, setCrafterPal] = useState(null)
  const [pickingCrafter, setPickingCrafter] = useState(false)
  const [workbenchStatus, setWorkbenchStatus] = useState(null)
  const [workbenchError, setWorkbenchError] = useState('')
  const [workbenchRemainingMs, setWorkbenchRemainingMs] = useState(null)
  const [craftQty, setCraftQty] = useState(1)

  useEffect(() => {
    loadOwnedPals()
    loadStatus()
    loadPlayer()
    loadOvenStatus()
    loadWorkbenchStatus()
    const tickInterval = setInterval(() => {
      setFarmRemainingMs(ms => (ms == null ? null : Math.max(0, ms - 1000)))
      setOvenRemainingMs(ms => (ms == null ? null : Math.max(0, ms - 1000)))
      setWorkbenchRemainingMs(ms => (ms == null ? null : Math.max(0, ms - 1000)))
    }, 1000)
    const pollInterval = setInterval(() => { loadStatus(); loadPlayer(); loadOvenStatus(); loadWorkbenchStatus(); loadOwnedPals() }, 4000)
    const openTimeout = setTimeout(() => setIsOpen(true), 100)
    return () => { clearInterval(tickInterval); clearInterval(pollInterval); clearTimeout(openTimeout) }
  }, [])

  function loadPlayer() {
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
  }

  function loadOwnedPals() {
    Promise.all([
      apiFetch('/api/cards').then(r => r.json()),
      apiFetch('/api/player/cards').then(r => r.json())
    ]).then(([allCards, owned]) => {
      // só mostra Pals com pelo menos 1 cópia disponível — as ocupadas em outra tarefa não aparecem
      const availableNumbers = new Set(owned.filter(o => o.quantity - o.reserved > 0).map(o => o.card_number))
      // `allCards` já vem com `extra_data` (work_keywords inclusos) — nada de buscar carta por carta aqui.
      const pals = allCards
        .filter(c => c.card_type === 'Pal' && availableNumbers.has(c.card_number))
        .map(c => ({ ...c, workKeywords: c.extra_data ? (JSON.parse(c.extra_data)?.data?.work_keywords || []) : [] }))
      setOwnedPals(pals)
    })
  }

  function loadStatus() {
    apiFetch('/api/farming/status').then(r => r.json()).then(data => {
      setStatus(data)
      if (data.active) setFarmRemainingMs(data.remainingMs)
    })
  }

  function loadOvenStatus() {
    apiFetch('/api/farming/oven-status').then(r => r.json()).then(data => {
      setOvenStatus(data)
      if (data.active) setOvenRemainingMs(data.remainingMs)
    })
  }

  function loadWorkbenchStatus() {
    apiFetch('/api/farming/workbench-status').then(r => r.json()).then(data => {
      setWorkbenchStatus(data)
      if (data.active) setWorkbenchRemainingMs(data.remainingMs)
    })
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
    apiFetch('/api/farming/start', {
      method: 'POST',
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
    apiFetch('/api/farming/claim', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        loadStatus(); loadPlayer(); loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const stopRepeat = () => {
    apiFetch('/api/farming/stop-repeat', { method: 'POST' }).then(loadStatus)
  }

  // Quantas unidades dessa receita o jogador tem ingrediente pra fazer de uma vez (limita o botão "+").
  const maxBakeQty = (type) => {
    if (!player) return 1
    return Math.max(0, Math.floor(Math.min(player.wheat, player.lettuce, player.tomato) / OVEN_RECIPE_AMOUNTS[type]))
  }

  const changeBakeQty = (type, delta) => {
    setBakeQty(prev => {
      const next = prev[type] + delta
      if (next < 1 || next > maxBakeQty(type)) return prev
      return { ...prev, [type]: next }
    })
  }

  const bake = (type) => {
    if (!kindlingPal) { alert(t('chooseKindlingFirst')); return }
    setOvenError('')
    apiFetch('/api/farming/bake', {
      method: 'POST',
      body: JSON.stringify({ type, kindlingCardNumber: kindlingPal.card_number, quantity: bakeQty[type] })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        setBakeQty(prev => ({ ...prev, [type]: 1 }))
        loadOvenStatus()
        loadOwnedPals()
      })
      .catch(err => setOvenError(err.message))
  }

  const claimOven = () => {
    apiFetch('/api/farming/oven-claim', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        loadOvenStatus()
        loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  // Quantas Iscas o jogador tem ingrediente pra fazer de uma vez (40 de cada por unidade).
  const maxCraftQty = () => {
    if (!player) return 1
    return Math.max(0, Math.floor(Math.min(player.wheat, player.lettuce, player.tomato) / WORKBENCH_BAIT_INGREDIENT_COST))
  }

  const changeCraftQty = (delta) => {
    setCraftQty(prev => {
      const next = prev + delta
      if (next < 1 || next > maxCraftQty()) return prev
      return next
    })
  }

  const craftBait = () => {
    if (!crafterPal) { alert(t('chooseCrafterFirst')); return }
    setWorkbenchError('')
    apiFetch('/api/farming/craft-bait', {
      method: 'POST',
      body: JSON.stringify({ crafterCardNumber: crafterPal.card_number, quantity: craftQty })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        setCraftQty(1)
        loadWorkbenchStatus()
        loadOwnedPals()
      })
      .catch(err => setWorkbenchError(err.message))
  }

  const claimWorkbench = () => {
    apiFetch('/api/farming/workbench-claim', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPlayer(data)
        loadWorkbenchStatus()
        loadOwnedPals()
      })
      .catch(err => alert(err.message))
  }

  const formatCountdown = (ms) => {
    if (ms == null || ms <= 0) return t('countdownMinSec')
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}m ${s}s`
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
          backgroundImage: 'url(/feno.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          overflow: 'hidden', position: 'relative',
          transform: isOpen ? 'scale(1)' : 'scale(0.85)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.35s ease, opacity 0.35s ease',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', color: '#3a2410', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>🌱 Farming</h2>
            {onClose
              ? <button onClick={onClose} style={{ fontSize: 'var(--fs-sm)', color: '#5c3418', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{t('exit')}</button>
              : <Link to="/" style={{ fontSize: 'var(--fs-sm)', color: '#5c3418', textDecoration: 'none', fontWeight: 600, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>{t('exit')}</Link>}
          </div>
          <div style={{ padding: '0 16px 16px', overflowY: 'auto', flex: 1, textAlign: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '16px', padding: 'var(--sp-md)', marginBottom: '16px' }}>
      <p style={{ color: '#777', fontSize: 'var(--fs-sm)' }}>{t('farmingIntro')}</p>

      {player && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-lg)', marginBottom: '20px', fontSize: 'var(--fs-sm)' }}>
          <span>{t('wheatLabel')} <strong>{player.wheat}</strong></span>
          <span>{t('lettuceLabel')} <strong>{player.lettuce}</strong></span>
          <span>{t('tomatoLabel')} <strong>{player.tomato}</strong></span>
        </div>
      )}

      {status && !status.active && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
            {selected.map(card => (
              <div key={card.card_number} onClick={() => removePal(card.card_number)} style={{ cursor: 'pointer', width: 'clamp(75px, 8vw, 110px)' }} title={t('clickToRemove')}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '8px' }} />
                <p style={{ fontSize: 'var(--fs-2xs)', margin: '2px 0 0' }}>{(card.workKeywords || []).join(', ')}</p>
              </div>
            ))}
            {selected.length < 3 && (
              <div onClick={() => setPicking(true)} style={{ cursor: 'pointer', width: 'clamp(75px, 8vw, 110px)', height: 'clamp(105px, 11.5vw, 155px)', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 'var(--fs-2xs)' }}>
                {t('addPalPlaceholder')}
              </div>
            )}
          </div>

          <p style={{ fontSize: 'var(--fs-2xs)' }}>
            {t('keywordStatus', { farming: hasFarming ? '✅' : '❌', harvesting: hasHarvesting ? '✅' : '❌', collecting: hasCollecting ? '✅' : '❌' })}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
            <span style={{ fontSize: 'var(--fs-sm)', color: hasCollecting ? '#3a2410' : '#aaa' }}>{t('repeatCheckbox')}</span>
            <button
              type="button"
              onClick={() => setRepeatWanted(v => !v)}
              disabled={!hasCollecting}
              aria-pressed={repeatWanted}
              style={{
                width: '44px', height: '24px', borderRadius: '999px', border: 'none', padding: '3px',
                background: repeatWanted ? '#34c759' : '#ccc', flexShrink: 0,
                cursor: hasCollecting ? 'pointer' : 'not-allowed', opacity: hasCollecting ? 1 : 0.5,
                transition: 'background 0.2s ease'
              }}>
              <span style={{
                display: 'block', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'transform 0.2s ease',
                transform: repeatWanted ? 'translateX(20px)' : 'translateX(0)'
              }} />
            </button>
          </div>

          <button onClick={startFarming} disabled={!canStart} style={{ padding: 'var(--sp-sm) var(--sp-xl)', fontSize: 'var(--fs-sm)', opacity: canStart ? 1 : 0.5 }}>
            {t('startFarming')}
          </button>
          {errorMsg && <p style={{ color: 'red', fontSize: 'var(--fs-2xs)', marginTop: '8px' }}>{errorMsg}</p>}
        </>
      )}

      {status && status.active && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            {status.pals.map(p => <img key={p.card_number} src={p.image_url} alt="" style={{ width: 'clamp(60px, 6.5vw, 90px)', borderRadius: '6px' }} />)}
          </div>

          {status.repeat ? (
            <>
              <h3>{t('autoHarvesting')}</h3>
              <p>{t('harvestsDone', { n: status.harvestCount })}</p>
              <p>{t('nextIn', { time: formatCountdown(farmRemainingMs) })}</p>
              <button onClick={stopRepeat} style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-2xs)' }}>{t('stopRepeat')}</button>
            </>
          ) : status.isReady ? (
            <>
              <h3>{t('readyToHarvest')}</h3>
              <button onClick={claim} style={{ padding: 'var(--sp-sm) var(--sp-xl)', fontSize: 'var(--fs-sm)' }}>{t('harvest')}</button>
            </>
          ) : (
            <>
              <h3>{t('growing')}</h3>
              <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold' }}>{formatCountdown(farmRemainingMs)}</p>
              <div style={{ width: '100%', maxWidth: '400px', margin: '10px auto', background: '#eee', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (1 - (farmRemainingMs ?? status.totalMs) / status.totalMs) * 100)}%`,
                  height: '100%', background: 'linear-gradient(90deg, #7cb342, #aed581)', transition: 'width 1s linear'
                }} />
              </div>
            </>
          )}
        </div>
      )}
      </div>

      <div style={{
        marginTop: '24px', borderRadius: '16px', padding: 'var(--sp-lg)',
        backgroundImage: 'url(/fire.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        borderTop: '3px solid #2b160a'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.88)', borderRadius: '12px', padding: 'var(--sp-md)' }}>
        <h3 style={{ marginTop: 0 }}>{t('ovenTitle')}</h3>

        {ovenStatus && ovenStatus.active ? (
          <div>
            <div style={{ marginBottom: '10px' }}>
              {ovenStatus.kindlingPal && (
                <img src={ovenStatus.kindlingPal.image_url} alt={ovenStatus.kindlingPal.name} style={{ width: 'clamp(50px, 5.5vw, 75px)', borderRadius: '6px' }} />
              )}
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={ovenStatus.type === 'special_cake' ? '/Special_Cake_icon.webp' : '/Cake_icon.webp'} alt="" style={{ width: 'clamp(42px, 4.5vw, 62px)' }} />
              {ovenStatus.quantity > 1 && (
                <span style={{
                  position: 'absolute', bottom: '-4px', right: '-10px', background: '#3a2410', color: '#fff',
                  fontSize: 'var(--fs-2xs)', fontWeight: 700, borderRadius: '10px', padding: '1px 6px'
                }}>{t('bakeQuantityTimes', { qty: ovenStatus.quantity })}</span>
              )}
            </div>
            {ovenStatus.isReady ? (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('ovenReady')}</h4>
                <button onClick={claimOven} style={{ padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)' }}>{t('takeFromOven')}</button>
              </>
            ) : (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('baking')}</h4>
                <p style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold' }}>{formatCountdown(ovenRemainingMs)}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              {kindlingPal ? (
                <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', display: 'inline-block' }} title={t('clickToSwap')}>
                  <img src={kindlingPal.image_url} alt={kindlingPal.name} style={{ width: 'clamp(50px, 5.5vw, 75px)', borderRadius: '6px' }} />
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: '2px 0 0' }}>{t('kindlingSuffix', { name: kindlingPal.name })}</p>
                </div>
              ) : (
                <div onClick={() => setPickingKindling(true)} style={{ cursor: 'pointer', width: 'clamp(50px, 5.5vw, 75px)', height: 'clamp(70px, 7.5vw, 105px)', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '0 auto', fontSize: 'var(--fs-2xs)', textAlign: 'center' }}>
                  {t('addKindlingPlaceholder')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ type: 'cake', img: '/Cake_icon.webp', alt: 'Cake', ingredientsKey: 'ingredientsFor10', bakeKey: 'bakeCake' },
                { type: 'special_cake', img: '/Special_Cake_icon.webp', alt: 'Special Cake', ingredientsKey: 'ingredientsFor30', bakeKey: 'bakeSpecialCake' }
              ].map(({ type, img, alt, ingredientsKey, bakeKey }) => {
                const qty = bakeQty[type]
                const maxQty = maxBakeQty(type)
                const amount = OVEN_RECIPE_AMOUNTS[type]
                return (
                  <div key={type} style={{ textAlign: 'center' }}>
                    <img src={img} alt={alt} style={{ width: 'clamp(42px, 4.5vw, 62px)' }} />
                    <p style={{ fontSize: 'var(--fs-2xs)' }}>{t(ingredientsKey, { qty })}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                      <button type="button" onClick={() => changeBakeQty(type, -1)} disabled={qty <= 1}
                              style={{ width: 'clamp(24px, 2.4vw, 32px)', height: 'clamp(24px, 2.4vw, 32px)', padding: 0, fontSize: 'var(--fs-sm)' }}>−</button>
                      <strong style={{ fontSize: 'var(--fs-sm)', minWidth: '18px' }}>{qty}</strong>
                      <button type="button" onClick={() => changeBakeQty(type, 1)} disabled={qty >= maxQty}
                              style={{ width: 'clamp(24px, 2.4vw, 32px)', height: 'clamp(24px, 2.4vw, 32px)', padding: 0, fontSize: 'var(--fs-sm)' }}>+</button>
                    </div>
                    <button onClick={() => bake(type)} disabled={!player || !kindlingPal || player.wheat < amount * qty || player.lettuce < amount * qty || player.tomato < amount * qty} style={{ fontSize: 'var(--fs-sm)' }}>
                      {t(bakeKey)}
                    </button>
                  </div>
                )
              })}
            </div>
            {ovenError && <p style={{ color: 'red', fontSize: 'var(--fs-2xs)', marginTop: '8px' }}>{ovenError}</p>}
          </>
        )}
        </div>
      </div>

      <div style={{
        marginTop: '24px', borderRadius: '16px', padding: 'var(--sp-lg)',
        background: '#8a5a2b', borderTop: '3px solid #2b160a'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.88)', borderRadius: '12px', padding: 'var(--sp-md)' }}>
        <h3 style={{ marginTop: 0 }}>{t('workbenchTitle')}</h3>
        <p style={{ fontSize: 'var(--fs-2xs)', color: '#777', margin: '0 0 10px' }}>
          {t('baitCountLabel', { n: player?.bait_count ?? 0 })}
        </p>

        {workbenchStatus && workbenchStatus.active ? (
          <div>
            <div style={{ marginBottom: '10px' }}>
              {workbenchStatus.crafterPal && (
                <img src={workbenchStatus.crafterPal.image_url} alt={workbenchStatus.crafterPal.name} style={{ width: 'clamp(50px, 5.5vw, 75px)', borderRadius: '6px' }} />
              )}
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src="/Simple_Bait_icon.webp" alt="Isca" style={{ width: 'clamp(42px, 4.5vw, 62px)' }} />
              {workbenchStatus.quantity > 1 && (
                <span style={{
                  position: 'absolute', bottom: '-4px', right: '-10px', background: '#3a2410', color: '#fff',
                  fontSize: 'var(--fs-2xs)', fontWeight: 700, borderRadius: '10px', padding: '1px 6px'
                }}>{t('bakeQuantityTimes', { qty: workbenchStatus.quantity })}</span>
              )}
            </div>
            {workbenchStatus.isReady ? (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('workbenchReady')}</h4>
                <button onClick={claimWorkbench} style={{ padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)' }}>{t('takeFromWorkbench')}</button>
              </>
            ) : (
              <>
                <h4 style={{ margin: '8px 0' }}>{t('crafting')}</h4>
                <p style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold' }}>{formatCountdown(workbenchRemainingMs)}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              {crafterPal ? (
                <div onClick={() => setPickingCrafter(true)} style={{ cursor: 'pointer', display: 'inline-block' }} title={t('clickToSwap')}>
                  <img src={crafterPal.image_url} alt={crafterPal.name} style={{ width: 'clamp(50px, 5.5vw, 75px)', borderRadius: '6px' }} />
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: '2px 0 0' }}>{t('crafterSuffix', { name: crafterPal.name })}</p>
                </div>
              ) : (
                <div onClick={() => setPickingCrafter(true)} style={{ cursor: 'pointer', width: 'clamp(50px, 5.5vw, 75px)', height: 'clamp(70px, 7.5vw, 105px)', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '0 auto', fontSize: 'var(--fs-2xs)', textAlign: 'center' }}>
                  {t('addCrafterPlaceholder')}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <img src="/Simple_Bait_icon.webp" alt="Isca" style={{ width: 'clamp(42px, 4.5vw, 62px)' }} />
              <p style={{ fontSize: 'var(--fs-2xs)' }}>{t('ingredientsForBait', { qty: craftQty, amount: WORKBENCH_BAIT_INGREDIENT_COST * craftQty })}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                <button type="button" onClick={() => changeCraftQty(-1)} disabled={craftQty <= 1}
                        style={{ width: 'clamp(24px, 2.4vw, 32px)', height: 'clamp(24px, 2.4vw, 32px)', padding: 0, fontSize: 'var(--fs-sm)' }}>−</button>
                <strong style={{ fontSize: 'var(--fs-sm)', minWidth: '18px' }}>{craftQty}</strong>
                <button type="button" onClick={() => changeCraftQty(1)} disabled={craftQty >= maxCraftQty()}
                        style={{ width: 'clamp(24px, 2.4vw, 32px)', height: 'clamp(24px, 2.4vw, 32px)', padding: 0, fontSize: 'var(--fs-sm)' }}>+</button>
              </div>
              <button
                onClick={craftBait}
                disabled={!player || !crafterPal || player.wheat < WORKBENCH_BAIT_INGREDIENT_COST * craftQty || player.lettuce < WORKBENCH_BAIT_INGREDIENT_COST * craftQty || player.tomato < WORKBENCH_BAIT_INGREDIENT_COST * craftQty}
                style={{ fontSize: 'var(--fs-sm)' }}
              >
                {t('craftBaitButton')}
              </button>
            </div>
            {workbenchError && <p style={{ color: 'red', fontSize: 'var(--fs-2xs)', marginTop: '8px' }}>{workbenchError}</p>}
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

      {pickingCrafter && (
        <CardPicker
          ownedPals={ownedPals}
          selectedNumbers={[]}
          requiredKeywords={['crafting']}
          onClose={() => setPickingCrafter(false)}
          onSelect={(card) => { setCrafterPal(card); setPickingCrafter(false) }}
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