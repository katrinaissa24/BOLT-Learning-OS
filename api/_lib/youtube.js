/**
 * YouTube caption extraction (no API key needed).
 * 1. Ask YouTube's internal player endpoint for the video's caption tracks (falls back to scraping the watch page).
 * 2. Download the best English track as json3 and merge it into ~20-second segments: [{ t: seconds, text }].
 * Shared by the /api/transcript serverless function and scripts/fetch-transcripts.mjs.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const CLIENTS = [
  { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34 },
  { clientName: 'WEB', clientVersion: '2.20250101.00.00' },
]

async function playerViaApi(videoId) {
  for (const client of CLIENTS) {
    try {
      const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({ videoId, context: { client: { hl: 'en', gl: 'US', ...client } } }),
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length) return data
    } catch { /* try next client */ }
  }
  return null
}

async function playerViaWatchPage(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })
  if (!res.ok) return null
  const html = await res.text()
  const m = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;\s*(?:var\s|<\/script)/s)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

function pickTrack(tracks) {
  const en = tracks.filter((t) => t.languageCode?.startsWith('en'))
  return en.find((t) => t.kind !== 'asr') || en[0] || tracks[0]
}

/** Merge caption events into segments of roughly `chunk` seconds so the timeline stays readable. */
export function toSegments(events, chunk = 20) {
  const out = []
  let cur = null
  for (const ev of events || []) {
    const text = (ev.segs || []).map((s) => s.utf8).join('').replace(/\s+/g, ' ').trim()
    if (!text) continue
    const t = Math.floor((ev.tStartMs || 0) / 1000)
    if (!cur || t - cur.t >= chunk) { cur = { t, text }; out.push(cur) } else cur.text += ` ${text}`
  }
  return out
}

export async function fetchTranscript(videoId) {
  if (!/^[\w-]{11}$/.test(videoId)) throw new Error('invalid video id')
  const player = (await playerViaApi(videoId)) || (await playerViaWatchPage(videoId))
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  if (!tracks.length) throw new Error(player?.playabilityStatus?.reason || 'no captions available for this video')
  const track = pickTrack(tracks)
  const url = new URL(track.baseUrl)
  url.searchParams.set('fmt', 'json3')
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`caption download failed (${res.status})`)
  const json = await res.json()
  const segments = toSegments(json.events)
  if (!segments.length) throw new Error('captions were empty')
  return {
    videoId,
    title: player?.videoDetails?.title || null,
    duration: Number(player?.videoDetails?.lengthSeconds) || null,
    language: track.languageCode,
    auto: track.kind === 'asr',
    segments,
  }
}
