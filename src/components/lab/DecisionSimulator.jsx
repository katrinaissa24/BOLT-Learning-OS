import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Info, Clock, ArrowRight, Play } from 'lucide-react'
import { Card, Button, Pill, Callout } from '../ui'
import { useData } from '../../lib/data'
import { courseById } from '../../lib/selectors'
import { SCENARIOS } from '../../data/lab'
import { GameShell, ResultCard, CoachChat, Steps, think } from './shared'
import { cx } from '../../lib/utils'

export default function DecisionSimulator({ profile }) {
  const { db, awardPoints, awardBadge } = useData()
  const [sc, setSc] = useState(null)
  const [step, setStep] = useState(0)
  const [log, setLog] = useState([]) // { choice, askedInfo }
  const [info, setInfo] = useState(false)
  const [minutes, setMinutes] = useState(0)
  const [picked, setPicked] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'decision-maker')
  const badge = { ...db.badges.find((b) => b.id === 'decision-maker'), earned }
  const course = sc ? courseById(db, sc.course) : null
  const current = sc?.steps[step]

  const askInfo = () => { if (info) return; setInfo(true); setMinutes((m) => m + current.info.cost) }
  const choose = (i) => { if (picked != null) return; setPicked(i) }
  const next = async () => {
    const entry = { choice: current.choices[picked], askedInfo: info }
    const nextLog = [...log, entry]
    setLog(nextLog); setPicked(null); setInfo(false)
    if (step + 1 < sc.steps.length) { setStep(step + 1); return }
    setBusy(true); await think(900)
    const raw = nextLog.reduce((a, e) => a + e.choice.score, 0)
    const max = sc.steps.length * 3
    const infoBonus = nextLog.filter((e) => e.askedInfo && e.choice.score === 3).length * 2
    const score = Math.min(100, Math.round((raw / max) * 100) + infoBonus - (minutes > 60 ? 5 : 0))
    const pts = Math.round(30 + (score / 100) * 50)
    let badgeNew = false
    try {
      await awardPoints(profile.id, sc.course, pts, `Decision Simulator · ${sc.title}`)
      if (score >= 80) { const b = await awardBadge(profile.id, 'decision-maker', `Decision Simulator “${sc.title}”: scored ${score} with ${minutes} min spent gathering information.`); badgeNew = !!b }
    } catch (err) { console.warn('[BOLT] decision award skipped', err) }
    setResult({ score, pts, badgeNew, raw, max, infoBonus })
    setBusy(false)
  }
  const reset = () => { setSc(null); setStep(0); setLog([]); setInfo(false); setMinutes(0); setPicked(null); setResult(null) }

  if (!sc) {
    return (
      <GameShell title="Decision Simulator" eyebrow="incomplete information" icon={GitBranch} badge={badge}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {SCENARIOS.map((s) => {
              const co = courseById(db, s.course)
              return (
                <button key={s.id} onClick={() => setSc(s)} className="text-left rounded-2xl border border-charcoal-100 bg-white p-4 hover:border-mango hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2"><Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: co.color }} />{co.subject}</Pill><Pill tone="neutral">{s.steps.length} decisions</Pill></div>
                  <div className="font-bold text-charcoal">{s.title}</div>
                  <div className="text-xs text-charcoal-400 mt-1 line-clamp-3">{s.setting}</div>
                </button>
              )
            })}
          </div>
          <Card className="h-fit">
            <div className="font-hand text-mango text-xl leading-none mb-1">the game</div>
            <h3 className="font-extrabold text-charcoal mb-2">Decide, then live with it</h3>
            <p className="text-sm text-charcoal-500">Four steps, three choices each, never enough information. You can always <strong>ask for more info</strong> — it costs time. The debrief scores your reasoning under uncertainty; 80+ earns <strong>Decision Maker</strong>.</p>
          </Card>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell title="Decision Simulator" eyebrow="incomplete information" icon={GitBranch} badge={badge} course={course}>
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-4">
          <div className="rounded-3xl bg-charcoal text-white p-5 bolt-pattern-dark"><div className="text-[10px] uppercase tracking-widest text-mango font-semibold">Scenario · {sc.title}</div><p className="text-sm mt-1 text-white/85">{sc.setting}</p></div>
          {!result ? (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                <Card>
                  <div className="flex items-center justify-between mb-3 text-xs text-charcoal-400"><span>Decision {step + 1} of {sc.steps.length}</span><Steps total={sc.steps.length} current={step} /></div>
                  <h3 className="font-extrabold text-charcoal text-lg leading-snug">{current.prompt}</h3>
                  <div className="mt-4 space-y-2">
                    {current.choices.map((c, i) => {
                      const on = picked === i
                      return (
                        <button key={i} onClick={() => choose(i)} disabled={picked != null} className={cx('w-full text-left rounded-xl border px-4 py-3 text-sm font-semibold transition-all', picked == null ? 'border-charcoal-200 hover:border-mango text-charcoal' : on ? (c.score === 3 ? 'border-success bg-success-soft' : c.score >= 1 ? 'border-mango bg-mango-50' : 'border-danger bg-danger-soft') : 'border-charcoal-100 text-charcoal-300')}>
                          {c.text}
                          {on && <div className="mt-1.5 text-xs font-medium text-charcoal-500">{c.feedback} <span className="font-bold">({c.score}/3)</span></div>}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button onClick={askInfo} disabled={info || picked != null} className={cx('inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-3 py-2 border border-dashed transition-all', info ? 'border-info bg-info-soft text-info' : 'border-charcoal-300 text-charcoal-500 hover:border-info hover:text-info disabled:opacity-50')}><Info size={15} /> {info ? 'Info received' : `Ask for more info (+${current.info.cost} min)`}</button>
                    <Button onClick={next} disabled={picked == null} loading={busy}>{step + 1 < sc.steps.length ? <>Next decision <ArrowRight size={16} /></> : <>Debrief <Play size={16} /></>}</Button>
                  </div>
                  {info && <Callout tone="info" icon={Info} className="mt-3">{current.info.text}</Callout>}
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
            <ResultCard eyebrow="debrief" title={`Reasoning score ${result.score}/100`} points={result.pts} badgeEarned={result.badgeNew ? 'Decision Maker' : null} tone={result.score >= 80 ? 'mango' : 'light'} onReplay={reset} replayLabel="Another scenario">
              {result.raw}/{result.max} on choices{result.infoBonus ? `, +${result.infoBonus} for deciding after gathering facts` : ''}{minutes > 60 ? ', −5 for spending over an hour on information' : ''}. {result.score >= 80 ? 'You shrank uncertainty cheaply before acting, then prioritised the group with the least flexibility.' : 'Best moves: get cheap information first, protect the group that cannot move, and avoid big irreversible actions on vague warnings.'}
            </ResultCard>
          )}
          {result && (
            <CoachChat key={sc.id} name={profile.full_name.split(' ')[0]} context={`Game: Decision Simulator — scenario "${sc.title}": ${sc.setting}\nThe student's decisions (score out of 3 each):\n${log.map((e, i) => `${i + 1}. ${sc.steps[i].prompt} → chose "${e.choice.text}" (${e.choice.score}/3: ${e.choice.feedback})${e.askedInfo ? ' after asking for more info' : ''}`).join('\n')}\nReasoning score: ${result.score}/100, ${minutes} min spent on information.`} />
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between"><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Time spent on info</div><Clock size={14} className="text-charcoal-300" /></div>
            <div className="text-3xl font-extrabold text-charcoal mt-1">{minutes} <span className="text-sm font-semibold text-charcoal-400">min</span></div>
            <div className="text-xs text-charcoal-400 mt-1">Information is worth it when the decision is reversible and the clock allows.</div>
          </Card>
          <Card>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">Your path</div>
            {log.length === 0 ? <div className="text-sm text-charcoal-400">No decisions yet.</div> : (
              <ol className="space-y-2">
                {log.map((e, i) => <li key={i} className="flex gap-2 text-xs"><span className={cx('w-5 h-5 rounded-full flex items-center justify-center font-bold text-white shrink-0', e.choice.score === 3 ? 'bg-success' : e.choice.score >= 1 ? 'bg-mango' : 'bg-danger')}>{e.choice.score}</span><span className="text-charcoal-500">{e.choice.text}{e.askedInfo && <span className="text-info font-semibold"> · asked for info</span>}</span></li>)}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </GameShell>
  )
}
