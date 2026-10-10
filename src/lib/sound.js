/**
 * Small synthesized sound effects (Web Audio, no files to load).
 * Browsers only allow sound after the user interacts; celebrations follow a click, so that holds.
 */
const KEY = 'bolt.sound'
let ctx = null

export const soundOn = () => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } }
export const setSoundOn = (on) => { try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* ignore */ } }

function audio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = ctx || new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function note(ac, out, freq, at, dur, { type = 'triangle', gain = 0.2 } = {}) {
  const osc = ac.createOscillator()
  const env = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(gain, at + 0.015)
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(env).connect(out)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

/** kind: 'win' — rising fanfare and sparkle; 'soft' — two gentle notes for a logged (below 60) checkpoint. */
export function playCelebration(kind = 'win') {
  if (!soundOn()) return
  try {
    const ac = audio()
    if (!ac) return
    const out = ac.createGain()
    out.gain.value = 0.55
    const comp = ac.createDynamicsCompressor()
    out.connect(comp).connect(ac.destination)
    const t = ac.currentTime + 0.03
    if (kind === 'soft') {
      note(ac, out, 392.0, t, 0.35, { type: 'sine', gain: 0.18 })
      note(ac, out, 523.25, t + 0.18, 0.6, { type: 'sine', gain: 0.18 })
      return
    }
    // C5 E5 G5 rising, then a C major chord, then a sparkle on top
    ;[523.25, 659.25, 783.99].forEach((f, i) => note(ac, out, f, t + i * 0.11, 0.28))
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f) => note(ac, out, f, t + 0.36, 1.1, { gain: 0.14 }))
    ;[2093.0, 2637.0, 3136.0, 2637.0].forEach((f, i) => note(ac, out, f, t + 0.5 + i * 0.08, 0.25, { type: 'sine', gain: 0.05 }))
  } catch { /* sound is a nice-to-have */ }
}
