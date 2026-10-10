import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Trophy, GitBranch, Zap } from 'lucide-react'
import { Modal, Button, Input, Textarea, Pill, ProgressBar, Callout } from '../../components/ui'
import { generatePractice, checkAnswer } from '../../lib/practice'
import { aiEnabled } from '../../lib/ai'
import { useData } from '../../lib/data'
import { cx } from '../../lib/utils'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Extra-practice branch: generates tailored items for the weak topics of a checkpoint,
 * checks each answer, then updates topic scores, awards points (and the Comeback badge).
 */
export default function BranchModal({ open, onClose, node, course, studentId, studentName }) {
  const { awardPoints, upsertLessonProgress, awardBadge } = useData()
  const [phase, setPhase] = useState('generating') // generating | play | done
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null) // { correct }
  const [answers, setAnswers] = useState([])
  const [reward, setReward] = useState(null)

  const lesson = node?.lesson
  const topics = node?.weakTopics?.length ? node.weakTopics : (lesson?.topics || []).map((t) => ({ ...t, score: node?.progress?.topic_scores?.[t.id] ?? null }))

  useEffect(() => {
    if (!open || !lesson) return
    let cancelled = false
    setPhase('generating'); setItems([]); setIdx(0); setValue(''); setResult(null); setAnswers([]); setReward(null)
    ;(async () => {
      const [gen] = await Promise.all([
        generatePractice({ lesson, course, topics, studentName, count: 4 }),
        aiEnabled ? Promise.resolve() : wait(700),
      ])
      if (cancelled) return
      setItems(gen)
      setPhase('play')
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson?.id])

  const item = items[idx]

  const submit = () => {
    if (!item || result) return
    const correct = checkAnswer(item, value)
    setResult({ correct })
    setAnswers((a) => [...a, { item, value, correct }])
  }

  const next = async () => {
    if (idx + 1 < items.length) { setIdx(idx + 1); setValue(''); setResult(null); return }
    // finish
    const correctCount = answers.filter((a) => a.correct).length
    const ratio = correctCount / Math.max(1, answers.length)
    const old = node.progress?.topic_scores || {}
    const updated = { ...old }
    let comeback = false
    if (ratio >= 0.7) {
      const target = ratio === 1 ? 85 : 70
      topics.forEach((t) => {
        const prev = old[t.id]
        const nv = Math.max(prev ?? 0, target)
        updated[t.id] = nv
        if (prev != null && prev < 50 && nv >= 80) comeback = true
      })
    }
    const vals = Object.values(updated)
    const patch = { topic_scores: updated }
    if (node.progress?.status === 'completed' && vals.length) patch.score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    const topicName = topics[0]?.name || lesson.title
    try {
      await upsertLessonProgress(studentId, lesson.id, patch)
      await awardPoints(studentId, course.id, 40, `Extra practice branch · ${topicName}`)
      if (comeback) await awardBadge(studentId, 'comeback', `${topicName}: ${old[topics[0].id]}% → ${updated[topics[0].id]}% after the practice branch.`)
    } catch (err) { console.warn('[BOLT] branch save skipped', err) }
    setReward({ correctCount, total: answers.length, ratio, improved: ratio >= 0.7, comeback, topicName })
    setPhase('done')
  }

  return (
    <Modal open={open} onClose={onClose} title={<span className="flex items-center gap-2"><GitBranch size={18} className="text-mango" /> Extra practice branch</span>}>
      {lesson && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-charcoal-400">
          <span className="font-semibold text-charcoal">{lesson.title}</span>
          <span>·</span>
          {topics.slice(0, 3).map((t) => <Pill key={t.id} tone={t.score != null && t.score < 60 ? 'danger' : 'neutral'}>{t.name}{t.score != null ? ` · ${t.score}%` : ''}</Pill>)}
        </div>
      )}

      {phase === 'generating' && (
        <div className="py-14 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }} className="mx-auto w-14 h-14 rounded-2xl bg-mango-50 text-mango flex items-center justify-center mb-4"><Sparkles size={26} /></motion.div>
          <div className="font-extrabold text-charcoal">Generating practice tailored to {studentName.split(' ')[0]}…</div>
          <p className="text-sm text-charcoal-400 mt-1">Real-life scenarios around {topics.map((t) => t.name.toLowerCase()).slice(0, 2).join(' and ')}.</p>
        </div>
      )}

      {phase === 'play' && item && (
        <div>
          <div className="flex items-center justify-between text-xs text-charcoal-400 mb-2">
            <span>Question {idx + 1} of {items.length}</span>
            <span className="flex items-center gap-1">{'●'.repeat(item.difficulty || 1)}{'○'.repeat(3 - (item.difficulty || 1))} difficulty</span>
          </div>
          <ProgressBar value={(idx / items.length) * 100} height="h-1.5" className="mb-5" />
          <AnimatePresence mode="wait">
            <motion.div key={item.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl bg-cloud p-5 mb-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-mango mb-1">{item.context || item.topic}</div>
                <div className="text-base font-semibold text-charcoal leading-relaxed">{item.prompt}</div>
              </div>
              {item.type === 'choice' && (
                <div className="grid sm:grid-cols-2 gap-2 mb-4">
                  {(item.options || []).map((o) => {
                    const chosen = value === o
                    const isAns = result && String(o).trim() === String(item.answer).trim()
                    return (
                      <button key={o} disabled={!!result} onClick={() => setValue(o)} className={cx('text-left rounded-xl border px-4 py-3 text-sm font-semibold transition-all', result ? (isAns ? 'border-success bg-success-soft text-success' : chosen ? 'border-danger bg-danger-soft text-danger' : 'border-charcoal-100 text-charcoal-300') : chosen ? 'border-mango bg-mango-50 text-charcoal ring-4 ring-mango/20' : 'border-charcoal-200 hover:border-mango text-charcoal')}>{o}</button>
                    )
                  })}
                </div>
              )}
              {item.type === 'numeric' && <div className="mb-4"><Input type="text" inputMode="decimal" placeholder="Your numeric answer" value={value} onChange={(e) => setValue(e.target.value)} disabled={!!result} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>}
              {item.type === 'short' && <div className="mb-4"><Textarea rows={4} placeholder="Explain in your own words (at least a couple of sentences)…" value={value} onChange={(e) => setValue(e.target.value)} disabled={!!result} /></div>}

              {result && (
                <Callout tone={result.correct ? 'success' : 'danger'} icon={result.correct ? CheckCircle2 : XCircle} title={result.correct ? 'Correct' : item.type === 'short' ? 'A little more detail needed' : `Not quite — the answer is ${item.answer}`} className="mb-4">
                  {item.explanation}
                </Callout>
              )}
              <div className="flex justify-end gap-2">
                {!result ? <Button onClick={submit} disabled={!String(value).trim()}>Check answer</Button> : <Button onClick={next}>{idx + 1 < items.length ? <>Next <ArrowRight size={16} /></> : <>Finish branch <Trophy size={16} /></>}</Button>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {phase === 'done' && reward && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
          <div className={cx('mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4', reward.improved ? 'bg-mango text-white shadow-[0_12px_30px_-10px_rgba(255,153,0,0.8)]' : 'bg-charcoal-100 text-charcoal-400')}><Trophy size={36} /></div>
          <div className="font-hand text-mango text-2xl leading-none">{reward.improved ? 'branch cleared' : 'good effort'}</div>
          <h3 className="text-2xl font-extrabold tracking-tight text-charcoal mt-1">{reward.correctCount} of {reward.total} correct</h3>
          <p className="text-sm text-charcoal-400 mt-2 max-w-md mx-auto">
            {reward.improved ? `${reward.topicName} now reads ${reward.ratio === 1 ? 85 : 70}%+ on your journey map. The branch rejoins the main path.` : `Below 70% — the branch stays open. Re-watch the segment on ${reward.topicName.toLowerCase()} and try again; nothing is locked.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <Pill tone="mango" icon={Zap} className="normal-case tracking-normal text-xs">+40 points</Pill>
            {reward.comeback && <Pill tone="dark" icon={Trophy} className="normal-case tracking-normal text-xs">Comeback stamp earned</Pill>}
          </div>
          <Button className="mt-6" onClick={onClose}>Back to the journey</Button>
        </motion.div>
      )}
    </Modal>
  )
}
