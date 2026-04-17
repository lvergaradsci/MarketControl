// ================================================================
// sound.js — Market-Control Sound Engine
// Web Audio API pura — sin archivos externos
// ================================================================

const SFX = (() => {
  let ctx = null;
  let master = null;
  let muted = false;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.30;
      master.connect(ctx.destination);
    } catch(e) { console.warn('Audio no disponible'); }
  }

  function resume() { if (ctx?.state === 'suspended') ctx.resume(); }

  function osc(freq, type, start, dur, vol = 0.3, detune = 0) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.connect(g); g.connect(master);
    o.start(start); o.stop(start + dur + 0.02);
  }

  // ── Clic metálico (válvula / botón) ─────────────────────────
  function click() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    osc(2200, 'square',    now,       0.025, 0.18);
    osc(1100, 'sawtooth',  now+0.02,  0.03,  0.10);
  }

  // ── Burbujeo de fluido (tanque llenándose) ───────────────────
  function bubble() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    const freqs = [400, 600, 500, 700];
    freqs.forEach((f, i) => {
      osc(f, 'sine', now + i*0.06, 0.08, 0.12);
    });
    // Ruido suave
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length) * 0.5;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 800;
    const g = ctx.createGain(); g.gain.value = 0.08;
    src.connect(filt); filt.connect(g); g.connect(master); src.start(now);
  }

  // ── Éxito / acierto (destello verde) ────────────────────────
  function success() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    const chord = [523, 659, 784, 1047];
    chord.forEach((f, i) => {
      osc(f, 'triangle', now + i*0.04, 0.25, 0.20);
      osc(f*2, 'sine',   now + i*0.04, 0.15, 0.08);
    });
    osc(2093, 'sine', now+0.22, 0.35, 0.15);
  }

  // ── Error / fallo ────────────────────────────────────────────
  function error() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    [440, 370, 311, 262].forEach((f, i) => {
      osc(f, 'sawtooth', now + i*0.1, 0.12, 0.20);
    });
    osc(130, 'sine', now+0.4, 0.3, 0.18);
  }

  // ── Conexión de cable (snap) ─────────────────────────────────
  function snap() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    osc(3000, 'square', now,      0.015, 0.25);
    osc(1500, 'square', now+0.01, 0.02,  0.15);
    osc(800,  'sine',   now+0.02, 0.05,  0.10);
  }

  // ── Bombillo encendido ───────────────────────────────────────
  function lightOn() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    osc(880,  'sine',     now,      0.10, 0.20);
    osc(1760, 'triangle', now+0.08, 0.20, 0.15);
    osc(2640, 'sine',     now+0.18, 0.25, 0.12);
  }

  // ── Alerta / evento de crisis ─────────────────────────────────
  function alert() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    [880, 0, 880, 0, 880].forEach((f, i) => {
      if (f) osc(f, 'square', now + i*0.15, 0.10, 0.22);
    });
  }

  // ── Fanfarria de nivel completado ────────────────────────────
  function levelComplete() {
    if (!ctx || muted) return; resume();
    const now = ctx.currentTime;
    const mel = [523,659,784,1047,784,880,1047,1319];
    mel.forEach((f, i) => {
      osc(f,   'triangle', now + i*0.10, 0.18, 0.20);
      osc(f/2, 'sine',     now + i*0.10, 0.14, 0.08);
    });
    osc(65, 'sine', now, 0.5, 0.25);
    osc(65, 'sine', now+0.8, 0.5, 0.20);
  }

  // ── Cinta transportadora (loop continuo) ─────────────────────
  let beltNode = null;
  function startBelt() {
    if (!ctx || muted || beltNode) return; resume();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate;
      d[i] = Math.sin(2*Math.PI*60*t) * 0.05 +
             (Math.random()*2-1) * 0.02 * Math.sin(2*Math.PI*4*t);
    }
    beltNode = ctx.createBufferSource();
    beltNode.buffer = buf; beltNode.loop = true;
    const g = ctx.createGain(); g.gain.value = 0.08;
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 200;
    beltNode.connect(filt); filt.connect(g); g.connect(master);
    beltNode.start();
  }
  function stopBelt() { if (beltNode) { try { beltNode.stop(); } catch(e){} beltNode = null; } }

  // ── Música ambiental industrial (loop suave) ─────────────────
  let ambiNode = null;
  function startAmbi() {
    if (!ctx || muted || ambiNode) return; resume();
    const notes = [130, 146, 164, 174];
    let t = ctx.currentTime;
    const play = () => {
      if (!ctx || muted) return;
      const f = notes[Math.floor(Math.random()*notes.length)];
      osc(f,   'sine',     t, 2.0, 0.04);
      osc(f*3, 'triangle', t, 1.5, 0.02);
      t += 1.8 + Math.random()*0.8;
      ambiNode = setTimeout(play, 1800);
    };
    play();
  }
  function stopAmbi() { if (ambiNode) { clearTimeout(ambiNode); ambiNode = null; } }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.30;
    if (muted) { stopBelt(); stopAmbi(); }
    return muted;
  }
  function isMuted() { return muted; }

  return { init, click, bubble, success, error, snap, lightOn, alert, levelComplete, startBelt, stopBelt, startAmbi, stopAmbi, toggleMute, isMuted };
})();
