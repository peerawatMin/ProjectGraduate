// types/seating.ts
export interface SeatingPlan {
  seatpid: string;
  plan_name: string;
  exam_room_name: string;
  room_rows: number;
  room_cols: number;
  total_examinees: number;
  created_at: string;
  seating_pattern: string;
}

export interface RoomUsageData {
  room: string;
  usage_count: number;
  total_examinees: number;
  avg_examinees: number;
  capacity: number;
  utilization_rate: number;
}

export interface RoomSizeData {
  size: string;
  count: number;
  percentage: number;
}

export interface ChartData {
  date: string;
  count: number;
  formattedDate: string;
  cumulative: number;
}

export interface Statistics {
  totalExaminees: number;
  totalPlans: number;
  averageExaminees: number;
  peakDay: {
    formattedDate: React.ReactNode;
    date: string;
    count: number;
  } | null;
  growthRate: number;
}

export type ChartType = 'line' | 'area' | 'bar';
export type TimeRange = '7d' | '30d' | '90d' | 'all';