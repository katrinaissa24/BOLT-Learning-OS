import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getTranscript } from './server/youtubeTranscript.js'

/** Serves GET /api/transcript?v=<youtube url or id> during `npm run dev` and `npm run preview`. */
function transcriptApi() {
  const handler = async (req, res, next) => {
    if (!req.url?.startsWith('/api/transcript')) return next()
    res.setHeader('Content-Type', 'application/json')
    try {
      const data = await getTranscript(new URL(req.url, 'http://x').searchParams.get('v'))
      res.end(JSON.stringify(data))
    } catch (err) {
      res.statusCode = 404
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
  server: { port: 5173, host: true },
})
