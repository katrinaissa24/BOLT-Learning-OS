import Anthropic from '@anthropic-ai/sdk'

/**
 * Server-side proxy for BOLT's AI calls (Vercel serverless function).
 * The Anthropic key lives only in the server env var ANTHROPIC_API_KEY and never reaches the browser.
 */
const MODEL = 'claude-sonnet-5-5'
const MAX_TOKENS_CAP = 4096
// Small budgets get cut off mid-sentence (the model may spend tokens before writing). Length is controlled by the prompt.
const MAX_TOKENS_FLOOR = 2048

export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (req.method === 'GET') return res.status(200).json({ enabled: !!apiKey, model: MODEL }) // health check for the top-bar badge
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!apiKey) return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set on the server' })

  const { system = '', messages, maxTokens = 1024 } = req.body || {}
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'messages required' })

  try {
    const client = new Anthropic({ apiKey })
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: Math.min(Math.max(Number(maxTokens) || 1024, MAX_TOKENS_FLOOR), MAX_TOKENS_CAP),
      system,
      messages,
    })
    const text = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
    return res.status(200).json({ text, stop_reason: r.stop_reason })
  } catch (err) {
    return res.status(502).json({ error: err?.message || 'AI request failed' })
  }
}
