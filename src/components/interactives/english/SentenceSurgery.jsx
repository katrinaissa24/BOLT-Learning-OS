import { useMemo, useState } from 'react'
import { Stethoscope, CheckCircle2 } from 'lucide-react'
import { Button, Textarea } from '../../ui'
import { C } from '../shared'

const ZOMBIE = /\b\w+(tion|sion|ity|ism|ment|ance|ence|ness)s?\b/gi
const HUMANS = /\b(i|we|you|they|he|she|students?|teachers?|writers?|readers?|people|parents?|the (class|team|committee|council|school|government|board|principal|coach|doctor|nurse|manager|mayor)|maya|omar|lina|karim|everyone|someone|citizens?|engineers?|doctors?|nurses?|scientists?|researchers?|drivers?|voters?|kids|children|staff|players?)\b/i

const SENTENCES = [
  { zombie: 'The implementation of the new attendance policy was undertaken by the administration.', hint: 'Who did what? Find the verb inside “implementation”.', model: 'The administration implemented the new attendance policy.' },
  { zombie: 'The proliferation of nominalizations in a discursive formation may be an indication of a tendency toward pomposity.', hint: 'Seven zombie nouns. Who is being pompous?', model: 'Writers who overload sentences with nominalizations sound pompous.' },
  { zombie: 'There was a failure of communication between the coach and the players regarding the cancellation of practice.', hint: 'Start with the coach.', model: 'The coach failed to tell the players that practice was cancelled.' },
  { zombie: 'The utilization of mobile phones by students during lessons is a cause of distraction.', hint: 'Students + an active verb.', model: 'Students who use their phones during lessons get distracted.' },
  { zombie: 'An investigation into the disappearance of the library books was conducted by the council.', hint: '“Investigation” hides “investigate”.', model: 'The council investigated who took the library books.' },
  { zombie: 'The expectation of the committee is the submission of all applications before the expiration of the deadline.', hint: 'Say it like you would to a friend.', model: 'The committee expects everyone to apply before the deadline.' },
]

const countZombies = (s) => (s.match(ZOMBIE) || []).length
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length

/** Score one rewrite 0–100: fewer zombie nouns (60), a human/concrete subject (30), shorter (10). */
export function scoreRewrite(original, rewrite) {
  if (!rewrite || words(rewrite) < 3) return { score: 0, zombies: null, human: false, shorter: false }
  const z0 = countZombies(original), z1 = countZombies(rewrite)
  const zombieScore = z0 === 0 ? 60 : Math.round(60 * Math.max(0, (z0 - z1) / z0))
  const human = HUMANS.test(rewrite.split(/\s+/).slice(0, 5).join(' '))
  const shorter = words(rewrite) < words(original)
  return { score: Math.min(100, zombieScore + (human ? 30 : 0) + (shorter ? 10 : 0)), zombies: z1, human, shorter }
}

/** Six zombie-noun sentences; the student operates. A local checker rewards living verbs and human subjects. */
export default function SentenceSurgery({ onResult }) {
  const [drafts, setDrafts] = useState(() => SENTENCES.map(() => ''))
  const [checked, setChecked] = useState(false)
  const results = useMemo(() => SENTENCES.map((s, i) => scoreRewrite(s.zombie, drafts[i])), [drafts])
  const total = Math.round(results.reduce((a, r) => a + r.score, 0) / SENTENCES.length)
  const done = drafts.filter((d) => words(d) >= 3).length

  const check = () => { setChecked(true); onResult?.({ score: total, completed: done }) }

  const isZombie = (w) => /^\w+(tion|sion|ity|ism|ment|ance|ence|ness)s?$/i.test(w)
  const highlight = (s) => s.split(/(\b\w+(?:tion|sion|ity|ism|ment|ance|ence|ness)s?\b)/gi).map((part, i) => (isZombie(part) ? <mark key={i} className="bg-danger-soft text-danger rounded px-0.5 font-semibold">{part}</mark> : part))

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-charcoal">Sentence surgery</h3>
        <p className="text-sm text-charcoal-400 mt-1">Six sentences from real school emails and essays, each infected with zombie nouns (highlighted). Rewrite each one with a human subject and a verb that does something.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {SENTENCES.map((s, i) => {
          const r = results[i]
          return (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-charcoal text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <p className="text-sm text-charcoal leading-relaxed">{highlight(s.zombie)}</p>
              </div>
              <Textarea rows={2} placeholder={s.hint} value={drafts[i]} onChange={(e) => { const d = [...drafts]; d[i] = e.target.value; setDrafts(d); setChecked(false) }} />
              {checked && (
                <div className="text-xs rounded-xl bg-cloud p-3 space-y-1">
                  <div className="flex items-center justify-between"><span className="font-semibold text-charcoal-500">Surgery score</span><span className="font-extrabold" style={{ color: r.score >= 70 ? C.success : r.score >= 40 ? C.mango : C.danger }}>{r.score}/100</span></div>
                  <div className="flex flex-wrap gap-1.5">
                    <Tag ok={r.zombies === 0}>{r.zombies == null ? 'no rewrite' : r.zombies === 0 ? 'no zombie nouns' : `${r.zombies} zombie noun${r.zombies > 1 ? 's' : ''} left`}</Tag>
                    <Tag ok={r.human}>{r.human ? 'human subject' : 'who is acting?'}</Tag>
                    <Tag ok={r.shorter}>{r.shorter ? 'shorter' : 'could be tighter'}</Tag>
                  </div>
                  <div className="text-charcoal-400 pt-1"><span className="font-semibold text-charcoal-500">One way: </span>{s.model}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mango-50 border border-mango-200 p-4">
        <div className="text-sm text-charcoal"><Stethoscope size={16} className="inline mr-1.5 text-mango" />{done}/{SENTENCES.length} rewritten{checked && <> · overall <span className="font-extrabold">{total}/100</span></>}</div>
        <Button onClick={check} disabled={done === 0}><CheckCircle2 size={16} /> {checked ? 'Re-check' : 'Check my rewrites'}</Button>
      </div>
    </div>
  )
}

function Tag({ ok, children }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ok ? 'bg-success-soft text-success' : 'bg-charcoal-100 text-charcoal-400'}`}>{children}</span>
}
