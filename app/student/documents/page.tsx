'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { DOC_STATUS_CONFIG, DOC_TYPE_LABELS, formatDate } from '@/lib/utils'
import { DocumentType } from '@/lib/types'
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const DOC_TYPES: DocumentType[] = ['passport', 'transcript', 'cv', 'sop', 'recommendation_letter', 'financial_statement', 'language_test', 'other']

const DOC_ICONS: Record<string, string> = {
  passport: '🛂', transcript: '📄', cv: '📋', sop: '✍️',
  recommendation_letter: '📩', financial_statement: '💰', language_test: '🗣️', other: '📎',
}

export default function StudentDocuments() {
  const { currentUser, getStudentByUserId, getDocumentsByStudent, addDocument } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null
  const documents = student ? getDocumentsByStudent(student.id) : []
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'passport' as DocumentType, name: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return
    if (!form.name.trim()) { toast.error('Please enter a document name'); return }
    setUploading(true)
    await new Promise(r => setTimeout(r, 800))
    addDocument({
      studentId: student.id,
      type: form.type,
      name: form.name.endsWith('.pdf') ? form.name : form.name + '.pdf',
      fileUrl: '#',
      status: 'pending',
      size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
    })
    toast.success('Document uploaded successfully!')
    setForm({ type: 'passport', name: '' })
    setShowModal(false)
    setUploading(false)
  }

  const statusIcon = (status: string) => ({
    approved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
    pending:  <Clock className="w-4 h-4 text-amber-500" />,
    missing:  <AlertCircle className="w-4 h-4 text-gray-400" />,
  })[status]

  const uploadedTypes = new Set(documents.map(d => d.type))
  const missingTypes = DOC_TYPES.filter(t => !uploadedTypes.has(t))

  const approved = documents.filter(d => d.status === 'approved').length
  const completionPct = documents.length > 0 ? Math.round((approved / documents.length) * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 text-sm mt-1">{documents.length} uploaded · {approved} approved</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Progress */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Document Completion</span>
          <span className="text-sm font-bold text-brand-600">{completionPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex gap-4 mt-3">
          {[
            { label: 'Approved', count: approved, color: 'text-emerald-600' },
            { label: 'Pending', count: documents.filter(d => d.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Rejected', count: documents.filter(d => d.status === 'rejected').length, color: 'text-red-600' },
          ].map(s => (
            <span key={s.label} className={`text-xs ${s.color} font-medium`}>{s.count} {s.label}</span>
          ))}
        </div>
      </div>

      {/* Uploaded documents */}
      {documents.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h2>
          <div className="space-y-3">
            {documents.map(doc => {
              const cfg = DOC_STATUS_CONFIG[doc.status]
              return (
                <div key={doc.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                    {DOC_ICONS[doc.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                      {statusIcon(doc.status)}
                    </div>
                    <p className="text-xs text-gray-400">{DOC_TYPE_LABELS[doc.type]} · {doc.size} · {formatDate(doc.uploadedAt)}</p>
                    {doc.consultantNote && doc.status === 'rejected' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700"><span className="font-semibold">Consultant note:</span> {doc.consultantNote}</p>
                      </div>
                    )}
                  </div>
                  <span className={`badge ${cfg.bg} ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missing documents checklist */}
      {missingTypes.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Still Required</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {missingTypes.map(type => (
              <button key={type} onClick={() => { setForm({ type, name: DOC_TYPE_LABELS[type] }); setShowModal(true) }}
                className="card p-4 flex items-center gap-3 hover:border-brand-300 hover:shadow-md transition-all text-left group">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-brand-50">
                  {DOC_ICONS[type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{DOC_TYPE_LABELS[type]}</p>
                  <p className="text-xs text-gray-400">Click to upload</p>
                </div>
                <Upload className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Upload Document</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DocumentType }))} className="input">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Passport_Copy.pdf" className="input" />
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to select file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG up to 10MB</p>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
