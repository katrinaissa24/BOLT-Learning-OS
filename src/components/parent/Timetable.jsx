import { Card } from '../ui'
import { cx } from '../../lib/utils'
import { courseById } from '../../lib/selectors'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const DATES = ['Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9']

/** Mon–Fri timetable grid from db.schedule; today (Friday) highlighted. */
export default function Timetable({ db, todayDay = 5 }) {
  const slots = [...new Set(db.schedule.map((s) => `${s.start}–${s.end}`))].sort()
  const byDaySlot = {}
  db.schedule.forEach((s) => { byDaySlot[`${s.day}-${s.start}–${s.end}`] = s })
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="grid" style={{ gridTemplateColumns: '92px repeat(5, minmax(0, 1fr))' }}>
        <div className="bg-charcoal-50 border-b border-charcoal-100 p-3" />
        {DAYS.map((d, i) => (
          <div key={d} className={cx('border-b border-charcoal-100 p-3 text-center', i + 1 === todayDay ? 'bg-mango text-white' : 'bg-charcoal-50')}>
            <div className="text-xs font-extrabold uppercase tracking-wide">{d}</div>
            <div className={cx('text-[11px]', i + 1 === todayDay ? 'text-white/80' : 'text-charcoal-400')}>{DATES[i]}{i + 1 === todayDay ? ' · today' : ''}</div>
          </div>
        ))}
        {slots.map((slot) => (
          <div key={slot} className="contents">
            <div className="border-b border-charcoal-100 p-3 text-[11px] font-semibold text-charcoal-400 tabular-nums leading-tight">{slot.replace('–', ' – ')}</div>
            {DAYS.map((_, i) => {
              const s = byDaySlot[`${i + 1}-${slot}`]
              const course = s?.course_id ? courseById(db, s.course_id) : null
              const today = i + 1 === todayDay
              return (
                <div key={i} className={cx('border-b border-l border-charcoal-100 p-2', today && 'bg-mango-50/60')}>
                  {s && (
                    <div className={cx('rounded-xl px-3 py-2 h-full text-xs', course ? 'text-white' : 'bg-charcoal-100 text-charcoal-500')} style={course ? { background: course.color } : undefined}>
                      <div className="font-bold leading-tight">{s.label}</div>
                      <div className={cx('text-[10px] mt-0.5', course ? 'text-white/80' : 'text-charcoal-400')}>{s.room}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Card>
  )
}
