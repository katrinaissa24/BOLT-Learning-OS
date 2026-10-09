/**
 * Demo coaching replies for the essay editor when no API key is set.
 * Every reply asks a question back and offers exactly ONE sentence the student may insert.
 */
const SENTENCES = {
  'eng-12-l1': {
    opening: 'The gate is still cold enough to bite when the first bus sighs open.',
    detail: 'Somebody’s football thuds against the wall in a rhythm that nobody is counting.',
    counter: 'By the fountain, two girls share one pair of earphones and say nothing.',
    thesis: 'The courtyard at 7:50 is a room with no ceiling and forty conversations.',
    ending: 'Then the bell, and the whole picture drains through three doors at once.',
  },
  'eng-12-l2': {
    opening: 'Exams were invented for a world with scarce information and expensive teachers; in 2036, neither is true.',
    detail: 'A student who understood calculus all year but froze for three hours in November is recorded as a failure.',
    counter: 'Admittedly, exams are hard to cheat and easy to compare, so any alternative must be equally trustworthy.',
    thesis: 'Schools in 2036 should shrink the exam to a short, verified oral defence and surround it with a year of visible thinking.',
    ending: 'We should test what people can do with knowledge, not only whether they can retrieve it under pressure.',
  },
  'eng-12-l4': {
    opening: 'Learning is a staircase built in the dark: you only see the step once your foot is already on it.',
    detail: 'Some steps are worn smooth by everyone who climbed before you; others you have to pour yourself.',
    counter: 'The staircase has landings, too — places where nothing seems to rise, and that is where the legs grow.',
    thesis: 'If learning is a staircase, then a grade is only a photograph of one step.',
    ending: 'You never reach the top; you just notice one day that the dark is behind you.',
  },
  'eng-12-l6': {
    opening: 'In Beirut, in 2036, nobody is allowed to own the hour between six and seven in the evening.',
    detail: 'The Corniche fills with people who have, by law, nowhere they must be.',
    counter: 'The rule was meant to slow the city; instead it made the hour before it frantic.',
    thesis: 'Nour had broken the Free Hour exactly once, and the city had noticed.',
    ending: 'The sea, which had never kept a schedule, went on doing whatever it wanted.',
  },
}
const GENERIC = {
  opening: 'Start with the moment the reader cannot ignore, then explain why it matters.',
  detail: 'One precise detail persuades more than three general ones.',
  counter: 'The strongest version of the opposing view deserves a full sentence before you answer it.',
  thesis: 'A thesis is a claim someone could disagree with, plus the reason you hold it.',
  ending: 'End on the consequence of your claim, not on a summary of it.',
}

export function coachingFallback({ question, lesson, prompt, draft = '' }) {
  const q = question.toLowerCase()
  const bank = SENTENCES[lesson?.id] || GENERIC
  const wc = draft.trim() ? draft.trim().split(/\s+/).length : 0
  const kind = /counter|against|other side|disagree|oppos|objection/.test(q) ? 'counter'
    : /thesis|argument|claim|main point|position/.test(q) ? 'thesis'
    : /start|open|begin|first|hook|intro/.test(q) ? 'opening'
    : /end|conclu|finish|last|close/.test(q) ? 'ending'
    : /detail|example|evidence|image|sens|show|describ|metaphor|vivid/.test(q) ? 'detail'
    : wc < 40 ? 'opening' : wc > 250 ? 'ending' : 'detail'

  const replies = {
    counter: `Good instinct — a reader trusts you more when you name the best case against you.\n\nBefore I offer anything: **what would a careful person who disagrees with you say first?** Write their sentence, not a weak version of it.\n\nIf it helps, here is one sentence you could insert and then answer in your own words:`,
    thesis: `Let’s check your thesis does two jobs: it takes a position, and it hints at *why*.\n\n**Could someone reasonably disagree with your current sentence?** If not, it is a topic, not a thesis.\n\nHere is one arguable version you could borrow or sharpen:`,
    opening: `Openings are easier once you know the ending — but you don’t need the perfect first line, you need a first line.\n\n**What is the single image or fact your reader cannot ignore?** Lead with that.\n\nOne possible opening sentence for “${prompt}”:`,
    ending: `An ending should land on consequence, not summary.\n\n**If your reader believes you, what changes for them tomorrow?** Say that.\n\nOne closing sentence you could adapt:`,
    detail: `This is where writing gets real: one exact detail beats three vague ones.\n\n**Which sentence in your draft could a reader see, hear or touch? Which one is still a label?** Pick a label and replace it.\n\nHere is one concrete sentence you might use:`,
  }
  return { reply: replies[kind], insert: bank[kind] }
}
