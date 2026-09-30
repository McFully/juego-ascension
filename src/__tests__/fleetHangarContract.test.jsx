import { describe, it, expect } from 'vitest';
import { classifyShip, filterAvailableFleet } from '../utils/fleetClassification.js';
import { SHIPS } from '../data/gameData.js';

describe('Fleet Classification & Filtering Contract (Fase 10)', () => {
  it('clasifica interplanetaryMissile y antiBallisticMissile como munición ammo, nunca como civilian ni combat', () => {
    expect(classifyShip('interplanetaryMissile', SHIPS)).toBe('ammo');
    expect(classifyShip('antiBallisticMissile', SHIPS)).toBe('ammo');
    expect(classifyShip('lightFighter', SHIPS)).toBe('combat');
    expect(classifyShip('planetDestroyer', SHIPS)).toBe('combat');
    expect(classifyShip('custom_ship_1', SHIPS)).toBe('combat');
    expect(classifyShip('smallCargo', SHIPS)).toBe('civilian');
    expect(classifyShip('recycler', SHIPS)).toBe('civilian');
  });

  it('filtra la flota disponible excluyendo misiles balísticos del hangar y respetando filtros combat y civilian', () => {
    const fleet = {
      lightFighter: 10,
      smallCargo: 5,
      interplanetaryMissile: 4,
      antiBallisticMissile: 6,
      planetDestroyer: 1,
      zeroShip: 0
    };

    const all = filterAvailableFleet(fleet, 'all', SHIPS);
    const allIds = all.map(([id]) => id);
    expect(allIds).toContain('lightFighter');
    expect(allIds).toContain('smallCargo');
    expect(allIds).toContain('planetDestroyer');
    expect(allIds).not.toContain('interplanetaryMissile');
    expect(allIds).not.toContain('antiBallisticMissile');
    expect(allIds).not.toContain('zeroShip');

    const combat = filterAvailableFleet(fleet, 'combat', SHIPS);
    const combatIds = combat.map(([id]) => id);
    expect(combatIds).toEqual(['lightFighter', 'planetDestroyer']);

    const civilian = filterAvailableFleet(fleet, 'civilian', SHIPS);
    const civilianIds = civilian.map(([id]) => id);
    expect(civilianIds).toEqual(['smallCargo']);
  });
});
