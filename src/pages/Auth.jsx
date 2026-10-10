import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { GraduationCap, Presentation, HeartHandshake, ArrowRight, KeyRound, AlertTriangle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Logo, Button, Input, Callout } from '../components/ui'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../data/seed'
import { cx } from '../lib/utils'

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, text: 'Journeys, lessons, passport' },
  { id: 'teacher', label: 'Teacher', icon: Presentation, text: 'Tracker, insights, replay' },
  { id: 'parent', label: 'Parent', icon: HeartHandshake, text: 'Parent Lens & alerts' },
]

export default function AuthPage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { signIn, signUp, loginDemo, enterLocalDemo, profile } = useAuth()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [role, setRole] = useState(params.get('role') || 'student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => { if (profile) nav(`/${profile.role}`, { replace: true }) }, [profile, nav])

  const go = (p) => nav(`/${p.role}`)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError(''); setInfo('')
    try {
      if (mode === 'signin') {
        const p = await signIn({ email, password, role })
        go(p)
      } else {
        const r = await signUp({ email, password, role, full_name: name })
        if (r.needsConfirmation) setInfo('Account created. Check your inbox to confirm your email, then sign in. (For a demo, turn off “Confirm email” in Supabase → Authentication → Providers → Email.)')
        else go(r.profile)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally { setBusy(false) }
  }

  async function demo(r) {
    setBusy(true); setError(''); setInfo('')
    try { go(await loginDemo(r)) } catch (err) { setError(err.message || 'Demo login failed.') } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-charcoal text-white p-12 bolt-pattern-dark">
        <Link to="/"><Logo dark size="lg" /></Link>
        <div>
          <div className="font-hand text-mango text-3xl">one school, three lenses</div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-2 max-w-md">The same learning, seen by the student, the teacher and the parent.</h2>
          <ul className="mt-8 space-y-3 text-white/75 text-sm max-w-md">
            <li>• Students follow a journey and prove understanding, not just answers.</li>
            <li>• Teachers see stuck points, thinking paths and who needs a nudge.</li>
            <li>• Parents get “what my child understands and what’s next”.</li>
          </ul>
        </div>
        <div className="text-xs text-white/40">Cedar Ridge International School · Grade 12 · demo data</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-block mb-6"><Logo /></Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="text-charcoal-400 mt-1 text-sm">Choose the kind of account, then {mode === 'signin' ? 'sign in' : 'sign up'}.</p>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {ROLES.map((r) => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)} className={cx('rounded-2xl border p-3 text-left transition-all', role === r.id ? 'border-mango bg-mango-50 ring-4 ring-mango/15' : 'border-charcoal-100 hover:border-charcoal-200')}>
                <r.icon size={20} className={role === r.id ? 'text-mango' : 'text-charcoal-400'} />
                <div className="font-bold text-sm mt-2">{r.label}</div>
                <div className="text-[11px] text-charcoal-400 leading-tight">{r.text}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required autoComplete="email" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            {error && <Callout tone="danger" icon={AlertTriangle}>{error}{/local demo|confirmation/i.test(error) && <div className="mt-2"><Button size="sm" variant="dark" type="button" onClick={() => go(enterLocalDemo(role))}>Continue in local demo mode</Button></div>}</Callout>}
            {info && <Callout tone="info">{info}</Callout>}
            <Button type="submit" size="lg" className="w-full" loading={busy}>{mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></Button>
          </form>

          <div className="text-sm text-charcoal-400 mt-4 text-center">
            {mode === 'signin' ? <>New here? <button className="font-semibold text-mango" onClick={() => setMode('signup')}>Create an account</button></> : <>Already have an account? <button className="font-semibold text-mango" onClick={() => setMode('signin')}>Sign in</button></>}
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-charcoal-300 font-semibold"><div className="h-px flex-1 bg-charcoal-100" />Demo accounts<div className="h-px flex-1 bg-charcoal-100" /></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.role} disabled={busy} onClick={() => demo(a.role)} className="rounded-2xl border border-charcoal-100 p-3 text-left hover:border-mango hover:bg-mango-50 transition-all">
                  <div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">{a.role}</div>
                  <div className="font-bold text-sm">{a.name}</div>
                  <div className="text-[11px] text-charcoal-400 truncate">{a.email}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-charcoal-400 flex items-center gap-1.5"><KeyRound size={12} /> Password for all demo accounts: <code className="font-semibold text-charcoal">{DEMO_PASSWORD}</code></div>
          </div>
        </div>
      </div>
    </div>
  )
}
