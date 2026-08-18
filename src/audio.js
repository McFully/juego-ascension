
import menuMusicUrl from '../public/Musica-menu.ogg?url';

let ctx = null;
let masterGain = null;
let ambientOscs = [];
let ambientRunning = false;
let menuMusic = null;
let muted = false;
const BASE_VOLUME = 0.25;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : BASE_VOLUME;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = !!value;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : BASE_VOLUME;
  }
  if (menuMusic) {
    menuMusic.muted = muted;
  }
}

export function isMuted() {
  return muted;
}

function tone(freq, dur, type = 'sine', vol = 0.12, pan = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain);
    if (pan !== 0 && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.setValueAtTime(pan, c.currentTime);
      gain.connect(panner);
      panner.connect(masterGain);
    } else {
      gain.connect(masterGain);
    }
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch (_) {}
}

function noise(dur, vol = 0.06, pan = 0) {
  try {
    const c = getCtx();
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(gain);
    if (pan !== 0 && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.setValueAtTime(pan, c.currentTime);
      gain.connect(panner);
      panner.connect(masterGain);
    } else {
      gain.connect(masterGain);
    }
    src.start(c.currentTime);
  } catch (_) {}
}

function chord(freqs, dur, type = 'sine', vol = 0.06) {
  freqs.forEach((f, i) => {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      const startTime = c.currentTime + i * 0.04;
      osc.frequency.setValueAtTime(f, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + dur);
    } catch (_) {}
  });
}

// =============================================
// ~50 SONIDOS - ASCENSIÓN
// =============================================
export const sfx = {
  // --- UI (8) ---
  uiClick: (pan = 0) => tone(1200, 0.02, 'sine', 0.05, pan),
  uiHover: (pan = 0) => tone(440, 0.025, 'sine', 0.03, pan),
  uiClose: () => tone(330, 0.06, 'sine', 0.05),
  uiTab: () => tone(550, 0.04, 'triangle', 0.05),
  uiPlanet: () => { tone(400, 0.06, 'triangle', 0.05); setTimeout(() => tone(500, 0.06, 'triangle', 0.04), 60); },
  uiModal: () => tone(770, 0.05, 'sine', 0.04),
  uiBack: () => tone(330, 0.05, 'sine', 0.04),
  uiConfirm: () => tone(660, 0.08, 'sine', 0.07),

  // --- Feedback (7) ---
  success: () => { tone(523, 0.1, 'sine', 0.1); setTimeout(() => tone(659, 0.1, 'sine', 0.1), 80); setTimeout(() => tone(784, 0.12, 'sine', 0.1), 160); },
  error: () => tone(180, 0.25, 'sawtooth', 0.08),
  warn: () => { tone(440, 0.1, 'square', 0.04); setTimeout(() => tone(350, 0.15, 'square', 0.04), 100); },
  notify: () => tone(880, 0.08, 'sine', 0.07),
  notifyInfo: () => tone(990, 0.05, 'sine', 0.05),
  notifyDanger: () => { tone(200, 0.12, 'sawtooth', 0.06); setTimeout(() => tone(150, 0.15, 'sawtooth', 0.05), 120); },
  milestone: () => { tone(523, 0.12, 'sine', 0.1); setTimeout(() => tone(659, 0.12, 'sine', 0.1), 100); setTimeout(() => tone(784, 0.12, 'sine', 0.1), 200); setTimeout(() => tone(1047, 0.2, 'sine', 0.1), 300); },

  // --- Construcción (6) ---
  buildStart: () => tone(300, 0.06, 'triangle', 0.07),
  buildComplete: () => {
    const base = 523.25;
    tone(base, 0.08, 'sine', 0.10);
    setTimeout(() => tone(base * 1.25, 0.08, 'sine', 0.09), 60);
    setTimeout(() => tone(base * 1.5, 0.1, 'sine', 0.08), 120);
    setTimeout(() => tone(base * 1.875, 0.12, 'sine', 0.07), 180);
  },

  battleStart: () => { tone(180, 0.18, 'sawtooth', 0.08); setTimeout(() => noise(0.25, 0.05), 80); },
  federationFormed: () => { chord([440, 554, 659], 0.18, 'sine', 0.08); setTimeout(() => chord([523, 659, 784], 0.22, 'sine', 0.07), 220); },
  crisisAlert: () => { tone(220, 0.12, 'square', 0.07); setTimeout(() => tone(196, 0.18, 'sawtooth', 0.06), 90); },
  buildQueue: () => tone(440, 0.04, 'triangle', 0.05),
  buildCancel: () => tone(250, 0.08, 'triangle', 0.05),
  upgradeAvail: () => tone(800, 0.06, 'sine', 0.06),
  storageFull: () => { tone(200, 0.15, 'square', 0.04); setTimeout(() => tone(180, 0.2, 'square', 0.03), 150); },

  // --- Investigación (4) ---
  researchStart: () => tone(520, 0.06, 'triangle', 0.06),
  researchComplete: () => {
    chord([880, 1100, 1320, 1650], 0.25, 'sine', 0.06);
  },
  researchCancel: () => tone(300, 0.08, 'triangle', 0.05),
  techUnlock: () => { tone(600, 0.1, 'sine', 0.08); setTimeout(() => tone(750, 0.1, 'sine', 0.08), 80); setTimeout(() => tone(900, 0.15, 'sine', 0.08), 160); },

  // --- Astillero / Naves (5) ---
  shipBuilt: () => tone(500, 0.08, 'sawtooth', 0.06),
  shipQueue: () => tone(420, 0.04, 'triangle', 0.05),
  fleetLaunch: () => { noise(0.08, 0.06); tone(200, 0.15, 'sawtooth', 0.05); },
  fleetArrive: () => tone(220, 0.3, 'triangle', 0.06),
  fleetRecall: () => tone(350, 0.1, 'triangle', 0.05),

  // --- Combate (6) ---
  combat: () => { noise(0.15, 0.08); setTimeout(() => tone(80, 0.15, 'sawtooth', 0.1), 50); },
  combatWin: () => { tone(523, 0.12); setTimeout(() => tone(784, 0.12), 100); setTimeout(() => tone(1047, 0.2), 200); },
  combatLose: () => tone(150, 0.4, 'sawtooth', 0.07),
  combatHit: () => noise(0.05, 0.04),
  combatMiss: () => tone(3000, 0.02, 'sine', 0.02),
  shieldHit: () => tone(800, 0.03, 'sine', 0.05),

  // --- Economía / Recursos (5) ---
  resource: () => tone(1200, 0.03, 'sine', 0.04),
  resourceFull: () => tone(600, 0.08, 'sine', 0.05),
  trade: () => { tone(400, 0.08, 'triangle', 0.06); setTimeout(() => tone(600, 0.08, 'triangle', 0.06), 80); },
  deficit: () => tone(150, 0.2, 'square', 0.04),
  profit: () => tone(900, 0.06, 'sine', 0.05),

  // --- Eventos / Aleatorios (6) ---
  event: () => { tone(400, 0.1, 'triangle', 0.07); setTimeout(() => tone(600, 0.1, 'triangle', 0.07), 100); },
  eventAlien: () => { tone(200, 0.2, 'sawtooth', 0.05); setTimeout(() => tone(400, 0.15, 'sawtooth', 0.05), 150); },
  eventAsteroid: () => noise(0.2, 0.06),
  eventStorm: () => { noise(0.3, 0.04); tone(60, 0.4, 'sine', 0.03); },
  eventMerchant: () => { tone(500, 0.08, 'triangle', 0.06); setTimeout(() => tone(700, 0.08, 'triangle', 0.06), 100); },
  eventNebula: () => { tone(220, 0.4, 'sine', 0.04); tone(330, 0.3, 'sine', 0.03); },

  // --- Juego (4) ---
  colony: () => { tone(350, 0.12); setTimeout(() => tone(440, 0.12), 100); setTimeout(() => tone(550, 0.15), 200); },
  spy: () => tone(1000, 0.05, 'sine', 0.04),
  scan: () => { tone(600, 0.06, 'sine', 0.04); setTimeout(() => tone(800, 0.06, 'sine', 0.04), 60); setTimeout(() => tone(1000, 0.08, 'sine', 0.04), 120); },
  countdown: () => tone(440, 0.03, 'square', 0.03),

  // --- Diplomacia y Alianzas (5) ---
  diploTransmission: () => {
    // Holographic digital frequency incoming alert
    tone(880, 0.05, 'triangle', 0.05);
    setTimeout(() => tone(987, 0.05, 'triangle', 0.05), 50);
    setTimeout(() => tone(1046, 0.08, 'sine', 0.06), 100);
  },
  diploTreaty: () => {
    // Grand majestic alliance/peace chord
    chord([329.63, 392, 523.25, 659.25], 0.6, 'sine', 0.07);
  },
  diploWar: () => {
    // Deep heavy war horns and emergency sirens
    tone(110, 0.4, 'sawtooth', 0.15);
    setTimeout(() => tone(95, 0.5, 'sawtooth', 0.12), 150);
    setTimeout(() => tone(120, 0.3, 'square', 0.08), 350);
  },
  diploTribute: () => {
    // Rhythmic digital transaction sound
    tone(440, 0.05, 'sine', 0.06);
    setTimeout(() => tone(880, 0.05, 'sine', 0.05), 40);
    setTimeout(() => tone(1320, 0.08, 'sine', 0.05), 80);
  },
  diploMarketBuy: () => {
    // Specialized shipyard engine ignition sound
    noise(0.12, 0.08);
    tone(300, 0.2, 'sawtooth', 0.05);
    setTimeout(() => tone(600, 0.15, 'triangle', 0.04), 80);
  },
};

// --- Ambient (Desactivado para reproducir únicamente Música-menu) ---
export function startAmbient() {}
export function stopAmbient() {}

export function initAudio() {
  getCtx();
}

export function playMenuMusic() {
  try {
    const context = getCtx();
    if (context && context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    if (!menuMusic) {
      const src = menuMusicUrl || './Musica-menu.ogg';
      menuMusic = new Audio(src);
      menuMusic.loop = true;
      menuMusic.volume = BASE_VOLUME;
      menuMusic.muted = muted;
    }
    if (menuMusic.paused) {
      const playPromise = menuMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log("Music play retry queued (waiting for user interaction):", e);
        });
      }
    }
  } catch (e) {
    console.error("Failed to play menu music:", e);
  }
}

export function stopMenuMusic() {
  try {
    if (menuMusic && !menuMusic.paused) {
      menuMusic.pause();
    }
  } catch (e) {}
}
