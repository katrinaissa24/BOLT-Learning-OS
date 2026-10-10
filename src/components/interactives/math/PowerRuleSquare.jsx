import { useEffect, useState } from 'react'
import { Slider } from '../../ui'
import { SimFrame, Readout, ReadoutGrid, ControlCard, Segmented, C, fmt } from '../shared'

/** Grow a square (x²) or a cube (x³) by dx and watch which pieces matter. */
export default function PowerRuleSquare({ onResult }) {
  const [x, setX] = useState(2)
  const [dx, setDx] = useState(0.4)
  const [shape, setShape] = useState('square')

  const n = shape === 'square' ? 2 : 3
  const A = Math.pow(x, n), A2 = Math.pow(x + dx, n)
  const dA = A2 - A
  const ratio = dA / dx
  const exact = n * Math.pow(x, n - 1)
  const mainPieces = n * Math.pow(x, n - 1) * dx // the strips/slabs
  const corner = dA - mainPieces

  useEffect(() => { onResult?.({ x, dx, shape, ratio, exact }) }, [x, dx, shape, ratio, exact, onResult])

  // drawing: scale so x+dx max (4+1=5) fits in 220px
  const u = 220 / 5
  const ox = 60, oy = 290 // origin bottom-left
  const X = x * u, DX = dx * u
  const dep = 0.45 // isometric depth factor for cube

  return (
    <SimFrame
      title="A tile floor that grows"
      framing={shape === 'square' ? 'A square tiled courtyard of side x metres gets widened by dx on two sides. How much extra tiling do you need?' : 'A cube-shaped water tank of side x grows by dx on three faces. How much extra volume?'}
      controls={
        <>
          <ControlCard title="Controls">
            <Segmented label="Shape" value={shape} onChange={setShape} options={[{ value: 'square', label: 'Square · x²' }, { value: 'cube', label: 'Cube · x³' }]} />
            <Slider label="Side x" min={1} max={4} step={0.1} value={x} onChange={setX} unit=" m" />
            <Slider label="Growth dx" min={0.02} max={1} step={0.02} value={dx} onChange={setDx} unit=" m" />
          </ControlCard>
          <ReadoutGrid>
            <Readout label={shape === 'square' ? 'Strips 2x·dx' : 'Slabs 3x²·dx'} value={fmt(mainPieces, 3)} tone="mango" />
            <Readout label="Corner pieces" value={fmt(corner, 4)} tone="neutral" />
            <Readout label="dA ÷ dx" value={fmt(ratio, 3)} tone="info" />
            <Readout label={`Exact ${n}x${n === 3 ? '²' : ''}`} value={fmt(exact, 3)} tone="success" />
          </ReadoutGrid>
        </>
      }
      caption={shape === 'square'
        ? 'The orange strips are the two x·dx rectangles — together 2x·dx. The tiny grey corner is dx·dx. Divide everything by dx: the strips give 2x, the corner gives dx which vanishes as dx → 0. Hence d(x²)/dx = 2x.'
        : 'Three orange slabs of x²·dx each sit on three faces — that is 3x²·dx. The thin edge bars (x·dx²) and the corner cube (dx³) are the grey pieces: after dividing by dx they still contain dx and disappear. Hence d(x³)/dx = 3x².'}
    >
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {shape === 'square' ? (
          <g>
            <rect x={ox} y={oy - X} width={X} height={X} fill={C.ink100} stroke={C.ink} strokeWidth="1.5" />
            <rect x={ox + X} y={oy - X} width={DX} height={X} fill={C.mango} opacity="0.85" stroke="#fff" />
            <rect x={ox} y={oy - X - DX} width={X} height={DX} fill={C.mango} opacity="0.85" stroke="#fff" />
            <rect x={ox + X} y={oy - X - DX} width={DX} height={DX} fill={C.ink300} stroke="#fff" />
            <text x={ox + X / 2} y={oy - X / 2} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.ink}>x² = {fmt(A, 2)}</text>
            <text x={ox + X + DX + 8} y={oy - X / 2} fontSize="11" fontWeight="700" fill={C.mango}>x·dx</text>
            <text x={ox + X / 2} y={oy - X - DX - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.mango}>x·dx</text>
            <text x={ox + X + DX + 8} y={oy - X - DX / 2 + 4} fontSize="10" fontWeight="700" fill={C.ink400}>dx²</text>
            <text x={ox + X / 2} y={oy + 18} textAnchor="middle" fontSize="11" fill={C.ink400} fontWeight="600">x = {fmt(x, 1)} m</text>
            <text x={ox + X + DX / 2} y={oy + 18} textAnchor="middle" fontSize="11" fill={C.mango} fontWeight="700">dx</text>
          </g>
        ) : (
          <g transform={`translate(${ox + 20} 0)`}>
            {/* cube: front face, top face, right face in simple oblique projection */}
            {(() => {
              const d = X * dep, dd = DX * dep
              const F = { x: 0, y: oy } // front bottom-left
              const poly = (pts, fill, op = 1, stroke = '#fff') => <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} opacity={op} stroke={stroke} strokeWidth="1" />
              return (
                <>
                  {/* main cube */}
                  {poly([[F.x, F.y], [F.x + X, F.y], [F.x + X, F.y - X], [F.x, F.y - X]], C.ink100, 1, C.ink)}
                  {poly([[F.x, F.y - X], [F.x + X, F.y - X], [F.x + X + d, F.y - X - d], [F.x + d, F.y - X - d]], C.ink50, 1, C.ink)}
                  {poly([[F.x + X, F.y], [F.x + X + d, F.y - d], [F.x + X + d, F.y - X - d], [F.x + X, F.y - X]], C.ink200, 1, C.ink)}
                  {/* slab on right face */}
                  {poly([[F.x + X, F.y], [F.x + X + DX, F.y], [F.x + X + DX, F.y - X], [F.x + X, F.y - X]], C.mango, 0.9)}
                  {poly([[F.x + X + DX, F.y], [F.x + X + DX + d, F.y - d], [F.x + X + DX + d, F.y - X - d], [F.x + X + DX, F.y - X]], C.mango, 0.7)}
                  {/* slab on top face */}
                  {poly([[F.x, F.y - X], [F.x + X, F.y - X], [F.x + X, F.y - X - DX], [F.x, F.y - X - DX]], C.mango, 0.9)}
                  {poly([[F.x, F.y - X - DX], [F.x + X, F.y - X - DX], [F.x + X + d, F.y - X - DX - d], [F.x + d, F.y - X - DX - d]], C.mango, 0.75)}
                  {/* slab on back (depth) face, drawn as the extended top/right strip */}
                  {poly([[F.x + d, F.y - X - d], [F.x + X + d, F.y - X - d], [F.x + X + d + dd, F.y - X - d - dd], [F.x + d + dd, F.y - X - d - dd]], C.mango, 0.6)}
                  {poly([[F.x + X + d, F.y - d], [F.x + X + d + dd, F.y - d - dd], [F.x + X + d + dd, F.y - X - d - dd], [F.x + X + d, F.y - X - d]], C.mango, 0.6)}
                  {/* edge bars + corner */}
                  {poly([[F.x + X, F.y - X], [F.x + X + DX, F.y - X], [F.x + X + DX, F.y - X - DX], [F.x + X, F.y - X - DX]], C.ink300)}
                  {poly([[F.x + X, F.y - X - DX], [F.x + X + DX, F.y - X - DX], [F.x + X + DX + d, F.y - X - DX - d], [F.x + X + d, F.y - X - DX - d]], C.ink300)}
                  {poly([[F.x + X + DX, F.y - X], [F.x + X + DX + d, F.y - X - d], [F.x + X + DX + d, F.y - X - DX - d], [F.x + X + DX, F.y - X - DX]], C.ink400)}
                  <text x={F.x + X / 2} y={F.y - X / 2} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.ink}>x³ = {fmt(A, 2)}</text>
                  <text x={F.x + X + DX + d + 10} y={F.y - X / 2} fontSize="11" fontWeight="700" fill={C.mango}>x²·dx</text>
                  <text x={F.x + X / 2} y={F.y - X - DX - d - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.mango}>x²·dx</text>
                  <text x={F.x + X / 2} y={F.y + 18} textAnchor="middle" fontSize="11" fill={C.ink400} fontWeight="600">x = {fmt(x, 1)} m</text>
                </>
              )
            })()}
          </g>
        )}
        {/* formula panel */}
        <g transform="translate(380 40)" fontFamily="Montserrat, sans-serif">
          <rect x="0" y="0" width="200" height="110" rx="14" fill="#fff" stroke={C.ink100} />
          <text x="14" y="26" fontSize="11" fill={C.ink400} fontWeight="700">CHANGE IN {shape === 'square' ? 'AREA' : 'VOLUME'}</text>
          <text x="14" y="52" fontSize="13" fill={C.ink} fontWeight="700">d{shape === 'square' ? 'A' : 'V'} = {fmt(dA, 4)}</text>
          <text x="14" y="74" fontSize="13" fill={C.mango} fontWeight="700">{n}x{n === 3 ? '²' : ''}·dx = {fmt(mainPieces, 4)}</text>
          <text x="14" y="96" fontSize="12" fill={C.ink400} fontWeight="600">leftovers = {fmt(corner, 4)} → 0</text>
        </g>
      </svg>
    </SimFrame>
  )
}
