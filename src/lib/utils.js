export const cx = (...a) => a.filter(Boolean).join(' ')

export const fmtTime = (secs) => {
  const s = Math.max(0, Math.round(secs || 0))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' })
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })

export const statusTone = (s) =>
  ({ ahead: 'success', 'on-track': 'info', behind: 'warning', 'at-risk': 'danger', struggling: 'danger', good: 'success', attention: 'warning' }[s] || 'neutral')
