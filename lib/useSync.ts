'use client'
import { useEffect } from 'react'
import { useStore } from './store'

/**
 * Cross-tab & cross-window real-time sync hook.
 * Uses BroadcastChannel (fast, same-browser) + storage events (cross-tab fallback) + polling.
 *
 * NOTE: For true cross-device sync (different computers/phones), a real backend
 * (Supabase / Firebase) is required — localStorage is per-device by design.
 */
export function useSync(pollMs = 3000) {
  useEffect(() => {
    const rehydrate = () => {
      try {
        useStore.persist.rehydrate()
      } catch {
        // persist not ready yet — ignore
      }
    }

    // 1. Sync when tab gains focus (user switches back)
    window.addEventListener('focus', rehydrate)

    // 2. Sync when localStorage changes in another tab (browser native event)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mentora-store-v2') rehydrate()
    }
    window.addEventListener('storage', onStorage)

    // 3. BroadcastChannel: fastest same-browser cross-tab messaging
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('mentora-sync')
      channel.onmessage = () => rehydrate()
    } catch {
      // BroadcastChannel not supported in this environment
    }

    // 4. Polling fallback — catches any missed events
    const interval = setInterval(rehydrate, pollMs)

    return () => {
      window.removeEventListener('focus', rehydrate)
      window.removeEventListener('storage', onStorage)
      channel?.close()
      clearInterval(interval)
    }
  }, [pollMs])
}

/** Call this after any store mutation to notify other tabs instantly */
export function broadcastUpdate() {
  try {
    const ch = new BroadcastChannel('mentora-sync')
    ch.postMessage('update')
    ch.close()
  } catch {
    // not supported — storage event will handle it
  }
}
