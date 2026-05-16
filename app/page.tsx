'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import {
  GraduationCap, Users, ShieldCheck, ArrowRight, Globe,
  BookOpen, Star, CheckCircle, ChevronRight, Sparkles,
  MapPin, TrendingUp, Award, Clock,
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { currentUser, seed, getStudentByUserId } = useStore()
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  useEffect(() => {
    seed()
    if (!currentUser) return
    if (currentUser.role === 'admin') { router.replace('/admin/dashboard'); return }
    if (currentUser.role === 'consultant') { router.replace('/consultant/dashboard'); return }
    const student = getStudentByUserId(currentUser.id)
    router.replace(!student || !student.onboardingComplete ? '/student/onboarding' : '/student/dashboard')
  }, [currentUser])

  const roles = [
    {
      id: 'student',
      href: '/login',
      icon: GraduationCap,
      title: 'Student',
      description: 'Track your applications, upload documents, and communicate with your consultant — all in one place.',
      cta: 'Sign in as Student',
      gradient: 'from-blue-600 to-indigo-700',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderHover: 'hover:border-blue-400',
      ctaClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-200',
      features: ['Application tracking', 'Document uploads', 'Direct messaging'],
    },
    {
      id: 'consultant',
      href: '/consultant-login',
      icon: Users,
      title: 'Consultant',
      description: 'Manage your student portfolio, track applications, review documents, and drive successful outcomes.',
      cta: 'Sign in as Consultant',
      gradient: 'from-emerald-600 to-green-700',
      lightBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderHover: 'hover:border-emerald-400',
      ctaClass: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-200',
      features: ['Student management', 'Application pipeline', 'Document review'],
      badge: 'Most Active',
    },
    {
      id: 'admin',
      href: '/admin-login',
      icon: ShieldCheck,
      title: 'Administrator',
      description: 'Full platform control — manage consultants, oversee all students, monitor analytics, and configure settings.',
      cta: 'Sign in as Admin',
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderHover: 'hover:border-amber-400',
      ctaClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200',
      features: ['Platform analytics', 'Consultant oversight', 'System control'],
    },
  ]

  const stats = [
    { num: '2,400+', label: 'Students Placed', icon: GraduationCap },
    { num: '180+', label: 'Universities', icon: BookOpen },
    { num: '98%', label: 'Success Rate', icon: TrendingUp },
    { num: '5', label: 'Countries', icon: Globe },
  ]

  const features = [
    { icon: Globe, title: 'Global University Network', desc: 'Access 180+ partner universities across UK, Canada, Australia, Germany, and Malaysia.' },
    { icon: Clock, title: 'Real-time Updates', desc: 'Get instant notifications on application status, document reviews, and consultant messages.' },
    { icon: Award, title: 'Expert Consultants', desc: 'Work with certified study-abroad consultants who have placed 2,400+ students successfully.' },
    { icon: CheckCircle, title: 'End-to-End Support', desc: 'From university selection to visa — every step of your journey managed in one platform.' },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">Mentora</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">New student?</span>
            <Link
              href="/register"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 rounded-xl px-4 py-2 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Pakistan's #1 Study Abroad Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
            Your Dream University<br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Is One Step Away
            </span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Mentora connects ambitious students with expert consultants to navigate the world's top universities — from application to visa, all in one powerful platform.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-brand-500" />
                <span className="font-black text-gray-900">{s.num}</span>
                <span className="text-sm text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <p className="text-sm text-gray-400 flex items-center justify-center gap-1">
            Choose your role to get started <ChevronRight className="w-4 h-4" />
          </p>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section className="py-6 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(role => {
              const Icon = role.icon
              const isHovered = hoveredRole === role.id
              return (
                <Link
                  key={role.id}
                  href={role.href}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className={`group relative flex flex-col rounded-3xl border-2 border-gray-100 ${role.borderHover} bg-white p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
                >
                  {/* Badge */}
                  {role.badge && (
                    <div className="absolute top-5 right-5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {role.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${role.lightBg} flex items-center justify-center mb-6 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                    <Icon className={`w-7 h-7 ${role.iconColor}`} />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-black text-gray-900 mb-3">{role.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{role.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-2 mb-8">
                    {role.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className={`w-3.5 h-3.5 ${role.iconColor} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button className={`w-full flex items-center justify-center gap-2 ${role.ctaClass} text-white font-semibold py-3 rounded-2xl text-sm shadow-lg transition-all duration-300 group-hover:gap-3`}>
                    {role.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </Link>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:text-brand-700">
              Register as a student →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Everything you need, in one place</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">A complete platform built for students, consultants, and administrators across Pakistan.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Study destinations we cover</h2>
            <p className="text-gray-500">Our consultants specialise in admissions to top universities across 5 countries.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { flag: '🇬🇧', country: 'United Kingdom', unis: '60+ Universities' },
              { flag: '🇨🇦', country: 'Canada', unis: '45+ Universities' },
              { flag: '🇦🇺', country: 'Australia', unis: '35+ Universities' },
              { flag: '🇩🇪', country: 'Germany', unis: '25+ Universities' },
              { flag: '🇲🇾', country: 'Malaysia', unis: '15+ Universities' },
            ].map(d => (
              <div key={d.country} className="flex items-center gap-3 bg-white border border-gray-100 hover:border-brand-200 hover:shadow-md rounded-2xl px-6 py-4 transition-all">
                <span className="text-3xl">{d.flag}</span>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{d.country}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.unis}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL STRIP ── */}
      <section className="py-16 px-6 bg-gradient-to-br from-brand-950 to-indigo-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
          </div>
          <blockquote className="text-white text-xl font-semibold leading-relaxed mb-6 max-w-2xl mx-auto">
            "Mentora made my UK university application completely stress-free. My consultant tracked everything and I got into my first-choice university!"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">Aisha Raza</div>
              <div className="text-white/40 text-xs">BSc Computer Science, University of Manchester</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900">Mentora</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Mentora. Pakistan's premier study abroad management platform.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Student Login</Link>
            <Link href="/consultant-login" className="hover:text-gray-600 transition-colors">Consultant Login</Link>
            <Link href="/admin-login" className="hover:text-gray-600 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
