/**
 * Parent-side helpers: translate scores into words, compute exam readiness,
 * and compose the plain-language hero sentence from parentLens() output.
 * Pure functions — no React here.
 */
import { TODAY, courseById } from '../../lib/selectors'

/** Score → human word. Parents read words first, numbers second. */
export function masteryWord(score) {
  if (score >= 90) return 'solid'
  if (score >= 80) return 'strong'
  if (score >= 70) return 'forming'
  if (score >= 60) return 'getting there'
  if (score >= 45) return 'fragile'
  return 'needs help'
}

/** Group a course's topic scores into the three parent columns. */
export function bandTopics(topicScores) {
  const understands = topicScores.filter((t) => t.score >= 80).sort((a, b) => b.score - a.score)
  const working = topicScores.filter((t) => t.score >= 60 && t.score < 80).sort((a, b) => b.score - a.score)
  const needsHelp = topicScores.filter((t) => t.score < 60).sort((a, b) => a.score - b.score)
  return { understands, working, needsHelp }
}

export const daysUntil = (iso) => Math.round((new Date(iso) - TODAY) / 86400000)

/**
 * Exam readiness 0–100. Weighted average of topic mastery (weak topics count
 * double because they are what the exam will expose), nudged by journey progress.
 */
export function examReadiness(summary) {
  const topics = summary.topicScores
  if (!topics.length) return 0
  let num = 0, den = 0
  topics.forEach((t) => { const w = t.score < 60 ? 2 : 1; num += t.score * w; den += w })
  const mastery = num / den
  const progress = summary.completed / summary.total // 0..1
  return Math.round(Math.max(0, Math.min(100, mastery * 0.85 + progress * 100 * 0.15)))
}

export function readinessSentence(first, readiness, daysToExam, weakCount) {
  if (readiness >= 85) return `${first} would walk into this exam ready today. Keep the rhythm; nothing to fix.`
  if (readiness >= 70) return weakCount ? `${first} is mostly ready. ${weakCount === 1 ? 'One topic' : `${weakCount} topics`} would cost marks today — ${daysToExam} days is plenty of time to fix ${weakCount === 1 ? 'it' : 'them'}.` : `${first} is in good shape. A little review each week keeps it that way.`
  if (readiness >= 55) return `${first} would pass but leave marks on the table. The weak topics below are exactly where to spend the next two weeks.`
  return `If the exam were tomorrow, ${first} would struggle. There are ${daysToExam} days — start with the “Needs help” column this week.`
}

/** Pick lowest score as the tone for a readiness meter. */
export function readinessTone(r) { return r >= 80 ? 'success' : r >= 60 ? 'mango' : 'danger' }

const lower = (s) => (/^[A-Z][’'a-z]/.test(s) && s[1] !== '’' && s[1] !== "'") ? s[0].toLowerCase() + s.slice(1) : s
const list = (arr) => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]

/** The plain-language hero paragraph, in three languages (static demo translation). */
export function heroSentences(db, lens) {
  const first = lens.child.full_name.split(' ')[0]
  const courses = lens.overview.courses
  const strong = []
  courses.forEach((c) => c.strongTopics.slice(0, 1).forEach((t) => strong.push(lower(t.name))))
  const weak = lens.overview.weakTopics.slice(0, 3)
  const weakNames = weak.map((t) => lower(t.name))
  const lo = weak.length ? Math.min(...weak.map((t) => t.score)) : 0
  const hi = weak.length ? Math.max(...weak.map((t) => t.score)) : 0
  // the course whose exam is soonest among those with weak topics
  const weakCourseIds = [...new Set(weak.map((t) => t.courseId))]
  const soonest = weakCourseIds.map((id) => courseById(db, id)).sort((a, b) => daysUntil(a.exam_date) - daysUntil(b.exam_date))[0]
  const days = soonest ? daysUntil(soonest.exam_date) : null
  const range = lo === hi ? `${lo}%` : `${lo}–${hi}%`

  const en = weak.length
    ? `${first} understands ${list(strong)} well. She is working on ${list(weakNames)}, which ${weak.length === 1 ? 'is' : 'are'} at ${range}. The ${soonest.subject} exam is in ${days} days — this is the right time to help.`
    : `${first} understands ${list(strong)} well and has no topic below 60%. The next exam is in ${Math.min(...db.courses.map((c) => daysUntil(c.exam_date)))} days; a short review each week is all she needs.`
  const ar = weak.length
    ? `${first} تفهم ${list(strong)} جيداً. وهي تعمل حالياً على ${list(weakNames)}، وهي مواضيع عند ${range}. امتحان ${soonest.subject === 'Mathematics' ? 'الرياضيات' : soonest.subject === 'Physics' ? 'الفيزياء' : 'الإنجليزية'} بعد ${days} يوماً — هذا هو الوقت المناسب للمساعدة.`
    : `${first} تفهم ${list(strong)} جيداً ولا يوجد موضوع تحت 60%. مراجعة قصيرة كل أسبوع تكفي.`
  const fr = weak.length
    ? `${first} comprend bien ${list(strong)}. Elle travaille encore ${list(weakNames)}, qui ${weak.length === 1 ? 'est' : 'sont'} à ${range}. L’examen de ${soonest.subject === 'Mathematics' ? 'mathématiques' : soonest.subject === 'Physics' ? 'physique' : 'anglais'} est dans ${days} jours — c’est le bon moment pour l’aider.`
    : `${first} comprend bien ${list(strong)} et aucun sujet n’est sous 60 %. Une courte révision chaque semaine suffit.`
  return { en, ar, fr, first, days, soonest, weak, strong }
}

/** Three concrete things to do this week, derived from alerts. */
export function helpThisWeek(lens) {
  const first = lens.child.full_name.split(' ')[0]
  const out = []
  const topicAlerts = lens.alerts.filter((a) => a.topic)
  if (topicAlerts[0]) out.push({ title: `Sit next to ${first} for 15 minutes`, text: `Open the extra-practice branch for “${topicAlerts[0].topic}” together. You don’t need to know the maths — ask her to explain each step out loud.` })
  if (topicAlerts[1]) out.push({ title: `Ask one question about ${lower(topicAlerts[1].topic)}`, text: `“Can you show me a ${lower(topicAlerts[1].topic)} example from your lesson?” Teaching it to you is the fastest way for it to stick.` })
  const good = lens.alerts.find((a) => a.level === 'good')
  if (good) out.push({ title: 'Say what you noticed', text: `${good.text} ${good.action}` })
  if (out.length < 3) out.push({ title: 'Protect two quiet 30-minute slots', text: 'Tuesday and Thursday evening work well for most families. Same time, same place, phone elsewhere.' })
  return out.slice(0, 3)
}

/** Deterministic exam-risk forecast for the next 6 weeks. */
export function riskForecast(readiness, weeks = 6) {
  const rows = []
  for (let w = 0; w <= weeks; w++) {
    rows.push({ week: w === 0 ? 'Now' : `Wk ${w}`, nothing: Math.max(0, Math.round(readiness - w * 1)), practice: Math.min(100, Math.round(readiness + w * 4)) })
  }
  return rows
}
