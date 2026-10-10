/**
 * Suggested teacher features (proposed ideas, not requested). Every rendering of these shows <SuggestedTag />.
 * `built` ideas have a working visualisation on top of real selector data; `stub` ideas are described cards.
 */
export const TEACHER_IDEAS = [
  { id: 'exam-risk', icon: 'target', title: 'Exam risk forecast', status: 'built', text: 'Projects each student’s exam score from current topic mastery and pace, with a confidence band that widens when little evidence exists.' },
  { id: 'peer-mentor', icon: 'users', title: 'Peer mentor matcher', status: 'built', text: 'Pairs a student who mastered a topic (≥85%) with a classmate who is struggling on that same topic, so help is specific, not generic.' },
  { id: 'reteach', icon: 'presentation', title: 'Lesson re-teach planner', status: 'built', text: 'Turns the stuck points of a lesson into a 10-minute re-teach mini-plan: hook, misconception, worked example, quick check.' },
  { id: 'parent-nudge', icon: 'mail', title: 'Parent nudge composer', status: 'stub', text: 'AI drafts a warm, specific message to the parent of a struggling student — what is happening, why it matters, one thing to do this week.' },
  { id: 'energy-pulse', icon: 'activity', title: 'Class energy pulse', status: 'stub', text: 'A weekly engagement trend built from lesson minutes, tutor questions and Thinking Lab activity, to spot a dip before grades show it.' },
  { id: 'oral-scheduler', icon: 'mic', title: 'Oral defense scheduler', status: 'stub', text: 'Students request a defense on a completed lesson; BOLT proposes 8-minute slots in free periods and prepares three follow-up questions.' },
]

/** Fallback copy for the parent nudge (used on stub card hover/preview). */
export const PARENT_NUDGE_SAMPLE = `Dear Mr. Nassar, Karim is working on the chain rule this week and it has not clicked yet (38%). Nothing alarming — but 42 days before the exam, one focused 15-minute practice branch at home would make a real difference. I will check in with him on Tuesday. — Rania Haddad`

/** 10-minute re-teach plans keyed by lesson id (fallback when the AI key is not attached). */
export const RETEACH_PLANS = {
  'math-12-l4': [
    { min: '0–2', step: 'Hook', text: 'Show sin(x²) on the board. Ask: “What is inside, what is outside?” Collect hands — most of the class hesitates here (4 questions at 9:00).' },
    { min: '2–5', step: 'Misconception', text: 'Name it out loud: the chain rule is not the product rule. Draw the box for g·h and the nested arrows for g(h(x)) side by side.' },
    { min: '5–8', step: 'Worked example', text: 'Speed example Tarek asked for: temperature along a road T(x), position x(t). dT/dt = dT/dx · dx/dt — the “inner derivative” is just the speed.' },
    { min: '8–10', step: 'Quick check', text: 'Two items on mini whiteboards: d/dx cos(5x) and d/dx (x² + 1)³. Anyone below 2/2 gets the extra-practice branch assigned tonight.' },
  ],
  'math-12-l5': [
    { min: '0–2', step: 'Hook', text: 'Put sin(x)/x at x = 0 on the board. “Is it undefined, or is it 1?” Both hands go up — good.' },
    { min: '2–5', step: 'Misconception', text: 'Epsilon–delta: replace Greek letters with “output tolerance” and “input tolerance”. Karim and Rami asked what delta even is.' },
    { min: '5–8', step: 'Worked example', text: 'L’Hôpital only on 0/0 or ∞/∞ (Dana asked). Do (eˣ − 1)/x then show a case where the rule must not be used.' },
    { min: '8–10', step: 'Quick check', text: 'Three limits on cards: which ones allow L’Hôpital? Sort into two piles as a class.' },
  ],
  'phy-12-l3': [
    { min: '0–2', step: 'Hook', text: 'Push the wall. “Where did my force go?” (Karim’s question at 3:20).' },
    { min: '2–5', step: 'Misconception', text: 'Third-law pairs act on different objects, so they never cancel. Draw the horse and the cart as two separate free-body diagrams.' },
    { min: '5–8', step: 'Worked example', text: 'Elevator problem with the normal force; students predict the scale reading before the reveal.' },
    { min: '8–10', step: 'Quick check', text: 'Each pair draws the FBD for a book on a tilted desk. Swap and critique.' },
  ],
}

export const GENERIC_RETEACH = (lessonTitle, topicName) => [
  { min: '0–2', step: 'Hook', text: `Open with the exact question students asked the tutor about “${topicName}” — read it aloud, no names.` },
  { min: '2–5', step: 'Misconception', text: `Name the likely confusion behind the low score on “${topicName}” and contrast it with the correct idea in one drawing.` },
  { min: '5–8', step: 'Worked example', text: `Redo the key example from “${lessonTitle}” slowly, pausing where the video moved fast.` },
  { min: '8–10', step: 'Quick check', text: 'Two mini-whiteboard items; assign the practice branch to anyone who misses one.' },
]
