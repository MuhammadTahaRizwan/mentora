'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function StudentRoot() {
  const router = useRouter()
  const { currentUser, seed, getStudentByUserId } = useStore()
  useEffect(() => {
    seed()
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role !== 'student') { router.replace('/login'); return }
    const student = getStudentByUserId(currentUser.id)
    router.replace(!student || !student.onboardingComplete ? '/student/onboarding' : '/student/dashboard')
  }, [currentUser, router, seed])
  return null
}
