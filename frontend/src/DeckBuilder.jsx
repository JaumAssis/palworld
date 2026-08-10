import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { validateMainDeck, validateSoulDeck, countCopies, MAIN_DECK_SIZE, SOUL_DECK_SIZE, MAX_COPIES_PER_NAME, MAX_LUCKY_PALS, MAX_COLORS } from './deckValidator'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'

// Mantém o tamanho compacto que os filtros de tipo já tinham antes de virarem sign-button.
const FILTER_BTN_STYLE = { padding: '4px 10px', fontSize: '12px' }

const COLOR_SWATCH = {
  Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a', Colorless: '#888'
}

function DeckBuilder() {
  const { t } = useLanguage()
  const { editId } = useParams() // presente em /deckbuilder/:editId — modo de edição de um deck já salvo
  const [allCards, setAllCards] = useState([])
  const [ownedMap, setOwnedMap] = useState({})
  const [mainDeck, setMainDeck] = useState([])
  const [soulDeck, setSoulDeck] = useState([])
  const [chosenColors, setChosenColors] = useState(new Set())
  const [filterType, setFilterType] = useState('Todos')
  const [filterColor, setFilterColor] = useState('Todos')
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [validationMsg, setValidationMsg] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [deckMode, setDeckMode] = useState(null) // 'normal' ou 'rank' — perguntado ao entrar (ou carregado do deck em edição)
  const [showModeModal, setShowModeModal] = useState(!editId)
  const [editedDeckName, setEditedDeckName] = useState('')
  const [showRenameChoice, setShowRenameChoice] = useState(false)
  const [showOnlyNotOwned, setShowOnlyNotOwned] = useState(false)
  const [showDraftWarning, setShowDraftWarning] = useState(false)

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

  // No modo Rank, cartas que faltam na coleção continuam podendo entrar no deck (fica marcado
  // como rascunho ao salvar, e dá pra craftar as faltantes depois) — só muda o modo mesmo.
  const selectMode = (newMode) => {
    setDeckMode(newMode)
    setShowModeModal(false)
  }

  const handleImportDeck = () => {
    const lines = importText.split('\n')
    const newMain = []
    const newSoul = []
    const newColors = new Set()
    let notFound = []

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
          // cartas que faltam na coleção continuam entrando (o deck Rank fica marcado como
          // rascunho ao salvar, já que agora dá pra completar craftando depois)
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
    showValidationMsg(parts.join(' | '))
  }

  useEffect(() => {
    apiFetch('/api/cards')
      .then(res => res.json())
      .then(setAllCards)
    apiFetch('/api/player/cards')
      .then(res => res.json())
      .then(rows => {
        const map = {}
        rows.forEach(r => { map[r.card_number] = { quantity: r.quantity, reserved: r.reserved } })
        setOwnedMap(map)
      })

    if (editId) {
      apiFetch(`/api/decks/${editId}`)
        .then(res => res.json())
        .then(deck => {
          if (deck.error) { showValidationMsg(deck.error); return }
          setMainDeck(deck.mainDeck)
          setSoulDeck(deck.soulDeck)
          setChosenColors(new Set(deck.colors))
          setDeckMode(deck.mode)
          setEditedDeckName(deck.name)
        })
    }
  }, [editId])

  const addCard = (card) => {
    if (card.card_type === 'Soul') {
      if (soulDeck.length >= SOUL_DECK_SIZE) return
      setSoulDeck([...soulDeck, card])
      return
    }

    if (countCopies(mainDeck, card) >= MAX_COPIES_PER_NAME) return
    if (mainDeck.length >= MAIN_DECK_SIZE) return

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

  const submitUpdate = (name) => {
    apiFetch(`/api/decks/${editId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        mainDeckCardNumbers: mainDeck.map(c => c.card_number),
        soulDeckCardNumbers: soulDeck.map(c => c.card_number),
        colors: [...chosenColors],
        mode: deckMode
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setEditedDeckName(name)
        setShowRenameChoice(false)
        showValidationMsg(t('deckUpdatedMsg', { name }))
      })
      .catch(err => {
        console.error(err)
        showValidationMsg(err.message || t('saveDeckError'))
      })
  }

  const handleKeepName = () => submitUpdate(editedDeckName)
  const handleChangeName = () => {
    const newName = window.prompt(t('deckNamePrompt'), editedDeckName)
    if (!newName) return
    submitUpdate(newName)
  }

  // Só importa no modo Rank — Normal ignora a coleção de propósito, nunca fica incompleto.
  const missingCount = () => {
    if (deckMode !== 'rank') return 0
    const counts = {}
    for (const c of mainDeck) counts[c.card_number] = (counts[c.card_number] || 0) + 1
    let missing = 0
    for (const [num, needed] of Object.entries(counts)) {
      missing += Math.max(0, needed - getAvailable(num))
    }
    return missing
  }

  const submitCreate = (name) => {
    apiFetch('/api/decks', {
      method: 'POST',
      body: JSON.stringify({
        name,
        mainDeckCardNumbers: mainDeck.map(c => c.card_number),
        soulDeckCardNumbers: soulDeck.map(c => c.card_number),
        colors: [...chosenColors],
        mode: deckMode
      })
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        showValidationMsg(t('deckSavedMsg', { name, id: data.id }))
      })
      .catch(err => {
        console.error(err)
        showValidationMsg(err.message || t('saveDeckError'))
      })
  }

  const proceedToSave = () => {
    if (editId) { setShowRenameChoice(true); return }
    const deckName = window.prompt(t('deckNamePrompt'))
    if (!deckName) return
    submitCreate(deckName)
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

    if (missingCount() > 0) { setShowDraftWarning(true); return }

    proceedToSave()
  }

  // Modo Rank não escolhe mais entre esconder ou mostrar quem falta — mostra sempre (cinza,
  // igual a Coleção), e o filtro "Não possuído" é só mais um filtro que soma aos outros.
  // Modo Rank: por padrão só mostra o que o jogador tem (igual antes); o toggle "Não possuído"
  // inverte pra mostrar só o que falta na coleção — as duas visões são exclusivas, não somam.
  const filteredCollection = allCards.filter(c =>
    (filterType === 'Todos' || c.card_type === filterType) &&
    (filterColor === 'Todos' || (c.colors || []).includes(filterColor)) &&
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (deckMode !== 'rank' || c.card_type === 'Soul' ||
      (showOnlyNotOwned ? getAvailable(c.card_number) === 0 : getAvailable(c.card_number) > 0))
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
        <Link to="/"><button className="sign-button" style={{ marginBottom: '12px' }}>{t('backToMenu')}</button></Link>
        <button className="sign-button" onClick={() => setShowImport(true)} style={{ marginBottom: '12px', marginLeft: '8px' }}>
          {t('importDeck')}
        </button>
        <span style={{
          marginLeft: '8px', fontSize: '12px', fontWeight: 700, padding: '6px 10px', borderRadius: '6px',
          background: deckMode === 'rank' ? '#a5541b' : '#3f6b3f', color: '#fff3d6'
        }}>
          {deckMode === 'rank' ? '🏆 Rank' : '🎲 Normal'}
        </span>
        <button className="sign-button" onClick={() => setShowModeModal(true)} style={{ marginBottom: '12px', marginLeft: '8px' }}>
          {t('changeMode')}
        </button>
        {editId && (
          <span style={{
            marginLeft: '8px', fontSize: '12px', fontWeight: 700, padding: '6px 10px', borderRadius: '6px',
            background: '#3a4a6b', color: '#e0e8ff'
          }}>
            {t('editingDeckBadge', { name: editedDeckName })}
          </span>
        )}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', position: 'relative' }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => (
            <button key={type} className="sign-button" style={FILTER_BTN_STYLE} onClick={() => setFilterType(type)}>{type === 'Todos' ? t('filterAll') : type}</button>
          ))}
          <button className="sign-button" style={FILTER_BTN_STYLE} onClick={() => setShowColorMenu(v => !v)}>
            {t('colorFilterButton')}{filterColor !== 'Todos' ? `: ${filterColor}` : ''}
          </button>
          <button
            className="sign-button"
            style={{
              ...FILTER_BTN_STYLE,
              ...(showOnlyNotOwned ? { outline: '2px solid #ffcf7a', outlineOffset: '2px' } : {})
            }}
            onClick={() => setShowOnlyNotOwned(v => !v)}
          >
            {t('notOwnedFilterButton')}
          </button>
          {showColorMenu && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 20,
              background: '#2b1a10', border: '2px solid #c99a4e', borderRadius: '8px',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
              {['Todos', 'Red', 'Blue', 'Green', 'Purple', 'Colorless'].map(color => (
                <button
                  key={color}
                  className="sign-button"
                  style={{ ...FILTER_BTN_STYLE, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => { setFilterColor(color); setShowColorMenu(false) }}
                >
                  {color !== 'Todos' && (
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLOR_SWATCH[color], display: 'inline-block' }} />
                  )}
                  {color === 'Todos' ? t('filterAll') : color}
                </button>
              ))}
            </div>
          )}
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
            const maxed = isSoul ? soulDeck.length >= SOUL_DECK_SIZE : copies >= MAX_COPIES_PER_NAME
            const notOwned = deckMode === 'rank' && !isSoul && getAvailable(card.card_number) === 0
            return (
              <div key={card.card_number}
                   onClick={() => !maxed && addCard(card)}
                   onMouseEnter={() => setHoveredCard(card)}
                   onMouseLeave={() => setHoveredCard(null)}
                   title={!isSoul && deckMode === 'rank' ? t('availableTitle', { n: getAvailable(card.card_number) }) : undefined}
                   style={{ cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.4 : 1, textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '6px', position: 'relative' }}>
                <img src={card.image_url} alt={card.name}
                     style={{
                       width: '100%', borderRadius: '4px',
                       filter: notOwned ? 'grayscale(100%)' : 'none',
                       opacity: notOwned ? 0.35 : 1
                     }}
                     onError={e => e.target.style.display = 'none'} />
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
        {editId && (
          <Link to="/mydecks">
            <button style={{ width: '100%', padding: '10px', marginTop: '8px', background: '#888', color: '#fff' }}>
              {t('cancelEdit')}
            </button>
          </Link>
        )}
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

      {showRenameChoice && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }} onClick={() => setShowRenameChoice(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '420px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222' }}>{t('renameChoiceQuestion', { name: editedDeckName })}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleKeepName} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#3f6b3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('renameChoiceKeep')}
              </button>
              <button onClick={handleChangeName} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#a5541b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('renameChoiceChange')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDraftWarning && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }} onClick={() => setShowDraftWarning(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '420px', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222' }}>{t('draftWarningTitle')}</h3>
            <p style={{ fontSize: '13px', color: '#555' }}>{t('draftWarningBody', { missing: missingCount() })}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => { setShowDraftWarning(false); proceedToSave() }} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#a5541b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('draftWarningConfirm')}
              </button>
              <button onClick={() => setShowDraftWarning(false)} style={{ flex: 1, padding: '14px 10px', fontSize: '13px', background: '#888', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('draftWarningCancel')}
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