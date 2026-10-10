import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Flag, CheckCircle2, XCircle, Send } from 'lucide-react'
import { Card, Button, Textarea, Pill, Callout } from '../ui'
import { ask } from '../../lib/ai'
import { useData } from '../../lib/data'
import { courseById } from '../../lib/selectors'
import { ZIKO_SESSIONS } from '../../data/lab'
import { GameShell, Bubble, Typing, ResultCard, think, bumpCounter, readCounters } from './shared'
import { cx } from '../../lib/utils'

export default function TeachTheBot({ profile }) {
  const { db, awardPoints, awardBadge } = useData()
  const [session, setSession] = useState(null)
  const [flags, setFlags] = useState([])
  const [correction, setCorrection] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const done = readCounters()['ziko-sessions'] || 0
  const earned = db.studentBadges.some((b) => b.student_id === profile.id && b.badge_id === 'bot-teacher')
  const badge = { ...db.badges.find((b) => b.id === 'bot-teacher'), earned }
  const course = session ? courseById(db, session.course) : null

  const toggle = (i) => { if (result) return; setFlags((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i])) }

  const submit = async () => {
    setBusy(true); await think(900)
    const wrong = session.sentences.map((s, i) => (s.wrong ? i : -1)).filter((i) => i >= 0)
    const spotted = wrong.filter((i) => flags.includes(i))
    const falseFlags = flags.filter((i) => !wrong.includes(i))
    const perfect = spotted.length === wrong.length && falseFlags.length === 0
    const reply = await ask({ system: `You are Ziko, a friendly but confused AI classmate. The student just corrected your explanation of "${session.title}". Reply in 2 sentences: thank them, restate ONE corrected idea in your own words. Keep it light.`, messages: [{ role: 'user', content: `Student flagged sentences: ${flags.map((i) => session.sentences[i].text).join(' | ')}\nStudent's correction: ${correction}` }], fallback: perfect ? `Ohh, I see it now — ${session.sentences[wrong[0]].fix.split('.')[0]}. Thanks ${profile.full_name.split(' ')[0]}, you explained that better than the video!` : `Hmm, thanks! I think I still mixed something up — ${session.sentences[wrong.find((i) => !flags.includes(i)) ?? wrong[0]].fix.split('.')[0]}. Let me re-read my notes.`, maxTokens: 160 })
    const pts = 30 + spotted.length * 10 + (perfect ? 10 : 0)
    let badgeNew = false
    let count = done
    try {
      await awardPoints(profile.id, session.course, pts, `Teach the Bot · ${session.title.replace('Ziko explains ', '')}`)
      if (perfect && correction.trim().length >= 15) {
        count = bumpCounter('ziko-sessions')
        if (count >= 3) { const b = await awardBadge(profile.id, 'bot-teacher', `Teach the Bot: ${count} sessions with every mistake corrected.`); badgeNew = !!b }
      }
    } catch (err) { console.warn('[BOLT] ziko award skipped', err) }
    setResult({ spotted: spotted.length, total: wrong.length, falseFlags: falseFlags.length, perfect, reply, pts, badgeNew, count })
    setBusy(false)
  }

  const reset = () => { setSession(null); setFlags([]); setCorrection(''); setResult(null) }

  if (!session) {
    return (
      <GameShell ai title="Teach the Bot" eyebrow="ziko needs you" icon={Bot} badge={badge} progress={`${done}/3 sessions`}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {ZIKO_SESSIONS.map((s) => {
              const c = courseById(db, s.course)
              return (
                <button key={s.id} onClick={() => setSession(s)} className="text-left rounded-2xl border border-charcoal-100 bg-white p-4 hover:border-mango hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2"><Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: c.color }} />{c.subject}</Pill><Pill tone="neutral">{s.sentences.filter((x) => x.wrong).length} mistakes</Pill></div>
                  <div className="font-bold text-charcoal">{s.title}</div>
                  <div className="text-xs text-charcoal-400 mt-1">“{s.intro}”</div>
                </button>
              )
            })}
          </div>
          <Card className="h-fit">
            <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-full bg-charcoal text-mango flex items-center justify-center"><Bot size={24} /></div><div><div className="font-extrabold text-charcoal">Ziko</div><div className="text-xs text-charcoal-400">Confident. Confused. Teachable.</div></div></div>
            <p className="text-sm text-charcoal-500">Ziko explains a concept with a few planted mistakes. Click each wrong sentence to flag it, then write the correction in your own words. Correct every mistake in 3 sessions to earn <strong>Bot Teacher</strong>.</p>
            <div className="mt-3 text-xs text-charcoal-400">Sessions completed: <strong className="text-charcoal">{done}</strong> / 3</div>
          </Card>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell ai title="Teach the Bot" eyebrow="ziko needs you" icon={Bot} badge={badge} course={course} progress={`${done}/3 sessions`}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card>
          <Bubble who="ai" name="Ziko">{session.intro}</Bubble>
          <div className="mt-4 rounded-2xl border border-charcoal-100 p-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1 flex items-center gap-1.5"><Flag size={12} /> Click any sentence that is wrong</div>
            {session.sentences.map((s, i) => {
              const flagged = flags.includes(i)
              const state = result ? (s.wrong ? (flagged ? 'hit' : 'miss') : flagged ? 'false' : 'ok') : flagged ? 'flag' : 'idle'
              return (
                <motion.button key={i} layout onClick={() => toggle(i)} disabled={!!result} className={cx('w-full text-left rounded-xl px-3 py-2.5 text-sm border transition-all flex gap-3 items-start', state === 'idle' && 'border-transparent hover:bg-cloud', state === 'flag' && 'border-mango bg-mango-50', state === 'hit' && 'border-success bg-success-soft', state === 'miss' && 'border-danger bg-danger-soft', state === 'false' && 'border-charcoal-300 bg-charcoal-50 line-through text-charcoal-400', state === 'ok' && 'border-transparent text-charcoal-400')}>
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold border-charcoal-200">{state === 'hit' ? <CheckCircle2 size={14} className="text-success" /> : state === 'miss' ? <XCircle size={14} className="text-danger" /> : flagged ? <Flag size={11} className="text-mango" /> : i + 1}</span>
                  <span className="flex-1">
                    {s.text}
                    {result && s.wrong && <span className="block mt-1 text-xs font-semibold text-charcoal">Fix: {s.fix}</span>}
                    {result && state === 'false' && <span className="block mt-1 text-xs text-charcoal-400 no-underline">This one was actually correct.</span>}
                  </span>
                </motion.button>
              )
            })}
          </div>
          {!result && (
            <div className="mt-4">
              <Textarea label="Your correction for Ziko" rows={3} value={correction} onChange={(e) => setCorrection(e.target.value)} placeholder="Explain what is wrong and what the right idea is…" />
              <div className="flex items-center justify-between mt-2"><span className="text-xs text-charcoal-400">{flags.length} flagged</span><Button onClick={submit} disabled={flags.length === 0 || correction.trim().length < 15} loading={busy}><Send size={16} /> Teach Ziko</Button></div>
            </div>
          )}
          {busy && <div className="mt-4"><Typing name="Ziko" /></div>}
          {result && <div className="mt-4"><Bubble who="ai" name="Ziko" tone={result.perfect ? 'success' : undefined}>{result.reply}</Bubble></div>}
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1">Score</div>
            <div className="text-3xl font-extrabold text-charcoal">{result ? `${result.spotted}/${result.total}` : `–/${session.sentences.filter((s) => s.wrong).length}`} <span className="text-sm font-semibold text-charcoal-400">mistakes spotted</span></div>
            {result && result.falseFlags > 0 && <div className="text-xs text-danger mt-1">{result.falseFlags} correct sentence{result.falseFlags > 1 ? 's' : ''} flagged by mistake</div>}
          </Card>
          {result ? (
            <ResultCard eyebrow={result.perfect ? 'every mistake fixed' : 'almost'} title={result.perfect ? 'Ziko finally gets it' : 'Ziko is still a bit lost'} points={result.pts} badgeEarned={result.badgeNew ? 'Bot Teacher' : null} tone={result.perfect ? 'mango' : 'light'} onReplay={reset} replayLabel="Another session">
              {result.perfect ? `Session ${result.count} of 3 toward Bot Teacher.` : 'Re-read the sentences you missed — the fixes are shown inline. Perfect sessions count toward the stamp.'}
            </ResultCard>
          ) : (
            <Callout tone="mango" icon={Bot} title="How to win">Flag every wrong sentence and none of the right ones, then write a correction of at least a sentence. Teaching is the deepest test of understanding.</Callout>
          )}
        </div>
      </div>
    </GameShell>
  )
}
