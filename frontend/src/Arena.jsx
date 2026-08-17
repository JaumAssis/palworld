import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch, apiJson } from './api'

const COLOR_SWATCH = { Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a' }
const ARENA_TICKET_PRICE = 100 // só pra exibição/gate de UI — o servidor revalida o preço de verdade
// As chaves internas (wood/bronze/silver/gold) continuam as mesmas do backend (computeArenaRewardTier,
// coluna reward_tier) — só o ÍCONE e o NOME exibido (arenaChestName_*) mudaram pros baús novos.
const CHEST_ICON = {
  wood: '/Wooden_Chest.webp',
  bronze: '/Metal_Chest_icon.webp',
  silver: '/Refined_Metal_Chest.webp',
  gold: '/Advanced_Chest.webp'
}
const ARENA_WIN_CAP = 12 // espelha ARENA_MAIN_DECK_SIZE etc. do backend — só pra escala da barra/tier aqui

// Espelha computeArenaRewardTier do backend (server.js) — puro e barato o bastante pra duplicar no
// front em vez de esperar o servidor pra saber qual baú a run já garante nas vitórias atuais.
function computeArenaRewardTier(wins) {
  if (wins >= 12) return 'gold'
  if (wins >= 9) return 'silver'
  if (wins >= 5) return 'bronze'
  return 'wood'
}

// Ícone do baú — mesmo tamanho que o emoji ocupava antes (`size` é um var(--fs-*) existente, dá
// pra usar direto como width/height já que é só um comprimento CSS).
function ChestIcon({ tier, size }) {
  return <img src={CHEST_ICON[tier]} alt={tier} style={{ width: size, height: size, objectFit: 'contain' }} />
}

// Indicador fixo no canto: baú que a run garante agora + barra de progresso até o próximo, com
// marcas nos limites reais (5/9/12 vitórias). Não aparece na tela de "run encerrada" (o baú já vem
// destacado grande lá) nem antes de existir uma run.
function ChestProgressWidget({ wins, t }) {
  const tier = computeArenaRewardTier(wins)
  const pct = Math.min(100, (wins / ARENA_WIN_CAP) * 100)
  return (
    <div style={{
      position: 'fixed', top: 'var(--sp-lg)', right: 'var(--sp-lg)', width: 'clamp(180px, 16vw, 240px)',
      background: 'rgba(0,0,0,0.55)', border: '2px solid #c99a4e', borderRadius: '12px',
      padding: 'var(--sp-sm) var(--sp-md)', color: '#f3e2b3', textAlign: 'center', zIndex: 50
    }}>
      <ChestIcon tier={tier} size="var(--fs-lg)" />
      <p style={{ fontSize: 'var(--fs-xs)', margin: '2px 0 8px', fontWeight: 700 }}>{t(`arenaChestName_${tier}`)}</p>
      <div style={{ position: 'relative', height: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #ffd76a, #c99a4e)', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ position: 'relative', height: '14px', marginTop: '2px' }}>
        {[5, 9, 12].map(mark => (
          <span key={mark} style={{
            position: 'absolute', left: `${(mark / ARENA_WIN_CAP) * 100}%`, transform: 'translateX(-50%)',
            fontSize: 'var(--fs-2xs)', color: '#d9c4a3'
          }}>{mark}</span>
        ))}
      </div>
      <p style={{ fontSize: 'var(--fs-2xs)', margin: '6px 0 0', color: '#d9c4a3' }}>{t('arenaWinsProgressLabel', { wins, cap: ARENA_WIN_CAP })}</p>
    </div>
  )
}

// Lista agrupada das cartas escolhidas + curva de custo — mostrado tanto durante o draft (pra
// acompanhar em tempo real) quanto na tela de "deck pronto" (pra revisar o deck fechado).
function DraftedCardsPanels({ groupedDraftedCards, costCurve, costCurveMax, typeCounts, t }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-xl)', textAlign: 'left' }}>
      <div style={{ flex: '1 1 280px', maxWidth: '360px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: 'var(--sp-md)' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', margin: '0 0 8px' }}>{t('arenaDraftedListTitle')}</h3>
        {groupedDraftedCards.length === 0 ? (
          <p style={{ fontSize: 'var(--fs-sm)', color: '#d9c4a3', margin: 0 }}>{t('arenaDraftedListEmpty')}</p>
        ) : (
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {groupedDraftedCards.map(({ name, cost, count }) => (
              <div key={name} style={{
                display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: 'var(--fs-sm)',
                padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: '#ffd76a' }}>{cost}</strong> {name}
                </span>
                <span style={{ flexShrink: 0 }}>x{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: '1 1 280px', maxWidth: '360px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: 'var(--sp-md)' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', margin: '0 0 8px' }}>{t('arenaCostCurveTitle')}</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 'clamp(100px, 14vw, 150px)' }}>
          {costCurve.map(({ cost, count }) => (
            <div key={cost} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ fontSize: 'var(--fs-2xs)', minHeight: '1.2em' }}>{count > 0 ? count : ''}</span>
              <div style={{
                width: '100%', background: 'linear-gradient(180deg, #ffd76a, #c99a4e)', borderRadius: '3px 3px 0 0',
                height: `${(count / costCurveMax) * 100}%`, minHeight: count > 0 ? '4px' : '0'
              }} />
              <span style={{ fontSize: 'var(--fs-2xs)', marginTop: '4px', color: '#d9c4a3' }}>{cost}</span>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', gap: 'var(--sp-sm)', flexWrap: 'wrap', justifyContent: 'center',
          marginTop: 'var(--sp-md)', paddingTop: 'var(--sp-sm)', borderTop: '1px solid rgba(255,255,255,0.15)',
          fontSize: 'var(--fs-2xs)', color: '#d9c4a3'
        }}>
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

// Modo Arena (draft temporário estilo Hearthstone). Fase 1: comprar ingresso, escolher 2 cores,
// draftar 50 cartas 1-de-3. Fase 2: fila própria contra outro jogador (ou bot com deck aleatório
// depois de 15s) e o motor de partida (ver FindMatchDeckSelect.jsx, matchType 'arenaDraft'). Fase 3:
// baú de recompensa (Madeira/Bronze/Prata/Ouro conforme as vitórias) ao terminar a run.
function Arena() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [run, setRun] = useState(null)
  const [player, setPlayer] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // Resposta do resgate do baú — guardada à parte porque, assim que o resgate acontece no servidor,
  // a run some do /api/arena/status (reward_tier deixa de ser NULL), então não dá pra confiar em
  // `run` pra mostrar o que foi ganho depois — só essa cópia local sabe.
  const [claimResult, setClaimResult] = useState(null)
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false)
  // Zoom ao passar o mouse numa carta oferecida — mesmo padrão (meio segundo de espera antes de
  // mostrar) já usado em DeckBuilder.jsx/FindMatchDeckSelect.jsx.
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
    apiFetch('/api/arena/status').then(r => r.json()).then(data => {
      setRun(data)
      setLoading(false)
      // Já tem uma partida rolando pra essa run (ex.: voltou pra essa tela pelo botão "voltar" do
      // navegador) — não tem nada útil pra mostrar aqui, manda direto pro tabuleiro/fila de novo.
      if (data.active && data.status === 'in_progress') {
        navigate('/findmatch/arenaDraft', { state: { arenaRunId: data.id } })
      }
    })
  }
  const loadPlayer = () => apiFetch('/api/player').then(r => r.json()).then(setPlayer)

  // Recarrega periodicamente (mesmo padrão de Farming.jsx) — sem isso, quem deixa essa aba aberta
  // por um tempo (ex: outra aba/dispositivo já avançou a run nesse meio tempo) continuava vendo o
  // status antigo (ex: "pronto pra buscar") mesmo depois dele deixar de ser verdade, e só descobria
  // a real ao clicar em "Procurar Oponente" e levar um erro sem explicação nenhuma.
  useEffect(() => {
    loadStatus()
    loadPlayer()
    const pollInterval = setInterval(() => { loadStatus(); loadPlayer() }, 5000)
    return () => clearInterval(pollInterval)
  }, [])

  const buyTicket = () => {
    setError('')
    setBusy(true)
    apiJson('/api/arena/start', { method: 'POST' })
      .then(data => { setRun(data); loadPlayer() })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const pickCard = (cardNumber) => {
    cancelHoverZoom()
    setError('')
    setBusy(true)
    apiJson('/api/arena/pick-card', { method: 'POST', body: JSON.stringify({ cardNumber }) })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const forfeitRun = () => {
    setError('')
    setBusy(true)
    setShowForfeitConfirm(false)
    apiJson('/api/arena/forfeit', { method: 'POST' })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const claimReward = () => {
    setError('')
    setBusy(true)
    apiJson('/api/arena/claim-reward', { method: 'POST' })
      .then(data => {
        setClaimResult(data)
        setRun({ active: false })
        loadPlayer()
      })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  if (loading || !run) return <p style={{ padding: '2rem' }}>{t('arenaLoading')}</p>

  // Derivados só usados durante o draft de carta — o espaço abaixo das 3 ofertas ficava vazio, então
  // aproveitamos pra mostrar o que já foi escolhido: lista agrupada (nome + quantas cópias) e a curva
  // de custo (quantas cartas de cada custo), que vai mudando de forma a cada pick.
  const draftedCards = run.draftedCards || []
  const groupedDraftedCards = Object.values(
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
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', padding: 'var(--sp-xl)', textAlign: 'center',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
      <Link to="/" style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)' }}>
        <button className="sign-button sign-button-fluid">{t('backToMenu')}</button>
      </Link>

      <h1 className="title-sign" style={{ marginTop: 0 }}>{t('arenaTicketTitle')}</h1>

      {run.active && run.status !== 'finished' && <ChestProgressWidget wins={run.wins} t={t} />}

      {claimResult && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaRewardTitle')}</h2>
          <ChestIcon tier={claimResult.tier} size="var(--fs-2xl)" />
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>{t(`arenaChestName_${claimResult.tier}`)}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>{t('arenaRunScoreLabel', { wins: claimResult.wins, losses: claimResult.losses })}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>
            {t('arenaRewardSummary', { gold: claimResult.gold, fluid: claimResult.fluid, ingredient: claimResult.ingredient })}
          </p>
          {/* Pacotes não vêm mais abertos na hora — só creditados como pendentes (ver
              pending_boosters em server.js). O player abre 1 de cada vez na Loja, com a mesma
              animação de abertura de booster já usada lá. */}
          {claimResult.boosterPacksGranted > 0 && (
            <>
              <p style={{ fontSize: 'var(--fs-sm)' }}>
                {t('arenaRewardBoosterPendingMsg', { count: claimResult.boosterPacksGranted })}
              </p>
              <Link to="/shop">
                <button className="sign-button sign-button-fluid">{t('arenaGoOpenBoostersButton')}</button>
              </Link>
            </>
          )}
          <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-md)' }} onClick={() => setClaimResult(null)}>
            {t('arenaBackToTicketButton')}
          </button>
        </div>
      )}

      {!claimResult && !run.active && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>{t('arenaTicketIntro')}</p>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>{t('arenaTicketPrice', { price: ARENA_TICKET_PRICE })}</p>
          {player && <p style={{ fontSize: 'var(--fs-sm)' }}>🪙 {player.gold_coins}</p>}
          <button
            className="sign-button sign-button-fluid"
            onClick={buyTicket}
            disabled={busy || !player || player.gold_coins < ARENA_TICKET_PRICE}
          >
            {t('arenaBuyTicketButton')}
          </button>
        </div>
      )}

      {run.active && run.status === 'drafting_cards' && (
        <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaCardDraftTitle', { count: run.deckCount, total: 50 })}</h2>
          <p style={{ fontSize: 'var(--fs-sm)', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
            {run.colors.length === 0 && t('arenaColorsPending')}
            {run.colors.length >= 1 && run.colors.map(color => (
              <span key={color} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLOR_SWATCH[color], display: 'inline-block' }} />
                {color}
              </span>
            ))}
            {run.colors.length === 1 && <span style={{ color: '#d9c4a3' }}>{t('arenaSecondColorPending')}</span>}
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-lg)' }}>
            {run.cardOffer.map(card => (
              <div
                key={card.cardNumber}
                onClick={() => !busy && pickCard(card.cardNumber)}
                onMouseEnter={() => startHoverZoom(card.imageUrl, card.name)}
                onMouseLeave={cancelHoverZoom}
                style={{ cursor: busy ? 'default' : 'pointer', width: 'clamp(130px, 14vw, 180px)', opacity: busy ? 0.6 : 1 }}
              >
                <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
                <p style={{ fontSize: 'var(--fs-sm)', margin: '6px 0 0' }}>{card.name}</p>
              </div>
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

          <DraftedCardsPanels groupedDraftedCards={groupedDraftedCards} costCurve={costCurve} costCurveMax={costCurveMax} typeCounts={typeCounts} t={t} />
        </div>
      )}

      {run.active && run.status === 'ready' && (
        <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaDeckReadyTitle')}</h2>
          <p style={{ fontSize: 'var(--fs-md)' }}>{t('arenaDeckReadySummary', { colors: run.colors.join(' + ') })}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>{t('arenaRunScoreLabel', { wins: run.wins, losses: run.losses })}</p>
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'center', marginTop: 'var(--sp-md)', flexWrap: 'wrap' }}>
            <Link to="/findmatch/arenaDraft" state={{ arenaRunId: run.id }}>
              <button className="sign-button sign-button-fluid">{t('findMatchSearchButton')}</button>
            </Link>
            <button className="sign-button sign-button-fluid" onClick={() => setShowForfeitConfirm(true)} disabled={busy}>
              {t('arenaForfeitButton')}
            </button>
          </div>
          <DraftedCardsPanels groupedDraftedCards={groupedDraftedCards} costCurve={costCurve} costCurveMax={costCurveMax} typeCounts={typeCounts} t={t} />
        </div>
      )}

      {showForfeitConfirm && (
        <div onClick={() => setShowForfeitConfirm(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 'var(--panel-w-xs)', background: '#1a1410', border: '2px solid #c99a4e', borderRadius: '14px',
            padding: 'var(--sp-lg)', textAlign: 'center', color: '#f3e2b3'
          }}>
            <h3 style={{ marginTop: 0, fontSize: 'var(--fs-lg)' }}>{t('arenaForfeitConfirmTitle')}</h3>
            {run && <ChestIcon tier={computeArenaRewardTier(run.wins)} size="var(--fs-2xl)" />}
            <p style={{ fontSize: 'var(--fs-sm)' }}>
              {run && t('arenaForfeitConfirmBody', { chest: t(`arenaChestName_${computeArenaRewardTier(run.wins)}`) })}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: 'var(--sp-md)' }}>
              <button style={{ flex: 1, padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#a5541b', color: '#fff3d6', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={forfeitRun} disabled={busy}>
                {t('arenaForfeitConfirmYes')}
              </button>
              <button style={{ flex: 1, padding: 'var(--sp-sm)', fontSize: 'var(--fs-sm)', background: '#555', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setShowForfeitConfirm(false)}>
                {t('arenaForfeitConfirmNo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {run.active && run.status === 'finished' && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaRunOverTitle')}</h2>
          <p style={{ fontSize: 'var(--fs-md)' }}>{t('arenaRunScoreLabel', { wins: run.wins, losses: run.losses })}</p>
          <ChestIcon tier={run.rewardTier} size="var(--fs-2xl)" />
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>{t(`arenaChestName_${run.rewardTier}`)}</p>
          <button className="sign-button sign-button-fluid" onClick={claimReward} disabled={busy}>
            {t('arenaClaimRewardButton')}
          </button>
        </div>
      )}

      {error && <p style={{ color: '#ff8a8a', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-md)' }}>{error}</p>}
    </div>
  )
}

export default Arena
