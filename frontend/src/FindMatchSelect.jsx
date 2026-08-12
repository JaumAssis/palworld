import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { useTheme } from './theme/ThemeContext'

function FindMatchSelect() {
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

      <h1 className="title-sign">{t('findMatchSelectTitle')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', maxWidth: 'var(--panel-w-xs)', width: '100%', marginTop: '20px' }}>
        <Link to="/findmatch/normal">
          <button className="sign-button" style={{ width: '100%', fontSize: 'var(--fs-md)' }}>
            {t('findMatchNormalButton')}
          </button>
        </Link>
        <Link to="/findmatch/arena">
          <button className="sign-button" style={{ width: '100%', fontSize: 'var(--fs-md)' }}>
            {t('findMatchArenaButton')}
          </button>
        </Link>
      </div>
    </div>
  )
}

export default FindMatchSelect
