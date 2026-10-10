import { useState } from 'react'
import { Hammer, Plus, Link2, CheckCircle2, Clock, Stamp, ArrowRight } from 'lucide-react'
import { PageTitle, Card, Button, Modal, Input, Textarea, StatusPill, SkillChip, Callout, Pill, EmptyState, SuggestedTag } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { courseById, profileById } from '../../lib/selectors'
import { SKILLS } from '../../data/seed'
import { fmtDate, cx } from '../../lib/utils'

const EMPTY = { title: '', description: '', artifact: '', course_id: 'phy-12', skills: [] }

export default function Projects() {
  const { profile } = useAuth()
  const { db, addProject } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [justAdded, setJustAdded] = useState(null)
  const mine = db.projects.filter((p) => p.student_id === profile.id).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const classroom = db.projects.filter((p) => p.student_id !== profile.id && p.status === 'validated').slice(0, 4)
  const valid = form.title.trim().length >= 4 && form.description.trim().length >= 20 && form.skills.length > 0

  const toggleSkill = (id) => setForm((f) => ({ ...f, skills: f.skills.includes(id) ? f.skills.filter((s) => s !== id) : [...f.skills, id] }))
  const submit = async () => {
    if (!valid) return
    setSaving(true)
    try {
      const row = await addProject({ student_id: profile.id, title: form.title.trim(), description: form.description.trim(), artifact: form.artifact.trim() || 'Link to be added', course_id: form.course_id, skills: form.skills })
      setJustAdded(row?.id || null)
    } catch (err) { console.warn('[BOLT] project add skipped', err) }
    setSaving(false); setOpen(false); setForm(EMPTY)
  }

  return (
    <div>
      <PageTitle eyebrow="build something real" title="Project Showcase" subtitle="Projects are the strongest proof in your passport. Tag the skills your project demonstrates; a teacher validates it and it becomes a Project Proof stamp." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Submit a project</Button>} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {justAdded && <Callout tone="success" icon={CheckCircle2} title="Project submitted">Ms. Haddad will see it in her Project Showcase queue. Once validated, the Project Proof stamp appears in your passport automatically.</Callout>}
          {mine.length === 0 ? <Card><EmptyState icon={Hammer} title="No projects yet" text="Build something tied to a course — a simulation, a podcast, a model — and submit it here." action={<Button onClick={() => setOpen(true)}>Submit a project</Button>} /></Card> : mine.map((p) => {
            const course = courseById(db, p.course_id)
            const validator = p.validated_by ? profileById(db, p.validated_by) : null
            return (
              <Card key={p.id} className={cx('relative overflow-hidden', p.id === justAdded && 'ring-4 ring-mango/30')}>
                <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: course?.color || '#C9CBD0' }} />
                <div className="pl-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{course?.title || 'Independent'}</div>
                      <h3 className="text-xl font-extrabold tracking-tight text-charcoal">{p.title}</h3>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-sm text-charcoal-500 mt-2 max-w-2xl">{p.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">{p.skills.map((s) => <SkillChip key={s} skill={s} />)}</div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-charcoal-400">
                    <span className="flex items-center gap-1"><Link2 size={12} /> {p.artifact}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Submitted {fmtDate(p.created_at)}</span>
                    {p.status === 'validated' ? <span className="flex items-center gap-1 text-success font-semibold"><Stamp size={12} /> Validated by {validator?.full_name} · Project Proof stamped</span> : <span className="flex items-center gap-1 text-mango-700 font-semibold"><Stamp size={12} /> Awaiting teacher validation</span>}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="space-y-5">
          <Callout tone="mango" icon={Stamp} title="How validation works">
            <ol className="list-decimal pl-4 space-y-1 mt-1">
              <li>Submit with a link to the artifact and the skills it proves.</li>
              <li>Your teacher reviews it — often with a 5-minute oral walkthrough.</li>
              <li>Validated projects stamp <strong>Project Proof</strong> and count toward each tagged skill.</li>
            </ol>
          </Callout>
          <Card>
            <div className="font-hand text-mango text-xl leading-none mb-1">from the class</div>
            <h3 className="font-extrabold text-charcoal mb-3 flex items-center gap-2">Validated showcase <SuggestedTag /></h3>
            <div className="space-y-3">
              {classroom.map((p) => {
                const owner = profileById(db, p.student_id)
                const course = courseById(db, p.course_id)
                return (
                  <div key={p.id} className="flex gap-3">
                    <span className="w-1.5 rounded-full shrink-0" style={{ background: course?.color }} />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-charcoal truncate">{p.title}</div>
                      <div className="text-xs text-charcoal-400">{owner?.full_name} · {course?.subject}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Submit a project">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g. Beirut traffic flow model" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="What did you build and what does it show?" rows={4} placeholder="Describe the project, the question it answers and what you learned. 2–4 sentences." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Artifact link or description" placeholder="https://… or 'Slides + data log'" value={form.artifact} onChange={(e) => setForm({ ...form, artifact: e.target.value })} hint="Live demo, video, report, podcast feed — anything a teacher can open." />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Course</div>
            <div className="flex flex-wrap gap-2">
              {db.courses.map((c) => <button key={c.id} onClick={() => setForm({ ...form, course_id: c.id })} className={cx('rounded-xl border px-3 py-2 text-sm font-semibold transition-all', form.course_id === c.id ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal-200 text-charcoal hover:border-charcoal-300')}><span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: c.color }} />{c.subject}</button>)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-1.5">Skills this project proves</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SKILLS).map(([id, s]) => {
                const on = form.skills.includes(id)
                return <button key={id} onClick={() => toggleSkill(id)} className={cx('rounded-full px-3 py-1.5 text-xs font-semibold border transition-all', on ? 'text-white border-transparent' : 'bg-white text-charcoal-500 border-charcoal-200 hover:border-charcoal-300')} style={on ? { background: s.color } : undefined}>{s.name}</button>
              })}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Pill tone="outline">Teacher validates → Project Proof stamp</Pill>
            <div className="flex gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} disabled={!valid} loading={saving}>Submit for validation <ArrowRight size={16} /></Button></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
