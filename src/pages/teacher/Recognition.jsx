import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Award, Mic, Sparkles, CalendarClock, Megaphone, Stamp } from 'lucide-react'
import { PageTitle, Card, SectionHeader, Button, Pill, StatusPill, Avatar, Modal, StatTile } from '../../components/ui'
import { useData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { recognitionPatterns, courseLessons, badgeById, progressFor } from '../../lib/selectors'
import { PATTERN_META, PATTERN_ORDER } from '../../components/teacher/recognitionMeta'
import { BRAND, ChartTip, axisStyle } from '../../components/teacher/charts'
import { useToast } from '../../components/teacher/Toast'

const PATTERN_BAR = { encourage: BRAND.danger, recognize: BRAND.mango, invisible: BRAND.info, consistency: BRAND.success, steady: BRAND.charcoal200 }

export default function Recognition() {
  const { db, awardBadge } = useData()
  const { profile } = useAuth()
  const { toast, Toasts } = useToast()
  const rows = useMemo(() => recognitionPatterns(db), [db])
  const [oral, setOral] = useState(false)
  const [oralStudent, setOralStudent] = useState(rows[0]?.student.id)
  const [oralCourse, setOralCourse] = useState('math-12')
  const [oralLesson, setOralLesson] = useState('math-12-l4')

  const groups = PATTERN_ORDER.map((p) => ({ key: p, meta: PATTERN_META[p], rows: rows.filter((r) => r.pattern === p) })).filter((g) => g.rows.length)
  const chartData = [...rows].sort((a, b) => b.badgeCount - a.badgeCount).map((r) => ({ name: r.student.full_name.split(' ')[0], full: r.student.full_name, stamps: r.badgeCount, recent: r.recentBadges, pattern: r.pattern }))
  const totalStamps = rows.reduce((a, r) => a + r.badgeCount, 0)
  const lessonsForCourse = courseLessons(db, oralCourse)
  const oralRow = rows.find((r) => r.student.id === oralStudent)

  async function validateOral() {
    const lesson = lessonsForCourse.find((l) => l.id === oralLesson) || lessonsForCourse[0]
    const r = await awardBadge(oralStudent, 'oral-defender', `Oral defense of “${lesson.title}”, validated by ${profile?.full_name || 'the teacher'}.`)
    toast(r ? `Oral Defender stamp awarded to ${oralRow?.student.full_name.split(' ')[0]}` : `${oralRow?.student.full_name.split(' ')[0]} already holds Oral Defender`, r ? 'success' : 'info')
    setOral(false)
  }

  return (
    <div className="space-y-8">
      <PageTitle eyebrow="who needs what" title="Recognition" subtitle="BOLT reads stamps, status and attendance together and tells you who to encourage, who to celebrate, and who is doing great work nobody sees." action={<Button variant="dark" onClick={() => setOral(true)}><Mic size={16} /> Validate oral defense</Button>} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Stamp} label="Stamps in class" value={totalStamps} hint={`${(totalStamps / rows.length).toFixed(1)} per student`} />
        <StatTile icon={Megaphone} tone="danger" label="Need encouragement" value={groups.find((g) => g.key === 'encourage')?.rows.length || 0} hint="few stamps, behind or at risk" />
        <StatTile icon={Award} tone="success" label="Need recognition" value={groups.find((g) => g.key === 'recognize')?.rows.length || 0} hint="earning fast this month" />
        <StatTile icon={Sparkles} tone="info" label="Strong but invisible" value={groups.find((g) => g.key === 'invisible')?.rows.length || 0} hint="great scores, no stamps" />
      </div>

      <Card>
        <SectionHeader squiggle={false} eyebrow="distribution" title="Stamps per student" subtitle="Bar color is the recognised pattern. A flat tail on the right is where encouragement goes." className="mb-2" />
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%">
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(53,59,72,0.04)' }} content={<ChartTip render={(p) => [{ name: 'Stamps', value: p[0].payload.stamps }, { name: 'This month', value: p[0].payload.recent }, { name: 'Pattern', value: PATTERN_META[p[0].payload.pattern].label }]} />} labelFormatter={(l, p) => p?.[0]?.payload?.full} />
              <Bar dataKey="stamps" radius={[4, 4, 0, 0]} maxBarSize={36} label={{ position: 'top', fontSize: 11, fontWeight: 700, fill: BRAND.charcoal }}>
                {chartData.map((d) => <Cell key={d.name} fill={PATTERN_BAR[d.pattern]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-400 mt-1">{PATTERN_ORDER.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: PATTERN_BAR[p] }} />{PATTERN_META[p].label}</span>)}</div>
      </Card>

      {groups.map((g) => (
        <section key={g.key}>
          <SectionHeader eyebrow={`${g.rows.length} student${g.rows.length > 1 ? 's' : ''}`} title={g.meta.label} subtitle={g.meta.blurb} />
          <div className={`grid gap-4 ${g.key === 'steady' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {g.rows.map((r) => <StudentCard key={r.student.id} r={r} db={db} meta={g.meta} compact={g.key === 'steady'} toast={toast} onOral={() => { setOralStudent(r.student.id); setOral(true) }} />)}
          </div>
        </section>
      ))}

      <Modal open={oral} onClose={() => setOral(false)} title="Validate an oral defense">
        <p className="text-sm text-charcoal-400 mb-4">The student defended a solution out loud and answered follow-up questions. Validating awards the <span className="font-semibold text-charcoal">Oral Defender</span> stamp with you as the evidence.</p>
        <div className="space-y-3">
          <label className="block"><span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Student</span>
            <select value={oralStudent} onChange={(e) => setOralStudent(e.target.value)} className="w-full rounded-xl border border-charcoal-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-mango">{rows.map((r) => <option key={r.student.id} value={r.student.id}>{r.student.full_name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Course</span>
              <select value={oralCourse} onChange={(e) => { setOralCourse(e.target.value); setOralLesson(courseLessons(db, e.target.value)[0].id) }} className="w-full rounded-xl border border-charcoal-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-mango">{db.courses.map((c) => <option key={c.id} value={c.id}>{c.subject}</option>)}</select></label>
            <label className="block"><span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Lesson</span>
              <select value={oralLesson} onChange={(e) => setOralLesson(e.target.value)} className="w-full rounded-xl border border-charcoal-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-mango">{lessonsForCourse.map((l) => <option key={l.id} value={l.id}>{l.position}. {l.title}{progressFor(db, oralStudent, l.id)?.status === 'completed' ? ' ✓' : ''}</option>)}</select></label>
          </div>
          {oralRow && <div className="rounded-2xl bg-cloud p-3 text-sm text-charcoal-500 flex items-center gap-3"><Avatar name={oralRow.student.full_name} size="sm" /><span>{oralRow.student.full_name} · {oralRow.badgeCount} stamps · <StatusPill status={oralRow.overview.status} /></span></div>}
          <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setOral(false)}>Cancel</Button><Button onClick={validateOral}><Mic size={16} /> Award Oral Defender</Button></div>
        </div>
      </Modal>
      <Toasts />
    </div>
  )
}

function StudentCard({ r, db, meta, compact, toast, onOral }) {
  const first = r.student.full_name.split(' ')[0]
  const recent = [...r.badges].sort((a, b) => b.earned_at.localeCompare(a.earned_at)).slice(0, 3)
  return (
    <Card className={compact ? 'p-4' : ''}>
      <div className="flex items-start gap-3">
        <Link to={`/teacher/tracker/${r.student.id}`}><Avatar name={r.student.full_name} size={compact ? 'sm' : 'md'} /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2"><Link to={`/teacher/tracker/${r.student.id}`} className="font-bold text-charcoal hover:text-mango">{r.student.full_name}</Link><StatusPill status={r.overview.status} /></div>
          <div className="text-xs text-charcoal-400 mt-0.5">{r.badgeCount} stamp{r.badgeCount === 1 ? '' : 's'} · {r.recentBadges} this month · attendance {r.attendance.rate}%{r.attendance.perfectMonths.length ? ' · perfect September' : ''}</div>
        </div>
        <span className={`text-[10px] uppercase tracking-wide font-bold rounded-full px-2 py-0.5 shrink-0 ${meta.cls}`}>{r.badgeCount}</span>
      </div>
      {!compact && (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recent.map((b) => <Pill key={b.id} tone="neutral" className="normal-case tracking-normal" title={b.evidence}>{b.badge.name}</Pill>)}
            {!recent.length && <span className="text-xs text-charcoal-300">No stamps yet</span>}
          </div>
          <div className={`mt-3 rounded-2xl p-3 text-sm ${meta.cls}`}>{r.message}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {r.pattern === 'encourage' && <><Button size="sm" variant="secondary" onClick={() => toast(`1:1 with ${first} scheduled for Tuesday, 13:00 (demo)`, 'info')}><CalendarClock size={14} /> Schedule 1:1</Button><Button size="sm" variant="soft" to={`/teacher/practice/${r.student.id}`}>Set one goal</Button></>}
            {r.pattern === 'recognize' && <><Button size="sm" onClick={() => toast(`Kudos sent to ${first} and shown on the class board`)}><Megaphone size={14} /> Send kudos</Button><Button size="sm" variant="secondary" onClick={() => toast(`${first} nominated for the October showcase`, 'info')}>Nominate for showcase</Button></>}
            {r.pattern === 'invisible' && <><Button size="sm" onClick={onOral}><Mic size={14} /> Invite to oral defense</Button><Button size="sm" variant="secondary" onClick={() => toast(`Thinking Lab challenge sent to ${first}`, 'info')}>Send Lab challenge</Button></>}
            {r.pattern === 'consistency' && <><Button size="sm" onClick={() => toast(`Consistency kudos sent to ${first}`)}><Megaphone size={14} /> Send kudos</Button><Button size="sm" variant="secondary" onClick={() => toast(`Project idea suggested to ${first}`, 'info')}>Suggest a project</Button></>}
          </div>
        </>
      )}
    </Card>
  )
}
