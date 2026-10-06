import { describe, it, expect } from 'vitest';
import {
  DETECTION_BASE,
  DETECTION_MAX,
  DETECTION_MIN,
  CRYPTO_MAX_REDUCTION,
  STEALTH_MAX_REDUCTION,
  getTargetEspDefense,
  getFactionEspionageMult,
  getFactionEspionageDiffBonus,
  getEspionageCountermeasures,
  getFleetStealth,
  computeEspionageDetection,
  applyIntelCeiling,
  getIntelCeilingBonus,
} from '../utils/espionageFormulas.js';
import { FACTIONS } from '../data/gameData.js';
import { RESEARCH } from '../data/game/researchData.js';
import { MINISTRY_PROGRAMS } from '../data/ministriesData.js';
import { SHIP_MODULES, SHIP_CHASSIS } from '../data/game/customShips.js';

/**
 * MECÁNICAS DE ESPIONAJE QUE ESTABAN COMPRADAS Y MUERTAS.
 *
 * Cada dato de este archivo declaraba un efecto que ninguna fórmula leía. Si
 * alguno vuelve a quedarse sin consumidor, el contrato debe romperse: por eso
 * cada test comprueba contra el dato original y no contra una constante local.
 */

const objetivo = (extra = {}) => ({
  id: 'ai-1',
  aiLevel: 10,
  espDefenseLvl: 4,
  buildings: {},
  research: {},
  ...extra,
});

describe('defensa de espionaje del objetivo', () => {
  it('usa la base que ya traia el planeta', () => {
    expect(getTargetEspDefense(objetivo())).toBe(4);
  });

  it('si no hay base, la deriva del nivel de la IA como antes', () => {
    expect(getTargetEspDefense({ aiLevel: 9 })).toBe(4);
  });

  it('sin objetivo devuelve cero y no revienta', () => {
    expect(getTargetEspDefense(undefined)).toBe(0);
    expect(getTargetEspDefense(null)).toBe(0);
  });

  it('los sensores que exigen spyCenter por fin defienden', () => {
    // `earlyWarningSat` requiere spyCenter 3 y `phalanxSensors` spyCenter 5:
    // se pagaban y no inflaban nada.
    expect(RESEARCH.espionage).toBeDefined();
    const base = getTargetEspDefense(objetivo());
    const conSensores = getTargetEspDefense(objetivo({
      buildings: { spyCenter: 5, earlyWarningSat: 3, phalanxSensors: 2 },
    }));
    expect(conSensores).toBeGreaterThan(base + 4);
  });

  it('una IA que investiga Espionaje resiste mejor', () => {
    const conTecnologia = getTargetEspDefense(objetivo({ research: { espionage: 10 } }));
    expect(conTecnologia).toBeGreaterThan(getTargetEspDefense(objetivo()));
  });
});

describe('contramedidas del jugador', () => {
  it('la criptografia reduce la deteccion segun su porcentaje declarado', () => {
    // researchData: "Protección contra sondas enemigas (+15%/nv)".
    expect(RESEARCH.galacticCrypto.perLevel.cryptoProt).toBe(15);
    const conCrypto = getEspionageCountermeasures({ research: { galacticCrypto: 2 } }, {});
    expect(conCrypto.cryptoReduction).toBeCloseTo(0.30, 5);
  });

  it('la criptografia tiene techo: nunca invisible del todo', () => {
    const tope = getEspionageCountermeasures({ research: { galacticCrypto: 99 } }, {});
    expect(tope.cryptoReduction).toBe(CRYPTO_MAX_REDUCTION);
    const chance = computeEspionageDetection({ techDiff: -20, countermeasures: tope });
    expect(chance).toBeGreaterThan(0);
  });

  it('los inhibidores de red hacen mas probable que te detecten', () => {
    // ministriesData: quantum_scrambler, "+15% Detección de flotas hostiles".
    const programa = MINISTRY_PROGRAMS.intel.find(p => p.id === 'quantum_scrambler');
    expect(programa.bonusText).toContain('15%');
    const conPrograma = getEspionageCountermeasures({}, {
      ministries: { intel: { upgrades: { quantum_scrambler: 2 } } },
    });
    expect(conPrograma.scramblerBoost).toBeCloseTo(0.30, 5);

    const chance = computeEspionageDetection({ techDiff: 0, countermeasures: conPrograma });
    expect(chance).toBeGreaterThan(DETECTION_BASE);
  });

  it('sin nada comprado no hay contramedidas', () => {
    const ninguna = getEspionageCountermeasures({}, {});
    expect(ninguna.cryptoReduction).toBe(0);
    expect(ninguna.scramblerBoost).toBe(0);
  });

  it('toleras estados incompletos sin reventar', () => {
    expect(() => getEspionageCountermeasures(undefined, undefined)).not.toThrow();
    expect(() => getEspionageCountermeasures({ research: null }, { ministries: null })).not.toThrow();
  });
});

describe('sigilo de la flota', () => {
  it('los modulos de sigilo ya calculados ahora cuentan', () => {
    // costFormulas calculaba `stealth` y lo tiraba.
    expect(SHIP_MODULES.stealthSys.bonus.stealth).toBe(1);
    expect(SHIP_MODULES.stealthModule.bonus.stealth).toBe(2);
  });

  it('suma el sigilo de las naves de diseño propio de la mision', () => {
    const sigilo1 = { id: 'a', chassis: 'scout', modules: ['stealthSys'] };
    const sigilo2 = { id: 'b', chassis: 'scout', modules: ['stealthModule'] };
    expect(SHIP_CHASSIS[sigilo1.chassis]).toBeDefined();
    const planos = [sigilo1, sigilo2];
    // 1 sonda stealthSys (valor 1) + 3 stealthModule (valor 2) = 7.
    expect(getFleetStealth({ custom_a: 1 }, planos)).toBe(1);
    expect(getFleetStealth({ custom_a: 1, custom_b: 3 }, planos)).toBe(7);
  });

  it('un diseno sin chasis valido no aporta sigilo pero no rompe', () => {
    expect(getFleetStealth({ custom_a: 1 }, [{ id: 'a', chassis: 'inexistente', modules: ['stealthSys'] }])).toBe(0);
  });

  it('las sondas normales no aportan sigilo y una flota vacia tampoco rompe', () => {
    expect(getFleetStealth({ espionageProbe: 5 }, [])).toBe(0);
    expect(getFleetStealth({}, [])).toBe(0);
    expect(getFleetStealth(undefined, undefined)).toBe(0);
  });

  it('el sigilo reduce la deteccion y tiene techo', () => {
    const conSigilo = computeEspionageDetection({ techDiff: 0, stealth: 3 });
    expect(conSigilo).toBeLessThan(DETECTION_BASE);
    const tope = computeEspionageDetection({ techDiff: 0, stealth: 999 });
    expect(tope).toBeGreaterThanOrEqual(DETECTION_BASE * (1 - STEALTH_MAX_REDUCTION));
  });
});

describe('probabilidad de deteccion', () => {
  it('cuanta mas tecnologia, menos deteccion', () => {
    const pobre = computeEspionageDetection({ techDiff: -5 });
    const rico = computeEspionageDetection({ techDiff: 5 });
    expect(rico).toBeLessThan(pobre);
  });

  it('nunca sale del rango permitido', () => {
    expect(computeEspionageDetection({ techDiff: -999 })).toBeLessThanOrEqual(DETECTION_MAX);
    expect(computeEspionageDetection({ techDiff: 999 })).toBeGreaterThanOrEqual(DETECTION_MIN);
  });

  it('sin argumentos no rompe', () => {
    expect(() => computeEspionageDetection()).not.toThrow();
  });
});

describe('bonus de facción', () => {
  it('las nueve facciones declaran bonus de espionaje', () => {
    const facciones = Object.entries(FACTIONS).filter(([, f]) => f?.bonuses?.espionage !== undefined);
    expect(facciones.length).toBe(9);
  });

  it('la mejor faccion compra escalones y la peor ninguno', () => {
    const mejor = Math.max(...Object.values(FACTIONS).map(f => f.bonuses.espionage));
    const peor = Math.min(...Object.values(FACTIONS).map(f => f.bonuses.espionage));
    expect(getFactionEspionageMult('desconocida')).toBe(1.0);
    expect(getFactionEspionageDiffBonus(mejor)).toBeGreaterThan(0);
    expect(getFactionEspionageDiffBonus(peor)).toBeLessThanOrEqual(0);
  });

  it('el bonus suma escalones, no multiplica la diferencia entera', () => {
    expect(applyIntelCeiling(4, 0)).toBe(4);
    expect(applyIntelCeiling(4, 2)).toBe(6);
  });
});

describe('techo de inteligencia por el Ministerio', () => {
  it('sleeper_net baja el listón del salto a full', () => {
    const programa = MINISTRY_PROGRAMS.intel.find(p => p.id === 'sleeper_net');
    expect(programa.bonusText).toContain('10%');
    const bonus = getIntelCeilingBonus({ ministries: { intel: { upgrades: { sleeper_net: 3 } } } });
    expect(bonus).toBeGreaterThan(0);
  });

  it('sin programas el techo es el de la tabla', () => {
    expect(getIntelCeilingBonus({})).toBe(0);
    expect(getIntelCeilingBonus(undefined)).toBe(0);
  });
});
