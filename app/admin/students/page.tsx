'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { SUPPORTED_COUNTRIES, STATUS_CONFIG, formatDate } from '@/lib/utils'
import { SupportedCountry } from '@/lib/types'
import { Search, Filter, UserCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'

function ReassignModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const { consultantProfiles, reassignStudent, students } = useStore()
  const student = students.find(s => s.id === studentId)
  const eligible = consultantProfiles.filter(cp =>
    cp.status === 'active' && (student?.selectedCountry ? cp.assignedCountries.includes(student.selectedCountry as SupportedCountry) : true)
  )

  const handle = (consultantUserId: string) => {
    reassignStudent(studentId, consultantUserId)
    toast.success('Student reassigned successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold text-white text-sm">Reassign Student</h2>
            <p className="text-xs text-white/40 mt-0.5">{student?.name} → select new consultant</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-2">
          {eligible.length === 0 && (
            <p className="text-sm text-white/40 text-center py-4">No eligible consultants for {student?.selectedCountry}</p>
          )}
          {eligible.map(cp => {
            const load = students.filter(s => s.consultantId === cp.userId).length
            return (
              <button key={cp.id} onClick={() => handle(cp.userId)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{cp.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{cp.name}</p>
                  <p className="text-xs text-white/30">{cp.assignedCountries.join(', ')}</p>
                </div>
                <span className="text-xs text-white/30">{load} students</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AdminStudents() {
  const { students, consultantProfiles, applications } = useStore()
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [filterConsultant, setFilterConsultant] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [reassignId, setReassignId] = useState<string | null>(null)

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchCountry = filterCountry === 'all' || s.selectedCountry === filterCountry
    const matchConsultant = filterConsultant === 'all' || s.consultantId === filterConsultant
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchCountry && matchConsultant && matchStatus
  })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Global View</span>
        </div>
        <h1 className="text-2xl font-black text-white">All Students</h1>
        <p className="text-white/40 text-sm mt-1">{students.length} total students across the platform</p>
      </div>

      {/* Summary by country */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {SUPPORTED_COUNTRIES.map(c => {
          const count = students.filter(s => s.selectedCountry === c.key).length
          return (
            <button key={c.key} onClick={() => setFilterCountry(filterCountry === c.key ? 'all' : c.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium flex-shrink-0 transition-all ${filterCountry === c.key ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-gray-900 text-white/50 hover:border-white/20'}`}>
              <span>{c.flag}</span>
              <span>{c.key}</span>
              <span className={`text-xs font-black ml-1 ${filterCountry === c.key ? 'text-amber-400' : 'text-white/30'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
            className="input bg-gray-900 border-white/10 text-white placeholder:text-white/20 pl-10 focus:ring-amber-500/30 focus:border-amber-500" />
        </div>
        <select value={filterConsultant} onChange={e => setFilterConsultant(e.target.value)}
          className="input bg-gray-900 border-white/10 text-white focus:ring-amber-500/30 focus:border-amber-500 w-auto">
          <option value="all">All Consultants</option>
          {consultantProfiles.map(cp => <option key={cp.userId} value={cp.userId}>{cp.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input bg-gray-900 border-white/10 text-white focus:ring-amber-500/30 focus:border-amber-500 w-auto">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Country', 'Program', 'Consultant', 'Apps', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(s => {
                const cp = consultantProfiles.find(c => c.userId === s.consultantId)
                const cntry = SUPPORTED_COUNTRIES.find(c => c.key === s.selectedCountry)
                const sApps = applications.filter(a => a.studentId === s.id)
                const accepted = sApps.filter(a => a.status === 'accepted').length
                const statusColor = { active: 'text-emerald-400 bg-emerald-500/10', completed: 'text-sky-400 bg-sky-500/10', dropped: 'text-red-400 bg-red-500/10', inactive: 'text-gray-400 bg-gray-500/10' }
                return (
                  <tr key={s.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{s.name}</p>
                          <p className="text-[11px] text-white/30">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm">{cntry?.flag}</span>
                      <span className="text-xs text-white/60 ml-1.5">{s.selectedCountry || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/50 max-w-[150px] truncate">{s.intendedProgram}</td>
                    <td className="px-4 py-3.5">
                      {cp ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <span className="text-amber-400 text-[8px] font-bold">{cp.name.slice(0,1)}</span>
                          </div>
                          <span className="text-xs text-white/60">{cp.name.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-xs text-red-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-white">{sApps.length}</span>
                      {accepted > 0 && <span className="text-xs text-emerald-400 ml-1">· {accepted}✓</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusColor[s.status] || 'text-gray-400 bg-gray-500/10'}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-white/30">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setReassignId(s.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/40 hover:border-amber-500/40 hover:text-amber-400 transition-colors text-[11px] font-medium">
                        <UserCheck className="w-3 h-3" /> Reassign
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-white/20 text-sm">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reassignId && <ReassignModal studentId={reassignId} onClose={() => setReassignId(null)} />}
    </div>
  )
}
