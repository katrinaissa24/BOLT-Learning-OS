import { useMemo, useState } from 'react'
import { ShieldAlert, Send, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'
import { PageTitle, SectionHeader, SuggestedTag, Modal, Textarea, Button, Callout, StatTile, Pill } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { parentLens, courseById, profileById } from '../../lib/selectors'
import { TEACHER_ID } from '../../data/seed'
import AlertCard from '../../components/parent/AlertCard'
import InterventionTimeline from '../../components/parent/InterventionTimeline'
import RiskForecast from '../../components/parent/RiskForecast'
import { examReadiness } from '../../components/parent/lens'
import { useToast } from '../../components/parent/Toast'

const alertKey = (a) => `${a.courseId || 'att'}-${a.topic || a.level}`

// Demo intervention states for the child's weak topics (dates match the tutor questions in the seed).
const TIMELINE_DEMO = {
  'chain-rule': { steps: { detected: 'Sep 24', assigned: 'Sep 24', recheck: null, resolved: null }, detail: { detected: 'Scored 44% on the chain-rule question and asked the tutor “where does the extra 2x come from?”', assigned: 'Extra-practice branch “Chain Rule & Product Rule” · 6 questions · ~15 min', recheck: 'Three new questions after the branch. Passing means 70%+.', resolved: 'Stamp “Comeback” if it goes from below 50% to above 80%.' } },
  'lhopital': { steps: { detected: 'Oct 1', assigned: 'Oct 2', recheck: null, resolved: null }, detail: { detected: 'Asked “When is L’Hôpital allowed? Only 0/0?” during lesson 5.', assigned: 'Branch “Limits & L’Hôpital’s Rule” · 5 questions', recheck: 'Scheduled after the branch is completed.', resolved: null } },
  'centripetal': { steps: { detected: 'Sep 29', assigned: null, recheck: null, resolved: null }, detail: { detected: 'Scored 35% and asked “If speed is constant how can there be acceleration?”', assigned: 'Rania Haddad is generating the practice branch this week.', recheck: null, resolved: null } },
}

export default function Alerts() {
  const { profile } = useAuth()
  const { db } = useData()
  const lens = useMemo(() => parentLens(db, profile.child_id), [db, profile.child_id])
  const first = lens.child.full_name.split(' ')[0]
  const teacher = profileById(db, TEACHER_ID)
  const [discussed, setDiscussed] = useState({})
  const [askFor, setAskFor] = useState(null)
  const [message, setMessage] = useState('')
  const [toast, show] = useToast()

  const openAsk = (a) => {
    setAskFor(a)
    setMessage(`Hi Ms. Haddad,\n\nBOLT flagged that ${first} is at ${a.score}% on ${a.topic} in ${a.course}, with the exam in ${a.daysToExam} days. We will do the extra-practice branch together this week.\n\nIs there anything specific you have noticed in class that we should focus on at home? Happy to join a 10-minute call if useful.\n\nThank you,\n${profile.full_name}`)
  }

  const timelineItems = lens.overview.weakTopics.map((t) => {
    const course = courseById(db, t.courseId)
    const demo = TIMELINE_DEMO[t.id] || { steps: { detected: 'Oct 8', assigned: null, recheck: null, resolved: null }, detail: {} }
    return { topic: t.name, course: course.subject, color: course.color, score: t.score, ...demo }
  })
  const counts = { high: lens.alerts.filter((a) => a.level === 'high').length, medium: lens.alerts.filter((a) => a.level === 'medium').length, good: lens.alerts.filter((a) => a.level === 'good').length }
  const doneCount = Object.values(discussed).filter(Boolean).length

  return (
    <div>
      <PageTitle eyebrow="before the exam, not after" title="Intervene early" subtitle={`BOLT watches every checkpoint ${first} completes. When a topic wobbles, you hear about it while there is still time to fix it — and you hear again when it is fixed.`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={ShieldAlert} tone="danger" label="Act this week" value={counts.high} hint="topics below 45%" />
        <StatTile icon={Clock} tone="mango" label="Keep an eye" value={counts.medium} hint="topics 45–59%" />
        <StatTile icon={TrendingUp} tone="success" label="Good news" value={counts.good} hint="worth saying out loud" />
        <StatTile icon={CheckCircle2} tone="dark" label="Discussed" value={`${doneCount}/${lens.alerts.length}`} hint="marked by you" />
      </div>

      <div className="space-y-4">
        {lens.alerts.map((a) => {
          const k = alertKey(a)
          return <AlertCard key={k} alert={a} first={first} discussed={!!discussed[k]} onDiscussed={() => setDiscussed((d) => ({ ...d, [k]: !d[k] }))} onAskTeacher={() => openAsk(a)} onRemind={() => show(`Reminder set for Tuesday 19:00 — “${a.topic || 'BOLT session'} with ${first}”`)} />
        })}
      </div>

      <SectionHeader className="mt-12" eyebrow="detect → practice → re-check → resolved" title="Intervention timeline" subtitle="Each weak topic moves through four stages. Nothing is ‘resolved’ until a re-check proves it, and a Comeback stamp lands in the passport." />
      <InterventionTimeline items={timelineItems} />

      <SectionHeader className="mt-12" eyebrow="a simple what-if" title={<span className="inline-flex items-center gap-3">Risk before the exam <SuggestedTag /></span>} subtitle="Exam risk forecast: where readiness lands by exam day if nothing changes versus with two short practice sessions a week. Deterministic, not a prediction — it shows why starting now is cheaper than cramming." />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {lens.overview.courses.map((s) => <RiskForecast key={s.courseId} course={courseById(db, s.courseId)} readiness={examReadiness(s)} />)}
      </div>

      <Callout tone="mango" className="mt-8" title="Why this page exists">
        A report card tells you what happened. This page tells you what is about to happen, with {Math.min(...db.courses.map((c) => Math.round((new Date(c.exam_date) - new Date('2026-10-09')) / 86400000)))} days to change it.
      </Callout>

      <Modal open={!!askFor} onClose={() => setAskFor(null)} title={`Message ${teacher?.full_name || 'the teacher'}`}>
        {askFor && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-400">
              <Pill tone="outline" className="normal-case tracking-normal">{askFor.course}</Pill>
              <span>· {askFor.topic} at {askFor.score}% · exam in {askFor.daysToExam} days</span>
            </div>
            <Textarea label="Your message (pre-drafted — edit freely)" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} />
            <p className="text-xs text-charcoal-400">{teacher?.full_name} sees the alert context with your message and usually replies within a school day.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAskFor(null)}>Cancel</Button>
              <Button onClick={() => { setAskFor(null); show(`Message sent to ${teacher?.full_name}`) }}><Send size={16} /> Send</Button>
            </div>
          </div>
        )}
      </Modal>
      {toast}
    </div>
  )
}
