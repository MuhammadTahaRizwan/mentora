'use client'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG, formatDate, timeAgo } from '@/lib/utils'
import { useSync } from '@/lib/useSync'
import { Users, TrendingUp, CheckCircle, ArrowRight, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
const ACTIVITY = [
  { month: 'Sep', applications: 4, students: 2 },
  { month: 'Oct', applications: 7, students: 4 },
  { month: 'Nov', applications: 12, students: 6 },
  { month: 'Dec', applications: 9, students: 5 },
  { month: 'Jan', applications: 14, students: 7 },
  { month: 'Feb', applications: 18, students: 9 },
]

export default function ConsultantDashboard() {
  // Real-time cross-tab sync — updates dashboard when students are assigned in another tab
  useSync()

  const { currentUser, getStudentsByConsultant, applications, documents, messages, users } = useStore()
  const myStudents = currentUser ? getStudentsByConsultant(currentUser.id) : []
  const studentIds = myStudents.map(s => s.id)
  const myApps = applications.filter(a => studentIds.includes(a.studentId))
  const myDocs = documents.filter(d => studentIds.includes(d.studentId))

  const stats = {
    students: myStudents.length,
    apps: myApps.length,
    accepted: myApps.filter(a => a.status === 'accepted').length,
    rejected: myApps.filter(a => a.status === 'rejected').length,
    inProgress: myApps.filter(a => ['in_progress', 'submitted', 'under_review'].includes(a.status)).length,
    pendingDocs: myDocs.filter(d => d.status === 'pending').length,
  }

  const pieData = [
    { name: 'Accepted',    value: stats.accepted, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#6366f1' },
    { name: 'Rejected',    value: stats.rejected, color: '#ef4444' },
    { name: 'Other',       value: myApps.length - stats.accepted - stats.inProgress - stats.rejected, color: '#d1d5db' },
  ].filter(d => d.value > 0)

  const recentStudents = [...myStudents].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const pendingDocs = myDocs.filter(d => d.status === 'pending').slice(0, 4)
  const unread = currentUser ? messages.filter(m => m.receiverId === currentUser.id && !m.read) : []

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {currentUser?.name.split(' ')[0]}</p>
        </div>
        <Link href="/consultant/students?new=1" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: stats.students, icon: Users, color: 'text-brand-600', bg: 'bg-brand-50', delta: '+2 this month' },
          { label: 'Applications', value: stats.apps, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', delta: `${stats.inProgress} active` },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', delta: `${stats.apps > 0 ? Math.round(stats.accepted / stats.apps * 100) : 0}% rate` },
          { label: 'Pending Docs', value: stats.pendingDocs, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', delta: 'Need review' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{s.value}</div>
            <div className="text-xs font-semibold text-gray-600">{s.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-gray-900 mb-1">Activity Overview</h2>
          <p className="text-xs text-gray-400 mb-4">Applications & student growth over 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ACTIVITY}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} fill="url(#appGrad)" name="Applications" />
              <Area type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} fill="url(#stuGrad)" name="Students" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-1">Application Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution across all students</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="py-8 text-center text-gray-300 text-sm">No data yet</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent students */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Students</h2>
            <Link href="/consultant/students" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentStudents.map(s => {
              const sApps = applications.filter(a => a.studentId === s.id)
              const latestApp = sApps.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
              return (
                <Link key={s.id} href={`/consultant/students/${s.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.intendedProgram} · {s.targetIntake}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {latestApp && <span className={`badge text-[10px] ${STATUS_CONFIG[latestApp.status].bg} ${STATUS_CONFIG[latestApp.status].color}`}>{STATUS_CONFIG[latestApp.status].label}</span>}
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(s.createdAt)}</p>
                  </div>
                </Link>
              )
            })}
            {recentStudents.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No students yet. <Link href="/consultant/students?new=1" className="text-brand-600 font-medium">Add one</Link></div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          {/* Pending docs */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Pending Documents</h3>
              <span className="badge bg-amber-100 text-amber-700">{stats.pendingDocs}</span>
            </div>
            {pendingDocs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {pendingDocs.map(d => (
                  <div key={d.id} className="px-4 py-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{d.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="p-4 text-xs text-gray-400">All documents reviewed ✓</div>}
          </div>

          {/* Unread messages */}
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Unread Messages</h3>
              <span className="badge bg-red-100 text-red-700">{unread.length}</span>
            </div>
            {unread.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {unread.slice(0, 3).map(m => {
                  const sender = users.find(u => u.id === m.senderId)
                  return (
                    <Link key={m.id} href="/consultant/messages" className="px-4 py-3 flex items-center gap-2 hover:bg-gray-50">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 text-[10px] font-bold">{sender?.name.slice(0,2).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{sender?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{m.content}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : <div className="p-4 text-xs text-gray-400">No unread messages ✓</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
