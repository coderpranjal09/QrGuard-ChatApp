import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const sessionId = localStorage.getItem('qrguard_session')
    const userType = localStorage.getItem('qrguard_userType')
    
    if (sessionId && userType) {
      setUser({ sessionId, userType })
      setIsAuthenticated(true)
    }
  }, [])

  const login = (sessionId, userType) => {
    localStorage.setItem('qrguard_session', sessionId)
    localStorage.setItem('qrguard_userType', userType)
    setUser({ sessionId, userType })
    setIsAuthenticated(true)
    toast.success('Logged in successfully')
  }

  const logout = () => {
    localStorage.removeItem('qrguard_session')
    localStorage.removeItem('qrguard_userType')
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  const getUserType = () => {
    return user?.userType || null
  }

  const isRequester = () => {
    return getUserType() === 'requester'
  }

  const isOwner = () => {
    return getUserType() === 'owner'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        getUserType,
        isRequester,
        isOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}