import { useState } from 'react'
import { Lock } from 'lucide-react'
import { SKILLS } from '../../data/seed'
import { badgeIcon, RARITY } from './icons'
import { Pill, SkillChip } from '../ui'
import { cx } from '../../lib/utils'

const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

/** Rubber-stamp SVG for an earned badge. */
export function StampSeal({ badge, earnedAt, size = 112, rotate = -6, idx = 0 }) {
  const Icon = badgeIcon(badge.icon)
  const ink = SKILLS[badge.skill]?.color || '#FF9900'
  const rect = badge.category === 'Verified Demonstration'
  const id = `grain-${badge.id}-${idx}`
  const name = badge.name.toUpperCase()
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: `rotate(${rotate}deg)` }} className="drop-shadow-sm">
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={idx + 3} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0.45" result="alpha" />
          <feComposite in="SourceGraphic" in2="alpha" operator="in" />
        </filter>
        <path id={`arc-${id}`} d="M 60 60 m -42 0 a 42 42 0 1 1 84 0" />
      </defs>
      <g filter={`url(#${id})`} opacity="0.92" style={{ color: ink }}>
        {rect ? (
          <>
            <rect x="8" y="22" width="104" height="76" rx="6" fill="none" stroke={ink} strokeWidth="4" />
            <rect x="15" y="29" width="90" height="62" rx="3" fill="none" stroke={ink} strokeWidth="1.5" />
            <text x="60" y="44" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={ink} letterSpacing="1.5">{name}</text>
            <Icon x="47" y="48" width="26" height="26" stroke={ink} strokeWidth={2} />
            <text x="60" y="86" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink} letterSpacing="1">{fmt(earnedAt)}</text>
          </>
        ) : (
          <>
            <circle cx="60" cy="60" r="54" fill="none" stroke={ink} strokeWidth="4" />
            <circle cx="60" cy="60" r="47" fill="none" stroke={ink} strokeWidth="1.5" />
            <circle cx="60" cy="60" r="32" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="2 3" />
            <text fontSize="8.5" fontWeight="800" fill={ink} letterSpacing="2">
              <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">{name}</textPath>
            </text>
            <Icon x="46" y="44" width="28" height="28" stroke={ink} strokeWidth={2} />
            <text x="60" y="88" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink} letterSpacing="1">{fmt(earnedAt)}</text>
            <text x="60" y="100" textAnchor="middle" fontSize="6" fontWeight="700" fill={ink} letterSpacing="1.5">CEDAR RIDGE</text>
          </>
        )}
      </g>
    </svg>
  )
}

/** Dashed gap for a stamp not yet earned. */
export function StampGap({ badge, size = 112 }) {
  const Icon = badgeIcon(badge.icon)
  const rect = badge.category === 'Verified Demonstration'
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {rect ? <rect x="8" y="22" width="104" height="76" rx="6" fill="none" stroke="#C9CBD0" strokeWidth="2.5" strokeDasharray="6 5" /> : <circle cx="60" cy="60" r="54" fill="none" stroke="#C9CBD0" strokeWidth="2.5" strokeDasharray="6 5" />}
      <Icon x="46" y="44" width="28" height="28" stroke="#C9CBD0" strokeWidth={1.8} opacity="0.8" />
      <text x="60" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill="#C9CBD0" letterSpacing="1">{badge.name.toUpperCase()}</text>
    </svg>
  )
}

/** Stamp slot with hover tooltip. earned: { earned_at, evidence } | null */
export function StampSlot({ badge, earned, idx = 0, size = 112, className = '' }) {
  const [hover, setHover] = useState(false)
  const rotate = [-7, 5, -4, 8, -9, 3][idx % 6]
  const rarity = RARITY[badge.rarity] || RARITY.common
  return (
    <div className={cx('relative flex flex-col items-center', className)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)} tabIndex={0}>
      <div className={cx('transition-transform duration-200', hover && 'scale-105')}>
        {earned ? <StampSeal badge={badge} earnedAt={earned.earned_at} size={size} rotate={rotate} idx={idx} /> : <StampGap badge={badge} size={size} />}
      </div>
      <div className={cx('text-[11px] font-semibold mt-1 text-center leading-tight', earned ? 'text-charcoal' : 'text-charcoal-300')}>{badge.name}</div>
      {hover && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 card p-3.5 text-left shadow-soft fade-up pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="font-extrabold text-charcoal text-sm">{badge.name}</div>
            <Pill tone={rarity.tone}>{rarity.label}</Pill>
          </div>
          <div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold mb-1.5">{badge.category}</div>
          <p className="text-xs text-charcoal-500">{badge.description}</p>
          <div className="mt-2 rounded-xl bg-cloud p-2 text-xs text-charcoal-500">
            <span className="font-bold text-charcoal">{earned ? 'Evidence: ' : 'How to earn: '}</span>{earned ? earned.evidence : badge.how_to_earn}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <SkillChip skill={badge.skill} />
            {earned ? <span className="text-[11px] text-charcoal-400">{fmt(earned.earned_at)}</span> : <span className="text-[11px] text-charcoal-300 flex items-center gap-1"><Lock size={10} /> not yet</span>}
          </div>
        </div>
      )}
    </div>
  )
}
