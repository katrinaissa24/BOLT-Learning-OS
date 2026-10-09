import { cx } from '../../lib/utils'

/** BOLT mark: graduate figure + lightning bolt, drawn after the EduBolt brand icon. */
export function BoltMark({ size = 36, dark = false, className = '' }) {
  const ink = dark ? '#FFFFFF' : '#353B48'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M22 30 C 34 20, 44 26, 56 22 C 50 32, 40 36, 26 34 Z" fill={ink} />
      <circle cx="46" cy="14" r="6" fill={ink} />
      <path d="M38 10 L52 6 L50 12 L41 15 Z" fill={ink} />
      <path d="M36 32 L22 56 H32 L28 70 L46 44 H36 Z" fill="#FF9900" transform="translate(0,-8)" />
    </svg>
  )
}

export function Logo({ size = 'md', dark = false, className = '', tagline = false }) {
  const sizes = { sm: ['text-xl', 28], md: ['text-2xl', 36], lg: ['text-4xl', 52], xl: ['text-6xl', 76] }
  const [text, mark] = sizes[size]
  return (
    <div className={cx('flex items-center gap-2 select-none', className)}>
      <BoltMark size={mark} dark={dark} />
      <div className="leading-none">
        <div className={cx('font-extrabold tracking-tight', text, dark ? 'text-white' : 'text-charcoal')}>
          BOLT<span className="text-mango">.</span>
        </div>
        {tagline && <div className={cx('font-hand text-mango mt-1', size === 'xl' ? 'text-3xl' : 'text-lg')}>boring old learning, transformed</div>}
      </div>
    </div>
  )
}
