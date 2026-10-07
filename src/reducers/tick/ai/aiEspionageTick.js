import { uid, calcDistance, calcFlightTime, fleetSpeed } from '../../../core.jsx';
import { countProbes, ESPIONAGE_PHASES } from '../../../utils/espionageFormulas.js';

/**
 * ESPIONAJE DE LAS IAs.
 *
 * Antes la IA no espiaba a nadie: `handleEspionageMission` solo buscaba objetivos
 * en `aiPlanets`, asi que una mision de IA no encontraba nada y se limitaba a
 * devolver la flota. De ahi que cinco mecanicas de contraespionaje del jugador
 * estuvieran compradas y sin efecto.
 *
 * Reglas, deliberadamente conservadoras para no invadir la partida:
 *   - cada 90 ticks, y como maximo una sonda por faccion y por tanda;
 *   - solo IAs con Espionaje 2 o mas, que es lo que fija `shipsData` como
 *     requisito de `espionageProbe`;
 *   - solo si la sonda no esta ya en vuelo hacia ese objetivo;
 *   - y solo si el mundo sigue existiendo y sigue siendo del jugador.
 */
export const AI_ESPIONAGE_INTERVAL = 90;
export const AI_ESPIONAGE_MIN_TECH = 2;

export const processAiEspionageTick = (state) => {
  const tick = state.gameTick || 0;
  if (tick % AI_ESPIONAGE_INTERVAL !== 0) return state;

  const playerPlanets = state.planets || [];
  const enemies = state.aiPlanets || [];
  if (playerPlanets.length === 0 || enemies.length === 0) return state;

  // Un objetivo por sonda ya en vuelo: no se duplica el espia sobre el mismo mundo.
  const yaEspiado = new Set(
    (state.fleetMissions || [])
      .filter(m => m.type === 'espionage' && m.isAI)
      .map(m => `${m.from?.id}->${m.to?.planetId || `${m.to?.galaxy}:${m.to?.system}:${m.to?.position}`}`)
  );

  const nuevasMisiones = [];
  const espias = new Map();

  for (const origen of enemies) {
    if (espias.has(origen.id)) continue;
    const spyTech = origen.research?.espionage || 0;
    if (spyTech < AI_ESPIONAGE_MIN_TECH) continue;
    if (countProbes(origen.fleet) < 1) continue;

    // La IA elige a quien no conoce: los mundos que todavia no ha espiado.
    const candidatos = playerPlanets.filter(p =>
      !yaEspiado.has(`${origen.id}->${p.id}`)
    );
    if (candidatos.length === 0) continue;

    const objetivo = candidatos[Math.floor(Math.random() * candidatos.length)];
    const dist = calcDistance(
      { galaxy: origen.galaxy || 1, system: origen.system || 1, position: origen.position || 1 },
      { galaxy: objetivo.galaxy || 1, system: objetivo.system || 1, position: objetivo.position || 1 }
    );
    const spd = fleetSpeed({ espionageProbe: 1 }, origen.research || {}, origen.faction || 'human');
    if (!spd || isNaN(spd) || spd <= 0) continue;

    const rawFlightTime = calcFlightTime(dist, spd, 10, origen.research || {});
    const flightTime = (!isNaN(rawFlightTime) && rawFlightTime > 0) ? Math.max(10, rawFlightTime) : 60;
    const departure = Date.now();

    nuevasMisiones.push({
      id: uid(),
      type: 'espionage',
      from: origen,
      to: {
        galaxy: objetivo.galaxy,
        system: objetivo.system,
        position: objetivo.position,
        planetId: objetivo.id,
        name: objetivo.name,
      },
      fleet: { espionageProbe: 1 },
      probes: 1,
      phase: ESPIONAGE_PHASES.EN_VUELO,
      departure,
      arrivalTime: departure + flightTime * 1000,
      returnTime: departure + flightTime * 2000,
      isAI: true,
    });

    espias.set(origen.id, origen.id);
    yaEspiado.add(`${origen.id}->${objetivo.id}`);
  }

  if (nuevasMisiones.length === 0) return state;

  // La sonda sale del almacén de la IA.
  const despachadas = new Set(nuevasMisiones.map(m => m.from.id));
  return {
    ...state,
    fleetMissions: [...(state.fleetMissions || []), ...nuevasMisiones],
    aiPlanets: (state.aiPlanets || []).map(p => {
      if (!despachadas.has(p.id)) return p;
      const fleet = { ...(p.fleet || {}) };
      fleet.espionageProbe = Math.max(0, (fleet.espionageProbe || 0) - 1);
      if (fleet.espionageProbe <= 0) delete fleet.espionageProbe;
      return { ...p, fleet };
    }),
  };
};
