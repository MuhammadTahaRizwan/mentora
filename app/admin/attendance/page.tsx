'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ATTENDANCE_CONFIG, formatDate } from '@/lib/utils'
import { CalendarCheck, ChevronLeft, ChevronRight, Download } from 'lucide-react'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AdminAttendance() {
  const { consultantProfiles, getAllAttendance } = useStore()
  const allAtt = getAllAttendance()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedConsultant, setSelectedConsultant] = useState<string>('all')

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const filteredConsultants = selectedConsultant === 'all' ? consultantProfiles : consultantProfiles.filter(cp => cp.userId === selectedConsultant)

  // Aggregate for the summary table
  const summaryRows = consultantProfiles.map(cp => {
    const cpAtt = allAtt.filter(a => a.consultantId === cp.userId && a.date.startsWith(monthStr))
    return {
      cp,
      present: cpAtt.filter(a => a.status === 'present').length,
      late: cpAtt.filter(a => a.status === 'late').length,
      absent: cpAtt.filter(a => a.status === 'absent').length,
      total: cpAtt.length,
    }
  })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">HR Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-white">Attendance Monitor</h1>
          <p className="text-white/40 text-sm mt-1">Daily attendance records for all consultants</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-white/10 text-white/60 text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-900 border border-white/10 rounded-xl p-1">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-bold text-sm px-3 min-w-[140px] text-center">{MONTH_NAMES[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <select value={selectedConsultant} onChange={e => setSelectedConsultant(e.target.value)}
          className="input bg-gray-900 border-white/10 text-white focus:ring-amber-500/30 focus:border-amber-500 w-auto">
          <option value="all">All Consultants</option>
          {consultantProfiles.map(cp => <option key={cp.userId} value={cp.userId}>{cp.name}</option>)}
        </select>
      </div>

      {/* Summary table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-bold text-white text-sm">Monthly Summary — {MONTH_NAMES[month]} {year}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Consultant', 'Countries', 'Present', 'Late', 'Absent', 'Total Days', 'Rate'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summaryRows.map(row => {
                const rate = row.total > 0 ? Math.round(((row.present + row.late * 0.5) / row.total) * 100) : 0
                return (
                  <tr key={row.cp.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{row.cp.name.slice(0,2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{row.cp.name}</p>
                          <span className={`text-[10px] font-medium ${row.cp.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>{row.cp.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/40">{row.cp.assignedCountries.join(', ')}</td>
                    <td className="px-4 py-3.5"><span className="text-sm font-bold text-emerald-400">{row.present}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-bold text-amber-400">{row.late}</span></td>
                    <td className="px-4 py-3.5"><span className="text-sm font-bold text-red-400">{row.absent}</span></td>
                    <td className="px-4 py-3.5 text-sm text-white/40">{row.total}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-16">
                          <div className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${rate}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar grids per consultant */}
      {filteredConsultants.map(cp => {
        const cpAtt = allAtt.filter(a => a.consultantId === cp.userId && a.date.startsWith(monthStr))
        const attMap: Record<string, 'present' | 'absent' | 'late'> = {}
        cpAtt.forEach(a => { attMap[a.date] = a.status })

        return (
          <div key={cp.id} className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{cp.name.slice(0,2).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{cp.name}</h3>
                <p className="text-[11px] text-white/30">{cp.assignedCountries.join(' · ')}</p>
              </div>
              <div className="ml-auto flex gap-3 text-xs">
                {['present','late','absent'].map(s => {
                  const count = cpAtt.filter(a => a.status === s).length
                  const cfg = ATTENDANCE_CONFIG[s as keyof typeof ATTENDANCE_CONFIG]
                  return (
                    <span key={s} className={`${cfg.color} font-semibold`}>{count} {cfg.label}</span>
                  )
                })}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-[10px] text-white/20 font-semibold py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
                const dayOfWeek = new Date(year, month, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const status = attMap[dateStr]
                const isToday = dateStr === new Date().toISOString().slice(0,10)
                const cfg = status ? ATTENDANCE_CONFIG[status] : null

                return (
                  <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    isWeekend ? 'text-white/10' :
                    cfg ? `${cfg.dot} text-white` :
                    'text-white/20 bg-white/2'
                  } ${isToday ? 'ring-2 ring-amber-400/60' : ''}`}
                    style={cfg ? { background: cfg.dot.replace('bg-', '').includes('emerald') ? 'rgba(16,185,129,0.15)' : cfg.dot.includes('amber') ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)' } : {}}>
                    <span className={cfg ? (cfg.dot.includes('emerald') ? 'text-emerald-400' : cfg.dot.includes('amber') ? 'text-amber-400' : 'text-red-400') : ''}>
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
              {Object.entries(ATTENDANCE_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                  <span className="text-[10px] text-white/30">{v.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-white/5 ring-1 ring-white/10" />
                <span className="text-[10px] text-white/30">No record</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
