import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Zap, Trophy, CalendarClock, GitBranch, Sigma, Feather, Atom, Flag } from 'lucide-react'
import { Card, StatusPill, Pill, Button, EmptyState } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { studentCourseSummary, leaderboard, courseById, CURRENT_MONTH, TODAY } from '../../lib/selectors'
import JourneyMap from '../../components/journey/JourneyMap'
import CheckpointPanel from '../../components/journey/CheckpointPanel'
import BranchModal from '../../components/journey/BranchModal'

const COURSE_ICONS = { sigma: Sigma, feather: Feather, atom: Atom }

export default function Journey() {
  const { courseId } = useParams()
  const { profile } = useAuth()
  const { db } = useData()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const course = courseById(db, courseId)
  const summary = useMemo(() => (course ? studentCourseSummary(db, profile.id, courseId) : null), [db, profile.id, courseId, course])
  const [selectedId, setSelectedId] = useState(params.get('lesson') || null)
  const [branchNode, setBranchNode] = useState(null)

  const nodes = useMemo(() => {
    if (!summary) return []
    let seenCurrent = false
    return summary.rows.map((r) => {
      let state = 'locked'
      if (r.progress?.status === 'completed') state = 'completed'
      else if (!seenCurrent) { state = 'current'; seenCurrent = true }
      const weakTopics = r.lesson.topics.map((t) => ({ ...t, score: r.progress?.topic_scores?.[t.id] })).filter((t) => t.score != null && t.score < 60)
      const branch = (state === 'completed' && weakTopics.length > 0) || state === 'current'
      return { lesson: r.lesson, progress: r.progress, state, score: r.progress?.score ?? null, weakTopics, branch }
    })
  }, [summary])

  // ?lesson=&branch=1 deep link (from Home "Branch out")
  useEffect(() => {
    if (params.get('branch') === '1' && nodes.length) {
      const n = nodes.find((x) => x.lesson.id === params.get('lesson'))
      if (n && n.state !== 'locked') setBranchNode(n)
      const next = new URLSearchParams(params); next.delete('branch'); setParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length])

  if (!course || !summary) return <EmptyState title="Course not found" text="This journey does not exist." action={<Button to="/student/courses">Back to courses</Button>} />

  const selected = nodes.find((n) => n.lesson.id === selectedId) || null
  const lb = leaderboard(db, courseId, CURRENT_MONTH)
  const me = lb.find((r) => r.student.id === profile.id)
  const daysToExam = Math.round((new Date(course.exam_date) - TODAY) / 86400000)
  const Icon = COURSE_ICONS[course.icon] || Sigma
  const branchCount = nodes.filter((n) => n.branch && n.state === 'completed').length

  return (
    <div>
      <Link to="/student/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-400 hover:text-charcoal mb-4"><ArrowLeft size={15} /> All courses</Link>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-soft" style={{ background: course.color }}><Icon size={28} /></div>
          <div>
            <div className="font-hand text-mango text-2xl leading-none mb-1">journey map</div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal leading-none">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <StatusPill status={summary.status} />
              <Pill tone="mango" icon={Zap} className="normal-case tracking-normal text-xs">{summary.points.toLocaleString()} pts</Pill>
              <Pill tone={me?.rank <= 3 ? 'dark' : 'neutral'} icon={Trophy} className="normal-case tracking-normal text-xs">#{me?.rank ?? '–'} in October</Pill>
              <Pill tone={daysToExam <= 45 ? 'warning' : 'outline'} icon={CalendarClock} className="normal-case tracking-normal text-xs">Exam in {daysToExam} days</Pill>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {summary.currentLesson && <Button to={`/student/courses/${courseId}/lessons/${summary.currentLesson.id}`}><Flag size={16} /> Continue checkpoint {summary.currentLesson.position}</Button>}
        </div>
      </div>

      {/* Map + panel */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-stretch">
        <div className="min-w-0">
          <JourneyMap nodes={nodes} course={course} selectedId={selectedId} onSelect={(n) => setSelectedId(n.lesson.id)} onBranch={(n) => { setSelectedId(n.lesson.id); setBranchNode(n) }} />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-charcoal-500 px-1">
            <LegendDot className="bg-mango" label="Completed checkpoint" />
            <LegendDot className="bg-white border-[3px] border-mango" label="You are here" />
            <LegendDot className="bg-charcoal-100 border border-charcoal-200" label="Locked (finish the previous one)" />
            <span className="flex items-center gap-2"><span className="w-6 border-t-2 border-dashed border-mango" /> Extra-practice branch (topic below 60%)</span>
            <span className="flex items-center gap-2"><span className="w-6 border-t-[3px] border-mango rounded" /> Path travelled</span>
          </div>
        </div>
        <div className="min-h-[420px]">
          <CheckpointPanel node={selected} course={course} onClose={() => setSelectedId(null)} onBranch={(n) => setBranchNode(n)} lessonLink={selected ? `/student/courses/${courseId}/lessons/${selected.lesson.id}` : '#'} />
        </div>
      </div>

      {/* Summary row */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-mango-50 text-mango flex items-center justify-center shrink-0"><Flag size={20} /></div>
          <div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Progress</div><div className="text-xl font-extrabold text-charcoal">{summary.completed} of {summary.total} checkpoints</div><div className="text-xs text-charcoal-400">class is expected at 5 today</div></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-danger-soft text-danger flex items-center justify-center shrink-0"><GitBranch size={20} /></div>
          <div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Open branches</div><div className="text-xl font-extrabold text-charcoal">{branchCount}</div><div className="text-xs text-charcoal-400">{summary.weakTopics.length ? `${summary.weakTopics[0].name} is weakest at ${summary.weakTopics[0].score}%` : 'no weak topics'}</div></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-success-soft text-success flex items-center justify-center shrink-0"><Trophy size={20} /></div>
          <div><div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">Average score</div><div className="text-xl font-extrabold text-charcoal">{summary.avgScore}%</div><div className="text-xs text-charcoal-400">{summary.strongTopics.length} strong topics (80%+)</div></div>
        </Card>
      </div>

      <BranchModal open={!!branchNode} onClose={() => setBranchNode(null)} node={branchNode} course={course} studentId={profile.id} studentName={profile.full_name} />
    </div>
  )
}

function LegendDot({ className, label }) {
  return <span className="flex items-center gap-2"><span className={`w-3.5 h-3.5 rounded-full ${className}`} /> {label}</span>
}
