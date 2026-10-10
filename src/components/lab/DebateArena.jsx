import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Send, ThumbsUp, ThumbsDown, Scale, Sparkles } from 'lucide-react'
import { Card, Button, Textarea, Pill, ProgressBar } from '../ui'
import { ask, askJSON, aiEnabled } from '../../lib/ai'
import { useData } from '../../lib/data'
import { courseById } from '../../lib/selectors'
import { MOTIONS } from '../../data/lab'
import { GameShell, Bubble, Typing, ResultCard, Steps, think } from './shared'
import { cx, clamp } from '../../lib/utils'

const ROUNDS = 4
const CRITERIA = [['claim', 'Clear claim'], ['evidence', 'Evidence'], ['rebuttal', 'Rebuttal']]

/* ───── local reasoning score (used when AI is off, and as a sanity floor when on) ───── */
export function scoreLocally(text, opponentText = '') {
  const t = String(text || '').trim()
  const words = t.split(/\s+/).filter(Boolean)
  const n = words.length
  const lower = t.toLowerCase()
  const has = (re) => re.test(lower)
  // claim: length + stance words
  let claim = clamp(Math.round(n / 8), 0, 5)
  if (has(/\b(should|must|need|ought|is wrong|is right|i argue|my point|the real issue)\b/)) claim += 2
  if (has(/\b(because|since|therefore|so that|which means)\b/)) claim += 2
  if (/[.!?]/.test(t) && n >= 25) claim += 1
  // evidence: numbers, examples, sources
  let evidence = 0
  if (/\d/.test(t)) evidence += 3
  if (has(/\b(for example|for instance|e\.g\.|such as|like when|in my class|at cedar|in beirut|last year)\b/)) evidence += 3
  if (has(/\b(study|studies|research|data|survey|report|according to|evidence|shows that|statistic)\b/)) evidence += 3
  if (n >= 40) evidence += 1
  // rebuttal: references opponent vocabulary + concession markers
  let rebuttal = 0
  if (has(/\b(you (say|said|argue|claim|assume)|your (point|argument|claim)|opponent)\b/)) rebuttal += 3
  if (has(/\b(but|however|even if|although|yet|while it is true|admittedly|granted)\b/)) rebuttal += 2
  const opp = new Set(String(opponentText).toLowerCase().split(/\W+/).filter((w) => w.length > 5))
  const overlap = words.filter((w) => opp.has(w.toLowerCase().replace(/\W/g, ''))).length
  rebuttal += clamp(overlap, 0, 3)
  if (has(/\b(that assumes|this ignores|the flaw|does not follow|not the same as)\b/)) rebuttal += 2
  const s = { claim: clamp(claim, 0, 10), evidence: clamp(evidence, 0, 10), rebuttal: clamp(rebuttal, 0, 10) }
  const total = Math.round(((s.claim + s.evidence + s.rebuttal) / 3) * 10) / 10
  const note = total >= 8 ? 'Sharp. Claim, proof and counter all present.' : s.evidence < 4 ? 'Add a number, an example or a source — assertion is not evidence.' : s.rebuttal < 4 ? 'Address what the opponent just said before adding new points.' : s.claim < 5 ? 'Lead with one clear sentence that states your position.' : 'Solid. Tighten the link between your example and your claim.'
  return { ...s, total, note }
}

function aiScoreFor(round, studentTotal) {
  // adaptive opponent: starts moderate, escalates, stays near the student so the match is winnable but not free
  return Math.round(clamp(5.6 + round * 0.4 + (studentTotal - 6.5) * 0.45, 4.5, 9.2) * 10) / 10
}

export default function DebateArena({ profile }) {
  const { db, awardPoints, awardBadge } = useData()
  const [motion_, setMotion] = useState(null)
  const [side, setSide] = useState(null)
  const [turns, setTurns] = useState([]) // { who, text, score? }
  const [round, setRound] = useState(0) // completed student rounds
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [scores, setScores] = useState([]) // [{ student, ai, detail }]
  const [verdict, setVerdict] = useState(null)
  const feedRef = useRef(null)
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'debate-victor')
  const badge = { ...db.badges.find((b) => b.id === 'debate-victor'), earned }
  const course = motion_ ? courseById(db, motion_.course) : null
  const aiSide = side === 'for' ? 'against' : 'for'

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, busy])

  const start = async () => {
    setTurns([]); setRound(0); setScores([]); setVerdict(null); setDraft('')
    setBusy(true)
    await think(700)
    const text = await ask({ system: `You are the opponent in a Grade 12 debate. Motion: "${motion_.text}". You argue ${aiSide.toUpperCase()} the motion. Give a 2-sentence opening statement. Be sharp, fair, school-appropriate.`, messages: [{ role: 'user', content: 'Give your opening statement.' }], fallback: '⚠️ BOLT couldn’t reach the AI for this turn. Check the connection and start a new debate to try again.', maxTokens: 200 })
    setTurns([{ who: 'ai', text, label: 'Opening' }])
    setBusy(false)
  }

  const submit = async () => {
    const text = draft.trim()
    if (!text || busy) return
    const lastAi = [...turns].reverse().find((t) => t.who === 'ai')?.text || ''
    setBusy(true)
    setDraft('')
    const local = scoreLocally(text, lastAi)
    // score
    let detail = local
    if (aiEnabled) {
      const res = await askJSON({ system: 'Score a debate argument 0–10 on three criteria: claim (clear position), evidence (examples, numbers, sources), rebuttal (addresses the opponent). Return {"claim":n,"evidence":n,"rebuttal":n,"note":"one sentence of coaching"}.', messages: [{ role: 'user', content: `Motion: ${motion_.text}. Student argues ${side}. Opponent just said: "${lastAi}". Student argument: "${text}"` }], fallback: null })
      if (res && typeof res.claim === 'number') detail = { claim: clamp(res.claim, 0, 10), evidence: clamp(res.evidence, 0, 10), rebuttal: clamp(res.rebuttal, 0, 10), total: Math.round(((res.claim + res.evidence + res.rebuttal) / 3) * 10) / 10, note: res.note || local.note }
    }
    const r = round + 1
    const aiScore = aiScoreFor(r, detail.total)
    setTurns((t) => [...t, { who: 'you', text, score: detail, label: `Round ${r}` }])
    setScores((s) => [...s, { student: detail.total, ai: aiScore, detail }])
    await think(900)
    // opponent reply (adaptive to the round and the student's own words)
    const history = [...turns, { who: 'you', text }].map((t) => `${t.who === 'ai' ? 'Opponent' : 'Student'}: ${t.text}`).join('\n')
    const fallback = '⚠️ BOLT couldn’t reach the AI for this turn. Check the connection and start a new debate to try again.'
    const reply = r < ROUNDS
      ? await ask({ system: `You are the opponent in a 4-round Grade 12 debate. Motion: "${motion_.text}". You argue ${aiSide.toUpperCase()}. Round ${r} of ${ROUNDS}. Adapt to the student's level: if their argument scored ${detail.total}/10, respond at a slightly higher level. Quote one phrase from their last message, rebut it, add one new point. 3–4 sentences max.\nHistory:\n${history}`, messages: [{ role: 'user', content: 'Reply to the student’s latest argument.' }], fallback, maxTokens: 300 })
      : await ask({ system: `You are the opponent in a debate on "${motion_.text}" arguing ${aiSide}. The 4 rounds are over. Give a 2-sentence closing that acknowledges the student's strongest point and restates your case.\nHistory:\n${history}`, messages: [{ role: 'user', content: 'Closing statement.' }], fallback, maxTokens: 200 })
    setTurns((t) => [...t, { who: 'ai', text: reply, label: r < ROUNDS ? `Rebuttal ${r}` : 'Closing' }])
    setRound(r)
    setBusy(false)
    if (r === ROUNDS) finish([...scores, { student: detail.total, ai: aiScore }])
  }

  const finish = async (all) => {
    const me = all.reduce((a, s) => a + s.student, 0)
    const ai = all.reduce((a, s) => a + s.ai, 0)
    const won = me > ai
    const pts = won ? 80 : 40
    let badgeNew = false
    try {
      await awardPoints(profile.id, motion_.course, pts, won ? `Debate Arena win · “${motion_.text}”` : `Debate Arena · “${motion_.text}”`)
      if (won) { const b = await awardBadge(profile.id, 'debate-victor', `Debate: “${motion_.text}” — won ${all.filter((s) => s.student > s.ai).length} of 4 rounds (${me.toFixed(1)} vs ${ai.toFixed(1)}).`); badgeNew = !!b }
    } catch (err) { console.warn('[BOLT] debate award skipped', err) }
    setVerdict({ me: Math.round(me * 10) / 10, ai: Math.round(ai * 10) / 10, won, pts, badgeNew })
  }

  const totals = scores.reduce((a, s) => ({ me: a.me + s.student, ai: a.ai + s.ai }), { me: 0, ai: 0 })

  /* ───── setup ───── */
  if (!motion_ || !side || turns.length === 0) {
    return (
      <GameShell ai title="Debate Arena" eyebrow="argue it out" icon={Swords} badge={badge}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">1 · Choose a motion</div>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {MOTIONS.map((m) => {
                const c = courseById(db, m.course)
                const on = motion_?.id === m.id
                return (
                  <button key={m.id} onClick={() => setMotion(m)} className={cx('text-left rounded-2xl border p-4 transition-all', on ? 'border-mango bg-mango-50 ring-4 ring-mango/20' : 'border-charcoal-100 bg-white hover:border-charcoal-300')}>
                    <div className="flex items-center justify-between mb-2"><Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: c.color }} />{c.subject}</Pill>{on && <Pill tone="mango">Selected</Pill>}</div>
                    <div className="font-bold text-charcoal leading-snug">“{m.text}”</div>
                  </button>
                )
              })}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">2 · Pick your side</div>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button onClick={() => setSide('for')} className={cx('rounded-2xl border p-4 flex items-center gap-3 font-bold transition-all', side === 'for' ? 'border-success bg-success-soft text-success ring-4 ring-success/20' : 'border-charcoal-100 bg-white hover:border-charcoal-300 text-charcoal')}><ThumbsUp size={20} /> For the motion</button>
              <button onClick={() => setSide('against')} className={cx('rounded-2xl border p-4 flex items-center gap-3 font-bold transition-all', side === 'against' ? 'border-danger bg-danger-soft text-danger ring-4 ring-danger/20' : 'border-charcoal-100 bg-white hover:border-charcoal-300 text-charcoal')}><ThumbsDown size={20} /> Against the motion</button>
            </div>
            <Button className="mt-6" size="lg" disabled={!motion_ || !side} loading={busy} onClick={start}><Swords size={18} /> Enter the arena</Button>
          </div>
          <Card className="h-fit">
            <div className="font-hand text-mango text-xl leading-none mb-1">how it works</div>
            <h3 className="font-extrabold text-charcoal mb-3">4 rounds vs an adaptive opponent</h3>
            <ol className="text-sm text-charcoal-500 space-y-2 list-decimal pl-4">
              <li>The AI opens. You write an argument (3–6 sentences works best).</li>
              <li>Each round is scored 0–10 on <strong>claim</strong>, <strong>evidence</strong> and <strong>rebuttal</strong>.</li>
              <li>The opponent reads your text and adapts — it gets harder when you get better.</li>
              <li>Beat its total after 4 rounds to earn the <strong>Debate Victor</strong> stamp (+80 pts).</li>
            </ol>
            <div className="mt-4 rounded-xl bg-cloud p-3 text-xs text-charcoal-500"><Sparkles size={12} className="inline text-mango mr-1" />Tip: quote the opponent (“you said…”), then answer it with a number or an example.</div>
          </Card>
        </div>
      </GameShell>
    )
  }

  /* ───── arena ───── */
  return (
    <GameShell ai title="Debate Arena" eyebrow="argue it out" icon={Swords} badge={badge} course={course}>
      <Card padded={false} className="mb-5 overflow-hidden">
        <div className="bg-charcoal text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 bolt-pattern-dark">
          <div><div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Motion</div><div className="font-extrabold">“{motion_.text}”</div></div>
          <div className="flex items-center gap-3 text-sm"><Pill tone={side === 'for' ? 'success' : 'danger'}>You · {side}</Pill><span className="text-white/40">vs</span><Pill tone="mango">BOLT · {aiSide}</Pill></div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card padded={false} className="flex flex-col min-h-[560px]">
          <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[520px]">
            <AnimatePresence initial={false}>
              {turns.map((t, i) => (
                <div key={i}>
                  <Bubble who={t.who === 'ai' ? 'ai' : 'you'} name={t.who === 'ai' ? `BOLT · ${t.label}` : `${profile.full_name.split(' ')[0]} · ${t.label}`}>
                    {t.text}
                    {t.score && (
                      <div className="mt-2 pt-2 border-t border-white/15 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/80">
                        {CRITERIA.map(([k, l]) => <span key={k}>{l} <strong className="text-mango">{t.score[k]}</strong></span>)}
                        <span className="ml-auto font-bold">Round score {t.score.total}/10</span>
                        <div className="w-full text-white/60">{t.score.note}</div>
                      </div>
                    )}
                  </Bubble>
                </div>
              ))}
            </AnimatePresence>
            {busy && <Typing name="BOLT is thinking" />}
          </div>
          {!verdict && (
            <div className="border-t border-charcoal-100 p-4">
              <div className="flex items-center justify-between mb-2 text-xs text-charcoal-400"><span>Round {Math.min(round + 1, ROUNDS)} of {ROUNDS} · your argument</span><Steps total={ROUNDS} current={round} /></div>
              <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy} placeholder={round === 0 ? 'State your claim, give one piece of evidence, and answer the opening…' : 'Quote what the opponent said, then take it apart…'} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-charcoal-400">{draft.trim().split(/\s+/).filter(Boolean).length} words · Ctrl/⌘ + Enter to send</span>
                <Button onClick={submit} disabled={busy || draft.trim().length < 20}><Send size={16} /> Send argument</Button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3"><Scale size={16} className="text-mango" /><h3 className="font-extrabold text-charcoal">Live scoreboard</h3></div>
            <div className="grid grid-cols-2 gap-3 text-center mb-4">
              <div className={cx('rounded-2xl p-3', totals.me >= totals.ai ? 'bg-mango-50' : 'bg-cloud')}><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">You</div><div className="text-3xl font-extrabold text-charcoal">{totals.me.toFixed(1)}</div></div>
              <div className={cx('rounded-2xl p-3', totals.ai > totals.me ? 'bg-mango-50' : 'bg-cloud')}><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">BOLT</div><div className="text-3xl font-extrabold text-charcoal">{totals.ai.toFixed(1)}</div></div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: ROUNDS }).map((_, i) => {
                const s = scores[i]
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-charcoal-400">Round {i + 1}</span>
                    <div className="flex-1 h-2 rounded-full bg-charcoal-100 overflow-hidden"><div className="h-full bg-mango rounded-full transition-all" style={{ width: `${s ? s.student * 10 : 0}%` }} /></div>
                    <span className={cx('w-8 font-bold text-right', s && s.student > s.ai ? 'text-success' : 'text-charcoal')}>{s ? s.student : '–'}</span>
                    <span className="text-charcoal-300">/</span>
                    <span className="w-8 font-bold text-charcoal-400">{s ? s.ai : '–'}</span>
                  </div>
                )
              })}
            </div>
            {scores.length > 0 && (
              <div className="mt-4 pt-3 border-t border-charcoal-100">
                <div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold mb-2">Last round breakdown</div>
                {CRITERIA.map(([k, l]) => <ProgressBar key={k} label={l} value={scores[scores.length - 1].detail[k] * 10} tone={scores[scores.length - 1].detail[k] >= 7 ? 'success' : scores[scores.length - 1].detail[k] >= 4 ? 'mango' : 'danger'} className="mb-2" height="h-1.5" />)}
              </div>
            )}
          </Card>
          {verdict && (
            <ResultCard eyebrow={verdict.won ? 'victory' : 'close match'} title={verdict.won ? 'You out-argued BOLT' : 'BOLT edges it this time'} points={verdict.pts} badgeEarned={verdict.badgeNew ? 'Debate Victor' : null} tone={verdict.won ? 'mango' : 'light'} onReplay={() => { setMotion(null); setSide(null); setTurns([]); setVerdict(null); setScores([]); setRound(0) }} replayLabel="New debate">
              Final: you {verdict.me} · BOLT {verdict.ai}. {verdict.won ? 'Your evidence and rebuttals carried it.' : 'Quote the opponent more directly and bring one number per round.'}
            </ResultCard>
          )}
        </div>
      </div>
    </GameShell>
  )
}
