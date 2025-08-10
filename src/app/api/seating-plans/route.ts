/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/seating-plans/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin'; // ตรวจสอบเส้นทางให้ถูกต้อง
import { SavedPlan } from '../../../types/examTypes'; // ตรวจสอบเส้นทางให้ถูกต้อง

/**
 * GET - ดึงข้อมูลแผนที่นั่งทั้งหมด (หรือกรองตาม userId)
 * @param request - Request object
 * @returns NextResponse with data or error
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // ดึง userId จาก query parameter

    if (!userId) {
      // หากไม่มี userId อาจจะคืนค่า error หรือดึงข้อมูลสาธารณะ (ถ้ามี)
      // ในกรณีนี้ เราคาดหวัง userId เพื่อดึงแผนเฉพาะของผู้ใช้
      console.warn('API: GET /seating-plans called without userId. Returning 400.');
      return NextResponse.json({ error: 'User ID is required to fetch saved plans.' }, { status: 400 });
    }

    console.log('API: Getting all seating plans for userId:', userId);

    const { data, error } = await supabaseAdmin
      .from('seating_plans')
      .select('*')
      .eq('user_id', userId) // กรองข้อมูลตาม user_id
      .order('created_at', { ascending: false }); // เรียงตามเวลาสร้างล่าสุด

    if (error) {
      console.error('Supabase error fetching all plans:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Supabase จะคืนค่า JSONB เป็น Object/Array โดยตรงอยู่แล้ว
    // ดังนั้นไม่จำเป็นต้อง JSON.parse() ที่นี่
    return NextResponse.json(data as SavedPlan[]);
  } catch (error: any) {
    console.error('API error (GET all plans):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนที่นั่งทั้งหมด: ' + error.message }, { status: 500 });
  }
}

// คุณสามารถเพิ่ม POST, PUT, DELETE สำหรับการจัดการคอลเลกชันทั้งหมดที่นี่ได้
// แต่สำหรับ POST/PUT/DELETE แผนเดียว เราใช้ [id]/route.ts แล้ว
