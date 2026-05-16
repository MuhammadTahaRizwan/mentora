'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { SUPPORTED_COUNTRIES } from '@/lib/utils'
import { SupportedCountry, ConsultantProfile } from '@/lib/types'
import { Plus, X, Search, Edit3, Trash2, Power, Globe, Star, Users, Eye, EyeOff, Key, Copy, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

function CreateConsultantModal({ onClose }: { onClose: () => void }) {
  const { createConsultant } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: 'Mentora@2025', assignedCountries: [] as SupportedCountry[] })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string | SupportedCountry[]) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const toggleCountry = (c: SupportedCountry) => {
    setForm(f => ({
      ...f,
      assignedCountries: f.assignedCountries.includes(c)
        ? f.assignedCountries.filter(x => x !== c)
        : [...f.assignedCountries, c],
    }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.password || form.password.length < 6) e.password = 'Min. 6 characters'
    if (form.assignedCountries.length === 0) e.countries = 'Assign at least one country'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = createConsultant(form)
    if (result.success) {
      toast.success('Consultant created! Credentials ready to share.')
      onClose()
    } else {
      toast.error(result.error || 'Failed to create consultant')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
          <div>
            <h2 className="font-bold text-white">Create Consultant</h2>
            <p className="text-xs text-white/40 mt-0.5">New employee account with country assignment</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Khan" className="input bg-gray-800 border-white/10 text-white placeholder:text-white/20 focus:ring-amber-500/30 focus:border-amber-500" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Phone *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92-300-000000" className="input bg-gray-800 border-white/10 text-white placeholder:text-white/20 focus:ring-amber-500/30 focus:border-amber-500" />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="consultant@mentora.pk" className="input bg-gray-800 border-white/10 text-white placeholder:text-white/20 focus:ring-amber-500/30 focus:border-amber-500" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Password *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="input bg-gray-800 border-white/10 text-white pr-10 focus:ring-amber-500/30 focus:border-amber-500" />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>

          {/* Country assignment */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Assign Countries * <span className="text-white/30">(determines student routing)</span></label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_COUNTRIES.map(c => (
                <button key={c.key} type="button" onClick={() => toggleCountry(c.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.assignedCountries.includes(c.key) ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                  <span className="text-base">{c.flag}</span>
                  <span>{c.key}</span>
                  {form.assignedCountries.includes(c.key) && <span className="ml-auto text-amber-400">✓</span>}
                </button>
              ))}
            </div>
            {errors.countries && <p className="mt-1 text-xs text-red-400">{errors.countries}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-gray-900 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Consultant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CredentialsModal({ profile, onClose }: { profile: ConsultantProfile; onClose: () => void }) {
  const { users, updateUserPassword } = useStore()
  const user = users.find(u => u.id === profile.userId)
  const [showPass, setShowPass] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!user) return
    navigator.clipboard.writeText(`Email: ${user.email}\nPassword: ${user.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdatePassword = () => {
    if (!newPass || newPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    if (!user) return
    updateUserPassword(user.id, newPass)
    toast.success('Password updated successfully!')
    setEditing(false)
    setNewPass('')
    setConfirmPass('')
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">{profile.name.slice(0,2).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="font-bold text-white">{profile.name}</h2>
              <p className="text-xs text-white/40 mt-0.5">Login Credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current credentials display */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-white/30 text-xs mb-1">Email address</p>
              <p className="text-white font-mono text-sm">{user.email}</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <p className="text-white/30 text-xs mb-1">Password</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-sm">{showPass ? user.password : '•'.repeat(Math.min(user.password.length, 12))}</p>
                <button onClick={() => setShowPass(s => !s)} className="text-white/30 hover:text-white/60 transition-colors ml-2">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Copy button */}
          <button
            onClick={copy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            {copied ? <><CheckCheck className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="w-4 h-4" /> Copy Credentials</>}
          </button>

          {/* Change password section */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Change Password
            </button>
          ) : (
            <div className="border border-amber-500/20 rounded-xl p-4 space-y-3">
              <p className="text-amber-400 text-xs font-semibold">Set New Password</p>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New password (min. 6 chars)"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setNewPass(''); setConfirmPass('') }} className="flex-1 py-2 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleUpdatePassword} className="flex-1 py-2 rounded-xl bg-amber-500 text-gray-900 text-sm font-bold hover:bg-amber-400 transition-colors">Update</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditCountriesModal({ profile, onClose }: { profile: ConsultantProfile; onClose: () => void }) {
  const { updateConsultantProfile } = useStore()
  const [countries, setCountries] = useState<SupportedCountry[]>(profile.assignedCountries)

  const toggle = (c: SupportedCountry) => setCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const save = () => {
    if (countries.length === 0) { toast.error('Assign at least one country'); return }
    updateConsultantProfile(profile.id, { assignedCountries: countries })
    toast.success('Countries updated!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-bold text-white text-sm">Edit Country Assignment</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-xs text-white/40 mb-3">{profile.name}'s assigned countries</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SUPPORTED_COUNTRIES.map(c => (
              <button key={c.key} type="button" onClick={() => toggle(c.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${countries.includes(c.key) ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                <span>{c.flag}</span><span>{c.key}</span>
                {countries.includes(c.key) && <span className="ml-auto text-amber-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 px-4 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5">Cancel</button>
            <button onClick={save} className="flex-1 py-2 px-4 rounded-xl bg-amber-500 text-gray-900 text-sm font-bold hover:bg-amber-400">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminConsultants() {
  const { consultantProfiles, students, applications, toggleConsultantStatus, deleteConsultant } = useStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editCountries, setEditCountries] = useState<ConsultantProfile | null>(null)
  const [viewCredentials, setViewCredentials] = useState<ConsultantProfile | null>(null)
  const [search, setSearch] = useState('')

  const filtered = consultantProfiles.filter(cp =>
    cp.name.toLowerCase().includes(search.toLowerCase()) ||
    cp.email.toLowerCase().includes(search.toLowerCase()) ||
    cp.assignedCountries.some(c => c.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (cp: ConsultantProfile) => {
    const hasStudents = students.some(s => s.consultantId === cp.userId)
    if (hasStudents) { toast.error('Reassign all students before deleting this consultant'); return }
    if (!confirm(`Delete ${cp.name}? This cannot be undone.`)) return
    deleteConsultant(cp.id)
    toast.success('Consultant deleted')
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">HR Management</span>
          </div>
          <h1 className="text-2xl font-black text-white">Consultants</h1>
          <p className="text-white/40 text-sm mt-1">{consultantProfiles.length} employees · {consultantProfiles.filter(c => c.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-gray-900 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Consultant
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search consultants…"
          className="input bg-gray-900 border-white/10 text-white placeholder:text-white/20 pl-10 focus:ring-amber-500/30 focus:border-amber-500" />
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cp => {
          const myStudents = students.filter(s => s.consultantId === cp.userId)
          const myApps = applications.filter(a => myStudents.map(s => s.id).includes(a.studentId))
          const accepted = myApps.filter(a => a.status === 'accepted').length
          const rate = myApps.length > 0 ? Math.round(accepted / myApps.length * 100) : 0

          return (
            <div key={cp.id} className={`bg-gray-900 border rounded-2xl p-5 transition-all ${cp.status === 'active' ? 'border-white/10 hover:border-white/20' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-black text-sm">{cp.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{cp.name}</h3>
                    <p className="text-[11px] text-white/30 truncate max-w-[120px]">{cp.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {cp.status}
                </span>
              </div>

              {/* Countries */}
              <div className="mb-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Assigned Countries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cp.assignedCountries.map(c => {
                    const cfg = SUPPORTED_COUNTRIES.find(x => x.key === c)
                    return <span key={c} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60">{cfg?.flag} {c}</span>
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Students', value: myStudents.length, color: 'text-sky-400' },
                  { label: 'Apps', value: myApps.length, color: 'text-purple-400' },
                  { label: 'Rate', value: `${rate}%`, color: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="text-center bg-white/5 rounded-xl py-2">
                    <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-white/30">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Performance score */}
              {cp.performanceScore !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-white/30 flex items-center gap-1"><Star className="w-3 h-3" /> Performance</span>
                    <span className="text-[10px] font-bold text-amber-400">{cp.performanceScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cp.performanceScore >= 80 ? 'bg-emerald-500' : cp.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${cp.performanceScore}%` }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setViewCredentials(cp)}
                  className="p-2 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
                  title="View Credentials">
                  <Key className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditCountries(cp)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 text-white/50 text-xs font-medium hover:bg-white/5 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Countries
                </button>
                <button onClick={() => toggleConsultantStatus(cp.id)}
                  className={`p-2 rounded-xl border transition-colors ${cp.status === 'active' ? 'border-amber-500/20 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}
                  title={cp.status === 'active' ? 'Deactivate' : 'Activate'}>
                  <Power className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cp)} className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-20 text-center">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/20 text-sm">No consultants found</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 text-amber-400 text-sm font-medium hover:text-amber-300">Add first consultant →</button>
          </div>
        )}
      </div>

      {showCreate && <CreateConsultantModal onClose={() => setShowCreate(false)} />}
      {editCountries && <EditCountriesModal profile={editCountries} onClose={() => setEditCountries(null)} />}
      {viewCredentials && <CredentialsModal profile={viewCredentials} onClose={() => setViewCredentials(null)} />}
    </div>
  )
}
