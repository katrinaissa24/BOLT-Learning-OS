import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, Map, GitBranch, X, Volume2, VolumeX } from 'lucide-react'
import { Button } from '../ui'
import { playCelebration, soundOn, setSoundOn } from '../../lib/sound'

const COLORS = ['#FF9900', '#353B48', '#5B7CFA', '#2FA36B', '#E255A1', '#FFCC80']

/** Full-screen celebration after a checkpoint is cleared. */
export default function Celebration({ open, score, points, lesson, courseId, nextLesson, onClose, onBranch }) {
  const [sound, setSound] = useState(soundOn)
  const pieces = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ id: i, x: (i / 28) * 100 + (Math.random() * 3 - 1.5), delay: Math.random() * 0.5, dur: 1.8 + Math.random() * 1.2, rot: Math.random() * 720 - 360, color: COLORS[i % COLORS.length], w: 8 + Math.random() * 8, h: 10 + Math.random() * 10 })), [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const weak = score < 60
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    playCelebration(weak ? 'soft' : 'win')
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [open, onClose, weak])
  const toggleSound = () => { const next = !sound; setSound(next); setSoundOn(next); if (next) playCelebration(weak ? 'soft' : 'win') }
  const R = 44, circ = 2 * Math.PI * R

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
          {!weak && pieces.map((p) => (
            <motion.span key={p.id} className="absolute top-0 rounded-sm pointer-events-none" style={{ left: `${p.x}%`, width: p.w, height: p.h, background: p.color }} initial={{ y: -40, rotate: 0, opacity: 1 }} animate={{ y: '110vh', rotate: p.rot, opacity: [1, 1, 0.6] }} transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }} />
          ))}
          <motion.div className="relative card w-full max-w-lg p-8 text-center overflow-hidden" initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
            <div className="absolute inset-0 bolt-pattern opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
            <button type="button" onClick={toggleSound} className="absolute top-4 left-4 z-10 p-2 rounded-full hover:bg-charcoal-100 text-charcoal-400" aria-label={sound ? 'Mute celebration sound' : 'Turn celebration sound on'} title={sound ? 'Sound on' : 'Sound off'}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-charcoal-100 text-charcoal-400" aria-label="Close"><X size={18} /></button>
            <div className="relative">
              <div className="font-hand text-mango text-3xl leading-none">{weak ? 'checkpoint logged' : 'checkpoint cleared!'}</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal mt-1">{lesson.title}</h2>

              <div className="relative mx-auto my-6 w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="#E6E8EC" strokeWidth="10" />
                  <motion.circle cx="50" cy="50" r={R} fill="none" stroke={weak ? '#E0493B' : '#FF9900'} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - score / 100) }} transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-3xl font-extrabold text-charcoal leading-none">{score}%</div><div className="text-[10px] uppercase tracking-wide text-charcoal-400 font-semibold mt-1">score</div></div>
              </div>

              <motion.div className="inline-flex items-center gap-2 rounded-full bg-charcoal text-white px-4 py-2 font-bold" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
                <Zap size={16} className="text-mango" /> +{points} points
              </motion.div>

              <p className="text-sm text-charcoal-400 mt-4 max-w-sm mx-auto">
                {weak ? 'Below 60 — so the journey branches. A short extra-practice path is waiting on the next slide: finish it to earn 40 more points and lift this score.' : score === 100 ? 'First try. That is exactly what mastery looks like — on to the next checkpoint.' : 'Solid. The tutor and the interactive are still here if you want to make it a 100 next time.'}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {weak ? (
                  <Button onClick={() => { onClose?.(); onBranch?.() }}><GitBranch size={16} /> Branch out: extra practice</Button>
                ) : nextLesson ? (
                  <Button to={`/student/courses/${courseId}/lessons/${nextLesson.id}`} onClick={onClose}>Next checkpoint <ArrowRight size={16} /></Button>
                ) : (
                  <Button to={`/student/courses/${courseId}`} onClick={onClose}>Journey complete <ArrowRight size={16} /></Button>
                )}
                <Button to={`/student/courses/${courseId}`} variant="secondary" onClick={onClose}><Map size={16} /> Back to journey</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
