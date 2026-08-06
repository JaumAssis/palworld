import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'pt')

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'pt' ? 'en' : 'pt'
      localStorage.setItem('lang', next)
      return next
    })
  }, [])

  const t = useCallback((key, params) => {
    const entry = translations[lang]?.[key] ?? translations.pt[key]
    if (entry === undefined) return key
    return typeof entry === 'function' ? entry(params) : entry
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
