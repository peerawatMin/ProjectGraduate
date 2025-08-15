// types/examRoom.ts
export type Seat = {
  gridRow: number;
  gridCol: number;
  seatNumber: number;
  occupied: boolean;
};

export type SeatPattern = {
  type: 'custom';
  rows: number;
  cols: number;
  customLayout: Seat[];
};

export interface ExamRoom {
  room_id: string;       // PK
  room_name: string;     // ชื่อห้อง
  room_number: string;   // หมายเลขห้อง
  totalSeats: number;    // จำนวนที่นั่ง
  seatPattern: SeatPattern;
  description?: string;
  created_at?: string;   // วันที่สร้าง
}
