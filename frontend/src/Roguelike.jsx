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
// `status` controla opacidade/destaque; `disabled` é só pros tipos de nó ainda desabilitados. O
// Boss ganha um token maior — tem que pesar mais na tela que um nó comum.
function MapNode({ node, onClick, disabled, t }) {
  const [hovering, setHovering] = useState(false)
  const clickable = node.status === 'available' && !disabled
  const isCleared = node.status === 'cleared'
  const isLocked = node.status === 'locked'
  const isBoss = node.type === 'boss'
  const woodGrain = 'repeating-radial-gradient(circle at 35% 30%, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 2px, transparent 7px)'
  const size = isBoss ? 'clamp(64px, 7.5vw, 88px)' : 'clamp(52px, 6vw, 72px)'
  return (
    <button
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      title={disabled && node.status === 'available' ? t('roguelikeNodeLockedHint') : t(`roguelikeNodeType_${node.type}`)}
      style={{
        width: size, height: size, borderRadius: '50%', zIndex: 1,
        border: isBoss && !isLocked ? '2px solid rgba(120,20,20,0.6)' : '2px solid rgba(0,0,0,0.35)',
        cursor: clickable ? 'pointer' : 'default', position: 'relative',
        background: isLocked
          ? `${woodGrain}, radial-gradient(circle at 35% 30%, #5a4433, #2e2013)`
          : isBoss
            ? `${woodGrain}, radial-gradient(circle at 35% 30%, #8a3a3a, #3a1010)`
            : `${woodGrain}, radial-gradient(circle at 35% 30%, #c99a68, #6b4423)`,
        boxShadow: isLocked
          ? 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -2px 3px rgba(255,255,255,0.05)'
          : `inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.45)${clickable && hovering ? ', 0 0 0 3px rgba(255,215,106,0.55)' : ''}`,
        opacity: isLocked ? 0.45 : (disabled && node.status === 'available' ? 0.55 : 1),
        filter: isCleared ? 'grayscale(0.6)' : 'none',
        transform: clickable && hovering ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        fontSize: isBoss ? 'var(--fs-xl)' : 'var(--fs-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textShadow: '1px 1px 1px rgba(0,0,0,0.65), -1px -1px 1px rgba(255,255,255,0.12)'
      }}
    >
      {isCleared ? '✔️' : NODE_ICON[node.type]}
    </button>
  )
}

const NODE_LEGEND = ['battle', 'medicine_bench', 'shop', 'event', 'boss']

// O mapa é mais largo que a janela visível (câmera segue o jogador, ver RoguelikeMapCanvas) — X de
// cada nó vira uma posição fixa em pixels (não percentual do painel), Y continua percentual
// (a altura não rola, só a largura). MAP_VIEWPORT_WIDTH também é usado no cálculo da câmera — a
// largura real em CSS usa min(860px, 94vw), então em telas bem estreitas o cálculo fica aproximado.
const MAP_VIEWPORT_WIDTH = 860
const LAYER_SPACING = 190
const MAP_SIDE_PADDING = 70

function mapContentWidth(layerIndexes) {
  return MAP_SIDE_PADDING * 2 + LAYER_SPACING * Math.max(0, layerIndexes.length - 1)
}

// Posição de cada nó dentro do painel do mapa — camada vira coluna (X, em pixels), posição dentro
// da camada vira linha (Y, percentual), espalhada e centralizada verticalmente. Puramente derivado
// dos dados (sem medir DOM), então as linhas conectoras do SVG e os botões dos nós sempre concordam.
function layoutNodePositions(layerIndexes, layers) {
  const positions = {}
  layerIndexes.forEach((layerIdx, i) => {
    const x = MAP_SIDE_PADDING + i * LAYER_SPACING
    const nodesInLayer = layers[layerIdx]
    nodesInLayer.forEach((node, idx) => {
      const y = nodesInLayer.length <= 1 ? 50 : 15 + (idx * (70 / (nodesInLayer.length - 1)))
      positions[node.id] = { x, y }
    })
  })
  return positions
}

// Cor/estilo da linha que liga 2 nós — reflete o progresso: caminho já percorrido fica dourado
// sólido, opções ainda disponíveis ficam tracejadas douradas mais fracas, o resto (bloqueado) quase
// invisível — dá pra "ler" o mapa de relance sem precisar ler o status de cada nó individualmente.
// strokeWidth em pixels de verdade (não em unidades do viewBox) — combinado com
// vectorEffect="non-scaling-stroke" no <line>, evita que o preserveAspectRatio="none" (necessário
// pra esticar x/y de forma independente) deixe a linha com espessura distorcida.
function edgeStyle(sourceStatus) {
  if (sourceStatus === 'cleared') return { stroke: '#ffd76a', strokeWidth: 2.5, strokeDasharray: 'none', opacity: 0.85, flowing: false }
  if (sourceStatus === 'available') return { stroke: '#ffd76a', strokeWidth: 2, strokeDasharray: '6,5', opacity: 0.6, flowing: true }
  return { stroke: '#8a7358', strokeWidth: 1.5, strokeDasharray: '3,5', opacity: 0.25, flowing: false }
}

// Brasas subindo no fundo do painel — posições/tempos fixos (não Math.random() a cada render, senão
// elas "pulam" de lugar a cada atualização de estado) — só decoração, atrás de tudo o resto.
const MAP_EMBERS = [
  { left: 8, delay: 0, duration: 7 }, { left: 18, delay: 2.2, duration: 8.5 }, { left: 30, delay: 4.5, duration: 6.5 },
  { left: 45, delay: 1.1, duration: 9 }, { left: 58, delay: 3.3, duration: 7.5 }, { left: 70, delay: 5.5, duration: 8 },
  { left: 82, delay: 0.8, duration: 6.8 }, { left: 92, delay: 2.9, duration: 7.8 }
]

// Keyframes usados pelo mapa — injetado 1x aqui perto do que os usa (glow "respirando" nos nós
// disponíveis, brasas subindo, linha tracejada "correndo" pros nós disponíveis, marcador de posição
// balançando). Tudo via classe/animation, nunca sobrescrevendo o box-shadow/transform inline dos
// nós (que muda por instância) — o glow e o marcador são elementos à parte, só decorativos.
const MAP_STYLE_TAG = (
  <style>{`
    @keyframes rgNodeGlowGold { 0%, 100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
    @keyframes rgNodeGlowBoss { 0%, 100% { opacity: 0.55; transform: scale(0.92); } 50% { opacity: 1; transform: scale(1.15); } }
    @keyframes rgEmberFloat { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 0.9; } 85% { opacity: 0.35; } 100% { transform: translateY(-220px) scale(1); opacity: 0; } }
    @keyframes rgDashFlow { to { stroke-dashoffset: -22; } }
    @keyframes rgMarkerBob { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
    @keyframes rgPanelIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes rgBossVignette { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.5; } }
    @keyframes rgFloatUp { 0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); } 20% { opacity: 1; transform: translate(-50%, -6px) scale(1); } 100% { opacity: 0; transform: translate(-50%, -32px) scale(1); } }
    .rg-node-pulse { position: absolute; inset: -7px; border-radius: 50%; pointer-events: none; animation: rgNodeGlowGold 2s ease-in-out infinite; box-shadow: 0 0 14px 6px rgba(255,215,106,0.55); }
    .rg-node-pulse--boss { animation-name: rgNodeGlowBoss; box-shadow: 0 0 18px 8px rgba(255,60,60,0.6); }
    .rg-edge-flowing { animation: rgDashFlow 1s linear infinite; }
    .rg-marker { position: absolute; left: 50%; top: -18px; animation: rgMarkerBob 1.6s ease-in-out infinite; pointer-events: none; font-size: var(--fs-md); filter: drop-shadow(0 0 4px rgba(255,150,50,0.8)); }
    .rg-ember { position: absolute; bottom: 0; width: 3px; height: 3px; border-radius: 50%; background: radial-gradient(circle, #ffd76a, transparent); animation: rgEmberFloat linear infinite; }
    .rg-map-panel { animation: rgPanelIn 0.5s ease-out; }
    .rg-boss-vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 100%, rgba(200,20,20,0.5), transparent 65%); animation: rgBossVignette 2.6s ease-in-out infinite; }
    .rg-hud-stat { position: relative; display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.3)); border: 2px solid #c99a4e; border-radius: 999px; padding: 6px 16px; box-shadow: inset 0 1px 2px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.4); }
    .rg-floating-feedback { position: absolute; left: 50%; top: -6px; font-weight: 700; font-size: var(--fs-sm); white-space: nowrap; animation: rgFloatUp 1.5s ease-out forwards; pointer-events: none; }
    .rg-floating-feedback--gold { color: #ffd76a; text-shadow: 0 0 6px rgba(255,215,106,0.8); }
    .rg-floating-feedback--life { color: #ff6b6b; text-shadow: 0 0 6px rgba(255,60,60,0.8); }
  `}</style>
)

// Silhuetas de montanha/floresta no fundo do painel (2 camadas, clip-path) — só pra dar sensação de
// ambiente/profundidade em vez de um gradiente liso. Puramente decorativo, sem depender de imagem.
function MapBackdrop() {
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%', opacity: 0.35, background: '#1a3a2e',
        clipPath: 'polygon(0% 100%, 0% 45%, 8% 58%, 18% 32%, 30% 60%, 42% 22%, 55% 52%, 68% 18%, 80% 50%, 92% 28%, 100% 48%, 100% 100%)'
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', opacity: 0.55, background: '#0d1f17',
        clipPath: 'polygon(0% 100%, 0% 62%, 12% 76%, 25% 48%, 38% 74%, 50% 40%, 63% 70%, 76% 44%, 88% 66%, 100% 52%, 100% 100%)'
      }} />
    </>
  )
}

// Painel do mapa em si — moldura de "mapa de expedição" com as linhas do grafo desenhadas em SVG
// por baixo dos nós. O conteúdo (linhas+nós) é mais largo que a janela visível e desliza como uma
// câmera seguindo o jogador: a camada do último nó visitado fica sempre perto do início da tela,
// revelando o que vem pela frente, em vez de encolher o mapa inteiro pra caber de uma vez. Fundo
// (montanhas/brasas) fica fixo na janela — só o "terreno" em si se move, dando profundidade.
// Nó disponível ganha um glow pulsante (vermelho pro Boss), o último nó visitado ganha um marcador
// de "você está aqui", e o caminho ainda aberto tem a linha tracejada "correndo" na direção certa.
function RoguelikeMapCanvas({ layers, layerIndexes, disabledTypes, currentNodeId, onEnterNode, t }) {
  const positions = layoutNodePositions(layerIndexes, layers)
  const allNodes = layerIndexes.flatMap(layerIdx => layers[layerIdx])
  const bossAvailable = allNodes.some(n => n.type === 'boss' && n.status === 'available')
  const contentWidth = mapContentWidth(layerIndexes)

  const currentNode = allNodes.find(n => n.id === currentNodeId)
  const focusX = MAP_SIDE_PADDING + (currentNode ? currentNode.layer : 0) * LAYER_SPACING
  const scrollX = Math.max(0, Math.min(contentWidth - MAP_VIEWPORT_WIDTH, focusX - MAP_VIEWPORT_WIDTH * 0.32))

  return (
    <div>
      {MAP_STYLE_TAG}
      <div className="rg-map-panel" style={{
        position: 'relative', width: 'min(860px, 94vw)', margin: '0 auto', height: 'clamp(320px, 40vw, 500px)',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(180deg, #3a2718, #201409)',
        border: '3px solid #c99a4e', borderRadius: '16px',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        <MapBackdrop />
        {bossAvailable && <div className="rg-boss-vignette" />}

        {MAP_EMBERS.map((ember, i) => (
          <div key={i} className="rg-ember" style={{ left: `${ember.left}%`, animationDelay: `${ember.delay}s`, animationDuration: `${ember.duration}s` }} />
        ))}

        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', width: `${contentWidth}px`,
          transform: `translateX(-${scrollX}px)`, transition: 'transform 0.7s ease'
        }}>
          <svg viewBox={`0 0 ${contentWidth} 100`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {allNodes.flatMap(node => node.edgesTo.map(targetId => {
              const from = positions[node.id]
              const to = positions[targetId]
              if (!from || !to) return null
              const style = edgeStyle(node.status)
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  className={style.flowing ? 'rg-edge-flowing' : undefined}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={style.stroke} strokeWidth={style.strokeWidth} strokeDasharray={style.strokeDasharray}
                  opacity={style.opacity} strokeLinecap="round" vectorEffect="non-scaling-stroke"
                />
              )
            }))}
          </svg>

          {allNodes.map(node => {
            const pos = positions[node.id]
            const disabled = disabledTypes.has(node.type)
            const clickable = node.status === 'available' && !disabled
            return (
              <div key={node.id} style={{ position: 'absolute', left: `${pos.x}px`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
                {clickable && <div className={`rg-node-pulse${node.type === 'boss' ? ' rg-node-pulse--boss' : ''}`} />}
                {node.id === currentNodeId && <span className="rg-marker">🔥</span>}
                <MapNode node={node} disabled={disabled} onClick={() => onEnterNode(node.id, node.type)} t={t} />
              </div>
            )
          })}
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap',
        marginTop: 'var(--sp-sm)', fontSize: 'var(--fs-2xs)', color: '#d9c4a3'
      }}>
        {NODE_LEGEND.map(type => (
          <span key={type}>{NODE_ICON[type]} {t(`roguelikeNodeType_${type}`)}</span>
        ))}
      </div>
    </div>
  )
}

// Plaqueta de HUD (vidas/dogecoins) com texto flutuante "+N"/"-N" passageiro quando o valor muda —
// `feedback` já vem filtrado pro tipo certo (gold/life) por quem chama.
function HudStat({ icon, value, feedback }) {
  return (
    <span className="rg-hud-stat">
      {icon}<strong>{value}</strong>
      {feedback.map(f => <span key={f.id} className={`rg-floating-feedback rg-floating-feedback--${f.type}`}>{f.text}</span>)}
    </span>
  )
}

const EXPEDITION_LENGTH_KEYS = ['short', 'medium', 'long']

// Seletor de duração da expedição (Rápida/Média/Longa) — escolhido junto com o deck-personagem,
// antes de iniciar a run. Cada tamanho gera um mapa com mais ou menos camadas antes do Boss (ver
// EXPEDITION_LENGTHS em roguelikeMap.js), sempre 3 trilhas por camada.
function ExpeditionLengthSelector({ value, onChange, busy, t }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center', marginTop: 'var(--sp-md)', flexWrap: 'wrap' }}>
      {EXPEDITION_LENGTH_KEYS.map(key => (
        <button
          key={key}
          className="sign-button sign-button-fluid"
          disabled={busy}
          onClick={() => onChange(key)}
          style={{ opacity: value === key ? 1 : 0.55, outline: value === key ? '3px solid #ffd76a' : 'none' }}
        >
          {t(`roguelikeExpeditionLength_${key}`)}
        </button>
      ))}
    </div>
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
// terminou tendo, quanto os dogecoins renderam em gold_coins + ingredientes (já creditado no
// momento em que a run terminou, ver computeRoguelikeDogecoinConversion no backend) e libera uma
// expedição nova ao confirmar.
function FinishedRunSummary({ run, busy, onAcknowledge, t }) {
  const won = run.status === 'finished_win'
  return (
    <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
      <h2 style={{ fontSize: 'var(--fs-lg)', color: won ? '#8bc34a' : '#ff8a80' }}>
        {won ? t('roguelikeRunWonTitle') : t('roguelikeRunLostTitle')}
      </h2>
      <p style={{ fontSize: 'var(--fs-md)' }}>
        <img src="/dogecoin.webp" alt="dogecoin" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }} />
        {t('roguelikeGoldConvertedLabel', { gold: run.goldConverted, ingredient: run.ingredientConverted })}
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

  // Texto flutuante "+N"/"-N" no HUD quando dogecoins sobe ou vidas cai. Detecção comparando com o
  // snapshot do render anterior guardado em STATE (não ref — refs não podem ser lidos/escritos
  // durante o render) direto no corpo do componente: é o padrão documentado do React pra "ajustar
  // estado quando algo muda", dispara já no mesmo ciclo, sem precisar de useEffect pra isso. Só
  // conta a partir da 2ª leitura (a 1ª só define a base, senão o valor inicial da run "piscaria"
  // como se tivesse acabado de ganhar tudo de uma vez).
  const [feedback, setFeedback] = useState([])
  const [prevStats, setPrevStats] = useState(null)
  const scheduledFeedbackIdsRef = useRef(new Set())
  if (run && run.active) {
    if (prevStats && (run.dogecoins !== prevStats.dogecoins || run.lives !== prevStats.lives)) {
      const toasts = []
      // Id derivado só do valor novo em si (nunca Date.now()/Math.random() — render precisa ser
      // puro): único o bastante na prática, já que vidas/dogecoins mudam pra um valor novo a cada
      // evento que gera um texto flutuante.
      if (run.dogecoins > prevStats.dogecoins) toasts.push({ id: `gold-${run.dogecoins}`, text: `+${run.dogecoins - prevStats.dogecoins}`, type: 'gold' })
      if (run.lives < prevStats.lives) toasts.push({ id: `life-${run.lives}`, text: `-${prevStats.lives - run.lives}`, type: 'life' })
      setPrevStats({ lives: run.lives, dogecoins: run.dogecoins })
      if (toasts.length > 0) setFeedback(f => [...f, ...toasts])
    } else if (!prevStats) {
      setPrevStats({ lives: run.lives, dogecoins: run.dogecoins })
    }
  }
  // Cada texto some sozinho depois de 1.5s — inscrição num timer de verdade (setTimeout), com
  // setState só dentro do callback assíncrono dele, não sincronamente no corpo do efeito.
  useEffect(() => {
    for (const item of feedback) {
      if (scheduledFeedbackIdsRef.current.has(item.id)) continue
      scheduledFeedbackIdsRef.current.add(item.id)
      setTimeout(() => {
        setFeedback(f => f.filter(x => x.id !== item.id))
        scheduledFeedbackIdsRef.current.delete(item.id)
      }, 1500)
    }
  }, [feedback])

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

  const [expeditionLength, setExpeditionLength] = useState('medium')
  const chooseDeck = (starterDeckKey) => {
    setError('')
    setBusy(true)
    apiJson('/api/roguelike/start', { method: 'POST', body: JSON.stringify({ starterDeckKey, expeditionLength }) })
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

  // Clicar no Boss pede confirmação primeiro (mostra o que está em jogo) — os demais tipos de nó
  // entram direto, igual sempre foi.
  const [showBossConfirm, setShowBossConfirm] = useState(null)
  const handleNodeClick = (nodeId, nodeType) => {
    if (nodeType === 'boss') setShowBossConfirm(nodeId)
    else enterNode(nodeId)
  }
  const confirmBossFight = () => {
    const nodeId = showBossConfirm
    setShowBossConfirm(null)
    enterNode(nodeId)
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

          <h3 style={{ fontSize: 'var(--fs-md)', margin: '0' }}>{t('roguelikeExpeditionLengthTitle')}</h3>
          <ExpeditionLengthSelector value={expeditionLength} onChange={setExpeditionLength} busy={busy} t={t} />

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
            <HudStat icon="❤️ " value={t('roguelikeLivesLabel', { lives: run.lives })} feedback={feedback.filter(f => f.type === 'life')} />
            <HudStat
              icon={<img src="/dogecoin.webp" alt="dogecoin" style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '4px' }} />}
              value={run.dogecoins}
              feedback={feedback.filter(f => f.type === 'gold')}
            />
          </div>

          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('roguelikeMapTitle')}</h2>
          <RoguelikeMapCanvas
            layers={layers}
            layerIndexes={layerIndexes}
            disabledTypes={NODES_COMING_SOON}
            currentNodeId={run.currentNodeId}
            onEnterNode={handleNodeClick}
            t={t}
          />

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

      {showBossConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            maxWidth: 'var(--panel-w-xs)', background: '#2b1a10', border: '3px solid #c99a4e',
            borderRadius: '16px', padding: 'var(--sp-lg)', textAlign: 'center', color: '#f3e2b3'
          }}>
            <p style={{ fontSize: 'var(--fs-xl)', margin: 0 }}>💀</p>
            <h3 style={{ fontSize: 'var(--fs-md)' }}>{t('roguelikeBossConfirmTitle')}</h3>
            <p style={{ fontSize: 'var(--fs-sm)' }}>{t('roguelikeBossConfirmBody', { lives: run.lives })}</p>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center', marginTop: 'var(--sp-md)' }}>
              <button className="sign-button sign-button-fluid" disabled={busy} onClick={confirmBossFight}>
                {t('roguelikeBossConfirmYes')}
              </button>
              <button className="sign-button sign-button-fluid" disabled={busy} onClick={() => setShowBossConfirm(null)}>
                {t('roguelikeBossConfirmNo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Roguelike
