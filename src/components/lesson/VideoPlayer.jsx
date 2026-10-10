import { useEffect, useRef, useState } from 'react'
import { Youtube, ListVideo, WifiOff } from 'lucide-react'
import { fmtTime, cx } from '../../lib/utils'

/** Loads the YouTube IFrame API once. Resolves with window.YT or rejects when blocked / slow. */
function loadYT(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT)
    const timer = setTimeout(() => reject(new Error('yt-timeout')), timeoutMs)
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { clearTimeout(timer); prev?.(); resolve(window.YT) }
    if (!document.getElementById('yt-iframe-api')) {
      const s = document.createElement('script')
      s.id = 'yt-iframe-api'; s.src = 'https://www.youtube.com/iframe_api'; s.async = true
      s.onerror = () => { clearTimeout(timer); reject(new Error('yt-blocked')) }
      document.head.appendChild(s)
    }
  })
}

/**
 * YouTube player + clickable transcript timeline.
 * Reports the current playback time via onTime(seconds). Falls back to a plain iframe plus a
 * "where are you in the video" slider when the IFrame API is unavailable — never throws.
 */
export default function VideoPlayer({ lesson, currentTime, onTime, active = true, transcriptStatus }) {
  const [mode, setMode] = useState('loading') // loading | api | fallback
  const hostRef = useRef(null)
  const playerRef = useRef(null)
  const duration = (lesson.duration_min || 10) * 60
  const transcript = lesson.transcript || []
  const activeIdx = transcript.reduce((acc, seg, i) => (seg.t <= currentTime ? i : acc), 0)

  useEffect(() => {
    let cancelled = false
    let readyTimer
    loadYT().then((YT) => {
      if (cancelled || !hostRef.current) return
      readyTimer = setTimeout(() => { if (!cancelled) setMode((m) => (m === 'loading' ? 'fallback' : m)) }, 8000)
      try {
        playerRef.current = new YT.Player(hostRef.current, {
          videoId: lesson.youtube_id,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => { if (!cancelled) { clearTimeout(readyTimer); setMode('api') } },
            onError: () => { if (!cancelled) { clearTimeout(readyTimer); setMode('fallback') } },
          },
        })
      } catch { setMode('fallback') }
    }).catch(() => { if (!cancelled) setMode('fallback') })
    return () => {
      cancelled = true
      clearTimeout(readyTimer)
      try { playerRef.current?.destroy?.() } catch { /* ignore */ }
      playerRef.current = null
    }
  }, [lesson.id, lesson.youtube_id])

  // poll playback time once a second in API mode
  useEffect(() => {
    if (mode !== 'api') return
    const id = setInterval(() => {
      try {
        const t = playerRef.current?.getCurrentTime?.()
        if (typeof t === 'number' && !Number.isNaN(t)) onTime(t)
      } catch { /* ignore */ }
    }, 1000)
    return () => clearInterval(id)
  }, [mode, onTime])

  // pause when the student flips to another slide
  useEffect(() => {
    if (active || mode !== 'api') return
    try { playerRef.current?.pauseVideo?.() } catch { /* ignore */ }
  }, [active, mode])

  const seek = (t) => {
    onTime(t)
    if (mode === 'api') { try { playerRef.current?.seekTo?.(t, true); playerRef.current?.playVideo?.() } catch { /* ignore */ } }
  }

  return (
    <div className="card overflow-hidden flex flex-col h-full min-h-0">
      <div className="relative aspect-video max-h-[64%] shrink-0 bg-charcoal-900">
        {mode !== 'fallback' && <div ref={hostRef} className="absolute inset-0 w-full h-full" />}
        {mode === 'fallback' && (
          <iframe title={lesson.title} className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_id}?rel=0&modestbranding=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        )}
        {mode === 'loading' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 text-sm pointer-events-none"><Youtube size={28} className="text-mango" /> Loading video…</div>}
      </div>

      {mode === 'fallback' && (
        <div className="px-5 pt-4 pb-2 border-b border-charcoal-100 bg-mango-50/60">
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold"><WifiOff size={13} className="text-mango" /> Player API unavailable — tell the tutor where you are in the video</span>
            <span className="font-bold text-mango tabular-nums">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          </div>
          <input type="range" min={0} max={duration} step={5} value={Math.min(duration, currentTime)} onChange={(e) => onTime(Number(e.target.value))} className="w-full" aria-label="Where are you in the video" />
        </div>
      )}

      <div className="p-5 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-charcoal"><ListVideo size={16} className="text-mango" /> Transcript timeline</div>
          <span className="text-xs text-charcoal-400">{transcriptStatus === 'ready' ? 'YouTube captions · ' : ''}click a line to jump · now at <span className="font-bold text-charcoal tabular-nums">{fmtTime(currentTime)}</span></span>
        </div>
        <ol className="relative border-l-2 border-charcoal-100 ml-2 space-y-1 flex-1 min-h-0 overflow-y-auto pr-1">
          {transcriptStatus === 'loading' && <li className="pl-4 py-2 text-sm text-charcoal-400">Fetching the video's captions…</li>}
          {transcript.map((seg, i) => {
            const active = i === activeIdx
            return (
              <li key={seg.t} className="relative">
                <button type="button" onClick={() => seek(seg.t)} className={cx('w-full text-left flex items-start gap-3 rounded-xl pl-4 pr-3 py-2 -ml-[2px] border-l-2 transition-all', active ? 'border-mango bg-mango-50' : 'border-transparent hover:bg-cloud')}>
                  <span className={cx('text-[11px] font-bold tabular-nums w-10 shrink-0 mt-0.5', active ? 'text-mango' : 'text-charcoal-300')}>{fmtTime(seg.t)}</span>
                  <span className={cx('text-sm leading-snug', active ? 'text-charcoal font-semibold' : 'text-charcoal-500')}>{seg.text}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
