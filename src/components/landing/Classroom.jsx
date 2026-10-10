import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { StampSeal } from '../passport/Stamp'
import { badgeById } from '../../data/seed'
import { cx } from '../../lib/utils'

const CHALK = '#F4F1E8'
const MANGO = '#FF9900'

/** One looping exchange between the teacher, Ziko and a student. Positions are % of the stage. */
const SCRIPT = [
  { who: 'teacher', name: 'Ms. Haddad', text: 'Don’t just give me the answer. Convince me why.', pos: 'left-[3%] top-[14%]', tail: 'left-10' },
  { who: 'bot', name: 'Ziko · BOLT AI', text: 'I planted one flaw on the board. Who spots it first?', pos: 'right-[2%] top-[8%]', tail: 'right-12' },
  { who: 'student', name: 'Maya', text: 'A secant isn’t a tangent… until h → 0!', pos: 'left-[47%] top-[58%]', tail: 'left-16' },
  { who: 'bot', name: 'Ziko · BOLT AI', text: 'Flaw found and explained. Stamp earned ✦', pos: 'right-[2%] top-[8%]', tail: 'right-12', stamp: true },
]

/** Draw-on chalk stroke. */
function Chalk({ d, delay = 0, color = CHALK, width = 3, dash, opacity = 0.9 }) {
  return (
    <motion.path
      d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity={opacity}
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.1, delay, ease: 'easeInOut' }}
    />
  )
}

function ChalkText({ children, delay = 0, ...rest }) {
  return (
    <motion.text
      fontFamily="Caveat, cursive" fill={CHALK} initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 0.92, y: 0 }} viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay }} {...rest}
    >{children}</motion.text>
  )
}

/** Illustrated classroom: a teacher at the board, Ziko the BOLT bot helping from the other side. */
export default function Classroom() {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setStep((s) => (s + 1) % SCRIPT.length), 3800)
    return () => clearInterval(t)
  }, [reduce])
  const line = SCRIPT[step]

  return (
    <div className="relative">
      <div className="relative rounded-[2rem] overflow-hidden border border-charcoal-100 shadow-[0_40px_80px_-40px_rgba(28,32,40,0.45)] bg-[#FBF7EF]">
        <svg viewBox="0 0 1000 560" className="w-full h-auto block" role="img" aria-label="A teacher explains derivatives at a chalkboard while Ziko, the BOLT AI bot, helps from the other side and students raise their hands.">
          <defs>
            <linearGradient id="cr-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF7EF" /><stop offset="1" stopColor="#F2EADB" /></linearGradient>
            <linearGradient id="cr-slate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30463F" /><stop offset="1" stopColor="#223630" /></linearGradient>
            <linearGradient id="cr-beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor={MANGO} stopOpacity="0.55" /><stop offset="1" stopColor={MANGO} stopOpacity="0.05" /></linearGradient>
            <linearGradient id="cr-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE5BF" /><stop offset="0.5" stopColor={MANGO} /><stop offset="1" stopColor={MANGO} stopOpacity="0" /></linearGradient>
            <radialGradient id="cr-glow"><stop offset="0" stopColor={MANGO} stopOpacity="0.45" /><stop offset="1" stopColor={MANGO} stopOpacity="0" /></radialGradient>
            <filter id="cr-chalk"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" /></filter>
          </defs>

          {/* room */}
          <rect width="1000" height="560" fill="url(#cr-wall)" />
          <rect y="470" width="1000" height="90" fill="#E8DECB" />
          <rect y="466" width="1000" height="6" fill="#DCCFB6" />
          {/* wall clock */}
          <g transform="translate(92 96)">
            <circle r="26" fill="#fff" stroke="#353B48" strokeWidth="4" />
            <line x1="0" y1="0" x2="0" y2="-15" stroke="#353B48" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="0" x2="11" y2="5" stroke={MANGO} strokeWidth="3" strokeLinecap="round" className="cr-tick" />
            <circle r="3" fill="#353B48" />
          </g>
          {/* plant */}
          <g transform="translate(962 470)">
            <path d="M-18 0 L18 0 L13 -34 L-13 -34 Z" fill="#C27400" />
            <path d="M0 -34 C -20 -60, -30 -70, -26 -96 C -8 -80, -2 -60, 0 -34 Z" fill="#2FA36B" />
            <path d="M0 -34 C 18 -58, 30 -64, 30 -88 C 10 -76, 4 -58, 0 -34 Z" fill="#26915E" />
            <path d="M0 -34 C -4 -60, 0 -84, 8 -104 C 14 -80, 8 -56, 0 -34 Z" fill="#33B576" />
          </g>

          {/* chalkboard */}
          <rect x="196" y="46" width="608" height="324" rx="16" fill="#272C36" />
          <rect x="210" y="60" width="580" height="296" rx="8" fill="url(#cr-slate)" />
          <g opacity="0.06" fill="#fff">
            <ellipse cx="300" cy="120" rx="90" ry="22" /><ellipse cx="640" cy="300" rx="120" ry="26" /><ellipse cx="520" cy="90" rx="70" ry="14" />
          </g>
          <rect x="186" y="366" width="628" height="14" rx="5" fill="#1C2028" />
          <rect x="560" y="360" width="22" height="7" rx="3" fill="#fff" /><rect x="590" y="361" width="16" height="6" rx="3" fill={MANGO} />
          <rect x="300" y="360" width="38" height="8" rx="3" fill="#C9CBD0" />

          <g filter="url(#cr-chalk)">
            {/* title */}
            <ChalkText x="238" y="110" fontSize="34" fontWeight="700">Why is a slope a limit?</ChalkText>
            <Chalk d="M238 122 C 300 114, 360 128, 420 118 S 500 116, 530 120" color={MANGO} width={4} delay={0.5} />

            {/* axes */}
            <Chalk d="M262 330 L262 150 M256 160 L262 148 L268 160" delay={0.2} />
            <Chalk d="M262 330 L520 330 M508 324 L520 330 L508 336" delay={0.3} />
            {/* curve */}
            <Chalk d="M270 315 C 330 310, 400 270, 500 160" width={3.5} delay={0.6} />
            {/* secants (dashed) */}
            <Chalk d="M300 316 L470 188" dash="7 7" opacity={0.55} width={2.5} delay={1.2} />
            <Chalk d="M300 311 L460 208" dash="7 7" opacity={0.75} width={2.5} delay={1.45} />
            {/* tangent */}
            <Chalk d="M290 321 L452 234" color={MANGO} width={4} delay={1.8} />
            <motion.circle cx="348" cy="290" r="6" fill={CHALK} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.1 }} />
            <motion.circle cx="443" cy="218" r="5" fill={CHALK} opacity="0.7" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.3 }} />
            <ChalkText x="330" y="312" fontSize="22" delay={1.2}>P</ChalkText>
            <ChalkText x="455" y="276" fontSize="22" delay={2}>h → 0</ChalkText>

            {/* formula */}
            <ChalkText x="545" y="196" fontSize="30" fontWeight="700" delay={0.9}>f′(x) =</ChalkText>
            <ChalkText x="625" y="194" fontSize="28" fontWeight="700" delay={1.1}>lim</ChalkText>
            <ChalkText x="622" y="216" fontSize="16" delay={1.15}>h→0</ChalkText>
            <ChalkText x="718" y="180" fontSize="22" textAnchor="middle" delay={1.3}>f(x+h) − f(x)</ChalkText>
            <Chalk d="M666 190 L770 190" width={2.5} delay={1.35} />
            <ChalkText x="718" y="214" fontSize="22" textAnchor="middle" delay={1.4}>h</ChalkText>
            <Chalk d="M612 170 C 600 196, 618 226, 650 222 C 676 218, 668 176, 640 172 C 628 170, 618 176, 614 182" color={MANGO} width={2.5} delay={2.4} />

            {/* thinking checklist */}
            <ChalkText x="550" y="262" fontSize="23" delay={1.9}>→ explain it</ChalkText>
            <ChalkText x="550" y="292" fontSize="23" delay={2.1}>→ defend it</ChalkText>
            <ChalkText x="550" y="322" fontSize="23" delay={2.3}>→ spot the flaw</ChalkText>
            <Chalk d="M548 330 C 590 326, 640 334, 690 328" color={MANGO} width={3} delay={2.6} />
          </g>

          {/* projection beam from Ziko to the limit */}
          <polygon points="806,300 640,176 640,232" fill="url(#cr-beam)" className="cr-beam" />

          {/* ── teacher ── */}
          <g>
            <ellipse cx="150" cy="518" rx="64" ry="8" fill="#1C2028" opacity="0.1" />
            <rect x="128" y="420" width="19" height="94" rx="9" fill="#353B48" />
            <rect x="153" y="420" width="19" height="94" rx="9" fill="#272C36" />
            <ellipse cx="135" cy="514" rx="15" ry="6" fill="#1C2028" />
            <ellipse cx="167" cy="514" rx="15" ry="6" fill="#1C2028" />
            {/* tablet arm */}
            <path d="M117 308 Q 100 362 118 398" fill="none" stroke="#E58900" strokeWidth="19" strokeLinecap="round" />
            {/* torso */}
            <path d="M110 302 Q 150 282 190 302 L 198 436 Q 150 446 102 436 Z" fill={MANGO} />
            <path d="M136 290 L150 336 L164 290 Z" fill="#fff" />
            <path d="M150 336 L150 432" stroke="#E58900" strokeWidth="2" />
            <circle cx="150" cy="356" r="2.5" fill="#fff" /><circle cx="150" cy="384" r="2.5" fill="#fff" />
            <g transform="rotate(-12 118 404)">
              <rect x="96" y="384" width="36" height="46" rx="5" fill="#353B48" />
              <rect x="100" y="389" width="28" height="34" rx="2" fill="#FFCC80" />
              <path d="M114 394 L108 406 H114 L111 418 L120 403 H114 Z" fill={MANGO} />
            </g>
            <circle cx="120" cy="400" r="9" fill="#D9A07C" />
            {/* pointing arm */}
            <g className="cr-point">
              <path d="M182 310 L 214 272 L 242 230" fill="none" stroke={MANGO} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="246" cy="223" r="9.5" fill="#D9A07C" />
              <rect x="249" y="206" width="6" height="16" rx="2" fill="#fff" transform="rotate(30 252 214)" />
            </g>
            {/* head */}
            <rect x="143" y="268" width="14" height="22" rx="4" fill="#C98E6B" />
            <circle cx="150" cy="246" r="27" fill="#D9A07C" />
            <path d="M122 252 Q 118 212 152 212 Q 184 212 178 248 Q 170 228 148 228 Q 130 230 122 252 Z" fill="#3B2A22" />
            <path d="M122 250 Q 118 270 126 280 Q 126 262 128 250 Z" fill="#3B2A22" />
            <circle cx="170" cy="214" r="12" fill="#3B2A22" />
            <circle cx="143" cy="248" r="7.5" fill="none" stroke="#1C2028" strokeWidth="1.8" />
            <circle cx="162" cy="248" r="7.5" fill="none" stroke="#1C2028" strokeWidth="1.8" />
            <path d="M150.5 248 L154.5 248" stroke="#1C2028" strokeWidth="1.8" />
            <circle cx="144" cy="248" r="2.3" fill="#1C2028" /><circle cx="163" cy="248" r="2.3" fill="#1C2028" />
            <path d="M145 261 Q 153 267 160 260" fill="none" stroke="#1C2028" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ── Ziko, the BOLT bot ── */}
          <ellipse cx="880" cy="516" rx="54" ry="9" fill="url(#cr-glow)" className="cr-shadow" />
          <g className="cr-bob">
            <path d="M866 372 Q 880 420 894 372 Z" fill="url(#cr-flame)" className="cr-flame" />
            {/* arms */}
            <path d="M854 322 Q 826 320 812 302" fill="none" stroke="#4B5160" strokeWidth="9" strokeLinecap="round" />
            <circle cx="809" cy="299" r="8" fill="#353B48" />
            <circle cx="809" cy="299" r="3.5" fill={MANGO} className="cr-pulse" />
            <path d="M906 322 Q 930 340 928 362" fill="none" stroke="#4B5160" strokeWidth="9" strokeLinecap="round" />
            <circle cx="928" cy="364" r="8" fill="#353B48" />
            {/* body */}
            <rect x="852" y="300" width="56" height="74" rx="22" fill="#353B48" />
            <rect x="860" y="308" width="40" height="40" rx="14" fill="#272C36" />
            <path d="M884 312 L872 331 H881 L877 345 L890 325 H882 Z" fill={MANGO} />
            {/* head */}
            <line x1="880" y1="228" x2="880" y2="206" stroke="#4B5160" strokeWidth="3" />
            <circle cx="880" cy="201" r="7" fill={MANGO} className="cr-pulse" />
            <circle cx="836" cy="260" r="7" fill="#4B5160" /><circle cx="924" cy="260" r="7" fill="#4B5160" />
            <rect x="836" y="226" width="88" height="68" rx="26" fill="#353B48" />
            <rect x="846" y="238" width="68" height="44" rx="17" fill="#1C2028" />
            <g className="cr-blink">
              <rect x="856" y="251" width="11" height="15" rx="5.5" fill={MANGO} />
              <rect x="883" y="251" width="11" height="15" rx="5.5" fill={MANGO} />
            </g>
            <path d="M864 272 Q 876 279 888 272" fill="none" stroke={MANGO} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="903" cy="270" r="2.5" fill="#E255A1" opacity="0.6" />
          </g>

          {/* ── students (foreground) ── */}
          {[
            { x: 330, hair: '#1C2028', shirt: '#3B82F6' },
            { x: 450, hair: '#6B4A3A', shirt: '#353B48' },
            { x: 690, hair: '#2A1E18', shirt: '#2FA36B' },
          ].map((s) => (
            <g key={s.x}>
              <ellipse cx={s.x} cy="566" rx="58" ry="40" fill={s.shirt} />
              <circle cx={s.x} cy="500" r="30" fill={s.hair} />
            </g>
          ))}
          {/* Maya, hand up */}
          <g>
            <g className="cr-wave">
              <path d="M594 540 L 612 460" fill="none" stroke="#E255A1" strokeWidth="16" strokeLinecap="round" />
              <circle cx="614" cy="452" r="10" fill="#C98E6B" />
            </g>
            <ellipse cx="570" cy="566" rx="58" ry="40" fill="#E255A1" />
            <circle cx="570" cy="500" r="30" fill="#3B2A22" />
            <path d="M545 496 Q 540 530 552 540 L 556 504 Z" fill="#3B2A22" />
            <path d="M595 496 Q 600 530 588 540 L 584 504 Z" fill="#3B2A22" />
          </g>
        </svg>

        {/* speech bubbles */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={cx('absolute max-w-[260px] w-[30%] min-w-[190px]', line.pos)}
            >
              <Bubble line={line} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {line.stamp && (
              <motion.div
                key="stamp"
                initial={{ opacity: 0, scale: 2.2, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.25 }}
                className="absolute left-[69%] top-[46%] w-[11%] aspect-square"
              >
                <StampSeal badge={badgeById['critical-eye']} earnedAt="2036-10-02T17:20:00Z" size="100%" rotate={-8} idx={77} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* labels */}
        <div className="absolute left-[5%] bottom-[3%] hidden md:flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-charcoal shadow-sm"><span className="w-2 h-2 rounded-full bg-mango" /> Teacher</div>
        <div className="absolute right-[3%] bottom-[3%] hidden md:flex items-center gap-2 rounded-full bg-charcoal text-white px-3 py-1 text-[11px] font-bold shadow-sm"><span className="w-2 h-2 rounded-full bg-mango animate-pulse" /> Ziko · BOLT AI</div>
      </div>

      {/* mobile caption instead of bubbles */}
      <div className="sm:hidden mt-3 min-h-[64px]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Bubble line={line} /></motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Bubble({ line }) {
  const bot = line.who === 'bot'
  return (
    <div className={cx('relative rounded-2xl px-4 py-3 shadow-soft text-sm font-semibold leading-snug', bot ? 'bg-charcoal text-white' : 'bg-white text-charcoal border border-charcoal-100')}>
      <div className={cx('text-[10px] uppercase tracking-[0.18em] font-bold mb-0.5', bot ? 'text-mango' : 'text-charcoal-400')}>{line.name}</div>
      {line.text}
      <span className={cx('hidden sm:block absolute -bottom-2 w-4 h-4 rotate-45', line.tail, bot ? 'bg-charcoal' : 'bg-white border-r border-b border-charcoal-100')} />
    </div>
  )
}
