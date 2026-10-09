import { useState } from 'react'
import { Music, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '../../ui'
import { cx } from '../../../lib/utils'

const DEVICES = [
  { id: 'alliteration', name: 'Alliteration', color: '#FF9900', tip: 'Repeated first consonant sounds in nearby words.' },
  { id: 'rhyme', name: 'End rhyme', color: '#5B7CFA', tip: 'Line-ending words that share a sound.' },
  { id: 'simile', name: 'Simile', color: '#2FA36B', tip: 'A comparison using like or as.' },
  { id: 'personification', name: 'Personification', color: '#E255A1', tip: 'Giving human actions to non-human things.' },
  { id: 'imagery', name: 'Visual imagery', color: '#8B5CF6', tip: 'A word that paints a picture.' },
]

// Tennyson, "The Eagle" (1851). Each word may accept one or more devices.
const LINES = [
  [['He'], ['clasps', ['alliteration']], ['the'], ['crag', ['alliteration', 'imagery']], ['with'], ['crooked', ['alliteration']], ['hands;', ['rhyme', 'personification']]],
  [['Close', ['alliteration']], ['to'], ['the'], ['sun', ['imagery']], ['in'], ['lonely', ['alliteration', 'personification']], ['lands,', ['alliteration', 'rhyme']]],
  [['Ring’d', ['imagery']], ['with'], ['the'], ['azure', ['imagery']], ['world,'], ['he'], ['stands.', ['rhyme']]],
  [['The'], ['wrinkled', ['personification', 'imagery']], ['sea'], ['beneath'], ['him'], ['crawls;', ['personification', 'rhyme']]],
  [['He'], ['watches', ['alliteration']], ['from'], ['his'], ['mountain'], ['walls,', ['alliteration', 'rhyme']]],
  [['And'], ['like', ['simile']], ['a'], ['thunderbolt', ['simile', 'imagery']], ['he'], ['falls.', ['rhyme']]],
]
const TARGET = LINES.flat().filter((w) => w[1]).length // taggable words

/** Click a word, choose a device. A local answer key scores precision and recall. */
export default function PoemLab({ onResult }) {
  const [tags, setTags] = useState({}) // "li-wi" → deviceId
  const [active, setActive] = useState(null)
  const [checked, setChecked] = useState(false)

  const key = (li, wi) => `${li}-${wi}`
  const tagWord = (deviceId) => { if (!active) return; setTags({ ...tags, [active]: deviceId }); setActive(null); setChecked(false) }
  const untag = () => { if (!active) return; const n = { ...tags }; delete n[active]; setTags(n); setActive(null); setChecked(false) }

  const entries = Object.entries(tags)
  const correct = entries.filter(([k, d]) => { const [li, wi] = k.split('-').map(Number); return LINES[li][wi][1]?.includes(d) }).length
  const wrong = entries.length - correct
  const score = Math.max(0, Math.min(100, Math.round(((correct - wrong * 0.5) / Math.min(TARGET, 14)) * 100)))
  const check = () => { setChecked(true); onResult?.({ score, correct, wrong }) }
  const dev = (id) => DEVICES.find((d) => d.id === id)

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-charcoal">Poem lab: “The Eagle” by Alfred, Lord Tennyson</h3>
        <p className="text-sm text-charcoal-400 mt-1">Six lines, every word pulling weight. Click a word, then choose the device it carries. Tag at least a dozen; wrong tags cost half a point — the exam rewards precision, not quantity.</p>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="rounded-2xl bg-[#FBF7EF] border border-charcoal-100 p-6 md:p-8 font-serif">
          {LINES.map((line, li) => (
            <div key={li} className={cx('flex flex-wrap gap-x-2 gap-y-2 text-xl md:text-2xl leading-relaxed text-charcoal', li === 3 && 'mt-5')}>
              {line.map(([w, accepts], wi) => {
                const k = key(li, wi), d = tags[k] && dev(tags[k])
                const isRight = checked && d && accepts?.includes(d.id)
                const isWrong = checked && d && !accepts?.includes(d.id)
                return (
                  <button key={k} type="button" onClick={() => setActive(active === k ? null : k)}
                    className={cx('rounded-md px-1 -mx-0.5 transition-all border-b-[3px]', active === k ? 'bg-mango-100 border-mango' : 'border-transparent hover:bg-white', isWrong && 'line-through decoration-danger')}
                    style={d ? { borderBottomColor: d.color, background: `${d.color}22` } : undefined}>
                    {w}{isRight && <span className="text-success text-xs align-super ml-0.5">✓</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">{active ? 'Tag this word as…' : 'Click a word first'}</div>
            <div className="space-y-1.5">
              {DEVICES.map((d) => (
                <button key={d.id} type="button" disabled={!active} onClick={() => tagWord(d.id)} className="w-full flex items-center gap-2 text-left rounded-xl border border-charcoal-100 px-3 py-2 text-sm hover:border-charcoal-300 disabled:opacity-40 transition-all">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                  <span><span className="font-semibold text-charcoal">{d.name}</span><span className="block text-[11px] text-charcoal-400">{d.tip}</span></span>
                </button>
              ))}
              {active && tags[active] && <button type="button" onClick={untag} className="w-full text-xs text-charcoal-400 hover:text-danger py-1">Remove tag</button>}
            </div>
          </div>
          <div className="card p-4 text-xs text-charcoal-400 space-y-1">
            <div className="flex justify-between"><span>Tags placed</span><span className="font-bold text-charcoal">{entries.length}</span></div>
            {checked && <><div className="flex justify-between"><span>Correct</span><span className="font-bold text-success">{correct}</span></div><div className="flex justify-between"><span>Wrong</span><span className="font-bold text-danger">{wrong}</span></div></>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mango-50 border border-mango-200 p-4">
        <div className="text-sm text-charcoal"><Music size={16} className="inline mr-1.5 text-mango" />{checked ? <>Score <span className="font-extrabold">{score}/100</span> — the poem’s music comes from clasps/crag/crooked, the a-a-a / b-b-b rhyme, the sea that crawls and the eagle that falls like a thunderbolt.</> : 'Sound devices are the first thing to name in an unseen-poem answer.'}</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setTags({}); setChecked(false); setActive(null) }}><RotateCcw size={14} /> Reset</Button>
          <Button onClick={check} disabled={entries.length === 0}><CheckCircle2 size={16} /> {checked ? 'Re-check' : 'Check my tags'}</Button>
        </div>
      </div>
    </div>
  )
}
