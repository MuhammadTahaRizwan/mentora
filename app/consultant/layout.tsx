'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import ConsultantSidebar from '@/components/layout/ConsultantSidebar'

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { currentUser } = useStore()

  useEffect(() => {
    if (!currentUser) router.replace('/login')
    else if (currentUser.role !== 'consultant') router.replace('/student/dashboard')
  }, [currentUser, router])

  if (!currentUser || currentUser.role !== 'consultant') return null

  return <ConsultantSidebar>{children}</ConsultantSidebar>
}
