import { useEffect, useMemo, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, scale, Axes, pathFrom } from '../shared'

const temp = (t) => 24 + 6 * Math.sin((Math.PI * (t - 9)) / 12) // Beirut, early October: 18° at 03:00, 30° at 15:00
const hh = (t) => `${String(Math.floor(t)).padStart(2, '0')}:00`

/** Average value of a function = area under the curve ÷ width of the interval. */
export default function AverageValue({ onResult }) {
  const [a, setA] = useState(6)
  const [b, setB] = useState(18)
  const lo = Math.min(a, b), hi = Math.max(a, b)
  const width = Math.max(1, hi - lo)

  const { area, average } = useMemo(() => {
    const N = 400
    let s = 0
    for (let i = 0; i < N; i++) s += temp(lo + ((i + 0.5) / N) * width) * (width / N)
    return { area: s, average: s / width }
  }, [lo, width])

  useEffect(() => { onResult?.({ from: lo, to: hi, average }) }, [lo, hi, average, onResult])

  const x0 = 50, x1 = 580, y0 = 260, y1 = 30
  const sx = scale(0, 24, x0, x1)
  const sy = scale(14, 34, y0, y1)
  const curve = pathFrom(Array.from({ length: 145 }, (_, i) => { const t = i / 6; return [sx(t), sy(temp(t))] }))
  const shade = `${pathFrom(Array.from({ length: 61 }, (_, i) => { const t = lo + (i / 60) * width; return [sx(t), sy(temp(t))] }))} L${sx(hi)} ${sy(14)} L${sx(lo)} ${sy(14)} Z`

  return (
    <SimFrame
      title="One number for a whole day in Beirut"
      framing="The temperature on the Corniche follows T(t) = 24 + 6·sin(π(t − 9)/12) °C. A weather app shows one “average” for the window you pick. How does it compute that from infinitely many moments?"
      controls={
        <>
          <ControlCard title="Interval">
            <Slider label="From" min={0} max={23} value={a} onChange={setA} format={hh} />
            <Slider label="To" min={1} max={24} value={b} onChange={setB} format={hh} />
            <div className="text-xs text-charcoal-400">Window {hh(lo)} → {hh(hi)} · width {width} h</div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Area (°C·h)" value={fmt(area, 1)} tone="info" />
            <Readout label="Average" value={fmt(average, 2)} unit="°C" tone="mango" />
          </ReadoutGrid>
        </>
      }
      caption="The blue region is the area under the temperature curve over your window. The orange line is the average: a flat rectangle of the same width with exactly the same area. So average = area ÷ width = (1/(b−a)) ∫ T(t) dt — and since area is F(b) − F(a) for an antiderivative F, the average is also the slope of F between a and b."
    >
      <svg viewBox="0 0 600 290" className="w-full h-auto">
        <Axes x0={x0} y0={y0} x1={x1} y1={y1} sx={sx} sy={sy} xTicks={[0, 6, 12, 18, 24]} yTicks={[15, 20, 25, 30]} fmtX={hh} xLabel="time" yLabel="°C" />
        <path d={shade} fill={C.infoSoft} stroke="none" />
        <rect x={sx(lo)} y={sy(average)} width={sx(hi) - sx(lo)} height={sy(14) - sy(average)} fill={C.mango} opacity="0.18" />
        <path d={curve} fill="none" stroke={C.ink} strokeWidth="2.5" />
        <line x1={sx(lo)} y1={sy(average)} x2={sx(hi)} y2={sy(average)} stroke={C.mango} strokeWidth="3" />
        <text x={(sx(lo) + sx(hi)) / 2} y={sy(average) - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.mango}>average {fmt(average, 1)} °C</text>
        {[lo, hi].map((t) => <line key={t} x1={sx(t)} y1={y1} x2={sx(t)} y2={y0} stroke={C.info} strokeDasharray="4 4" />)}
        <text x={sx(lo) + 4} y={y1 + 12} fontSize="10" fontWeight="700" fill={C.info}>{hh(lo)}</text>
        <text x={sx(hi) - 4} y={y1 + 12} fontSize="10" fontWeight="700" fill={C.info} textAnchor="end">{hh(hi)}</text>
      </svg>
    </SimFrame>
  )
}
