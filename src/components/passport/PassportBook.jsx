import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Avatar, BoltMark } from '../ui'
import { SKILLS, SCHOOL } from '../../data/seed'
import { StampSlot } from './Stamp'
import { cx } from '../../lib/utils'

export const PER_PAGE = 6

/** Order: earned (newest first) then locked. Returns [{ badge, earned }] */
export function stampList(db, earned) {
  const map = Object.fromEntries(earned.map((e) => [e.badge_id, e]))
  const got = earned.slice().sort((a, b) => b.earned_at.localeCompare(a.earned_at)).map((e) => ({ badge: e.badge, earned: e }))
  const rest = db.badges.filter((b) => !map[b.id]).map((b) => ({ badge: b, earned: null }))
  return [...got, ...rest]
}

export function IdentityPage({ profile, earned, db, compact = false }) {
  const passportNo = `CR-${profile.id.slice(-6).toUpperCase()}`
  const skillRows = Object.entries(SKILLS).map(([id, s]) => {
    const total = db.badges.filter((b) => b.skill === id).length
    const have = earned.filter((e) => e.badge.skill === id).length
    return { id, ...s, total, have }
  })
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.3em] text-charcoal-400">LEARNING PASSPORT</div>
        <BoltMark size={24} />
      </div>
      <div className="flex gap-4 mt-5">
        <div className="rounded-xl border-2 border-charcoal-200 p-1 bg-white rotate-[-2deg] shadow-sm"><Avatar name={profile.full_name} size="xl" className="rounded-lg" /></div>
        <div className="flex-1 min-w-0 text-sm">
          <Field label="Name" value={profile.full_name} />
          <Field label="Grade / Section" value={profile.title} />
          <Field label="Passport no." value={passportNo} mono />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <Field label="Issued" value="01 SEP 2026" mono />
        <Field label="Issuing school" value={SCHOOL.name.replace(' International School', ' Intl.')} />
      </div>
      <div className="mt-4">
        <div className="text-[10px] font-bold tracking-[0.2em] text-charcoal-400 mb-2">SKILLS PROVEN</div>
        <div className={cx('space-y-1.5', compact && 'space-y-1')}>
          {skillRows.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-28 text-charcoal-500 truncate">{s.name}</span>
              <div className="flex-1 h-1.5 rounded-full bg-charcoal-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.total ? (s.have / s.total) * 100 : 0}%`, background: s.color }} /></div>
              <span className="w-8 text-right font-bold text-charcoal">{s.have}/{s.total}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-4 font-mono text-[10px] text-charcoal-400 tracking-widest leading-tight break-all">
        P&lt;BOLT{profile.full_name.toUpperCase().replace(/\s+/g, '<<')}&lt;&lt;&lt;&lt;&lt;&lt;<br />{passportNo}&lt;G12&lt;{earned.length}STAMPS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      </div>
    </div>
  )
}

function Field({ label, value, mono }) {
  return (
    <div className="mb-2">
      <div className="text-[9px] font-bold tracking-[0.2em] text-charcoal-400">{label.toUpperCase()}</div>
      <div className={cx('font-bold text-charcoal truncate', mono && 'font-mono tracking-wider')}>{value}</div>
    </div>
  )
}

export function StampPage({ items, page, pages }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.3em] text-charcoal-400">STAMPS · PAGE {page + 1} OF {pages}</div>
        <div className="font-hand text-mango text-lg leading-none hidden md:block">proof of thinking</div>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 mt-4 flex-1 content-start">
        {items.map((it, i) => <StampSlot key={it.badge.id} badge={it.badge} earned={it.earned} idx={page * PER_PAGE + i} size={104} />)}
      </div>
    </div>
  )
}

/** Open passport: identity page on the left, flippable stamp pages on the right. */
export default function PassportBook({ profile, earned, db, onClose }) {
  const items = stampList(db, earned)
  const pages = Math.ceil(items.length / PER_PAGE)
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const go = (d) => { const n = page + d; if (n < 0 || n >= pages) return; setDir(d); setPage(n) }
  const slice = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <motion.div initial={{ opacity: 0, rotateY: 25, scale: 0.96 }} animate={{ opacity: 1, rotateY: 0, scale: 1 }} transition={{ duration: 0.55, ease: 'easeOut' }} style={{ transformOrigin: 'left center' }} className="relative w-full max-w-[900px]">
      <div className="rounded-3xl bg-charcoal p-2.5 shadow-[0_30px_60px_-20px_rgba(28,32,40,0.6)]">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden relative" style={{ perspective: 1600 }}>
          {/* spine shadow */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 z-10 pointer-events-none bg-gradient-to-r from-transparent via-charcoal/15 to-transparent" />
          <div className="passport-paper p-6 min-h-[480px] border-r border-charcoal-200/60"><IdentityPage profile={profile} earned={earned} db={db} /></div>
          <div className="passport-paper min-h-[480px] relative overflow-visible">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div key={page} custom={dir} initial={{ rotateY: dir > 0 ? -70 : 70, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: dir > 0 ? 70 : -70, opacity: 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }} style={{ transformOrigin: dir > 0 ? 'left center' : 'right center', transformStyle: 'preserve-3d' }} className="p-6 h-full">
                <StampPage items={slice} page={page} pages={pages} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* controls */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-400 hover:text-charcoal"><X size={15} /> Close passport</button>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} disabled={page === 0} className="w-9 h-9 rounded-full bg-white border border-charcoal-200 flex items-center justify-center disabled:opacity-40 hover:border-mango"><ChevronLeft size={16} /></button>
          <div className="flex items-center gap-1">{Array.from({ length: pages }).map((_, i) => <button key={i} onClick={() => { setDir(i > page ? 1 : -1); setPage(i) }} className={cx('w-2 h-2 rounded-full transition-all', i === page ? 'bg-mango w-5' : 'bg-charcoal-200')} aria-label={`Page ${i + 1}`} />)}</div>
          <button onClick={() => go(1)} disabled={page === pages - 1} className="w-9 h-9 rounded-full bg-white border border-charcoal-200 flex items-center justify-center disabled:opacity-40 hover:border-mango"><ChevronRight size={16} /></button>
        </div>
      </div>
    </motion.div>
  )
}
