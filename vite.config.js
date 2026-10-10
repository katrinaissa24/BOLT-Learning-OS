import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'node:fs'
import { fetchTranscript } from './api/_lib/youtube.js'

const BAKED = new URL('./src/data/transcripts.json', import.meta.url)

/**
 * /api/transcript during `npm run dev` / `npm run preview` (Vercel serves api/transcript.js in production).
 * Runs from your own internet connection, which YouTube doesn't block, and saves every transcript it gets
 * into src/data/transcripts.json — commit that file and production has the transcripts for free.
 */
function transcriptApi() {
  const handler = async (req, res, next) => {
    if (!req.url?.startsWith('/api/transcript')) return next()
    res.setHeader('Content-Type', 'application/json')
    try {
      const t = await fetchTranscript(new URL(req.url, 'http://x').searchParams.get('v') || '')
      try {
        const baked = JSON.parse(readFileSync(BAKED, 'utf8') || '{}')
        if (!baked[t.videoId]) {
          baked[t.videoId] = { title: t.title, duration: t.duration, auto: t.auto, segments: t.segments }
          writeFileSync(BAKED, JSON.stringify(baked, null, 1) + '\n')
          console.log(`[transcripts] saved ${t.videoId} “${t.title}” → src/data/transcripts.json`)
        }
      } catch (err) { console.warn('[transcripts] could not save:', err.message) }
      res.end(JSON.stringify(t))
    } catch (err) {
      console.warn('[transcripts]', err.message)
      res.statusCode = 502
      res.end(JSON.stringify({ error: err.message }))
    }
  }
  return {
    name: 'bolt-transcript-api',
    configureServer: (server) => { server.middlewares.use(handler) },
    configurePreviewServer: (server) => { server.middlewares.use(handler) },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), transcriptApi()],
  server: { port: 5173, host: true, watch: { ignored: ['**/src/data/transcripts.json'] } },
})
