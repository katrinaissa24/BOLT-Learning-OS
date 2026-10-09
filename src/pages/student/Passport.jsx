import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Share2, Hammer, Mic, ShieldCheck, ArrowRight, Stamp } from 'lucide-react'
import { PageTitle, Card, Button, Pill, StatusPill, SkillChip, SectionHeader, StatTile, SuggestedTag } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { studentBadges, courseById, profileById } from '../../lib/selectors'
import { fmtDate } from '../../lib/utils'
import PassportCover from '../../components/passport/PassportCover'
import PassportBook from '../../components/passport/PassportBook'
import ShareModal from '../../components/passport/ShareModal'

export default function Passport() {
  const { profile } = useAuth()
  const { db } = useData()
  const [open, setOpen] = useState(false)
  const [share, setShare] = useState(false)
  const earned = studentBadges(db, profile.id)
  const projects = db.projects.filter((p) => p.student_id === profile.id).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const defenses = earned.filter((e) => e.badge.category === 'Verified Demonstration' && e.badge.id !== 'project-proof')
  const rare = earned.filter((e) => ['rare', 'epic'].includes(e.badge.rarity)).length

  return (
    <div>
      <PageTitle eyebrow="proof of thinking" title="Learning Passport" subtitle="Every stamp is a verified demonstration — a challenge won, a project validated, a month of showing up. Hover a stamp to see what it proves and how to earn it." action={<Button variant="dark" onClick={() => setShare(true)}><Share2 size={16} /> Share</Button>} />

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
        <StatTile icon={Stamp} label="Stamps" value={earned.length} hint={`of ${db.badges.length}`} />
        <StatTile icon={ShieldCheck} label="Rare & epic" value={rare} hint="hard-earned proof" tone="dark" />
        <StatTile icon={Hammer} label="Projects" value={projects.length} hint={projects.filter((p) => p.status === 'validated').length ? 'validated' : 'awaiting validation'} tone="success" />
      </div>

      <div className="rounded-3xl bg-cloud border border-charcoal-100 p-6 md:p-10 flex items-center justify-center min-h-[560px] overflow-hidden" style={{ perspective: 1800 }}>
        <AnimatePresence mode="wait">
          {open ? <PassportBook key="book" profile={profile} earned={earned} db={db} onClose={() => setOpen(false)} /> : <PassportCover key="cover" onOpen={() => setOpen(true)} name={profile.full_name} stampCount={earned.length} />}
        </AnimatePresence>
      </div>

      <div className="mt-10">
        <SectionHeader eyebrow="verified" title="Verified demonstrations" subtitle="Stamps that a teacher signs off in person: projects you built and solutions you defended out loud." action={<Button to="/student/projects" variant="secondary" size="sm"><Hammer size={14} /> Submit a project</Button>} />
        <div className="grid md:grid-cols-2 gap-5">
          <Card>
            <div className="flex items-center gap-2 mb-3"><Hammer size={18} className="text-mango" /><h3 className="font-extrabold text-charcoal">Projects</h3></div>
            {projects.length === 0 ? <p className="text-sm text-charcoal-400">No projects yet. Submit one in Project Showcase to earn the Project Proof stamp.</p> : (
              <div className="space-y-3">
                {projects.map((p) => {
                  const course = courseById(db, p.course_id)
                  const validator = p.validated_by ? profileById(db, p.validated_by) : null
                  return (
                    <div key={p.id} className="rounded-2xl border border-charcoal-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-charcoal">{p.title}</div>
                          <div className="text-xs text-charcoal-400 mt-0.5">{course?.subject} · {p.artifact} · {fmtDate(p.created_at)}</div>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                      <p className="text-sm text-charcoal-500 mt-2">{p.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">{p.skills.map((s) => <SkillChip key={s} skill={s} />)}</div>
                      <div className="text-xs text-charcoal-400 mt-3">{p.status === 'validated' ? `Validated by ${validator?.full_name} — stamped as Project Proof.` : 'Waiting for Ms. Haddad to validate — then it becomes a Project Proof stamp.'}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-3"><Mic size={18} className="text-mango" /><h3 className="font-extrabold text-charcoal">Oral defenses</h3></div>
            {defenses.length === 0 ? (
              <div>
                <p className="text-sm text-charcoal-400">No oral defense yet. Pick any completed checkpoint, explain your solution to Ms. Haddad and answer her follow-ups — she validates it and the <strong>Oral Defender</strong> stamp lands here.</p>
                <div className="mt-4 rounded-2xl bg-cloud p-4 text-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-1 flex items-center gap-2">Good candidates <SuggestedTag /></div>
                  <ul className="space-y-1 text-charcoal">
                    <li className="flex items-center gap-2"><ArrowRight size={13} className="text-mango" /> Derivative Formulas Through Geometry — 88% on the power rule</li>
                    <li className="flex items-center gap-2"><ArrowRight size={13} className="text-mango" /> Rhetoric: Ethos, Logos, Pathos — defend your exams essay</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {defenses.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-charcoal-100 p-4">
                    <div className="flex items-center justify-between"><div className="font-bold text-charcoal">{d.badge.name}</div><Pill tone="success">Validated</Pill></div>
                    <p className="text-sm text-charcoal-500 mt-1">{d.evidence}</p>
                    <div className="text-xs text-charcoal-400 mt-2">{fmtDate(d.earned_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ShareModal open={share} onClose={() => setShare(false)} profile={profile} earned={earned} />
    </div>
  )
}
