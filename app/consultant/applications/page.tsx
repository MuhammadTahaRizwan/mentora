'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG, ApplicationStatus } from '@/lib/utils'
import { Application } from '@/lib/types'
import { formatDate, getStatusProgress } from '@/lib/utils'
import { Search, Globe, Calendar, LayoutGrid, List, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const KANBAN_COLS: { key: ApplicationStatus; label: string; color: string; dotColor: string }[] = [
  { key: 'not_started',     label: 'Not Started',     color: 'bg-gray-50 border-gray-200',    dotColor: 'bg-gray-400' },
  { key: 'in_progress',     label: 'In Progress',     color: 'bg-blue-50 border-blue-200',    dotColor: 'bg-blue-500' },
  { key: 'submitted',       label: 'Submitted',       color: 'bg-indigo-50 border-indigo-200',dotColor: 'bg-indigo-500' },
  { key: 'under_review',    label: 'Under Review',    color: 'bg-amber-50 border-amber-200',  dotColor: 'bg-amber-500' },
  { key: 'accepted',        label: 'Accepted',        color: 'bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
  { key: 'rejected',        label: 'Rejected',        color: 'bg-red-50 border-red-200',      dotColor: 'bg-red-500' },
  { key: 'visa_processing', label: 'Visa Processing', color: 'bg-purple-50 border-purple-200',dotColor: 'bg-purple-500' },
  { key: 'completed',       label: 'Completed',       color: 'bg-teal-50 border-teal-200',    dotColor: 'bg-teal-500' },
]

export default function ConsultantApplications() {
  const { currentUser, getStudentsByConsultant, applications, students, updateApplication } = useStore()
  const myStudents = currentUser ? getStudentsByConsultant(currentUser.id) : []
  const studentIds = myStudents.map(s => s.id)
  const myApps = applications.filter(a => studentIds.includes(a.studentId))
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const filtered = myApps.filter(a => {
    const s = students.find(st => st.id === a.studentId)
    return a.university.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase()) ||
      s?.name.toLowerCase().includes(search.toLowerCase()) || false
  })

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDrop = (status: ApplicationStatus) => {
    if (!draggedId) return
    updateApplication(draggedId, { status })
    toast.success(`Moved to ${STATUS_CONFIG[status].label}`)
    setDraggedId(null)
  }

  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown'

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">{myApps.length} total applications · Drag to change status</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setView('kanban')} className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications…" className="input pl-10" />
        </div>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {KANBAN_COLS.map(col => {
          const count = filtered.filter(a => a.status === col.key).length
          return (
            <div key={col.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span className="text-xs text-gray-600 font-medium">{col.label}</span>
              <span className="text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-md">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLS.map(col => {
            const colApps = filtered.filter(a => a.status === col.key)
            return (
              <div key={col.key}
                className={`flex-shrink-0 w-64 rounded-2xl border-2 ${col.color} p-3 min-h-[200px] transition-all`}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.key)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-gray-700">{col.label}</span>
                  <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map(app => {
                    const studentName = getStudentName(app.studentId)
                    return (
                      <div key={app.id}
                        draggable
                        onDragStart={() => handleDragStart(app.id)}
                        className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-bold text-gray-900 leading-tight">{app.university}</p>
                          <Globe className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1 truncate">{app.program}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] text-brand-700 font-bold">{studentName.slice(0,1)}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 truncate">{studentName}</span>
                        </div>
                        {app.deadline && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                            <Calendar className="w-3 h-3" /> {formatDate(app.deadline)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {colApps.length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-300">Drop here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Student', 'University', 'Program', 'Country', 'Status', 'Deadline', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(app => {
                const cfg = STATUS_CONFIG[app.status]
                return (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{getStudentName(app.studentId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{app.university}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{app.program}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{app.country}</td>
                    <td className="px-4 py-3">
                      <select value={app.status}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer ${cfg.bg} ${cfg.color}`}
                        onChange={e => { updateApplication(app.id, { status: e.target.value as ApplicationStatus }); toast.success('Status updated!') }}>
                        {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{app.deadline ? formatDate(app.deadline) : '—'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/consultant/students/${app.studentId}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 inline-flex">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
