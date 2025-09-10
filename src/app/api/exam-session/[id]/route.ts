/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import type { ExamSession, InsertExamSessionData } from "../../../../types/examTypes";

// เลือกใช้ตามต้องการ
export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

type ParamShape = { id: string };

// GET /api/exam-session/[id]
export async function GET(
  _req: Request,
  context: { params: Promise<ParamShape> }
) {
  const { id } = await context.params;

  try {
    const { data, error } = await supabaseAdmin
      .from("exam_session")
      .select("*")
      .eq("session_id", id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(data as ExamSession);
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

// PUT /api/exam-session/[id]
export async function PUT(
  req: Request,
  context: { params: Promise<ParamShape> }
) {
  const { id } = await context.params;

  try {
    const body: InsertExamSessionData = await req.json();

    const { data, error } = await supabaseAdmin
      .from("exam_session")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("session_id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return NextResponse.json({ error: "Update failed or not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "อัปเดตรอบสอบสำเร็จ",
      data: data[0] as ExamSession,
    });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

// DELETE /api/exam-session/[id]
export async function DELETE(
  _req: Request,
  context: { params: Promise<ParamShape> }
) {
  const { id } = await context.params;

  try {
    const { error } = await supabaseAdmin
      .from("exam_session")
      .delete()
      .eq("session_id", id);

    if (error) throw error;

    return NextResponse.json({ message: "ลบรอบสอบสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}
