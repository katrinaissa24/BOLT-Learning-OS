import { fmtTime } from '../../lib/utils'

const STYLE = {
  type: { color: '#353B48', label: 'typing' },
  delete: { color: '#E0493B', label: 'cut' },
  paste: { color: '#8B5CF6', label: 'paste' },
  ai_prompt: { color: '#3B82F6', label: 'asked BOLT' },
  ai_insert: { color: '#FF9900', label: 'AI insert' },
  pause: { color: '#C9CBD0', label: 'pause' },
  snapshot: { color: '#2FA36B', label: 'snapshot' },
}

/** Mini horizontal timeline of a process log (seed `process` shape). */
export default function ProcessTimeline({ events = [], total = 1, compact = false }) {
  const T = Math.max(1, total)
  const H = compact ? 34 : 48
  return (
    <div>
      <svg viewBox={`0 0 600 ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <line x1="0" y1={H / 2} x2="600" y2={H / 2} stroke="#E6E8EC" strokeWidth="2" />
        {events.map((e, i) => {
          const x = Math.min(598, Math.max(2, (e.t / T) * 600))
          const s = STYLE[e.type] || STYLE.type
          if (e.type === 'pause') return <rect key={i} x={x} y={H / 2 - 3} width={Math.max(2, ((e.seconds || 0) / T) * 600)} height="6" rx="3" fill={s.color} />
          if (e.type === 'type') return <rect key={i} x={x} y={H / 2 - 6} width={Math.max(2, Math.min(40, (e.chars || 0) / 8))} height="12" rx="2" fill={s.color} opacity="0.85"><title>{`${fmtTime(e.t)} · typed ${e.chars} chars`}</title></rect>
          if (e.type === 'snapshot') return <g key={i}><line x1={x} y1="4" x2={x} y2={H - 4} stroke={s.color} strokeWidth="2" /><title>{`${fmtTime(e.t)} · ${e.label}`}</title></g>
          const r = e.type === 'ai_insert' || e.type === 'paste' ? 6 : 5
          return <circle key={i} cx={x} cy={H / 2} r={r} fill={s.color} stroke="#fff" strokeWidth="1.5"><title>{`${fmtTime(e.t)} · ${s.label}${e.chars ? ` · ${e.chars} chars` : ''}${e.prompt ? ` · “${e.prompt.slice(0, 50)}”` : ''}`}</title></circle>
        })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        {Object.entries(STYLE).map(([k, s]) => <span key={k} className="flex items-center gap-1 text-[10px] text-charcoal-400"><span className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.label}</span>)}
        <span className="ml-auto text-[10px] text-charcoal-400 tabular-nums">{fmtTime(0)} → {fmtTime(T)}</span>
      </div>
    </div>
  )
}
