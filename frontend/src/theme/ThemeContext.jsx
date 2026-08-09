import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiFetch } from '../api'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const [isNight, setIsNight] = useState(() => localStorage.getItem('theme') === 'night')

  // Usuário logado: a preferência salva no perfil (banco) prevalece sobre o que ficou no
  // localStorage desse navegador — é assim que a configuração acompanha a conta entre dispositivos.
  useEffect(() => {
    if (!user) return
    apiFetch('/api/player').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.theme) setIsNight(data.theme === 'night')
    })
  }, [user])

  const toggleTheme = useCallback(() => {
    setIsNight(prev => {
      const next = !prev
      const value = next ? 'night' : 'day'
      localStorage.setItem('theme', value)
      if (user) {
        apiFetch('/api/player/theme', { method: 'PATCH', body: JSON.stringify({ theme: value }) }).catch(() => {})
      }
      return next
    })
  }, [user])

  return (
    <ThemeContext.Provider value={{ isNight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
