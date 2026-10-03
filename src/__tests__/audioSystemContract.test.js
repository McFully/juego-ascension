import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SYSTEM_AUDIO_FILES,
  MINISTRY_AUDIO_FILES,
  playTrack,
  playSystemMusic,
  playMinistryMusic,
  stopSystemMusic,
  stopMinistryMusic,
  getCurrentBgMusic,
  getCurrentMinistryMusic,
  getCurrentSystemMusic
} from '../audio/audioMusic.js';
import { operationsVol, BASE_OPS_MAX } from '../audio/audioCore.js';

describe('FASE 04 — Contrato del Sistema de Audio', () => {
  describe('1. Director de música unificado y prevención de pistas zombis', () => {
    it('todas las pantallas del juego (incluidas buildings, telemetry, imperial_hub, imperial_council, imperial_senate) están mapeadas en SYSTEM_AUDIO_FILES', () => {
      const requiredSystems = [
        'galaxy', 'colony_network', 'overview', 'fleet', 'shipyard',
        'shipDesign', 'combat', 'defense', 'missiles', 'research',
        'techTree', 'market', 'blackMarket', 'diplomacy', 'communications',
        'missions', 'moon', 'ascension', 'stats',
        'buildings', 'telemetry', 'imperial_hub', 'imperial_council', 'imperial_senate'
      ];

      for (const sys of requiredSystems) {
        expect(SYSTEM_AUDIO_FILES[sys], `El sistema [${sys}] debe tener asignado archivo en SYSTEM_AUDIO_FILES`).toBeDefined();
        expect(typeof SYSTEM_AUDIO_FILES[sys]).toBe('string');
      }
    });

    it('playSystemMusic detiene y libera la música de ministerio y de sistema anterior', () => {
      const audioMusicSrc = fs.readFileSync(path.resolve(__dirname, '../audio/audioMusic.js'), 'utf-8');
      // Debe detener el sistema anterior si no se encuentra archivo o al cambiar
      expect(audioMusicSrc).toMatch(/stopMinistryMusic\(\)/);
      expect(audioMusicSrc).toMatch(/stopSystemMusic\(\)/);
    });

    it('playMinistryMusic detiene la música de sistema previa', () => {
      const audioMusicSrc = fs.readFileSync(path.resolve(__dirname, '../audio/audioMusic.js'), 'utf-8');
      // En la función playMinistryMusic debe invocarse stopSystemMusic()
      const playMinMatch = audioMusicSrc.match(/export function playMinistryMusic[\s\S]*?\{([\s\S]*?)\n\}/);
      expect(playMinMatch).not.toBeNull();
      expect(playMinMatch[1]).toMatch(/stopSystemMusic\(\)/);
    });

    it('los fallbacks de audio en audioMusic pausan y limpian la instancia anterior antes de sustituir', () => {
      const audioMusicSrc = fs.readFileSync(path.resolve(__dirname, '../audio/audioMusic.js'), 'utf-8');
      expect(audioMusicSrc).toMatch(/if\s*\(currentMinistryMusic === audio\)\s*\{\s*releaseAudio\(audio\)/);
      expect(audioMusicSrc).toMatch(/if\s*\(currentSystemMusic === audio\)\s*\{\s*releaseAudio\(audio\)/);
    });
  });

  describe('2. AudioContext singleton y prevención de fugas en vistas', () => {
    it('CommunicationsPage.jsx no instancia new AudioContext() localmente y utiliza getCtx()', () => {
      const commSrc = fs.readFileSync(path.resolve(__dirname, '../pages/CommunicationsPage.jsx'), 'utf-8');
      expect(commSrc).not.toMatch(/new\s+(AudioContextClass|AudioContext|webkitAudioContext)\s*\(/);
      expect(commSrc).toMatch(/getCtx/);
    });

    it('LeaderAvatar.jsx no crea AudioContext aislado ni conecta crudo a destination sin gain de canal', () => {
      const avatarSrc = fs.readFileSync(path.resolve(__dirname, '../components/diplomacy/LeaderAvatar.jsx'), 'utf-8');
      expect(avatarSrc).not.toMatch(/_diploCtx\s*=\s*new\s+AudioContextClass/);
      expect(avatarSrc).not.toMatch(/gainNode\.connect\(ctx\.destination\)/);
      expect(avatarSrc).toMatch(/getCtx/);
    });
  });

  describe('3. Configuración y rehidratación de audio', () => {
    it('operationsVol por defecto es mayor que 0 (0.5) para que astilleros, obras e I+D no nazcan mudos', () => {
      expect(operationsVol, 'operationsVol debe ser > 0').toBeGreaterThan(0);
    });

    it('useGameLifecycle.js o useGameAudio.js rehidrata userMuted desde localStorage', () => {
      const audioHookPath = fs.existsSync(path.resolve(__dirname, '../hooks/useGameAudio.js'))
        ? path.resolve(__dirname, '../hooks/useGameAudio.js')
        : path.resolve(__dirname, '../hooks/useGameLifecycle.js');
      const lifecycleSrc = fs.readFileSync(audioHookPath, 'utf-8');
      expect(lifecycleSrc).toMatch(/useState\(\(\)\s*=>[\s\S]*?ascension_audio_settings[\s\S]*?userMuted/);
    });

    it('useGameLifecycle.js o useGameAudio.js limpia stopMinistryMusic y stopVoice al volver al menú o desmontar', () => {
      const audioHookPath = fs.existsSync(path.resolve(__dirname, '../hooks/useGameAudio.js'))
        ? path.resolve(__dirname, '../hooks/useGameAudio.js')
        : path.resolve(__dirname, '../hooks/useGameLifecycle.js');
      const lifecycleSrc = fs.readFileSync(audioHookPath, 'utf-8');
      expect(lifecycleSrc).toMatch(/stopMinistryMusic\(\);[\s\S]*?stopVoice\(\);/);
    });

    it('GovernmentPage.jsx no evalúa expresiones booleanas en el array de dependencias', () => {
      const govSrc = fs.readFileSync(path.resolve(__dirname, '../pages/GovernmentPage.jsx'), 'utf-8');
      expect(govSrc).not.toMatch(/\[navLevel\s*>=\s*2/);
    });
  });

  describe('4. Eliminación de archivo duplicado en la raíz', () => {
    it('Musica-menu.ogg no existe en la raíz del repositorio', () => {
      const rootMusicPath = path.resolve(__dirname, '../../Musica-menu.ogg');
      expect(fs.existsSync(rootMusicPath)).toBe(false);
    });
  });
});
