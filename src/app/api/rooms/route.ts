/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ExamRoom } from "@/types/examRoom";

export const runtime = "nodejs";

// GET - ดึงข้อมูลห้องทั้งหมด
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("exam_rooms").select("*");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST - เพิ่มห้องสอบ
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabaseAdmin.from("exam_rooms").insert([
      {
        room_id: body.room_id,
        room_name: body.room_name,
        room_number: body.room_number,
        totalseats: body.totalSeats,
        seatpattern: body.seatPattern,
        description: body.description,
      },
    ]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/rooms error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT - อัพเดตห้องสอบ
export async function PUT(req: Request) {
  try {
    const body: ExamRoom = await req.json();

    const { error } = await supabaseAdmin
      .from("exam_rooms")
      .update({
        room_name: body.room_name,
        room_number: body.room_number,
        totalseats: body.totalSeats,
        seatpattern: body.seatPattern,
        description: body.description,
      })
      .eq("room_id", body.room_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/rooms error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE - ลบห้องสอบ
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room_id = searchParams.get("room_id");

    if (!room_id) {
      return NextResponse.json({ error: "room_id required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("exam_rooms")
      .delete()
      .eq("room_id", room_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/rooms error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
