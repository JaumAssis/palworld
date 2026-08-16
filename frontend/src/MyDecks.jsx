import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch, apiJson } from './api'

const COLOR_STYLES = {
  Red: { bg: '#fde2e1', text: '#c62828' },
  Blue: { bg: '#e1ecfd', text: '#1565c0' },
  Green: { bg: '#e3f5e1', text: '#2e7d32' },
  Purple: { bg: '#ede1fd', text: '#6a1b9a' },
  Colorless: { bg: '#eee', text: '#555' }
}

// Mesma tabela usada no backend/MyCollection — OSR/SP/SSP/TSP ficam de fora de propósito
// (só saem via Breeding/booster/mercado, nunca craft).
const CRAFT_COSTS = { RR: 100, R: 50, U: 30, C: 15, SR: 150, TSR: 150 }
const getCraftCost = (card) => {
  if (card.card_type === 'Soul') return null // Soul nunca é craftável — mesmo espelho do backend
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

function ColorChip({ color }) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.Colorless
  return (
    <span style={{
      background: style.bg, color: style.text,
      fontSize: 'var(--fs-2xs)', fontWeight: 600, padding: 'var(--sp-2xs) var(--sp-sm)',
      borderRadius: '999px'
    }}>{color}</span>
  )
}

// ---------- Lista de decks ----------
function DeckList() {
  const { t, lang } = useLanguage()
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [deckToDelete, setDeckToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/api/decks')
      .then(res => res.json())
      .then(data => { setDecks(data); setLoading(false) })
  }, [])

  const confirmDelete = async () => {
    try {
      await apiJson(`/api/decks/${deckToDelete.id}`, { method: 'DELETE' })
      setDecks(prev => prev.filter(d => d.id !== deckToDelete.id))
      setDeckToDelete(null)
    } catch {
      setDeleteError(t('deleteDeckError'))
    }
  }

  if (loading) return <p style={{ padding: '2rem' }}>{t('decksLoading')}</p>

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: 'var(--sp-xl)', maxWidth: 'min(94vw, 1000px)', margin: '0 auto' }}>
      <Link to="/" style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)' }}>
        <button className="sign-button sign-button-fluid">{t('backToMenu')}</button>
      </Link>
      <h1 style={{
        marginBottom: '20px', fontFamily: "'Rye', Georgia, serif", fontSize: 'var(--fs-xl)',
        color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
        textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
      }}>{t('myDecksTitle')}</h1>

      {decks.length === 0 && (
        <p style={{ color: '#d9c4a3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('noDecksSaved')}</p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(180px, 16vw, 260px), 1fr))',
        gap: 'var(--sp-lg)'
      }}>
        {decks.map(deck => {
          const gradient = deck.colors.length === 2
            ? `linear-gradient(135deg, ${COLOR_STYLES[deck.colors[0]]?.bg || '#ddd'}, ${COLOR_STYLES[deck.colors[1]]?.bg || '#ddd'})`
            : `linear-gradient(135deg, ${COLOR_STYLES[deck.colors[0]]?.bg || '#ddd'}, #fff)`

          const [palA, palB] = deck.luckyPals || []

          return (
            <div
              key={deck.id}
              onClick={() => navigate(`/mydecks/${deck.id}`)}
              style={{
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                border: deck.isDraft ? '3px solid #888' : '3px solid #c99a4e',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                background: deck.isDraft ? '#ccc' : '#fff'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.35)'
              }}
            >
              <div style={{ height: '110px', position: 'relative', background: gradient, overflow: 'hidden' }}>
                {palA && (
                  <img src={palA.image_url} alt={palA.name}
                       style={{
                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                         objectFit: 'cover', objectPosition: 'top',
                         clipPath: palB ? 'polygon(0 0, 60% 0, 40% 100%, 0 100%)' : 'none'
                       }} />
                )}
                {palB && (
                  <img src={palB.image_url} alt={palB.name}
                       style={{
                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                         objectFit: 'cover', objectPosition: 'top',
                         clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                       }} />
                )}
                {palA && palB && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    clipPath: 'polygon(58% 0, 62% 0, 42% 100%, 38% 100%)',
                    background: 'rgba(255,255,255,0.6)'
                  }} />
                )}
                {palA && palB && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.35))'
                  }} />
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '10px', display: 'flex', gap: '6px' }}>
                  {deck.colors.map(c => <ColorChip key={c} color={c} />)}
                </div>
                <span style={{
                  position: 'absolute', top: '8px', right: '8px', fontSize: 'var(--fs-2xs)', fontWeight: 700,
                  padding: 'var(--sp-2xs) var(--sp-xs)', borderRadius: '999px', color: '#fff',
                  background: deck.mode === 'rank' ? '#a5541b' : '#3f6b3f'
                }}>{deck.mode === 'rank' ? '🏆 Rank' : '🎲 Normal'}</span>
                {deck.isDraft && (
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px', fontSize: 'var(--fs-2xs)', fontWeight: 700,
                    padding: 'var(--sp-2xs) var(--sp-xs)', borderRadius: '999px', color: '#fff', background: '#555'
                  }}>{t('draftBadge')}</span>
                )}
              </div>
              <div style={{ padding: 'var(--sp-md)', position: 'relative' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: 'var(--fs-md)' }}>{deck.name}</h3>
                <p style={{ margin: 0, fontSize: 'var(--fs-2xs)', color: '#999' }}>
                  {t('createdAt', { date: new Date(deck.created_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US') })}
                </p>
                <span
                  onClick={e => { e.stopPropagation(); navigate(`/deckbuilder/${deck.id}`) }}
                  title={t('editDeckTitle', { name: deck.name })}
                  style={{
                    position: 'absolute', bottom: '10px', left: '10px', fontSize: 'var(--fs-lg)',
                    cursor: 'pointer', lineHeight: 1
                  }}
                >📝</span>
                <span
                  onClick={e => { e.stopPropagation(); setDeleteError(''); setDeckToDelete(deck) }}
                  title={t('deleteDeckConfirm', { name: deck.name })}
                  style={{
                    position: 'absolute', bottom: '10px', right: '10px', fontSize: 'var(--fs-lg)',
                    cursor: 'pointer', lineHeight: 1
                  }}
                >🗑️</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>

      {deckToDelete && (
        <div onClick={() => setDeckToDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#2b1a10', border: '3px solid #c99a4e', borderRadius: '14px',
            padding: 'var(--sp-xl)', maxWidth: 'var(--panel-w-xs)', textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            <p style={{ color: '#f3e2b3', fontSize: 'var(--fs-md)', marginBottom: deleteError ? '8px' : '20px' }}>
              {t('deleteDeckConfirm', { name: deckToDelete.name })}
            </p>
            {deleteError && (
              <p style={{ color: '#e57373', fontSize: 'var(--fs-sm)', marginBottom: '16px' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={confirmDelete} style={{ padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)' }}>{t('deleteDeckYes')}</button>
              <button onClick={() => setDeckToDelete(null)} style={{ padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)' }}>{t('deleteDeckNo')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Detalhe de 1 deck ----------
function DeckDetail() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [deck, setDeck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [zoomCard, setZoomCard] = useState(null)
  const [ownedMap, setOwnedMap] = useState({})
  const [palFluid, setPalFluid] = useState(0)
  const [craftMsg, setCraftMsg] = useState('')
  const [crafting, setCrafting] = useState(false)
  const [craftAllMsg, setCraftAllMsg] = useState('')
  const [craftingAll, setCraftingAll] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const [copyFallbackText, setCopyFallbackText] = useState(null)
  const [modeSwitching, setModeSwitching] = useState(false)
  const [modeSwitchMsg, setModeSwitchMsg] = useState('')

  const loadOwnedCards = () => {
    apiFetch('/api/player/cards').then(res => res.json()).then(rows => {
      const map = {}
      rows.forEach(r => { map[r.card_number] = { quantity: r.quantity, reserved: r.reserved } })
      setOwnedMap(map)
    })
  }

  useEffect(() => {
    apiFetch(`/api/decks/${id}`)
      .then(res => res.json())
      .then(data => { setDeck(data); setLoading(false) })
    loadOwnedCards()
    apiFetch('/api/player').then(res => res.json()).then(p => setPalFluid(p.pal_fluid))
  }, [id])

  // Quantas cópias dessa carta o jogador tem disponíveis agora (só importa pra deck Rank).
  const getAvailable = (cardNumber) => {
    const entry = ownedMap[cardNumber]
    if (!entry) return 0
    return Math.max(0, entry.quantity - entry.reserved)
  }

  if (loading) return <p style={{ padding: '2rem' }}>{t('deckLoading')}</p>
  if (!deck) return <p style={{ padding: '2rem' }}>{t('deckNotFound')}</p>

  // Agrupa por card_number (não por nome) pra mostrar xN — uma arte alterada (mesmo nome, outro
  // card_number, ex: Relaxaurus normal vs Relaxaurus SP) é uma impressão diferente e precisa da
  // própria linha "1x", senão ela se funde silenciosamente na entrada da arte normal e mostra "2x"
  // de uma cópia só (mesmo bug já corrigido em DeckBuilder.jsx/Roguelike.jsx).
  const groupCards = (cards) => Object.values(
    cards.reduce((acc, c) => {
      if (!acc[c.card_number]) acc[c.card_number] = { card: c, count: 0 }
      acc[c.card_number].count++
      return acc
    }, {})
  )

  const mainGrouped = groupCards(deck.mainDeck)
  const soulGrouped = groupCards(deck.soulDeck)

  // SOUL-001 nunca conta como "faltando" — é recurso estrutural sem posse de verdade (mesmo
  // raciocínio de computeDeckIsDraft no server.js: só sai de Trial Deck, que tampa em 4 cópias,
  // nunca dá pra "possuir" as 10 que o Soul Deck pede). Sem essa exceção, a carta Soul aparecia
  // pra sempre acinzentada/"incompleta" na tela, mesmo o deck estando de fato completo.
  const missingCount = (card, count) => (deck.mode === 'rank' && card.card_number !== 'SOUL-001')
    ? Math.max(0, count - getAvailable(card.card_number)) : 0

  const totalMissingCost = () => {
    let total = 0
    for (const { card, count } of mainGrouped) {
      const missing = missingCount(card, count)
      const cost = getCraftCost(card)
      if (missing > 0 && cost) total += missing * cost
    }
    return total
  }

  const handleCraft = (card) => {
    setCrafting(true)
    setCraftMsg('')
    apiFetch('/api/collection/craft', { method: 'POST', body: JSON.stringify({ cardNumber: card.card_number }) })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPalFluid(data.palFluid)
        setOwnedMap(prev => ({ ...prev, [card.card_number]: { quantity: data.newQuantity, reserved: prev[card.card_number]?.reserved || 0 } }))
      })
      .catch(err => setCraftMsg(err.message || t('saveDeckError')))
      .finally(() => setCrafting(false))
  }

  const handleCraftAll = () => {
    setCraftingAll(true)
    setCraftAllMsg('')
    apiFetch(`/api/decks/${id}/craft-missing`, { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setDeck(prev => ({ ...prev, isDraft: data.isDraft }))
        setPalFluid(data.palFluid)
        loadOwnedCards()
      })
      .catch(err => setCraftAllMsg(err.message || t('saveDeckError')))
      .finally(() => setCraftingAll(false))
  }

  // Mesmo formato que o import do DeckBuilder entende: "<qtd> <nome> (<CARD_NUMBER>)", uma carta
  // por linha, comentários com "#" ignorados pelo parser. Os cabeçalhos de formato/cores aqui são
  // só informativos pra quem está lendo o texto — o import não depende deles.
  const buildDeckText = () => {
    const lines = [
      `# Formato: ${deck.mode === 'rank' ? 'Rank' : 'Normal'}`,
      `# Cores: ${deck.colors.length ? deck.colors.join(', ') : '—'}`,
      ...mainGrouped.map(({ card, count }) => `${count} ${card.name} (${card.card_number})`),
      ...soulGrouped.map(({ card, count }) => `${count} ${card.name} (${card.card_number})`)
    ]
    return lines.join('\n')
  }

  const handleCopyDeckText = () => {
    const text = buildDeckText()
    if (!navigator.clipboard?.writeText) { setCopyFallbackText(text); return }
    navigator.clipboard.writeText(text)
      .then(() => { setCopyMsg(t('deckCopiedMsg')); setTimeout(() => setCopyMsg(''), 3000) })
      .catch(() => setCopyFallbackText(text))
  }

  // Mudar o formato recalcula "rascunho" na hora, com base nas cópias que o jogador REALMENTE
  // tem (mesma regra usada ao salvar/editar no DeckBuilder) — reenvia o deck inteiro porque o PUT
  // espera o payload completo, não um patch parcial.
  const toggleDeckMode = () => {
    if (!deck) return
    const newMode = deck.mode === 'rank' ? 'normal' : 'rank'
    setModeSwitching(true)
    setModeSwitchMsg('')
    apiFetch(`/api/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: deck.name,
        mainDeckCardNumbers: deck.mainDeck.map(c => c.card_number),
        soulDeckCardNumbers: deck.soulDeck.map(c => c.card_number),
        colors: deck.colors,
        mode: newMode
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setDeck(prev => ({ ...prev, mode: newMode, isDraft: data.isDraft }))
        loadOwnedCards()
      })
      .catch(err => setModeSwitchMsg(err.message || t('saveDeckError')))
      .finally(() => setModeSwitching(false))
  }

  const CardTile = ({ card, count }) => {
    const missing = missingCount(card, count)
    return (
      <div key={card.card_number} style={{ textAlign: 'center' }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => { setCraftMsg(''); setZoomCard(card) }}
        >
          <img src={card.image_url} alt={card.name}
               style={{
                 width: '100%', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.4)', border: '2px solid #c99a4e',
                 filter: missing > 0 ? 'grayscale(100%)' : 'none', opacity: missing > 0 ? 0.35 : 1
               }}
               onError={e => e.target.style.display = 'none'} />
          <span style={{
            position: 'absolute', bottom: '4px', right: '4px',
            background: 'rgba(0,0,0,0.75)', color: '#fff',
            fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: 'var(--sp-2xs) var(--sp-xs)', borderRadius: '6px'
          }}>x{count}</span>
        </div>
        <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0', color: '#d9c4a3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{card.name}</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: 'var(--sp-xl)', maxWidth: 'min(94vw, 1100px)', margin: '0 auto' }}>
      <Link to="/mydecks"><button style={{ marginBottom: '16px', fontSize: 'var(--fs-sm)' }}>{t('backToDecks')}</button></Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', marginBottom: '20px' }}>
        <h1 style={{
          margin: 0, fontFamily: "'Rye', Georgia, serif", fontSize: 'var(--fs-xl)',
          color: '#f3e2b3', WebkitTextStroke: '1px #2b160a',
          textShadow: '2px 2px 0 #000, 0 0 14px rgba(0,0,0,0.6)'
        }}>{deck.name}</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {deck.colors.map(c => <ColorChip key={c} color={c} />)}
        </div>
        <span style={{
          fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: 'var(--sp-2xs) var(--sp-sm)', borderRadius: '999px', color: '#fff',
          background: deck.mode === 'rank' ? '#a5541b' : '#3f6b3f'
        }}>{deck.mode === 'rank' ? '🏆 Rank' : '🎲 Normal'}</span>
        {deck.isDraft && (
          <span style={{
            fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: 'var(--sp-2xs) var(--sp-sm)', borderRadius: '999px', color: '#fff', background: '#555'
          }}>{t('draftBadge')}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-sm)', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={handleCopyDeckText} style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-sm)' }}>
          {t('copyDeckButton')}
        </button>
        <button onClick={toggleDeckMode} disabled={modeSwitching} style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-sm)', opacity: modeSwitching ? 0.6 : 1 }}>
          {deck.mode === 'rank' ? t('switchToNormalButton') : t('switchToRankButton')}
        </button>
        {copyMsg && <span style={{ color: '#6cf25a', fontSize: 'var(--fs-2xs)' }}>{copyMsg}</span>}
        {modeSwitchMsg && <span style={{ color: '#e57373', fontSize: 'var(--fs-2xs)' }}>{modeSwitchMsg}</span>}
      </div>

      <h3 style={{ marginBottom: '10px', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('mainDeckCount', { n: deck.mainDeck.length })}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px, 10vw, 160px), 1fr))',
        gap: 'var(--sp-sm)',
        marginBottom: 'var(--sp-xl)'
      }}>
        {mainGrouped.map(({ card, count }) => (
          <CardTile key={card.card_number} card={card} count={count} />
        ))}
      </div>

      <h3 style={{ marginBottom: '10px', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{t('soulDeckCount', { n: deck.soulDeck.length })}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px, 10vw, 160px), 1fr))',
        gap: 'var(--sp-sm)'
      }}>
        {soulGrouped.map(({ card, count }) => (
          <CardTile key={card.card_number} card={card} count={count} />
        ))}
      </div>

      {deck.mode === 'rank' && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          {totalMissingCost() > 0 ? (
            <>
              <button
                onClick={handleCraftAll}
                disabled={craftingAll || palFluid < totalMissingCost()}
                className="sign-button sign-button-fluid"
                style={{ opacity: (craftingAll || palFluid < totalMissingCost()) ? 0.5 : 1 }}
              >
                {t('craftAllButton', { cost: totalMissingCost() })}
              </button>
              {craftAllMsg && <p style={{ color: '#e57373', fontSize: 'var(--fs-2xs)', marginTop: '8px' }}>{craftAllMsg}</p>}
            </>
          ) : (
            <p style={{ color: '#6cf25a', fontSize: 'var(--fs-sm)' }}>{t('deckCompleteMsg')}</p>
          )}
        </div>
      )}
    </div>

      {zoomCard && (() => {
        const groupedEntry = [...mainGrouped, ...soulGrouped].find(g => g.card.card_number === zoomCard.card_number)
        const count = groupedEntry ? groupedEntry.count : 1
        const missing = missingCount(zoomCard, count)
        const cost = getCraftCost(zoomCard)
        const canAfford = palFluid >= (cost || 0)
        return (
          <div onClick={() => setZoomCard(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'zoom-out'
          }}>
            <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
              <img src={zoomCard.image_url} alt={zoomCard.name}
                   style={{
                     maxWidth: '90vw', maxHeight: '80vh', borderRadius: '14px',
                     border: '4px solid #c99a4e', boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                     filter: missing > 0 ? 'grayscale(100%)' : 'none', opacity: missing > 0 ? 0.6 : 1
                   }} />
              <p style={{
                marginTop: '12px', color: '#f3e2b3', fontSize: 'var(--fs-md)',
                textShadow: '2px 2px 0 #000'
              }}>{zoomCard.name}</p>

              {missing > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ color: '#ffcf7a', fontSize: 'var(--fs-sm)' }}>{t('missingCopiesMsg', { missing })}</p>
                  {cost ? (
                    <>
                      <p style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)' }}>{t('yourPalFluid')} <strong>{palFluid}</strong>{t('costSuffix', { cost })}</p>
                      <button
                        onClick={() => handleCraft(zoomCard)}
                        disabled={crafting || !canAfford}
                        style={{ padding: 'var(--sp-sm) var(--sp-lg)', fontSize: 'var(--fs-sm)', fontWeight: 600, opacity: (crafting || !canAfford) ? 0.5 : 1 }}>
                        {t('craftBtn', { cost })}
                      </button>
                    </>
                  ) : (
                    <p style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)' }}>{t('cannotCraftRarity')}</p>
                  )}
                  {craftMsg && <p style={{ color: '#e57373', fontSize: 'var(--fs-2xs)', marginTop: '6px' }}>{craftMsg}</p>}
                </div>
              )}

              <button onClick={() => setZoomCard(null)} style={{ marginTop: '10px', padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-sm)' }}>{t('close')}</button>
            </div>
          </div>
        )
      })()}

      {copyFallbackText && (
        <div onClick={() => setCopyFallbackText(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#2b1a10', border: '3px solid #c99a4e', borderRadius: '14px',
            padding: 'var(--sp-lg)', width: 'var(--panel-w-sm)', maxWidth: '90vw', boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
          }}>
            <p style={{ color: '#f3e2b3', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>{t('deckCopyFallbackHint')}</p>
            <textarea
              readOnly
              value={copyFallbackText}
              onFocus={e => e.target.select()}
              style={{
                width: '100%', height: 'clamp(180px, 22vh, 320px)', fontFamily: 'monospace', fontSize: 'var(--fs-2xs)',
                padding: 'var(--sp-xs)', borderRadius: '8px', border: '2px solid #8a5a2e', resize: 'vertical'
              }}
            />
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button onClick={() => setCopyFallbackText(null)} style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-sm)' }}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DeckList, DeckDetail }