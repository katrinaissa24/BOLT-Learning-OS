/** Brand palette and shared recharts pieces for teacher pages. */
export const BRAND = {
  mango: '#FF9900',
  mangoSoft: '#FFE5BF',
  charcoal: '#353B48',
  charcoal200: '#C9CBD0',
  charcoal400: '#6C717B',
  grid: '#E6E8EC',
  success: '#2FA36B',
  danger: '#E0493B',
  caution: '#F5B800',
  cautionInk: '#9A6B00',
  info: '#3B82F6',
}

export const STATUS_COLOR = { ahead: BRAND.success, 'on-track': BRAND.info, behind: BRAND.mango, 'at-risk': BRAND.danger }
export const STATUS_LABEL = { ahead: 'Ahead', 'on-track': 'On track', behind: 'Behind', 'at-risk': 'At risk' }
export const STATUS_ORDER = ['ahead', 'on-track', 'behind', 'at-risk']

/** Fill color by score band: <30 red, 30–59 yellow, 60–79 mango, 80+ green. */
export const scoreColor = (s) => (s >= 80 ? BRAND.success : s >= 60 ? BRAND.mango : s >= 30 ? BRAND.caution : BRAND.danger)
/** Same bands, darkened where needed so text stays readable on white. */
export const scoreInk = (s) => (s >= 80 ? BRAND.success : s >= 60 ? '#C27400' : s >= 30 ? BRAND.cautionInk : BRAND.danger)
export const scoreTint = (s) => (s >= 80 ? 'bg-success-soft text-success' : s >= 60 ? 'bg-mango-50 text-mango-700' : s >= 30 ? 'bg-caution-soft text-caution-ink' : 'bg-danger-soft text-danger')

/** Card-styled tooltip for recharts. `render(payload, label)` returns rows. */
export function ChartTip({ active, payload, label, render, title }) {
  if (!active || !payload?.length) return null
  const rows = render ? render(payload, label) : payload.map((p) => ({ name: p.name, value: p.value, color: p.color || p.fill }))
  return (
    <div className="card p-3 text-xs shadow-soft min-w-[140px]">
      {(title || label) && <div className="font-bold text-charcoal mb-1.5">{title ?? label}</div>}
      <div className="space-y-1">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-charcoal-400">{r.color && <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />}{r.name}</span>
            <span className="font-bold text-charcoal">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const axisStyle = { fontSize: 11, fill: BRAND.charcoal400, fontFamily: 'Montserrat' }

/** Small legend dot + label used under charts. */
export function LegendRow({ items, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-400 ${className}`}>
      {items.map((it) => <span key={it.label} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: it.color }} />{it.label}</span>)}
    </div>
  )
}
