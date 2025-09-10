/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ExamSeat } from "@/types/examTypes";

export const runtime = "nodejs";

const MAX_COLS = 20; // จำนวนคอลัมน์สูงสุดใน Grid

// GET /api/examseat?sessionId=xxxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // ✅ ใช้ service role (supabaseAdmin) → ข้าม RLS ได้
    const { data, error } = await supabaseAdmin
      .from("seat_assignment")
      .select(
        `
        seat_number,
        examiner:examiner_id (
          examinerid,
          idcardnumber,
          title,
          firstname,
          lastname,
          gender,
          phone,
          email,
          nationality,
          specialneeds
        )
      `
      )
      .eq("session_id", sessionId)
      .order("seat_number", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // map → ExamSeat[]
    const seats: ExamSeat[] = (data || []).map((item: any, index: number) => ({
      seat_number: item.seat_number,
      examiner: item.examiner?.[0] || null,
      gridRow: Math.floor(index / MAX_COLS),
      gridCol: index % MAX_COLS,
    }));

    return NextResponse.json(seats);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
