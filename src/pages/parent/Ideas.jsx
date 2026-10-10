import { MessageSquare, Utensils, CalendarClock, Target, Languages, GraduationCap, BellRing, Star, Check } from 'lucide-react'
import { PageTitle, Card, SuggestedTag, Pill, Callout } from '../../components/ui'
import { parentIdeas } from '../../data/parentIdeas'
import { cx } from '../../lib/utils'

const ICONS = { 'message-square': MessageSquare, utensils: Utensils, 'calendar-clock': CalendarClock, target: Target, languages: Languages, 'graduation-cap': GraduationCap, 'bell-ring': BellRing }

function Mock({ mock }) {
  if (!mock) return null
  if (mock.kind === 'digest') return (
    <div className="rounded-2xl bg-success-soft/60 border border-success/20 p-3 text-xs space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-charcoal-400"><span className="font-bold text-success">BOLT · WhatsApp</span><span>Fri 17:00</span></div>
      {mock.lines.map((l, i) => <div key={i} className="rounded-xl bg-white px-3 py-2 text-charcoal shadow-sm">{l}</div>)}
    </div>
  )
  if (mock.kind === 'slots') return (
    <div className="grid grid-cols-4 gap-2">{mock.slots.map((s, i) => <div key={s} className={cx('rounded-xl px-2 py-2 text-center text-xs font-semibold border', i === mock.picked ? 'bg-mango text-white border-mango' : 'bg-white border-charcoal-200 text-charcoal-500')}>{s}</div>)}</div>
  )
  if (mock.kind === 'streak') return (
    <div>
      <div className="text-xs font-semibold text-charcoal mb-2">Goal: {mock.goal}</div>
      <div className="flex gap-2">{mock.weeks.map((w, i) => <div key={i} className={cx('flex-1 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold', w ? 'bg-mango text-white' : 'bg-charcoal-100 text-charcoal-300')}>{w ? <Check size={14} /> : 'W' + (i + 1)}</div>)}</div>
      <div className="text-[11px] text-charcoal-400 mt-2">3-week streak · best 3</div>
    </div>
  )
  if (mock.kind === 'translate') return (
    <div className="space-y-1.5 text-xs">{mock.lines.map((l, i) => <div key={i} dir={i === 1 ? 'rtl' : 'ltr'} className="rounded-xl bg-charcoal-50 px-3 py-2 text-charcoal">{l}</div>)}</div>
  )
  if (mock.kind === 'tutor') return (
    <div className="space-y-2">
      <div className="text-[11px] text-charcoal-400">Topic still below 50% after re-check: <span className="font-bold text-charcoal">{mock.topic}</span></div>
      {mock.tutors.map((t) => <div key={t.name} className="flex items-center justify-between rounded-xl border border-charcoal-100 px-3 py-2 text-xs"><div><div className="font-bold text-charcoal">{t.name}</div><div className="text-charcoal-400">{t.note}</div></div><span className="inline-flex items-center gap-1 font-bold text-mango-700"><Star size={12} fill="currentColor" /> {t.rating}</span></div>)}
    </div>
  )
  if (mock.kind === 'notifs') return (
    <div className="space-y-1.5">{mock.items.map((n) => <div key={n.t} className="flex items-center gap-3 rounded-xl bg-charcoal-50 px-3 py-2 text-xs"><span className="tabular-nums text-charcoal-400">{n.t}</span><span className="text-charcoal font-semibold">{n.text}</span></div>)}</div>
  )
  return null
}

export default function Ideas() {
  const stubs = parentIdeas

  return (
    <div>
      <PageTitle eyebrow="proposals, not promises" title="Suggested ideas" subtitle="Parent features we think belong in BOLT. Everything tagged “Suggested” uses sample data and is waiting for your yes or no." />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-2">
        {stubs.map((idea) => {
          const Icon = ICONS[idea.icon] || MessageSquare
          return (
            <Card key={idea.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-2xl bg-mango-50 text-mango flex items-center justify-center shrink-0"><Icon size={18} /></div>
                <SuggestedTag />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight text-charcoal mt-3 leading-tight">{idea.title}</h3>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mt-1">{idea.channel}</div>
              <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">{idea.description}</p>
              <div className="mt-4 pt-4 border-t border-dashed border-charcoal-100"><Mock mock={idea.mock} /></div>
              <div className="mt-4 flex items-center gap-2"><Pill tone="neutral" className="normal-case tracking-normal">Stub · sample data</Pill></div>
            </Card>
          )
        })}
      </div>

      <Callout tone="mango" className="mt-8" title="How to read this page">
        Every card here is a stub: it shows the shape of the idea with made-up numbers so you can decide whether it is worth building. Nothing here sends a real message or charges anything.
      </Callout>
    </div>
  )
}
