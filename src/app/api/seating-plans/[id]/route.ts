/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { InsertPlanData, SavedPlan } from "@/types/examTypes";

export const runtime = "nodejs";

// GET /api/seating-plans/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .select("*")
      .eq("seatpid", id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(data as SavedPlan);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

// PUT /api/seating-plans/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body: InsertPlanData = await req.json();

    const { data, error } = await supabaseAdmin
      .from("seating_plans")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("seatpid", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return NextResponse.json({ error: "Update failed or not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "อัปเดตแผนผังสำเร็จ",
      data: data[0] as SavedPlan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

// DELETE /api/seating-plans/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { error } = await supabaseAdmin
      .from("seating_plans")
      .delete()
      .eq("seatpid", id);

    if (error) throw error;

    return NextResponse.json({ message: "ลบแผนผังสำเร็จ" });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
