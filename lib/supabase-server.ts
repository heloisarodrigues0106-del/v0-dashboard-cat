import { createClient } from '@supabase/supabase-js'

/**
 * Cria uma instância do cliente Supabase para ser usada EXCLUSIVAMENTE
 * no lado do servidor (Server Components, Server Actions, API Routes),
 * pois utiliza a SERVICE_ROLE_KEY que bypassa o Row Level Security (RLS).
 * NUNCA importe este arquivo em Client Components.
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('As variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas no .env.local')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}
