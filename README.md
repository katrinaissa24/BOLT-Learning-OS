# BOLT · Boring Old Learning, Transformed

A learning operating system prototype for one school (Grade 12), built for the **School of 2036** hackathon (Experia · SmartESA · 42 Beirut).

Three account types — **Student**, **Teacher**, **Parent** — see the same learning through three lenses:

- Students follow a **journey** per course (landscape map, 7 checkpoints, AI extra-practice branches), watch lessons with a **tutor that knows the video and the timestamp**, play with **interactive simulations**, write essays in an editor that records the **thinking process**, compete on a **leaderboard**, collect **passport stamps**, and train in the **Thinking Lab** (Explain Back, Teach the Bot, Spot the Flaw, Evidence Detective, Decision Simulator, Debate Arena).
- Teachers get a **progress tracker** (behind / on track / ahead / at risk), **lesson insights** (stuck points, common questions, patterns), **process replay** of essays, **one-click tailored extra practice**, and **recognition patterns** (who needs encouragement, who needs recognition).
- Parents get the **Parent Lens**: what my child understands, what’s next, and when to intervene — before the exam.

## Run it

```bash
npm install
cp .env.example .env     # add Supabase keys (optional) and an Anthropic key (optional)
npm run dev              # http://localhost:5173
```

Without Supabase keys the app runs in **local demo mode** (everything works, data lives in the browser). Without an Anthropic key every AI feature uses built-in demo responses.

## Supabase

Run the files in the SQL editor, in order:

1. `supabase/01_schema.sql` — tables, RLS, and the trigger that links new auth users to profiles.
2. `supabase/02_seed_part1.sql`, `02_seed_part2.sql`, `02_seed_part3.sql` — run in that order. Generated from `src/data/seed.js` with `npm run gen:sql`; repetitive rows (attendance, enrollments) are built by SQL so each file stays small.
3. `supabase/03_demo_users.sql` — three confirmed demo users (no email verification).

Then put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

### Demo accounts (password `Bolt2036!`)

| Role | Email | Who |
|---|---|---|
| Student | student@bolt.school | Maya Khalil |
| Teacher | teacher@bolt.school | Rania Haddad |
| Parent | parent@bolt.school | Samir Khalil (Maya’s parent) |

## AI

Set `ANTHROPIC_API_KEY` (server-side, e.g. a Vercel Secret) to turn on live AI (model `claude-opus-5-5`) for the tutor chat, extra practice generation, lesson insights, Explain Back, Teach the Bot, Debate Arena and the essay coach. The key is only read by the serverless function `api/ai.js`; the browser never sees it.

## Structure

```
src/
  data/seed.js          single source of demo data (also generates the SQL seed)
  data/activities.js    interactive activity per lesson
  lib/auth.jsx          Supabase auth + local demo fallback
  lib/data.jsx          in-memory db: seed → Supabase overlay → local writes
  lib/selectors.js      progress, leaderboard, insights, recognition, parent lens
  lib/ai.js             Claude client with fallbacks
  lib/practice.js       tailored extra-practice generator
  components/           ui kit, layout, interactives, essay editor, passport, lab…
  pages/{student,teacher,parent}
```

Design system: EduBolt brand guidelines (Mango Orange `#FF9900`, Charcoal Blue `#353B48`, Montserrat, handwritten accent, lightning-bolt pattern).
