'use client'
import { useStore } from '@/lib/store'
import { SUPPORTED_COUNTRIES, STATUS_CONFIG, ATTENDANCE_CONFIG } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend, AreaChart, Area } from 'recharts'

const DT = { contentStyle: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: 12 } }
const COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6','#14b8a6']

const TREND = [
  { month: 'Aug', students: 1, apps: 2, accepted: 0 },
  { month: 'Sep', students: 3, apps: 5, accepted: 1 },
  { month: 'Oct', students: 5, apps: 9, accepted: 2 },
  { month: 'Nov', students: 6, apps: 13, accepted: 4 },
  { month: 'Dec', students: 7, apps: 16, accepted: 6 },
  { month: 'Jan', students: 8, apps: 20, accepted: 7 },
  { month: 'Feb', students: 9, apps: 24, accepted: 8 },
]

export default function AdminAnalytics() {
  const { students, consultantProfiles, applications, getAllAttendance } = useStore()
  const allAtt = getAllAttendance()

  const totalStudents = students.length
  const totalApps = applications.length
  const accepted = applications.filter(a => a.status === 'accepted').length
  const acceptRate = totalApps > 0 ? Math.round(accepted / totalApps * 100) : 0

  // Country distribution
  const countryData = SUPPORTED_COUNTRIES.map(c => ({
    name: c.key, flag: c.flag,
    students: students.filter(s => s.selectedCountry === c.key).length,
  }))

  // Consultant performance radar
  const performanceData = consultantProfiles.map(cp => {
    const myStudents = students.filter(s => s.consultantId === cp.userId)
    const myApps = applications.filter(a => myStudents.map(s => s.id).includes(a.studentId))
    const att = allAtt.filter(a => a.consultantId === cp.userId)
    const presentDays = att.filter(a => a.status === 'present').length
    const attRate = att.length > 0 ? Math.round(presentDays / att.length * 100) : 0
    const convRate = myApps.length > 0 ? Math.round(myApps.filter(a => a.status === 'accepted').length / myApps.length * 100) : 0
    return {
      name: cp.name.split(' ')[0],
      Students: myStudents.length,
      Applications: myApps.length,
      Accepted: myApps.filter(a => a.status === 'accepted').length,
      Attendance: attRate,
      Performance: cp.performanceScore || 0,
      Conversion: convRate,
    }
  })

  // Application status breakdown
  const statusData = Object.entries(STATUS_CONFIG)
    .map(([k, v]) => ({ name: v.label, value: applications.filter(a => a.status === k).length }))
    .filter(d => d.value > 0)

  // Attendance overall
  const totalAtt = allAtt.length
  const presentPct = totalAtt > 0 ? Math.round(allAtt.filter(a => a.status === 'present').length / totalAtt * 100) : 0
  const latePct = totalAtt > 0 ? Math.round(allAtt.filter(a => a.status === 'late').length / totalAtt * 100) : 0
  const absentPct = totalAtt > 0 ? Math.round(allAtt.filter(a => a.status === 'absent').length / totalAtt * 100) : 0

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Business Intelligence</span>
        </div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Deep insights across all operations</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: totalStudents, sub: `${students.filter(s=>s.status==='active').length} active`, color: 'text-sky-400', from: 'from-sky-500/20', border: 'border-sky-500/20' },
          { label: 'Total Applications', value: totalApps, sub: `${applications.filter(a=>['submitted','under_review'].includes(a.status)).length} in pipeline`, color: 'text-purple-400', from: 'from-purple-500/20', border: 'border-purple-500/20' },
          { label: 'Acceptance Rate', value: `${acceptRate}%`, sub: `${accepted} offers received`, color: 'text-emerald-400', from: 'from-emerald-500/20', border: 'border-emerald-500/20' },
          { label: 'Avg Attendance', value: `${presentPct}%`, sub: `${consultantProfiles.length} consultants tracked`, color: 'text-amber-400', from: 'from-amber-500/20', border: 'border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.from} to-transparent border ${s.border} rounded-2xl p-5`}>
            <div className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</div>
            <div className="text-white/60 text-xs font-semibold">{s.label}</div>
            <div className="text-white/25 text-[11px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Growth trend */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-white mb-1">Platform Growth</h2>
        <p className="text-xs text-white/30 mb-5">Students · Applications · Acceptances over time</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={TREND}>
            <defs>
              {[['g1','#6366f1'],['g2','#10b981'],['g3','#f59e0b']].map(([id,color]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...DT} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="students" name="Students" stroke="#6366f1" strokeWidth={2} fill="url(#g1)" />
            <Area type="monotone" dataKey="apps" name="Applications" stroke="#10b981" strokeWidth={2} fill="url(#g2)" />
            <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#f59e0b" strokeWidth={2} fill="url(#g3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Country bar chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">Students by Country</h2>
          <p className="text-xs text-white/30 mb-5">Distribution of student base</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...DT} />
              <Bar dataKey="students" name="Students" radius={[6,6,0,0]}>
                {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">App Status</h2>
          <p className="text-xs text-white/30 mb-4">Pipeline breakdown</p>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.slice(0,4).map((d,i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-[11px] text-white/40">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="py-10 text-center text-white/20 text-sm">No data</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Consultant performance */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">Consultant Performance</h2>
          <p className="text-xs text-white/30 mb-5">Students · Accepted · Attendance rate</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip {...DT} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Bar dataKey="Students" fill="#6366f1" radius={[0,4,4,0]} />
              <Bar dataKey="Accepted" fill="#10b981" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance heatmap summary */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1">Attendance Overview</h2>
          <p className="text-xs text-white/30 mb-5">Overall workforce attendance rates</p>
          <div className="space-y-4">
            {[
              { label: 'Present', pct: presentPct, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Late', pct: latePct, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Absent', pct: absentPct, color: 'bg-red-500', text: 'text-red-400' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-white/60 font-medium">{s.label}</span>
                  <span className={`text-sm font-black ${s.text}`}>{s.pct}%</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/5">
            <h3 className="text-sm font-bold text-white mb-3">Performance Scores</h3>
            <div className="space-y-3">
              {consultantProfiles.map(cp => (
                <div key={cp.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-[10px] font-bold">{cp.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/60">{cp.name.split(' ')[0]}</span>
                      <span className="text-xs font-bold text-amber-400">{cp.performanceScore || 0}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(cp.performanceScore || 0) >= 80 ? 'bg-emerald-500' : (cp.performanceScore || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${cp.performanceScore || 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
