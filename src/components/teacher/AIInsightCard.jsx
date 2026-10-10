import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, Button, AITag } from '../ui'
import { ask, aiEnabled } from '../../lib/ai'

/** A card that asks Claude for an insight on demand. `build()` → { system, prompt, fallback }. */
export default function AIInsightCard({ title, eyebrow = 'ask BOLT', placeholder, build, resetKey, className = '' }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { setText('') }, [resetKey])

  async function run() {
    setBusy(true)
    const { system, prompt, fallback } = build()
    const [out] = await Promise.all([
      ask({ system, messages: [{ role: 'user', content: prompt }], fallback, maxTokens: 700 }),
      new Promise((r) => setTimeout(r, aiEnabled ? 0 : 700)),
    ])
    setText(out)
    setBusy(false)
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="mb-3">
        <div className="text-[11px] uppercase tracking-wide font-bold text-charcoal-400">{eyebrow}</div>
        <h3 className="text-lg font-extrabold text-charcoal flex items-center gap-2">{title} <AITag /></h3>
      </div>
      {text
        ? <div className="rounded-2xl bg-charcoal text-white p-4 text-sm leading-relaxed whitespace-pre-line fade-up flex-1">{text}</div>
        : <div className="rounded-2xl bg-cloud p-4 text-sm text-charcoal-400 flex-1">{placeholder}</div>}
      <Button className="mt-4 w-full" onClick={run} loading={busy}><Sparkles size={16} /> {text ? 'Generate again' : 'Generate insight'}</Button>
    </Card>
  )
}
