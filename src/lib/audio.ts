/**
 * Synthesized sound effects for the DriveEase auth intro.
 * No external audio files — everything is generated via Web Audio API.
 */

let audioCtx: AudioContext | null = null;

/** Returns a singleton AudioContext, creating/resuming it on user gesture. */
export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Revving engine sound — filtered noise + sawtooth oscillator. */
export function playEngineSound(): void {
  const c = getAudioContext();
  const t0 = c.currentTime;

  const bufferSize = c.sampleRate * 2.2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = c.createBufferSource();
  noise.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(90, t0);
  filter.frequency.linearRampToValueAtTime(420, t0 + 0.7);
  filter.frequency.linearRampToValueAtTime(160, t0 + 1.6);

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.28);
  noiseGain.gain.exponentialRampToValueAtTime(0.1, t0 + 1.1);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.1);

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(55, t0);
  osc.frequency.linearRampToValueAtTime(135, t0 + 0.65);
  osc.frequency.linearRampToValueAtTime(85, t0 + 1.5);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0.0001, t0);
  oscGain.gain.exponentialRampToValueAtTime(0.13, t0 + 0.28);
  oscGain.gain.exponentialRampToValueAtTime(0.07, t0 + 1.1);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.1);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(c.destination);
  osc.connect(oscGain);
  oscGain.connect(c.destination);

  noise.start(t0);
  osc.start(t0);
  noise.stop(t0 + 2.2);
  osc.stop(t0 + 2.2);
}

/** Short thud for the car door closing. */
export function playDoorThud(): void {
  const c = getAudioContext();
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, t0);
  osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.18);
  const g = c.createGain();
  g.gain.setValueAtTime(0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.24);
}

/** Two-note chime once the auth panel is ready. */
export function playChime(): void {
  const c = getAudioContext();
  const t0 = c.currentTime;
  [660, 990].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0 + i * 0.09);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0 + i * 0.09);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + i * 0.09 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.09 + 0.4);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0 + i * 0.09);
    osc.stop(t0 + i * 0.09 + 0.42);
  });
}