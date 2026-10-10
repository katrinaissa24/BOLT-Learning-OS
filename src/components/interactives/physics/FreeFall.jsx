import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Button } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt, scale, useAnimationFrame } from '../shared'

const WORLDS = { earth: { g: 9.8, label: 'Earth' }, moon: { g: 1.62, label: 'Moon' }, mars: { g: 3.71, label: 'Mars' }, jupiter: { g: 24.8, label: 'Jupiter' } }
const H = 45 // balcony height (m) — 15th floor in Achrafieh
const K = 0.004 // drag coefficient (per metre) → terminal speed ≈ 49 m/s on Earth

/** Drop a tennis ball from a 45 m balcony on four worlds, with or without air. */
export default function FreeFall({ onResult }) {
  const [world, setWorld] = useState('earth')
  const [air, setAir] = useState('vacuum')
  const [state, setState] = useState({ t: 0, y: 0, v: 0, done: false })
  const [running, setRunning] = useState(false)
  const g = WORLDS[world].g
  const trail = useRef([])

  useAnimationFrame((dt) => {
    setState((s) => {
      if (s.done) return s
      const steps = 4, h = dt / steps
      let { t, y, v } = s
      for (let i = 0; i < steps; i++) {
        const acc = g - (air === 'air' ? K * v * v : 0)
        v += acc * h; y += v * h; t += h
      }
      if (y >= H) {
        const over = (y - H) / Math.max(v, 1e-6)
        t -= over; y = H
        setRunning(false)
        return { t, y, v, done: true }
      }
      if (Math.floor(t * 10) !== Math.floor(s.t * 10)) trail.current.push(y)
      return { t, y, v, done: false }
    })
  }, running)

  const reset = () => { setRunning(false); setState({ t: 0, y: 0, v: 0, done: false }); trail.current = [] }
  useEffect(() => { reset() }, [world, air]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onResult?.({ world, air, time: state.done ? state.t : null }) }, [world, air, state.done, state.t, onResult])

  const sy = scale(0, H, 40, 280) // y fall distance → px
  const exactT = Math.sqrt((2 * H) / g)

  return (
    <SimFrame
      title="A ball off a 15th-floor balcony"
      framing="Someone drops a tennis ball from a 45 m balcony in Achrafieh. Change the planet, add or remove air, and time the fall."
      controls={
        <>
          <ControlCard title="Controls">
            <Segmented label="World" value={world} onChange={setWorld} options={Object.entries(WORLDS).map(([k, w]) => ({ value: k, label: `${w.label} · ${w.g}` }))} />
            <Segmented label="Air" value={air} onChange={setAir} options={[{ value: 'vacuum', label: 'Vacuum' }, { value: 'air', label: 'Air (drag)' }]} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (state.done) reset(); setRunning(true) }} disabled={running}><Play size={14} /> Drop</Button>
              <Button size="sm" variant="secondary" onClick={reset}><RotateCcw size={14} /> Reset</Button>
            </div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Timer" value={fmt(state.t, 2)} unit="s" tone={state.done ? 'success' : 'mango'} />
            <Readout label="Speed" value={fmt(state.v, 1)} unit="m/s" tone="info" />
            <Readout label="Fallen" value={fmt(state.y, 1)} unit="m" />
            <Readout label="g" value={g} unit="m/s²" />
          </ReadoutGrid>
        </>
      }
      caption={`In a vacuum the ball’s velocity grows linearly (v = gt) and the distance quadratically (h = ½gt²), so the dots get further apart each tenth of a second. With air, drag grows with v², so the gap between dots stops widening: terminal velocity. Formula check for a vacuum: t = √(2h/g) = ${fmt(exactT, 2)} s on ${WORLDS[world].label}.`}
    >
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* building */}
        <rect x="60" y="20" width="110" height="280" fill={C.ink100} stroke={C.ink200} />
        {Array.from({ length: 7 }, (_, r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={75 + c * 30} y={34 + r * 38} width="18" height="22" rx="2" fill={r === 0 ? C.mangoSoft : '#fff'} stroke={C.ink200} />))}
        <rect x="170" y="36" width="34" height="5" fill={C.ink} />
        <text x="176" y="28" fontSize="10" fontWeight="700" fill={C.ink400}>balcony · 45 m</text>
        <rect x="0" y="300" width="600" height="20" fill={C.ink200} />
        {/* ruler */}
        {[0, 15, 30, 45].map((m) => <g key={m}><line x1="230" y1={sy(m)} x2="240" y2={sy(m)} stroke={C.ink300} /><text x="246" y={sy(m) + 3} fontSize="9" fill={C.ink400}>{45 - m} m</text></g>)}
        <line x1="235" y1={sy(0)} x2="235" y2={sy(H)} stroke={C.ink300} />
        {/* trail */}
        {trail.current.map((yy, i) => <circle key={i} cx="190" cy={sy(Math.min(H, yy))} r="3" fill={C.mango} opacity="0.35" />)}
        {/* ball */}
        <circle cx="190" cy={sy(state.y) - 6} r="8" fill={C.mango} stroke="#fff" strokeWidth="2" />
        {/* velocity arrow */}
        {state.v > 0.5 && <line x1="190" y1={sy(state.y) + 4} x2="190" y2={Math.min(296, sy(state.y) + 4 + state.v * 2)} stroke={C.info} strokeWidth="3" markerEnd="url(#arrowI)" />}
        <defs><marker id="arrowI" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={C.info} /></marker></defs>
        {/* v–t sketch */}
        <g transform="translate(330 60)">
          <rect x="0" y="0" width="240" height="200" rx="14" fill="#fff" stroke={C.ink100} />
          <text x="14" y="22" fontSize="10" fontWeight="700" fill={C.ink400}>SPEED vs TIME</text>
          <line x1="30" y1="170" x2="225" y2="170" stroke={C.ink200} /><line x1="30" y1="40" x2="30" y2="170" stroke={C.ink200} />
          {(() => {
            const tMax = Math.max(3, exactT * 1.1, state.t), vMax = Math.max(30, g * tMax)
            const sx = scale(0, tMax, 30, 225), svy = scale(0, vMax, 170, 40)
            const pts = []
            let v = 0, t = 0
            const h = tMax / 200
            for (let i = 0; i <= 200; i++) { pts.push(`${i ? 'L' : 'M'}${sx(t)} ${svy(v)}`); v += (g - (air === 'air' ? K * v * v : 0)) * h; t += h }
            return <>
              <path d={pts.join(' ')} fill="none" stroke={C.ink300} strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={sx(state.t)} cy={svy(state.v)} r="5" fill={C.info} />
              <text x="225" y="186" fontSize="9" fill={C.ink400} textAnchor="end">{fmt(tMax, 1)} s</text>
              <text x="26" y="44" fontSize="9" fill={C.ink400} textAnchor="end">{fmt(vMax, 0)}</text>
            </>
          })()}
          {state.done && <text x="120" y="192" fontSize="11" fontWeight="800" fill={C.success} textAnchor="middle">landed at {fmt(state.t, 2)} s</text>}
        </g>
      </svg>
    </SimFrame>
  )
}
