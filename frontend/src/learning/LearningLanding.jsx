import { useNavigate } from 'react-router-dom'
import { useLearningT } from './learningI18n'
import { TerminalTopBar } from './LearningUI'
import './learning.css'

// Tela inicial do /learning — só os 2 quadrados (Catálogo / Minigames). O Catálogo leva pra lista
// de cursos (o que era /learning antes desta tela existir, agora em /learning/catalogo). Minigames
// não faz nada por enquanto — fica desabilitado, sem rota nenhuma por trás ainda.
export default function LearningLanding() {
  const t = useLearningT()
  const navigate = useNavigate()

  return (
    <div className="learn-page">
      <div className="learn-container">
        <TerminalTopBar />

        <header className="learn-hero">
          <h1 className="learn-hero-title">{t('landingTitle')}</h1>
          <p className="learn-hero-subtitle">{t('landingSubtitle')}</p>
        </header>

        <div className="learn-square-grid">
          <button className="learn-square" onClick={() => navigate('/learning/catalogo')}>
            <span className="learn-square-icon">📚</span>
            <span className="learn-square-title">{t('landingCatalogTitle')}</span>
          </button>

          <button className="learn-square learn-square--disabled" disabled>
            <span className="learn-square-icon">🎮</span>
            <span className="learn-square-title">{t('landingMinigamesTitle')}</span>
            <span className="learn-square-tag">{t('landingComingSoonTag')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
