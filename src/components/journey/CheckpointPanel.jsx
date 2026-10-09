import { Clock, GitBranch, PlayCircle, Lock, CheckCircle2, X, Target } from 'lucide-react'
import { Card, Button, Pill, StatusPill, ScoreBar, scoreTextClass, SkillChip } from '../../components/ui'
import { fmtDate } from '../../lib/utils'

/** Side panel for a selected checkpoint. node: { lesson, progress, state, score, weakTopics } */
export default function CheckpointPanel({ node, course, onBranch, onClose, lessonLink }) {
  if (!node) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-mango-50 text-mango flex items-center justify-center mb-3"><Target size={26} /></div>
        <h3 className="font-extrabold text-charcoal">Pick a checkpoint</h3>
        <p className="text-sm text-charcoal-400 mt-1 max-w-xs">Click any node on the landscape to see its topics, your scores and where to branch out.</p>
      </Card>
    )
  }
  const { lesson, progress, state, weakTopics } = node
  const topicRows = lesson.topics.map((t) => ({ ...t, score: progress?.topic_scores?.[t.id] ?? null }))
  const hasWeak = weakTopics?.length > 0
  return (
    <Card className="h-full flex flex-col gap-4 fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Checkpoint {lesson.position} of 7</div>
          <h3 className="text-lg font-extrabold tracking-tight text-charcoal leading-tight">{lesson.title}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-charcoal-100 text-charcoal-400" aria-label="Close panel"><X size={16} /></button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={state === 'current' ? 'in-progress' : state} />
        {state === 'completed' && node.score != null && <Pill tone={node.score >= 80 ? 'success' : node.score >= 60 ? 'mango' : 'danger'}>Score {node.score}%</Pill>}
        <Pill tone="outline" icon={Clock}>{lesson.duration_min} min video</Pill>
      </div>
      <p className="text-sm text-charcoal-500">{lesson.summary}</p>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">Topics</div>
        <div className="space-y-3">
          {topicRows.map((t) => (
            <div key={t.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold text-charcoal">{t.name}</span>
                {t.score != null ? <span className={`font-extrabold ${scoreTextClass(t.score)}`}>{t.score}%</span> : <span className="text-xs text-charcoal-300">not yet assessed</span>}
              </div>
              {t.score != null ? <ScoreBar score={t.score} /> : <div className="h-2 rounded-full bg-charcoal-100" />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">Skills</div>
        <div className="flex flex-wrap gap-1.5">{lesson.skills.map((s) => <SkillChip key={s} skill={s} />)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-cloud p-3"><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Time spent</div><div className="font-extrabold text-charcoal">{progress?.time_spent_min ? `${progress.time_spent_min} min` : '—'}</div></div>
        <div className="rounded-2xl bg-cloud p-3"><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">{state === 'completed' ? 'Completed' : 'Status'}</div><div className="font-extrabold text-charcoal">{progress?.completed_at ? fmtDate(progress.completed_at) : state === 'current' ? 'In progress' : 'Locked'}</div></div>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {state === 'locked' ? (
          <Button variant="secondary" disabled><Lock size={16} /> Complete checkpoint {lesson.position - 1} first</Button>
        ) : (
          <Button to={lessonLink}>{state === 'completed' ? <><CheckCircle2 size={16} /> Review lesson</> : <><PlayCircle size={16} /> Open lesson</>}</Button>
        )}
        {(hasWeak || state === 'current') && state !== 'locked' && (
          <Button variant="soft" onClick={() => onBranch(node)}><GitBranch size={16} /> {hasWeak ? `Branch out: AI extra practice (${weakTopics.length} weak topic${weakTopics.length > 1 ? 's' : ''})` : 'Branch out: warm-up practice'}</Button>
        )}
      </div>
      <div className="text-[11px] text-charcoal-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: course.color }} /> {course.title}</div>
    </Card>
  )
}
