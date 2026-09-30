/**
 * Identidad de la sesion de guardado.
 *
 * `state._sessionId` solo existe despues de CARGAR una partida: al crear una
 * partida nueva no hay ninguna, y el proceso principal genera una en cada
 * guardado. Con el auto-guardado cada 30 s, una partida nueva generaba una
 * sesion nueva en cada pasada (`partida`, `partida-2`, `partida-3`...) hasta
 * 1000, cada una con sus miles de filas de planetas. Solo se veia la ultima.
 *
 * Aqui se guarda el id que devuelve el proceso principal para que el siguiente
 * guardado reutilice la misma sesion. Precedencia:
 *
 *   1. `state._sessionId`  (la partida esta cargada: manda lo que hay)
 *   2. el id guardado aqui (la partida es nueva y ya se guardo una vez)
 *   3. nada                (primera partida y primer guardado: que se cree)
 */

let currentSessionId = null;

export const setSessionId = (id) => {
  currentSessionId = typeof id === "string" && id.length > 0 ? id : null;
};

export const getSessionId = () => currentSessionId;

export const clearSessionId = () => {
  currentSessionId = null;
};

/**
 * Anade `_sessionId` al payload de guardado si hay una sesion conocida.
 * No muta el estado: devuelve una copia.
 */
export const withSessionIdentity = (state) => {
  if (!state || typeof state !== "object") return state;
  const id = state._sessionId || currentSessionId;
  if (!id) return state;
  if (state._sessionId === id) return state;
  return { ...state, _sessionId: id };
};
