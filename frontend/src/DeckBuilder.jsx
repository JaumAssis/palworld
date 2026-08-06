import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { validateMainDeck, validateSoulDeck, countCopies, MAIN_DECK_SIZE, SOUL_DECK_SIZE, MAX_COPIES_PER_NAME, MAX_LUCKY_PALS, MAX_COLORS } from './deckValidator'
import { useLanguage } from './i18n/LanguageContext'

const API_URL = 'http://localhost:3001'

function countCopiesByNumber(deck, card) {
  return deck.filter(c => c.card_number === card.card_number).length
}

function DeckBuilder() {
  const { t } = useLanguage()
  const [allCards, setAllCards] = useState([])
  const [ownedMap, setOwnedMap] = useState({})
  const [mainDeck, setMainDeck] = useState([])
  const [soulDeck, setSoulDeck] = useState([])
  const [chosenColors, setChosenColors] = useState(new Set())
  const [filterType, setFilterType] = useState('Todos')
  const [search, setSearch] = useState('')
  const [validationMsg, setValidationMsg] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [deckMode, setDeckMode] = useState(null) // 'normal' ou 'rank' — perguntado ao entrar
  const [showModeModal, setShowModeModal] = useState(true)

  const showValidationMsg = (msg) => {
    setValidationMsg(msg)
    setTimeout(() => setValidationMsg(''), 3000)
  }

  // Quantas cópias dessa impressão exata (card_number) o jogador tem disponíveis agora
  // (posse total menos as que estão reservadas em Breeding/Farming/Forno)
  const getAvailable = (cardNumber) => {
    const entry = ownedMap[cardNumber]
    if (!entry) return 0
    return Math.max(0, entry.quantity - entry.reserved)
  }

  // No modo Rank, o Main Deck só pode usar cópias que o jogador realmente tem disponíveis;
  // o Soul Deck fica de fora dessa regra (a carta "Soul" não é craftável/dropável, não é "coleção").
  const selectMode = (newMode) => {
    if (newMode === 'rank') {
      const filterAllowed = (deck) => {
        const seen = {}
        const kept = []
        for (const c of deck) {
          seen[c.card_number] = (seen[c.card_number] || 0) + 1
          if (seen[c.card_number] <= getAvailable(c.card_number)) kept.push(c)
        }
        return kept
      }
      const newMain = filterAllowed(mainDeck)
      const removed = mainDeck.length - newMain.length
      setMainDeck(newMain)
      if (removed > 0) {
        showValidationMsg(t('rankActivatedMsg', { removed }))
      }
    }
    setDeckMode(newMode)
    setShowModeModal(false)
  }

  const handleImportDeck = () => {
    const lines = importText.split('\n')
    const newMain = []
    const newSoul = []
    const newColors = new Set()
    const mainCounts = {}
    let notFound = []
    let notEnough = 0

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || line.startsWith('//')) continue

      const match = line.match(/^(\d+)\s+.*\(([A-Za-z0-9-]+)\)\s*$/)
      if (!match) continue

      const qty = parseInt(match[1], 10)
      const cardNumber = match[2]
      const card = allCards.find(c => c.card_number === cardNumber)

      if (!card) {
        notFound.push(cardNumber)
        continue
      }

      for (let i = 0; i < qty; i++) {
        if (card.card_type === 'Soul') {
          newSoul.push(card)
        } else {
          // no modo Rank, só importa cópias que o jogador realmente tem disponíveis
          mainCounts[cardNumber] = (mainCounts[cardNumber] || 0) + 1
          if (deckMode === 'rank' && mainCounts[cardNumber] > getAvailable(cardNumber)) {
            notEnough++
            continue
          }
          newMain.push(card)
          if (card.colors?.length && !card.colors.includes('Colorless')) {
            card.colors.forEach(c => newColors.add(c))
          }
        }
      }
    }

    if (newMain.length === 0 && newSoul.length === 0) {
      showValidationMsg(t('noCardsRecognized'))
      return
    }

    setMainDeck(newMain)
    setSoulDeck(newSoul)
    setChosenColors(newColors)
    setShowImport(false)
    setImportText('')

    const parts = [t('deckImportedMsg', { main: newMain.length, soul: newSoul.length })]
    if (notFound.length > 0) parts.push(t('cardsNotFoundMsg', { count: notFound.length, list: notFound.join(', ') }))
    if (notEnough > 0) parts.push(t('copiesIgnoredMsg', { count: notEnough }))
    showValidationMsg(parts.join(' | '))
  }

  useEffect(() => {
    fetch(`${API_URL}/api/cards`)
      .then(res => res.json())
      .then(setAllCards)
    fetch(`${API_URL}/api/player/cards`)
      .then(res => res.json())
      .then(rows => {
        const map = {}
        rows.forEach(r => { map[r.card_number] = { quantity: r.quantity, reserved: r.reserved } })
        setOwnedMap(map)
      })
  }, [])

  const addCard = (card) => {
    if (card.card_type === 'Soul') {
      if (soulDeck.length >= SOUL_DECK_SIZE) return
      setSoulDeck([...soulDeck, card])
      return
    }

    if (countCopies(mainDeck, card) >= MAX_COPIES_PER_NAME) return
    if (mainDeck.length >= MAIN_DECK_SIZE) return

    if (deckMode === 'rank' && countCopiesByNumber(mainDeck, card) >= getAvailable(card.card_number)) {
      showValidationMsg(t('onlyAvailableMsg', { available: getAvailable(card.card_number), name: card.name }))
      return
    }

    if (card.is_lucky) {
      const currentLucky = mainDeck.filter(c => c.is_lucky).length
      if (currentLucky >= MAX_LUCKY_PALS) {
        showValidationMsg(t('luckyLimitMsg', { name: card.name, max: MAX_LUCKY_PALS }))
        return
      }
    }

    if (card.colors?.length && !card.colors.includes('Colorless')) {
      const newColors = new Set(chosenColors)
      card.colors.forEach(c => newColors.add(c))
      if (newColors.size > MAX_COLORS) {
        showValidationMsg(t('colorLimitMsg', { name: card.name, max: MAX_COLORS }))
        return
      }
      setChosenColors(newColors)
    }

    setMainDeck([...mainDeck, card])
  }

  const removeCard = (card) => {
    if (card.card_type === 'Soul') {
      const idx = soulDeck.findIndex(c => c.card_number === card.card_number)
      setSoulDeck(soulDeck.filter((_, i) => i !== idx))
    } else {
      const idx = mainDeck.findIndex(c => c.card_number === card.card_number)
      setMainDeck(mainDeck.filter((_, i) => i !== idx))
    }
  }

  const handleSave = () => {
    if (!deckMode) { setShowModeModal(true); return }

    const mainResult = validateMainDeck(mainDeck, chosenColors)
    const soulResult = validateSoulDeck(soulDeck)
    const errors = [...mainResult.errors, ...soulResult.errors]

    if (errors.length > 0) {
      showValidationMsg(errors.map(e => t(e.key, e.params)).join(' | '))
      return
    }

    const deckName = window.prompt(t('deckNamePrompt'))
    if (!deckName) return

    fetch(`${API_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: deckName,
        mainDeckCardNumbers: mainDeck.map(c => c.card_number),
        soulDeckCardNumbers: soulDeck.map(c => c.card_number),
        colors: [...chosenColors],
        mode: deckMode
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        showValidationMsg(t('deckSavedMsg', { name: deckName, id: data.id }))
      })
      .catch(err => {
        console.error(err)
        showValidationMsg(err.message || t('saveDeckError'))
      })
  }

  // No modo Rank, Pals/Structure/Gear/Event só aparecem se ainda houver cópia disponível
  // (o Soul Deck fica de fora dessa restrição — não é uma carta "de coleção")
  const filteredCollection = allCards.filter(c =>
    (filterType === 'Todos' || c.card_type === filterType) &&
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (deckMode !== 'rank' || c.card_type === 'Soul' || getAvailable(c.card_number) > 0)
  )
  const luckyCount = mainDeck.filter(c => c.is_lucky).length

  const groupedDeck = Object.values(
    mainDeck.reduce((acc, card) => {
      if (!acc[card.name]) acc[card.name] = { card, count: 0 }
      acc[card.name].count++
      return acc
    }, {})
  )

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', padding: '1rem', width: '100%', alignItems: 'start', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'left' }}>
        <Link to="/"><button style={{ marginBottom: '12px' }}>{t('backToMenu')}</button></Link>
        <a href="https://palworldtcg.gg/decks" target="_blank" rel="noopener noreferrer">
          <button style={{ marginBottom: '12px', marginLeft: '8px' }}>{t('communityDecks')}</button>
        </a>
        <button onClick={() => setShowImport(true)} style={{ marginBottom: '12px', marginLeft: '8px' }}>
          {t('importDeck')}
        </button>
        <span style={{
          marginLeft: '8px', fontSize: '12px', fontWeight: 700, padding: '6px 10px', borderRadius: '6px',
          background: deckMode === 'rank' ? '#a5541b' : '#3f6b3f', color: '#fff3d6'
        }}>
          {deckMode === 'rank' ? '🏆 Rank' : '🎲 Normal'}
        </span>
        <button onClick={() => setShowModeModal(true)} style={{ marginBottom: '12px', marginLeft: '8px' }}>
          {t('changeMode')}
        </button>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => (
            <button key={type} onClick={() => setFilterType(type)}>{type === 'Todos' ? t('filterAll') : type}</button>
          ))}
          <input
            type="text"
            placeholder={t('searchCard')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: '6px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
          {filteredCollection.map(card => {
            const isSoul = card.card_type === 'Soul'
            const copies = countCopies(isSoul ? soulDeck : mainDeck, card)
            const rankLimited = !isSoul && deckMode === 'rank' && countCopiesByNumber(mainDeck, card) >= getAvailable(card.card_number)
            const maxed = (isSoul ? soulDeck.length >= SOUL_DECK_SIZE : copies >= MAX_COPIES_PER_NAME) || rankLimited
            return (
              <div key={card.card_number}
                   onClick={() => !maxed && addCard(card)}
                   onMouseEnter={() => setHoveredCard(card)}
                   onMouseLeave={() => setHoveredCard(null)}
                   title={!isSoul && deckMode === 'rank' ? t('availableTitle', { n: getAvailable(card.card_number) }) : undefined}
                   style={{ cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.4 : 1, textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '6px', position: 'relative' }}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '4px' }} onError={e => e.target.style.display = 'none'} />
                <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{card.name} {copies > 0 && `x${copies}`}</p>
                {!isSoul && deckMode === 'rank' && (
                  <p style={{ fontSize: '9px', margin: 0, color: '#8a5a2b' }}>{t('availLabel', { n: getAvailable(card.card_number) })}</p>
                )}
              </div>
            )
          })}
        </div>

        {hoveredCard && (
          <div style={{
            position: 'fixed', top: '50%', right: '320px', transform: 'translateY(-50%)',
            zIndex: 1000, pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', borderRadius: '10px'
          }}>
            <img src={hoveredCard.image_url} alt={hoveredCard.name} style={{ width: '320px', borderRadius: '10px' }} />
          </div>
        )}
      </div>

      <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '12px' }}>
        <p><strong>{t('mainDeckLabel')}</strong> {mainDeck.length} / {MAIN_DECK_SIZE}</p>
        <p><strong>{t('soulDeckLabel')}</strong> {soulDeck.length} / {SOUL_DECK_SIZE}</p>
        <p><strong>{t('luckyPalsLabel')}</strong> {luckyCount} / {MAX_LUCKY_PALS}</p>
        <p><strong>{t('colorsLabel')}</strong> {[...chosenColors].join(', ') || t('colorsNone')}</p>

        <div style={{ maxHeight: '250px', overflowY: 'auto', margin: '10px 0' }}>
          {groupedDeck.map(({ card, count }) => (
            <div key={card.card_number}
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px' }}>
              <span>{card.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                x{count}
                <button
                  onClick={() => removeCard(card)}
                  title={t('removeCopyTitle')}
                  style={{
                    width: '20px', height: '20px', lineHeight: '18px', padding: 0,
                    borderRadius: '50%', border: '1px solid #999', background: '#fff',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >−</button>
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleSave} style={{ width: '100%', padding: '10px' }}>{t('saveDeck')}</button>
        {validationMsg && <p style={{ fontSize: '12px', color: 'red', marginTop: '8px' }}>{validationMsg}</p>}
      </div>

      {showImport && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowImport(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '500px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{t('importDeck')}</h3>
              <button onClick={() => setShowImport(false)} style={{ padding: '4px 10px' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#777', marginTop: 0 }}>
              {t('pasteInstructions')}
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`# Colors: Red, Blue\n4 Lamball – My First Pal (TD01-023)\n...\n10 Soul (SOUL-001)`}
              style={{ width: '100%', height: '220px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', boxSizing: 'border-box' }}
            />
            <button onClick={handleImportDeck} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
              {t('buildDeckFromText')}
            </button>
          </div>
        </div>
      )}

      {showModeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }} onClick={() => deckMode && setShowModeModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '460px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222' }}>{t('modeQuestion')}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => selectMode('normal')} style={{ flex: 1, padding: '16px 10px', fontSize: '14px', background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                🎲 <strong>Normal</strong>
                <p style={{ fontSize: '11px', color: '#555', margin: '6px 0 0' }}>{t('modeNormalDesc')}</p>
              </button>
              <button onClick={() => selectMode('rank')} style={{ flex: 1, padding: '16px 10px', fontSize: '14px', background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                🏆 <strong>Rank</strong>
                <p style={{ fontSize: '11px', color: '#555', margin: '6px 0 0' }}>{t('modeRankDesc')}</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

export default DeckBuilder