'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import StudentSidebar from '@/components/layout/StudentSidebar'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, getStudentByUserId } = useStore()

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role !== 'student') { router.replace('/'); return }
    // If student hasn't completed onboarding, force them there (except if already on onboarding)
    if (pathname !== '/student/onboarding') {
      const student = getStudentByUserId(currentUser.id)
      if (!student || !student.onboardingComplete) {
        router.replace('/student/onboarding')
      }
    }
  }, [currentUser, router, pathname])

  if (!currentUser || currentUser.role !== 'student') return null

  return <StudentSidebar>{children}</StudentSidebar>
}
