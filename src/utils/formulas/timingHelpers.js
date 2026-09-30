/**
 * timingHelpers.js — Utilidades centralizadas para cálculo de tiempo restante y duración total de colas.
 */

export const calcRemainingSeconds = (endTime, now = Date.now()) => {
  if (!endTime) return 0;
  return Math.max(0, Math.round((endTime - now) / 1000));
};

export const calcTotalSeconds = (startTime, endTime) => {
  if (!endTime) return 1;
  const start = startTime || endTime;
  return Math.max(1, Math.round((endTime - start) / 1000));
};
