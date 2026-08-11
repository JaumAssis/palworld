import { useLanguage } from './i18n/LanguageContext'
import { useOnlineCount } from './live/LiveContext'

// O contador vem do LiveContext (montado acima do router) em vez de um listener local — assim
// o valor sobrevive a navegar pra outra tela e voltar, em vez de zerar toda vez que este
// componente remonta (ver comentário em LiveContext.jsx).
export default function OnlineBadge() {
  const { t } = useLanguage()
  const { onlineCount } = useOnlineCount()

  if (onlineCount === null) return null

  return (
    <div className="currency-badge online-badge" title={t('onlineBadgeTitle')}>
      <span className="online-dot" />
      {onlineCount}
    </div>
  )
}
