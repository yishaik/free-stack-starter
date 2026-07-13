import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export function hasSupabaseAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
      && process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    client = null
    return client
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'free-stack-directory-server',
      },
    },
  })

  return client
}
