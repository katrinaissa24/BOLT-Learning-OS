import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Map, Puzzle, Flag, ArrowRight, ArrowLeft, BookOpen, PlayCircle, GitBranch, Check } from 'lucide-react'
import { Button, Card, Pill, EmptyState } from '../../components/ui'
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
import { cx } from '../../lib/utils'
import { useYouTubeTranscript } from '../../lib/useYouTubeTranscript'

/**
 * A lesson is a deck of slides that fits the screen: Watch → Explore → Prove it (→ Practice when
 * the score is below 60). Every slide stays mounted, so the video position, tutor chat and
 * simulation settings survive flipping back and forth.
 */
export default function Lesson() {
  const { courseId, lessonId } = useParams()
  const { db, awardPoints, upsertLessonProgress, awardBadge, update } = useData()
  const { profile } = useAuth()

  const { lesson, status: transcriptStatus } = useYouTubeTranscript(lessonById(db, lessonId), update)
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
  const [slide, setSlide] = useState(0)
  const openedAt = useRef(Date.now())

  useEffect(() => { setCurrentTime(0); setResult(null); setCelebration(null); setBranch(null); setSlide(0); openedAt.current = Date.now(); window.scrollTo({ top: 0 }) }, [lessonId])
  const onTime = useCallback((t) => setCurrentTime(t), [])
  const onResult = useCallback((v) => setResult(v), [])

  const steps = useMemo(() => {
    const list = [
      { key: 'watch', label: 'Watch', title: 'Watch with your tutor', icon: PlayCircle },
      { key: 'explore', label: 'Explore', title: 'Play with the idea', icon: Puzzle },
    ]
    if (activity?.question) list.push({ key: 'prove', label: 'Prove it', title: 'Checkpoint question', icon: Flag })
    if (branch) list.push({ key: 'practice', label: 'Practice', title: 'Extra practice', icon: GitBranch })
    return list
  }, [activity, branch])

  const last = steps.length - 1
  const go = useCallback((i) => setSlide((s) => Math.max(0, Math.min(last, typeof i === 'function' ? i(s) : i))), [last])
  const goTo = useCallback((key) => { const i = steps.findIndex((s) => s.key === key); if (i >= 0) setSlide(i) }, [steps])

  // ← → flip slides, unless the student is typing or dragging a slider
  useEffect(() => {
    const onKey = (e) => {
      if (celebration) return
      const el = e.target
      if (el?.closest?.('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') go((s) => s + 1)
      if (e.key === 'ArrowLeft') go((s) => s - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, celebration])

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

  const completed = progress?.status === 'completed'
  const step = steps[slide] || steps[0]

  const render = (key, active) => {
    if (key === 'watch') {
      return (
        <div className="h-full grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
          <div className="min-h-[420px] lg:min-h-0"><VideoPlayer lesson={lesson} transcriptStatus={transcriptStatus} currentTime={currentTime} onTime={onTime} active={active} /></div>
          <div className="h-[520px] lg:h-full min-h-0"><TutorChat lesson={lesson} course={course} currentTime={currentTime} studentId={profile.id} /></div>
        </div>
      )
    }
    if (key === 'explore') {
      return (
        <Card className="p-6 min-h-full">
          {activity ? <Interactive component={activity.component} onResult={onResult} lesson={lesson} course={course} prompt={activity.essayPrompt} studentId={profile.id} />
            : <EmptyState icon={Puzzle} title="No interactive yet" text="This lesson’s simulation is on its way." />}
        </Card>
      )
    }
    if (key === 'prove') {
      return (
        <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-center gap-3 py-2">
          <div className="flex items-center justify-between gap-3 text-xs text-charcoal-400">
            <span>Your answer uses what you found on the Explore slide. Flip back any time.</span>
            <span className="flex items-center gap-1 shrink-0"><Flag size={12} /> 100 + score ÷ 2 points</span>
          </div>
          <CheckpointQuestion lesson={lesson} question={activity.question} result={result} progress={progress} onComplete={complete} />
        </div>
      )
    }
    if (key === 'practice' && branch) {
      return <div className="max-w-4xl mx-auto w-full py-2"><PracticeBranch lesson={lesson} course={course} studentName={profile.full_name} baseScore={branch.baseScore} onFinish={onBranchFinish} /></div>
    }
    return null
  }

  return (
    <div className="flex flex-col gap-4 -mt-2 h-[calc(100dvh-7rem)] md:h-[calc(100dvh-8rem)] min-h-[560px]">
      {/* top bar: where you are + the slide stepper */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 shrink-0">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-xs text-charcoal-400">
            <Link to={`/student/courses/${courseId}`} className="font-semibold hover:underline" style={{ color: course.color }}>{course.title}</Link>
            <ChevronRight size={12} />
            <span>Checkpoint {lesson.position} of {lessons.length}</span>
            {completed && <Pill tone="success" className="ml-1">Completed · {progress.score}%</Pill>}
          </nav>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-charcoal truncate">{lesson.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ol className="flex items-center gap-1 rounded-2xl bg-charcoal-100 p-1" aria-label="Lesson slides">
            {steps.map((s, i) => {
              const isActive = i === slide
              const done = (s.key === 'prove' && completed) || i < slide
              return (
                <li key={s.key}>
                  <button type="button" onClick={() => go(i)} aria-current={isActive ? 'step' : undefined}
                    className={cx('flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all', isActive ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-400 hover:text-charcoal')}>
                    <span className={cx('w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold', isActive ? 'bg-mango text-white' : done ? 'bg-success text-white' : 'bg-white text-charcoal-400')}>
                      {done && !isActive ? <Check size={12} /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <Button to={`/student/courses/${courseId}`} variant="secondary" size="sm"><Map size={14} /> Journey</Button>
        </div>
      </header>

      {/* slides: one thing at a time */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {steps.map((s, i) => (
          <section key={s.key} aria-label={s.title} aria-hidden={i !== slide} inert={i !== slide}
            className="absolute inset-0 overflow-y-auto overscroll-contain p-1 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(${(i - slide) * 104}%)`, opacity: i === slide ? 1 : 0 }}>
            {render(s.key, i === slide)}
          </section>
        ))}
      </div>

      {/* bottom navigation */}
      <footer className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex-1 flex">
          {slide > 0
            ? <Button variant="secondary" onClick={() => go(slide - 1)}><ArrowLeft size={16} /> {steps[slide - 1].label}</Button>
            : prevLesson ? <Button variant="ghost" to={`/student/courses/${courseId}/lessons/${prevLesson.id}`}><ArrowLeft size={16} /> Previous checkpoint</Button> : null}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-charcoal-400">
          <step.icon size={14} className="text-mango" /> <span className="font-semibold text-charcoal">{step.title}</span>
          <span>· {slide + 1} / {steps.length}</span>
          <span className="hidden md:inline">· use ← → to flip</span>
        </div>
        <div className="flex-1 flex justify-end">
          {slide < last
            ? <Button onClick={() => go(slide + 1)}>Next: {steps[slide + 1].label} <ArrowRight size={16} /></Button>
            : completed && nextLesson
              ? <Button to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>Next checkpoint <ArrowRight size={16} /></Button>
              : <Button variant="dark" to={`/student/courses/${courseId}`}><Map size={16} /> Back to journey</Button>}
        </div>
      </footer>

      <Celebration open={!!celebration} score={celebration?.score ?? 0} points={celebration?.points ?? 0} lesson={lesson} courseId={courseId} nextLesson={nextLesson}
        onClose={() => setCelebration(null)} onBranch={() => setTimeout(() => goTo('practice'), 0)} />
    </div>
  )
}
