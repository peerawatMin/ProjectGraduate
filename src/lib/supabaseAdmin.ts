import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,   // 👈 คีย์ลับ ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น
  { auth: { autoRefreshToken: false, persistSession: false } }
);
