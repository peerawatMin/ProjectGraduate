/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// บังคับให้รันบน Node runtime (จำเป็นกับ Service Role)
export const runtime = "nodejs";

type Params = { id: string };

// ✅ GET: อ่านแผนตาม id
export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .select("*")
      .eq("seatpid", params.id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// ✅ POST: สร้างใหม่ด้วย seatpid = [id]
export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const body = await req.json();

    const insertData = {
      seatpid: params.id,
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data ?? [],
      user_id: body.user_id ?? null,
      session_id: body.session_id ?? null, // ใส่ถ้าตารางมีคอลัมน์นี้
      exam_count: body.exam_count ?? 0,
      exam_room_name: body.exam_room_name ?? null,
      exam_room_description: body.exam_room_description ?? null,
      total_examinees: body.total_examinees ?? 0,
      examDate: body.examDate ?? null,
      examShift: body.examShift ?? null,
      examStartTime: body.examStartTime ?? null,
      examEndTime: body.examEndTime ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .insert([insertData])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ message: "created", data: data?.[0] }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// ✅ PUT: อัปเดตทั้งแผน
export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const body = await req.json();

    const update = {
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data,
      user_id: body.user_id ?? null,
      session_id: body.session_id ?? null,
      exam_count: body.exam_count ?? 0,
      exam_room_name: body.exam_room_name ?? null,
      exam_room_description: body.exam_room_description ?? null,
      total_examinees: body.total_examinees ?? 0,
      examDate: body.examDate ?? null,
      examShift: body.examShift ?? null,
      examStartTime: body.examStartTime ?? null,
      examEndTime: body.examEndTime ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .update(update)
      .eq("seatpid", params.id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "updated", data: data[0] });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

// ✅ DELETE: ลบ
export async function DELETE(_req: Request, { params }: { params: Params }) {
  try {
    const { error } = await supabaseAdmin
      .from("seating_plans")
      .delete()
      .eq("seatpid", params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ message: "deleted" });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
