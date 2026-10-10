import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Users, AlertTriangle, FileSearch, Hammer, ArrowRight, MessageCircleQuestion, Flag, Wand2, Mail, CalendarX, ShieldAlert } from 'lucide-react'
import { PageTitle, Card, StatTile, Button, Pill, Avatar, StatusPill, SectionHeader, SuggestedTag } from '../../components/ui'
import { useData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { studentsOf, studentOverview, classOverview, attendanceSummary, lessonById, courseById, TODAY } from '../../lib/selectors'
import { BRAND, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER, ChartTip, axisStyle, LegendRow } from '../../components/teacher/charts'
import { computeFlags } from '../../components/teacher/flags'
import { useToast } from '../../components/teacher/Toast'
import { ExamRiskForecast, PeerMentorMatcher, IdeaCards } from '../../components/teacher/ideas'

export default function Home() {
  const { db } = useData()
  const { profile } = useAuth()
  const nav = useNavigate()
  const { toast, Toasts } = useToast()
  const firstName = (profile?.full_name || 'Rania').split(' ')[0]

  const students = studentsOf(db)
  const overviews = useMemo(() => students.map((s) => ({ student: s, ov: studentOverview(db, s.id), att: attendanceSummary(db, s.id) })), [db, students])
  const atRisk = overviews.filter((o) => o.ov.status === 'at-risk')
  const awaiting = db.submissions.filter((s) => s.status === 'submitted' || s.status === 'flagged')
  const flaggedSubs = db.submissions.filter((s) => s.status === 'flagged' || computeFlags(s).some((f) => f.severity === 'high'))
  const pendingProjects = db.projects.filter((p) => p.status === 'pending')

  /* Needs attention: at-risk/behind students with reasons */
  const attention = overviews
    .filter((o) => o.ov.status === 'at-risk' || o.ov.status === 'behind')
    .map((o) => {
      const reasons = []
      const weak = o.ov.weakTopics[0]
      if (weak) reasons.push({ icon: AlertTriangle, text: `${weak.name} at ${weak.score}%` })
      const behindCourses = o.ov.courses.filter((c) => c.completed < c.expected - 1)
      if (behindCourses.length) reasons.push({ icon: Flag, text: `${behindCourses.map((c) => `${courseById(db, c.courseId).subject} ${c.completed}/${c.total}`).join(', ')} checkpoints` })
      if (o.att.absent >= 3) reasons.push({ icon: CalendarX, text: `${o.att.absent} absences since September` })
      const flagged = db.submissions.find((s) => s.student_id === o.student.id && s.status === 'flagged')
      if (flagged) reasons.push({ icon: ShieldAlert, text: `Essay flagged: ${computeFlags(flagged)[0]?.label || 'needs review'}` })
      return { ...o, reasons }
    })
    .sort((a, b) => STATUS_ORDER.indexOf(b.ov.status) - STATUS_ORDER.indexOf(a.ov.status) || b.reasons.length - a.reasons.length)

  /* Per-course distribution */
  const dist = db.courses.map((c) => ({ course: c, ...classOverview(db, c.id).counts }))

  /* Common questions by topic */
  const topics = useMemo(() => {
    const map = {}
    db.chatMessages.filter((m) => m.role === 'user').forEach((m) => {
      const lesson = lessonById(db, m.lesson_id)
      const t = lesson?.topics.find((x) => x.id === m.topic)
      if (!t) return
      map[m.topic] = map[m.topic] || { id: m.topic, name: t.name, lesson, count: 0, students: new Set() }
      map[m.topic].count++
      map[m.topic].students.add(m.student_id)
    })
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [db])

  /* Recent flags */
  const flags = [
    ...db.attendance.filter((a) => a.flag).map((a) => ({ id: a.id, tone: 'warning', icon: CalendarX, title: `Attendance conflict · ${students.find((s) => s.id === a.student_id)?.full_name}`, text: a.note, date: a.date, to: `/teacher/tracker/${a.student_id}` })),
    ...flaggedSubs.map((s) => ({ id: s.id, tone: 'danger', icon: ShieldAlert, title: `Essay flagged · ${students.find((x) => x.id === s.student_id)?.full_name}`, text: computeFlags(s).map((f) => f.label).join(' · '), date: s.submitted_at.slice(0, 10), to: `/teacher/review/${s.id}` })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const dateLabel = TODAY.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8">
      <PageTitle eyebrow={dateLabel} title={`Good morning, ${firstName}`} subtitle="Your Grade 12 radar: who needs you today, what the class got stuck on, and what is waiting for your eyes." action={<Button to="/teacher/tracker" variant="dark">Open tracker <ArrowRight size={16} /></Button>} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Users} label="Students" value={students.length} hint="Grade 12 · Section A · 3 courses" />
        <StatTile icon={AlertTriangle} tone="danger" label="At risk" value={atRisk.length} hint={atRisk.map((o) => o.student.full_name.split(' ')[0]).join(', ') || 'Nobody — nice'} />
        <StatTile icon={FileSearch} tone="info" label="Awaiting review" value={awaiting.length} hint={`${db.submissions.filter((s) => s.status === 'flagged').length} flagged essays`} />
        <StatTile icon={Hammer} tone="success" label="Projects to validate" value={pendingProjects.length} hint={pendingProjects.map((p) => p.title).join(' · ')} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Needs attention */}
        <Card className="lg:col-span-3">
          <SectionHeader squiggle={false} eyebrow="today" title="Needs attention" subtitle={`${attention.length} students are behind or at risk in at least one course.`} className="mb-4" />
          <div className="space-y-3">
            {attention.map((o) => (
              <div key={o.student.id} className="rounded-2xl border border-charcoal-100 p-4 hover:border-charcoal-200 transition-colors">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar name={o.student.full_name} />
                  <div className="flex-1 min-w-[160px]">
                    <div className="flex items-center gap-2"><span className="font-bold text-charcoal">{o.student.full_name}</span><StatusPill status={o.ov.status} /></div>
                    <div className="text-xs text-charcoal-400 mt-0.5">Avg {o.ov.avgScore}% · {o.ov.totalPoints.toLocaleString()} pts</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" to={`/teacher/tracker/${o.student.id}`}>Open tracker</Button>
                    <Button size="sm" variant="soft" to={`/teacher/practice/${o.student.id}`}><Wand2 size={13} /> Practice</Button>
                    <Button size="sm" variant="ghost" onClick={() => toast(`Message drafted for ${o.student.full_name.split(' ')[0]}’s parent (demo)`, 'info')} title="Message parent (demo)"><Mail size={14} /></Button>
                  </div>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {o.reasons.map((r, i) => <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-cloud px-2.5 py-1 text-xs text-charcoal-500"><r.icon size={12} className="text-danger" />{r.text}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribution */}
        <Card className="lg:col-span-2">
          <SectionHeader squiggle={false} eyebrow="per course" title="Journey status" subtitle="Where the 12 students stand on each 7-checkpoint journey." className="mb-2" />
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist.map((d) => ({ name: d.course.title.split(':')[0], ...d }))} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                <XAxis type="number" hide domain={[0, 12]} />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={66} />
                <Tooltip cursor={{ fill: 'rgba(53,59,72,0.04)' }} content={<ChartTip render={(p) => p.map((x) => ({ name: STATUS_LABEL[x.dataKey], value: x.value, color: x.fill })).filter((r) => r.value)} />} />
                {STATUS_ORDER.map((s, i) => <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLOR[s]} stroke="#fff" strokeWidth={2} radius={i === STATUS_ORDER.length - 1 ? [0, 6, 6, 0] : i === 0 ? [6, 0, 0, 6] : 0} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <LegendRow items={STATUS_ORDER.map((s) => ({ label: STATUS_LABEL[s], color: STATUS_COLOR[s] }))} className="mt-1" />
          <div className="mt-4 space-y-2">
            {dist.map((d) => (
              <Link key={d.course.id} to="/teacher/tracker" className="flex items-center justify-between rounded-xl bg-cloud px-3 py-2 text-sm hover:bg-charcoal-100 transition-colors">
                <span className="font-semibold text-charcoal flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.course.color }} />{d.course.title}</span>
                <span className="text-xs text-charcoal-400">{d['at-risk']} at risk · {d.behind} behind</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Common questions */}
        <Card>
          <SectionHeader squiggle={false} eyebrow="tutor chat" title="Common questions this term" subtitle="What students asked the lesson tutor, grouped by topic. Click to open the lesson insights." className="mb-4" />
          <div className="space-y-2">
            {topics.map((t) => (
              <Link key={t.id} to={`/teacher/insights/${t.lesson.id}`} className="flex items-center gap-3 rounded-2xl border border-charcoal-100 px-4 py-3 hover:border-mango hover:bg-mango-50/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-mango-50 text-mango flex items-center justify-center shrink-0"><MessageCircleQuestion size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-charcoal text-sm truncate">{t.name}</div>
                  <div className="text-xs text-charcoal-400 truncate">{t.lesson.title} · {courseById(db, t.lesson.course_id)?.subject}</div>
                </div>
                <div className="text-right"><div className="text-lg font-extrabold text-charcoal leading-none">{t.count}</div><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">{t.students.size} students</div></div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent flags */}
        <Card>
          <SectionHeader squiggle={false} eyebrow="integrity" title="Recent flags" subtitle="Automatic flags from attendance records and essay process logs." className="mb-4" />
          <div className="space-y-2">
            {flags.map((f) => (
              <Link key={f.id} to={f.to} className="flex items-start gap-3 rounded-2xl border border-charcoal-100 px-4 py-3 hover:border-charcoal-200 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-mango-50 text-mango'}`}><f.icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2"><span className="font-semibold text-charcoal text-sm truncate">{f.title}</span><span className="text-[11px] text-charcoal-400 shrink-0">{new Date(f.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span></div>
                  <div className="text-xs text-charcoal-400 mt-0.5">{f.text}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Suggested ideas */}
      <section>
        <SectionHeader eyebrow="proposals" title="Suggested ideas" subtitle="Features BOLT could add for teachers. Two run on real class data; the others are concept cards. Keep or remove any of them." action={<SuggestedTag />} />
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ExamRiskForecast db={db} courseId="math-12" compact />
          <PeerMentorMatcher db={db} limit={4} onPair={(p) => toast(`Pairing proposed: ${p.mentor.full_name.split(' ')[0]} → ${p.mentee.full_name.split(' ')[0]} on ${p.topic.name}`)} />
        </div>
        <IdeaCards ids={['reteach', 'parent-nudge', 'energy-pulse', 'oral-scheduler']} columns={2} />
        <div className="mt-4 text-sm text-charcoal-400">The re-teach planner lives in <button onClick={() => nav('/teacher/insights')} className="font-semibold text-mango hover:underline">Lesson Insights</button>; the full exam forecast per course is in the <Link to="/teacher/tracker" className="font-semibold text-mango hover:underline">Progress Tracker</Link>.</div>
      </section>
      <Toasts />
    </div>
  )
}
