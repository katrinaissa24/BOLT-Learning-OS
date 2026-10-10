import { studentsOf, studentOverview, attendanceSummary, studentBadges, lessonById, courseById } from '../../lib/selectors'
import { fmtTime } from '../../lib/utils'

/**
 * Data digests the AI reads to write progress insights about one student or the whole class.
 * Each digest is plain text built only from what BOLT collected, so the AI never has to invent facts.
 */
export function studentDigest(db, studentId) {
  const s = db.profiles.find((p) => p.id === studentId)
  const ov = studentOverview(db, studentId)
  const att = attendanceSummary(db, studentId)
  const badges = studentBadges(db, studentId)
  const qs = db.chatMessages.filter((m) => m.student_id === studentId && m.role === 'user').sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
  const subs = db.submissions.filter((x) => x.student_id === studentId)
  const pts = db.pointEvents.filter((e) => e.student_id === studentId)
  const sept = pts.filter((e) => String(e.created_at).startsWith('2026-09')).reduce((a, e) => a + e.points, 0)
  const oct = pts.filter((e) => String(e.created_at).startsWith('2026-10')).reduce((a, e) => a + e.points, 0)
  const lines = [
    `Student: ${s.full_name} (${s.title}). Overall status: ${ov.status}. Average score ${ov.avgScore}%. Points: ${ov.totalPoints} total (${sept} in September, ${oct} so far in October).`,
    ...ov.courses.map((c) => {
      const course = courseById(db, c.courseId)
      const scores = c.rows.filter((r) => r.progress?.status === 'completed').map((r) => `${r.lesson.position}. ${r.lesson.title} ${r.progress.score}%`).join('; ')
      return `${course.subject}: ${c.completed}/${c.total} checkpoints (class expected at ${c.expected}), status ${c.status}, avg ${c.avgScore || '—'}%, ${c.timeSpent} min spent. Lesson scores: ${scores || 'none yet'}. Now on: ${c.currentLesson?.title || 'journey complete'}.`
    }),
    `Weak topics (<60%): ${ov.weakTopics.map((t) => `${t.name} ${t.score}%`).join(', ') || 'none'}.`,
    `Strong topics (≥80%): ${ov.courses.flatMap((c) => c.strongTopics).slice(0, 6).map((t) => `${t.name} ${t.score}%`).join(', ') || 'none'}.`,
    `Attendance: ${att.rate}% (${att.absent} absent, ${att.late} late, current streak ${att.streak} days).${att.flags.length ? ` Record conflicts: ${att.flags.map((f) => f.note).join(' ')}` : ''}`,
    `Questions asked to the AI tutor (${qs.length}): ${qs.map((q) => `[${lessonById(db, q.lesson_id)?.title} @${fmtTime(q.video_t)}] "${q.content}"`).join(' | ') || 'none'}.`,
    `Essays: ${subs.map((x) => `"${x.title}" status ${x.status}${x.grade != null ? `, grade ${x.grade}/20` : ''}, ${x.metrics?.words ?? '?'} words, pasted ${x.metrics?.pasted_chars ?? 0} chars, AI share ${Math.round((x.ai_usage?.share_of_text || 0) * 100)}%`).join('; ') || 'none'}.`,
    `Passport stamps (${badges.length}): ${badges.map((b) => b.badge.name).join(', ') || 'none'}.`,
  ]
  return { student: s, ov, att, qs, subs, oct, sept, text: lines.join('\n') }
}

export function classDigest(db) {
  return studentsOf(db).map((s) => {
    const ov = studentOverview(db, s.id)
    const att = attendanceSummary(db, s.id)
    const qn = db.chatMessages.filter((m) => m.student_id === s.id).length
    return `${s.full_name}: ${ov.status}, avg ${ov.avgScore}%, ${ov.courses.map((c) => `${courseById(db, c.courseId).subject} ${c.completed}/${c.total}`).join(', ')}, weakest ${ov.weakTopics.slice(0, 2).map((t) => `${t.name} ${t.score}%`).join(' & ') || '—'}, attendance ${att.rate}%, ${qn} tutor questions`
  }).join('\n')
}

/** Demo-mode answer built from the same data. */
export function studentFallback(d) {
  const first = d.student.full_name.split(' ')[0]
  const best = [...d.ov.courses].sort((a, b) => b.avgScore - a.avgScore)[0]
  const worst = [...d.ov.courses].sort((a, b) => a.avgScore - b.avgScore)[0]
  const weak = d.ov.weakTopics.slice(0, 3)
  // compare points per day: September is a full month, October has run 9 days (demo "today" is Oct 9)
  const trend = d.oct / 9 >= (d.sept / 30) * 0.8 ? 'keeping pace in October' : 'slowing down in October'
  return `${first} is ${d.ov.status.replace('-', ' ')} overall with a ${d.ov.avgScore}% average, strongest in ${subject(best)} (${best.avgScore}%) and weakest in ${subject(worst)} (${worst.avgScore || '—'}%). ${d.oct} points so far this month against ${d.sept} in September — ${trend}. Attendance is ${d.att.rate}%${d.att.absent ? ` with ${d.att.absent} absence${d.att.absent > 1 ? 's' : ''}` : ''}.

${weak.length ? `What is holding ${first} back: ${weak.map((t) => `${t.name} (${t.score}%)`).join(', ')}.` : `No topic is below 60%.`} ${d.qs.length ? `${first} asked the tutor ${d.qs.length} question${d.qs.length > 1 ? 's' : ''}, most recently “${d.qs[d.qs.length - 1].content}” — a good window into the confusion.` : `${first} has not asked the tutor anything yet — possibly a silent struggle.`}

Next steps:
• ${weak[0] ? `Assign the extra-practice branch on ${weak[0].name}.` : 'Offer a stretch task or a peer-mentor role.'}
• ${worst.currentLesson ? `Check in on “${worst.currentLesson.title}” in ${subject(worst)}.` : 'Celebrate the finished journey publicly.'}
• ${d.att.absent >= 2 ? 'Talk about the absences with the family this week.' : 'Recognise one concrete win in class.'}`
}
const subject = (c) => ({ 'math-12': 'Math', 'phy-12': 'Physics', 'eng-12': 'English' }[c.courseId] || c.courseId)

export function classFallback(db) {
  const rows = studentsOf(db).map((s) => ({ s, ov: studentOverview(db, s.id) }))
  const risk = rows.filter((r) => r.ov.status === 'at-risk' || r.ov.status === 'behind')
  const ahead = rows.filter((r) => r.ov.status === 'ahead')
  const topics = {}
  rows.forEach((r) => r.ov.weakTopics.forEach((t) => { topics[t.name] = (topics[t.name] || 0) + 1 }))
  const common = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 3)
  return `${risk.length} of ${rows.length} students need attention: ${risk.map((r) => `${r.s.full_name.split(' ')[0]} (${r.ov.status}, ${r.ov.avgScore}%)`).join(', ') || 'nobody'}. ${ahead.length} ${ahead.length === 1 ? 'is' : 'are'} ahead: ${ahead.map((r) => r.s.full_name.split(' ')[0]).join(', ') || 'none'}.

Shared weak spots: ${common.map(([n, c]) => `${n} (${c} students)`).join(', ') || 'none'}. These are the best targets for a whole-class re-teach.

Next steps: a 1:1 check-in with each at-risk student this week, a 10-minute re-teach on ${common[0]?.[0] || 'the weakest topic'}, and pair ${ahead[0]?.s.full_name.split(' ')[0] || 'a strong student'} as a peer mentor.`
}
