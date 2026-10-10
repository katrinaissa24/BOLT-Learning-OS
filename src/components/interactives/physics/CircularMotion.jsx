import { useEffect, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, useAnimationFrame } from '../shared'

/** A car on the Tayouneh roundabout: speed and radius set the centripetal acceleration. */
export default function CircularMotion({ onResult }) {
  const [v, setV] = useState(12)
  const [r, setR] = useState(18)
  const [theta, setTheta] = useState(0)

  const a = (v * v) / r
  const T = (2 * Math.PI * r) / v
  const omega = v / r
  useAnimationFrame((dt) => setTheta((t) => t + omega * dt * 0.6), true)
  useEffect(() => { onResult?.({ v, r, a }) }, [v, r, a, onResult])

  const cx = 170, cy = 165
  const R = 40 + (r / 60) * 90 // 5..60 m → 47..130 px
  const px = cx + R * Math.cos(theta), py = cy + R * Math.sin(theta)
  const vLen = 20 + v * 2.2
  const aLen = Math.min(90, 8 + a * 7)
  const tx = -Math.sin(theta), ty = Math.cos(theta) // tangent direction
  const nx = -Math.cos(theta), ny = -Math.sin(theta) // to centre

  return (
    <SimFrame
      title="A car on the Tayouneh roundabout"
      framing="Constant speed, yet the driver feels pushed against the door. Change speed and radius and watch the acceleration arrow — it always points to the centre."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Speed v" min={2} max={30} step={0.5} value={v} onChange={setV} unit=" m/s" />
            <Slider label="Radius r" min={5} max={60} step={1} value={r} onChange={setR} unit=" m" />
          </ControlCard>
          <ReadoutGrid>
            <Readout label="a = v²/r" value={fmt(a, 2)} unit="m/s²" tone="mango" />
            <Readout label="in g’s" value={fmt(a / 9.8, 2)} unit="g" tone={a > 9.8 ? 'danger' : 'info'} />
            <Readout label="Period T" value={fmt(T, 1)} unit="s" />
            <Readout label="Speed" value={fmt(v * 3.6, 0)} unit="km/h" />
          </ReadoutGrid>
        </>
      }
      caption="The blue arrow is velocity — tangent to the circle, constant in size. The orange arrow is acceleration — pointing to the centre, size v²/r. The velocity vector is turning, and turning a vector is a change, so there is acceleration even though the speedometer never moves. Above 1 g sideways, tyres on a dry road start to slide."
    >
      <svg viewBox="0 0 600 330" className="w-full h-auto">
        <circle cx={cx} cy={cy} r={R + 22} fill={C.ink200} />
        <circle cx={cx} cy={cy} r={R - 22} fill={C.ink50} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 10" />
        <circle cx={cx} cy={cy} r={R - 30} fill={C.successSoft} stroke={C.success} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.success}>r = {r} m</text>
        <line x1={cx} y1={cy} x2={px} y2={py} stroke={C.ink300} strokeDasharray="3 3" />
        {/* car */}
        <g transform={`translate(${px} ${py}) rotate(${(theta * 180) / Math.PI + 90})`}>
          <rect x="-9" y="-16" width="18" height="32" rx="5" fill={C.ink} />
          <rect x="-6" y="-10" width="12" height="8" rx="2" fill={C.mangoSoft} />
        </g>
        {/* vectors */}
        <defs>
          <marker id="arrV" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={C.info} /></marker>
          <marker id="arrA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={C.mango} /></marker>
        </defs>
        <line x1={px} y1={py} x2={px + tx * vLen} y2={py + ty * vLen} stroke={C.info} strokeWidth="3" markerEnd="url(#arrV)" />
        <line x1={px} y1={py} x2={px + nx * aLen} y2={py + ny * aLen} stroke={C.mango} strokeWidth="3" markerEnd="url(#arrA)" />
        <text x={px + tx * (vLen + 12)} y={py + ty * (vLen + 12) + 4} fontSize="11" fontWeight="800" fill={C.info} textAnchor="middle">v</text>
        <text x={px + nx * (aLen + 12)} y={py + ny * (aLen + 12) + 4} fontSize="11" fontWeight="800" fill={C.mango} textAnchor="middle">a</text>

        {/* side panel: g meter */}
        <g transform="translate(360 40)">
          <rect x="0" y="0" width="210" height="250" rx="14" fill="#fff" stroke={C.ink100} />
          <text x="16" y="24" fontSize="10" fontWeight="700" fill={C.ink400}>SIDEWAYS ACCELERATION</text>
          <text x="16" y="56" fontSize="26" fontWeight="800" fill={C.ink}>{fmt(a, 2)} <tspan fontSize="12" fill={C.ink400}>m/s²</tspan></text>
          <rect x="16" y="76" width="178" height="14" rx="7" fill={C.ink100} />
          <rect x="16" y="76" width={Math.min(178, (a / 20) * 178)} height="14" rx="7" fill={a > 9.8 ? C.danger : C.mango} />
          <line x1={16 + (9.8 / 20) * 178} y1="70" x2={16 + (9.8 / 20) * 178} y2="96" stroke={C.danger} strokeWidth="2" />
          <text x={16 + (9.8 / 20) * 178} y="108" fontSize="9" fill={C.danger} fontWeight="700" textAnchor="middle">1 g · tyres slip</text>
          <text x="16" y="140" fontSize="11" fill={C.ink400}>Double the speed →</text>
          <text x="16" y="156" fontSize="11" fontWeight="700" fill={C.ink}>a × 4 ({fmt(((2 * v) ** 2) / r, 1)} m/s²)</text>
          <text x="16" y="184" fontSize="11" fill={C.ink400}>Double the radius →</text>
          <text x="16" y="200" fontSize="11" fontWeight="700" fill={C.ink}>a ÷ 2 ({fmt((v * v) / (2 * r), 1)} m/s²)</text>
          <text x="16" y="230" fontSize="10" fill={C.ink400}>One lap every {fmt(T, 1)} s · f = {fmt(1 / T, 3)} Hz</text>
        </g>
      </svg>
    </SimFrame>
  )
}
