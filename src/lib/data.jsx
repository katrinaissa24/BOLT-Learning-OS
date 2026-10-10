import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { seed } from '../data/seed'
import { uid } from './utils'

/**
 * DataProvider: the app's in-memory database.
 * Boots from the seed instantly, then overlays Supabase rows when they exist.
 * Writes go to Supabase (best effort) and to local state, so the UI always updates.
 */
const DataCtx = createContext(null)

const TABLES = {
  profiles: 'profiles', courses: 'courses', lessons: 'lessons', badges: 'badges', enrollments: 'enrollments',
  lessonProgress: 'lesson_progress', pointEvents: 'point_events', monthlyAwards: 'monthly_awards', studentBadges: 'student_badges',
  schedule: 'schedule', attendance: 'attendance', submissions: 'submissions', chatMessages: 'chat_messages', projects: 'projects',
}

/** Course content lives in code (src/data/seed.js), so new videos, transcripts and lessons show up without re-running SQL. */
const CODE_OWNED = new Set(['courses', 'lessons', 'badges'])
const rowKey = (r) => r.id ?? `${r.student_id}-${r.course_id}`
const mergeRows = (base, rows) => {
  const map = new Map(base.map((r) => [rowKey(r), r]))
  rows.forEach((r) => map.set(rowKey(r), r))
  return [...map.values()]
}

const LOCAL_WRITES = 'bolt.local.writes'
const readWrites = () => { try { return JSON.parse(localStorage.getItem(LOCAL_WRITES)) ?? {} } catch { return {} } }
const saveWrites = (w) => { try { localStorage.setItem(LOCAL_WRITES, JSON.stringify(w)) } catch { /* ignore */ } }

function applyLocalWrites(base) {
  const w = readWrites()
  const out = { ...base }
  for (const [key, rows] of Object.entries(w)) {
    if (!out[key]) continue
    const map = new Map(out[key].map((r) => [r.id ?? `${r.student_id}-${r.course_id}`, r]))
    rows.forEach((r) => map.set(r.id ?? `${r.student_id}-${r.course_id}`, r))
    out[key] = [...map.values()]
  }
  return out
}

export function DataProvider({ children }) {
  const [db, setDb] = useState(() => ({ ...applyLocalWrites(seed), practiceSets: [], source: supabase ? 'loading' : 'local' }))

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      const next = {}
      await Promise.all(Object.entries(TABLES).map(async ([key, table]) => {
        if (CODE_OWNED.has(key)) return
        try {
          const { data, error } = await supabase.from(table).select('*').limit(5000)
          // merge on top of the demo seed instead of replacing it, so a half-seeded database never hides the demo activity
          if (!error && Array.isArray(data) && data.length) next[key] = mergeRows(seed[key] || [], data)
        } catch { /* keep seed for this table */ }
      }))
      if (!cancelled) setDb((d) => ({ ...applyLocalWrites({ ...d, ...next }), source: Object.keys(next).length ? 'supabase' : 'local' }))
    })()
    return () => { cancelled = true }
  }, [])

  /** Generic insert: local state first, Supabase best effort. */
  const insert = useCallback(async (key, row) => {
    const withId = { id: row.id || `${key.slice(0, 2)}-${uid()}`, ...row }
    setDb((d) => ({ ...d, [key]: [...(d[key] || []), withId] }))
    const w = readWrites(); w[key] = [...(w[key] || []), withId]; saveWrites(w)
    if (supabase && TABLES[key]) {
      try { await supabase.from(TABLES[key]).upsert(withId) } catch (err) { console.warn('[BOLT] supabase write skipped:', err?.message) }
    }
    return withId
  }, [])

  const update = useCallback(async (key, id, patch) => {
    let updated = null
    setDb((d) => ({ ...d, [key]: (d[key] || []).map((r) => (r.id === id ? (updated = { ...r, ...patch }) : r)) }))
    const w = readWrites(); w[key] = [...(w[key] || []).filter((r) => r.id !== id), { id, ...(updated || patch) }]; saveWrites(w)
    if (supabase && TABLES[key]) {
      try { await supabase.from(TABLES[key]).update(patch).eq('id', id) } catch (err) { console.warn('[BOLT] supabase update skipped:', err?.message) }
    }
  }, [])

  const api = useMemo(() => ({
    db,
    insert, update,
    awardPoints: (student_id, course_id, points, reason) => insert('pointEvents', { student_id, course_id, points, reason, created_at: new Date().toISOString() }),
    upsertLessonProgress: async (student_id, lesson_id, patch) => {
      const existing = db.lessonProgress.find((p) => p.student_id === student_id && p.lesson_id === lesson_id)
      if (existing) return update('lessonProgress', existing.id, patch)
      return insert('lessonProgress', { student_id, lesson_id, status: 'in-progress', score: null, topic_scores: {}, completed_at: null, time_spent_min: 0, ...patch })
    },
    addChatMessage: (row) => insert('chatMessages', { role: 'user', created_at: new Date().toISOString(), ...row }),
    addSubmission: (row) => insert('submissions', { submitted_at: new Date().toISOString(), status: 'submitted', ...row }),
    updateSubmission: (id, patch) => update('submissions', id, patch),
    awardBadge: (student_id, badge_id, evidence) => {
      if (db.studentBadges.some((b) => b.student_id === student_id && b.badge_id === badge_id)) return null
      return insert('studentBadges', { student_id, badge_id, evidence, earned_at: new Date().toISOString() })
    },
    addProject: (row) => insert('projects', { status: 'pending', validated_by: null, created_at: new Date().toISOString(), ...row }),
    updateProject: (id, patch) => update('projects', id, patch),
    updateAttendance: (id, patch) => update('attendance', id, patch),
    savePracticeSet: (row) => insert('practiceSets', { created_at: new Date().toISOString(), ...row }),
    resetLocal: () => { try { localStorage.removeItem(LOCAL_WRITES) } catch { /* ignore */ } window.location.reload() },
  }), [db, insert, update])

  return <DataCtx.Provider value={api}>{children}</DataCtx.Provider>
}

export const useData = () => useContext(DataCtx)
