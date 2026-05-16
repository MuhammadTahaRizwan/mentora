'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Eye, EyeOff, GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, seed, currentUser, getStudentByUserId } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    seed()
    if (currentUser) redirectUser(currentUser)
  }, [])

  function redirectUser(user: typeof currentUser) {
    if (!user) return
    if (user.role === 'admin') { router.replace('/admin/dashboard'); return }
    if (user.role === 'consultant') { router.replace('/consultant/dashboard'); return }
    const student = getStudentByUserId(user.id)
    router.replace(!student || !student.onboardingComplete ? '/student/onboarding' : '/student/dashboard')
  }

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
        toast.error('Please use the admin portal to sign in.')
        setLoading(false)
        return
      }
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`)
      redirectUser(result.user)
    } else {
      toast.error(result.error || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Mentora</span>
        </div>
        <div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Your Study<br />Abroad Journey<br />Starts Here.
          </h1>
          <p className="text-white/50 text-lg leading-relaxed mb-10">
            Pakistan's most trusted platform connecting students with expert consultants for seamless university applications worldwide.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ num: '2,400+', label: 'Students Placed' }, { num: '180+', label: 'Universities' }, { num: '5', label: 'Countries' }].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-black text-white mb-1">{stat.num}</div>
                <div className="text-white/50 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-sm">© 2025 Mentora. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-xl">Mentora</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your email and password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})) }}
                  placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})) }}
                  placeholder="••••••••" className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 disabled:opacity-60">
              {loading ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">Create one</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">Are you an administrator?</p>
            <Link href="/admin-login" className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Sign in to the Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
