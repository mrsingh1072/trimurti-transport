/**
 * Auth Helper Functions
 * Use useAuth hook from AuthContext instead when in React components
 * This file is for non-React utilities or fallback access
 */

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken') || null
}

export const isAuthenticated = () => {
  return !!getCurrentUser() && !!getAuthToken()
}

export const getUserRole = () => {
  return getCurrentUser()?.role || null
}

export const getUserName = () => {
  return getCurrentUser()?.name || 'User'
}

export const clearAuth = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}
