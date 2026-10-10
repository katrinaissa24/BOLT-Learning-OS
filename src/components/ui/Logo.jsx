import { cx } from '../../lib/utils'

/** BOLT wordmark. */
export function Logo({ size = 'md', dark = false, className = '', tagline = false }) {
  const text = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }[size]
  return (
    <div className={cx('select-none leading-none', className)}>
      <div className={cx('font-extrabold tracking-tight', text, dark ? 'text-white' : 'text-charcoal')}>
        BOLT<span className="text-mango">.</span>
      </div>
      {tagline && <div className={cx('font-hand text-mango mt-1', size === 'xl' ? 'text-3xl' : 'text-lg')}>boring old learning, transformed</div>}
    </div>
  )
}
