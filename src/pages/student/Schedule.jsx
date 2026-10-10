import { Link } from 'react-router-dom'
import { CalendarDays, Flame, AlertTriangle, PartyPopper, CheckCircle2, Clock, XCircle, FileText, MapPin } from 'lucide-react'
import { PageTitle, Card, StatTile, Callout, SectionHeader, Pill, Button } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { attendanceSummary, courseById } from '../../lib/selectors'
import { cx, monthLabel } from '../../lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const TODAY_DOW = 5 // Friday 9 Oct 2026
const STATUS_STYLE = { present: 'bg-success text-white', late: 'bg-mango text-white', absent: 'bg-danger text-white', excused: 'bg-info text-white' }

function MonthGrid({ month, rows, flags }) {
  const [y, m] = month.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1, 1))
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r]))
  const cells = []
  const lead = (first.getUTCDay() + 6) % 7 // Monday = 0
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, '0')}`)
  return (
    <div>
      <div className="text-sm font-bold text-charcoal mb-2">{monthLabel(month)}</div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-charcoal-400 font-semibold mb-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />
          const r = byDate[date]
          const dow = (lead + i) % 7
          const weekend = dow >= 5
          const future = date > '2026-10-09'
          const isToday = date === '2026-10-09'
          const flagged = r && flags.some((f) => f.date === date)
          return (
            <div key={date} title={r ? `${date}: ${r.status}${r.note ? ' — ' + r.note : ''}` : date} className={cx('aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold relative', weekend ? 'bg-transparent text-charcoal-200' : future ? 'bg-charcoal-50 text-charcoal-300' : r ? STATUS_STYLE[r.status] : 'bg-charcoal-100 text-charcoal-400', isToday && 'ring-2 ring-charcoal ring-offset-1')}>
              {Number(date.slice(-2))}
              {flagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-danger border border-white" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Schedule() {
  const { profile } = useAuth()
  const { db } = useData()
  const att = attendanceSummary(db, profile.id)
  const starts = [...new Set(db.schedule.map((s) => s.start))].sort()
  const slot = (day, start) => db.schedule.find((s) => s.day === day && s.start === start)
  const celebrate = att.streak >= 20 || att.perfectMonths.length > 0

  return (
    <div>
      <PageTitle eyebrow="this week" title="Schedule & Attendance" subtitle="Grade 12 · Section A timetable, and your attendance record since the first day of term. Showing up is a skill — BOLT stamps it." />

      {/* Timetable */}
      <Card padded={false} className="overflow-hidden mb-8">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-extrabold text-charcoal flex items-center gap-2"><CalendarDays size={18} className="text-mango" /> Weekly timetable</h3>
          <Pill tone="mango">Today · Friday 9 Oct</Pill>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="w-20 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Period</th>
                {DAYS.map((d, i) => <th key={d} className={cx('px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide', i + 1 === TODAY_DOW ? 'text-mango' : 'text-charcoal-400')}>{d}{i + 1 === TODAY_DOW && ' · today'}</th>)}
              </tr>
            </thead>
            <tbody>
              {starts.map((start) => (
                <tr key={start} className="border-t border-charcoal-100">
                  <td className="px-3 py-2 text-xs text-charcoal-400 align-top"><div className="font-bold text-charcoal">{start}</div>{slot(1, start)?.end}</td>
                  {DAYS.map((_, i) => {
                    const s = slot(i + 1, start)
                    const course = s?.course_id ? courseById(db, s.course_id) : null
                    const today = i + 1 === TODAY_DOW
                    return (
                      <td key={i} className={cx('px-2 py-2 align-top', today && 'bg-mango-50/60')}>
                        {s ? (
                          <div className="rounded-xl px-3 py-2 text-sm border-l-4 bg-white shadow-sm border border-charcoal-100" style={{ borderLeftColor: course?.color || '#C9CBD0' }}>
                            <div className="font-bold text-charcoal leading-tight">{s.label}</div>
                            <div className="text-[11px] text-charcoal-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {s.room}</div>
                          </div>
                        ) : <div className="h-12 rounded-xl border border-dashed border-charcoal-100" />}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex flex-wrap gap-4 text-xs text-charcoal-400 border-t border-charcoal-100">
          {db.courses.map((c) => <span key={c.id} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} /> {c.subject}</span>)}
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-charcoal-200" /> Other subjects</span>
        </div>
      </Card>

      {/* Attendance */}
      <SectionHeader eyebrow="showing up" title="Attendance" subtitle={`${att.total} school days since 1 September. Record kept by the office; BOLT flags anything that contradicts your activity.`} />

      {celebrate && (
        <Callout tone="success" icon={PartyPopper} title={`${att.streak} days straight — that's the Always Here stamp`} className="mb-5">
          {att.perfectMonths.length ? `${att.perfectMonths.map(monthLabel).join(', ')} was a perfect month: no absences, no lates. ` : ''}Keep October clean for a second stamp. <Link to="/student/passport" className="font-bold text-success underline">See it in your passport</Link>.
        </Callout>
      )}
      {att.flags.map((f) => (
        <Callout key={f.id} tone="danger" icon={AlertTriangle} title={`Record conflict on ${f.date} — ask the office to correct`} className="mb-5">{f.note}</Callout>
      ))}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatTile icon={CheckCircle2} label="Present" value={att.present} tone="success" />
        <StatTile icon={Clock} label="Late" value={att.late} tone="mango" />
        <StatTile icon={XCircle} label="Absent" value={att.absent} tone="danger" />
        <StatTile icon={FileText} label="Excused" value={att.excused} tone="info" />
        <StatTile icon={Flame} label="Streak" value={`${att.streak} days`} hint={`${att.rate}% rate`} tone="dark" />
      </div>

      <div className="grid md:grid-cols-[1fr_1fr_260px] gap-5">
        <Card><MonthGrid month="2026-09" rows={att.rows} flags={att.flags} /></Card>
        <Card><MonthGrid month="2026-10" rows={att.rows} flags={att.flags} /></Card>
        <Card className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Legend</div>
          {[['present', 'Present'], ['late', 'Late'], ['absent', 'Absent'], ['excused', 'Excused']].map(([k, l]) => <div key={k} className="flex items-center gap-2 text-sm text-charcoal"><span className={cx('w-5 h-5 rounded-md', STATUS_STYLE[k])} /> {l}</div>)}
          <div className="flex items-center gap-2 text-sm text-charcoal"><span className="w-5 h-5 rounded-md bg-charcoal-50 border border-charcoal-100" /> Upcoming</div>
          <div className="flex items-center gap-2 text-sm text-charcoal"><span className="w-5 h-5 rounded-md bg-white ring-2 ring-charcoal ring-offset-1" /> Today</div>
          <div className="mt-auto pt-3 border-t border-charcoal-100 text-xs text-charcoal-400">Hover a day to read the office note.</div>
          <Button to="/student/passport" variant="soft" size="sm">Attendance stamps</Button>
        </Card>
      </div>
    </div>
  )
}
