// services/supabaseService.ts

import { supabase } from '../lib/supabaseClient';
import { ExaminerType, SavedPlan, InsertPlanData, SaveArrangementPayload } from '../types'; // เปลี่ยน InsertData เป็น InsertPlanData และเพิ่ม SaveArrangementPayload

// ฟังก์ชันดึงข้อมูลผู้เข้าสอบจาก Supabase
export const fetchExaminers = async (): Promise<ExaminerType[]> => {
  const { data, error } = await supabase
    .from('examiner')
    .select(`
      examinerid,
      idcardnumber,
      title,
      firstname,
      lastname,
      gender,
      phone,
      email,
      specialneeds,
      nationality
    `);

  if (error) {
    console.error('Error fetching examiners:', error.message);
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
  }

  return (data as ExaminerType[]) || [];
};

// ฟังก์ชันบันทึกการจัดที่นั่ง
// รับ payload ที่ตรงกับ SaveArrangementPayload ที่กำหนดไว้
export const saveArrangement = async (payload: SaveArrangementPayload): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();

  // สร้าง object ที่จะใช้ insert เข้าไปใน Supabase (InsertPlanData)
  const insertData: InsertPlanData = {
    // ใช้ planName จาก payload ถ้ามี หรือสร้างขึ้นมาเอง
    plan_name: payload.planName || `แผนที่นั่ง ${new Date().toLocaleString('th-TH')}`,
    seating_pattern: payload.seatingPattern,
    room_rows: payload.roomDimensions.rows,
    room_cols: payload.roomDimensions.cols,
    arrangement_data: payload.arrangedSeats,
    created_at: new Date().toISOString(),
    exam_count: payload.exam_count,
    exam_room_name: payload.examRoomName,
    exam_room_description: payload.examRoomDescription,
    total_examinees: payload.totalExaminees,
  };

  // เพิ่ม user_id ถ้ามี session
  if (session?.user?.id) {
    insertData.user_id = session.user.id;
  }

  const { error } = await supabase
    .from('seating_plans')
    .insert([insertData])
    .select();

  if (error) {
    console.error('Error saving arrangement:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาติดต่อผู้ดูแลระบบ');
    } else {
      throw new Error('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
    }
  }
};

// ฟังก์ชันดึงรายการแผนที่บันทึกไว้
export const fetchSavedPlans = async (): Promise<SavedPlan[]> => {
  const { data, error } = await supabase
    .from('seating_plans')
    .select('*') // * จะดึงทุกคอลัมน์ที่อยู่ใน SavedPlan
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching saved plans:', error.message);
    // ไม่จำเป็นต้องมี logic การลอง query ทางเลือกนี้ ถ้าโครงสร้าง DB ตรงกับ SavedPlan
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลแผน: ' + error.message);
  }

  // Cast data เป็น SavedPlan[]
  return (data as SavedPlan[]) || [];
};

// ฟังก์ชันโหลดและแก้ไขการจัดที่นั่ง
export const loadArrangement = async (planIdentifier: string | number): Promise<SavedPlan> => {
  if (!planIdentifier) {
    throw new Error('ไม่พบตัวระบุของแผนที่นั่ง');
  }

  let query = supabase.from('seating_plans').select('*');

  // ตรวจสอบว่าเป็น ID (number) หรือ plan_name (string)
  if (typeof planIdentifier === 'number' || !isNaN(Number(planIdentifier))) {
    query = query.eq('id', planIdentifier); // สมมติว่า ID ของแผนใน DB คือ 'id'
  } else {
    query = query.eq('plan_name', planIdentifier);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Error loading arrangement:', error.message);
    throw new Error('เกิดข้อผิดพลาดในการโหลด: ' + error.message);
  }

  if (!data) {
    throw new Error('ไม่พบแผนที่นั่งที่ระบุ');
  }

  return data as SavedPlan;
};