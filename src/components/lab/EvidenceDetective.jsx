import { useState } from 'react'
import { Fingerprint, ShieldCheck, HelpCircle, Ban, Eye, FolderOpen } from 'lucide-react'
import { Card, Button, Pill, Callout, Input } from '../ui'
import { useData } from '../../lib/data'
import { courseById } from '../../lib/selectors'
import { CASE_FILES } from '../../data/lab'
import { GameShell, ResultCard, think } from './shared'
import { cx } from '../../lib/utils'

const VERDICTS = [['trust', 'Trust', ShieldCheck, 'success'], ['doubt', 'Doubt', HelpCircle, 'mango'], ['reject', 'Reject', Ban, 'danger']]
const TONE_CLS = { success: 'border-success bg-success-soft text-success', mango: 'border-mango bg-mango-50 text-mango-700', danger: 'border-danger bg-danger-soft text-danger' }

export default function EvidenceDetective({ profile }) {
  const { db, awardPoints, awardBadge } = useData()
  const [kase, setKase] = useState(null)
  const [ratings, setRatings] = useState({})
  const [reasons, setReasons] = useState({})
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'evidence-detective')
  const badge = { ...db.badges.find((b) => b.id === 'evidence-detective'), earned }
  const course = kase ? courseById(db, kase.course) : null
  const complete = kase && kase.sources.every((_, i) => ratings[i])

  const reveal = async () => {
    setBusy(true); await think(800)
    const correct = kase.sources.filter((s, i) => ratings[i] === s.verdict).length
    const accuracy = Math.round((correct / kase.sources.length) * 100)
    const pts = 30 + correct * 10
    let badgeNew = false
    try {
      await awardPoints(profile.id, kase.course, pts, `Evidence Detective case · ${kase.title}`)
      if (accuracy >= 90) { const b = await awardBadge(profile.id, 'evidence-detective', `Case file “${kase.title}”: ${accuracy}% accuracy.`); badgeNew = !!b }
    } catch (err) { console.warn('[BOLT] detective award skipped', err) }
    setResult({ correct, accuracy, pts, badgeNew })
    setBusy(false)
  }

  if (!kase) {
    return (
      <GameShell title="Evidence Detective" eyebrow="who do you trust?" icon={Fingerprint} badge={badge}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {CASE_FILES.map((c) => {
              const co = courseById(db, c.course)
              return (
                <button key={c.id} onClick={() => { setKase(c); setRatings({}); setReasons({}); setResult(null) }} className="text-left rounded-2xl border border-charcoal-100 bg-white p-4 hover:border-mango hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2"><Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: co.color }} />{co.subject}</Pill><FolderOpen size={16} className="text-charcoal-300" /></div>
                  <div className="font-bold text-charcoal">Case file: {c.title}</div>
                  <div className="text-xs text-charcoal-400 mt-1 line-clamp-2">{c.brief}</div>
                </button>
              )
            })}
          </div>
          <Card className="h-fit">
            <div className="font-hand text-mango text-xl leading-none mb-1">the game</div>
            <h3 className="font-extrabold text-charcoal mb-2">Rate five pieces of evidence</h3>
            <p className="text-sm text-charcoal-500">Each case file has sources, claims and charts. Rate each one <strong>Trust</strong>, <strong>Doubt</strong> or <strong>Reject</strong>, and say why. Score 90% or above for the <strong>Evidence Detective</strong> stamp.</p>
          </Card>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell title="Evidence Detective" eyebrow="who do you trust?" icon={Fingerprint} badge={badge} course={course}>
      <div className="mb-5 rounded-3xl bg-charcoal text-white p-5 bolt-pattern-dark"><div className="text-[10px] uppercase tracking-widest text-mango font-semibold">Case file · {kase.title}</div><p className="text-sm mt-1 text-white/85">{kase.brief}</p></div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-3">
          {kase.sources.map((s, i) => {
            const mine = ratings[i]
            const ok = result && mine === s.verdict
            return (
              <Card key={i} className={cx(result && (ok ? 'border-success' : 'border-danger'))}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><Pill tone="neutral">{s.type}</Pill><div className="font-bold text-charcoal mt-1.5">{s.title}</div></div>
                  <span className="text-xs font-semibold text-charcoal-400">Exhibit {String.fromCharCode(65 + i)}</span>
                </div>
                <div className="mt-2 rounded-xl bg-cloud p-3 text-sm text-charcoal-500 italic">{s.excerpt}</div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {VERDICTS.map(([v, label, Icon, tone]) => (
                    <button key={v} disabled={!!result} onClick={() => setRatings({ ...ratings, [i]: v })} className={cx('inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all', mine === v ? TONE_CLS[tone] : 'border-charcoal-200 text-charcoal-500 hover:border-charcoal-300', result && s.verdict === v && 'ring-2 ring-offset-1 ring-charcoal')}><Icon size={14} /> {label}</button>
                  ))}
                  <div className="flex-1 min-w-[180px]"><Input placeholder="Why? (one line)" value={reasons[i] || ''} onChange={(e) => setReasons({ ...reasons, [i]: e.target.value })} disabled={!!result} /></div>
                </div>
                {result && <div className={cx('mt-3 text-sm rounded-xl p-3', ok ? 'bg-success-soft text-charcoal' : 'bg-danger-soft text-charcoal')}><strong>{ok ? 'Correct' : `Answer: ${s.verdict}`}.</strong> {s.why}</div>}
              </Card>
            )
          })}
          {!result && <div className="flex justify-end"><Button onClick={reveal} disabled={!complete} loading={busy}><Eye size={16} /> Close the case</Button></div>}
        </div>
        <div className="space-y-4">
          <Card>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">Accuracy</div>
            <div className="text-3xl font-extrabold text-charcoal">{result ? `${result.accuracy}%` : `${Object.keys(ratings).length}/${kase.sources.length}`} <span className="text-sm font-semibold text-charcoal-400">{result ? `${result.correct} of ${kase.sources.length}` : 'rated'}</span></div>
          </Card>
          {result ? (
            <ResultCard eyebrow={result.accuracy >= 90 ? 'case closed' : 'case reopened'} title={result.accuracy >= 90 ? 'Detective-grade judgement' : `${result.accuracy}% accuracy`} points={result.pts} badgeEarned={result.badgeNew ? 'Evidence Detective' : null} tone={result.accuracy >= 90 ? 'mango' : 'light'} onReplay={() => { setKase(null); setRatings({}); setReasons({}); setResult(null) }} replayLabel="Next case file">
              {result.accuracy >= 90 ? 'You separated the source from the spin.' : 'Doubt is for real sources with overstated claims; Reject is for no source at all.'}
            </ResultCard>
          ) : (
            <Callout tone="mango" icon={Fingerprint} title="Detective’s rule">Ask three questions: who made it, what is the sample, and does the claim match the data. “Everyone knows” is a confession, not a citation.</Callout>
          )}
        </div>
      </div>
    </GameShell>
  )
}
