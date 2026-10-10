import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageSquareText, Swords, Search, GitBranch, Hammer, Target, Trophy, BadgeCheck, GraduationCap, Presentation, HeartHandshake, Play, Bot } from 'lucide-react'
import { Logo, Button } from '../components/ui'
import { useAuth } from '../lib/auth'
import Classroom from '../components/landing/Classroom'
import TiltPassport from '../components/landing/TiltPassport'
import { StampSeal } from '../components/passport/Stamp'
import { badgeById } from '../data/seed'
import { cx } from '../lib/utils'

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }

export default function Landing() {
  const { profile } = useAuth()
  return (
    <div className="min-h-screen bg-white text-charcoal overflow-x-hidden">
      {/* Nav */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-charcoal-500">
          <a href="#matters" className="hover:text-charcoal">What matters</a>
          <a href="#passport" className="hover:text-charcoal">Learning Passport</a>
          <a href="#roles" className="hover:text-charcoal">Students · teachers · parents</a>
        </nav>
        <div className="flex items-center gap-2">
          {profile ? <Button to={`/${profile.role}`} variant="dark">Open my space <ArrowRight size={16} /></Button> : <><Button to="/auth" variant="ghost">Sign in</Button><Button to="/auth?mode=signup">Get started</Button></>}
        </div>
      </header>

      <Hero />
      <WhatMatters />
      <Journey />
      <PassportSection />
      <Roles />
      <Finale />

      <footer className="py-10 text-center text-sm text-charcoal-400 border-t border-charcoal-100">
        <Logo size="sm" className="justify-center mb-3" />
        The School of 2036 · Experia · SmartESA · 42 Beirut hackathon
      </footer>
    </div>
  )
}

/* ───────────────────────── Hero ───────────────────────── */
function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bolt-pattern opacity-50 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 pt-8 md:pt-14 pb-14">
        <motion.div {...reveal} className="flex items-center gap-4 mb-6">
          <span className="font-hand text-mango text-4xl md:text-5xl leading-none">By 2036</span>
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.3 }} className="h-[3px] w-24 md:w-40 bg-mango rounded-full origin-left" />
        </motion.div>
        <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.4rem] font-extrabold tracking-[-0.035em] max-w-6xl">
          <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            When AI can give every student the answer,
          </motion.span>
          <motion.span className="block text-charcoal-300" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <StruckAnswer /> is no longer <span className="relative inline-block text-charcoal">enough.<Squiggle /></span>
          </motion.span>
        </h1>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-12 md:mt-16">
          <Classroom />
        </motion.div>
      </div>
    </section>
  )
}

/** "the answer" with a hand-drawn mango strike. */
function StruckAnswer() {
  return (
    <span className="relative inline-block">
      the answer
      <svg viewBox="0 0 300 30" preserveAspectRatio="none" className="absolute left-[-2%] w-[104%] top-[45%] h-[0.35em] overflow-visible pointer-events-none" aria-hidden>
        <motion.path d="M4 18 C 60 6, 120 26, 180 12 S 260 8, 296 16" fill="none" stroke="#FF9900" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 1.1, ease: 'easeInOut' }} />
      </svg>
    </span>
  )
}

function Squiggle({ delay = 1.6 }) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute left-0 right-0 -bottom-[0.18em] w-full h-[0.28em] overflow-visible pointer-events-none" aria-hidden>
      <motion.path d="M2 12 C 40 2, 70 20, 100 10 S 160 4, 198 12" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay, ease: 'easeInOut' }} />
    </svg>
  )
}

/* ───────────────────────── What truly matters ───────────────────────── */
const MATTERS = [
  { title: 'Explaining', icon: MessageSquareText, tool: 'Explain Back', text: 'Say it in your own words. BOLT follows up with why, what-if and a brand-new scenario until understanding shows.', color: '#2FA36B', demo: ['“The derivative is the slope…”', 'Why does the limit matter?', 'Deep understanding ✓'] },
  { title: 'Defending ideas', icon: Swords, tool: 'Debate Arena · Oral Defense', text: 'Hold a position under pressure — against an adaptive AI opponent, then out loud in front of your teacher.', color: '#5B7CFA', demo: ['Round 3 of 4', 'Counter-argument incoming', 'Reasoning 86 vs AI 79'] },
  { title: 'Spotting flaws', icon: Search, tool: 'Spot the Flaw · Teach the Bot', text: 'Ziko answers with total confidence and a few planted mistakes. Find them, fix them, explain why.', color: '#E0493B', demo: ['Ziko: “d/dx sin(2x) = cos(2x)”', 'Flagged ✗ missing chain rule', '+120 pts'] },
  { title: 'Making decisions', icon: GitBranch, tool: 'Decision Simulator', text: 'Real trade-offs, incomplete data and consequences that play out. Judgment, not recall.', color: '#8B5CF6', demo: ['Budget: 40k', 'Option B — justified', 'Outcome score 84'] },
  { title: 'Building real things', icon: Hammer, tool: 'Project Showcase', text: 'Podcasts, models, experiments — tagged to the skills they prove and validated by a teacher.', color: '#FF9900', demo: ['“Voices of Beirut” podcast', 'Communication · Creativity', 'Validated ✓ stamped'] },
]

function WhatMatters() {
  const [active, setActive] = useState(0)
  return (
    <section id="matters" className="relative bg-charcoal text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bolt-pattern-dark" />
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-mango/20 blur-[120px]" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.h2 {...reveal} className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.04] max-w-4xl">
          So BOLT challenges <span className="text-mango">what truly matters</span>:
        </motion.h2>
        <motion.p {...reveal} className="mt-5 text-lg md:text-xl text-white/70 max-w-3xl">
          explaining, defending ideas, spotting flaws, making decisions, and building real things.
        </motion.p>

        <div className="mt-14 flex flex-col lg:flex-row gap-3 lg:h-[440px]">
          {MATTERS.map((m, i) => {
            const on = active === i
            return (
              <motion.button
                key={m.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: i * 0.08 }}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
                className={cx('group relative text-left rounded-3xl overflow-hidden border transition-[flex-grow,background-color,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] focus:outline-none focus-visible:ring-4 focus-visible:ring-mango/40 lg:basis-0 lg:[flex-grow:var(--g)]',
                  on ? 'bg-white text-charcoal border-white' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]')}
                style={{ '--g': on ? 4.2 : 1 }}
                aria-expanded={on}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: m.color, opacity: on ? 1 : 0.6 }} />
                <div className="h-full p-6 flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: on ? m.color : 'rgba(255,255,255,0.08)', color: on ? '#fff' : m.color }}><m.icon size={21} /></div>
                    <div className={cx('font-mono text-xs font-bold', on ? 'text-charcoal-300' : 'text-white/40')}>0{i + 1}</div>
                  </div>
                  <div className={cx('mt-4 font-extrabold tracking-tight leading-tight transition-all duration-500', on ? 'text-3xl md:text-4xl' : 'text-xl lg:[writing-mode:vertical-rl] lg:rotate-180 lg:mt-auto lg:text-2xl')}>{m.title}</div>
                  <div className={cx('transition-all duration-500', on ? 'opacity-100 translate-y-0 mt-3' : 'opacity-0 translate-y-3 h-0 overflow-hidden lg:absolute')}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: m.color }}>{m.tool}</div>
                    <p className="mt-2 text-charcoal-500 max-w-md">{m.text}</p>
                    <div className="mt-5 space-y-2 max-w-sm">
                      {m.demo.map((d, k) => (
                        <motion.div key={d} initial={false} animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }} transition={{ delay: on ? 0.15 + k * 0.12 : 0 }}
                          className={cx('rounded-xl px-3 py-2 text-sm font-semibold', k === m.demo.length - 1 ? 'text-white' : 'bg-cloud text-charcoal')}
                          style={k === m.demo.length - 1 ? { background: m.color } : undefined}
                        >{d}</motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Journey ───────────────────────── */
const STOPS = [
  { key: 'challenges', label: 'challenges', x: 300, y: 120, icon: Target, color: '#5B7CFA', card: <ChallengeCard /> },
  { key: 'achievements', label: 'achievements', x: 640, y: 170, icon: Trophy, color: '#FF9900', card: <AchievementCard /> },
  { key: 'skills', label: 'demonstrated skills', x: 980, y: 90, icon: BadgeCheck, color: '#2FA36B', card: <SkillCard /> },
]
const PATH = 'M40 200 C 120 200, 200 120, 300 120 S 520 170, 640 170 S 860 90, 980 90 S 1120 60, 1170 60'

function Journey() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'center 45%'] })
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1])
  const reduce = useReducedMotion()
  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-cloud overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2 {...reveal} className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.06] max-w-5xl">
          Learning becomes a journey of <span style={{ color: STOPS[0].color }}>challenges</span>, <span style={{ color: STOPS[1].color }}>achievements</span>, and <span style={{ color: STOPS[2].color }}>demonstrated skills</span>.
        </motion.h2>

        {/* desktop: winding path */}
        <div className="relative mt-16 hidden lg:block" style={{ aspectRatio: '1200 / 260' }}>
          <svg viewBox="0 0 1200 260" className="absolute inset-0 w-full h-full overflow-visible">
            <path d={PATH} fill="none" stroke="#C9CBD0" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 14" />
            <motion.path d={PATH} fill="none" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" style={{ pathLength: reduce ? 1 : draw }} />
            <g transform="translate(1170 60)">
              <line x1="0" y1="0" x2="0" y2="-44" stroke="#353B48" strokeWidth="3" />
              <path d="M0 -44 L 30 -36 L 0 -26 Z" fill="#FF9900" />
            </g>
          </svg>
          {STOPS.map((s, i) => (
            <div key={s.key} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(s.x / 1200) * 100}%`, top: `${(s.y / 260) * 100}%` }}>
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.2 + i * 0.25 }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-soft ring-8 ring-cloud" style={{ background: s.color }}>
                <s.icon size={28} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 + i * 0.25 }}
                className={cx('absolute left-1/2 -translate-x-1/2 w-72', i === 1 ? 'bottom-full mb-6' : 'top-full mt-6')}>
                <StopCard stop={s} />
              </motion.div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block h-44" />

        {/* mobile / tablet: stacked */}
        <div className="lg:hidden mt-12 relative pl-10">
          <div className="absolute left-[19px] top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-[#5B7CFA] via-mango to-success" />
          <div className="space-y-8">
            {STOPS.map((s) => (
              <motion.div key={s.key} {...reveal} className="relative">
                <div className="absolute -left-10 top-1 w-10 h-10 rounded-full flex items-center justify-center text-white ring-4 ring-cloud" style={{ background: s.color }}><s.icon size={18} /></div>
                <StopCard stop={s} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StopCard({ stop }) {
  return (
    <div className="card p-4 hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: stop.color }}>{stop.label}</div>
      {stop.card}
    </div>
  )
}

function ChallengeCard() {
  return (
    <div>
      <div className="font-bold text-sm">Ziko says the tangent and the secant are the same line. Agree?</div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-semibold">
        <div className="rounded-lg border border-charcoal-200 px-2 py-1.5 text-charcoal-400">Agree</div>
        <div className="rounded-lg border-2 border-[#5B7CFA] bg-[#5B7CFA]/10 px-2 py-1.5 text-[#3654d6]">Disagree, because…</div>
      </div>
    </div>
  )
}

function AchievementCard() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-extrabold">1,240</div>
      <div className="text-xs text-charcoal-400 leading-tight">points · 22-day streak<br /><span className="font-bold text-mango-700">2nd on the calculus podium</span></div>
    </div>
  )
}

function SkillCard() {
  return (
    <div className="flex items-center gap-3">
      <StampSeal badge={badgeById['debate-victor']} earnedAt="2036-10-03T18:00:00Z" size={84} rotate={-8} idx={91} />
      <div className="text-xs text-charcoal-500 leading-snug"><span className="font-bold text-charcoal">Debate Victor</span><br />Out-argued the AI opponent, round after round.</div>
    </div>
  )
}

/* ───────────────────────── Passport ───────────────────────── */
function PassportSection() {
  return (
    <section id="passport" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-mango-50/70 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-end">
          <motion.h2 {...reveal} className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.04]">
            The gradebook evolves into a <span className="relative inline-block text-mango">Learning Passport<Squiggle delay={0.6} /></span>.
          </motion.h2>
          <OldGradebook />
        </div>

        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="mt-10">
          <TiltPassport />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <motion.div {...reveal} className="card p-7 md:p-9">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">The exam becomes one piece of the picture.</h3>
            <Mosaic />
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="rounded-[1.25rem] bg-charcoal text-white p-7 md:p-9 bolt-pattern-dark">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">And thinking becomes visible through what students can <span className="text-mango">actually do</span>.</h3>
            <ThinkingReplay />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** A paper report card that gets crossed out. */
function OldGradebook() {
  const rows = [['Mathematics', '14/20'], ['Physics', '12/20'], ['English', '15/20']]
  return (
    <motion.div {...reveal} className="relative justify-self-start lg:justify-self-end w-full max-w-sm rotate-[2deg]">
      <div className="rounded-xl bg-white border border-charcoal-200 shadow-card p-5 font-mono text-sm">
        <div className="text-[10px] tracking-[0.25em] text-charcoal-400 font-bold mb-3">REPORT CARD · TERM 1</div>
        {rows.map(([s, g]) => <div key={s} className="flex justify-between py-1.5 border-b border-dashed border-charcoal-100 last:border-0 text-charcoal-400"><span>{s}</span><span className="font-bold text-charcoal-500">{g}</span></div>)}
      </div>
      <svg viewBox="0 0 300 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <motion.path d="M20 30 L 280 135" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.45, delay: 0.5 }} />
        <motion.path d="M280 25 L 20 140" stroke="#FF9900" strokeWidth="6" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.45, delay: 0.85 }} />
      </svg>
      <div className="absolute -bottom-7 right-2 font-hand text-2xl text-mango -rotate-3">not the whole story</div>
    </motion.div>
  )
}

const TILES = [
  ['Oral defense', '#2FA36B'], ['Project', '#FF9900'], ['Debate', '#5B7CFA'],
  ['Essay process', '#E255A1'], ['Exam', null], ['Explain Back', '#2FA36B'],
  ['Decisions', '#8B5CF6'], ['Peer mentoring', '#8B5CF6'], ['Spot the Flaw', '#E0493B'],
]
function Mosaic() {
  return (
    <div className="grid grid-cols-3 gap-2 mt-6">
      {TILES.map(([t, c], i) => (
        <motion.div key={t}
          initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ y: -4, rotate: i % 2 ? 1.5 : -1.5 }}
          className={cx('rounded-xl px-3 py-4 text-xs font-bold text-center cursor-default', c ? 'text-charcoal' : 'bg-charcoal text-white ring-4 ring-mango/40')}
          style={c ? { background: `${c}1A`, boxShadow: `inset 0 0 0 1.5px ${c}40` } : undefined}
        >
          {t}{!c && <div className="text-[10px] font-semibold text-mango mt-0.5">1 of 9</div>}
        </motion.div>
      ))}
    </div>
  )
}

const REPLAY = [
  { t: '0:00', label: 'First draft', w: 22 },
  { t: '4:12', label: 'Asked Ziko a hint · declared', w: 14, ai: true },
  { t: '9:40', label: 'Rewrote the argument', w: 30 },
  { t: '15:05', label: 'Defended it out loud ✓', w: 18 },
]
function ThinkingReplay() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.5 })
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!inView) return
    const t = setInterval(() => setI((v) => (v + 1) % (REPLAY.length + 1)), 1100)
    return () => clearInterval(t)
  }, [inView])
  return (
    <div ref={ref} className="mt-6">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50"><Play size={12} className="text-mango" /> Process replay · essay “Exams in 2036”</div>
      <div className="flex gap-1 mt-3 h-2.5">
        {REPLAY.map((r, k) => <div key={k} className="rounded-full transition-all duration-500" style={{ flexGrow: r.w, background: k < i ? (r.ai ? '#E255A1' : '#FF9900') : 'rgba(255,255,255,0.12)' }} />)}
      </div>
      <div className="mt-5 space-y-2.5">
        {REPLAY.map((r, k) => (
          <div key={k} className={cx('flex items-center gap-3 text-sm transition-all duration-500', k < i ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-1')}>
            <span className="font-mono text-xs text-white/50 w-11">{r.t}</span>
            <span className={cx('w-2 h-2 rounded-full', r.ai ? 'bg-[#E255A1]' : 'bg-mango')} />
            <span className="font-semibold">{r.label}</span>
            {r.ai && <Bot size={14} className="text-[#E255A1]" />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────────────── Roles ───────────────────────── */
const ROLES = [
  { r: 'Students', icon: GraduationCap, line: 'Prove what you can do — and collect the stamps to show it.', to: '/auth?role=student', cls: 'bg-mango text-white', sub: 'text-white/85' },
  { r: 'Teachers', icon: Presentation, line: 'See the thinking path, not just the final answer.', to: '/auth?role=teacher', cls: 'bg-charcoal text-white', sub: 'text-white/70' },
  { r: 'Parents', icon: HeartHandshake, line: 'Know what your child understands, and when to step in.', to: '/auth?role=parent', cls: 'bg-white text-charcoal border border-charcoal-100', sub: 'text-charcoal-400' },
]
function Roles() {
  return (
    <section id="roles" className="py-24 md:py-28 bg-cloud">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2 {...reveal} className="text-4xl md:text-6xl font-extrabold tracking-[-0.03em]">
          To <span className="text-mango">students, teachers, and parents</span>.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {ROLES.map((x, i) => (
            <motion.div key={x.r} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: i * 0.1 }}>
              <Link to={x.to} className={cx('group relative block rounded-3xl p-8 h-full shadow-soft overflow-hidden transition-transform duration-300 hover:-translate-y-2', x.cls)}>
                <x.icon size={120} strokeWidth={1.2} className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 group-hover:rotate-[-8deg] transition-all duration-500" />
                <div className="font-hand text-2xl opacity-80">for</div>
                <div className="text-4xl font-extrabold tracking-tight">{x.r}</div>
                <p className={cx('mt-3 max-w-[16rem]', x.sub)}>{x.line}</p>
                <div className="mt-8 inline-flex items-center gap-2 font-bold text-sm">Enter the demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Finale ───────────────────────── */
const WORDS = [['B', 'oring'], ['O', 'ld'], ['L', 'earning.'], ['T', 'ransformed.']]
function Finale() {
  const [hot, setHot] = useState(null)
  const [auto, setAuto] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  useEffect(() => {
    if (!inView || hot !== null) return
    const t = setInterval(() => setAuto((v) => (v + 1) % 4), 1400)
    return () => clearInterval(t)
  }, [inView, hot])
  const lit = hot ?? auto
  return (
    <section ref={ref} className="relative bg-charcoal text-white py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bolt-pattern-dark" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-mango/15 blur-[140px]" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center items-end select-none" onMouseLeave={() => setHot(null)}>
          {WORDS.map(([l], i) => (
            <motion.span key={l} onMouseEnter={() => setHot(i)}
              animate={{ y: lit === i ? -14 : 0, color: lit === i ? '#FF9900' : '#FFFFFF' }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="text-[26vw] md:text-[15rem] font-extrabold leading-[0.85] tracking-[-0.06em] cursor-default">{l}</motion.span>
          ))}
          <span className="text-[26vw] md:text-[15rem] font-extrabold leading-[0.85] text-mango">.</span>
        </div>
        <div className="mt-8 text-2xl md:text-4xl font-extrabold tracking-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
          {WORDS.map(([l, rest], i) => (
            <span key={l} onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} className={cx('transition-colors duration-300 cursor-default', lit === i ? 'text-white' : 'text-white/40', i === 3 && 'font-hand text-4xl md:text-6xl font-bold')}>
              <span className="text-mango">{l}</span>{rest}
            </span>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Button to="/auth" size="lg">Try the demo <ArrowRight size={18} /></Button>
          <Button href="#passport" size="lg" variant="secondary">Open the passport</Button>
        </div>
      </div>
    </section>
  )
}
