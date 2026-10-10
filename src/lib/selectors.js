/**
 * Pure selectors over the DataProvider db. Shared by student, teacher and parent views
 * so every role sees the same numbers.
 */
import { avg, monthKey } from './utils'

export const TODAY = new Date('2026-10-09T12:00:00Z') // demo "today" (hackathon week)
export const CURRENT_MONTH = '2026-10'
export const LAST_MONTH = '2026-09'
export const EXPECTED_COMPLETED = 5 // where the class is expected to be on the 7-checkpoint journey today

export const courseLessons = (db, courseId) => db.lessons.filter((l) => l.course_id === courseId).sort((a, b) => a.position - b.position)
export const studentsOf = (db) => db.profiles.filter((p) => p.role === 'student')
export const profileById = (db, id) => db.profiles.find((p) => p.id === id)
export const lessonById = (db, id) => db.lessons.find((l) => l.id === id)
export const courseById = (db, id) => db.courses.find((c) => c.id === id)
export const badgeById = (db, id) => db.badges.find((b) => b.id === id)

export function progressFor(db, studentId, lessonId) {
  return db.lessonProgress.find((p) => p.student_id === studentId && p.lesson_id === lessonId) || null
}

/** Journey status of a student in a course. */
export function studentCourseSummary(db, studentId, courseId) {
  const lessons = courseLessons(db, courseId)
  const rows = lessons.map((l) => ({ lesson: l, progress: progressFor(db, studentId, l.id) }))
  const completedRows = rows.filter((r) => r.progress?.status === 'completed')
  const completed = completedRows.length
  const scores = completedRows.map((r) => r.progress.score).filter((s) => s != null)
  const avgScore = Math.round(avg(scores))
  const topicScores = []
  completedRows.forEach((r) => {
    Object.entries(r.progress.topic_scores || {}).forEach(([tid, score]) => {
      const topic = r.lesson.topics.find((t) => t.id === tid)
      if (topic) topicScores.push({ id: tid, name: topic.name, score, lessonId: r.lesson.id, lessonTitle: r.lesson.title })
    })
  })
  const weakTopics = topicScores.filter((t) => t.score < 60).sort((a, b) => a.score - b.score)
  const strongTopics = topicScores.filter((t) => t.score >= 80).sort((a, b) => b.score - a.score)
  // longer journeys (e.g. physics with its vectors checkpoint) shift the expected point
  const expected = EXPECTED_COMPLETED + Math.max(0, lessons.length - 7)
  let status = 'on-track'
  if (completed >= expected + 1) status = 'ahead'
  else if (completed <= expected - 3 || (completed > 0 && avgScore < 50)) status = 'at-risk'
  else if (completed <= expected - 2) status = 'behind'
  const current = rows.find((r) => r.progress?.status !== 'completed')
  const points = db.pointEvents.filter((p) => p.student_id === studentId && p.course_id === courseId).reduce((a, b) => a + b.points, 0)
  const timeSpent = completedRows.reduce((a, r) => a + (r.progress.time_spent_min || 0), 0)
  return { courseId, studentId, lessons, rows, completed, expected, total: lessons.length, percent: Math.round((completed / lessons.length) * 100), avgScore, weakTopics, strongTopics, topicScores, status, currentLesson: current?.lesson || null, nextLesson: current?.lesson || null, points, timeSpent }
}

export function studentOverview(db, studentId) {
  const courses = db.courses.map((c) => studentCourseSummary(db, studentId, c.id))
  const worst = ['at-risk', 'behind', 'on-track', 'ahead']
  const status = courses.map((c) => c.status).sort((a, b) => worst.indexOf(a) - worst.indexOf(b))[0]
  return { courses, status, totalPoints: courses.reduce((a, c) => a + c.points, 0), avgScore: Math.round(avg(courses.filter((c) => c.completed).map((c) => c.avgScore))), weakTopics: courses.flatMap((c) => c.weakTopics.map((t) => ({ ...t, courseId: c.courseId }))).sort((a, b) => a.score - b.score) }
}

/** Leaderboard for a course and month ('YYYY-MM'); month=null → all time. */
export function leaderboard(db, courseId, month = CURRENT_MONTH) {
  const totals = new Map()
  db.pointEvents.forEach((e) => {
    if (e.course_id !== courseId) return
    if (month && !String(e.created_at).startsWith(month)) return
    totals.set(e.student_id, (totals.get(e.student_id) || 0) + e.points)
  })
  studentsOf(db).forEach((s) => { if (!totals.has(s.id)) totals.set(s.id, 0) })
  return [...totals.entries()].map(([id, points]) => ({ student: profileById(db, id), points })).filter((r) => r.student).sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }))
}

export function studentBadges(db, studentId) {
  return db.studentBadges.filter((b) => b.student_id === studentId).map((b) => ({ ...b, badge: badgeById(db, b.badge_id) })).filter((b) => b.badge)
}

export function attendanceSummary(db, studentId) {
  const rows = db.attendance.filter((a) => a.student_id === studentId).sort((a, b) => a.date.localeCompare(b.date))
  const count = (s) => rows.filter((r) => r.status === s).length
  const present = count('present'), late = count('late'), absent = count('absent'), excused = count('excused')
  let streak = 0
  for (let i = rows.length - 1; i >= 0; i--) { if (rows[i].status === 'present') streak++; else break }
  const flags = rows.filter((r) => r.flag)
  const months = {}
  rows.forEach((r) => { const m = r.date.slice(0, 7); months[m] = months[m] || { total: 0, clean: 0 }; months[m].total++; if (r.status === 'present') months[m].clean++ })
  const perfectMonths = Object.entries(months).filter(([m, v]) => v.total === v.clean && m !== CURRENT_MONTH).map(([m]) => m)
  const rate = rows.length ? Math.round(((present + late + excused) / rows.length) * 100) : 100
  return { rows, present, late, absent, excused, rate, streak, flags, perfectMonths, total: rows.length, recentAbsences: rows.filter((r) => r.status === 'absent').slice(-3) }
}

/** Per-lesson teacher insights: questions, stuck points by timestamp, topic performance. */
export function lessonInsights(db, lessonId) {
  const lesson = lessonById(db, lessonId)
  if (!lesson) return null
  const questions = db.chatMessages.filter((m) => m.lesson_id === lessonId && m.role === 'user')
  const bucket = 60
  const stuck = {}
  questions.forEach((qm) => { const b = Math.floor((qm.video_t || 0) / bucket) * bucket; stuck[b] = (stuck[b] || 0) + 1 })
  const stuckPoints = Object.entries(stuck).map(([t, n]) => ({ t: Number(t), count: n, transcript: lesson.transcript.filter((s) => s.t >= Number(t) && s.t < Number(t) + bucket).map((s) => s.text).join(' ') })).sort((a, b) => b.count - a.count)
  const byTopic = {}
  questions.forEach((qm) => { byTopic[qm.topic] = byTopic[qm.topic] || []; byTopic[qm.topic].push(qm) })
  const progress = db.lessonProgress.filter((p) => p.lesson_id === lessonId && p.status === 'completed')
  const topicAvg = lesson.topics.map((t) => ({ ...t, avg: Math.round(avg(progress.map((p) => p.topic_scores?.[t.id]).filter((v) => v != null))), questions: (byTopic[t.id] || []).length }))
  const avgScore = Math.round(avg(progress.map((p) => p.score)))
  const avgTime = Math.round(avg(progress.map((p) => p.time_spent_min || 0)))
  const patterns = []
  topicAvg.forEach((t) => {
    if (t.questions >= 3 && t.avg < 65) patterns.push({ type: 'stuck', topic: t, text: `${t.questions} students asked about “${t.name}” and the class averages ${t.avg}% on it — re-teach this before moving on.` })
    else if (t.questions >= 3) patterns.push({ type: 'curious', topic: t, text: `“${t.name}” generates many questions (${t.questions}) but scores stay healthy (${t.avg}%) — curiosity, not confusion.` })
    else if (t.avg && t.avg < 55) patterns.push({ type: 'silent-struggle', topic: t, text: `Low scores on “${t.name}” (${t.avg}%) with almost no questions — students may not know what they don’t know.` })
  })
  if (stuckPoints[0] && stuckPoints[0].count >= 3) patterns.push({ type: 'timestamp', text: `Most questions cluster around ${Math.floor(stuckPoints[0].t / 60)}:00–${Math.floor(stuckPoints[0].t / 60) + 1}:00 of the video: “${stuckPoints[0].transcript.slice(0, 90)}…”` })
  return { lesson, questions, stuckPoints, byTopic, topicAvg, avgScore, avgTime, completedCount: progress.length, patterns }
}

/** Class overview for the teacher tracker. */
export function classOverview(db, courseId) {
  const rows = studentsOf(db).map((s) => ({ student: s, summary: studentCourseSummary(db, s.id, courseId), attendance: attendanceSummary(db, s.id), badges: studentBadges(db, s.id).length }))
  const counts = { ahead: 0, 'on-track': 0, behind: 0, 'at-risk': 0 }
  rows.forEach((r) => counts[r.summary.status]++)
  const topicHeat = {}
  rows.forEach((r) => r.summary.topicScores.forEach((t) => { topicHeat[t.id] = topicHeat[t.id] || { ...t, scores: [] }; topicHeat[t.id].scores.push(t.score) }))
  const topics = Object.values(topicHeat).map((t) => ({ id: t.id, name: t.name, lessonId: t.lessonId, lessonTitle: t.lessonTitle, avg: Math.round(avg(t.scores)), n: t.scores.length, struggling: t.scores.filter((s) => s < 60).length })).sort((a, b) => a.avg - b.avg)
  return { rows, counts, topics, avgScore: Math.round(avg(rows.filter((r) => r.summary.completed).map((r) => r.summary.avgScore))), avgCompleted: avg(rows.map((r) => r.summary.completed)) }
}

/** Automated pattern recognition on badges: who needs encouragement vs recognition. */
export function recognitionPatterns(db) {
  const list = studentsOf(db).map((s) => {
    const badges = studentBadges(db, s.id)
    const ov = studentOverview(db, s.id)
    const att = attendanceSummary(db, s.id)
    const recent = badges.filter((b) => b.earned_at >= '2026-10-01').length
    return { student: s, badges, badgeCount: badges.length, recentBadges: recent, overview: ov, attendance: att }
  })
  const median = [...list].sort((a, b) => a.badgeCount - b.badgeCount)[Math.floor(list.length / 2)]?.badgeCount || 1
  return list.map((r) => {
    let pattern = 'steady'
    let message = `${r.student.full_name.split(' ')[0]} is progressing normally.`
    if (r.badgeCount >= median * 2 || r.recentBadges >= 2) { pattern = 'recognize'; message = `${r.badgeCount} stamps (${r.recentBadges} this month) — give public recognition in class or nominate for a school showcase.` }
    else if (r.badgeCount <= 1 && r.overview.status !== 'ahead') { pattern = 'encourage'; message = `Only ${r.badgeCount} stamp${r.badgeCount === 1 ? '' : 's'} and status “${r.overview.status}” — a short 1:1 check-in and one achievable goal this week would help.` }
    else if (r.badgeCount <= 1 && r.overview.status === 'ahead') { pattern = 'invisible'; message = `Strong scores but almost no stamps — invite to a Thinking Lab challenge or an oral defense so the work gets seen.` }
    else if (r.attendance.perfectMonths.length && r.badgeCount < median) { pattern = 'consistency'; message = `Perfect attendance but few stamps — reward consistency and suggest a project.` }
    return { ...r, pattern, message }
  }).sort((a, b) => ['encourage', 'invisible', 'recognize', 'consistency', 'steady'].indexOf(a.pattern) - ['encourage', 'invisible', 'recognize', 'consistency', 'steady'].indexOf(b.pattern))
}

/** Parent lens: what my child understands, what's next, and intervention alerts. */
export function parentLens(db, childId) {
  const child = profileById(db, childId)
  const ov = studentOverview(db, childId)
  const att = attendanceSummary(db, childId)
  const badges = studentBadges(db, childId)
  const alerts = []
  ov.courses.forEach((c) => {
    const course = courseById(db, c.courseId)
    const daysToExam = Math.round((new Date(course.exam_date) - TODAY) / 86400000)
    c.weakTopics.slice(0, 2).forEach((t) => alerts.push({ level: t.score < 45 ? 'high' : 'medium', courseId: c.courseId, course: course.title, topic: t.name, score: t.score, lessonId: t.lessonId, daysToExam, text: `${t.name} is at ${t.score}% with ${daysToExam} days until the ${course.subject} exam.`, action: `Ask ${child.full_name.split(' ')[0]} to run the extra-practice branch for “${t.lessonTitle}” this week; it takes about 15 minutes.` }))
    if (c.status === 'behind' || c.status === 'at-risk') alerts.push({ level: c.status === 'at-risk' ? 'high' : 'medium', courseId: c.courseId, course: course.title, text: `${course.title}: ${c.completed}/${c.total} checkpoints done, class is expected at ${c.expected}.`, action: 'Set a 30-minute BOLT session twice this week to catch up one checkpoint at a time.' })
  })
  if (att.absent >= 3) alerts.push({ level: 'high', text: `${att.absent} absences since September.`, action: 'Talk about what is getting in the way of attending; the school can help.' })
  if (att.streak >= 20) alerts.push({ level: 'good', text: `${att.streak} school days in a row with a clean attendance record.`, action: 'Say it out loud at dinner — consistency is a skill.' })
  const wins = []
  ov.courses.forEach((c) => c.strongTopics.slice(0, 2).forEach((t) => wins.push({ courseId: c.courseId, text: `${t.name} (${t.score}%)` })))
  return { child, overview: ov, attendance: att, badges, alerts: alerts.sort((a, b) => ['high', 'medium', 'good'].indexOf(a.level) - ['high', 'medium', 'good'].indexOf(b.level)), wins }
}

export const currentMonthKey = () => CURRENT_MONTH
export { monthKey }
