'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Student, Application, Document, Message, Notification, ConsultantProfile, Attendance, SupportedCountry, Team } from './types'
import { generateId, todayStr } from './utils'
import {
  loadAllData, seedDatabase,
  upsertUser, upsertConsultantProfile, upsertStudent,
  upsertApplication, upsertDocument, upsertMessage,
  upsertNotification, upsertAttendance, deleteRow,
} from './db'

/** Notify other browser tabs of a store change */
function broadcast() {
  try { const ch = new BroadcastChannel('mentora-sync'); ch.postMessage('update'); ch.close() } catch {}
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Zafar Iqbal',
    email: 'admin@mentora.pk',
    password: 'admin123',
    role: 'admin',
    phone: '+92-51-1234567',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'consultant-1',
    name: 'Ayesha Malik',
    email: 'consultant@mentora.pk',
    password: 'password123',
    role: 'consultant',
    phone: '+92-300-1234567',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'consultant-2',
    name: 'Hassan Raza',
    email: 'hassan@mentora.pk',
    password: 'password123',
    role: 'consultant',
    phone: '+92-321-7654321',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'consultant-3',
    name: 'Sana Butt',
    email: 'sana@mentora.pk',
    password: 'password123',
    role: 'consultant',
    phone: '+92-333-1112233',
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'student-user-1',
    name: 'Ali Hassan',
    email: 'student@mentora.pk',
    password: 'password123',
    role: 'student',
    phone: '+92-321-9876543',
    createdAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'student-user-2',
    name: 'Sara Ahmed',
    email: 'sara@mentora.pk',
    password: 'password123',
    role: 'student',
    phone: '+92-333-5556677',
    createdAt: new Date('2024-02-15').toISOString(),
  },
  {
    id: 'student-user-3',
    name: 'Umar Farooq',
    email: 'umar@mentora.pk',
    password: 'password123',
    role: 'student',
    phone: '+92-311-2223344',
    createdAt: new Date('2024-03-01').toISOString(),
  },
]

const SEED_CONSULTANT_PROFILES: ConsultantProfile[] = [
  {
    id: 'cp-1',
    userId: 'consultant-1',
    name: 'Ayesha Malik',
    email: 'consultant@mentora.pk',
    phone: '+92-300-1234567',
    assignedCountries: ['UK', 'Europe'],
    status: 'active',
    specialization: 'UK Universities & Scholarships',
    performanceScore: 87,
  },
  {
    id: 'cp-2',
    userId: 'consultant-2',
    name: 'Hassan Raza',
    email: 'hassan@mentora.pk',
    phone: '+92-321-7654321',
    assignedCountries: ['USA', 'Canada'],
    status: 'active',
    specialization: 'North American Graduate Programs',
    performanceScore: 92,
  },
  {
    id: 'cp-3',
    userId: 'consultant-3',
    name: 'Sana Butt',
    email: 'sana@mentora.pk',
    phone: '+92-333-1112233',
    assignedCountries: ['Australia', 'Canada'],
    status: 'active',
    specialization: 'Australia & Canada PR Pathways',
    performanceScore: 79,
  },
]

const SEED_STUDENTS: Student[] = [
  {
    id: 'student-1',
    userId: 'student-user-1',
    consultantId: 'consultant-1',
    name: 'Ali Hassan',
    email: 'student@mentora.pk',
    phone: '+92-321-9876543',
    passportNumber: 'AA1234567',
    dateOfBirth: '2000-05-15',
    nationality: 'Pakistani',
    selectedCountry: 'UK',
    targetCountries: ['UK', 'Europe'],
    intendedProgram: 'Masters in Computer Science',
    targetIntake: 'September 2025',
    educationLevel: 'Bachelors',
    gpa: '3.8/4.0',
    englishScore: 'IELTS 7.0',
    notes: 'Strong candidate. Excellent academic background.',
    createdAt: new Date('2024-02-10').toISOString(),
    status: 'active',
    onboardingComplete: true,
  },
  {
    id: 'student-2',
    userId: 'student-user-2',
    consultantId: 'consultant-2',
    name: 'Sara Ahmed',
    email: 'sara@mentora.pk',
    phone: '+92-333-5556677',
    nationality: 'Pakistani',
    selectedCountry: 'Canada',
    targetCountries: ['Canada', 'USA'],
    intendedProgram: 'MBA',
    targetIntake: 'January 2026',
    educationLevel: 'Bachelors',
    gpa: '3.5/4.0',
    englishScore: 'IELTS 6.5',
    createdAt: new Date('2024-02-15').toISOString(),
    status: 'active',
    onboardingComplete: true,
  },
  {
    id: 'student-3',
    userId: 'student-user-3',
    consultantId: 'consultant-2',
    name: 'Umar Farooq',
    email: 'umar@mentora.pk',
    phone: '+92-311-2223344',
    nationality: 'Pakistani',
    selectedCountry: 'USA',
    targetCountries: ['USA'],
    intendedProgram: 'MS Data Science',
    targetIntake: 'Fall 2025',
    educationLevel: 'Bachelors',
    gpa: '3.6/4.0',
    englishScore: 'GRE 320',
    createdAt: new Date('2024-03-01').toISOString(),
    status: 'active',
    onboardingComplete: true,
  },
]

const SEED_APPLICATIONS: Application[] = [
  { id: 'app-1', studentId: 'student-1', university: 'University of Manchester', country: 'UK', program: 'MSc Computer Science', status: 'under_review', deadline: '2025-01-31', decisionDate: '2025-03-15', notes: 'Awaiting decision.', tuitionFee: '£22,000/year', scholarship: '£2,000 merit scholarship', createdAt: new Date('2024-09-01').toISOString(), updatedAt: new Date('2024-11-20').toISOString() },
  { id: 'app-2', studentId: 'student-1', university: 'TU Munich', country: 'Germany', program: 'M.Sc. Computer Science', status: 'submitted', deadline: '2025-01-15', decisionDate: '2025-04-01', notes: 'No tuition fee.', tuitionFee: 'Free', createdAt: new Date('2024-09-15').toISOString(), updatedAt: new Date('2024-12-01').toISOString() },
  { id: 'app-3', studentId: 'student-1', university: 'University of Edinburgh', country: 'UK', program: 'MSc Artificial Intelligence', status: 'accepted', deadline: '2024-12-01', decisionDate: '2025-02-01', notes: 'Offer received!', tuitionFee: '£24,500/year', scholarship: '£3,000 award', createdAt: new Date('2024-08-20').toISOString(), updatedAt: new Date('2025-02-01').toISOString() },
  { id: 'app-4', studentId: 'student-2', university: 'University of Toronto', country: 'Canada', program: 'MBA', status: 'in_progress', deadline: '2025-03-01', notes: 'Working on essays.', tuitionFee: 'CAD 65,000/year', createdAt: new Date('2024-10-01').toISOString(), updatedAt: new Date('2024-12-10').toISOString() },
  { id: 'app-5', studentId: 'student-3', university: 'MIT', country: 'USA', program: 'MS Data Science', status: 'rejected', deadline: '2024-12-15', notes: 'Very competitive.', tuitionFee: '$57,000/year', createdAt: new Date('2024-09-10').toISOString(), updatedAt: new Date('2025-01-10').toISOString() },
  { id: 'app-6', studentId: 'student-3', university: 'Georgia Tech', country: 'USA', program: 'MS Analytics', status: 'visa_processing', deadline: '2025-01-01', notes: 'Visa processing.', tuitionFee: '$30,000/year', createdAt: new Date('2024-09-20').toISOString(), updatedAt: new Date('2025-02-15').toISOString() },
]

const SEED_DOCUMENTS: Document[] = [
  { id: 'd-1', studentId: 'student-1', type: 'passport', name: 'Passport_Ali.pdf', fileUrl: '#', status: 'approved', uploadedAt: new Date('2024-09-05').toISOString(), size: '2.1 MB' },
  { id: 'd-2', studentId: 'student-1', type: 'transcript', name: 'Transcript_Ali.pdf', fileUrl: '#', status: 'approved', uploadedAt: new Date('2024-09-06').toISOString(), size: '1.8 MB' },
  { id: 'd-3', studentId: 'student-1', type: 'sop', name: 'SOP_Manchester.pdf', fileUrl: '#', status: 'pending', uploadedAt: new Date('2024-10-15').toISOString(), size: '0.5 MB' },
  { id: 'd-4', studentId: 'student-1', type: 'cv', name: 'CV_Ali_Hassan.pdf', fileUrl: '#', status: 'approved', uploadedAt: new Date('2024-09-10').toISOString(), size: '0.3 MB' },
  { id: 'd-5', studentId: 'student-1', type: 'recommendation_letter', name: 'RL_Prof_Khan.pdf', fileUrl: '#', status: 'rejected', consultantNote: 'Please get a letter on official letterhead.', uploadedAt: new Date('2024-10-20').toISOString(), size: '0.4 MB' },
  { id: 'd-6', studentId: 'student-2', type: 'passport', name: 'Passport_Sara.pdf', fileUrl: '#', status: 'approved', uploadedAt: new Date('2024-10-01').toISOString(), size: '2.0 MB' },
  { id: 'd-7', studentId: 'student-2', type: 'transcript', name: 'Transcript_Sara.pdf', fileUrl: '#', status: 'pending', uploadedAt: new Date('2024-10-05').toISOString(), size: '1.5 MB' },
]

const SEED_MESSAGES: Message[] = [
  { id: 'm-1', senderId: 'consultant-1', receiverId: 'student-user-1', content: 'Hi Ali! Welcome to Mentora. I am your assigned consultant Ayesha. Let\'s schedule a call this week.', timestamp: new Date('2024-09-02T10:00:00').toISOString(), read: true },
  { id: 'm-2', senderId: 'student-user-1', receiverId: 'consultant-1', content: 'Thank you Ayesha! I\'m very excited. Available Monday or Tuesday afternoon.', timestamp: new Date('2024-09-02T11:30:00').toISOString(), read: true },
  { id: 'm-3', senderId: 'consultant-1', receiverId: 'student-user-1', content: 'Your Manchester application is now under review — looking positive!', timestamp: new Date('2024-11-20T16:00:00').toISOString(), read: false },
]

// Generate attendance seed (last 30 days for each consultant)
function generateAttendanceSeed(): Attendance[] {
  const records: Attendance[] = []
  const consultantIds = ['consultant-1', 'consultant-2', 'consultant-3']
  const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'present', 'present', 'present', 'late', 'absent', 'present', 'present', 'present', 'late']

  consultantIds.forEach(cId => {
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayOfWeek = d.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends
      const dateStr = d.toISOString().slice(0, 10)
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      records.push({
        id: `att-${cId}-${dateStr}`,
        consultantId: cId,
        date: dateStr,
        status,
        notes: status === 'absent' ? 'Sick leave' : status === 'late' ? 'Traffic delay' : undefined,
        markedAt: new Date(d.setHours(9, 0, 0)).toISOString(),
      })
    }
  })
  return records
}

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', userId: 'student-user-1', title: 'Application Update', message: 'Your University of Edinburgh application has been ACCEPTED!', type: 'success', read: false, createdAt: new Date('2025-02-01T12:00:00').toISOString(), link: '/student/applications' },
  { id: 'n-2', userId: 'student-user-1', title: 'Document Rejected', message: 'Your Recommendation Letter needs revision.', type: 'warning', read: false, createdAt: new Date('2024-10-22T09:00:00').toISOString(), link: '/student/documents' },
  { id: 'n-3', userId: 'consultant-1', title: 'New Document', message: 'Ali Hassan uploaded a new SOP.', type: 'info', read: false, createdAt: new Date('2024-10-15T14:00:00').toISOString(), link: '/consultant/students/student-1' },
]

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AppStore {
  users: User[]
  consultantProfiles: ConsultantProfile[]
  students: Student[]
  applications: Application[]
  documents: Document[]
  messages: Message[]
  notifications: Notification[]
  attendance: Attendance[]
  currentUser: User | null
  seeded: boolean

  // Auth
  login: (email: string, password: string) => { success: boolean; user?: User; error?: string }
  logout: () => void
  register: (data: Omit<User, 'id' | 'createdAt'>) => { success: boolean; user?: User; error?: string }

  // Country auto-assignment
  assignByCountry: (studentId: string, country: SupportedCountry) => { consultantId: string | null }

  // Admin: Consultants
  createConsultant: (data: { name: string; email: string; phone: string; password: string; assignedCountries: SupportedCountry[] }) => { success: boolean; error?: string }
  updateConsultantProfile: (id: string, data: Partial<ConsultantProfile>) => void
  toggleConsultantStatus: (profileId: string) => void
  deleteConsultant: (profileId: string) => void
  getConsultantProfile: (userId: string) => ConsultantProfile | undefined
  getConsultantProfileById: (profileId: string) => ConsultantProfile | undefined

  // Students
  addStudent: (data: Omit<Student, 'id' | 'createdAt'>) => Student
  updateStudent: (id: string, data: Partial<Student>) => void
  getStudentByUserId: (userId: string) => Student | undefined
  getStudentsByConsultant: (consultantId: string) => Student[]
  reassignStudent: (studentId: string, newConsultantUserId: string) => void

  // Applications
  addApplication: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Application
  updateApplication: (id: string, data: Partial<Application>) => void
  deleteApplication: (id: string) => void
  getApplicationsByStudent: (studentId: string) => Application[]

  // Documents
  addDocument: (data: Omit<Document, 'id' | 'uploadedAt'>) => Document
  updateDocument: (id: string, data: Partial<Document>) => void
  getDocumentsByStudent: (studentId: string) => Document[]

  // Messages
  sendMessage: (data: Omit<Message, 'id' | 'timestamp' | 'read'>) => Message
  markMessagesRead: (senderId: string, receiverId: string) => void
  getConversation: (userId1: string, userId2: string) => Message[]
  getUnreadCount: (userId: string) => number

  // Attendance
  markAttendance: (consultantId: string, status: 'present' | 'absent' | 'late', notes?: string) => void
  getAttendance: (consultantId: string) => Attendance[]
  getTodayAttendance: (consultantId: string) => Attendance | undefined
  getAllAttendance: () => Attendance[]

  // Notifications
  addNotification: (data: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (userId: string) => void
  getNotifications: (userId: string) => Notification[]

  // Teams
  teams: Team[]
  createTeam: (name: string, description?: string) => Team
  deleteTeam: (id: string) => void
  addConsultantToTeam: (teamId: string, consultantUserId: string) => void
  removeConsultantFromTeam: (teamId: string, consultantUserId: string) => void
  sendTeamBroadcast: (teamId: string, content: string) => void

  // Admin: update consultant password
  updateUserPassword: (userId: string, newPassword: string) => void

  // Seed
  seed: () => void

  // Supabase
  loadFromDB: () => Promise<void>
  dbLoaded: boolean
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      users: [],
      consultantProfiles: [],
      students: [],
      applications: [],
      documents: [],
      messages: [],
      notifications: [],
      attendance: [],
      teams: [],
      currentUser: null,
      seeded: false,
      dbLoaded: false,

      seed: () => {
        const { seeded } = get()
        if (seeded) return
        set({
          users: SEED_USERS,
          consultantProfiles: SEED_CONSULTANT_PROFILES,
          students: SEED_STUDENTS,
          applications: SEED_APPLICATIONS,
          documents: SEED_DOCUMENTS,
          messages: SEED_MESSAGES,
          notifications: SEED_NOTIFICATIONS,
          attendance: generateAttendanceSeed(),
          seeded: true,
        })
      },

      // ── Supabase: Load all data from DB ──────────────────────────────────
      loadFromDB: async () => {
        const data = await loadAllData()
        if (!data) {
          // Supabase not reachable — fall back to local seed
          get().seed()
          set({ dbLoaded: true })
          return
        }
        if (data.users.length > 0) {
          // DB has data — use it as source of truth
          set({
            users: data.users,
            consultantProfiles: data.consultantProfiles,
            students: data.students,
            applications: data.applications,
            documents: data.documents,
            messages: data.messages,
            notifications: data.notifications,
            attendance: data.attendance,
            seeded: true,
            dbLoaded: true,
          })
        } else {
          // DB is empty — seed locally then push seed data to Supabase
          get().seed()
          set({ dbLoaded: true })
          const s = get()
          await seedDatabase({
            users: s.users, consultantProfiles: s.consultantProfiles,
            students: s.students, applications: s.applications,
            documents: s.documents, messages: s.messages,
            notifications: s.notifications, attendance: s.attendance,
          })
        }
      },

      // ── Auth ──────────────────────────────────────────────────────────────
      login: (email, password) => {
        const { users } = get()
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { success: false, error: 'Invalid email or password' }
        set({ currentUser: user })
        return { success: true, user }
      },

      logout: () => set({ currentUser: null }),

      register: (data) => {
        const { users } = get()
        if (users.find(u => u.email === data.email)) return { success: false, error: 'Email already registered' }
        const user: User = { ...data, id: generateId(), createdAt: new Date().toISOString() }
        set(s => ({ users: [...s.users, user] }))
        void upsertUser(user)
        return { success: true, user }
      },

      // ── Country Auto-Assignment Engine ────────────────────────────────────
      assignByCountry: (studentId, country) => {
        const { consultantProfiles, students } = get()
        // Find active consultants assigned to this country
        const eligible = consultantProfiles.filter(
          cp => cp.status === 'active' && cp.assignedCountries.includes(country)
        )
        if (eligible.length === 0) return { consultantId: null }

        // Smart load balancing: prefer consultant with fewest students
        const withLoad = eligible.map(cp => ({
          cp,
          load: students.filter(s => s.consultantId === cp.userId).length,
        }))
        withLoad.sort((a, b) => a.load - b.load)
        const chosen = withLoad[0].cp

        // Link student to consultant
        set(s => ({
          students: s.students.map(st =>
            st.id === studentId
              ? { ...st, consultantId: chosen.userId, selectedCountry: country, onboardingComplete: true }
              : st
          ),
        }))

        // Notify consultant
        get().addNotification({
          userId: chosen.userId,
          title: '🎓 New Student Assigned',
          message: `A new student was auto-assigned to you for ${country}.`,
          type: 'success',
          read: false,
          link: '/consultant/students',
        })

        broadcast()
        // Sync updated student to Supabase
        const updatedStudent = get().students.find(s => s.id === studentId)
        if (updatedStudent) void upsertStudent(updatedStudent)
        return { consultantId: chosen.userId }
      },

      // ── Admin: Consultants ────────────────────────────────────────────────
      createConsultant: (data) => {
        const { users, consultantProfiles } = get()
        if (users.find(u => u.email === data.email)) return { success: false, error: 'Email already exists' }
        const userId = generateId()
        const user: User = {
          id: userId, name: data.name, email: data.email, password: data.password,
          role: 'consultant', phone: data.phone, createdAt: new Date().toISOString(),
        }
        const profile: ConsultantProfile = {
          id: generateId(), userId, name: data.name, email: data.email, phone: data.phone,
          assignedCountries: data.assignedCountries, status: 'active', performanceScore: 75,
        }
        set(s => ({ users: [...s.users, user], consultantProfiles: [...s.consultantProfiles, profile] }))
        void upsertUser(user)
        void upsertConsultantProfile(profile)
        return { success: true }
      },

      updateConsultantProfile: (id, data) => {
        set(s => ({ consultantProfiles: s.consultantProfiles.map(cp => cp.id === id ? { ...cp, ...data } : cp) }))
        const updated = get().consultantProfiles.find(cp => cp.id === id)
        if (updated) void upsertConsultantProfile(updated)
      },

      toggleConsultantStatus: (profileId) => {
        set(s => ({
          consultantProfiles: s.consultantProfiles.map(cp =>
            cp.id === profileId ? { ...cp, status: cp.status === 'active' ? 'inactive' : 'active' } : cp
          ),
        }))
        const updated = get().consultantProfiles.find(cp => cp.id === profileId)
        if (updated) void upsertConsultantProfile(updated)
      },

      deleteConsultant: (profileId) => {
        const { consultantProfiles } = get()
        const profile = consultantProfiles.find(cp => cp.id === profileId)
        if (!profile) return
        set(s => ({
          consultantProfiles: s.consultantProfiles.filter(cp => cp.id !== profileId),
          users: s.users.filter(u => u.id !== profile.userId),
        }))
        void deleteRow('consultant_profiles', profileId)
        void deleteRow('users', profile.userId)
      },

      getConsultantProfile: (userId) => get().consultantProfiles.find(cp => cp.userId === userId),

      getConsultantProfileById: (profileId) => get().consultantProfiles.find(cp => cp.id === profileId),

      // ── Students ──────────────────────────────────────────────────────────
      addStudent: (data) => {
        const student: Student = { ...data, id: generateId(), createdAt: new Date().toISOString() }
        set(s => ({ students: [...s.students, student] }))
        void upsertStudent(student)
        broadcast()
        return student
      },

      updateStudent: (id, data) => {
        set(s => ({ students: s.students.map(st => st.id === id ? { ...st, ...data } : st) }))
        const updated = get().students.find(s => s.id === id)
        if (updated) void upsertStudent(updated)
        broadcast()
      },

      getStudentByUserId: (userId) => get().students.find(s => s.userId === userId),

      getStudentsByConsultant: (consultantId) => get().students.filter(s => s.consultantId === consultantId),

      reassignStudent: (studentId, newConsultantUserId) => {
        set(s => ({
          students: s.students.map(st => st.id === studentId ? { ...st, consultantId: newConsultantUserId } : st),
        }))
        const updated = get().students.find(s => s.id === studentId)
        if (updated) void upsertStudent(updated)
      },

      // ── Applications ──────────────────────────────────────────────────────
      addApplication: (data) => {
        const app: Application = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        set(s => ({ applications: [...s.applications, app] }))
        void upsertApplication(app)
        broadcast()
        return app
      },

      updateApplication: (id, data) => {
        set(s => ({
          applications: s.applications.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a),
        }))
        const updated = get().applications.find(a => a.id === id)
        if (updated) void upsertApplication(updated)
        broadcast()
      },

      deleteApplication: (id) => {
        set(s => ({ applications: s.applications.filter(a => a.id !== id) }))
        void deleteRow('applications', id)
      },

      getApplicationsByStudent: (studentId) => get().applications.filter(a => a.studentId === studentId),

      // ── Documents ─────────────────────────────────────────────────────────
      addDocument: (data) => {
        const doc: Document = { ...data, id: generateId(), uploadedAt: new Date().toISOString() }
        set(s => ({ documents: [...s.documents, doc] }))
        void upsertDocument(doc)
        return doc
      },

      updateDocument: (id, data) => {
        set(s => ({ documents: s.documents.map(d => d.id === id ? { ...d, ...data, reviewedAt: new Date().toISOString() } : d) }))
        const updated = get().documents.find(d => d.id === id)
        if (updated) void upsertDocument(updated)
      },

      getDocumentsByStudent: (studentId) => get().documents.filter(d => d.studentId === studentId),

      // ── Messages ──────────────────────────────────────────────────────────
      sendMessage: (data) => {
        const msg: Message = { ...data, id: generateId(), timestamp: new Date().toISOString(), read: false }
        set(s => ({ messages: [...s.messages, msg] }))
        void upsertMessage(msg)
        return msg
      },

      markMessagesRead: (senderId, receiverId) => {
        set(s => ({
          messages: s.messages.map(m =>
            m.senderId === senderId && m.receiverId === receiverId ? { ...m, read: true } : m
          ),
        }))
        const affected = get().messages.filter(m => m.senderId === senderId && m.receiverId === receiverId)
        affected.forEach(m => void upsertMessage(m))
      },

      getConversation: (userId1, userId2) => {
        return get().messages
          .filter(m => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      },

      getUnreadCount: (userId) => get().messages.filter(m => m.receiverId === userId && !m.read).length,

      // ── Attendance ────────────────────────────────────────────────────────
      markAttendance: (consultantId, status, notes) => {
        const today = todayStr()
        const existing = get().attendance.find(a => a.consultantId === consultantId && a.date === today)
        if (existing) {
          const updated = { ...existing, status, notes, markedAt: new Date().toISOString() }
          set(s => ({
            attendance: s.attendance.map(a => a.id === existing.id ? updated : a),
          }))
          void upsertAttendance(updated)
        } else {
          const record: Attendance = {
            id: generateId(), consultantId, date: today, status,
            notes, markedAt: new Date().toISOString(),
          }
          set(s => ({ attendance: [...s.attendance, record] }))
          void upsertAttendance(record)
        }
      },

      getAttendance: (consultantId) => {
        return get().attendance
          .filter(a => a.consultantId === consultantId)
          .sort((a, b) => b.date.localeCompare(a.date))
      },

      getTodayAttendance: (consultantId) => {
        return get().attendance.find(a => a.consultantId === consultantId && a.date === todayStr())
      },

      getAllAttendance: () => get().attendance,

      // ── Notifications ─────────────────────────────────────────────────────
      addNotification: (data) => {
        const notif: Notification = { ...data, id: generateId(), createdAt: new Date().toISOString() }
        set(s => ({ notifications: [...s.notifications, notif] }))
        void upsertNotification(notif)
      },

      markNotificationRead: (id) => {
        set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }))
        const updated = get().notifications.find(n => n.id === id)
        if (updated) void upsertNotification(updated)
      },

      markAllNotificationsRead: (userId) => {
        set(s => ({ notifications: s.notifications.map(n => n.userId === userId ? { ...n, read: true } : n) }))
        const affected = get().notifications.filter(n => n.userId === userId)
        affected.forEach(n => void upsertNotification(n))
      },

      getNotifications: (userId) => {
        return get().notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      // ── Teams ─────────────────────────────────────────────────────────────
      createTeam: (name, description) => {
        const team: Team = { id: generateId(), name, description, consultantIds: [], createdAt: new Date().toISOString() }
        set(s => ({ teams: [...s.teams, team] }))
        return team
      },

      deleteTeam: (id) => {
        set(s => ({ teams: s.teams.filter(t => t.id !== id) }))
      },

      addConsultantToTeam: (teamId, consultantUserId) => {
        set(s => ({
          teams: s.teams.map(t => t.id === teamId && !t.consultantIds.includes(consultantUserId)
            ? { ...t, consultantIds: [...t.consultantIds, consultantUserId] }
            : t
          ),
        }))
      },

      removeConsultantFromTeam: (teamId, consultantUserId) => {
        set(s => ({
          teams: s.teams.map(t => t.id === teamId
            ? { ...t, consultantIds: t.consultantIds.filter(id => id !== consultantUserId) }
            : t
          ),
        }))
      },

      sendTeamBroadcast: (teamId, content) => {
        const { teams, currentUser } = get()
        const team = teams.find(t => t.id === teamId)
        if (!team || !currentUser) return
        team.consultantIds.forEach(consultantUserId => {
          get().sendMessage({ senderId: currentUser.id, receiverId: consultantUserId, content })
          get().addNotification({
            userId: consultantUserId,
            title: `📢 Admin Broadcast`,
            message: content.length > 80 ? content.slice(0, 80) + '…' : content,
            type: 'info',
            read: false,
            link: '/consultant/messages',
          })
        })
      },

      // ── Admin: update consultant password ─────────────────────────────────
      updateUserPassword: (userId, newPassword) => {
        set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, password: newPassword } : u) }))
        const updated = get().users.find(u => u.id === userId)
        if (updated) void upsertUser(updated)
      },
    }),
    {
      name: 'mentora-store-v2',
      // Never persist the active session — user must always log in again on a fresh page load
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { currentUser, dbLoaded, ...rest } = state
        return rest
      },
    }
  )
)
