import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Quote } from 'lucide-react'
import { Card, Button, Textarea, Pill, ProgressBar } from '../ui'
import { ask, askJSON, aiEnabled } from '../../lib/ai'
import { useData } from '../../lib/data'
import { courseById, courseLessons } from '../../lib/selectors'
import { EXPLAIN_BANK, genericExplain } from '../../data/lab'
import { GameShell, Bubble, Typing, ResultCard, Steps, think, quoteFrom, bumpCounter, readCounters } from './shared'
import { cx, clamp } from '../../lib/utils'

const LEVELS = { Surface: { pts: 30, tone: 'danger', text: 'You can state the rule. Next: explain the reason behind it and test it on a new case.' }, Working: { pts: 50, tone: 'mango', text: 'You can explain and adapt it. Next: argue it from first principles, with numbers.' }, Deep: { pts: 80, tone: 'success', text: 'You explained the why, handled a change, and transferred it to a new scenario. That is understanding.' } }
const STAGES = ['Explain', 'Why?', 'What if…', 'New scenario']

function assessLocally(answers, bank) {
  const kws = bank.keywords.map((k) => k.toLowerCase())
  const per = answers.map((a) => {
    const lower = a.toLowerCase()
    const words = a.trim().split(/\s+/).filter(Boolean).length
    const hits = kws.filter((k) => lower.includes(k)).length
    const reason = /\b(because|since|so that|which means|therefore)\b/.test(lower)
    return { words, hits, reason }
  })
  const avgWords = per.reduce((s, p) => s + p.words, 0) / per.length
  const avgHits = per.reduce((s, p) => s + p.hits, 0) / per.length
  const reasons = per.filter((p) => p.reason).length
  let level = 'Surface'
  if (avgWords >= 22 && avgHits >= 2.5 && reasons >= 2) level = 'Deep'
  else if (avgWords >= 12 && avgHits >= 1) level = 'Working'
  const evidence = answers.map((a, i) => ({ stage: STAGES[i], quote: quoteFrom(a, 90), ok: per[i].hits >= 2 && per[i].words >= 12, note: per[i].hits >= 2 ? `uses ${per[i].hits} key ideas${per[i].reason ? ' and gives a reason' : ''}` : per[i].words < 12 ? 'too short to show reasoning' : 'restates without the key ideas' }))
  const coverage = clamp(Math.round((avgHits / 3) * 100), 10, 100)
  return { level, evidence, coverage }
}

export default function ExplainBack({ profile, preselect }) {
  const { db, awardPoints, awardBadge } = useData()
  const [lessonId, setLessonId] = useState(preselect && db.lessons.some((l) => l.id === preselect) ? preselect : 'math-12-l4')
  const [stage, setStage] = useState(-1) // -1 = not started; 0..3 answering; 4 = done
  const [turns, setTurns] = useState([])
  const [answers, setAnswers] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const feedRef = useRef(null)
  const lesson = db.lessons.find((l) => l.id === lessonId)
  const course = courseById(db, lesson.course_id)
  const bank = EXPLAIN_BANK[lessonId] || genericExplain(lesson)
  const deepCount = readCounters()['explain-deep'] || 0
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'explainer')
  const badge = { ...db.badges.find((b) => b.id === 'explainer'), earned }

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, busy])

  const start = async () => {
    setTurns([]); setAnswers([]); setResult(null); setDraft('')
    setBusy(true); await think(500)
    setTurns([{ who: 'ai', label: STAGES[0], text: bank.question }])
    setStage(0); setBusy(false)
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || busy) return
    const nextAnswers = [...answers, text]
    setAnswers(nextAnswers); setDraft('')
    setTurns((t) => [...t, { who: 'you', text, label: STAGES[stage] }])
    setBusy(true)
    await think(800)
    if (stage < 3) {
      const fb = bank.followups[stage]
      const sys = `You are BOLT, probing a Grade 12 student's understanding of "${lesson.title}" (${course.title}). Stage ${stage + 1}: ${['ask WHY their explanation works', 'ask WHAT IF a number or condition changed', 'give a NEW SCENARIO to apply the idea'][stage]}. One question, max 2 sentences, reference something they wrote.`
      const q = await ask({ system: sys, messages: [{ role: 'user', content: `Question asked: ${turns[turns.length - 1]?.text}\nStudent answered: ${text}` }], fallback: fb, maxTokens: 160 })
      setTurns((t) => [...t, { who: 'ai', label: STAGES[stage + 1], text: q }])
      setStage(stage + 1)
      setBusy(false)
      return
    }
    // assessment
    const local = assessLocally(nextAnswers, bank)
    let final = local
    if (aiEnabled) {
      const res = await askJSON({ system: `Assess a student's understanding of "${lesson.title}" from four answers (explain / why / what-if / new scenario). Levels: Surface, Working, Deep. Return {"level":"Deep|Working|Surface","coverage":0-100,"evidence":[{"stage":"...","quote":"short quote from the student","ok":true,"note":"why this shows (or fails to show) understanding"}]}. Model points: ${bank.modelPoints.join('; ')}`, messages: [{ role: 'user', content: nextAnswers.map((a, i) => `${STAGES[i]}: ${a}`).join('\n') }], fallback: null })
      if (res?.level && LEVELS[res.level]) final = { level: res.level, coverage: clamp(Number(res.coverage) || local.coverage, 0, 100), evidence: Array.isArray(res.evidence) && res.evidence.length ? res.evidence : local.evidence }
    }
    const pts = LEVELS[final.level].pts
    let badgeNew = false
    try {
      await awardPoints(profile.id, course.id, pts, `Explain Back · ${final.level.toLowerCase()} understanding · ${lesson.title}`)
      if (final.level === 'Deep') {
        const n = bumpCounter('explain-deep')
        const b = await awardBadge(profile.id, 'explainer', `Explain Back: deep understanding on “${lesson.title}” (${n} deep result${n > 1 ? 's' : ''}).`)
        badgeNew = !!b
      }
    } catch (err) { console.warn('[BOLT] explain award skipped', err) }
    setResult({ ...final, pts, badgeNew })
    setStage(4); setBusy(false)
  }

  const reset = () => { setStage(-1); setTurns([]); setAnswers([]); setResult(null); setDraft('') }

  return (
    <GameShell ai title="Explain Back" eyebrow="teach it to prove it" icon={MessageCircle} badge={badge} course={course} progress={`${deepCount} deep`}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card padded={false} className="flex flex-col min-h-[540px]">
          {stage === -1 ? (
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">Pick a topic</div>
              <div className="grid md:grid-cols-3 gap-3 mb-5">
                {db.courses.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-charcoal-100 p-3">
                    <div className="text-xs font-bold mb-2 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.subject}</div>
                    <div className="space-y-1">
                      {courseLessons(db, c.id).map((l) => (
                        <button key={l.id} onClick={() => setLessonId(l.id)} className={cx('w-full text-left text-xs rounded-lg px-2 py-1.5 transition-colors', lessonId === l.id ? 'bg-charcoal text-white font-semibold' : 'hover:bg-cloud text-charcoal-500')}>{l.position}. {l.title}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-cloud p-4 mt-auto flex flex-wrap items-center justify-between gap-3">
                <div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Selected</div><div className="font-bold text-charcoal">{lesson.title}</div></div>
                <Button onClick={start} loading={busy}><MessageCircle size={16} /> Start explaining</Button>
              </div>
            </div>
          ) : (
            <>
              <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[520px]">
                {turns.map((t, i) => <Bubble key={i} who={t.who} name={t.who === 'ai' ? `BOLT · ${t.label}` : profile.full_name.split(' ')[0]}>{t.text}</Bubble>)}
                {busy && <Typing name={stage === 3 && answers.length === 4 ? 'Assessing' : 'BOLT'} />}
                {result && (
                  <div className="pt-2">
                    <ResultCard eyebrow="understanding level" title={result.level} points={result.pts} badgeEarned={result.badgeNew ? 'Explainer' : null} tone={result.level === 'Deep' ? 'mango' : 'light'} onReplay={reset} replayLabel="Explain another topic">
                      {LEVELS[result.level].text}
                    </ResultCard>
                  </div>
                )}
              </div>
              {stage >= 0 && stage < 4 && (
                <div className="border-t border-charcoal-100 p-4">
                  <div className="flex items-center justify-between mb-2 text-xs text-charcoal-400"><span>{STAGES[stage]} · stage {stage + 1} of 4</span><Steps total={4} current={stage} /></div>
                  <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy} placeholder="Explain it the way you would to a classmate — reasons, not just rules." onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }} />
                  <div className="flex items-center justify-between mt-2"><span className="text-xs text-charcoal-400">{draft.trim().split(/\s+/).filter(Boolean).length} words</span><Button onClick={send} disabled={busy || draft.trim().length < 10}><Send size={16} /> {stage === 3 ? 'Submit for assessment' : 'Answer'}</Button></div>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="font-hand text-mango text-xl leading-none mb-1">the ladder</div>
            <h3 className="font-extrabold text-charcoal mb-3">Three levels of understanding</h3>
            {Object.entries(LEVELS).map(([k, v]) => (
              <div key={k} className={cx('rounded-xl p-3 mb-2 border', result?.level === k ? 'border-mango bg-mango-50' : 'border-charcoal-100')}>
                <div className="flex items-center justify-between"><span className="font-bold text-charcoal text-sm">{k}</span><Pill tone={v.tone}>+{v.pts} pts</Pill></div>
                <div className="text-xs text-charcoal-400 mt-1">{k === 'Surface' ? 'States the rule.' : k === 'Working' ? 'Explains why and adapts to a change.' : 'Transfers to a new scenario with reasons.'}</div>
              </div>
            ))}
          </Card>
          {result && (
            <Card>
              <div className="flex items-center gap-2 mb-2"><Quote size={16} className="text-mango" /><h3 className="font-extrabold text-charcoal">Evidence from your answers</h3></div>
              <ProgressBar label="Key ideas covered" value={result.coverage} className="mb-3" />
              <ul className="space-y-2">
                {result.evidence.map((e, i) => (
                  <li key={i} className="text-xs">
                    <div className="flex items-center gap-2"><span className={cx('w-2 h-2 rounded-full shrink-0', e.ok ? 'bg-success' : 'bg-danger')} /><span className="font-bold text-charcoal">{e.stage}</span><span className="text-charcoal-400">· {e.note}</span></div>
                    <div className="ml-4 mt-0.5 text-charcoal-500 italic">“{e.quote}”</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </GameShell>
  )
}
