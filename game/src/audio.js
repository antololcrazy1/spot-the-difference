// Tiny WebAudio sound effects, no audio files: a soft ding for a find, a low
// buzz for a miss, a rising arpeggio for a finished level. All sounds are
// optional and can be muted from the HUD.
let audioContext = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function context() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(when, frequency, duration, type, gainValue) {
  const ctx = context();
  if (!ctx || muted) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.05);
}

export function playFound() {
  const ctx = context();
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  tone(now, 880, 0.16, 'sine', 0.18);
  tone(now + 0.09, 1318, 0.22, 'sine', 0.16);
}

export function playWrong() {
  const ctx = context();
  if (!ctx || muted) return;
  tone(ctx.currentTime, 160, 0.22, 'sawtooth', 0.08);
}

export function playHint() {
  const ctx = context();
  if (!ctx || muted) return;
  tone(ctx.currentTime, 659, 0.14, 'triangle', 0.12);
}

export function playLevelComplete() {
  const ctx = context();
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((frequency, index) => {
    tone(now + index * 0.11, frequency, 0.24, 'triangle', 0.16);
  });
}

export function playClick() {
  const ctx = context();
  if (!ctx || muted) return;
  tone(ctx.currentTime, 440, 0.07, 'sine', 0.08);
}
