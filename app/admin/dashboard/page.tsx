'use client'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG, SUPPORTED_COUNTRIES, formatDate, timeAgo, ATTENDANCE_CONFIG } from '@/lib/utils'
import { Users, UserCog, TrendingUp, CheckCircle, Globe, Activity, ArrowRight, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { todayStr } from '@/lib/utils'

const DARK_TOOLTIP = { contentStyle: { background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 } }

export default function AdminDashboard() {
  const { students, consultantProfiles, applications, attendance, users } = useStore()

  const activeConsultants = consultantProfiles.filter(c => c.status === 'active')
  const totalApps = applications.length
  const accepted = applications.filter(a => a.status === 'accepted').length
  const acceptRate = totalApps > 0 ? Math.round(accepted / totalApps * 100) : 0

  // Students per country
  const countryData = SUPPORTED_COUNTRIES.map(c => ({
    name: c.key,
    flag: c.flag,
    count: students.filter(s => s.selectedCountry === c.key).length,
  })).filter(d => d.count > 0)

  // Workload per consultant
  const workloadData = activeConsultants.map(cp => ({
    name: cp.name.split(' ')[0],
    students: students.filter(s => s.consultantId === cp.userId).length,
    accepted: applications.filter(a =>
      students.find(s => s.id === a.studentId && s.consultantId === cp.userId) && a.status === 'accepted'
    ).length,
    score: cp.performanceScore || 0,
  }))

  // Today's attendance
  const today = todayStr()
  const todayAtt = attendance.filter(a => a.date === today)
  const presentToday = todayAtt.filter(a => a.status === 'present').length
  const absentToday = todayAtt.filter(a => a.status === 'absent').length
  const lateToday = todayAtt.filter(a => a.status === 'late').length

  // Status pie
  const statusPie = Object.entries(STATUS_CONFIG)
    .map(([k, v]) => ({ name: v.label, value: applications.filter(a => a.status === k).length }))
    .filter(d => d.value > 0)

  const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6b7280']

  // Recent activity
  const recentStudents = [...students].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Command Center</span>
        </div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Full system overview · Real-time data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', delta: `${students.filter(s => s.status === 'active').length} active` },
          { label: 'Active Consultants', value: activeConsultants.length, icon: UserCog, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', delta: `${consultantProfiles.length} total` },
          { label: 'Applications', value: totalApps, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', delta: `${applications.filter(a => a.status === 'under_review').length} under review` },
          { label: 'Acceptance Rate', value: `${acceptRate}%`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', delta: `${accepted} accepted` },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <Activity className="w-3.5 h-3.5 text-white/20" />
            </div>
            <div className={`text-3xl font-black ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-white/60 text-xs font-semibold">{s.label}</div>
            <div className="text-white/30 text-[10px] mt-0.5">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Workload chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white">Consultant Workload</h2>
              <p className="text-xs text-white/30 mt-0.5">Students per consultant · performance score</p>
            </div>
            <Link href="/admin/consultants" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData.length > 0 ? workloadData : [{ name: 'No data', students: 0, accepted: 0, score: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...DARK_TOOLTIP} />
              <Bar dataKey="students" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance today */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Today's Attendance</h2>
            <Link href="/admin/attendance" className="text-xs text-amber-400 hover:text-amber-300">View all</Link>
          </div>
          <div className="space-y-3 mb-4">
            {[
              { label: 'Present', count: presentToday, color: 'text-emerald-400', bar: 'bg-emerald-500' },
              { label: 'Late', count: lateToday, color: 'text-amber-400', bar: 'bg-amber-500' },
              { label: 'Absent', count: absentToday, color: 'text-red-400', bar: 'bg-red-500' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/50">{s.label}</span>
                  <span className={`text-xs font-bold ${s.color}`}>{s.count}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${s.bar} rounded-full`}
                    style={{ width: `${activeConsultants.length > 0 ? (s.count / activeConsultants.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          {todayAtt.length === 0 && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400 text-center">No attendance marked today</p>
            </div>
          )}
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/20 text-center">{activeConsultants.length} consultants total</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Students by country */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Students by Country</h2>
            <Globe className="w-4 h-4 text-white/20" />
          </div>
          <div className="space-y-3">
            {SUPPORTED_COUNTRIES.map(c => {
              const count = students.filter(s => s.selectedCountry === c.key).length
              const pct = students.length > 0 ? Math.round(count / students.length * 100) : 0
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{c.flag} {c.key}</span>
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Application status pie */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
          <h2 className="font-bold text-white mb-4">Application Pipeline</h2>
          {statusPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusPie.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-[11px] text-white/50">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="py-8 text-center text-white/20 text-sm">No data</div>}
        </div>

        {/* Recent students */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Recent Students</h2>
            <Link href="/admin/students" className="text-xs text-amber-400 hover:text-amber-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentStudents.map(s => {
              const cp = consultantProfiles.find(c => c.userId === s.consultantId)
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{s.selectedCountry} · {cp?.name.split(' ')[0] || 'Unassigned'}</p>
                  </div>
                  <span className="text-[10px] text-white/20">{timeAgo(s.createdAt)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
