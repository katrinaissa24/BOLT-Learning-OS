import { useState } from 'react'
import { Map, CheckCircle2, RotateCcw, X } from 'lucide-react'
import { Button } from '../../ui'
import { cx } from '../../../lib/utils'

const STAGES = [
  { id: 'ordinary', name: 'Ordinary World', blurb: 'Life before the story disturbs it.' },
  { id: 'call', name: 'Call to Adventure', blurb: 'Something demands a response.' },
  { id: 'refusal', name: 'Refusal / Reluctance', blurb: 'Fear, doubt or a reason to stay.' },
  { id: 'mentor', name: 'Meeting the Mentor', blurb: 'Guidance, tools or a push.' },
  { id: 'threshold', name: 'Crossing the Threshold', blurb: 'No way back now.' },
  { id: 'trials', name: 'Tests, Allies, Enemies', blurb: 'Learning the rules of the new world.' },
  { id: 'ordeal', name: 'The Ordeal', blurb: 'The crisis: facing death or the deepest fear.' },
  { id: 'return', name: 'Return, Changed', blurb: 'Back home with something new — and a cost.' },
]

const BEATS = [
  { id: 'b1', text: 'Katniss hunts illegally in the woods of District 12 to feed her mother and Prim.', stage: 'ordinary' },
  { id: 'b2', text: 'At the Reaping, Prim’s name is drawn — Katniss volunteers to take her place.', stage: 'call' },
  { id: 'b3', text: 'On the train she doubts she can win and refuses to plan with Peeta, keeping everyone at a distance.', stage: 'refusal' },
  { id: 'b4', text: 'Haymitch sobers up and teaches her how to win sponsors; Cinna gives her the “girl on fire” dress.', stage: 'mentor' },
  { id: 'b5', text: 'The tube lifts her into the arena. The gong sounds. The Games begin.', stage: 'threshold' },
  { id: 'b6', text: 'She survives the fire, allies with Rue, and destroys the Careers’ supplies.', stage: 'trials' },
  { id: 'b7', text: 'The rule change is revoked: she and Peeta hold out the nightlock berries, ready to die together.', stage: 'ordeal' },
  { id: 'b8', text: 'Both are crowned victors, but Katniss returns to District 12 as a threat to the Capitol — and must pretend to be in love.', stage: 'return' },
]

/** Click a beat, then click a stage to place it. A local check scores the map. */
export default function StoryMapper({ onResult }) {
  const [placed, setPlaced] = useState({}) // stageId → beatId
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)

  const beatStage = (beatId) => Object.entries(placed).find(([, b]) => b === beatId)?.[0]
  const unplaced = BEATS.filter((b) => !beatStage(b.id))

  const place = (stageId) => {
    if (!selected) return
    const next = { ...placed }
    const prevStage = beatStage(selected)
    if (prevStage) delete next[prevStage]
    next[stageId] = selected
    setPlaced(next); setSelected(null); setChecked(false)
  }
  const remove = (stageId) => { const next = { ...placed }; delete next[stageId]; setPlaced(next); setChecked(false) }

  const correct = STAGES.filter((s) => placed[s.id] && BEATS.find((b) => b.id === placed[s.id]).stage === s.id).length
  const score = Math.round((correct / STAGES.length) * 100)
  const check = () => { setChecked(true); onResult?.({ score, correct }) }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-charcoal">Map The Hunger Games onto the Hero’s Journey</h3>
        <p className="text-sm text-charcoal-400 mt-1">Eight beats from Suzanne Collins’ novel are shuffled below. Click a beat, then click the stage where it belongs. Campbell’s cycle is the structure examiners expect you to recognise in any novel.</p>
      </div>
      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Story beats · {unplaced.length} left</div>
          {unplaced.length === 0 && <div className="rounded-xl bg-success-soft text-success text-sm font-semibold p-3">All beats placed — check your map.</div>}
          {unplaced.map((b) => (
            <button key={b.id} type="button" onClick={() => setSelected(selected === b.id ? null : b.id)} className={cx('w-full text-left rounded-xl border p-3 text-sm transition-all', selected === b.id ? 'border-mango bg-mango-50 ring-4 ring-mango/20' : 'border-charcoal-100 bg-white hover:border-charcoal-300')}>{b.text}</button>
          ))}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-2">The Hero’s Journey {selected && <span className="text-mango normal-case tracking-normal">· click a stage to place the beat</span>}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {STAGES.map((s, i) => {
              const beat = BEATS.find((b) => b.id === placed[s.id])
              const ok = checked && beat && beat.stage === s.id
              const bad = checked && beat && beat.stage !== s.id
              return (
                <div key={s.id} role="button" tabIndex={0} onClick={() => place(s.id)} onKeyDown={(e) => e.key === 'Enter' && place(s.id)}
                  className={cx('rounded-2xl border p-3 min-h-[104px] transition-all', selected ? 'cursor-pointer border-dashed border-mango bg-mango-50/40 hover:bg-mango-50' : 'border-charcoal-100 bg-white', ok && 'border-success bg-success-soft', bad && 'border-danger bg-danger-soft')}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-charcoal text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="font-bold text-sm text-charcoal">{s.name}</div>
                  </div>
                  {beat ? (
                    <div className="mt-2 flex items-start gap-2 text-xs text-charcoal">
                      <span className="flex-1 leading-relaxed">{beat.text}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); remove(s.id) }} className="p-1 rounded-full hover:bg-white/70 text-charcoal-400" aria-label="Remove"><X size={12} /></button>
                    </div>
                  ) : <div className="mt-2 text-xs text-charcoal-300 italic">{s.blurb}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mango-50 border border-mango-200 p-4">
        <div className="text-sm text-charcoal"><Map size={16} className="inline mr-1.5 text-mango" />{Object.keys(placed).length}/8 placed{checked && <> · <span className="font-extrabold">{correct}/8 correct · {score}/100</span></>}</div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setPlaced({}); setChecked(false); setSelected(null) }}><RotateCcw size={14} /> Reset</Button>
          <Button onClick={check} disabled={Object.keys(placed).length === 0}><CheckCircle2 size={16} /> {checked ? 'Re-check' : 'Check my map'}</Button>
        </div>
      </div>
    </div>
  )
}
