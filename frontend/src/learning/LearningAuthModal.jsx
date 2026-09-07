import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLearningT } from './learningI18n'
import './learning.css'

// Caixa de login/criar conta própria do /learning — mesma conta do jogo por baixo (useAuth já é
// compartilhado via contexto na raiz do app), mas SEM redirecionar pro Palworld TCG: é um formulário
// autocontido, no visual dev/terminal, aberto por cima do catálogo.
export default function LearningAuthModal({ initialMode = 'login', onClose }) {
  const t = useLearningT()
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (password !== confirmPassword) { setError(t('authError_password_mismatch')); return }
      setShowRegisterConfirm(true)
      return
    }
    setSubmitting(true)
    try {
      await login(username, password)
      onClose()
    } catch (err) {
      setError(t(`authError_${err.code || 'unknown'}`))
    } finally {
      setSubmitting(false)
    }
  }

  // Sem integração com email (mesma decisão do jogo) — o aviso confirma que a pessoa entendeu que
  // perder a senha significa perder o acesso à conta, sem chance de recuperação.
  const confirmRegister = async () => {
    setSubmitting(true)
    try {
      await register(username, password)
      setShowRegisterConfirm(false)
      onClose()
    } catch (err) {
      setError(t(`authError_${err.code || 'unknown'}`))
      setShowRegisterConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="learn-modal-overlay" onClick={onClose}>
      <div className="learn-modal" onClick={e => e.stopPropagation()}>
        <div className="learn-modal-header">
          <h2 className="learn-modal-title">{mode === 'login' ? t('authModalLoginTitle') : t('authModalRegisterTitle')}</h2>
          <button className="learn-modal-close" onClick={onClose} aria-label={t('authModalClose')}>✕</button>
        </div>

        <form onSubmit={submit} className="learn-auth-form">
          <input
            className="learn-fill-input" placeholder={t('authUsernamePlaceholder')} value={username}
            onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus
          />
          <input
            className="learn-fill-input" type="password" placeholder={t('authPasswordPlaceholder')} value={password}
            onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {mode === 'register' && (
            <input
              className="learn-fill-input" type="password" placeholder={t('authConfirmPasswordPlaceholder')} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"
            />
          )}
          {error && <p className="learn-error">{error}</p>}
          <button className="learn-btn" type="submit" disabled={submitting}>
            {mode === 'login' ? t('authLoginBtn') : t('authRegisterBtn')}
          </button>
        </form>

        <button
          type="button" className="learn-modal-switch"
          onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
        >
          {mode === 'login' ? t('authSwitchToRegister') : t('authSwitchToLogin')}
        </button>

        {showRegisterConfirm && (
          <div className="learn-modal-overlay" onClick={() => setShowRegisterConfirm(false)}>
            <div className="learn-modal learn-modal--confirm" onClick={e => e.stopPropagation()}>
              <p>{t('authRegisterConfirmMsg')}</p>
              <div className="learn-panel-actions" style={{ justifyContent: 'center' }}>
                <button className="learn-btn" disabled={submitting} onClick={confirmRegister}>{t('authRegisterConfirmYes')}</button>
                <button className="learn-btn learn-btn--ghost" disabled={submitting} onClick={() => setShowRegisterConfirm(false)}>
                  {t('authRegisterConfirmNo')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
