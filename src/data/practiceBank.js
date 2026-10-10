/**
 * Fallback practice questions keyed by topic id (from seed lessons).
 * Used when no AI key is configured. Agents may extend this file.
 * Shape: { prompt, type: 'numeric'|'choice'|'short', options?, answer, explanation, difficulty: 1|2|3, context }
 */
export const PRACTICE_BANK = {
  'chain-rule': [
    { prompt: 'A balloon’s radius grows as r(t) = 2 + 0.5t cm. Its volume is V = (4/3)πr³. What is dV/dt at t = 2 s? (cm³/s, 1 decimal)', type: 'numeric', answer: 56.5, tolerance: 0.6, explanation: 'dV/dt = 4πr²·dr/dt = 4π(3)²(0.5) ≈ 56.5.', difficulty: 2, context: 'Inflating a balloon' },
    { prompt: 'Differentiate y = sin(3x²). Which is correct?', type: 'choice', options: ['cos(3x²)', '6x·cos(3x²)', '3x²·cos(3x²)', '6x·sin(3x²)'], answer: '6x·cos(3x²)', explanation: 'Outer derivative cos(inner) times inner derivative 6x.', difficulty: 1, context: 'Pure practice' },
    { prompt: 'Temperature along a road is T(x) = 20 + 0.1x² °C and your position is x(t) = 4t km. How fast is the temperature changing at t = 5 min, in °C/min?', type: 'numeric', answer: 16, tolerance: 0.5, explanation: 'dT/dt = dT/dx · dx/dt = (0.2x)(4) with x = 20 → 16.', difficulty: 3, context: 'Driving into the heat' },
  ],
  'product-rule': [
    { prompt: 'Revenue = price × units. Price p(t) = 10 + t, units u(t) = 100 − 2t. What is d(Revenue)/dt at t = 5?', type: 'numeric', answer: 60, tolerance: 0.5, explanation: 'p′u + pu′ = (1)(90) + (15)(−2) = 60.', difficulty: 2, context: 'Shop revenue' },
    { prompt: 'd/dx [x²·eˣ] = ?', type: 'choice', options: ['2x·eˣ', 'x²·eˣ', '(x² + 2x)·eˣ', '2x + eˣ'], answer: '(x² + 2x)·eˣ', explanation: 'Left d-right plus right d-left.', difficulty: 1, context: 'Pure practice' },
  ],
  'tangent-slope': [
    { prompt: 'A drone’s height is h(t) = t² + 2t metres. What is its instantaneous vertical speed at t = 3 s?', type: 'numeric', answer: 8, tolerance: 0.1, explanation: 'h′(t) = 2t + 2 = 8 m/s.', difficulty: 1, context: 'Drone take-off' },
    { prompt: 'Between t = 1 and t = 3 the same drone has average speed…', type: 'numeric', answer: 6, tolerance: 0.1, explanation: '(h(3) − h(1)) / 2 = (15 − 3)/2 = 6 m/s — not the same as the instant speed.', difficulty: 2, context: 'Drone take-off' },
  ],
  'rate-of-change': [
    { prompt: 'Your phone battery drops from 80% to 20% over 4 hours. Average rate of change in %/hour?', type: 'numeric', answer: -15, tolerance: 0.1, explanation: '(20 − 80)/4 = −15.', difficulty: 1, context: 'Phone battery' },
  ],
  'power-rule': [
    { prompt: 'd/dx (5x⁴ − 3x² + 7) at x = 1 equals…', type: 'numeric', answer: 14, tolerance: 0.1, explanation: '20x³ − 6x at x = 1 → 14.', difficulty: 1, context: 'Pure practice' },
    { prompt: 'The cost of a cube-shaped tank is C(s) = 12s² dollars (surface) for side s metres. Marginal cost at s = 2 m?', type: 'numeric', answer: 48, tolerance: 0.1, explanation: 'C′(s) = 24s = 48 $/m.', difficulty: 2, context: 'Water tank' },
  ],
  lhopital: [
    { prompt: 'lim x→0 (sin 2x)/x = ?', type: 'numeric', answer: 2, tolerance: 0.01, explanation: 'Derivatives: 2cos(2x)/1 → 2.', difficulty: 1, context: 'Pure practice' },
    { prompt: 'lim x→0 (eˣ − 1)/x = ?', type: 'numeric', answer: 1, tolerance: 0.01, explanation: 'eˣ/1 → 1.', difficulty: 1, context: 'Pure practice' },
    { prompt: 'L’Hôpital may be applied directly to which limit?', type: 'choice', options: ['lim (x² + 1)/(x + 2) as x→1', 'lim (x² − 1)/(x − 1) as x→1', 'lim (x + 3)/(x) as x→0', 'lim sin(x)/(x + 1) as x→0'], answer: 'lim (x² − 1)/(x − 1) as x→1', explanation: 'Only that one is 0/0 at the point.', difficulty: 2, context: 'When is it allowed?' },
  ],
  'epsilon-delta': [
    { prompt: 'For f(x) = 3x near x = 2, which δ guarantees |f(x) − 6| < 0.3?', type: 'choice', options: ['δ = 0.3', 'δ = 0.1', 'δ = 0.9', 'δ = 1'], answer: 'δ = 0.1', explanation: '|3x − 6| = 3|x − 2| < 0.3 ⇔ |x − 2| < 0.1.', difficulty: 2, context: 'Tolerances' },
  ],
  centripetal: [
    { prompt: 'A car takes a roundabout of radius 20 m at 10 m/s. Centripetal acceleration (m/s²)?', type: 'numeric', answer: 5, tolerance: 0.1, explanation: 'a = v²/r = 100/20 = 5.', difficulty: 1, context: 'Beirut roundabout' },
    { prompt: 'Same roundabout, you double the speed. The required centripetal force…', type: 'choice', options: ['doubles', 'stays the same', 'quadruples', 'halves'], answer: 'quadruples', explanation: 'F = mv²/r — speed is squared.', difficulty: 2, context: 'Beirut roundabout' },
  ],
  'f-equals-ma': [
    { prompt: 'A 1,200 kg car accelerates at 2.5 m/s². Net force (N)?', type: 'numeric', answer: 3000, tolerance: 1, explanation: 'F = ma = 1200 × 2.5.', difficulty: 1, context: 'Car launch' },
    { prompt: 'You push a 20 kg box with 50 N and friction is 10 N. Acceleration (m/s²)?', type: 'numeric', answer: 2, tolerance: 0.05, explanation: 'Net force 40 N / 20 kg = 2.', difficulty: 2, context: 'Moving day' },
  ],
  'action-reaction': [
    { prompt: 'A horse pulls a cart. The cart pulls back on the horse with equal force. Why does the cart still move?', type: 'choice', options: ['The horse pulls slightly harder', 'The pair act on different objects; the ground pushes the horse forward', 'Friction cancels the cart’s pull', 'Newton’s third law does not apply to animals'], answer: 'The pair act on different objects; the ground pushes the horse forward', explanation: 'Third-law pairs never cancel because they act on different bodies.', difficulty: 2, context: 'Horse and cart' },
  ],
  'free-fall': [
    { prompt: 'A ball is dropped from a 45 m balcony (no air). Time to hit the ground (s, 1 decimal)?', type: 'numeric', answer: 3, tolerance: 0.1, explanation: 'h = ½gt² → t = √(90/9.8) ≈ 3.0 s.', difficulty: 1, context: 'Balcony drop' },
    { prompt: 'On the Moon (g = 1.6) the same drop takes about…', type: 'numeric', answer: 7.5, tolerance: 0.2, explanation: 't = √(2·45/1.6) ≈ 7.5 s.', difficulty: 2, context: 'Balcony on the Moon' },
  ],
  'energy-conservation': [
    { prompt: 'A 50 kg skater starts from rest at 5 m height. Speed at the bottom ignoring friction (m/s, 1 decimal)?', type: 'numeric', answer: 9.9, tolerance: 0.2, explanation: 'mgh = ½mv² → v = √(2·9.8·5) ≈ 9.9.', difficulty: 1, context: 'Skate park' },
    { prompt: 'With friction, the skater reaches 8 m/s. Energy lost to heat (J)?', type: 'numeric', answer: 850, tolerance: 10, explanation: '2450 − ½·50·64 = 850 J.', difficulty: 2, context: 'Skate park' },
  ],
  orbits: [
    { prompt: 'If the Moon were twice as far from Earth, the gravitational force on it would be…', type: 'choice', options: ['half', 'a quarter', 'double', 'the same'], answer: 'a quarter', explanation: 'Inverse-square law.', difficulty: 1, context: 'Moon orbit' },
  ],
  thesis: [
    { prompt: 'Which is the strongest thesis for “Should schools keep exams?”', type: 'choice', options: ['Exams are a big topic with many sides.', 'Schools should shrink exams to short oral defenses because process evidence is fairer and harder to fake.', 'This essay will discuss exams.', 'Exams are good and bad.'], answer: 'Schools should shrink exams to short oral defenses because process evidence is fairer and harder to fake.', explanation: 'A strong thesis takes a position and previews the reasoning.', difficulty: 1, context: 'Essay planning' },
    { prompt: 'Rewrite as a one-sentence arguable thesis: “Social media and teenagers.”', type: 'short', answer: 'any arguable claim with a reason', explanation: 'E.g. “Schools should teach social-media literacy because teenagers already use it to learn.”', difficulty: 2, context: 'Essay planning' },
  ],
  pathos: [
    { prompt: 'Which sentence uses pathos honestly rather than manipulatively?', type: 'choice', options: ['If you disagree you clearly don’t care about children.', 'Imagine a student who understood all year but froze for three hours in November.', 'Studies show exams are stressful (no citation).', 'Everyone knows exams are evil.'], answer: 'Imagine a student who understood all year but froze for three hours in November.', explanation: 'A concrete, truthful scene invites empathy without coercion.', difficulty: 2, context: 'Rhetoric' },
  ],
  nominalization: [
    { prompt: 'Which word is a nominalization?', type: 'choice', options: ['decide', 'decision', 'decisive', 'decidedly'], answer: 'decision', explanation: 'A verb turned into a noun.', difficulty: 1, context: 'Zombie nouns' },
    { prompt: 'Rewrite with a human subject and an active verb: “The implementation of the policy was carried out by the committee.”', type: 'short', answer: 'The committee implemented the policy.', explanation: 'Find the hidden verb (implement) and who did it.', difficulty: 2, context: 'Zombie nouns' },
  ],
  'sensory-detail': [
    { prompt: 'Which line shows rather than tells?', type: 'choice', options: ['It was very cold outside.', 'Her breath hung in the air and the gate squealed with frost.', 'The weather was bad.', 'She felt cold.'], answer: 'Her breath hung in the air and the gate squealed with frost.', explanation: 'Sound, sight and touch instead of a label.', difficulty: 1, context: 'Descriptive writing' },
  ],
  'position-velocity': [
    { prompt: 'A bus goes 12 km east then 4 km west in 30 minutes. Average velocity (km/h, east positive)?', type: 'numeric', answer: 16, tolerance: 0.1, explanation: 'Displacement 8 km / 0.5 h = 16 km/h.', difficulty: 1, context: 'Bus route' },
  ],
  'area-rings': [
    { prompt: 'A thin ring of radius r = 2 and thickness dr = 0.1 has area approximately…', type: 'numeric', answer: 1.26, tolerance: 0.05, explanation: '2πr·dr = 2π(2)(0.1) ≈ 1.26.', difficulty: 1, context: 'Slicing a pizza' },
  ],
  'tiny-changes': [
    { prompt: 'If A(x) = x³ and x grows from 2 by dx = 0.01, dA ≈ ?', type: 'numeric', answer: 0.12, tolerance: 0.01, explanation: 'dA ≈ 3x²·dx = 12 × 0.01.', difficulty: 2, context: 'Tiny changes' },
  ],
  'sine-derivative': [
    { prompt: 'd/dθ [sin θ] at θ = π/3 equals…', type: 'numeric', answer: 0.5, tolerance: 0.01, explanation: 'cos(π/3) = 0.5.', difficulty: 1, context: 'Unit circle' },
  ],
}

/** Generic questions when a topic has no bank entry. */
export function genericQuestions(topicName, lessonTitle) {
  return [
    { prompt: `In your own words, explain “${topicName}” (from “${lessonTitle}”) to a classmate who missed the lesson. Include one real-life example.`, type: 'short', answer: 'open', explanation: 'A good explanation names the idea, gives an example and says when it applies.', difficulty: 1, context: 'Explain it' },
    { prompt: `Give one situation where “${topicName}” would NOT apply, and say why.`, type: 'short', answer: 'open', explanation: 'Knowing the limits of an idea is part of mastering it.', difficulty: 2, context: 'Edge cases' },
    { prompt: `Write a question of your own about “${topicName}” that would be hard for the class, and answer it.`, type: 'short', answer: 'open', explanation: 'Writing questions reveals what you understand.', difficulty: 3, context: 'Teach it' },
  ]
}
