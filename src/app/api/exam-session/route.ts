/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { ExamSession, InsertExamSessionData } from '../../../types/examTypes';

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .select('*')
      .order('exam_date', { ascending: true })
      .order('exam_start_time', { ascending: true });

    if (error) {
      console.error('Supabase error fetching exam sessions:', error);
      throw error;
    }

    return NextResponse.json(data as ExamSession[]);
  } catch (error: any) {
    console.error('API error (GET exam sessions):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: InsertExamSessionData = await request.json();

    // Validate required fields
    if (!body.session_name?.trim()) {
      return NextResponse.json({ error: 'session_name is required' }, { status: 400 });
    }
    if (!body.exam_date) {
      return NextResponse.json({ error: 'exam_date is required' }, { status: 400 });
    }
    if (!body.exam_shift) {
      return NextResponse.json({ error: 'exam_shift is required' }, { status: 400 });
    }

    const session_id = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertData = {
      session_id,
      ...body,
      created_at: now,
      updated_at: now
    };

    console.log('Creating exam session with data:', insertData);

    const { data, error } = await supabaseAdmin
      .from('exam_session')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error creating exam session:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned after insert');
    }

    console.log('Successfully created exam session:', data[0]);

    return NextResponse.json({ 
      message: 'สร้างรอบสอบสำเร็จ', 
      data: data[0] as ExamSession 
    }, { status: 201 });

  } catch (error: any) {
    console.error('API error (POST exam session):', error);
    
    // Return more specific error messages
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json({ error: 'มีรอบสอบนี้อยู่แล้วในระบบ' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'เกิดข้อผิดพลาดในการสร้างรอบสอบ' 
    }, { status: 500 });
  }
}