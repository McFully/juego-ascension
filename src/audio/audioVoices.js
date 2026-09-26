import { muted, voiceVol, BASE_VOICE_MAX } from './audioCore.js';

let currentVoiceAudio = null;

export function getCurrentVoiceAudio() { return currentVoiceAudio; }

export function playVoice(voiceKey) {
  if (muted || !voiceKey) return;
  try {
    if (currentVoiceAudio) {
      currentVoiceAudio.pause();
      currentVoiceAudio = null;
    }
    const cleanKey = voiceKey.endsWith('.mp3') ? voiceKey : `${voiceKey}.mp3`;
    const audioPath = `./audio/voices/${cleanKey}`;
    const audio = new Audio(audioPath);
    const targetVol = muted ? 0 : (voiceVol * BASE_VOICE_MAX);
    audio.volume = targetVol;
    audio.muted = muted;
    currentVoiceAudio = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        const fallbackAudio = new Audio(`/audio/voices/${cleanKey}`);
        fallbackAudio.volume = targetVol;
        fallbackAudio.muted = muted;
        currentVoiceAudio = fallbackAudio;
        fallbackAudio.play().catch(() => {});
      });
    }
  } catch (err) {
    console.warn('[Audio HD] No se pudo reproducir voz offline:', voiceKey, err);
  }
}

export function stopVoice() {
  if (currentVoiceAudio) {
    try {
      currentVoiceAudio.pause();
      currentVoiceAudio = null;
    } catch (_) {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }
}

export function speakText(text, options = {}) {
  if (muted || !text || typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) return;

    const minister = options.minister || null;
    const ministerName = minister?.name?.toLowerCase() || '';
    const ministerTrait = minister?.trait?.toLowerCase() || '';

    // Detección de perfiles vocales según ministro asignado
    const isAi = !!options.isCybernetic || !!options.isAi || ministerName.includes('nodo') || ministerName.includes('épsilon') || ministerTrait.includes('sintético') || ministerTrait.includes('ia');
    const isFemale = ministerName.includes('dra.') || ministerName.includes('elena') || ministerName.includes('valeria') || ministerName.includes('lyanna') || ministerName.includes('solaria') || ministerName.includes('valerie') || ministerName.includes('ceres') || ministerName.includes('aurelia') || ministerName.includes('serafina') || ministerName.includes('lady');

    // Modulación acústica según el personaje
    let basePitch = options.pitch ?? (isAi ? 0.65 : isFemale ? 1.25 : 0.85);
    let baseRate = options.rate ?? (isAi ? 1.18 : isFemale ? 1.05 : 0.98);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'es-ES';
    utterance.rate = baseRate;
    utterance.pitch = basePitch;
    utterance.volume = Math.min(1, Math.max(0, voiceVol * BASE_VOICE_MAX));

    const voices = window.speechSynthesis.getVoices() || [];
    // Filtrar exclusivamente voces en español excluyendo sintetizadores mecánicos básicos (eSpeak, etc.)
    const esVoices = voices.filter(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      const isSpanish = l.startsWith('es') || l.includes('-es');
      const isBasicRobotic = n.includes('espeak') || n.includes('desktop') && !n.includes('natural');
      return isSpanish && !isBasicRobotic;
    });

    const pool = esVoices.length > 0 ? esVoices : voices.filter(v => (v.lang || '').toLowerCase().startsWith('es'));

    // Búsqueda de voces naturales HD (Microsoft Natural, Google Neural, Apple Premium, etc.)
    const hdVoices = pool.filter(v => {
      const n = v.name.toLowerCase();
      return n.includes('natural') || n.includes('neural') || n.includes('online') || n.includes('premium') || n.includes('enhanced');
    });

    const candidates = hdVoices.length > 0 ? hdVoices : pool;

    let matchedVoice = null;
    if (isFemale) {
      matchedVoice = candidates.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('sabina') || n.includes('helena') || n.includes('monica') || n.includes('laura') || n.includes('elena') || n.includes('female');
      });
    } else if (!isAi) {
      matchedVoice = candidates.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('alvaro') || n.includes('jorge') || n.includes('raul') || n.includes('pablo') || n.includes('male');
      });
    }

    const selectedVoice = matchedVoice || candidates[0] || pool[0];
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Fonetizador TTS HD] No se pudo sintetizar voz:', err);
  }
}

