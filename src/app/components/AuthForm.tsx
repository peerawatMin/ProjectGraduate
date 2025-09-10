'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'

// ปรับ path ให้ตรงโปรเจ็กต์คุณ
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

interface Props {
  isLogin?: boolean
}

interface ValidationErrors {
  email?: string
  password?: string
  phone?: string
  firstName?: string
  lastName?: string
}

export default function AuthForm({ isLogin = true }: Props) {
  const router = useRouter()
  const search = useSearchParams()
  const redirectTo = search.get('redirect') || '/Dashboard'

  const { signIn, signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ---------- Validation ----------
  const isValidEmail = (v: string): string | undefined => {
    if (!v.trim()) return 'กรุณากรอกอีเมล'
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(v)) return 'รูปแบบอีเมลไม่ถูกต้อง'
    return v.length > 254 ? 'อีเมลยาวเกินไป' : undefined
  }

  const isValidPassword = (p: string): string | undefined => {
    if (!p) return 'กรุณากรอกรหัสผ่าน'
    if (p.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    if (p.length > 128) return 'รหัสผ่านยาวเกินไป'
    if (!/(?=.*[a-z])/.test(p)) return 'ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว'
    if (!/(?=.*[A-Z])/.test(p)) return 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'
    if (!/(?=.*\d)/.test(p)) return 'ต้องมีตัวเลขอย่างน้อย 1 ตัว'
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(p)) return 'ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'
    return undefined
  }

  const isValidPhone = (v: string): string | undefined =>
    /^\d{10}$/.test(v) ? undefined : 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)'

  const setAndValidate =
    (setter: (v: string) => void, key: keyof ValidationErrors) => (v: string) => {
      setter(v)
      setValidationErrors(prev => ({
        ...prev,
        [key]:
          key === 'email' ? isValidEmail(v)
          : key === 'password' ? isValidPassword(v)
          : key === 'phone' ? (!isLogin ? isValidPhone(v) : undefined)
          : v ? undefined : (key === 'firstName' ? 'กรุณากรอกชื่อ' : 'กรุณากรอกนามสกุล'),
      }))
    }

  // ---------- Submit ----------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')

    const newErrors: ValidationErrors = {
      email: isValidEmail(email),
      password: isValidPassword(password),
      phone: !isLogin ? isValidPhone(phone) : undefined,
      firstName: !isLogin && !firstName ? 'กรุณากรอกชื่อ' : undefined,
      lastName: !isLogin && !lastName ? 'กรุณากรอกนามสกุล' : undefined,
    }
    setValidationErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) {
      setIsSubmitting(false)
      return
    }

    try {
      if (isLogin) {
        const result = await signIn(email.trim(), password)

        if (result?.error) {
          setError(result.error.message || 'เข้าสู่ระบบไม่สำเร็จ')
        } else if (result?.user) {
          // ✅ สำคัญ: sync session ไป Server ก่อนค่อยนำทาง (กันเด้งกลับ)
          const { data: { session } } = await supabase.auth.getSession()
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'SIGNED_IN', session }),
          })

          router.replace(redirectTo)
        } else {
          setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        }
      } else {
        const result = await signUp(email.trim(), password, phone, firstName, lastName)

        if (result?.error) {
          setError(result.error.message || 'สมัครสมาชิกไม่สำเร็จ')
        } else if (result?.user) {
          toast.success('สมัครสมาชิกสำเร็จ!')
          // ส่วนใหญ่ signUp จะรอ verify email → พาไปหน้า login
          router.replace(`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`)
        } else {
          setError('เกิดข้อผิดพลาดในการสมัครสมาชิก')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(isLogin ? 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' : 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl" noValidate>
        <h2 className="mb-6 text-center text-3xl font-bold text-blue-800">
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {!isLogin && (
          <>
            <div className="mb-4">
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-black">ชื่อ</label>
              <input
                id="firstName"
                className="w-full rounded-md border border-gray-300 p-3 text-blue-800"
                value={firstName}
                onChange={e => setAndValidate(setFirstName, 'firstName')(e.target.value)}
              />
              {validationErrors.firstName && <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-black">นามสกุล</label>
              <input
                id="lastName"
                className="w-full rounded-md border border-gray-300 p-3 text-blue-800"
                value={lastName}
                onChange={e => setAndValidate(setLastName, 'lastName')(e.target.value)}
              />
              {validationErrors.lastName && <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-black">เบอร์โทรศัพท์</label>
              <input
                id="phone"
                className="w-full rounded-md border border-gray-300 p-3 text-blue-800"
                inputMode="numeric"
                placeholder="0XXXXXXXXX"
                value={phone}
                onChange={e => setAndValidate(setPhone, 'phone')(e.target.value)}
              />
              {validationErrors.phone && <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>}
            </div>
          </>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">อีเมล</label>
          <input
            id="email"
            className="w-full rounded-md border border-gray-300 p-3 text-blue-800"
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={e => setAndValidate(setEmail, 'email')(e.target.value)}
            autoComplete="email"
          />
          {validationErrors.email && <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-black">รหัสผ่าน</label>
          <div className="relative">
            <input
              id="password"
              className="w-full rounded-md border border-gray-300 p-3 pr-10 text-blue-800"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setAndValidate(setPassword, 'password')(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {validationErrors.password && <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>}
        </div>

        {isLogin && (
          <div className="text-right">
            <a href="/reset-password" className="text-sm text-green-600 hover:text-green-800">ลืมรหัสผ่าน ?</a>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md mt-4 bg-gradient-to-tr from-blue-600 bg-cyan-500 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? (isLogin ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสมัครสมาชิก...')
            : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
        </button>

        <hr className="mt-6 text-gray-300" />
        <div className="text-center mt-4">
          <div className="flex justify-center items-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? 'ถ้ายังไม่มีบัญชีเข้าใช้งาน' : 'ถ้าท่านมีบัญชีแล้ว'}
            </p>
            <a
              href={isLogin ? `/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}` : '/login'}
              className="ml-1 text-green-600 hover:text-green-800"
            >
              {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
