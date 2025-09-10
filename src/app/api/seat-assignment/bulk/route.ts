/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Assignment = {
  session_id: string;
  seatplan_id: string;
  room_id: string;
  examiner_id: number | string;
  seat_row: number;
  seat_col: number;
  seat_number: number;
};

export async function POST(req: Request) {
  try {
    const { assignments } = (await req.json()) as { assignments: Assignment[] };
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: "assignments array required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("seat_assignment").insert(assignments);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, inserted: assignments.length });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
