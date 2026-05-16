'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { currentUser, seed, getStudentByUserId } = useStore()

  useEffect(() => {
    seed()
    if (!currentUser) {
      router.replace('/login')
    } else if (currentUser.role === 'admin') {
      router.replace('/admin/dashboard')
    } else if (currentUser.role === 'consultant') {
      router.replace('/consultant/dashboard')
    } else {
      // Student: check if onboarding done
      const student = getStudentByUserId(currentUser.id)
      if (!student || !student.onboardingComplete) {
        router.replace('/student/onboarding')
      } else {
        router.replace('/student/dashboard')
      }
    }
  }, [currentUser, router, seed])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <span className="text-white text-2xl font-black">M</span>
        </div>
        <p className="text-white/60 text-sm animate-pulse-soft">Loading Mentora…</p>
      </div>
    </div>
  )
}
