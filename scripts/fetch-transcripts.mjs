// Bakes real YouTube transcripts into src/data/transcripts.json so the tutor has them even if
// YouTube blocks the live /api/transcript call. Run from any machine with normal internet:
//   npm run fetch:transcripts            (all lessons)
//   npm run fetch:transcripts -- math-12-l1 phy-12-l0
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { lessons } from '../src/data/seed.js'
import { fetchTranscript } from '../api/_lib/youtube.js'

const OUT = new URL('../src/data/transcripts.json', import.meta.url)
const baked = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const only = process.argv.slice(2)
const targets = lessons.filter((l) => l.youtube_id && (!only.length || only.includes(l.id)))

for (const l of targets) {
  try {
    const t = await fetchTranscript(l.youtube_id)
    baked[l.youtube_id] = { title: t.title, duration: t.duration, auto: t.auto, segments: t.segments }
    console.log(`✓ ${l.id}  ${t.segments.length} segments  “${t.title}”`)
  } catch (err) {
    console.warn(`✗ ${l.id} (${l.youtube_id}): ${err.message}`)
  }
}
writeFileSync(OUT, JSON.stringify(baked, null, 1) + '\n')
console.log(`Saved ${Object.keys(baked).length} transcripts → src/data/transcripts.json`)
