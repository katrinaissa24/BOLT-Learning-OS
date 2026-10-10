import { useEffect, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, useAnimationFrame } from '../shared'

const G = 9.8

/** Push a supermarket cart: mass, applied force and friction, with a live free-body diagram. */
export default function ForceCart({ onResult }) {
  const [m, setM] = useState(20)
  const [F, setF] = useState(40)
  const [mu, setMu] = useState(0.1)
  const [x, setX] = useState(0)

  const weight = m * G
  const frictionMax = mu * weight
  const moving = F > frictionMax
  const friction = moving ? frictionMax : F // static friction matches the push
  const net = moving ? F - frictionMax : 0
  const a = net / m

  useEffect(() => { onResult?.({ F, m, mu, a }) }, [F, m, mu, a, onResult])
  useAnimationFrame((dt) => { setX((p) => (p + a * 18 * dt) % 320) }, a > 0)
  useEffect(() => { if (a === 0) setX(0) }, [a])

  const arrow = (x1, y1, x2, y2, color, label, above = true) => {
    if (Math.hypot(x2 - x1, y2 - y1) < 1) return null
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
    const vertical = Math.abs(x2 - x1) < 1
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="4" strokeLinecap="round" />
        <polygon points="0,0 -10,-6 -10,6" fill={color} transform={`translate(${x2} ${y2}) rotate(${ang})`} />
        <text x={vertical ? mx + 10 : mx} y={vertical ? y2 + (y2 > y1 ? 14 : -6) : above ? my - 10 : my + 18} fontSize="11" fontWeight="700" fill={color} textAnchor={vertical ? 'start' : 'middle'}>{label}</text>
      </g>
    )
  }
  const k = 1.2 // px per newton for horizontal arrows
  const kv = 0.5 // px per newton for vertical
  const cartX = 120 + x, cartY = 200

  return (
    <SimFrame
      title="Pushing a loaded cart at Spinneys"
      framing="A shopping cart on a flat floor. You push it; the floor pushes back with friction. Newton’s second law decides whether it moves and how fast it speeds up."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Cart mass m" min={5} max={50} step={1} value={m} onChange={setM} unit=" kg" />
            <Slider label="Applied force F" min={0} max={200} step={0.5} value={F} onChange={setF} unit=" N" />
            <Slider label="Friction coefficient μ" min={0} max={0.5} step={0.01} value={mu} onChange={setMu} />
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Friction" value={fmt(friction, 1)} unit="N" tone="danger" />
            <Readout label="Net force" value={fmt(net, 1)} unit="N" tone="info" />
            <Readout label="Acceleration" value={fmt(a, 2)} unit="m/s²" tone={Math.abs(a - 2) <= 0.1 ? 'success' : 'mango'} className="col-span-2" />
          </ReadoutGrid>
        </>
      }
      caption="The free-body diagram shows every force on the cart: weight down, the floor’s normal force up (they cancel), your push forward and friction backward. Only the unbalanced horizontal part matters: a = (F − μmg) / m. If your push is smaller than the maximum friction μmg, static friction simply matches it and nothing moves."
    >
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        <rect x="0" y="250" width="600" height="70" fill={C.ink100} />
        <line x1="0" y1="250" x2="600" y2="250" stroke={C.ink300} />
        {/* cart */}
        <g transform={`translate(${cartX} ${cartY})`}>
          <path d="M0 0 H90 L84 36 H8 Z" fill={C.ink} />
          <path d="M8 6 H82 M12 16 H78 M15 26 H74" stroke={C.ink300} strokeWidth="1.5" />
          <rect x="90" y="-18" width="6" height="22" rx="2" fill={C.ink} />
          <circle cx="18" cy="44" r="6" fill="#fff" stroke={C.ink} strokeWidth="2" /><circle cx="74" cy="44" r="6" fill="#fff" stroke={C.ink} strokeWidth="2" />
          {Array.from({ length: Math.min(6, Math.ceil(m / 9)) }, (_, i) => <rect key={i} x={8 + (i % 3) * 26} y={-20 + Math.floor(i / 3) * -14} width="22" height="12" rx="2" fill={C.mango} />)}
        </g>
        {/* forces */}
        {arrow(cartX + 45, cartY + 18, cartX + 45, cartY + 18 + weight * kv, C.ink400, `W = mg = ${fmt(weight, 0)} N`, false)}
        {arrow(cartX + 45, cartY + 18, cartX + 45, cartY + 18 - weight * kv, C.success, `N = ${fmt(weight, 0)} N`)}
        {arrow(cartX - 4, cartY + 18, cartX - 4 - friction * k, cartY + 18, C.danger, `f = ${fmt(friction, 1)} N`)}
        {arrow(cartX + 96, cartY + 18, cartX + 96 + F * k, cartY + 18, C.mango, `F = ${fmt(F, 1)} N`)}
        <text x="300" y="36" fontSize="14" fontWeight="800" fill={C.ink} textAnchor="middle">{moving ? `Moving · a = ${fmt(a, 2)} m/s²` : 'Not moving — static friction holds it'}</text>
        <text x="300" y="56" fontSize="11" fill={C.ink400} textAnchor="middle">ΣF = F − f = {fmt(F, 1)} − {fmt(friction, 1)} = {fmt(net, 1)} N → a = ΣF / m</text>
      </svg>
    </SimFrame>
  )
}
