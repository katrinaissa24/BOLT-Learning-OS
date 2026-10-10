import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Save, Send, Clock, Type, Keyboard, Bot, Scissors, FileText, PenLine, CheckCircle2, ArrowDownToLine } from 'lucide-react'
import { Button, Pill, Callout, AITag } from '../ui'
import { useData } from '../../lib/data'
import { ask, aiEnabled } from '../../lib/ai'
import { fmtTime, cx } from '../../lib/utils'
import { coachingFallback } from './coaching'
import ProcessTimeline from './ProcessTimeline'

const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0)

/**
 * Essay editor with process-replay recording.
 * Records events in the seed `process` shape and computes seed-compatible `metrics` + `ai_usage` on submit.
 */
export default function EssayEditor({ lesson, course, prompt, studentId, onResult }) {
  const { db } = useData()
  const existing = useMemo(() => db.submissions.filter((s) => s.student_id === studentId && s.lesson_id === lesson.id).sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''))[0], [db.submissions, studentId, lesson.id])
  const [writingNew, setWritingNew] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  if (existing && !writingNew) return <SubmittedPanel submission={existing} fresh={justSubmitted} onNew={() => { setWritingNew(true); setJustSubmitted(false) }} />
  return <Editor lesson={lesson} course={course} prompt={prompt} studentId={studentId} onResult={onResult} onSubmitted={() => { setWritingNew(false); setJustSubmitted(true) }} />
}

function Editor({ lesson, course, prompt, studentId, onResult, onSubmitted }) {
  const { addSubmission, awardPoints } = useData()
  const [text, setText] = useState('')
  const textRef = useRef('')
  const [events, setEvents] = useState([{ t: 0, type: 'snapshot', label: 'Started', chars: 0 }])
  const eventsRef = useRef(events)
  const start = useRef(Date.now())
  const now = () => Math.round((Date.now() - start.current) / 1000)
  const counters = useRef({ typed: 0, deletedChars: 0, deletions: 0, pasted: 0, aiChars: 0, aiPrompts: 0, snapshots: 1, pauses: [] })
  const burst = useRef(null)
  const lastActivity = useRef(0)
  const pasteFlag = useRef(false)
  const [tick, setTick] = useState(0)
  const [declared, setDeclared] = useState(false)
  const [declaredText, setDeclaredText] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiThread, setAiThread] = useState([]) // { prompt, reply, insert }
  const [aiBusy, setAiBusy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const taRef = useRef(null)

  const push = useCallback((ev) => { eventsRef.current = [...eventsRef.current, ev]; setEvents(eventsRef.current) }, [])
  const flushBurst = useCallback(() => {
    if (!burst.current) return
    push({ t: burst.current.start, type: 'type', chars: burst.current.chars, ...(burst.current.text ? { text: burst.current.text.slice(0, 60) } : {}) })
    burst.current = null
  }, [push])
  const noteActivity = useCallback(() => {
    const t = now()
    const gap = t - lastActivity.current
    if (lastActivity.current > 0 && gap > 20) { push({ t: lastActivity.current, type: 'pause', seconds: gap, note: gap > 60 ? 'Long pause — thinking or re-reading' : 'Short pause' }); counters.current.pauses.push(gap) }
    lastActivity.current = t
    return t
  }, [push])

  // 1-second heartbeat: flush stale bursts, auto-snapshot every 2 minutes
  useEffect(() => {
    const id = setInterval(() => {
      setTick((n) => n + 1)
      const t = now()
      if (burst.current && t - burst.current.start >= 3) flushBurst()
      if (t > 0 && t % 120 === 0) { counters.current.snapshots++; push({ t, type: 'snapshot', label: `Auto ${counters.current.snapshots - 1}`, chars: textRef.current.length }) }
    }, 1000)
    return () => clearInterval(id)
  }, [flushBurst, push])

  const onChange = (e) => {
    const next = e.target.value, prev = textRef.current
    const t = noteActivity()
    if (pasteFlag.current) { pasteFlag.current = false }
    else if (next.length > prev.length) {
      const n = next.length - prev.length
      counters.current.typed += n
      if (burst.current && t - burst.current.start >= 3) flushBurst()
      if (!burst.current) burst.current = { start: t, chars: 0, text: '' }
      burst.current.chars += n
      if (burst.current.text.length < 60) burst.current.text += next.slice(prev.length, prev.length + n)
    } else if (next.length < prev.length) {
      flushBurst()
      const n = prev.length - next.length
      counters.current.deletedChars += n; counters.current.deletions++
      push({ t, type: 'delete', chars: n, ...(n > 40 ? { note: 'Cut a passage' } : {}) })
    }
    textRef.current = next; setText(next)
  }
  const onPaste = (e) => {
    const txt = e.clipboardData?.getData('text') || ''
    if (!txt) return
    flushBurst(); const t = noteActivity()
    counters.current.pasted += txt.length
    push({ t, type: 'paste', chars: txt.length, text: txt.slice(0, 60) })
    pasteFlag.current = true
  }
  const saveDraft = () => { flushBurst(); counters.current.snapshots++; push({ t: now(), type: 'snapshot', label: `Draft ${counters.current.snapshots - 1}`, chars: textRef.current.length }) }

  const askBolt = async () => {
    const q = aiPrompt.trim(); if (!q || aiBusy) return
    setAiBusy(true); setAiPrompt('')
    flushBurst(); const t = noteActivity()
    const fb = coachingFallback({ question: q, lesson, prompt, draft: textRef.current })
    if (!aiEnabled) await new Promise((r) => setTimeout(r, 500 + Math.random() * 400))
    const system = `You are a writing coach inside a school essay editor. The student is writing on the prompt: "${prompt}" for the lesson "${lesson.title}". Their draft so far:\n${textRef.current.slice(0, 3000)}\n\nCoach, don't ghost-write: ask one question back and offer at most ONE sentence they could insert. End your reply with a final line formatted exactly as: SENTENCE: <the one sentence>`
    const reply = await ask({ system, messages: [{ role: 'user', content: q }], fallback: fb.reply, maxTokens: 400 })
    const m = reply.match(/SENTENCE:\s*(.+)$/m)
    const insert = m ? m[1].trim() : fb.insert
    const shown = reply.replace(/\n?SENTENCE:.*$/m, '').trim()
    counters.current.aiPrompts++
    push({ t, type: 'ai_prompt', prompt: q, reply: shown })
    setAiThread((th) => [...th, { prompt: q, reply: shown, insert }])
    setAiBusy(false)
  }
  const insertSentence = (s) => {
    flushBurst(); const t = noteActivity()
    const cur = textRef.current
    const sep = !cur ? '' : /\s$/.test(cur) ? '' : ' '
    const next = cur + sep + s
    counters.current.aiChars += s.length
    push({ t, type: 'ai_insert', chars: s.length, text: s })
    textRef.current = next; setText(next)
    taRef.current?.focus()
  }

  const elapsed = now() + tick * 0 // tick forces re-render each second
  const c = counters.current
  const wordCount = words(text)
  const aiShare = text.length ? Math.min(1, c.aiChars / text.length) : 0
  const keystrokes = c.typed + c.deletedChars

  const submit = async () => {
    if (wordCount < 20 || submitting) return
    setSubmitting(true)
    flushBurst()
    const t = now()
    const final = [...eventsRef.current, { t, type: 'snapshot', label: 'Final', chars: textRef.current.length }]
    const pauses = c.pauses
    const metrics = {
      total_seconds: t,
      active_seconds: Math.max(0, t - pauses.reduce((a, b) => a + b, 0)),
      keystrokes,
      words: wordCount,
      pasted_chars: c.pasted,
      ai_chars: c.aiChars,
      ai_prompts: c.aiPrompts,
      deletions: c.deletions,
      snapshots: c.snapshots + 1,
      longest_pause_seconds: pauses.length ? Math.max(...pauses) : 0,
      revision_ratio: Math.round((c.deletedChars / Math.max(1, c.typed)) * 100) / 100,
    }
    const ai_usage = { declared, prompts: c.aiPrompts, share_of_text: Math.round(aiShare * 100) / 100, mode: declared && declaredText.trim() ? declaredText.trim() : c.aiPrompts ? 'coaching questions' : 'none' }
    const title = textRef.current.split('\n')[0].trim().slice(0, 80) || prompt
    await addSubmission({ student_id: studentId, lesson_id: lesson.id, type: 'essay', title, content: textRef.current, process: final, metrics, ai_usage, status: 'submitted', grade: null, teacher_feedback: null })
    await awardPoints(studentId, course.id, 60, `Essay submitted with visible process · ${lesson.title}`)
    const score = Math.min(100, 55 + Math.min(25, Math.round(wordCount / 10)) + (declared || c.aiPrompts === 0 ? 10 : 0) + (c.deletions > 0 ? 5 : 0) + (c.snapshots > 1 ? 5 : 0))
    onResult?.({ score, submitted: true })
    onSubmitted?.()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-hand text-mango text-xl leading-none mb-1">your prompt</div>
          <h3 className="text-lg font-extrabold text-charcoal">{prompt}</h3>
          <p className="text-sm text-charcoal-400 mt-1">Write here, not elsewhere. BOLT records your drafts, pauses, pastes and AI help so your teacher grades the thinking, not just the page.</p>
        </div>
        <Pill tone="danger" className="normal-case tracking-normal"><span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" /> recording process</Pill>
      </div>

      {/* live stats strip */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[[Clock, 'time', fmtTime(elapsed)], [Type, 'words', wordCount], [Keyboard, 'keystrokes', keystrokes], [Bot, 'AI share', `${Math.round(aiShare * 100)}%`], [Scissors, 'revisions', c.deletions]].map(([Icon, l, v]) => (
          <div key={l} className="rounded-xl bg-white border border-charcoal-100 px-3 py-2 flex items-center gap-2 min-w-0">
            <Icon size={14} className="text-mango shrink-0" />
            <div className="min-w-0"><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold truncate">{l}</div><div className="text-sm font-extrabold text-charcoal tabular-nums">{v}</div></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
        <div>
          <textarea ref={taRef} value={text} onChange={onChange} onPaste={onPaste} rows={16} placeholder="Start with the title, then write. There is no wrong first sentence — you can revise it, and the revision counts in your favour."
            className="w-full rounded-2xl border border-charcoal-200 bg-white px-5 py-4 text-[15px] leading-relaxed text-charcoal placeholder:text-charcoal-300 focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20 resize-y min-h-[320px]" />
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Process so far · {events.length} events</div>
            <ProcessTimeline events={events} total={Math.max(60, elapsed)} compact />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer select-none">
              <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} className="accent-mango w-4 h-4" />
              <span className="font-semibold">I used AI for:</span>
              <input value={declaredText} onChange={(e) => setDeclaredText(e.target.value)} disabled={!declared} placeholder="e.g. counter-argument coaching" className="rounded-lg border border-charcoal-200 px-2.5 py-1 text-sm w-56 disabled:opacity-40 focus:outline-none focus:border-mango" />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveDraft}><Save size={16} /> Save draft</Button>
              <Button onClick={submit} loading={submitting} disabled={wordCount < 20} title={wordCount < 20 ? 'Write at least 20 words' : ''}><Send size={16} /> Submit essay</Button>
            </div>
          </div>
        </div>

        {/* Ask BOLT */}
        <aside className="card p-4 flex flex-col max-h-[640px]">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center"><Sparkles size={15} /></div><div><div className="font-bold text-sm text-charcoal flex items-center gap-1.5">Ask BOLT <AITag /></div><div className="text-[11px] text-charcoal-400">a coach, not a ghost-writer</div></div></div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[160px]">
            {aiThread.length === 0 && <div className="text-xs text-charcoal-400 rounded-xl bg-cloud p-3 leading-relaxed">Ask for a counter-argument, a sharper thesis, a sensory detail… BOLT answers with a question and at most one sentence you may insert. Every prompt and insert is logged to your process.</div>}
            {aiThread.map((m, i) => (
              <div key={i} className="space-y-1.5">
                <div className="text-xs bg-mango-50 text-charcoal rounded-xl rounded-br-sm px-3 py-2 ml-6">{m.prompt}</div>
                <div className="text-xs bg-cloud text-charcoal rounded-xl rounded-bl-sm px-3 py-2 mr-2 whitespace-pre-line leading-relaxed">{m.reply}</div>
                {m.insert && <button type="button" onClick={() => insertSentence(m.insert)} className="flex items-start gap-1.5 text-left text-[11px] text-mango-700 font-semibold hover:underline ml-1"><ArrowDownToLine size={12} className="mt-0.5 shrink-0" /> Insert: “{m.insert}”</button>}
              </div>
            ))}
            {aiBusy && <div className="text-xs text-charcoal-400 flex items-center gap-2 px-1"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-mango animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}</span>BOLT is thinking…</div>}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); askBolt() }}>
            <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask about your draft…" className="flex-1 rounded-xl border border-charcoal-200 px-3 py-2 text-sm focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20" />
            <Button type="submit" size="sm" variant="dark" disabled={!aiPrompt.trim() || aiBusy}><Send size={14} /></Button>
          </form>
        </aside>
      </div>
    </div>
  )
}

function SubmittedPanel({ submission, fresh, onNew }) {
  const m = submission.metrics || {}
  const ai = submission.ai_usage || {}
  return (
    <div>
      <Callout tone={fresh ? 'success' : 'mango'} icon={CheckCircle2} title={fresh ? 'Submitted — your thinking path is part of the grade' : 'Submitted'} className="mb-4">
        {fresh ? 'Your teacher will see the final page and the path that produced it: drafts, pauses, cuts and AI help.' : `You submitted “${submission.title}” on ${new Date(submission.submitted_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}.`}
      </Callout>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><FileText size={16} className="text-mango" /><h4 className="font-extrabold text-charcoal">{submission.title}</h4></div>
            <Pill tone={submission.status === 'graded' ? 'success' : submission.status === 'flagged' ? 'danger' : 'info'}>{submission.status}</Pill>
          </div>
          {submission.content ? <div className="text-sm text-charcoal-500 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto pr-2">{submission.content}</div> : <div className="text-sm text-charcoal-400 italic">Text stored on the server.</div>}
          {submission.process?.length > 0 && <div className="mt-4"><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Thinking path · {submission.process.length} events</div><ProcessTimeline events={submission.process} total={m.total_seconds || submission.process[submission.process.length - 1].t} /></div>}
        </div>
        <div className="space-y-3">
          <div className="card p-4 grid grid-cols-2 gap-3 text-xs">
            {[['Time', fmtTime(m.total_seconds)], ['Active', fmtTime(m.active_seconds)], ['Words', m.words], ['Keystrokes', m.keystrokes], ['Revisions', m.deletions], ['Longest pause', fmtTime(m.longest_pause_seconds)], ['AI prompts', m.ai_prompts], ['AI share', `${Math.round((ai.share_of_text || 0) * 100)}%`]].map(([l, v]) => (
              <div key={l}><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold">{l}</div><div className="text-base font-extrabold text-charcoal tabular-nums">{v ?? '—'}</div></div>
            ))}
          </div>
          <div className={cx('rounded-2xl border p-4 text-xs', ai.declared ? 'bg-success-soft border-success/30 text-charcoal' : 'bg-cloud border-charcoal-100 text-charcoal-500')}>
            <div className="font-bold mb-0.5 flex items-center gap-1.5"><Bot size={13} /> AI declaration</div>
            {ai.declared ? `Declared: ${ai.mode}` : ai.prompts ? 'AI was used but not declared.' : 'No AI used.'}
          </div>
          {submission.teacher_feedback && <div className="rounded-2xl bg-mango-50 border border-mango-200 p-4 text-sm"><div className="text-[10px] uppercase tracking-wide text-mango-700 font-semibold mb-1">Teacher feedback{submission.grade != null && ` · ${submission.grade}/20`}</div>{submission.teacher_feedback}</div>}
          <Button variant="secondary" className="w-full" onClick={onNew}><PenLine size={16} /> Write a new version</Button>
        </div>
      </div>
    </div>
  )
}
