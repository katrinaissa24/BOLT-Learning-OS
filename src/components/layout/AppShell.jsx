import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Trophy, Stamp, CalendarDays, Brain, Hammer, Users, BarChart3, FileSearch, Wand2, Award, HeartHandshake, Bell, LogOut, Menu, X, Zap, Sparkles, Database, WifiOff } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { checkAI } from '../../lib/ai'
import { Logo, Avatar, Pill } from '../ui'
import { cx } from '../../lib/utils'
import { studentOverview } from '../../lib/selectors'

const NAV = {
  student: [
    { to: '/student', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/student/passport', label: 'Passport', icon: Stamp },
    { to: '/student/schedule', label: 'Schedule', icon: CalendarDays },
    { to: '/student/lab', label: 'Thinking Lab', icon: Brain },
    { to: '/student/projects', label: 'Projects', icon: Hammer },
  ],
  teacher: [
    { to: '/teacher', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/teacher/tracker', label: 'Progress Tracker', icon: Users },
    { to: '/teacher/insights', label: 'Insights', icon: BarChart3 },
    { to: '/teacher/review', label: 'Process Replay', icon: FileSearch },
    { to: '/teacher/practice', label: 'Extra Practice', icon: Wand2 },
    { to: '/teacher/recognition', label: 'Recognition', icon: Award },
    { to: '/teacher/projects', label: 'Project Showcase', icon: Hammer },
  ],
  parent: [
    { to: '/parent', label: 'Parent Lens', icon: HeartHandshake, end: true },
    { to: '/parent/alerts', label: 'Intervene Early', icon: Bell },
    { to: '/parent/journey', label: 'Journey & Passport', icon: Stamp },
    { to: '/parent/schedule', label: 'Schedule & Attendance', icon: CalendarDays },
    { to: '/parent/ideas', label: 'Suggested Ideas', icon: Sparkles },
  ],
}

export default function AppShell({ role }) {
  const { profile, signOut, isLocalMode, supabaseConfigured } = useAuth()
  const { db } = useData()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [live, setLive] = useState(null) // null = checking
  useEffect(() => { checkAI().then(setLive) }, [])
  const items = NAV[role] || []
  const points = role === 'student' && profile ? studentOverview(db, profile.id).totalPoints : null

  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-charcoal text-white bolt-pattern-dark">
      <div className="px-5 pt-5 pb-4"><Logo dark /></div>
      <div className="px-5 pb-4 text-[11px] uppercase tracking-widest text-white/50 font-semibold">{role} space</div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} onClick={() => setOpen(false)} className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors', isActive ? 'bg-mango text-white shadow-lg shadow-mango/30' : 'text-white/75 hover:bg-white/10 hover:text-white')}>
            <it.icon size={18} /> {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 space-y-2 border-t border-white/10">
        <div className="flex items-center gap-2 text-[11px] text-white/60">
          {supabaseConfigured && !isLocalMode ? <><Database size={12} /> Supabase connected</> : <><WifiOff size={12} /> Local demo mode</>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/60">
          <Zap size={12} className={live ? 'text-mango' : ''} /> {live ? 'Live AI enabled' : live === null ? 'Checking AI…' : 'AI in demo mode (add API key)'}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-cloud">
      <div className="hidden lg:block fixed inset-y-0 left-0">{Sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-charcoal-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{Sidebar}</div>
        </div>
      )}
      <div className="flex-1 lg:pl-64 min-w-0">
        <header className="sticky top-0 z-30 bg-cloud/80 backdrop-blur border-b border-charcoal-100">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-charcoal-100" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={20} /></button>
              <div className="hidden sm:block text-sm text-charcoal-400">Cedar Ridge International School · Grade 12 · Term 1</div>
            </div>
            <div className="flex items-center gap-3">
              {points != null && <Pill tone="mango" icon={Zap} className="normal-case tracking-normal text-xs">{points.toLocaleString()} pts</Pill>}
              <div className="flex items-center gap-2">
                <Avatar name={profile?.full_name || ''} size="sm" />
                <div className="hidden md:block leading-tight">
                  <div className="text-sm font-bold text-charcoal">{profile?.full_name}</div>
                  <div className="text-[11px] text-charcoal-400">{profile?.title || role}</div>
                </div>
              </div>
              <button onClick={async () => { await signOut(); nav('/') }} className="p-2 rounded-xl hover:bg-charcoal-100 text-charcoal-400" title="Sign out"><LogOut size={18} /></button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
