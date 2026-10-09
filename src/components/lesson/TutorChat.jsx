import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, Clock } from 'lucide-react'
import { Button } from '../ui'
import { useData } from '../../lib/data'
import { ask, aiEnabled } from '../../lib/ai'
import { fmtTime, cx } from '../../lib/utils'

const QUICK = ['Explain this part simply', 'Give me a real-life example', 'Why does this matter for the exam?']

/* One real-life example per lesson for the demo fallback. */
const EXAMPLES = {
  'math-12-l1': 'a pizza cut into thin rings: each ring is almost a straight strip, and stacking the strips gives a triangle whose area is exactly πr²',
  'math-12-l2': 'a delivery scooter: your average speed over a trip is distance ÷ time, but the speedometer shows the slope of the distance graph at this instant',
  'math-12-l3': 'widening a square courtyard by a few centimetres: the two new strips are 2x·dx and the tiny corner tile does not matter',
  'math-12-l4': 'a manoushe stand raising prices while selling fewer: revenue changes by (price change × units) + (price × units change)',
  'math-12-l5': 'a phone sensor that cannot read exactly zero but whose readings clearly head toward 1 as the angle shrinks',
  'math-12-l6': 'reading a car’s speedometer every second and adding up speed × 1 s to rebuild how far it went',
  'math-12-l7': 'a weather app’s “average temperature today”: area under the temperature curve divided by 24 hours',
  'phy-12-l1': 'a dash-cam log of a car leaving a toll booth: the position graph curves, the velocity graph is a straight line whose slope is the acceleration',
  'phy-12-l2': 'dropping your phone from a balcony: speed grows by 9.8 m/s every second, distance by more and more each second',
  'phy-12-l3': 'pushing a loaded supermarket cart: nothing moves until your push beats friction, and then a = (F − friction)/m',
  'phy-12-l4': 'the Tayouneh roundabout: constant speed but you lean toward the door because your velocity keeps changing direction',
  'phy-12-l5': 'the ISS at 7.7 km/s: it is falling toward Earth all the time and keeps missing — that is an orbit',
  'phy-12-l6': 'a roller coaster at Luna Park: height becomes speed at the bottom, v = √(2gh), and friction skims some off as heat',
  'phy-12-l7': 'a car crash with crumple zones: momentum is conserved whatever happens, but the kinetic energy that disappears is what the crumple zone absorbed',
  'eng-12-l1': 'instead of “the courtyard was cold”, write “breath hung over the gate and the football rang like a bell” — the reader feels cold without being told',
  'eng-12-l2': 'a phone advert: the doctor in a white coat is ethos, the battery statistics are logos, the smiling family is pathos',
  'eng-12-l3': '“the implementation of the policy was undertaken” → “the principal implemented the policy” — find the hidden verb and the human',
  'eng-12-l4': 'Hughes’ raisin in the sun: an abstract dream gets a body you can see shrivel',
  'eng-12-l5': 'Katniss volunteering at the Reaping: the call to adventure she cannot refuse — the same beat as Frodo taking the ring',
  'eng-12-l6': 'decide one rule for your Beirut of 2036 — say nobody may own the hour between 6 and 7 pm — and every scene writes itself around it',
  'eng-12-l7': 'Tennyson’s eagle “clasps the crag with crooked hands”: the hard c-sounds are the music, the hands are the image',
}
const EXAM = {
  'math-12': 'Exam questions ask you to compute a rate, a slope or an area and then interpret it in words. The marks are split: method, number, meaning.',
  'phy-12': 'Mechanics questions give you a real situation and expect a diagram, the governing law, the algebra and a sanity check of the units.',
  'eng-12': 'In the writing paper, examiners reward precise choices you can justify — a thesis you can defend, a detail that does work, a device you can name.',
}

export function matchTopic(lesson, text) {
  const q = text.toLowerCase()
  let best = lesson.topics[0], bestScore = 0
  lesson.topics.forEach((t) => {
    const words = `${t.name} ${t.id.replace(/-/g, ' ')}`.toLowerCase().split(/[^a-z0-9’']+/).filter((w) => w.length > 3)
    const score = words.reduce((a, w) => a + (q.includes(w) ? 1 : 0), 0)
    if (score > bestScore) { best = t; bestScore = score }
  })
  return best
}

function nearestSegment(transcript, t) {
  if (!transcript?.length) return null
  return transcript.reduce((acc, seg) => (Math.abs(seg.t - t) < Math.abs(acc.t - t) ? seg : acc), transcript[0])
}

function fallbackAnswer({ lesson, course, question, t, n }) {
  const seg = nearestSegment(lesson.transcript, t)
  const topic = matchTopic(lesson, question)
  const q = question.toLowerCase()
  const example = EXAMPLES[lesson.id] || lesson.summary
  const at = fmtTime(seg?.t ?? t)
  if (/example|real/.test(q)) return `At **${at}** the video is on: “${seg?.text}”\n\n**Real-life version:** think of ${example}.\n\n**Try this:** describe the same situation with a different object from your own day — if the idea still works, you own it.`
  if (/exam|test|marks|grade/.test(q)) return `This part (around **${at}**: “${seg?.text}”) is about **${topic.name}**.\n\n**Why it matters for the exam:** ${EXAM[course.id]}\n\n**Try this:** write the one-line definition of ${topic.name.toLowerCase()} from memory, then check it against the transcript line.`
  const templates = [
    `At **${at}** the video is explaining: “${seg?.text}”\n\n**Here’s the idea in one line:** ${lesson.summary}\n\n**Try this:** pause, and say out loud what changes if you make the quantity in this step ten times smaller.`,
    `Good question — you’re at **${at}**, where the key line is: “${seg?.text}”\n\n**Plain words:** this is about ${topic.name.toLowerCase()}. Picture ${example}.\n\n**Try this:** jump back 60 seconds in the transcript and watch how the idea was set up.`,
    `Let me anchor this to the video. Around **${at}**: “${seg?.text}”\n\n**What to hold on to:** ${topic.name} is the concept being built here; everything after this point depends on it.\n\n**Try this:** open the interactive below and change one slider — then come back and tell me what moved.`,
    `You’re not alone: this is one of the most-asked spots in the class (around **${at}**).\n\n“${seg?.text}”\n\n**In one sentence:** ${lesson.summary}\n\n**Try this:** explain it to me in your own words and I’ll tell you what you got right.`,
  ]
  return templates[n % templates.length]
}

function Markdownish({ text }) {
  return text.split('\n').map((line, i) => (
    <p key={i} className={cx(line === '' && 'h-2')}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith('**') && part.endsWith('**') ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong> : part))}
    </p>
  ))
}

/** Right-column tutor that knows the lesson transcript and where the student is in the video. */
export default function TutorChat({ lesson, course, currentTime, studentId }) {
  const { addChatMessage } = useData()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)
  const seg = useMemo(() => nearestSegment(lesson.transcript, currentTime), [lesson, currentTime])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, busy])
  useEffect(() => { setMessages([]) }, [lesson.id])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setInput(''); setBusy(true)
    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    const t = Math.round(currentTime)
    const topic = matchTopic(lesson, content)
    addChatMessage({ student_id: studentId, lesson_id: lesson.id, content, video_t: t, topic: topic.id })
    const system = `You are tutoring on the lesson "${lesson.title}" in the course "${course.title}".
Lesson summary: ${lesson.summary}
Full transcript (seconds → text):
${lesson.transcript.map((s) => `${s.t}s: ${s.text}`).join('\n')}
The student is currently at ${t}s (${fmtTime(t)}). The transcript segment nearest that moment is: "${seg?.text}".
Answer in 3–6 short lines. Anchor your answer to what the video is saying at that moment. Use **bold** for the key phrase. End with one small "Try this:" action.`
    const n = messages.filter((m) => m.role === 'user').length
    if (!aiEnabled) await new Promise((r) => setTimeout(r, 500 + Math.random() * 400))
    const reply = await ask({ system, messages: history.map((m) => ({ role: m.role, content: m.content })), fallback: () => fallbackAnswer({ lesson, course, question: content, t, n }), maxTokens: 500 })
    setMessages([...history, { role: 'assistant', content: reply }])
    setBusy(false)
  }

  return (
    <div className="card flex flex-col h-full min-h-[560px]">
      <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-charcoal text-white flex items-center justify-center shrink-0"><Sparkles size={18} className="text-mango" /></div>
          <div className="min-w-0"><div className="font-extrabold text-charcoal leading-tight">BOLT Tutor</div><div className="text-xs text-charcoal-400 truncate">knows this video</div></div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-mango-50 text-mango-700 px-2.5 py-1 text-xs font-bold tabular-nums shrink-0"><Clock size={12} /> {fmtTime(currentTime)}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-cloud p-4 text-sm text-charcoal-500 leading-relaxed">
            <div className="font-hand text-mango text-xl leading-none mb-1">hi {''}</div>
            I’m following the video with you. Right now it’s saying: <span className="text-charcoal font-semibold">“{seg?.text}”</span>
            <div className="mt-2 text-xs text-charcoal-400">Ask anything — I’ll answer from the exact moment you’re at.</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', m.role === 'user' ? 'bg-mango text-white rounded-br-md' : 'bg-cloud text-charcoal rounded-bl-md')}>
              {m.role === 'user' ? m.content : <Markdownish text={m.content} />}
            </div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-xs text-charcoal-400 pl-1"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-mango animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}</span> re-watching {fmtTime(currentTime)}…</div>}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-charcoal-100">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK.map((q) => <button key={q} type="button" onClick={() => send(q)} disabled={busy} className="rounded-full border border-charcoal-200 bg-white px-3 py-1 text-xs font-semibold text-charcoal-500 hover:border-mango hover:text-mango-700 disabled:opacity-50 transition-colors">{q}</button>)}
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask about ${fmtTime(currentTime)}…`} className="flex-1 rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-300 focus:outline-none focus:border-mango focus:ring-4 focus:ring-mango/20" />
          <Button type="submit" disabled={!input.trim() || busy} aria-label="Send"><Send size={16} /></Button>
        </form>
      </div>
    </div>
  )
}
