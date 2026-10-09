import { AlertTriangle, AlertCircle, PartyPopper, CheckCircle2, MessageSquare, BellRing, Route } from 'lucide-react'
import { Card, Pill, Button } from '../ui'
import { cx } from '../../lib/utils'

const LEVEL = {
  high: { icon: AlertTriangle, label: 'Act this week', pill: 'danger', bar: 'bg-danger', bg: 'bg-danger-soft text-danger' },
  medium: { icon: AlertCircle, label: 'Keep an eye', pill: 'warning', bar: 'bg-mango', bg: 'bg-mango-50 text-mango-700' },
  good: { icon: PartyPopper, label: 'Good news', pill: 'success', bar: 'bg-success', bg: 'bg-success-soft text-success' },
}

function whyItMatters(a, first) {
  if (a.level === 'good') return `Habits like this are what carry ${first} through exam season. Noticing them keeps them going.`
  if (a.topic) {
    const weeks = Math.max(1, Math.round(a.daysToExam / 7))
    return a.daysToExam > 28
      ? `${a.daysToExam} days is ${weeks} weeks — enough to fix this calmly with two short sessions a week. Waiting until the last fortnight makes it a cram.`
      : `Only ${a.daysToExam} days left. This topic will be on the exam and is currently the most likely place to lose marks.`
  }
  return 'Falling behind on checkpoints compounds: each lesson builds on the one before.'
}

export default function AlertCard({ alert: a, first, discussed, onDiscussed, onAskTeacher, onRemind }) {
  const L = LEVEL[a.level]
  const Icon = L.icon
  const studentAction = a.topic ? `Extra practice branch for ${a.topic}, ~15 min` : a.courseId ? 'Two 30-minute BOLT sessions this week' : `Keep showing up — ${first} already is`
  return (
    <Card padded={false} className={cx('overflow-hidden transition-opacity', discussed && 'opacity-60')}>
      <div className="flex">
        <div className={cx('w-1.5 shrink-0', L.bar)} />
        <div className="p-5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className={cx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', L.bg)}><Icon size={16} /></div>
            <Pill tone={L.pill}>{L.label}</Pill>
            {a.course && <Pill tone="outline" className="normal-case tracking-normal">{a.course}</Pill>}
            {a.daysToExam != null && <span className="text-xs text-charcoal-400">exam in {a.daysToExam} days</span>}
            {discussed && <Pill tone="success" icon={CheckCircle2} className="ml-auto normal-case tracking-normal">Discussed</Pill>}
          </div>
          <h3 className="text-lg font-extrabold tracking-tight text-charcoal leading-snug">{a.text}</h3>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="rounded-2xl bg-charcoal-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">Why it matters</div>
              <p className="text-sm text-charcoal-500 leading-relaxed">{whyItMatters(a, first)}</p>
            </div>
            <div className="rounded-2xl bg-mango-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-mango-700 mb-1">What you can do</div>
              <p className="text-sm text-charcoal leading-relaxed">{a.action}</p>
            </div>
            <div className="rounded-2xl bg-charcoal-50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">What {first} can do</div>
              <p className="text-sm text-charcoal-500 leading-relaxed inline-flex items-start gap-1.5"><Route size={14} className="mt-0.5 shrink-0 text-mango" /><span className="font-semibold text-charcoal">{studentAction}</span></p>
              {a.topic && <p className="text-xs text-charcoal-400 mt-1">BOLT re-checks the topic automatically after the branch.</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" variant={discussed ? 'secondary' : 'dark'} onClick={onDiscussed}><CheckCircle2 size={14} /> {discussed ? 'Mark as not discussed' : 'Mark as discussed'}</Button>
            {a.level !== 'good' && <Button size="sm" variant="secondary" onClick={onAskTeacher}><MessageSquare size={14} /> Ask the teacher</Button>}
            <Button size="sm" variant="ghost" onClick={onRemind}><BellRing size={14} /> Set a reminder</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
