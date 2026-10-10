import { askJSON } from './ai'
import { PRACTICE_BANK, genericQuestions } from '../data/practiceBank'
import { uid } from './utils'

/**
 * generatePractice({ lesson, course, topics, studentName, count })
 *  topics: [{ id, name, score }] — weak topics first. Returns practice items:
 *  { id, topicId, topic, prompt, type: 'numeric'|'choice'|'short', options?, answer, tolerance?, explanation, difficulty, context }
 * Uses Claude when a key is set; otherwise the curated bank → generic templates.
 */
export async function generatePractice({ lesson, course, topics = [], studentName = 'the student', count = 4 }) {
  const picked = (topics.length ? topics : (lesson?.topics || []).map((t) => ({ ...t, score: null }))).slice(0, 3)
  const fallback = () => {
    const out = []
    let i = 0
    while (out.length < count && i < 20) {
      const t = picked[i % picked.length]
      const bank = PRACTICE_BANK[t.id] || genericQuestions(t.name, lesson?.title || course?.title || 'this lesson')
      const item = bank[Math.floor(i / picked.length) % bank.length]
      if (item && !out.some((o) => o.prompt === item.prompt)) out.push({ id: uid(), topicId: t.id, topic: t.name, ...item })
      i++
    }
    return out
  }
  const system = `You generate tailored extra practice for a Grade 12 student in the course "${course?.title || ''}", lesson "${lesson?.title || ''}".
Use real-life scenarios (Beirut, sports, phones, money, driving, cooking). Vary difficulty 1–3. Types: numeric (give numeric answer + tolerance), choice (4 options), short (open).`
  const user = `Student: ${studentName}. Weak topics (lowest first): ${picked.map((t) => `${t.name}${t.score != null ? ` (${t.score}%)` : ''}`).join(', ')}.
Return JSON: {"items":[{"topicId":"...","topic":"...","prompt":"...","type":"numeric|choice|short","options":["..."],"answer":"...","tolerance":0.1,"explanation":"...","difficulty":1,"context":"short scenario label"}]} with ${count} items. topicId must be one of: ${picked.map((t) => t.id).join(', ')}.`
  const res = await askJSON({ system, messages: [{ role: 'user', content: user }], fallback: null })
  if (res?.items?.length) return res.items.map((it) => ({ id: uid(), ...it }))
  return fallback()
}

/** Check an answer locally. */
export function checkAnswer(item, value) {
  if (item.type === 'numeric') {
    const v = parseFloat(String(value).replace(',', '.'))
    if (Number.isNaN(v)) return false
    return Math.abs(v - Number(item.answer)) <= (item.tolerance ?? 0.01)
  }
  if (item.type === 'choice') return String(value).trim() === String(item.answer).trim()
  return String(value || '').trim().split(/\s+/).length >= 8 // short answers: effort check, AI/teacher grades later
}
