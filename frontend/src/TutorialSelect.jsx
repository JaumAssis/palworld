import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { useTheme } from './theme/ThemeContext'

// Vídeo oficial explicando as regras do jogo — aberto em nova aba, sem repassar referrer/acesso
// à janela original (boa prática de segurança para links externos).
const OFFICIAL_TUTORIAL_URL = 'https://www.youtube.com/watch?v=UdbMWxWcMcw'

// Fundo próprio + sombra: sem isso, o texto claro ficava quase ilegível em cima do ambient.webp
// (a foto de fundo tem áreas claras que "engolem" qualquer cor pastel sem contraste garantido).
const DESC_STYLE = {
  color: '#fff', fontSize: 'var(--fs-sm)', lineHeight: 1.4, margin: '0 0 16px',
  background: 'rgba(0,0,0,0.55)', borderRadius: '8px', padding: 'var(--sp-xs) var(--sp-sm)',
  textShadow: '0 1px 3px rgba(0,0,0,0.6)'
}

function TutorialSelect() {
  const { t } = useLanguage()
  const { isNight } = useTheme()

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', padding: 'var(--sp-xl)', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
      backgroundImage: `url(${isNight ? '/night.png' : '/ambient.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
    }}>
      <Link to="/" style={{ position: 'fixed', top: 'var(--sp-lg)', left: 'var(--sp-lg)' }}>
        <button className="sign-button sign-button-fluid">{t('backToMenu')}</button>
      </Link>

      <h1 className="title-sign">{t('tutorialSelectTitle')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', maxWidth: 'var(--panel-w-xs)', width: '100%', marginTop: '20px' }}>
        <Link to="/tutorial/web">
          <button className="sign-button" style={{ width: '100%', fontSize: 'var(--fs-md)' }}>{t('tutorialWebButton')}</button>
        </Link>
        <p style={DESC_STYLE}>{t('tutorialWebDesc')}</p>

        <button
          className="sign-button"
          style={{ width: '100%', fontSize: 'var(--fs-md)' }}
          onClick={() => window.open(OFFICIAL_TUTORIAL_URL, '_blank', 'noopener,noreferrer')}
        >
          {t('tutorialOfficialButton')}
        </button>
        <p style={{ ...DESC_STYLE, marginBottom: 0 }}>{t('tutorialOfficialDesc')}</p>
      </div>
    </div>
  )
}

export default TutorialSelect
