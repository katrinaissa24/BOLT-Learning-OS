import { useEffect, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Slider, Button } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, scale, Axes, pathFrom, useAnimationFrame } from '../shared'

const T_END = 8

/** A car on the Beirut–Jounieh highway: pick v₀ and a, play, and read position & velocity graphs. */
export default function MotionGraphs({ onResult }) {
  const [a, setA] = useState(2)
  const [v0, setV0] = useState(3)
  const [t, setT] = useState(0)
  const [running, setRunning] = useState(false)

  useAnimationFrame((dt) => {
    setT((prev) => { const next = prev + dt; if (next >= T_END) { setRunning(false); return T_END } return next })
  }, running)

  const vel = (tt) => v0 + a * tt
  const pos = (tt) => v0 * tt + 0.5 * a * tt * tt
  useEffect(() => { onResult?.({ a, v0, vAt5: vel(5) }) }, [a, v0, onResult]) // eslint-disable-line react-hooks/exhaustive-deps

  const xMax = Math.max(40, pos(T_END)), vMax = Math.max(10, vel(T_END))
  // graphs
  const gx0 = 50, gx1 = 290, gy0 = 290, gy1 = 150
  const sxT = scale(0, T_END, gx0, gx1)
  const syX = scale(0, xMax, gy0, gy1)
  const gx2 = 345, gx3 = 585
  const sxT2 = scale(0, T_END, gx2, gx3)
  const syV = scale(0, vMax, gy0, gy1)
  const posPath = pathFrom(Array.from({ length: 81 }, (_, i) => { const tt = (i / 80) * T_END; return [sxT(tt), syX(pos(tt))] }))
  const velPath = pathFrom([[sxT2(0), syV(vel(0))], [sxT2(T_END), syV(vel(T_END))]])
  // road
  const roadX = scale(0, xMax, 40, 560)

  return (
    <SimFrame
      title="A car leaving the toll booth"
      framing="A car on the coastal highway starts at v₀ and accelerates steadily. Its dash-cam logs position and velocity every frame."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Acceleration a" min={0} max={4} step={0.5} value={a} onChange={(v) => { setA(v); setT(0) }} unit=" m/s²" />
            <Slider label="Initial speed v₀" min={0} max={10} step={1} value={v0} onChange={(v) => { setV0(v); setT(0) }} unit=" m/s" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (t >= T_END) setT(0); setRunning(true) }} disabled={running}><Play size={14} /> Play</Button>
              <Button size="sm" variant="secondary" onClick={() => { setRunning(false); setT(0) }}><RotateCcw size={14} /> Reset</Button>
            </div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="t" value={fmt(t, 1)} unit="s" />
            <Readout label="velocity" value={fmt(vel(t), 1)} unit="m/s" tone="mango" />
            <Readout label="position" value={fmt(pos(t), 1)} unit="m" tone="info" />
            <Readout label="v at 5 s" value={fmt(vel(5), 1)} unit="m/s" tone="success" />
          </ReadoutGrid>
        </>
      }
      caption="Top: the car on the road. Bottom-left: position vs time — it curves upward because the car keeps gaining speed; its slope at any instant is the velocity. Bottom-right: velocity vs time — a straight line whose slope is the acceleration. The shaded area under it so far equals the distance travelled."
    >
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* road */}
        <rect x="30" y="60" width="540" height="40" rx="6" fill={C.ink} />
        <line x1="40" y1="80" x2="560" y2="80" stroke="#fff" strokeWidth="2" strokeDasharray="14 12" />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => <text key={f} x={roadX(f * xMax)} y="118" fontSize="9" fill={C.ink400} textAnchor="middle">{fmt(f * xMax, 0)} m</text>)}
        <g transform={`translate(${roadX(pos(t)) - 18} 66)`}>
          <rect x="0" y="4" width="36" height="16" rx="4" fill={C.mango} />
          <rect x="8" y="0" width="18" height="8" rx="2" fill={C.mangoSoft} />
          <circle cx="8" cy="21" r="4" fill="#fff" /><circle cx="28" cy="21" r="4" fill="#fff" />
        </g>
        <text x="40" y="50" fontSize="11" fontWeight="700" fill={C.ink}>t = {fmt(t, 1)} s</text>

        {/* position graph */}
        <Axes x0={gx0} y0={gy0} x1={gx1} y1={gy1} sx={sxT} sy={syX} xTicks={[0, 2, 4, 6, 8]} yTicks={[0, Math.round(xMax / 2), Math.round(xMax)]} xLabel="t (s)" yLabel="x (m)" />
        <path d={posPath} fill="none" stroke={C.ink300} strokeWidth="2" strokeDasharray="3 3" />
        <path d={pathFrom(Array.from({ length: 41 }, (_, i) => { const tt = (i / 40) * t; return [sxT(tt), syX(pos(tt))] }))} fill="none" stroke={C.info} strokeWidth="3" />
        <circle cx={sxT(t)} cy={syX(pos(t))} r="5" fill={C.info} stroke="#fff" strokeWidth="2" />

        {/* velocity graph */}
        <Axes x0={gx2} y0={gy0} x1={gx3} y1={gy1} sx={sxT2} sy={syV} xTicks={[0, 2, 4, 6, 8]} yTicks={[0, Math.round(vMax / 2), Math.round(vMax)]} xLabel="t (s)" yLabel="v (m/s)" />
        <path d={`M${sxT2(0)} ${syV(0)} L${sxT2(0)} ${syV(vel(0))} L${sxT2(t)} ${syV(vel(t))} L${sxT2(t)} ${syV(0)} Z`} fill={C.mango} opacity="0.2" />
        <path d={velPath} fill="none" stroke={C.ink300} strokeWidth="2" strokeDasharray="3 3" />
        <path d={pathFrom([[sxT2(0), syV(vel(0))], [sxT2(t), syV(vel(t))]])} fill="none" stroke={C.mango} strokeWidth="3" />
        <circle cx={sxT2(t)} cy={syV(vel(t))} r="5" fill={C.mango} stroke="#fff" strokeWidth="2" />
        <text x={gx3 - 4} y={gy1 + 12} fontSize="10" fontWeight="700" fill={C.ink400} textAnchor="end">slope = a = {a} m/s²</text>
      </svg>
    </SimFrame>
  )
}
