import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) return null
    try {
      return JSON.parse(rawUser)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // No need for useEffect for initial load, state is set safely above

  const login = (userData, token) => {
    setUser(userData)
    if (token) localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user && !!localStorage.getItem('authToken')
  
  // Role checks
  const isCustomer = user?.role === 'customer'
  const isStaff = user?.role === 'staff'
  const isAdmin = user?.role === 'admin'
  const role = user?.role

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      loading,
      role,
      isCustomer,
      isStaff,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
