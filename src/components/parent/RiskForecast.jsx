import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { Card } from '../ui'
import { riskForecast } from './lens'

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-charcoal text-white text-xs px-3 py-2 shadow-xl">
      <div className="font-bold mb-1">{label}</div>
      {payload.map((p) => <div key={p.dataKey} className="flex justify-between gap-4"><span className="text-white/70">{p.name}</span><span className="font-bold tabular-nums">{p.value}</span></div>)}
    </div>
  )
}

export default function RiskForecast({ course, readiness }) {
  const examWeek = Math.min(6, Math.max(1, Math.round((new Date(course.exam_date) - new Date('2026-10-09')) / (7 * 86400000))))
  const data = riskForecast(readiness).map((r, i) => ({ ...r, week: i === examWeek ? 'Exam' : r.week }))
  const last = data[data.length - 1]
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: course.color }}>{course.subject}</div>
          <h3 className="font-extrabold text-charcoal leading-tight">Readiness over the next 6 weeks</h3>
        </div>
        <div className="text-right text-xs text-charcoal-400">now <span className="font-extrabold text-charcoal text-base tabular-nums">{readiness}</span></div>
      </div>
      <div className="h-52 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E6E8EC" />
            <XAxis dataKey="week" interval={0} tick={(p) => <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize={11} fontWeight={p.payload.value === 'Exam' ? 800 : 500} fill={p.payload.value === 'Exam' ? course.color : '#6C717B'}>{p.payload.value}</text>} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: '#6C717B' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<Tip />} cursor={{ stroke: '#C9CBD0' }} />
            <ReferenceLine y={70} stroke="#9EA1A8" strokeDasharray="2 4" />
            <Line type="monotone" dataKey="practice" name="With 2 practice sessions / week" stroke="#E58900" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} label={(p) => p.index === data.length - 1 ? <text x={p.x + 6} y={p.y + 4} fontSize={11} fontWeight={700} fill="#353B48">{last.practice}</text> : null} />
            <Line type="monotone" dataKey="nothing" name="If nothing changes" stroke="#353B48" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} label={(p) => p.index === data.length - 1 ? <text x={p.x + 6} y={p.y + 4} fontSize={11} fontWeight={700} fill="#353B48">{last.nothing}</text> : null} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 11, color: '#4B5160' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-charcoal-400 mt-2 leading-relaxed">Simple model: +4 points a week with two practice sessions, −1 a week without (skills fade). The dotted gray line at 70 is “pass with margin”. The gap by the exam is <span className="font-bold text-charcoal">{last.practice - last.nothing} points</span>.</p>
    </Card>
  )
}
