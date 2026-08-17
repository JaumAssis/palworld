import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import CardGrid from './CardGrid'
import DeckBuilder from './DeckBuilder'
import { DeckList, DeckDetail } from './MyDecks'
import GameBoard from './GameBoard'
import MyCollection from './MyCollection'
import Shop from './Shop'
import Breeding from './Breeding'
import Farming from './Farming'
import TutorialSelect from './TutorialSelect'
import TutorialMatch from './TutorialMatch'
import FindMatchSelect from './FindMatchSelect'
import FindMatchDeckSelect from './FindMatchDeckSelect'
import Arena from './Arena'
import Roguelike from './Roguelike'
import { useLanguage } from './i18n/LanguageContext'
import { translations } from './i18n/translations'
import { useAuth } from './auth/AuthContext'
import { useTheme } from './theme/ThemeContext'
import { apiFetch } from './api'
import OnlineBadge from './OnlineBadge'

// Bloqueia rotas que exigem login (o backend já rejeita com 401; isso evita o "flash" da
// tela antes do redirect e cobre navegação direta/F5). Leva o aviso de login pelo state da
// navegação — o MainMenu lê isso e mostra a mesma mensagem/tremida usada nos botões guardados,
// em vez de simplesmente sumir de volta pro menu sem explicação nenhuma.
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace state={{ authRequired: true }} />
  return children
}

// Cor de destaque de cada rank da Arena — usada no quadrado de troféu e no popup de rank.
const RANK_TIER_COLORS = {
  bronze: '#a5682a',
  silver: '#9aa5ad',
  gold: '#d4af37',
  platinum: '#4fb8af',
  diamond: '#4fa3f7',
  master: '#9b59b6',
  legend: '#e5533d'
}

// Popup com o rank atual da Arena: tier, pontos e quanto falta pro próximo — abre ao clicar no
// quadrado de troféu ao lado do botão de logout.
function RankPopup({ onClose }) {
  const { t } = useLanguage()
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'var(--panel-w-xs)', textAlign: 'center', background: '#fff', borderRadius: '20px',
        padding: 'var(--sp-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: 'var(--fs-lg)' }}>{t('rankPopupTitle')}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px', fontSize: 'var(--fs-sm)' }}>✕</button>
        </div>

        {!player && <p style={{ color: '#222', fontSize: 'var(--fs-base)' }}>{t('loading')}</p>}

        {/* player.rank pode faltar se o backend ainda não tiver sido reiniciado depois da migração
            da coluna rank_points, ou se a resposta vier com erro (ex.: sessão expirada) — evita
            quebrar o popup inteiro nesse caso, só não mostra o bloco de rank. */}
        {player && !player.rank && <p style={{ color: '#c0392b', fontSize: 'var(--fs-sm)' }}>{t('rankUnavailable')}</p>}

        {player?.rank && (
          <>
            <div style={{
              display: 'inline-block', padding: 'var(--sp-sm) var(--sp-lg)', borderRadius: '12px', color: '#fff',
              fontWeight: 700, fontSize: 'var(--fs-md)', marginBottom: '10px',
              background: RANK_TIER_COLORS[player.rank.tierKey] || '#888'
            }}>
              🏆 {t(`rankTierName_${player.rank.tierKey}`)}
            </div>
            <p style={{ color: '#444', fontSize: 'var(--fs-sm)', margin: '6px 0' }}>
              {t('rankPointsLabel', { points: player.rank.points })}
            </p>
            <p style={{ color: '#777', fontSize: 'var(--fs-xs)', margin: 0 }}>
              {player.rank.isMaxRank
                ? t('rankMaxReached')
                : t('rankPointsToNext', { n: player.rank.pointsToNext, nextTier: t(`rankTierName_${player.rank.nextTierKey}`) })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const RANK_BOARD_REFRESH_MS = 60 * 60 * 1000 // o backend já cacheia por 1h (ver /api/ranks/top);
// isso só garante que quem deixa o menu aberto sem navegar também vê a atualização horária.

// Quadro fixo no menu inicial (entre o login e a loja) com o top 10 de pontos de Arena + a
// posição de quem está logado, se estiver fora do top 10. Visível pra visitante também — parte do
// mesmo objetivo dos "3 sempre online": mostrar atividade real no site pra quem ainda não jogou.
function RankBoard() {
  const { t } = useLanguage()
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = () => apiFetch('/api/ranks/top').then(r => r.json()).then(setData).catch(() => {})
    load()
    const interval = setInterval(load, RANK_BOARD_REFRESH_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      width: 'var(--panel-w-xs)', maxHeight: 'clamp(200px, 22vh, 340px)', overflowY: 'auto', boxSizing: 'border-box',
      background: 'rgba(0,0,0,0.55)', border: '2px solid #c99a4e', borderRadius: '12px',
      padding: 'var(--sp-sm) var(--sp-md)', textAlign: 'left'
    }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 'var(--fs-sm)', color: '#f3e2b3', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
        🏆 {t('rankBoardTitle')}
      </h3>

      {!data && <p style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)', margin: 0 }}>{t('loading')}</p>}

      {data && data.top.length === 0 && (
        <p style={{ color: '#d9c4a3', fontSize: 'var(--fs-2xs)', margin: 0 }}>{t('rankBoardEmpty')}</p>
      )}

      {data && data.top.map(row => (
        <div key={row.position} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 'var(--fs-2xs)', color: '#fff3d6', padding: '2px 0', gap: '6px'
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#d9c4a3' }}>{row.position}.</span> {row.username}
          </span>
          <strong style={{ color: RANK_TIER_COLORS[row.rank.tierKey] || '#888', flexShrink: 0 }}>{row.rank.points}</strong>
        </div>
      ))}

      {data?.you && (
        <>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', margin: '4px 0' }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 'var(--fs-2xs)', color: '#ffd76a', fontWeight: 700, padding: '2px 0', gap: '6px'
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.you.position}. {data.you.username}
            </span>
            <span style={{ flexShrink: 0 }}>{data.you.rank.points}</span>
          </div>
        </>
      )}
    </div>
  )
}

// Painel de login/cadastro — canto superior esquerdo do menu. Também mostra quem está logado.
function AuthPanel({ onBlockedAction }) {
  const { t } = useLanguage()
  const { user, loading, login, register, logout } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showRank, setShowRank] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)

  if (loading) return <div className="auth-panel" />

  if (user) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div className="auth-panel">
          <p className="auth-panel-user">{t('authLoggedInAs', { username: user.username })}</p>
          <button className="sign-button auth-submit" onClick={logout}>{t('authLogout')}</button>
        </div>
        <button
          className="currency-badge"
          onClick={() => setShowRank(true)}
          title={t('rankButtonTitle')}
          style={{
            width: 'clamp(38px, 3vw, 52px)', height: 'clamp(38px, 3vw, 52px)', padding: 0, fontSize: 'var(--fs-lg)', cursor: 'pointer',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          🏆
        </button>
        {showRank && <RankPopup onClose={() => setShowRank(false)} />}
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError(t('authError_password_mismatch'))
        return
      }
      setShowRegisterConfirm(true)
      return
    }
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(t(`authError_${err.code || 'unknown'}`))
    } finally {
      setSubmitting(false)
    }
  }

  // Sem integração com email ainda — o aviso confirma que a pessoa entendeu que perder a
  // senha significa perder o acesso à conta, sem chance de recuperação.
  const confirmRegister = async () => {
    setSubmitting(true)
    try {
      await register(username, password)
      setShowRegisterConfirm(false)
    } catch (err) {
      setError(t(`authError_${err.code || 'unknown'}`))
      setShowRegisterConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`auth-panel${onBlockedAction ? ' auth-panel-shake' : ''}`}>
      <form onSubmit={submit}>
        <input className="auth-input" placeholder={t('authUsernamePlaceholder')} value={username}
               onChange={e => setUsername(e.target.value)} autoComplete="username" />
        <input className="auth-input" type="password" placeholder={t('authPasswordPlaceholder')} value={password}
               onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {mode === 'register' && (
          <input className="auth-input" type="password" placeholder={t('authConfirmPasswordPlaceholder')} value={confirmPassword}
                 onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        )}
        {error && <p className="auth-error">{error}</p>}
        <button className="sign-button auth-submit" type="submit" disabled={submitting}>
          {mode === 'login' ? t('authLoginBtn') : t('authRegisterBtn')}
        </button>
        <button type="button" className="auth-toggle-mode" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}>
          {mode === 'login' ? t('authSwitchToRegister') : t('authSwitchToLogin')}
        </button>
      </form>
      {onBlockedAction && <p className="auth-hint">{onBlockedAction}</p>}

      {showRegisterConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{
            background: '#1a1410', border: '2px solid #c99a4e', borderRadius: '14px',
            padding: 'var(--sp-lg)', maxWidth: 'var(--panel-w-xs)', textAlign: 'center', color: '#f3e2b3'
          }}>
            <p style={{ fontSize: 'var(--fs-sm)', marginBottom: '16px' }}>{t('authRegisterConfirmMsg')}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={confirmRegister} disabled={submitting} style={{
                padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)', borderRadius: '8px', border: 'none', background: '#a5541b', color: '#fff3d6',
                fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1
              }}>
                {t('authRegisterConfirmYes')}
              </button>
              <button onClick={() => setShowRegisterConfirm(false)} disabled={submitting} style={{
                padding: 'var(--sp-xs) var(--sp-lg)', fontSize: 'var(--fs-sm)', borderRadius: '8px', border: 'none', background: '#555', color: '#fff',
                fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1
              }}>
                {t('authRegisterConfirmNo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Emoji de bandeira não renderiza no Windows/Chrome (mostra "BR"/"US" em texto) — usamos SVG.
function FlagIcon({ country }) {
  if (country === 'BR') {
    return (
      <svg viewBox="0 0 30 21" width="26" height="18" style={{ display: 'block', borderRadius: '2px' }}>
        <rect width="30" height="21" fill="#009c3b" />
        <polygon points="15,2.5 27.5,10.5 15,18.5 2.5,10.5" fill="#ffdf00" />
        <circle cx="15" cy="10.5" r="4.6" fill="#002776" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 30 21" width="26" height="18" style={{ display: 'block', borderRadius: '2px' }}>
      <rect width="30" height="21" fill="#fff" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect key={i} y={i * 3} width="30" height="3" fill={i % 2 === 0 ? '#b22234' : '#fff'} />
      ))}
      <rect width="13" height="12" fill="#3c3b6e" />
    </svg>
  )
}

// As descrições das missões vêm prontas do backend (em português) — traduzimos aqui pelo
// "code" (estável) em vez de mexer no backend. Cai no texto original se o code não for reconhecido.
function missionDescription(t, mission) {
  const key = `missionDesc_${mission.code}`
  if (translations.pt[key] !== undefined) return t(key)
  const palTypeMatch = mission.code.match(/^play_3_(\w+)_pals$/)
  if (palTypeMatch) {
    const type = palTypeMatch[1].charAt(0).toUpperCase() + palTypeMatch[1].slice(1)
    return t('missionDescPalType', { type })
  }
  return mission.description
}

// Popup de "Sobre o jogo" — aberto pelo botão ⓘ do menu principal. O texto em si (o.q.é o jogo,
// como jogar, recursos) existe pra dar ao Google conteúdo real pra indexar, não só os botões do
// menu; ver .seo-section no App.css. Fica SEMPRE montado no DOM (nunca desmonta via React) e só
// alterna `display` via CSS — o Google indexa normalmente conteúdo escondido assim (mesma técnica
// de acordeão/aba/menu mobile), diferente de conteúdo que só existe depois de um clique de verdade.
function InfoPopup({ open, onClose }) {
  const { t } = useLanguage()
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: open ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <section className="seo-section" onClick={e => e.stopPropagation()}>
        <button className="sign-button seo-section-close" onClick={onClose}>✕</button>

        <h2 className="seo-heading" style={{ marginTop: 0 }}>{t('seoAboutHeading')}</h2>
        <p className="seo-paragraph">{t('seoAboutParagraph')}</p>

        <h2 className="seo-heading">{t('seoHowToPlayHeading')}</h2>
        <p className="seo-paragraph">{t('seoHowToPlayParagraph')}</p>

        <h2 className="seo-heading">{t('seoFeaturesHeading')}</h2>
        <ul className="seo-feature-list">
          <li>{t('seoFeature1')}</li>
          <li>{t('seoFeature2')}</li>
          <li>{t('seoFeature3')}</li>
          <li>{t('seoFeature4')}</li>
          <li>{t('seoFeature5')}</li>
        </ul>
      </section>
    </div>
  )
}

function MissionsPopup({ onClose }) {
  const { t } = useLanguage()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMissions = () => {
    apiFetch('/api/missions/today').then(r => r.json()).then(data => {
      setMissions(data)
      setLoading(false)
    })
  }

  useEffect(() => { loadMissions() }, [])

  const claim = (missionId) => {
    apiFetch('/api/missions/claim', {
      method: 'POST',
      body: JSON.stringify({ missionId })
    }).then(() => loadMissions())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'var(--panel-w-sm)', maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: '20px',
        padding: 'var(--sp-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#222' }}>{t('missionsTitle')}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px', fontSize: 'var(--fs-sm)' }}>✕</button>
        </div>

        {loading && <p style={{ color: '#222', fontSize: 'var(--fs-base)' }}>{t('loading')}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {missions.map(m => {
            const pct = Math.min(100, (m.currentValue / m.target_value) * 100)
            return (
              <div key={m.id} style={{
                border: '1px solid #eee', borderRadius: '10px', padding: 'var(--sp-sm)',
                background: m.claimed ? '#f5f5f5' : '#fff'
              }}>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-sm)', fontWeight: 600, color: '#222' }}>{missionDescription(t, m)}</p>
                <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: m.completed ? '#34c759' : '#007aff', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--fs-2xs)', color: '#888' }}>
                    {m.currentValue} / {m.target_value} — 🪙{m.reward_gold} {m.reward_fluid > 0 && `💧${m.reward_fluid}`}
                  </span>
                  {m.completed && !m.claimed && (
                    <button onClick={() => claim(m.id)} style={{ padding: 'var(--sp-2xs) var(--sp-sm)', fontSize: 'var(--fs-2xs)', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {t('missionsClaim')}
                    </button>
                  )}
                  {m.claimed && <span style={{ fontSize: 'var(--fs-2xs)', color: '#34c759' }}>{t('missionsClaimed')}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LoginStreakPopup({ onClose }) {
  const { t } = useLanguage()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    apiFetch('/api/login-streak/today').then(r => r.json()).then(data => {
      setStatus(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const claim = () => {
    setError('')
    setClaiming(true)
    apiFetch('/api/login-streak/claim', { method: 'POST' })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t('buyError'))
        setResult(data)
        setClaiming(false)
        load()
      })
      .catch(err => {
        setError(err.message)
        setClaiming(false)
      })
  }

  const rewardIcon = (reward) => reward.booster ? '🎁' : '🪙'
  const rewardLabel = (reward) => reward.booster ? t('loginStreakBoosterLabel') : `${reward.gold} · 💧${reward.fluid}`

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 'var(--panel-w-sm)', maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderRadius: '20px',
        padding: 'var(--sp-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, color: '#222' }}>{t('loginStreakTitle')}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px', fontSize: 'var(--fs-sm)' }}>✕</button>
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', color: '#666', marginTop: 0 }}>{t('loginStreakSubtitle')}</p>

        {loading && <p style={{ color: '#222', fontSize: 'var(--fs-base)' }}>{t('loading')}</p>}

        {status && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {status.rewards.map(reward => {
              const isPast = reward.day < status.currentDay
              const isCurrent = reward.day === status.currentDay
              const isFuture = reward.day > status.currentDay
              return (
                <div key={reward.day} style={{
                  border: isCurrent ? '2px solid #ffab00' : '1px solid #eee', borderRadius: '10px', padding: 'var(--sp-xs)',
                  textAlign: 'center', background: isCurrent ? '#fff8e1' : (isFuture ? '#fafafa' : '#f5f5f5'),
                  opacity: isFuture ? 0.6 : 1
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 'var(--fs-2xs)', fontWeight: 600, color: '#222' }}>{t('loginStreakDayLabel', { day: reward.day })}</p>
                  <div style={{ fontSize: 'var(--fs-xl)' }}>{rewardIcon(reward)}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-2xs)', color: '#555' }}>{rewardLabel(reward)}</p>
                  {isPast && <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-2xs)', color: '#34c759' }}>{t('loginStreakDone')}</p>}
                  {isFuture && <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-2xs)', color: '#999' }}>{t('loginStreakLocked')}</p>}
                  {isCurrent && status.claimedToday && <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-2xs)', color: '#34c759' }}>{t('loginStreakClaimed')}</p>}
                </div>
              )
            })}
          </div>
        )}

        {error && <p style={{ color: '#c00', fontSize: 'var(--fs-xs)' }}>{error}</p>}

        {status && !status.claimedToday && (
          <button onClick={claim} disabled={claiming} className="sign-button" style={{ width: '100%' }}>
            {t('loginStreakClaim')}
          </button>
        )}

        {result && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            {result.boosterPending ? (
              // Não abre mais na hora — mesmo fluxo da recompensa de baú da Arena: só credita em
              // pending_boosters, e o player abre quando quiser na Loja (com a animação de lá).
              <>
                <p style={{ fontWeight: 600, color: '#222', fontSize: 'var(--fs-base)' }}>{t('loginStreakBoosterWon')}</p>
                <Link to="/shop">
                  <button className="sign-button sign-button-fluid" style={{ marginTop: '8px' }}>{t('arenaGoOpenBoostersButton')}</button>
                </Link>
              </>
            ) : (
              <p style={{ fontWeight: 600, color: '#222', fontSize: 'var(--fs-base)' }}>{t('loginStreakGoldWon', { amount: result.goldGained, fluid: result.fluidGained })}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MainMenu() {
  const { lang, toggleLang, t } = useLanguage()
  const { user } = useAuth()
  const { isNight, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [showMissions, setShowMissions] = useState(false)
  const [showLoginStreak, setShowLoginStreak] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [loginStreakClaimable, setLoginStreakClaimable] = useState(false)
  const [popup, setPopup] = useState(null)
  const [authHint, setAuthHint] = useState(false)

  const refreshPlayer = () => {
    if (!user) { setPlayer(null); return }
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
  }

  const refreshLoginStreak = () => {
    if (!user) { setLoginStreakClaimable(false); return }
    apiFetch('/api/login-streak/today').then(r => r.json()).then(data => setLoginStreakClaimable(!data.claimedToday))
  }

  useEffect(() => { refreshPlayer() }, [user])
  useEffect(() => { refreshLoginStreak() }, [user])

  useEffect(() => {
    if (!authHint) return
    const timer = setTimeout(() => setAuthHint(false), 3000)
    return () => clearTimeout(timer)
  }, [authHint])

  // Chegou aqui redirecionado pelo RequireAuth (ex: tentou acessar /game sem login, direto pela
  // URL ou pelo botão "testar partida" do tutorial) — mostra o mesmo aviso dos botões guardados
  // em vez de só voltar pro menu sem dizer nada. Limpa o state pra não repetir num F5/voltar.
  useEffect(() => {
    if (location.state?.authRequired) {
      setAuthHint(true)
      navigate('.', { replace: true, state: null })
    }
  }, [location.state])

  // Ações que dependem de estar logado (o backend já bloqueia com 401; isso só evita abrir
  // um popup/rota que vai falhar e mostra a dica de login em vez disso).
  const guard = (action) => {
    if (!user) { setAuthHint(true); return }
    action()
  }
  const guardedLinkClick = (e) => { if (!user) { e.preventDefault(); setAuthHint(true) } }

  return (
    <div style={{
      padding: 'var(--sp-xl)', textAlign: 'center', minHeight: '100vh', position: 'relative', boxSizing: 'border-box',
      backgroundImage: `url(${isNight ? '/night.png' : '/ambient.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
    }}>
      <div style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)', zIndex: 500, display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
        <AuthPanel onBlockedAction={authHint ? t('authHintLoginRequired') : null} />
        <RankBoard />
      </div>

      <div style={{ position: 'fixed', top: 'var(--sp-lg)', right: 'var(--sp-lg)', display: 'flex', gap: 'var(--sp-xs)' }}>
        <OnlineBadge />
        <button
          className="currency-badge"
          onClick={() => setShowInfo(true)}
          title={t('seoInfoButtonTitle')}
          style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-md)', cursor: 'pointer' }}
        >
          ⓘ
        </button>
        <button
          className="currency-badge"
          onClick={toggleTheme}
          style={{ padding: 'var(--sp-xs) var(--sp-md)', fontSize: 'var(--fs-md)', cursor: 'pointer' }}
        >
          {isNight ? '🌙' : '☀️'}
        </button>
        <button
          className="currency-badge"
          onClick={toggleLang}
          title={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          style={{
            width: 'clamp(38px, 3vw, 52px)', height: 'clamp(38px, 3vw, 52px)', padding: 0, cursor: 'pointer',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <FlagIcon country={lang === 'pt' ? 'BR' : 'US'} />
        </button>
      </div>

      <h1 className="title-sign">Palworld TCG</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', width: 'var(--panel-w-xs)', margin: '0 auto' }}>
        <Link to="/tutorial"><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuTutorial')}</button></Link>
        <Link to="/catalog"><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuCatalog')}</button></Link>
        <Link to="/mycollection" onClick={guardedLinkClick}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuCollection')}</button></Link>
        <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
          <Link to="/deckbuilder" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuDeckBuilder')}</button></Link>
          <Link to="/mydecks" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuMyDecks')}</button></Link>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
          <Link to="/findmatch" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuFindMatch')}</button></Link>
          <Link to="/game" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuBotMatch')}</button></Link>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
          <Link to="/arena" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuArena')}</button></Link>
          <Link to="/roguelike" onClick={guardedLinkClick} style={{ flex: 1 }}><button className="sign-button sign-button-fluid" style={{ width: '100%' }}>{t('menuRoguelike')}</button></Link>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 'var(--sp-lg)', left: 'var(--sp-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', alignItems: 'flex-start' }}>
        <button className="sign-button sign-button-fluid" onClick={() => guard(() => setPopup('shop'))}>{t('menuShop')}</button>
        <button className="sign-button sign-button-fluid" onClick={() => guard(() => setPopup('farming'))}>{t('menuFarming')}</button>
        <button className="sign-button sign-button-fluid" onClick={() => guard(() => setPopup('breeding'))} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/egg.png" alt="Breeding" style={{ width: 'clamp(22px, 2vw, 32px)', height: 'clamp(22px, 2vw, 32px)' }} />
          Breeding
        </button>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="sign-button sign-button-fluid" onClick={() => guard(() => setShowMissions(true))}>{t('menuDailyMissions')}</button>
          <button className="sign-button sign-button-fluid" onClick={() => guard(() => setShowLoginStreak(true))} title={t('loginStreakButtonTitle')}
                  style={{ padding: 'var(--sp-xs) var(--sp-sm)', fontSize: 'var(--fs-md)', position: 'relative' }}>
            🏅
            {loginStreakClaimable && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px',
                background: '#ff3b30', borderRadius: '50%', border: '1px solid #fff'
              }} />
            )}
          </button>
        </div>
      </div>

      <p style={{
        position: 'fixed', bottom: '6px', left: '50%', transform: 'translateX(-50%)', margin: 0,
        textAlign: 'center', fontSize: 'var(--fs-2xs)', color: '#fff', lineHeight: 1.4,
        background: 'rgba(0,0,0,0.55)', borderRadius: '8px', padding: 'var(--sp-xs) var(--sp-sm)',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)', maxWidth: '90vw', pointerEvents: 'none'
      }}>
        {t('fanDisclaimer')}
      </p>

      <InfoPopup open={showInfo} onClose={() => setShowInfo(false)} />

      {showMissions && <MissionsPopup onClose={() => { setShowMissions(false); refreshPlayer() }} />}

      {showLoginStreak && <LoginStreakPopup onClose={() => { setShowLoginStreak(false); refreshPlayer(); refreshLoginStreak() }} />}

      {popup && (
        <div className="popout-overlay">
          <div key={popup} className="popout-bubble">
            {popup === 'shop' && <Shop onClose={() => { setPopup(null); refreshPlayer() }} />}
            {popup === 'farming' && <Farming onClose={() => { setPopup(null); refreshPlayer() }} />}
            {popup === 'breeding' && <Breeding onClose={() => { setPopup(null); refreshPlayer() }} />}
          </div>
        </div>
      )}

      {player && (
        <div style={{ position: 'fixed', bottom: 'var(--sp-lg)', right: 'var(--sp-lg)', display: 'flex', gap: 'var(--sp-sm)' }}>
          <div className="currency-badge">
            <img src="/gold-coin.png" alt="Gold" style={{ width: 'clamp(18px, 1.6vw, 26px)', height: 'clamp(18px, 1.6vw, 26px)' }} />
            <strong>{player.gold_coins}</strong>
          </div>
          <div className="currency-badge">
            <img src="/pal-fluid.png" alt={t('palFluidAlt')} style={{ width: 'clamp(18px, 1.6vw, 26px)', height: 'clamp(18px, 1.6vw, 26px)' }} />
            <strong>{player.pal_fluid}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/tutorial" element={<TutorialSelect />} />
        <Route path="/tutorial/web" element={<TutorialMatch />} />
        <Route path="/findmatch" element={<RequireAuth><FindMatchSelect /></RequireAuth>} />
        <Route path="/findmatch/:matchType" element={<RequireAuth><FindMatchDeckSelect /></RequireAuth>} />
        <Route path="/catalog" element={<CardGrid />} />
        <Route path="/mycollection" element={<RequireAuth><MyCollection /></RequireAuth>} />
        <Route path="/shop" element={<RequireAuth><Shop /></RequireAuth>} />
        <Route path="/breeding" element={<RequireAuth><Breeding /></RequireAuth>} />
        <Route path="/farming" element={<RequireAuth><Farming /></RequireAuth>} />
        <Route path="/deckbuilder" element={<RequireAuth><DeckBuilder /></RequireAuth>} />
        <Route path="/deckbuilder/:editId" element={<RequireAuth><DeckBuilder /></RequireAuth>} />
        <Route path="/mydecks" element={<RequireAuth><DeckList /></RequireAuth>} />
        <Route path="/mydecks/:id" element={<RequireAuth><DeckDetail /></RequireAuth>} />
        <Route path="/game" element={<RequireAuth><GameBoard /></RequireAuth>} />
        <Route path="/arena" element={<RequireAuth><Arena /></RequireAuth>} />
        <Route path="/roguelike" element={<RequireAuth><Roguelike /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App