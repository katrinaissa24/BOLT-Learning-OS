import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Zap, Bot, Send } from 'lucide-react'
import { Pill, Button, AITag, Card, Textarea } from '../ui'
import { badgeIcon } from '../passport/icons'
import { cx } from '../../lib/utils'
import { aiEnabled, ask } from '../../lib/ai'

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))
/** Simulated "thinking" delay only when AI is off (AI calls carry their own latency). */
export const think = (ms = 650) => (aiEnabled ? Promise.resolve() : wait(ms))

/* local counters for badge thresholds */
const KEY = 'bolt.lab.counters'
export const readCounters = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {} } catch { return {} } }
export const bumpCounter = (k, by = 1) => { const c = readCounters(); c[k] = (c[k] || 0) + by; try { localStorage.setItem(KEY, JSON.stringify(c)) } catch { /* ignore */ } return c[k] }

/** Shared header for every game. */
export function GameShell({ title, eyebrow, icon: Icon, badge, course, children, progress, ai = false }) {
  const BadgeIcon = badge ? badgeIcon(badge.icon) : null
  return (
    <div>
      <Link to="/student/lab" className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-400 hover:text-charcoal mb-4"><ArrowLeft size={15} /> Thinking Lab</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal text-mango flex items-center justify-center shadow-soft shrink-0"><Icon size={28} /></div>
          <div>
            <div className="font-hand text-mango text-2xl leading-none mb-1">{eyebrow}</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-charcoal leading-none flex items-center gap-2">{title} {ai && <AITag className="text-xs" />}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {course && <Pill tone="outline"><span className="w-2 h-2 rounded-full mr-1" style={{ background: course.color }} />{course.subject}</Pill>}
          {badge && <Pill tone={badge.earned ? 'success' : 'neutral'} className="normal-case tracking-normal text-xs"><BadgeIcon size={12} /> {badge.name}{badge.earned ? ' · earned' : progress ? ` · ${progress}` : ''}</Pill>}
        </div>
      </div>
      {children}
    </div>
  )
}

/** Chat bubble for AI / student turns. */
export function Bubble({ who = 'ai', name, children, delay = 0, tone }) {
  const ai = who === 'ai'
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, duration: 0.3 }} className={cx('flex gap-3', ai ? '' : 'flex-row-reverse')}>
      <div className={cx('w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold', ai ? 'bg-charcoal text-mango' : 'bg-mango text-white')}>{ai ? <Bot size={18} /> : (name || 'You').slice(0, 2).toUpperCase()}</div>
      <div className={cx('max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed', ai ? 'bg-cloud text-charcoal rounded-tl-sm' : 'bg-charcoal text-white rounded-tr-sm', tone === 'danger' && 'ring-2 ring-danger/30', tone === 'success' && 'ring-2 ring-success/30')}>
        {name && <div className={cx('text-[10px] font-bold uppercase tracking-wide mb-1', ai ? 'text-charcoal-400' : 'text-white/60')}>{name}</div>}
        {children}
      </div>
    </motion.div>
  )
}

export function Typing({ name = 'BOLT' }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-charcoal text-mango flex items-center justify-center shrink-0"><Bot size={18} /></div>
      <div className="rounded-2xl rounded-tl-sm bg-cloud px-4 py-3 flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-charcoal-400 mr-1">{name}</span>
        {[0, 1, 2].map((i) => <motion.span key={i} className="w-2 h-2 rounded-full bg-charcoal-300" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />)}
      </div>
    </div>
  )
}

/** Result banner at the end of a game. */
export function ResultCard({ title, eyebrow, points, badgeEarned, children, onReplay, replayLabel = 'Play again', tone = 'mango' }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className={cx('rounded-3xl p-6 md:p-8 text-center relative overflow-hidden', tone === 'mango' ? 'bg-charcoal text-white bolt-pattern-dark' : 'bg-white border border-charcoal-100')}>
      <div className={cx('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3', tone === 'mango' ? 'bg-mango text-white' : 'bg-charcoal-100 text-charcoal-400')}><Trophy size={30} /></div>
      {eyebrow && <div className="font-hand text-mango text-2xl leading-none">{eyebrow}</div>}
      <h3 className="text-2xl font-extrabold tracking-tight mt-1">{title}</h3>
      <div className={cx('mt-3 text-sm max-w-xl mx-auto', tone === 'mango' ? 'text-white/80' : 'text-charcoal-500')}>{children}</div>
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {points > 0 && <Pill tone="mango" icon={Zap} className="normal-case tracking-normal text-xs">+{points} points</Pill>}
        {badgeEarned && <Pill tone="success" icon={Trophy} className="normal-case tracking-normal text-xs">{badgeEarned} stamp earned</Pill>}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {onReplay && <Button variant={tone === 'mango' ? 'primary' : 'dark'} onClick={onReplay}>{replayLabel}</Button>}
        <Button variant={tone === 'mango' ? 'secondary' : 'ghost'} to="/student/passport">See passport</Button>
      </div>
    </motion.div>
  )
}

/** Step dots */
export function Steps({ total, current }) {
  return <div className="flex items-center gap-1.5">{Array.from({ length: total }).map((_, i) => <span key={i} className={cx('h-2 rounded-full transition-all', i < current ? 'bg-mango w-6' : i === current ? 'bg-charcoal w-6' : 'bg-charcoal-200 w-2')} />)}</div>
}

/** Pick a sentence-ish fragment from the student's text to echo back. */
export function quoteFrom(text, max = 50) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return 'that'
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15)
  const pick = (sentences.sort((a, b) => b.length - a.length)[0] || clean)
  return pick.length > max ? pick.slice(0, max).replace(/\s\S*$/, '') + '…' : pick.replace(/[.!?]$/, '')
}

const COACH_RULES = `Every reply has TWO parts, 2–5 short sentences total:
(1) A personalised response to what the student actually did or wrote — quote or name their specific choices. Say what was strong and name one specific gap. If they say they don't know or wrote very little, give a small concrete example or the key idea in plain words instead of repeating the question.
(2) End with ONE follow-up question that asks them to DO something concrete — prefer "Give me an example of …", "Show me …", "Rewrite … so that …", "What would you do if …". Never just "Explain …".
Don't lecture. Always finish your sentences.`

/**
 * AI coaching thread shown after a game: opens with a personalised debrief + follow-up question,
 * then answers every student reply with a personalised response + a new follow-up question.
 *   context: what the game was and what the student did (plain text for the model)
 */
export function CoachChat({ context, name = 'You', title = 'BOLT coach' }) {
  const [turns, setTurns] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState(false)
  const feedRef = useRef(null)
  const system = `You are BOLT, coaching ${name} after a Thinking Lab activity.\n${context}\n\n${COACH_RULES}`

  const OPEN = { role: 'user', content: 'Give me my personalised debrief and a follow-up question.' }
  const open = () => {
    setBusy(true); setError(false)
    return ask({ system, messages: [OPEN], fallback: '', maxTokens: 450 })
  }
  useEffect(() => {
    let live = true
    open().then((text) => { if (!live) return; if (text) setTurns([{ who: 'ai', text }]); else setError(true); setBusy(false) })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const retryOpen = async () => { const text = await open(); if (text) setTurns([{ who: 'ai', text }]); else setError(true); setBusy(false) }
  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, busy])

  const send = async () => {
    const text = draft.trim()
    if (!text || busy) return
    const history = [...turns, { who: 'you', text }]
    setTurns(history); setDraft(''); setBusy(true); setError(false)
    const reply = await ask({ system, messages: [OPEN, ...history.map((t) => ({ role: t.who === 'ai' ? 'assistant' : 'user', content: t.text }))], fallback: '', maxTokens: 450 })
    if (reply) setTurns((t) => [...t, { who: 'ai', text: reply }])
    else { setTurns(turns); setDraft(text); setError(true) } // AI unreachable: no canned reply, let them retry
    setBusy(false)
  }

  return (
    <Card padded={false} className="flex flex-col">
      <div className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 flex items-center gap-2">{title} <AITag className="text-[10px]" /></div>
      <div ref={feedRef} className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
        {turns.map((t, i) => <Bubble key={i} who={t.who} name={t.who === 'ai' ? 'BOLT' : name}><span className="whitespace-pre-line">{t.text}</span></Bubble>)}
        {error && !busy && <div className="rounded-xl bg-danger-soft text-charcoal text-sm p-3 flex items-center justify-between gap-3">BOLT couldn’t reach the AI just now.{turns.length === 0 && <Button size="sm" variant="ghost" onClick={retryOpen}>Retry</Button>}</div>}
        {busy && <Typing />}
      </div>
      <div className="border-t border-charcoal-100 p-4">
        <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={busy || turns.length === 0} placeholder="Answer BOLT’s question — or say “I don’t know” and it will help." onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }} />
        <div className="flex justify-end mt-2"><Button size="sm" onClick={send} disabled={busy || !draft.trim() || turns.length === 0}><Send size={14} /> Reply</Button></div>
      </div>
    </Card>
  )
}
