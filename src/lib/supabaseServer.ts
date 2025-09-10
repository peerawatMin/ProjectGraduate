// src/lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ รูปแบบใหม่: คืนค่าคุกกี้ทั้งหมดให้ SSR จัดการ
        getAll() {
          return cookieStore.getAll()
        },
        // ✅ รูปแบบใหม่: ตั้งคุกกี้ทั้งหมดตามที่ Supabase ขอ
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions)
            })
          } catch {
            // หมายเหตุ: ใน Server Component บางบริบท Next.js ไม่ให้ set cookie โดยตรง
            // การซิงก์คุกกี้ควรเกิดใน Route Handler/Middleware แทน (เราใช้ /auth/callback อยู่แล้ว)
          }
        },
      },
    }
  )
}
