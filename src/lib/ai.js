import Anthropic from '@anthropic-ai/sdk'

/**
 * BOLT AI layer.
 * - With VITE_ANTHROPIC_API_KEY set, every feature calls Claude (claude-opus-5-5).
 * - Without it (or on any error) the feature's `fallback` is used so the demo always works.
 */
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
export const aiEnabled = !!apiKey
export const AI_MODEL = 'claude-opus-5-5'

const client = apiKey ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) : null

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
  if (!client) return useFallback()
  try {
    const res = await client.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system: `${BOLT_PERSONA}\n\n${system}`.trim(),
      messages,
    })
    if (res.stop_reason === 'refusal') return useFallback()
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
    return text || useFallback()
  } catch (err) {
    console.warn('[BOLT AI] falling back to demo response:', err?.message || err)
    return useFallback()
  }
}

/** Same as ask() but expects JSON back; returns fallback object when parsing fails. */
export async function askJSON({ system = '', messages, fallback, maxTokens = 2048 }) {
  const useFallback = () => (typeof fallback === 'function' ? fallback() : fallback)
  if (!client) return useFallback()
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
