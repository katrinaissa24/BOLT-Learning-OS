// Generates supabase/02_seed.sql from src/data/seed.js so the DB and the local fallback never drift.
import { writeFileSync } from 'node:fs'
import { seed } from '../src/data/seed.js'

const q = (v) => {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}

function insert(table, rows, cols, conflict = 'id') {
  if (!rows.length) return ''
  const chunks = []
  for (let i = 0; i < rows.length; i += 100) {
    const slice = rows.slice(i, i + 100)
    const values = slice.map((r) => `(${cols.map((c) => q(r[c])).join(', ')})`).join(',\n')
    chunks.push(`insert into public.${table} (${cols.map((c) => `"${c}"`).join(', ')}) values\n${values}\non conflict (${conflict}) do nothing;`)
  }
  return chunks.join('\n\n')
}

const parts = {
  '02a_core.sql': [
    ['profiles', ['id', 'email', 'full_name', 'role', 'grade', 'avatar', 'child_id', 'title']],
    ['courses', ['id', 'title', 'subject', 'grade', 'description', 'color', 'icon', 'teacher_id', 'exam_date']],
    ['lessons', ['id', 'course_id', 'position', 'title', 'youtube_id', 'duration_min', 'summary', 'topics', 'skills', 'interactive', 'transcript']],
    ['badges', ['id', 'name', 'category', 'skill', 'icon', 'rarity', 'description', 'how_to_earn']],
    ['enrollments', ['student_id', 'course_id'], 'student_id, course_id'],
    ['schedule', ['id', 'day', 'start', 'end', 'course_id', 'label', 'room']],
  ],
  '02b_progress.sql': [['lesson_progress', ['id', 'student_id', 'lesson_id', 'status', 'score', 'topic_scores', 'completed_at', 'time_spent_min']]],
  '02c_points.sql': [['point_events', ['id', 'student_id', 'course_id', 'points', 'reason', 'created_at']]],
  '02d_attendance.sql': [['attendance', ['id', 'student_id', 'date', 'status', 'note', 'flag']]],
  '02e_activity.sql': [
    ['monthly_awards', ['id', 'course_id', 'month', 'student_id', 'rank']],
    ['student_badges', ['id', 'student_id', 'badge_id', 'earned_at', 'evidence']],
    ['submissions', ['id', 'student_id', 'lesson_id', 'type', 'title', 'content', 'process', 'metrics', 'ai_usage', 'submitted_at', 'grade', 'teacher_feedback', 'status']],
    ['chat_messages', ['id', 'student_id', 'lesson_id', 'role', 'content', 'video_t', 'topic', 'created_at']],
    ['projects', ['id', 'student_id', 'title', 'description', 'skills', 'course_id', 'status', 'validated_by', 'artifact', 'created_at']],
  ],
}
const keyOf = { profiles: 'profiles', courses: 'courses', lessons: 'lessons', badges: 'badges', enrollments: 'enrollments', schedule: 'schedule', lesson_progress: 'lessonProgress', point_events: 'pointEvents', attendance: 'attendance', monthly_awards: 'monthlyAwards', student_badges: 'studentBadges', submissions: 'submissions', chat_messages: 'chatMessages', projects: 'projects' }

import { readdirSync, unlinkSync } from 'node:fs'
for (const f of readdirSync(new URL('../supabase/', import.meta.url))) if (/^02.*\.sql$/.test(f)) unlinkSync(new URL('../supabase/' + f, import.meta.url))
for (const [file, tables] of Object.entries(parts)) {
  const body = tables.map(([t, cols, conflict]) => insert(t, seed[keyOf[t]], cols, conflict)).join('\n\n')
  const out = `-- BOLT seed data, part ${file}. Run in order: 02a, 02b, 02c, 02d, 02e (after 01_schema.sql).\n\n${body}\n`
  writeFileSync(new URL('../supabase/' + file, import.meta.url), out)
  console.log('wrote', file, out.length, 'bytes')
}
