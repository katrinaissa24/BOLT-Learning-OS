import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Map, Clock, Puzzle, Flag, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react'
import { Button, Card, Pill, SkillChip, EmptyState } from '../../components/ui'
import { useData } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { lessonById, courseById, courseLessons, progressFor } from '../../lib/selectors'
import { activityFor } from '../../data/activities'
import { Interactive } from '../../components/interactives'
import VideoPlayer from '../../components/lesson/VideoPlayer'
import TutorChat from '../../components/lesson/TutorChat'
import CheckpointQuestion from '../../components/lesson/CheckpointQuestion'
import PracticeBranch from '../../components/lesson/PracticeBranch'
import Celebration from '../../components/lesson/Celebration'

export default function Lesson() {
  const { courseId, lessonId } = useParams()
  const { db, awardPoints, upsertLessonProgress, awardBadge } = useData()
  const { profile } = useAuth()

  const lesson = lessonById(db, lessonId)
  const course = courseById(db, courseId)
  const lessons = useMemo(() => courseLessons(db, courseId), [db, courseId])
  const idx = lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = idx > 0 ? lessons[idx - 1] : null
  const nextLesson = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null
  const progress = profile ? progressFor(db, profile.id, lessonId) : null
  const activity = activityFor(lessonId)

  const [currentTime, setCurrentTime] = useState(0)
  const [result, setResult] = useState(null)
  const [celebration, setCelebration] = useState(null) // { score, points }
  const [branch, setBranch] = useState(null) // { baseScore }
  const openedAt = useRef(Date.now())

  useEffect(() => { setCurrentTime(0); setResult(null); setCelebration(null); setBranch(null); openedAt.current = Date.now(); window.scrollTo({ top: 0 }) }, [lessonId])
  const onTime = useCallback((t) => setCurrentTime(t), [])
  const onResult = useCallback((v) => setResult(v), [])

  const complete = useCallback(async (score) => {
    if (!lesson || !profile) return
    const topic_scores = {}
    lesson.topics.forEach((t) => { topic_scores[t.id] = score })
    const points = 100 + Math.round(score / 2)
    const firstEver = !db.lessonProgress.some((p) => p.student_id === profile.id && p.status === 'completed')
    const minutes = Math.max(1, Math.round((Date.now() - openedAt.current) / 60000))
    await awardPoints(profile.id, course.id, points, `Completed “${lesson.title}”`)
    await upsertLessonProgress(profile.id, lesson.id, { status: 'completed', score, topic_scores, completed_at: new Date().toISOString(), time_spent_min: (progress?.time_spent_min || 0) + minutes })
    if (firstEver) awardBadge(profile.id, 'first-bolt', `Completed “${lesson.title}”`)
    setCelebration({ score, points })
    if (score < 60) setBranch({ baseScore: score })
  }, [lesson, profile, course, db.lessonProgress, progress, awardPoints, upsertLessonProgress, awardBadge])

  const onBranchFinish = useCallback(async ({ newScore }) => {
    const topic_scores = {}
    lesson.topics.forEach((t) => { topic_scores[t.id] = newScore })
    await awardPoints(profile.id, course.id, 40, `Extra practice branch · ${lesson.topics[0].name}`)
    await upsertLessonProgress(profile.id, lesson.id, { status: 'completed', score: newScore, topic_scores })
  }, [lesson, profile, course, awardPoints, upsertLessonProgress])

  if (!lesson || !course) {
    return <EmptyState icon={BookOpen} title="Lesson not found" text="This checkpoint does not exist on your journey." action={<Button to="/student/courses"><Map size={16} /> Back to my courses</Button>} />
  }

  return (
    <div className="space-y-8">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-charcoal-400 !mb-0 -mt-2">
        <Link to="/student/courses" className="hover:text-charcoal">My courses</Link><ChevronRight size={14} />
        <Link to={`/student/courses/${courseId}`} className="hover:text-charcoal font-semibold" style={{ color: course.color }}>{course.title}</Link><ChevronRight size={14} />
        <span className="text-charcoal font-semibold truncate">Checkpoint {lesson.position}</span>
      </nav>

      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 !mt-4">
        <div className="min-w-0">
          <div className="font-hand text-2xl leading-none mb-1" style={{ color: course.color }}>checkpoint {lesson.position} of {lessons.length}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal">{lesson.title}</h1>
          <p className="text-charcoal-400 mt-2 max-w-2xl">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lesson.topics.map((t) => <span key={t.id} className="rounded-full bg-white border border-charcoal-200 px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-500">{t.name}</span>)}
            <span className="w-px h-4 bg-charcoal-200 mx-1" />
            {lesson.skills.map((s) => <SkillChip key={s} skill={s} />)}
            <span className="inline-flex items-center gap-1 text-xs text-charcoal-400 ml-1"><Clock size={12} /> {lesson.duration_min} min video</span>
            {progress?.status === 'completed' && <Pill tone="success">Completed · {progress.score}%</Pill>}
            {progress?.status === 'in-progress' && <Pill tone="mango">In progress</Pill>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {prevLesson ? <Button to={`/student/courses/${courseId}/lessons/${prevLesson.id}`} variant="secondary" size="sm"><ArrowLeft size={14} /> Previous</Button> : null}
          <Button to={`/student/courses/${courseId}`} variant="secondary" size="sm"><Map size={14} /> Journey</Button>
          {nextLesson ? <Button to={`/student/courses/${courseId}/lessons/${nextLesson.id}`} variant="dark" size="sm">Next <ArrowRight size={14} /></Button> : null}
        </div>
      </div>

      {/* video + tutor */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <VideoPlayer lesson={lesson} currentTime={currentTime} onTime={onTime} />
        <div className="lg:sticky lg:top-24 h-[640px]">
          <TutorChat lesson={lesson} course={course} currentTime={currentTime} studentId={profile.id} />
        </div>
      </div>

      {/* interactive */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="font-hand text-mango text-xl leading-none mb-1">interactive</div>
            <h2 className="text-2xl font-extrabold tracking-tight text-charcoal squiggle">Play with the idea</h2>
          </div>
          <Pill tone="neutral" icon={Puzzle}>{activity?.component?.replace(/-/g, ' ') || 'activity'}</Pill>
        </div>
        <Card className="p-6">
          {activity ? (
            <Interactive component={activity.component} onResult={onResult} lesson={lesson} course={course} prompt={activity.essayPrompt} studentId={profile.id} />
          ) : (
            <EmptyState icon={Puzzle} title="No interactive yet" text="This lesson’s simulation is on its way." />
          )}
        </Card>
      </section>

      {/* checkpoint */}
      {activity?.question && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <div className="font-hand text-mango text-xl leading-none mb-1">prove it</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal squiggle">Checkpoint question</h2>
            </div>
            <span className="text-xs text-charcoal-400 flex items-center gap-1"><Flag size={12} /> 100 + score ÷ 2 points</span>
          </div>
          <CheckpointQuestion lesson={lesson} question={activity.question} result={result} progress={progress} onComplete={complete} />
          {branch && <PracticeBranch lesson={lesson} course={course} studentName={profile.full_name} baseScore={branch.baseScore} onFinish={onBranchFinish} />}
        </section>
      )}

      <Celebration open={!!celebration} score={celebration?.score ?? 0} points={celebration?.points ?? 0} lesson={lesson} courseId={courseId} nextLesson={nextLesson} onClose={() => setCelebration(null)} />
    </div>
  )
}
