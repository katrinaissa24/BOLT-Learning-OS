import { useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot, ReferenceLine } from 'recharts'
import { Play, Pause, SkipBack, SkipForward, Keyboard, Trash2, ClipboardPaste, Bot, Sparkles, Camera, Coffee } from 'lucide-react'
import { Button, Pill } from '../ui'
import { fmtTime, cx } from '../../lib/utils'
import { BRAND, ChartTip, axisStyle } from './charts'

const EVENT_META = {
  type: { icon: Keyboard, label: 'Typing burst', cls: 'bg-charcoal-100 text-charcoal-500' },
  delete: { icon: Trash2, label: 'Deletion', cls: 'bg-danger-soft text-danger' },
  paste: { icon: ClipboardPaste, label: 'Paste', cls: 'bg-info-soft text-info' },
  ai_prompt: { icon: Bot, label: 'AI prompt', cls: 'bg-charcoal text-white' },
  ai_insert: { icon: Sparkles, label: 'AI insert', cls: 'bg-mango text-white' },
  pause: { icon: Coffee, label: 'Pause', cls: 'bg-mango-50 text-mango-700' },
  snapshot: { icon: Camera, label: 'Draft saved', cls: 'bg-success-soft text-success' },
}

/** Rebuild character counts over time from the process log. */
export function buildSeries(process) {
  let chars = 0
  const points = [{ t: 0, chars: 0 }]
  const events = process.map((e) => {
    if (e.type === 'type' || e.type === 'paste' || e.type === 'ai_insert') chars += e.chars || 0
    else if (e.type === 'delete') chars -= e.chars || 0
    else if (e.type === 'snapshot' && e.chars != null) chars = e.chars
    chars = Math.max(0, chars)
    points.push({ t: e.t, chars })
    return { ...e, charsAfter: chars }
  })
  return { points, events }
}

export default function ReplayPlayer({ process, studentName }) {
  const total = process[process.length - 1]?.t || 1
  const { points, events } = useMemo(() => buildSeries(process), [process])
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(8)
  const feedRef = useRef(null)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setCursor((c) => {
      const n = c + speed
      if (n >= total) { setPlaying(false); return total }
      return n
    }), 100)
    return () => clearInterval(id)
  }, [playing, speed, total])

  const done = events.filter((e) => e.t <= cursor)
  const current = done[done.length - 1]
  const charsNow = current?.charsAfter ?? 0
  const draftNow = [...done].reverse().find((e) => e.type === 'snapshot')?.label || 'Started'
  const aiSoFar = done.filter((e) => e.type === 'ai_insert').reduce((a, e) => a + e.chars, 0)

  useEffect(() => {
    const el = feedRef.current?.querySelector('[data-current="true"]')
    if (el && feedRef.current) feedRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }, [current?.t])

  const markers = events.filter((e) => ['snapshot', 'ai_insert', 'paste', 'ai_prompt'].includes(e.type))
  const first = (studentName || 'The student').split(' ')[0]

  return (
    <div className="space-y-4">
      {/* transport */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" onClick={() => { setCursor(0); setPlaying(false) }} aria-label="Restart"><SkipBack size={14} /></Button>
          <Button size="sm" onClick={() => { if (cursor >= total) setCursor(0); setPlaying((p) => !p) }} className="w-24">{playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {cursor >= total ? 'Replay' : cursor ? 'Resume' : 'Play'}</>}</Button>
          <Button size="sm" variant="secondary" onClick={() => { setCursor(total); setPlaying(false) }} aria-label="Jump to end"><SkipForward size={14} /></Button>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-charcoal-400">Speed
          {[4, 8, 16].map((s) => <button key={s} onClick={() => setSpeed(s)} className={cx('rounded-lg px-2 py-1', speed === s ? 'bg-charcoal text-white' : 'bg-cloud hover:bg-charcoal-100')}>{s * 10}×</button>)}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="font-mono font-bold text-charcoal tabular-nums">{fmtTime(cursor)}</span><span className="text-charcoal-300">/ {fmtTime(total)}</span>
          <Pill tone="success">{draftNow}</Pill>
          <Pill tone="neutral">{charsNow.toLocaleString()} chars</Pill>
          {aiSoFar > 0 && <Pill tone="mango">{aiSoFar} AI chars</Pill>}
        </div>
      </div>
      <input type="range" min={0} max={total} step={1} value={cursor} onChange={(e) => { setCursor(Number(e.target.value)); setPlaying(false) }} className="w-full" aria-label="Scrub the writing session" />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* chart */}
        <div className="lg:col-span-3">
          <div className="text-[11px] uppercase tracking-wide font-semibold text-charcoal-400 mb-1">Characters in the editor over time</div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <defs><linearGradient id="charsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BRAND.mango} stopOpacity={0.35} /><stop offset="100%" stopColor={BRAND.mango} stopOpacity={0.02} /></linearGradient></defs>
                <XAxis dataKey="t" type="number" domain={[0, total]} tickFormatter={fmtTime} tick={axisStyle} axisLine={false} tickLine={false} ticks={[0, 300, 600, 900, 1200, total].filter((v, i, a) => v <= total && a.indexOf(v) === i)} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip render={(p, l) => [{ name: 'Characters', value: p[0].value.toLocaleString() }]} />} labelFormatter={(t) => `at ${fmtTime(t)}`} />
                <Area type="stepAfter" dataKey="chars" stroke={BRAND.mango} strokeWidth={2} fill="url(#charsFill)" isAnimationActive={false} />
                {markers.map((m, i) => <ReferenceDot key={i} x={m.t} y={m.charsAfter} r={m.type === 'snapshot' ? 6 : 5} fill={m.type === 'snapshot' ? BRAND.charcoal : m.type === 'paste' ? BRAND.info : BRAND.mango} stroke="#fff" strokeWidth={2} />)}
                <ReferenceLine x={cursor} stroke={BRAND.charcoal} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-charcoal-400 mt-1">
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND.charcoal }} /> Draft saved</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND.mango }} /> AI prompt / insert</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND.info }} /> Paste</span>
          </div>
          {/* reconstructed text bar */}
          <div className="mt-4 rounded-2xl bg-cloud p-4">
            <div className="flex items-center justify-between text-xs mb-2"><span className="font-semibold text-charcoal-500">Reconstructed draft length</span><span className="text-charcoal-400">{Math.round(charsNow / 5.1)} words · {draftNow}</span></div>
            <div className="h-3 rounded-full bg-charcoal-100 overflow-hidden flex">
              <div className="h-full bg-charcoal transition-all duration-150" style={{ width: `${Math.max(0, ((charsNow - aiSoFar) / (points[points.length - 1].chars || 1)) * 100)}%` }} />
              <div className="h-full bg-mango transition-all duration-150" style={{ width: `${(aiSoFar / (points[points.length - 1].chars || 1)) * 100}%` }} />
            </div>
            <div className="text-[11px] text-charcoal-400 mt-1.5">{current ? describe(current, first) : `${first} opened the editor.`}</div>
          </div>
        </div>

        {/* event feed */}
        <div className="lg:col-span-2">
          <div className="text-[11px] uppercase tracking-wide font-semibold text-charcoal-400 mb-1">Event feed</div>
          <div ref={feedRef} className="relative max-h-[360px] overflow-y-auto pr-1 space-y-1.5">
            {events.map((e, i) => {
              const m = EVENT_META[e.type]
              const reached = e.t <= cursor
              const isCurrent = current && current.t === e.t && current.type === e.type
              return (
                <div key={i} data-current={isCurrent ? 'true' : undefined} onClick={() => { setCursor(e.t); setPlaying(false) }} className={cx('flex items-start gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer transition-all border', isCurrent ? 'border-mango bg-mango-50/60' : 'border-transparent hover:bg-cloud', !reached && 'opacity-35')}>
                  <span className={cx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', m.cls)}><m.icon size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs"><span className="font-bold text-charcoal">{e.type === 'snapshot' ? e.label : m.label}{e.chars != null && e.type !== 'snapshot' ? ` · ${e.chars} chars` : ''}{e.seconds ? ` · ${e.seconds}s` : ''}</span><span className="font-mono text-charcoal-400 tabular-nums">{fmtTime(e.t)}</span></div>
                    {e.note && <div className="text-[11px] text-charcoal-400">{e.note}</div>}
                    {e.text && e.type !== 'ai_insert' && <div className="text-[11px] text-charcoal-500 italic truncate">“{e.text}”</div>}
                    {e.type === 'ai_insert' && <div className="text-[11px] text-charcoal-700 bg-mango-100 rounded-lg px-2 py-1 mt-1">{e.text}</div>}
                    {e.type === 'ai_prompt' && <div className="mt-1 space-y-1"><div className="text-[11px] text-charcoal-700"><span className="font-bold">{first}:</span> {e.prompt}</div><div className="text-[11px] text-charcoal-500"><span className="font-bold">BOLT:</span> {e.reply}</div></div>}
                    {e.source && <div className="text-[11px] text-charcoal-400">source: {e.source}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function describe(e, first) {
  switch (e.type) {
    case 'type': return `${first} typed ${e.chars} characters${e.note ? ` — ${e.note.toLowerCase()}` : ''}.`
    case 'delete': return `${first} deleted ${e.chars} characters${e.note ? ` — ${e.note.toLowerCase()}` : ''}.`
    case 'paste': return `${first} pasted ${e.chars} characters from ${e.source || 'the clipboard'}.`
    case 'pause': return `${first} paused for ${e.seconds}s${e.note ? ` — ${e.note.toLowerCase()}` : ''}.`
    case 'ai_prompt': return `${first} asked the AI: “${e.prompt}”`
    case 'ai_insert': return `${first} inserted ${e.chars} characters from the AI reply (highlighted in mango).`
    case 'snapshot': return e.label === 'Started' ? `${first} opened the editor.` : `${first} saved “${e.label}” at ${e.chars} characters.`
    default: return ''
  }
}
