'use client'
import { useStore } from '@/lib/store'
import { STATUS_CONFIG } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#6b7280']

const MONTHLY = [
  { month: 'Aug', students: 1, apps: 2 },
  { month: 'Sep', students: 3, apps: 5 },
  { month: 'Oct', students: 5, apps: 9 },
  { month: 'Nov', students: 6, apps: 13 },
  { month: 'Dec', students: 7, apps: 16 },
  { month: 'Jan', students: 8, apps: 20 },
  { month: 'Feb', students: 9, apps: 24 },
]

const COUNTRIES = [
  { country: 'UK', apps: 8 },
  { country: 'Germany', apps: 5 },
  { country: 'Canada', apps: 4 },
  { country: 'USA', apps: 4 },
  { country: 'Australia', apps: 2 },
  { country: 'Ireland', apps: 1 },
]

export default function Analytics() {
  const { currentUser, getStudentsByConsultant, applications, students } = useStore()
  const myStudents = currentUser ? getStudentsByConsultant(currentUser.id) : []
  const studentIds = myStudents.map(s => s.id)
  const myApps = applications.filter(a => studentIds.includes(a.studentId))

  const statusData = Object.entries(STATUS_CONFIG).map(([key, val]) => ({
    name: val.label,
    value: myApps.filter(a => a.status === key).length,
  })).filter(d => d.value > 0)

  const acceptanceRate = myApps.length > 0
    ? Math.round((myApps.filter(a => a.status === 'accepted').length / myApps.length) * 100)
    : 0

  const countryData = myApps.reduce((acc, app) => {
    acc[app.country] = (acc[app.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const countryChartData = Object.entries(countryData).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Performance overview and application insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students', value: myStudents.length, delta: 'Active profiles', color: 'from-brand-500 to-brand-600' },
          { label: 'Total Applications', value: myApps.length, delta: 'Across all students', color: 'from-purple-500 to-purple-600' },
          { label: 'Acceptance Rate', value: `${acceptanceRate}%`, delta: `${myApps.filter(a => a.status === 'accepted').length} accepted`, color: 'from-emerald-500 to-emerald-600' },
          { label: 'Visa Processing', value: myApps.filter(a => a.status === 'visa_processing').length, delta: 'Students in visa stage', color: 'from-amber-500 to-amber-600' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
            <div className="text-3xl font-black mb-1">{s.value}</div>
            <div className="text-sm font-semibold opacity-90">{s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Growth chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-gray-900 mb-1">Growth Over Time</h2>
          <p className="text-xs text-gray-400 mb-5">Monthly student and application growth</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="apps" name="Applications" stroke="#6366f1" strokeWidth={2.5} fill="url(#g1)" />
              <Area type="monotone" dataKey="students" name="Students" stroke="#10b981" strokeWidth={2.5} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-1">Status Breakdown</h2>
          <p className="text-xs text-gray-400 mb-4">Current application statuses</p>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{d.value}</span>
                      <span className="text-[10px] text-gray-400">{myApps.length > 0 ? Math.round(d.value/myApps.length*100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="py-10 text-center text-gray-300 text-sm">No data</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Country breakdown */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-1">Applications by Country</h2>
          <p className="text-xs text-gray-400 mb-5">Where students are applying</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countryChartData.length > 0 ? countryChartData : COUNTRIES} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis dataKey={countryChartData.length > 0 ? 'country' : 'country'} type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey={countryChartData.length > 0 ? 'count' : 'apps'} fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student performance */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Student Performance</h2>
          <div className="space-y-3">
            {myStudents.map(s => {
              const sApps = applications.filter(a => a.studentId === s.id)
              const accepted = sApps.filter(a => a.status === 'accepted').length
              const rate = sApps.length > 0 ? Math.round(accepted / sApps.length * 100) : 0
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate">{s.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{sApps.length} apps · {accepted} ✓</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 flex-shrink-0 w-8 text-right">{rate}%</span>
                </div>
              )
            })}
            {myStudents.length === 0 && <div className="py-8 text-center text-gray-300 text-sm">No students yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
