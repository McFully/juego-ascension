import { describe, it, expect, vi } from 'vitest';
import { MOON_BUILDINGS, MISSILES, SHIP_MODULES } from '../data/game/customShips.js';
import { CODEX_DATA } from '../data/codex.js';
import { SHIPS } from '../data/gameData.js';
import { generateRegistryCode as bridgeGenCode, generateClientRegistryCode } from '../utils/shipRegistryBridge.js';
import fs from 'fs';
import path from 'path';

describe('FASE 03 — Integridad de Datos y Catálogos', () => {
  describe('1. Descripciones en MOON_BUILDINGS, MISSILES y SHIP_MODULES', () => {
    it('todos los edificios lunares de MOON_BUILDINGS tienen campo desc definido no vacío', () => {
      for (const [id, building] of Object.entries(MOON_BUILDINGS)) {
        expect(building.desc, `MOON_BUILDINGS[${id}] debe tener desc`).toBeDefined();
        expect(typeof building.desc).toBe('string');
        expect(building.desc.trim().length).toBeGreaterThan(0);
      }
    });

    it('todos los misiles de MISSILES tienen campo desc definido no vacío', () => {
      for (const [id, missile] of Object.entries(MISSILES)) {
        expect(missile.desc, `MISSILES[${id}] debe tener desc`).toBeDefined();
        expect(typeof missile.desc).toBe('string');
        expect(missile.desc.trim().length).toBeGreaterThan(0);
      }
    });

    it('todos los módulos de nave de SHIP_MODULES tienen campo desc definido no vacío', () => {
      for (const [id, mod] of Object.entries(SHIP_MODULES)) {
        expect(mod.desc, `SHIP_MODULES[${id}] debe tener desc`).toBeDefined();
        expect(typeof mod.desc).toBe('string');
        expect(mod.desc.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Cobertura de CODEX_DATA para naves especiales', () => {
    it('planetDestroyer está catalogado en CODEX_DATA con lore, stats y usage', () => {
      expect(CODEX_DATA.planetDestroyer, 'planetDestroyer debe existir en CODEX_DATA').toBeDefined();
      expect(CODEX_DATA.planetDestroyer.name).toBeDefined();
      expect(CODEX_DATA.planetDestroyer.lore).toBeDefined();
      expect(CODEX_DATA.planetDestroyer.stats).toBeDefined();
      expect(CODEX_DATA.planetDestroyer.usage).toBeDefined();
    });

    it('terraformerShip está catalogado en CODEX_DATA con lore, stats y usage', () => {
      expect(CODEX_DATA.terraformerShip, 'terraformerShip debe existir en CODEX_DATA').toBeDefined();
      expect(CODEX_DATA.terraformerShip.name).toBeDefined();
      expect(CODEX_DATA.terraformerShip.lore).toBeDefined();
      expect(CODEX_DATA.terraformerShip.stats).toBeDefined();
      expect(CODEX_DATA.terraformerShip.usage).toBeDefined();
    });

    it('todas las naves en SHIPS existen en CODEX_DATA', () => {
      for (const shipId of Object.keys(SHIPS)) {
        expect(CODEX_DATA[shipId], `Nave ${shipId} debe estar presente en CODEX_DATA`).toBeDefined();
      }
    });
  });

  describe('3. CodexModal no produce retorno silencioso null', () => {
    it('el código fuente de CodexModal.jsx maneja fallback No disponible en vez de return null silencioso', () => {
      const modalSrc = fs.readFileSync(path.resolve(__dirname, '../components/ui/CodexModal.jsx'), 'utf-8');
      expect(modalSrc).not.toMatch(/if\s*\(!data\)\s*return\s*null\s*;/);
      expect(modalSrc).toMatch(/No disponible/);
    });
  });

  describe('4. Normalización de matrículas navales deterministas y no colisionables', () => {
    it('generateRegistryCode genera el formato canónico FAC-PXX-CHS-000000', () => {
      const code1 = bridgeGenCode('HUM', 1, 'LF', 1);
      expect(code1).toBe('HUM-P01-LF-000001');

      const codePlanetStr = bridgeGenCode('HUM', 'planet-2', 'BAT', 42);
      expect(codePlanetStr).toBe('HUM-P02-BAT-000042');

      const clientAlias = generateClientRegistryCode('CYB', 3, 'CRU', 999);
      expect(clientAlias).toBe('CYB-P03-CRU-000999');
    });

    it('queueTick.js no utiliza Math.random() para generar matrículas navales', () => {
      const queueTickSrc = fs.readFileSync(path.resolve(__dirname, '../reducers/tick/queues/queueTick.js'), 'utf-8');
      // No debe haber randSeq con Math.random en la sección de generación de matrícula
      expect(queueTickSrc).not.toMatch(/randSeq\s*=\s*Math\.floor\(100000\s*\+\s*Math\.random/);
    });

    it('shipRegistryBridge.js no utiliza Math.random()', () => {
      const bridgeSrc = fs.readFileSync(path.resolve(__dirname, '../utils/shipRegistryBridge.js'), 'utf-8');
      expect(bridgeSrc).not.toMatch(/Math\.random\(\)/);
    });
  });

  describe('5. Eliminación de ascension_record_standard_planets muerto', () => {
    it('NewGameScreen no lee la clave muerta ascension_record_standard_planets', () => {
      const newGameSrc = fs.readFileSync(path.resolve(__dirname, '../components/NewGameScreen.jsx'), 'utf-8');
      expect(newGameSrc).not.toContain('ascension_record_standard_planets');
    });
  });
});
