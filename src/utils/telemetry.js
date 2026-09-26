/* ============================================================
   TELEMETRÍA Y AUDITORÍA INTERNA DE SALUD (telemetry.js)
   Registra inconsistencias en caliente, fallos de render,
   desfases de balance y excepciones de estado en disco local (%APPDATA%/Ascension/logs).
   ============================================================ */

export const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  AUDIT: 'AUDIT',
};

// Almacén circular en memoria de los últimos 2000 eventos para telemetría 360
const TELEMETRY_BUFFER_LIMIT = 2000;
const inMemoryTelemetryBuffer = [];

export const logTelemetry = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    details,
  };

  inMemoryTelemetryBuffer.push(entry);
  if (inMemoryTelemetryBuffer.length > TELEMETRY_BUFFER_LIMIT) {
    inMemoryTelemetryBuffer.shift();
  }

  // 1. Salida en consola de desarrollo
  const logFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  logFn(`[Ascensión Telemetría][${level}] ${message}`, details);

  // 2. Persistencia en disco local a través de Electron IPC (%APPDATA%/Ascension/logs/error.log)
  if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.logError) {
    try {
      const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
      const formattedMessage = `[${level}] ${message} | ${detailsStr}`;
      window.electronAPI.logError(formattedMessage, details?.stack || '');
    } catch (_) {}
  }
};

/**
 * Obtiene el snapshot de telemetría en memoria junto a diagnósticos del sistema.
 */
export const getSnapshotTelemetry = (gameState = null) => {
  const effectiveState = (gameState && gameState.gameStarted) 
    ? gameState 
    : (typeof window !== 'undefined' && window.lastActiveGameState && window.lastActiveGameState.gameStarted)
      ? window.lastActiveGameState
      : gameState;

  return {
    collectedAt: new Date().toISOString(),
    eventCount: inMemoryTelemetryBuffer.length,
    recentEvents: [...inMemoryTelemetryBuffer],
    systemInfo: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
      memory: typeof performance !== 'undefined' && performance.memory ? {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
      } : null,
      platform: typeof window !== 'undefined' && window.electronAPI?.platform ? window.electronAPI.platform : 'Unknown'
    },
    gameStateSummary: effectiveState ? {
      gameStarted: !!effectiveState.gameStarted,
      gameTick: effectiveState.gameTick || 0,
      playerName: effectiveState.playerName || 'Anónimo',
      planetCount: effectiveState.planets?.length || 0,
      currentPlanetId: effectiveState.currentPlanetId || null,
      notificationsCount: effectiveState.notifications?.length || 0,
      activeMissionCount: effectiveState.fleetMissions?.length || 0,
      buildQueueCount: effectiveState.buildQueue?.length || 0,
      shipQueueCount: effectiveState.shipQueue?.length || 0,
      researchQueueCount: effectiveState.researchQueue?.length || 0,
      defenseQueueCount: effectiveState.defenseQueue?.length || 0
    } : null
  };
};

/**
 * Monitor de consistencia de estado del juego.
 * Detecta valores NaN, producciones negativas anómalas o inconsistencias de recursos.
 */
export const auditGameState = (state, production) => {
  if (!state || !state.planets) return;

  for (const p of state.planets) {
    // Audit NaN / Null in resources
    if (isNaN(p.resources?.metal) || isNaN(p.resources?.crystal) || isNaN(p.resources?.deuterium)) {
      logTelemetry(LOG_LEVELS.ERROR, 'Recursos corruptos (NaN) detectados en planeta', {
        planetId: p.id,
        planetName: p.name,
        resources: p.resources,
      });
    }

    // Audit production anomalies
    if (production) {
      if (isNaN(production.metal) || isNaN(production.crystal) || isNaN(production.deuterium)) {
        logTelemetry(LOG_LEVELS.ERROR, 'Cálculo de producción devolvió NaN', {
          planetId: p.id,
          production,
        });
      }
    }
  }
};
