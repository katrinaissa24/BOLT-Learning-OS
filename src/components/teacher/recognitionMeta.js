/** Labels and styling for recognitionPatterns() pattern keys. */
export const PATTERN_META = {
  encourage: { label: 'Needs encouragement', cls: 'bg-danger-soft text-danger', blurb: 'Few stamps and a behind/at-risk status. A short 1:1 and one achievable goal this week.' },
  recognize: { label: 'Needs recognition', cls: 'bg-mango-50 text-mango-700', blurb: 'Earning stamps fast — say it out loud in class or nominate for the showcase.' },
  invisible: { label: 'Strong but invisible', cls: 'bg-info-soft text-info', blurb: 'Great scores, almost no stamps. Invite to a Thinking Lab challenge or an oral defense.' },
  consistency: { label: 'Consistency to reward', cls: 'bg-success-soft text-success', blurb: 'Perfect attendance, few stamps. Reward the habit and suggest a project.' },
  steady: { label: 'Steady', cls: 'bg-charcoal-100 text-charcoal-500', blurb: 'Progressing normally. Nothing to do this week.' },
}
export const PATTERN_ORDER = ['encourage', 'recognize', 'invisible', 'consistency', 'steady']
