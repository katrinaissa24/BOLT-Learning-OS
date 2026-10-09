import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Trophy, Stamp, Zap, CalendarClock, Sigma, Feather, Atom, Medal } from 'lucide-react'
import { PageTitle, Card, Tabs, Avatar, Pill, Callout, StatusPill } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useData } from '../../lib/data'
import { leaderboard, studentBadges, profileById, courseById, CURRENT_MONTH, LAST_MONTH, TODAY } from '../../lib/selectors'
import { cx } from '../../lib/utils'

const COURSE_ICONS = { sigma: Sigma, feather: Feather, atom: Atom }
const PERIODS = [{ value: CURRENT_MONTH, label: 'This month' }, { value: LAST_MONTH, label: 'Last month' }, { value: 'all', label: 'All time' }]
const PODIUM_ORDER = [1, 0, 2] // silver, gold, bronze layout
const PODIUM_STYLE = { 0: { h: 'h-28', bg: 'bg-mango', ring: 'ring-mango', label: '1st', crown: '#FF9900' }, 1: { h: 'h-20', bg: 'bg-charcoal-200', ring: 'ring-charcoal-200', label: '2nd', crown: '#9EA1A8' }, 2: { h: 'h-14', bg: 'bg-mango-200', ring: 'ring-mango-200', label: '3rd', crown: '#C27400' } }

export default function Leaderboard() {
  const { profile } = useAuth()
  const { db } = useData()
  const [courseId, setCourseId] = useState(db.courses[0].id)
  const [period, setPeriod] = useState(CURRENT_MONTH)
  const course = courseById(db, courseId)
  const rows = leaderboard(db, courseId, period === 'all' ? null : period)
  const me = rows.find((r) => r.student.id === profile.id)
  const daysLeft = Math.round((new Date('2026-10-31T12:00:00Z') - TODAY) / 86400000)
  const lastPodium = db.monthlyAwards.filter((a) => a.course_id === courseId && a.month === LAST_MONTH).sort((a, b) => a.rank - b.rank).map((a) => ({ ...a, student: profileById(db, a.student_id) }))
  const badgeCount = (id) => studentBadges(db, id).length
  const top3 = rows.slice(0, 3)

  return (
    <div>
      <PageTitle eyebrow="friendly competition" title="Leaderboard" subtitle="Points come from checkpoints, practice branches and Thinking Lab wins. The top 3 of each course at the end of the month get a Monthly Podium stamp in their passport." />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Tabs value={courseId} onChange={setCourseId} tabs={db.courses.map((c) => ({ value: c.id, label: c.subject, icon: COURSE_ICONS[c.icon] }))} />
        <Tabs value={period} onChange={setPeriod} tabs={PERIODS} />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Podium */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bolt-pattern opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-hand text-mango text-xl leading-none mb-1">{period === 'all' ? 'all time' : period === CURRENT_MONTH ? 'october so far' : 'september · final'}</div>
                  <h3 className="text-lg font-extrabold text-charcoal">{course.title}</h3>
                </div>
                {period === CURRENT_MONTH && <Pill tone="mango" icon={CalendarClock} className="normal-case tracking-normal text-xs">{daysLeft} days left to climb</Pill>}
              </div>
              <div className="grid grid-cols-3 gap-3 items-end mt-6 max-w-xl mx-auto">
                {PODIUM_ORDER.map((pos) => {
                  const r = top3[pos]
                  if (!r) return <div key={pos} />
                  const st = PODIUM_STYLE[pos]
                  const isMe = r.student.id === profile.id
                  return (
                    <motion.div key={r.student.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pos * 0.12 }} className="flex flex-col items-center">
                      <Crown size={pos === 0 ? 30 : 22} style={{ color: st.crown }} fill={st.crown} className="mb-1" />
                      <Avatar name={r.student.full_name} size={pos === 0 ? 'xl' : 'lg'} className={cx('ring-4 ring-offset-2', st.ring, isMe && 'ring-offset-mango-50')} />
                      <div className="mt-2 text-sm font-bold text-charcoal text-center leading-tight">{r.student.full_name.split(' ')[0]}{isMe && <span className="text-mango"> (you)</span>}</div>
                      <div className="text-xs text-charcoal-400">{r.points.toLocaleString()} pts</div>
                      <div className={cx('w-full rounded-t-2xl mt-3 flex items-start justify-center pt-2 text-white font-extrabold', st.h, st.bg)}>{st.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Full list */}
          <Card padded={false}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-charcoal">Full ranking · {rows.length} students</h3>
              {me && <Pill tone="mango">You are #{me.rank}</Pill>}
            </div>
            <div className="divide-y divide-charcoal-100">
              {rows.map((r) => {
                const isMe = r.student.id === profile.id
                const stamps = badgeCount(r.student.id)
                return (
                  <div key={r.student.id} className={cx('flex items-center gap-4 px-5 py-3', isMe && 'bg-mango-50/70')}>
                    <div className={cx('w-8 text-center font-extrabold', r.rank <= 3 ? 'text-mango' : 'text-charcoal-400')}>{r.rank <= 3 ? <Medal size={18} className="inline" /> : r.rank}</div>
                    <Avatar name={r.student.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal truncate">{r.student.full_name}{isMe && <span className="ml-2 text-xs font-bold text-mango">YOU</span>}</div>
                      <div className="text-xs text-charcoal-400">{r.student.title}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-charcoal-400"><Stamp size={13} /> {stamps} stamp{stamps === 1 ? '' : 's'}</div>
                    <div className="w-24 text-right font-extrabold text-charcoal flex items-center justify-end gap-1"><Zap size={14} className="text-mango" /> {r.points.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Callout tone="mango" icon={Trophy} title="How the podium works">
            Top 3 at the end of the month get a <strong>Monthly Podium</strong> stamp in their passport. Points reset each month so everyone starts level — all-time totals still count for the Mastery stamps.
          </Callout>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-hand text-mango text-xl leading-none mb-1">already stamped</div>
                <h3 className="font-extrabold text-charcoal">September podium</h3>
              </div>
              <Stamp size={18} className="text-charcoal-300" />
            </div>
            <div className="space-y-3">
              {lastPodium.map((a) => {
                const isMe = a.student_id === profile.id
                return (
                  <div key={a.id} className={cx('flex items-center gap-3 rounded-2xl p-3 border', isMe ? 'border-mango bg-mango-50' : 'border-charcoal-100')}>
                    <div className="relative">
                      <Avatar name={a.student.full_name} size="md" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-dashed border-mango bg-white text-mango flex items-center justify-center rotate-12 text-[10px] font-extrabold">{a.rank}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-charcoal text-sm truncate">{a.student.full_name}{isMe && ' (you)'}</div>
                      <div className="text-[11px] text-charcoal-400">Monthly Podium · {a.rank === 1 ? '1st' : a.rank === 2 ? '2nd' : '3rd'} · Sep 2026</div>
                    </div>
                    <StatusPill status="validated" />
                  </div>
                )
              })}
            </div>
          </Card>

          {me && (
            <div className="rounded-3xl bg-charcoal text-white bolt-pattern-dark p-5 shadow-soft">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Your position · {course.subject}</div>
              <div className="text-3xl font-extrabold mt-1">#{me.rank} <span className="text-base font-semibold text-white/60">of {rows.length}</span></div>
              <div className="text-sm text-white/80 mt-1">{me.rank <= 3 ? 'On the podium — hold it until the 31st.' : `${(rows[2].points - me.points + 1).toLocaleString()} points behind 3rd place. One checkpoint is worth ~140, a lab win 30–80.`}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
