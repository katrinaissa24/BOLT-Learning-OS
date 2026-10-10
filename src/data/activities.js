/**
 * Interactive activity registry — one per lesson.
 * component: key resolved by src/components/interactives/index.jsx
 * question:  the checkpoint question attached to the interactive.
 *   type 'numeric' → student types a number; { answer, tolerance, unit }
 *   type 'slider'  → student moves the simulation to a target and submits; { check(valueReportedByInteractive) }
 *   type 'score'   → the interactive scores itself (0–100) and reports via onResult({ score })
 *   type 'essay'   → the essay editor submits the work and reports via onResult({ score })
 *   topic: the lesson topic id this question primarily assesses
 */
export const ACTIVITIES = {
  /* ───────── MATH ───────── */
  'math-12-l1': {
    component: 'circle-rings',
    question: { type: 'slider', topic: 'area-rings', prompt: 'Slice the pizza into enough rings that the ring-sum is within 2% of the true area πr². Then submit your setting.', check: (v) => v != null && v.errorPct < 2, hint: 'Each ring is approximated as a rectangle of length 2πr and width dr; the error shrinks as 1/N.', explanation: 'With N rings the inner-radius estimate is πr²·(N−1)/N, so the error is 100/N %. You need more than 50 rings.' },
  },
  'math-12-l2': {
    component: 'tangent-explorer',
    question: { type: 'numeric', topic: 'tangent-slope', prompt: 'The scooter’s distance is s(t) = 0.5t² + 2t metres. What is its instantaneous speed at t = 4 s?', answer: 6, tolerance: 0.15, unit: 'm/s', hint: 'Drag the point to t = 4 and shrink Δt until the secant stops changing.', explanation: 'ds/dt = t + 2, so at t = 4 the speed is 6 m/s. The secant slope approaches this as Δt → 0.' },
  },
  'math-12-l3': {
    component: 'power-rule-square',
    question: { type: 'numeric', topic: 'power-rule', prompt: 'Switch to the cube and set x = 2. What is d(x³)/dx at x = 2?', answer: 12, tolerance: 0.2, unit: '', hint: 'Three square faces of side x each gain a slab of thickness dx.', explanation: 'd(x³)/dx = 3x² = 3·4 = 12. The three thin slabs are the 3x² term; the edge pieces vanish as dx → 0.' },
  },
  'math-12-l4': {
    component: 'product-rule-box',
    question: { type: 'numeric', topic: 'product-rule', prompt: 'Price p(t) = 10 + t and units u(t) = 100 − 2t. What is d(Revenue)/dt at t = 5?', answer: 60, tolerance: 0.5, unit: '$/day', hint: 'Set t = 5 in the simulation. Left d-right plus right d-left.', explanation: 'p′u + pu′ = (1)(90) + (15)(−2) = 90 − 30 = 60 $/day.' },
  },
  'math-12-l5': {
    component: 'limit-explorer',
    question: { type: 'numeric', topic: 'limit-intuition', prompt: 'What is the limit of sin(x)/x as x approaches 0?', answer: 1, tolerance: 0.01, unit: '', hint: 'Push the slider as close to 0 as it goes and read the table.', explanation: 'sin(x)/x is undefined at 0 but approaches 1 from both sides. L’Hôpital confirms it: cos(0)/1 = 1.' },
  },
  'math-12-l6': {
    component: 'riemann-area',
    question: { type: 'slider', topic: 'riemann-sum', prompt: 'Increase the number of rectangles until the distance estimate is within 1% of the true distance. Submit your setting.', check: (v) => v != null && v.errorPct < 1, hint: 'Left-hand rectangles under-estimate when velocity is rising.', explanation: 'The exact distance is ∫₀¹⁰ (5 + 2t − 0.1t²) dt = 116.7 m. Left sums need about 45+ rectangles to get within 1%.' },
  },
  'math-12-l7': {
    component: 'average-value',
    question: { type: 'numeric', topic: 'average-value', prompt: 'Set the interval to 06:00 → 18:00. What is the average temperature over that interval (°C, 1 decimal)?', answer: 26.7, tolerance: 0.3, unit: '°C', hint: 'Average = area under the curve ÷ width of the interval.', explanation: '(1/12)∫₆¹⁸ [24 + 6 sin(π(t−9)/12)] dt = 24 + 2.70 ≈ 26.7 °C.' },
  },

  /* ───────── PHYSICS ───────── */
  'phy-12-l1': {
    component: 'motion-graphs',
    question: { type: 'numeric', topic: 'acceleration', prompt: 'Set a = 2 m/s² and v₀ = 3 m/s. What is the car’s velocity after 5 s?', answer: 13, tolerance: 0.2, unit: 'm/s', hint: 'v = v₀ + a·t. Read it off the velocity graph.', explanation: 'v = 3 + 2·5 = 13 m/s. The velocity graph is a straight line whose slope is the acceleration.' },
  },
  'phy-12-l2': {
    component: 'free-fall',
    question: { type: 'numeric', topic: 'free-fall', prompt: 'On Earth, in a vacuum, how long does the ball take to hit the ground from the 45 m balcony? (seconds, 1 decimal)', answer: 3.03, tolerance: 0.12, unit: 's', hint: 'h = ½gt². Run the drop and watch the timer.', explanation: 't = √(2h/g) = √(90/9.8) ≈ 3.0 s. On the Moon the same drop takes about 7.5 s.' },
  },
  'phy-12-l3': {
    component: 'force-cart',
    question: { type: 'slider', topic: 'f-equals-ma', prompt: 'With a 20 kg cart and μ = 0.10, set the applied force so the acceleration is exactly 2.0 m/s² (±0.1). Submit your setting.', check: (v) => v != null && Math.abs(v.a - 2) <= 0.1, hint: 'Net force = applied − friction. Friction = μ·m·g.', explanation: 'Friction = 0.1 × 20 × 9.8 = 19.6 N. For a = 2 you need net 40 N, so push with about 59.6 N.' },
  },
  'phy-12-l4': {
    component: 'circular-motion',
    question: { type: 'numeric', topic: 'centripetal', prompt: 'A car takes a roundabout of radius 18 m at 12 m/s. What is its centripetal acceleration? (m/s², 1 decimal)', answer: 8, tolerance: 0.15, unit: 'm/s²', hint: 'a = v²/r, pointing to the centre.', explanation: 'a = 144 / 18 = 8.0 m/s² — almost 1 g sideways, which is why you lean.' },
  },
  'phy-12-l5': {
    component: 'orbit-sim',
    question: { type: 'slider', topic: 'orbits', prompt: 'Find the launch speed that gives a stable, circular orbit at 400 km altitude (within ±0.25 km/s). Submit your setting.', check: (v) => v != null && Math.abs(v.speed - 7.67) <= 0.25, hint: 'Too slow → the satellite falls back. Too fast → an ellipse, then escape.', explanation: 'v = √(GM/r) = √(3.986×10¹⁴ / 6.771×10⁶) ≈ 7.67 km/s. The ISS really does fly at about this speed.' },
  },
  'phy-12-l6': {
    component: 'roller-coaster',
    question: { type: 'numeric', topic: 'energy-conservation', prompt: 'Start height 20 m, friction off. What is the cart’s speed at the bottom of the first drop? (m/s, 1 decimal)', answer: 19.8, tolerance: 0.3, unit: 'm/s', hint: 'mgh = ½mv² — the mass cancels.', explanation: 'v = √(2gh) = √(2 × 9.8 × 20) ≈ 19.8 m/s. With friction on, part of the height becomes heat instead.' },
  },
  'phy-12-l7': {
    component: 'collision-lab',
    question: { type: 'numeric', topic: 'collision-types', prompt: 'Cart A (4 kg) moves at 3 m/s toward cart B (2 kg) at rest. They stick together. What is the final velocity of the combined mass? (m/s)', answer: 2, tolerance: 0.05, unit: 'm/s', hint: 'Momentum before = momentum after. Set the sliders and press play.', explanation: 'm₁v₁ + m₂v₂ = (m₁+m₂)v → 12 + 0 = 6v → v = 2 m/s. Kinetic energy drops from 18 J to 12 J: the missing 6 J became heat and crumpling.' },
  },

  /* ───────── ENGLISH ───────── */
  'eng-12-l1': {
    component: 'essay-editor',
    essayPrompt: 'Describe the school courtyard at 7:50 a.m. without naming a single emotion.',
    question: { type: 'essay', topic: 'show-dont-tell', prompt: 'Your essay is the checkpoint. Submit it in the editor above — your thinking path is part of the grade.' },
  },
  'eng-12-l2': {
    component: 'essay-editor',
    essayPrompt: 'Should schools in 2036 still have exams?',
    question: { type: 'essay', topic: 'thesis', prompt: 'Your essay is the checkpoint. Submit it in the editor above — your thinking path is part of the grade.' },
  },
  'eng-12-l3': {
    component: 'sentence-surgery',
    question: { type: 'score', topic: 'nominalization', prompt: 'Rewrite all six zombie sentences, then check them. Your checkpoint score is your surgery score.' },
  },
  'eng-12-l4': {
    component: 'essay-editor',
    essayPrompt: 'Write a paragraph built on one extended metaphor for learning.',
    question: { type: 'essay', topic: 'metaphor-structure', prompt: 'Your paragraph is the checkpoint. Submit it in the editor above — your thinking path is part of the grade.' },
  },
  'eng-12-l5': {
    component: 'story-mapper',
    question: { type: 'score', topic: 'hero-journey', prompt: 'Place all eight beats of The Hunger Games on the Hero’s Journey, then check your map.' },
  },
  'eng-12-l6': {
    component: 'essay-editor',
    essayPrompt: 'Write the opening scene of a story set in Beirut in 2036; the world must have one rule that is different from ours.',
    question: { type: 'essay', topic: 'creative-draft', prompt: 'Your scene is the checkpoint. Submit it in the editor above — your thinking path is part of the grade.' },
  },
  'eng-12-l7': {
    component: 'poem-lab',
    question: { type: 'score', topic: 'sound-devices', prompt: 'Tag the sound devices and figurative language in “The Eagle”, then check your tags.' },
  },
}

export const activityFor = (lessonId) => ACTIVITIES[lessonId] || null
