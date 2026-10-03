import { eventReducer } from '../eventReducer.js';

export function processWorldAlertsTick(newState, now) {
  const invasionMsgs = (newState.fleetMissions || [])
    .filter(m => m.type === 'attack' && m.isAI && m.remainingTicks <= 300);
  const hayInvasion = invasionMsgs.length > 0;
  const crisisEnergia = (newState.planets || [])
    .some(p => (p.production?.energyBalance ?? 0) < 0);

  const registrarEstadoMundo = (key, entry) => {
    const yaEstaba = Boolean(newState.worldAlertLog?.[key]);
    const ahora = Boolean(entry);
    if (yaEstaba === ahora) return;
    newState.worldAlertLog = { ...(newState.worldAlertLog || {}), [key]: ahora };
    newState = eventReducer(newState, {
      type: 'APPEND_TACTICAL_EVENT_LOG',
      payload: { ...entry, kind: 'tactical', read: false, priority: 'critica' },
    });
  };

  registrarEstadoMundo('invasion', hayInvasion && {
    id: `alert-invasion-${now}`,
    type: 'invasion',
    title: 'Invasión detectada',
    subtitle: 'Flota hostil en Sector Perimetral',
    description: invasionMsgs.length > 1
      ? `${invasionMsgs.length} flotas hostiles se aproximan a tus planetas.`
      : 'Una flota hostil se aproxima a tus planetas. El aviso se mantiene mientras dure el ataque.',
  });
  registrarEstadoMundo('crisisEnergia', crisisEnergia && {
    id: `alert-energia-${now}`,
    type: 'crisis_energetica',
    title: 'Crisis energética',
    subtitle: 'Balance de energía negativo',
    description: 'Alguno de tus planetas consume más energía de la que produce. El aviso se mantiene mientras dure la crisis.',
  });

  return newState;
}
