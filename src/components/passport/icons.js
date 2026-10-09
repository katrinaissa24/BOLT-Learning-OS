import { Zap, CalendarCheck, Trophy, Mic, Hammer, Search, MessageCircle, Bot, Fingerprint, GitBranch, Swords, Lightbulb, TrendingUp, Users, Flame, Sigma, Atom, Feather, ShieldCheck, Stamp } from 'lucide-react'

/** badge.icon (lucide kebab name) → component */
export const BADGE_ICONS = {
  zap: Zap,
  'calendar-check': CalendarCheck,
  trophy: Trophy,
  mic: Mic,
  hammer: Hammer,
  search: Search,
  'message-circle': MessageCircle,
  bot: Bot,
  fingerprint: Fingerprint,
  'git-branch': GitBranch,
  swords: Swords,
  lightbulb: Lightbulb,
  'trending-up': TrendingUp,
  users: Users,
  flame: Flame,
  sigma: Sigma,
  atom: Atom,
  feather: Feather,
  'shield-check': ShieldCheck,
}
export const badgeIcon = (name) => BADGE_ICONS[name] || Stamp

/** Stamp ink colours by rarity — brand tones plus skill colours. */
export const RARITY = {
  common: { label: 'Common', tone: 'neutral' },
  uncommon: { label: 'Uncommon', tone: 'info' },
  rare: { label: 'Rare', tone: 'mango' },
  epic: { label: 'Epic', tone: 'dark' },
}
