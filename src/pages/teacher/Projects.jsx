import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Hammer, CheckCircle2, ShieldCheck, Paperclip, Stamp } from 'lucide-react'
import { PageTitle, Card, SectionHeader, Button, Pill, Avatar, SkillChip, EmptyState, StatTile } from '../../components/ui'
import { useData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { profileById, courseById } from '../../lib/selectors'
import { useToast } from '../../components/teacher/Toast'

export default function Projects() {
  const { db, updateProject, awardBadge } = useData()
  const { profile } = useAuth()
  const { toast, Toasts } = useToast()
  const projects = useMemo(() => [...db.projects].sort((a, b) => b.created_at.localeCompare(a.created_at)), [db.projects])
  const pending = projects.filter((p) => p.status === 'pending')
  const validated = projects.filter((p) => p.status === 'validated')

  async function validate(p) {
    const student = profileById(db, p.student_id)
    await updateProject(p.id, { status: 'validated', validated_by: profile?.id || null })
    const r = await awardBadge(p.student_id, 'project-proof', `Project “${p.title}” validated by ${profile?.full_name || 'the teacher'}.`)
    toast(r ? `“${p.title}” validated — Project Proof stamp awarded to ${student?.full_name.split(' ')[0]}` : `“${p.title}” validated`)
  }

  return (
    <div className="space-y-8">
      <PageTitle eyebrow="proof of skill" title="Project Showcase" subtitle="Students tag a real project with the skills it proves. Your validation turns it into a passport stamp." />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile icon={Hammer} label="Pending validation" value={pending.length} tone="mango" hint="waiting for your review" />
        <StatTile icon={ShieldCheck} label="Validated" value={validated.length} tone="success" hint="this term" />
        <StatTile icon={Stamp} label="Project Proof stamps" value={db.studentBadges.filter((b) => b.badge_id === 'project-proof').length} tone="dark" hint="awarded in the passport" />
      </div>

      <section>
        <SectionHeader eyebrow="to validate" title="Pending projects" subtitle="Check the artifact, then validate. The student gets the Project Proof stamp with your name as evidence." />
        {pending.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {pending.map((p) => <ProjectCard key={p.id} p={p} db={db} action={<Button onClick={() => validate(p)}><CheckCircle2 size={16} /> Validate</Button>} />)}
          </div>
        ) : <Card><EmptyState icon={CheckCircle2} title="Nothing pending" text="Every submitted project has been reviewed." /></Card>}
      </section>

      <section>
        <SectionHeader eyebrow="done" title="Validated projects" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validated.map((p) => <ProjectCard key={p.id} p={p} db={db} compact />)}
        </div>
      </section>
      <Toasts />
    </div>
  )
}

function ProjectCard({ p, db, action, compact }) {
  const student = profileById(db, p.student_id)
  const course = courseById(db, p.course_id)
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/teacher/tracker/${p.student_id}`}><Avatar name={student?.full_name || ''} size="sm" /></Link>
          <div className="min-w-0"><div className="text-sm font-semibold text-charcoal truncate">{student?.full_name}</div><div className="text-[11px] text-charcoal-400">{new Date(p.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · <span style={{ color: course?.color }} className="font-semibold">{course?.subject}</span></div></div>
        </div>
        <Pill tone={p.status === 'validated' ? 'success' : 'warning'}>{p.status}</Pill>
      </div>
      <h3 className={`font-extrabold tracking-tight text-charcoal mt-3 ${compact ? 'text-lg' : 'text-xl'}`}>{p.title}</h3>
      <p className="text-sm text-charcoal-400 mt-1 flex-1">{p.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <SkillChip key={s} skill={s} />)}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-charcoal-100 pt-3">
        <span className="text-xs text-charcoal-400 inline-flex items-center gap-1"><Paperclip size={12} /> {p.artifact}</span>
        {action || (p.validated_by && <span className="text-xs text-success font-semibold inline-flex items-center gap-1"><ShieldCheck size={13} /> Validated by {profileById(db, p.validated_by)?.full_name.split(' ').map((n, i) => (i ? n : n[0] + '.')).join(' ') || 'teacher'}</span>)}
      </div>
    </Card>
  )
}
