/**
 * queueTiming.js — Reajuste del tiempo restante de las operaciones EN CURSO.
 *
 * EL PROBLEMA
 * -----------
 * Cuando se encola una operación, su `endTime` se calcula con los edificios y
 * demás bonus que había en ese instante. Si después el jugador sube el laboratorio,
 * la fábrica de robots, el astillero o cualquier otro edificio que reduzca tiempos,
 * el `endTime` ya grabado sigue siendo el viejo: la operación NO se acelera.
 *
 * Ejemplo real: una investigación con 2 h de restante. Subes el laboratorio de
 * nv.2 a nv.3. El laboratorio da `1 + lvl*0.5`, así que el divisor pasa de 2.0 a
 * 2.5 y lo que quedaba debería caer a 2 * (2.0/2.5) = 1 h 36 min. Sin este módulo
 * se queda en 2 h.
 *
 * LA SOLUCIÓN
 * -----------
 * Todas las fórmulas de tiempo del juego (calcBuildTime, calcResearchTime,
 * calcShipTime, calcDefenseTime, calcCustomShipTime, calculateRetrofitUnitTime) son
 * PUREMENTE MULTIPLICATIVAS respecto a `cost`. Por eso el cociente entre dos
 * sondeos con un coste arbitrario es exactamente el cociente entre las duraciones
 * reales, para cualquier coste que sea.
 *
 * Eso permite NO reimplementar ninguna fórmula: se llama a la fórmula real con un
 * coste sonda de 1 y se guarda el resultado como "multiplicador de la operación".
 * Si mañana alguien toca calcBuildTime, el reajuste lo sigue sin cambiar una línea.
 *
 * OJO CON LA DIRECCIÓN: el sondeo devuelve la DURACIÓN, no un factor de velocidad.
 * Un multiplicador MAYOR significa operación MÁS LENTA. Como la duración real es lineal
 * en el sondeo (el coste sonda es el mismo en ambas llamadas), el cociente de duraciones
 * es exactamente el cociente de sondeos:
 *
 *     multNuevo / multViejo  =  duracionNueva / duracionVieja
 *     duracionNueva          =  duracionVieja * (multNuevo / multViejo)
 *
 * El progreso ya realizado NO se toca: se conserva el tiempo real ya transcurrido y
 * solo se recalcula lo que queda. Es lo que espera el jugador ("me han acelerado lo
 * que me faltaba, no me han devuelto trabajo ya hecho").
 *
 * NOTA SOBRE UNIDADES: las colas de naves, defensas y modernizaciones entregan por
 * unidades (`unitsDelivered`). Al acortarse la duración, `unitTime` baja y `completedUnits`
 * SUBE, nunca baja: no se puede perder trabajo entregado.
 */

import {
  shipTimeBonus,
  calcBuildTime,
  calcEffectiveBuildTime,
  calcShipTime,
  calcDefenseTime,
  calcCustomShipTime,
} from '../../../utils/formulas.js';
import { GAME_SPEED } from '../../../data/gameData.js';
import { calculateRetrofitUnitTime } from '../../../utils/formulas/retrofitFormulas.js';
import { researchTimeMultFor } from '../../../utils/formulas/researchTiming.js';
import { logTelemetry } from '../../../utils/telemetry.js';

/** Coste sonda. Cualquier valor positivo vale: solo importa el cociente. */
const PROBE_COST = { metal: 1000, crystal: 1000, deuterium: 0 };
/** Cantidad sonda para las fórmulas que escalan por cantidad. */
const PROBE_QTY = 1;

/** Redondeo defensivo: si el sondeo devuelve algo no numérico, no reajustamos. */
const safe = (n) => (Number.isFinite(n) && n > 0 ? n : null);

const planetOf = (state, planetId) =>
  state.planets?.find(p => p.id === planetId)
  || state.planets?.find(p => p.id === state.currentPlanetId)
  || state.planets?.[0];

/**
 * Devuelve el multiplicador de velocidad de una operación, o `null` si no se puede
 * calcular. El valor NO es comparable entre colas distintas: solo sirve para
 * comparar la MISMA operación antes y después.
 */
export const timeMultFor = (state, kind, item) => {
  const planet = planetOf(state, item?.planetId);
  if (!planet) return null;

  const buildings = planet.buildings || {};
  const research = state.research || {};
  const mins = planet.ministries || state.ministries || {};

  switch (kind) {
    case 'build':
      return safe(calcEffectiveBuildTime({
        cost: PROBE_COST,
        planet,
        state,
        speed: GAME_SPEED
      }));

    case 'research':
      // Mismo helper que usan START_RESEARCH y la auto-investigación, así que el
      // multiplicador grabado y el recalculado son siempre comparables.
      return researchTimeMultFor(state, planet);

    case 'ship': {
      let bonus = shipTimeBonus(buildings);
      if (planet.specialization === 'military') bonus *= 1.20;
      return safe(calcShipTime(
        'lightFighter', PROBE_QTY,
        buildings.shipyard || 0,
        buildings.naniteFactory || 0,
        GAME_SPEED,
        bonus,
        mins
      ));
    }

    case 'defense': {
      let bonus = shipTimeBonus(buildings);
      if (planet.specialization === 'military') bonus *= 1.20;
      return safe(calcDefenseTime(
        'rocketLauncher', PROBE_QTY,
        buildings.shipyard || 0,
        buildings.naniteFactory || 0,
        GAME_SPEED,
        bonus,
        mins
      ));
    }

    case 'customShip': {
      const bp = state.blueprints?.find(b => b.id === item.blueprintId);
      if (!bp) return null;
      let bonus = shipTimeBonus(buildings);
      if (planet.specialization === 'military') bonus *= 1.20;
      return safe(calcCustomShipTime(
        bp,
        buildings.shipyard || 0,
        buildings.naniteFactory || 0,
        GAME_SPEED,
        bonus,
        buildings.constructionCenter || 0,
        mins
      ));
    }

    case 'retrofit': {
      const type = item.type === 'defense_variant' ? 'defense' : 'ship';
      return safe(calculateRetrofitUnitTime(
        item.baseId,
        item.fromVariantSnapshot || {},
        state.research || {},
        buildings.shipyard || 0,
        buildings.naniteFactory || 0,
        GAME_SPEED,
        type
      ));
    }

    default:
      return null;
  }
};

/**
 * Calcula el multiplicador de una operación recién encolada y lo graba en el item.
 * Llamar en el mismo instante del dispatch que empuja el item a la cola.
 */
export const stampTimeMult = (state, kind, item) => {
  const mult = timeMultFor(state, kind, item);
  if (mult == null) return item;
  return { ...item, timeMult: mult };
};

/**
 * Reajusta UNA cola. Devuelve la cola nueva y el número de ítems reajustados.
 */
const reconcileQueue = (state, kind, queue) => {
  if (!Array.isArray(queue) || queue.length === 0) return { queue, changed: 0 };
  const now = Date.now();
  let changed = 0;
  let notified = 0;

  const next = queue.map((item) => {
    if (!item || typeof item !== 'object') return item;
    if (!Number.isFinite(item.startTime) || !Number.isFinite(item.endTime)) return item;
    if (item.endTime <= now) return item;                 // ya terminada, no se toca
    if (item.timeMult == null) return item;               // partida vieja sin estampa

    const newMult = timeMultFor(state, kind, item);
    if (newMult == null) return item;

    // Tolerancia del 0.5% para no re-notificar por ruido de redondeo.
    if (Math.abs(newMult - item.timeMult) / item.timeMult < 0.005) return item;

    const oldDurationMs = item.endTime - item.startTime;
    const elapsedMs = now - item.startTime;
    // El sondeo devuelve la DURACIÓN, así que un multiplicador MAYOR = MÁS LENTO.
    // Como la duración real es lineal en el sondeo (mismo coste sonda), el cociente
    // de duraciones es exactamente el cociente de sondeos:
    //     duracionNueva = duracionVieja * (multNuevo / multViejo)
    let newDurationMs = oldDurationMs * (newMult / item.timeMult);
    if (newDurationMs <= 0 || !Number.isFinite(newDurationMs)) return item;
    // Nunca por debajo de lo ya transcurrido: si no, la operación ya habría terminado.
    newDurationMs = Math.max(newDurationMs, elapsedMs);

    const newEndTime = Math.round(item.startTime + newDurationMs);
    if (newEndTime === item.endTime) return item;

    changed += 1;
    if (notified < 3) {
      notified += 1;
      const delta = item.endTime - newEndTime;
      const sign = delta > 0 ? 'acortada' : 'ampliada';
      const abs = Math.abs(delta);
      const hh = Math.floor(abs / 3600000);
      const mm = Math.round((abs % 3600000) / 60000);
      const deltaTxt = hh > 0 ? `${hh}h ${mm}m` : `${mm}m`;
      logTelemetry('INFO', `Reajuste de tiempos: operación ${sign} en ${deltaTxt}`, {
        kind, deltaMs: delta, multBefore: item.timeMult, multAfter: newMult,
      });
    }

    return { ...item, endTime: newEndTime, timeMult: newMult, timeAdjustedAt: now };
  });

  return { queue: changed > 0 ? next : queue, changed };
};

/** ¿Alguna cola tiene algún ítem YA estampado? Si ninguna, no hay nada que reconciliar. */
const hasStampedItems = (state) => {
  const keys = ['buildQueue', 'researchQueue', 'shipQueue', 'defenseQueue', 'customShipQueue', 'retrofitQueue'];
  for (const key of keys) {
    const q = state[key];
    if (Array.isArray(q) && q.some(i => i && i.timeMult != null)) return true;
  }
  return false;
};

/**
 * Rellena el `timeMult` de los ítems que aún no lo tienen (partidas guardadas antes de
 * que existiera este módulo, o ítems venidos de un path de encolado sin estampar).
 *
 * NO reajusta nada: solo calcula y graba el multiplicador de referencia. A partir del
 * siguiente tick, `reconcileQueueTimings` podrá compararlo con el actual.
 *
 * @returns {number} cuántos ítems se han estampado
 */
export const backfillQueueTimeMults = (state) => {
  if (!state || !state.planets) return { state, stamped: 0 };

  const newState = { ...state };
  let stamped = 0;

  const queues = [
    ['build', 'buildQueue'],
    ['research', 'researchQueue'],
    ['ship', 'shipQueue'],
    ['defense', 'defenseQueue'],
    ['customShip', 'customShipQueue'],
    ['retrofit', 'retrofitQueue'],
  ];

  for (const [kind, key] of queues) {
    const queue = newState[key];
    if (!Array.isArray(queue) || queue.length === 0) continue;

    let touched = false;
    const next = queue.map((item) => {
      if (!item || typeof item !== 'object') return item;
      if (item.timeMult != null) return item;
      const mult = timeMultFor(newState, kind, item);
      if (mult == null) return item;
      touched = true;
      stamped += 1;
      return { ...item, timeMult: mult };
    });

    if (touched) newState[key] = next;
  }

  if (stamped > 0) {
    logTelemetry('INFO', `Backfill: ${stamped} operación(es) heredadas reciben multiplicador de referencia`, { stamped });
  }

  return { state: newState, stamped };
};

/**
 * Reajuste global. Se llama en CADA tick, después de processAllQueuesTick().
 * Solo toca ítems cuyo multiplicador de velocidad ha cambiado de verdad.
 */
export const reconcileQueueTimings = (state) => {
  if (!state || !state.planets) return state;

  const { state: backfilled, stamped } = backfillQueueTimeMults(state);
  const newState = backfilled;
  if (stamped === 0 && !hasStampedItems(state)) return state;

  let totalChanged = 0;

  const queues = [
    ['build', 'buildQueue'],
    ['research', 'researchQueue'],
    ['ship', 'shipQueue'],
    ['defense', 'defenseQueue'],
    ['customShip', 'customShipQueue'],
    ['retrofit', 'retrofitQueue'],
  ];

  for (const [kind, key] of queues) {
    const { queue, changed } = reconcileQueue(newState, kind, newState[key] || []);
    if (changed > 0) {
      newState[key] = queue;
      totalChanged += changed;
    }
  }

  if (totalChanged > 0) {
    logTelemetry('INFO', `Reajuste de tiempos aplicado a ${totalChanged} operación(es) en curso`, { totalChanged });
  }

  return newState;
};
