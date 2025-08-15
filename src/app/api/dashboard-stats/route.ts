// app/api/dashboard-stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key ใช้บน server
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tablesParam = url.searchParams.get('tables'); // ตัวอย่าง: tables=exam_rooms,examiner
  const tables = tablesParam ? tablesParam.split(',') : ['exam_rooms', 'examiner', 'seating_plans', 'examsession'];

  const promises = tables.map(async (table) => {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    return { [table]: count || 0 };
  });

  const stats = Object.assign({}, ...(await Promise.all(promises)));
  return NextResponse.json(stats);
}
