import { useMemo } from 'react'
import { CalendarCheck, Flame, AlertTriangle, Clock, Sparkles, Flag } from 'lucide-react'
import { PageTitle, SectionHeader, StatTile, Callout, Card, Pill } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { parentLens, courseById } from '../../lib/selectors'
import Timetable from '../../components/parent/Timetable'
import AttendanceHeat from '../../components/parent/AttendanceHeat'
import { fmtDate } from '../../lib/utils'

export default function Schedule() {
  const { profile } = useAuth()
  const { db } = useData()
  const lens = useMemo(() => parentLens(db, profile.child_id), [db, profile.child_id])
  const first = lens.child.full_name.split(' ')[0]
  const att = lens.attendance
  const todayClasses = db.schedule.filter((s) => s.day === 5).sort((a, b) => a.start.localeCompare(b.start))
  const clean = att.absent === 0 && att.late === 0

  return (
    <div>
      <PageTitle eyebrow="where she is, when" title="Schedule & attendance" subtitle={`${first}’s week at Cedar Ridge and her attendance since the term started on September 1.`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Flame} tone="mango" label="Current streak" value={`${att.streak} days`} hint="present and on time" />
        <StatTile icon={CalendarCheck} tone="success" label="Attendance rate" value={`${att.rate}%`} hint={`${att.present} of ${att.total} school days`} />
        <StatTile icon={Clock} tone={att.late ? 'danger' : 'neutral'} label="Late arrivals" value={att.late} hint={att.late ? 'worth a chat' : 'none this term'} />
        <StatTile icon={AlertTriangle} tone={att.absent ? 'danger' : 'neutral'} label="Absences" value={att.absent} hint={att.absent ? `${att.excused} excused` : 'none this term'} />
      </div>

      {clean ? (
        <Callout tone="success" icon={Sparkles} title={`${att.streak} days straight — tell her you noticed.`} className="mb-8">
          Every school day since September 1, present and on time. {att.perfectMonths.length ? `September earned the “Always Here” stamp.` : ''} Consistency is a skill, and it is the one that makes everything else on this site possible.
        </Callout>
      ) : (
        <Callout tone="mango" icon={Flag} title="A few gaps this term" className="mb-8">
          {att.absent} absence{att.absent === 1 ? '' : 's'} and {att.late} late arrival{att.late === 1 ? '' : 's'}. A gentle question about what got in the way usually helps more than a rule.
        </Callout>
      )}

      <SectionHeader eyebrow="Monday to Friday" title="This week" subtitle="Today is highlighted. BOLT courses are colored; other subjects are gray." />
      <Timetable db={db} todayDay={5} />

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        <Card className="lg:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Today · Friday, October 9</div>
          <ul className="space-y-2.5">
            {todayClasses.map((s) => {
              const c = s.course_id ? courseById(db, s.course_id) : null
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-1.5 h-8 rounded-full" style={{ background: c?.color || '#C9CBD0' }} />
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold text-charcoal leading-tight">{s.label}</div><div className="text-[11px] text-charcoal-400">{s.start}–{s.end} · {s.room}</div></div>
                  {c && <Pill tone="outline" className="normal-case tracking-normal">BOLT</Pill>}
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-charcoal-400 mt-4 pt-3 border-t border-charcoal-100">Friday ends at 12:00 with Project Studio — {first} is working on her Bridge Load Simulator there.</p>
        </Card>
        <div className="lg:col-span-2">
          <AttendanceHeat rows={att.rows} />
        </div>
      </div>

      <SectionHeader className="mt-12" eyebrow="anything to look at?" title="Flags & notes" subtitle="BOLT cross-checks attendance with activity. If a mark looks wrong, the school is asked to correct it." />
      <Card>
        {att.flags.length ? (
          <ul className="space-y-3">{att.flags.map((f) => <li key={f.id} className="flex gap-3 text-sm"><Flag size={16} className="text-danger mt-0.5" /><div><span className="font-bold">{fmtDate(f.date)}</span> — {f.note}</div></li>)}</ul>
        ) : (
          <div className="flex items-center gap-3 text-sm text-charcoal-500"><div className="w-10 h-10 rounded-xl bg-success-soft text-success flex items-center justify-center"><CalendarCheck size={18} /></div>No flags, no conflicting records, no guardian notes needed. Nothing for you to do here — which is exactly the point.</div>
        )}
      </Card>
    </div>
  )
}
