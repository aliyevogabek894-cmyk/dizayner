window.FQ = window.FQ || {};

FQ.audio = (() => {
  let ctx = null;
  let enabled = true;

  function ensureCtx() {
    if (!enabled) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.08, delay = 0) {
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(vol, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur);
  }

  return {
    setEnabled(val) { enabled = val; },
    isEnabled() { return enabled; },
    click() { tone(620, 0.06, 'triangle', 0.06); },
    sparkle() {
      tone(880, 0.12, 'sine', 0.06, 0);
      tone(1320, 0.14, 'sine', 0.05, 0.06);
    },
    coin() {
      tone(987, 0.09, 'sine', 0.09, 0);
      tone(1318, 0.18, 'sine', 0.09, 0.08);
    },
    snip() {
      tone(420, 0.05, 'sawtooth', 0.06, 0);
      tone(290, 0.06, 'sawtooth', 0.05, 0.04);
    },
    stitch() {
      tone(190, 0.045, 'square', 0.04, 0);
    },
    fanfare() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, i * 0.09));
    }
  };
})();

