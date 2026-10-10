/**
 * YouTube caption extraction (no API key needed).
 * 1. Ask YouTube's internal player endpoint for the video's caption tracks (falls back to scraping the watch page).
 * 2. Download the best English track as json3 and merge it into ~20-second segments: [{ t: seconds, text }].
 * Shared by the /api/transcript serverless function and scripts/fetch-transcripts.mjs.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const CLIENTS = [
  { ua: 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip', client: { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34, osName: 'Android', osVersion: '14' } },
  { ua: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X)', client: { clientName: 'IOS', clientVersion: '20.10.4', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82' } },
  { ua: UA, client: { clientName: 'WEB', clientVersion: '2.20250101.00.00' } },
]

async function playerViaApi(videoId) {
  for (const { ua, client } of CLIENTS) {
    try {
      const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': ua },
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

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

/** Download a caption track as json3, falling back to the XML formats (srv1/srv3). */
async function downloadSegments(baseUrl) {
  const base = new URL(baseUrl)
  base.searchParams.delete('fmt')
  const json3 = new URL(base); json3.searchParams.set('fmt', 'json3')
  for (const url of [json3, base]) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) continue
      const body = (await res.text()).trim()
      if (!body) continue
      if (body.startsWith('{')) { const segs = toSegments(JSON.parse(body).events); if (segs.length) return segs; continue }
      const events = []
      const re = /<(?:text|p)\b([^>]*)>([\s\S]*?)<\/(?:text|p)>/g
      let m
      while ((m = re.exec(body))) {
        const start = m[1].match(/start="([\d.]+)"/)?.[1]
        const tMs = m[1].match(/\bt="(\d+)"/)?.[1]
        events.push({ tStartMs: start != null ? Number(start) * 1000 : Number(tMs || 0), segs: [{ utf8: decode(m[2].replace(/<[^>]+>/g, '')) }] })
      }
      const segs = toSegments(events)
      if (segs.length) return segs
    } catch { /* try next format */ }
  }
  return []
}

/** Bare id or any YouTube link (watch?v=, youtu.be/, /embed/, /shorts/, /live/). */
export function videoIdFrom(input = '') {
  const s = String(input).trim()
  if (/^[\w-]{11}$/.test(s)) return s
  return s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)?.[1] || s
}

export async function fetchTranscript(input) {
  const videoId = videoIdFrom(input)
  if (!/^[\w-]{11}$/.test(videoId)) throw new Error('invalid video id')
  const player = (await playerViaApi(videoId)) || (await playerViaWatchPage(videoId))
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  if (!tracks.length) throw new Error(player?.playabilityStatus?.reason || 'no captions available for this video')
  const track = pickTrack(tracks)
  const segments = await downloadSegments(track.baseUrl)
  if (!segments.length) throw new Error('captions were empty (YouTube may be blocking this server)')
  return {
    videoId,
    title: player?.videoDetails?.title || null,
    duration: Number(player?.videoDetails?.lengthSeconds) || null,
    language: track.languageCode,
    auto: track.kind === 'asr',
    segments,
  }
}
