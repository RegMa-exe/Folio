/**
 * A short, quiet paper rustle synthesised with the Web Audio API.
 * No audio file to download, and nothing plays until the user has
 * interacted with the page (which page-turning always implies).
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function playPageTurn(volume = 0.09) {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();

  const duration = 0.32;
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    // two overlapping rustles with a quick decay, like a sheet lifting and settling
    const envelope = Math.exp(-7 * t) * (1 - t) + 0.35 * Math.exp(-14 * Math.abs(t - 0.45));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = audio.createBufferSource();
  source.buffer = buffer;

  const bandpass = audio.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 2600;
  bandpass.Q.value = 0.7;

  const highpass = audio.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 900;

  const gain = audio.createGain();
  gain.gain.value = volume;

  source.connect(bandpass).connect(highpass).connect(gain).connect(audio.destination);
  source.start();
}
