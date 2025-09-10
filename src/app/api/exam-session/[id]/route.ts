/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { ExamSession, InsertExamSessionData } from '../../../../types/examTypes';

interface Context {
  params: { id: string };
}

export async function GET(request: Request, context: Context) {
  const { id } = context.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .select('*')
      .eq('session_id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data as ExamSession);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  const { id } = context.params;
  try {
    const body: InsertExamSessionData = await request.json();

    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('session_id', id)
      .select();

    if (error) throw error;
    return NextResponse.json({ message: 'อัปเดตรอบสอบสำเร็จ', data: data[0] as ExamSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const { id } = context.params;
  try {
    const { error } = await supabaseAdmin
      .from('exam_session')
      .delete()
      .eq('session_id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'ลบรอบสอบสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
