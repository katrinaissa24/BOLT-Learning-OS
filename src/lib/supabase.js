import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase client. When the env vars are missing the app runs in "local demo mode":
 * auth and data fall back to the built-in seed so the prototype never breaks.
 */
export const supabase = url && anon ? createClient(url, anon) : null
export const supabaseConfigured = !!supabase
