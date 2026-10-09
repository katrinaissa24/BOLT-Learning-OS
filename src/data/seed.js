/**
 * BOLT seed data — one school, Grade 12.
 * This is the single source of truth for demo content. `npm run gen:sql` turns it into supabase/seed.sql.
 * IDs are stable so the SQL seed and the local fallback always agree.
 */

export const SCHOOL = {
  name: 'Cedar Ridge International School',
  city: 'Beirut',
  year: '2026–2027',
  term: 'Term 1',
}

export const DEMO_PASSWORD = 'Bolt2036!'

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

/* ───────────────────────── Profiles ───────────────────────── */
export const TEACHER_ID = U(1)
export const PARENT_ID = U(2)
export const MAYA_ID = U(10)

export const profiles = [
  { id: TEACHER_ID, email: 'teacher@bolt.school', full_name: 'Rania Haddad', role: 'teacher', grade: null, avatar: 'RH', child_id: null, title: 'Mathematics, Physics & English Lead · Grade 12' },
  { id: PARENT_ID, email: 'parent@bolt.school', full_name: 'Samir Khalil', role: 'parent', grade: null, avatar: 'SK', child_id: MAYA_ID, title: 'Parent of Maya Khalil' },
  { id: MAYA_ID, email: 'student@bolt.school', full_name: 'Maya Khalil', role: 'student', grade: 12, avatar: 'MK', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(11), email: 'omar.saleh@bolt.school', full_name: 'Omar Saleh', role: 'student', grade: 12, avatar: 'OS', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(12), email: 'lina.aj@bolt.school', full_name: 'Lina Abou Jaoude', role: 'student', grade: 12, avatar: 'LA', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(13), email: 'karim.nassar@bolt.school', full_name: 'Karim Nassar', role: 'student', grade: 12, avatar: 'KN', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(14), email: 'yara.mansour@bolt.school', full_name: 'Yara Mansour', role: 'student', grade: 12, avatar: 'YM', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(15), email: 'jad.fares@bolt.school', full_name: 'Jad Fares', role: 'student', grade: 12, avatar: 'JF', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(16), email: 'nour.haddad@bolt.school', full_name: 'Nour Haddad', role: 'student', grade: 12, avatar: 'NH', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(17), email: 'rami.khoury@bolt.school', full_name: 'Rami Khoury', role: 'student', grade: 12, avatar: 'RK', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(18), email: 'sara.itani@bolt.school', full_name: 'Sara Itani', role: 'student', grade: 12, avatar: 'SI', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(19), email: 'ali.hamdan@bolt.school', full_name: 'Ali Hamdan', role: 'student', grade: 12, avatar: 'AH', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(20), email: 'dana.sleiman@bolt.school', full_name: 'Dana Sleiman', role: 'student', grade: 12, avatar: 'DS', child_id: null, title: 'Grade 12 · Section A' },
  { id: U(21), email: 'tarek.aoun@bolt.school', full_name: 'Tarek Aoun', role: 'student', grade: 12, avatar: 'TA', child_id: null, title: 'Grade 12 · Section A' },
]

export const DEMO_ACCOUNTS = [
  { role: 'student', email: 'student@bolt.school', name: 'Maya Khalil' },
  { role: 'teacher', email: 'teacher@bolt.school', name: 'Rania Haddad' },
  { role: 'parent', email: 'parent@bolt.school', name: 'Samir Khalil' },
]

/* ───────────────────────── Courses ───────────────────────── */
export const courses = [
  {
    id: 'math-12',
    title: 'Calculus: Change & Motion',
    subject: 'Mathematics',
    grade: 12,
    description: 'Derivatives, limits and integrals — learned through real motion, money and shapes you can drag.',
    color: '#FF9900',
    icon: 'sigma',
    teacher_id: TEACHER_ID,
    exam_date: '2026-11-20',
  },
  {
    id: 'eng-12',
    title: 'English: Argument & Craft',
    subject: 'English',
    grade: 12,
    description: 'Rhetoric, voice and structure. Every essay is written inside BOLT so the thinking path counts, not just the final page.',
    color: '#5B7CFA',
    icon: 'feather',
    teacher_id: TEACHER_ID,
    exam_date: '2026-11-24',
  },
  {
    id: 'phy-12',
    title: 'Physics: Mechanics of the Real World',
    subject: 'Physics',
    grade: 12,
    description: 'Motion, forces, gravity, energy and collisions — every lesson has a simulation you can break and fix.',
    color: '#2FA36B',
    icon: 'atom',
    teacher_id: TEACHER_ID,
    exam_date: '2026-11-18',
  },
]

/* ───────────────────────── Lessons ─────────────────────────
 * transcript: [{ t: seconds, text }]  → gives the AI tutor timestamp context
 * topics: granular skills the lesson assesses (used by extra-practice generation)
 * interactive: key of the interactive activity (see src/data/activities.js)
 */
export const lessons = [
  /* ---------- MATH ---------- */
  {
    id: 'math-12-l1', course_id: 'math-12', position: 1,
    title: 'The Essence of Calculus',
    youtube_id: 'WUvTyaaNkzM', duration_min: 17,
    summary: 'Why calculus exists: slicing a circle into rings reveals how area, slope and tiny changes are connected.',
    topics: [{ id: 'area-rings', name: 'Area by slicing into rings' }, { id: 'tiny-changes', name: 'Reasoning with dx' }, { id: 'area-under-graph', name: 'Area under a graph' }],
    skills: ['problem-solving', 'critical-thinking'],
    interactive: 'circle-rings',
    transcript: [
      { t: 0, text: 'The goal: make you feel like you could have invented calculus yourself.' },
      { t: 60, text: 'Take a circle of radius 3. Split it into many thin concentric rings.' },
      { t: 150, text: 'Each ring, straightened out, is almost a rectangle of width dr and length 2πr.' },
      { t: 240, text: 'Adding up all 2πr·dr rectangles is the area under the graph of 2πr — a triangle.' },
      { t: 360, text: 'As dr shrinks, the sum approaches exactly πr². That is the essence of an integral.' },
      { t: 480, text: 'The same question for other graphs leads to the idea of an integral function A(x).' },
      { t: 600, text: 'A tiny change dA is approximately f(x)·dx, so dA/dx = f(x): the derivative.' },
      { t: 780, text: 'Integrals and derivatives are inverses — the fundamental theorem of calculus.' },
      { t: 900, text: 'Recap: tiny slices, approximate rectangles, sums becoming exact.' },
    ],
  },
  {
    id: 'math-12-l2', course_id: 'math-12', position: 2,
    title: 'The Paradox of the Derivative',
    youtube_id: '9vKqVkMQHKk', duration_min: 17,
    summary: 'Instantaneous rate of change sounds impossible. A car’s distance graph shows what the derivative really measures.',
    topics: [{ id: 'rate-of-change', name: 'Average vs instantaneous rate' }, { id: 'tangent-slope', name: 'Slope of the tangent line' }, { id: 'derivative-definition', name: 'Definition of the derivative' }],
    skills: ['problem-solving', 'critical-thinking'],
    interactive: 'tangent-explorer',
    transcript: [
      { t: 0, text: 'A car travels 100 m in 10 s. Its distance-vs-time graph curves upward then flattens.' },
      { t: 90, text: 'Velocity is distance change over a time interval: rise over run between two points.' },
      { t: 200, text: 'Shrink the interval dt. The secant line approaches the tangent line.' },
      { t: 320, text: 'The derivative ds/dt is the slope of that tangent — not a change over zero time.' },
      { t: 440, text: 'Example: s(t) = t³. The derivative works out to 3t².' },
      { t: 560, text: 'At t = 0 the slope is 0. Is the car moving? The paradox of an instant.' },
      { t: 700, text: 'Derivative = best constant approximation for rate of change around a point.' },
      { t: 860, text: 'Next time: deriving formulas like the power rule from geometry.' },
    ],
  },
  {
    id: 'math-12-l3', course_id: 'math-12', position: 3,
    title: 'Derivative Formulas Through Geometry',
    youtube_id: 'S0_qX4VJhMQ', duration_min: 18,
    summary: 'The power rule and the derivative of sine fall out of squares, cubes and the unit circle.',
    topics: [{ id: 'power-rule', name: 'Power rule' }, { id: 'sine-derivative', name: 'Derivative of sin and cos' }, { id: 'geometric-reasoning', name: 'Geometric reasoning with dx' }],
    skills: ['problem-solving', 'creative-thinking'],
    interactive: 'power-rule-square',
    transcript: [
      { t: 0, text: 'A square with side x has area x². Grow the side by dx.' },
      { t: 110, text: 'The new area adds two thin strips (x·dx each) plus a negligible corner.' },
      { t: 220, text: 'So d(x²) = 2x·dx — the derivative of x² is 2x.' },
      { t: 340, text: 'For x³ picture a cube: three square faces give 3x².' },
      { t: 470, text: 'The general power rule: d/dx xⁿ = n·xⁿ⁻¹.' },
      { t: 600, text: 'For sin(θ), walk around the unit circle. A tiny dθ changes the height by cos(θ)·dθ.' },
      { t: 760, text: 'Hence the derivative of sin is cos, and the derivative of cos is −sin.' },
      { t: 900, text: 'Memorising less, seeing more.' },
    ],
  },
  {
    id: 'math-12-l4', course_id: 'math-12', position: 4,
    title: 'Chain Rule & Product Rule',
    youtube_id: 'YG15m2VwSjA', duration_min: 16,
    summary: 'How to differentiate functions that are added, multiplied, or nested inside each other.',
    topics: [{ id: 'sum-rule', name: 'Sum rule' }, { id: 'product-rule', name: 'Product rule' }, { id: 'chain-rule', name: 'Chain rule' }],
    skills: ['problem-solving'],
    interactive: 'product-rule-box',
    transcript: [
      { t: 0, text: 'Three ways to combine functions: add, multiply, compose.' },
      { t: 100, text: 'Sum rule: the derivative of a sum is the sum of derivatives.' },
      { t: 220, text: 'Product rule: picture a box with sides g(x) and h(x). Area changes by g·dh + h·dg.' },
      { t: 400, text: 'Left d-right plus right d-left.' },
      { t: 520, text: 'Chain rule: nested functions. A change dx causes dh, which causes dg.' },
      { t: 660, text: 'd/dx g(h(x)) = g′(h(x))·h′(x). The inner derivative multiplies the outer.' },
      { t: 820, text: 'Example: sin(x²) → cos(x²)·2x.' },
    ],
  },
  {
    id: 'math-12-l5', course_id: 'math-12', position: 5,
    title: 'Limits & L’Hôpital’s Rule',
    youtube_id: 'kfF40MiS7zA', duration_min: 18,
    summary: 'What a limit really promises, and a trick for 0/0 situations that shows up in physics constantly.',
    topics: [{ id: 'limit-intuition', name: 'Limits as approach' }, { id: 'epsilon-delta', name: 'Epsilon–delta idea' }, { id: 'lhopital', name: 'L’Hôpital’s rule' }],
    skills: ['critical-thinking'],
    interactive: 'limit-explorer',
    transcript: [
      { t: 0, text: 'The derivative definition uses a limit as dx approaches 0 — never equals 0.' },
      { t: 130, text: 'A limit exists when inputs close to a value give outputs close to a target.' },
      { t: 280, text: 'Epsilon–delta: for any output tolerance ε there is an input tolerance δ.' },
      { t: 450, text: 'sin(x)/x near 0 is 0/0 — undefined, but the graph clearly heads to 1.' },
      { t: 600, text: 'L’Hôpital: for 0/0, compare the derivatives of top and bottom instead.' },
      { t: 760, text: 'cos(0)/1 = 1. The rule works because near the point both functions are nearly linear.' },
    ],
  },
  {
    id: 'math-12-l6', course_id: 'math-12', position: 6,
    title: 'Integration & the Fundamental Theorem',
    youtube_id: 'rfG8ce4nNh0', duration_min: 21,
    summary: 'From a velocity graph back to distance: area under a curve, antiderivatives and why the +C matters.',
    topics: [{ id: 'riemann-sum', name: 'Area as a sum of rectangles' }, { id: 'antiderivative', name: 'Antiderivatives' }, { id: 'ftc', name: 'Fundamental theorem' }],
    skills: ['problem-solving'],
    interactive: 'riemann-area',
    transcript: [
      { t: 0, text: 'You know the velocity of a car at every moment. How far did it travel?' },
      { t: 150, text: 'Velocity times a tiny time slice is a tiny distance — a thin rectangle.' },
      { t: 300, text: 'Sum the rectangles: the area under the velocity graph equals the distance.' },
      { t: 480, text: 'The antiderivative: a function whose derivative is v(t).' },
      { t: 660, text: 'Fundamental theorem: ∫ from a to b of v(t)dt = s(b) − s(a).' },
      { t: 900, text: 'Negative area means moving backwards.' },
      { t: 1100, text: 'Any antiderivative works — the constant cancels.' },
    ],
  },
  {
    id: 'math-12-l7', course_id: 'math-12', position: 7,
    title: 'Area, Slope & Averages',
    youtube_id: 'FnJqaIESC2s', duration_min: 13,
    summary: 'The average value of a function links area and slope — and explains why derivatives and integrals undo each other.',
    topics: [{ id: 'average-value', name: 'Average value of a function' }, { id: 'area-slope-link', name: 'Area ↔ slope connection' }, { id: 'applied-integral', name: 'Applied integrals' }],
    skills: ['critical-thinking', 'problem-solving'],
    interactive: 'average-value',
    transcript: [
      { t: 0, text: 'What is the average of sin(x) between 0 and π? Infinitely many values…' },
      { t: 120, text: 'Sample finitely many points, average them, then let the samples become infinite.' },
      { t: 260, text: 'The average height = area ÷ width = (1/π)∫sin(x)dx.' },
      { t: 420, text: 'Area is F(π) − F(0) where F is an antiderivative, so average = slope of F.' },
      { t: 560, text: 'That is the deep reason area and slope are inverse ideas.' },
      { t: 700, text: 'Application: average power, average speed, average price.' },
    ],
  },

  /* ---------- ENGLISH ---------- */
  {
    id: 'eng-12-l1', course_id: 'eng-12', position: 1,
    title: 'Writing Descriptively',
    youtube_id: 'RSoRzTtwgP4', duration_min: 5,
    summary: 'Pull a reader inside a scene with the senses, surprising connotations and “show, don’t tell”.',
    topics: [{ id: 'sensory-detail', name: 'Sensory detail' }, { id: 'show-dont-tell', name: 'Show, don’t tell' }, { id: 'connotation', name: 'Connotation & word choice' }],
    skills: ['creative-thinking', 'communication'],
    interactive: 'essay-editor',
    transcript: [
      { t: 0, text: 'Fiction is an illusion. Good writing pulls readers through the page into the story.' },
      { t: 50, text: 'Choose words that engage sound, sight, taste, touch, smell and movement.' },
      { t: 110, text: 'Avoid flat matter-of-fact statements: “it was cold” tells; frost in the air shows.' },
      { t: 170, text: 'Create unexpected connections between story elements to spark imagination.' },
      { t: 230, text: 'Help readers feel what characters feel, not only know what they feel.' },
    ],
  },
  {
    id: 'eng-12-l2', course_id: 'eng-12', position: 2,
    title: 'Rhetoric: Ethos, Logos, Pathos',
    youtube_id: '3klMM9BkW5o', duration_min: 5,
    summary: 'Aristotle’s three appeals and how to build a persuasive essay — and how to notice when they are used on you.',
    topics: [{ id: 'ethos', name: 'Ethos (credibility)' }, { id: 'logos', name: 'Logos (reasoning)' }, { id: 'pathos', name: 'Pathos (emotion)' }, { id: 'thesis', name: 'Thesis statements' }],
    skills: ['critical-thinking', 'communication'],
    interactive: 'essay-editor',
    transcript: [
      { t: 0, text: 'Aristotle: rhetoric is the art of seeing the available means of persuasion.' },
      { t: 40, text: 'Forensic rhetoric is about the past; epideictic about the present; deliberative about the future.' },
      { t: 100, text: 'Ethos convinces the audience of your credibility or virtue.' },
      { t: 140, text: 'Logos uses logic, examples, research and statistics.' },
      { t: 180, text: 'Pathos appeals to emotion — the most common in media and advertising.' },
      { t: 230, text: 'Knowing your audience, purpose, place and time decides which appeal to use.' },
      { t: 260, text: 'Notice when these methods are being used on you.' },
    ],
  },
  {
    id: 'eng-12-l3', course_id: 'eng-12', position: 3,
    title: 'Zombie Nouns & Clear Prose',
    youtube_id: 'dNlkHtMgcPQ', duration_min: 5,
    summary: 'Nominalizations drain life from sentences. Learn to put humans and active verbs back in.',
    topics: [{ id: 'nominalization', name: 'Spotting nominalizations' }, { id: 'active-verbs', name: 'Active verbs & agents' }, { id: 'concision', name: 'Concision' }],
    skills: ['communication'],
    interactive: 'sentence-surgery',
    transcript: [
      { t: 0, text: 'Add -ity, -tion or -ism to a word and you get a noun that sounds impressive but says less.' },
      { t: 60, text: 'Nominalizations cannibalize active verbs and remove human beings from sentences.' },
      { t: 130, text: '“The proliferation of nominalizations…” — seven zombie nouns, no clear actor.' },
      { t: 200, text: 'Rewrite: Writers who overload sentences with nominalizations sound pompous.' },
      { t: 260, text: 'Prefer concrete subjects and verbs that do something.' },
    ],
  },
  {
    id: 'eng-12-l4', course_id: 'eng-12', position: 4,
    title: 'The Art of the Metaphor',
    youtube_id: 'A0edKgL9EgM', duration_min: 6,
    summary: 'Metaphors make handles for ideas. Dickinson, Hughes and Sandburg show how to build one that works.',
    topics: [{ id: 'metaphor-structure', name: 'How metaphors work' }, { id: 'imagery', name: 'Imagery' }, { id: 'figurative-analysis', name: 'Analysing figurative language' }],
    skills: ['creative-thinking', 'critical-thinking'],
    interactive: 'essay-editor',
    transcript: [
      { t: 0, text: 'A metaphor says one thing is another so we can see it fresh.' },
      { t: 70, text: 'Dickinson: “Hope is the thing with feathers” — abstract feeling gets a body.' },
      { t: 140, text: 'Langston Hughes: a dream deferred dries up like a raisin in the sun.' },
      { t: 210, text: 'Carl Sandburg: fog comes on little cat feet.' },
      { t: 280, text: 'A good metaphor is precise, surprising, and makes a handle you can hold.' },
    ],
  },
  {
    id: 'eng-12-l5', course_id: 'eng-12', position: 5,
    title: 'What Makes a Hero?',
    youtube_id: 'Hhk4N9A0oCA', duration_min: 5,
    summary: 'The Hero’s Journey as a structure for stories — and for analysing novels in the exam.',
    topics: [{ id: 'hero-journey', name: 'Stages of the Hero’s Journey' }, { id: 'narrative-structure', name: 'Narrative structure' }, { id: 'character-arc', name: 'Character arc' }],
    skills: ['critical-thinking'],
    interactive: 'story-mapper',
    transcript: [
      { t: 0, text: 'Harry Potter, Frodo, Katniss — what trials unite them?' },
      { t: 60, text: 'Joseph Campbell found the same pattern in myths worldwide: the Hero’s Journey.' },
      { t: 120, text: 'Ordinary world, call to adventure, refusal, mentor, crossing the threshold.' },
      { t: 180, text: 'Trials, approach, crisis, treasure, the road back, the return with change.' },
      { t: 250, text: 'Use the cycle to analyse a text — or to notice your own journey.' },
    ],
  },
  {
    id: 'eng-12-l6', course_id: 'eng-12', position: 6,
    title: 'Building a Fictional World',
    youtube_id: 'ZQTQSbjecLg', duration_min: 5,
    summary: 'Rules, history and daily life make an invented world feel real — and make a short story hold together.',
    topics: [{ id: 'world-rules', name: 'Consistent rules' }, { id: 'setting-detail', name: 'Setting detail' }, { id: 'creative-draft', name: 'Drafting a scene' }],
    skills: ['creative-thinking'],
    interactive: 'essay-editor',
    transcript: [
      { t: 0, text: 'Tolkien and Rowling built worlds with consistent rules for people, societies, even physics.' },
      { t: 60, text: 'Start with a timeline and the big history of the world.' },
      { t: 120, text: 'Then the rules: government, beliefs, technology, magic or science.' },
      { t: 180, text: 'Then daily life — what people eat, fear, celebrate.' },
      { t: 240, text: 'Every detail you decide makes the next scene easier to write.' },
    ],
  },
  {
    id: 'eng-12-l7', course_id: 'eng-12', position: 7,
    title: 'What Makes a Poem a Poem?',
    youtube_id: 'JwhouCNq-Fc', duration_min: 5,
    summary: 'Three recognisable traits of poetry, from Muhammad Ali’s two-word poem to prose poems.',
    topics: [{ id: 'poetic-traits', name: 'Traits of poetry' }, { id: 'sound-devices', name: 'Sound & rhythm' }, { id: 'poem-analysis', name: 'Unseen poem analysis' }],
    skills: ['critical-thinking', 'creative-thinking'],
    interactive: 'poem-lab',
    transcript: [
      { t: 0, text: '“Me. We.” — if two words can be a poem, what makes a poem a poem?' },
      { t: 60, text: 'Poets reach for metaphors: a little machine, a firework, an echo, a dream.' },
      { t: 120, text: 'Trait one: poems emphasise the musical qualities of language.' },
      { t: 170, text: 'Trait two: condensed language — every word carries weight.' },
      { t: 220, text: 'Trait three: intense feeling, often through imagery.' },
      { t: 270, text: 'Shape poems and prose poems bend the rules but keep the traits.' },
    ],
  },

  /* ---------- PHYSICS ---------- */
  {
    id: 'phy-12-l1', course_id: 'phy-12', position: 1,
    title: 'Motion in a Straight Line',
    youtube_id: 'ZM8ECpBuQYE', duration_min: 11,
    summary: 'Position, velocity and acceleration — and how to read them off graphs of a real car.',
    topics: [{ id: 'position-velocity', name: 'Position & velocity' }, { id: 'acceleration', name: 'Acceleration' }, { id: 'kinematic-graphs', name: 'Reading motion graphs' }],
    skills: ['problem-solving'],
    interactive: 'motion-graphs',
    transcript: [
      { t: 0, text: 'Four quantities describe one-dimensional motion: time, position, velocity, acceleration.' },
      { t: 90, text: 'Velocity is the rate of change of position; acceleration the rate of change of velocity.' },
      { t: 200, text: 'A position graph’s slope is velocity. A velocity graph’s slope is acceleration.' },
      { t: 330, text: 'Constant acceleration gives the kinematic equations.' },
      { t: 460, text: 'Average velocity = displacement ÷ time; not the same as average speed.' },
      { t: 580, text: 'Application: was the car speeding? Use the graph to decide.' },
    ],
  },
  {
    id: 'phy-12-l2', course_id: 'phy-12', position: 2,
    title: 'Derivatives in Physics',
    youtube_id: 'ObHJJYvu3RE', duration_min: 10,
    summary: 'Calculus is the language of motion: velocity is the derivative of position, acceleration of velocity.',
    topics: [{ id: 'derivative-motion', name: 'Derivatives of motion' }, { id: 'power-rule-physics', name: 'Power rule in physics' }, { id: 'free-fall', name: 'Free fall & g' }],
    skills: ['problem-solving', 'critical-thinking'],
    interactive: 'free-fall',
    transcript: [
      { t: 0, text: 'Position x(t) = t². Velocity is the derivative: 2t.' },
      { t: 110, text: 'The power rule: bring the exponent down, subtract one.' },
      { t: 220, text: 'Acceleration is the second derivative — for t² it is a constant 2.' },
      { t: 330, text: 'Free fall: a = −9.8 m/s² near Earth, in a vacuum everything falls the same way.' },
      { t: 450, text: 'Air resistance changes the story: terminal velocity.' },
      { t: 540, text: 'Integrating acceleration gives velocity; integrating velocity gives position.' },
    ],
  },
  {
    id: 'phy-12-l3', course_id: 'phy-12', position: 3,
    title: 'Newton’s Laws',
    youtube_id: 'kKKM8Y-u7ds', duration_min: 11,
    summary: 'Inertia, F = ma, and action–reaction — with free-body diagrams you can build yourself.',
    topics: [{ id: 'inertia', name: 'First law: inertia' }, { id: 'f-equals-ma', name: 'Second law: F = ma' }, { id: 'action-reaction', name: 'Third law pairs' }, { id: 'free-body', name: 'Free-body diagrams' }],
    skills: ['problem-solving', 'critical-thinking'],
    interactive: 'force-cart',
    transcript: [
      { t: 0, text: 'Newton published three laws in the Principia in 1687.' },
      { t: 90, text: 'First law: an object stays at rest or in uniform motion unless a net force acts.' },
      { t: 200, text: 'Second law: net force equals mass times acceleration.' },
      { t: 320, text: 'Third law: every force has an equal and opposite partner on the other object.' },
      { t: 430, text: 'The normal force, equilibrium, and the elevator problem.' },
      { t: 560, text: 'Free-body diagrams: draw every force on one object, then sum.' },
    ],
  },
  {
    id: 'phy-12-l4', course_id: 'phy-12', position: 4,
    title: 'Uniform Circular Motion',
    youtube_id: 'bpFK2VCRHUs', duration_min: 10,
    summary: 'Why you lean in a turning car: centripetal acceleration and the “fictitious” centrifugal force.',
    topics: [{ id: 'centripetal', name: 'Centripetal acceleration' }, { id: 'period-frequency', name: 'Period & frequency' }, { id: 'fictitious-force', name: 'Fictitious forces' }],
    skills: ['critical-thinking'],
    interactive: 'circular-motion',
    transcript: [
      { t: 0, text: 'Is centrifugal force real? It is a thing — but a fictitious one.' },
      { t: 100, text: 'An object moving in a circle at constant speed is still accelerating: direction changes.' },
      { t: 220, text: 'Centripetal acceleration = v²/r, pointing to the centre.' },
      { t: 340, text: 'Period T and frequency f: v = 2πr/T.' },
      { t: 450, text: 'In the car, your inertia carries you straight; the door pushes you into the turn.' },
    ],
  },
  {
    id: 'phy-12-l5', course_id: 'phy-12', position: 5,
    title: 'Newtonian Gravity',
    youtube_id: '7gf6YpdvtE0', duration_min: 9,
    summary: 'The apple and the Moon obey the same law. Orbits, g on other planets, and why astronauts float.',
    topics: [{ id: 'universal-gravitation', name: 'Universal gravitation' }, { id: 'orbits', name: 'Orbits' }, { id: 'g-variation', name: 'g on other worlds' }],
    skills: ['problem-solving', 'creative-thinking'],
    interactive: 'orbit-sim',
    transcript: [
      { t: 0, text: 'The apple story is mostly legend — but the insight is real.' },
      { t: 90, text: 'F = G·m₁·m₂ / r². Double the distance, a quarter of the force.' },
      { t: 200, text: 'The Moon is falling toward Earth constantly — it just keeps missing.' },
      { t: 310, text: 'Surface gravity g = G·M / R². On the Moon g is about 1.6 m/s².' },
      { t: 420, text: 'Astronauts float because they and the station fall together.' },
    ],
  },
  {
    id: 'phy-12-l6', course_id: 'phy-12', position: 6,
    title: 'Work, Energy & Power',
    youtube_id: 'w4QFJb9a8vo', duration_min: 10,
    summary: 'Energy is the currency of physics: a roller coaster trades height for speed and friction takes a cut.',
    topics: [{ id: 'work', name: 'Work = F·d' }, { id: 'energy-conservation', name: 'Conservation of energy' }, { id: 'power', name: 'Power' }],
    skills: ['problem-solving'],
    interactive: 'roller-coaster',
    transcript: [
      { t: 0, text: 'Work has a precise meaning: force times displacement along the force.' },
      { t: 110, text: 'Kinetic energy ½mv²; gravitational potential energy mgh.' },
      { t: 230, text: 'Conservation: total energy stays constant unless work is done by friction or a motor.' },
      { t: 350, text: 'Spring potential energy ½kx².' },
      { t: 460, text: 'Power is work per time — watts.' },
    ],
  },
  {
    id: 'phy-12-l7', course_id: 'phy-12', position: 7,
    title: 'Collisions & Momentum',
    youtube_id: 'Y-QOfc2XqOk', duration_min: 9,
    summary: 'Momentum, impulse and why crumple zones save lives — elastic vs inelastic collisions you can run.',
    topics: [{ id: 'momentum', name: 'Momentum = mv' }, { id: 'impulse', name: 'Impulse' }, { id: 'collision-types', name: 'Elastic vs inelastic' }],
    skills: ['problem-solving', 'critical-thinking'],
    interactive: 'collision-lab',
    transcript: [
      { t: 0, text: 'Momentum = mass × velocity. It is conserved in every collision.' },
      { t: 100, text: 'Impulse = force × time = change in momentum.' },
      { t: 210, text: 'Crumple zones lengthen the collision time, lowering the force on you.' },
      { t: 320, text: 'Elastic collisions conserve kinetic energy; inelastic ones do not.' },
      { t: 430, text: 'Centre of mass: the point that moves as if all mass were there.' },
    ],
  },
]

/* ───────────────────────── Skills & Badges (passport stamps) ───────────────────────── */
export const SKILLS = {
  'critical-thinking': { name: 'Critical Thinking', color: '#5B7CFA' },
  'problem-solving': { name: 'Problem Solving', color: '#FF9900' },
  'creative-thinking': { name: 'Creative Thinking', color: '#E255A1' },
  communication: { name: 'Communication', color: '#2FA36B' },
  collaboration: { name: 'Collaboration', color: '#8B5CF6' },
  consistency: { name: 'Consistency', color: '#0EA5E9' },
  'ai-literacy': { name: 'AI Literacy', color: '#353B48' },
}

export const badges = [
  { id: 'first-bolt', name: 'First Bolt', category: 'Milestone', skill: 'consistency', icon: 'zap', rarity: 'common', description: 'Completed your first lesson journey checkpoint.', how_to_earn: 'Finish any lesson, including its interactive question.' },
  { id: 'always-here', name: 'Always Here', category: 'Consistency', skill: 'consistency', icon: 'calendar-check', rarity: 'uncommon', description: 'A full month with a straight attendance record — no absences, no lates.', how_to_earn: 'Keep a clean attendance record for a whole calendar month.' },
  { id: 'monthly-podium', name: 'Monthly Podium', category: 'Challenge', skill: 'problem-solving', icon: 'trophy', rarity: 'rare', description: 'Finished in the top 3 of a course leaderboard at the end of a month.', how_to_earn: 'Earn points by completing lessons, practice branches and lab challenges. Top 3 per course each month get stamped.' },
  { id: 'oral-defender', name: 'Oral Defender', category: 'Verified Demonstration', skill: 'communication', icon: 'mic', rarity: 'rare', description: 'Defended a solution out loud to the teacher and answered follow-up questions.', how_to_earn: 'Request an oral defense on any completed lesson; the teacher validates it.' },
  { id: 'project-proof', name: 'Project Proof', category: 'Verified Demonstration', skill: 'creative-thinking', icon: 'hammer', rarity: 'rare', description: 'Built a real project tagged to the skills it proves, validated by a teacher.', how_to_earn: 'Submit a project in Project Showcase with skill tags. Earned when a teacher validates it.' },
  { id: 'critical-eye', name: 'Critical Eye', category: 'Thinking Lab', skill: 'critical-thinking', icon: 'search', rarity: 'uncommon', description: 'Caught planted errors in confident AI answers five times.', how_to_earn: 'Win 5 rounds of Spot the Flaw.' },
  { id: 'explainer', name: 'Explainer', category: 'Thinking Lab', skill: 'communication', icon: 'message-circle', rarity: 'uncommon', description: 'Reached “deep understanding” in Explain Back three times.', how_to_earn: 'Answer the why / what-if / new-scenario follow-ups with evidence in Explain Back.' },
  { id: 'bot-teacher', name: 'Bot Teacher', category: 'Thinking Lab', skill: 'ai-literacy', icon: 'bot', rarity: 'uncommon', description: 'Spotted and corrected the confused AI classmate’s mistakes.', how_to_earn: 'Complete 3 Teach the Bot sessions with every mistake corrected.' },
  { id: 'evidence-detective', name: 'Evidence Detective', category: 'Thinking Lab', skill: 'critical-thinking', icon: 'fingerprint', rarity: 'uncommon', description: 'Judged sources, claims and data for credibility with a 90%+ accuracy.', how_to_earn: 'Score 90% or above in an Evidence Detective case file.' },
  { id: 'decision-maker', name: 'Decision Maker', category: 'Thinking Lab', skill: 'problem-solving', icon: 'git-branch', rarity: 'uncommon', description: 'Reasoned well under uncertainty in the Decision Simulator.', how_to_earn: 'Finish a Decision Simulator scenario with a justified decision scored 80+.' },
  { id: 'debate-victor', name: 'Debate Victor', category: 'Thinking Lab', skill: 'critical-thinking', icon: 'swords', rarity: 'rare', description: 'Out-argued the adaptive AI opponent in Debate Arena.', how_to_earn: 'Win a 4-round debate in Debate Arena with a reasoning score above the AI.' },
  { id: 'curious-mind', name: 'Curious Mind', category: 'Learning', skill: 'critical-thinking', icon: 'lightbulb', rarity: 'common', description: 'Asked ten thoughtful questions to the lesson tutor.', how_to_earn: 'Ask the AI tutor questions while watching lessons — quality questions count.' },
  { id: 'comeback', name: 'Comeback', category: 'Growth', skill: 'consistency', icon: 'trending-up', rarity: 'rare', description: 'Turned a struggling topic (below 50%) into mastery (above 80%).', how_to_earn: 'Complete the extra-practice branch for a weak topic and pass its re-check.' },
  { id: 'peer-mentor', name: 'Peer Mentor', category: 'Verified Demonstration', skill: 'collaboration', icon: 'users', rarity: 'rare', description: 'Helped a classmate master a topic, confirmed by the teacher.', how_to_earn: 'Tutor a classmate in a study session the teacher verifies.' },
  { id: 'momentum', name: 'Momentum', category: 'Consistency', skill: 'consistency', icon: 'flame', rarity: 'common', description: 'Seven days of learning in a row.', how_to_earn: 'Complete any activity on seven consecutive days.' },
  { id: 'calculus-navigator', name: 'Calculus Navigator', category: 'Mastery', skill: 'problem-solving', icon: 'sigma', rarity: 'epic', description: 'Completed the full Calculus journey.', how_to_earn: 'Finish all 7 checkpoints in Calculus: Change & Motion.' },
  { id: 'force-of-nature', name: 'Force of Nature', category: 'Mastery', skill: 'problem-solving', icon: 'atom', rarity: 'epic', description: 'Completed the full Physics journey.', how_to_earn: 'Finish all 7 checkpoints in Physics: Mechanics of the Real World.' },
  { id: 'wordsmith', name: 'Wordsmith', category: 'Mastery', skill: 'communication', icon: 'feather', rarity: 'epic', description: 'Completed the full English journey.', how_to_earn: 'Finish all 7 checkpoints in English: Argument & Craft.' },
  { id: 'honest-process', name: 'Honest Process', category: 'AI Literacy', skill: 'ai-literacy', icon: 'shield-check', rarity: 'uncommon', description: 'Used AI transparently in an essay and improved the draft with your own revisions.', how_to_earn: 'Submit an essay where AI assistance is declared and your own edits outweigh AI text.' },
]

/* ───────────────────────── Deterministic pseudo-random helper ───────────────────────── */
function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/* Student archetypes drive progress so the teacher dashboards show real patterns */
const archetypes = {
  [MAYA_ID]: { math: ['on-track', 5, 76], eng: ['ahead', 6, 88], phy: ['on-track', 4, 72], weak: ['chain-rule', 'lhopital', 'centripetal'] },
  [U(11)]: { math: ['ahead', 7, 92], eng: ['on-track', 5, 78], phy: ['ahead', 6, 90], weak: ['pathos'] },
  [U(12)]: { math: ['on-track', 5, 81], eng: ['ahead', 7, 93], phy: ['on-track', 5, 79], weak: ['free-fall'] },
  [U(13)]: { math: ['at-risk', 2, 41], eng: ['behind', 3, 58], phy: ['at-risk', 2, 44], weak: ['power-rule', 'chain-rule', 'f-equals-ma', 'thesis'] },
  [U(14)]: { math: ['on-track', 5, 70], eng: ['on-track', 5, 74], phy: ['behind', 3, 61], weak: ['centripetal', 'orbits'] },
  [U(15)]: { math: ['behind', 3, 55], eng: ['on-track', 4, 69], phy: ['on-track', 4, 73], weak: ['tangent-slope', 'rate-of-change'] },
  [U(16)]: { math: ['ahead', 6, 89], eng: ['ahead', 6, 91], phy: ['ahead', 6, 87], weak: [] },
  [U(17)]: { math: ['on-track', 4, 66], eng: ['behind', 3, 52], phy: ['on-track', 4, 68], weak: ['nominalization', 'thesis'] },
  [U(18)]: { math: ['on-track', 5, 74], eng: ['on-track', 5, 80], phy: ['on-track', 5, 77], weak: ['sine-derivative'] },
  [U(19)]: { math: ['at-risk', 1, 35], eng: ['at-risk', 2, 40], phy: ['behind', 2, 48], weak: ['area-rings', 'tiny-changes', 'position-velocity', 'sensory-detail'] },
  [U(20)]: { math: ['on-track', 5, 79], eng: ['on-track', 5, 83], phy: ['ahead', 6, 85], weak: ['lhopital'] },
  [U(21)]: { math: ['behind', 3, 59], eng: ['on-track', 4, 71], phy: ['behind', 3, 57], weak: ['chain-rule', 'energy-conservation'] },
}

const courseKey = { 'math-12': 'math', 'eng-12': 'eng', 'phy-12': 'phy' }
const SEPT = (d) => `2026-09-${String(d).padStart(2, '0')}`
const OCT = (d) => `2026-10-${String(d).padStart(2, '0')}`

export const students = profiles.filter((p) => p.role === 'student')

export const enrollments = students.flatMap((s) => courses.map((c) => ({ student_id: s.id, course_id: c.id })))

/* lesson_progress + point_events generated deterministically */
export const lessonProgress = []
export const pointEvents = []
let pe = 1
students.forEach((s, si) => {
  const arch = archetypes[s.id]
  const rand = rng(1000 + si * 97)
  courses.forEach((c) => {
    const [, completed, base] = arch[courseKey[c.id]]
    const cl = lessons.filter((l) => l.course_id === c.id)
    cl.forEach((l, i) => {
      const dayIndex = i * 5 + Math.floor(rand() * 3)
      const date = dayIndex < 25 ? SEPT(3 + dayIndex) : OCT(dayIndex - 24)
      if (i < completed) {
        const topicScores = {}
        l.topics.forEach((t) => {
          const weak = arch.weak.includes(t.id)
          const v = weak ? 25 + rand() * 25 : Math.min(100, base - 10 + rand() * 25)
          topicScores[t.id] = Math.round(v)
        })
        const vals = Object.values(topicScores)
        const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        lessonProgress.push({ id: `lp-${s.id.slice(-2)}-${l.id}`, student_id: s.id, lesson_id: l.id, status: 'completed', score, topic_scores: topicScores, completed_at: `${date}T15:${String(10 + Math.floor(rand() * 40)).padStart(2, '0')}:00Z`, time_spent_min: Math.round(l.duration_min * (1.2 + rand() * 1.2)) })
        pointEvents.push({ id: `pe-${pe++}`, student_id: s.id, course_id: c.id, points: 100 + Math.round(score / 2), reason: `Completed “${l.title}”`, created_at: `${date}T15:40:00Z` })
        if (score < 60) {
          pointEvents.push({ id: `pe-${pe++}`, student_id: s.id, course_id: c.id, points: 40, reason: `Extra practice branch · ${l.topics[0].name}`, created_at: `${date}T18:10:00Z` })
        }
      } else if (i === completed) {
        lessonProgress.push({ id: `lp-${s.id.slice(-2)}-${l.id}`, student_id: s.id, lesson_id: l.id, status: 'in-progress', score: null, topic_scores: {}, completed_at: null, time_spent_min: Math.round(rand() * 10) })
      }
    })
    // lab points sprinkled through the month
    const labs = Math.floor(rand() * 4)
    for (let k = 0; k < labs; k++) {
      pointEvents.push({ id: `pe-${pe++}`, student_id: s.id, course_id: c.id, points: 30 + Math.round(rand() * 50), reason: ['Debate Arena win', 'Spot the Flaw', 'Explain Back · deep understanding', 'Evidence Detective case'][Math.floor(rand() * 4)], created_at: `${OCT(1 + Math.floor(rand() * 8))}T17:00:00Z` })
    }
  })
})

/* Last month's podium (September) → passport stamps */
export const monthlyAwards = [
  { id: 'ma-1', course_id: 'math-12', month: '2026-09', student_id: U(11), rank: 1 },
  { id: 'ma-2', course_id: 'math-12', month: '2026-09', student_id: MAYA_ID, rank: 2 },
  { id: 'ma-3', course_id: 'math-12', month: '2026-09', student_id: U(16), rank: 3 },
  { id: 'ma-4', course_id: 'eng-12', month: '2026-09', student_id: U(12), rank: 1 },
  { id: 'ma-5', course_id: 'eng-12', month: '2026-09', student_id: U(16), rank: 2 },
  { id: 'ma-6', course_id: 'eng-12', month: '2026-09', student_id: MAYA_ID, rank: 3 },
  { id: 'ma-7', course_id: 'phy-12', month: '2026-09', student_id: U(16), rank: 1 },
  { id: 'ma-8', course_id: 'phy-12', month: '2026-09', student_id: U(11), rank: 2 },
  { id: 'ma-9', course_id: 'phy-12', month: '2026-09', student_id: U(20), rank: 3 },
]

/* ───────────────────────── Student badges ───────────────────────── */
export const studentBadges = [
  { id: 'sb-1', student_id: MAYA_ID, badge_id: 'first-bolt', earned_at: '2026-09-04T15:30:00Z', evidence: 'Completed “The Essence of Calculus” with 82%.' },
  { id: 'sb-2', student_id: MAYA_ID, badge_id: 'always-here', earned_at: '2026-09-30T16:00:00Z', evidence: 'September 2026: 22/22 days present, 0 lates.' },
  { id: 'sb-3', student_id: MAYA_ID, badge_id: 'monthly-podium', earned_at: '2026-09-30T20:00:00Z', evidence: 'Calculus leaderboard · 2nd place · September 2026.' },
  { id: 'sb-4', student_id: MAYA_ID, badge_id: 'critical-eye', earned_at: '2026-10-02T17:20:00Z', evidence: 'Spot the Flaw: 5 wins (chain rule, energy, rhetoric).' },
  { id: 'sb-5', student_id: MAYA_ID, badge_id: 'curious-mind', earned_at: '2026-09-21T14:10:00Z', evidence: '10 questions asked to the tutor across 4 lessons.' },
  { id: 'sb-6', student_id: MAYA_ID, badge_id: 'evidence-detective', earned_at: '2026-10-06T18:05:00Z', evidence: 'Case file “The Viral Study”: 93% accuracy.' },
  { id: 'sb-7', student_id: MAYA_ID, badge_id: 'honest-process', earned_at: '2026-10-05T19:00:00Z', evidence: 'Essay “Exams in 2036”: AI declared, 11% AI-assisted text, 3 revision passes.' },
  { id: 'sb-8', student_id: U(11), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-9', student_id: U(11), badge_id: 'monthly-podium', earned_at: '2026-09-30T20:00:00Z', evidence: 'Calculus · 1st · September.' },
  { id: 'sb-10', student_id: U(11), badge_id: 'calculus-navigator', earned_at: '2026-10-07T16:00:00Z', evidence: 'All 7 calculus checkpoints complete.' },
  { id: 'sb-11', student_id: U(11), badge_id: 'debate-victor', earned_at: '2026-10-03T18:00:00Z', evidence: 'Debate: “Should homework exist?” — won 4 rounds.' },
  { id: 'sb-12', student_id: U(11), badge_id: 'oral-defender', earned_at: '2026-09-25T13:00:00Z', evidence: 'Oral defense of chain rule proof, validated by R. Haddad.' },
  { id: 'sb-13', student_id: U(12), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-14', student_id: U(12), badge_id: 'wordsmith', earned_at: '2026-10-06T16:00:00Z', evidence: 'All 7 English checkpoints complete.' },
  { id: 'sb-15', student_id: U(12), badge_id: 'project-proof', earned_at: '2026-10-01T12:00:00Z', evidence: 'Project “Voices of Beirut” podcast validated.' },
  { id: 'sb-16', student_id: U(12), badge_id: 'monthly-podium', earned_at: '2026-09-30T20:00:00Z', evidence: 'English · 1st · September.' },
  { id: 'sb-17', student_id: U(16), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-18', student_id: U(16), badge_id: 'monthly-podium', earned_at: '2026-09-30T20:00:00Z', evidence: 'Physics · 1st · September.' },
  { id: 'sb-19', student_id: U(16), badge_id: 'always-here', earned_at: '2026-09-30T16:00:00Z', evidence: 'September: perfect attendance.' },
  { id: 'sb-20', student_id: U(16), badge_id: 'peer-mentor', earned_at: '2026-10-04T12:00:00Z', evidence: 'Tutored Karim on free-body diagrams.' },
  { id: 'sb-21', student_id: U(16), badge_id: 'explainer', earned_at: '2026-10-02T12:00:00Z', evidence: 'Explain Back: 3 deep-understanding results.' },
  { id: 'sb-22', student_id: U(16), badge_id: 'momentum', earned_at: '2026-09-12T12:00:00Z', evidence: '7-day streak.' },
  { id: 'sb-23', student_id: U(20), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-24', student_id: U(20), badge_id: 'monthly-podium', earned_at: '2026-09-30T20:00:00Z', evidence: 'Physics · 3rd · September.' },
  { id: 'sb-25', student_id: U(20), badge_id: 'comeback', earned_at: '2026-10-05T12:00:00Z', evidence: 'L’Hôpital: 42% → 86% after practice branch.' },
  { id: 'sb-26', student_id: U(14), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-27', student_id: U(15), badge_id: 'first-bolt', earned_at: '2026-09-04T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-28', student_id: U(18), badge_id: 'first-bolt', earned_at: '2026-09-03T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-29', student_id: U(18), badge_id: 'curious-mind', earned_at: '2026-09-28T15:00:00Z', evidence: '10 tutor questions.' },
  { id: 'sb-30', student_id: U(17), badge_id: 'first-bolt', earned_at: '2026-09-05T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-31', student_id: U(21), badge_id: 'first-bolt', earned_at: '2026-09-05T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-32', student_id: U(13), badge_id: 'first-bolt', earned_at: '2026-09-09T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-33', student_id: U(19), badge_id: 'first-bolt', earned_at: '2026-09-15T15:00:00Z', evidence: 'Completed first lesson.' },
  { id: 'sb-34', student_id: U(11), badge_id: 'always-here', earned_at: '2026-09-30T16:00:00Z', evidence: 'September: perfect attendance.' },
]

/* ───────────────────────── Schedule (Grade 12 · Section A) ───────────────────────── */
export const schedule = [
  { id: 'sc-1', day: 1, start: '08:00', end: '08:50', course_id: 'math-12', label: 'Calculus', room: 'B204' },
  { id: 'sc-2', day: 1, start: '09:00', end: '09:50', course_id: 'phy-12', label: 'Physics', room: 'Lab 2' },
  { id: 'sc-3', day: 1, start: '10:10', end: '11:00', course_id: null, label: 'Arabic Literature', room: 'A110' },
  { id: 'sc-4', day: 1, start: '11:10', end: '12:00', course_id: 'eng-12', label: 'English', room: 'A302' },
  { id: 'sc-5', day: 1, start: '13:00', end: '13:50', course_id: null, label: 'Chemistry', room: 'Lab 1' },
  { id: 'sc-6', day: 2, start: '08:00', end: '08:50', course_id: 'eng-12', label: 'English', room: 'A302' },
  { id: 'sc-7', day: 2, start: '09:00', end: '09:50', course_id: 'math-12', label: 'Calculus', room: 'B204' },
  { id: 'sc-8', day: 2, start: '10:10', end: '11:00', course_id: null, label: 'History', room: 'A115' },
  { id: 'sc-9', day: 2, start: '11:10', end: '12:00', course_id: 'phy-12', label: 'Physics', room: 'Lab 2' },
  { id: 'sc-10', day: 2, start: '13:00', end: '13:50', course_id: null, label: 'PE', room: 'Gym' },
  { id: 'sc-11', day: 3, start: '08:00', end: '08:50', course_id: 'phy-12', label: 'Physics', room: 'Lab 2' },
  { id: 'sc-12', day: 3, start: '09:00', end: '09:50', course_id: 'eng-12', label: 'English', room: 'A302' },
  { id: 'sc-13', day: 3, start: '10:10', end: '11:00', course_id: 'math-12', label: 'Calculus', room: 'B204' },
  { id: 'sc-14', day: 3, start: '11:10', end: '12:00', course_id: null, label: 'Civics', room: 'A120' },
  { id: 'sc-15', day: 3, start: '13:00', end: '13:50', course_id: null, label: 'Thinking Lab (BOLT)', room: 'Hub' },
  { id: 'sc-16', day: 4, start: '08:00', end: '08:50', course_id: 'math-12', label: 'Calculus', room: 'B204' },
  { id: 'sc-17', day: 4, start: '09:00', end: '09:50', course_id: null, label: 'Chemistry', room: 'Lab 1' },
  { id: 'sc-18', day: 4, start: '10:10', end: '11:00', course_id: 'eng-12', label: 'English', room: 'A302' },
  { id: 'sc-19', day: 4, start: '11:10', end: '12:00', course_id: 'phy-12', label: 'Physics', room: 'Lab 2' },
  { id: 'sc-20', day: 4, start: '13:00', end: '13:50', course_id: null, label: 'Arabic Literature', room: 'A110' },
  { id: 'sc-21', day: 5, start: '08:00', end: '08:50', course_id: 'eng-12', label: 'English', room: 'A302' },
  { id: 'sc-22', day: 5, start: '09:00', end: '09:50', course_id: 'phy-12', label: 'Physics', room: 'Lab 2' },
  { id: 'sc-23', day: 5, start: '10:10', end: '11:00', course_id: 'math-12', label: 'Calculus', room: 'B204' },
  { id: 'sc-24', day: 5, start: '11:10', end: '12:00', course_id: null, label: 'Project Studio', room: 'Hub' },
]

/* ───────────────────────── Attendance (Sep 1 → Oct 9, school days) ───────────────────────── */
function schoolDays() {
  const days = []
  for (let d = new Date('2026-09-01'); d <= new Date('2026-10-09'); d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow >= 1 && dow <= 5) days.push(d.toISOString().slice(0, 10))
  }
  return days
}
export const SCHOOL_DAYS = schoolDays()

const attendancePatterns = {
  [MAYA_ID]: {}, // perfect record
  [U(11)]: {},
  [U(16)]: {},
  [U(12)]: { '2026-09-17': 'excused' },
  [U(13)]: { '2026-09-08': 'absent', '2026-09-15': 'late', '2026-09-22': 'absent', '2026-09-29': 'absent', '2026-10-06': 'late', '2026-10-07': 'absent' },
  [U(14)]: { '2026-09-10': 'late', '2026-10-01': 'late' },
  [U(15)]: { '2026-09-11': 'absent', '2026-10-02': 'late' },
  [U(17)]: { '2026-09-24': 'absent', '2026-09-25': 'absent' },
  [U(18)]: { '2026-09-30': 'late' },
  [U(19)]: { '2026-09-04': 'absent', '2026-09-09': 'absent', '2026-09-16': 'late', '2026-09-23': 'absent', '2026-09-24': 'absent', '2026-10-05': 'absent', '2026-10-08': 'late' },
  [U(20)]: {},
  [U(21)]: { '2026-09-18': 'late', '2026-10-05': 'absent' },
}
// A record anomaly: marked absent, but BOLT has activity from school at that time → flagged for correction
export const attendance = []
students.forEach((s) => {
  const pat = attendancePatterns[s.id] || {}
  SCHOOL_DAYS.forEach((date) => {
    const status = pat[date] || 'present'
    let note = null
    let flag = null
    if (s.id === U(17) && date === '2026-09-25') {
      flag = 'conflict'
      note = 'Marked absent, but a lesson was completed from the school network at 09:42. Needs correction.'
    }
    if (status === 'absent' && !flag) note = 'No note from guardian.'
    if (status === 'excused') note = 'Medical appointment (guardian note received).'
    attendance.push({ id: `att-${s.id.slice(-2)}-${date}`, student_id: s.id, date, status, note, flag })
  })
})

/* ───────────────────────── Essay submission with process recording ─────────────────────────
 * process events: { t: seconds since start, type: 'type'|'delete'|'paste'|'ai_prompt'|'ai_insert'|'pause'|'snapshot', chars?, text?, prompt?, reply? }
 */
const mayaEssay = `Should schools in 2036 still have exams?

Exams were invented for a world with scarce information and expensive teachers. In 2036, neither is true. Every student will carry a tutor in their pocket, so the question is not whether we can test memory, but whether memory is still what we should be testing.

First, exams measure a single moment. A student who understood calculus all year but froze for three hours in November is recorded as a failure. Continuous evidence — projects, oral defenses, and recorded thinking — tells a truer story.

Some argue that exams are fair because every student faces the same paper. But fairness of format is not fairness of opportunity. A student with a quiet home and a tutor is not facing the same paper as one working evenings. Process-based assessment can see effort, growth and honesty, which a single paper cannot.

Admittedly, exams are hard to cheat and easy to compare. That is a real advantage, and the alternative must be equally trustworthy. The answer is not to delete exams but to shrink them: short, oral, and verified, surrounded by a year of visible thinking.

In 2036, schools should keep a small exam and build a large portfolio around it. We should test what people can do with knowledge, not only whether they can retrieve it under pressure.`

const essayProcess = [
  { t: 0, type: 'snapshot', label: 'Started', chars: 0 },
  { t: 12, type: 'type', chars: 46, text: 'Should schools in 2036 still have exams?' },
  { t: 48, type: 'pause', seconds: 36, note: 'Thinking after writing the title' },
  { t: 90, type: 'type', chars: 210 },
  { t: 180, type: 'delete', chars: 60, note: 'Rewrote the opening sentence' },
  { t: 240, type: 'type', chars: 190 },
  { t: 300, type: 'snapshot', label: 'Draft 1', chars: 420 },
  { t: 330, type: 'type', chars: 260 },
  { t: 420, type: 'pause', seconds: 85, note: 'Long pause before the counterargument paragraph' },
  { t: 505, type: 'ai_prompt', prompt: 'What is the strongest argument FOR keeping exams? I want to answer it, not avoid it.', reply: 'The strongest case is comparability and cheating resistance: a controlled, timed paper gives every student the same conditions and is hard to fake. If you concede that, your counter needs to show how process-based evidence can be equally trustworthy.' },
  { t: 540, type: 'ai_insert', chars: 118, text: 'Admittedly, exams are hard to cheat and easy to compare. That is a real advantage, and the alternative must be equally trustworthy.' },
  { t: 600, type: 'type', chars: 230, note: 'Wrote her own answer to the counterargument' },
  { t: 720, type: 'snapshot', label: 'Draft 2', chars: 1130 },
  { t: 760, type: 'delete', chars: 40 },
  { t: 790, type: 'type', chars: 180 },
  { t: 900, type: 'paste', chars: 38, text: 'a student working evenings', source: 'own notes' },
  { t: 960, type: 'type', chars: 150 },
  { t: 1120, type: 'pause', seconds: 50, note: 'Re-reading' },
  { t: 1170, type: 'delete', chars: 95, note: 'Cut a repetitive sentence in paragraph 3' },
  { t: 1230, type: 'type', chars: 120 },
  { t: 1320, type: 'snapshot', label: 'Final', chars: 1540 },
]

export const submissions = [
  {
    id: 'sub-maya-eng2',
    student_id: MAYA_ID,
    lesson_id: 'eng-12-l2',
    type: 'essay',
    title: 'Should schools in 2036 still have exams?',
    content: mayaEssay,
    process: essayProcess,
    metrics: { total_seconds: 1320, active_seconds: 1010, keystrokes: 1890, words: 318, pasted_chars: 38, ai_chars: 118, ai_prompts: 1, deletions: 4, snapshots: 3, longest_pause_seconds: 85, revision_ratio: 0.21 },
    ai_usage: { declared: true, prompts: 1, share_of_text: 0.11, mode: 'counterargument coaching' },
    submitted_at: '2026-10-05T18:50:00Z',
    grade: null,
    teacher_feedback: null,
    status: 'submitted',
  },
  {
    id: 'sub-omar-eng2', student_id: U(11), lesson_id: 'eng-12-l2', type: 'essay', title: 'Exams: a necessary stress', content: null, process: null,
    metrics: { total_seconds: 2410, active_seconds: 1900, keystrokes: 3100, words: 402, pasted_chars: 0, ai_chars: 0, ai_prompts: 0, deletions: 11, snapshots: 4, longest_pause_seconds: 120, revision_ratio: 0.34 },
    ai_usage: { declared: false, prompts: 0, share_of_text: 0 }, submitted_at: '2026-10-05T20:10:00Z', grade: 17, teacher_feedback: 'Strong structure.', status: 'graded',
  },
  {
    id: 'sub-karim-eng2', student_id: U(13), lesson_id: 'eng-12-l2', type: 'essay', title: 'Exams in 2036', content: null, process: null,
    metrics: { total_seconds: 4, active_seconds: 4, keystrokes: 2, words: 611, pasted_chars: 3980, ai_chars: 0, ai_prompts: 0, deletions: 0, snapshots: 1, longest_pause_seconds: 0, revision_ratio: 0 },
    ai_usage: { declared: false, prompts: 0, share_of_text: 0, suspected_external: true }, submitted_at: '2026-10-05T23:58:00Z', grade: null, teacher_feedback: null, status: 'flagged',
  },
  {
    id: 'sub-lina-eng2', student_id: U(12), lesson_id: 'eng-12-l2', type: 'essay', title: 'The exam is not the enemy', content: null, process: null,
    metrics: { total_seconds: 1980, active_seconds: 1650, keystrokes: 2800, words: 455, pasted_chars: 0, ai_chars: 210, ai_prompts: 3, deletions: 9, snapshots: 5, longest_pause_seconds: 60, revision_ratio: 0.4 },
    ai_usage: { declared: true, prompts: 3, share_of_text: 0.08, mode: 'vocabulary & transitions' }, submitted_at: '2026-10-05T17:30:00Z', grade: 18, teacher_feedback: 'Excellent revision discipline.', status: 'graded',
  },
  {
    id: 'sub-ali-eng2', student_id: U(19), lesson_id: 'eng-12-l2', type: 'essay', title: 'exams', content: null, process: null,
    metrics: { total_seconds: 11400, active_seconds: 1400, keystrokes: 900, words: 142, pasted_chars: 0, ai_chars: 0, ai_prompts: 0, deletions: 25, snapshots: 2, longest_pause_seconds: 2600, revision_ratio: 0.9 },
    ai_usage: { declared: false, prompts: 0, share_of_text: 0 }, submitted_at: '2026-10-06T01:20:00Z', grade: null, teacher_feedback: null, status: 'submitted',
  },
  {
    id: 'sub-rami-eng2', student_id: U(17), lesson_id: 'eng-12-l2', type: 'essay', title: 'Why exams should stay', content: null, process: null,
    metrics: { total_seconds: 1500, active_seconds: 1300, keystrokes: 2100, words: 330, pasted_chars: 0, ai_chars: 640, ai_prompts: 6, deletions: 2, snapshots: 2, longest_pause_seconds: 30, revision_ratio: 0.05 },
    ai_usage: { declared: false, prompts: 6, share_of_text: 0.36, mode: 'paragraph generation' }, submitted_at: '2026-10-05T21:00:00Z', grade: null, teacher_feedback: null, status: 'flagged',
  },
  {
    id: 'sub-yara-eng2', student_id: U(14), lesson_id: 'eng-12-l2', type: 'essay', title: 'A smaller exam', content: null, process: null,
    metrics: { total_seconds: 1700, active_seconds: 1500, keystrokes: 2400, words: 360, pasted_chars: 0, ai_chars: 0, ai_prompts: 1, deletions: 7, snapshots: 3, longest_pause_seconds: 95, revision_ratio: 0.25 },
    ai_usage: { declared: true, prompts: 1, share_of_text: 0, mode: 'asked for feedback only' }, submitted_at: '2026-10-05T19:15:00Z', grade: 15, teacher_feedback: 'Good, develop the counter.', status: 'graded',
  },
  {
    id: 'sub-nour-eng2', student_id: U(16), lesson_id: 'eng-12-l2', type: 'essay', title: 'Testing what matters', content: null, process: null,
    metrics: { total_seconds: 2100, active_seconds: 1850, keystrokes: 3300, words: 480, pasted_chars: 0, ai_chars: 0, ai_prompts: 0, deletions: 14, snapshots: 5, longest_pause_seconds: 70, revision_ratio: 0.38 },
    ai_usage: { declared: false, prompts: 0, share_of_text: 0 }, submitted_at: '2026-10-05T16:40:00Z', grade: 19, teacher_feedback: 'Outstanding.', status: 'graded',
  },
]

/* ───────────────────────── Tutor chat questions (drive lesson insights) ───────────────────────── */
const q = (id, student_id, lesson_id, video_t, topic, content, created_at) => ({ id, student_id, lesson_id, role: 'user', content, video_t, topic, created_at })
export const chatMessages = [
  q('cm-1', MAYA_ID, 'math-12-l4', 540, 'chain-rule', 'Why do we multiply by the inner derivative? Where does the extra 2x come from?', '2026-09-24T15:12:00Z'),
  q('cm-2', U(13), 'math-12-l4', 560, 'chain-rule', 'I dont get which one is inside and which is outside', '2026-09-24T15:20:00Z'),
  q('cm-3', U(15), 'math-12-l4', 530, 'chain-rule', 'is chain rule the same as product rule', '2026-09-24T16:02:00Z'),
  q('cm-4', U(21), 'math-12-l4', 600, 'chain-rule', 'can you show the chain rule with a real example like speed?', '2026-09-25T10:30:00Z'),
  q('cm-5', U(18), 'math-12-l4', 250, 'product-rule', 'why is it g dh plus h dg and not just dg times dh', '2026-09-24T15:40:00Z'),
  q('cm-6', U(14), 'math-12-l4', 230, 'product-rule', 'What happens to the little corner piece in the box?', '2026-09-24T15:45:00Z'),
  q('cm-7', MAYA_ID, 'math-12-l5', 600, 'lhopital', 'When is L’Hôpital allowed? Only 0/0?', '2026-10-01T15:12:00Z'),
  q('cm-8', U(20), 'math-12-l5', 620, 'lhopital', 'does it work for infinity over infinity too', '2026-10-01T15:30:00Z'),
  q('cm-9', U(13), 'math-12-l5', 300, 'epsilon-delta', 'epsilon delta makes no sense, why do we need it', '2026-10-01T16:00:00Z'),
  q('cm-10', U(17), 'math-12-l5', 290, 'epsilon-delta', 'what is delta exactly', '2026-10-02T09:10:00Z'),
  q('cm-11', U(12), 'math-12-l2', 330, 'tangent-slope', 'How is the tangent slope different from the average slope between two points?', '2026-09-10T15:00:00Z'),
  q('cm-12', U(15), 'math-12-l2', 340, 'tangent-slope', 'if dt is zero isnt it dividing by zero', '2026-09-10T15:05:00Z'),
  q('cm-13', U(19), 'math-12-l1', 150, 'area-rings', 'why does the ring become a rectangle', '2026-09-15T15:00:00Z'),
  q('cm-14', U(19), 'math-12-l1', 250, 'area-under-graph', 'what graph are we talking about', '2026-09-15T15:08:00Z'),
  q('cm-15', U(11), 'math-12-l6', 660, 'ftc', 'Is the fundamental theorem why integration undoes differentiation?', '2026-10-05T15:00:00Z'),
  q('cm-16', U(16), 'math-12-l3', 600, 'sine-derivative', 'Can you show the unit circle step for cos too?', '2026-09-17T15:00:00Z'),
  q('cm-17', MAYA_ID, 'phy-12-l4', 220, 'centripetal', 'If speed is constant how can there be acceleration?', '2026-09-29T09:15:00Z'),
  q('cm-18', U(14), 'phy-12-l4', 230, 'centripetal', 'why v squared over r and not v over r', '2026-09-29T09:20:00Z'),
  q('cm-19', U(21), 'phy-12-l4', 450, 'fictitious-force', 'so is centrifugal force fake or not', '2026-09-29T09:40:00Z'),
  q('cm-20', U(13), 'phy-12-l3', 200, 'f-equals-ma', 'if I push a wall and it doesnt move where did the force go', '2026-09-22T09:00:00Z'),
  q('cm-21', U(19), 'phy-12-l3', 320, 'action-reaction', 'if forces are equal and opposite why does anything move', '2026-09-22T09:05:00Z'),
  q('cm-22', U(15), 'phy-12-l3', 330, 'action-reaction', 'same question as the horse and cart thing', '2026-09-22T09:06:00Z'),
  q('cm-23', U(12), 'phy-12-l2', 330, 'free-fall', 'Does a feather and a hammer really fall the same in a vacuum?', '2026-09-15T09:00:00Z'),
  q('cm-24', U(17), 'phy-12-l2', 450, 'free-fall', 'what is terminal velocity of a human', '2026-09-15T09:10:00Z'),
  q('cm-25', U(20), 'phy-12-l6', 230, 'energy-conservation', 'where does the energy go with friction, is it destroyed', '2026-10-06T09:00:00Z'),
  q('cm-26', U(21), 'phy-12-l6', 240, 'energy-conservation', 'why is energy not conserved if friction', '2026-10-06T09:03:00Z'),
  q('cm-27', MAYA_ID, 'eng-12-l2', 180, 'pathos', 'Is using pathos manipulative? How do I use it honestly in my essay?', '2026-09-16T11:30:00Z'),
  q('cm-28', U(11), 'eng-12-l2', 185, 'pathos', 'how much pathos is too much', '2026-09-16T11:32:00Z'),
  q('cm-29', U(17), 'eng-12-l2', 230, 'thesis', 'what makes a thesis strong vs weak', '2026-09-16T11:40:00Z'),
  q('cm-30', U(13), 'eng-12-l2', 235, 'thesis', 'can my thesis be a question', '2026-09-16T11:41:00Z'),
  q('cm-31', U(19), 'eng-12-l1', 110, 'show-dont-tell', 'what does show dont tell mean exactly', '2026-09-09T11:00:00Z'),
  q('cm-32', U(17), 'eng-12-l3', 60, 'nominalization', 'is “decision” a zombie noun', '2026-09-23T11:00:00Z'),
  q('cm-33', U(18), 'eng-12-l3', 200, 'active-verbs', 'how do I find the hidden verb', '2026-09-23T11:05:00Z'),
  q('cm-34', U(14), 'eng-12-l4', 140, 'metaphor-structure', 'what is the difference between metaphor and simile for the exam', '2026-09-30T11:00:00Z'),
  q('cm-35', U(11), 'eng-12-l5', 180, 'hero-journey', 'Can a villain have a hero’s journey?', '2026-10-07T11:00:00Z'),
  q('cm-36', MAYA_ID, 'math-12-l2', 440, 'derivative-definition', 'Why does t³ give 3t²? Can you walk the algebra once?', '2026-09-10T15:20:00Z'),
  q('cm-37', U(13), 'math-12-l2', 440, 'derivative-definition', 'I lost it at the algebra part', '2026-09-10T15:22:00Z'),
  q('cm-38', U(21), 'math-12-l2', 445, 'derivative-definition', 'where did the dt squared go', '2026-09-10T15:25:00Z'),
]

/* ───────────────────────── Project showcase ───────────────────────── */
export const projects = [
  { id: 'pr-1', student_id: MAYA_ID, title: 'Bridge Load Simulator', description: 'A browser simulation of a cedar-wood footbridge showing how load distributes across trusses, with a slider for pedestrian count.', skills: ['problem-solving', 'critical-thinking'], course_id: 'phy-12', status: 'pending', validated_by: null, created_at: '2026-10-04T12:00:00Z', artifact: 'Live demo + 2-minute walkthrough' },
  { id: 'pr-2', student_id: U(12), title: 'Voices of Beirut', description: 'A four-episode podcast interviewing grandparents about the city, edited with narrative structure from the Hero’s Journey.', skills: ['communication', 'creative-thinking'], course_id: 'eng-12', status: 'validated', validated_by: TEACHER_ID, created_at: '2026-09-28T12:00:00Z', artifact: 'Podcast feed' },
  { id: 'pr-3', student_id: U(11), title: 'Optimal Delivery Routes', description: 'Used derivatives to minimise the fuel cost of a delivery route across three Beirut neighbourhoods.', skills: ['problem-solving'], course_id: 'math-12', status: 'validated', validated_by: TEACHER_ID, created_at: '2026-09-30T12:00:00Z', artifact: 'Report + spreadsheet model' },
  { id: 'pr-4', student_id: U(16), title: 'Energy Audit of the Gym', description: 'Measured power use of gym lighting and proposed a schedule that saves 18% — presented to school administration.', skills: ['problem-solving', 'communication'], course_id: 'phy-12', status: 'validated', validated_by: TEACHER_ID, created_at: '2026-10-02T12:00:00Z', artifact: 'Slides + data log' },
  { id: 'pr-5', student_id: U(14), title: 'Poems in Motion', description: 'Short animated readings of three unseen poems with annotations of sound devices.', skills: ['creative-thinking', 'communication'], course_id: 'eng-12', status: 'pending', validated_by: null, created_at: '2026-10-06T12:00:00Z', artifact: 'Video series' },
]

/* ───────────────────────── Convenience lookups ───────────────────────── */
export const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]))
export const lessonById = Object.fromEntries(lessons.map((l) => [l.id, l]))
export const courseById = Object.fromEntries(courses.map((c) => [c.id, c]))
export const badgeById = Object.fromEntries(badges.map((b) => [b.id, b]))

export const seed = {
  profiles, courses, lessons, badges, enrollments, lessonProgress, pointEvents, monthlyAwards, studentBadges, schedule, attendance, submissions, chatMessages, projects,
}
