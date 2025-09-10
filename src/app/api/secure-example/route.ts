
// src/app/api/secure-example/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = getSupabaseServerClient()
  const { data: { user } } = await (await supabase).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true })
}
