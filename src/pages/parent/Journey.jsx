import { useMemo } from 'react'
import { Mic, Hammer, Stamp, ShieldCheck, Clock } from 'lucide-react'
import { PageTitle, SectionHeader, Card, Pill, StatusPill, SkillChip, Callout } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { parentLens, courseById } from '../../lib/selectors'
import MiniJourney from '../../components/parent/MiniJourney'
import StampGrid from '../../components/parent/StampGrid'
import { fmtDate } from '../../lib/utils'

export default function Journey() {
  const { profile } = useAuth()
  const { db } = useData()
  const lens = useMemo(() => parentLens(db, profile.child_id), [db, profile.child_id])
  const first = lens.child.full_name.split(' ')[0]
  const projects = db.projects.filter((p) => p.student_id === profile.child_id)
  const verifiedStamps = lens.badges.filter((b) => b.badge.category === 'Verified Demonstration')
  const essays = db.submissions.filter((s) => s.student_id === profile.child_id)
  const totalCheckpoints = lens.overview.courses.reduce((a, c) => a + c.completed, 0)

  return (
    <div>
      <PageTitle eyebrow="the path, not the page" title="Journey & passport" subtitle={`Where ${first} is on each course, and the stamps that prove what she can do. Read-only — ${first} has the full version in her space.`} />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-mango-50 text-mango flex items-center justify-center"><Clock size={20} /></div><div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Checkpoints done</div><div className="text-2xl font-extrabold text-charcoal">{totalCheckpoints} <span className="text-base text-charcoal-300">/ 21</span></div></div></Card>
        <Card className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-charcoal text-white flex items-center justify-center"><Stamp size={20} /></div><div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Stamps earned</div><div className="text-2xl font-extrabold text-charcoal">{lens.badges.length} <span className="text-base text-charcoal-300">/ {db.badges.length}</span></div></div></Card>
        <Card className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-success-soft text-success flex items-center justify-center"><ShieldCheck size={20} /></div><div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Verified by a teacher</div><div className="text-2xl font-extrabold text-charcoal">{verifiedStamps.length + projects.filter((p) => p.status === 'validated').length} <span className="text-base text-charcoal-300">+ {projects.filter((p) => p.status === 'pending').length} pending</span></div></div></Card>
      </div>

      <SectionHeader eyebrow="three journeys" title="Where she is" subtitle="Seven checkpoints per course. Filled circles are done, the outlined one is where she is now, gray ones are still locked. The score under each is the checkpoint score, in words and in numbers." />
      <div className="space-y-5">
        {lens.overview.courses.map((s) => <MiniJourney key={s.courseId} course={courseById(db, s.courseId)} summary={s} />)}
      </div>

      <SectionHeader className="mt-12" eyebrow="proof, collected" title="Passport stamps" subtitle={`${lens.badges.length} of ${db.badges.length} stamps. Each one is tied to a skill and to evidence — a project, a defense, a streak, a win.`} />
      <Card>
        <StampGrid badges={db.badges} earned={lens.badges} />
      </Card>

      <div className="grid lg:grid-cols-5 gap-5 mt-12">
        <div className="lg:col-span-3">
          <SectionHeader eyebrow="seen by a human" title="Verified demonstrations" subtitle="Things a teacher watched, questioned and signed off — the strongest evidence in the passport." />
          <div className="space-y-4">
            {projects.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mango-50 text-mango flex items-center justify-center shrink-0"><Hammer size={18} /></div>
                    <div>
                      <div className="font-extrabold text-charcoal leading-tight">{p.title}</div>
                      <div className="text-xs text-charcoal-400 mt-0.5">Project · {courseById(db, p.course_id)?.subject} · submitted {fmtDate(p.created_at)} · {p.artifact}</div>
                      <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">{p.skills.map((s) => <SkillChip key={s} skill={s} />)}</div>
                    </div>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                {p.status === 'pending' && <p className="text-xs text-charcoal-400 mt-3 pt-3 border-t border-charcoal-100">Waiting for Rania Haddad to review the walkthrough. Once validated, the “Project Proof” stamp lands in the passport.</p>}
              </Card>
            ))}
            {essays.map((s) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-info-soft text-info flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
                    <div>
                      <div className="font-extrabold text-charcoal leading-tight">“{s.title}”</div>
                      <div className="text-xs text-charcoal-400 mt-0.5">Essay written inside BOLT · {s.metrics.words} words · {Math.round(s.metrics.active_seconds / 60)} min of active writing · {s.metrics.snapshots} drafts</div>
                      <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">AI help was declared ({Math.round(s.ai_usage.share_of_text * 100)}% of the text, used for {s.ai_usage.mode}) and {first}’s own revisions outweighed it. The teacher can replay the whole writing process, keystroke by keystroke.</p>
                    </div>
                  </div>
                  <StatusPill status={s.status} />
                </div>
              </Card>
            ))}
            <Card className="border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-charcoal-50 text-charcoal-300 flex items-center justify-center shrink-0"><Mic size={18} /></div>
                <div>
                  <div className="font-bold text-charcoal-400 leading-tight">Oral defense — not yet</div>
                  <p className="text-sm text-charcoal-400 mt-1 leading-relaxed">{first} can request to defend any completed lesson out loud to her teacher. It earns the “Oral Defender” stamp and is the surest sign a topic is really hers. Worth suggesting for the chain rule once the practice branch is done.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="lg:col-span-2">
          <SectionHeader eyebrow="why we do it this way" title="Stamps over marks" />
          <Callout tone="dark" className="p-6">
            <div className="space-y-4 text-white/90 leading-relaxed">
              <p>A mark says <span className="font-bold text-mango">how much</span>. A stamp says <span className="font-bold text-mango">what</span>, and <span className="font-bold text-mango">how we know</span>.</p>
              <p>“14/20 in Physics” hides that {first} understands free fall perfectly and circular motion not at all. “Evidence Detective, 93%” tells you she can judge whether a claim is credible — a skill she will use for the rest of her life.</p>
              <p>Stamps cannot be crammed for. They are earned by doing something in front of someone: defending an answer, building a project, showing up for {lens.attendance.streak} days straight.</p>
              <p className="text-white/60 text-sm">When you ask about school tonight, try “which stamp are you closest to?” instead of “what did you get?”</p>
            </div>
          </Callout>
          <Card className="mt-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-3">Skills behind the stamps</div>
            <div className="space-y-2.5">
              {Object.entries(lens.badges.reduce((acc, b) => { acc[b.badge.skill] = (acc[b.badge.skill] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1]).map(([skill, n]) => (
                <div key={skill} className="flex items-center justify-between gap-3"><SkillChip skill={skill} /><span className="text-sm font-bold text-charcoal tabular-nums">{n} stamp{n > 1 ? 's' : ''}</span></div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex flex-wrap gap-1.5">
              <Pill tone="neutral" className="normal-case tracking-normal">Next likely: Comeback</Pill>
              <Pill tone="neutral" className="normal-case tracking-normal">Project Proof (pending)</Pill>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
