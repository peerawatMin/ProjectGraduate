/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { ExamSession, InsertExamSessionData } from '../../../types/examTypes';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .select('*')
      .order('exam_date', { ascending: true })
      .order('exam_start_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data as ExamSession[]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: InsertExamSessionData = await request.json();

    const session_id = crypto.randomUUID();

    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .insert([{
        session_id,
        ...body
      }])
      .select();

    if (error) throw error;

    return NextResponse.json({ message: 'สร้างรอบสอบสำเร็จ', data: data[0] as ExamSession }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
