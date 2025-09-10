/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/seating-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'; // ตรวจสอบเส้นทางให้ถูกต้อง: ขึ้นไป 4 ระดับจาก [id]/route.ts ไปยัง src/lib/supabaseAdmin.ts
import { SavedPlan, InsertPlanData } from '../../../../types/examTypes'; // ตรวจสอบเส้นทางให้ถูกต้อง

interface Context {
  params: {
    id: string; // พารามิเตอร์ ID จาก URL
  };
}

/**
 * GET - ดึงข้อมูลแผนที่นั่งตาม ID
 * @param request - Request object
 * @param context - Context object containing dynamic parameters (id)
 * @returns NextResponse with data or error
 */
export async function GET(request: Request, context: Context) {
  try {
    const { id } = context.params;
    console.log('API: Getting plan with ID:', id);

    const { data, error } = await supabaseAdmin
      .from('seating_plans')
      .select('*')
      .eq('seatpid', id)
      .single(); // คาดหวังผลลัพธ์เดียว

    if (error) {
      // ตรวจสอบ Error Code สำหรับ "ไม่พบข้อมูล" (PGRST116)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'ไม่พบแผนที่นั่งสำหรับ ID นี้' }, { status: 404 });
      }
      console.error('Supabase error fetching plan by ID:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'ไม่พบแผนที่นั่ง' }, { status: 404 });
    }

    return NextResponse.json(data as SavedPlan);
  } catch (error: any) {
    console.error('API error (GET by ID):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผน: ' + error.message }, { status: 500 });
  }
}

/**
 * POST - สร้างแผนที่นั่งใหม่ (ใช้สำหรับ ID ที่ไม่ซ้ำกัน)
 * @param request - Request object containing the new plan data
 * @param context - Context object containing dynamic parameters (id)
 * @returns NextResponse with success message and created data or error
 */
export async function POST(request: Request, context: Context) {
  try {
    const { id } = context.params; // ID จะมาจาก Path Parameter (เช่น UUID ใหม่)
    const body: InsertPlanData = await request.json();
    console.log('API: Creating plan with ID:', id, 'Data:', body);

    // ตรวจสอบว่ามี ID นี้อยู่แล้วหรือไม่ ก่อนทำการ Insert
    const { data: existingPlan, error: existingError } = await supabaseAdmin
      .from('seating_plans')
      .select('seatpid')
      .eq('seatpid', id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = No rows found (expected)
        console.error('Supabase existing plan check error:', existingError);
        return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existingPlan) {
      return NextResponse.json({ error: 'แผนที่นั่งนี้มีอยู่แล้ว' }, { status: 409 }); // Conflict
    }

    // --- ลบ Logic การตรวจสอบ user_id ออกทั้งหมด ---
    // เนื่องจากจะไม่ใช้ user_id แล้ว จึงไม่ต้องตรวจสอบกับ auth.users
    // และไม่ต้องตั้งค่า user_id เป็น null หรือค่าใดๆ
    // --- สิ้นสุดการแก้ไข ---

    const insertData = {
      seatpid: id,
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data,
      // user_id: body.user_id, // <--- ลบคอลัมน์ user_id ออกจาก insertData
      exam_count: body.exam_count,
      exam_room_name: body.exam_room_name,
      exam_room_description: body.exam_room_description,
      total_examinees: body.total_examinees,
    };

    const { data, error } = await supabaseAdmin
      .from('seating_plans')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'ไม่สามารถสร้างแผนที่นั่งได้' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'สร้างแผนที่นั่งสำเร็จ',
      data: data[0] as SavedPlan
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error (POST by ID):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างแผน: ' + error.message }, { status: 500 });
  }
}

/**
 * PUT - อัปเดตแผนที่นั่งทั้งหมด (แทนที่ข้อมูลเดิม)
 * @param request - Request object containing the full plan data
 * @param context - Context object containing dynamic parameters (id)
 * @returns NextResponse with success message and updated data or error
 */
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = context.params;
    const body: Partial<SavedPlan> = await request.json();
    console.log('API: Updating plan with ID:', id, 'Data:', body);

    // --- ลบ Logic การตรวจสอบ user_id ออกทั้งหมด ---
    // เนื่องจากจะไม่ใช้ user_id แล้ว จึงไม่ต้องตรวจสอบกับ auth.users
    // และไม่ต้องตั้งค่า user_id เป็น null หรือค่าใดๆ
    // --- สิ้นสุดการแก้ไข ---

    const updateData: Partial<SavedPlan> = {
      plan_name: body.plan_name,
      seating_pattern: body.seating_pattern,
      room_rows: body.room_rows,
      room_cols: body.room_cols,
      arrangement_data: body.arrangement_data,
      // user_id: body.user_id, // <--- ลบคอลัมน์ user_id ออกจาก updateData
      exam_count: body.exam_count,
      exam_room_name: body.exam_room_name,
      exam_room_description: body.exam_room_description,
      total_examinees: body.total_examinees,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('seating_plans')
      .update(updateData)
      .eq('seatpid', id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'ไม่พบแผนที่นั่งที่ต้องการอัปเดต' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'อัปเดตแผนที่นั่งสำเร็จ',
      data: data[0] as SavedPlan
    });
  } catch (error: any) {
    console.error('API error (PUT by ID):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตแผน: ' + error.message }, { status: 500 });
  }
}

/**
 * PATCH - อัปเดตแผนที่นั่งบางส่วน
 * @param request - Request object containing partial plan data
 * @param context - Context object containing dynamic parameters (id)
 * @returns NextResponse with success message and updated data or error
 */
export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = context.params;
    const body: Partial<SavedPlan> = await request.json();
    console.log('API: Partially updating plan with ID:', id, 'Data:', body);

    // --- ลบ Logic การตรวจสอบ user_id ออกทั้งหมด ---
    // เนื่องจากจะไม่ใช้ user_id แล้ว จึงไม่ต้องตรวจสอบกับ auth.users
    // และไม่ต้องตั้งค่า user_id เป็น null หรือค่าใดๆ
    // --- สิ้นสุดการแก้ไข ---

    const updateData: Partial<SavedPlan> = {
      ...body,
      // user_id: userIdToPatch !== undefined ? userIdToPatch : body.user_id, // <--- ลบคอลัมน์ user_id ออกจาก updateData
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('seating_plans')
      .update(updateData)
      .eq('seatpid', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'ไม่พบแผนที่นั่งที่ต้องการแก้ไข' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'แก้ไขแผนที่นั่งสำเร็จ',
      data: data[0] as SavedPlan
    });
  } catch (error: any) {
    console.error('API error (PATCH by ID):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขแผน: ' + error.message }, { status: 500 });
  }
}

/**
 * DELETE - ลบแผนที่นั่ง
 * @param request - Request object
 * @param context - Context object containing dynamic parameters (id)
 * @returns NextResponse with success message or error
 */
export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id: seatpid } = context.params;
    console.log('API: Deleting plan with seatpid:', seatpid);

    // 1. หา session_id ของแผนที่นั่งนี้
    const { data: planData, error: planError } = await supabaseAdmin
      .from('seating_plans')
      .select('session_id')
      .eq('seatpid', seatpid)
      .single();

    if (planError || !planData) {
      return NextResponse.json({ error: 'ไม่พบ session_id ของแผนนี้' }, { status: 404 });
    }

    const sessionId = planData.session_id;

    // 2. ลบ exam_session (parent) → seating_plans + seat_assignment จะโดน cascade อัตโนมัติ
    const { error: sessionError } = await supabaseAdmin
      .from('exam_session')
      .delete()
      .eq('session_id', sessionId);

    if (sessionError) {
      console.error('Supabase error (exam_session):', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'ลบ exam_session และข้อมูลทั้งหมดที่เกี่ยวข้องเรียบร้อย' });

  } catch (error: any) {
    console.error('API error (DELETE):', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบ: ' + error.message }, { status: 500 });
  }
}



