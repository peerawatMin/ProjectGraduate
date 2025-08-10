'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else {
      setMessage('Password updated!')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <input
        type="password"
        placeholder="New password"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        Update Password
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
    </form>
  )
}
