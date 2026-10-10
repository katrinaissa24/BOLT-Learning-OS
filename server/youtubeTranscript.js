/**
 * Server-side YouTube caption fetcher (no API key, no dependencies).
 * Works for any video with manual or auto-generated captions.
 * Must run on a server: YouTube blocks these requests from the browser (CORS).
 *
 * getTranscript(urlOrId) → [{ t: seconds, text }] grouped into ~20s readable segments.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

export function extractVideoId(input = '') {
  const s = String(input).trim()
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/)
  return m ? m[1] : null
}

async function tracksFromInnertube(videoId) {
  const res = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)' },
    body: JSON.stringify({ context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34, hl: 'en' } }, videoId }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
}

async function tracksFromWatchPage(videoId) {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } })
  if (!res.ok) return []
  const html = await res.text()
  const m = html.match(/"captionTracks":(\[.*?\])\s*,\s*"/)
  if (!m) return []
  try { return JSON.parse(m[1]) } catch { return [] }
}

function pickTrack(tracks) {
  const en = tracks.filter((t) => t.languageCode?.startsWith('en'))
  return en.find((t) => t.kind !== 'asr') || en[0] || tracks.find((t) => t.kind !== 'asr') || tracks[0]
}

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

/** Parse json3 or XML (srv1/srv3) caption payloads into [{ start, text }]. */
function parseCaptions(body) {
  const lines = []
  if (body.trim().startsWith('{')) {
    for (const ev of JSON.parse(body).events || []) {
      const text = (ev.segs || []).map((s) => s.utf8).join('').replace(/\s+/g, ' ').trim()
      if (text) lines.push({ start: (ev.tStartMs || 0) / 1000, text })
    }
    return lines
  }
  const re = /<(?:text|p)\b([^>]*)>([\s\S]*?)<\/(?:text|p)>/g
  let m
  while ((m = re.exec(body))) {
    const start = m[1].match(/start="([\d.]+)"/)?.[1]
    const tMs = m[1].match(/\bt="(\d+)"/)?.[1]
    const text = decode(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
    if (text) lines.push({ start: start != null ? Number(start) : Number(tMs || 0) / 1000, text })
  }
  return lines
}

/** Merge tiny caption fragments into readable segments of roughly `windowSec` seconds. */
function group(lines, windowSec = 20) {
  const out = []
  for (const l of lines) {
    const last = out[out.length - 1]
    if (last && l.start - last.t < windowSec) last.text += ' ' + l.text
    else out.push({ t: Math.floor(l.start), text: l.text })
  }
  return out.map((s) => ({ t: s.t, text: s.text.replace(/\[(music|applause)\]/gi, '').replace(/\s+/g, ' ').trim() })).filter((s) => s.text)
}

export async function getTranscript(input) {
  const videoId = extractVideoId(input)
  if (!videoId) throw new Error('Not a valid YouTube link or id')
  let tracks = []
  try { tracks = await tracksFromInnertube(videoId) } catch { /* try the watch page */ }
  if (!tracks.length) tracks = await tracksFromWatchPage(videoId)
  const track = pickTrack(tracks)
  if (!track?.baseUrl) throw new Error('This video has no captions')
  const base = track.baseUrl.replace(/&fmt=[^&]*/, '')
  for (const url of [`${base}&fmt=json3`, base]) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!res.ok) continue
    const body = await res.text()
    if (!body.trim()) continue
    const segments = group(parseCaptions(body))
    if (segments.length) return { videoId, language: track.languageCode, auto: track.kind === 'asr', transcript: segments }
  }
  throw new Error('Could not download captions')
}
