'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG, formatDate, getStatusProgress, APPLICATION_STATUS_ORDER } from '@/lib/utils'
import { Globe, Calendar, DollarSign, FileText, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { ApplicationStatus } from '@/lib/types'

const STATUS_STEPS = [
  { key: 'not_started',     label: 'Not Started' },
  { key: 'in_progress',     label: 'In Progress' },
  { key: 'submitted',       label: 'Submitted' },
  { key: 'under_review',    label: 'Under Review' },
  { key: 'accepted',        label: 'Decision' },
  { key: 'visa_processing', label: 'Visa' },
  { key: 'completed',       label: 'Completed' },
]

function ApplicationTimeline({ status }: { status: ApplicationStatus }) {
  const currentIdx = APPLICATION_STATUS_ORDER.indexOf(status)
  const steps = STATUS_STEPS
  const stepIdx = steps.findIndex(s => s.key === status)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i < stepIdx || (status === 'accepted' && step.key === 'accepted')
        const current = step.key === status
        const rejected = status === 'rejected'
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                rejected && current ? 'bg-red-500 text-white' :
                status === 'accepted' && step.key === 'accepted' ? 'bg-emerald-500 text-white' :
                done ? 'bg-brand-500 text-white' :
                current ? 'bg-brand-500 text-white ring-4 ring-brand-100' :
                'bg-gray-200 text-gray-400'}`}>
                {done && !current ? '✓' : i + 1}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 w-12 text-center leading-tight hidden sm:block">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-brand-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function StudentApplications() {
  const { currentUser, getStudentByUserId, getApplicationsByStudent } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null
  const applications = student ? getApplicationsByStudent(student.id) : []
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = applications.filter(a => {
    const matchSearch = a.university.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{applications.length} total applications across {new Set(applications.map(a => a.country)).size} countries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search university, program, country…" className="input pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input pl-10 pr-8 appearance-none cursor-pointer">
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length, color: 'bg-emerald-500' },
          { label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length, color: 'bg-amber-500' },
          { label: 'Submitted', count: applications.filter(a => a.status === 'submitted').length, color: 'bg-brand-500' },
          { label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1`} />
            <div className="text-xl font-black text-gray-900">{s.count}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">No applications found</div>
        )}
        {filtered.map(app => {
          const cfg = STATUS_CONFIG[app.status]
          const isExpanded = expanded === app.id
          return (
            <div key={app.id} className="card overflow-hidden hover:shadow-md transition-all">
              {/* Status strip */}
              <div className={`h-1 ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : app.status === 'visa_processing' ? 'bg-purple-500' : 'bg-brand-500'}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{app.university}</h3>
                      <p className="text-sm text-gray-500">{app.program}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{app.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4">
                  <ApplicationTimeline status={app.status} />
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {app.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {formatDate(app.deadline)}
                    </span>
                  )}
                  {app.tuitionFee && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {app.tuitionFee}
                    </span>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
                    {app.scholarship && (
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="text-emerald-600 text-xs font-semibold">🎓 Scholarship:</span>
                        <span className="text-emerald-700 text-xs">{app.scholarship}</span>
                      </div>
                    )}
                    {app.decisionDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Expected decision: <span className="font-medium text-gray-700">{formatDate(app.decisionDate)}</span>
                      </p>
                    )}
                    {app.notes && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Consultant Notes
                        </p>
                        <p className="text-xs text-gray-600">{app.notes}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400">Last updated: {formatDate(app.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
