import { useCallback, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cx } from '../../lib/utils'

/**
 * Lightweight page-level toasts for teacher actions.
 *   const { toast, Toasts } = useToast()
 *   toast('Kudos sent to Maya', 'success')  → render <Toasts /> once at the page root.
 */
export function useToast() {
  const [items, setItems] = useState([])
  const n = useRef(0)
  const toast = useCallback((text, tone = 'success') => {
    const id = ++n.current
    setItems((l) => [...l, { id, text, tone }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])
  const Toasts = useCallback(() => (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 pointer-events-none">
      {items.map((t) => {
        const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'warning' ? AlertTriangle : Info
        return (
          <div key={t.id} className={cx('fade-up pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft border', t.tone === 'success' ? 'bg-charcoal text-white border-charcoal' : t.tone === 'warning' ? 'bg-mango-50 text-mango-700 border-mango-200' : 'bg-white text-charcoal border-charcoal-100')}>
            <Icon size={16} className={t.tone === 'success' ? 'text-mango' : ''} /> {t.text}
          </div>
        )
      })}
    </div>
  ), [items])
  return { toast, Toasts }
}
