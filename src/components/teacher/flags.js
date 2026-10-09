/**
 * Automatic integrity flags and process insights computed from a submission's metrics + process log.
 * Pure functions — no React.
 */
const fmtDuration = (s) => {
  if (s < 60) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  return `${(s / 3600).toFixed(1)} h`
}

/** → [{ id, severity: 'high'|'medium'|'low', label, detail }] */
export function computeFlags(sub) {
  const m = sub.metrics || {}
  const ai = sub.ai_usage || {}
  const flags = []
  if (m.pasted_chars > 0 && m.pasted_chars >= m.words * 4 && m.active_seconds < 60) {
    flags.push({ id: 'paste', severity: 'high', label: 'Pasted whole essay', detail: `Wrote ${m.words} words in ${m.active_seconds} seconds (pasted ${m.pasted_chars.toLocaleString()} chars, ${m.keystrokes} keystrokes).` })
  } else if (m.pasted_chars > 600) {
    flags.push({ id: 'big-paste', severity: 'medium', label: 'Large paste', detail: `${m.pasted_chars.toLocaleString()} characters arrived in a paste — check the source.` })
  }
  if (ai.share_of_text > 0.3 && !ai.declared) {
    flags.push({ id: 'ai-undeclared', severity: 'high', label: 'Undeclared AI use', detail: `${Math.round(ai.share_of_text * 100)}% of the text came from ${ai.prompts} AI prompts (${ai.mode || 'generation'}) and was not declared.` })
  } else if (ai.share_of_text > 0.3) {
    flags.push({ id: 'ai-heavy', severity: 'medium', label: 'Heavy AI share', detail: `${Math.round(ai.share_of_text * 100)}% of the text is AI-generated (declared).` })
  }
  if (m.total_seconds > 3 * 3600 && m.active_seconds / m.total_seconds < 0.25) {
    flags.push({ id: 'idle', severity: 'medium', label: 'Very long session, mostly idle', detail: `${fmtDuration(m.total_seconds)} open but only ${fmtDuration(m.active_seconds)} active; longest pause ${fmtDuration(m.longest_pause_seconds)}.` })
  }
  if (m.words > 0 && m.keystrokes > 0 && m.keystrokes / m.words < 3.5 && !flags.some((f) => f.id === 'paste')) {
    flags.push({ id: 'keystrokes', severity: 'medium', label: 'Too few keystrokes for the word count', detail: `${m.keystrokes} keystrokes for ${m.words} words (${(m.keystrokes / m.words).toFixed(1)} per word; typing usually needs 5+).` })
  }
  if (m.revision_ratio === 0 && m.deletions === 0) {
    flags.push({ id: 'no-revision', severity: 'low', label: 'No revision', detail: 'Zero deletions and a single snapshot — the text was never edited.' })
  }
  if (m.revision_ratio >= 0.8 && m.words < 200) {
    flags.push({ id: 'churn', severity: 'low', label: 'High churn, low output', detail: `${Math.round(m.revision_ratio * 100)}% of typed text was deleted and only ${m.words} words remain — a sign of being stuck, not of cheating.` })
  }
  if (sub.submitted_at && /T(2[3]|0[0-4]):/.test(sub.submitted_at)) {
    flags.push({ id: 'late-night', severity: 'low', label: 'Submitted after 23:00', detail: `Submitted at ${new Date(sub.submitted_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} — worth a gentle check-in.` })
  }
  return flags
}

export const severityTone = (s) => ({ high: 'danger', medium: 'warning', low: 'neutral' }[s] || 'neutral')

/** Human-readable process insights for the replay view. */
export function computeInsights(sub, firstName = 'The student') {
  const m = sub.metrics || {}
  const ai = sub.ai_usage || {}
  const p = sub.process || []
  const out = []
  const wholePaste = m.pasted_chars > 0 && m.pasted_chars >= m.words * 4 && m.active_seconds < 60
  if (wholePaste) {
    return [
      { tone: 'danger', text: `${m.pasted_chars.toLocaleString()} characters arrived in a single paste and ${m.keystrokes} keystroke${m.keystrokes === 1 ? '' : 's'} followed — the text was not written in the editor.` },
      { tone: 'danger', text: `${m.words} words in ${m.active_seconds} seconds: there is no thinking path to grade here.` },
      { tone: 'warning', text: 'No drafts, no deletions, no pauses — the session shows the final product only.' },
      { tone: 'neutral', text: `Submitted at ${new Date(sub.submitted_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}. Suggested next step: a 5-minute oral defense so ${firstName} can show the reasoning behind the essay.` },
    ]
  }
  const pauses = p.filter((e) => e.type === 'pause')
  const longest = pauses.sort((a, b) => b.seconds - a.seconds)[0]
  if (longest) out.push({ tone: 'success', text: `Spent ${longest.seconds}s thinking ${longest.note ? longest.note.toLowerCase().replace(/^long pause /, '') : 'mid-draft'} — a strong planning signal, not idling.` })
  const aiPrompt = p.find((e) => e.type === 'ai_prompt')
  const ownAfterAi = p.find((e) => e.type === 'type' && aiPrompt && e.t > aiPrompt.t && e.chars >= 150)
  if (aiPrompt && ownAfterAi) out.push({ tone: 'success', text: `Asked AI for the opposing view (“${aiPrompt.prompt.slice(0, 60)}…”) then wrote ${ownAfterAi.chars} characters of her own rebuttal — healthy AI use.` })
  else if (ai.prompts > 3 && !ai.declared) out.push({ tone: 'danger', text: `${ai.prompts} AI prompts with ${Math.round(ai.share_of_text * 100)}% of the text generated and nothing declared.` })
  else if (ai.prompts === 0) out.push({ tone: 'neutral', text: 'No AI assistance used at any point.' })
  if (m.revision_ratio != null) out.push({ tone: m.revision_ratio >= 0.15 ? 'success' : 'warning', text: m.revision_ratio >= 0.15 ? `${Math.round(m.revision_ratio * 100)}% of the text was revised — ${firstName} edits rather than dumps.` : `Only ${Math.round(m.revision_ratio * 100)}% of the text was revised — the first draft became the final draft.` })
  const dels = p.filter((e) => e.type === 'delete' && e.note)
  if (dels.length) out.push({ tone: 'success', text: `Purposeful cuts: ${dels.map((d) => d.note.toLowerCase()).join('; ')}.` })
  if (m.pasted_chars <= 60) out.push({ tone: 'success', text: m.pasted_chars ? `No large paste — only ${m.pasted_chars} characters, from ${p.find((e) => e.type === 'paste')?.source || 'notes'}.` : 'No paste events at all.' })
  else out.push({ tone: 'danger', text: `${m.pasted_chars.toLocaleString()} characters pasted in — the text did not originate in the editor.` })
  if (m.snapshots >= 3) out.push({ tone: 'success', text: `${m.snapshots} drafts saved — the structure was built in passes (${p.filter((e) => e.type === 'snapshot').map((s) => s.label).join(' → ')}).` })
  if (m.total_seconds && m.active_seconds) {
    const ratio = m.active_seconds / m.total_seconds
    out.push({ tone: ratio > 0.6 ? 'success' : 'warning', text: `${Math.round(ratio * 100)}% of the ${fmtDuration(m.total_seconds)} session was active typing or reading.` })
  }
  if (m.words && m.active_seconds) out.push({ tone: 'neutral', text: `Pace: ${Math.round((m.words / m.active_seconds) * 60)} words per active minute — ${m.words / m.active_seconds > 0.6 ? 'fast and fluent' : m.words / m.active_seconds > 0.25 ? 'typical for a reasoned essay' : 'slow; may have needed scaffolding'}.` })
  if (ai.declared && ai.share_of_text < 0.2 && ai.prompts) out.push({ tone: 'success', text: `AI use declared up front (${Math.round(ai.share_of_text * 100)}% of text, mode: ${ai.mode}). Eligible for the Honest Process stamp.` })
  return out
}

/** Suggested thinking-path grade (process / product, each out of 10). */
export function suggestGrade(sub) {
  const m = sub.metrics || {}
  const ai = sub.ai_usage || {}
  let process = 5
  if (m.revision_ratio >= 0.15) process += 1.5
  if (m.snapshots >= 3) process += 1
  if (m.longest_pause_seconds >= 60 && m.longest_pause_seconds <= 600) process += 1
  if (ai.declared && ai.prompts) process += 1
  if (ai.share_of_text > 0.3 && !ai.declared) process -= 4
  if (m.pasted_chars > 1000) process -= 5
  if (m.revision_ratio === 0) process -= 1.5
  if (m.active_seconds / (m.total_seconds || 1) < 0.25) process -= 1
  let product = 5
  if (m.words >= 300) product += 2
  else if (m.words >= 200) product += 1
  else product -= 1.5
  if (m.words >= 450) product += 1
  if (ai.share_of_text > 0.3) product -= 1.5
  if (sub.content) product += 1
  const clamp = (v) => Math.max(0, Math.min(10, Math.round(v)))
  return { process: clamp(process), product: clamp(product) }
}
