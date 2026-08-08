import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiJson } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiJson('/api/auth/me')
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await apiJson('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (username, password) => {
    const data = await apiJson('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await apiJson('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
