/**
 * lib/db.ts — All Supabase database operations.
 * Every function is fire-and-forget safe (returns Promise, errors are caught).
 * The UI never waits on these — Zustand updates instantly, DB syncs in background.
 */
import { supabase, isSupabaseReady } from './supabase'
import type { User, Student, Application, Document, Message, Notification, ConsultantProfile, Attendance } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────
function guard() { return isSupabaseReady }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safe(fn: () => any): Promise<void> {
  if (!guard()) return
  try { await fn() } catch (e) { console.error('[DB]', e) }
}

// ── Load all data from Supabase ───────────────────────────────────────────────
export async function loadAllData() {
  if (!guard()) return null
  const [u, cp, s, a, d, m, n, att] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('consultant_profiles').select('*'),
    supabase.from('students').select('*'),
    supabase.from('applications').select('*'),
    supabase.from('documents').select('*'),
    supabase.from('messages').select('*'),
    supabase.from('notifications').select('*'),
    supabase.from('attendance').select('*'),
  ])
  if (u.error) { console.error('[DB] load error', u.error); return null }
  return {
    users:               (u.data   ?? []).map(mapUser),
    consultantProfiles:  (cp.data  ?? []).map(mapConsultantProfile),
    students:            (s.data   ?? []).map(mapStudent),
    applications:        (a.data   ?? []).map(mapApplication),
    documents:           (d.data   ?? []).map(mapDocument),
    messages:            (m.data   ?? []).map(mapMessage),
    notifications:       (n.data   ?? []).map(mapNotification),
    attendance:          (att.data ?? []).map(mapAttendance),
  }
}

// ── Upsert (insert or update) ─────────────────────────────────────────────────
export async function upsertUser(u: User) {
  await safe(() => supabase.from('users').upsert({
    id: u.id, name: u.name, email: u.email, password: u.password,
    role: u.role, phone: u.phone ?? null, created_at: u.createdAt,
  }))
}

export async function upsertConsultantProfile(cp: ConsultantProfile) {
  await safe(() => supabase.from('consultant_profiles').upsert({
    id: cp.id, user_id: cp.userId, name: cp.name, email: cp.email,
    phone: cp.phone ?? null, assigned_countries: cp.assignedCountries,
    status: cp.status, specialization: cp.specialization ?? null,
    performance_score: cp.performanceScore ?? 75,
  }))
}

export async function upsertStudent(s: Student) {
  await safe(() => supabase.from('students').upsert({
    id: s.id, user_id: s.userId,
    consultant_id: s.consultantId || null,
    name: s.name, email: s.email, phone: s.phone ?? null,
    nationality: s.nationality ?? 'Pakistani',
    passport_number: s.passportNumber ?? null,
    date_of_birth: s.dateOfBirth ?? null,
    selected_country: s.selectedCountry ?? null,
    target_countries: s.targetCountries ?? [],
    intended_program: s.intendedProgram ?? null,
    target_intake: s.targetIntake ?? null,
    education_level: s.educationLevel ?? null,
    gpa: s.gpa ?? null, english_score: s.englishScore ?? null,
    notes: s.notes ?? null, status: s.status,
    onboarding_complete: s.onboardingComplete,
    created_at: s.createdAt,
  }))
}

export async function upsertApplication(a: Application) {
  await safe(() => supabase.from('applications').upsert({
    id: a.id, student_id: a.studentId, university: a.university,
    country: a.country, program: a.program, status: a.status,
    deadline: a.deadline ?? null, decision_date: a.decisionDate ?? null,
    notes: a.notes ?? null, tuition_fee: a.tuitionFee ?? null,
    scholarship: a.scholarship ?? null,
    created_at: a.createdAt, updated_at: a.updatedAt,
  }))
}

export async function upsertDocument(d: Document) {
  await safe(() => supabase.from('documents').upsert({
    id: d.id, student_id: d.studentId, type: d.type, name: d.name,
    file_url: d.fileUrl ?? '#', status: d.status,
    consultant_note: d.consultantNote ?? null, size: d.size ?? null,
    uploaded_at: d.uploadedAt, reviewed_at: d.reviewedAt ?? null,
  }))
}

export async function upsertMessage(m: Message) {
  await safe(() => supabase.from('messages').upsert({
    id: m.id, sender_id: m.senderId, receiver_id: m.receiverId,
    content: m.content, read: m.read, timestamp: m.timestamp,
  }))
}

export async function upsertNotification(n: Notification) {
  await safe(() => supabase.from('notifications').upsert({
    id: n.id, user_id: n.userId, title: n.title, message: n.message,
    type: n.type, read: n.read, link: n.link ?? null, created_at: n.createdAt,
  }))
}

export async function upsertAttendance(a: Attendance) {
  await safe(() => supabase.from('attendance').upsert({
    id: a.id, consultant_id: a.consultantId, date: a.date,
    status: a.status, notes: a.notes ?? null, marked_at: a.markedAt,
  }))
}

export async function deleteRow(table: string, id: string) {
  await safe(() => supabase.from(table).delete().eq('id', id))
}

// ── Seed entire dataset to Supabase ──────────────────────────────────────────
export async function seedDatabase(data: {
  users: User[], consultantProfiles: ConsultantProfile[], students: Student[],
  applications: Application[], documents: Document[], messages: Message[],
  notifications: Notification[], attendance: Attendance[],
}) {
  if (!guard()) return
  await Promise.all([
    ...data.users.map(upsertUser),
    ...data.consultantProfiles.map(upsertConsultantProfile),
    ...data.students.map(upsertStudent),
    ...data.applications.map(upsertApplication),
    ...data.documents.map(upsertDocument),
    ...data.messages.map(upsertMessage),
    ...data.notifications.map(upsertNotification),
    ...data.attendance.map(upsertAttendance),
  ])
}

// ── Mappers (snake_case DB → camelCase TS) ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(r: any): User {
  return { id: r.id, name: r.name, email: r.email, password: r.password, role: r.role, phone: r.phone, createdAt: r.created_at }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapConsultantProfile(r: any): ConsultantProfile {
  return { id: r.id, userId: r.user_id, name: r.name, email: r.email, phone: r.phone, assignedCountries: r.assigned_countries ?? [], status: r.status, specialization: r.specialization, performanceScore: r.performance_score }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapStudent(r: any): Student {
  return {
    id: r.id, userId: r.user_id, consultantId: r.consultant_id ?? '',
    name: r.name, email: r.email, phone: r.phone, nationality: r.nationality,
    passportNumber: r.passport_number, dateOfBirth: r.date_of_birth,
    selectedCountry: r.selected_country, targetCountries: r.target_countries ?? [],
    intendedProgram: r.intended_program, targetIntake: r.target_intake,
    educationLevel: r.education_level, gpa: r.gpa, englishScore: r.english_score,
    notes: r.notes, status: r.status, onboardingComplete: r.onboarding_complete,
    createdAt: r.created_at,
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApplication(r: any): Application {
  return { id: r.id, studentId: r.student_id, university: r.university, country: r.country, program: r.program, status: r.status, deadline: r.deadline, decisionDate: r.decision_date, notes: r.notes, tuitionFee: r.tuition_fee, scholarship: r.scholarship, createdAt: r.created_at, updatedAt: r.updated_at }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDocument(r: any): Document {
  return { id: r.id, studentId: r.student_id, type: r.type, name: r.name, fileUrl: r.file_url, status: r.status, consultantNote: r.consultant_note, size: r.size, uploadedAt: r.uploaded_at, reviewedAt: r.reviewed_at }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMessage(r: any): Message {
  return { id: r.id, senderId: r.sender_id, receiverId: r.receiver_id, content: r.content, read: r.read, timestamp: r.timestamp }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotification(r: any): Notification {
  return { id: r.id, userId: r.user_id, title: r.title, message: r.message, type: r.type, read: r.read, link: r.link, createdAt: r.created_at }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAttendance(r: any): Attendance {
  return { id: r.id, consultantId: r.consultant_id, date: r.date, status: r.status, notes: r.notes, markedAt: r.marked_at }
}
