import { Check, Lock, Play } from 'lucide-react'
import { Card, StatusPill } from '../ui'
import { cx } from '../../lib/utils'
import { masteryWord } from './lens'

/** Read-only 7-node journey row for one course. */
export default function MiniJourney({ course, summary }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl text-white font-extrabold flex items-center justify-center" style={{ background: course.color }}>{course.subject[0]}</div>
          <div>
            <h3 className="font-extrabold text-charcoal leading-tight">{course.title}</h3>
            <div className="text-xs text-charcoal-400">{summary.completed}/{summary.total} checkpoints · {summary.percent}% of the journey · {Math.round(summary.timeSpent / 60)}h {summary.timeSpent % 60}m of focused time</div>
          </div>
        </div>
        <StatusPill status={summary.status} />
      </div>
      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-1 bg-charcoal-100 rounded-full" />
        <div className="absolute left-5 top-5 h-1 rounded-full transition-all" style={{ background: course.color, width: `calc(${Math.max(0, (summary.completed - 0.5) / (summary.total - 1)) * 100}% - 0px)` }} />
        <ol className="relative grid grid-cols-7 gap-1">
          {summary.rows.map(({ lesson, progress }, i) => {
            const state = progress?.status === 'completed' ? 'done' : progress?.status === 'in-progress' || (!progress && i === summary.completed) ? 'current' : 'locked'
            const score = progress?.score
            return (
              <li key={lesson.id} className="flex flex-col items-center text-center" title={`${lesson.title}${score != null ? ` · ${score}%` : ''}`}>
                <div className={cx('w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white font-extrabold text-sm', state === 'done' ? 'text-white' : state === 'current' ? 'bg-white text-charcoal border-2' : 'bg-charcoal-100 text-charcoal-300')} style={state === 'done' ? { background: course.color } : state === 'current' ? { borderColor: course.color } : undefined}>
                  {state === 'done' ? <Check size={16} /> : state === 'current' ? <Play size={14} style={{ color: course.color }} /> : <Lock size={13} />}
                </div>
                <div className={cx('mt-2 text-[11px] font-semibold leading-tight line-clamp-2 min-h-[28px]', state === 'locked' ? 'text-charcoal-300' : 'text-charcoal')}>{lesson.title}</div>
                <div className="mt-1 text-[11px] tabular-nums">
                  {score != null ? <span className={cx('font-bold', score >= 80 ? 'text-success' : score >= 60 ? 'text-mango-700' : 'text-danger')}>{score}% <span className="font-medium text-charcoal-400">{masteryWord(score)}</span></span> : state === 'current' ? <span className="font-semibold" style={{ color: course.color }}>now</span> : <span className="text-charcoal-300">—</span>}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Card>
  )
}
