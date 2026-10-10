import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Brain, MessageCircle, Bot, Search, Fingerprint, GitBranch, Swords, ArrowRight, Zap, Stamp } from 'lucide-react'
import { PageTitle, Card, Pill, StatTile } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { CURRENT_MONTH } from '../../lib/selectors'
import { badgeIcon } from '../../components/passport/icons'
import { readCounters } from '../../components/lab/shared'
import ExplainBack from '../../components/lab/ExplainBack'
import TeachTheBot from '../../components/lab/TeachTheBot'
import SpotTheFlaw from '../../components/lab/SpotTheFlaw'
import EvidenceDetective from '../../components/lab/EvidenceDetective'
import DecisionSimulator from '../../components/lab/DecisionSimulator'
import DebateArena from '../../components/lab/DebateArena'

const GAMES = [
  { id: 'debate-arena', title: 'Debate Arena', icon: Swords, badge: 'debate-victor', featured: true, text: 'Pick a motion and a side. Four rounds against an opponent that adapts to your level; scored on claim, evidence and rebuttal.', pts: '40–80', time: '10 min' },
  { id: 'explain-back', title: 'Explain Back', icon: MessageCircle, badge: 'explainer', text: 'Explain a topic, then survive the follow-ups: Why? What if this changes? New scenario. Get rated Surface, Working or Deep.', pts: '30–80', time: '6 min' },
  { id: 'teach-the-bot', title: 'Teach the Bot', icon: Bot, badge: 'bot-teacher', text: 'Ziko, a confused AI classmate, explains a concept with planted mistakes. Flag them and write the correction.', pts: '30–70', time: '5 min' },
  { id: 'spot-the-flaw', title: 'Spot the Flaw', icon: Search, badge: 'critical-eye', text: 'A confident AI answer with hidden errors in the math, the physics or the argument. Click the flawed lines.', pts: '20–40', time: '4 min' },
  { id: 'evidence-detective', title: 'Evidence Detective', icon: Fingerprint, badge: 'evidence-detective', text: 'A case file of five sources, claims and charts. Rate each Trust / Doubt / Reject and say why.', pts: '30–80', time: '6 min' },
  { id: 'decision-simulator', title: 'Decision Simulator', icon: GitBranch, badge: 'decision-maker', text: 'A real-world scenario with incomplete information. Four decisions, optional info that costs time, then a debrief.', pts: '30–80', time: '7 min' },
]

export default function Lab() {
  const { activity } = useParams()
  const [params] = useSearchParams()
  const { profile } = useAuth()
  const { db } = useData()

  if (activity) {
    const map = { 'explain-back': <ExplainBack profile={profile} preselect={params.get('lesson')} />, 'teach-the-bot': <TeachTheBot profile={profile} />, 'spot-the-flaw': <SpotTheFlaw profile={profile} />, 'evidence-detective': <EvidenceDetective profile={profile} />, 'decision-simulator': <DecisionSimulator profile={profile} />, 'debate-arena': <DebateArena profile={profile} /> }
    if (map[activity]) return map[activity]
  }

  const myBadges = db.studentBadges.filter((b) => b.student_id === profile.id).map((b) => b.badge_id)
  const labPoints = db.pointEvents.filter((p) => p.student_id === profile.id && String(p.created_at).startsWith(CURRENT_MONTH) && /debate|flaw|explain|evidence|decision|teach the bot/i.test(p.reason)).reduce((a, b) => a + b.points, 0)
  const labBadgeIds = GAMES.map((g) => g.badge)
  const labStamps = myBadges.filter((id) => labBadgeIds.includes(id)).length
  const counters = readCounters()
  const progressFor = { 'spot-the-flaw': `${Math.min(Math.max(counters['flaw-wins'] || 0, myBadges.includes('critical-eye') ? 5 : 0), 5)}/5 wins`, 'teach-the-bot': `${counters['ziko-sessions'] || 0}/3 sessions`, 'explain-back': `${counters['explain-deep'] || 0} deep` }

  return (
    <div>
      <PageTitle eyebrow="thinking lab" title="Mastery means you can defend it." subtitle="Six games that test what AI cannot do for you: explaining, teaching, spotting flaws, judging evidence, deciding and arguing. Every win pays points and some pay stamps." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Zap} label="Lab points · Oct" value={labPoints} hint="count on every leaderboard" />
        <StatTile icon={Stamp} label="Lab stamps" value={`${labStamps}/6`} hint="Thinking Lab category" tone="dark" />
        <StatTile icon={Brain} label="Wednesday 13:00" value="Lab period" hint="Hub · with Ms. Haddad" tone="info" />
        <StatTile icon={Swords} label="Featured" value="Debate Arena" hint="adaptive opponent" tone="success" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {GAMES.map((g) => {
          const badge = db.badges.find((b) => b.id === g.badge)
          const BadgeIcon = badgeIcon(badge?.icon)
          const has = myBadges.includes(g.badge)
          return (
            <Link key={g.id} to={`/student/lab/${g.id}`} className={g.featured ? 'md:col-span-2 xl:col-span-1' : ''}>
              <Card className={`h-full flex flex-col gap-4 hover:-translate-y-1 transition-transform relative overflow-hidden ${g.featured ? 'bg-charcoal text-white border-charcoal bolt-pattern-dark' : ''}`} style={g.featured ? { background: '#353B48' } : undefined}>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${g.featured ? 'bg-mango text-white' : 'bg-mango-50 text-mango'}`}><g.icon size={24} /></div>
                  <div className="flex gap-1.5">{g.featured && <Pill tone="mango">Featured</Pill>}<Pill tone={has ? 'success' : g.featured ? 'outline' : 'neutral'} className={g.featured && !has ? 'border-white/30 text-white/70' : ''}><BadgeIcon size={11} /> {has ? 'Stamped' : badge?.name}</Pill></div>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">{g.title}</h3>
                  <p className={`text-sm mt-1.5 ${g.featured ? 'text-white/75' : 'text-charcoal-400'}`}>{g.text}</p>
                </div>
                <div className={`mt-auto flex items-center justify-between text-xs ${g.featured ? 'text-white/60' : 'text-charcoal-400'}`}>
                  <span>{g.pts} pts · {g.time}{progressFor[g.id] ? ` · ${progressFor[g.id]}` : ''}</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${g.featured ? 'text-mango' : 'text-charcoal'}`}>Play <ArrowRight size={14} /></span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
