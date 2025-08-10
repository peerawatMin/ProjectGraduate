// types/index.ts

// Interface for examiner data
export interface ExaminerType {
  examinerid: number;
  idcardnumber: string;
  title: string;
  firstname: string;
  lastname: string;
  gender: string;
  phone: string;
  email: string;
  specialneeds: string;
  nationality: string;
}

// Interface for saved seating plans
// This represents the full structure of a saved plan,
// including all details that would be stored and retrieved.
export interface SavedPlan {
  seatpid: string | number; // Primary key for the saved plan
  id?: string | number; // Optional alias for the primary key, if your DB uses 'id'
  plan_name: string;
  seating_pattern: string;
  room_rows: number;
  room_cols: number;
  arrangement_data: (ExaminerType | null)[][];
  created_at: string;
  user_id?: string; // Optional: if plans are associated with users
  exam_count: number; // Number of examiners actually arranged
  exam_room_name: string;
  exam_room_description: string;
  total_examinees: number; // Total number of examinees for the exam (could be more than arrangedSeats)
}

// Interface for room dimensions
export interface RoomDimensions {
  rows: number;
  cols: number;
}

// Type for seating arrangement patterns
export type SeatingPattern =
  | 'single_row'
  | 'zigzag'
  | 'checkerboard'
  | 'diagonal'
  | 'spiral'
  | 'random';

// Interface for data to be inserted into the 'seating_plans' table
// This structure directly maps to the columns in your Supabase table.
// It should contain all fields that are mandatory for insertion.
export interface InsertPlanData {
  plan_name: string;
  seating_pattern: string;
  room_rows: number;
  room_cols: number;
  arrangement_data: (ExaminerType | null)[][];
  created_at: string;
  user_id?: string; // Optional: for user-specific plans
  exam_count: number;
  exam_room_name: string;
  exam_room_description: string;
  total_examinees: number;
}

// Interface for the payload sent to the saveArrangement service function
// This defines the exact structure of the object passed from the UI
// to your service function for saving.
export interface SaveArrangementPayload {
  seatingPattern: SeatingPattern;
  roomDimensions: RoomDimensions;
  arrangedSeats: (ExaminerType | null)[][];
  exam_count: number;
  examRoomName: string;
  examRoomDescription: string;
  totalExaminees: number;
  planName?: string; // Optional: if the user provides a specific name
}