import { getCtx, getMasterGain, getSfxGain, getWarGain, getOperationsGain, muted } from './audioCore.js';

// Limitador de concurrencia y debounce para evitar audio clipping y saturación
const lastSoundTimes = new Map();
const MIN_SOUND_INTERVAL_MS = 38;

function shouldThrottleSound(key) {
  const now = performance.now();
  const last = lastSoundTimes.get(key) || 0;
  if (now - last < MIN_SOUND_INTERVAL_MS) return true;
  lastSoundTimes.set(key, now);
  return false;
}

function tone(freq, dur, type = 'sine', vol = 0.12, pan = 0, channel = 'ui') {
  if (shouldThrottleSound(`tone_${channel}_${freq}`)) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain);
    const targetGain = (channel === 'war' ? getWarGain() : channel === 'ops' ? getOperationsGain() : getSfxGain()) || getMasterGain();
    if (pan !== 0 && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.setValueAtTime(pan, c.currentTime);
      gain.connect(panner);
      panner.connect(targetGain);
    } else {
      gain.connect(targetGain);
    }
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch (_) {}
}

function noise(dur, vol = 0.06, pan = 0, channel = 'ui') {
  if (shouldThrottleSound(`noise_${channel}`)) return;
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
    const targetGain = (channel === 'war' ? getWarGain() : channel === 'ops' ? getOperationsGain() : getSfxGain()) || getMasterGain();
    if (pan !== 0 && c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.setValueAtTime(pan, c.currentTime);
      gain.connect(panner);
      panner.connect(targetGain);
    } else {
      gain.connect(targetGain);
    }
    src.start(c.currentTime);
    src.stop(c.currentTime + dur);
  } catch (_) {}
}

function chord(freqs, dur, type = 'sine', vol = 0.06, channel = 'ui') {
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
      const targetGain = (channel === 'war' ? getWarGain() : channel === 'ops' ? getOperationsGain() : getSfxGain()) || getMasterGain();
      gain.connect(targetGain);
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
  dialogChar: (freq = 600) => tone(freq, 0.02, 'square', 0.02),

  // --- Efectos Hápticos y Cuánticos Tácticos (Punto 9 y Diegéticos 43/45) ---
  quantumBeep: () => { tone(1450, 0.03, 'sine', 0.05); setTimeout(() => tone(1820, 0.04, 'sine', 0.04), 30); },
  shieldHum: () => { tone(110, 0.25, 'triangle', 0.08); tone(220, 0.2, 'sine', 0.05); },
  gaussCannon: () => { tone(90, 0.12, 'sawtooth', 0.12, 0, 'war'); setTimeout(() => noise(0.18, 0.08, 0, 'war'), 30); },
  hyperspaceJump: () => {
    tone(200, 0.15, 'sawtooth', 0.06);
    setTimeout(() => tone(450, 0.18, 'sine', 0.08), 80);
    setTimeout(() => tone(850, 0.22, 'sine', 0.07), 160);
  },
  airlockDepressurize: () => {
    // Siseo de gas comprimido con micro-golpe de pestillo electromecánico
    noise(0.45, 0.09, 0, 'ui');
    tone(85, 0.08, 'square', 0.07, 0, 'ui');
    setTimeout(() => noise(0.25, 0.04, 0, 'ui'), 80);
  },
  heavyRelayClick: () => {
    // Click de doble contacto de relé industrial de 24V
    tone(750, 0.015, 'triangle', 0.07, 0, 'ui');
    setTimeout(() => tone(420, 0.02, 'square', 0.06, 0, 'ui'), 18);
  },
  tacticalSonarPing: () => {
    // Ping acústico de radar / sonar táctico con decaimiento senoidal puro
    tone(1800, 0.35, 'sine', 0.06, 0, 'ui');
    setTimeout(() => tone(1800, 0.2, 'sine', 0.02, 0.2, 'ui'), 120);
  },

  // --- Feedback (7) ---
  success: () => { tone(523, 0.1, 'sine', 0.1); setTimeout(() => tone(659, 0.1, 'sine', 0.1), 80); setTimeout(() => tone(784, 0.12, 'sine', 0.1), 160); },
  error: () => tone(180, 0.25, 'sawtooth', 0.08),
  warn: () => { tone(440, 0.1, 'square', 0.04); setTimeout(() => tone(350, 0.15, 'square', 0.04), 100); },
  notify: () => tone(880, 0.08, 'sine', 0.07),
  notifyInfo: () => tone(990, 0.05, 'sine', 0.05),
  notifyDanger: () => { tone(200, 0.12, 'sawtooth', 0.06); setTimeout(() => tone(150, 0.15, 'sawtooth', 0.05), 120); },
  milestone: () => { tone(523, 0.12, 'sine', 0.1); setTimeout(() => tone(659, 0.12, 'sine', 0.1), 100); setTimeout(() => tone(784, 0.12, 'sine', 0.1), 200); setTimeout(() => tone(1047, 0.2, 'sine', 0.1), 300); },

  // --- Construcción (6) ---
  buildStart: () => tone(300, 0.06, 'triangle', 0.07, 0, 'ops'),
  buildComplete: () => {
    const base = 523.25;
    tone(base, 0.08, 'sine', 0.10, 0, 'ops');
    setTimeout(() => tone(base * 1.25, 0.08, 'sine', 0.09, 0, 'ops'), 60);
    setTimeout(() => tone(base * 1.5, 0.1, 'sine', 0.08, 0, 'ops'), 120);
    setTimeout(() => tone(base * 1.875, 0.12, 'sine', 0.07, 0, 'ops'), 180);
  },

  battleStart: () => { tone(180, 0.18, 'sawtooth', 0.08); setTimeout(() => noise(0.25, 0.05), 80); },
  federationFormed: () => { chord([440, 554, 659], 0.18, 'sine', 0.08); setTimeout(() => chord([523, 659, 784], 0.22, 'sine', 0.07), 220); },
  crisisAlert: () => { tone(220, 0.12, 'square', 0.07); setTimeout(() => tone(196, 0.18, 'sawtooth', 0.06), 90); },
  buildQueue: () => tone(440, 0.04, 'triangle', 0.05, 0, 'ops'),
  buildCancel: () => tone(250, 0.08, 'triangle', 0.05, 0, 'ops'),
  upgradeAvail: () => tone(800, 0.06, 'sine', 0.06, 0, 'ops'),
  storageFull: () => { tone(200, 0.15, 'square', 0.04); setTimeout(() => tone(180, 0.2, 'square', 0.03), 150); },

  // --- Investigación (4) ---
  researchStart: () => tone(520, 0.06, 'triangle', 0.06, 0, 'ops'),
  researchComplete: () => {
    // Fanfarria pentatónica militar ascendente (Punto 48): C5, D5, E5, G5, A5 y C6 brillante
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    pentatonic.forEach((freq, idx) => {
      setTimeout(() => {
        tone(freq, 0.28, 'triangle', 0.07, (idx % 2 === 0 ? -0.2 : 0.2), 'ops');
      }, idx * 65);
    });
    setTimeout(() => chord([523.25, 659.25, 783.99, 1046.5], 0.6, 'sine', 0.08, 'ops'), 420);
  },
  researchCancel: () => tone(300, 0.08, 'triangle', 0.05, 0, 'ops'),
  techUnlock: () => { tone(600, 0.1, 'sine', 0.08, 0, 'ops'); setTimeout(() => tone(750, 0.1, 'sine', 0.08, 0, 'ops'), 80); setTimeout(() => tone(900, 0.15, 'sine', 0.08, 0, 'ops'), 160); },

  // --- Astillero / Naves (5) ---
  shipBuilt: () => tone(500, 0.08, 'sawtooth', 0.06, 0, 'ops'),
  shipQueue: () => tone(420, 0.04, 'triangle', 0.05, 0, 'ops'),
  fleetLaunch: () => { noise(0.08, 0.06); tone(200, 0.15, 'sawtooth', 0.05); },
  fleetArrive: () => tone(220, 0.3, 'triangle', 0.06),
  fleetRecall: () => tone(350, 0.1, 'triangle', 0.05),

  // --- Combate (6) y Radiochatter Táctico (Punto 44) ---
  combat: () => { noise(0.15, 0.08, 0, 'war'); setTimeout(() => tone(80, 0.15, 'sawtooth', 0.1, 0, 'war'), 50); },
  combatWin: () => { tone(523, 0.12, 'sine', 0.09, 0, 'war'); setTimeout(() => tone(784, 0.12, 'sine', 0.09, 0, 'war'), 100); setTimeout(() => tone(1047, 0.2, 'sine', 0.1, 0, 'war'), 200); },
  combatLose: () => tone(150, 0.4, 'sawtooth', 0.07, 0, 'war'),
  combatHit: () => noise(0.05, 0.04, 0, 'war'),
  combatMiss: () => tone(3000, 0.02, 'sine', 0.02, 0, 'war'),
  shieldHit: () => tone(800, 0.03, 'sine', 0.05, 0, 'war'),
  squadronRadioChatter: () => {
    // Ráfaga filtrada de estática de transmisiones y micro-tonos de squelch militar
    noise(0.06, 0.03, -0.2, 'war');
    setTimeout(() => tone(1250, 0.02, 'square', 0.02, -0.1, 'war'), 25);
    setTimeout(() => noise(0.12, 0.04, 0.3, 'war'), 60);
    setTimeout(() => tone(840, 0.03, 'square', 0.025, 0.2, 'war'), 140);
  },

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
    tone(880, 0.05, 'triangle', 0.05);
    setTimeout(() => tone(987, 0.05, 'triangle', 0.05), 50);
    setTimeout(() => tone(1046, 0.08, 'sine', 0.06), 100);
  },
  diploTreaty: () => {
    chord([329.63, 392, 523.25, 659.25], 0.6, 'sine', 0.07);
  },
  diploWar: () => {
    tone(110, 0.4, 'sawtooth', 0.15);
    setTimeout(() => tone(95, 0.5, 'sawtooth', 0.12), 150);
    setTimeout(() => tone(120, 0.3, 'square', 0.08), 350);
  },
  diploAlliance: () => {
    chord([261.63, 329.63, 392, 523.25], 0.5, 'sine', 0.08);
    setTimeout(() => chord([329.63, 440, 523.25, 659.25], 0.6, 'sine', 0.07), 250);
  },
  diploBreak: () => {
    tone(220, 0.2, 'sawtooth', 0.08);
    setTimeout(() => tone(164.81, 0.3, 'sawtooth', 0.07), 120);
  },

  // --- Estructuras Megaproyecto y Maravillas (4) ---
  wonderStart: () => {
    chord([220, 277.18, 329.63], 0.3, 'triangle', 0.08);
    setTimeout(() => chord([277.18, 329.63, 440], 0.4, 'triangle', 0.07), 200);
  },
  wonderComplete: () => {
    chord([261.63, 329.63, 392, 523.25], 0.4, 'sine', 0.1);
    setTimeout(() => chord([329.63, 392, 523.25, 659.25], 0.5, 'sine', 0.1), 200);
    setTimeout(() => chord([392, 523.25, 659.25, 783.99, 1046.5], 0.8, 'sine', 0.09), 450);
  },
  wonderPhase: () => {
    tone(440, 0.1, 'sine', 0.06);
    setTimeout(() => tone(554.37, 0.12, 'sine', 0.06), 80);
    setTimeout(() => tone(659.25, 0.18, 'sine', 0.05), 160);
  },
  wonderCancel: () => {
    tone(300, 0.2, 'sawtooth', 0.05);
    setTimeout(() => tone(600, 0.15, 'triangle', 0.04), 80);
  },

  // --- Paisajes Sonoros Procedimentales de Biomas (Punto 42) ---
  biomeAmbience: (biome = 'terran') => {
    switch (biome) {
      case 'volcanic':
      case 'magma':
        // Borboteo grave de baja frecuencia y ebullición geotérmica
        tone(65, 0.45, 'sawtooth', 0.04, -0.1, 'ui');
        setTimeout(() => noise(0.3, 0.03, 0.1, 'ui'), 120);
        break;
      case 'ocean':
      case 'water':
      case 'ice':
      case 'arctic':
        // Ráfaga eólica polar / oleaje suave
        noise(0.6, 0.025, 0, 'ui');
        setTimeout(() => tone(220, 0.35, 'sine', 0.02, 0.1, 'ui'), 80);
        break;
      case 'desert':
      case 'arid':
        // Siseo seco de arena y viento cálido
        noise(0.4, 0.025, 0.2, 'ui');
        break;
      case 'gas_giant':
      case 'plasma':
        // Zumbido resonante de alta presión atmosférica
        tone(95, 0.5, 'triangle', 0.03, 0, 'ui');
        tone(190, 0.4, 'sine', 0.02, 0, 'ui');
        break;
      default:
        // Bioma terran / templado: brisa tenue imperceptible
        noise(0.25, 0.015, 0, 'ui');
        break;
    }
  },
};


