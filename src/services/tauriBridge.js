/**
 * Puente IPC de Ultra-Baja Latencia con el Motor Nativo de Rust (Tauri v2).
 * Si el juego se ejecuta en Tauri, delega los cálculos pesados a Rust.
 * Si se ejecuta en Electron / Navegador, utiliza fallback en JavaScript transparente.
 */
let isTauriAvailable = false;
let tauriInvoke = null;
let initialized = false;

async function initTauri() {
  if (initialized) return;
  initialized = true;
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      tauriInvoke = invoke;
      isTauriAvailable = true;
      console.log('[Ascensión] Motor Rust (Tauri v2) detectado y activo');
    } catch (e) {
      console.warn('[Ascensión] Tauri no disponible, usando fallback JS:', e);
    }
  }
}

/**
 * Consulta la versión del motor de simulación nativo de Rust
 */
export const getRustEngineVersion = async () => {
  await initTauri();
  if (isTauriAvailable && tauriInvoke) {
    try {
      return await tauriInvoke('get_engine_version');
    } catch (e) {
      console.warn('[TauriBridge] Error invocando get_engine_version:', e);
    }
  }
  return 'Ascension-JS-Fallback-v1.0';
};

/**
 * Calcula el coste de un edificio delegando en Rust
 */
export const calcBuildingCostNative = async (baseM, baseC, baseD, factor, level, ccLevel) => {
  await initTauri();
  if (isTauriAvailable && tauriInvoke) {
    try {
      return await tauriInvoke('calculate_building_cost_native', {
        baseM,
        baseC,
        baseD,
        factor,
        level,
        ccLevel,
      });
    } catch (e) {
      console.warn('[TauriBridge] Error en calculate_building_cost_native:', e);
    }
  }
  // Fallback transparente
  const discount = 1 / (1 + 0.15 * (ccLevel || 0));
  const mult = Math.pow(factor, level);
  return {
    metal: Math.floor(baseM * mult * discount),
    crystal: Math.floor(baseC * mult * discount),
    deuterium: Math.floor(baseD * mult * discount),
  };
};

/**
 * Procesa un segundo de simulación en Rust con cómputo nativo
 */
export const processPlanetTickNative = async (planet, gameSpeed) => {
  await initTauri();
  if (isTauriAvailable && tauriInvoke) {
    try {
      return await tauriInvoke('process_planet_tick_native', { planet, gameSpeed });
    } catch (e) {
      console.warn('[TauriBridge] Error en process_planet_tick_native:', e);
    }
  }
  return null;
};
