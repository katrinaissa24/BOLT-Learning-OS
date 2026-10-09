import { useEffect, useMemo, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt, scale, Axes, pathFrom } from '../shared'

const f = (x) => (x === 0 ? NaN : Math.sin(x) / x)
const SEQ = [1, 0.5, 0.1, 0.01, 0.001, 0.0001]

/** Approach x = 0 on sin(x)/x — the gap in the graph and the number the outputs promise. */
export default function LimitExplorer({ onResult }) {
  const [k, setK] = useState(0) // closeness exponent: x = ±10^(-k/2)… we use a log-ish scale
  const [side, setSide] = useState('right')
  const x = (side === 'right' ? 1 : -1) * Math.pow(10, -k / 25) * 3 // k 0..100 → |x| from 3 down to 0.0003
  const y = f(x)

  useEffect(() => { onResult?.({ x, y }) }, [x, y, onResult])

  const x0 = 50, x1 = 580, y0 = 220, y1 = 30
  const sx = scale(-10, 10, x0, x1)
  const sy = scale(-0.4, 1.2, y0, y1)
  const curve = useMemo(() => pathFrom(Array.from({ length: 401 }, (_, i) => { const xx = -10 + (i / 400) * 20; return [sx(xx), sy(xx === 0 ? 1 : f(xx))] })), []) // eslint-disable-line react-hooks/exhaustive-deps

  const rows = SEQ.map((d) => ({ d, left: f(-d), right: f(d) }))

  return (
    <SimFrame
      title="A sensor that cannot read zero"
      framing="A phone’s rotation sensor reports sin(x)/x for tiny angles x — but at exactly x = 0 the formula is 0/0. What value does it “want” to give?"
      controls={
        <>
          <ControlCard title="Controls">
            <Segmented label="Approach from" value={side} onChange={setSide} options={[{ value: 'left', label: 'the left (x < 0)' }, { value: 'right', label: 'the right (x > 0)' }]} />
            <Slider label="Closeness to 0" min={0} max={100} value={k} onChange={setK} format={(v) => `${v}%`} />
          </ControlCard>
          <ReadoutGrid>
            <Readout label="x" value={Math.abs(x) < 0.01 ? x.toExponential(2) : fmt(x, 4)} tone="neutral" />
            <Readout label="sin(x) / x" value={fmt(y, 6)} tone={Math.abs(y - 1) < 0.001 ? 'success' : 'mango'} />
          </ReadoutGrid>
        </>
      }
      caption="The curve has a hole at x = 0 (the hollow dot) because 0/0 is undefined. Yet the orange point, sliding in from either side, lands on the same height. The limit is that promised value — not the value at the point. The table shows both sides agreeing to more and more decimals: that is the epsilon–delta promise in numbers."
    >
      <svg viewBox="0 0 600 240" className="w-full h-auto">
        <Axes x0={x0} y0={sy(0)} x1={x1} y1={y1} sx={sx} sy={sy} xTicks={[-10, -5, 5, 10]} yTicks={[0.5, 1]} xLabel="x" yLabel="sin(x)/x" />
        <line x1={x0} y1={sy(1)} x2={x1} y2={sy(1)} stroke={C.success} strokeDasharray="4 4" />
        <text x={x1 - 4} y={sy(1) - 6} textAnchor="end" fontSize="10" fill={C.success} fontWeight="700">y = 1</text>
        <path d={curve} fill="none" stroke={C.ink} strokeWidth="2.5" />
        <circle cx={sx(0)} cy={sy(1)} r="6" fill="#fff" stroke={C.ink} strokeWidth="2.5" />
        <circle cx={sx(x)} cy={sy(y)} r="8" fill={C.mango} stroke="#fff" strokeWidth="3" />
        <line x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(0)} stroke={C.mango} strokeDasharray="3 3" />
      </svg>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-charcoal-400 uppercase tracking-wide text-[10px]"><th className="text-left py-1.5 px-2 font-semibold">distance from 0</th><th className="text-right py-1.5 px-2 font-semibold">from the left</th><th className="text-right py-1.5 px-2 font-semibold">from the right</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.d} className={`border-t border-charcoal-100 ${Math.abs(x) <= r.d * 1.0001 && Math.abs(x) > r.d / 10 ? 'bg-mango-50' : 'bg-white'}`}>
                <td className="py-1.5 px-2 font-semibold tabular-nums">{r.d}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{fmt(r.left, 7)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{fmt(r.right, 7)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimFrame>
  )
}
