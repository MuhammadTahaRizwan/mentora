'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function AdminRoot() {
  const router = useRouter()
  const { currentUser, seed } = useStore()
  useEffect(() => {
    seed()
    if (!currentUser) { router.replace('/admin-login'); return }
    if (currentUser.role !== 'admin') { router.replace('/admin-login'); return }
    router.replace('/admin/dashboard')
  }, [currentUser, router, seed])
  return null
}
