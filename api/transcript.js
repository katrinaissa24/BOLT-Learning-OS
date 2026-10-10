import { fetchTranscript } from './_lib/youtube.js'

/** GET /api/transcript?v=<youtubeId> → { title, duration, segments: [{ t, text }] }. Cached at the edge for a day. */
export default async function handler(req, res) {
  const v = String(req.query?.v || '')
  try {
    const data = await fetchTranscript(v)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json(data)
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=600')
    return res.status(502).json({ error: err?.message || 'transcript unavailable' })
  }
}
