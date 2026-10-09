import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { Card, StatusPill, ProgressBar } from '../ui'
import { bandTopics, masteryWord, examReadiness, readinessSentence, readinessTone, daysUntil } from './lens'
import { cx } from '../../lib/utils'

const COLS = [
  { key: 'understands', label: 'Understands', tone: 'bg-success-soft text-success', empty: 'Nothing above 80% yet — the next checkpoint will change that.' },
  { key: 'working', label: 'Working on', tone: 'bg-mango-50 text-mango-700', empty: 'No topics in the middle band.' },
  { key: 'needsHelp', label: 'Needs help', tone: 'bg-danger-soft text-danger', empty: 'Nothing below 60%. Nice.' },
]

export function TopicChip({ topic, tone }) {
  return (
    <span className={cx('inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', tone)} title={`${topic.name} · ${topic.score}% · ${topic.lessonTitle}`}>
      <span>{topic.name}</span>
      <span className="opacity-70 font-medium">· {masteryWord(topic.score)}</span>
      <span className="text-[10px] opacity-60 tabular-nums">{topic.score}</span>
    </span>
  )
}

/** One course: what the child understands, what's forming, what needs help, what's next, exam readiness. */
export default function UnderstandingCard({ course, summary, firstName }) {
  const bands = bandTopics(summary.topicScores)
  const readiness = examReadiness(summary)
  const days = daysUntil(course.exam_date)
  return (
    <Card className="overflow-hidden" padded={false}>
      <div className="h-1.5" style={{ background: course.color }} />
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold" style={{ background: course.color }}>{course.subject[0]}</div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-charcoal leading-tight">{course.title}</h3>
              <div className="text-xs text-charcoal-400 mt-0.5">{summary.completed} of {summary.total} checkpoints · average {summary.avgScore}% · exam in {days} days</div>
            </div>
          </div>
          <StatusPill status={summary.status} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-5">
          {COLS.map((c) => (
            <div key={c.key} className="rounded-2xl bg-charcoal-50 p-3.5 min-h-[120px]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{c.label}</div>
                <span className="text-[11px] font-bold text-charcoal-300 tabular-nums">{bands[c.key].length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bands[c.key].length ? bands[c.key].slice(0, 6).map((t) => <TopicChip key={t.id} topic={t} tone={c.tone} />) : <p className="text-xs text-charcoal-400 leading-relaxed">{c.empty}</p>}
                {bands[c.key].length > 6 && <span className="text-[11px] text-charcoal-400 self-center">+{bands[c.key].length - 6} more</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-4 mt-5 items-stretch">
          <div className="md:col-span-2 rounded-2xl border border-charcoal-100 p-4 flex flex-col">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">What’s next</div>
            {summary.nextLesson ? (
              <>
                <div className="font-bold text-charcoal leading-snug">{summary.nextLesson.title}</div>
                <p className="text-xs text-charcoal-400 mt-1 flex-1 leading-relaxed">{summary.nextLesson.summary}</p>
                <Link to="/parent/journey" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-mango-700 hover:text-mango-600">See the journey <ArrowRight size={12} /></Link>
              </>
            ) : <div className="font-bold text-charcoal">Journey complete — revision mode.</div>}
          </div>
          <div className="md:col-span-3 rounded-2xl border border-charcoal-100 p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Exam readiness</div>
              <div className="flex items-center gap-1 text-[11px] text-charcoal-400"><CalendarClock size={12} /> {new Date(course.exam_date).toLocaleDateString('en', { day: 'numeric', month: 'long' })}</div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-extrabold text-charcoal tabular-nums leading-none">{readiness}<span className="text-base text-charcoal-300">/100</span></div>
              <ProgressBar value={readiness} tone={readinessTone(readiness)} className="flex-1 mb-1.5" height="h-2.5" />
            </div>
            <p className="text-sm text-charcoal-500 mt-2.5 leading-relaxed">{readinessSentence(firstName, readiness, days, bands.needsHelp.length)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
