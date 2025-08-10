'use client'
import { useState, FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'

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

  const isValidEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'กรุณากรอกอีเมล';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    return email.length > 254 ? 'อีเมลยาวเกินไป' : undefined;
  }

  const isValidPassword = (password: string): string | undefined => {
    if (!password) return 'กรุณากรอกรหัสผ่าน';
    if (password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (password.length > 128) return 'รหัสผ่านยาวเกินไป';
    if (!/(?=.*[a-z])/.test(password)) return 'ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว';
    if (!/(?=.*[A-Z])/.test(password)) return 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว';
    if (!/(?=.*\d)/.test(password)) return 'ต้องมีตัวเลขอย่างน้อย 1 ตัว';
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return 'ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว';
    return undefined;
  }

  const isValidPhone = (phone: string): string | undefined => {
    return /^\d{10}$/.test(phone) ? undefined : 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)';
  }

  const handleEmailChange = (v: string) => {
    setEmail(v)
    setValidationErrors(prev => ({ ...prev, email: isValidEmail(v) }))
  }

  const handlePasswordChange = (v: string) => {
    setPassword(v)
    setValidationErrors(prev => ({ ...prev, password: isValidPassword(v) }))
  }

  const handlePhoneChange = (v: string) => {
    setPhone(v)
    if (!isLogin) setValidationErrors(prev => ({ ...prev, phone: isValidPhone(v) }))
  }

  const handleFirstNameChange = (v: string) => {
    setFirstName(v)
    if (!isLogin) setValidationErrors(prev => ({ ...prev, firstName: v ? undefined : 'กรุณากรอกชื่อ' }))
  }

  const handleLastNameChange = (v: string) => {
    setLastName(v)
    if (!isLogin) setValidationErrors(prev => ({ ...prev, lastName: v ? undefined : 'กรุณากรอกนามสกุล' }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const emailError = isValidEmail(email)
    const passwordError = isValidPassword(password)
    const phoneError = !isLogin ? isValidPhone(phone) : undefined
    const firstNameError = !isLogin && !firstName ? 'กรุณากรอกชื่อ' : undefined
    const lastNameError = !isLogin && !lastName ? 'กรุณากรอกนามสกุล' : undefined

    const newErrors: ValidationErrors = {
      email: emailError,
      password: passwordError,
      phone: phoneError,
      firstName: firstNameError,
      lastName: lastNameError,
    }

    setValidationErrors(newErrors)

    if (Object.values(newErrors).some((err) => err)) {
      setIsSubmitting(false)
      return
    }

    try {
      if (isLogin) {
        const result = await signIn(email.trim(), password)
        if (result.error) setError(result.error.message)
        else if (result.user) router.push('/Dashboard')
      } else {
        const result = await signUp(email.trim(), password, phone, firstName, lastName)
        if (result.error) setError(result.error.message)
        else if (result.user) {
          toast.success('สมัครสมาชิกสำเร็จ!')
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-4 lg:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-4xl bg-white p-6 shadow-xl sm:p-8 md:p-10"
        noValidate
      >
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
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-black">
                ชื่อ
              </label>
              <input
                id="firstName"
                className="w-full rounded-md border border-gray-400 p-3  text-blue-800"
                type="text"
                placeholder="ชื่อ"
                value={firstName}
                onChange={(e) => handleFirstNameChange(e.target.value)}
              />
              {validationErrors.firstName && <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-black">
                นามสกุล
              </label>
              <input
                id="lastName"
                className="w-full rounded-md border border-gray-400 p-3 text-blue-800"
                type="text"
                placeholder="นามสกุล"
                value={lastName}
                onChange={(e) => handleLastNameChange(e.target.value)}
              />
              {validationErrors.lastName && <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-black">
                เบอร์โทรศัพท์
              </label>
              <input
                id="phone"
                className="w-full rounded-md border border-gray-400 p-3 text-blue-800"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              {validationErrors.phone && <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>}
            </div>
          </>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-left text-black">
            อีเมล
          </label>
          <input
            id="email"
            className="w-full rounded-md border border-gray-400 p-3 text-blue-800 "
            type="email"
            placeholder="your@example.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            autoComplete="email"
          />
          {validationErrors.email && <p className="text-red-600 text-left text-sm mt-1">{validationErrors.email}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-left text-sm font-medium text-black">
            รหัสผ่าน
          </label>
          <div className="relative">
            <input
              id="password"
              className="w-full rounded-md border border-gray-400 p-3 pr-10 text-blue-800"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {validationErrors.password && <p className="text-red-600 text-left text-sm mt-1">{validationErrors.password}</p>}
        </div>

        {isLogin && (
          <div className='text-right'>
            <a href="/reset-password" className='text-sm text-green-600 hover:text-green-800'>ลืมรหัสผ่าน ?</a>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md mt-4 bg-blue-600 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:bg-blue-400"
        >
          {isSubmitting ? 'กำลังประมวลผล...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </button>

        <hr className='mt-6 text-gray-400' />
        <div className="text-center mt-4">
          <div className='flex justify-center items-center'>
            <p className='text-gray-600 text-sm'>
              {isLogin ? 'ถ้ายังไม่มีบัญชีเข้าใช้งาน' : 'ถ้าท่านมีบัญชีแล้ว'}
            </p>
            <a
              href={isLogin ? "/signup" : "/login"}
              className='ml-1 text-green-600 hover:text-green-800'
            >
              {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
