'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { DOC_STATUS_CONFIG, DOC_TYPE_LABELS, formatDate } from '@/lib/utils'
import { DocumentType } from '@/lib/types'
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Plus, X, File } from 'lucide-react'
import toast from 'react-hot-toast'

const DOC_TYPES: DocumentType[] = ['passport', 'transcript', 'cv', 'sop', 'recommendation_letter', 'financial_statement', 'language_test', 'other']

const DOC_ICONS: Record<string, string> = {
  passport: '🛂', transcript: '📄', cv: '📋', sop: '✍️',
  recommendation_letter: '📩', financial_statement: '💰', language_test: '🗣️', other: '📎',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function StudentDocuments() {
  const { currentUser, getStudentByUserId, getDocumentsByStudent, addDocument } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null
  const documents = student ? getDocumentsByStudent(student.id) : []

  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'passport' as DocumentType, name: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const openModal = (type?: DocumentType, name?: string) => {
    setForm({ type: type ?? 'passport', name: name ?? '' })
    setSelectedFile(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedFile(null)
    setForm({ type: 'passport', name: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  // Called when user picks a file via the file picker or drag-and-drop
  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    // Auto-fill name from filename (strip extension if user hasn't typed one)
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    setForm(f => ({ ...f, name: f.name.trim() ? f.name : baseName }))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return
    if (!selectedFile) { toast.error('Please select a file to upload'); return }
    if (!form.name.trim()) { toast.error('Please enter a document name'); return }

    setUploading(true)

    // Read file as a data URL so it can be "previewed" from the store
    const fileUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('#')
      reader.readAsDataURL(selectedFile)
    })

    addDocument({
      studentId: student.id,
      type: form.type,
      name: form.name.trim().endsWith('.pdf') || form.name.includes('.')
        ? form.name.trim()
        : form.name.trim() + '.' + (selectedFile.name.split('.').pop() ?? 'pdf'),
      fileUrl,
      status: 'pending',
      size: formatFileSize(selectedFile.size),
    })

    toast.success('Document uploaded successfully!')
    closeModal()
    setUploading(false)
  }

  const statusIcon = (status: string) => ({
    approved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    rejected:  <XCircle className="w-4 h-4 text-red-500" />,
    pending:   <Clock className="w-4 h-4 text-amber-500" />,
    missing:   <AlertCircle className="w-4 h-4 text-gray-400" />,
  })[status]

  const uploadedTypes  = new Set(documents.map(d => d.type))
  const missingTypes   = DOC_TYPES.filter(t => !uploadedTypes.has(t))
  const approved       = documents.filter(d => d.status === 'approved').length
  const completionPct  = documents.length > 0 ? Math.round((approved / documents.length) * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 text-sm mt-1">{documents.length} uploaded · {approved} approved</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Progress bar */}
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
            { label: 'Approved', count: approved,                                            color: 'text-emerald-600' },
            { label: 'Pending',  count: documents.filter(d => d.status === 'pending').length, color: 'text-amber-600' },
            { label: 'Rejected', count: documents.filter(d => d.status === 'rejected').length, color: 'text-red-600' },
          ].map(s => (
            <span key={s.label} className={`text-xs ${s.color} font-medium`}>{s.count} {s.label}</span>
          ))}
        </div>
      </div>

      {/* Uploaded documents list */}
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
              <button
                key={type}
                onClick={() => openModal(type, DOC_TYPE_LABELS[type])}
                className="card p-4 flex items-center gap-3 hover:border-brand-300 hover:shadow-md transition-all text-left group"
              >
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

      {/* ── Upload Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Upload Document</h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Document type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as DocumentType }))}
                  className="input"
                >
                  {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
                </select>
              </div>

              {/* Document name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Passport_Copy"
                  className="input"
                />
              </div>

              {/* Drop zone / file picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File</label>
                {selectedFile ? (
                  /* File selected — show preview row */
                  <div className="flex items-center gap-3 border border-brand-200 bg-brand-50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="p-1.5 rounded-lg hover:bg-brand-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? 'text-brand-500' : 'text-gray-300'}`} />
                    <p className="text-sm font-medium text-gray-600">Click to browse or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG, PNG up to 10 MB</p>
                  </div>
                )}
                {/* Hidden actual file input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="btn-primary flex-1 justify-center disabled:opacity-60"
                >
                  {uploading
                    ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Uploading…</>
                    : <><Upload className="w-4 h-4" /> Upload</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
