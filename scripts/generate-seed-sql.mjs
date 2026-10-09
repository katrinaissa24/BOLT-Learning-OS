// Generates a compact Supabase seed (supabase/02_seed_part1.sql, 02_seed_part2.sql) from src/data/seed.js.
// Repetitive rows (enrollments, attendance, ids, point reasons) are rebuilt by SQL so the files stay small
// enough to paste into the Supabase SQL editor. Output is checked to match the seed exactly.
import { writeFileSync, readdirSync, unlinkSync } from 'node:fs'
import { seed, SCHOOL_DAYS } from '../src/data/seed.js'

const UUID = /^00000000-0000-4000-8000-0000000000(\d\d)$/
const n = (id) => Number(id.match(UUID)[1])
const q = (v) => {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`
  if (UUID.test(v)) return `bolt_u(${n(v)})`
  return `'${String(v).replace(/'/g, "''")}'`
}
const rows = (list, cols) => list.map((r) => `(${cols.map((c) => q(r[c])).join(',')})`).join(',\n')
const insert = (table, list, cols, casts = {}) => {
  const sel = cols.map((c) => (casts[c] ? `"${c}"::${casts[c]}` : `"${c}"`)).join(', ')
  return `insert into public.${table} (${cols.map((c) => `"${c}"`).join(', ')})\nselect ${sel} from (values\n${rows(list, cols)}\n) v(${cols.map((c) => `"${c}"`).join(', ')})\non conflict do nothing;`
}
const helper = `create or replace function public.bolt_u(n int) returns uuid language sql immutable as $$ select ('00000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid $$;`

/* ---------------- part 1: people, courses, lessons, badges, timetable ---------------- */
const part1 = [
  '-- BOLT seed, part 1 of 3. Run after 01_schema.sql.',
  helper,
  insert('profiles', seed.profiles, ['id', 'email', 'full_name', 'role', 'grade', 'avatar', 'child_id', 'title'], { id: 'uuid', child_id: 'uuid', grade: 'int' }),
  insert('courses', seed.courses, ['id', 'title', 'subject', 'grade', 'description', 'color', 'icon', 'teacher_id', 'exam_date'], { teacher_id: 'uuid', exam_date: 'date' }),
  insert('lessons', seed.lessons, ['id', 'course_id', 'position', 'title', 'youtube_id', 'duration_min', 'summary', 'topics', 'skills', 'interactive', 'transcript'], { topics: 'jsonb', skills: 'jsonb', transcript: 'jsonb' }),
  insert('badges', seed.badges, ['id', 'name', 'category', 'skill', 'icon', 'rarity', 'description', 'how_to_earn']),
  insert('schedule', seed.schedule, ['id', 'day', 'start', 'end', 'course_id', 'label', 'room'], { course_id: 'text' }),
  'drop function public.bolt_u(int);',
  `-- every student takes every course\ninsert into public.enrollments (student_id, course_id)\nselect p.id, c.id from public.profiles p cross join public.courses c where p.role = 'student'\non conflict do nothing;`,
].join('\n\n')

/* ---------------- part 2: progress, points, attendance, activity ---------------- */
const ts = (iso) => iso.replace('T', ' ').replace(':00Z', '+00') // 2026-09-04T15:30:00Z -> 2026-09-04 15:30+00
const progress = seed.lessonProgress.map((p) => `(${n(p.student_id)},'${p.lesson_id}','${p.status}',${p.score ?? 'null'},'${JSON.stringify(p.topic_scores)}',${p.completed_at ? `'${ts(p.completed_at)}'` : 'null'},${p.time_spent_min})`).join(',\n')

const LAB = ['Debate Arena win', 'Spot the Flaw', 'Explain Back · deep understanding', 'Evidence Detective case']
const points = seed.pointEvents.map((e) => {
  const num = e.id.slice(3)
  const day = e.created_at.slice(5, 10)
  const hit = /^Completed “(.*)”$/.exec(e.reason)
  const lessonByTitle = (t) => seed.lessons.find((l) => l.title === t && l.course_id === e.course_id).id
  if (hit) return `(${num},${n(e.student_id)},'${e.course_id}',${e.points},'c','${lessonByTitle(hit[1])}','${day}')`
  if (e.reason.startsWith('Extra practice branch · ')) {
    const topic = e.reason.slice('Extra practice branch · '.length)
    const l = seed.lessons.find((x) => x.course_id === e.course_id && x.topics[0].name === topic)
    return `(${num},${n(e.student_id)},'${e.course_id}',${e.points},'x','${l.id}','${day}')`
  }
  return `(${num},${n(e.student_id)},'${e.course_id}',${e.points},'l','${LAB.indexOf(e.reason)}','${day}')`
}).join(',\n')

const exceptions = seed.attendance.filter((a) => a.status !== 'present' || a.flag).map((a) => `(${n(a.student_id)},'${a.date}','${a.status}',${a.flag ? `'${a.flag}'` : 'null'},${a.flag ? q(a.note) : 'null'})`).join(',\n')

const part2 = [
  '-- BOLT seed, part 2 of 3. Run after part 1.',
  helper,
  `-- lesson progress: (student, lesson, status, score, topic scores, completed at, minutes)
insert into public.lesson_progress (id, student_id, lesson_id, status, score, topic_scores, completed_at, time_spent_min)
select 'lp-' || s || '-' || l, bolt_u(s), l, st, sc, ts::jsonb, ca::timestamptz, m from (values
${progress}
) v(s, l, st, sc, ts, ca, m)
on conflict do nothing;`,
  `-- points: kind c = lesson completed, x = extra practice branch, l = thinking lab (ref = which lab)
insert into public.point_events (id, student_id, course_id, points, reason, created_at)
select 'pe-' || v.num, bolt_u(v.s), v.c, v.pts,
  case v.kind
    when 'c' then 'Completed “' || les.title || '”'
    when 'x' then 'Extra practice branch · ' || (les.topics -> 0 ->> 'name')
    else (array['${LAB.join("','")}'])[v.ref::int + 1]
  end,
  ('2026-' || v.d || ' ' || case v.kind when 'c' then '15:40' when 'x' then '18:10' else '17:00' end || '+00')::timestamptz
from (values
${points}
) v(num, s, c, pts, kind, ref, d)
left join public.lessons les on les.id = v.ref
on conflict do nothing;`,
  `-- attendance: every school day present, then the exceptions below
insert into public.attendance (id, student_id, date, status, note, flag)
select 'att-' || lpad(right(p.id::text, 2), 2, '0') || '-' || d::date, p.id, d::date, 'present', null, null
from public.profiles p cross join unnest(array['${SCHOOL_DAYS.join("','")}']) d
where p.role = 'student'
on conflict do nothing;

update public.attendance a set status = v.st, flag = v.fl,
  note = coalesce(v.nt, case v.st when 'absent' then 'No note from guardian.' when 'excused' then 'Medical appointment (guardian note received).' end)
from (values
${exceptions}
) v(s, d, st, fl, nt)
where a.student_id = bolt_u(v.s) and a.date = v.d::date;`,
  'drop function public.bolt_u(int);',
].join('\n\n')

/* ---------------- part 3: stamps, essays, tutor questions, projects ---------------- */
const part3 = [
  '-- BOLT seed, part 3 of 3. Run after part 2.',
  helper,
  insert('monthly_awards', seed.monthlyAwards, ['id', 'course_id', 'month', 'student_id', 'rank'], { student_id: 'uuid' }),
  insert('student_badges', seed.studentBadges, ['id', 'student_id', 'badge_id', 'earned_at', 'evidence'], { student_id: 'uuid', earned_at: 'timestamptz' }),
  insert('submissions', seed.submissions, ['id', 'student_id', 'lesson_id', 'type', 'title', 'content', 'process', 'metrics', 'ai_usage', 'submitted_at', 'grade', 'teacher_feedback', 'status'], { student_id: 'uuid', process: 'jsonb', metrics: 'jsonb', ai_usage: 'jsonb', submitted_at: 'timestamptz', grade: 'numeric', content: 'text', teacher_feedback: 'text' }),
  insert('chat_messages', seed.chatMessages, ['id', 'student_id', 'lesson_id', 'role', 'content', 'video_t', 'topic', 'created_at'], { student_id: 'uuid', created_at: 'timestamptz' }),
  insert('projects', seed.projects, ['id', 'student_id', 'title', 'description', 'skills', 'course_id', 'status', 'validated_by', 'artifact', 'created_at'], { student_id: 'uuid', skills: 'jsonb', validated_by: 'uuid', created_at: 'timestamptz' }),
  'drop function public.bolt_u(int);',
].join('\n\n')

for (const f of readdirSync(new URL('../supabase/', import.meta.url))) if (/^02.*\.sql$/.test(f)) unlinkSync(new URL('../supabase/' + f, import.meta.url))
writeFileSync(new URL('../supabase/02_seed_part1.sql', import.meta.url), part1 + '\n')
writeFileSync(new URL('../supabase/02_seed_part2.sql', import.meta.url), part2 + '\n')
writeFileSync(new URL('../supabase/02_seed_part3.sql', import.meta.url), part3 + '\n')
console.log('part1', part1.length, '· part2', part2.length, '· part3', part3.length, 'bytes')
