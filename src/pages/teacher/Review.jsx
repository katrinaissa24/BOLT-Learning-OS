import { useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Clock, Activity, Keyboard, Bot, Repeat, Coffee, FileText, AlertTriangle, CheckCircle2, Info, Lock } from 'lucide-react'
import { PageTitle, Card, SectionHeader, Button, Pill, StatusPill, Avatar, Input, Textarea, Callout, Tabs } from '../../components/ui'
import { useData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { profileById, lessonById, courseById } from '../../lib/selectors'
import { computeFlags, computeInsights, suggestGrade, severityTone } from '../../components/teacher/flags'
import ReplayPlayer from '../../components/teacher/ReplayPlayer'
import { useToast } from '../../components/teacher/Toast'
import { cx } from '../../lib/utils'

const fmtDur = (s) => (s < 60 ? `${s}s` : s < 3600 ? `${Math.round(s / 60)} min` : `${(s / 3600).toFixed(1)} h`)

export default function Review() {
  const { db } = useData()
  const { submissionId } = useParams()
  if (submissionId) {
    const sub = db.submissions.find((s) => s.id === submissionId)
    if (!sub) return <Navigate to="/teacher/review" replace />
    return <SubmissionDetail sub={sub} />
  }
  return <SubmissionList db={db} />
}

function SubmissionList({ db }) {
  const [filter, setFilter] = useState('all')
  const lesson = lessonById(db, 'eng-12-l2')
  const subs = useMemo(() => db.submissions.map((s) => ({ ...s, student: profileById(db, s.student_id), flags: computeFlags(s) })).sort((a, b) => ['flagged', 'submitted', 'graded'].indexOf(a.status) - ['flagged', 'submitted', 'graded'].indexOf(b.status)), [db])
  const shown = subs.filter((s) => filter === 'all' || (filter === 'flagged' ? s.flags.some((f) => f.severity === 'high') || s.status === 'flagged' : s.status === filter))
  return (
    <div className="space-y-6">
      <PageTitle eyebrow="grade the thinking path" title="Process Replay" subtitle={`Essays for “${lesson.title}” were written inside BOLT’s editor. Every keystroke, pause, paste and AI prompt is recorded, so you grade how the essay was made, not only what it says.`} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={[{ value: 'all', label: `All · ${subs.length}` }, { value: 'flagged', label: `Flagged · ${subs.filter((s) => s.flags.some((f) => f.severity === 'high') || s.status === 'flagged').length}` }, { value: 'submitted', label: `To grade · ${subs.filter((s) => s.status === 'submitted').length}` }, { value: 'graded', label: `Graded · ${subs.filter((s) => s.status === 'graded').length}` }]} value={filter} onChange={setFilter} />
        <div className="text-xs text-charcoal-400 flex items-center gap-1.5"><Info size={13} /> Flags are computed automatically from process metrics; they are prompts for a conversation, not verdicts.</div>
      </div>
      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-charcoal-400 border-b border-charcoal-100">
            <th className="px-5 py-3 font-semibold">Student & title</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold text-right">Words</th><th className="px-4 py-3 font-semibold text-right">Time</th><th className="px-4 py-3 font-semibold text-right">AI share</th><th className="px-4 py-3 font-semibold text-right">Revised</th><th className="px-4 py-3 font-semibold">Flags</th><th className="px-4 py-3 font-semibold text-right">Grade</th>
          </tr></thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.id} className="border-b border-charcoal-50 last:border-0 hover:bg-cloud/70">
                <td className="px-5 py-3"><Link to={`/teacher/review/${s.id}`} className="flex items-center gap-3"><Avatar name={s.student?.full_name || ''} size="sm" /><div className="leading-tight"><div className="font-bold text-charcoal">{s.student?.full_name}</div><div className="text-xs text-charcoal-400">“{s.title}” {s.process ? <Pill tone="mango" className="ml-1">full replay</Pill> : null}</div></div></Link></td>
                <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{s.metrics.words}</td>
                <td className="px-4 py-3 text-right tabular-nums"><span className="font-semibold">{fmtDur(s.metrics.total_seconds)}</span><span className="text-xs text-charcoal-400"> · {fmtDur(s.metrics.active_seconds)} active</span></td>
                <td className="px-4 py-3 text-right tabular-nums"><span className={cx('font-semibold', s.ai_usage.share_of_text > 0.3 ? 'text-danger' : 'text-charcoal')}>{Math.round(s.ai_usage.share_of_text * 100)}%</span>{s.ai_usage.prompts > 0 && <span className="text-xs text-charcoal-400"> · {s.ai_usage.declared ? 'declared' : 'undeclared'}</span>}</td>
                <td className="px-4 py-3 text-right tabular-nums">{Math.round(s.metrics.revision_ratio * 100)}%</td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{s.flags.length ? s.flags.map((f) => <Pill key={f.id} tone={severityTone(f.severity)} title={f.detail}>{f.label}</Pill>) : <span className="text-xs text-success font-semibold inline-flex items-center gap-1"><CheckCircle2 size={13} /> clean</span>}</div></td>
                <td className="px-4 py-3 text-right font-extrabold tabular-nums">{s.grade != null ? `${s.grade}/20` : <span className="text-charcoal-300 font-normal">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function SubmissionDetail({ sub }) {
  const { db, updateSubmission, awardBadge } = useData()
  const { profile } = useAuth()
  const { toast, Toasts } = useToast()
  const student = profileById(db, sub.student_id)
  const lesson = lessonById(db, sub.lesson_id)
  const course = courseById(db, lesson?.course_id)
  const flags = computeFlags(sub)
  const insights = computeInsights(sub, student?.full_name.split(' ')[0])
  const suggested = suggestGrade(sub)
  const [grade, setGrade] = useState(sub.grade ?? '')
  const [feedback, setFeedback] = useState(sub.teacher_feedback ?? '')
  const hasStamp = db.studentBadges.some((b) => b.student_id === sub.student_id && b.badge_id === 'honest-process')
  const m = sub.metrics
  const first = student?.full_name.split(' ')[0]
  const aiTexts = (sub.process || []).filter((e) => e.type === 'ai_insert').map((e) => e.text)

  async function saveGrade() {
    const g = Number(grade)
    if (!(g >= 0 && g <= 20)) { toast('Grade must be between 0 and 20', 'warning'); return }
    await updateSubmission(sub.id, { grade: g, teacher_feedback: feedback, status: 'graded' })
    toast(`Graded ${first}’s essay ${g}/20`)
  }
  async function stamp() {
    const r = await awardBadge(sub.student_id, 'honest-process', `Essay “${sub.title}”: AI declared, ${Math.round(sub.ai_usage.share_of_text * 100)}% AI-assisted text, ${m.snapshots} revision passes.`)
    toast(r ? `Honest Process stamp awarded to ${first}` : `${first} already has the Honest Process stamp`, r ? 'success' : 'info')
  }

  const metricTiles = [
    [Clock, 'Total time', fmtDur(m.total_seconds)], [Activity, 'Active', `${fmtDur(m.active_seconds)} · ${Math.round((m.active_seconds / m.total_seconds) * 100)}%`], [FileText, 'Words', m.words], [Keyboard, 'Keystrokes', m.keystrokes.toLocaleString()],
    [Bot, 'AI share', `${Math.round(sub.ai_usage.share_of_text * 100)}% · ${sub.ai_usage.prompts} prompt${sub.ai_usage.prompts === 1 ? '' : 's'}`], [Repeat, 'Revised', `${Math.round(m.revision_ratio * 100)}% · ${m.deletions} deletions`], [Coffee, 'Longest pause', fmtDur(m.longest_pause_seconds)], [FileText, 'Drafts', m.snapshots],
  ]

  return (
    <div className="space-y-6">
      <Link to="/teacher/review" className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal-400 hover:text-charcoal"><ArrowLeft size={15} /> All submissions</Link>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={student?.full_name || ''} size="lg" />
        <div className="flex-1 min-w-[240px]">
          <div className="font-hand text-mango text-2xl leading-none mb-1">{course?.subject} · {lesson?.title}</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal">“{sub.title}”</h1>
          <div className="text-charcoal-400 mt-1 flex flex-wrap items-center gap-2"><Link to={`/teacher/tracker/${sub.student_id}`} className="font-semibold text-charcoal hover:text-mango">{student?.full_name}</Link> · submitted {new Date(sub.submitted_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} <StatusPill status={sub.status} />{sub.ai_usage.declared ? <Pill tone="success" icon={ShieldCheck}>AI declared · {sub.ai_usage.mode}</Pill> : sub.ai_usage.prompts > 0 ? <Pill tone="danger">AI not declared</Pill> : null}</div>
        </div>
        <Button variant={hasStamp ? 'secondary' : 'dark'} onClick={stamp} disabled={hasStamp}><ShieldCheck size={16} /> {hasStamp ? 'Honest Process stamped' : 'Award Honest Process stamp'}</Button>
      </div>

      {flags.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {flags.map((f) => (
            <Callout key={f.id} tone={f.severity === 'high' ? 'danger' : f.severity === 'medium' ? 'mango' : 'info'} icon={AlertTriangle} title={f.label}>{f.detail}</Callout>
          ))}
        </div>
      )}

      {/* metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricTiles.map(([Icon, label, value]) => (
          <div key={label} className="card px-4 py-3 flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-cloud text-charcoal-400 flex items-center justify-center shrink-0"><Icon size={16} /></span><div className="min-w-0"><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">{label}</div><div className="font-extrabold text-charcoal truncate">{value}</div></div></div>
        ))}
      </div>

      {/* replay */}
      <Card>
        <SectionHeader squiggle={false} eyebrow="replay" title="Writing session" subtitle={sub.process ? `Scrub or play through ${first}’s ${fmtDur(m.total_seconds)} session. The draft rebuilds as the cursor moves; AI-inserted text is mango.` : 'This essay was not written in BOLT’s editor, so only session metrics are available.'} className="mb-4" />
        {sub.process ? <ReplayPlayer process={sub.process} studentName={student?.full_name} /> : (
          <div className="rounded-2xl bg-cloud p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white text-charcoal-300 flex items-center justify-center mb-3"><Lock size={22} /></div>
            <div className="font-bold text-charcoal">Full replay available for submissions written in BOLT’s editor</div>
            <p className="text-sm text-charcoal-400 mt-1 max-w-md mx-auto">This submission arrived with metrics only. Flags above are computed from those metrics; ask {first} to walk you through the draft in an oral defense if anything looks off.</p>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* essay */}
        <Card className="lg:col-span-3">
          <SectionHeader squiggle={false} eyebrow="final text" title="The essay" subtitle={aiTexts.length ? 'Sentences inserted from an AI reply are highlighted.' : undefined} className="mb-4" />
          {sub.content ? (
            <div className="prose-sm max-w-none space-y-4 text-charcoal leading-relaxed">
              {sub.content.split('\n\n').map((para, i) => <p key={i} className={i === 0 ? 'text-lg font-extrabold tracking-tight' : ''}>{highlight(para, aiTexts)}</p>)}
            </div>
          ) : <div className="text-sm text-charcoal-400">Text not stored for this submission (metrics-only import).</div>}
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* insights */}
          <Card>
            <SectionHeader squiggle={false} eyebrow="thinking path" title="Insights" className="mb-3" />
            <ul className="space-y-2">
              {insights.map((it, i) => {
                const Icon = it.tone === 'success' ? CheckCircle2 : it.tone === 'danger' ? AlertTriangle : it.tone === 'warning' ? AlertTriangle : Info
                const cls = { success: 'text-success', danger: 'text-danger', warning: 'text-mango', neutral: 'text-charcoal-400' }[it.tone]
                return <li key={i} className="flex items-start gap-2 text-sm text-charcoal"><Icon size={16} className={cx('shrink-0 mt-0.5', cls)} />{it.text}</li>
              })}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-cloud p-3 text-center"><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">Process</div><div className="text-2xl font-extrabold text-charcoal">{suggested.process}<span className="text-sm text-charcoal-300">/10</span></div></div>
              <div className="rounded-2xl bg-cloud p-3 text-center"><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">Product</div><div className="text-2xl font-extrabold text-charcoal">{suggested.product}<span className="text-sm text-charcoal-300">/10</span></div></div>
            </div>
            <div className="text-[11px] text-charcoal-400 mt-2">Suggested thinking-path grade: {suggested.process + suggested.product}/20. You decide.</div>
          </Card>

          {/* grading */}
          <Card>
            <SectionHeader squiggle={false} eyebrow="grade" title="Teacher grade" className="mb-3" />
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <Input label="Grade / 20" type="number" min={0} max={20} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder={String(suggested.process + suggested.product)} className="w-28" />
                <Button variant="secondary" size="sm" className="mb-0.5" onClick={() => setGrade(suggested.process + suggested.product)}>Use suggestion</Button>
              </div>
              <Textarea label="Feedback" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={`Specific, process-aware feedback for ${first}…`} />
              <Button className="w-full" onClick={saveGrade}>{sub.status === 'graded' ? 'Update grade' : 'Save grade & mark graded'}</Button>
            </div>
          </Card>
        </div>
      </div>
      <Toasts />
    </div>
  )
}

/** Wrap AI-inserted sentences in a mango highlight. */
function highlight(text, aiTexts) {
  if (!aiTexts.length) return text
  let parts = [text]
  aiTexts.forEach((ai) => {
    parts = parts.flatMap((p) => {
      if (typeof p !== 'string' || !p.includes(ai)) return [p]
      const [before, ...rest] = p.split(ai)
      const out = [before]
      rest.forEach((r, i) => { out.push(<mark key={`${ai.slice(0, 8)}-${i}`} className="bg-mango-100 text-charcoal rounded px-0.5" title="Inserted from an AI reply">{ai}</mark>); out.push(r) })
      return out
    })
  })
  return parts
}
