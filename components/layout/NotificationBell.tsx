'use client'
import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useStore } from '@/lib/store'
import { timeAgo } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const TYPE_STYLES = {
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  error:   'bg-red-100 text-red-600',
  info:    'bg-brand-100 text-brand-600',
}

export default function NotificationBell() {
  const router = useRouter()
  const { currentUser, getNotifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const notifications = currentUser ? getNotifications(currentUser.id) : []
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.id)
    if (n.link) router.push(n.link)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(s => !s)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">Notifications</span>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={() => currentUser && markAllNotificationsRead(currentUser.id)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="ml-2 p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No notifications yet</div>
            ) : notifications.map(n => (
              <button key={n.id} onClick={() => handleClick(n)}
                className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-brand-50/50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5 ${TYPE_STYLES[n.type]}`}>
                  {n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : n.type === 'error' ? '✗' : 'i'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
