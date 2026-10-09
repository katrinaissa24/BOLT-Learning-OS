import { useEffect, useMemo, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, scale, Axes } from '../shared'

const R = 3 // radius (dm) — a large pizza

/**
 * Slice a pizza into N concentric rings. Each ring, straightened out, is ~ a rectangle 2πr × dr.
 * Stacked, those rectangles form the area under the graph of 2πr — a triangle whose area is πr².
 */
export default function CircleRings({ onResult }) {
  const [n, setN] = useState(6)
  const dr = R / n
  const { sum, exact, errorPct } = useMemo(() => {
    let s = 0
    for (let i = 0; i < n; i++) s += 2 * Math.PI * (i * dr) * dr // inner-radius rectangles
    const ex = Math.PI * R * R
    return { sum: s, exact: ex, errorPct: (Math.abs(ex - s) / ex) * 100 }
  }, [n, dr])

  useEffect(() => { onResult?.({ n, errorPct, sum }) }, [n, errorPct, sum, onResult])

  // left: pizza; right: 2πr graph with rectangles
  const cx = 150, cy = 160, pr = 120
  const gx0 = 330, gx1 = 580, gy0 = 270, gy1 = 50
  const sx = scale(0, R, gx0, gx1)
  const sy = scale(0, 2 * Math.PI * R, gy0, gy1)

  return (
    <SimFrame
      title="Slice a pizza into rings"
      framing="A 60 cm pizza (radius 3 dm). Cut it into thin concentric rings and straighten each ring into a strip."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Number of rings N" min={1} max={80} value={n} onChange={setN} />
            <div className="text-xs text-charcoal-400">Ring thickness dr = {fmt(dr, 3)} dm</div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Ring sum" value={fmt(sum, 2)} unit="dm²" />
            <Readout label="True area πr²" value={fmt(exact, 2)} unit="dm²" tone="mango" />
            <Readout label="Error" value={fmt(errorPct, 1)} unit="%" tone={errorPct < 2 ? 'success' : 'danger'} className="col-span-2" />
          </ReadoutGrid>
        </>
      }
      caption="Left: the pizza cut into N rings. Right: every ring straightened into a rectangle of length 2πr and width dr. Their total is the staircase under the line 2πr; as N grows the staircase fills the triangle whose area is exactly ½ · r · 2πr = πr²."
    >
      <svg viewBox="0 0 600 300" className="w-full h-auto">
        {Array.from({ length: n }, (_, i) => n - 1 - i).map((i) => (
          <circle key={i} cx={cx} cy={cy} r={((i + 1) / n) * pr} fill={i % 2 ? C.mangoSoft : C.mango} stroke="#fff" strokeWidth={n > 40 ? 0.5 : 1} />
        ))}
        <circle cx={cx} cy={cy} r={pr} fill="none" stroke={C.ink} strokeWidth="2" />
        <text x={cx} y={cy + pr + 24} textAnchor="middle" fontSize="11" fill={C.ink400} fontWeight="600">r = 3 dm · {n} rings</text>

        <Axes x0={gx0} y0={gy0} x1={gx1} y1={gy1} sx={sx} sy={sy} xTicks={[0, 1, 2, 3]} yTicks={[0, 6, 12, 18]} xLabel="r" yLabel="2πr" />
        {Array.from({ length: n }, (_, i) => {
          const r0 = i * dr, h = 2 * Math.PI * r0
          return <rect key={i} x={sx(r0)} y={sy(h)} width={Math.max(0.5, sx(r0 + dr) - sx(r0))} height={gy0 - sy(h)} fill={i % 2 ? C.mangoSoft : C.mango} stroke="#fff" strokeWidth={n > 40 ? 0.3 : 0.8} />
        })}
        <line x1={sx(0)} y1={sy(0)} x2={sx(R)} y2={sy(2 * Math.PI * R)} stroke={C.ink} strokeWidth="2" />
        <text x={gx0 + 8} y={gy1 + 6} fontSize="11" fill={C.ink} fontWeight="700">triangle area = πr² = {fmt(exact, 2)}</text>
      </svg>
    </SimFrame>
  )
}
