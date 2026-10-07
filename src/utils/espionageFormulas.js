import { FACTIONS } from '../data/gameData.js';
import { INTEL_SHIP_IDS } from '../data/game/shipsData.js';
import { calcCustomShipStats } from './formulas/costFormulas.js';

/**
 * FÓRMULAS DE ESPIONAJE.
 *
 * Este módulo es la única fuente de verdad de cómo de bien se espía y de cómo
 * fácil te detectan. Antes estas reglas vivían todas inline en
 * `missions/diploMission.js` y dependían de valores que nadie leía:
 *
 *   - `research.galacticCrypto` → "Protección contra sondas enemigas (+15%/nv)"
 *     estaba declarado y ninguna fórmula lo miraba.
 *   - `expandedBuildings.earlyWarningSat` y `phalanxSensors` exigen `spyCenter`
 *     para construirse, se pagaban y no inflaban la defensa del objetivo.
 *   - `factions.js` declara `bonuses.espionage` en las nueve facciones (0.95 a
 *     1.20) y nadie lo leía.
 *   - `customShips` calcula `stealth` en `calcCustomShipStats` y el resultado se
 *     descartaba.
 *   - `ministries.intel.quantum_scrambler` ("+15% Detección de flotas hostiles")
 *     y `sleeper_net` ("+10% Intel Máxima de IAs") no tenían efecto.
 *   - `aiPlanets[].espDefenseLvl` se sorteaba una vez al generar la galaxia y
 *     quedaba congelado para siempre: la contraespionaje de la IA no existía.
 *
 * Todo eso entra aquí. Cada constante es el porcentaje que el propio dato
 * declara en su `effect` o `bonusText`, para que el número del código y el
 * número que ve el jugador sean el mismo.
 */

/** Probabilidad base de que el objetivo note la sonda. */
export const DETECTION_BASE = 0.20;
export const DETECTION_MAX = 0.95;
export const DETECTION_MIN = 0.02;

/** `researchData.js`: galacticCrypto, "Protección contra sondas enemigas (+15%/nv)". */
export const CRYPTO_STEP = 0.15;
/** Techo de protección criptográfica: por muy alto que llegue, no es invisible. */
export const CRYPTO_MAX_REDUCTION = 0.60;

/** `ministriesData.js`: quantum_scrambler, "+15% Detección de flotas hostiles por nivel". */
export const SCRAMBLER_STEP = 0.15;
export const SCRAMBLER_MAX_BOOST = 0.45;

/** `ministriesData.js`: sleeper_net, "+10% Intel Máxima de IAs por nivel". */
export const SLEEPER_CEILING_STEP = 0.10;
export const SLEEPER_CEILING_MAX = 0.50;

/** `customShips`: bonus.stealth 1 (Sigilo) y 2 (Sigilo Avanzado). */
export const STEALTH_STEP = 0.04;
export const STEALTH_MAX_REDUCTION = 0.35;

/**
 * Defensa de espionaje de un objetivo.
 *
 * Antes era `target.espDefenseLvl || floor(aiLevel * 0.5)`: un número aleatorio
 * congelado en el momento de generar la galaxia. Ahora ese valor sorteado es
 * solo la base y se le suma lo que el objetivo tiene de verdad.
 */
export function getTargetEspDefense(target) {
  if (!target) return 0;
  const base = target.espDefenseLvl || Math.floor((target.aiLevel || 1) * 0.5);
  const buildings = target.buildings || {};

  // Sensores: exigen spyCenter para construirse y ahora por fin defienden.
  const sensors = (buildings.earlyWarningSat || 0) + (buildings.phalanxSensors || 0);

  // `advSensors` ("Alcance del sensor phalax, +15%/nv") amplía el valor del
  // sensor phalanx; antes `sensorRange` no lo leía nadie.
  const sensorRange = (target.research?.advSensors || 0) * 0.15;
  const sensorPower = sensors * (1 + sensorRange);

  // Una IA que ha desarrollado Espionaje resiste mejor el escaneo.
  const techBonus = Math.floor((target.research?.espionage || 0) * 0.8);

  return base + Math.floor(sensorPower) + techBonus;
}

/** Bonus de espionaje de la facción del planeta que lanza la sonda. */
export function getFactionEspionageMult(factionKey) {
  const faction = FACTIONS[factionKey];
  return faction?.bonuses?.espionage ?? 1.0;
}

/**
 * Las nueve facciones declaran `bonuses.espionage` entre 0.95 y 1.20 y nadie lo
 * leía. Se traduce a escalones de diferencia técnica: la mejor facción compra un
 * par de escalones de inteligencia, la peor ninguno. Multiplicar la diferencia
 * entera por el bonus movería umbrales y es mas fragil que sumarlo.
 */
export const FACTION_DIFF_SCALE = 10;

export function getFactionEspionageDiffBonus(factionMult = 1.0) {
  return Math.round((factionMult - 1) * FACTION_DIFF_SCALE);
}

/**
 * Contramedidas del jugador frente a ser detectado.
 *
 * Devuelve multiplicadores, no probabilidades: quien decide el valor final es
 * `computeEspionageDetection`.
 */
export function getEspionageCountermeasures(planet, state) {
  // La investigación vive en state.research o en el planeta
  const research = (state && state.research) ? state.research : (planet?.research || {});
  
  // Las mejoras de ministerios viven en planet.ministryUpgrades.intel
  // Se da soporte prioritario a la fuente real, manteniendo compatibilidad con state.ministries
  const planetMinUpgrades = planet?.ministryUpgrades?.intel || {};
  const stateMinUpgrades = state?.ministries?.intel?.upgrades || {};
  const upgrades = { ...stateMinUpgrades, ...planetMinUpgrades };

  const cryptoLevel = research.galacticCrypto || 0;
  const cryptoReduction = Math.min(CRYPTO_MAX_REDUCTION, cryptoLevel * CRYPTO_STEP);

  // `quantum_scrambler` sube lo fácil que te detectan: son inhibidores de red.
  const scramblerBoost = Math.min(SCRAMBLER_MAX_BOOST, (upgrades.quantum_scrambler || 0) * SCRAMBLER_STEP);

  return {
    cryptoReduction,
    scramblerBoost,
    // Multiplicador de sigilo de la flota que viaja: se aplica aparte porque
    // depende de la misión, no del planeta.
    stealthMult: 1,
  };
}

/**
 * Sigilo total de una flota. Reusa `calcCustomShipStats`, que ya calculaba el
 * valor y lo descartaba.
 */
export function getFleetStealth(fleet, blueprints = []) {
  let total = 0;
  for (const [id, qty] of Object.entries(fleet || {})) {
    if (!id.startsWith('custom_') || !qty) continue;
    const bp = blueprints.find(b => id === `custom_${b.id}`);
    if (!bp) continue;
    total += (calcCustomShipStats(bp).stealth || 0) * qty;
  }
  return total;
}

/**
 * Probabilidad final de detección.
 *
 * @param {object}  params
 * @param {number}  params.techDiff        investigación de espionaje menos defensa del objetivo
 * @param {number}  params.baseChance      override de la base, para tests
 * @param {object}  params.countermeasures resultado de getEspionageCountermeasures
 * @param {number}  params.stealth         sigilo total de la flota
 */
export function computeEspionageDetection({
  techDiff,
  baseChance = DETECTION_BASE,
  countermeasures = {},
  stealth = 0,
} = {}) {
  let chance = baseChance - techDiff * 0.10;

  const reduction = countermeasures.cryptoReduction || 0;
  const stealthReduction = Math.min(STEALTH_MAX_REDUCTION, stealth * STEALTH_STEP);
  chance *= 1 - reduction;
  chance *= 1 - stealthReduction;
  chance *= countermeasures.scramblerBoost > 0 ? (1 + countermeasures.scramblerBoost) : 1;

  return Math.max(DETECTION_MIN, Math.min(DETECTION_MAX, chance));
}

/**
 * Techo de inteligencia alcanzable.
 *
 * El salto de `high` a `full` exige `techDiff > 6`, un listón alto. El programa
 * ministerial `sleeper_net` ("+10% Intel Máxima de IAs por nivel") lo baja para
 * que exista una vía player's para alcanzarlo.
 */
export function applyIntelCeiling(techDiff, ceilingBonus = 0) {
  return techDiff + ceilingBonus;
}

/** Bonus de techo que dan los programas del Ministerio de Inteligencia. */
export function getIntelCeilingBonus(state, planet = null) {
  const stateUpgrades = state?.ministries?.intel?.upgrades || {};
  const currentPlanet = planet || state?.planets?.find(p => p.id === state.currentPlanetId) || state?.planets?.[0];
  const planetUpgrades = currentPlanet?.ministryUpgrades?.intel || {};
  const upgrades = { ...stateUpgrades, ...planetUpgrades };

  const sleeperLevels = upgrades.sleeper_net || 0;
  return Math.min(SLEEPER_CEILING_MAX, sleeperLevels * SLEEPER_CEILING_STEP);
}

/**
 * COSTE OPERATIVO DE UNA MISIÓN DE ESPIONAJE.
 *
 * Antes una operación de espionaje no costaba nada: solo el combustible genérico
 * del viaje. Mandar cinco sondas a través de la galaxia era gratis.
 */
export const ESPIONAGE_DUT_PER_PROBE = 250;
export const ESPIONAGE_DUT_PER_SPY_TECH = 40;
export const ESPIONAGE_CRYSTAL_BASE = 500;
export const ESPIONAGE_CRYSTAL_PER_SPY_TECH = 0.05;

export function getEspionageMissionCost(probeCount, spyTech = 0) {
  const sondas = Math.max(0, probeCount || 0);
  const tech = Math.max(0, spyTech || 0);
  return {
    metal: 0,
    deuterium: Math.round(sondas * ESPIONAGE_DUT_PER_PROBE + tech * ESPIONAGE_DUT_PER_SPY_TECH),
    crystal: Math.round(ESPIONAGE_CRYSTAL_BASE * (1 + tech * ESPIONAGE_CRYSTAL_PER_SPY_TECH)),
  };
}

/**
 * FASES DE UNA MISIÓN DE ESPIONAJE.
 *
 * La misión en vuelo ya se distinguía por `returning`, y el resultado ya queda
 * en `tacticalEventLog` (`espionage`, `espionage_alert`, `espionage_return`),
 * que es persistente. No se crea un historial paralelo: solo se nombra la fase
 * para poder mostrarla y consultarla.
 */
export const ESPIONAGE_PHASES = {
  EN_VUELO: 'en_vuelo',
  REGRESANDO: 'regresando',
  COMPLETADA: 'completada',
  FALLIDA: 'fallida',
  DESTRUIDA: 'destruida',
};

export const ESPIONAGE_PHASE_LABELS = {
  [ESPIONAGE_PHASES.EN_VUELO]: 'En vuelo',
  [ESPIONAGE_PHASES.REGRESANDO]: 'Regresando',
  [ESPIONAGE_PHASES.COMPLETADA]: 'Completada',
  [ESPIONAGE_PHASES.FALLIDA]: 'Fallida',
  [ESPIONAGE_PHASES.DESTRUIDA]: 'Destruida',
};

export function getEspionagePhaseLabel(phase) {
  return ESPIONAGE_PHASE_LABELS[phase] || ESPIONAGE_PHASE_LABELS[ESPIONAGE_PHASES.EN_VUELO];
}

/** Cuántas sondas van en una flota de espionage. */
export function countProbes(fleet) {
  let total = 0;
  for (const [id, qty] of Object.entries(fleet || {})) {
    if (INTEL_SHIP_IDS.has(id)) total += qty || 0;
  }
  return total;
}

/**
 * DEFENSA CONTRA EL ESPIONAJE ENEMIGO.
 *
 * Estas cinco mecánicas estaban escritas y sin uso porque la IA no espiaba a
 * nadie. Se conectan aqui, que es donde por fin tienen consumidor.
 *
 *   - `hawk_eye`        Ministerio de Inteligencia, "+15% Defensa frente a
 *                       espionaje por nivel"
 *   - `counterIntelLevel` estado del Ministerio, nivel de contraespionaje
 *   - `espionageBudget` estado del Ministerio, fracción del presupuesto dedicated
 *   - `quantumCrypto`   "Antiespionaje defensivo"
 *   - `stealthSilos`    "Protege silos de espionaje"
 */
export const HAWK_STEP = 0.15;
export const QUANTUM_CRYPTO_STEP = 0.10;
export const STEALTH_SILOS_STEP = 0.08;

/**
 * Devuelve tanto la defensa como el porcentaje de reducción de la detección, que
 * no son lo mismo: la defensa sube el listón de tecnología, y el porcentaje
 * multiplica la probabilidad final.
 */
export function getPlayerEspDefense(planet, state) {
  const research = (state && state.research) ? state.research : (planet?.research || {});
  const intelMinistry = state?.ministries?.intel || {};
  const stateUpgrades = intelMinistry.upgrades || {};
  const planetUpgrades = planet?.ministryUpgrades?.intel || {};
  const upgrades = { ...stateUpgrades, ...planetUpgrades };
  const buildings = planet?.buildings || {};

  const hawkLevels = upgrades.hawk_eye || 0;
  const counterIntelLevel = planet?.ministries?.intel?.counterIntelLevel ?? intelMinistry.counterIntelLevel ?? 0;
  const budget = planet?.ministries?.intel?.espionageBudget ?? intelMinistry.espionageBudget ?? 0;
  const quantumCrypto = research.quantumCrypto || 0;
  const stealthSilos = research.stealthSilos || 0;
  const sensors = (buildings.earlyWarningSat || 0) + (buildings.phalanxSensors || 0);

  // Escala de dificultad: sube el listón que la IA tiene que superar.
  const defense =
    hawkLevels * HAWK_STEP * 10 +
    counterIntelLevel +
    Math.floor(sensors * 0.5) +
    Math.floor(quantumCrypto * 0.5) +
    Math.floor(stealthSilos * 0.5);

  // Multiplicador: reduce la probabilidad final de detección.
  const reduction = Math.min(
    PLAYER_DEFENSE_MAX_REDUCTION,
    hawkLevels * HAWK_STEP +
    budget +
    quantumCrypto * QUANTUM_CRYPTO_STEP +
    stealthSilos * STEALTH_SILOS_STEP
  );

  return { defense, reduction };
}

export const PLAYER_DEFENSE_MAX_REDUCTION = 0.65;

/**
 * Bonus de detección que aporta una patrulla activa del jugador sobre su propio
 * territorio. `PatrolControlSection` anunciaba que las patrullas interceptaban
 * espías; `patrolActions` solo fusionaba sus naves contra misiones de `attack`.
 * Por eso interceptar sondas nunca habia pasado.
 */
export const PATROL_INTERCEPT_BONUS = 0.35;

/**
 * Orden de los niveles de inteligencia. El jugador nunca pierde lo que ya sabe
 * de un mundo: un informe mejorado nunca borra el anterior.
 */
export const INTEL_RANK = { blocked: 0, low: 1, medium: 2, high: 3, full: 4 };

export function bestIntelLevel(a, b) {
  if (!a) return b;
  if (!b) return a;
  return (INTEL_RANK[b] ?? -1) > (INTEL_RANK[a] ?? -1) ? b : a;
}

export function intelIsKnown(level) {
  return (INTEL_RANK[level] ?? 0) >= INTEL_RANK.low;
}
