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
  for (let i = 0; i < rows.length; i += 200) {
    const slice = rows.slice(i, i + 200)
    const values = slice.map((r) => `(${cols.map((c) => q(r[c])).join(', ')})`).join(',\n')
    chunks.push(`insert into public.${table} (${cols.map((c) => `"${c}"`).join(', ')}) values\n${values}\non conflict (${conflict}) do nothing;`)
  }
  return chunks.join('\n\n')
}

const out = [
  '-- ============================================================',
  '-- BOLT seed data — generated from src/data/seed.js (npm run gen:sql). Run AFTER 01_schema.sql.',
  '-- ============================================================',
  insert('profiles', seed.profiles, ['id', 'email', 'full_name', 'role', 'grade', 'avatar', 'child_id', 'title']),
  insert('courses', seed.courses, ['id', 'title', 'subject', 'grade', 'description', 'color', 'icon', 'teacher_id', 'exam_date']),
  insert('lessons', seed.lessons, ['id', 'course_id', 'position', 'title', 'youtube_id', 'duration_min', 'summary', 'topics', 'skills', 'interactive', 'transcript']),
  insert('badges', seed.badges, ['id', 'name', 'category', 'skill', 'icon', 'rarity', 'description', 'how_to_earn']),
  insert('enrollments', seed.enrollments, ['student_id', 'course_id'], 'student_id, course_id'),
  insert('lesson_progress', seed.lessonProgress, ['id', 'student_id', 'lesson_id', 'status', 'score', 'topic_scores', 'completed_at', 'time_spent_min']),
  insert('point_events', seed.pointEvents, ['id', 'student_id', 'course_id', 'points', 'reason', 'created_at']),
  insert('monthly_awards', seed.monthlyAwards, ['id', 'course_id', 'month', 'student_id', 'rank']),
  insert('student_badges', seed.studentBadges, ['id', 'student_id', 'badge_id', 'earned_at', 'evidence']),
  insert('schedule', seed.schedule, ['id', 'day', 'start', 'end', 'course_id', 'label', 'room']),
  insert('attendance', seed.attendance, ['id', 'student_id', 'date', 'status', 'note', 'flag']),
  insert('submissions', seed.submissions, ['id', 'student_id', 'lesson_id', 'type', 'title', 'content', 'process', 'metrics', 'ai_usage', 'submitted_at', 'grade', 'teacher_feedback', 'status']),
  insert('chat_messages', seed.chatMessages, ['id', 'student_id', 'lesson_id', 'role', 'content', 'video_t', 'topic', 'created_at']),
  insert('projects', seed.projects, ['id', 'student_id', 'title', 'description', 'skills', 'course_id', 'status', 'validated_by', 'artifact', 'created_at']),
].join('\n\n')

writeFileSync(new URL('../supabase/02_seed.sql', import.meta.url), out + '\n')
console.log('wrote supabase/02_seed.sql', out.length, 'bytes')
