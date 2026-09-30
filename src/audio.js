/**
 * Fachada unificada de Audio para Ascensión.
 * Re-exporta los dominios especializados (síntesis, música y voces)
 * con total retrocompatibilidad para el resto de la aplicación.
 */
import {
  getCtx,
  muted,
  masterVol,
  musicVol,
  sfxVol,
  warVol,
  voiceVol,
  operationsVol,
  persistAudio,
  BASE_MASTER_MAX,
  BASE_MUSIC_MAX,
  BASE_SFX_MAX,
  BASE_WAR_MAX,
  BASE_VOICE_MAX,
  BASE_OPS_MAX,
  setMutedState,
  setMasterVolState,
  setMusicVolState,
  setSfxVolState,
  setWarVolState,
  setVoiceVolState,
  setOperationsVolState,
  setMuffle,
  isMuffleActive
} from './audio/audioCore.js';

import { sfx } from './audio/audioSynth.js';
import {
  playTrack,
  playMenuMusic,
  playInGameMusic,
  stopMenuMusic,
  playMinistryMusic,
  stopMinistryMusic,
  playSystemMusic,
  stopSystemMusic,
  transitionToCosmicSilence,
  MINISTRY_AUDIO_FILES,
  SYSTEM_AUDIO_FILES,
  getCurrentBgMusic,
  getCurrentMinistryMusic,
  getCurrentSystemMusic
} from './audio/audioMusic.js';

import {
  playVoice,
  stopVoice,
  speakText,
  getCurrentVoiceAudio
} from './audio/audioVoices.js';

export function setMuted(value) {
  setMutedState(value);
  const effectiveMusic = value ? 0 : (musicVol * BASE_MUSIC_MAX);
  const bg = getCurrentBgMusic();
  if (bg) {
    bg.muted = !!value;
    bg.volume = effectiveMusic;
  }
  const minBg = getCurrentMinistryMusic();
  if (minBg) {
    minBg.muted = !!value;
    minBg.volume = effectiveMusic;
  }
  const sysBg = getCurrentSystemMusic();
  if (sysBg) {
    sysBg.muted = !!value;
    sysBg.volume = effectiveMusic;
  }
  const voice = getCurrentVoiceAudio();
  if (voice) {
    voice.muted = !!value;
    voice.volume = value ? 0 : (voiceVol * BASE_VOICE_MAX);
  }
  if (value && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  persistAudio();
}

export function isMuted() {
  return muted;
}

export function getAudioSettings() {
  return {
    muted,
    masterVolume: masterVol,
    musicVolume: musicVol,
    sfxVolume: sfxVol,
    warVolume: warVol,
    voiceVolume: voiceVol,
    operationsVolume: operationsVol
  };
}

export function setMasterVolume(val) {
  setMasterVolState(val);
  persistAudio();
}

export function setMusicVolume(val) {
  setMusicVolState(val);
  const effective = muted ? 0 : (musicVol * BASE_MUSIC_MAX);
  const bg = getCurrentBgMusic();
  if (bg) bg.volume = effective;
  const minBg = getCurrentMinistryMusic();
  if (minBg) minBg.volume = effective;
  const sysBg = getCurrentSystemMusic();
  if (sysBg) sysBg.volume = effective;
  persistAudio();
}

export function setSfxVolume(val) {
  setSfxVolState(val);
  persistAudio();
}

export function setWarVolume(val) {
  setWarVolState(val);
  persistAudio();
}

export function setVoiceVolume(val) {
  setVoiceVolState(val);
  const voice = getCurrentVoiceAudio();
  if (voice) voice.volume = muted ? 0 : (voiceVol * BASE_VOICE_MAX);
  persistAudio();
}

export function setOperationsVolume(val) {
  setOperationsVolState(val);
  persistAudio();
}

export { setMuffle, isMuffleActive };

export function initAudio() {
  getCtx();
}

export function startAmbient() {}
export function stopAmbient() {}

export {
  sfx,
  playTrack,
  playMenuMusic,
  playInGameMusic,
  stopMenuMusic,
  playMinistryMusic,
  stopMinistryMusic,
  playSystemMusic,
  stopSystemMusic,
  transitionToCosmicSilence,
  playVoice,
  stopVoice,
  speakText,
  getCurrentBgMusic,
  getCurrentMinistryMusic,
  getCurrentSystemMusic,
  MINISTRY_AUDIO_FILES,
  SYSTEM_AUDIO_FILES
};

// Global helper for quick access
if (typeof window !== 'undefined') {
  window.playSfx = (name, ...args) => {
    if (sfx[name]) sfx[name](...args);
  };
  window.playVoice = playVoice;
  window.speakText = speakText;
}
