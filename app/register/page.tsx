'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Eye, EyeOff, GraduationCap, ArrowRight, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, login, addStudent } = useStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'student' })
    if (result.success && result.user) {
      addStudent({
        userId: result.user.id,
        consultantId: '',
        name: form.name,
        email: form.email,
        phone: form.phone,
        nationality: 'Pakistani',
        targetCountries: [],
        intendedProgram: '',
        targetIntake: '',
        educationLevel: 'Bachelors',
        status: 'active',
        onboardingComplete: false,
      })
      toast.success('Account created! Let\'s set up your profile.')
      login(form.email, form.password)
      router.push('/student/onboarding')
    } else {
      toast.error(result.error || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  const perks = [
    'Track all your university applications in one place',
    'Get matched with an expert study-abroad consultant',
    'Upload and manage all required documents',
    'Real-time status updates at every step',
  ]

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-brand-950 flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/4 rounded-full" />
        <div className="absolute bottom-16 -left-12 w-52 h-52 bg-brand-600/20 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-black text-xl">Mentora</span>
        </div>

        {/* Copy */}
        <div className="relative">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
            Start your journey<br />to a world-class<br />
            <span className="text-brand-400">education.</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
            Join thousands of Pakistani students who have successfully enrolled in top universities worldwide through Mentora.
          </p>

          <ul className="space-y-3.5">
            {perks.map(p => (
              <li key={p} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-brand-400" />
                </div>
                <span className="text-white/65 text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-3">
          {[{ num: '2,400+', label: 'Students Placed' }, { num: '180+', label: 'Universities' }, { num: '98%', label: 'Success Rate' }].map(s => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/8">
              <div className="text-xl font-black text-white mb-0.5">{s.num}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 font-black text-lg">Mentora</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Create your student account</h2>
            <p className="text-gray-400 text-sm">Fill in your details to get started. It only takes a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Muhammad Ali"
                    className={`w-full border ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+92 300 0000000"
                    className={`w-full border ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full border ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`w-full border ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full border ${errors.confirm ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'} rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <ArrowRight className="w-4 h-4" />
              }
              {loading ? 'Creating account…' : 'Create Student Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
          </p>

          <p className="text-center mt-4 text-xs">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Mentora home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
