import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLearningT } from './learningI18n'
import { TerminalTopBar } from './LearningUI'
import LearningAuthModal from './LearningAuthModal'
import pythonLogo from './python-logo.webp'
import './learning.css'

// Tela inicial do /learning: catálogo de cursos. Só Python existe de verdade por enquanto — o
// card de Lógica de Programação é só o anúncio visual do próximo curso (sem conteúdo/rota real
// ainda por trás), acima do Python por pedido do usuário.
export default function LearningCatalog() {
  const t = useLearningT()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'register'

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar />

        <header className="learn-hero">
          <h1 className="learn-hero-title">{t('catalogTitle')}</h1>
          <p className="learn-hero-subtitle">{t('catalogSubtitle')}</p>
        </header>

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
          <button className="learn-node learn-node--locked" disabled>
            <span className="learn-node-icon">🔒</span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('courseLogicaTitle')}</span>
              <span className="learn-node-goal">{t('courseLogicaDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogComingSoonTag')}</span>
          </button>

          <button className="learn-node learn-node--available" onClick={() => navigate('/learning/python')}>
            <span className="learn-node-icon"><img src={pythonLogo} alt="" className="learn-node-icon-img" /></span>
            <span className="learn-node-body">
              <span className="learn-node-title">{t('coursePythonTitle')}</span>
              <span className="learn-node-goal">{t('coursePythonDescription')}</span>
            </span>
            <span className="learn-node-xp">{t('catalogAvailableTag')}</span>
          </button>
        </div>
      </div>

      {authMode && <LearningAuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />}
    </div>
  )
}
