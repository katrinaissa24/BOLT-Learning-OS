import { useEffect, useMemo, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Slider, Button } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt, scale, pathFrom, useAnimationFrame } from '../shared'

const G = 9.8, M = 500 // kg, a loaded cart
const LOSS = 0.08 // fraction of mechanical energy lost per segment with friction on

/** Energy bookkeeping on a coaster: height ↔ speed, with friction taking a cut. */
export default function RollerCoaster({ onResult }) {
  const [h1, setH1] = useState(20)
  const [h2, setH2] = useState(8)
  const [friction, setFriction] = useState('off')
  const [u, setU] = useState(0) // 0..1 progress along track
  const [running, setRunning] = useState(false)

  // track: start hill (h1) → valley (0) → second hill (h2) → end valley (2 m)
  const track = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 100; i++) {
      const s = i / 100
      let h
      if (s < 0.35) h = h1 * (0.5 + 0.5 * Math.cos((Math.PI * s) / 0.35))
      else if (s < 0.7) h = h2 * (0.5 - 0.5 * Math.cos((Math.PI * (s - 0.35)) / 0.35))
      else h = h2 * (0.5 + 0.5 * Math.cos((Math.PI * (s - 0.7)) / 0.3)) + 2 * ((s - 0.7) / 0.3)
      pts.push({ s, h })
    }
    return pts
  }, [h1, h2])

  const hAt = (s) => { const i = Math.min(99, Math.floor(s * 100)); const a = track[i], b = track[i + 1]; const f = s * 100 - i; return a.h + (b.h - a.h) * f }
  const E0 = M * G * h1
  const lossAt = (s) => (friction === 'on' ? Math.min(0.95, LOSS * 3 * s) : 0)
  const heat = E0 * lossAt(u)
  const h = hAt(u)
  const PE = M * G * h
  const KE = Math.max(0, E0 - PE - heat)
  const vNow = Math.sqrt((2 * KE) / M)
  const vBottomNoFriction = Math.sqrt(2 * G * h1)
  const stuck = KE <= 0.5 && u > 0.05 && u < 0.99

  useAnimationFrame((dt) => {
    setU((p) => {
      const sp = Math.max(1.5, Math.sqrt((2 * Math.max(0, E0 - M * G * hAt(p) - E0 * lossAt(p))) / M))
      const next = p + (sp / 400) * dt * 4
      if (next >= 1) { setRunning(false); return 1 }
      if (sp <= 1.6 && p > 0.05 && next > p && hAt(next) > hAt(p)) { setRunning(false); return p } // not enough energy to climb
      return next
    })
  }, running)
  useEffect(() => { setU(0); setRunning(false) }, [h1, h2, friction])
  useEffect(() => { onResult?.({ h1, friction, vBottom: friction === 'on' ? vBottomNoFriction * Math.sqrt(1 - LOSS * 3 * 0.35) : vBottomNoFriction }) }, [h1, friction, vBottomNoFriction, onResult])

  const x0 = 40, x1 = 400, yBase = 260
  const sx = scale(0, 1, x0, x1)
  const sy = scale(0, 45, yBase, 40)
  const path = pathFrom(track.map((p) => [sx(p.s), sy(p.h)]))
  const barMax = Math.max(E0, 1)
  const bar = (label, val, color, i) => {
    const hpx = (val / barMax) * 190
    return <g key={label} transform={`translate(${440 + i * 50} 0)`}><rect x="0" y={250 - hpx} width="34" height={hpx} rx="6" fill={color} /><text x="17" y="268" fontSize="10" fontWeight="700" fill={C.ink400} textAnchor="middle">{label}</text><text x="17" y={244 - hpx} fontSize="9" fontWeight="700" fill={C.ink} textAnchor="middle">{fmt(val / 1000, 0)} kJ</text></g>
  }

  return (
    <SimFrame
      title="A coaster at the Beirut Luna Park"
      framing="A 500 kg cart is winched to the top of the first hill and released. Height becomes speed, speed becomes height — and friction turns some of it into heat."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="First hill height" min={5} max={40} step={1} value={h1} onChange={setH1} unit=" m" />
            <Slider label="Second hill height" min={2} max={40} step={1} value={h2} onChange={setH2} unit=" m" />
            <Segmented label="Friction" value={friction} onChange={setFriction} options={[{ value: 'off', label: 'Off (ideal)' }, { value: 'on', label: 'On (real track)' }]} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (u >= 1 || stuck) setU(0); setRunning(true) }} disabled={running}><Play size={14} /> Release</Button>
              <Button size="sm" variant="secondary" onClick={() => { setRunning(false); setU(0) }}><RotateCcw size={14} /> Reset</Button>
            </div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Height" value={fmt(h, 1)} unit="m" />
            <Readout label="Speed" value={fmt(vNow, 1)} unit="m/s" tone="mango" />
            <Readout label="√(2gh₁)" value={fmt(vBottomNoFriction, 1)} unit="m/s" tone="success" className="col-span-2" />
          </ReadoutGrid>
        </>
      }
      caption={`The bars are the energy budget: potential (mgh), kinetic (½mv²) and heat. Without friction the first two always add up to the same total, so the speed at the bottom depends only on the drop: v = √(2gh). With friction the heat bar grows and the cart may not make the second hill${stuck ? ' — as it just failed to do' : ''}. Notice the mass never appears in v = √(2gh): a heavier cart is not faster.`}
    >
      <svg viewBox="0 0 600 290" className="w-full h-auto">
        <path d={`${path} L${sx(1)} ${yBase} L${sx(0)} ${yBase} Z`} fill={C.ink100} />
        <path d={path} fill="none" stroke={C.ink} strokeWidth="3" />
        {track.filter((_, i) => i % 5 === 0).map((p) => <line key={p.s} x1={sx(p.s)} y1={sy(p.h)} x2={sx(p.s)} y2={yBase} stroke={C.ink200} />)}
        {[0, 10, 20, 30, 40].map((m) => <text key={m} x={x0 - 6} y={sy(m) + 3} fontSize="9" fill={C.ink400} textAnchor="end">{m} m</text>)}
        <g transform={`translate(${sx(u)} ${sy(h) - 8})`}>
          <rect x="-13" y="-10" width="26" height="14" rx="3" fill={C.mango} />
          <circle cx="-7" cy="6" r="3.5" fill={C.ink} /><circle cx="7" cy="6" r="3.5" fill={C.ink} />
        </g>
        {stuck && <text x={sx(u)} y={sy(h) - 28} fontSize="11" fontWeight="800" fill={C.danger} textAnchor="middle">not enough energy!</text>}
        <text x="440" y="24" fontSize="10" fontWeight="700" fill={C.ink400}>ENERGY BUDGET</text>
        <line x1="430" y1="250" x2="590" y2="250" stroke={C.ink200} />
        {bar('PE', PE, C.info, 0)}{bar('KE', KE, C.mango, 1)}{bar('heat', heat, C.danger, 2)}
        <text x="440" y="40" fontSize="10" fill={C.ink}>total = {fmt(E0 / 1000, 0)} kJ</text>
      </svg>
    </SimFrame>
  )
}
