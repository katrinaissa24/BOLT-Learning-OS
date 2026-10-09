import { useState } from 'react'
import { cx, fmtDate } from '../../lib/utils'
import BadgeIcon from './BadgeIcon'
import { SKILLS } from '../../data/seed'

const RARITY = { common: 'text-charcoal-400', uncommon: 'text-info', rare: 'text-[#8B5CF6]', epic: 'text-mango-700' }

/** Compact passport grid: earned stamps colored, unearned gray, hover shows how to earn. */
export default function StampGrid({ badges, earned }) {
  const [hover, setHover] = useState(null)
  const byId = Object.fromEntries(earned.map((e) => [e.badge_id, e]))
  return (
    <div>
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-9 gap-3">
        {badges.map((b) => {
          const e = byId[b.id]
          const skill = SKILLS[b.skill]
          return (
            <button key={b.id} type="button" onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(b.id)} onBlur={() => setHover(null)} className={cx('relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-mango/30', e ? 'text-white shadow-md' : 'bg-charcoal-50 text-charcoal-300 border border-dashed border-charcoal-200')} style={e ? { background: skill?.color || '#FF9900' } : undefined} aria-label={`${b.name}${e ? ' (earned)' : ' (not yet)'}`}>
              <BadgeIcon icon={b.icon} size={22} />
              <span className="text-[10px] font-bold leading-tight text-center px-1 line-clamp-2">{b.name}</span>
              {e && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white/80" />}
            </button>
          )
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-charcoal-50 p-4 min-h-[76px] text-sm">
        {hover ? (() => {
          const b = badges.find((x) => x.id === hover); const e = byId[hover]
          return (
            <div className="flex items-start gap-3">
              <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', e ? 'text-white' : 'bg-white text-charcoal-300 border border-charcoal-200')} style={e ? { background: SKILLS[b.skill]?.color } : undefined}><BadgeIcon icon={b.icon} size={18} /></div>
              <div>
                <div className="font-bold text-charcoal">{b.name} <span className={cx('text-[11px] font-semibold uppercase tracking-wide ml-1', RARITY[b.rarity])}>{b.rarity}</span> <span className="text-[11px] text-charcoal-400 ml-1">{b.category} · {SKILLS[b.skill]?.name}</span></div>
                {e ? <p className="text-charcoal-500 mt-0.5">Earned {fmtDate(e.earned_at)} — {e.evidence}</p> : <p className="text-charcoal-500 mt-0.5"><span className="font-semibold">How to earn:</span> {b.how_to_earn}</p>}
              </div>
            </div>
          )
        })() : <p className="text-charcoal-400">Hover a stamp to see what it proves, or how to earn it. Colored stamps are earned; gray ones are still open.</p>}
      </div>
    </div>
  )
}
