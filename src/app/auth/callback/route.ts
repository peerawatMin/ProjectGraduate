// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { event, session } = await req.json()

  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token!,
    })
  }

  if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut()
  }

  return NextResponse.json({ ok: true })
}
