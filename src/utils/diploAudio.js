let _diploCtx = null;
const getDiploCtx = () => {
  if (!_diploCtx || _diploCtx.state === 'closed') {
    const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if (!AudioContextClass) return null;
    _diploCtx = new AudioContextClass();
  }
  if (_diploCtx.state === 'suspended') _diploCtx.resume();
  return _diploCtx;
};

export const playDiploSound = (type) => {
  try {
    const ctx = getDiploCtx();
    if (!ctx) return;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'connect') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(650, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.1);
          osc2.connect(masterGain);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.1);
        } catch (_) {}
      }, 100);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      osc.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.05 + 0.2);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.2);
      });
    } else if (type === 'warn') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn("AudioContext failed", err);
  }
};

export default playDiploSound;
