import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { validateMainDeck, validateSoulDeck, countCopies, cardAllowsUnlimitedCopies, MAIN_DECK_SIZE, SOUL_DECK_SIZE, MAX_COPIES_PER_NAME, MAX_LUCKY_PALS, MAX_COLORS } from './deckValidator'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch } from './api'
import { cardMatchesSearch } from './cardSearch'

// Mantém o tamanho compacto que os filtros de tipo já tinham antes de virarem sign-button.
const FILTER_BTN_STYLE = { padding: 'var(--sp-2xs) var(--sp-sm)', fontSize: 'var(--fs-2xs)' }
const ACTIVE_FILTER_STYLE = { outline: '2px solid #ffcf7a', outlineOffset: '2px' }

// Painel lateral de montagem do deck — mais estreito que --panel-w-xs (que é usado noutras telas)
// pra sobrar mais coluna de cartas da coleção antes dele, e mais alto (quase tela cheia) pra dar
// espaço de sobra pro gráfico de curva de custo. Usado tanto no painel quanto no reserve de
// padding da grade de cartas — os dois usam a MESMA constante pra nunca ficarem dessincronizados.
const DECK_PANEL_WIDTH = 'min(86vw, 18rem)'
const DECK_PANEL_GAP = '28px'

const COLOR_SWATCH = {
  Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a', Colorless: '#888'
}

// Mesma paleta de RARITY_GLOW do Shop.jsx (booster) — reaproveitada aqui como bolinha compacta pra
// diferenciar arte alterada na lista do deck, no lugar do "(CARD-NUMBER)" gigante que quebrava a
// linha. Duplicado (não importado) de propósito: são só 9 cores, mesmo padrão de CRAFT_COSTS
// duplicado entre MyDecks/MyCollection nesse projeto.
const RARITY_DOT = {
  C: '#9e9e9e', U: '#43a047', R: '#1e88e5', RR: '#8e24aa',
  SR: '#f9a825', SP: '#e91e63', OSR: '#ff6f00', SSP: '#00bcd4', TSR: '#e53935'
}

// Alterna um valor dentro de um Set (multi-seleção dos subfiltros de custo/cor) sem mutar o
// original — mesmo padrão do Catálogo (CardGrid.jsx).
function toggleInSet(set, value) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
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
  // Subfiltros de custo/cor só aparecem com um tipo específico selecionado (não em "Todos") — ver
  // changeType, que os reseta ao trocar de tipo (mesmo padrão do Catálogo, CardGrid.jsx).
  const [selectedCosts, setSelectedCosts] = useState(new Set())
  const [selectedColors, setSelectedColors] = useState(new Set())
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

    // Algumas cartas (ex: Beegarde) têm regra impressa liberando cópias ilimitadas do mesmo nome —
    // só o teto do Main Deck (50) continua valendo pra elas (ver cardAllowsUnlimitedCopies).
    if (!cardAllowsUnlimitedCopies(card) && countCopies(mainDeck, card) >= MAX_COPIES_PER_NAME) return
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
  // Conta Main Deck E Soul Deck — antes só olhava o Main Deck, então um Soul Deck incompleto
  // nunca acendia o aviso de rascunho aqui (mesmo gap corrigido no backend, computeDeckIsDraft).
  // SOUL-001 fica de fora: é recurso estrutural sem posse de verdade (só sai de Trial Deck, que
  // tampa em 4 cópias — nunca dá pra "possuir" as 10 que o Soul Deck pede, ver computeDeckIsDraft
  // no server.js pro mesmo raciocínio completo).
  const missingCount = () => {
    if (deckMode !== 'rank') return 0
    const counts = {}
    for (const c of [...mainDeck, ...soulDeck]) {
      if (c.card_number === 'SOUL-001') continue
      counts[c.card_number] = (counts[c.card_number] || 0) + 1
    }
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

  const changeType = (type) => {
    setFilterType(type)
    setSelectedCosts(new Set())
    setSelectedColors(new Set())
  }

  const cardsOfType = filterType === 'Todos' ? allCards : allCards.filter(c => c.card_type === filterType)
  const availableCosts = [...new Set(cardsOfType.map(c => c.cost).filter(c => c !== null && c !== undefined))].sort((a, b) => a - b)

  // Modo Rank não escolhe mais entre esconder ou mostrar quem falta — mostra sempre (cinza,
  // igual a Coleção), e o filtro "Não possuído" é só mais um filtro que soma aos outros.
  // Modo Rank: por padrão só mostra o que o jogador tem (igual antes); o toggle "Não possuído"
  // inverte pra mostrar só o que falta na coleção — as duas visões são exclusivas, não somam.
  // Soul não é mais exceção aqui: agora que Soul nunca é craftável, a posse de verdade importa
  // (senão um deck Rank podia "completar" o Soul Deck com cópias que o jogador nem tem, sem
  // nenhum jeito de resolver isso depois via craft).
  const filteredCollection = allCards.filter(c =>
    (filterType === 'Todos' || c.card_type === filterType) &&
    (selectedCosts.size === 0 || selectedCosts.has(c.cost)) &&
    (selectedColors.size === 0 || (c.colors || []).some(col => selectedColors.has(col))) &&
    cardMatchesSearch(c, search) &&
    // Rank sem o botão marcado: só mostra o que o player já tem (comportamento padrão). Com o
    // botão marcado, o filtro deixa de EXCLUIR quem tem — passa a mostrar as duas coisas juntas
    // (donas em cor normal, não obtidas em cinza — ver `notOwned` no grid abaixo).
    (deckMode !== 'rank' || showOnlyNotOwned || getAvailable(c.card_number) > 0)
  )
  const luckyCount = mainDeck.filter(c => c.is_lucky).length

  // Curva de custo + contagem por tipo do Main Deck em montagem — mesma ideia (e mesmas chaves de
  // i18n) que Arena.jsx/Roguelike.jsx já usam, só num layout mais compacto pra caber na coluna
  // estreita do painel de resumo.
  const costBuckets = {}
  for (const c of mainDeck) if (c.cost != null) costBuckets[c.cost] = (costBuckets[c.cost] || 0) + 1
  const maxAxisCost = Math.max(8, ...mainDeck.map(c => c.cost || 0))
  const costCurve = Array.from({ length: maxAxisCost }, (_, i) => ({ cost: i + 1, count: costBuckets[i + 1] || 0 }))
  const costCurveMax = Math.max(1, ...costCurve.map(b => b.count))
  const typeCounts = mainDeck.reduce((acc, c) => {
    if (c.card_type === 'Pal') acc.pals++
    else if (c.card_type === 'Structure') acc.structures++
    else if (c.card_type === 'Gear') acc.gear++
    else if (c.card_type === 'Event') acc.event++
    return acc
  }, { pals: 0, structures: 0, gear: 0, event: 0 })

  // Agrupado por card_number (não por nome) — 2 variantes de arte do mesmo Pal (normal + arte
  // alterada) precisam virar linhas SEPARADAS aqui, senão o botão "-" fica ambíguo: ele sempre
  // remove a cópia que apareceu primeiro no array, então trocar a arte alterada pela normal podia
  // acabar removendo a normal por engano e salvando o deck com uma arte que você nem possui.
  const groupedDeck = Object.values(
    mainDeck.reduce((acc, card) => {
      if (!acc[card.card_number]) acc[card.card_number] = { card, count: 0 }
      acc[card.card_number].count++
      return acc
    }, {})
  )
  // Só mostra o card_number entre parênteses quando existe mais de 1 variante com o MESMO nome no
  // deck (ex: normal + arte alterada do mesmo Pal) — na imensa maioria dos decks isso nunca aparece.
  const nameOccurrences = {}
  for (const { card } of groupedDeck) nameOccurrences[card.name] = (nameOccurrences[card.name] || 0) + 1

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
    <div style={{ padding: 'var(--sp-lg)', paddingRight: `calc(${DECK_PANEL_WIDTH} + ${DECK_PANEL_GAP} + var(--sp-lg))`, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'left' }}>
        {/* Linha 1: navegação/modo + busca ao lado do "Trocar modo" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-xs)', flexWrap: 'wrap', marginBottom: '12px' }}>
          <Link to="/"><button className="sign-button sign-button-fluid">{t('backToMenu')}</button></Link>
          <button className="sign-button sign-button-fluid" onClick={() => setShowImport(true)}>{t('importDeck')}</button>
          <span style={{
            fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: 'var(--sp-2xs) var(--sp-sm)', borderRadius: '6px',
            background: deckMode === 'rank' ? '#a5541b' : '#3f6b3f', color: '#fff3d6'
          }}>
            {deckMode === 'rank' ? '🏆 Rank' : '🎲 Normal'}
          </span>
          <button className="sign-button sign-button-fluid" onClick={() => setShowModeModal(true)}>{t('changeMode')}</button>
          <input
            type="text"
            placeholder={t('searchCard')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '150px', padding: 'var(--sp-xs)', fontSize: 'var(--fs-sm)' }}
          />
          {editId && (
            <span style={{
              fontSize: 'var(--fs-2xs)', fontWeight: 700, padding: 'var(--sp-2xs) var(--sp-sm)', borderRadius: '6px',
              background: '#3a4a6b', color: '#e0e8ff'
            }}>
              {t('editingDeckBadge', { name: editedDeckName })}
            </span>
          )}
        </div>

        {/* Linha 2: filtros de tipo + "Não possuído" (sem cor aqui — virou subfiltro condicional) */}
        <div style={{ display: 'flex', gap: 'var(--sp-xs)', marginBottom: '8px', flexWrap: 'wrap' }}>
          {['Todos', 'Pal', 'Structure', 'Gear', 'Event', 'Soul'].map(type => (
            <button
              key={type}
              className="sign-button"
              onClick={() => changeType(type)}
              style={{ ...FILTER_BTN_STYLE, ...(filterType === type ? ACTIVE_FILTER_STYLE : {}) }}
            >
              {type === 'Todos' ? t('filterAll') : type}
            </button>
          ))}
          <button
            className="sign-button"
            style={{ ...FILTER_BTN_STYLE, ...(showOnlyNotOwned ? ACTIVE_FILTER_STYLE : {}) }}
            onClick={() => setShowOnlyNotOwned(v => !v)}
          >
            {t('notOwnedFilterButton')}
          </button>
        </div>

        {/* Linha 3: subfiltros de Custo e Cor — agora aparecem em qualquer tipo, incluindo "Todos"
            (antes só apareciam com um tipo específico selecionado). Multi-seleção dentro de cada
            grupo; os dois grupos se combinam em E (mesmo padrão do Catálogo, CardGrid.jsx). */}
        <div style={{ display: 'flex', gap: 'var(--sp-lg)', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
          {availableCosts.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)' }}>{t('costFilterLabel')}</span>
                {availableCosts.map(cost => (
                  <button
                    key={cost}
                    className="sign-button"
                    onClick={() => setSelectedCosts(prev => toggleInSet(prev, cost))}
                    style={{ ...FILTER_BTN_STYLE, ...(selectedCosts.has(cost) ? ACTIVE_FILTER_STYLE : {}) }}
                  >
                    {cost}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)' }}>{t('colorFilterLabel')}</span>
              {['Red', 'Blue', 'Green', 'Purple', 'Colorless'].map(color => (
                <button
                  key={color}
                  className="sign-button"
                  onClick={() => setSelectedColors(prev => toggleInSet(prev, color))}
                  style={{ ...FILTER_BTN_STYLE, ...(selectedColors.has(color) ? ACTIVE_FILTER_STYLE : {}), display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLOR_SWATCH[color], display: 'inline-block' }} />
                  {color}
                </button>
              ))}
            </div>
          </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(95px, 9vw, 150px), 1fr))', gap: 'var(--sp-sm)' }}>
          {filteredCollection.map(card => {
            const isSoul = card.card_type === 'Soul'
            const copies = countCopies(isSoul ? soulDeck : mainDeck, card)
            const maxed = isSoul
              ? soulDeck.length >= SOUL_DECK_SIZE
              : (!cardAllowsUnlimitedCopies(card) && copies >= MAX_COPIES_PER_NAME)
            const notOwned = deckMode === 'rank' && getAvailable(card.card_number) === 0
            return (
              <div key={card.card_number}
                   onClick={() => !maxed && addCard(card)}
                   onMouseEnter={() => setHoveredCard(card)}
                   onMouseLeave={() => setHoveredCard(null)}
                   title={deckMode === 'rank' ? t('availableTitle', { n: getAvailable(card.card_number) }) : undefined}
                   style={{ cursor: maxed ? 'not-allowed' : 'pointer', opacity: maxed ? 0.4 : 1, textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: 'var(--sp-2xs)', position: 'relative' }}>
                <img src={card.image_url} alt={card.name}
                     style={{
                       width: '100%', borderRadius: '4px',
                       filter: notOwned ? 'grayscale(100%)' : 'none',
                       opacity: notOwned ? 0.35 : 1
                     }}
                     onError={e => e.target.style.display = 'none'} />
                <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0' }}>{card.name} {copies > 0 && `x${copies}`}</p>
                {deckMode === 'rank' && (
                  <p style={{ fontSize: 'var(--fs-2xs)', margin: 0, color: '#8a5a2b' }}>{t('availLabel', { n: getAvailable(card.card_number) })}</p>
                )}
              </div>
            )
          })}
        </div>

        {hoveredCard && (
          <div style={{
            position: 'fixed', top: '50%', right: `calc(${DECK_PANEL_WIDTH} + ${DECK_PANEL_GAP})`, transform: 'translateY(-50%)',
            zIndex: 1000, pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)', borderRadius: '10px'
          }}>
            <img src={hoveredCard.image_url} alt={hoveredCard.name} style={{ width: 'clamp(240px, 22vw, 340px)', borderRadius: '10px' }} />
          </div>
        )}
      </div>
      </div>

      {/* position: fixed em vez de sticky — o wrapper da página tem overflowX: hidden, que por
          spec força overflow-y a virar 'auto' e cria um contexto de rolagem próprio, quebrando
          o sticky contra o scroll real da janela. Fixed contorna isso de vez, no mesmo padrão
          já usado por AuthPanel/OnlineBadge/RankBoard. */}
      {/* Altura FIXA (não maxHeight) de propósito — vira o container de referência pro "60%" da
          lista logo abaixo. Com maxHeight, o painel só cresce até caber o conteúdo, então uma
          altura em vh na lista (ex: 60vh) não tinha painel nenhum de "100%" pra ser relativa — o
          painel inteiro só inchava pra além da tela e empurrava o botão Salvar pra fora da vista. */}
      <div style={{
        background: '#f5f5f5', borderRadius: '10px', padding: 'var(--sp-md)',
        position: 'fixed', top: '1rem', right: '1rem', width: DECK_PANEL_WIDTH,
        height: 'calc(100vh - 2rem)', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, fontSize: 'var(--fs-sm)'
      }}>
        <div style={{ flexShrink: 0 }}>
          <p><strong>{t('mainDeckLabel')}</strong> {mainDeck.length} / {MAIN_DECK_SIZE}</p>
          <p><strong>{t('soulDeckLabel')}</strong> {soulDeck.length} / {SOUL_DECK_SIZE}</p>
          <p><strong>{t('luckyPalsLabel')}</strong> {luckyCount} / {MAX_LUCKY_PALS}</p>
          <p><strong>{t('colorsLabel')}</strong> {[...chosenColors].join(', ') || t('colorsNone')}</p>
        </div>

        <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', margin: '10px 0' }}>
          {groupedDeck.map(({ card, count }) => (
            <div key={card.card_number}
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--fs-xs)', padding: '4px' }}>
              <span>
                {card.name}
                {/* Arte alterada (mesmo nome, card_number diferente): em vez do código gigante
                    (ex: "BP01-049-OSR") que quebrava a linha e ficava com cara de bug, só uma
                    bolinha colorida por raridade — mesma paleta do brilho do booster (Shop.jsx). */}
                {nameOccurrences[card.name] > 1 && (
                  <span title={card.rarity} style={{
                    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                    marginLeft: '6px', verticalAlign: 'middle',
                    background: RARITY_DOT[card.rarity] || '#999',
                    boxShadow: `0 0 4px ${RARITY_DOT[card.rarity] || '#999'}`
                  }} />
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                x{count}
                <button
                  onClick={() => removeCard(card)}
                  title={t('removeCopyTitle')}
                  style={{
                    width: 'clamp(18px, 1.6vw, 26px)', height: 'clamp(18px, 1.6vw, 26px)', padding: 0,
                    borderRadius: '50%', border: '1px solid #999', background: '#fff',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: 'var(--fs-2xs)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >−</button>
              </span>
            </div>
          ))}

          {/* Salvar Deck (+ Cancelar edição/aviso) fica no FIM da própria listagem de cartas, não
              lá embaixo separado da curva — assim quem rolou a lista até o fim já encontra o botão
              ali mesmo, sem precisar procurar numa seção à parte. */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '10px' }}>
            <button onClick={handleSave} style={{ width: '100%', padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)' }}>{t('saveDeck')}</button>
            {editId && (
              <Link to="/mydecks">
                <button style={{ width: '100%', padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)', marginTop: '8px', background: '#888', color: '#fff' }}>
                  {t('cancelEdit')}
                </button>
              </Link>
            )}
            {validationMsg && <p style={{ fontSize: 'var(--fs-xs)', color: 'red', marginTop: '8px' }}>{validationMsg}</p>}
          </div>
        </div>

        {/* flexShrink:0 e sem overflow de propósito — este bloco nunca deve rolar. Quem agora é
            flexível (flex:1 + minHeight:0 + overflowY:auto) é a listagem de cartas ali em cima:
            ela absorve o espaço que sobrar depois do cabeçalho + desta curva, então a curva sempre
            renderiza no tamanho natural dela, cheia, sem precisar de scroll em nenhum tamanho de
            tela (antes era o contrário — a curva ficava espremida nos "40% restantes" e podia não
            caber por poucos pixels, forçando um scroll feio pra pouca coisa). */}
        <div style={{ flexShrink: 0, borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '6px' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, margin: '0 0 4px' }}>{t('arenaCostCurveTitle')}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 'clamp(70px, 12vh, 130px)' }}>
            {costCurve.map(({ cost, count }) => (
              <div key={cost} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ fontSize: '11px', minHeight: '1.1em' }}>{count > 0 ? count : ''}</span>
                <div style={{
                  width: '100%', background: 'linear-gradient(180deg, #ffb74d, #a5541b)', borderRadius: '2px 2px 0 0',
                  height: `${(count / costCurveMax) * 100}%`, minHeight: count > 0 ? '3px' : '0'
                }} />
                <span style={{ fontSize: '11px', marginTop: '2px', color: '#777' }}>{cost}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', fontSize: '11px', color: '#555' }}>
            <span>🍀 {t('arenaStatLuckyPals')}: <strong>{luckyCount}</strong></span>
            <span>🐾 {t('arenaStatPals')}: <strong>{typeCounts.pals}</strong></span>
            <span>🏛️ {t('arenaStatStructures')}: <strong>{typeCounts.structures}</strong></span>
            <span>⚙️ {t('arenaStatGear')}: <strong>{typeCounts.gear}</strong></span>
            <span>📜 {t('arenaStatEvent')}: <strong>{typeCounts.event}</strong></span>
          </div>
        </div>
      </div>

      {showImport && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowImport(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 'var(--panel-w-sm)', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: 'var(--sp-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--fs-lg)' }}>{t('importDeck')}</h3>
              <button onClick={() => setShowImport(false)} style={{ padding: '4px 10px', fontSize: 'var(--fs-sm)' }}>✕</button>
            </div>
            <p style={{ fontSize: 'var(--fs-2xs)', color: '#777', marginTop: 0 }}>
              {t('pasteInstructions')}
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`# Colors: Red, Blue\n4 Lamball – My First Pal (TD01-023)\n...\n10 Soul (SOUL-001)`}
              style={{ width: '100%', height: 'clamp(180px, 22vh, 320px)', fontFamily: 'monospace', fontSize: 'var(--fs-2xs)', padding: 'var(--sp-xs)', boxSizing: 'border-box' }}
            />
            <button onClick={handleImportDeck} style={{ width: '100%', padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)', marginTop: '10px' }}>
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
            width: 'var(--panel-w-sm)', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: 'var(--sp-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222', fontSize: 'var(--fs-lg)' }}>{t('modeQuestion')}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => selectMode('normal')} style={{ flex: 1, padding: 'var(--sp-md) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                🎲 <strong>Normal</strong>
                <p style={{ fontSize: 'var(--fs-2xs)', color: '#555', margin: '6px 0 0' }}>{t('modeNormalDesc')}</p>
              </button>
              <button onClick={() => selectMode('rank')} style={{ flex: 1, padding: 'var(--sp-md) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#fff', color: '#222', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>
                🏆 <strong>Rank</strong>
                <p style={{ fontSize: 'var(--fs-2xs)', color: '#555', margin: '6px 0 0' }}>{t('modeRankDesc')}</p>
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
            width: 'var(--panel-w-sm)', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: 'var(--sp-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222', fontSize: 'var(--fs-lg)' }}>{t('renameChoiceQuestion', { name: editedDeckName })}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleKeepName} style={{ flex: 1, padding: 'var(--sp-sm) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#3f6b3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('renameChoiceKeep')}
              </button>
              <button onClick={handleChangeName} style={{ flex: 1, padding: 'var(--sp-sm) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#a5541b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
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
            width: 'var(--panel-w-sm)', maxWidth: '90vw', background: '#fff', borderRadius: '14px',
            padding: 'var(--sp-xl)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0, color: '#222', fontSize: 'var(--fs-lg)' }}>{t('draftWarningTitle')}</h3>
            <p style={{ fontSize: 'var(--fs-sm)', color: '#555' }}>{t('draftWarningBody', { missing: missingCount() })}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={() => { setShowDraftWarning(false); proceedToSave() }} style={{ flex: 1, padding: 'var(--sp-sm) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#a5541b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('draftWarningConfirm')}
              </button>
              <button onClick={() => setShowDraftWarning(false)} style={{ flex: 1, padding: 'var(--sp-sm) var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#888', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {t('draftWarningCancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeckBuilder