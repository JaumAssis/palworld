import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
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
import { useLanguage } from './i18n/LanguageContext'
import { translations } from './i18n/translations'
import { useAuth } from './auth/AuthContext'
import { useTheme } from './theme/ThemeContext'
import { apiFetch } from './api'

// Bloqueia rotas que exigem login (o backend já rejeita com 401; isso evita o "flash" da
// tela antes do redirect e cobre navegação direta/F5).
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
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
        width: '320px', textAlign: 'center', background: '#fff', borderRadius: '20px',
        padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, color: '#222', fontSize: '17px' }}>{t('rankPopupTitle')}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        {!player && <p style={{ color: '#222' }}>{t('loading')}</p>}

        {/* player.rank pode faltar se o backend ainda não tiver sido reiniciado depois da migração
            da coluna rank_points, ou se a resposta vier com erro (ex.: sessão expirada) — evita
            quebrar o popup inteiro nesse caso, só não mostra o bloco de rank. */}
        {player && !player.rank && <p style={{ color: '#c0392b', fontSize: '13px' }}>{t('rankUnavailable')}</p>}

        {player?.rank && (
          <>
            <div style={{
              display: 'inline-block', padding: '8px 22px', borderRadius: '12px', color: '#fff',
              fontWeight: 700, fontSize: '16px', marginBottom: '10px',
              background: RANK_TIER_COLORS[player.rank.tierKey] || '#888'
            }}>
              🏆 {t(`rankTierName_${player.rank.tierKey}`)}
            </div>
            <p style={{ color: '#444', fontSize: '14px', margin: '6px 0' }}>
              {t('rankPointsLabel', { points: player.rank.points })}
            </p>
            <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>
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
            width: '42px', height: '42px', padding: 0, fontSize: '20px', cursor: 'pointer',
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
    if (mode === 'register' && password !== confirmPassword) {
      setError(t('authError_password_mismatch'))
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(username, password)
    } catch (err) {
      setError(t(`authError_${err.code || 'unknown'}`))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-panel">
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
        width: '380px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: '20px',
        padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#222' }}>{t('missionsTitle')}</h2>
          <button onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>

        {loading && <p style={{ color: '#222' }}>{t('loading')}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {missions.map(m => {
            const pct = Math.min(100, (m.currentValue / m.target_value) * 100)
            return (
              <div key={m.id} style={{
                border: '1px solid #eee', borderRadius: '10px', padding: '10px',
                background: m.claimed ? '#f5f5f5' : '#fff'
              }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#222' }}>{missionDescription(t, m)}</p>
                <div style={{ background: '#eee', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: m.completed ? '#34c759' : '#007aff', transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {m.currentValue} / {m.target_value} — 🪙{m.reward_gold} {m.reward_fluid > 0 && `💧${m.reward_fluid}`}
                  </span>
                  {m.completed && !m.claimed && (
                    <button onClick={() => claim(m.id)} style={{ padding: '4px 12px', fontSize: '12px', background: '#34c759', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {t('missionsClaim')}
                    </button>
                  )}
                  {m.claimed && <span style={{ fontSize: '11px', color: '#34c759' }}>{t('missionsClaimed')}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MainMenu() {
  const { lang, toggleLang, t } = useLanguage()
  const { user } = useAuth()
  const { isNight, toggleTheme } = useTheme()
  const [player, setPlayer] = useState(null)
  const [showMissions, setShowMissions] = useState(false)
  const [popup, setPopup] = useState(null)
  const [authHint, setAuthHint] = useState(false)

  const refreshPlayer = () => {
    if (!user) { setPlayer(null); return }
    apiFetch('/api/player').then(r => r.json()).then(setPlayer)
  }

  useEffect(() => { refreshPlayer() }, [user])

  useEffect(() => {
    if (!authHint) return
    const timer = setTimeout(() => setAuthHint(false), 3000)
    return () => clearTimeout(timer)
  }, [authHint])

  // Ações que dependem de estar logado (o backend já bloqueia com 401; isso só evita abrir
  // um popup/rota que vai falhar e mostra a dica de login em vez disso).
  const guard = (action) => {
    if (!user) { setAuthHint(true); return }
    action()
  }
  const guardedLinkClick = (e) => { if (!user) { e.preventDefault(); setAuthHint(true) } }

  return (
    <div style={{
      padding: '2rem', textAlign: 'center', minHeight: '100vh', position: 'relative', boxSizing: 'border-box',
      backgroundImage: `url(${isNight ? '/night.png' : '/ambient.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
    }}>
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 500 }}>
        <AuthPanel onBlockedAction={authHint ? t('authHintLoginRequired') : null} />
      </div>

      <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
        <button
          className="currency-badge"
          onClick={toggleTheme}
          style={{ padding: '8px 14px', fontSize: '18px', cursor: 'pointer' }}
        >
          {isNight ? '🌙' : '☀️'}
        </button>
        <button
          className="currency-badge"
          onClick={toggleLang}
          title={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          style={{
            width: '42px', height: '42px', padding: 0, cursor: 'pointer',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <FlagIcon country={lang === 'pt' ? 'BR' : 'US'} />
        </button>
      </div>

      <h1 className="title-sign">Palworld TCG</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        <Link to="/tutorial"><button className="sign-button" style={{ width: '100%' }}>{t('menuTutorial')}</button></Link>
        <Link to="/catalog"><button className="sign-button" style={{ width: '100%' }}>{t('menuCatalog')}</button></Link>
        <Link to="/mycollection" onClick={guardedLinkClick}><button className="sign-button" style={{ width: '100%' }}>{t('menuCollection')}</button></Link>
        <Link to="/deckbuilder" onClick={guardedLinkClick}><button className="sign-button" style={{ width: '100%' }}>{t('menuDeckBuilder')}</button></Link>
        <Link to="/mydecks"><button className="sign-button" style={{ width: '100%' }}>{t('menuMyDecks')}</button></Link>
        <Link to="/findmatch" onClick={guardedLinkClick}><button className="sign-button" style={{ width: '100%' }}>{t('menuFindMatch')}</button></Link>
        <Link to="/game" onClick={guardedLinkClick}><button className="sign-button" style={{ width: '100%' }}>{t('menuBotMatch')}</button></Link>
      </div>

      <div style={{ position: 'fixed', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
        <button className="sign-button" onClick={() => guard(() => setPopup('shop'))}>{t('menuShop')}</button>
        <button className="sign-button" onClick={() => guard(() => setPopup('farming'))}>{t('menuFarming')}</button>
        <button className="sign-button" onClick={() => guard(() => setPopup('breeding'))} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/egg.png" alt="Breeding" style={{ width: '28px', height: '28px' }} />
          Breeding
        </button>
        <button className="sign-button" onClick={() => guard(() => setShowMissions(true))}>{t('menuDailyMissions')}</button>
      </div>

      <p style={{
        position: 'fixed', bottom: '6px', left: '50%', transform: 'translateX(-50%)', margin: 0,
        textAlign: 'center', fontSize: '11px', color: '#fff', lineHeight: 1.4,
        background: 'rgba(0,0,0,0.55)', borderRadius: '8px', padding: '8px 12px',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)', maxWidth: '90vw', pointerEvents: 'none'
      }}>
        {t('fanDisclaimer')}
      </p>

      {showMissions && <MissionsPopup onClose={() => { setShowMissions(false); refreshPlayer() }} />}

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
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <div className="currency-badge">
            <img src="/gold-coin.png" alt="Gold" style={{ width: '22px', height: '22px' }} />
            <strong>{player.gold_coins}</strong>
          </div>
          <div className="currency-badge">
            <img src="/pal-fluid.png" alt={t('palFluidAlt')} style={{ width: '22px', height: '22px' }} />
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
        <Route path="/mydecks" element={<DeckList />} />
        <Route path="/mydecks/:id" element={<DeckDetail />} />
        <Route path="/game" element={<RequireAuth><GameBoard /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App