/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/examTypes.ts

// Examiner (Student) Type

export type ExaminerType = {
  examinerid: number;
  sessionid?: number;
  roomid?: number;
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


// Seat Position within a room
export interface SeatPosition {
  seatNumber: number;
  gridRow: number;
  gridCol: number;
  occupied: boolean;
  examiner?: ExaminerType; // ผู้เข้าสอบ อาจจะยังไม่ได้ถูกจัดนั่ง
}

/**
 * Defines the seating pattern of an exam room.
 * - 'grid': Standard row/column layout.
 * - 'single_row', 'zigzag', 'checkerboard', 'diagonal', 'spiral', 'random': Specific predefined patterns.
 * - 'custom': Indicates a custom layout defined by `customLayout` array.
 * - 'custom_layout': (Added for consistency, though 'custom' is often used for room-specific layouts)
 */
export interface SeatPattern {
  type: 'grid' | 'single_row' | 'zigzag' | 'checkerboard' | 'diagonal' | 'spiral' | 'random' | 'custom' | 'custom_layout';
  rows: number;
  cols: number;
  customLayout?: SeatPosition[];
}

// Exam Room Definition
export interface ExamRoom {
  id: string; // UUID ของห้อง
  name: string; // ชื่อห้อง เช่น "ห้องสอบ 1"
  roomNumber: string; // รหัสห้อง เช่น "R101"
  totalSeats: number; // จำนวนที่นั่งทั้งหมดในห้อง
  seatPattern: SeatPattern; // รูปแบบการจัดที่นั่งในห้อง
  description?: string; // คำอธิบายห้องเพิ่มเติม
}

// Allocation of examinees to a specific room
export interface ExamRoomAllocation {
  [x: string]: any;
  room: ExamRoom; // ข้อมูลห้อง
  allocatedSeats: number; // จำนวนผู้เข้าสอบที่ถูกจัดนั่งในห้องนี้
  examinees: ExaminerType[]; // รายชื่อผู้เข้าสอบที่ถูกจัดนั่งในห้องนี้
  seatArrangement: SeatPosition[]; // แผนผังที่นั่งพร้อมข้อมูลผู้เข้าสอบ
}

// Main Exam Session State (for client-side management)
// This interface represents the current state of an exam session in the frontend UI.
export interface CurrentExamSessionState {
  id: string; // UUID for the session (seatpid จาก Supabase)
  name: string; // plan_name
  description?: string; // exam_room_description
  totalExaminees: number; // total_examinees
  rooms: ExamRoomAllocation[]; // arrangement_data
  createdAt: Date; // created_at (เป็น Date object ใน frontend)
  updatedAt: Date; // updated_at (เป็น Date object ใน frontend)
  seatingPattern: 'sequential' | 'random' | 'custom_layout'; // นี่คือ Type สำหรับการควบคุม UI หลัก
  roomDimensions?: { rows: number; cols: number } | null;
  exam_count: number;
  examRoomName?: string;
  examRoomDescription?: string;
}

// Type for a Saved Plan (from Supabase 'seating_plans' table)
// This interface directly maps to the structure of data retrieved from the database.
export interface SavedPlan {
  seatpid: string;
  plan_name: string;
  // แก้ไข: seating_pattern จาก DB จะมี Type ที่หลากหลายกว่าเพื่อรองรับรูปแบบที่ถูกจัดเก็บ
  seating_pattern: 'sequential' | 'random' | 'single_row' | 'zigzag' | 'checkerboard' | 'diagonal' | 'spiral' | 'custom' | 'custom_layout'; // <--- ขยาย Type ให้ครอบคลุม
  room_rows: number;
  room_cols: number;
  arrangement_data: ExamRoomAllocation[]; // ข้อมูลการจัดเรียงที่นั่ง
  user_id: string | null; // <--- แก้ไขตรงนี้: user_id สามารถเป็น string หรือ null ได้
  created_at: string; // string จาก DB
  updated_at: string | null; // <--- แก้ไขตรงนี้: สามารถเป็น null ได้ถ้ายังไม่เคยอัปเดต
  exam_count: number;
  exam_room_name?: string; // <--- ลบ | null ออก เพราะ ? ก็ครอบคลุม undefined
  exam_room_description?: string; // <--- ลบ | null ออก เพราะ ? ก็ครอบคลุม undefined
  total_examinees: number;
}

// Type for data sent to POST API when creating a new plan
// This interface defines the structure of data expected by the API endpoint for creating a new plan.
export interface InsertPlanData {
  plan_name: string;
  seating_pattern: 'sequential' | 'random' | 'custom_layout';
  room_rows: number;
  room_cols: number;
  arrangement_data: ExamRoomAllocation[];
  user_id: string | null; // <--- แก้ไขตรงนี้: user_id สามารถเป็น string หรือ null ได้
  exam_count: number;
  exam_room_name?: string;
  exam_room_description?: string;
  total_examinees: number;
}
