import { useEffect, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Slider, Button } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt, useAnimationFrame } from '../shared'

/** Two carts on an air track: set masses and velocities, pick elastic or sticky, and play. */
export default function CollisionLab({ onResult }) {
  const [m1, setM1] = useState(4)
  const [m2, setM2] = useState(2)
  const [v1, setV1] = useState(3)
  const [v2, setV2] = useState(0)
  const [kind, setKind] = useState('inelastic')
  const [sim, setSim] = useState({ x1: 1.5, x2: 6.5, u1: 3, u2: 0, collided: false, t: 0 })
  const [running, setRunning] = useState(false)

  // predictions
  const vStick = (m1 * v1 + m2 * v2) / (m1 + m2)
  const e1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
  const e2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
  const pBefore = m1 * v1 + m2 * v2
  const keBefore = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2
  const keAfter = kind === 'inelastic' ? 0.5 * (m1 + m2) * vStick * vStick : 0.5 * m1 * e1 * e1 + 0.5 * m2 * e2 * e2

  const reset = () => { setRunning(false); setSim({ x1: 1.5, x2: 6.5, u1: v1, u2: v2, collided: false, t: 0 }) }
  useEffect(() => { reset() }, [m1, m2, v1, v2, kind]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onResult?.({ m1, m2, v1, v2, kind, vStick }) }, [m1, m2, v1, v2, kind, vStick, onResult])

  const w1 = 0.5 + m1 * 0.08, w2 = 0.5 + m2 * 0.08 // cart half-widths (track units)
  useAnimationFrame((dt) => {
    setSim((s) => {
      let { x1, x2, u1, u2, collided } = s
      x1 += u1 * dt; x2 += u2 * dt
      if (!collided && x2 - x1 <= w1 + w2 && u1 - u2 > 0) {
        collided = true
        if (kind === 'inelastic') { u1 = vStick; u2 = vStick } else { u1 = e1; u2 = e2 }
      }
      if (x1 < -1 || x2 > 11 || x1 > 11 || x2 < -1 || s.t > 7) setRunning(false)
      return { x1, x2, u1, u2, collided, t: s.t + dt }
    })
  }, running)

  const px = (x) => 40 + x * 52
  const cart = (x, w, m, u, color, label) => (
    <g transform={`translate(${px(x)} 190)`}>
      <rect x={-w * 52} y={-30 - m * 2} width={w * 104} height={26 + m * 2} rx="6" fill={color} />
      <circle cx={-w * 52 + 10} cy="2" r="6" fill={C.ink} /><circle cx={w * 52 - 10} cy="2" r="6" fill={C.ink} />
      <text x="0" y={-16 - m} fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">{label} · {m} kg</text>
      {Math.abs(u) > 0.05 && <line x1="0" y1="-50" x2={u * 18} y2="-50" stroke={color} strokeWidth="3" markerEnd={`url(#ar-${label})`} />}
      <text x={u * 18} y="-58" fontSize="10" fontWeight="700" fill={color} textAnchor="middle">{fmt(u, 2)} m/s</text>
      <defs><marker id={`ar-${label}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={color} /></marker></defs>
    </g>
  )

  return (
    <SimFrame
      title="Two carts, one crash"
      framing="An air track in the physics lab. Cart A rolls toward cart B. Will they bounce (elastic) or stick together like a car crash with crumple zones (inelastic)?"
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Mass A" min={1} max={10} value={m1} onChange={setM1} unit=" kg" />
            <Slider label="Velocity A" min={-5} max={5} step={0.5} value={v1} onChange={setV1} unit=" m/s" />
            <Slider label="Mass B" min={1} max={10} value={m2} onChange={setM2} unit=" kg" />
            <Slider label="Velocity B" min={-5} max={5} step={0.5} value={v2} onChange={setV2} unit=" m/s" />
            <Segmented value={kind} onChange={setKind} options={[{ value: 'elastic', label: 'Elastic (bounce)' }, { value: 'inelastic', label: 'Inelastic (stick)' }]} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (sim.collided || sim.t > 0) reset(); setTimeout(() => setRunning(true), 0) }} disabled={running}><Play size={14} /> Play</Button>
              <Button size="sm" variant="secondary" onClick={reset}><RotateCcw size={14} /> Reset</Button>
            </div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Momentum" value={fmt(pBefore, 1)} unit="kg·m/s" tone="mango" className="col-span-2" />
            <Readout label="KE before" value={fmt(keBefore, 1)} unit="J" />
            <Readout label="KE after" value={fmt(keAfter, 1)} unit="J" tone={keAfter < keBefore - 0.01 ? 'danger' : 'success'} />
          </ReadoutGrid>
        </>
      }
      caption={`Total momentum (${fmt(pBefore, 1)} kg·m/s) is the same before and after, whatever happens — no exceptions. Kinetic energy is only conserved in the elastic case; when the carts stick, ${fmt(keBefore - keAfter, 1)} J goes into deformation and heat. That “lost” energy is exactly what a crumple zone is designed to absorb instead of your body.`}
    >
      <svg viewBox="0 0 600 260" className="w-full h-auto">
        <rect x="20" y="196" width="560" height="10" rx="5" fill={C.ink200} />
        {Array.from({ length: 11 }, (_, i) => <text key={i} x={px(i)} y="222" fontSize="9" fill={C.ink400} textAnchor="middle">{i} m</text>)}
        {cart(sim.x1, w1, m1, sim.u1, C.mango, 'A')}
        {cart(sim.x2, w2, m2, sim.u2, C.info, 'B')}
        {sim.collided && kind === 'inelastic' && <text x={px((sim.x1 + sim.x2) / 2)} y="100" fontSize="12" fontWeight="800" fill={C.danger} textAnchor="middle">stuck together · v = {fmt(sim.u1, 2)} m/s</text>}
        {sim.collided && kind === 'elastic' && <text x="300" y="100" fontSize="12" fontWeight="800" fill={C.success} textAnchor="middle">bounced · A {fmt(e1, 2)} m/s · B {fmt(e2, 2)} m/s</text>}
        <text x="300" y="36" fontSize="11" fontWeight="700" fill={C.ink400} textAnchor="middle">m₁v₁ + m₂v₂ = {m1}×{v1} + {m2}×{v2} = {fmt(pBefore, 1)} → after: {kind === 'inelastic' ? `(${m1}+${m2})·v  ⇒  v = ${fmt(vStick, 2)} m/s` : `${m1}·${fmt(e1, 2)} + ${m2}·${fmt(e2, 2)} = ${fmt(m1 * e1 + m2 * e2, 1)}`}</text>
      </svg>
    </SimFrame>
  )
}
