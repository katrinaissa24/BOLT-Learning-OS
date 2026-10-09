# BOLT builder brief (read fully before writing code)

BOLT = "Boring Old Learning, Transformed": a learning OS prototype for ONE school (Cedar Ridge International School, Grade 12) for the "School of 2036" hackathon. Judged 40% on technical quality/functionality and polish, 20% innovation. It must look perfect and never error. Keep code simple (plain React + JS, no TypeScript).

## Stack & conventions
- Vite + React 19 + react-router-dom 7 + Tailwind v4 (tokens in `src/styles/index.css`) + lucide-react icons + framer-motion (available) + recharts (available).
- Fonts: Montserrat (body), Caveat via `font-hand` class (handwritten accent, use sparingly: eyebrows, labels).
- Colors: Mango `text-mango bg-mango` (#FF9900) with tints `mango-50/100/200/300/600/700`; Charcoal `charcoal` (#353B48) with `charcoal-50…900`; `cloud` page bg; semantic `success/warning/danger/info` + `-soft` variants. Never introduce other brand colors except course colors from `course.color`.
- UI kit: `import { Button, Card, Pill, StatusPill, SuggestedTag, SectionHeader, PageTitle, StatTile, ProgressBar, ScoreBar, Avatar, Modal, EmptyState, Spinner, Input, Textarea, Slider, Tabs, SkillChip, Callout, Logo } from '../../components/ui'`. Use them. `.card` class = white rounded card. Headings: `font-extrabold tracking-tight`. Eyebrow: `<div className="font-hand text-mango text-2xl">…</div>`.
- Pages live under `src/pages/{student|teacher|parent}/`. Each page default-exports a component and renders inside `AppShell` (sidebar + topbar already exist). Use `<PageTitle eyebrow title subtitle action/>` at the top.
- Features that are YOUR OWN proposals (not requested by the user) MUST show `<SuggestedTag />` next to their title and may use fake data. Keep a list of them for your final report.
- Icons: lucide-react only.
- Must be responsive-ish (works at 1280px wide; doesn't break at 768px).
- No console errors, no uncaught promise rejections. Every AI call must have a fallback (see AI).

## Data access
- `const { db, awardPoints, upsertLessonProgress, addChatMessage, addSubmission, updateSubmission, awardBadge, addProject, updateProject, updateAttendance, savePracticeSet, insert, update } = useData()` from `src/lib/data.jsx`. `db` holds arrays: `profiles, courses, lessons, badges, enrollments, lessonProgress, pointEvents, monthlyAwards, studentBadges, schedule, attendance, submissions, chatMessages, projects, practiceSets`. Column names are snake_case (student_id, course_id, lesson_id, youtube_id, topic_scores, …). Read `src/data/seed.js` for exact shapes. DO NOT edit seed.js (ask in your report if you need a shape change). You may add new data files under `src/data/` for your feature content.
- `const { profile } = useAuth()` from `src/lib/auth.jsx` → current user's profile row (`id, full_name, role, child_id, …`). Students have `profile.id` = student_id.
- Selectors in `src/lib/selectors.js` (pure functions over db): `studentCourseSummary(db, studentId, courseId)`, `studentOverview`, `leaderboard(db, courseId, month)`, `studentBadges`, `attendanceSummary`, `lessonInsights(db, lessonId)`, `classOverview(db, courseId)`, `recognitionPatterns(db)`, `parentLens(db, childId)`, plus `courseLessons, studentsOf, profileById, lessonById, courseById, badgeById, progressFor`, constants `CURRENT_MONTH='2026-10'`, `LAST_MONTH='2026-09'`, `TODAY`, `EXPECTED_COMPLETED=5`. Demo "today" is 2026-10-09. Use these instead of recomputing. You may ADD selectors to this file (append only; don't change existing signatures).
- Utils in `src/lib/utils.js`: `cx, fmtTime, initials, pct, clamp, monthKey, monthLabel, uid, avg, fmtDate`.

## AI
- `import { ask, askJSON, aiEnabled } from '../../lib/ai'`. `await ask({ system, messages:[{role:'user',content}], fallback })` returns text; `askJSON({... fallback})` returns parsed JSON or fallback. Without an API key the fallback is returned (after no delay) — so every AI feature must ship with a GOOD, content-specific fallback that makes the demo convincing (write real demo content, not "lorem"). Simulate a short "thinking" delay (400–900ms) in the UI when `!aiEnabled` so it feels alive.

## Points, badges
- Award points with `awardPoints(studentId, courseId, points, reason)`. Lessons: 100 + score/2. Lab activities: 30–80. Badges via `awardBadge(studentId, badgeId, evidence)` (ids in seed `badges`).

## Ownership
Only edit the files assigned to you. Shared files (App.jsx, AppShell.jsx, ui/index.jsx, seed.js, selectors.js except appends, styles) are owned by the lead. Routes already exist in App.jsx; your page files are already imported there, replace the placeholder content.

## Quality bar
Before finishing: run `npx vite build` (must pass) and open your pages in the browser via Playwright (`node` script using `/opt/pw-browsers/chromium` or `npx playwright` is NOT installed — use `const { chromium } = require('playwright')` if available, else just build). Make the pages beautiful: generous spacing, clear hierarchy, consistent cards, no raw JSON, no placeholder text, and sample numbers that look real.
