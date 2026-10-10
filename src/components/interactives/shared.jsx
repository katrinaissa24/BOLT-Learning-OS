import { useEffect, useRef } from 'react'
import { Eye } from 'lucide-react'
import { cx } from '../../lib/utils'

/** Brand palette for drawings (course accents are passed in by the caller where needed). */
export const C = {
  mango: '#FF9900', mangoSoft: '#FFE5BF', mangoFaint: '#FFF4E5',
  ink: '#353B48', ink400: '#6C717B', ink300: '#9EA1A8', ink200: '#C9CBD0', ink100: '#E6E8EC', ink50: '#F4F5F7',
  success: '#2FA36B', successSoft: '#E3F5EB', danger: '#E0493B', dangerSoft: '#FCE8E6', info: '#3B82F6', infoSoft: '#E8F0FE',
}

/** Two-column simulation frame: drawing on the left, controls on the right, caption underneath. */
export function SimFrame({ title, framing, children, controls, caption, footer }) {
  return (
    <div>
      {(title || framing) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-extrabold text-charcoal">{title}</h3>}
          {framing && <p className="text-sm text-charcoal-400 mt-1">{framing}</p>}
        </div>
      )}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div className="rounded-2xl bg-cloud border border-charcoal-100 p-3 min-w-0 overflow-hidden">{children}</div>
        <div className="space-y-4">{controls}</div>
      </div>
      {caption && (
        <div className="mt-4 flex gap-3 rounded-2xl bg-mango-50 border border-mango-200 p-4 text-sm text-charcoal">
          <Eye size={18} className="shrink-0 mt-0.5 text-mango" />
          <div><span className="font-hand text-mango text-lg leading-none mr-2">what you’re seeing</span>{caption}</div>
        </div>
      )}
      {footer}
    </div>
  )
}

export function Readout({ label, value, unit = '', tone = 'neutral', className = '' }) {
  const cls = { neutral: 'bg-white border-charcoal-100', mango: 'bg-mango-50 border-mango-200', success: 'bg-success-soft border-success/30', danger: 'bg-danger-soft border-danger/30', info: 'bg-info-soft border-info/30' }[tone]
  return (
    <div className={cx('rounded-xl border px-3 py-2', cls, className)}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-charcoal-400">{label}</div>
      <div className="text-lg font-extrabold text-charcoal leading-tight tabular-nums">{value}<span className="text-xs font-semibold text-charcoal-400 ml-1">{unit}</span></div>
    </div>
  )
}

export function ReadoutGrid({ children, cols = 2 }) {
  return <div className={cx('grid gap-2', cols === 3 ? 'grid-cols-3' : 'grid-cols-2')}>{children}</div>
}

/** Segmented toggle. options: [{ value, label }] */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div>
      {label && <div className="text-xs font-semibold text-charcoal-500 mb-1">{label}</div>}
      <div className="inline-flex p-1 rounded-xl bg-charcoal-100 gap-1 flex-wrap w-full">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cx('flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all', value === o.value ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-400 hover:text-charcoal')}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

export function ControlCard({ title, children }) {
  return (
    <div className="card p-4 space-y-3">
      {title && <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{title}</div>}
      {children}
    </div>
  )
}

/** requestAnimationFrame loop. cb(dtSeconds). Stops cleanly on unmount. */
export function useAnimationFrame(cb, running) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    if (!running) return
    let id, last = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      cbRef.current(dt)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [running])
}

/** Linear scale helper: maps domain [d0,d1] to range [r0,r1]. */
export const scale = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)

/** Polyline path from [[x,y],...] */
export const pathFrom = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

/** Simple axes with ticks for a plotting area. */
export function Axes({ x0, y0, x1, y1, xTicks = [], yTicks = [], sx, sy, xLabel, yLabel, fmtX = (v) => v, fmtY = (v) => v }) {
  return (
    <g fontSize="10" fill={C.ink400} fontFamily="Montserrat, sans-serif">
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink200} />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke={C.ink200} />
      {xTicks.map((t) => <g key={`x${t}`}><line x1={sx(t)} y1={y0} x2={sx(t)} y2={y0 + 4} stroke={C.ink200} /><text x={sx(t)} y={y0 + 14} textAnchor="middle">{fmtX(t)}</text></g>)}
      {yTicks.map((t) => <g key={`y${t}`}><line x1={x0 - 4} y1={sy(t)} x2={x0} y2={sy(t)} stroke={C.ink200} /><text x={x0 - 7} y={sy(t) + 3} textAnchor="end">{fmtY(t)}</text></g>)}
      {xLabel && <text x={x1} y={y0 + 28} textAnchor="end" fontWeight="600">{xLabel}</text>}
      {yLabel && <text x={x0} y={y1 - 8} textAnchor="start" fontWeight="600">{yLabel}</text>}
    </g>
  )
}

export const fmt = (v, d = 1) => (Number.isFinite(v) ? Number(v).toFixed(d) : '—')
