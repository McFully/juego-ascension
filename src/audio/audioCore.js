// Configuración de volúmenes (0 a 1) y mute con persistencia local
const STORAGE_KEY = 'ascension_audio_settings';

function loadPersistedAudio() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (_) {}
  return null;
}

const savedAudio = loadPersistedAudio();
export let muted = savedAudio ? !!savedAudio.muted : false;
export let masterVol = savedAudio && typeof savedAudio.masterVolume === 'number' ? savedAudio.masterVolume : 1.0;
export let musicVol = savedAudio && typeof savedAudio.musicVolume === 'number' ? savedAudio.musicVolume : 0.5;
export let sfxVol = savedAudio && typeof savedAudio.sfxVolume === 'number' ? savedAudio.sfxVolume : 0.5;
export let warVol = savedAudio && typeof savedAudio.warVolume === 'number' ? savedAudio.warVolume : 0.6;
export let voiceVol = savedAudio && typeof savedAudio.voiceVolume === 'number' ? savedAudio.voiceVolume : 0.5;
export let operationsVol = savedAudio && typeof savedAudio.operationsVolume === 'number' ? savedAudio.operationsVolume : 0.5;

export function persistAudio() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        muted,
        masterVolume: masterVol,
        musicVolume: musicVol,
        sfxVolume: sfxVol,
        warVolume: warVol,
        voiceVolume: voiceVol,
        operationsVolume: operationsVol
      }));
    }
  } catch (_) {}
}

export const BASE_MASTER_MAX = 1.0;
export const BASE_MUSIC_MAX = 0.35;
export const BASE_SFX_MAX = 0.4;
export const BASE_WAR_MAX = 0.5;
export const BASE_VOICE_MAX = 0.8;
export const BASE_OPS_MAX = 0.45;

let ctx = null;
let masterGain = null;
let sfxGain = null;
let warGain = null;
let operationsGain = null;
let muffleFilter = null;
let isMuffled = false;

export function getCtx() {
  if (!ctx && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      ctx = new AudioCtx();
      
      // Filtro pasa-bajos diegético (BiquadFilter) para atenuar frecuencias al abrir modales
      muffleFilter = ctx.createBiquadFilter();
      muffleFilter.type = 'lowpass';
      muffleFilter.frequency.setValueAtTime(20000, ctx.currentTime);
      muffleFilter.Q.setValueAtTime(1.0, ctx.currentTime);

      masterGain = ctx.createGain();
      sfxGain = ctx.createGain();
      warGain = ctx.createGain();
      operationsGain = ctx.createGain();

      masterGain.gain.value = muted ? 0 : (masterVol * BASE_MASTER_MAX);
      sfxGain.gain.value = muted ? 0 : (sfxVol * BASE_SFX_MAX);
      warGain.gain.value = muted ? 0 : (warVol * BASE_WAR_MAX);
      operationsGain.gain.value = muted ? 0 : (operationsVol * BASE_OPS_MAX);

      // Conexión del grafo: sfx -> master; war -> master; ops -> master; master -> muffleFilter -> destination
      sfxGain.connect(masterGain);
      warGain.connect(masterGain);
      operationsGain.connect(masterGain);
      masterGain.connect(muffleFilter);
      muffleFilter.connect(ctx.destination);
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function getMasterGain() { return masterGain; }
export function getSfxGain() { return sfxGain; }
export function getWarGain() { return warGain; }
export function getOperationsGain() { return operationsGain; }
export function getMuffleFilter() { return muffleFilter; }

/**
 * Activa o desactiva el filtro pasa-bajos diegético (efecto 'a través de escotilla')
 * Suaviza la transición acústica mediante una rampa exponencial realista de 120ms.
 */
export function setMuffle(enable = true) {
  isMuffled = !!enable;
  try {
    const c = getCtx();
    if (!c || !muffleFilter) return;
    const targetFreq = isMuffled ? 420 : 20000;
    muffleFilter.frequency.cancelScheduledValues(c.currentTime);
    muffleFilter.frequency.exponentialRampToValueAtTime(
      Math.max(20, targetFreq),
      c.currentTime + 0.12
    );
  } catch (_) {}
}

export function isMuffleActive() {
  return isMuffled;
}

export function setMutedState(value) {
  muted = !!value;
  if (masterGain) masterGain.gain.value = muted ? 0 : (masterVol * BASE_MASTER_MAX);
  if (sfxGain) sfxGain.gain.value = muted ? 0 : (sfxVol * BASE_SFX_MAX);
  if (warGain) warGain.gain.value = muted ? 0 : (warVol * BASE_WAR_MAX);
  if (operationsGain) operationsGain.gain.value = muted ? 0 : (operationsVol * BASE_OPS_MAX);
}

export function setMasterVolState(val) {
  masterVol = Math.max(0, Math.min(1, Number(val) || 0));
  if (masterGain) masterGain.gain.value = muted ? 0 : (masterVol * BASE_MASTER_MAX);
}

export function setMusicVolState(val) {
  musicVol = Math.max(0, Math.min(1, Number(val) || 0));
}

export function setSfxVolState(val) {
  sfxVol = Math.max(0, Math.min(1, Number(val) || 0));
  if (sfxGain) sfxGain.gain.value = muted ? 0 : (sfxVol * BASE_SFX_MAX);
}

export function setWarVolState(val) {
  warVol = Math.max(0, Math.min(1, Number(val) || 0));
  if (warGain) warGain.gain.value = muted ? 0 : (warVol * BASE_WAR_MAX);
}

export function setVoiceVolState(val) {
  voiceVol = Math.max(0, Math.min(1, Number(val) || 0));
}

export function setOperationsVolState(val) {
  operationsVol = Math.max(0, Math.min(1, Number(val) || 0));
  if (operationsGain) operationsGain.gain.value = muted ? 0 : (operationsVol * BASE_OPS_MAX);
}
