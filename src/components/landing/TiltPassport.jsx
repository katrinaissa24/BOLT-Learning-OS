import { useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Mic, Sparkles, FileCheck2 } from 'lucide-react'
import { IdentityPage, StampPage, stampList, PER_PAGE } from '../passport/PassportBook'
import { profileById, badges, badgeById, studentBadges, MAYA_ID } from '../../data/seed'
import { cx } from '../../lib/utils'

const profile = profileById[MAYA_ID]
const earned = studentBadges.filter((b) => b.student_id === MAYA_ID).map((b) => ({ ...b, badge: badgeById[b.badge_id] }))
const db = { badges }

/** Maya's open Learning Passport, exactly as in the app, with a cursor-following 3D tilt and glare. */
export default function TiltPassport() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const items = stampList(db, earned)
  const pages = Math.ceil(items.length / PER_PAGE)
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const [hover, setHover] = useState(false)
  const go = (n) => { if (n < 0 || n >= pages || n === page) return; setDir(n > page ? 1 : -1); setPage(n) }

  // pointer position, 0..1 across the stage
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 140, damping: 16, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 140, damping: 16, mass: 0.6 })
  const rotateY = useTransform(sx, [0, 1], [-13, 13])
  const rotateX = useTransform(sy, [0, 1], [9, -9])
  const gx = useTransform(sx, [0, 1], [0, 100])
  const gy = useTransform(sy, [0, 1], [0, 100])
  const glare = useMotionTemplate`radial-gradient(520px circle at ${gx}% ${gy}%, rgba(255,255,255,0.38), rgba(255,255,255,0) 55%)`
  const shadowX = useTransform(sx, [0, 1], [30, -30])
  const shadowY = useTransform(sy, [0, 1], [10, 40])
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 70px -24px rgba(28,32,40,0.55)`

  const onMove = (e) => {
    if (reduce || e.pointerType === 'touch') return
    if (!hover) setHover(true)
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => { px.set(0.5); py.set(0.5); setHover(false) }

  const slice = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative py-10 md:px-10" style={{ perspective: 1800 }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative mx-auto w-full max-w-[920px]">
        {/* floating evidence chips (sit in front of the book for depth) */}
        <Chip z={90} className="-top-6 -left-2 md:-left-10 -rotate-3" icon={Mic} tone="dark">Oral defense · validated</Chip>
        <Chip z={120} className="-bottom-5 right-[10%] rotate-2" icon={Sparkles} tone="mango">+120 pts · Spot the Flaw</Chip>
        <Chip z={70} className="-top-5 right-[6%] md:-right-8 -rotate-2" icon={FileCheck2} tone="light">Exam · 1 piece of the picture</Chip>

        <motion.div style={{ boxShadow: shadow, transform: 'translateZ(0px)' }} className="relative rounded-3xl bg-charcoal p-2.5">
          <div className="grid md:grid-cols-2 relative" style={{ perspective: 1600 }}>
            <div className="hidden md:block absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 z-10 pointer-events-none bg-gradient-to-r from-transparent via-charcoal/15 to-transparent" />
            <div className="passport-paper p-6 min-h-[480px] rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl md:border-r border-charcoal-200/60">
              <IdentityPage profile={profile} earned={earned} db={db} />
            </div>
            <div className="passport-paper min-h-[480px] relative rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={page} custom={dir}
                  initial={{ rotateY: dir > 0 ? -70 : 70, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: dir > 0 ? 70 : -70, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{ transformOrigin: dir > 0 ? 'left center' : 'right center', transformStyle: 'preserve-3d' }}
                  className="p-6 h-full"
                >
                  <StampPage items={slice} page={page} pages={pages} />
                </motion.div>
              </AnimatePresence>
              {/* dog-eared corner: click to turn the page */}
              <button
                onClick={() => go(page === pages - 1 ? 0 : page + 1)}
                className="group absolute bottom-0 right-0 w-14 h-14 rounded-br-2xl overflow-hidden focus:outline-none"
                aria-label={page === pages - 1 ? 'Back to first stamp page' : 'Turn the page'}
              >
                <span className="absolute bottom-0 right-0 w-7 h-7 group-hover:w-11 group-hover:h-11 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #EDE5D3 50%, #353B48 50%)' }} />
              </button>
            </div>
          </div>
          {/* glare */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl mix-blend-soft-light" style={{ background: glare }} animate={{ opacity: hover ? 1 : 0 }} transition={{ duration: 0.4 }} />
        </motion.div>
      </motion.div>

      {/* controls */}
      <div className="flex items-center justify-center gap-3 mt-10">
        <button onClick={() => go(page - 1)} disabled={page === 0} className="w-10 h-10 rounded-full bg-white border border-charcoal-200 flex items-center justify-center disabled:opacity-40 hover:border-mango transition-colors" aria-label="Previous page"><ChevronLeft size={18} /></button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }).map((_, i) => <button key={i} onClick={() => go(i)} className={cx('h-2 rounded-full transition-all', i === page ? 'bg-mango w-6' : 'bg-charcoal-200 w-2')} aria-label={`Page ${i + 1}`} />)}
        </div>
        <button onClick={() => go(page + 1)} disabled={page === pages - 1} className="w-10 h-10 rounded-full bg-white border border-charcoal-200 flex items-center justify-center disabled:opacity-40 hover:border-mango transition-colors" aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
      <p className="text-center font-hand text-xl text-charcoal-400 mt-2">move around it · hover a stamp · turn the page</p>
    </div>
  )
}

function Chip({ z, className, icon: Icon, tone, children }) {
  const tones = { dark: 'bg-charcoal text-white', mango: 'bg-mango text-white', light: 'bg-white text-charcoal border border-charcoal-100' }
  return (
    <div className={cx('absolute z-20 hidden sm:flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold shadow-soft pointer-events-none', tones[tone], className)} style={{ transform: `translateZ(${z}px)` }}>
      <Icon size={14} className={tone === 'dark' ? 'text-mango' : ''} /> {children}
    </div>
  )
}
