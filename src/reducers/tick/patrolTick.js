import { uid, updatePlanet } from '../../core.jsx';

/**
 * Procesa el ciclo periódico de las patrullas activas:
 * 1. Descuenta deuterio de mantenimiento según hourlyFuel del planeta custodiado (o planeta base).
 * 2. Si el planeta se queda sin deuterio, la patrulla se cancela y regresa a dársenas de su planeta de origen (homePlanetId).
 * 3. Si la patrulla tenía tiempo limitado (expiresAt) y vence, regresa a dársenas automáticamente.
 */
export const processPatrolsTick = (state, now) => {
  if (!Array.isArray(state.patrols) || state.patrols.length === 0) {
    return state;
  }

  let newState = { ...state };
  const remainingPatrols = [];
  const notificationsToAdd = [];

  for (const patrol of newState.patrols) {
    const planet = newState.planets.find(p => p.id === patrol.planetId);
    const returnTargetId = patrol.homePlanetId || patrol.planetId;
    const returnPlanet = newState.planets.find(p => p.id === returnTargetId) || planet;

    if (!planet || !returnPlanet) continue;

    // Verificar expiración de tiempo
    if (patrol.expiresAt && now >= patrol.expiresAt) {
      // Regreso a base
      const returnedFleet = { ...returnPlanet.fleet };
      for (const [id, qty] of Object.entries(patrol.fleet || {})) {
        returnedFleet[id] = (returnedFleet[id] || 0) + qty;
      }
      newState = updatePlanet(newState, returnPlanet.id, p => ({
        ...p,
        fleet: returnedFleet
      }));

      notificationsToAdd.push({
        id: uid(),
        type: 'info',
        message: `⏱️ Misión de ${patrol.patrolType === 'orbital' ? 'Patrulla Orbital' : 'Policía de Sistema'} completada en ${patrol.planetName}. La flota ha atracado en las dársenas de ${returnPlanet.name}.`,
        timestamp: now
      });
      continue;
    }

    // Descontar combustible cada ~60 segundos (o por tick fraccionado)
    const elapsedSinceLastFuel = now - (patrol.lastFuelDeduction || now);
    if (elapsedSinceLastFuel >= 60000) {
      const minutesElapsed = Math.floor(elapsedSinceLastFuel / 60000);
      const fuelCost = Math.max(1, Math.round((patrol.hourlyFuel / 60) * minutesElapsed));

      // El combustible se descuenta preferentemente de la colonia custodiada o del planeta base si tiene reservas
      const fuelSourcePlanet = (planet.resources?.deuterium || 0) >= fuelCost ? planet : returnPlanet;

      if ((fuelSourcePlanet.resources?.deuterium || 0) < fuelCost) {
        // Falta de combustible: Regreso forzado
        const returnedFleet = { ...returnPlanet.fleet };
        for (const [id, qty] of Object.entries(patrol.fleet || {})) {
          returnedFleet[id] = (returnedFleet[id] || 0) + qty;
        }
        newState = updatePlanet(newState, returnPlanet.id, p => ({
          ...p,
          fleet: returnedFleet
        }));

        notificationsToAdd.push({
          id: uid(),
          type: 'warning',
          message: `⚠️ Patrulla en ${patrol.planetName} abortada: Reservas de deuterio agotadas. Las naves han regresado a las dársenas de ${returnPlanet.name}.`,
          timestamp: now
        });
        continue;
      }

      // Descontar deuterio
      newState = updatePlanet(newState, fuelSourcePlanet.id, p => ({
        ...p,
        resources: {
          ...p.resources,
          deuterium: p.resources.deuterium - fuelCost
        }
      }));

      remainingPatrols.push({
        ...patrol,
        lastFuelDeduction: now
      });
    } else {
      remainingPatrols.push(patrol);
    }
  }

  newState.patrols = remainingPatrols;
  if (notificationsToAdd.length > 0) {
    newState.notifications = [...(newState.notifications || []), ...notificationsToAdd];
  }

  return newState;
};
