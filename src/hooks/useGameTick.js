import { useEffect, useRef } from "react";
import { processColonyGovernor } from "../reducers/colonyGovernor.js";
import { consultStrategicDirector } from "../reducers/tick/ai/strategicAIDirector.js";
import { auditGameState, logTelemetry } from "../utils/telemetry.js";

export function useGameTick({ state, dispatch, production, TICK_MS, stateRef, journalRef }) {
  const productionRef = useRef(production);
  productionRef.current = production;
  const lastDirectorTickRef = useRef(-999);

  const maybeConsultStrategicDirector = (nextState) => {
    try {
      const tick = Number(nextState?.gameTick) || 0;
      if (tick <= 0 || tick % 240 !== 0 || (tick - lastDirectorTickRef.current) < 240) return;
      const activeFactions = (nextState?.aiPlanets || []).filter(p => p && !p.isVirgin);
      if (activeFactions.length === 0) return;
      lastDirectorTickRef.current = tick;
      const featured = [...activeFactions].sort((x, y) => {
        const xScore = (x.aiLevel || 1) + (x.totalWins || 0) * 0.5 - (x.totalLosses || 0) * 0.3;
        const yScore = (y.aiLevel || 1) + (y.totalWins || 0) * 0.5 - (y.totalLosses || 0) * 0.3;
        return yScore - xScore;
      })[0];
      if (!featured) return;
      const universeSummary = `${activeFactions.length} facciones activas. Tick ${tick}. ` +
        `Líder: ${featured.empireName || featured.name} (nivel ${featured.aiLevel || 1}). ` +
        `Guerras recientes: ${(nextState.galacticEvents || []).filter(e => e.type === 'war' && tick - e.tick < 240).length}.`;
      consultStrategicDirector(featured, universeSummary).then(directive => {
        if (directive) {
          dispatch({ type: 'APPLY_AI_STRATEGIC_DIRECTIVE', payload: { factionId: featured.id, directive } });
        }
      }).catch(() => {});
    } catch (_) {}
  };

  useEffect(() => {
    if (!state?.gameStarted) return;

    let worker = null;
    let isProcessingTick = false;
    let lastTickSentTime = 0;
    let missedTicks = 0;
    const journal = journalRef?.current || { tickId: null, pending: [] };
    const releaseTick = () => {
      isProcessingTick = false;
      journal.tickId = null;
      journal.pending = [];
    };

    try {
      if (typeof Worker !== 'undefined') {
        worker = new Worker(new URL('../workers/game.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
          const { action, payload } = e.data || {};
          // Respuesta de un tick ya invalidado (watchdog o cambio de partida): se descarta.
          if (payload?.tickId !== journal.tickId) return;
          const replay = journal.pending;
          releaseTick();
          try {
            if (action === 'TICK_SUCCESS' && payload?.newState) {
              dispatch({ type: 'APPLY_TICK_STATE', payload: payload.newState, replay });
              // Desacoplar procesos pesados no visuales para que no bloqueen los eventos de ratón
              const scheduleBgTask = (typeof window !== 'undefined' && window.requestIdleCallback)
                ? (cb) => window.requestIdleCallback(cb, { timeout: 800 })
                : (cb) => setTimeout(cb, 10);

              scheduleBgTask(() => {
                try { processColonyGovernor(payload.newState, dispatch); } catch (gErr) { console.error('[Ascensión] Governor error:', gErr); }
                try { auditGameState(payload.newState, productionRef.current); } catch (aErr) { console.error('[Ascensión] Audit error:', aErr); }
                maybeConsultStrategicDirector(payload.newState);
              });
            } else if (action === 'TICK_ERROR') {
              console.warn('[Ascensión] Worker TICK error, procesando fallback síncrono:', payload?.error);
              dispatch({ type: 'TICK' });
            }
          } catch (applyErr) {
            console.error('[Ascensión] Error aplicando tick del worker:', applyErr);
          }
        };
        worker.onerror = (err) => {
          console.warn('[Ascensión] Worker exception, ejecutando fallback:', err);
          releaseTick();
        };
      }
    } catch (workerInitErr) {
      console.warn('[Ascensión] No se pudo inicializar Web Worker, usando hilo principal:', workerInitErr);
      worker = null;
    }

    const interval = setInterval(() => {
      try {
        const currentState = stateRef?.current || state;
        const now = Date.now();

        // Watchdog adaptativo: si el worker tarda más de 8s (o se bloqueó el hilo), forzamos reinicio limpio
        if (isProcessingTick && (now - lastTickSentTime > 8000)) {
          console.warn('[Ascensión] Watchdog: Worker tick tardó demasiado (>8s), forzando desbloqueo');
          releaseTick();
          if (worker) {
            try { worker.terminate(); } catch (_) {}
            try {
              worker = new Worker(new URL('../workers/game.worker.js', import.meta.url), { type: 'module' });
            } catch (_) { worker = null; }
          }
          dispatch({ type: 'TICK' });
          return;
        }

        // Si el worker aún está ocupado procesando el tick anterior, aplicamos backpressure amortiguado
        if (worker && isProcessingTick) {
          missedTicks++;
          if (missedTicks > 5) {
            // Si acumula más de 5 ticks omitidos seguidos sin responder, forzar liberación
            releaseTick();
            missedTicks = 0;
            dispatch({ type: 'TICK' });
          }
          return;
        }

        missedTicks = 0;

        if (worker && !isProcessingTick) {
          isProcessingTick = true;
          lastTickSentTime = now;
          journal.tickId = now;
          journal.pending = [];
          try {
            worker.postMessage({
              action: 'TICK',
              payload: { state: currentState, tickId: now }
            });
          } catch (postErr) {
            console.error('[Ascensión] worker.postMessage error, ejecutando fallback síncrono:', postErr);
            releaseTick();
            dispatch({ type: 'TICK' });
          }
        } else if (!worker) {
          dispatch({ type: 'TICK' });
          try { processColonyGovernor(stateRef?.current || state, dispatch); } catch (_) {}
          try { auditGameState(stateRef?.current || state, productionRef.current); } catch (_) {}
        }
      } catch (e) {
        console.error('[Ascensión] TICK dispatch error:', e);
        logTelemetry('ERROR', 'Excepción en ciclo de juego (TICK)', {
          error: e?.message || e,
          stack: e?.stack || '',
          stateSnapshot: {
            playerName: state.playerName,
            gameTick: state.gameTick,
            planetsCount: (state.planets || []).length,
          },
        });
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      releaseTick();
      if (worker) {
        try { worker.terminate(); } catch (_) {}
      }
    };
  }, [state?.gameStarted, TICK_MS, dispatch, stateRef]);
}
