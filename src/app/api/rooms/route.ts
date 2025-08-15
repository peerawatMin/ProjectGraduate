/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ExamRoom } from "@/types/examRoom";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ใช้ anon key ถ้า client ต้องการใช้
);

// ดึงข้อมูลห้องทั้งหมด
export async function GET() {
  try {
    const { data, error } = await supabase.from("exam_rooms").select("*");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// เพิ่มห้องสอบ
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received POST data:', body);

    const { error } = await supabase.from("exam_rooms").insert([
      {
        room_id: body.room_id,
        room_name: body.room_name,
        room_number: body.room_number,
        totalseats: body.totalSeats,    // lowercase ตามฐานข้อมูล
        seatpattern: body.seatPattern,  // lowercase ตามฐานข้อมูล
        description: body.description,
      },
    ]);
    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/rooms error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// อัพเดตห้องสอบ
export async function PUT(req: Request) {
  try {
    const body: ExamRoom = await req.json();

    const { error } = await supabase
      .from("exam_rooms")
      .update({
        room_name: body.room_name,
        room_number: body.room_number,
        totalseats: body.totalSeats,
        seatpattern: body.seatPattern,
        description: body.description,
      })
      .eq("room_id", body.room_id);

    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT /api/rooms error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ลบห้องสอบ
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room_id = searchParams.get("room_id");

    if (!room_id) {
      return NextResponse.json({ error: "room_id required" }, { status: 400 });
    }

    const { error } = await supabase.from("exam_rooms").delete().eq("room_id", room_id);
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/rooms error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
