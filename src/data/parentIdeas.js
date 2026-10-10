/**
 * Proposed parent features (suggested, not requested). Each renders as a card on /parent/ideas.
 * `built: true` means the idea has a working demo on the page; the rest are visual stubs.
 */
export const parentIdeas = [
  {
    id: 'digest',
    title: 'Weekly 3-line digest',
    icon: 'message-square',
    channel: 'WhatsApp / email · Friday 17:00',
    description: 'Three sentences every Friday: one win, one thing to watch, one thing to say at dinner. No login needed.',
    mock: { kind: 'digest', lines: ['Win: Maya finished “Building a Fictional World” with 93%.', 'Watch: chain rule is still at 44% — practice branch assigned.', 'Say tonight: “Show me one chain-rule example.”'] },
  },
  {
    id: 'dinner',
    title: 'Dinner-table questions',
    icon: 'utensils',
    channel: 'Generated from this week’s lessons',
    description: 'Three questions you can ask tonight, written so you don’t need to know the subject. Teaching a parent is the strongest re-check.',
    built: true,
  },
  {
    id: 'office-hours',
    title: 'Teacher office-hours booking',
    icon: 'calendar-clock',
    channel: 'Rania Haddad · 10-minute slots',
    description: 'Book a short call straight from an alert. The teacher sees the alert context before the call starts.',
    mock: { kind: 'slots', slots: ['Mon 15:30', 'Tue 16:00', 'Wed 15:30', 'Thu 16:30'], picked: 1 },
  },
  {
    id: 'family-goals',
    title: 'Family learning goals & streaks',
    icon: 'target',
    channel: 'Shared with Maya',
    description: 'Set one goal together (“two practice sessions a week”) and watch the streak grow. Parents see effort, not only scores.',
    mock: { kind: 'streak', goal: '2 practice sessions / week', weeks: [true, true, false, true, true, true] },
  },
  {
    id: 'translate',
    title: 'Translate everything (AR / FR)',
    icon: 'languages',
    channel: 'Whole parent space',
    description: 'Every sentence in the Parent Lens in Arabic or French, including alerts and teacher messages. Already previewed on the hero card.',
    mock: { kind: 'translate', lines: ['Maya understands rhetoric well.', 'مايا تفهم البلاغة جيداً.', 'Maya comprend bien la rhétorique.'] },
  },
  {
    id: 'tutor',
    title: 'Tutor marketplace via EduBolt',
    icon: 'graduation-cap',
    channel: 'EduBolt tutoring platform',
    description: 'When a topic stays below 50% after a re-check, offer a vetted EduBolt tutor for that exact topic — one session, not a subscription.',
    mock: { kind: 'tutor', topic: 'Chain rule', tutors: [{ name: 'Hadi R.', rating: 4.9, note: 'Grade 12 Calculus · 120 sessions' }, { name: 'Maya S.', rating: 4.8, note: 'IB Math AA · 85 sessions' }] },
  },
  {
    id: 'notifications',
    title: 'Spending & attendance notifications',
    icon: 'bell-ring',
    channel: 'Push · same minute',
    description: 'A ping when attendance is marked late or absent, and when the cafeteria card is used — the two things parents ask the school about most.',
    mock: { kind: 'notifs', items: [{ t: '08:04', text: 'Maya checked in · present' }, { t: '12:12', text: 'Cafeteria · 6,500 LBP · salad bar' }, { t: '15:40', text: 'Lesson completed · Physics L4' }] },
  },
]
