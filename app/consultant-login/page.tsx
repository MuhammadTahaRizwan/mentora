'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, ArrowRight, Lock, Mail,
  Users, CheckCircle, Globe, TrendingUp, GraduationCap,
} from 'lucide-react'

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

  const highlights = [
    { icon: Users,      text: 'Manage your full student portfolio' },
    { icon: TrendingUp, text: 'Track application pipelines in real-time' },
    { icon: Globe,      text: 'Support students across 5 countries' },
    { icon: CheckCircle,text: 'Review and approve documents instantly' },
  ]

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — green ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 flex-col justify-between p-14 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 -left-14 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-tight">Mentora</span>
            <span className="block text-emerald-300 text-xs font-medium -mt-0.5">Consultant Portal</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            Active Consultant Dashboard
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
            Guide students<br />to their best<br />
            <span className="text-emerald-300">future.</span>
          </h1>

          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
            Everything you need to manage your student portfolio, track applications, and deliver world-class guidance — in one streamlined platform.
          </p>

          {/* Highlights */}
          <ul className="space-y-3.5">
            {highlights.map(h => {
              const Icon = h.icon
              return (
                <li key={h.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-white/80 text-sm">{h.text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { num: '2,400+', label: 'Students Placed' },
            { num: '180+',   label: 'Universities' },
            { num: '98%',    label: 'Success Rate' },
          ].map(s => (
            <div key={s.label} className="bg-white/8 border border-white/12 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white mb-0.5">{s.num}</div>
              <div className="text-white/45 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — white ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-black text-lg">Mentora</span>
              <span className="block text-emerald-600 text-xs font-medium -mt-0.5">Consultant Portal</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Consultant Sign In</h2>
            <p className="text-gray-400 text-sm">Access your dashboard to manage students and applications.</p>
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
                  placeholder="you@mentora.pk"
                  className={`w-full border ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
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
                  className={`w-full border ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'} rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <ArrowRight className="w-4 h-4" />
              }
              {loading ? 'Signing in…' : 'Access My Dashboard'}
            </button>
          </form>

          {/* Dividers */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300">other portals</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 border border-gray-100 hover:border-blue-200 rounded-xl py-2.5 transition-all hover:bg-blue-50"
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

          <p className="text-center mt-6 text-xs text-gray-400">
            <Link href="/" className="text-emerald-600 font-semibold hover:text-emerald-700">
              ← Back to Mentora home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
