// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ฟังก์ชันดึงข้อมูล profile
  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token invalid, clear auth
        localStorage.removeItem('auth-token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      localStorage.removeItem('auth-token')
      setToken(null)
      setUser(null)
    }
  }

  // ตรวจสอบ token เมื่อเริ่มต้น
  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token')
    
    if (storedToken) {
      setToken(storedToken)
      fetchProfile(storedToken)
    }
    
    setLoading(false)
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('auth-token', newToken)
    setToken(newToken)
    fetchProfile(newToken)
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setToken(null)
    setUser(null)
  }

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}