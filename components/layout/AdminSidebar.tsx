'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import NotificationBell from './NotificationBell'
import {
  LayoutDashboard, Users, UserCog, BarChart3, CalendarCheck,
  LogOut, ChevronRight, Menu, Shield, Activity,
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',   label: 'Command Center', icon: LayoutDashboard },
  { href: '/admin/consultants', label: 'Consultants',    icon: UserCog },
  { href: '/admin/students',    label: 'All Students',   icon: Users },
  { href: '/admin/attendance',  label: 'Attendance',     icon: CalendarCheck },
  { href: '/admin/analytics',   label: 'Analytics',      icon: BarChart3 },
]

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, students, consultantProfiles } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); router.push('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Shield className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <span className="text-white font-bold text-base">Mentora</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider">Admin Console</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Consultants', value: consultantProfiles.filter(c => c.status === 'active').length, color: 'text-emerald-400' },
            { label: 'Students', value: students.length, color: 'text-sky-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-white/30 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70',
              )}>
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Live indicator */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">System Online</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">{currentUser?.name.slice(0,2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-amber-400/60 text-[10px]">Super Admin</p>
          </div>
          <button onClick={handleLogout} className="text-white/20 hover:text-white/60 p-1 rounded-lg hover:bg-white/5 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d12]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        <header className="h-14 bg-gray-900 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-white/40 font-medium">Admin Console · Full Access</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
