'use client'
/**
 * SupabaseSync — mounts once at the root layout.
 * 1. Loads all data from Supabase on startup (replaces localStorage as source of truth)
 * 2. Subscribes to Realtime changes so any device's changes appear instantly everywhere
 */
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { supabase, isSupabaseReady } from '@/lib/supabase'
import {
  mapStudent, mapApplication, mapDocument,
  mapMessage, mapNotification, mapAttendance,
} from '@/lib/db'

export default function SupabaseSync() {
  const loadFromDB = useStore(s => s.loadFromDB)

  useEffect(() => {
    // ── Step 1: Load initial data from Supabase ────────────────────────────
    loadFromDB()

    if (!isSupabaseReady) return

    // ── Step 2: Realtime subscriptions ─────────────────────────────────────
    // Each subscription directly updates Zustand state WITHOUT going through
    // mutation functions (to avoid re-triggering Supabase writes → infinite loop)

    const studentCh = supabase
      .channel('rt-students')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, ({ new: r }) => {
        const s = mapStudent(r)
        useStore.setState(st => ({
          students: st.students.find(x => x.id === s.id) ? st.students : [...st.students, s],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students' }, ({ new: r }) => {
        const s = mapStudent(r)
        useStore.setState(st => ({ students: st.students.map(x => x.id === s.id ? s : x) }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'students' }, ({ old: r }) => {
        useStore.setState(st => ({ students: st.students.filter(x => x.id !== r.id) }))
      })
      .subscribe()

    const appCh = supabase
      .channel('rt-applications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'applications' }, ({ new: r }) => {
        const a = mapApplication(r)
        useStore.setState(st => ({
          applications: st.applications.find(x => x.id === a.id) ? st.applications : [...st.applications, a],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, ({ new: r }) => {
        const a = mapApplication(r)
        useStore.setState(st => ({ applications: st.applications.map(x => x.id === a.id ? a : x) }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'applications' }, ({ old: r }) => {
        useStore.setState(st => ({ applications: st.applications.filter(x => x.id !== r.id) }))
      })
      .subscribe()

    const docCh = supabase
      .channel('rt-documents')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'documents' }, ({ new: r }) => {
        const d = mapDocument(r)
        useStore.setState(st => ({
          documents: st.documents.find(x => x.id === d.id) ? st.documents : [...st.documents, d],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents' }, ({ new: r }) => {
        const d = mapDocument(r)
        useStore.setState(st => ({ documents: st.documents.map(x => x.id === d.id ? d : x) }))
      })
      .subscribe()

    const msgCh = supabase
      .channel('rt-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, ({ new: r }) => {
        const m = mapMessage(r)
        useStore.setState(st => ({
          messages: st.messages.find(x => x.id === m.id) ? st.messages : [...st.messages, m],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, ({ new: r }) => {
        const m = mapMessage(r)
        useStore.setState(st => ({ messages: st.messages.map(x => x.id === m.id ? m : x) }))
      })
      .subscribe()

    const notifCh = supabase
      .channel('rt-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, ({ new: r }) => {
        const n = mapNotification(r)
        useStore.setState(st => ({
          notifications: st.notifications.find(x => x.id === n.id) ? st.notifications : [...st.notifications, n],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, ({ new: r }) => {
        const n = mapNotification(r)
        useStore.setState(st => ({ notifications: st.notifications.map(x => x.id === n.id ? n : x) }))
      })
      .subscribe()

    const attCh = supabase
      .channel('rt-attendance')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, ({ new: r }) => {
        const a = mapAttendance(r)
        useStore.setState(st => ({
          attendance: st.attendance.find(x => x.id === a.id) ? st.attendance : [...st.attendance, a],
        }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'attendance' }, ({ new: r }) => {
        const a = mapAttendance(r)
        useStore.setState(st => ({ attendance: st.attendance.map(x => x.id === a.id ? a : x) }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(studentCh)
      supabase.removeChannel(appCh)
      supabase.removeChannel(docCh)
      supabase.removeChannel(msgCh)
      supabase.removeChannel(notifCh)
      supabase.removeChannel(attCh)
    }
  }, [loadFromDB])

  return null
}
