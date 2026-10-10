import { Zap, CalendarCheck, Trophy, Mic, Hammer, Search, MessageCircle, Bot, Fingerprint, GitBranch, Swords, Lightbulb, TrendingUp, Users, Flame, Sigma, Atom, Feather, ShieldCheck, Award } from 'lucide-react'

const ICONS = { zap: Zap, 'calendar-check': CalendarCheck, trophy: Trophy, mic: Mic, hammer: Hammer, search: Search, 'message-circle': MessageCircle, bot: Bot, fingerprint: Fingerprint, 'git-branch': GitBranch, swords: Swords, lightbulb: Lightbulb, 'trending-up': TrendingUp, users: Users, flame: Flame, sigma: Sigma, atom: Atom, feather: Feather, 'shield-check': ShieldCheck }

export default function BadgeIcon({ icon, size = 18, className = '' }) {
  const I = ICONS[icon] || Award
  return <I size={size} className={className} />
}
