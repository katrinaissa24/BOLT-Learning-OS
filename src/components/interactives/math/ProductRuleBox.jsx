import { useEffect, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, scale, Axes, pathFrom } from '../shared'

const p = (t) => 10 + t // price ($)
const u = (t) => 100 - 2 * t // units sold per day
const dp = () => 1
const du = () => -2

/** Revenue = price × units is a rectangle. Nudge time by dt and watch the two strips. */
export default function ProductRuleBox({ onResult }) {
  const [t, setT] = useState(5)
  const [dt, setDt] = useState(2)

  const P = p(t), U = u(t), P2 = p(t + dt), U2 = u(t + dt)
  const R = P * U, R2 = P2 * U2
  const stripRight = U * (P2 - P) // u·dp (added)
  const stripTop = P * (U2 - U) // p·du (removed)
  const corner = (P2 - P) * (U2 - U)
  const avgRate = (R2 - R) / dt
  const exact = dp() * U + P * du()

  useEffect(() => { onResult?.({ t, exact, avgRate }) }, [t, exact, avgRate, onResult])

  // box drawing
  const ox = 50, oy = 280
  const kx = 6, ky = 2.2 // px per $ and per unit
  const W = P * kx, H = U * ky, DW = (P2 - P) * kx, DH = (U2 - U) * ky // DH negative

  // revenue graph
  const gx0 = 345, gx1 = 580, gy0 = 280, gy1 = 50
  const sx = scale(0, 25, gx0, gx1)
  const sy = scale(0, 1600, gy0, gy1)
  const curve = pathFrom(Array.from({ length: 51 }, (_, i) => { const tt = (i / 50) * 25; return [sx(tt), sy(p(tt) * u(tt))] }))

  return (
    <SimFrame
      title="A manoushe stand’s revenue"
      framing="Each day the price rises by $1 while daily sales drop by 2. Revenue = price × units — a rectangle whose two sides both change."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Day t" min={0} max={20} step={1} value={t} onChange={setT} />
            <Slider label="Step dt" min={0.1} max={4} step={0.1} value={dt} onChange={setDt} unit=" days" />
            <div className="text-xs text-charcoal-400">p = ${P} · u = {U} units · R = ${R}</div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="u·dp (gained)" value={`+${fmt(stripRight, 1)}`} unit="$" tone="success" />
            <Readout label="p·du (lost)" value={fmt(stripTop, 1)} unit="$" tone="danger" />
            <Readout label="ΔR ÷ dt" value={fmt(avgRate, 1)} unit="$/day" tone="info" />
            <Readout label="p′u + pu′" value={fmt(exact, 1)} unit="$/day" tone="mango" />
          </ReadoutGrid>
        </>
      }
      caption="The grey rectangle is today’s revenue. Moving one step forward adds the green strip on the right (more price × the same units: u·dp) and removes the red strip on top (fewer units × the same price: p·du). The tiny corner (dp·du) vanishes as dt → 0 — leaving the product rule: dR = u·dp + p·du."
    >
      <svg viewBox="0 0 600 310" className="w-full h-auto">
        <rect x={ox} y={oy - H} width={W} height={H} fill={C.ink100} stroke={C.ink} strokeWidth="1.5" />
        <rect x={ox + W} y={oy - H} width={DW} height={H} fill={C.success} opacity="0.8" />
        <rect x={ox} y={oy - H} width={W} height={-DH} fill={C.danger} opacity="0.75" />
        <rect x={ox + W} y={oy - H} width={DW} height={-DH} fill={C.ink300} />
        <line x1={ox} y1={oy - H - DH} x2={ox + W + DW} y2={oy - H - DH} stroke={C.ink} strokeDasharray="4 3" />
        <text x={ox + W / 2} y={oy - H / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.ink}>R = ${R}</text>
        <text x={ox + W / 2} y={oy + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.ink400}>price ${P}</text>
        <text x={ox - 8} y={oy - H / 2} textAnchor="end" fontSize="11" fontWeight="600" fill={C.ink400} transform={`rotate(-90 ${ox - 8} ${oy - H / 2})`}>{U} units</text>
        <text x={ox + W + DW + 6} y={oy - H / 2 + 4} fontSize="10" fontWeight="700" fill={C.success}>u·dp</text>
        <text x={ox + W / 2} y={oy - H - DH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">p·du (sales lost)</text>

        <Axes x0={gx0} y0={gy0} x1={gx1} y1={gy1} sx={sx} sy={sy} xTicks={[0, 5, 10, 15, 20, 25]} yTicks={[0, 400, 800, 1200, 1600]} xLabel="day" yLabel="revenue $" />
        <path d={curve} fill="none" stroke={C.ink} strokeWidth="2.5" />
        <path d={`M${sx(0)} ${sy(R + exact * (0 - t))} L${sx(25)} ${sy(R + exact * (25 - t))}`} stroke={C.mango} strokeWidth="2" strokeDasharray="6 5" fill="none" />
        <circle cx={sx(t)} cy={sy(R)} r="7" fill={C.mango} stroke="#fff" strokeWidth="2.5" />
        <circle cx={sx(t + dt)} cy={sy(R2)} r="5" fill="#fff" stroke={C.info} strokeWidth="2" />
        <text x={sx(t) + 10} y={sy(R) - 10} fontSize="10" fontWeight="700" fill={C.mango}>slope {fmt(exact, 0)} $/day</text>
      </svg>
    </SimFrame>
  )
}
