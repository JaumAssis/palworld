import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { validateMainDeck, validateSoulDeck, countCopies, MAIN_DECK_SIZE, SOUL_DECK_SIZE, MAX_COPIES_PER_NAME, MAX_LUCKY_PALS, MAX_COLORS } from './deckValidator'

const API_URL = 'http://localhost:3001'

function DeckBuilder() {
  const [allCards, setAllCards] = useState([])
  const [mainDeck, setMainDeck] = useState([])
  const [soulDeck, setSoulDeck] = useState([])
  const [chosenColors, setChosenColors] = useState(new Set())
  const [filterType, setFilterType] = useState('Todos')
  const [search, setSearch] = useState('')
  const [validationMsg, setValidationMsg] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  const showValidationMsg = (msg) => {
    setValidationMsg(msg)
    setTimeout(() => setValidationMsg(''), 3000)
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
          newMain.push(card)
          if (card.colors?.length && !card.colors.includes('Colorless')) {
            card.colors.forEach(c => newColors.add(c))
          }
        }
      }
    }

    if (newMain.length === 0 && newSoul.length === 0) {
      showValidationMsg('Não consegui reconhecer nenhuma carta nesse texto.')
      return
    }

    setMainDeck(newMain)
    setSoulDeck(newSoul)
    setChosenColors(newColors)
    setShowImport(false)
    setImportText('')

    showValidationMsg(
      notFound.length > 0
        ? `Deck importado, mas ${notFound.length} carta(s) não encontrada(s): ${notFound.join(', ')}`
        : `Deck importado! ${newMain.length} cartas no Main, ${newSoul.length} no Soul.`
    )
  }

  useEffect(() => {
    fetch(`${API_URL}/api/cards`)
      .then(res => res.json())
      .then(setAllCards)
  }, [])

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
        showValidationMsg(`Não é possível adicionar ${card.name}: limite de ${MAX_LUCKY_PALS} cartas Lucky atingido.`)
        return
      }
    }

    if (card.colors?.length && !card.colors.includes('Colorless')) {
      const newColors = new Set(chosenColors)
      card.colors.forEach(c => newColors.add(c))
      if (newColors.size > MAX_COLORS) {
        showValidationMsg(`Não é possível adicionar ${card.name}: excederia ${MAX_COLORS} cores.`)
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
    const mainResult = validateMainDeck(mainDeck, chosenColors)
    const soulResult = validateSoulDeck(soulDeck)
    const errors = [...mainResult.errors, ...soulResult.errors]

    if (errors.length > 0) {
      showValidationMsg(errors.join(' | '))
      return
    }

    const deckName = window.prompt('Nome do deck:')
    if (!deckName) return

    fetch(`${API_URL}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: deckName,
        mainDeckCardNumbers: mainDeck.map(c => c.card_number),
        soulDeckCardNumbers: soulDeck.map(c => c.card_number),
        colors: [...chosenColors]
      })
    })
      .then(res => res.json())
      .then(data => {
        showValidationMsg(`Deck "${deckName}" salvo com sucesso! (id ${data.id})`)
      })
      .catch(err => {
        console.error(err)
        showValidationMsg('Erro ao salvar o deck no servidor.')
      })
  }

  const filteredCollection = allCards.filter(c =>
    (filterType === 'Todos' || c.card_type === filterType) &&
    c.name.toLowerCase().includes(search.toLowerCase())
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', padding: '1rem', width: '100%' }}>
      <div style={{ textAlign: 'left' }}>
        <Link to="/"><button style={{ marginBottom: '12px' }}>← Voltar ao Menu</button></Link>
        <a href="https://palworldtcg.gg/decks" target="_blank" rel="noopener noreferrer">
          <button style={{ marginBottom: '12px', marginLeft: '8px' }}>🔗 Ver Decks da Comunidade</button>
        </a>
        <button onClick={() => setShowImport(true)} style={{ marginBottom: '12px', marginLeft: '8px' }}>
          📥 Importar Deck
        </button>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => (
            <button key={type} onClick={() => setFilterType(type)}>{type}</button>
          ))}
          <input
            type="text"
            placeholder="Buscar carta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: '6px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
          {filteredCollection.map(card => {
            const copies = countCopies(card.card_type === 'Soul' ? soulDeck : mainDeck, card)
            const maxed = card.card_type === 'Soul' ? soulDeck.length >= SOUL_DECK_SIZE : copies >= MAX_COPIES_PER_NAME
            return (
              <div key={card.card_number}
                   onClick={() => !maxed && addCard(card)}
                   onMouseEnter={() => setHoveredCard(card)}
                   onMouseLeave={() => setHoveredCard(null)}
                   style={{ cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.4 : 1, textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '6px', position: 'relative' }}>
                <img src={card.image_url} alt={card.name} style={{ width: '100%', borderRadius: '4px' }} onError={e => e.target.style.display = 'none'} />
                <p style={{ fontSize: '11px', margin: '4px 0 0' }}>{card.name} {copies > 0 && `x${copies}`}</p>
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
        <p><strong>Main Deck:</strong> {mainDeck.length} / {MAIN_DECK_SIZE}</p>
        <p><strong>Soul Deck:</strong> {soulDeck.length} / {SOUL_DECK_SIZE}</p>
        <p><strong>Lucky Pals:</strong> {luckyCount} / {MAX_LUCKY_PALS}</p>
        <p><strong>Cores:</strong> {[...chosenColors].join(', ') || 'nenhuma ainda'}</p>

        <div style={{ maxHeight: '250px', overflowY: 'auto', margin: '10px 0' }}>
          {groupedDeck.map(({ card, count }) => (
            <div key={card.card_number}
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px' }}>
              <span>{card.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                x{count}
                <button
                  onClick={() => removeCard(card)}
                  title="Remover 1 cópia"
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

        <button onClick={handleSave} style={{ width: '100%', padding: '10px' }}>Salvar Deck</button>
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
              <h3 style={{ margin: 0 }}>📥 Importar Deck</h3>
              <button onClick={() => setShowImport(false)} style={{ padding: '4px 10px' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#777', marginTop: 0 }}>
              Cole aqui a lista exportada de sites como o Palworld TCG Play Hub (formato "4 Nome da Carta (CÓDIGO)").
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`# Colors: Red, Blue\n4 Lamball – My First Pal (TD01-023)\n...\n10 Soul (SOUL-001)`}
              style={{ width: '100%', height: '220px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', boxSizing: 'border-box' }}
            />
            <button onClick={handleImportDeck} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
              Montar Deck a partir do texto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckBuilder