import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { cx, initials } from '../../lib/utils'
export { Logo } from './Logo'

/* ───────── Buttons ───────── */
const btnBase = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-mango/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
const btnVariants = {
  primary: 'bg-mango text-white hover:bg-mango-600 shadow-[0_6px_16px_-6px_rgba(255,153,0,0.7)]',
  dark: 'bg-charcoal text-white hover:bg-charcoal-700',
  secondary: 'bg-white text-charcoal border border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50',
  ghost: 'bg-transparent text-charcoal hover:bg-charcoal-100',
  soft: 'bg-mango-50 text-mango-700 hover:bg-mango-100',
  danger: 'bg-danger text-white hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
}
const btnSizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-base px-6 py-3.5' }
export function Button({ variant = 'primary', size = 'md', className = '', as, to, href, loading, children, ...rest }) {
  const cls = cx(btnBase, btnVariants[variant], btnSizes[size], className)
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  const Tag = as || 'button'
  return <Tag className={cls} disabled={loading || rest.disabled} {...rest}>{loading && <Loader2 size={16} className="animate-spin" />}{children}</Tag>
}

/* ───────── Card ───────── */
export function Card({ className = '', children, padded = true, as: Tag = 'div', ...rest }) {
  return <Tag className={cx('card', padded && 'p-5', className)} {...rest}>{children}</Tag>
}

/* ───────── Pills / tags ───────── */
const tones = {
  neutral: 'bg-charcoal-100 text-charcoal-500',
  mango: 'bg-mango-50 text-mango-700',
  dark: 'bg-charcoal text-white',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-mango-700',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  outline: 'border border-charcoal-200 text-charcoal-500',
}
export function Pill({ tone = 'neutral', className = '', children, icon: Icon, ...rest }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap', tones[tone], className)} {...rest}>{Icon && <Icon size={11} />}{children}</span>
}
export function StatusPill({ status }) {
  const map = { ahead: ['success', 'Ahead'], 'on-track': ['info', 'On track'], behind: ['warning', 'Behind'], 'at-risk': ['danger', 'At risk'], completed: ['success', 'Completed'], 'in-progress': ['mango', 'In progress'], locked: ['neutral', 'Locked'], pending: ['warning', 'Pending'], validated: ['success', 'Validated'], submitted: ['info', 'Submitted'], graded: ['success', 'Graded'], flagged: ['danger', 'Flagged'], present: ['success', 'Present'], late: ['warning', 'Late'], absent: ['danger', 'Absent'], excused: ['info', 'Excused'] }
  const [tone, label] = map[status] || ['neutral', status]
  return <Pill tone={tone}>{label}</Pill>
}

/** Marks features that are proposed ideas with sample data, pending the user's decision. */
export function SuggestedTag({ className = '' }) {
  return <Pill tone="dark" icon={Sparkles} className={cx('normal-case tracking-normal', className)} title="Suggested feature — sample data, pending your decision to keep or remove">Suggested</Pill>
}

/** (AI) label: marks every feature that calls Claude. */
export function AITag({ className = '' }) {
  return <span title="AI feature (Claude Sonnet)" className={cx('inline-flex items-center gap-1 rounded-full bg-charcoal text-mango px-2 py-0.5 text-[10px] font-extrabold tracking-wide align-middle shrink-0', className)}><Sparkles size={10} /> AI</span>
}

/* ───────── Section header with brand squiggle ───────── */
export function SectionHeader({ title, subtitle, action, squiggle = true, className = '', eyebrow, children }) {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-3 mb-5', className)}>
      <div>
        {eyebrow && <div className="font-hand text-mango text-xl leading-none mb-1">{eyebrow}</div>}
        <h2 className={cx('text-2xl font-extrabold tracking-tight text-charcoal', squiggle && 'squiggle')}>{title}</h2>
        {subtitle && <p className="text-sm text-charcoal-400 mt-3 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

export function PageTitle({ title, subtitle, action, eyebrow }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div className="font-hand text-mango text-2xl leading-none mb-1">{eyebrow}</div>}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal">{title}</h1>
        {subtitle && <p className="text-charcoal-400 mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

/* ───────── Stat tile ───────── */
export function StatTile({ label, value, hint, icon: Icon, tone = 'mango', className = '' }) {
  const toneCls = { mango: 'bg-mango-50 text-mango', dark: 'bg-charcoal text-white', success: 'bg-success-soft text-success', danger: 'bg-danger-soft text-danger', info: 'bg-info-soft text-info', neutral: 'bg-charcoal-100 text-charcoal-500' }[tone]
  return (
    <Card className={cx('flex items-center gap-4', className)}>
      {Icon && <div className={cx('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', toneCls)}><Icon size={20} /></div>}
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{label}</div>
        <div className="text-2xl font-extrabold text-charcoal leading-tight">{value}</div>
        {hint && <div className="text-xs text-charcoal-400 truncate">{hint}</div>}
      </div>
    </Card>
  )
}

/* ───────── Progress ───────── */
export function ProgressBar({ value = 0, tone = 'mango', className = '', height = 'h-2', label }) {
  const bar = { mango: 'bg-mango', success: 'bg-success', danger: 'bg-danger', info: 'bg-info', dark: 'bg-charcoal' }[tone]
  return (
    <div className={cx('w-full', className)}>
      {label && <div className="flex justify-between text-xs text-charcoal-400 mb-1"><span>{label}</span><span className="font-semibold text-charcoal">{Math.round(value)}%</span></div>}
      <div className={cx('w-full rounded-full bg-charcoal-100 overflow-hidden', height)}>
        <div className={cx('h-full rounded-full transition-all duration-700', bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}
/**
 * Score bands: 0–29 red, 30–59 yellow (both "weak"), 60–79 orange into yellow, 80+ green.
 * A weak bar reveals a track-wide gradient, so the first 30% is always red and the
 * stretch from 30% to 60% is yellow. A 51% bar shows red then yellow; a 25% bar is all red.
 */
export const WEAK_GRADIENT = 'linear-gradient(90deg, var(--color-danger) 0%, var(--color-danger) 26%, var(--color-caution) 34%, var(--color-caution) 100%)'
/** 60–79%: orange into yellow, no red. */
export const FORMING_GRADIENT = 'linear-gradient(90deg, var(--color-mango) 0%, var(--color-mango) 35%, var(--color-caution) 100%)'
export const scoreBand = (s) => (s >= 80 ? 'strong' : s >= 60 ? 'forming' : s >= 30 ? 'weak' : 'critical')
export const scoreTextClass = (s) => ({ strong: 'text-success', forming: 'text-mango-700', weak: 'text-caution-ink', critical: 'text-danger' }[scoreBand(s)])
export function ScoreBar({ score, className = '' }) {
  const v = Math.min(100, Math.max(0, Number(score) || 0))
  if (v >= 80) return <ProgressBar value={v} tone="success" className={className} />
  if (v >= 60) {
    return (
      <div className={cx('w-full h-2 rounded-full bg-charcoal-100 overflow-hidden', className)} role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: FORMING_GRADIENT }} />
      </div>
    )
  }
  return (
    <div className={cx('w-full h-2 rounded-full bg-charcoal-100 overflow-hidden', className)} role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full overflow-hidden transition-all duration-700" style={{ width: `${v}%` }}>
        <div className="h-full" style={{ width: v ? `${10000 / v}%` : 0, background: WEAK_GRADIENT }} />
      </div>
    </div>
  )
}

/* ───────── Avatar ───────── */
const avatarColors = ['bg-mango text-white', 'bg-charcoal text-white', 'bg-info text-white', 'bg-success text-white', 'bg-[#E255A1] text-white', 'bg-[#8B5CF6] text-white']
export function Avatar({ name = '', size = 'md', className = '' }) {
  const s = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }[size]
  const color = avatarColors[(name.charCodeAt(0) + name.length) % avatarColors.length]
  return <div className={cx('rounded-full flex items-center justify-center font-bold shrink-0', s, color, className)} title={name}>{initials(name)}</div>
}

/* ───────── Modal ───────── */
export function Modal({ open, onClose, title, children, wide = false, className = '' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx('bg-white rounded-3xl shadow-2xl w-full max-h-[92vh] overflow-y-auto', wide ? 'max-w-5xl' : 'max-w-2xl', className)}>
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0 bg-white/95 backdrop-blur z-10">
            <h3 className="text-xl font-extrabold text-charcoal">{title}</h3>
            {onClose && <button onClick={onClose} className="p-2 rounded-full hover:bg-charcoal-100" aria-label="Close"><X size={18} /></button>}
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/* ───────── Empty / loading ───────── */
export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="text-center py-12 px-6">
      {Icon && <div className="mx-auto w-14 h-14 rounded-2xl bg-mango-50 text-mango flex items-center justify-center mb-4"><Icon size={26} /></div>}
      <h3 className="text-lg font-bold text-charcoal">{title}</h3>
      {text && <p className="text-sm text-charcoal-400 mt-1 max-w-md mx-auto">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
export function Spinner({ className = '' }) { return <Loader2 className={cx('animate-spin text-mango', className)} /> }

/* ───────── Inputs ───────── */
export function Input({ className = '', label, hint, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">{label}</span>}
      <input className={cx('w-full rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-300 focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20', className)} {...rest} />
      {hint && <span className="block text-xs text-charcoal-400 mt-1">{hint}</span>}
    </label>
  )
}
export function Textarea({ className = '', label, ...rest }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">{label}</span>}
      <textarea className={cx('w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-300 focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20', className)} {...rest} />
    </label>
  )
}
export function Slider({ label, value, min, max, step = 1, onChange, unit = '', format }) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-charcoal-500">{label}</span><span className="font-bold text-mango">{format ? format(value) : `${value}${unit}`}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  )
}

/* ───────── Tabs ───────── */
export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={cx('inline-flex p-1 rounded-2xl bg-charcoal-100 gap-1 flex-wrap', className)}>
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)} className={cx('px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2', value === t.value ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-400 hover:text-charcoal')}>
          {t.icon && <t.icon size={15} />}{t.label}
        </button>
      ))}
    </div>
  )
}

/* ───────── Skill chip ───────── */
import { SKILLS } from '../../data/seed'
export function SkillChip({ skill, className = '' }) {
  const s = SKILLS[skill] || { name: skill, color: '#6C717B' }
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white', className)} style={{ background: s.color }}>{s.name}</span>
}

/* ───────── Callout ───────── */
export function Callout({ tone = 'mango', icon: Icon, title, children, className = '' }) {
  const cls = { mango: 'bg-mango-50 border-mango-200 text-charcoal', success: 'bg-success-soft border-success/30', danger: 'bg-danger-soft border-danger/30', info: 'bg-info-soft border-info/30', dark: 'bg-charcoal text-white border-charcoal' }[tone]
  return (
    <div className={cx('rounded-2xl border p-4 flex gap-3', cls, className)}>
      {Icon && <Icon size={20} className="shrink-0 mt-0.5" />}
      <div className="text-sm">{title && <div className="font-bold mb-0.5">{title}</div>}{children}</div>
    </div>
  )
}
