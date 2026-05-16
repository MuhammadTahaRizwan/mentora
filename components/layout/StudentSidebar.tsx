'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { GraduationCap, LayoutDashboard, FolderOpen, FileText, MessageSquare, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import NotificationBell from './NotificationBell'

const NAV = [
  { href: '/student/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/student/applications',  label: 'Applications', icon: FolderOpen },
  { href: '/student/documents',     label: 'Documents',    icon: FileText },
  { href: '/student/messages',      label: 'Messages',     icon: MessageSquare },
]

export default function StudentSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, getUnreadCount } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const unreadMsgs = currentUser ? getUnreadCount(currentUser.id) : 0

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-none">Mentora</span>
          <p className="text-white/40 text-xs">Student Portal</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn('sidebar-link', active ? 'sidebar-link-active' : 'sidebar-link-inactive')}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]" />
              <span className="flex-1">{label}</span>
              {label === 'Messages' && unreadMsgs > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadMsgs}
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-600 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{currentUser?.name.slice(0,2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-white/40 text-[10px] truncate">{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-brand-950 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-brand-950 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
