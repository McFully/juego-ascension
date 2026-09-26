import { describe, it, expect } from 'vitest';
import { simulateCombat } from '../combat/combatEngine.js';

describe('Motor Matemático de Combate - Pruebas de Fuzzing Masivo', () => {
  it('debe ejecutar 1.000 simulaciones de flotas extremas aleatorias sin NaN, Infinity ni bucles infinitos', () => {
    const shipKeys = [
      'smallCargo', 'largeCargo', 'lightFighter', 'heavyFighter', 'cruiser', 'battleship',
      'colonizer', 'recycler', 'espionageProbe', 'bomber', 'destroyer', 'deathstar'
    ];
    const defenseKeys = [
      'rocketLauncher', 'lightLaser', 'heavyLaser',
      'gaussCannon', 'ionCannon', 'plasmaTurret', 'smallShield', 'largeShield'
    ];

    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      // Generación caótica de flotas atacantes
      const attackerFleet = {};
      const attackerCount = Math.floor(Math.random() * 5) + 1;
      for (let s = 0; s < attackerCount; s++) {
        const randShip = shipKeys[Math.floor(Math.random() * shipKeys.length)];
        attackerFleet[randShip] = Math.floor(Math.random() * 150) + 1;
      }

      // Generación caótica de flotas y defensas defensoras
      const defenderFleet = {};
      const defenderDefenses = {};
      const defenderShipCount = Math.floor(Math.random() * 4) + 1;
      for (let s = 0; s < defenderShipCount; s++) {
        const randShip = shipKeys[Math.floor(Math.random() * shipKeys.length)];
        defenderFleet[randShip] = Math.floor(Math.random() * 120) + 1;
      }
      const defenseCount = Math.floor(Math.random() * 4);
      for (let d = 0; d < defenseCount; d++) {
        const randDef = defenseKeys[Math.floor(Math.random() * defenseKeys.length)];
        defenderDefenses[randDef] = Math.floor(Math.random() * 80) + 1;
      }

      // Tecnologías aleatorias (nivel 0 a 20)
      const atkTech = {
        weapons: Math.floor(Math.random() * 20),
        shields: Math.floor(Math.random() * 20),
        armour: Math.floor(Math.random() * 20)
      };
      const defTech = {
        weapons: Math.floor(Math.random() * 20),
        shields: Math.floor(Math.random() * 20),
        armour: Math.floor(Math.random() * 20)
      };

      const result = simulateCombat(
        attackerFleet,
        defenderFleet,
        defenderDefenses,
        atkTech,
        defTech,
        6
      );

      // Verificación de integridad matemática
      if (result.error) {
        throw new Error('simulateCombat arrojó error interno: ' + JSON.stringify(result));
      }
      expect(result).toBeDefined();
      expect(['attacker', 'defender', 'draw']).toContain(result.winner);
      const roundsCount = Array.isArray(result.rounds) ? result.rounds.length : (result.rounds || 0);
      if (roundsCount === 0) {
        console.error('DEBUG FUZZING ZERO ROUNDS:', {
          result,
          attackerFleet,
          defenderFleet,
          defenderDefenses
        });
      }
      expect(roundsCount).toBeGreaterThanOrEqual(1);
      expect(roundsCount).toBeLessThanOrEqual(6);

      // Los recursos de escombros generados no deben ser NaN ni negativos
      expect(Number.isFinite(result.debris?.metal || 0)).toBe(true);
      expect(Number.isFinite(result.debris?.crystal || 0)).toBe(true);
      expect((result.debris?.metal || 0)).toBeGreaterThanOrEqual(0);
      expect((result.debris?.crystal || 0)).toBeGreaterThanOrEqual(0);

      // Pérdidas de naves no deben ser negativas
      Object.values(result.losses?.attacker || {}).forEach(lostQty => {
        expect(Number.isFinite(lostQty)).toBe(true);
        expect(lostQty).toBeGreaterThanOrEqual(0);
      });
      Object.values(result.losses?.defender || {}).forEach(lostQty => {
        expect(Number.isFinite(lostQty)).toBe(true);
        expect(lostQty).toBeGreaterThanOrEqual(0);
      });
    }
  }, 30000);
});
