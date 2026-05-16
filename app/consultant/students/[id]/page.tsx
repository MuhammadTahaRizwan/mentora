'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG, DOC_STATUS_CONFIG, DOC_TYPE_LABELS, formatDate, getStatusProgress } from '@/lib/utils'
import { ApplicationStatus, DocumentType } from '@/lib/types'
import { ArrowLeft, Plus, Edit3, CheckCircle, XCircle, X, Mail, Phone, Globe, GraduationCap, FileText, MessageSquare, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUSES: ApplicationStatus[] = ['not_started','in_progress','submitted','under_review','accepted','rejected','visa_processing','completed']
const COUNTRIES = ['UK','USA','Canada','Australia','Germany','Netherlands','Sweden','France','Ireland','New Zealand']

function AddAppModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const { addApplication } = useStore()
  const [form, setForm] = useState({ university: '', country: 'UK', program: '', status: 'not_started' as ApplicationStatus, deadline: '', decisionDate: '', tuitionFee: '', scholarship: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.university.trim() || !form.program.trim()) { toast.error('University and program are required'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    addApplication({ ...form, studentId })
    toast.success('Application added!')
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Add Application</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University *</label>
              <input value={form.university} onChange={e => setForm(f => ({...f, university: e.target.value}))} placeholder="University of Manchester" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} className="input">
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value as ApplicationStatus}))} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Program *</label>
              <input value={form.program} onChange={e => setForm(f => ({...f, program: e.target.value}))} placeholder="MSc Computer Science" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Decision Date</label>
              <input type="date" value={form.decisionDate} onChange={e => setForm(f => ({...f, decisionDate: e.target.value}))} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tuition Fee</label>
              <input value={form.tuitionFee} onChange={e => setForm(f => ({...f, tuitionFee: e.target.value}))} placeholder="£22,000/year" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Scholarship</label>
              <input value={form.scholarship} onChange={e => setForm(f => ({...f, scholarship: e.target.value}))} placeholder="£2,000 merit" className="input" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className="input resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-60">{loading ? 'Adding…' : 'Add Application'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { students, getApplicationsByStudent, getDocumentsByStudent, updateApplication, updateDocument, deleteApplication, sendMessage, currentUser, addNotification, users } = useStore()
  const student = students.find(s => s.id === params.id)
  const applications = student ? getApplicationsByStudent(student.id) : []
  const documents = student ? getDocumentsByStudent(student.id) : []
  const [showAddApp, setShowAddApp] = useState(false)
  const [editAppId, setEditAppId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'applications' | 'documents' | 'profile'>('applications')

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Student not found</p>
        <Link href="/consultant/students" className="text-brand-600 mt-2 inline-block">← Back to students</Link>
      </div>
    )
  }

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    updateApplication(appId, { status })
    const studentUser = users.find(u => u.id === student.userId)
    if (studentUser) {
      addNotification({
        userId: student.userId,
        title: 'Application Status Updated',
        message: `Your application status has been updated to: ${STATUS_CONFIG[status].label}`,
        type: status === 'accepted' ? 'success' : status === 'rejected' ? 'error' : 'info',
        read: false,
        link: '/student/applications',
      })
    }
    toast.success('Status updated!')
  }

  const handleDocAction = (docId: string, action: 'approved' | 'rejected', note?: string) => {
    updateDocument(docId, { status: action, consultantNote: note })
    addNotification({
      userId: student.userId,
      title: `Document ${action === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your document has been ${action}.${note ? ` Note: ${note}` : ''}`,
      type: action === 'approved' ? 'success' : 'warning',
      read: false,
      link: '/student/documents',
    })
    toast.success(`Document ${action}!`)
  }

  const handleDeleteApp = (appId: string) => {
    if (!confirm('Delete this application?')) return
    deleteApplication(appId)
    toast.success('Application deleted')
  }

  const TABS = [
    { key: 'applications', label: `Applications (${applications.length})` },
    { key: 'documents', label: `Documents (${documents.length})` },
    { key: 'profile', label: 'Profile' },
  ] as const

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">{student.name.slice(0,2).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{student.email}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{student.phone}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/consultant/messages" className="btn-secondary text-xs py-2">
            <MessageSquare className="w-3.5 h-3.5" /> Message
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Applications', value: applications.length, color: 'text-brand-600' },
          { label: 'Accepted', value: applications.filter(a => a.status === 'accepted').length, color: 'text-emerald-600' },
          { label: 'Documents', value: `${documents.filter(d => d.status === 'approved').length}/${documents.length}`, color: 'text-purple-600' },
          { label: 'GPA', value: student.gpa || '—', color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {activeTab === 'applications' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">University Applications</h2>
            <button onClick={() => setShowAddApp(true)} className="btn-primary text-sm py-2">
              <Plus className="w-3.5 h-3.5" /> Add Application
            </button>
          </div>
          <div className="space-y-4">
            {applications.map(app => {
              const cfg = STATUS_CONFIG[app.status]
              const isEditing = editAppId === app.id
              return (
                <div key={app.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{app.university}</h3>
                      <p className="text-sm text-gray-500">{app.program} · {app.country}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer ${cfg.bg} ${cfg.color}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                      <button onClick={() => handleDeleteApp(app.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-brand-500'}`}
                      style={{ width: `${getStatusProgress(app.status)}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {app.deadline && <span>Deadline: <span className="text-gray-700 font-medium">{formatDate(app.deadline)}</span></span>}
                    {app.tuitionFee && <span>Fee: <span className="text-gray-700 font-medium">{app.tuitionFee}</span></span>}
                    {app.scholarship && <span className="text-emerald-600 font-medium">🎓 {app.scholarship}</span>}
                  </div>
                  {app.notes && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">{app.notes}</p>
                  )}
                </div>
              )
            })}
            {applications.length === 0 && (
              <div className="card p-10 text-center text-gray-400">
                <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm">No applications yet</p>
                <button onClick={() => setShowAddApp(true)} className="mt-2 text-brand-600 text-sm font-medium">Add first application →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
          {documents.map(doc => {
            const cfg = DOC_STATUS_CONFIG[doc.status]
            return (
              <div key={doc.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">{DOC_TYPE_LABELS[doc.type]} · {doc.size} · {formatDate(doc.uploadedAt)}</p>
                  {doc.consultantNote && (
                    <p className="text-xs text-red-600 mt-1">Note: {doc.consultantNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  {doc.status === 'pending' && (
                    <>
                      <button onClick={() => handleDocAction(doc.id, 'approved')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                        const note = prompt('Enter rejection reason:')
                        if (note !== null) handleDocAction(doc.id, 'rejected', note)
                      }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {documents.length === 0 && (
            <div className="card p-10 text-center text-gray-400">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm">No documents uploaded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Student Profile</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { label: 'Full Name', value: student.name },
              { label: 'Email', value: student.email },
              { label: 'Phone', value: student.phone },
              { label: 'Nationality', value: student.nationality },
              { label: 'Passport Number', value: student.passportNumber || '—' },
              { label: 'Date of Birth', value: student.dateOfBirth ? formatDate(student.dateOfBirth) : '—' },
              { label: 'Education Level', value: student.educationLevel },
              { label: 'Intended Program', value: student.intendedProgram },
              { label: 'Target Intake', value: student.targetIntake },
              { label: 'GPA / Score', value: student.gpa || '—' },
              { label: 'English Test', value: student.englishScore || '—' },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-gray-400 font-medium mb-0.5">{f.label}</p>
                <p className="text-sm text-gray-900 font-medium">{f.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Target Countries</p>
              <div className="flex flex-wrap gap-1.5">
                {student.targetCountries.map(c => <span key={c} className="badge bg-brand-50 text-brand-700">{c}</span>)}
              </div>
            </div>
          </div>
          {student.notes && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-1">Consultant Notes</p>
              <p className="text-sm text-amber-800">{student.notes}</p>
            </div>
          )}
        </div>
      )}

      {showAddApp && <AddAppModal studentId={student.id} onClose={() => setShowAddApp(false)} />}
    </div>
  )
}
