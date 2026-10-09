import { useState } from 'react'
import { Instagram, Twitter, Link2, Check, Stamp } from 'lucide-react'
import { Modal, Button, Pill, Avatar, BoltMark } from '../ui'
import { StampSeal } from './Stamp'
import { SCHOOL } from '../../data/seed'

/** Shareable passport card preview + demo social buttons (copy a text summary). */
export default function ShareModal({ open, onClose, profile, earned }) {
  const [copied, setCopied] = useState(null)
  const latest = earned.slice().sort((a, b) => b.earned_at.localeCompare(a.earned_at)).slice(0, 3)
  const summary = `${profile.full_name}'s BOLT Learning Passport · ${SCHOOL.name}\n${earned.length} verified stamps, latest: ${latest.map((e) => e.badge.name).join(', ')}.\nProof of thinking, not just grades. #BOLT #SchoolOf2036`
  const link = `https://bolt.school/passport/${profile.id.slice(-6)}`

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked: still show state */ }
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <Modal open={open} onClose={onClose} title="Share your passport">
      <div className="rounded-3xl bg-charcoal text-white p-6 bolt-pattern-dark relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><BoltMark size={28} dark /><span className="font-extrabold">BOLT<span className="text-mango">.</span></span></div>
          <div className="text-[10px] tracking-[0.3em] text-mango font-bold">LEARNING PASSPORT</div>
        </div>
        <div className="flex items-center gap-4 mt-5">
          <Avatar name={profile.full_name} size="lg" className="ring-2 ring-mango" />
          <div>
            <div className="text-xl font-extrabold tracking-tight">{profile.full_name}</div>
            <div className="text-sm text-white/60">{profile.title} · {SCHOOL.name}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-extrabold">{earned.length}</div>
            <div className="text-[11px] uppercase tracking-wide text-white/60">stamps</div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl passport-paper p-3 flex items-center justify-around">
          {latest.map((e, i) => <StampSeal key={e.id} badge={e.badge} earnedAt={e.earned_at} size={96} rotate={[-6, 4, -3][i]} idx={i + 40} />)}
        </div>
        <div className="font-hand text-mango text-xl mt-3 text-center">proof of thinking, not just grades</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 mt-5">
        <Button variant="secondary" onClick={() => copy(summary, 'ig')}><Instagram size={16} /> {copied === 'ig' ? 'Caption copied' : 'Instagram'}</Button>
        <Button variant="secondary" onClick={() => copy(summary, 'x')}><Twitter size={16} /> {copied === 'x' ? 'Post copied' : 'Share to X'}</Button>
        <Button variant="dark" onClick={() => copy(`${summary}\n${link}`, 'link')}>{copied === 'link' ? <><Check size={16} /> Copied</> : <><Link2 size={16} /> Copy link</>}</Button>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-charcoal-400"><Pill tone="outline">Demo</Pill> Social buttons copy a text summary to your clipboard — real posting is out of scope for the prototype. Stamps are verifiable through the link.</div>
      <div className="mt-3 rounded-xl bg-cloud p-3 text-xs text-charcoal-500 whitespace-pre-line flex gap-2"><Stamp size={14} className="shrink-0 mt-0.5 text-charcoal-300" />{summary}</div>
    </Modal>
  )
}
