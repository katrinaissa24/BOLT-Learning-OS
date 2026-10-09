import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Tabs, SectionHeader, Pill } from '../ui'
import { classOverview, courseById } from '../../lib/selectors'
import { LegendRow, BRAND } from './charts'
import { cx } from '../../lib/utils'

const cellCls = (avg) => (avg >= 80 ? 'bg-success text-white' : avg >= 70 ? 'bg-success-soft text-success' : avg >= 60 ? 'bg-mango-50 text-mango-700' : avg >= 50 ? 'bg-mango text-white' : 'bg-danger text-white')

/** Class-wide topic heatmap: every assessed topic of a course colored by class average. */
export default function TopicHeatmap({ db, defaultCourse = 'math-12' }) {
  const [courseId, setCourseId] = useState(defaultCourse)
  const ov = classOverview(db, courseId)
  const course = courseById(db, courseId)
  const needs = ov.topics.filter((t) => t.struggling >= 3 || t.avg < 60)
  return (
    <Card>
      <SectionHeader squiggle={false} eyebrow="class radar" title="Topic heatmap" subtitle="Every assessed topic colored by the class average. Red cells with several struggling students are where a re-teach pays off most." className="mb-4"
        action={<Tabs tabs={db.courses.map((c) => ({ value: c.id, label: c.subject }))} value={courseId} onChange={setCourseId} />} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ov.topics.map((t) => (
          <Link key={t.id} to={`/teacher/insights/${t.lessonId}`} className={cx('rounded-2xl px-3.5 py-3 transition-transform hover:-translate-y-0.5', cellCls(t.avg))} title={`${t.lessonTitle} · ${t.n} results`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold truncate">{t.name}</span>
              <span className="text-lg font-extrabold">{t.avg}%</span>
            </div>
            <div className="text-[11px] opacity-80 mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate">{t.lessonTitle}</span>
              <span className="shrink-0 font-semibold">{t.struggling ? `${t.struggling} struggling` : `${t.n} result${t.n === 1 ? '' : 's'}`}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <LegendRow items={[{ label: '≥ 80', color: BRAND.success }, { label: '70–79', color: '#E3F5EB' }, { label: '60–69', color: '#FFF4E5' }, { label: '50–59', color: BRAND.mango }, { label: '< 50', color: BRAND.danger }]} />
        {needs.length > 0 && <Pill tone="danger">{needs.length} topics need attention in {course.subject}</Pill>}
      </div>
    </Card>
  )
}
