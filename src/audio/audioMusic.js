import inGameMusicUrl from '/Musica-menu.ogg?url';
import mainMenuMusicUrl from '/main-menu.ogg?url';
import { getCtx, muted, musicVol, BASE_MUSIC_MAX } from './audioCore.js';

let currentBgMusic = null;
let currentBgMusicType = null; // 'main_menu' | 'in_game'
let currentMinistryMusic = null;
let currentMinistryId = null;

export function getCurrentBgMusic() { return currentBgMusic; }
export function getCurrentMinistryMusic() { return currentMinistryMusic; }

export function playTrack(type = 'main_menu') {
  try {
    if (currentMinistryMusic && !currentMinistryMusic.paused) {
      return;
    }

    const context = getCtx();
    if (context && context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    const targetVol = muted ? 0 : (musicVol * BASE_MUSIC_MAX);

    // Si ya está sonando este mismo tipo de track, solo ajustar volumen
    if (currentBgMusic && currentBgMusicType === type) {
      currentBgMusic.volume = targetVol;
      currentBgMusic.muted = muted;
      if (currentBgMusic.paused) {
        currentBgMusic.play().catch(() => {});
      }
      return;
    }

    // Si había otro track sonando, detenerlo
    if (currentBgMusic) {
      try {
        currentBgMusic.pause();
        currentBgMusic.currentTime = 0;
      } catch (_) {}
      currentBgMusic = null;
    }

    const src = type === 'main_menu'
      ? (mainMenuMusicUrl || './main-menu.ogg')
      : (inGameMusicUrl || './Musica-menu.ogg');

    currentBgMusic = new Audio(src);
    currentBgMusicType = type;
    currentBgMusic.loop = true;
    currentBgMusic.volume = targetVol;
    currentBgMusic.muted = muted;

    const playPromise = currentBgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (e.name === 'AbortError') return;
        console.log("Track play queued:", e);
      });
    }
  } catch (e) {
    console.error("Failed to play track:", e);
  }
}

export function playMenuMusic() {
  playTrack('main_menu');
}

export function playInGameMusic() {
  playTrack('in_game');
}

export function stopMenuMusic() {
  try {
    if (currentBgMusic && !currentBgMusic.paused) {
      currentBgMusic.pause();
    }
  } catch (e) {}
}

export const MINISTRY_AUDIO_FILES = {
  infra: 'musica-ministerio-infra.ogg',
  resources: 'musica-ministerio-recursos.ogg',
  industry: 'musica-ministerio-industria.ogg',
  economy: 'musica-ministerio-economia.ogg',
  energy: 'musica-ministerio-energia.ogg',
  science: 'musica-ministerio-ciencia.ogg',
  innovation: 'musica-ministerio-innovacion.ogg',
  cybernetics: 'musica-ministerio-cibernetica.ogg',
  defense: 'musica-ministerio-defensa.ogg',
  war: 'musica-ministerio-guerra.ogg',
  transport: 'musica-ministerio-transporte.ogg',
  logistics: 'musica-ministerio-logistica.ogg',
  biosphere: 'musica-ministerio-biosfera.ogg',
  agriculture: 'musica-ministerio-agricultura.ogg',
  civics: 'musica-ministerio-civiles.ogg',
  diplomacy: 'musica-ministerio-diplomacia.ogg',
  intel: 'musica-ministerio-inteligencia.ogg',
  justice: 'musica-ministerio-justicia.ogg',
  culture: 'musica-ministerio-cultura.ogg'
};

export function playMinistryMusic(ministryId) {
  if (!ministryId) return;
  const fileName = MINISTRY_AUDIO_FILES[ministryId];
  if (!fileName) return;

  if (currentMinistryId === ministryId && currentMinistryMusic) {
    if (currentMinistryMusic.paused) {
      currentMinistryMusic.play().catch(() => {});
    }
    return;
  }

  stopMenuMusic();
  stopMinistryMusic();

  try {
    const context = getCtx();
    if (context && context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const targetVol = muted ? 0 : (musicVol * BASE_MUSIC_MAX);
    const audioPath = `./audio/ministries/${fileName}`;
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = targetVol;
    audio.muted = muted;

    currentMinistryMusic = audio;
    currentMinistryId = ministryId;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        const fallbackAudio = new Audio(`/audio/ministries/${fileName}`);
        fallbackAudio.loop = true;
        fallbackAudio.volume = targetVol;
        fallbackAudio.muted = muted;
        currentMinistryMusic = fallbackAudio;
        fallbackAudio.play().catch(() => {});
      });
    }
  } catch (err) {
    console.warn('[Audio] No se pudo reproducir música de ministerio:', ministryId, err);
  }
}

export function stopMinistryMusic(resumeMenu = false) {
  if (currentMinistryMusic) {
    try {
      currentMinistryMusic.pause();
      currentMinistryMusic.currentTime = 0;
      currentMinistryMusic = null;
      currentMinistryId = null;
    } catch (_) {}
  }
  if (resumeMenu) {
    playInGameMusic();
  }
}

/**
 * Punto 49: Transición al silencio cósmico profundo al abrir el mapa estelar.
 * Reduce el volumen de música de fondo a un sutil murmullo (15%) para sumergir al comandante en el vacío galáctico.
 */
export function transitionToCosmicSilence(isCosmic = true) {
  const targetBg = currentMinistryMusic || currentBgMusic;
  if (!targetBg) return;
  const baseTarget = muted ? 0 : (musicVol * BASE_MUSIC_MAX);
  const finalVol = isCosmic ? (baseTarget * 0.18) : baseTarget;
  targetBg.volume = finalVol;
}
