import { Link } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageContext'
import { useTheme } from './theme/ThemeContext'

function FindMatchSelect() {
  const { t } = useLanguage()
  const { isNight } = useTheme()

  return (
    <div style={{
      minHeight: '100vh', boxSizing: 'border-box', padding: '2rem', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
      backgroundImage: `url(${isNight ? '/night.png' : '/ambient.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'
    }}>
      <Link to="/" style={{ position: 'fixed', top: '20px', left: '20px' }}>
        <button className="sign-button">{t('backToMenu')}</button>
      </Link>

      <h1 className="title-sign">{t('findMatchSelectTitle')}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '340px', width: '100%', marginTop: '20px' }}>
        <Link to="/findmatch/normal">
          <button className="sign-button" style={{ width: '100%', fontSize: '16px' }}>
            {t('findMatchNormalButton')}
          </button>
        </Link>
        <Link to="/findmatch/arena">
          <button className="sign-button" style={{ width: '100%', fontSize: '16px' }}>
            {t('findMatchArenaButton')}
          </button>
        </Link>
      </div>
    </div>
  )
}

export default FindMatchSelect
