'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { formatDate, STATUS_CONFIG } from '@/lib/utils'
import { Student } from '@/lib/types'
import { Plus, Search, Users, ExternalLink, Edit3, X, ChevronRight, GraduationCap, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const COUNTRIES = ['UK', 'USA', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Sweden', 'France', 'Ireland', 'New Zealand']
const INTAKES = ['September 2025', 'January 2026', 'September 2026', 'January 2027']
const LEVELS = ['Bachelors', 'Masters', 'MBA', 'PhD', 'Diploma']

function AddStudentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { currentUser, addStudent, register } = useStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', nationality: 'Pakistani',
    targetCountries: ['UK'] as string[],
    intendedProgram: '', targetIntake: 'September 2025',
    educationLevel: 'Bachelors', gpa: '', englishScore: '', notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string | string[]) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const toggleCountry = (c: string) => {
    const current = form.targetCountries
    if (current.includes(c)) {
      if (current.length === 1) return
      set('targetCountries', current.filter(x => x !== c))
    } else {
      set('targetCountries', [...current, c])
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.intendedProgram.trim()) e.intendedProgram = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !currentUser) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    // Create user account for student
    const userResult = register({
      name: form.name, email: form.email, phone: form.phone,
      password: 'mentora@123', role: 'student',
    })

    const userId = userResult.success && userResult.user ? userResult.user.id : `u-${Date.now()}`

    addStudent({
      userId,
      consultantId: currentUser.id,
      name: form.name, email: form.email, phone: form.phone,
      nationality: form.nationality,
      targetCountries: form.targetCountries,
      intendedProgram: form.intendedProgram,
      targetIntake: form.targetIntake,
      educationLevel: form.educationLevel,
      gpa: form.gpa, englishScore: form.englishScore, notes: form.notes,
      status: 'active',
      selectedCountry: form.targetCountries[0] as import('@/lib/types').SupportedCountry | undefined,
      onboardingComplete: true,
    })
    toast.success(`${form.name} has been added! Login: ${form.email} / mentora@123`)
    setLoading(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900">Add New Student</h2>
            <p className="text-xs text-gray-400 mt-0.5">Student will receive login credentials</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Personal info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Muhammad Ali" className={`input ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@email.com" className={`input ${errors.email ? 'border-red-400' : ''}`} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92-300-0000000" className={`input ${errors.phone ? 'border-red-400' : ''}`} />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality</label>
                <input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Pakistani" className="input" />
              </div>
            </div>
          </div>

          {/* Academic info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Profile</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Intended Program *</label>
                <input value={form.intendedProgram} onChange={e => set('intendedProgram', e.target.value)} placeholder="MSc Computer Science" className={`input ${errors.intendedProgram ? 'border-red-400' : ''}`} />
                {errors.intendedProgram && <p className="mt-1 text-xs text-red-600">{errors.intendedProgram}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Education Level</label>
                <select value={form.educationLevel} onChange={e => set('educationLevel', e.target.value)} className="input">
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Intake</label>
                <select value={form.targetIntake} onChange={e => set('targetIntake', e.target.value)} className="input">
                  {INTAKES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">GPA / Percentage</label>
                <input value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="3.8/4.0 or 85%" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">English Score</label>
                <input value={form.englishScore} onChange={e => set('englishScore', e.target.value)} placeholder="IELTS 7.0 / TOEFL 100" className="input" />
              </div>
            </div>
          </div>

          {/* Target countries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => (
                <button key={c} type="button" onClick={() => toggleCountry(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${form.targetCountries.includes(c) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultant Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any special notes about this student…" className="input resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {loading ? 'Adding student…' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ConsultantStudents() {
  const searchParams = useSearchParams()
  const { currentUser, getStudentsByConsultant, applications } = useStore()
  const [showModal, setShowModal] = useState(searchParams.get('new') === '1')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  const students = currentUser ? getStudentsByConsultant(currentUser.id) : []

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.intendedProgram.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} students under your management</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, program…" className="input pl-10" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', count: students.filter(s => s.status === 'active').length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Completed', count: students.filter(s => s.status === 'completed').length, color: 'text-brand-600 bg-brand-50' },
          { label: 'Total Apps', count: applications.filter(a => students.map(s=>s.id).includes(a.studentId)).length, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 text-center`}>
            <div className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Student</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Program</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Countries</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Apps</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Added</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => {
                const sApps = applications.filter(a => a.studentId === s.id)
                const statusColor: Record<string, string> = { active: 'bg-emerald-100 text-emerald-700', inactive: 'bg-gray-100 text-gray-600', completed: 'bg-brand-100 text-brand-700', dropped: 'bg-red-100 text-red-700' }
                return (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[150px]">{s.intendedProgram}</p>
                      <p className="text-xs text-gray-400">{s.targetIntake}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {s.targetCountries.slice(0,2).map(c => (
                          <span key={c} className="badge bg-gray-100 text-gray-600 text-[10px]">{c}</span>
                        ))}
                        {s.targetCountries.length > 2 && <span className="text-xs text-gray-400">+{s.targetCountries.length-2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{sApps.length}</span>
                        {sApps.filter(a => a.status === 'accepted').length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">{sApps.filter(a => a.status === 'accepted').length} ✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-gray-400">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`badge text-xs ${statusColor[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/consultant/students/${s.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors inline-flex">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm">No students found</p>
                    <button onClick={() => setShowModal(true)} className="mt-2 text-brand-600 text-sm font-medium hover:text-brand-700">Add your first student →</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddStudentModal onClose={() => setShowModal(false)} onSaved={() => setRefreshKey(k => k+1)} />}
    </div>
  )
}
