import { useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowUpDown, Search, ArrowRight } from 'lucide-react'
import { PageTitle, Card, Pill, StatusPill, Avatar, Tabs, Input, SectionHeader } from '../../components/ui'
import { useData } from '../../lib/data'
import { studentsOf, studentOverview, attendanceSummary, courseById, studentBadges, profileById } from '../../lib/selectors'
import { STATUS_ORDER, STATUS_LABEL, STATUS_COLOR, scoreTint } from '../../components/teacher/charts'
import TopicHeatmap from '../../components/teacher/TopicHeatmap'
import StudentDetail from '../../components/teacher/StudentDetail'
import { ExamRiskForecast } from '../../components/teacher/ideas'
import { cx } from '../../lib/utils'

export default function Tracker() {
  const { db } = useData()
  const { studentId } = useParams()
  if (studentId) {
    const student = profileById(db, studentId)
    if (!student) return <Navigate to="/teacher/tracker" replace />
    return <StudentDetail db={db} student={student} />
  }
  return <TrackerGrid db={db} />
}

function TrackerGrid({ db }) {
  const [course, setCourse] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('status')
  const [query, setQuery] = useState('')
  const [forecastCourse, setForecastCourse] = useState('math-12')

  const rows = useMemo(() => studentsOf(db).map((s) => ({ student: s, ov: studentOverview(db, s.id), att: attendanceSummary(db, s.id), badges: studentBadges(db, s.id).length })), [db])
  const courses = course === 'all' ? db.courses : db.courses.filter((c) => c.id === course)
  const statusOf = (r) => (course === 'all' ? r.ov.status : r.ov.courses.find((c) => c.courseId === course).status)
  const filtered = rows
    .filter((r) => status === 'all' || statusOf(r) === status)
    .filter((r) => !query || r.student.full_name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.student.full_name.localeCompare(b.student.full_name)
      if (sort === 'score') return b.ov.avgScore - a.ov.avgScore
      if (sort === 'attendance') return b.att.rate - a.att.rate
      return STATUS_ORDER.indexOf(statusOf(b)) - STATUS_ORDER.indexOf(statusOf(a)) || a.ov.avgScore - b.ov.avgScore
    })
  const counts = STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: rows.filter((r) => statusOf(r) === s).length }), {})

  return (
    <div className="space-y-8">
      <PageTitle eyebrow="at a glance" title="Progress Tracker" subtitle="Every student on every journey. Status, checkpoints and average score per course — click a name for the full picture." />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs tabs={[{ value: 'all', label: 'All courses' }, ...db.courses.map((c) => ({ value: c.id, label: c.subject }))]} value={course} onChange={setCourse} />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setStatus('all')} className={cx('rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors', status === 'all' ? 'bg-charcoal text-white border-charcoal' : 'bg-white border-charcoal-200 text-charcoal-500 hover:border-charcoal-300')}>All · {rows.length}</button>
          {STATUS_ORDER.map((s) => (
            <button key={s} onClick={() => setStatus(status === s ? 'all' : s)} className={cx('rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors inline-flex items-center gap-1.5', status === s ? 'text-white' : 'bg-white border-charcoal-200 text-charcoal-500 hover:border-charcoal-300')} style={status === s ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] } : undefined}>
              {status !== s && <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />}{STATUS_LABEL[s]} · {counts[s]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a student" className="rounded-xl border border-charcoal-200 bg-white pl-8 pr-3 py-2 text-sm w-44 focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20" /></div>
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-400"><ArrowUpDown size={13} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-charcoal-200 bg-white px-2 py-2 text-sm text-charcoal focus:outline-none focus:border-mango">
              <option value="status">Sort: needs attention first</option><option value="score">Sort: average score</option><option value="attendance">Sort: attendance</option><option value="name">Sort: name</option>
            </select>
          </label>
        </div>
      </div>

      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-charcoal-400 border-b border-charcoal-100">
              <th className="px-5 py-3 font-semibold">Student</th>
              {courses.map((c) => <th key={c.id} className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.title.split(':')[0]}</span></th>)}
              <th className="px-4 py-3 font-semibold">Attendance</th>
              <th className="px-4 py-3 font-semibold text-right">Stamps</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.student.id} className="border-b border-charcoal-50 last:border-0 hover:bg-cloud/70 transition-colors">
                <td className="px-5 py-3">
                  <Link to={`/teacher/tracker/${r.student.id}`} className="flex items-center gap-3">
                    <Avatar name={r.student.full_name} size="sm" />
                    <div className="leading-tight"><div className="font-bold text-charcoal">{r.student.full_name}</div><div className="text-[11px] text-charcoal-400">avg {r.ov.avgScore}% · {r.ov.totalPoints.toLocaleString()} pts</div></div>
                  </Link>
                </td>
                {courses.map((c) => {
                  const s = r.ov.courses.find((x) => x.courseId === c.id)
                  return (
                    <td key={c.id} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusPill status={s.status} />
                        <span className="font-semibold text-charcoal tabular-nums">{s.completed}/{s.total}</span>
                        <span className={cx('rounded-lg px-1.5 py-0.5 text-xs font-bold tabular-nums', s.completed ? scoreTint(s.avgScore) : 'bg-charcoal-100 text-charcoal-400')}>{s.completed ? `${s.avgScore}%` : '—'}</span>
                      </div>
                    </td>
                  )
                })}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cx('font-semibold tabular-nums', r.att.absent >= 3 ? 'text-danger' : 'text-charcoal')}>{r.att.rate}%</span>
                    {r.att.absent > 0 && <span className="text-[11px] text-charcoal-400">{r.att.absent} abs</span>}
                    {r.att.flags.length > 0 && <Pill tone="warning">conflict</Pill>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.badges}</td>
                <td className="px-3 py-3"><Link to={`/teacher/tracker/${r.student.id}`} className="text-charcoal-300 hover:text-mango"><ArrowRight size={16} /></Link></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={courses.length + 4} className="px-5 py-10 text-center text-charcoal-400">No students match these filters.</td></tr>}
          </tbody>
        </table>
      </Card>

      <TopicHeatmap db={db} defaultCourse={course === 'all' ? 'math-12' : course} />

      <section>
        <SectionHeader eyebrow="looking ahead" title="Before the exam" subtitle="Projected exam scores per course, so you can intervene weeks before the paper — not after." action={<Tabs tabs={db.courses.map((c) => ({ value: c.id, label: c.subject }))} value={forecastCourse} onChange={setForecastCourse} />} />
        <ExamRiskForecast db={db} courseId={forecastCourse} />
      </section>
    </div>
  )
}
