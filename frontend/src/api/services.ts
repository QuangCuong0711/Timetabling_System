import API from './client';
import type { Room, Lecturer, Semester, ClassSection, SolveResult } from '../types';

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    API.post('/auth/login', { username, password }).then((r) => r.data),
  me: () => API.get('/auth/me').then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────
export const userApi = {
  list: () => API.get('/users').then((r) => r.data),
  create: (data: any) => API.post('/users', data).then((r) => r.data),
};

// ── Rooms ─────────────────────────────────────────────────────
export const roomApi = {
  list: () => API.get('/rooms').then((r) => r.data as Room[]),
  create: (data: Partial<Room>) => API.post('/rooms', data).then((r) => r.data),
  update: (id: number, data: Partial<Room>) => API.put(`/rooms/${id}`, data).then((r) => r.data),
  remove: (id: number) => API.delete(`/rooms/${id}`).then((r) => r.data),
};

// ── Lecturers ─────────────────────────────────────────────────
export const lecturerApi = {
  list: () => API.get('/lecturers').then((r) => r.data as Lecturer[]),
  create: (data: Partial<Lecturer>) => API.post('/lecturers', data).then((r) => r.data),
  update: (id: number, data: Partial<Lecturer>) =>
    API.put(`/lecturers/${id}`, data).then((r) => r.data),
  remove: (id: number) => API.delete(`/lecturers/${id}`).then((r) => r.data),

  // Busy slots
  getBusy: (lecturer_id: number) =>
    API.get('/lecturers/busy', { params: { lecturer_id } }).then((r) => r.data),
  addBusy: (data: any) => API.post('/lecturers/busy', data).then((r) => r.data),

  // Preferences
  getPreference: (lecturer_id: number) =>
    API.get('/lecturers/preference', { params: { lecturer_id } }).then((r) => r.data),
  addPreference: (data: any) => API.post('/lecturers/preference', data).then((r) => r.data),
};

// ── Semesters ─────────────────────────────────────────────────
export const semesterApi = {
  list: () => API.get('/semesters').then((r) => r.data as Semester[]),
  create: (data: Partial<Semester>) => API.post('/semesters', data).then((r) => r.data),
};

// ── Class Sections ────────────────────────────────────────────
export const classSectionApi = {
  list: (semester_id: string) =>
    API.get('/class-sections', { params: { semester_id } }).then((r) => r.data as ClassSection[]),
  create: (data: Partial<ClassSection>) => API.post('/class-sections', data).then((r) => r.data),
  update: (id: string, data: Partial<ClassSection>) =>
    API.put(`/class-sections/${id}`, data).then((r) => r.data),
  remove: (id: string) => API.delete(`/class-sections/${id}`).then((r) => r.data),
};

// ── Schedule ──────────────────────────────────────────────────
export const scheduleApi = {
  solve: (semester_id: string) =>
    API.post(`/schedule/solve/${semester_id}`).then((r) => r.data as SolveResult),
  save: (semester_id: string, timetable: any[]) =>
    API.post('/schedule/save', { semester_id, timetable }).then((r) => r.data),
  get: (semester_id: string) =>
    API.get('/schedule', { params: { semester_id } }).then((r) => r.data),
  getByLecturer: (semester_id: string, lecturer_id: string) =>
    API.get(`/schedule/lecturer/${lecturer_id}`, { params: { semester_id } }).then((r) => r.data),
  conflicts: (semester_id: string) =>
    API.get('/schedule/conflicts', { params: { semester_id } }).then((r) => r.data),
  updateEntry: (id: string, data: any) =>
    API.patch(`/schedule/entry/${id}`, data).then((r) => r.data),
};
