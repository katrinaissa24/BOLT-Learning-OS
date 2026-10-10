/**
 * BOLT AI layer.
 * - Calls go through the server function /api/ai, which holds ANTHROPIC_API_KEY privately (never in the browser).
 * - If the server has no key (or any error) the feature's `fallback` is used so the demo always works.
 * - Set VITE_AI_ENABLED=false to force demo mode (e.g. plain `npm run dev` without `vercel dev`).
 */
export const aiEnabled = import.meta.env.VITE_AI_ENABLED !== 'false'
export const AI_MODEL = 'claude-sonnet-5-5'

let statusPromise = null
/** Asks the server whether a key is configured. Resolves true/false; never throws. */
export function checkAI() {
  if (!aiEnabled) return Promise.resolve(false)
  statusPromise ??= fetch('/api/ai').then((r) => (r.ok ? r.json() : {})).then((d) => !!d.enabled).catch(() => false)
  return statusPromise
}

const BOLT_PERSONA = `You are BOLT, the AI tutor inside a school learning operating system for a single Grade 12 school.
Be warm, concrete and brief. Prefer questions that make the student think over giving answers away.
Never invent facts about the student. Use plain language a 17-year-old understands.`

/**
 * ask({ system, messages, fallback, maxTokens })
 *   messages: [{ role: 'user'|'assistant', content: string }]
 *   fallback: string | () => string   (used when AI is disabled or fails)
 */
export async function ask({ system = '', messages, fallback, maxTokens = 1024 }) {
  const useFallback = () => (typeof fallback === 'function' ? fallback() : fallback ?? '')
  if (!aiEnabled) return useFallback()
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: `${BOLT_PERSONA}\n\n${system}`.trim(), messages, maxTokens }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    if (data.stop_reason === 'refusal') return useFallback()
    let text = data.text || ''
    // never show a reply that was cut off: keep complete sentences, else use the fallback
    if (data.stop_reason === 'max_tokens') {
      const end = Math.max(text.lastIndexOf('. '), text.lastIndexOf('? '), text.lastIndexOf('! '), /[.?!]$/.test(text) ? text.length - 1 : -1)
      text = end > 40 ? text.slice(0, end + 1) : ''
    }
    return text || useFallback()
  } catch (err) {
    console.warn('[BOLT AI] falling back to demo response:', err?.message || err)
    return useFallback()
  }
}

/** Same as ask() but expects JSON back; returns fallback object when parsing fails. */
export async function askJSON({ system = '', messages, fallback, maxTokens = 2048 }) {
  const useFallback = () => (typeof fallback === 'function' ? fallback() : fallback)
  if (!aiEnabled) return useFallback()
  const text = await ask({
    system: `${system}\n\nRespond with ONLY valid JSON. No prose, no markdown fences.`,
    messages,
    fallback: '',
    maxTokens,
  })
  try {
    const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    const start = cleaned.indexOf('{') >= 0 ? cleaned.indexOf('{') : cleaned.indexOf('[')
    return JSON.parse(cleaned.slice(start))
  } catch {
    return useFallback()
  }
}
