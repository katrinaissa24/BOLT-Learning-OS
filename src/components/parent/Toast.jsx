import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'

/** Tiny local toast: const [toast, show] = useToast(); {toast} */
export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2800)
    return () => clearTimeout(t)
  }, [msg])
  const show = useCallback((m) => setMsg({ id: Math.random(), text: m }), [])
  const node = msg ? (
    <div key={msg.id} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] fade-up">
      <div className="flex items-center gap-2 rounded-2xl bg-charcoal text-white px-4 py-3 text-sm font-semibold shadow-2xl">
        <CheckCircle2 size={16} className="text-mango" /> {msg.text}
      </div>
    </div>
  ) : null
  return [node, show]
}
