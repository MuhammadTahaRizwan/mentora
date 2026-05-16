'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { ATTENDANCE_CONFIG, formatDate, todayStr } from '@/lib/utils'
import { CalendarCheck, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConsultantAttendance() {
  const { currentUser, markAttendance, getAttendance, getTodayAttendance, getConsultantProfile } = useStore()
  const profile = currentUser ? getConsultantProfile(currentUser.id) : null
  const todayAtt = currentUser ? getTodayAttendance(currentUser.id) : undefined
  const history = currentUser ? getAttendance(currentUser.id) : []

  const [notes, setNotes] = useState('')
  const [marking, setMarking] = useState(false)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

  function getDays(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
  function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay() }

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthAtt = history.filter(a => a.date.startsWith(monthStr))
  const attMap: Record<string, 'present' | 'absent' | 'late'> = {}
  monthAtt.forEach(a => { attMap[a.date] = a.status })

  const handleMark = async (status: 'present' | 'absent' | 'late') => {
    if (!currentUser) return
    setMarking(true)
    await new Promise(r => setTimeout(r, 400))
    markAttendance(currentUser.id, status, notes.trim() || undefined)
    const cfg = ATTENDANCE_CONFIG[status]
    toast.success(`Attendance marked: ${cfg.label}`)
    setNotes('')
    setMarking(false)
  }

  // Stats for current month
  const present = monthAtt.filter(a => a.status === 'present').length
  const late = monthAtt.filter(a => a.status === 'late').length
  const absent = monthAtt.filter(a => a.status === 'absent').length
  const attRate = monthAtt.length > 0 ? Math.round(((present + late * 0.5) / monthAtt.length) * 100) : 0

  const today = todayStr()

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Mark your daily attendance and view your history</p>
      </div>

      {/* Today's card */}
      <div className={`rounded-2xl p-6 mb-6 border-2 ${todayAtt ? 'border-transparent' : 'border-dashed border-brand-300 bg-brand-50/50'}`}
        style={todayAtt ? { background: `linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)`, border: '2px solid #e0e7ff' } : {}}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Today — {formatDate(today)}</h2>
            <p className="text-sm text-gray-500">{todayAtt ? `Already marked: ${ATTENDANCE_CONFIG[todayAtt.status].label}` : 'Not marked yet'}</p>
          </div>
          {todayAtt && (
            <span className={`ml-auto badge ${ATTENDANCE_CONFIG[todayAtt.status].bg} ${ATTENDANCE_CONFIG[todayAtt.status].color} text-sm`}>
              {ATTENDANCE_CONFIG[todayAtt.status].label}
            </span>
          )}
        </div>

        {!todayAtt && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Any notes for today…"
                  className="input pl-10 resize-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleMark('present')} disabled={marking}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all disabled:opacity-50">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Present</span>
              </button>
              <button onClick={() => handleMark('late')} disabled={marking}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 transition-all disabled:opacity-50">
                <Clock className="w-6 h-6 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Late</span>
              </button>
              <button onClick={() => handleMark('absent')} disabled={marking}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-red-50 border-2 border-red-200 hover:border-red-400 hover:bg-red-100 transition-all disabled:opacity-50">
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="text-sm font-bold text-red-700">Absent</span>
              </button>
            </div>
          </>
        )}

        {todayAtt && todayAtt.notes && (
          <div className="mt-3 p-3 bg-white/60 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500"><span className="font-semibold">Note:</span> {todayAtt.notes}</p>
          </div>
        )}
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', value: present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Late', value: late, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Absent', value: absent, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Rate', value: `${attRate}%`, color: 'text-brand-600', bg: 'bg-brand-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 text-center ${s.bg}`}>
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">{MONTH_NAMES[month]} {year}</h2>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }}
              className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }}
              className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
          ))}
          {Array.from({ length: getFirstDay(year, month) }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: getDays(year, month) }).map((_, i) => {
            const day = i + 1
            const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
            const dayOfWeek = new Date(year, month, day).getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const status = attMap[dateStr]
            const isToday = dateStr === today
            const cfg = status ? ATTENDANCE_CONFIG[status] : null

            return (
              <div key={day} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${
                isToday ? 'ring-2 ring-brand-500 ring-offset-1' : ''
              } ${
                isWeekend ? 'text-gray-200' :
                cfg
                  ? `${cfg.bg} ${cfg.color}`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}>
                {day}
                {cfg && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${cfg.dot}`} />}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(ATTENDANCE_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${v.dot}`} />
              <span className="text-xs text-gray-500">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent history */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Records</h3>
        <div className="space-y-2">
          {history.slice(0, 10).map(rec => {
            const cfg = ATTENDANCE_CONFIG[rec.status]
            return (
              <div key={rec.id} className="card p-4 flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">{formatDate(rec.date)}</span>
                  {rec.notes && <span className="text-xs text-gray-400 ml-2">· {rec.notes}</span>}
                </div>
                <span className={`badge ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
              </div>
            )
          })}
          {history.length === 0 && (
            <div className="card p-8 text-center text-gray-400 text-sm">No attendance records yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
