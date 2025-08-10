'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setMessage('Check your email to reset your password.')
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700">
        Send Reset Link
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
    </form>
  )
}
