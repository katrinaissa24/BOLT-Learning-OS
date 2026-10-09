import { Link } from 'react-router-dom'
import { Zap, Stamp, Flame, Compass, ArrowRight, GitBranch, Trophy, CalendarDays, Clock, Sigma, Feather, Atom, Brain } from 'lucide-react'
import { PageTitle, Card, StatTile, StatusPill, ProgressBar, ScoreBar, scoreTextClass, Button, Pill, SectionHeader } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { studentOverview, studentBadges, attendanceSummary, leaderboard, courseById, CURRENT_MONTH, TODAY } from '../../lib/selectors'
import { fmtDate } from '../../lib/utils'
import { BADGE_ICONS } from '../../components/passport/icons'

const COURSE_ICONS = { sigma: Sigma, feather: Feather, atom: Atom }
const STATUS_LABEL = { ahead: 'Ahead', 'on-track': 'On track', behind: 'Behind', 'at-risk': 'At risk' }

export default function Home() {
  const { profile } = useAuth()
  const { db } = useData()
  const ov = studentOverview(db, profile.id)
  const badges = studentBadges(db, profile.id).sort((a, b) => b.earned_at.localeCompare(a.earned_at))
  const att = attendanceSummary(db, profile.id)
  const first = profile.full_name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'good morning' : hour < 18 ? 'good afternoon' : 'good evening'

  // Today is Friday (day 5) → show today's classes and Monday's
  const todayClasses = db.schedule.filter((s) => s.day === 5).sort((a, b) => a.start.localeCompare(b.start))
  const mondayClasses = db.schedule.filter((s) => s.day === 1).sort((a, b) => a.start.localeCompare(b.start))
  const weak = ov.weakTopics.slice(0, 3)

  return (
    <div>
      <PageTitle
        eyebrow={`${greeting}, ${first}`}
        title="Your journey, today."
        subtitle="Friday 9 October 2026 · Term 1 · Week 6. Pick up where you left off, or branch out on a weak spot before the exams."
        action={<Button to="/student/lab" variant="dark"><Brain size={16} /> Open Thinking Lab</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Zap} label="Points" value={ov.totalPoints.toLocaleString()} hint="across 3 courses" />
        <StatTile icon={Stamp} label="Passport stamps" value={badges.length} hint={`${db.badges.length - badges.length} still to collect`} tone="dark" />
        <StatTile icon={Flame} label="Attendance streak" value={`${att.streak} days`} hint={att.streak >= 20 ? 'Always Here territory' : 'keep it going'} tone="success" />
        <StatTile icon={Compass} label="Journey status" value={STATUS_LABEL[ov.status]} hint={`avg score ${ov.avgScore}%`} tone="info" />
      </div>

      <SectionHeader eyebrow="where you are" title="Continue your journey" action={<Button to="/student/courses" variant="ghost" size="sm">All courses <ArrowRight size={14} /></Button>} />
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {ov.courses.map((c) => {
          const course = courseById(db, c.courseId)
          const Icon = COURSE_ICONS[course.icon] || Sigma
          return (
            <Card key={c.courseId} className="flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: course.color }} />
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: course.color }}><Icon size={20} /></div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400">{course.subject}</div>
                    <div className="font-bold text-charcoal leading-tight truncate">{course.title}</div>
                  </div>
                </div>
                <StatusPill status={c.status} />
              </div>
              <ProgressBar value={c.percent} label={`Checkpoint ${c.completed} of ${c.total}`} />
              <div className="rounded-2xl bg-cloud p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 mb-0.5">{c.currentLesson ? 'Up next' : 'Journey complete'}</div>
                <div className="text-sm font-semibold text-charcoal">{c.currentLesson ? `${c.currentLesson.position}. ${c.currentLesson.title}` : 'Every checkpoint cleared'}</div>
                {c.currentLesson && <div className="text-xs text-charcoal-400 mt-0.5 flex items-center gap-1"><Clock size={11} /> {c.currentLesson.duration_min} min video + interactive</div>}
              </div>
              <div className="flex gap-2 mt-auto">
                {c.currentLesson && <Button to={`/student/courses/${c.courseId}/lessons/${c.currentLesson.id}`} size="sm" className="flex-1">Continue <ArrowRight size={14} /></Button>}
                <Button to={`/student/courses/${c.courseId}`} size="sm" variant="secondary" className="flex-1">Journey map</Button>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weak topics */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-hand text-mango text-xl leading-none mb-1">branch out</div>
              <h3 className="text-lg font-extrabold text-charcoal">Weakest topics</h3>
            </div>
            <GitBranch size={20} className="text-mango" />
          </div>
          {weak.length === 0 ? (
            <p className="text-sm text-charcoal-400">No weak topics right now. Every topic is above 60%.</p>
          ) : (
            <div className="space-y-4">
              {weak.map((t) => {
                const course = courseById(db, t.courseId)
                return (
                  <div key={`${t.lessonId}-${t.id}`}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="min-w-0">
                        <div className="font-semibold text-charcoal truncate">{t.name}</div>
                        <div className="text-xs text-charcoal-400 truncate">{course.subject} · {t.lessonTitle}</div>
                      </div>
                      <span className={`font-extrabold ml-3 ${scoreTextClass(t.score)}`}>{t.score}%</span>
                    </div>
                    <ScoreBar score={t.score} />
                  </div>
                )
              })}
              <Button to={`/student/courses/${weak[0].courseId}?lesson=${weak[0].lessonId}&branch=1`} variant="soft" className="w-full"><GitBranch size={16} /> Branch out: extra practice</Button>
            </div>
          )}
        </Card>

        {/* This week */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-hand text-mango text-xl leading-none mb-1">this week</div>
              <h3 className="text-lg font-extrabold text-charcoal">Classes</h3>
            </div>
            <Link to="/student/schedule" className="text-xs font-semibold text-mango hover:underline flex items-center gap-1"><CalendarDays size={13} /> Full timetable</Link>
          </div>
          <DayList title="Today · Friday" classes={todayClasses} db={db} highlight />
          <DayList title="Monday 12 Oct" classes={mondayClasses} db={db} />
        </Card>

        {/* Stamps + leaderboard */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-hand text-mango text-xl leading-none mb-1">latest proof</div>
                <h3 className="text-lg font-extrabold text-charcoal">Recent stamps</h3>
              </div>
              <Link to="/student/passport" className="text-xs font-semibold text-mango hover:underline">Passport</Link>
            </div>
            <div className="flex gap-3">
              {badges.slice(0, 4).map((b) => {
                const Icon = BADGE_ICONS[b.badge.icon] || Stamp
                return (
                  <div key={b.id} className="flex-1 min-w-0 text-center" title={b.badge.name}>
                    <div className="mx-auto w-12 h-12 rounded-full border-2 border-dashed border-mango text-mango flex items-center justify-center rotate-[-6deg] bg-mango-50"><Icon size={20} /></div>
                    <div className="text-[11px] font-semibold text-charcoal mt-1.5 truncate">{b.badge.name}</div>
                    <div className="text-[10px] text-charcoal-400">{fmtDate(b.earned_at)}</div>
                  </div>
                )
              })}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-extrabold text-charcoal flex items-center gap-2"><Trophy size={18} className="text-mango" /> October ranks</h3>
              <Link to="/student/leaderboard" className="text-xs font-semibold text-mango hover:underline">Leaderboard</Link>
            </div>
            <div className="space-y-2">
              {db.courses.map((course) => {
                const lb = leaderboard(db, course.id, CURRENT_MONTH)
                const me = lb.find((r) => r.student.id === profile.id)
                return (
                  <div key={course.id} className="flex items-center gap-3 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: course.color }} />
                    <span className="flex-1 truncate text-charcoal-500">{course.subject}</span>
                    <Pill tone={me?.rank <= 3 ? 'mango' : 'neutral'}>#{me?.rank ?? '–'} of {lb.length}</Pill>
                    <span className="font-bold text-charcoal w-16 text-right">{(me?.points ?? 0).toLocaleString()} pts</span>
                  </div>
                )
              })}
            </div>
            <div className="text-xs text-charcoal-400 mt-3">{Math.round((new Date('2026-10-31T12:00:00Z') - TODAY) / 86400000)} days until the October podium is stamped.</div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DayList({ title, classes, db, highlight }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${highlight ? 'text-mango' : 'text-charcoal-400'}`}>{title}</div>
      <div className="space-y-1.5">
        {classes.map((s) => {
          const course = s.course_id ? courseById(db, s.course_id) : null
          return (
            <div key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${highlight ? 'bg-cloud' : ''}`}>
              <span className="w-1.5 h-6 rounded-full shrink-0" style={{ background: course?.color || '#C9CBD0' }} />
              <span className="text-xs text-charcoal-400 w-11 shrink-0">{s.start}</span>
              <span className="flex-1 font-semibold text-charcoal truncate">{s.label}</span>
              <span className="text-xs text-charcoal-400">{s.room}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
