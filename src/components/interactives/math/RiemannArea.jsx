import { useEffect, useMemo, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt, scale, Axes, pathFrom } from '../shared'

const v = (t) => 5 + 2 * t - 0.1 * t * t // car velocity m/s on 0..10 s
const EXACT = 5 * 10 + 10 * 10 - (0.1 * 1000) / 3 // ∫ = 116.67 m
const T = 10

/** Distance from a velocity graph: stack rectangles under the curve and watch the estimate converge. */
export default function RiemannArea({ onResult }) {
  const [n, setN] = useState(5)
  const [rule, setRule] = useState('left')
  const h = T / n

  const { rects, sum } = useMemo(() => {
    const rs = []
    let s = 0
    for (let i = 0; i < n; i++) {
      const a = i * h
      const sample = rule === 'left' ? a : rule === 'right' ? a + h : a + h / 2
      const height = v(sample)
      rs.push({ a, height })
      s += height * h
    }
    return { rects: rs, sum: s }
  }, [n, h, rule])
  const errorPct = (Math.abs(sum - EXACT) / EXACT) * 100

  useEffect(() => { onResult?.({ n, rule, sum, errorPct }) }, [n, rule, sum, errorPct, onResult])

  const x0 = 50, x1 = 580, y0 = 270, y1 = 30
  const sx = scale(0, T, x0, x1)
  const sy = scale(0, 20, y0, y1)
  const curve = pathFrom(Array.from({ length: 101 }, (_, i) => { const t = (i / 100) * T; return [sx(t), sy(v(t))] }))

  return (
    <SimFrame
      title="How far did the service taxi go?"
      framing="A service taxi pulls away from Cola roundabout. Its speedometer follows v(t) = 5 + 2t − 0.1t² for 10 seconds. There is no odometer — only this graph."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Rectangles n" min={1} max={100} value={n} onChange={setN} />
            <Segmented label="Sample each slice at" value={rule} onChange={setRule} options={[{ value: 'left', label: 'left' }, { value: 'mid', label: 'middle' }, { value: 'right', label: 'right' }]} />
            <div className="text-xs text-charcoal-400">Slice width Δt = {fmt(h, 2)} s</div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Rectangle sum" value={fmt(sum, 1)} unit="m" tone="info" />
            <Readout label="Exact distance" value={fmt(EXACT, 1)} unit="m" tone="mango" />
            <Readout label="Error" value={fmt(errorPct, 2)} unit="%" tone={errorPct < 1 ? 'success' : 'danger'} className="col-span-2" />
          </ReadoutGrid>
        </>
      }
      caption="Each rectangle is velocity × a short time — a short distance. Add them all and you get a distance estimate. The staircase hugs the curve more tightly as n grows; the exact area under v(t) is the integral, and it equals the change in position s(10) − s(0)."
    >
      <svg viewBox="0 0 600 300" className="w-full h-auto">
        <Axes x0={x0} y0={y0} x1={x1} y1={y1} sx={sx} sy={sy} xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[0, 5, 10, 15, 20]} xLabel="time (s)" yLabel="velocity (m/s)" />
        <path d={`${curve} L${sx(T)} ${sy(0)} L${sx(0)} ${sy(0)} Z`} fill={C.mangoFaint} />
        {rects.map((r, i) => <rect key={i} x={sx(r.a)} y={sy(r.height)} width={Math.max(0.5, sx(r.a + h) - sx(r.a))} height={sy(0) - sy(r.height)} fill={C.mango} opacity="0.55" stroke="#fff" strokeWidth={n > 50 ? 0.3 : 1} />)}
        <path d={curve} fill="none" stroke={C.ink} strokeWidth="2.5" />
        <text x={sx(5)} y={sy(8)} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.ink}>area ≈ distance</text>
      </svg>
    </SimFrame>
  )
}
