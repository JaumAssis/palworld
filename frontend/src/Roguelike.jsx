import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch, apiJson } from './api'

const NODE_ICON = { battle: '⚔️', medicine_bench: '💊', shop: '🏪', event: '❓', boss: '💀' }
// Todos os tipos de nó já são reais (Fases 1-4) — esse conjunto fica vazio, mas mantido pelo mesmo
// padrão caso um tipo novo precise entrar desabilitado numa fase futura.
const NODES_COMING_SOON = new Set([])

// Peça de dama de madeira entalhada — só CSS (gradiente em camadas simulando veios de madeira +
// bisel em relevo + ícone com sombra dupla pra parecer entalhado), sem depender de asset novo.
// `status` controla opacidade/destaque; `disabled` é só pros tipos de nó ainda desabilitados.
function MapNode({ node, onClick, disabled, t }) {
  const [hovering, setHovering] = useState(false)
  const clickable = node.status === 'available' && !disabled
  const isCleared = node.status === 'cleared'
  const isLocked = node.status === 'locked'
  const woodGrain = 'repeating-radial-gradient(circle at 35% 30%, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 2px, transparent 7px)'
  return (
    <button
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      title={disabled && node.status === 'available' ? t('roguelikeNodeLockedHint') : t(`roguelikeNodeType_${node.type}`)}
      style={{
        width: 'clamp(52px, 6vw, 72px)', height: 'clamp(52px, 6vw, 72px)', borderRadius: '50%',
        border: '2px solid rgba(0,0,0,0.35)', cursor: clickable ? 'pointer' : 'default', position: 'relative',
        background: isLocked
          ? `${woodGrain}, radial-gradient(circle at 35% 30%, #5a4433, #2e2013)`
          : `${woodGrain}, radial-gradient(circle at 35% 30%, #c99a68, #6b4423)`,
        boxShadow: isLocked
          ? 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -2px 3px rgba(255,255,255,0.05)'
          : `inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.45)${clickable && hovering ? ', 0 0 0 3px rgba(255,215,106,0.55)' : ''}`,
        opacity: isLocked ? 0.45 : (disabled && node.status === 'available' ? 0.55 : 1),
        filter: isCleared ? 'grayscale(0.6)' : 'none',
        transform: clickable && hovering ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        fontSize: 'var(--fs-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textShadow: '1px 1px 1px rgba(0,0,0,0.65), -1px -1px 1px rgba(255,255,255,0.12)'
      }}
    >
      {isCleared ? '✔️' : NODE_ICON[node.type]}
    </button>
  )
}

// Preview das 16 cartas de um deck-personagem, com zoom de 500ms ao passar o mouse — mesmo
// padrão de hover-zoom já usado em Arena.jsx/DeckBuilder.jsx.
function StarterDeckCard({ deck, onChoose, busy, startHoverZoom, cancelHoverZoom, t }) {
  const grouped = Object.values(
    deck.cards.reduce((acc, c) => {
      if (!acc[c.name]) acc[c.name] = { name: c.name, cost: c.cost, count: 0, imageUrl: c.imageUrl }
      acc[c.name].count++
      return acc
    }, {})
  ).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))

  return (
    <div style={{
      flex: '1 1 240px', maxWidth: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
      padding: 'var(--sp-md)', color: '#f3e2b3', textAlign: 'left'
    }}>
      <h3 style={{ fontSize: 'var(--fs-md)', margin: '0 0 4px', textAlign: 'center' }}>{t(`roguelikeStarterDeckName_${deck.key}`)}</h3>
      <div style={{ maxHeight: '220px', overflowY: 'auto', margin: '8px 0' }}>
        {grouped.map(c => (
          <div
            key={c.name}
            onMouseEnter={() => startHoverZoom(c.imageUrl, c.name)}
            onMouseLeave={cancelHoverZoom}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong style={{ color: '#ffd76a' }}>{c.cost}</strong> {c.name}
            </span>
            <span style={{ flexShrink: 0 }}>x{c.count}</span>
          </div>
        ))}
      </div>
      <button
        className="sign-button sign-button-fluid"
        style={{ width: '100%' }}
        disabled={busy}
        onClick={() => onChoose(deck.key)}
      >
        {t('roguelikeChooseDeckButton')}
      </button>
    </div>
  )
}

// Lista agrupada do deck atual + curva de custo + contagem por tipo — reaproveita literalmente as
// mesmas chaves de i18n do Modo Arena (arenaCostCurveTitle, arenaStat*, etc.), já que é o mesmo
// conceito genérico (curva de custo / contagem por tipo de carta), só um modo diferente usando.
function DeckPanel({ draftedCards, t }) {
  const grouped = Object.values(
    draftedCards.reduce((acc, c) => {
      if (!acc[c.name]) acc[c.name] = { name: c.name, cost: c.cost, count: 0 }
      acc[c.name].count++
      return acc
    }, {})
  ).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))

  const maxAxisCost = Math.max(8, ...draftedCards.map(c => c.cost || 0))
  const costBuckets = {}
  for (const c of draftedCards) costBuckets[c.cost] = (costBuckets[c.cost] || 0) + 1
  const costCurve = Array.from({ length: maxAxisCost }, (_, i) => ({ cost: i + 1, count: costBuckets[i + 1] || 0 }))
  const costCurveMax = Math.max(1, ...costCurve.map(b => b.count))

  const typeCounts = draftedCards.reduce((acc, c) => {
    if (c.isLucky) acc.lucky++
    if (c.cardType === 'Pal') acc.pals++
    else if (c.cardType === 'Structure') acc.structures++
    else if (c.cardType === 'Gear') acc.gear++
    else if (c.cardType === 'Event') acc.event++
    return acc
  }, { lucky: 0, pals: 0, structures: 0, gear: 0, event: 0 })

  return (
    <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-xl)', textAlign: 'left' }}>
      <div style={{ flex: '1 1 280px', maxWidth: '360px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: 'var(--sp-md)' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', margin: '0 0 8px' }}>{t('roguelikeDeckListTitle')}</h3>
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {grouped.map(({ name, cost, count }) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: 'var(--fs-sm)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong style={{ color: '#ffd76a' }}>{cost}</strong> {name}
              </span>
              <span style={{ flexShrink: 0 }}>x{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: '1 1 280px', maxWidth: '360px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: 'var(--sp-md)' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', margin: '0 0 8px' }}>{t('arenaCostCurveTitle')}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 'clamp(100px, 14vw, 150px)' }}>
          {costCurve.map(({ cost, count }) => (
            <div key={cost} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ fontSize: 'var(--fs-2xs)', minHeight: '1.2em' }}>{count > 0 ? count : ''}</span>
              <div style={{ width: '100%', background: 'linear-gradient(180deg, #ffd76a, #c99a4e)', borderRadius: '3px 3px 0 0', height: `${(count / costCurveMax) * 100}%`, minHeight: count > 0 ? '4px' : '0' }} />
              <span style={{ fontSize: 'var(--fs-2xs)', marginTop: '4px', color: '#d9c4a3' }}>{cost}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--sp-md)', paddingTop: 'var(--sp-sm)', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: 'var(--fs-2xs)', color: '#d9c4a3' }}>
          <span>🍀 {t('arenaStatLuckyPals')}: <strong style={{ color: '#f3e2b3' }}>{typeCounts.lucky}</strong></span>
          <span>🐾 {t('arenaStatPals')}: <strong style={{ color: '#f3e2b3' }}>{typeCounts.pals}</strong></span>
          <span>🏛️ {t('arenaStatStructures')}: <strong style={{ color: '#f3e2b3' }}>{typeCounts.structures}</strong></span>
          <span>⚙️ {t('arenaStatGear')}: <strong style={{ color: '#f3e2b3' }}>{typeCounts.gear}</strong></span>
          <span>📜 {t('arenaStatEvent')}: <strong style={{ color: '#f3e2b3' }}>{typeCounts.event}</strong></span>
        </div>
      </div>
    </div>
  )
}

const COLOR_SWATCH = { Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a' }

function CardOfferGrid({ options, busy, onPick, size = 'clamp(110px, 12vw, 150px)' }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
      {options.map(card => (
        <div
          key={card.cardNumber}
          onClick={() => !busy && onPick(card.cardNumber)}
          style={{ cursor: busy ? 'default' : 'pointer', width: size, opacity: busy ? 0.6 : 1 }}
        >
          <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
          <p style={{ fontSize: 'var(--fs-xs)', margin: '4px 0 0' }}>{card.name}{card.cost != null ? ` (${card.cost})` : ''}</p>
        </div>
      ))}
    </div>
  )
}

// Sacrifício (estilo Meat Cleaver): passo 1 escolhe qual Pal do deck sacrificar, passo 2 escolhe
// 1 de 3 Pals novos pra entrar no lugar.
function SacrificePanel({ pendingChoice, busy, onChooseSacrifice, onChooseNew, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeSacrificeTitle')}</h3>
      <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3' }}>
        {pendingChoice.step === 'choose_sacrifice' ? t('roguelikeSacrificeChooseTarget') : t('roguelikeSacrificeChooseNew')}
      </p>
      <CardOfferGrid
        options={pendingChoice.step === 'choose_sacrifice' ? pendingChoice.targets : pendingChoice.options}
        busy={busy}
        onPick={pendingChoice.step === 'choose_sacrifice' ? onChooseSacrifice : onChooseNew}
      />
    </div>
  )
}

// Loja Clandestina: passo 1 escolhe cor (A/B reveladas, 3ª opção só mostra um símbolo de sorte até
// clicar), passo 2 escolhe 1 Pal daquela cor entre 3 custos distintos.
function BlackMarketPanel({ pendingChoice, busy, onChooseColor, onChooseCost, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeBlackMarketTitle')}</h3>
      {pendingChoice.step === 'choose_color' && (
        <>
          <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3' }}>{t('roguelikeBlackMarketChooseColor')}</p>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', marginTop: 'var(--sp-md)' }}>
            {pendingChoice.colorOptions.map(option => (
              <button
                key={option.key}
                className="sign-button sign-button-fluid"
                disabled={busy}
                onClick={() => onChooseColor(option.key)}
                style={{ minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {option.color ? (
                  <><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLOR_SWATCH[option.color], display: 'inline-block' }} /> {option.color}</>
                ) : (
                  <>🎲 {t('roguelikeBlackMarketRandomLabel')}</>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      {pendingChoice.step === 'choose_cost' && (
        <>
          <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3' }}>{t('roguelikeBlackMarketChooseCost', { color: pendingChoice.color })}</p>
          <CardOfferGrid options={pendingChoice.options} busy={busy} onPick={onChooseCost} />
        </>
      )}
    </div>
  )
}

// Baú Raro: sem escolha nenhuma — só mostra o que já foi ganho (aplicado no enter-node) e espera
// o clique de "Continuar" pra liberar o mapa.
function RareChestPanel({ pendingChoice, busy, onContinue, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeRareChestTitle')}</h3>
      <p style={{ fontSize: 'var(--fs-sm)' }}>{t('roguelikeRareChestSummary', { dogecoins: pendingChoice.dogecoins })}</p>
      <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
        {pendingChoice.cards.map((card, i) => (
          <div key={i} style={{ width: 'clamp(110px, 12vw, 150px)' }}>
            <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
            <p style={{ fontSize: 'var(--fs-xs)', margin: '4px 0 0' }}>{card.name}</p>
          </div>
        ))}
      </div>
      <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-lg)' }} disabled={busy} onClick={onContinue}>
        {t('roguelikeContinueButton')}
      </button>
    </div>
  )
}

// Encontro Selvagem: multi-seleção das cópias físicas do deck (Pal/Structure, cartas com Power) —
// soma em tempo real, compara com o Power da carta encontrada só ao confirmar.
function WildEncounterPanel({ pendingChoice, busy, onConfirm, t }) {
  const [selected, setSelected] = useState(new Set())
  const toggle = (index) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }
  const powerSum = pendingChoice.deckCards.filter(c => selected.has(c.index)).reduce((sum, c) => sum + c.power, 0)

  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeWildEncounterTitle')}</h3>
      <div style={{ width: 'clamp(140px, 16vw, 200px)', margin: '0 auto' }}>
        <img src={pendingChoice.encounterCard.imageUrl} alt={pendingChoice.encounterCard.name} style={{ width: '100%', borderRadius: '10px', border: '2px solid #c99a4e' }} />
      </div>
      <p style={{ fontSize: 'var(--fs-sm)' }}>{t('roguelikeWildEncounterIntro', { name: pendingChoice.encounterCard.name, power: pendingChoice.encounterCard.power })}</p>
      <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700, color: powerSum >= pendingChoice.encounterCard.power ? '#8bc34a' : '#f3e2b3' }}>
        {t('roguelikeWildEncounterPowerSumLabel', { sum: powerSum, target: pendingChoice.encounterCard.power })}
      </p>
      <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
        {pendingChoice.deckCards.map(card => (
          <div
            key={card.index}
            onClick={() => toggle(card.index)}
            style={{
              cursor: 'pointer', width: 'clamp(90px, 10vw, 120px)',
              outline: selected.has(card.index) ? '3px solid #8bc34a' : 'none', borderRadius: '10px'
            }}
          >
            <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
            <p style={{ fontSize: 'var(--fs-2xs)', margin: '4px 0 0' }}>{card.name} ({card.power})</p>
          </div>
        ))}
      </div>
      <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-lg)' }} disabled={busy} onClick={() => onConfirm([...selected])}>
        {t('roguelikeWildEncounterConfirmButton')}
      </button>
    </div>
  )
}

// Breeding: passo 1 escolhe o 1º pai, passo 2 escolhe o 2º (o servidor já filtra a mesma carta se
// só houver 1 cópia dela no deck) — os 2 pais continuam no deck, só a cria nova entra.
function BreedingPanel({ pendingChoice, busy, onChooseParent1, onChooseParent2, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeBreedingTitle')}</h3>
      <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3' }}>
        {pendingChoice.step === 'choose_parent1' ? t('roguelikeBreedingChooseParent1') : t('roguelikeBreedingChooseParent2')}
      </p>
      <CardOfferGrid
        options={pendingChoice.targets}
        busy={busy}
        onPick={pendingChoice.step === 'choose_parent1' ? onChooseParent1 : onChooseParent2}
      />
    </div>
  )
}

// Descrição legível de 1 opção da Bancada de Remédios — mesma carta de opções em ambos os passos
// (escolher opção / ver o que foi escolhido antes de escolher o alvo).
function medicineOptionLabel(option, t) {
  const parts = []
  if (option.powerBonus) parts.push(`+${option.powerBonus} Power`)
  if (option.strikeBonus) parts.push(`+${option.strikeBonus} Strike`)
  if (option.keyword) parts.push(t('roguelikeGrantKeywordLabel', { keyword: option.keyword }))
  if (option.makeLucky) parts.push(t('roguelikeMakeLuckyLabel'))
  return parts.join(' + ')
}

const MEDICINE_OPTION_ICON = { power: '💪', strike: '⚔️', keyword: '✨', rare: '🌟', ultra_rare: '🍀' }

// Bancada de Remédios: passo 1 escolhe a opção (3-5 cartas, raras vêm de rolls independentes no
// servidor), passo 2 escolhe qual Pal do deck atual recebe o efeito.
function MedicineBenchPanel({ pendingChoice, busy, onChooseOption, onChooseTarget, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeMedicineBenchTitle')}</h3>
      {pendingChoice.step === 'choose_option' && (
        <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
          {pendingChoice.options.map((option, index) => (
            <button
              key={index}
              className="sign-button sign-button-fluid"
              disabled={busy}
              onClick={() => onChooseOption(index)}
              style={{ minWidth: '160px' }}
            >
              {MEDICINE_OPTION_ICON[option.key]} {medicineOptionLabel(option, t)}
            </button>
          ))}
        </div>
      )}
      {pendingChoice.step === 'choose_target' && (
        <>
          <p style={{ fontSize: 'var(--fs-sm)' }}>{medicineOptionLabel(pendingChoice.chosenOption, t)}</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3' }}>{t('roguelikeMedicineBenchChooseTarget')}</p>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
            {pendingChoice.targets.map(target => (
              <div
                key={target.cardNumber}
                onClick={() => !busy && onChooseTarget(target.cardNumber)}
                style={{ cursor: busy ? 'default' : 'pointer', width: 'clamp(110px, 12vw, 150px)', opacity: busy ? 0.6 : 1 }}
              >
                <img src={target.imageUrl} alt={target.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
                <p style={{ fontSize: 'var(--fs-xs)', margin: '4px 0 0' }}>{target.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Loja (dogecoin): 3 cartas de cada tipo, compra quantas quiser enquanto o saldo durar, sai quando
// quiser (libera o nó só ao sair).
function ShopPanel({ pendingChoice, dogecoins, busy, onBuy, onLeave, t }) {
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
      <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeShopTitle')}</h3>
      <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
        {pendingChoice.options.map(item => (
          <div
            key={item.cardNumber}
            onClick={() => !busy && !item.purchased && dogecoins >= item.price && onBuy(item.cardNumber)}
            style={{
              cursor: (busy || item.purchased || dogecoins < item.price) ? 'default' : 'pointer',
              width: 'clamp(110px, 12vw, 150px)', opacity: item.purchased ? 0.35 : (dogecoins < item.price ? 0.6 : 1)
            }}
          >
            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
            <p style={{ fontSize: 'var(--fs-xs)', margin: '4px 0 0' }}>{item.name}</p>
            <p style={{ fontSize: 'var(--fs-xs)', margin: 0, color: '#ffd76a' }}>
              {item.purchased ? t('roguelikeShopPurchasedLabel') : <><img src="/dogecoin.webp" alt="" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }} /> {item.price}</>}
            </p>
          </div>
        ))}
      </div>
      <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-lg)' }} disabled={busy} onClick={onLeave}>
        {t('roguelikeShopLeaveButton')}
      </button>
    </div>
  )
}

// Tela de resultado final — vitória sobre o Boss ou vidas esgotadas. Mostra o deck que a run
// terminou tendo, quanto os dogecoins renderam em gold_coins (já creditado no momento em que a run
// terminou, ver convertRoguelikeDogecoinsToGold no backend) e libera uma expedição nova ao confirmar.
function FinishedRunSummary({ run, busy, onAcknowledge, t }) {
  const won = run.status === 'finished_win'
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
      <h2 style={{ fontSize: 'var(--fs-lg)', color: won ? '#8bc34a' : '#ff8a80' }}>
        {won ? t('roguelikeRunWonTitle') : t('roguelikeRunLostTitle')}
      </h2>
      <p style={{ fontSize: 'var(--fs-md)' }}>
        <img src="/dogecoin.webp" alt="dogecoin" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }} />
        {t('roguelikeGoldConvertedLabel', { gold: run.goldConverted })}
      </p>
      <DeckPanel draftedCards={run.draftedCards} t={t} />
      <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-lg)' }} disabled={busy} onClick={onAcknowledge}>
        {t('roguelikeNewExpeditionButton')}
      </button>
    </div>
  )
}

// Modo Expedição (roguelike solo estilo Slay the Spire). Escolhe 1 de 5 decks-personagem fixos e
// navega o mapa gerado: batalhas contra bot escalando por profundidade (Fase 2), Bancada de
// Remédios e Loja (Fase 3), pool de 5 eventos (Fase 4). Ao terminar (vitória sobre o Boss ou vidas
// esgotadas), os dogecoins da run convertem em gold_coins reais e uma tela de resultado resume o
// deck final antes de liberar uma expedição nova (Fase 5).
function Roguelike() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [run, setRun] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [zoomCard, setZoomCard] = useState(null)
  const hoverTimerRef = useRef(null)
  const startHoverZoom = (imageUrl, name) => {
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setZoomCard({ imageUrl, name }), 500)
  }
  const cancelHoverZoom = () => {
    clearTimeout(hoverTimerRef.current)
    setZoomCard(null)
  }

  const loadStatus = () => {
    apiFetch('/api/roguelike/status').then(r => r.json()).then(data => {
      setRun(data)
      setLoading(false)
      // Nó de batalha/chefe já foi aberto (ex.: o jogador voltou pra essa tela ou deu F5 no meio
      // de uma partida) — não tem nada útil pra mostrar aqui, manda direto pro tabuleiro de novo.
      if (data.active && data.status === 'in_battle') {
        navigate('/game', { state: { roguelikeRunId: data.id } })
      }
    })
  }
  useEffect(() => { loadStatus() }, [])

  const chooseDeck = (starterDeckKey) => {
    setError('')
    setBusy(true)
    apiJson('/api/roguelike/start', { method: 'POST', body: JSON.stringify({ starterDeckKey }) })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const enterNode = (nodeId) => {
    setError('')
    setBusy(true)
    apiJson('/api/roguelike/enter-node', { method: 'POST', body: JSON.stringify({ nodeId }) })
      .then(data => {
        setRun(data)
        if (data.status === 'in_battle') navigate('/game', { state: { roguelikeRunId: data.id } })
      })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const resolveChoice = (body) => {
    setError('')
    setBusy(true)
    apiJson('/api/roguelike/resolve-choice', { method: 'POST', body: body ? JSON.stringify(body) : undefined })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const acknowledgeResult = () => {
    setError('')
    setBusy(true)
    apiJson('/api/roguelike/acknowledge-result', { method: 'POST' })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  if (loading || !run) return <p style={{ padding: '2rem' }}>{t('roguelikeLoading')}</p>

  const isFinished = run.active && (run.status === 'finished_win' || run.status === 'finished_dead')
  const layers = run.active && !isFinished
    ? Object.values(run.map.nodes).reduce((acc, n) => {
        (acc[n.layer] ||= []).push(n)
        return acc
      }, {})
    : {}
  const layerIndexes = Object.keys(layers).map(Number).sort((a, b) => a - b)

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', padding: 'var(--sp-xl)', textAlign: 'center',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
      <Link to="/" style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)' }}>
        <button className="sign-button sign-button-fluid">{t('backToMenu')}</button>
      </Link>

      <h1 className="title-sign" style={{ marginTop: 0 }}>{t('roguelikeTitle')}</h1>
      {error && <p style={{ color: '#ff8a80' }}>{error}</p>}

      {!run.active && (
        <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
          <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>{t('roguelikeChooseDeckIntro')}</p>
          <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-lg)' }}>
            {run.starterDecks.map(deck => (
              <StarterDeckCard
                key={deck.key}
                deck={deck}
                onChoose={chooseDeck}
                busy={busy}
                startHoverZoom={startHoverZoom}
                cancelHoverZoom={cancelHoverZoom}
                t={t}
              />
            ))}
          </div>

          {zoomCard && (
            <div style={{
              position: 'fixed', top: '50%', right: 'var(--sp-lg)', transform: 'translateY(-50%)',
              zIndex: 1000, pointerEvents: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', borderRadius: '10px'
            }}>
              <img src={zoomCard.imageUrl} alt={zoomCard.name} style={{ width: 'clamp(240px, 22vw, 340px)', borderRadius: '10px' }} />
            </div>
          )}
        </div>
      )}

      {isFinished && <FinishedRunSummary run={run} busy={busy} onAcknowledge={acknowledgeResult} t={t} />}

      {run.active && !isFinished && (
        <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '1.5rem auto', color: '#f3e2b3' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-lg)', fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-lg)' }}>
            <span>❤️ {t('roguelikeLivesLabel', { lives: run.lives })}</span>
            <span><img src="/dogecoin.webp" alt="dogecoin" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }} />{run.dogecoins}</span>
          </div>

          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('roguelikeMapTitle')}</h2>
          <div style={{ display: 'flex', gap: 'var(--sp-xl)', overflowX: 'auto', padding: 'var(--sp-lg) var(--sp-sm)', justifyContent: layerIndexes.length <= 6 ? 'center' : 'flex-start' }}>
            {layerIndexes.map(layerIdx => (
              <div key={layerIdx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)', alignItems: 'center', flexShrink: 0 }}>
                {layers[layerIdx].map(node => (
                  <MapNode
                    key={node.id}
                    node={node}
                    disabled={NODES_COMING_SOON.has(node.type)}
                    onClick={() => enterNode(node.id)}
                    t={t}
                  />
                ))}
              </div>
            ))}
          </div>

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'battle_reward' && (
            <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto' }}>
              <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeBattleRewardTitle')}</h3>
              <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-md)' }}>
                {run.pendingChoice.options.map(card => (
                  <div
                    key={card.cardNumber}
                    onClick={() => !busy && resolveChoice({ cardNumber: card.cardNumber })}
                    style={{ cursor: busy ? 'default' : 'pointer', width: 'clamp(130px, 14vw, 180px)', opacity: busy ? 0.6 : 1 }}
                  >
                    <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
                    <p style={{ fontSize: 'var(--fs-sm)', margin: '6px 0 0' }}>{card.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'medicine_bench' && (
            <MedicineBenchPanel
              pendingChoice={run.pendingChoice}
              busy={busy}
              onChooseOption={(optionIndex) => resolveChoice({ optionIndex })}
              onChooseTarget={(cardNumber) => resolveChoice({ cardNumber })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'shop' && (
            <ShopPanel
              pendingChoice={run.pendingChoice}
              dogecoins={run.dogecoins}
              busy={busy}
              onBuy={(cardNumber) => resolveChoice({ action: 'buy', cardNumber })}
              onLeave={() => resolveChoice({ action: 'leave' })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'sacrifice' && (
            <SacrificePanel
              pendingChoice={run.pendingChoice}
              busy={busy}
              onChooseSacrifice={(cardNumber) => resolveChoice({ cardNumber })}
              onChooseNew={(cardNumber) => resolveChoice({ cardNumber })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'black_market' && (
            <BlackMarketPanel
              pendingChoice={run.pendingChoice}
              busy={busy}
              onChooseColor={(choice) => resolveChoice({ choice })}
              onChooseCost={(cardNumber) => resolveChoice({ cardNumber })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'rare_chest' && (
            <RareChestPanel pendingChoice={run.pendingChoice} busy={busy} onContinue={() => resolveChoice()} t={t} />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'wild_encounter' && (
            <WildEncounterPanel
              pendingChoice={run.pendingChoice}
              busy={busy}
              onConfirm={(selectedIndexes) => resolveChoice({ selectedIndexes })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'breeding' && (
            <BreedingPanel
              pendingChoice={run.pendingChoice}
              busy={busy}
              onChooseParent1={(cardNumber) => resolveChoice({ cardNumber })}
              onChooseParent2={(cardNumber) => resolveChoice({ cardNumber })}
              t={t}
            />
          )}

          {run.status === 'in_event' && run.pendingChoice && run.pendingChoice.kind === 'coming_soon' && (
            <div style={{ maxWidth: 'var(--panel-w-xs)', margin: '2rem auto', background: 'rgba(0,0,0,0.4)', border: '2px solid #c99a4e', borderRadius: '12px', padding: 'var(--sp-lg)' }}>
              <p style={{ fontSize: 'var(--fs-lg)' }}>{NODE_ICON[run.pendingChoice.nodeType]}</p>
              <h3 style={{ fontSize: 'var(--fs-md)' }}>{t(`roguelikeNodeType_${run.pendingChoice.nodeType}`)}</h3>
              <p style={{ fontSize: 'var(--fs-sm)' }}>{t('roguelikeNodeComingSoonBody')}</p>
              <button className="sign-button sign-button-fluid" disabled={busy} onClick={() => resolveChoice()}>
                {t('roguelikeContinueButton')}
              </button>
            </div>
          )}

          <DeckPanel draftedCards={run.draftedCards} t={t} />
        </div>
      )}
    </div>
  )
}

export default Roguelike
