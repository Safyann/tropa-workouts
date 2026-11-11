let context: AudioContext | undefined;

export function prepareRestSound() {
  if (typeof AudioContext === 'undefined') return;
  try {
    context ??= new AudioContext();
    if (context.state !== 'running') void context.resume().catch(() => {});
  } catch {
    // Таймер продолжает работать, если браузер заблокировал звук.
  }
}

export function playRestSound() {
  if (context?.state !== 'running') return;
  const tone = context.createOscillator();
  const volume = context.createGain();
  const start = context.currentTime;
  tone.frequency.value = 660;
  volume.gain.setValueAtTime(0.001, start);
  volume.gain.exponentialRampToValueAtTime(0.16, start + 0.025);
  volume.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
  tone.connect(volume).connect(context.destination);
  tone.onended = () => {
    tone.disconnect();
    volume.disconnect();
  };
  tone.start(start);
  tone.stop(start + 0.33);
}
