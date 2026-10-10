// Serverless route (Vercel / Netlify-compatible signature): GET /api/transcript?v=<youtube url or id>
import { getTranscript } from '../server/youtubeTranscript.js'

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x')
  try {
    const data = await getTranscript(url.searchParams.get('v'))
    res.setHeader('Cache-Control', 's-maxage=604800')
    res.status(200).json(data)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}
