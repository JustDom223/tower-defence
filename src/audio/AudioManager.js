/**
 * Web Audio API sound manager.
 * AudioContext is created lazily on first play() call to satisfy browser autoplay policy.
 * All sounds are synthesised — no external files needed.
 */

const SOUNDS = {
  'dart-shot'(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(out);
    o.type = 'square'; o.frequency.value = 1100;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.start(); o.stop(ctx.currentTime + 0.07);
  },

  'bomb-explode'(ctx, out) {
    const len = ctx.sampleRate * 0.45;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 250;
    const g = ctx.createGain(); g.gain.value = 0.55;
    src.connect(lp); lp.connect(g); g.connect(out);
    src.start();
  },

  // Deliberately silent — lets a tower's fire be muted by pointing its
  // SHOT_SOUND entry here, without special-casing the play sites.
  'silent'() { /* no-op */ },

  // Electric zap for the Tesla bolt — a quick descending buzz with a crackle.
  // Kept short and modest in volume; it fires often (see THROTTLE).
  'tesla-zap'(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(1800, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

    // Crackle: a short, fast-decaying noise burst through a bandpass.
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp  = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;

    g.gain.setValueAtTime(0.09, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

    o.connect(g); src.connect(bp); bp.connect(g); g.connect(out);
    o.start(); o.stop(ctx.currentTime + 0.13); src.start();
  },

  'frost-pulse'(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(out);
    o.type = 'sine';
    o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  },

  'marksman-shot'(ctx, out) {
    const len = Math.floor(ctx.sampleRate * 0.1);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 900;
    const g = ctx.createGain(); g.gain.value = 0.45;
    src.connect(hp); hp.connect(g); g.connect(out);
    src.start();
  },

  'enemy-death'(ctx, out) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(out);
    o.type = 'sine';
    o.frequency.setValueAtTime(480, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.14, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(); o.stop(ctx.currentTime + 0.18);
  },

  'wave-start'(ctx, out) {
    [440, 550, 660].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t); o.stop(t + 0.25);
    });
  },

  'wave-clear'(ctx, out) {
    [660, 784, 988].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.35);
    });
  },

  'win'(ctx, out) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      o.start(t); o.stop(t + 0.8);
    });
  },

  'lose'(ctx, out) {
    [440, 330, 220, 165].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(out);
      o.type = 'sawtooth'; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      g.gain.setValueAtTime(0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      o.start(t); o.stop(t + 0.38);
    });
  },
};

// Minimum seconds between repeats of the same sound. Coalesces bursts of
// identical one-shots (e.g. a whole pack dying to one AoE/pierce volley at the
// end of a wave) so they don't machine-gun and overdrive the output. Sounds not
// listed here (shots, etc.) are never throttled.
const THROTTLE = {
  'enemy-death':  0.05,
  'bomb-explode': 0.04,
  'tesla-zap':    0.05,
};

class _AudioManager {
  #ctx        = null;
  #masterGain = null;
  #muted      = false;
  #volume     = 0.7;
  #lastPlay   = Object.create(null);

  #init() {
    if (this.#ctx) return;
    this.#ctx        = new AudioContext();
    this.#masterGain = this.#ctx.createGain();
    this.#masterGain.gain.value = this.#muted ? 0 : this.#volume;
    this.#masterGain.connect(this.#ctx.destination);
  }

  get muted()  { return this.#muted; }
  get volume() { return this.#volume; }

  toggleMute() {
    this.#muted = !this.#muted;
    if (this.#masterGain) this.#masterGain.gain.value = this.#muted ? 0 : this.#volume;
    return this.#muted;
  }

  setVolume(v) {
    this.#volume = Math.max(0, Math.min(1, v));
    if (this.#masterGain && !this.#muted) this.#masterGain.gain.value = this.#volume;
  }

  play(name) {
    if (this.#muted) return;
    this.#init();
    if (this.#ctx.state === 'suspended') this.#ctx.resume();
    // Throttle bursts of identical sounds (see THROTTLE above).
    const min = THROTTLE[name];
    if (min) {
      const now  = this.#ctx.currentTime;
      const last = this.#lastPlay[name];
      if (last !== undefined && now - last < min) return;
      this.#lastPlay[name] = now;
    }
    SOUNDS[name]?.(this.#ctx, this.#masterGain);
  }
}

export default new _AudioManager();
