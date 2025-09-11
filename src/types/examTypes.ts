/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/examTypes.ts

// ------------------------
// Examiner (Student) Type
// ------------------------
export type ExaminerType = {
  examinerid: number;
  sessionid?: string;  // ผูกกับรอบสอบ (exam_session.session_id)
  roomid?: string;
  examinee_number:string;
  idcardnumber: string;
  title: string;
  firstname: string;
  lastname: string;
  gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
  titleeng: string;
  firstnameeng: string;
  lastnameeng: string;
  phone: string;
  email: string;
  specialneeds?: string | null;
  nationality: string;
  
};

// ------------------------
// Seat Position within a room
// ------------------------
export interface SeatPosition {
  seatNumber: number;
  gridRow: number;
  gridCol: number;
  occupied: boolean;
  examiner?: ExaminerType; // ผู้เข้าสอบ อาจจะยังไม่ได้ถูกจัดนั่ง
  
}

export interface ExamSeat {
  seat_number: number;       // ✅ ได้มาจาก seat_assignment
  examiner: ExaminerType | null; // ✅ join มาจาก examiner
  gridRow: number;               // สำหรับ layout
  gridCol: number;   
}

// ------------------------
// Seat Pattern
// ------------------------
export interface SeatPattern {
  type: 'grid' | 'custom' | 'custom_layout';
  rows: number;
  cols: number;
  customLayout?: SeatPosition[];
}

// ------------------------
// Exam Room Definition
// ------------------------
export interface ExamRoom {
  
  id: string; // UUID ของห้อง
  name: string; // ชื่อห้อง เช่น "ห้องสอบ 1"
  roomNumber: string; // รหัสห้อง เช่น "R101"
  totalSeats: number;
  seatPattern: SeatPattern;
  description?: string;
}

// ------------------------
// Allocation of examinees to a room
// ------------------------
export interface ExamRoomAllocation {
  room: ExamRoom;
  allocatedSeats: number;
  examinees: ExaminerType[];
  seatArrangement: ExamSeat[];
  
}

// ------------------------
// Current Exam Session State (frontend)
// ------------------------
export interface CurrentExamSessionState {
  id: string; // UUID for the seating plan
  sessionId: string; // UUID ของรอบสอบ
  name: string;
  description?: string;
  totalExaminees: number;
  rooms: ExamRoomAllocation[];
  createdAt: Date;
  updatedAt: Date;
  seatingPattern: 'sequential' | 'random' | 'custom_layout';
  roomDimensions?: { rows: number; cols: number } | null;
  exam_count: number;
  examRoomName?: string;
  examRoomDescription?: string | null;
  examDate?: string; // YYYY-MM-DD
  examShift?: 'morning' | 'afternoon';
  examStartTime?: string; // HH:MM
  examEndTime?: string;   // HH:MM
  exam_session?: {
    session_name: string;
    exam_date: string;
    exam_start_time: string; // แก้จาก number เป็น string
    exam_end_time: string;   // แก้จาก number เป็น string
  };
}

// ------------------------
// Saved Plan (DB)
// ------------------------
export interface SavedPlan {
  seatpid: string;
  session_id: string; // ผูกกับรอบสอบ
  plan_name: string;
  seating_pattern: 'sequential' | 'random' | 'custom_layout';
  room_rows: number;
  room_cols: number;
  arrangement_data: ExamRoomAllocation[];
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
  exam_count: number;
  exam_room_name?: string;
  exam_room_description?: string;
  total_examinees: number;
  examDate?: string;
  examShift?: 'morning' | 'afternoon';
  examStartTime?: string;
  examEndTime?: string;
  exam_session?: {
    session_name: string;
    exam_date: string;
    exam_start_time: string; // แก้จาก number เป็น string
    exam_end_time: string;   // แก้จาก number เป็น string
  };
}


// ------------------------
// Insert Plan Data (POST API)
// ------------------------
export interface InsertPlanData {
  session_id: string | null; // ต้องใส่เมื่อสร้าง plan
  plan_name: string;
  seating_pattern: 'sequential' | 'random' | 'custom_layout';
  room_rows: number;
  room_cols: number;
  arrangement_data: ExamRoomAllocation[];
  user_id: string | null;
  exam_count: number;
  exam_room_name?: string | null;
  exam_room_description?: string | null;
  total_examinees: number;
  examDate?: string | null;
  examShift?: 'morning' | 'afternoon'| null;
  examStartTime?: string | null;
  examEndTime?: string | null;
}

export interface ExamSession {
  session_id: string;
  session_name: string;
  exam_date: string; // YYYY-MM-DD
  exam_shift: 'morning' | 'afternoon';
  exam_start_time: string; // HH:MM:SS
  exam_end_time: string;   // HH:MM:SS
  description?: string;
  created_at: string;
  updated_at: string | null;
}

// สำหรับสร้างรอบสอบใหม่
export interface InsertExamSessionData {
  session_name: string;
  exam_date: string;
  exam_shift: 'morning' | 'afternoon';
  exam_start_time: string;
  exam_end_time: string;
  description?: string;
}
