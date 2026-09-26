import { useMemo } from 'react';

/**
 * useCombatPredictions
 * Agrupa los ataques entrantes por planeta de destino y ejecuta
 * simulaciones secuenciales para predecir el desenlace (Victoria, Empate, Derrota)
 */
export function useCombatPredictions(state, incomingAttacks, simulateCombat, getEffectiveTech) {
  return useMemo(() => {
    if (!incomingAttacks || incomingAttacks.length === 0) return {};

    const sortedIncomingAttacks = [...incomingAttacks].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const attacksByPlanet = {};
    sortedIncomingAttacks.forEach(m => {
      const destKey = m.toPlanetId || `${m.to?.galaxy}:${m.to?.system}:${m.to?.position}`;
      if (!attacksByPlanet[destKey]) attacksByPlanet[destKey] = [];
      attacksByPlanet[destKey].push(m);
    });

    const predictions = {};

    Object.entries(attacksByPlanet).forEach(([destKey, list]) => {
      const firstM = list[0];
      const destPlanet = (state.planets || []).find(p =>
        p.id === firstM.toPlanetId ||
        p.name === firstM.to?.name ||
        (p.galaxy === firstM.to?.galaxy && p.system === firstM.to?.system && p.position === firstM.to?.position)
      );

      if (!destPlanet) {
        list.forEach(m => {
          predictions[m.id] = { color: "text-red-400 border-red-500/30 bg-red-950/20", text: "Peligro Máximo" };
        });
        return;
      }

      let currentFleet = { ...(destPlanet.fleet || {}) };
      let currentDefenses = { ...(destPlanet.defenses || {}) };
      const defTech = getEffectiveTech(destPlanet, state.research);

      list.forEach(m => {
        const attackerFleet = m.fleet || {};
        const atkTech = state.research || { weapons: 0, shields: 0, armour: 0 };

        const sim = simulateCombat(
          attackerFleet,
          currentFleet,
          currentDefenses,
          atkTech,
          defTech,
          6,
          state.blueprints,
          m.faction || "human",
          destPlanet.faction || "human"
        );

        currentFleet = sim.defShipSurvivors || {};
        currentDefenses = sim.defDefenseSurvivors || {};

        let colorClass = "";
        let statusText = "";
        if (sim.winner === "defender") {
          const initialPlanetShips = Object.values(destPlanet.fleet || {}).reduce((a, b) => a + b, 0);
          const initialPlanetDefs = Object.values(destPlanet.defenses || {}).reduce((a, b) => a + b, 0);
          const initialDefTotal = initialPlanetShips + initialPlanetDefs;

          const survivingDefShips = Object.values(currentFleet).reduce((a, b) => a + b, 0);
          const survivingDefDefs = Object.values(currentDefenses).reduce((a, b) => a + b, 0);
          const survivingTotal = survivingDefShips + survivingDefDefs;

          const ratio = survivingTotal / Math.max(initialDefTotal, 1);
          if (ratio > 0.8) {
            colorClass = "text-emerald-400 border-emerald-500/40 bg-emerald-950/20";
            statusText = "Victoria Asegurada";
          } else if (ratio > 0.4) {
            colorClass = "text-cyan-400 border-cyan-500/40 bg-cyan-950/20";
            statusText = "Victoria Cómoda";
          } else {
            colorClass = "text-amber-400 border-amber-500/40 bg-amber-950/20";
            statusText = "Victoria Crítica (Bajas graves)";
          }
        } else if (sim.winner === "draw") {
          colorClass = "text-amber-400 border-amber-500/40 bg-amber-950/20";
          statusText = "Empate Táctico";
        } else {
          colorClass = "text-red-500 border-red-500/40 bg-red-950/20";
          statusText = "Derrota Inevitable";
        }

        predictions[m.id] = {
          color: colorClass,
          text: statusText
        };
      });
    });

    return predictions;
  }, [state.planets, state.research, state.blueprints, incomingAttacks, simulateCombat, getEffectiveTech]);
}
