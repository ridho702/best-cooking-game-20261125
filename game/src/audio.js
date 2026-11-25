// Warung Rush — audio.js
// All sound is synthesized with WebAudio oscillators. No audio files,
// no network, nothing to load. A tiny beep engine with a mute switch.

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

// Play one note: frequency in Hz, length in seconds, wave shape, volume.
export function playNote(freq, seconds = 0.09, type = 'square', volume = 0.05) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + seconds);
}

export function playClick() {
  playNote(660, 0.05, 'square', 0.03);
}

export function playCorrect() {
  playNote(523, 0.08, 'sine', 0.06);
  setTimeout(() => playNote(784, 0.1, 'sine', 0.06), 70);
}

export function playWrong() {
  playNote(160, 0.18, 'sawtooth', 0.05);
}

export function playCoin() {
  playNote(880, 0.07, 'sine', 0.06);
  setTimeout(() => playNote(1174, 0.07, 'sine', 0.06), 60);
  setTimeout(() => playNote(1568, 0.12, 'sine', 0.06), 120);
}

export function playAngry() {
  playNote(220, 0.12, 'sawtooth', 0.05);
  setTimeout(() => playNote(175, 0.2, 'sawtooth', 0.05), 110);
}

export function playDayClear() {
  [523, 659, 784, 1046].forEach((f, i) =>
    setTimeout(() => playNote(f, 0.14, 'triangle', 0.07), i * 110),
  );
}
