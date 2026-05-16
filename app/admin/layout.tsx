'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { currentUser, seed } = useStore()

  useEffect(() => {
    seed()
    if (!currentUser) router.replace('/admin-login')
    else if (currentUser.role !== 'admin') {
      router.replace(currentUser.role === 'consultant' ? '/consultant/dashboard' : '/student/dashboard')
    }
  }, [currentUser, router, seed])

  if (!currentUser || currentUser.role !== 'admin') return null

  return <AdminSidebar>{children}</AdminSidebar>
}
