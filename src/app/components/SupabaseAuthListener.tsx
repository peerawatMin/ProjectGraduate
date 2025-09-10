// src/components/SupabaseAuthListener.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseAuthListener({ serverAccessToken }: { serverAccessToken?: string }) {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, session }),
      })
      if (session?.access_token !== serverAccessToken) {
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [router, serverAccessToken])

  return null
}
