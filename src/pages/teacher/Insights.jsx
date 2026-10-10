import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts'
import { Sparkles, AlertTriangle, Lightbulb, EyeOff, Clock, Wand2, Presentation } from 'lucide-react'
import { PageTitle, Card, SectionHeader, Button, Pill, Avatar, StatTile, Callout, SuggestedTag, AITag } from '../../components/ui'
import AIInsightCard from '../../components/teacher/AIInsightCard'
import { STUDENT_SYS } from '../../components/teacher/StudentDetail'
import { studentDigest, studentFallback, classDigest, classFallback } from '../../components/teacher/progressInsights'
import { studentsOf } from '../../lib/selectors'
import { useData } from '../../lib/data'
import { ask, aiEnabled } from '../../lib/ai'
import { lessonInsights, courseLessons, courseById, profileById, lessonById } from '../../lib/selectors'
import { fmtTime } from '../../lib/utils'
import VideoTimeline from '../../components/teacher/VideoTimeline'
import { BRAND, ChartTip, axisStyle, scoreColor, scoreInk, LegendRow } from '../../components/teacher/charts'
import { summaryFor } from '../../components/teacher/insightSummaries'
import { RETEACH_PLANS, GENERIC_RETEACH } from '../../data/teacherIdeas'

const PATTERN_META = {
  stuck: { icon: AlertTriangle, cls: 'bg-danger-soft text-danger', label: 'Stuck point', action: 'Re-teach for 10 minutes next session, then assign the practice branch.' },
  curious: { icon: Lightbulb, cls: 'bg-success-soft text-success', label: 'Curiosity', action: 'Bring the best question to the whole class as a discussion starter.' },
  'silent-struggle': { icon: EyeOff, cls: 'bg-info-soft text-info', label: 'Silent struggle', action: 'Run a 2-item quick check — students may not know what they don’t know.' },
  timestamp: { icon: Clock, cls: 'bg-mango-50 text-mango-700', label: 'Timestamp cluster', action: 'Pause the video here in class and work the example on the board.' },
}

export default function Insights() {
  const { db } = useData()
  const nav = useNavigate()
  const { lessonId: paramId } = useParams()
  const lessonId = paramId && lessonById(db, paramId) ? paramId : 'math-12-l4'
  const lesson = lessonById(db, lessonId)
  const courseId = lesson.course_id
  const course = courseById(db, courseId)
  const insights = useMemo(() => lessonInsights(db, lessonId), [db, lessonId])
  const [summary, setSummary] = useState('')
  const [thinking, setThinking] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const students = useMemo(() => studentsOf(db), [db])
  const [pick, setPick] = useState(students[0]?.id)
  const picked = students.find((s) => s.id === pick) || students[0]
  useEffect(() => { setSummary(''); setShowPlan(false) }, [lessonId])

  const go = (id) => nav(`/teacher/insights/${id}`)

  async function summarize() {
    setThinking(true)
    const stats = insights.topicAvg.map((t) => `${t.name}: avg ${t.avg}%, ${t.questions} questions`).join('; ')
    const qs = insights.questions.map((qm) => `[${fmtTime(qm.video_t)}] ${profileById(db, qm.student_id)?.full_name.split(' ')[0]}: ${qm.content}`).join('\n')
    const fallback = summaryFor(insights, course.title)
    const [text] = await Promise.all([
      ask({ system: 'You are helping a Grade 12 teacher read her class. Summarize in 2 short paragraphs what students got stuck on and one concrete recommended action. Name students by first name.', messages: [{ role: 'user', content: `Lesson "${lesson.title}" (${course.title}). Topic stats: ${stats}.\nQuestions asked to the tutor:\n${qs || '(none)'}` }], fallback }),
      new Promise((r) => setTimeout(r, aiEnabled ? 0 : 800)),
    ])
    setSummary(text)
    setThinking(false)
  }

  const topicData = insights.topicAvg.map((t) => ({ name: t.name, avg: t.avg || 0, questions: t.questions }))
  const byTopic = Object.entries(insights.byTopic).map(([tid, qs]) => ({ topic: lesson.topics.find((t) => t.id === tid) || { id: tid, name: tid }, qs: [...qs].sort((a, b) => a.video_t - b.video_t) })).sort((a, b) => b.qs.length - a.qs.length)
  const plan = RETEACH_PLANS[lessonId] || GENERIC_RETEACH(lesson.title, [...insights.topicAvg].sort((a, b) => a.avg - b.avg)[0]?.name || lesson.topics[0].name)

  return (
    <div className="space-y-8">
      <PageTitle eyebrow="what the class got stuck on" title="Insights" subtitle="How each student and the whole class is progressing, plus where students paused each video to ask and how each topic scored — so re-teaching targets the minute that matters." />

      {/* Progress insights: whole class + one student */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AIInsightCard title="Whole-class progress" eyebrow="all 12 students"
          placeholder="Who is ahead, who is slipping, the weak spots the class shares, and what to do about it this week."
          build={() => ({
            system: 'You are BOLT, helping a Grade 12 teacher read their whole class. Use ONLY the data given. Write: one short paragraph on who needs attention and why (name students by first name), one on shared weak topics and trends, then "Next steps:" with 3 bullet points (•). No headings, no markdown.',
            prompt: classDigest(db),
            fallback: classFallback(db),
          })} />
        <div className="flex flex-col gap-3">
          <Card className="py-3">
            <label className="flex items-center gap-3 text-sm font-semibold text-charcoal">
              <span className="shrink-0">Student</span>
              <select value={picked?.id} onChange={(e) => setPick(e.target.value)} className="flex-1 rounded-xl border border-charcoal-200 bg-white px-3 py-2 text-sm">
                {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              <Link to={`/teacher/tracker/${picked?.id}`} className="text-xs text-mango-700 hover:underline shrink-0">profile →</Link>
            </label>
          </Card>
          {picked && <AIInsightCard title={`${picked.full_name.split(' ')[0]}'s progress`} eyebrow="one student" resetKey={picked.id} className="flex-1"
            placeholder={`Scores, pace, attendance, essays and tutor questions for ${picked.full_name} — turned into a short read and three next steps.`}
            build={() => { const d = studentDigest(db, picked.id); return { system: STUDENT_SYS, prompt: d.text, fallback: studentFallback(d) } }} />}
        </div>
      </div>

      {/* Course / lesson pickers */}
      <Card className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {db.courses.map((c) => (
            <button key={c.id} onClick={() => go(courseLessons(db, c.id)[0].id)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${c.id === courseId ? 'text-white' : 'bg-cloud text-charcoal-500 hover:bg-charcoal-100'}`} style={c.id === courseId ? { background: c.color } : undefined}>{c.subject}</button>
          ))}
        </div>
        <div className="h-6 w-px bg-charcoal-100 hidden sm:block" />
        <div className="flex flex-wrap gap-1.5">
          {courseLessons(db, courseId).map((l) => {
            const n = db.chatMessages.filter((m) => m.lesson_id === l.id).length
            return (
              <button key={l.id} onClick={() => go(l.id)} className={`relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${l.id === lessonId ? 'bg-charcoal text-white' : 'bg-cloud text-charcoal-500 hover:bg-charcoal-100'}`} title={l.title}>
                {l.position}. {l.title.length > 22 ? l.title.slice(0, 21) + '…' : l.title}
                {n > 0 && <span className={`ml-1.5 inline-flex items-center justify-center rounded-full min-w-[16px] h-4 px-1 text-[10px] font-bold ${l.id === lessonId ? 'bg-mango text-white' : 'bg-mango-100 text-mango-700'}`}>{n}</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-hand text-xl leading-none mb-1" style={{ color: course.color }}>{course.title}</div>
          <h2 className="text-2xl font-extrabold tracking-tight text-charcoal">{lesson.position}. {lesson.title}</h2>
          <p className="text-sm text-charcoal-400 mt-1 max-w-2xl">{lesson.summary}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPlan((v) => !v)}><Presentation size={16} /> Re-teach plan</Button>
          <Button variant="soft" to={`/teacher/practice`}><Wand2 size={16} /> Extra practice</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Completed" value={`${insights.completedCount}/${students.length}`} hint="students finished this checkpoint" />
        <StatTile label="Class average" value={`${insights.avgScore || '—'}%`} tone={insights.avgScore >= 70 ? 'success' : 'danger'} hint="on the lesson check" />
        <StatTile label="Questions asked" value={insights.questions.length} tone="info" hint={`${new Set(insights.questions.map((q) => q.student_id)).size} different students`} />
        <StatTile label="Avg time on lesson" value={`${insights.avgTime || '—'} min`} tone="dark" hint={`video is ${lesson.duration_min} min`} />
      </div>

      {showPlan && (
        <Card className="border-mango-200 bg-mango-50/40">
          <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-extrabold text-charcoal">10-minute re-teach plan</h3><SuggestedTag /></div>
          <p className="text-xs text-charcoal-400 mb-4">Generated from this lesson’s stuck points and questions. Edit freely before class.</p>
          <ol className="grid md:grid-cols-4 gap-3">
            {plan.map((p) => (
              <li key={p.step} className="rounded-2xl bg-white border border-charcoal-100 p-4">
                <div className="flex items-center justify-between mb-1"><span className="text-[11px] uppercase tracking-wide font-bold text-mango-700">{p.step}</span><span className="text-[11px] font-semibold text-charcoal-400">{p.min} min</span></div>
                <p className="text-sm text-charcoal">{p.text}</p>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <SectionHeader squiggle={false} eyebrow="video timeline" title="Stuck points" subtitle={`Where students paused “${lesson.title}” to ask the tutor. Marker size = number of questions in that minute.`} className="mb-2" />
        {insights.stuckPoints.length ? <VideoTimeline db={db} insights={insights} /> : <Callout tone="info">No tutor questions on this lesson yet — nothing to plot.</Callout>}
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Questions by topic */}
        <Card className="lg:col-span-3">
          <SectionHeader squiggle={false} eyebrow="in their words" title="Questions asked" subtitle="Grouped by topic, in video order." className="mb-4" />
          {byTopic.length ? (
            <div className="space-y-5">
              {byTopic.map(({ topic, qs }) => {
                const stat = insights.topicAvg.find((t) => t.id === topic.id)
                return (
                  <div key={topic.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-charcoal">{topic.name}</div>
                      <div className="flex items-center gap-2"><Pill tone="neutral">{qs.length} question{qs.length > 1 ? 's' : ''}</Pill>{stat?.avg ? <Pill tone={stat.avg >= 70 ? 'success' : stat.avg >= 60 ? 'warning' : 'danger'}>avg {stat.avg}%</Pill> : null}</div>
                    </div>
                    <ul className="space-y-1.5">
                      {qs.map((qm) => {
                        const st = profileById(db, qm.student_id)
                        return (
                          <li key={qm.id} className="flex items-start gap-3 rounded-xl bg-cloud px-3 py-2">
                            <Link to={`/teacher/tracker/${qm.student_id}`}><Avatar name={st?.full_name || ''} size="sm" /></Link>
                            <div className="flex-1 min-w-0"><div className="text-sm text-charcoal">“{qm.content}”</div><div className="text-[11px] text-charcoal-400 mt-0.5">{st?.full_name} · at {fmtTime(qm.video_t)} · {new Date(qm.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div></div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          ) : <div className="text-sm text-charcoal-400">No questions on this lesson yet.</div>}
        </Card>

        {/* Topic performance */}
        <Card className="lg:col-span-2">
          <SectionHeader squiggle={false} eyebrow="scores" title="Topic performance" subtitle="Class average per topic; the badge shows how many questions each topic drew." className="mb-2" />
          <div style={{ height: 40 + topicData.length * 44 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ top: 4, right: 36, left: 0, bottom: 0 }} barCategoryGap="30%">
                <XAxis type="number" domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} ticks={[0, 60, 80, 100]} />
                <YAxis type="category" dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} width={120} />
                <ReferenceLine x={60} stroke={BRAND.danger} strokeDasharray="4 4" />
                <Tooltip cursor={{ fill: 'rgba(53,59,72,0.04)' }} content={<ChartTip render={(p) => [{ name: 'Class average', value: `${p[0].payload.avg}%` }, { name: 'Questions', value: p[0].payload.questions }]} />} />
                <Bar dataKey="avg" radius={[0, 4, 4, 0]} maxBarSize={22} label={{ position: 'right', fontSize: 11, fontWeight: 700, fill: BRAND.charcoal, formatter: (v) => `${v}%` }}>
                  {topicData.map((d) => <Cell key={d.name} fill={scoreColor(d.avg)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <LegendRow items={[{ label: '≥ 80 strong', color: BRAND.success }, { label: '60–79', color: BRAND.mango }, { label: '< 60 weak', color: BRAND.danger }]} className="mt-1" />
          <div className="mt-4 space-y-1.5">
            {insights.topicAvg.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm rounded-xl bg-cloud px-3 py-2">
                <span className="font-semibold text-charcoal truncate">{t.name}</span>
                <span className="flex items-center gap-2 shrink-0"><span className="text-xs text-charcoal-400">{t.questions} q</span><span className="font-bold" style={{ color: scoreInk(t.avg) }}>{t.avg || '—'}%</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Patterns + AI summary */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <SectionHeader squiggle={false} eyebrow="automatic" title="Patterns recognized" subtitle="BOLT cross-references questions with scores to tell curiosity from confusion." className="mb-4" />
          {insights.patterns.length ? (
            <div className="grid md:grid-cols-2 gap-3">
              {insights.patterns.map((p, i) => {
                const m = PATTERN_META[p.type] || PATTERN_META.stuck
                return (
                  <div key={i} className="rounded-2xl border border-charcoal-100 p-4">
                    <div className="flex items-center gap-2 mb-2"><span className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.cls}`}><m.icon size={16} /></span><span className="text-[11px] uppercase tracking-wide font-bold text-charcoal-400">{m.label}</span></div>
                    <p className="text-sm text-charcoal">{p.text}</p>
                    <div className="mt-3 text-xs font-semibold text-mango-700 bg-mango-50 rounded-xl px-3 py-2">Recommended: {m.action}</div>
                  </div>
                )
              })}
            </div>
          ) : <Callout tone="success">No worrying pattern on this lesson — scores and questions are both healthy.</Callout>}
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <SectionHeader squiggle={false} eyebrow="ask BOLT" title={<span className="flex items-center gap-2">Lesson summary <AITag /></span>} className="mb-3" />
          {summary ? (
            <div className="rounded-2xl bg-charcoal text-white p-4 text-sm leading-relaxed whitespace-pre-line fade-up flex-1">{summary}</div>
          ) : (
            <div className="rounded-2xl bg-cloud p-4 text-sm text-charcoal-400 flex-1">Get a two-paragraph read of this lesson: what students got stuck on, who, and one concrete next step.</div>
          )}
          <Button className="mt-4 w-full" onClick={summarize} loading={thinking}><Sparkles size={16} /> {summary ? 'Summarize again' : 'Ask AI to summarize'}</Button>
        </Card>
      </div>
    </div>
  )
}
