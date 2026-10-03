/**
 * timingHelpers.js — Utilidades centralizadas para cálculo de tiempo restante y duración total de colas.
 * Soporta tanto paso de objeto { endTime, startTime } como valores numéricos directos.
 */

export const calcRemainingSeconds = (itemOrEndTime, now = Date.now()) => {
  if (!itemOrEndTime) return 0;
  const end = typeof itemOrEndTime === 'object' ? itemOrEndTime.endTime : itemOrEndTime;
  if (!end || isNaN(end)) return 0;
  return Math.max(0, Math.round((end - now) / 1000));
};

export const calcTotalSeconds = (itemOrStartTime, endTimeOrNow) => {
  if (!itemOrStartTime) return 1;
  let start;
  let end;

  if (typeof itemOrStartTime === 'object') {
    start = itemOrStartTime.startTime || itemOrStartTime.endTime;
    end = itemOrStartTime.endTime || (typeof endTimeOrNow === 'number' ? endTimeOrNow : Date.now());
  } else {
    start = itemOrStartTime;
    end = endTimeOrNow || itemOrStartTime;
  }

  if (!end || isNaN(end)) return 1;
  if (!start || isNaN(start)) return 1;
  return Math.max(1, Math.round((end - start) / 1000));
};
