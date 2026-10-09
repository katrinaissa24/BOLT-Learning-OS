import { Radar, Wand2, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui'
import { cx } from '../../lib/utils'

const STEPS = [
  { key: 'detected', label: 'Detected', icon: Radar },
  { key: 'assigned', label: 'Practice assigned', icon: Wand2 },
  { key: 'recheck', label: 'Re-check', icon: RefreshCcw },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
]

/**
 * items: [{ topic, course, color, score, steps: { detected: 'Sep 24', assigned: 'Sep 24', recheck: null|'...', resolved: null|'...' }, note }]
 */
export default function InterventionTimeline({ items }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {items.map((it) => {
        const doneCount = STEPS.filter((s) => it.steps[s.key]).length
        return (
          <Card key={it.topic}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: it.color }}>{it.course}</div>
                <h3 className="font-extrabold text-charcoal text-lg leading-tight">{it.topic}</h3>
              </div>
              <div className="text-right"><div className="text-2xl font-extrabold tabular-nums text-charcoal">{it.score}%</div><div className="text-[11px] text-charcoal-400">when detected</div></div>
            </div>
            <ol className="relative ml-4 border-l-2 border-charcoal-100 space-y-5">
              {STEPS.map((s, i) => {
                const when = it.steps[s.key]
                const active = !when && i === doneCount
                const Icon = s.icon
                return (
                  <li key={s.key} className="pl-6 relative">
                    <span className={cx('absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white', when ? 'bg-success text-white' : active ? 'bg-mango text-white animate-pulse' : 'bg-charcoal-100 text-charcoal-300')}><Icon size={12} /></span>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className={cx('text-sm font-bold', when ? 'text-charcoal' : active ? 'text-mango-700' : 'text-charcoal-300')}>{s.label}</div>
                      <div className="text-[11px] text-charcoal-400 whitespace-nowrap">{when || (active ? 'pending' : '—')}</div>
                    </div>
                    {it.detail?.[s.key] && <p className="text-xs text-charcoal-400 mt-0.5 leading-relaxed">{it.detail[s.key]}</p>}
                  </li>
                )
              })}
            </ol>
          </Card>
        )
      })}
    </div>
  )
}
