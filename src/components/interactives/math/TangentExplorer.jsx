import { useEffect, useRef, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, scale, Axes, pathFrom } from '../shared'

const s = (t) => 0.5 * t * t + 2 * t // delivery scooter distance (m)
const ds = (t) => t + 2 // exact derivative
const T_MAX = 10

/** Secant → tangent: drag the point, shrink Δt and watch the average speed become the instantaneous speed. */
export default function TangentExplorer({ onResult }) {
  const [t, setT] = useState(4)
  const [dt, setDt] = useState(3)
  const svgRef = useRef(null)
  const dragging = useRef(false)

  const W = 600, H = 320, x0 = 50, x1 = 580, y0 = 280, y1 = 30
  const sx = scale(0, T_MAX, x0, x1)
  const sy = scale(0, s(T_MAX), y0, y1)
  const t2 = Math.min(T_MAX, t + dt)
  const secant = (s(t2) - s(t)) / (t2 - t)
  const tangent = ds(t)

  useEffect(() => { onResult?.({ t, secant, tangent }) }, [t, secant, tangent, onResult])

  const curve = pathFrom(Array.from({ length: 101 }, (_, i) => { const tt = (i / 100) * T_MAX; return [sx(tt), sy(s(tt))] }))
  const setFromPointer = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    setT(Math.round(Math.max(0, Math.min(T_MAX - 0.1, ((x - x0) / (x1 - x0)) * T_MAX)) * 10) / 10)
  }

  return (
    <SimFrame
      title="A delivery scooter in Hamra"
      framing="The scooter’s distance from the shop is s(t) = 0.5t² + 2t metres. Average speed needs two moments; instantaneous speed needs only one."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Time t" min={0} max={9.9} step={0.1} value={t} onChange={setT} unit=" s" />
            <Slider label="Interval Δt" min={0.05} max={4} step={0.05} value={dt} onChange={setDt} unit=" s" />
            <div className="text-xs text-charcoal-400">Tip: you can also drag the orange point on the curve.</div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Secant slope" value={fmt(secant, 2)} unit="m/s" tone="info" />
            <Readout label="Tangent slope" value={fmt(tangent, 2)} unit="m/s" tone="mango" />
            <Readout label="Gap" value={fmt(Math.abs(secant - tangent), 3)} unit="m/s" tone={Math.abs(secant - tangent) < 0.1 ? 'success' : 'neutral'} className="col-span-2" />
          </ReadoutGrid>
        </>
      }
      caption="The blue line is a secant: rise over run between t and t+Δt — the average speed over that interval. The orange line is the tangent at t. As Δt shrinks, the secant swings onto the tangent: that limiting slope is the derivative ds/dt, the speedometer reading at that instant."
    >
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none cursor-crosshair"
        onPointerDown={(e) => { dragging.current = true; setFromPointer(e) }}
        onPointerMove={(e) => dragging.current && setFromPointer(e)}
        onPointerUp={() => { dragging.current = false }} onPointerLeave={() => { dragging.current = false }}>
        <Axes x0={x0} y0={y0} x1={x1} y1={y1} sx={sx} sy={sy} xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[0, 20, 40, 60]} xLabel="time (s)" yLabel="distance (m)" />
        <path d={curve} fill="none" stroke={C.ink} strokeWidth="2.5" />
        {/* tangent */}
        <path d={`M${sx(0)} ${sy(s(t) + tangent * (0 - t))} L${sx(T_MAX)} ${sy(s(t) + tangent * (T_MAX - t))}`} stroke={C.mango} strokeWidth="2" strokeDasharray="6 5" fill="none" opacity="0.9" />
        {/* secant */}
        <path d={`M${sx(0)} ${sy(s(t) + secant * (0 - t))} L${sx(T_MAX)} ${sy(s(t) + secant * (T_MAX - t))}`} stroke={C.info} strokeWidth="2" fill="none" />
        {/* rise / run */}
        <path d={`M${sx(t)} ${sy(s(t))} L${sx(t2)} ${sy(s(t))} L${sx(t2)} ${sy(s(t2))}`} fill="none" stroke={C.info} strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={(sx(t) + sx(t2)) / 2} y={sy(s(t)) + 14} fontSize="10" fill={C.info} textAnchor="middle" fontWeight="700">Δt = {fmt(t2 - t, 2)}</text>
        <text x={sx(t2) + 6} y={(sy(s(t)) + sy(s(t2))) / 2} fontSize="10" fill={C.info} fontWeight="700">Δs = {fmt(s(t2) - s(t), 1)}</text>
        <circle cx={sx(t2)} cy={sy(s(t2))} r="6" fill="#fff" stroke={C.info} strokeWidth="2.5" />
        <circle cx={sx(t)} cy={sy(s(t))} r="9" fill={C.mango} stroke="#fff" strokeWidth="3" />
        <text x={sx(t)} y={sy(s(t)) - 16} fontSize="11" fill={C.ink} textAnchor="middle" fontWeight="700">t = {fmt(t, 1)} s</text>
      </svg>
    </SimFrame>
  )
}
