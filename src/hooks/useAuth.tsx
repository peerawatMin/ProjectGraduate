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
  token: string | null // คง field เดิมไว้กันโค้ดที่อื่นพัง แต่จะไม่ใช้จริง
  loading: boolean
  login: (token?: string) => void
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, phone: string, firstName: string, lastName: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null) // ไม่ใช้จริง เพราะ cookie เป็น httpOnly
  const [loading, setLoading] = useState(true)

  // ✅ ดึงโปรไฟล์โดยพึ่ง cookie (จะถูกส่งอัตโนมัติเมื่อเรียก fetch ในโดเมนเดียวกัน)
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        return
      }
      const u = await res.json()
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || '/boy.png',
        role: u.role || 'admin',
        phone: u.phone,
        firstName: u.firstName,
        lastName: u.lastName,
      })
    } catch (e) {
      console.error('Error fetching profile:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ ตอนเริ่มแอป: ไม่ต้องอ่าน localStorage, เรียก /api/profile พอ
  useEffect(() => {
    fetchProfile()
  }, [])

  // ✅ login() แทบไม่ต้องทำอะไร เพราะ cookie ถูกตั้งจากฝั่งเซิร์ฟเวอร์อยู่แล้ว
  const login = (_token?: string) => {
    setToken(null)
    setLoading(true)
    fetchProfile()
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error('Logout API error:', e)
    } finally {
      setUser(null)
      setToken(null)
    }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  // ✅ เข้าสู่ระบบ: ให้ /api/auth/signin ตั้ง cookie (httpOnly) แล้วค่อย fetch โปรไฟล์
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { user: null, error: { message: data.message || 'เข้าสู่ระบบไม่สำเร็จ' } }
      }
      await fetchProfile()
      const userData: User = {
        id: data.user.id,
        name: data.profile ? `${data.profile.firstName} ${data.profile.lastName}` : data.user.email,
        email: data.user.email,
        avatar: '/boy.png',
        role: data.user.role || 'admin',
        phone: data.profile?.phone,
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName,
      }
      return { user: userData, error: null }
    } catch (e) {
      return { user: null, error: { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' } }
    }
  }

  // ✅ สมัครสมาชิก: ให้ /api/auth/signup ตั้ง cookie (หรือจะไม่ตั้งก็ได้) แล้ว fetch โปรไฟล์/พาไป login
  const signUp = async (email: string, password: string, phone: string, firstName: string, lastName: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, phone, firstName, lastName }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { user: null, error: { message: data.message || 'สมัครสมาชิกไม่สำเร็จ' } }
      }
      await fetchProfile()
      const userData: User = {
        id: data.user.id,
        name: data.profile ? `${data.profile.firstName} ${data.profile.lastName}` : data.user.email,
        email: data.user.email,
        avatar: '/boy.png',
        role: data.user.role || 'admin',
        phone: data.profile?.phone,
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName,
      }
      return { user: userData, error: null }
    } catch (e) {
      return { user: null, error: { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' } }
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
