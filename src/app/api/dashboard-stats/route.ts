// app/api/dashboard-stats/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ✅ บังคับรันบน Node

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ service role
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tablesParam = url.searchParams.get("tables");

  // ✅ แก้ typo + ทำ whitelist ป้องกัน query ชื่อโต๊ะมั่ว ๆ
  const allowed = new Set(["exam_rooms", "examiner", "seating_plans", "exam_session"]);
  const tables = (tablesParam ? tablesParam.split(",") : ["exam_rooms", "examiner", "seating_plans", "exam_session"])
    .filter(t => allowed.has(t));

  const promises = tables.map(async (table) => {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) return { [table]: 0 };
    return { [table]: count || 0 };
  });

  const stats = Object.assign({}, ...(await Promise.all(promises)));
  return NextResponse.json(stats);
}
