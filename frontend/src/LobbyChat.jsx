import { useEffect, useRef } from 'react'
import { useLanguage } from './i18n/LanguageContext'
import { useAuth } from './auth/AuthContext'
import { useLobbyChat } from './live/LiveContext'

// Extraído de FindMatchDeckSelect.jsx — o histórico e o envio agora vêm do LiveContext (que fica
// montado acima do router), então o chat não zera mais ao sair da tela de "Encontrar Partida" e
// voltar. onNickClick deixa o pai decidir o que fazer ao clicar num nick (abrir o modal de desafio).
export default function LobbyChat({ onNickClick }) {
  const { t, lang } = useLanguage()
  const { user } = useAuth()
  const { messages, chatError, sendMessage } = useLobbyChat()

  const boxRef = useRef(null)
  const inputRef = useRef(null)

  const formatChatTime = (ts) => new Date(ts).toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages.length])

  const handleSend = () => {
    const input = inputRef.current
    if (!input) return
    sendMessage(input.value)
    input.value = ''
  }

  return (
    <div style={{
      margin: '30px auto 0', maxWidth: '900px',
      background: '#000', border: '3px solid #c99a4e', borderRadius: '20px',
      padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px'
    }}>
      <div ref={boxRef} style={{
        background: 'rgba(0,0,0,0.55)', border: '2px solid #c99a4e', borderRadius: '14px',
        padding: '12px', height: '260px', overflowY: 'auto', textAlign: 'left'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{t('lobbyChatEmpty')}</p>
        ) : (
          messages.map((msg, i) => {
            const isOwnMessage = msg.author === user?.username
            return (
              <p key={i} style={{ color: '#f3e2b3', fontSize: '13px', margin: '4px 0' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>{formatChatTime(msg.ts)}</span>{' '}
                {isOwnMessage ? (
                  <strong>{msg.author}:</strong>
                ) : (
                  <strong
                    onClick={() => onNickClick(msg.playerId, msg.author)}
                    title={t('challengeNickTitle')}
                    style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                  >{msg.author}:</strong>
                )}
                {' '}{msg.text}
              </p>
            )
          })
        )}
      </div>
      {chatError && <p style={{ color: '#ff8a8a', fontSize: '12px', margin: 0 }}>{chatError}</p>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('lobbyChatPlaceholder')}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '10px', border: '2px solid #8a5a2e',
            background: '#fdf6e3', color: '#3a2410', fontSize: '13px'
          }}
        />
        <button className="sign-button" onClick={handleSend}>{t('lobbyChatSend')}</button>
      </div>
    </div>
  )
}
