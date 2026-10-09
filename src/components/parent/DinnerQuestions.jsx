import { useEffect, useState } from 'react'
import { Utensils, RefreshCcw, Sparkles } from 'lucide-react'
import { Button, Spinner, SuggestedTag } from '../ui'
import { ask, aiEnabled } from '../../lib/ai'
import { courseById, lessonById } from '../../lib/selectors'

/** Lessons worth asking about: ones with a weak topic, the strongest recent one, and the upcoming checkpoint. */
function recentLessons(db, childId) {
  const rows = db.lessonProgress.filter((p) => p.student_id === childId).map((p) => ({ progress: p, lesson: lessonById(db, p.lesson_id) })).filter((r) => r.lesson)
  const weak = rows.filter((r) => Object.values(r.progress.topic_scores || {}).some((v) => v < 60)).sort((a, b) => Math.min(...Object.values(a.progress.topic_scores)) - Math.min(...Object.values(b.progress.topic_scores)))
  const strong = rows.filter((r) => r.progress.status === 'completed' && r.progress.score >= 85).sort((a, b) => (b.progress.completed_at || '').localeCompare(a.progress.completed_at || ''))
  const next = rows.filter((r) => r.progress.status === 'in-progress')
  const out = []
  const push = (r) => { if (r && !out.some((o) => o.lesson.id === r.lesson.id)) out.push(r) }
  push(weak[0]); push(strong[0]); push(next[0]); push(weak[1]); push(next[1]); push(strong[1]); push(next[2])
  return out
}

/** Content-specific demo questions keyed by lesson id; generic ones fill the gaps. */
const DEMO = {
  'math-12-l5': { q: 'Your calculus lesson this week was about limits. If I keep walking halfway to the wall, do I ever reach it? What does “approach” mean?', why: 'Limits as approach — she scored 89% on this, so she gets to shine.', tip: 'Let her draw it on a napkin.' },
  'math-12-l4': { q: 'Why do you multiply by the “inside” derivative in the chain rule? Can you show me with the speed of a car going up a hill?', why: 'Chain rule is at 44% — explaining it to you is the best re-check there is.', tip: 'If she gets stuck, that’s useful information, not failure.' },
  'math-12-l6': { q: 'Your next checkpoint is integration. If you know how fast a car was going every second, how would you work out how far it went?', why: 'Primes the next lesson: area under a graph = distance.', tip: 'No right answer needed; curiosity is the goal.' },
  'phy-12-l4': { q: 'When a car goes round a roundabout at a steady speed, is it accelerating? Why do you feel pushed outwards?', why: 'Centripetal acceleration is at 35%. This is the exact confusion she asked the tutor about.', tip: 'Spin a cup of water on a string if you dare.' },
  'phy-12-l5': { q: 'Why doesn’t the Moon fall down? And why do astronauts float if gravity is still there?', why: 'Her next physics checkpoint — Newtonian gravity.', tip: 'Her lesson summary literally says “why astronauts float”.' },
  'eng-12-l6': { q: 'You built a fictional world this week — what is one rule in it that can never be broken, and what would happen if it were?', why: 'She scored 92% on this. Let her be the expert at the table.', tip: 'Ask a follow-up “what if”.' },
  'eng-12-l7': { q: 'What makes a text a poem and not just short sentences? Does it have to rhyme?', why: 'Her next English checkpoint — unseen poem analysis.', tip: 'Read a few lines of Darwish or Gibran together.' },
  'eng-12-l5': { q: 'Which character in a film we watched goes through a “hero’s journey”? What is their lowest moment?', why: 'Narrative structure — 94%. A win to celebrate.', tip: 'Pick a film she loves.' },
}
const GENERIC = [
  { q: 'What is one thing you learned this week that surprised you?', why: 'Open, low-pressure, and tells you where her attention is.', tip: 'Then ask “why did it surprise you?”' },
  { q: 'Which stamp in your passport are you closest to earning? What’s left?', why: 'Points her at proof, not marks.', tip: 'The Comeback stamp is within reach for chain rule.' },
  { q: 'If you had to teach me one idea from this week in two minutes, which one would you pick?', why: 'Teaching is the strongest re-check of understanding.', tip: 'Time her. Make it fun.' },
]

export default function DinnerQuestions({ db, childId, firstName }) {
  const lessons = recentLessons(db, childId)
  const [state, setState] = useState({ loading: true, items: [] })
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ loading: true, items: [] })
    const fallback = () => {
      const picked = lessons.map((r) => ({ lesson: r.lesson, ...(DEMO[r.lesson.id] || null) })).filter((x) => x.q)
      // ensure one weak-topic question, one strong-topic win, one "next" — then pad with generic
      const out = []
      const rot = (seed * 3) % Math.max(1, picked.length)
      const rotated = [...picked.slice(rot), ...picked.slice(0, rot)]
      rotated.forEach((p) => { if (out.length < 3) out.push(p) })
      GENERIC.forEach((g, i) => { if (out.length < 3) out.push({ ...g, lesson: null, _i: i }) })
      return out.map((o) => ({ q: o.q, why: o.why, tip: o.tip, lessonTitle: o.lesson?.title || 'Any week', course: o.lesson ? courseById(db, o.lesson.course_id) : null }))
    }
    const run = async () => {
      const context = lessons.map((r) => `- ${r.lesson.title} (${courseById(db, r.lesson.course_id).subject}): ${r.lesson.summary}. Topic scores: ${Object.entries(r.progress.topic_scores || {}).map(([k, v]) => `${k}=${v}`).join(', ') || 'in progress'}`).join('\n')
      const text = await ask({
        system: 'You write three dinner-table questions a parent can ask their Grade 12 child tonight. The parent does not know the subject. Each question must be answerable out loud in a minute, tied to one lesson below, and framed so the child gets to explain. Prefer one question on a weak topic, one on a strength, one on the upcoming lesson. Return JSON: [{"q":"...","why":"one sentence for the parent","tip":"short tip","lessonTitle":"..."}]',
        messages: [{ role: 'user', content: `Child: ${firstName}. Recent lessons:\n${context}` }],
        fallback: '',
        maxTokens: 700,
      })
      let items = null
      try { const s = text.indexOf('['); items = JSON.parse(text.slice(s)) } catch { items = null }
      if (!Array.isArray(items) || items.length < 3) items = fallback()
      else items = items.slice(0, 3).map((i) => ({ ...i, course: lessons.find((r) => r.lesson.title === i.lessonTitle) ? courseById(db, lessons.find((r) => r.lesson.title === i.lessonTitle).lesson.course_id) : null }))
      if (!aiEnabled) await new Promise((r) => setTimeout(r, 500 + Math.random() * 400))
      if (alive) setState({ loading: false, items })
    }
    run()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, childId, db])

  return (
    <div className="rounded-[1.25rem] bg-charcoal text-white overflow-hidden relative shadow-soft">
      <div className="absolute inset-0 bolt-pattern-dark" />
      <div className="relative p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-mango text-white flex items-center justify-center"><Utensils size={18} /></div>
            <div>
              <div className="flex items-center gap-2"><h3 className="text-xl font-extrabold tracking-tight">Dinner-table questions</h3><SuggestedTag className="bg-white/15" /></div>
              <div className="text-sm text-white/60">Three questions for tonight, generated from {firstName}’s lessons this week. No subject knowledge required.</div>
            </div>
          </div>
          <Button size="sm" variant="soft" onClick={() => setSeed((s) => s + 1)} disabled={state.loading}><RefreshCcw size={14} /> New set</Button>
        </div>
        {state.loading ? (
          <div className="flex items-center gap-3 py-10 justify-center text-white/70 text-sm"><Spinner /> Reading this week’s lessons…</div>
        ) : (
          <ol className="grid md:grid-cols-3 gap-4">
            {state.items.map((it, i) => (
              <li key={i} className="rounded-2xl bg-white/10 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-mango text-white text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                  <span className="text-[11px] font-semibold text-white/60 truncate ml-2" title={it.lessonTitle}>{it.course ? it.course.subject + ' · ' : ''}{it.lessonTitle}</span>
                </div>
                <p className="font-hand text-2xl leading-snug text-white">“{it.q}”</p>
                <div className="mt-auto pt-4 text-xs text-white/70 leading-relaxed"><span className="font-bold text-mango">Why:</span> {it.why}</div>
                {it.tip && <div className="text-xs text-white/50 mt-1 inline-flex items-start gap-1"><Sparkles size={11} className="mt-0.5 shrink-0" />{it.tip}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
