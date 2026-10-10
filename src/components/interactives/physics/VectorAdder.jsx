import { useEffect, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt } from '../shared'

const rad = (d) => (d * Math.PI) / 180

/** Two displacement vectors added tip-to-tail on a grid, with live x/y components and the resultant. */
export default function VectorAdder({ onResult }) {
  const [a, setA] = useState(6)
  const [thA, setThA] = useState(0)
  const [b, setB] = useState(5)
  const [thB, setThB] = useState(60)
  const [show, setShow] = useState('tip')

  const ax = a * Math.cos(rad(thA)), ay = a * Math.sin(rad(thA))
  const bx = b * Math.cos(rad(thB)), by = b * Math.sin(rad(thB))
  const rx = ax + bx, ry = ay + by
  const r = Math.hypot(rx, ry)
  const thR = (Math.atan2(ry, rx) * 180) / Math.PI

  useEffect(() => { onResult?.({ a, thA, b, thB, r, thR }) }, [a, thA, b, thB, r, thR, onResult])

  // drawing: 1 m = 22 px, origin placed so most sums stay on screen
  const k = 22, ox = 300, oy = 190
  const P = (x, y) => [ox + x * k, oy - y * k]
  const arrow = (x1, y1, x2, y2, color, label, w = 4, dash, below = false) => {
    const [px1, py1] = P(x1, y1), [px2, py2] = P(x2, y2)
    if (Math.hypot(px2 - px1, py2 - py1) < 2) return null
    const ang = (Math.atan2(py2 - py1, px2 - px1) * 180) / Math.PI
    return (
      <g>
        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
        <polygon points="0,0 -11,-6 -11,6" fill={color} transform={`translate(${px2} ${py2}) rotate(${ang})`} />
        {label && <text x={(px1 + px2) / 2 + (below ? 0 : 8)} y={(py1 + py2) / 2 + (below ? 22 : -8)} fontSize="13" fontWeight="800" fill={color} textAnchor={below ? 'middle' : 'start'}>{label}</text>}
      </g>
    )
  }

  return (
    <SimFrame
      title="Walking across the school campus"
      framing="You walk A metres in one direction, then B metres in another. Where do you end up? Move the sliders and watch the resultant R (the straight line from start to finish)."
      controls={
        <>
          <ControlCard title="Vector A (orange)">
            <Slider label="Magnitude |A|" min={0} max={10} step={0.5} value={a} onChange={setA} unit=" m" />
            <Slider label="Direction θA" min={-180} max={180} step={5} value={thA} onChange={setThA} unit="°" />
          </ControlCard>
          <ControlCard title="Vector B (blue)">
            <Slider label="Magnitude |B|" min={0} max={10} step={0.5} value={b} onChange={setB} unit=" m" />
            <Slider label="Direction θB" min={-180} max={180} step={5} value={thB} onChange={setThB} unit="°" />
          </ControlCard>
          <Segmented label="Show" value={show} onChange={setShow} options={[{ value: 'tip', label: 'Tip-to-tail' }, { value: 'comp', label: 'Components' }]} />
          <ReadoutGrid>
            <Readout label="Rx = Ax + Bx" value={fmt(rx, 2)} unit="m" tone="info" />
            <Readout label="Ry = Ay + By" value={fmt(ry, 2)} unit="m" tone="info" />
            <Readout label="|R|" value={fmt(r, 2)} unit="m" tone="success" />
            <Readout label="Direction of R" value={fmt(thR, 1)} unit="°" tone="mango" />
          </ReadoutGrid>
        </>
      }
      caption="Angles are measured from east (the +x axis), counter-clockwise. Each vector splits into an x part (|A|·cos θ) and a y part (|A|·sin θ). Add the x parts, add the y parts, then rebuild: |R| = √(Rx² + Ry²) and θ = tan⁻¹(Ry / Rx). Notice |R| is almost never |A| + |B| — it only is when both point the same way."
    >
      <svg viewBox="0 0 600 380" className="w-full h-auto">
        {Array.from({ length: 28 }, (_, i) => <line key={`v${i}`} x1={ox + (i - 14) * k} y1="0" x2={ox + (i - 14) * k} y2="380" stroke={C.ink100} />)}
        {Array.from({ length: 18 }, (_, i) => <line key={`h${i}`} x1="0" y1={oy + (i - 9) * k} x2="600" y2={oy + (i - 9) * k} stroke={C.ink100} />)}
        <line x1="0" y1={oy} x2="600" y2={oy} stroke={C.ink300} />
        <line x1={ox} y1="0" x2={ox} y2="380" stroke={C.ink300} />
        <text x="588" y={oy - 6} fontSize="11" fill={C.ink400} textAnchor="end">east (+x)</text>
        <text x={ox + 6} y="14" fontSize="11" fill={C.ink400}>north (+y)</text>
        <circle cx={ox} cy={oy} r="5" fill={C.ink} />
        <text x={ox - 8} y={oy + 18} fontSize="11" fill={C.ink} textAnchor="end">start</text>
        {show === 'tip' ? (
          <>
            {arrow(0, 0, ax, ay, C.mango, 'A')}
            {arrow(ax, ay, rx, ry, C.info, 'B')}
          </>
        ) : (
          <>
            {arrow(0, 0, ax, 0, C.mango, 'Ax', 3, '6 5')}
            {arrow(ax, 0, ax, ay, C.mango, 'Ay', 3, '6 5')}
            {arrow(ax, ay, rx, ay, C.info, 'Bx', 3, '6 5')}
            {arrow(rx, ay, rx, ry, C.info, 'By', 3, '6 5')}
          </>
        )}
        {arrow(0, 0, rx, ry, C.success, `R = ${fmt(r, 1)} m`, 5, undefined, true)}
      </svg>
    </SimFrame>
  )
}
