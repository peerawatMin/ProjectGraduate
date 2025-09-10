/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ExamSeat } from '@/types/examTypes';

const MAX_COLS = 20; // กำหนดจำนวนคอลัมน์ใน grid ของแต่ละห้อง

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // ดึงข้อมูล seat_assignment + join examiner
    const { data, error } = await supabase
      .from('seat_assignment')
      .select(`
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
      `)
      .eq('session_id', sessionId)
      .order('seat_number', { ascending: true }); // เรียงตาม seat_number

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // map เป็น ExamSeat พร้อม gridRow/gridCol
    const seats: ExamSeat[] = (data || []).map((item: any, index: number) => ({
      seat_number: item.seat_number,
      examiner: item.examiner?.[0] || null,
      gridRow: Math.floor(index / MAX_COLS),
      gridCol: index % MAX_COLS
    }));

    return NextResponse.json(seats);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
