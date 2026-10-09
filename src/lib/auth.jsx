import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from './supabase'
import { profiles as seedProfiles, DEMO_PASSWORD, MAYA_ID } from '../data/seed'

const AuthCtx = createContext(null)
const LOCAL_KEY = 'bolt.local.session'
const LOCAL_PROFILES_KEY = 'bolt.local.profiles'

const readLocal = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const writeLocal = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

const hash = (s) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(16).padStart(8, '0') }

function synthesizeProfile({ email, role, full_name }) {
  const h = hash(email)
  const name = full_name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    id: `${h}-0000-4000-8000-${h}${h.slice(0, 4)}`,
    email, full_name: name, role,
    grade: role === 'student' ? 12 : null,
    avatar: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    child_id: role === 'parent' ? MAYA_ID : null,
    title: role === 'student' ? 'Grade 12 · Section A' : role === 'teacher' ? 'Teacher · Grade 12' : 'Parent (linked to demo student Maya Khalil)',
    is_new: true,
  }
}

/** Find or create the profile row for an authenticated user. Never throws. */
async function resolveProfile(user) {
  const email = (user.email || '').toLowerCase()
  const meta = user.user_metadata || {}
  if (supabase) {
    try {
      const { data: byEmail } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle()
      if (byEmail) {
        if (!byEmail.auth_id) await supabase.from('profiles').update({ auth_id: user.id }).eq('id', byEmail.id)
        return byEmail
      }
      const { data: byAuth } = await supabase.from('profiles').select('*').eq('auth_id', user.id).maybeSingle()
      if (byAuth) return byAuth
      const fresh = { ...synthesizeProfile({ email, role: meta.role || 'student', full_name: meta.full_name }), auth_id: user.id }
      const { is_new, ...row } = fresh
      const { data: inserted } = await supabase.from('profiles').insert(row).select().maybeSingle()
      return inserted || fresh
    } catch (err) {
      console.warn('[BOLT] profile lookup failed, using local profile:', err?.message)
    }
  }
  const seeded = seedProfiles.find((p) => p.email === email)
  return seeded || synthesizeProfile({ email, role: meta.role || 'student', full_name: meta.full_name })
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null) // { mode: 'supabase'|'local', user }
  const [profile, setProfile] = useState(null)

  // Restore session on boot
  useEffect(() => {
    let unsub = () => {}
    ;(async () => {
      const local = readLocal(LOCAL_KEY, null)
      if (local) {
        setSession({ mode: 'local', user: local })
        setProfile(localProfileFor(local))
        setLoading(false)
        return
      }
      if (!supabase) { setLoading(false); return }
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          setSession({ mode: 'supabase', user: data.session.user })
          setProfile(await resolveProfile(data.session.user))
        }
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
          if (s?.user) {
            setSession({ mode: 'supabase', user: s.user })
            setProfile(await resolveProfile(s.user))
          } else if (!readLocal(LOCAL_KEY, null)) {
            setSession(null); setProfile(null)
          }
        })
        unsub = () => sub.subscription.unsubscribe()
      } catch (err) {
        console.warn('[BOLT] auth restore failed:', err?.message)
      } finally {
        setLoading(false)
      }
    })()
    return () => unsub()
  }, [])

  function localProfileFor(local) {
    const seeded = seedProfiles.find((p) => p.email === local.email)
    if (seeded) return seeded
    const stored = readLocal(LOCAL_PROFILES_KEY, {})
    return stored[local.email] || synthesizeProfile(local)
  }

  const startLocal = useCallback((local) => {
    const prof = localProfileFor(local)
    const stored = readLocal(LOCAL_PROFILES_KEY, {})
    if (!stored[local.email] && !seedProfiles.find((p) => p.email === local.email)) {
      stored[local.email] = prof
      writeLocal(LOCAL_PROFILES_KEY, stored)
    }
    writeLocal(LOCAL_KEY, local)
    setSession({ mode: 'local', user: local })
    setProfile(prof)
    return prof
  }, [])

  /** Sign in with email/password. Falls back to local demo mode when Supabase is not configured. */
  const signIn = useCallback(async ({ email, password, role }) => {
    email = email.trim().toLowerCase()
    if (!supabase) {
      const seeded = seedProfiles.find((p) => p.email === email)
      if (seeded && password !== DEMO_PASSWORD) throw new Error('Wrong password for this demo account.')
      return startLocal({ email, role: seeded?.role || role || 'student' })
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const prof = await resolveProfile(data.user)
    setSession({ mode: 'supabase', user: data.user }); setProfile(prof)
    return prof
  }, [startLocal])

  const signUp = useCallback(async ({ email, password, role, full_name }) => {
    email = email.trim().toLowerCase()
    if (!supabase) return { profile: startLocal({ email, role, full_name }) }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role, full_name } } })
    if (error) throw error
    if (!data.session) return { needsConfirmation: true }
    const prof = await resolveProfile(data.user)
    setSession({ mode: 'supabase', user: data.user }); setProfile(prof)
    return { profile: prof }
  }, [startLocal])

  /** One-click demo login. Creates the Supabase user on first use if the SQL step wasn't run. */
  const loginDemo = useCallback(async (role) => {
    const acct = seedProfiles.find((p) => p.role === role && p.email.endsWith('@bolt.school') && ['student@bolt.school', 'teacher@bolt.school', 'parent@bolt.school'].includes(p.email))
    if (!supabase) return startLocal({ email: acct.email, role })
    try {
      return await signIn({ email: acct.email, password: DEMO_PASSWORD, role })
    } catch (err) {
      const msg = String(err?.message || '')
      if (/invalid login credentials/i.test(msg)) {
        const r = await signUp({ email: acct.email, password: DEMO_PASSWORD, role, full_name: acct.full_name })
        if (r.needsConfirmation) {
          throw new Error('Demo account created but email confirmation is on. In Supabase → Authentication → Providers → Email, turn off "Confirm email", or run the demo-users SQL. You can also continue in local demo mode.')
        }
        return r.profile
      }
      throw err
    }
  }, [signIn, signUp, startLocal])

  const enterLocalDemo = useCallback((role) => {
    const acct = seedProfiles.find((p) => p.role === role)
    return startLocal({ email: acct.email, role })
  }, [startLocal])

  const signOut = useCallback(async () => {
    try { localStorage.removeItem(LOCAL_KEY) } catch { /* ignore */ }
    if (supabase) { try { await supabase.auth.signOut() } catch { /* ignore */ } }
    setSession(null); setProfile(null)
  }, [])

  const value = useMemo(() => ({
    loading, session, profile, role: profile?.role || null,
    signIn, signUp, signOut, loginDemo, enterLocalDemo,
    supabaseConfigured, isLocalMode: session?.mode === 'local',
  }), [loading, session, profile, signIn, signUp, signOut, loginDemo, enterLocalDemo])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
