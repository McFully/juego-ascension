import { uid } from '../../core.jsx';

/**
 * Procesa el transporte automatizado continuo de suministros entre colonias hermanas.
 * Evita la inanición en colonias mineras transfiriendo excedentes y reduciendo microgestión.
 */
export const processSupplyRoutesTick = (state) => {
  const routes = state.supplyRoutes || [];
  if (!Array.isArray(routes) || routes.length === 0) return state;

  let newState = { ...state };
  let planetsUpdated = false;
  const planetsMap = new Map((newState.planets || []).map(p => [p.id, { ...p, resources: { ...(p.resources || {}) } }]));

  for (const route of routes) {
    if (!route.active) continue;
    const origin = planetsMap.get(route.originId);
    const destination = planetsMap.get(route.destinationId);

    if (!origin || !destination) continue;

    // Intervalo de transporte por ciclo (cada 60 ticks)
    if ((newState.gameTick || 0) % (route.intervalTicks || 60) === 0) {
      const resourceKey = route.resource || 'metal';
      const transferAmount = route.amount || 2000;

      // Comprobar que el planeta de origen tiene stock suficiente
      if ((origin.resources[resourceKey] || 0) >= transferAmount + 1000) {
        origin.resources[resourceKey] -= transferAmount;
        destination.resources[resourceKey] = (destination.resources[resourceKey] || 0) + transferAmount;
        planetsUpdated = true;
      }
    }
  }

  if (planetsUpdated) {
    newState.planets = Array.from(planetsMap.values());
  }

  return newState;
};
