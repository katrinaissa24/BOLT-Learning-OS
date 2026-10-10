import { useEffect, useState } from 'react'

const cacheKey = (id) => `bolt.transcript.${id}`
const readCache = (id) => { try { return JSON.parse(localStorage.getItem(cacheKey(id))) } catch { return null } }
const writeCache = (id, v) => { try { localStorage.setItem(cacheKey(id), JSON.stringify(v)) } catch { /* ignore */ } }

/** Accepts a bare id or any YouTube link (watch?v=, youtu.be/, /embed/, /shorts/). */
export function youtubeId(input = '') {
  const s = String(input || '').trim()
  if (/^[\w-]{11}$/.test(s)) return s
  return s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/)?.[1] || s
}

/**
 * Returns the lesson with its real YouTube captions as `transcript` ([{ t, text }]).
 * Fetched once via /api/transcript, cached in the browser and saved to the lesson row
 * (`transcript_source: 'youtube'`) so it isn't refetched. Falls back to the stored transcript.
 */
export function useYouTubeTranscript(lesson, update) {
  const vid = youtubeId(lesson?.youtube_id)
  const saved = lesson?.transcript_source === 'youtube' && lesson.transcript?.length ? lesson.transcript : null
  const [fetched, setFetched] = useState(() => (vid ? readCache(vid) : null))
  const [status, setStatus] = useState(saved || fetched ? 'ready' : 'idle')

  useEffect(() => {
    if (!vid || !lesson) return
    if (saved) { setStatus('ready'); return }
    const cached = readCache(vid)
    if (cached?.length) { setFetched(cached); setStatus('ready'); return }
    let cancelled = false
    setStatus('loading')
    fetch(`/api/transcript?v=${encodeURIComponent(vid)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(({ transcript }) => {
        if (cancelled || !transcript?.length) throw new Error('empty')
        writeCache(vid, transcript)
        setFetched(transcript); setStatus('ready')
        update?.('lessons', lesson.id, { transcript, transcript_source: 'youtube' })
      })
      .catch((err) => { if (!cancelled) { console.warn('[BOLT] transcript fetch failed:', err?.message); setStatus('error') } })
    return () => { cancelled = true }
  }, [vid, lesson?.id, !!saved]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!lesson) return { lesson, status }
  const transcript = saved || fetched || lesson.transcript || []
  return { lesson: { ...lesson, youtube_id: vid, transcript }, status }
}
