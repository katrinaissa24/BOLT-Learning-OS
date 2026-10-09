import { Card } from '../ui'
import { cx } from '../../lib/utils'

const STATUS = { present: 'bg-success text-white', late: 'bg-mango text-white', absent: 'bg-danger text-white', excused: 'bg-info text-white' }
const MONTHS = [{ key: '2026-09', label: 'September' }, { key: '2026-10', label: 'October' }]

/** Sep–Oct attendance calendar: one cell per school day, colored by status. Future days are outlined. */
export default function AttendanceHeat({ rows, today = '2026-10-09' }) {
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r]))
  return (
    <Card>
      <div className="grid sm:grid-cols-2 gap-6">
        {MONTHS.map((m) => {
          const [y, mo] = m.key.split('-').map(Number)
          const firstDow = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() // 0 Sun
          const daysIn = new Date(Date.UTC(y, mo, 0)).getUTCDate()
          const cells = []
          const offset = (firstDow + 6) % 7 // Monday-first
          for (let i = 0; i < offset; i++) cells.push(null)
          for (let d = 1; d <= daysIn; d++) cells.push(`${m.key}-${String(d).padStart(2, '0')}`)
          const present = Object.values(byDate).filter((r) => r.date.startsWith(m.key) && r.status === 'present').length
          const total = Object.values(byDate).filter((r) => r.date.startsWith(m.key)).length
          return (
            <div key={m.key}>
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-extrabold text-charcoal">{m.label}</div>
                <div className="text-xs text-charcoal-400">{present}/{total} present{total && present === total ? ' · perfect' : ''}</div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-[10px] text-charcoal-400 font-semibold mb-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center">{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((date, i) => {
                  if (!date) return <div key={i} />
                  const r = byDate[date]
                  const dow = i % 7
                  const weekend = dow >= 5
                  const future = date > today
                  const isToday = date === today
                  return (
                    <div key={date} title={r ? `${date} · ${r.status}${r.note ? ` · ${r.note}` : ''}` : date} className={cx('aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums', r ? STATUS[r.status] : weekend ? 'text-charcoal-200' : future ? 'border border-dashed border-charcoal-200 text-charcoal-300' : 'bg-charcoal-100 text-charcoal-400', isToday && 'ring-2 ring-offset-1 ring-charcoal')}>{Number(date.slice(-2))}</div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-charcoal-100 text-xs text-charcoal-500">
        {[['present', 'Present'], ['late', 'Late'], ['absent', 'Absent'], ['excused', 'Excused']].map(([k, l]) => <span key={k} className="inline-flex items-center gap-1.5"><span className={cx('w-3 h-3 rounded', STATUS[k])} />{l}</span>)}
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-dashed border-charcoal-300" />Upcoming</span>
      </div>
    </Card>
  )
}
