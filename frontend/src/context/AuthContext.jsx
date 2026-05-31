import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/services'
import { TOKEN_KEY, REFRESH_KEY } from '../api/client'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, data.access)
    localStorage.setItem(REFRESH_KEY, data.refresh)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    return data
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }

  const refreshUser = async () => {
    const { data } = await authApi.me()
    setUser(data)
    return data
  }

  const value = { user, setUser, loading, login, register, logout, refreshUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
