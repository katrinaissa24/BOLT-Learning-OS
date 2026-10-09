import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import { Slider, Button } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, C, fmt, useAnimationFrame } from '../shared'

// Real numbers, shown to the student; the simulation runs in normalised units (GM = 1, r0 = 1).
const R_EARTH = 6371, ALT = 400, R0 = R_EARTH + ALT // km
const V_CIRC = 7.67 // km/s at 400 km
const V_ESC = V_CIRC * Math.SQRT2

/** Launch a satellite sideways at 400 km: too slow it falls back, too fast it escapes, just right it orbits. */
export default function OrbitSim({ onResult }) {
  const [speed, setSpeed] = useState(6.5)
  const [running, setRunning] = useState(false)
  const body = useRef({ x: 1, y: 0, vx: 0, vy: 1, t: 0 })
  const trail = useRef([])
  const [status, setStatus] = useState('ready') // ready | orbiting | elliptical | crashed | escaped
  const [, force] = useState(0)

  const reset = () => { body.current = { x: 1, y: 0, vx: 0, vy: speed / V_CIRC, t: 0 }; trail.current = []; setStatus('ready'); setRunning(false); force((n) => n + 1) }
  useEffect(() => { reset() }, [speed]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onResult?.({ speed, status }) }, [speed, status, onResult])

  useAnimationFrame((dt) => {
    const b = body.current
    const steps = 20, h = (dt * 1.4) / steps
    for (let i = 0; i < steps; i++) {
      const r = Math.hypot(b.x, b.y), r3 = r * r * r
      b.vx += (-b.x / r3) * h; b.vy += (-b.y / r3) * h
      b.x += b.vx * h; b.y += b.vy * h; b.t += h
    }
    trail.current.push([b.x, b.y]); if (trail.current.length > 900) trail.current.shift()
    const r = Math.hypot(b.x, b.y)
    if (r < R_EARTH / R0) { setStatus('crashed'); setRunning(false) }
    else if (r > 7) { setStatus('escaped'); setRunning(false) }
    else setStatus(Math.abs(speed - V_CIRC) <= 0.25 ? 'orbiting' : 'elliptical')
    force((n) => n + 1)
  }, running)

  const cx = 300, cy = 165, k = 48 // px per r0
  const b = body.current
  const tone = { ready: 'neutral', orbiting: 'success', elliptical: 'info', crashed: 'danger', escaped: 'danger' }[status]
  const label = { ready: 'Ready to launch', orbiting: 'Stable circular orbit', elliptical: 'Elliptical orbit', crashed: 'Fell back to Earth', escaped: 'Escaped Earth’s gravity' }[status]

  return (
    <SimFrame
      title="Launching a cubesat from 400 km"
      framing="A Lebanese university cubesat is released sideways from a rocket 400 km up (ISS height). The only choice left is its speed. Gravity does the rest."
      controls={
        <>
          <ControlCard title="Controls">
            <Slider label="Sideways speed" min={3} max={11.5} step={0.05} value={speed} onChange={setSpeed} unit=" km/s" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (status === 'crashed' || status === 'escaped') reset(); setRunning(true) }} disabled={running}><Play size={14} /> Launch</Button>
              <Button size="sm" variant="secondary" onClick={reset}><RotateCcw size={14} /> Reset</Button>
            </div>
          </ControlCard>
          <ReadoutGrid>
            <Readout label="Status" value={label} tone={tone} className="col-span-2 [&>div:last-child]:text-sm" />
            <Readout label="Altitude" value={fmt(Math.hypot(b.x, b.y) * R0 - R_EARTH, 0)} unit="km" />
            <Readout label="Current speed" value={fmt(Math.hypot(b.vx, b.vy) * V_CIRC, 2)} unit="km/s" tone="info" />
          </ReadoutGrid>
        </>
      }
      caption={`Gravity always pulls toward Earth’s centre with F = GMm/r². Below ${fmt(V_CIRC, 2)} km/s the satellite curves down faster than the ground curves away and hits the surface; at exactly that speed it “falls” around the Earth forever — a circle. Faster gives an ellipse, and above the escape speed ${fmt(V_ESC, 2)} km/s it never comes back.`}
    >
      <svg viewBox="0 0 600 330" className="w-full h-auto">
        <rect x="0" y="0" width="600" height="330" rx="12" fill={C.ink} />
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 137) % 600} cy={(i * 71) % 330} r={i % 3 ? 0.8 : 1.4} fill="#fff" opacity="0.5" />)}
        {/* target circular orbit */}
        <circle cx={cx} cy={cy} r={k} fill="none" stroke={C.success} strokeDasharray="3 5" opacity="0.6" />
        {/* earth */}
        <circle cx={cx} cy={cy} r={(R_EARTH / R0) * k} fill={C.info} />
        <path d={`M${cx - 20} ${cy - 10} q10 -12 22 -4 q8 10 -4 16 q-14 4 -18 -12z`} fill={C.success} opacity="0.8" />
        {/* trail */}
        {trail.current.length > 1 && <path d={trail.current.map(([x, y], i) => `${i ? 'L' : 'M'}${cx + x * k} ${cy - y * k}`).join(' ')} fill="none" stroke={C.mango} strokeWidth="1.5" opacity="0.8" />}
        {/* satellite */}
        <g transform={`translate(${cx + b.x * k} ${cy - b.y * k})`}>
          <rect x="-4" y="-4" width="8" height="8" fill="#fff" />
          <rect x="-14" y="-2" width="8" height="4" fill={C.mango} /><rect x="6" y="-2" width="8" height="4" fill={C.mango} />
        </g>
        <text x="16" y="24" fontSize="11" fontWeight="700" fill="#fff" opacity="0.9">launch speed {fmt(speed, 2)} km/s · circular {fmt(V_CIRC, 2)} · escape {fmt(V_ESC, 2)}</text>
        <text x="16" y="312" fontSize="10" fill="#fff" opacity="0.6">time in orbit: {fmt((b.t * 1.0) / (2 * Math.PI) * 92.6, 0)} min · 1 circular lap ≈ 92.6 min</text>
      </svg>
    </SimFrame>
  )
}
