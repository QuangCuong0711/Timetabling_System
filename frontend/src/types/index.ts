// ── Auth ──────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'TRAINING_STAFF' | 'FACILITY_STAFF' | 'LECTURER' | 'DEPARTMENT_HEAD';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ── Room ──────────────────────────────────────────────────────
export type RoomType = 'normal' | 'lab' | 'computer';

export interface Room {
  id: number;
  name: string;
  capacity: number;
  room_type: RoomType;
  is_active: boolean;
}

// ── Lecturer ──────────────────────────────────────────────────
export interface Lecturer {
  id: number;
  full_name: string;
  email?: string;
  department?: string;
  is_active: boolean;
}

export interface BusySlot {
  id: string;
  lecturer_id: number;
  day: number;
  period: number;
  reason: string;
  approved: boolean;
}

export interface PreferenceSlot {
  id: string;
  lecturer_id: number;
  day: number;
  period: number;
  is_prefer: boolean;
}

// ── Semester ──────────────────────────────────────────────────
export interface Semester {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// ── Class Section ─────────────────────────────────────────────
export interface ClassSection {
  id: string;
  semester_id: string;
  course_id: string;
  course_name: string;
  students_count: number;
  room_type: RoomType;
  sessions_per_week: number;
  credits: number;
}

// ── Timetable ─────────────────────────────────────────────────
export interface TimetableEntry {
  id: string;
  day: number;
  period: number;
  session: number;
  class_section: { id: string; course_id: string; students_count: number };
  room: { id: number; name: string; capacity: number };
  lecturer?: { id: string; full_name: string };
}

export interface Conflict {
  type: 'ROOM_CONFLICT' | 'LECTURER_CONFLICT';
  day: number;
  period: number;
  room_id?: number;
  lecturer_id?: string;
  entries: string[];
}

// ── Solver ────────────────────────────────────────────────────
export interface SolveResult {
  status: 'sat' | 'unsat' | 'timeout' | 'error';
  timetable: { course_id: string; session: number; day: number; period: number; room_id: string }[];
  cost: number;
  solve_time_ms: number;
  message: string;
}

// ── Day/Period labels ─────────────────────────────────────────
export const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

export const PERIOD_LABELS: Record<number, string> = {
  1: 'T1',
  2: 'T2',
  3: 'T3',
  4: 'T4',
  5: 'T5',
  6: 'T6',
  7: 'T7',
  8: 'T8',
  9: 'T9',
  10: 'T10',
};
