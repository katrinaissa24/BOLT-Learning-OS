import { Link } from 'react-router-dom'
import { Sigma, Feather, Atom, ArrowRight, CalendarClock, Flag, User } from 'lucide-react'
import { PageTitle, Card, StatusPill, Pill } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { studentCourseSummary, profileById, TODAY } from '../../lib/selectors'

const COURSE_ICONS = { sigma: Sigma, feather: Feather, atom: Atom }

function Ring({ value, color, size = 84 }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6E8EC" strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .7s ease' }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="18" fontWeight="800" fill="#353B48">{value}%</text>
    </svg>
  )
}

export default function Courses() {
  const { profile } = useAuth()
  const { db } = useData()
  return (
    <div>
      <PageTitle eyebrow="my courses" title="Three journeys, one term." subtitle="Each course is a landscape of checkpoints. Open a journey to see where you are, what is weak, and where to branch out." />

      <div className="rounded-2xl bg-charcoal text-white px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 bolt-pattern-dark">
        <span className="font-extrabold tracking-tight">Grade 12 · Term 1 · 3 courses</span>
        <span className="text-white/60 text-sm">Cedar Ridge International School · 2026–2027</span>
        <span className="ml-auto text-sm text-white/80 flex items-center gap-2"><CalendarClock size={14} className="text-mango" /> First exam in {Math.min(...db.courses.map((c) => Math.round((new Date(c.exam_date) - TODAY) / 86400000)))} days</span>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {db.courses.map((course) => {
          const s = studentCourseSummary(db, profile.id, course.id)
          const teacher = profileById(db, course.teacher_id)
          const Icon = COURSE_ICONS[course.icon] || Sigma
          const daysToExam = Math.round((new Date(course.exam_date) - TODAY) / 86400000)
          return (
            <Link key={course.id} to={`/student/courses/${course.id}`} className="group">
              <Card className="h-full flex flex-col gap-5 relative overflow-hidden hover:-translate-y-1 transition-transform">
                <div className="absolute inset-x-0 top-0 h-2" style={{ background: course.color }} />
                <div className="flex items-start justify-between gap-3 pt-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: course.color }}><Icon size={24} /></div>
                  <StatusPill status={s.status} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{course.subject}</div>
                  <h3 className="text-xl font-extrabold tracking-tight text-charcoal leading-tight">{course.title}</h3>
                  <p className="text-sm text-charcoal-400 mt-2 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Ring value={s.percent} color={course.color} />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1">
                    <div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Completed</div><div className="font-extrabold text-charcoal">{s.completed}/{s.total}</div></div>
                    <div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Avg score</div><div className="font-extrabold text-charcoal">{s.avgScore}%</div></div>
                    <div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Points</div><div className="font-extrabold text-charcoal">{s.points.toLocaleString()}</div></div>
                    <div><div className="text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold">Weak topics</div><div className={`font-extrabold ${s.weakTopics.length ? 'text-danger' : 'text-success'}`}>{s.weakTopics.length}</div></div>
                  </div>
                </div>
                <div className="rounded-2xl bg-cloud p-3 text-sm">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-charcoal-400 font-semibold mb-0.5"><Flag size={12} style={{ color: course.color }} /> Next checkpoint</div><div className="font-semibold text-charcoal truncate">{s.currentLesson ? `${s.currentLesson.position}. ${s.currentLesson.title}` : 'Journey complete'}</div>
                </div>
                <div className="flex items-center justify-between text-xs text-charcoal-400 mt-auto pt-1">
                  <span className="flex items-center gap-1.5"><User size={13} /> {teacher?.full_name}</span>
                  <Pill tone={daysToExam <= 45 ? 'warning' : 'neutral'}>Exam in {daysToExam} days</Pill>
                </div>
                <div className="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity text-mango"><ArrowRight size={18} /></div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
