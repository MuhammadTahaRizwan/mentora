'use client'
import { useStore } from '@/lib/store'
import { formatDate, STATUS_CONFIG, getStatusProgress, DOC_STATUS_CONFIG } from '@/lib/utils'
import { CheckCircle2, Clock, FileText, MessageSquare, TrendingUp, Award, Globe, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { currentUser, getStudentByUserId, getApplicationsByStudent, getDocumentsByStudent, users } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null
  const applications = student ? getApplicationsByStudent(student.id) : []
  const documents = student ? getDocumentsByStudent(student.id) : []
  const consultant = student ? users.find(u => u.id === student.consultantId) : null

  const stats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    pending: applications.filter(a => ['submitted', 'under_review', 'in_progress'].includes(a.status)).length,
    completed: applications.filter(a => a.status === 'completed').length,
  }

  const pendingDocs = documents.filter(d => d.status === 'pending').length
  const rejectedDocs = documents.filter(d => d.status === 'rejected').length

  const recentApps = [...applications].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)

  if (!student) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Set Up</h2>
          <p className="text-gray-500">Your consultant hasn't set up your profile yet. Please contact your consultant.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentUser?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your study abroad progress overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total, icon: Globe, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Accepted', value: stats.accepted, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In Progress', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Documents', value: `${documents.filter(d => d.status === 'approved').length}/${documents.length}`, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color} w-5 h-5`} />
            </div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Applications</h2>
            <Link href="/student/applications" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">No applications yet</div>
          ) : recentApps.map(app => {
            const cfg = STATUS_CONFIG[app.status]
            const progress = getStatusProgress(app.status)
            return (
              <div key={app.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{app.university}</h3>
                    <p className="text-xs text-gray-500">{app.program} · {app.country}</p>
                  </div>
                  <span className={`badge ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${app.status === 'accepted' ? 'bg-emerald-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-brand-500'}`}
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {app.deadline && (
                  <p className="text-xs text-gray-400 mt-2">
                    <Clock className="inline w-3 h-3 mr-1" />Deadline: {formatDate(app.deadline)}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Consultant card */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Your Consultant</h3>
            {consultant ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{consultant.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{consultant.name}</p>
                    <p className="text-xs text-gray-500">{consultant.email}</p>
                  </div>
                </div>
                <Link href="/student/messages" className="btn-primary w-full justify-center text-xs py-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Send Message
                </Link>
              </div>
            ) : <p className="text-sm text-gray-400">No consultant assigned</p>}
          </div>

          {/* Document status */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Document Status</h3>
              <Link href="/student/documents" className="text-xs text-brand-600 hover:text-brand-700">View all</Link>
            </div>
            <div className="space-y-2">
              {documents.slice(0, 4).map(doc => {
                const cfg = DOC_STATUS_CONFIG[doc.status]
                return (
                  <div key={doc.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-600 truncate flex-1 mr-2">{doc.name}</span>
                    <span className={`badge text-[10px] ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                )
              })}
              {documents.length === 0 && <p className="text-xs text-gray-400">No documents uploaded</p>}
            </div>
            {(pendingDocs > 0 || rejectedDocs > 0) && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  {rejectedDocs > 0 && `${rejectedDocs} document(s) need attention. `}
                  {pendingDocs > 0 && `${pendingDocs} pending review.`}
                </p>
              </div>
            )}
          </div>

          {/* Target countries */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Target Countries</h3>
            <div className="flex flex-wrap gap-2">
              {student.targetCountries.map(c => (
                <span key={c} className="badge bg-brand-50 text-brand-700 border border-brand-200">{c}</span>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Program:</span> {student.intendedProgram}</p>
              <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-gray-700">Intake:</span> {student.targetIntake}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
