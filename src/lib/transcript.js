import { useEffect, useState } from 'react'
import baked from '../data/transcripts.json'

/**
 * Real video transcripts for the tutor.
 * Order: baked file (scripts/fetch-transcripts.mjs) → live /api/transcript (Vercel function) → the lesson's
 * hand-written outline in seed.js. `source` tells the UI which one it got.
 */
const cache = new Map()

function fetchLive(videoId) {
  if (!cache.has(videoId)) {
    cache.set(videoId, fetch(`/api/transcript?v=${encodeURIComponent(videoId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d?.segments?.length ? d : null))
      .catch(() => null))
  }
  return cache.get(videoId)
}

const outline = (lesson) => ({ segments: lesson.transcript || [], source: lesson.transcript?.length ? 'outline' : 'none', title: null, duration: null })

export function useLessonTranscript(lesson) {
  const vid = lesson?.youtube_id
  const [state, setState] = useState(() => (vid && baked[vid] ? { ...baked[vid], source: 'transcript' } : outline(lesson || {})))

  useEffect(() => {
    if (!lesson) return
    if (!vid) { setState(outline(lesson)); return }
    if (baked[vid]) { setState({ ...baked[vid], source: 'transcript' }); return }
    let alive = true
    setState({ ...outline(lesson), loading: true })
    fetchLive(vid).then((d) => { if (alive) setState(d ? { ...d, source: 'transcript' } : outline(lesson)) })
    return () => { alive = false }
  }, [lesson, vid])

  return state
}
