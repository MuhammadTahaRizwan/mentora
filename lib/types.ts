export type Role = 'student' | 'consultant' | 'admin'

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'visa_processing'
  | 'completed'

export type DocumentType =
  | 'passport'
  | 'transcript'
  | 'cv'
  | 'sop'
  | 'recommendation_letter'
  | 'financial_statement'
  | 'language_test'
  | 'other'

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'missing'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export type SupportedCountry = 'USA' | 'Canada' | 'Australia' | 'UK' | 'Europe'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  avatar?: string
  phone?: string
  createdAt: string
}

export interface ConsultantProfile {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  assignedCountries: SupportedCountry[]
  status: 'active' | 'inactive'
  specialization?: string
  performanceScore?: number   // 0-100
  bio?: string
}

export interface Attendance {
  id: string
  consultantId: string
  date: string              // YYYY-MM-DD
  status: AttendanceStatus
  notes?: string
  markedAt: string
}

export interface Student {
  id: string
  userId: string
  consultantId: string
  name: string
  email: string
  phone: string
  passportNumber?: string
  dateOfBirth?: string
  nationality: string
  selectedCountry?: SupportedCountry   // chosen at onboarding
  targetCountries: string[]
  intendedProgram: string
  targetIntake: string
  educationLevel: string
  gpa?: string
  englishScore?: string
  notes?: string
  createdAt: string
  status: 'active' | 'inactive' | 'completed' | 'dropped'
  onboardingComplete: boolean
}

export interface Application {
  id: string
  studentId: string
  university: string
  country: string
  program: string
  status: ApplicationStatus
  deadline?: string
  decisionDate?: string
  notes?: string
  tuitionFee?: string
  scholarship?: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  studentId: string
  type: DocumentType
  name: string
  fileUrl: string
  status: DocumentStatus
  consultantNote?: string
  uploadedAt: string
  reviewedAt?: string
  size?: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  attachmentUrl?: string
  attachmentName?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}
