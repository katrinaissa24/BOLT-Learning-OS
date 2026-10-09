import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, ErrorBar } from 'recharts'
import { Target, Users, Presentation, Mail, Activity, Mic, ArrowRight } from 'lucide-react'
import { Card, SuggestedTag, Pill, Avatar, Button } from '../ui'
import { studentsOf, studentOverview, courseById, TODAY } from '../../lib/selectors'
import { TEACHER_IDEAS } from '../../data/teacherIdeas'
import { BRAND, ChartTip, axisStyle, scoreColor, scoreInk } from './charts'

const ICONS = { target: Target, users: Users, presentation: Presentation, mail: Mail, activity: Activity, mic: Mic }

/* ───────────── Exam risk forecast (real data) ───────────── */
/** Projected exam score per student for a course: mastery blended with pace, confidence from evidence count. */
export function examForecast(db, courseId) {
  const course = courseById(db, courseId)
  const daysToExam = Math.round((new Date(course.exam_date) - TODAY) / 86400000)
  return studentsOf(db).map((s) => {
    const sum = studentOverview(db, s.id).courses.find((c) => c.courseId === courseId)
    const scores = sum.topicScores.map((t) => t.score)
    const mastery = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 50
    const pace = sum.completed / 5 // class is expected at 5 of 7
    const projected = Math.round(Math.max(20, Math.min(98, mastery * 0.8 + Math.min(1.1, pace) * 20 - (pace < 0.8 ? 6 : 0))))
    const evidence = scores.length / (sum.lessons.length * 3)
    const band = Math.round(14 - evidence * 8) // ±
    const confidence = evidence > 0.6 ? 'high' : evidence > 0.3 ? 'medium' : 'low'
    const risk = projected < 50 ? 'high' : projected < 65 ? 'medium' : 'low'
    return { student: s, projected, band, confidence, risk, mastery: Math.round(mastery), completed: sum.completed, daysToExam, weakest: sum.weakTopics[0] || null }
  }).sort((a, b) => a.projected - b.projected)
}

export function ExamRiskForecast({ db, courseId, compact = false }) {
  const rows = useMemo(() => examForecast(db, courseId), [db, courseId])
  const course = courseById(db, courseId)
  const data = rows.map((r) => ({ name: r.student.full_name.split(' ')[0], full: r.student.full_name, projected: r.projected, err: [r.band, r.band], risk: r.risk, conf: r.confidence, weakest: r.weakest?.name }))
  const atRisk = rows.filter((r) => r.risk !== 'low')
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2"><h3 className="text-lg font-extrabold text-charcoal">Exam risk forecast</h3><SuggestedTag /></div>
          <p className="text-xs text-charcoal-400 mt-0.5">{course.subject} exam in {rows[0]?.daysToExam} days · projected score from topic mastery and pace, whiskers = confidence band</p>
        </div>
        <Pill tone={atRisk.length ? 'danger' : 'success'}>{atRisk.length} at risk</Pill>
      </div>
      <div style={{ height: compact ? 190 : 240 }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%">
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} interval={0} />
            <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} ticks={[0, 50, 65, 100]} />
            <ReferenceLine y={50} stroke={BRAND.danger} strokeDasharray="4 4" />
            <ReferenceLine y={65} stroke={BRAND.mango} strokeDasharray="4 4" />
            <Tooltip cursor={{ fill: 'rgba(53,59,72,0.04)' }} content={<ChartTip render={(p) => { const d = p[0].payload; return [{ name: 'Projected', value: `${d.projected}% ± ${d.err[0]}` }, { name: 'Confidence', value: d.conf }, ...(d.weakest ? [{ name: 'Weakest', value: d.weakest }] : [])] }} title={undefined} />} labelFormatter={(l, p) => p?.[0]?.payload?.full} />
            <Bar dataKey="projected" radius={[4, 4, 0, 0]} maxBarSize={34}>
              {data.map((d) => <Cell key={d.name} fill={d.risk === 'high' ? BRAND.danger : d.risk === 'medium' ? BRAND.mango : BRAND.success} />)}
              <ErrorBar dataKey="err" width={4} strokeWidth={1.5} stroke={BRAND.charcoal400} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {!compact && atRisk.length > 0 && (
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {atRisk.map((r) => (
            <Link key={r.student.id} to={`/teacher/practice/${r.student.id}`} className="flex items-center gap-3 rounded-2xl bg-cloud hover:bg-charcoal-100 px-3 py-2 transition-colors">
              <Avatar name={r.student.full_name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-charcoal truncate">{r.student.full_name}</div>
                <div className="text-xs text-charcoal-400 truncate">Projected {r.projected}% · {r.completed}/7 done{r.weakest ? ` · weakest: ${r.weakest.name} (${r.weakest.score}%)` : ''}</div>
              </div>
              <ArrowRight size={14} className="text-charcoal-300" />
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ───────────── Peer mentor matcher (real data) ───────────── */
export function mentorPairs(db) {
  const students = studentsOf(db).map((s) => ({ s, ov: studentOverview(db, s.id) }))
  const pairs = []
  const used = new Map()
  students.forEach(({ s, ov }) => {
    if (!['behind', 'at-risk'].includes(ov.status)) return
    const weak = ov.weakTopics[0]
    if (!weak) return
    const mentors = students
      .filter((m) => m.s.id !== s.id && ['ahead', 'on-track'].includes(m.ov.status))
      .map((m) => ({ m, score: m.ov.courses.flatMap((c) => c.topicScores).find((t) => t.id === weak.id)?.score || 0 }))
      .filter((x) => x.score >= 85)
      .sort((a, b) => (used.get(a.m.s.id) || 0) - (used.get(b.m.s.id) || 0) || b.score - a.score)
    if (!mentors[0]) return
    used.set(mentors[0].m.s.id, (used.get(mentors[0].m.s.id) || 0) + 1)
    pairs.push({ mentee: s, mentor: mentors[0].m.s, topic: weak, mentorScore: mentors[0].score, courseId: weak.courseId })
  })
  return pairs
}

export function PeerMentorMatcher({ db, onPair, limit }) {
  const pairs = useMemo(() => mentorPairs(db), [db])
  const shown = limit ? pairs.slice(0, limit) : pairs
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-extrabold text-charcoal">Peer mentor matcher</h3><SuggestedTag /></div>
      <p className="text-xs text-charcoal-400 mb-4">Pairs a student who scored ≥85% on a topic with a classmate below 60% on the same one. A confirmed session earns the mentor a Peer Mentor stamp.</p>
      <div className="space-y-2">
        {shown.map((p) => (
          <div key={p.mentee.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-charcoal-100 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-[150px]"><Avatar name={p.mentor.full_name} size="sm" /><div className="leading-tight"><div className="text-sm font-semibold text-charcoal">{p.mentor.full_name.split(' ')[0]}</div><div className="text-[11px] text-success font-semibold">{p.mentorScore}% mentor</div></div></div>
            <ArrowRight size={16} className="text-mango shrink-0" />
            <div className="flex items-center gap-2 min-w-[150px]"><Avatar name={p.mentee.full_name} size="sm" /><div className="leading-tight"><div className="text-sm font-semibold text-charcoal">{p.mentee.full_name.split(' ')[0]}</div><div className="text-[11px] text-danger font-semibold">{p.topic.score}% needs help</div></div></div>
            <div className="flex-1 min-w-[140px] text-xs text-charcoal-400"><span className="font-semibold text-charcoal">{p.topic.name}</span> · {courseById(db, p.courseId)?.subject}</div>
            <Button size="sm" variant="secondary" onClick={() => onPair?.(p)}>Propose pairing</Button>
          </div>
        ))}
        {!shown.length && <div className="text-sm text-charcoal-400">No pairs needed right now — nobody is below 60% on a topic a classmate has mastered.</div>}
      </div>
    </Card>
  )
}

/* ───────────── Stub idea cards ───────────── */
export function IdeaCards({ ids, columns = 3 }) {
  const list = TEACHER_IDEAS.filter((i) => !ids || ids.includes(i.id))
  return (
    <div className={`grid gap-4 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {list.map((i) => {
        const Icon = ICONS[i.icon] || Target
        return (
          <Card key={i.id} className="relative">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-2xl bg-mango-50 text-mango flex items-center justify-center"><Icon size={20} /></div>
              <SuggestedTag />
            </div>
            <h4 className="font-bold text-charcoal mt-3">{i.title}</h4>
            <p className="text-sm text-charcoal-400 mt-1">{i.text}</p>
            <div className="mt-3"><Pill tone={i.status === 'built' ? 'success' : 'outline'}>{i.status === 'built' ? 'Prototype live' : 'Concept'}</Pill></div>
          </Card>
        )
      })}
    </div>
  )
}

/** Small colored score chip used across teacher pages. */
export function ScoreChip({ score }) {
  return <span className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold text-white min-w-[42px]" style={{ background: scoreInk(score) }}>{score}%</span>
}
