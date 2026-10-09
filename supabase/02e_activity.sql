-- BOLT seed data, part 02e_activity.sql. Run in order: 02a, 02b, 02c, 02d, 02e (after 01_schema.sql).

insert into public.monthly_awards ("id", "course_id", "month", "student_id", "rank") values
('ma-1', 'math-12', '2026-09', '00000000-0000-4000-8000-000000000011', 1),
('ma-2', 'math-12', '2026-09', '00000000-0000-4000-8000-000000000010', 2),
('ma-3', 'math-12', '2026-09', '00000000-0000-4000-8000-000000000016', 3),
('ma-4', 'eng-12', '2026-09', '00000000-0000-4000-8000-000000000012', 1),
('ma-5', 'eng-12', '2026-09', '00000000-0000-4000-8000-000000000016', 2),
('ma-6', 'eng-12', '2026-09', '00000000-0000-4000-8000-000000000010', 3),
('ma-7', 'phy-12', '2026-09', '00000000-0000-4000-8000-000000000016', 1),
('ma-8', 'phy-12', '2026-09', '00000000-0000-4000-8000-000000000011', 2),
('ma-9', 'phy-12', '2026-09', '00000000-0000-4000-8000-000000000020', 3)
on conflict (id) do nothing;

insert into public.student_badges ("id", "student_id", "badge_id", "earned_at", "evidence") values
('sb-1', '00000000-0000-4000-8000-000000000010', 'first-bolt', '2026-09-04T15:30:00Z', 'Completed “The Essence of Calculus” with 82%.'),
('sb-2', '00000000-0000-4000-8000-000000000010', 'always-here', '2026-09-30T16:00:00Z', 'September 2026: 22/22 days present, 0 lates.'),
('sb-3', '00000000-0000-4000-8000-000000000010', 'monthly-podium', '2026-09-30T20:00:00Z', 'Calculus leaderboard · 2nd place · September 2026.'),
('sb-4', '00000000-0000-4000-8000-000000000010', 'critical-eye', '2026-10-02T17:20:00Z', 'Spot the Flaw: 5 wins (chain rule, energy, rhetoric).'),
('sb-5', '00000000-0000-4000-8000-000000000010', 'curious-mind', '2026-09-21T14:10:00Z', '10 questions asked to the tutor across 4 lessons.'),
('sb-6', '00000000-0000-4000-8000-000000000010', 'evidence-detective', '2026-10-06T18:05:00Z', 'Case file “The Viral Study”: 93% accuracy.'),
('sb-7', '00000000-0000-4000-8000-000000000010', 'honest-process', '2026-10-05T19:00:00Z', 'Essay “Exams in 2036”: AI declared, 11% AI-assisted text, 3 revision passes.'),
('sb-8', '00000000-0000-4000-8000-000000000011', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-9', '00000000-0000-4000-8000-000000000011', 'monthly-podium', '2026-09-30T20:00:00Z', 'Calculus · 1st · September.'),
('sb-10', '00000000-0000-4000-8000-000000000011', 'calculus-navigator', '2026-10-07T16:00:00Z', 'All 7 calculus checkpoints complete.'),
('sb-11', '00000000-0000-4000-8000-000000000011', 'debate-victor', '2026-10-03T18:00:00Z', 'Debate: “Should homework exist?” — won 4 rounds.'),
('sb-12', '00000000-0000-4000-8000-000000000011', 'oral-defender', '2026-09-25T13:00:00Z', 'Oral defense of chain rule proof, validated by R. Haddad.'),
('sb-13', '00000000-0000-4000-8000-000000000012', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-14', '00000000-0000-4000-8000-000000000012', 'wordsmith', '2026-10-06T16:00:00Z', 'All 7 English checkpoints complete.'),
('sb-15', '00000000-0000-4000-8000-000000000012', 'project-proof', '2026-10-01T12:00:00Z', 'Project “Voices of Beirut” podcast validated.'),
('sb-16', '00000000-0000-4000-8000-000000000012', 'monthly-podium', '2026-09-30T20:00:00Z', 'English · 1st · September.'),
('sb-17', '00000000-0000-4000-8000-000000000016', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-18', '00000000-0000-4000-8000-000000000016', 'monthly-podium', '2026-09-30T20:00:00Z', 'Physics · 1st · September.'),
('sb-19', '00000000-0000-4000-8000-000000000016', 'always-here', '2026-09-30T16:00:00Z', 'September: perfect attendance.'),
('sb-20', '00000000-0000-4000-8000-000000000016', 'peer-mentor', '2026-10-04T12:00:00Z', 'Tutored Karim on free-body diagrams.'),
('sb-21', '00000000-0000-4000-8000-000000000016', 'explainer', '2026-10-02T12:00:00Z', 'Explain Back: 3 deep-understanding results.'),
('sb-22', '00000000-0000-4000-8000-000000000016', 'momentum', '2026-09-12T12:00:00Z', '7-day streak.'),
('sb-23', '00000000-0000-4000-8000-000000000020', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-24', '00000000-0000-4000-8000-000000000020', 'monthly-podium', '2026-09-30T20:00:00Z', 'Physics · 3rd · September.'),
('sb-25', '00000000-0000-4000-8000-000000000020', 'comeback', '2026-10-05T12:00:00Z', 'L’Hôpital: 42% → 86% after practice branch.'),
('sb-26', '00000000-0000-4000-8000-000000000014', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-27', '00000000-0000-4000-8000-000000000015', 'first-bolt', '2026-09-04T15:00:00Z', 'Completed first lesson.'),
('sb-28', '00000000-0000-4000-8000-000000000018', 'first-bolt', '2026-09-03T15:00:00Z', 'Completed first lesson.'),
('sb-29', '00000000-0000-4000-8000-000000000018', 'curious-mind', '2026-09-28T15:00:00Z', '10 tutor questions.'),
('sb-30', '00000000-0000-4000-8000-000000000017', 'first-bolt', '2026-09-05T15:00:00Z', 'Completed first lesson.'),
('sb-31', '00000000-0000-4000-8000-000000000021', 'first-bolt', '2026-09-05T15:00:00Z', 'Completed first lesson.'),
('sb-32', '00000000-0000-4000-8000-000000000013', 'first-bolt', '2026-09-09T15:00:00Z', 'Completed first lesson.'),
('sb-33', '00000000-0000-4000-8000-000000000019', 'first-bolt', '2026-09-15T15:00:00Z', 'Completed first lesson.'),
('sb-34', '00000000-0000-4000-8000-000000000011', 'always-here', '2026-09-30T16:00:00Z', 'September: perfect attendance.')
on conflict (id) do nothing;

insert into public.submissions ("id", "student_id", "lesson_id", "type", "title", "content", "process", "metrics", "ai_usage", "submitted_at", "grade", "teacher_feedback", "status") values
('sub-maya-eng2', '00000000-0000-4000-8000-000000000010', 'eng-12-l2', 'essay', 'Should schools in 2036 still have exams?', 'Should schools in 2036 still have exams?

Exams were invented for a world with scarce information and expensive teachers. In 2036, neither is true. Every student will carry a tutor in their pocket, so the question is not whether we can test memory, but whether memory is still what we should be testing.

First, exams measure a single moment. A student who understood calculus all year but froze for three hours in November is recorded as a failure. Continuous evidence — projects, oral defenses, and recorded thinking — tells a truer story.

Some argue that exams are fair because every student faces the same paper. But fairness of format is not fairness of opportunity. A student with a quiet home and a tutor is not facing the same paper as one working evenings. Process-based assessment can see effort, growth and honesty, which a single paper cannot.

Admittedly, exams are hard to cheat and easy to compare. That is a real advantage, and the alternative must be equally trustworthy. The answer is not to delete exams but to shrink them: short, oral, and verified, surrounded by a year of visible thinking.

In 2036, schools should keep a small exam and build a large portfolio around it. We should test what people can do with knowledge, not only whether they can retrieve it under pressure.', '[{"t":0,"type":"snapshot","label":"Started","chars":0},{"t":12,"type":"type","chars":46,"text":"Should schools in 2036 still have exams?"},{"t":48,"type":"pause","seconds":36,"note":"Thinking after writing the title"},{"t":90,"type":"type","chars":210},{"t":180,"type":"delete","chars":60,"note":"Rewrote the opening sentence"},{"t":240,"type":"type","chars":190},{"t":300,"type":"snapshot","label":"Draft 1","chars":420},{"t":330,"type":"type","chars":260},{"t":420,"type":"pause","seconds":85,"note":"Long pause before the counterargument paragraph"},{"t":505,"type":"ai_prompt","prompt":"What is the strongest argument FOR keeping exams? I want to answer it, not avoid it.","reply":"The strongest case is comparability and cheating resistance: a controlled, timed paper gives every student the same conditions and is hard to fake. If you concede that, your counter needs to show how process-based evidence can be equally trustworthy."},{"t":540,"type":"ai_insert","chars":118,"text":"Admittedly, exams are hard to cheat and easy to compare. That is a real advantage, and the alternative must be equally trustworthy."},{"t":600,"type":"type","chars":230,"note":"Wrote her own answer to the counterargument"},{"t":720,"type":"snapshot","label":"Draft 2","chars":1130},{"t":760,"type":"delete","chars":40},{"t":790,"type":"type","chars":180},{"t":900,"type":"paste","chars":38,"text":"a student working evenings","source":"own notes"},{"t":960,"type":"type","chars":150},{"t":1120,"type":"pause","seconds":50,"note":"Re-reading"},{"t":1170,"type":"delete","chars":95,"note":"Cut a repetitive sentence in paragraph 3"},{"t":1230,"type":"type","chars":120},{"t":1320,"type":"snapshot","label":"Final","chars":1540}]'::jsonb, '{"total_seconds":1320,"active_seconds":1010,"keystrokes":1890,"words":318,"pasted_chars":38,"ai_chars":118,"ai_prompts":1,"deletions":4,"snapshots":3,"longest_pause_seconds":85,"revision_ratio":0.21}'::jsonb, '{"declared":true,"prompts":1,"share_of_text":0.11,"mode":"counterargument coaching"}'::jsonb, '2026-10-05T18:50:00Z', null, null, 'submitted'),
('sub-omar-eng2', '00000000-0000-4000-8000-000000000011', 'eng-12-l2', 'essay', 'Exams: a necessary stress', null, null, '{"total_seconds":2410,"active_seconds":1900,"keystrokes":3100,"words":402,"pasted_chars":0,"ai_chars":0,"ai_prompts":0,"deletions":11,"snapshots":4,"longest_pause_seconds":120,"revision_ratio":0.34}'::jsonb, '{"declared":false,"prompts":0,"share_of_text":0}'::jsonb, '2026-10-05T20:10:00Z', 17, 'Strong structure.', 'graded'),
('sub-karim-eng2', '00000000-0000-4000-8000-000000000013', 'eng-12-l2', 'essay', 'Exams in 2036', null, null, '{"total_seconds":4,"active_seconds":4,"keystrokes":2,"words":611,"pasted_chars":3980,"ai_chars":0,"ai_prompts":0,"deletions":0,"snapshots":1,"longest_pause_seconds":0,"revision_ratio":0}'::jsonb, '{"declared":false,"prompts":0,"share_of_text":0,"suspected_external":true}'::jsonb, '2026-10-05T23:58:00Z', null, null, 'flagged'),
('sub-lina-eng2', '00000000-0000-4000-8000-000000000012', 'eng-12-l2', 'essay', 'The exam is not the enemy', null, null, '{"total_seconds":1980,"active_seconds":1650,"keystrokes":2800,"words":455,"pasted_chars":0,"ai_chars":210,"ai_prompts":3,"deletions":9,"snapshots":5,"longest_pause_seconds":60,"revision_ratio":0.4}'::jsonb, '{"declared":true,"prompts":3,"share_of_text":0.08,"mode":"vocabulary & transitions"}'::jsonb, '2026-10-05T17:30:00Z', 18, 'Excellent revision discipline.', 'graded'),
('sub-ali-eng2', '00000000-0000-4000-8000-000000000019', 'eng-12-l2', 'essay', 'exams', null, null, '{"total_seconds":11400,"active_seconds":1400,"keystrokes":900,"words":142,"pasted_chars":0,"ai_chars":0,"ai_prompts":0,"deletions":25,"snapshots":2,"longest_pause_seconds":2600,"revision_ratio":0.9}'::jsonb, '{"declared":false,"prompts":0,"share_of_text":0}'::jsonb, '2026-10-06T01:20:00Z', null, null, 'submitted'),
('sub-rami-eng2', '00000000-0000-4000-8000-000000000017', 'eng-12-l2', 'essay', 'Why exams should stay', null, null, '{"total_seconds":1500,"active_seconds":1300,"keystrokes":2100,"words":330,"pasted_chars":0,"ai_chars":640,"ai_prompts":6,"deletions":2,"snapshots":2,"longest_pause_seconds":30,"revision_ratio":0.05}'::jsonb, '{"declared":false,"prompts":6,"share_of_text":0.36,"mode":"paragraph generation"}'::jsonb, '2026-10-05T21:00:00Z', null, null, 'flagged'),
('sub-yara-eng2', '00000000-0000-4000-8000-000000000014', 'eng-12-l2', 'essay', 'A smaller exam', null, null, '{"total_seconds":1700,"active_seconds":1500,"keystrokes":2400,"words":360,"pasted_chars":0,"ai_chars":0,"ai_prompts":1,"deletions":7,"snapshots":3,"longest_pause_seconds":95,"revision_ratio":0.25}'::jsonb, '{"declared":true,"prompts":1,"share_of_text":0,"mode":"asked for feedback only"}'::jsonb, '2026-10-05T19:15:00Z', 15, 'Good, develop the counter.', 'graded'),
('sub-nour-eng2', '00000000-0000-4000-8000-000000000016', 'eng-12-l2', 'essay', 'Testing what matters', null, null, '{"total_seconds":2100,"active_seconds":1850,"keystrokes":3300,"words":480,"pasted_chars":0,"ai_chars":0,"ai_prompts":0,"deletions":14,"snapshots":5,"longest_pause_seconds":70,"revision_ratio":0.38}'::jsonb, '{"declared":false,"prompts":0,"share_of_text":0}'::jsonb, '2026-10-05T16:40:00Z', 19, 'Outstanding.', 'graded')
on conflict (id) do nothing;

insert into public.chat_messages ("id", "student_id", "lesson_id", "role", "content", "video_t", "topic", "created_at") values
('cm-1', '00000000-0000-4000-8000-000000000010', 'math-12-l4', 'user', 'Why do we multiply by the inner derivative? Where does the extra 2x come from?', 540, 'chain-rule', '2026-09-24T15:12:00Z'),
('cm-2', '00000000-0000-4000-8000-000000000013', 'math-12-l4', 'user', 'I dont get which one is inside and which is outside', 560, 'chain-rule', '2026-09-24T15:20:00Z'),
('cm-3', '00000000-0000-4000-8000-000000000015', 'math-12-l4', 'user', 'is chain rule the same as product rule', 530, 'chain-rule', '2026-09-24T16:02:00Z'),
('cm-4', '00000000-0000-4000-8000-000000000021', 'math-12-l4', 'user', 'can you show the chain rule with a real example like speed?', 600, 'chain-rule', '2026-09-25T10:30:00Z'),
('cm-5', '00000000-0000-4000-8000-000000000018', 'math-12-l4', 'user', 'why is it g dh plus h dg and not just dg times dh', 250, 'product-rule', '2026-09-24T15:40:00Z'),
('cm-6', '00000000-0000-4000-8000-000000000014', 'math-12-l4', 'user', 'What happens to the little corner piece in the box?', 230, 'product-rule', '2026-09-24T15:45:00Z'),
('cm-7', '00000000-0000-4000-8000-000000000010', 'math-12-l5', 'user', 'When is L’Hôpital allowed? Only 0/0?', 600, 'lhopital', '2026-10-01T15:12:00Z'),
('cm-8', '00000000-0000-4000-8000-000000000020', 'math-12-l5', 'user', 'does it work for infinity over infinity too', 620, 'lhopital', '2026-10-01T15:30:00Z'),
('cm-9', '00000000-0000-4000-8000-000000000013', 'math-12-l5', 'user', 'epsilon delta makes no sense, why do we need it', 300, 'epsilon-delta', '2026-10-01T16:00:00Z'),
('cm-10', '00000000-0000-4000-8000-000000000017', 'math-12-l5', 'user', 'what is delta exactly', 290, 'epsilon-delta', '2026-10-02T09:10:00Z'),
('cm-11', '00000000-0000-4000-8000-000000000012', 'math-12-l2', 'user', 'How is the tangent slope different from the average slope between two points?', 330, 'tangent-slope', '2026-09-10T15:00:00Z'),
('cm-12', '00000000-0000-4000-8000-000000000015', 'math-12-l2', 'user', 'if dt is zero isnt it dividing by zero', 340, 'tangent-slope', '2026-09-10T15:05:00Z'),
('cm-13', '00000000-0000-4000-8000-000000000019', 'math-12-l1', 'user', 'why does the ring become a rectangle', 150, 'area-rings', '2026-09-15T15:00:00Z'),
('cm-14', '00000000-0000-4000-8000-000000000019', 'math-12-l1', 'user', 'what graph are we talking about', 250, 'area-under-graph', '2026-09-15T15:08:00Z'),
('cm-15', '00000000-0000-4000-8000-000000000011', 'math-12-l6', 'user', 'Is the fundamental theorem why integration undoes differentiation?', 660, 'ftc', '2026-10-05T15:00:00Z'),
('cm-16', '00000000-0000-4000-8000-000000000016', 'math-12-l3', 'user', 'Can you show the unit circle step for cos too?', 600, 'sine-derivative', '2026-09-17T15:00:00Z'),
('cm-17', '00000000-0000-4000-8000-000000000010', 'phy-12-l4', 'user', 'If speed is constant how can there be acceleration?', 220, 'centripetal', '2026-09-29T09:15:00Z'),
('cm-18', '00000000-0000-4000-8000-000000000014', 'phy-12-l4', 'user', 'why v squared over r and not v over r', 230, 'centripetal', '2026-09-29T09:20:00Z'),
('cm-19', '00000000-0000-4000-8000-000000000021', 'phy-12-l4', 'user', 'so is centrifugal force fake or not', 450, 'fictitious-force', '2026-09-29T09:40:00Z'),
('cm-20', '00000000-0000-4000-8000-000000000013', 'phy-12-l3', 'user', 'if I push a wall and it doesnt move where did the force go', 200, 'f-equals-ma', '2026-09-22T09:00:00Z'),
('cm-21', '00000000-0000-4000-8000-000000000019', 'phy-12-l3', 'user', 'if forces are equal and opposite why does anything move', 320, 'action-reaction', '2026-09-22T09:05:00Z'),
('cm-22', '00000000-0000-4000-8000-000000000015', 'phy-12-l3', 'user', 'same question as the horse and cart thing', 330, 'action-reaction', '2026-09-22T09:06:00Z'),
('cm-23', '00000000-0000-4000-8000-000000000012', 'phy-12-l2', 'user', 'Does a feather and a hammer really fall the same in a vacuum?', 330, 'free-fall', '2026-09-15T09:00:00Z'),
('cm-24', '00000000-0000-4000-8000-000000000017', 'phy-12-l2', 'user', 'what is terminal velocity of a human', 450, 'free-fall', '2026-09-15T09:10:00Z'),
('cm-25', '00000000-0000-4000-8000-000000000020', 'phy-12-l6', 'user', 'where does the energy go with friction, is it destroyed', 230, 'energy-conservation', '2026-10-06T09:00:00Z'),
('cm-26', '00000000-0000-4000-8000-000000000021', 'phy-12-l6', 'user', 'why is energy not conserved if friction', 240, 'energy-conservation', '2026-10-06T09:03:00Z'),
('cm-27', '00000000-0000-4000-8000-000000000010', 'eng-12-l2', 'user', 'Is using pathos manipulative? How do I use it honestly in my essay?', 180, 'pathos', '2026-09-16T11:30:00Z'),
('cm-28', '00000000-0000-4000-8000-000000000011', 'eng-12-l2', 'user', 'how much pathos is too much', 185, 'pathos', '2026-09-16T11:32:00Z'),
('cm-29', '00000000-0000-4000-8000-000000000017', 'eng-12-l2', 'user', 'what makes a thesis strong vs weak', 230, 'thesis', '2026-09-16T11:40:00Z'),
('cm-30', '00000000-0000-4000-8000-000000000013', 'eng-12-l2', 'user', 'can my thesis be a question', 235, 'thesis', '2026-09-16T11:41:00Z'),
('cm-31', '00000000-0000-4000-8000-000000000019', 'eng-12-l1', 'user', 'what does show dont tell mean exactly', 110, 'show-dont-tell', '2026-09-09T11:00:00Z'),
('cm-32', '00000000-0000-4000-8000-000000000017', 'eng-12-l3', 'user', 'is “decision” a zombie noun', 60, 'nominalization', '2026-09-23T11:00:00Z'),
('cm-33', '00000000-0000-4000-8000-000000000018', 'eng-12-l3', 'user', 'how do I find the hidden verb', 200, 'active-verbs', '2026-09-23T11:05:00Z'),
('cm-34', '00000000-0000-4000-8000-000000000014', 'eng-12-l4', 'user', 'what is the difference between metaphor and simile for the exam', 140, 'metaphor-structure', '2026-09-30T11:00:00Z'),
('cm-35', '00000000-0000-4000-8000-000000000011', 'eng-12-l5', 'user', 'Can a villain have a hero’s journey?', 180, 'hero-journey', '2026-10-07T11:00:00Z'),
('cm-36', '00000000-0000-4000-8000-000000000010', 'math-12-l2', 'user', 'Why does t³ give 3t²? Can you walk the algebra once?', 440, 'derivative-definition', '2026-09-10T15:20:00Z'),
('cm-37', '00000000-0000-4000-8000-000000000013', 'math-12-l2', 'user', 'I lost it at the algebra part', 440, 'derivative-definition', '2026-09-10T15:22:00Z'),
('cm-38', '00000000-0000-4000-8000-000000000021', 'math-12-l2', 'user', 'where did the dt squared go', 445, 'derivative-definition', '2026-09-10T15:25:00Z')
on conflict (id) do nothing;

insert into public.projects ("id", "student_id", "title", "description", "skills", "course_id", "status", "validated_by", "artifact", "created_at") values
('pr-1', '00000000-0000-4000-8000-000000000010', 'Bridge Load Simulator', 'A browser simulation of a cedar-wood footbridge showing how load distributes across trusses, with a slider for pedestrian count.', '["problem-solving","critical-thinking"]'::jsonb, 'phy-12', 'pending', null, 'Live demo + 2-minute walkthrough', '2026-10-04T12:00:00Z'),
('pr-2', '00000000-0000-4000-8000-000000000012', 'Voices of Beirut', 'A four-episode podcast interviewing grandparents about the city, edited with narrative structure from the Hero’s Journey.', '["communication","creative-thinking"]'::jsonb, 'eng-12', 'validated', '00000000-0000-4000-8000-000000000001', 'Podcast feed', '2026-09-28T12:00:00Z'),
('pr-3', '00000000-0000-4000-8000-000000000011', 'Optimal Delivery Routes', 'Used derivatives to minimise the fuel cost of a delivery route across three Beirut neighbourhoods.', '["problem-solving"]'::jsonb, 'math-12', 'validated', '00000000-0000-4000-8000-000000000001', 'Report + spreadsheet model', '2026-09-30T12:00:00Z'),
('pr-4', '00000000-0000-4000-8000-000000000016', 'Energy Audit of the Gym', 'Measured power use of gym lighting and proposed a schedule that saves 18% — presented to school administration.', '["problem-solving","communication"]'::jsonb, 'phy-12', 'validated', '00000000-0000-4000-8000-000000000001', 'Slides + data log', '2026-10-02T12:00:00Z'),
('pr-5', '00000000-0000-4000-8000-000000000014', 'Poems in Motion', 'Short animated readings of three unseen poems with annotations of sound devices.', '["creative-thinking","communication"]'::jsonb, 'eng-12', 'pending', null, 'Video series', '2026-10-06T12:00:00Z')
on conflict (id) do nothing;
