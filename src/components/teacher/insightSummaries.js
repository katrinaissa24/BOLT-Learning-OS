/** Demo-quality fallback summaries for "Ask AI to summarize" per lesson, plus a data-driven generic one. */
const WRITTEN = {
  'math-12-l4': `Chain rule is the wall this week. Four students (Maya, Karim, Jad, Tarek) asked about it between 8:50 and 10:00 of the video — exactly where the nested-functions idea is introduced — and the class averages well below the other two topics. The questions show two distinct confusions: not knowing which function is “inside” (Karim), and conflating the chain rule with the product rule (Jad). Product rule is healthier: two questions (Sara, Yara) about why the corner piece disappears, with scores holding up — that is curiosity, not confusion. Sum rule needs nothing.

Recommended action: a 10-minute re-teach on Monday that contrasts product vs chain side by side, using Tarek’s request for a “real example like speed”, then assign the chain-rule practice branch to Karim, Tarek and Maya before Thursday.`,
  'math-12-l5': `Two separate pain points. Epsilon–delta (Karim at 5:00, Rami at 4:50) is a “why does this exist” problem rather than a calculation problem — both questions are about purpose, not procedure. L’Hôpital (Maya, Dana) is a healthier kind of question: when is the rule allowed and does it extend to ∞/∞ — those students are testing the boundary of the idea and score well on it.

Recommended action: open the next lesson by reframing epsilon–delta as “input tolerance vs output tolerance” with the drone-altitude example, and give Dana the ∞/∞ extension as a stretch question. No full re-teach needed.`,
  'math-12-l2': `The algebra of the derivative definition is where this lesson loses people. Three students (Maya, Karim, Tarek) asked at 7:20–7:25, right at the “s(t) = t³ gives 3t²” step, and Tarek’s “where did the dt² go” pinpoints the exact line that was skipped. Tangent slope has two questions (Lina, Jad); Jad’s “isn’t it dividing by zero” is the classic limit misconception and matches his low score on this topic.

Recommended action: redo the t³ expansion on the board slowly, keeping the dt² term visible until it vanishes, then give Jad the drone-height practice items.`,
  'phy-12-l3': `Newton’s third law is producing the same misconception from three students: if forces are equal and opposite, why does anything move (Ali, Jad) and where does the force go when a wall doesn’t move (Karim). These cluster at 3:20–5:30. Scores on the third-law and F = ma topics are the lowest in the lesson, so this is a stuck point, not curiosity.

Recommended action: the horse-and-cart demonstration with two separate free-body diagrams, then the mini-whiteboard check. Pair Karim with Nour, who already tutored him on free-body diagrams.`,
  'eng-12-l2': `Questions split by topic. Pathos (Maya, Omar) is about ethics and dosage — “is it manipulative”, “how much is too much” — strong, analytical questions from students scoring well. Thesis statements (Rami, Karim) are more basic: what makes one strong, can it be a question. Both of those students also have the weakest thesis scores and the flagged essays, which fits.

Recommended action: a thesis workshop for the two of them before the essays are revised, using the weak-vs-strong thesis sorting task; and bring Maya’s “honest pathos” question to the whole class as a discussion starter.`,
  'phy-12-l4': `Centripetal acceleration confuses by definition: “if speed is constant how can there be acceleration” (Maya) and “why v² over r and not v over r” (Yara) are both at 3:40–3:50, right after the formula appears. Tarek’s question about centrifugal force being fake comes later and is the lesson’s central provocation working as intended.

Recommended action: a quick vector-drawing exercise (velocity arrows on a circle) before the formula, and the roundabout practice items for Yara and Maya.`,
}

export function summaryFor(insights, courseTitle) {
  if (WRITTEN[insights.lesson.id]) return WRITTEN[insights.lesson.id]
  const { lesson, topicAvg, questions, stuckPoints, completedCount } = insights
  const low = [...topicAvg].filter((t) => t.avg).sort((a, b) => a.avg - b.avg)[0]
  const asked = [...topicAvg].sort((a, b) => b.questions - a.questions)[0]
  const lines = [`${completedCount} of 12 students have completed “${lesson.title}” (${courseTitle}) with a class average of ${insights.avgScore}%.`]
  if (questions.length) lines.push(`${questions.length} question${questions.length > 1 ? 's were' : ' was'} asked to the tutor${asked?.questions ? `, mostly about “${asked.name}”` : ''}${stuckPoints[0] ? `, clustering around ${Math.floor(stuckPoints[0].t / 60)}:00 of the video` : ''}.`)
  else lines.push('No questions were asked to the tutor — either the lesson is clear or students are not yet using the tutor here.')
  if (low) lines.push(low.avg < 65 ? `“${low.name}” is the weakest topic at ${low.avg}% and deserves a short re-teach or a practice branch for the students below 60%.` : `The weakest topic, “${low.name}”, still averages ${low.avg}% — no re-teach needed.`)
  lines.push('Recommended action: ' + (low && low.avg < 65 ? `re-teach “${low.name}” for 10 minutes next session and assign extra practice to the struggling students.` : 'move on as planned; use the questions above as discussion starters.'))
  return lines.join('\n\n')
}
