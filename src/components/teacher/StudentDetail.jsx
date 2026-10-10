import { Link } from 'react-router-dom'
import { ArrowLeft, Wand2, FileSearch, CalendarCheck, Stamp, MessageCircleQuestion, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, Button, Pill, StatusPill, Avatar, ScoreBar, scoreTextClass, StatTile, SectionHeader, Callout } from '../ui'
import { studentOverview, attendanceSummary, studentBadges, recognitionPatterns, lessonById, courseById } from '../../lib/selectors'
import { fmtTime } from '../../lib/utils'
import { computeFlags } from './flags'
import { PATTERN_META } from './recognitionMeta'
import AIInsightCard from './AIInsightCard'
import { studentDigest, studentFallback } from './progressInsights'

export const STUDENT_SYS = "You are BOLT, helping a Grade 12 teacher understand one student's progress. Use ONLY the data given. Write 2 short paragraphs (how the student is doing across subjects and over time; what is holding them back, using their own tutor questions as evidence), then 'Next steps:' with 3 bullet points the teacher can do this week. Plain language, no headings, no markdown symbols except •."

/** One dot per checkpoint of a course journey. */
export function JourneyDots({ summary, color }) {
  return (
    <div className="flex items-center gap-1.5">
      {summary.rows.map((r, i) => {
        const st = r.progress?.status
        return (
          <div key={r.lesson.id} title={`${i + 1}. ${r.lesson.title}${r.progress?.score != null ? ` · ${r.progress.score}%` : ''}`}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2"
            style={st === 'completed' ? { background: color, borderColor: color, color: '#fff' } : st === 'in-progress' ? { background: '#fff', borderColor: color, color } : { background: '#E6E8EC', borderColor: '#E6E8EC', color: '#9EA1A8' }}>
            {i + 1}
          </div>
        )
      })}
    </div>
  )
}

export default function StudentDetail({ db, student }) {
  const ov = studentOverview(db, student.id)
  const att = attendanceSummary(db, student.id)
  const badges = studentBadges(db, student.id).sort((a, b) => b.earned_at.localeCompare(a.earned_at))
  const pattern = recognitionPatterns(db).find((r) => r.student.id === student.id)
  const questions = db.chatMessages.filter((m) => m.student_id === student.id && m.role === 'user').sort((a, b) => b.created_at.localeCompare(a.created_at))
  const subs = db.submissions.filter((s) => s.student_id === student.id)
  const first = student.full_name.split(' ')[0]
  const meta = PATTERN_META[pattern?.pattern] || PATTERN_META.steady

  return (
    <div className="space-y-6">
      <Link to="/teacher/tracker" className="inline-flex items-center gap-1 text-sm font-semibold text-charcoal-400 hover:text-charcoal"><ArrowLeft size={15} /> All students</Link>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={student.full_name} size="xl" />
        <div className="flex-1 min-w-[200px]">
          <div className="font-hand text-mango text-2xl leading-none mb-1">student profile</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal flex items-center gap-3">{student.full_name} <StatusPill status={ov.status} /></h1>
          <div className="text-charcoal-400 mt-1">{student.title} · {student.email}</div>
        </div>
        <div className="flex gap-2">
          <Button to={`/teacher/practice/${student.id}`}><Wand2 size={16} /> Generate extra practice</Button>
          <Button variant="secondary" to={subs[0] ? `/teacher/review/${subs[0].id}` : '/teacher/review'}><FileSearch size={16} /> Open process replay</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Sparkles} label="Average score" value={`${ov.avgScore}%`} hint={`${ov.totalPoints.toLocaleString()} points this term`} />
        <StatTile icon={CalendarCheck} tone={att.absent >= 3 ? 'danger' : 'success'} label="Attendance" value={`${att.rate}%`} hint={`${att.absent} absent · ${att.late} late · ${att.streak}-day streak`} />
        <StatTile icon={Stamp} tone="dark" label="Passport stamps" value={badges.length} hint={badges[0] ? `Latest: ${badges[0].badge.name}` : 'No stamps yet'} />
        <StatTile icon={MessageCircleQuestion} tone="info" label="Tutor questions" value={questions.length} hint={questions[0] ? `Last on ${lessonById(db, questions[0].lesson_id)?.title}` : 'None yet'} />
      </div>

      <AIInsightCard title={`Progress insight for ${first}`} eyebrow="what the data says" resetKey={student.id}
        placeholder={`A read of ${first}'s scores, pace, attendance, essays and tutor questions — what is going well, what is holding ${first} back, and three things to do this week.`}
        build={() => { const d = studentDigest(db, student.id); return { system: STUDENT_SYS, prompt: d.text, fallback: studentFallback(d) } }} />

      <Card>
        <SectionHeader squiggle={false} eyebrow="journeys" title="Progress per course" className="mb-4" />
        <div className="grid md:grid-cols-3 gap-4">
          {ov.courses.map((c) => {
            const course = courseById(db, c.courseId)
            return (
              <div key={c.courseId} className="rounded-2xl border border-charcoal-100 p-4">
                <div className="flex items-center justify-between gap-2 mb-2"><span className="font-bold text-charcoal text-sm">{course.title.split(':')[0]}</span><StatusPill status={c.status} /></div>
                <JourneyDots summary={c} color={course.color} />
                <div className="mt-3 text-xs text-charcoal-400">{c.completed}/{c.total} checkpoints · avg {c.avgScore || '—'}%{c.currentLesson ? ` · now on “${c.currentLesson.title}”` : ' · journey complete'}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader squiggle={false} eyebrow="needs work" title="Weak topics" subtitle="Below 60% — these drive the extra-practice generator." className="mb-4" />
          {ov.weakTopics.length ? (
            <div className="space-y-3">
              {ov.weakTopics.slice(0, 6).map((t) => (
                <div key={`${t.lessonId}-${t.id}`}>
                  <div className="flex items-center justify-between text-sm mb-1"><span className="font-semibold text-charcoal">{t.name} <span className="text-charcoal-400 font-normal">· {courseById(db, t.courseId)?.subject}</span></span><span className={`font-bold ${scoreTextClass(t.score)}`}>{t.score}%</span></div>
                  <ScoreBar score={t.score} />
                </div>
              ))}
            </div>
          ) : <Callout tone="success">No topic below 60% — {first} is holding every skill assessed so far.</Callout>}
        </Card>
        <Card>
          <SectionHeader squiggle={false} eyebrow="strengths" title="Strong topics" subtitle="80% and above — candidates for peer mentoring." className="mb-4" />
          {!ov.courses.some((c) => c.strongTopics.length) && <Callout tone="mango">Nothing at 80% yet — the first strong topic is the best thing to celebrate next week.</Callout>}
          <div className="space-y-3">
            {ov.courses.flatMap((c) => c.strongTopics.map((t) => ({ ...t, courseId: c.courseId }))).sort((a, b) => b.score - a.score).slice(0, 6).map((t) => (
              <div key={`${t.lessonId}-${t.id}`}>
                <div className="flex items-center justify-between text-sm mb-1"><span className="font-semibold text-charcoal">{t.name} <span className="text-charcoal-400 font-normal">· {courseById(db, t.courseId)?.subject}</span></span><span className="font-bold text-success">{t.score}%</span></div>
                <ScoreBar score={t.score} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <SectionHeader squiggle={false} eyebrow="curiosity" title="Questions to the tutor" className="mb-3" />
          <div className="space-y-2">
            {questions.map((qm) => {
              const lesson = lessonById(db, qm.lesson_id)
              return (
                <Link key={qm.id} to={`/teacher/insights/${qm.lesson_id}`} className="block rounded-xl bg-cloud px-3 py-2 hover:bg-charcoal-100 transition-colors">
                  <div className="text-sm text-charcoal">“{qm.content}”</div>
                  <div className="text-[11px] text-charcoal-400 mt-0.5">{lesson?.title} · at {fmtTime(qm.video_t)}</div>
                </Link>
              )
            })}
            {!questions.length && <div className="text-sm text-charcoal-400">No questions yet — silent students are worth a check-in.</div>}
          </div>
        </Card>
        <Card>
          <SectionHeader squiggle={false} eyebrow="presence" title="Attendance" className="mb-3" />
          <div className="grid grid-cols-4 gap-2 text-center mb-3">
            {[['Present', att.present, 'text-success'], ['Late', att.late, 'text-mango'], ['Absent', att.absent, 'text-danger'], ['Excused', att.excused, 'text-info']].map(([l, v, c]) => <div key={l} className="rounded-xl bg-cloud py-2"><div className={`text-xl font-extrabold ${c}`}>{v}</div><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">{l}</div></div>)}
          </div>
          <div className="flex flex-wrap gap-1">
            {att.rows.map((r) => <span key={r.id} title={`${r.date} · ${r.status}${r.note ? ` · ${r.note}` : ''}`} className={`w-3.5 h-3.5 rounded-[4px] ${r.flag ? 'ring-2 ring-mango' : ''} ${{ present: 'bg-success', late: 'bg-mango', absent: 'bg-danger', excused: 'bg-info' }[r.status]}`} />)}
          </div>
          {att.flags.map((f) => <Callout key={f.id} tone="mango" icon={AlertTriangle} title={`Record conflict · ${f.date}`} className="mt-3">{f.note}</Callout>)}
          {att.perfectMonths.length > 0 && <div className="mt-3 text-xs text-success font-semibold">Perfect month: {att.perfectMonths.join(', ')}</div>}
        </Card>
        <Card>
          <SectionHeader squiggle={false} eyebrow="passport" title="Stamps & pattern" className="mb-3" />
          <div className={`rounded-2xl p-3 mb-3 ${meta.cls}`}>
            <div className="text-[11px] uppercase tracking-wide font-bold opacity-80">{meta.label}</div>
            <div className="text-sm mt-0.5">{pattern?.message}</div>
          </div>
          <div className="space-y-1.5">
            {badges.slice(0, 5).map((b) => <div key={b.id} className="flex items-center justify-between text-sm"><span className="font-semibold text-charcoal">{b.badge.name}</span><span className="text-[11px] text-charcoal-400">{new Date(b.earned_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span></div>)}
            {badges.length > 5 && <div className="text-xs text-charcoal-400">+{badges.length - 5} more</div>}
          </div>
          {subs.length > 0 && (
            <div className="mt-4 border-t border-charcoal-100 pt-3">
              <div className="text-[11px] uppercase tracking-wide font-semibold text-charcoal-400 mb-1.5">Essay submissions</div>
              {subs.map((s) => (
                <Link key={s.id} to={`/teacher/review/${s.id}`} className="flex items-center justify-between gap-2 text-sm rounded-lg hover:bg-cloud px-1 py-1">
                  <span className="truncate text-charcoal">{s.title}</span>
                  <span className="flex items-center gap-1 shrink-0"><StatusPill status={s.status} />{computeFlags(s).filter((f) => f.severity === 'high').length > 0 && <Pill tone="danger">!</Pill>}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
