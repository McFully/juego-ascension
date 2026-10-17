import { useEffect, useRef } from "react";
import { calcProduction, GAME_SPEED } from "../core.jsx";

export function useOfflineProgress({ state, ready, dispatch, fmt, stateRef }) {
  const offlineProcessedRef = useRef(false);
  const lastSessionIdRef = useRef(state?._sessionId || state?.playerName);

  useEffect(() => {
    const currentSession = state?._sessionId || state?.playerName;
    if (currentSession !== lastSessionIdRef.current) {
      offlineProcessedRef.current = false;
      lastSessionIdRef.current = currentSession;
    }
  }, [state?._sessionId, state?.playerName]);

  useEffect(() => {
    if (!state?.gameStarted || !state?.lastTick || !ready || offlineProcessedRef.current) return;
    const elapsed = (Date.now() - state.lastTick) / 1000;
    if (elapsed <= 300) return;
    offlineProcessedRef.current = true;

    // Límite de 30 minutos (1.800 s) para evitar inflación desmedida
    const simulatedSeconds = Math.min(Math.floor(elapsed), 1800);
    const hours = Math.floor(simulatedSeconds / 3600);
    const mins = Math.floor((simulatedSeconds % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const planetGains = {};
    const totalGathered = { metal: 0, crystal: 0, deuterium: 0 };

    for (const planet of (state.planets || [])) {
      let prod = { metal: 0, crystal: 0, deuterium: 0 };
      try {
        const planetTax = planet.taxRate ?? state.ministries?.economy?.taxRate ?? 0;
        prod = calcProduction(
          planet.buildings,
          state.research,
          planet.temperature,
          GAME_SPEED,
          planet.faction || 'human',
          planet.biome,
          planet.gravity,
          planet.trait,
          planet.specialization,
          { galaxy: planet.galaxy, system: planet.system, position: planet.position },
          planetTax
        );
      } catch (_) {}

      // Producción analítica exacta: (tasa horaria / 3600) * segundos simulados
      const gainM = Math.max(0, Math.floor(((prod?.metal || 0) / 3600) * simulatedSeconds));
      const gainC = Math.max(0, Math.floor(((prod?.crystal || 0) / 3600) * simulatedSeconds));
      const gainD = Math.max(0, Math.floor(((prod?.deuterium || 0) / 3600) * simulatedSeconds));

      planetGains[planet.id] = {
        metal: gainM,
        crystal: gainC,
        deuterium: gainD
      };

      totalGathered.metal += gainM;
      totalGathered.crystal += gainC;
      totalGathered.deuterium += gainD;
    }

    const richMessage = `⏱️ Progreso offline: ${timeStr} simulados\n⛏️ +${fmt(totalGathered.metal)} Metal  💎 +${fmt(totalGathered.crystal)} Cristal  ⚗️ +${fmt(totalGathered.deuterium)} Deuterio`;

    dispatch({
      type: "APPLY_OFFLINE_PROGRESS",
      payload: {
        seconds: simulatedSeconds,
        planetGains,
        totalGathered,
        notification: {
          id: Math.random().toString(36).slice(2, 11),
          type: "success",
          message: richMessage,
          timestamp: Date.now()
        }
      }
    });
  }, [ready, dispatch, fmt, state, stateRef]);
}

