import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'
import { cx } from '../../lib/utils'

export const MAP_W = 1800
export const MAP_H = 520
const NODE_X = [130, 385, 640, 895, 1150, 1405, 1660]
const NODE_Y = [330, 205, 300, 180, 320, 215, 285]
export const nodePos = (i) => ({ x: NODE_X[i] ?? 130 + i * 255, y: NODE_Y[i] ?? 280 })

function segment(a, b) {
  const dx = (b.x - a.x) / 2
  return `C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
}
function pathThrough(points) {
  if (!points.length) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) d += ' ' + segment(points[i - 1], points[i])
  return d
}

function wrapTitle(title, max = 20) {
  const words = title.split(' ')
  const lines = ['']
  words.forEach((w) => {
    const cur = lines[lines.length - 1]
    if ((cur + ' ' + w).trim().length > max && cur) lines.push(w)
    else lines[lines.length - 1] = (cur + ' ' + w).trim()
  })
  if (lines.length > 2) { lines.length = 2; lines[1] = lines[1].replace(/\.*$/, '') + '…' }
  return lines
}

/* ───── Landscape decorations (brand tones only) ───── */
function Landscape({ color }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F4F5F7" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6E8EC" />
          <stop offset="1" stopColor="#F4F5F7" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE5BF" />
          <stop offset="1" stopColor="#FFF4E5" />
        </linearGradient>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#sky)" />
      {/* sun */}
      <circle cx="1560" cy="92" r="46" fill="#FFF4E5" />
      <circle cx="1560" cy="92" r="30" fill="#FFE5BF" />
      {/* clouds */}
      {[[220, 80, 1], [700, 60, 0.8], [1120, 95, 1.1], [1380, 55, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" stroke="#E6E8EC" strokeWidth="2">
          <ellipse cx="0" cy="0" rx="46" ry="18" />
          <circle cx="-14" cy="-10" r="18" />
          <circle cx="14" cy="-14" r="22" />
        </g>
      ))}
      {/* far hills */}
      <path d="M0 400 C 200 300, 380 300, 560 390 S 900 330, 1100 400 S 1500 300, 1800 390 L1800 520 L0 520 Z" fill="url(#hillFar)" />
      {/* near hills in mango tint */}
      <path d="M0 460 C 240 380, 420 400, 640 455 S 1000 400, 1250 460 S 1600 410, 1800 450 L1800 520 L0 520 Z" fill="url(#hillNear)" />
      {/* ground line */}
      <path d="M0 500 L1800 500" stroke="#FFCC80" strokeWidth="2" strokeDasharray="2 10" />
      {/* trees */}
      {[[60, 420, 0.9], [300, 445, 0.75], [520, 430, 1], [760, 452, 0.7], [1010, 438, 0.95], [1230, 455, 0.8], [1500, 440, 1], [1740, 452, 0.7]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-3" y="0" width="6" height="22" rx="2" fill="#C9CBD0" />
          <path d="M0 -40 L22 4 L-22 4 Z" fill={i % 3 === 0 ? '#FFB340' : '#9EA1A8'} opacity={i % 3 === 0 ? 0.9 : 0.55} />
          <path d="M0 -22 L18 12 L-18 12 Z" fill={i % 3 === 0 ? '#FF9900' : '#6C717B'} opacity={i % 3 === 0 ? 0.85 : 0.5} />
        </g>
      ))}
      {/* course flag at the end */}
      <g transform="translate(1745 160)">
        <rect x="-2" y="0" width="4" height="90" rx="2" fill="#353B48" />
        <path d="M2 2 L54 16 L2 32 Z" fill={color} />
      </g>
    </g>
  )
}

/**
 * JourneyMap — horizontal, scrollable landscape with 7 checkpoints and extra-practice branches.
 * nodes: [{ lesson, progress, state: 'completed'|'current'|'locked', score, weakTopics }]
 */
export default function JourneyMap({ nodes, course, selectedId, onSelect, onBranch }) {
  const scroller = useRef(null)
  const [hint, setHint] = useState(true)
  const currentIndex = nodes.findIndex((n) => n.state === 'current')
  const completedCount = nodes.filter((n) => n.state === 'completed').length
  const points = nodes.map((_, i) => nodePos(i))

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const idx = currentIndex >= 0 ? currentIndex : nodes.length - 1
    const x = nodePos(idx).x - el.clientWidth / 2
    el.scrollTo({ left: Math.max(0, x), behavior: 'smooth' })
    const onScroll = () => setHint(false)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [currentIndex, nodes.length])

  const donePath = pathThrough(points.slice(0, Math.min(points.length, completedCount + 1)))

  return (
    <div className="relative">
      <div ref={scroller} className="overflow-x-auto overflow-y-hidden rounded-3xl border border-charcoal-100 shadow-card bg-white">
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block select-none" style={{ minWidth: MAP_W }}>
          <Landscape color={course.color} />

          {/* main path */}
          <path d={pathThrough(points)} fill="none" stroke="#C9CBD0" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 16" />
          {completedCount > 0 && (
            <motion.path d={donePath} fill="none" stroke="#FF9900" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
          )}

          {/* branches */}
          {nodes.map((n, i) => {
            if (!n.branch) return null
            const p = points[i]
            const bx = Math.min(MAP_W - 80, p.x + 120)
            const by = Math.min(MAP_H - 60, p.y + 125)
            const d = `M ${p.x + 26} ${p.y + 14} C ${p.x + 90} ${p.y + 40}, ${bx - 10} ${by - 70}, ${bx} ${by}`
            return (
              <g key={`br-${n.lesson.id}`} className="cursor-pointer" onClick={() => onBranch?.(n)}>
                <path d={d} fill="none" stroke="#FF9900" strokeWidth="3.5" strokeDasharray="7 7" strokeLinecap="round" />
                <circle cx={bx} cy={by} r="26" fill="#FF9900" opacity="0.12" />
                <circle cx={bx} cy={by} r="16" fill="#FFF4E5" stroke="#FF9900" strokeWidth="3" />
                <path d={`M ${bx - 4} ${by - 6} v 12 M ${bx - 4} ${by - 1} c 0 -6 8 -3 8 -8`} fill="none" stroke="#C27400" strokeWidth="2.2" strokeLinecap="round" />
                <text x={bx} y={by + 34} fontSize="11" textAnchor="middle" fill="#C27400" fontWeight="700">Extra practice</text>
                {n.weakTopics?.[0] && <text x={bx} y={by + 48} fontSize="10" textAnchor="middle" fill="#6C717B">{n.weakTopics[0].name} · {n.weakTopics[0].score}%</text>}
              </g>
            )
          })}

          {/* nodes */}
          {nodes.map((n, i) => {
            const p = points[i]
            const selected = selectedId === n.lesson.id
            const lines = wrapTitle(n.lesson.title)
            const labelAbove = i % 2 === 1
            const titleY = labelAbove ? p.y - 52 : p.y + 52
            return (
              <g key={n.lesson.id} className="cursor-pointer" onClick={() => onSelect?.(n)}>
                {n.state === 'current' && (
                  <>
                    <motion.circle cx={p.x} cy={p.y} r="30" fill="none" stroke="#FF9900" strokeWidth="3" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: [1, 1.7, 1.7], opacity: [0.8, 0, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                    <g transform={`translate(${p.x} ${p.y - (i % 2 === 1 ? 124 : 86)})`}>
                      <rect x="-52" y="-16" width="104" height="30" rx="15" fill="#353B48" />
                      <path d="M-6 14 L0 22 L6 14 Z" fill="#353B48" />
                      <text x="0" y="5" textAnchor="middle" fontSize="13" fill="#FFFFFF" fontWeight="700" fontFamily="Caveat, cursive" style={{ fontSize: 16 }}>You are here</text>
                    </g>
                  </>
                )}
                {selected && <circle cx={p.x} cy={p.y} r="38" fill="none" stroke={course.color} strokeWidth="2" strokeDasharray="4 6" />}
                <circle cx={p.x} cy={p.y} r="30" fill="#000" opacity="0.08" transform="translate(0 4)" />
                <circle cx={p.x} cy={p.y} r="30" fill={n.state === 'completed' ? '#FF9900' : n.state === 'current' ? '#FFFFFF' : '#E6E8EC'} stroke={n.state === 'current' ? '#FF9900' : n.state === 'completed' ? '#FFFFFF' : '#C9CBD0'} strokeWidth={n.state === 'current' ? 5 : 3} />
                {n.state === 'completed' ? (
                  <path d={`M ${p.x - 11} ${p.y} l 8 8 l 15 -16`} fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : n.state === 'current' ? (
                  <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#FF9900">{n.lesson.position}</text>
                ) : (
                  <>
                    <rect x={p.x - 8} y={p.y - 3} width="16" height="13" rx="3" fill="#9EA1A8" />
                    <path d={`M ${p.x - 5} ${p.y - 3} v -4 a 5 5 0 0 1 10 0 v 4`} fill="none" stroke="#9EA1A8" strokeWidth="2.5" />
                  </>
                )}
                {/* label */}
                <text x={p.x} y={titleY + (labelAbove ? -14 : 0)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#9EA1A8" letterSpacing="1">CHECKPOINT {n.lesson.position}</text>
                {lines.map((ln, k) => (
                  <text key={k} x={p.x} y={titleY + (labelAbove ? 2 : 16) + k * 15} textAnchor="middle" fontSize="13" fontWeight="700" fill={n.state === 'locked' ? '#9EA1A8' : '#353B48'}>{ln}</text>
                ))}
                {n.state === 'completed' && n.score != null && (
                  <g transform={`translate(${p.x} ${titleY + (labelAbove ? 2 : 16) + lines.length * 15 + 8})`}>
                    <rect x="-24" y="-2" width="48" height="18" rx="9" fill={n.score >= 80 ? '#E3F5EB' : n.score >= 60 ? '#FFF4E5' : '#FCE8E6'} />
                    <text x="0" y="11" textAnchor="middle" fontSize="11" fontWeight="800" fill={n.score >= 80 ? '#2FA36B' : n.score >= 60 ? '#C27400' : '#E0493B'}>{n.score}%</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <div className={cx('pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-charcoal/85 text-white text-xs font-semibold px-3 py-1.5 transition-opacity duration-500', hint ? 'opacity-100' : 'opacity-0')}>
        Scroll to explore the landscape <ChevronsRight size={14} className="animate-pulse" />
      </div>
    </div>
  )
}
