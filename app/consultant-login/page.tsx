'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Lock, Mail, GraduationCap, Users, BarChart2, FileCheck, MessageSquare } from 'lucide-react'

export default function ConsultantLoginPage() {
  const router = useRouter()
  const { login, seed, currentUser } = useStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    seed()
    if (currentUser?.role === 'consultant') router.replace('/consultant/dashboard')
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = login(email, password)
    if (result.success && result.user) {
      if (result.user.role !== 'consultant') {
        toast.error(
          result.user.role === 'admin'
            ? 'Please use the Admin Portal to sign in.'
            : 'This portal is for consultants only. Use the student login instead.'
        )
        setLoading(false)
        return
      }
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`)
      router.replace('/consultant/dashboard')
    } else {
      toast.error(result.error || 'Invalid email or password')
    }
    setLoading(false)
  }

  const features = [
    { icon: Users,        label: 'Student Portfolio',   desc: 'Manage all your assigned students' },
    { icon: BarChart2,    label: 'Application Tracking', desc: 'Monitor every application pipeline' },
    { icon: FileCheck,    label: 'Document Review',      desc: 'Approve and annotate documents' },
    { icon: MessageSquare,label: 'Direct Messaging',     desc: 'Communicate with students instantly' },
  ]

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — dark forest green ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d2b1f 0%, #0f3526 40%, #0a2218 100%)' }}>

        {/* Subtle texture rings */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full border border-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full border border-white/4 translate-y-1/3 -translate-x-1/3" />
        <div className="absolute bottom-24 right-16 w-32 h-32 bg-green-500/8 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tight">Mentora</span>
            <span className="block text-green-400/70 text-xs font-medium -mt-0.5">Consultant Portal</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative">
          <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] mb-5">
            Empower students.<br />
            Build careers.<br />
            <span style={{ color: '#4ade80' }}>Change lives.</span>
          </h1>
          <p className="text-white/45 text-sm leading-relaxed mb-12 max-w-sm">
            Your consultant dashboard gives you everything needed to guide students from first enquiry to final enrolment — all in one focused workspace.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(74,222,128,0.12)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#4ade80' }} />
                  </div>
                  <p className="text-white text-xs font-semibold mb-0.5">{f.label}</p>
                  <p className="text-white/35 text-[11px] leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="relative flex gap-4">
          {[{ num: '2,400+', label: 'Students Placed' }, { num: '180+', label: 'Universities' }, { num: '5', label: 'Countries' }].map(s => (
            <div key={s.label} className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xl font-black text-white mb-0.5">{s.num}</div>
              <div className="text-white/35 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — clean white ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2b1f, #1a5c3a)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-black text-lg">Mentora</span>
              <span className="block text-green-700 text-xs font-medium -mt-0.5">Consultant Portal</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#f0faf4', border: '1px solid #d1fae5' }}>
              <Users className="w-6 h-6" style={{ color: '#166534' }} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Consultant Sign In</h2>
            <p className="text-gray-400 text-sm">Sign in to access your student management dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})) }}
                  placeholder="consultant@mentora.pk"
                  className={`w-full border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all`}
                  style={{ '--tw-ring-color': '#166534' } as React.CSSProperties}
                  onFocus={e => { if (!errors.email) e.target.style.borderColor = '#166534'; e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? '#f87171' : '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})) }}
                  placeholder="••••••••"
                  className={`w-full border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all`}
                  onFocus={e => { if (!errors.password) e.target.style.borderColor = '#166534'; e.target.style.boxShadow = '0 0 0 3px rgba(22,101,52,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#f87171' : '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ background: 'linear-gradient(135deg, #14532d, #166534)', boxShadow: '0 4px 14px rgba(20,83,45,0.35)' }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.92')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <ArrowRight className="w-4 h-4" />
              }
              {loading ? 'Signing in…' : 'Access Dashboard'}
            </button>
          </form>

          {/* Divider + other portals */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300">other portals</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 border border-gray-100 hover:border-brand-200 rounded-xl py-2.5 transition-all hover:bg-brand-50"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student Login
              </Link>
              <Link
                href="/admin-login"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-600 border border-gray-100 hover:border-amber-200 rounded-xl py-2.5 transition-all hover:bg-amber-50"
              >
                <Users className="w-3.5 h-3.5" />
                Admin Login
              </Link>
            </div>
          </div>

          <p className="text-center mt-6 text-xs">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Mentora home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
