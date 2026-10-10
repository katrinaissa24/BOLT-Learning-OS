import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { Card, Button, Pill, Callout } from '../ui'
import { useData } from '../../lib/data'
import { courseById } from '../../lib/selectors'
import { FLAW_CASES } from '../../data/lab'
import { GameShell, Bubble, ResultCard, CoachChat, think, bumpCounter, readCounters } from './shared'
import { cx } from '../../lib/utils'

const WINS_NEEDED = 5

export default function SpotTheFlaw({ profile }) {
  const { db, awardPoints, awardBadge } = useData()
  const [kase, setKase] = useState(null)
  const [picked, setPicked] = useState([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'critical-eye')
  const wins = Math.max(readCounters()['flaw-wins'] || 0, earned ? WINS_NEEDED : 0)
  const badge = { ...db.badges.find((b) => b.id === 'critical-eye'), earned }
  const course = kase ? courseById(db, kase.course) : null

  const reveal = async () => {
    setBusy(true); await think(700)
    const flawed = kase.lines.map((l, i) => (l.flawed ? i : -1)).filter((i) => i >= 0)
    const hits = flawed.filter((i) => picked.includes(i)).length
    const falses = picked.filter((i) => !flawed.includes(i)).length
    const win = hits === flawed.length && falses <= 1
    const pts = win ? 40 : 20
    let badgeNew = false
    let count = wins
    try {
      await awardPoints(profile.id, kase.course, pts, `Spot the Flaw · ${kase.title}`)
      if (win) { const base = readCounters()['flaw-wins'] || 0; if (base < wins) bumpCounter('flaw-wins', wins - base); count = bumpCounter('flaw-wins'); if (count >= WINS_NEEDED) { const b = await awardBadge(profile.id, 'critical-eye', `Spot the Flaw: ${count} wins.`); badgeNew = !!b } }
    } catch (err) { console.warn('[BOLT] flaw award skipped', err) }
    setResult({ hits, total: flawed.length, falses, win, pts, badgeNew, count })
    setBusy(false)
  }

  if (!kase) {
    return (
      <GameShell title="Spot the Flaw" eyebrow="confident ≠ correct" icon={Search} badge={badge} progress={`${Math.min(wins, WINS_NEEDED)}/${WINS_NEEDED} wins`}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {FLAW_CASES.map((c) => {
              const co = courseById(db, c.course)
              return (
                <button key={c.id} onClick={() => { setKase(c); setPicked([]); setResult(null) }} className="text-left rounded-2xl border border-charcoal-100 bg-white p-4 hover:border-mango hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2"><Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: co.color }} />{co.subject}</Pill><Pill tone="neutral">{c.kind}</Pill></div>
                  <div className="font-bold text-charcoal">{c.title}</div>
                  <div className="text-xs text-charcoal-400 mt-1">{c.lines.length} lines · {c.lines.filter((l) => l.flawed).length} planted errors</div>
                </button>
              )
            })}
          </div>
          <Card className="h-fit">
            <div className="font-hand text-mango text-xl leading-none mb-1">the skill</div>
            <h3 className="font-extrabold text-charcoal mb-2">Reading AI output critically</h3>
            <p className="text-sm text-charcoal-500">In 2036 every answer arrives confident. Your job: click the lines that are wrong — math steps, physics reasoning, essay logic — before trusting them. Win {WINS_NEEDED} rounds for the <strong>Critical Eye</strong> stamp.</p>
            <div className="mt-3 text-xs text-charcoal-400">Wins so far: <strong className="text-charcoal">{Math.min(wins, WINS_NEEDED)}</strong> / {WINS_NEEDED}</div>
          </Card>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell title="Spot the Flaw" eyebrow="confident ≠ correct" icon={Search} badge={badge} course={course} progress={`${Math.min(wins, WINS_NEEDED)}/${WINS_NEEDED} wins`}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card>
          <div className="flex items-center justify-between mb-3"><div><Pill tone="neutral">{kase.kind}</Pill><h3 className="font-extrabold text-charcoal text-lg mt-1">{kase.title}</h3></div></div>
          <Bubble who="ai" name="Confident AI">{kase.confidence}</Bubble>
          <div className="mt-4 rounded-2xl border border-charcoal-100 p-4 space-y-1.5 font-medium">
            {kase.lines.map((l, i) => {
              const on = picked.includes(i)
              const state = result ? (l.flawed ? (on ? 'hit' : 'miss') : on ? 'false' : 'ok') : on ? 'flag' : 'idle'
              return (
                <button key={i} onClick={() => !result && setPicked((p) => (on ? p.filter((x) => x !== i) : [...p, i]))} disabled={!!result} className={cx('w-full text-left rounded-xl px-3 py-2.5 text-sm border transition-all flex gap-3', state === 'idle' && 'border-transparent hover:bg-cloud', state === 'flag' && 'border-mango bg-mango-50', state === 'hit' && 'border-success bg-success-soft', state === 'miss' && 'border-danger bg-danger-soft', state === 'false' && 'border-charcoal-300 bg-charcoal-50 text-charcoal-400', state === 'ok' && 'border-transparent text-charcoal-400')}>
                  <span className="text-charcoal-300 w-5 shrink-0 text-xs pt-0.5">{state === 'hit' ? <CheckCircle2 size={14} className="text-success" /> : state === 'miss' ? <XCircle size={14} className="text-danger" /> : i + 1}</span>
                  <span className="flex-1">{l.text}{result && l.flawed && <span className="block mt-1 text-xs font-semibold text-charcoal">Why: {l.why}</span>}{result && state === 'false' && <span className="block mt-1 text-xs">This line was fine.</span>}</span>
                </button>
              )
            })}
          </div>
          {!result && <div className="flex items-center justify-between mt-4"><span className="text-xs text-charcoal-400">{picked.length} line{picked.length === 1 ? '' : 's'} flagged</span><Button onClick={reveal} disabled={picked.length === 0} loading={busy}><Eye size={16} /> Reveal</Button></div>}
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">Score</div>
            <div className="text-3xl font-extrabold text-charcoal">{result ? `${result.hits}/${result.total}` : `–/${kase.lines.filter((l) => l.flawed).length}`} <span className="text-sm font-semibold text-charcoal-400">flaws found</span></div>
            {result && result.falses > 0 && <div className="text-xs text-danger mt-1">{result.falses} false alarm{result.falses > 1 ? 's' : ''}</div>}
          </Card>
          {result ? (
            <ResultCard eyebrow={result.win ? 'critical eye' : 'keep looking'} title={result.win ? 'You caught every flaw' : 'Some flaws slipped through'} points={result.pts} badgeEarned={result.badgeNew ? 'Critical Eye' : null} tone={result.win ? 'mango' : 'light'} onReplay={() => { setKase(null); setPicked([]); setResult(null) }} replayLabel="Next case">
              {result.win ? (result.count >= WINS_NEEDED ? `${result.count} wins — Critical Eye territory.` : `Win ${result.count} of ${WINS_NEEDED}.`) : 'A win needs every planted error and at most one false alarm.'}
            </ResultCard>
          ) : null}
          {result && (
            <CoachChat key={kase.id} name={profile.full_name.split(' ')[0]} context={`Game: Spot the Flaw — the student read a confident AI answer ("${kase.title}", ${kase.kind}) and flagged the lines they thought were wrong.\nLines:\n${kase.lines.map((l, i) => `${i + 1}. ${l.text}${l.flawed ? ` [FLAWED: ${l.why}]` : ''}${picked.includes(i) ? ' [student flagged]' : ''}`).join('\n')}\nResult: found ${result.hits}/${result.total} flaws with ${result.falses} false alarm(s).`} />
          )}
          {!result && (
            <Callout tone="mango" icon={Search} title="Rules">Find every planted error with at most one false alarm to win the round. Confidence is not a signal — check each step.</Callout>
          )}
        </div>
      </div>
    </GameShell>
  )
}
