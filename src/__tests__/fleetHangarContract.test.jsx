import { describe, it, expect } from 'vitest';
import { classifyShip, filterAvailableFleet, getShipDriveRange, canShipReachTarget } from '../utils/fleetClassification.js';
import { SHIPS } from '../data/gameData.js';

describe('Fleet Classification & Filtering Contract (Fase 10 & Ampliación)', () => {
  it('clasifica interplanetaryMissile y antiBallisticMissile como munición ammo, nunca como civilian ni combat', () => {
    expect(classifyShip('interplanetaryMissile', SHIPS)).toBe('ammo');
    expect(classifyShip('antiBallisticMissile', SHIPS)).toBe('ammo');
    expect(classifyShip('atmosphericInterceptor', SHIPS)).toBe('combat');
    expect(classifyShip('lightFighter', SHIPS)).toBe('combat');
    expect(classifyShip('quantumFighter', SHIPS)).toBe('combat');
    expect(classifyShip('dreadnought', SHIPS)).toBe('combat');
    expect(classifyShip('planetDestroyer', SHIPS)).toBe('combat');
    expect(classifyShip('custom_ship_1', SHIPS)).toBe('combat');
    expect(classifyShip('smallCargo', SHIPS)).toBe('civilian');
    expect(classifyShip('localColonizer', SHIPS)).toBe('civilian');
    expect(classifyShip('recycler', SHIPS)).toBe('civilian');
  });

  it('valida rangos operativos de motor (combustión: sistema local, impulso: galaxia, hiperespacio: universo)', () => {
    expect(getShipDriveRange('atmosphericInterceptor', SHIPS)).toBe('system');
    expect(getShipDriveRange('localColonizer', SHIPS)).toBe('system');
    expect(getShipDriveRange('lightFighter', SHIPS)).toBe('galaxy');
    expect(getShipDriveRange('colonizer', SHIPS)).toBe('galaxy');
    expect(getShipDriveRange('quantumFighter', SHIPS)).toBe('universe');
    expect(getShipDriveRange('dreadnought', SHIPS)).toBe('universe');

    const origin = { galaxy: 1, system: 10, position: 3 };
    const sameSystemTarget = { galaxy: 1, system: 10, position: 8 };
    const sameGalaxyTarget = { galaxy: 1, system: 50, position: 1 };
    const distantGalaxyTarget = { galaxy: 3, system: 10, position: 3 };

    // Nave de combustión
    expect(canShipReachTarget('atmosphericInterceptor', origin, sameSystemTarget, SHIPS)).toBe(true);
    expect(canShipReachTarget('atmosphericInterceptor', origin, sameGalaxyTarget, SHIPS)).toBe(false);
    expect(canShipReachTarget('atmosphericInterceptor', origin, distantGalaxyTarget, SHIPS)).toBe(false);

    // Nave de impulso
    expect(canShipReachTarget('lightFighter', origin, sameSystemTarget, SHIPS)).toBe(true);
    expect(canShipReachTarget('lightFighter', origin, sameGalaxyTarget, SHIPS)).toBe(true);
    expect(canShipReachTarget('lightFighter', origin, distantGalaxyTarget, SHIPS)).toBe(false);

    // Nave hiperespacial
    expect(canShipReachTarget('quantumFighter', origin, distantGalaxyTarget, SHIPS)).toBe(true);
    expect(canShipReachTarget('dreadnought', origin, distantGalaxyTarget, SHIPS)).toBe(true);
  });

  it('filtra la flota disponible excluyendo misiles balísticos del hangar y respetando filtros combat y civilian', () => {
    const fleet = {
      atmosphericInterceptor: 15,
      lightFighter: 10,
      smallCargo: 5,
      interplanetaryMissile: 4,
      antiBallisticMissile: 6,
      planetDestroyer: 1,
      zeroShip: 0
    };

    const all = filterAvailableFleet(fleet, 'all', SHIPS);
    const allIds = all.map(([id]) => id);
    expect(allIds).toContain('atmosphericInterceptor');
    expect(allIds).toContain('lightFighter');
    expect(allIds).toContain('smallCargo');
    expect(allIds).toContain('planetDestroyer');
    expect(allIds).not.toContain('interplanetaryMissile');
    expect(allIds).not.toContain('antiBallisticMissile');
    expect(allIds).not.toContain('zeroShip');

    const combat = filterAvailableFleet(fleet, 'combat', SHIPS);
    const combatIds = combat.map(([id]) => id);
    expect(combatIds).toEqual(['atmosphericInterceptor', 'lightFighter', 'planetDestroyer']);

    const civilian = filterAvailableFleet(fleet, 'civilian', SHIPS);
    const civilianIds = civilian.map(([id]) => id);
    expect(civilianIds).toEqual(['smallCargo']);
  });
});
