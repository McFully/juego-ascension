import { useEffect, useRef } from "react";
import { processColonyGovernor } from "../reducers/colonyGovernor.js";
import { auditGameState, logTelemetry } from "../utils/telemetry.js";

export function useGameTick({ state, dispatch, production, TICK_MS, stateRef }) {
  const productionRef = useRef(production);
  productionRef.current = production;

  useEffect(() => {
    if (!state?.gameStarted) return;

    let worker = null;
    let isProcessingTick = false;
    let lastTickSentTime = 0;

    try {
      if (typeof Worker !== 'undefined') {
        worker = new Worker(new URL('../workers/game.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
          try {
            const { action, payload } = e.data || {};
            if (action === 'TICK_SUCCESS' && payload?.newState) {
              dispatch({ type: 'APPLY_TICK_STATE', payload: payload.newState });
              try { processColonyGovernor(payload.newState, dispatch); } catch (gErr) { console.error('[Ascensión] Governor error:', gErr); }
              try { auditGameState(payload.newState, productionRef.current); } catch (aErr) { console.error('[Ascensión] Audit error:', aErr); }
            } else if (action === 'TICK_ERROR') {
              console.warn('[Ascensión] Worker TICK error, procesando fallback síncrono:', payload?.error);
              dispatch({ type: 'TICK' });
            }
          } finally {
            isProcessingTick = false;
          }
        };
        worker.onerror = (err) => {
          console.warn('[Ascensión] Worker exception, ejecutando fallback:', err);
          isProcessingTick = false;
        };
      }
    } catch (workerInitErr) {
      console.warn('[Ascensión] No se pudo inicializar Web Worker, usando hilo principal:', workerInitErr);
      worker = null;
    }

    const interval = setInterval(() => {
      try {
        const currentState = stateRef.current || state;
        const now = Date.now();

        // Watchdog: si el worker tarda más de 3.5s en responder, desbloquear bandera
        if (isProcessingTick && (now - lastTickSentTime > 3500)) {
          console.warn('[Ascensión] Watchdog: Worker tick tardó demasiado, forzando desbloqueo');
          isProcessingTick = false;
        }

        if (worker && !isProcessingTick) {
          isProcessingTick = true;
          lastTickSentTime = now;
          try {
            worker.postMessage({
              action: 'TICK',
              payload: { state: currentState, tickId: now }
            });
          } catch (postErr) {
            console.error('[Ascensión] worker.postMessage error, ejecutando fallback síncrono:', postErr);
            isProcessingTick = false;
            dispatch({ type: 'TICK' });
          }
        } else if (!worker) {
          dispatch({ type: 'TICK' });
          try { processColonyGovernor(stateRef.current || state, dispatch); } catch (_) {}
          try { auditGameState(stateRef.current || state, productionRef.current); } catch (_) {}
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
      if (worker) {
        try { worker.terminate(); } catch (_) {}
      }
    };
  }, [state?.gameStarted, TICK_MS, dispatch, stateRef]);
}
