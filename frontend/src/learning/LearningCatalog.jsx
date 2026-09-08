import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useLearningT } from './learningI18n'
import { TerminalTopBar, StatPill } from './LearningUI'
import LearningAuthModal from './LearningAuthModal'
import pythonLogo from './python-logo.webp'
import './learning.css'

// Cursos sem conteúdo/rota nenhuma por trás — só pra dar volume visual ao catálogo, mostrando a
// variedade de trilhas que podem vir depois. Sempre desabilitados (tom cinza escuro + "Em breve").
const COMING_SOON_COURSE_IDS = [
  'arduino', 'containers', 'redes', 'csharp', 'distribuida', 'linux', 'owasp',
  'cybersecurity', 'nodejs', 'frontend', 'php', 'bigdata', 'nuvemModelos', 'iac', 'cloud'
]

// Catálogo de cursos (/learning/catalogo) — um nível abaixo da tela inicial (/learning, ver
// LearningLanding.jsx). Lógica de Programação, Python, GameMaker e SPED já têm conteúdo real por
// trás — Lógica aparece acima do Python por pedido do usuário. XP e sequência de dias são globais
// (soma de todos os cursos, ver GET /api/learning/stats) e aparecem só aqui, não repetidos por
// curso. SPED é um curso conceitual (jargões/estrutura fiscal-contábil), sem dado pessoal/real de
// empresa em nenhum exemplo de conteúdo.
export default function LearningCatalog() {
  const t = useLearningT()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'register'
  const [stats, setStats] = useState(null)

  // Só busca quando logado — sem setState síncrono no corpo do efeito (mesmo padrão de
  // LearningLesson.jsx). Se o usuário deslogar, a renderização já esconde os pills via `user &&`,
  // sem precisar limpar `stats` explicitamente.
  useEffect(() => {
    if (!user) return
    apiJson('/api/learning/stats').then(setStats).catch(() => {})
  }, [user])

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar>
          <Link to="/learning" className="learn-back-link">{t('backToLandingButton')}</Link>
        </TerminalTopBar>

        <header className="learn-hero">
          <h1 className="learn-hero-title">{t('catalogTitle')}</h1>
          <p className="learn-hero-subtitle">{t('catalogSubtitle')}</p>
        </header>

        {user && stats && (
          <div className="learn-stats-row">
            <StatPill icon="⚡" label={`${stats.totalXp} ${t('xpLabel')}`} />
            <StatPill
              icon="🔥"
              label={stats.currentStreak > 0 ? t('streakLabel', { n: stats.currentStreak }) : t('streakLabelZero')}
            />
          </div>
        )}

        {!user && (
          <div className="learn-visitor-banner">
            <span>{t('catalogVisitorBanner')}</span>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="learn-btn learn-btn--ghost" onClick={() => setAuthMode('login')}>
                {t('catalogLoginCta')}
              </button>
              <button className="learn-btn" onClick={() => setAuthMode('register')}>
                {t('catalogRegisterCta')}
              </button>
            </div>
          </div>
        )}

        <div className="learn-lesson-list">
          <button className="learn-node learn-node--available" onClick={() => navigate('/learning/logica')}>
            <span className="learn-node-icon">🧠</span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('courseLogicaTitle')}</span>
              <span className="learn-node-goal">{t('courseLogicaDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogAvailableTag')}</span>
          </button>

          <button className="learn-node learn-node--available" onClick={() => navigate('/learning/python')}>
            <span className="learn-node-icon"><img src={pythonLogo} alt="" className="learn-node-icon-img" /></span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('coursePythonTitle')}</span>
              <span className="learn-node-goal">{t('coursePythonDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogAvailableTag')}</span>
          </button>

          <button className="learn-node learn-node--available" onClick={() => navigate('/learning/gamemaker')}>
            <span className="learn-node-icon">🕹️</span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('courseGamemakerTitle')}</span>
              <span className="learn-node-goal">{t('courseGamemakerDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogAvailableTag')}</span>
          </button>

          <button className="learn-node learn-node--available" onClick={() => navigate('/learning/sped')}>
            <span className="learn-node-icon">🧾</span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('courseSpedTitle')}</span>
              <span className="learn-node-goal">{t('courseSpedDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogAvailableTag')}</span>
          </button>

          {COMING_SOON_COURSE_IDS.map(id => (
            <button key={id} className="learn-node learn-node--locked" disabled>
              <span className="learn-node-icon">🔒</span>
              <span className="learn-node-body">
                <span className="learn-node-title">{t(`comingSoon_${id}_title`)}</span>
                <span className="learn-node-goal">{t(`comingSoon_${id}_desc`)}</span>
              </span>
              <span className="learn-node-xp">{t('landingComingSoonTag')}</span>
            </button>
          ))}
        </div>
      </div>

      {authMode && <LearningAuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}
