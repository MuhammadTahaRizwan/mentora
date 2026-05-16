import { createClient } from '@supabase/supabase-js'

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL      || 'https://placeholder.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// isSupabaseReady is false when real credentials are missing (build/SSR time)
export const isSupabaseReady =
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Client is always created (avoids "supabaseUrl is required" crash during SSR),
// but DB functions check isSupabaseReady before making any actual calls.
export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})
