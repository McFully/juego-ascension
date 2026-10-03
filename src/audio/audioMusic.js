const inGameMusicUrl = './Musica-menu.ogg';
const mainMenuMusicUrl = './main-menu.ogg';
import { getCtx, muted, musicVol, BASE_MUSIC_MAX } from './audioCore.js';

let currentBgMusic = null;
let currentBgMusicType = null; // 'main_menu' | 'in_game'
let currentMinistryMusic = null;
let currentMinistryId = null;

export function releaseAudio(audio) {
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
    if (typeof audio.load === 'function') audio.load();
  } catch (_) {}
}

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

    // Si había otro track sonando, detenerlo y liberarlo
    if (currentBgMusic) {
      releaseAudio(currentBgMusic);
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
  if (currentBgMusic) {
    releaseAudio(currentBgMusic);
    currentBgMusic = null;
    currentBgMusicType = null;
  }
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
  stopSystemMusic();
  if (!ministryId) {
    stopMinistryMusic();
    return;
  }
  const fileName = MINISTRY_AUDIO_FILES[ministryId];
  if (!fileName) {
    stopMinistryMusic();
    return;
  }

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
        if (currentMinistryMusic === audio) {
          releaseAudio(audio);
          const fallbackAudio = new Audio(`/audio/ministries/${fileName}`);
          fallbackAudio.loop = true;
          fallbackAudio.volume = targetVol;
          fallbackAudio.muted = muted;
          currentMinistryMusic = fallbackAudio;
          fallbackAudio.play().catch(() => {});
        }
      });
    }
  } catch (err) {
    console.warn('[Audio] No se pudo reproducir música de ministerio:', ministryId, err);
  }
}

export function stopMinistryMusic(resumeMenu = false) {
  if (currentMinistryMusic) {
    releaseAudio(currentMinistryMusic);
    currentMinistryMusic = null;
    currentMinistryId = null;
  }
  if (resumeMenu) {
    playInGameMusic();
  }
}

export const SYSTEM_AUDIO_FILES = {
  galaxy: 'musica-sistema-galaxia.ogg',
  colony_network: 'musica-sistema-colonias.ogg',
  overview: 'musica-sistema-planeta.ogg',
  fleet: 'musica-sistema-flota.ogg',
  shipyard: 'musica-sistema-astillero.ogg',
  shipDesign: 'musica-sistema-diseno-naves.ogg',
  combat: 'musica-sistema-combate.ogg',
  defense: 'musica-sistema-defensas.ogg',
  missiles: 'musica-sistema-misiles.ogg',
  research: 'musica-sistema-investigacion.ogg',
  techTree: 'musica-sistema-investigacion.ogg',
  market: 'musica-sistema-mercado.ogg',
  blackMarket: 'musica-sistema-mercado-negro.ogg',
  diplomacy: 'musica-sistema-diplomacia.ogg',
  communications: 'musica-sistema-comunicaciones.ogg',
  missions: 'musica-sistema-misiones.ogg',
  moon: 'musica-sistema-luna.ogg',
  ascension: 'musica-sistema-ascension.ogg',
  stats: 'musica-sistema-archivo-stats.ogg',
  buildings: 'musica-sistema-planeta.ogg',
  telemetry: 'musica-sistema-archivo-stats.ogg',
  imperial_hub: 'musica-sistema-mando-imperial.ogg',
  imperial_council: 'musica-sistema-diplomacia.ogg',
  imperial_senate: 'musica-sistema-senado-imperial.ogg'
};

let currentSystemMusic = null;
let currentSystemId = null;

export function getCurrentSystemMusic() { return currentSystemMusic; }

export function playSystemMusic(systemId) {
  stopMinistryMusic();
  if (!systemId) {
    stopSystemMusic();
    return;
  }
  const fileName = SYSTEM_AUDIO_FILES[systemId];
  if (!fileName) {
    stopSystemMusic();
    return;
  }

  if (currentSystemId === systemId && currentSystemMusic) {
    if (currentSystemMusic.paused) {
      currentSystemMusic.play().catch(() => {});
    }
    return;
  }

  stopMenuMusic();
  stopSystemMusic();

  try {
    const context = getCtx();
    if (context && context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const targetVol = muted ? 0 : (musicVol * BASE_MUSIC_MAX);
    const audioPath = `./audio/systems/${fileName}`;
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = targetVol;
    audio.muted = muted;

    currentSystemMusic = audio;
    currentSystemId = systemId;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (currentSystemMusic === audio) {
          releaseAudio(audio);
          const fallbackAudio = new Audio(`/audio/systems/${fileName}`);
          fallbackAudio.loop = true;
          fallbackAudio.volume = targetVol;
          fallbackAudio.muted = muted;
          currentSystemMusic = fallbackAudio;
          fallbackAudio.play().catch(() => {});
        }
      });
    }
  } catch (err) {
    console.warn('[Audio] No se pudo reproducir música de sistema:', systemId, err);
  }
}

export function stopSystemMusic(resumeMenu = false) {
  if (currentSystemMusic) {
    releaseAudio(currentSystemMusic);
    currentSystemMusic = null;
    currentSystemId = null;
  }
  if (resumeMenu) {
    playInGameMusic();
  }
}

/**
 * Punto 49: Transición al silencio cósmico profundo al abrir el mapa estelar.
 * Reduce el volumen de música de fondo a un sutil murmullo (18%) para sumergir al comandante en el vacío galáctico.
 */
export function transitionToCosmicSilence(isCosmic = true) {
  const targetBg = currentSystemMusic || currentMinistryMusic || currentBgMusic;
  if (!targetBg) return;
  const baseTarget = muted ? 0 : (musicVol * BASE_MUSIC_MAX);
  const finalVol = isCosmic ? (baseTarget * 0.18) : baseTarget;
  targetBg.volume = finalVol;
}

