/* eslint-disable @typescript-eslint/no-unused-vars */
// src/hooks/useAuth.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  phone?: string
  firstName?: string
  lastName?: string
}

interface AuthResult {
  user: User | null
  error: { message: string } | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, phone: string, firstName: string, lastName: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // ฟังก์ชันดึงข้อมูล profile จาก API
  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || '/boy.png',
          role: userData.role || 'admin',
          phone: userData.phone,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      } else {
        console.error('Failed to fetch profile')
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
    } finally {
      setLoading(false)
    }
  }

  // ตรวจสอบ token เมื่อเริ่มต้น
  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token')
    
    if (storedToken) {
      setToken(storedToken)
      fetchProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const login = (newToken: string) => {
    localStorage.setItem('auth-token', newToken)
    setToken(newToken)
    setLoading(true)
    fetchProfile(newToken)
  }

  const logout = async () => {
    try {
      // เรียก signout API เพื่อลบ cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // ลบ token จาก localStorage และ reset state
      localStorage.removeItem('auth-token')
      setToken(null)
      setUser(null)
    }
  }

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token)
    }
  }

  // ฟังก์ชันสำหรับเข้าสู่ระบบ
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          user: null,
          error: { message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' }
        }
      }

      // บันทึก token และดึงข้อมูลผู้ใช้
      if (data.token) {
        login(data.token)
      }

      // สร้าง user object ที่มีข้อมูลครบถ้วน
      const userData = {
        id: data.user.id,
        name: data.profile ? `${data.profile.firstName} ${data.profile.lastName}` : data.user.email,
        email: data.user.email,
        avatar: '/boy.png',
        role: 'admin',
        phone: data.profile?.phone,
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName
      }

      return {
        user: userData,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        error: { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }
      }
    }
  }

  // ฟังก์ชันสำหรับสมัครสมาชิก
  const signUp = async (
    email: string,
    password: string,
    phone: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResult> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          phone,
          firstName,
          lastName
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          user: null,
          error: { message: data.message || 'สมัครสมาชิกไม่สำเร็จ' }
        }
      }

      // บันทึก token และดึงข้อมูลผู้ใช้ (หลังจากแก้ไข API แล้ว)
      if (data.token) {
        login(data.token)
      }

      // สร้าง user object ที่มีข้อมูลครบถ้วน
      const userData = {
        id: data.user.id,
        name: data.profile ? `${data.profile.firstName} ${data.profile.lastName}` : data.user.email,
        email: data.user.email,
        avatar: '/boy.png',
        role: 'admin',
        phone: data.profile?.phone,
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName
      }

      return {
        user: userData,
        error: null
      }
    } catch (error) {
      return {
        user: null,
        error: { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      refreshProfile,
      signIn,
      signUp
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