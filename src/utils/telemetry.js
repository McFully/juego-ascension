/* ============================================================
   TELEMETRÍA Y AUDITORÍA INTERNA DE SALUD (telemetry.js)
   Registra inconsistencias en caliente, fallos de render,
   desfases de balance y excepciones de estado en disco local (%APPDATA%/Ascension/logs).
   ============================================================ */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  AUDIT: 'AUDIT',
};

export const logTelemetry = (level, message, details = {}) => {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    details,
  };

  // 1. Salida en consola de desarrollo
  const logFn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  logFn(`[Ascensión Telemetría][${level}] ${message}`, details);

  // 2. Persistencia en disco local a través de Electron IPC (%APPDATA%/Ascension/logs/error.log)
  if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.logError) {
    const formattedMessage = `[${level}] ${message} | ${JSON.stringify(details)}`;
    window.electronAPI.logError(formattedMessage, details.stack || '');
  }
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
