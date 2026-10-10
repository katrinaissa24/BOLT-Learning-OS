import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Languages, Stamp, CalendarCheck, HeartHandshake, ArrowRight, Bell, Sparkles } from 'lucide-react'
import { PageTitle, Card, Avatar, SectionHeader, SuggestedTag, Callout, Button } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { parentLens, courseById } from '../../lib/selectors'
import { heroSentences, helpThisWeek } from '../../components/parent/lens'
import UnderstandingCard from '../../components/parent/UnderstandingCard'
import BadgeIcon from '../../components/parent/BadgeIcon'
import { fmtDate } from '../../lib/utils'

function HeroChip({ dot, children }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90"><span className={`w-2 h-2 rounded-full ${dot}`} />{children}</span>
}

const LANGS = [{ k: 'en', label: 'English' }, { k: 'ar', label: 'العربية' }, { k: 'fr', label: 'Français' }]

export default function Lens() {
  const { profile } = useAuth()
  const { db } = useData()
  const lens = useMemo(() => parentLens(db, profile.child_id), [db, profile.child_id])
  const hero = useMemo(() => heroSentences(db, lens), [db, lens])
  const help = useMemo(() => helpThisWeek(lens), [lens])
  const [lang, setLang] = useState('en')
  const first = hero.first
  const recentBadges = [...lens.badges].sort((a, b) => b.earned_at.localeCompare(a.earned_at)).slice(0, 5)
  const highAlerts = lens.alerts.filter((a) => a.level === 'high').length
  const att = lens.attendance

  return (
    <div>
      <PageTitle
        eyebrow="what she understands, what’s next"
        title={<span className="inline-flex items-center gap-3"><Avatar name={lens.child.full_name} size="lg" /> {first}, this week</span>}
        subtitle={`Written for you, not for a gradebook. Every number here is also a sentence, and every sentence ends with something you can do.`}
        action={highAlerts ? <Button to="/parent/alerts" variant="dark"><Bell size={16} /> {highAlerts} thing{highAlerts > 1 ? 's' : ''} to act on</Button> : <Button to="/parent/alerts" variant="secondary"><Bell size={16} /> Nothing urgent</Button>}
      />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[1.25rem] bg-charcoal text-white p-6 md:p-8 shadow-soft">
        <div className="absolute inset-0 bolt-pattern-dark opacity-70" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="font-hand text-mango text-2xl leading-none">in one breath</div>
            <div className="flex items-center gap-2">
              <SuggestedTag className="bg-white/10" />
              <div className="inline-flex p-1 rounded-xl bg-white/10 gap-0.5">
                {LANGS.map((l) => <button key={l.k} onClick={() => setLang(l.k)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${lang === l.k ? 'bg-mango text-white' : 'text-white/70 hover:text-white'}`}>{l.label}</button>)}
              </div>
              <Languages size={16} className="text-white/50" />
            </div>
          </div>
          <p dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`text-xl md:text-2xl leading-relaxed font-semibold max-w-4xl ${lang === 'ar' ? 'text-right' : ''}`}>{hero[lang]}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            {hero.strong.slice(0, 3).map((s) => <HeroChip key={s} dot="bg-success">{s}</HeroChip>)}
            {hero.weak.map((w) => <HeroChip key={w.id} dot="bg-mango">{w.name} · {w.score}%</HeroChip>)}
            {hero.soonest && <HeroChip dot="bg-white/60">{hero.soonest.subject} exam in {hero.days} days</HeroChip>}
          </div>
        </div>
      </div>

      {/* Understanding cards */}
      <SectionHeader className="mt-10" eyebrow="course by course" title="Understanding, not marks" subtitle="Three columns instead of one number: what holds, what is forming, what would cost marks today." />
      <div className="space-y-5">
        {lens.overview.courses.map((s) => <UnderstandingCard key={s.courseId} course={courseById(db, s.courseId)} summary={s} firstName={first} />)}
      </div>

      {/* Proof + attendance + help */}
      <div className="grid lg:grid-cols-3 gap-5 mt-10">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-extrabold text-charcoal"><Stamp size={18} className="text-mango" /> Proof of learning</div>
            <Link to="/parent/journey" className="text-xs font-semibold text-mango-700 inline-flex items-center gap-1">Passport <ArrowRight size={12} /></Link>
          </div>
          <ul className="space-y-3">
            {recentBadges.map((b) => (
              <li key={b.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-mango-50 text-mango flex items-center justify-center shrink-0"><BadgeIcon icon={b.badge.icon} size={16} /></div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-charcoal leading-tight">{b.badge.name} <span className="text-[11px] font-medium text-charcoal-400 ml-1">{fmtDate(b.earned_at)}</span></div>
                  <div className="text-xs text-charcoal-400 leading-snug mt-0.5">{b.evidence}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-charcoal-400 mt-4 pt-3 border-t border-charcoal-100">{lens.badges.length} stamps so far. Each one is something {first} did or defended — not a mark she received.</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 font-extrabold text-charcoal mb-4"><CalendarCheck size={18} className="text-success" /> Attendance</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-2xl bg-charcoal-50 p-3 text-center"><div className="text-2xl font-extrabold text-charcoal tabular-nums">{att.streak}</div><div className="text-[11px] text-charcoal-400 font-semibold uppercase tracking-wide">day streak</div></div>
            <div className="rounded-2xl bg-charcoal-50 p-3 text-center"><div className="text-2xl font-extrabold text-charcoal tabular-nums">{att.rate}%</div><div className="text-[11px] text-charcoal-400 font-semibold uppercase tracking-wide">present</div></div>
            <div className="rounded-2xl bg-charcoal-50 p-3 text-center"><div className="text-2xl font-extrabold text-charcoal tabular-nums">{att.late + att.absent}</div><div className="text-[11px] text-charcoal-400 font-semibold uppercase tracking-wide">late / absent</div></div>
          </div>
          <Callout tone="success" icon={Sparkles}>
            {att.streak >= 20
              ? <>Every school day since September, on time. That is {att.streak} choices in a row — tell her you noticed.</>
              : att.absent === 0 ? <>No absences this term. Consistency is a skill, and {first} has it.</> : <>{att.absent} absence{att.absent > 1 ? 's' : ''} this term. Worth a gentle question about what got in the way.</>}
          </Callout>
          <Link to="/parent/schedule" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-mango-700">Schedule & calendar <ArrowRight size={12} /></Link>
        </Card>

        <Card className="bg-mango-50 border-mango-200">
          <div className="flex items-center gap-2 font-extrabold text-charcoal mb-4"><HeartHandshake size={18} className="text-mango" /> How to help this week</div>
          <ol className="space-y-3">
            {help.map((h, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-mango text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <div className="text-sm font-bold text-charcoal leading-tight">{h.title}</div>
                  <p className="text-xs text-charcoal-500 leading-relaxed mt-0.5">{h.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button to="/parent/alerts" variant="dark" size="sm" className="mt-5">Open Intervene Early <ArrowRight size={14} /></Button>
        </Card>
      </div>
    </div>
  )
}
