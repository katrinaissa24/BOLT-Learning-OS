import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Wand2, Send, Users, CheckCircle2, Hash, ListChecks, PenLine } from 'lucide-react'
import { PageTitle, Card, SectionHeader, Button, Pill, StatusPill, Avatar, Tabs, Callout, ScoreBar } from '../../components/ui'
import { useData } from '../../lib/data'
import { generatePractice } from '../../lib/practice'
import { studentsOf, studentOverview, courseById, lessonById, courseLessons, profileById } from '../../lib/selectors'
import { STATUS_ORDER, STATUS_COLOR, scoreColor, scoreInk } from '../../components/teacher/charts'
import { useToast } from '../../components/teacher/Toast'
import { cx } from '../../lib/utils'

const TYPE_META = { numeric: [Hash, 'Numeric'], choice: [ListChecks, 'Multiple choice'], short: [PenLine, 'Short answer'] }

export default function Practice() {
  const { db, savePracticeSet } = useData()
  const nav = useNavigate()
  const { studentId } = useParams()
  const { toast, Toasts } = useToast()
  const students = useMemo(() => studentsOf(db).map((s) => ({ student: s, ov: studentOverview(db, s.id) })).sort((a, b) => STATUS_ORDER.indexOf(b.ov.status) - STATUS_ORDER.indexOf(a.ov.status) || a.ov.avgScore - b.ov.avgScore), [db])
  const selected = students.find((s) => s.student.id === studentId) || students[0]
  const [courseId, setCourseId] = useState('all')
  const [lessonId, setLessonId] = useState('all')
  const [items, setItems] = useState(null)
  const [busy, setBusy] = useState(false)
  const [bulk, setBulk] = useState(null) // { done, total, current }
  const [assigned, setAssigned] = useState(false)
  useEffect(() => { setItems(null); setAssigned(false) }, [studentId, courseId, lessonId])
  useEffect(() => { setLessonId('all') }, [courseId])

  const first = selected.student.full_name.split(' ')[0]
  const topics = selected.ov.courses
    .filter((c) => courseId === 'all' || c.courseId === courseId)
    .flatMap((c) => c.topicScores.map((t) => ({ ...t, courseId: c.courseId })))
    .filter((t) => lessonId === 'all' || t.lessonId === lessonId)
    .sort((a, b) => a.score - b.score)
  const weak = topics.filter((t) => t.score < 60)
  const strong = topics.filter((t) => t.score >= 80)
  const targetTopics = (weak.length ? weak : topics).slice(0, 3)
  const targetLesson = lessonId !== 'all' ? lessonById(db, lessonId) : lessonById(db, targetTopics[0]?.lessonId)
  const targetCourse = courseById(db, courseId !== 'all' ? courseId : targetTopics[0]?.courseId || 'math-12')

  async function generateFor(entry, scope = { courseId, lessonId }) {
    const tps = entry.ov.courses.filter((c) => scope.courseId === 'all' || c.courseId === scope.courseId).flatMap((c) => c.topicScores.map((t) => ({ ...t, courseId: c.courseId }))).filter((t) => scope.lessonId === 'all' || t.lessonId === scope.lessonId).sort((a, b) => a.score - b.score)
    const wk = (tps.filter((t) => t.score < 60).length ? tps.filter((t) => t.score < 60) : tps).slice(0, 3)
    const lesson = scope.lessonId !== 'all' ? lessonById(db, scope.lessonId) : lessonById(db, wk[0]?.lessonId)
    const course = courseById(db, scope.courseId !== 'all' ? scope.courseId : wk[0]?.courseId || 'math-12')
    const [res] = await Promise.all([
      generatePractice({ lesson, course, topics: wk, studentName: entry.student.full_name.split(' ')[0], count: 5 }),
      new Promise((r) => setTimeout(r, 700)),
    ])
    return { items: res, lesson, topics: wk }
  }

  async function generate() {
    setBusy(true); setAssigned(false)
    const r = await generateFor(selected)
    setItems(r.items.map((it) => ({ ...it, rationale: rationaleFor(it, r.topics, first) })))
    setBusy(false)
  }
  async function assign() {
    await savePracticeSet({ student_id: selected.student.id, lesson_id: targetLesson?.id || null, items, created_by: 'teacher' })
    setAssigned(true)
    toast(`${items.length} practice items assigned to ${first}`)
  }
  async function generateAll() {
    const struggling = students.filter((s) => s.ov.status === 'at-risk' || s.ov.status === 'behind')
    setBulk({ done: 0, total: struggling.length, current: struggling[0]?.student.full_name })
    for (let i = 0; i < struggling.length; i++) {
      const r = await generateFor(struggling[i])
      await savePracticeSet({ student_id: struggling[i].student.id, lesson_id: r.lesson?.id || null, items: r.items, created_by: 'teacher' })
      setBulk({ done: i + 1, total: struggling.length, current: struggling[i + 1]?.student.full_name })
    }
    toast(`Tailored practice assigned to ${struggling.length} struggling students`)
    setTimeout(() => setBulk(null), 1800)
  }
  const existingSets = db.practiceSets.filter((p) => p.student_id === selected.student.id)

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="one click" title="Extra Practice" subtitle="Pick a student, see exactly which topics are weak, and generate a tailored practice set with a reason behind every item." action={<Button variant="dark" onClick={generateAll} loading={!!bulk && bulk.done < bulk.total}><Users size={16} /> Generate for all struggling students</Button>} />

      {bulk && (
        <Card className="border-mango-200">
          <div className="flex items-center justify-between text-sm mb-2"><span className="font-bold text-charcoal">{bulk.done < bulk.total ? `Generating for ${bulk.current}…` : 'All sets assigned'}</span><span className="text-charcoal-400">{bulk.done}/{bulk.total} students</span></div>
          <div className="h-2 rounded-full bg-charcoal-100 overflow-hidden"><div className="h-full bg-mango transition-all duration-500" style={{ width: `${(bulk.done / bulk.total) * 100}%` }} /></div>
        </Card>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* student list */}
        <Card padded={false} className="lg:col-span-3 overflow-hidden">
          <div className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold text-charcoal-400 border-b border-charcoal-100">Students · worst first</div>
          <div className="max-h-[640px] overflow-y-auto">
            {students.map(({ student, ov }) => (
              <button key={student.id} onClick={() => nav(`/teacher/practice/${student.id}`)} className={cx('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-4', selected.student.id === student.id ? 'bg-mango-50 border-mango' : 'border-transparent hover:bg-cloud')}>
                <Avatar name={student.full_name} size="sm" />
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-charcoal truncate">{student.full_name}</div><div className="text-[11px] text-charcoal-400">{ov.weakTopics.length} weak topic{ov.weakTopics.length === 1 ? '' : 's'} · avg {ov.avgScore}%</div></div>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[ov.status] }} title={ov.status} />
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-9 space-y-6">
          {/* topic results */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.student.full_name} size="lg" />
                <div><div className="flex items-center gap-2"><h2 className="text-2xl font-extrabold tracking-tight text-charcoal">{selected.student.full_name}</h2><StatusPill status={selected.ov.status} /></div><div className="text-sm text-charcoal-400">{weak.length} weak · {strong.length} strong of {topics.length} assessed topics{existingSets.length ? ` · ${existingSets.length} set${existingSets.length > 1 ? 's' : ''} already assigned` : ''}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Tabs tabs={[{ value: 'all', label: 'All courses' }, ...db.courses.map((c) => ({ value: c.id, label: c.subject }))]} value={courseId} onChange={setCourseId} />
                {courseId !== 'all' && (
                  <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="rounded-xl border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-mango">
                    <option value="all">Every lesson</option>
                    {courseLessons(db, courseId).map((l) => <option key={l.id} value={l.id}>{l.position}. {l.title}</option>)}
                  </select>
                )}
              </div>
            </div>
            {topics.length ? (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {topics.map((t) => (
                  <div key={`${t.lessonId}-${t.id}`} className={cx('rounded-xl px-3 py-2', t.score < 30 ? 'bg-danger-soft/60' : t.score < 60 ? 'bg-caution-soft/70' : t.score >= 80 ? 'bg-success-soft/60' : 'bg-cloud')}>
                    <div className="flex items-center justify-between text-sm mb-1"><span className="font-semibold text-charcoal truncate">{t.name} <span className="text-charcoal-400 font-normal text-xs">· {courseById(db, t.courseId)?.subject}</span></span><span className="font-bold shrink-0" style={{ color: scoreInk(t.score) }}>{t.score}%</span></div>
                    <ScoreBar score={t.score} />
                  </div>
                ))}
              </div>
            ) : <Callout tone="info">{first} has not completed a lesson in this scope yet.</Callout>}
          </Card>

          {/* generator */}
          <Card className={cx(!items && 'bg-charcoal text-white bolt-pattern-dark')}>
            {!items ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-hand text-mango text-2xl leading-none mb-1">tailored to {first}</div>
                  <h3 className="text-xl font-extrabold tracking-tight">Generate extra practice</h3>
                  <p className="text-sm text-white/70 mt-1 max-w-xl">5 items on {targetTopics.length ? targetTopics.map((t) => `${t.name} (${t.score}%)`).join(', ') : 'the lesson topics'} — real-life scenarios, mixed difficulty, with the reason each item was chosen.</p>
                </div>
                <Button size="lg" onClick={generate} loading={busy} disabled={!topics.length}><Wand2 size={18} /> {busy ? 'Generating…' : 'Generate extra practice'}</Button>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div><div className="font-hand text-mango text-xl leading-none mb-1">ready for {first}</div><h3 className="text-xl font-extrabold tracking-tight text-charcoal">{items.length} tailored items · {targetCourse?.subject}{targetLesson ? ` · ${targetLesson.title}` : ''}</h3></div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={generate} loading={busy}><Wand2 size={16} /> Regenerate</Button>
                    <Button onClick={assign} disabled={assigned}>{assigned ? <><CheckCircle2 size={16} /> Assigned</> : <><Send size={16} /> Assign to {first}</>}</Button>
                  </div>
                </div>
                <ol className="space-y-3">
                  {items.map((it, i) => {
                    const [Icon, tLabel] = TYPE_META[it.type] || TYPE_META.short
                    return (
                      <li key={it.id} className="rounded-2xl border border-charcoal-100 p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="w-7 h-7 rounded-lg bg-charcoal text-white text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                          <Pill tone="mango">{it.topic}</Pill>
                          <Pill tone="neutral" icon={Icon}>{tLabel}</Pill>
                          <Pill tone="outline">{'●'.repeat(it.difficulty || 1)}{'○'.repeat(3 - (it.difficulty || 1))} difficulty</Pill>
                          {it.context && <span className="text-[11px] text-charcoal-400 ml-auto">{it.context}</span>}
                        </div>
                        <p className="text-sm font-semibold text-charcoal">{it.prompt}</p>
                        {it.options && <ul className="mt-2 grid sm:grid-cols-2 gap-1.5">{it.options.map((o) => <li key={o} className={cx('rounded-lg px-3 py-1.5 text-xs border', o === it.answer ? 'border-success bg-success-soft text-success font-semibold' : 'border-charcoal-100 text-charcoal-500')}>{o}</li>)}</ul>}
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-charcoal-400"><span><span className="font-semibold text-charcoal-500">Answer:</span> {String(it.answer)}</span><span><span className="font-semibold text-charcoal-500">Why:</span> {it.explanation}</span></div>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mango-50 text-mango-700 px-2.5 py-1 text-[11px] font-semibold">{it.rationale}</div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Toasts />
    </div>
  )
}

function rationaleFor(item, topics, first) {
  const t = topics.find((x) => x.id === item.topicId) || topics[0]
  if (!t) return `Because this reinforces ${item.topic}`
  if (t.score < 60) return `because ${first} scored ${t.score}% on ${t.name}`
  if (t.score < 80) return `because ${t.name} (${t.score}%) is not yet secure`
  return `stretch item — ${first} already holds ${t.name} at ${t.score}%`
}
