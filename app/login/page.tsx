'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, GraduationCap, ArrowRight, Lock, Mail,
  BookOpen, Globe, Award,
} from 'lucide-react'

export default function StudentLoginPage() {
  const router = useRouter()
  const { login, seed, currentUser, getStudentByUserId } = useStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    seed()
    if (currentUser?.role === 'student') {
      const student = getStudentByUserId(currentUser.id)
      router.replace(!student || !student.onboardingComplete ? '/student/onboarding' : '/student/dashboard')
    }
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
      if (result.user.role === 'admin') {
        toast.error('Please use the Admin Portal to sign in.')
        setLoading(false)
        return
      }
      if (result.user.role === 'consultant') {
        toast.error('Please use the Consultant Portal to sign in.')
        setLoading(false)
        return
      }
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`)
      const student = getStudentByUserId(result.user.id)
      router.replace(!student || !student.onboardingComplete ? '/student/onboarding' : '/student/dashboard')
    } else {
      toast.error(result.error || 'Invalid email or password')
    }
    setLoading(false)
  }

  const perks = [
    { icon: Globe,        text: '180+ universities across 5 countries' },
    { icon: BookOpen,     text: 'Track every application in real-time' },
    { icon: Award,        text: 'Expert consultant assigned to you' },
  ]

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-950 flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/4 rounded-full" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 bg-brand-600/20 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-xl">Mentora</span>
            <span className="block text-white/40 text-xs -mt-0.5">Student Portal</span>
          </div>
        </div>

        {/* Copy */}
        <div className="relative">
          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Your Study<br />Abroad Journey<br />
            <span className="text-brand-400">Starts Here.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10 max-w-sm">
            Pakistan's most trusted platform connecting students with expert consultants for seamless university applications worldwide.
          </p>

          <ul className="space-y-3.5">
            {perks.map(p => {
              const Icon = p.icon
              return (
                <li key={p.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-white/70 text-sm">{p.text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-3">
          {[{ num: '2,400+', label: 'Students Placed' }, { num: '180+', label: 'Universities' }, { num: '5', label: 'Countries' }].map(s => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/8">
              <div className="text-2xl font-black text-white mb-0.5">{s.num}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-black text-lg">Mentora</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Student Sign In</h2>
            <p className="text-gray-400 text-sm">Access your dashboard to track applications and connect with your consultant.</p>
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
                  placeholder="you@example.com"
                  className={`w-full border ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
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
                  className={`w-full border ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <ArrowRight className="w-4 h-4" />
              }
              {loading ? 'Signing in…' : 'Sign in to Dashboard'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">Create one</Link>
          </p>

          <p className="text-center mt-6 text-xs">
            <Link href="/" className="text-brand-600 font-semibold hover:text-brand-700">
              ← Back to Mentora home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
