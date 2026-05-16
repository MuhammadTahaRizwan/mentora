'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function ConsultantRoot() {
  const router = useRouter()
  const { currentUser, seed } = useStore()
  useEffect(() => {
    seed()
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role !== 'consultant') { router.replace('/login'); return }
    router.replace('/consultant/dashboard')
  }, [currentUser, router, seed])
  return null
}
