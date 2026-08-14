import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { apiFetch, apiJson } from './api'

const COLOR_SWATCH = { Red: '#c62828', Blue: '#1565c0', Green: '#2e7d32', Purple: '#6a1b9a' }
const ARENA_TICKET_PRICE = 100 // só pra exibição/gate de UI — o servidor revalida o preço de verdade
const CHEST_EMOJI = { wood: '📦', bronze: '🥉', silver: '🥈', gold: '🏆' }

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

  useEffect(() => { loadStatus(); loadPlayer() }, [])

  const buyTicket = () => {
    setError('')
    setBusy(true)
    apiJson('/api/arena/start', { method: 'POST' })
      .then(data => { setRun(data); loadPlayer() })
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const pickColor = (color) => {
    setError('')
    setBusy(true)
    apiJson('/api/arena/pick-color', { method: 'POST', body: JSON.stringify({ color }) })
      .then(setRun)
      .catch(err => setError(err.message))
      .finally(() => setBusy(false))
  }

  const pickCard = (cardNumber) => {
    setError('')
    setBusy(true)
    apiJson('/api/arena/pick-card', { method: 'POST', body: JSON.stringify({ cardNumber }) })
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

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', padding: 'var(--sp-xl)', textAlign: 'center',
      background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%), #2b1a10'
    }}>
      <Link to="/" style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)' }}>
        <button className="sign-button sign-button-fluid">{t('backToMenu')}</button>
      </Link>

      <h1 className="title-sign" style={{ marginTop: 0 }}>{t('arenaTicketTitle')}</h1>

      {claimResult && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaRewardTitle')}</h2>
          <div style={{ fontSize: 'var(--fs-2xl)' }}>{CHEST_EMOJI[claimResult.tier]}</div>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>{t(`arenaChestName_${claimResult.tier}`)}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>{t('arenaRunScoreLabel', { wins: claimResult.wins, losses: claimResult.losses })}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>
            {t('arenaRewardSummary', { gold: claimResult.gold, fluid: claimResult.fluid, ingredient: claimResult.ingredient })}
          </p>
          {claimResult.cards.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--fs-sm)' }}>{t('arenaRewardCardsLabel')}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {claimResult.cards.map((c, i) => (
                  <img key={i} src={c.image_url} alt={c.name} style={{ width: 'clamp(56px, 6vw, 80px)', borderRadius: '6px' }} />
                ))}
              </div>
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

      {run.active && (run.status === 'drafting_color1' || run.status === 'drafting_color2') && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>
            {run.status === 'drafting_color1' ? t('arenaColorStep1Title') : t('arenaColorStep2Title')}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-lg)' }}>
            {run.colorOffer.map(color => (
              <button
                key={color}
                className="sign-button sign-button-fluid"
                disabled={busy}
                onClick={() => pickColor(color)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: COLOR_SWATCH[color], display: 'inline-block' }} />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {run.active && run.status === 'drafting_cards' && (
        <div style={{ maxWidth: 'var(--panel-w-lg)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaCardDraftTitle', { count: run.deckCount, total: 50 })}</h2>
          <div style={{ display: 'flex', gap: 'var(--sp-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-lg)' }}>
            {run.cardOffer.map(card => (
              <div
                key={card.cardNumber}
                onClick={() => !busy && pickCard(card.cardNumber)}
                style={{ cursor: busy ? 'default' : 'pointer', width: 'clamp(130px, 14vw, 180px)', opacity: busy ? 0.6 : 1 }}
              >
                <img src={card.imageUrl} alt={card.name} style={{ width: '100%', borderRadius: '8px', border: '2px solid #c99a4e' }} />
                <p style={{ fontSize: 'var(--fs-sm)', margin: '6px 0 0' }}>{card.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {run.active && run.status === 'ready' && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaDeckReadyTitle')}</h2>
          <p style={{ fontSize: 'var(--fs-md)' }}>{t('arenaDeckReadySummary', { colors: run.colors.join(' + ') })}</p>
          <p style={{ fontSize: 'var(--fs-sm)' }}>{t('arenaRunScoreLabel', { wins: run.wins, losses: run.losses })}</p>
          <Link to="/findmatch/arenaDraft" state={{ arenaRunId: run.id }}>
            <button className="sign-button sign-button-fluid" style={{ marginTop: 'var(--sp-md)' }}>
              {t('findMatchSearchButton')}
            </button>
          </Link>
        </div>
      )}

      {run.active && run.status === 'finished' && (
        <div style={{ maxWidth: 'var(--panel-w-sm)', margin: '2rem auto', color: '#f3e2b3' }}>
          <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('arenaRunOverTitle')}</h2>
          <p style={{ fontSize: 'var(--fs-md)' }}>{t('arenaRunScoreLabel', { wins: run.wins, losses: run.losses })}</p>
          <div style={{ fontSize: 'var(--fs-2xl)' }}>{CHEST_EMOJI[run.rewardTier]}</div>
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
