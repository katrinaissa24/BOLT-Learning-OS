import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flag, Lightbulb, CheckCircle2, XCircle, Mic, ArrowRight, SlidersHorizontal, PenLine } from 'lucide-react'
import { Button, Pill } from '../ui'
import { cx } from '../../lib/utils'

const SCORE_BY_ATTEMPT = [100, 75, 50]
const MAX_ATTEMPTS = 3

/**
 * The checkpoint question for a lesson. Scores by attempts: 100 / 75 / 50, then reveals (30).
 * - numeric: typed number vs answer ± tolerance
 * - slider:  the interactive's last reported value is checked with question.check(value)
 * - score:   the interactive scored itself (result.score)
 * - essay:   auto-completes when the essay editor reports a submission
 */
export default function CheckpointQuestion({ lesson, question, result, progress, onComplete }) {
  const [value, setValue] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null) // { ok, score, text }
  const [done, setDone] = useState(false)

  useEffect(() => { setValue(''); setAttempts(0); setFeedback(null); setDone(false) }, [lesson.id])

  // essay: complete automatically on submission
  useEffect(() => {
    if (question.type === 'essay' && result?.submitted && !done) {
      setDone(true); setFeedback({ ok: true, score: result.score, text: 'Essay submitted. Your process log is attached to the submission.' })
      onComplete(result.score)
    }
  }, [question.type, result, done, onComplete])

  const finish = (ok) => {
    const n = attempts + 1
    setAttempts(n)
    if (ok) {
      const score = SCORE_BY_ATTEMPT[Math.min(n - 1, SCORE_BY_ATTEMPT.length - 1)]
      setFeedback({ ok: true, score, text: question.explanation || 'Correct.' }); setDone(true); onComplete(score)
    } else if (n >= MAX_ATTEMPTS) {
      setFeedback({ ok: false, score: 30, text: `Not quite. ${question.explanation || ''}`, revealed: true }); setDone(true); onComplete(30)
    } else {
      setFeedback({ ok: false, text: n === 1 ? (question.hint || 'Not yet — try again.') : 'Still off. One more attempt — re-read the transcript line nearest your answer.' })
    }
  }

  const submitNumeric = (e) => {
    e?.preventDefault()
    const v = parseFloat(String(value).replace(',', '.'))
    if (Number.isNaN(v)) return setFeedback({ ok: false, text: 'Type a number first.' })
    finish(Math.abs(v - question.answer) <= question.tolerance)
  }
  const submitSlider = () => finish(!!question.check?.(result))
  const submitScore = () => { if (result?.score == null) return; const s = Math.max(0, Math.min(100, Math.round(result.score))); setFeedback({ ok: s >= 60, score: s, text: s >= 60 ? 'Checkpoint cleared with your activity score.' : 'Below 60 — a practice branch opens below so you can bring it up.' }); setDone(true); onComplete(s) }

  const Icon = { numeric: Flag, slider: SlidersHorizontal, score: CheckCircle2, essay: PenLine }[question.type] || Flag

  return (
    <div className="card p-6" id="checkpoint">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-mango text-white flex items-center justify-center shrink-0"><Icon size={20} /></div>
          <div>
            <div className="font-hand text-mango text-xl leading-none mb-1">checkpoint question</div>
            <h3 className="text-lg font-extrabold text-charcoal leading-snug">{question.prompt}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-charcoal-400">
              <span>Assesses <span className="font-semibold text-charcoal-500">{lesson.topics.find((t) => t.id === question.topic)?.name || lesson.topics[0].name}</span></span>
              {progress?.status === 'completed' && <Pill tone="success">Completed before · {progress.score}%</Pill>}
            </div>
          </div>
        </div>
        <Link to={`/student/lab/explain-back?lesson=${lesson.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-500 hover:border-mango hover:text-mango-700 transition-colors"><Mic size={13} /> Explain Back this lesson <ArrowRight size={12} /></Link>
      </div>

      {!done && question.type === 'numeric' && (
        <form onSubmit={submitNumeric} className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Your answer {question.unit && <span className="normal-case tracking-normal">({question.unit})</span>}</span>
            <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="e.g. 6" className="w-44 rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-lg font-bold text-charcoal placeholder:text-charcoal-300 placeholder:font-normal focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20 tabular-nums" />
          </label>
          <Button type="submit" size="lg" disabled={!value.trim()}>Submit answer</Button>
          <span className="text-xs text-charcoal-400">Attempt {attempts + 1} of {MAX_ATTEMPTS}</span>
        </form>
      )}
      {!done && question.type === 'slider' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={submitSlider} disabled={result == null}><SlidersHorizontal size={18} /> Submit my current setting</Button>
          <span className="text-xs text-charcoal-400">{result == null ? 'Move the sliders in the interactive first.' : `Attempt ${attempts + 1} of ${MAX_ATTEMPTS} · the simulation’s current state will be checked.`}</span>
        </div>
      )}
      {!done && question.type === 'score' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={submitScore} disabled={result?.score == null}><CheckCircle2 size={18} /> Submit activity score{result?.score != null && ` · ${Math.round(result.score)}/100`}</Button>
          <span className="text-xs text-charcoal-400">{result?.score == null ? 'Finish the activity above and press its check button first.' : 'You can keep improving the activity before you submit.'}</span>
        </div>
      )}
      {!done && question.type === 'essay' && (
        <div className="text-sm text-charcoal-400 flex items-center gap-2"><PenLine size={16} className="text-mango" /> {progress?.status === 'completed' ? 'This checkpoint was cleared with your submitted essay. Write a new version above to re-submit and re-score.' : 'Waiting for your submission in the editor above.'}</div>
      )}

      {feedback && (
        <div className={cx('mt-4 rounded-2xl border p-4 flex gap-3 text-sm fade-up', feedback.ok ? 'bg-success-soft border-success/30' : done ? 'bg-danger-soft border-danger/30' : 'bg-mango-50 border-mango-200')}>
          {feedback.ok ? <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" /> : done ? <XCircle size={20} className="text-danger shrink-0 mt-0.5" /> : <Lightbulb size={20} className="text-mango shrink-0 mt-0.5" />}
          <div>
            <div className="font-bold text-charcoal">{feedback.ok ? `Checkpoint cleared · ${feedback.score}%` : done ? `Revealed · ${feedback.score}%` : 'Hint'}</div>
            <div className="text-charcoal-500 mt-0.5">{feedback.text}</div>
            {feedback.revealed && question.answer != null && <div className="mt-1 text-charcoal font-semibold">Answer: {question.answer} {question.unit}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
