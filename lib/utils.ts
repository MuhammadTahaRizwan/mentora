import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApplicationStatus, DocumentStatus, SupportedCountry } from './types'

export type { ApplicationStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-PK', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export const SUPPORTED_COUNTRIES: { key: SupportedCountry; flag: string; label: string; color: string }[] = [
  { key: 'USA',       flag: '🇺🇸', label: 'United States',  color: 'from-blue-600 to-red-600' },
  { key: 'Canada',    flag: '🇨🇦', label: 'Canada',          color: 'from-red-600 to-red-700' },
  { key: 'Australia', flag: '🇦🇺', label: 'Australia',       color: 'from-yellow-500 to-green-600' },
  { key: 'UK',        flag: '🇬🇧', label: 'United Kingdom',  color: 'from-blue-700 to-blue-900' },
  { key: 'Europe',    flag: '🇪🇺', label: 'Europe',          color: 'from-indigo-600 to-yellow-500' },
]

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  not_started:     { label: 'Not Started',     color: 'text-gray-600',   bg: 'bg-gray-100' },
  in_progress:     { label: 'In Progress',     color: 'text-blue-700',   bg: 'bg-blue-100' },
  submitted:       { label: 'Submitted',       color: 'text-indigo-700', bg: 'bg-indigo-100' },
  under_review:    { label: 'Under Review',    color: 'text-amber-700',  bg: 'bg-amber-100' },
  accepted:        { label: 'Accepted',        color: 'text-emerald-700',bg: 'bg-emerald-100' },
  rejected:        { label: 'Rejected',        color: 'text-red-700',    bg: 'bg-red-100' },
  visa_processing: { label: 'Visa Processing', color: 'text-purple-700', bg: 'bg-purple-100' },
  completed:       { label: 'Completed',       color: 'text-teal-700',   bg: 'bg-teal-100' },
}

export const DOC_STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending Review', color: 'text-amber-700',  bg: 'bg-amber-100' },
  approved: { label: 'Approved',       color: 'text-emerald-700',bg: 'bg-emerald-100' },
  rejected: { label: 'Rejected',       color: 'text-red-700',    bg: 'bg-red-100' },
  missing:  { label: 'Missing',        color: 'text-gray-600',   bg: 'bg-gray-100' },
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  passport:              'Passport Copy',
  transcript:            'Academic Transcripts',
  cv:                    'CV / Resume',
  sop:                   'Statement of Purpose',
  recommendation_letter: 'Recommendation Letter',
  financial_statement:   'Financial Statement',
  language_test:         'Language Test Score',
  other:                 'Other Document',
}

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'not_started', 'in_progress', 'submitted', 'under_review',
  'accepted', 'rejected', 'visa_processing', 'completed',
]

export function getStatusProgress(status: ApplicationStatus): number {
  const idx = APPLICATION_STATUS_ORDER.indexOf(status)
  return Math.round(((idx + 1) / APPLICATION_STATUS_ORDER.length) * 100)
}

export const ATTENDANCE_CONFIG = {
  present: { label: 'Present', color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  absent:  { label: 'Absent',  color: 'text-red-700',     bg: 'bg-red-100',     dot: 'bg-red-500' },
  late:    { label: 'Late',    color: 'text-amber-700',   bg: 'bg-amber-100',   dot: 'bg-amber-500' },
}
