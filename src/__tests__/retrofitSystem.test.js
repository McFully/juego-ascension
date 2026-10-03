import { describe, it, expect } from 'vitest';
import {
  extractShipTechSnapshot,
  extractDefenseTechSnapshot,
  calculateTechGeneration,
  getVariantKey,
  isVariantOutdated,
  calculateRetrofitUnitCost,
  calculateRetrofitUnitTime
} from '../utils/formulas/retrofitFormulas.js';
import { handleRetrofitShipVariant, handleRetrofitDefenseVariant } from '../reducers/fleet/retrofitActions.js';

describe('Sistema de Generaciones y Retrofit de Naves y Defensas', () => {
  it('debe calcular generaciones Mk correlativas al nivel tecnológico', () => {
    const initialResearch = { weapons: 0, shields: 0, armour: 0, combustion: 0 };
    const snap1 = extractShipTechSnapshot(initialResearch);
    const gen1 = calculateTechGeneration(snap1);
    expect(gen1).toBe(1);

    const advancedResearch = { weapons: 2, shields: 1, armour: 2, combustion: 1 };
    const snap2 = extractShipTechSnapshot(advancedResearch);
    const gen2 = calculateTechGeneration(snap2);
    expect(gen2).toBe(7); // 1 base + (2+1+2+1) = 7
  });

  it('debe detectar correctamente si una variante está obsoleta', () => {
    const oldSnapshot = { weapons: 1, shields: 1, armour: 1 };
    const currentTech = { weapons: 2, shields: 1, armour: 1 };
    expect(isVariantOutdated(oldSnapshot, currentTech, 'ship')).toBe(true);

    const sameTech = { weapons: 1, shields: 1, armour: 1 };
    expect(isVariantOutdated(oldSnapshot, sameTech, 'ship')).toBe(false);
  });

  it('debe calcular costes y tiempos de modernización proporcionales para naves y defensas', () => {
    const oldSnapshot = { weapons: 0, shields: 0, armour: 0 };
    const currentTech = { weapons: 3, shields: 2, armour: 2 };
    
    // Caza ligero
    const shipCost = calculateRetrofitUnitCost('lightFighter', oldSnapshot, currentTech, 'ship');
    expect(shipCost.metal).toBeGreaterThan(0);
    expect(shipCost.crystal).toBeGreaterThan(0);

    const shipTime = calculateRetrofitUnitTime('lightFighter', oldSnapshot, currentTech, 1, 0, 1, 'ship');
    expect(shipTime).toBeGreaterThanOrEqual(3);

    // Batería láser ligera
    const defCost = calculateRetrofitUnitCost('lightLaser', oldSnapshot, currentTech, 'defense');
    expect(defCost.metal).toBeGreaterThan(0);
  });

  it('debe despachar modernización de variantes sin botón muerto e insertar en cola con feedback', () => {
    const initialState = {
      currentPlanetId: 'planet-1',
      research: { weapons: 2, shields: 1, armour: 1, combustion: 2 },
      retrofitQueue: [],
      notifications: [],
      planets: [
        {
          id: 'planet-1',
          name: 'Tierra',
          resources: { metal: 100000, crystal: 100000, deuterium: 50000 },
          buildings: { shipyard: 2 },
          fleet: { lightFighter: 5 },
          fleetVariants: {
            'lightFighter__mk1': {
              baseId: 'lightFighter',
              variantKey: 'lightFighter__mk1',
              techGen: 1,
              techSnapshot: { weapons: 0, shields: 0, armour: 0, combustion: 0 },
              count: 5
            }
          },
          defenses: { lightLaser: 10 },
          defenseVariants: {
            'lightLaser__mk1': {
              baseId: 'lightLaser',
              variantKey: 'lightLaser__mk1',
              techGen: 1,
              techSnapshot: { weapons: 0, shields: 0, armour: 0 },
              count: 10
            }
          }
        }
      ]
    };

    // Modernizar naves
    const stateAfterShip = handleRetrofitShipVariant(initialState, {
      type: 'RETROFIT_SHIP_VARIANT',
      variantKey: 'lightFighter__mk1',
      count: 3
    });

    expect(stateAfterShip.retrofitQueue.length).toBe(1);
    expect(stateAfterShip.retrofitQueue[0].type).toBe('ship_variant');
    expect(stateAfterShip.retrofitQueue[0].quantity).toBe(3);
    expect(stateAfterShip.notifications.length).toBeGreaterThan(0);

    // Modernizar defensas
    const stateAfterDef = handleRetrofitDefenseVariant(stateAfterShip, {
      type: 'RETROFIT_DEFENSE_VARIANT',
      variantKey: 'lightLaser__mk1',
      count: 5
    });

    expect(stateAfterDef.retrofitQueue.length).toBe(2);
    expect(stateAfterDef.retrofitQueue[1].type).toBe('defense_variant');
    expect(stateAfterDef.retrofitQueue[1].quantity).toBe(5);
  });
});

