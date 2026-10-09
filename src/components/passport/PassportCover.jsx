import { motion } from 'framer-motion'
import { BoltMark } from '../ui'
import { SCHOOL } from '../../data/seed'

/** Closed passport cover. Click to open. */
export default function PassportCover({ onOpen, name, stampCount }) {
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 20, rotateY: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ rotateY: -120, opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      whileHover={{ y: -6, rotateY: -8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
      className="relative w-[340px] h-[470px] rounded-r-3xl rounded-l-xl bg-charcoal text-white shadow-[0_30px_60px_-20px_rgba(28,32,40,0.6)] bolt-pattern-dark text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-mango/40"
      aria-label="Open passport"
    >
      {/* spine */}
      <div className="absolute inset-y-0 left-0 w-3 rounded-l-xl bg-charcoal-900/80" />
      {/* gold frame */}
      <div className="absolute inset-4 rounded-r-2xl rounded-l-lg border-2 border-mango/60" />
      <div className="absolute inset-6 rounded-r-xl rounded-l-md border border-mango/30" />
      <div className="relative h-full flex flex-col items-center justify-between py-12 px-8">
        <div className="text-center">
          <div className="text-[10px] font-bold tracking-[0.35em] text-mango">LEARNING PASSPORT</div>
          <div className="text-[10px] tracking-[0.2em] text-white/60 mt-2 uppercase">{SCHOOL.name}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full border-[3px] border-mango flex items-center justify-center bg-charcoal-700/50 shadow-[inset_0_0_30px_rgba(255,153,0,0.25)]">
            <div className="w-28 h-28 rounded-full border border-mango/50 flex items-center justify-center">
              <BoltMark size={76} dark />
            </div>
          </div>
          <div className="mt-5 text-2xl font-extrabold tracking-tight">BOLT<span className="text-mango">.</span></div>
          <div className="font-hand text-mango text-xl -mt-1">proof of thinking</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold">{name}</div>
          <div className="text-[11px] text-white/60 mt-0.5">{stampCount} stamps · Grade 12 · {SCHOOL.year}</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-mango text-white text-xs font-bold px-4 py-1.5 animate-pulse">Tap to open</div>
        </div>
      </div>
    </motion.button>
  )
}
