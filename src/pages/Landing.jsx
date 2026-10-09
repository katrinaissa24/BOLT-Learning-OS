import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Map, Stamp, Brain, Eye, HeartHandshake, Sparkles, Play } from 'lucide-react'
import { Logo, Button, Pill } from '../components/ui'
import { useAuth } from '../lib/auth'

const features = [
  { icon: Map, title: 'Journeys, not chapters', text: 'Every course is a landscape of checkpoints. Struggle at one and the path branches into AI-generated practice until the skill holds.' },
  { icon: Brain, title: 'Thinking Lab', text: 'Explain Back, Teach the Bot, Spot the Flaw, Evidence Detective, Decision Simulator and Debate Arena — mastery means you can defend it.' },
  { icon: Eye, title: 'Process over product', text: 'Essays and problems are written inside BOLT. Drafts, edits and AI usage are recorded so teachers grade the thinking path.' },
  { icon: Stamp, title: 'A passport of proof', text: 'Verified demonstrations — oral defenses, projects, challenge wins — become collectible stamps linked to skills.' },
  { icon: Zap, title: 'Teacher radar', text: 'See who is behind, on track or ahead at a glance, what the class got stuck on, and generate tailored extra practice in one click.' },
  { icon: HeartHandshake, title: 'Parent Lens', text: '“What my child understands and what’s next” instead of “Math: 14/20” — with alerts early enough to act before the exam.' },
]

export default function Landing() {
  const { profile } = useAuth()
  return (
    <div className="min-h-screen bg-white text-charcoal">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-charcoal-500">
          <a href="#features" className="hover:text-charcoal">Features</a>
          <a href="#roles" className="hover:text-charcoal">For students · teachers · parents</a>
          <a href="#why" className="hover:text-charcoal">Why 2036</a>
        </nav>
        <div className="flex items-center gap-2">
          {profile ? <Button to={`/${profile.role}`} variant="dark">Open my space <ArrowRight size={16} /></Button> : <><Button to="/auth" variant="ghost">Sign in</Button><Button to="/auth?mode=signup">Get started</Button></>}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bolt-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Pill tone="mango" className="mb-5 normal-case tracking-normal text-xs"><Sparkles size={12} /> The School of 2036 · Experia Education Hackathon</Pill>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
              Boring old learning,<br /><span className="text-mango">transformed.</span>
            </h1>
            <p className="font-hand text-3xl text-charcoal-400 mt-4">a learning operating system for one school</p>
            <p className="mt-6 text-lg text-charcoal-500 max-w-xl">
              BOLT replaces the gradebook with a journey. Students prove understanding, teachers see the thinking path, and parents know when to step in — before the exam, not after.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/auth" size="lg">Try the demo <ArrowRight size={18} /></Button>
              <Button href="#features" size="lg" variant="secondary"><Play size={18} /> See how it works</Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-charcoal-400">
              <div><span className="font-extrabold text-charcoal text-xl">3</span> account types</div>
              <div><span className="font-extrabold text-charcoal text-xl">21</span> interactive lessons</div>
              <div><span className="font-extrabold text-charcoal text-xl">6</span> thinking games</div>
            </div>
          </div>
          <HeroCard />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-cloud py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="font-hand text-mango text-2xl">what changes</div>
            <h2 className="text-4xl font-extrabold tracking-tight">Not a digitised classroom. A different school.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:-translate-y-1 transition-transform">
                <div className="w-11 h-11 rounded-2xl bg-mango-50 text-mango flex items-center justify-center mb-4"><f.icon size={22} /></div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-charcoal-400 mt-2">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6">
          {[
            ['Student', 'Journey map, interactive lessons with a tutor that knows the video, leaderboard, passport, Thinking Lab.', '/auth?role=student', 'bg-mango text-white'],
            ['Teacher', 'Progress radar, per-lesson stuck points, process replay for essays, one-click extra practice, recognition patterns.', '/auth?role=teacher', 'bg-charcoal text-white'],
            ['Parent', 'What my child understands, what’s next, and when to intervene — written for humans, not spreadsheets.', '/auth?role=parent', 'bg-white text-charcoal border border-charcoal-100'],
          ].map(([r, t, to, cls]) => (
            <Link key={r} to={to} className={`rounded-3xl p-8 ${cls} shadow-soft hover:-translate-y-1 transition-transform`}>
              <div className="font-hand text-2xl opacity-80">for the</div>
              <div className="text-3xl font-extrabold">{r}</div>
              <p className="mt-3 text-sm opacity-85">{t}</p>
              <div className="mt-6 inline-flex items-center gap-2 font-semibold text-sm">Enter as {r.toLowerCase()} <ArrowRight size={16} /></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section id="why" className="bg-charcoal text-white py-20 bolt-pattern-dark">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-hand text-mango text-2xl">why 2036</div>
            <h2 className="text-4xl font-extrabold tracking-tight">When every student has an AI, memory stops being the test.</h2>
          </div>
          <div className="space-y-4 text-white/80">
            <p>So BOLT tests what remains human: explaining, defending, spotting flaws, deciding under uncertainty, and building real things.</p>
            <p>The gradebook becomes a passport. The exam becomes small. The thinking becomes visible — to the student, the teacher and the parent.</p>
            <Button to="/auth" variant="primary" size="lg" className="mt-2">Open the demo <ArrowRight size={18} /></Button>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-charcoal-400">
        <Logo size="sm" className="justify-center mb-3" />
        Built for the Experia · SmartESA · 42 Beirut “School of 2036” hackathon. Design system: EduBolt brand guidelines.
      </footer>
    </div>
  )
}

function HeroCard() {
  const nodes = [1, 2, 3, 4, 5, 6, 7]
  return (
    <div className="relative">
      <div className="card p-6 rotate-[-1.5deg] shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div><div className="text-xs uppercase tracking-wide text-charcoal-400 font-semibold">Journey</div><div className="font-extrabold text-lg">Calculus: Change & Motion</div></div>
          <Pill tone="info">On track</Pill>
        </div>
        <svg viewBox="0 0 520 170" className="w-full">
          <path d="M20 120 C 90 40, 150 40, 210 100 S 330 160, 400 80 S 480 40, 500 70" fill="none" stroke="#353B48" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 14" />
          <path d="M210 100 C 230 140, 260 150, 300 140" fill="none" stroke="#FF9900" strokeWidth="4" strokeDasharray="6 6" />
          <circle cx="300" cy="140" r="9" fill="#FF9900" />
          <text x="312" y="144" fontSize="11" fill="#353B48" fontWeight="700">extra practice branch</text>
          {[[20, 120], [95, 66], [150, 60], [210, 100], [305, 136], [400, 80], [500, 70]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill={i < 4 ? '#FF9900' : i === 4 ? '#fff' : '#E6E8EC'} stroke={i === 4 ? '#FF9900' : 'none'} strokeWidth="4" />
              <text x={x} y={y + 4} fontSize="11" textAnchor="middle" fill={i < 4 ? '#fff' : '#353B48'} fontWeight="800">{nodes[i]}</text>
            </g>
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-3 mt-2 text-center">
          {[['1,240', 'points'], ['7', 'stamps'], ['22', 'day streak']].map(([v, l]) => <div key={l} className="rounded-2xl bg-cloud py-3"><div className="text-xl font-extrabold">{v}</div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">{l}</div></div>)}
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 card p-4 rotate-[2deg] w-64 hidden md:block">
        <div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold mb-1">Parent Lens</div>
        <div className="text-sm font-semibold">Maya understands derivatives. Next: the chain rule — 42 days before the exam.</div>
      </div>
    </div>
  )
}
