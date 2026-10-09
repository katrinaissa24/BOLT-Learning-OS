import { useState } from 'react'
import { Avatar } from '../ui'
import { fmtTime } from '../../lib/utils'
import { profileById } from '../../lib/selectors'

/**
 * Horizontal video timeline (0..duration) with stuck-point markers sized by question count.
 * Hover a marker → transcript at that minute + the questions asked there.
 */
export default function VideoTimeline({ db, insights }) {
  const [hover, setHover] = useState(null)
  const { lesson, stuckPoints, questions } = insights
  const duration = lesson.duration_min * 60
  const maxCount = Math.max(1, ...stuckPoints.map((s) => s.count))
  const pct = (t) => `${Math.min(100, (t / duration) * 100)}%`
  const chapters = lesson.transcript

  return (
    <div>
      <div className="relative h-24 select-none">
        {/* transcript chapter ticks */}
        <div className="absolute left-0 right-0 top-12 h-3 rounded-full bg-charcoal-100 overflow-hidden">
          {chapters.map((c, i) => <div key={i} className="absolute top-0 bottom-0 w-px bg-charcoal-200" style={{ left: pct(c.t) }} />)}
          {stuckPoints.map((s) => <div key={s.t} className="absolute top-0 bottom-0 bg-mango/40" style={{ left: pct(s.t), width: pct(60) }} />)}
        </div>
        {/* markers */}
        {stuckPoints.map((s) => {
          const size = 18 + (s.count / maxCount) * 22
          const hot = s.count >= 3
          return (
            <button key={s.t} type="button" onMouseEnter={() => setHover(s)} onFocus={() => setHover(s)} onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}
              className="absolute -translate-x-1/2 rounded-full text-white font-extrabold text-xs flex items-center justify-center shadow-soft transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-mango/30"
              style={{ left: pct(s.t + 30), top: 54 - size / 2, width: size, height: size, background: hot ? '#E0493B' : '#FF9900', zIndex: hover?.t === s.t ? 2 : 1 }}
              aria-label={`${s.count} questions at ${fmtTime(s.t)}`}>
              {s.count}
            </button>
          )
        })}
        {/* time labels */}
        <div className="absolute left-0 right-0 top-[74px] flex justify-between text-[11px] text-charcoal-400 font-semibold">
          <span>0:00</span><span>{fmtTime(duration / 2)}</span><span>{fmtTime(duration)}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-cloud p-4 min-h-[112px] transition-colors">
        {hover ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-charcoal-400">In the video at {fmtTime(hover.t)}–{fmtTime(hover.t + 60)}</div>
              <p className="text-sm text-charcoal mt-1 italic">“{hover.transcript || chapters.filter((c) => c.t <= hover.t).slice(-1)[0]?.text}”</p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-charcoal-400">{hover.count} question{hover.count > 1 ? 's' : ''} asked here</div>
              <ul className="mt-1 space-y-1.5">
                {questions.filter((qm) => Math.floor((qm.video_t || 0) / 60) * 60 === hover.t).map((qm) => {
                  const st = profileById(db, qm.student_id)
                  return <li key={qm.id} className="flex items-start gap-2 text-sm text-charcoal"><Avatar name={st?.full_name || ''} size="xs" className="mt-0.5" /><span>“{qm.content}”</span></li>
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-sm text-charcoal-400 flex items-center h-full">Hover a marker to read the transcript at that minute and the exact questions students asked. Red markers are where 3+ students got stuck.</div>
        )}
      </div>
    </div>
  )
}
