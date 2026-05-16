'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { GraduationCap, LayoutDashboard, Users, FolderKanban, MessageSquare, LogOut, ChevronRight, Menu, BarChart3, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationBell from './NotificationBell'
import LogoutConfirmModal from './LogoutConfirmModal'

const NAV = [
  { href: '/consultant/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/consultant/students',     label: 'Students',     icon: Users },
  { href: '/consultant/applications', label: 'Applications', icon: FolderKanban },
  { href: '/consultant/analytics',    label: 'Analytics',    icon: BarChart3 },
  { href: '/consultant/messages',     label: 'Messages',     icon: MessageSquare },
  { href: '/consultant/attendance',   label: 'Attendance',   icon: CalendarCheck },
]

export default function ConsultantSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, getUnreadCount, getStudentsByConsultant, getTodayAttendance } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const unreadMsgs = currentUser ? getUnreadCount(currentUser.id) : 0
  const totalStudents = currentUser ? getStudentsByConsultant(currentUser.id).length : 0
  const todayAtt = currentUser ? getTodayAttendance(currentUser.id) : undefined

  const handleLogout = () => { logout(); router.push('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-none">Mentora</span>
          <p className="text-white/40 text-xs">Consultant Panel</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10 mb-4" />

      {/* Stats summary */}
      <div className="mx-3 mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Quick Stats</p>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-white font-bold text-lg leading-none">{totalStudents}</p>
            <p className="text-white/40 text-[10px]">Students</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="text-white font-bold text-lg leading-none">{unreadMsgs}</p>
            <p className="text-white/40 text-[10px]">Unread</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            {todayAtt ? (
              <>
                <p className={`font-bold text-xs leading-none ${todayAtt.status === 'present' ? 'text-emerald-400' : todayAtt.status === 'late' ? 'text-amber-400' : 'text-red-400'}`}>
                  {todayAtt.status === 'present' ? '✓' : todayAtt.status === 'late' ? '~' : '✗'}
                </p>
                <p className="text-white/40 text-[10px]">Today</p>
              </>
            ) : (
              <>
                <p className="text-amber-400 font-bold text-xs leading-none">!</p>
                <p className="text-white/40 text-[10px]">Att.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (pathname.startsWith(href + '/') && href !== '/consultant/dashboard')
          const showAttBadge = label === 'Attendance' && !todayAtt
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn('sidebar-link', active ? 'sidebar-link-active' : 'sidebar-link-inactive')}>
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Messages' && unreadMsgs > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadMsgs}</span>
              )}
              {showAttBadge && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">!</span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{currentUser?.name.slice(0,2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-white/40 text-[10px]">Consultant</p>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="text-white/40 hover:text-red-400 p-1 rounded-lg hover:bg-white/10 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="hidden lg:flex w-56 bg-gray-900 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-gray-900 flex flex-col z-50"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"><Menu className="w-5 h-5" /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}
