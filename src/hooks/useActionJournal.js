import { useCallback, useRef } from "react";

// Acciones del propio ciclo de simulación: nunca se reaplican.
const NON_REPLAYABLE = new Set(["TICK", "APPLY_TICK_STATE", "LOAD", "RESET_GAME"]);

/**
 * Envuelve dispatch con un diario de acciones.
 * Mientras un tick del worker está en vuelo, cada acción del jugador se
 * registra para reaplicarse sobre el estado que devuelva el worker.
 * Garantiza: un clic -> una acción -> resultado estable (sin reversión).
 */
export function useActionJournal(rawDispatch) {
  const journalRef = useRef({ tickId: null, pending: [] });

  const dispatch = useCallback((action) => {
    const j = journalRef.current;
    if (action && j.tickId !== null) {
      if (action.type === "LOAD" || action.type === "RESET_GAME") {
        // Cambio de partida: el tick en vuelo queda invalidado.
        j.tickId = null;
        j.pending = [];
      } else if (!NON_REPLAYABLE.has(action.type)) {
        j.pending.push(action);
      }
    }
    rawDispatch(action);
  }, [rawDispatch]);

  return { dispatch, journalRef };
}
