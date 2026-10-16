/**
 * galacticBankCore.js — Núcleo Lógico de la Banca Galáctica de Ascensión
 * Inspirado en la Banca del X-Wars clásico.
 * 
 * Principios:
 * 1. Independencia global del imperio (recursos en custodia no pertenecen a ningún planeta).
 * 2. Disponibilidad 24/7 para depositar y retirar.
 * 3. Capacidad bancaria explícita por recurso y total.
 * 4. Liquidación periódica diaria basada en timestamps reales (a prueba de reinicios/offline).
 * 5. Soporte para interés diario positivo, cero y negativo (coste de custodia).
 * 6. Historial auditable de operaciones reales.
 */

import { uid } from './formulas.js';

export const BANK_RESOURCES = ['metal', 'crystal', 'deuterium', 'credits'];

export const RESOURCE_INFO = {
  metal: { name: 'Metal', icon: '⛏️', unit: 'u.', color: 'text-orange-400' },
  crystal: { name: 'Cristal', icon: '💎', unit: 'u.', color: 'text-cyan-400' },
  deuterium: { name: 'Deuterio', icon: '🧪', unit: 'u.', color: 'text-emerald-400' },
  credits: { name: 'Créditos Estelares', icon: '₵', unit: '₵', color: 'text-amber-400' },
};

// 24 horas en milisegundos para liquidación diaria estándar
export const BANK_CYCLE_MS = 24 * 60 * 60 * 1000;

// Capacidad base por recurso para un imperio inicial
export const BASE_BANK_CAPACITY = {
  metal: 5000000,
  crystal: 2500000,
  deuterium: 1000000,
  credits: 10000000,
};

// Factores de escalado por nivel de Banca Galáctica Central (edificio exchangeBank o banca planetaria)
export const CAPACITY_PER_BANK_LEVEL = {
  metal: 10000000,
  crystal: 5000000,
  deuterium: 2500000,
  credits: 20000000,
};

// Tasas de interés diario por defecto (positivas o coste de custodia según configuración)
export const DEFAULT_BANK_RATES = {
  metal: 0.01,     // +1.00%
  crystal: 0.01,   // +1.00%
  deuterium: 0.005, // +0.50%
  credits: 0.015,  // +1.50%
};

/**
 * Inicializa o normaliza el estado de la Banca Galáctica
 */
export function initGalacticBankState(existingState = null) {
  const now = Date.now();
  const balances = {
    metal: 0,
    crystal: 0,
    deuterium: 0,
    credits: 0,
    ...(existingState?.balances || {})
  };

  // Asegurar que no hay NaNs ni negativos iniciales
  for (const r of BANK_RESOURCES) {
    balances[r] = Math.max(0, Math.floor(Number(balances[r]) || 0));
  }

  const interestRates = {
    ...DEFAULT_BANK_RATES,
    ...(existingState?.interestRates || {})
  };

  const lastLiquidation = existingState?.lastLiquidation || now;
  const nextLiquidation = existingState?.nextLiquidation || (lastLiquidation + BANK_CYCLE_MS);

  return {
    version: 1,
    balances,
    interestRates,
    lastLiquidation,
    nextLiquidation,
    history: Array.isArray(existingState?.history) ? existingState.history.slice(0, 100) : [],
    stats: {
      totalDeposited: { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingState?.stats?.totalDeposited || {}) },
      totalWithdrawn: { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingState?.stats?.totalWithdrawn || {}) },
      totalInterestEarned: { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingState?.stats?.totalInterestEarned || {}) },
      totalInterestPaid: { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingState?.stats?.totalInterestPaid || {}) },
    }
  };
}

// Capacidad base y escalado de la Banca Planetaria local
export const BASE_PLANETARY_BANK_CAPACITY = {
  metal: 1000000,
  crystal: 500000,
  deuterium: 250000,
  credits: 2000000,
};

export const CAPACITY_PER_PLANETARY_BANK_LEVEL = {
  metal: 1000000,
  crystal: 500000,
  deuterium: 250000,
  credits: 2000000,
};

// Capacidad federal transferible a Banca Galáctica Central por nivel de exchangeBank (Nv 1: 20.000)
export const CAPACITY_PER_GALACTIC_BANK_LEVEL = {
  metal: 20000,
  crystal: 20000,
  deuterium: 20000,
  credits: 50000,
};

/**
 * Obtiene el estado seguro de la Banca Planetaria de un planeta
 */
export function getPlanetaryBankState(planet) {
  const existing = planet?.bank || {};
  const balances = {
    metal: 0,
    crystal: 0,
    deuterium: 0,
    credits: 0,
    ...(existing.balances || {})
  };
  for (const r of BANK_RESOURCES) {
    balances[r] = Math.max(0, Math.floor(Number(balances[r]) || 0));
  }
  return {
    balances,
    history: Array.isArray(existing.history) ? existing.history.slice(0, 50) : [],
  };
}

/**
 * Calcula la capacidad máxima de la Banca Planetaria local de un planeta
 */
export function calcPlanetaryBankCapacity(planet, resource) {
  if (!BANK_RESOURCES.includes(resource)) return 0;
  const level = planet?.buildings?.financeMinistry || 0;
  if (level < 1) return 0;
  const base = BASE_PLANETARY_BANK_CAPACITY[resource] || 1000000;
  const perLevel = CAPACITY_PER_PLANETARY_BANK_LEVEL[resource] || 1000000;
  return base + ((level - 1) * perLevel);
}

/**
 * Calcula la capacidad bancaria de la Banca Galáctica Central imperial
 * Nivel 1 = 20.000 por recurso (según nivel acumulado o máximo de exchangeBank)
 */
export function calcBankCapacity(state, resource) {
  if (!BANK_RESOURCES.includes(resource)) return 0;
  
  // Buscar nivel de Banca Galáctica Central (exchangeBank) en todos los mundos
  let totalExchangeBankLevel = 0;
  if (Array.isArray(state?.planets)) {
    for (const p of state.planets) {
      const bLvl = p.buildings?.exchangeBank || 0;
      if (bLvl > totalExchangeBankLevel) totalExchangeBankLevel = bLvl;
    }
  }

  if (totalExchangeBankLevel < 1) return 0;

  const perLevel = CAPACITY_PER_GALACTIC_BANK_LEVEL[resource] || 20000;
  return totalExchangeBankLevel * perLevel;
}

/**
 * Valida si una operación de depósito es admisible
 * Acepta tanto validateDeposit(resource, amount, availableSource, currentInBank, capacity)
 * como validateDeposit({ bankState, resource, amount, availableSource, currentInBank, capacity })
 */
export function validateDeposit(arg1, arg2, arg3, arg4, arg5) {
  let resource, amount, availableSource, currentInBank, capacity;
  if (typeof arg1 === 'object' && arg1 !== null) {
    resource = arg1.resource;
    amount = arg1.amount;
    availableSource = arg1.availableSource;
    currentInBank = arg1.currentInBank ?? arg1.bankState?.balances?.[resource] ?? 0;
    capacity = arg1.capacity;
  } else {
    resource = arg1;
    amount = arg2;
    availableSource = arg3;
    currentInBank = arg4 ?? 0;
    capacity = arg5;
  }

  if (!BANK_RESOURCES.includes(resource)) {
    const msg = 'Recurso no admitido por la Banca Galáctica.';
    return { valid: false, reason: msg, error: msg };
  }
  const numAmount = Math.floor(Number(amount));
  if (!Number.isFinite(numAmount) || isNaN(numAmount) || numAmount <= 0) {
    const msg = 'La cantidad a depositar debe ser un número entero positivo mayor a cero.';
    return { valid: false, reason: msg, error: msg };
  }
  if (numAmount > (availableSource ?? 0)) {
    const msg = `Fondos insuficientes: dispones de ${(availableSource ?? 0).toLocaleString()} y solicitas depositar ${numAmount.toLocaleString()}.`;
    return { valid: false, reason: msg, error: msg };
  }
  if (typeof capacity === 'number' && (currentInBank + numAmount) > capacity) {
    const remaining = Math.max(0, capacity - currentInBank);
    const msg = `Capacidad bancaria excedida: espacio restante ${remaining.toLocaleString()} para ${resource}.`;
    return { valid: false, reason: msg, error: msg };
  }

  return { valid: true, amount: numAmount };
}

/**
 * Valida si una operación de retirada es admisible
 * Acepta tanto validateWithdraw(resource, amount, currentInBank)
 * como validateWithdraw({ bankState, resource, amount })
 */
export function validateWithdraw(arg1, arg2, arg3) {
  let resource, amount, currentInBank;
  if (typeof arg1 === 'object' && arg1 !== null) {
    resource = arg1.resource;
    amount = arg1.amount;
    currentInBank = arg1.currentInBank ?? arg1.bankState?.balances?.[resource] ?? 0;
  } else {
    resource = arg1;
    amount = arg2;
    currentInBank = arg3 ?? 0;
  }

  if (!BANK_RESOURCES.includes(resource)) {
    const msg = 'Recurso no admitido por la Banca Galáctica.';
    return { valid: false, reason: msg, error: msg };
  }
  const numAmount = Math.floor(Number(amount));
  if (!Number.isFinite(numAmount) || isNaN(numAmount) || numAmount <= 0) {
    const msg = 'La cantidad a retirar debe ser un número entero positivo mayor a cero.';
    return { valid: false, reason: msg, error: msg };
  }
  if (numAmount > currentInBank) {
    const msg = `Saldo bancario insuficiente: tienes ${currentInBank.toLocaleString()} en cuenta y solicitas retirar ${numAmount.toLocaleString()}.`;
    return { valid: false, reason: msg, error: msg };
  }

  return { valid: true, amount: numAmount };
}

/**
 * Procesa liquidaciones diarias pendientes (Catch-up temporal)
 * Resistente a reinicios, cierres y tiempo transcurrido offline.
 * No genera intereses múltiples si no ha transcurrido un ciclo completo.
 */
export function processBankLiquidation(bankState, now = Date.now()) {
  const state = initGalacticBankState(bankState);
  let { lastLiquidation, balances, interestRates, history, stats } = state;

  if (now < lastLiquidation + BANK_CYCLE_MS) {
    return {
      bankState: state,
      liquidationsProcessed: 0,
      settlements: []
    };
  }

  // Cuántos ciclos diarios enteros han pasado
  const cyclesPassed = Math.floor((now - lastLiquidation) / BANK_CYCLE_MS);
  if (cyclesPassed <= 0) {
    return { bankState: state, liquidationsProcessed: 0, settlements: [] };
  }

  const settlements = [];
  const newBalances = { ...balances };
  const newHistory = [...history];
  const newStats = {
    totalDeposited: { ...stats.totalDeposited },
    totalWithdrawn: { ...stats.totalWithdrawn },
    totalInterestEarned: { ...stats.totalInterestEarned },
    totalInterestPaid: { ...stats.totalInterestPaid },
  };

  for (let c = 0; c < cyclesPassed; c++) {
    const cycleTimestamp = lastLiquidation + ((c + 1) * BANK_CYCLE_MS);
    const cycleReport = { cycle: c + 1, timestamp: cycleTimestamp, deltas: {} };

    for (const res of BANK_RESOURCES) {
      const currentVal = newBalances[res] || 0;
      if (currentVal <= 0) continue;

      const rate = interestRates[res] ?? DEFAULT_BANK_RATES[res] ?? 0;
      const interestDelta = Math.floor(currentVal * rate);

      if (interestDelta > 0) {
        newBalances[res] += interestDelta;
        newStats.totalInterestEarned[res] = (newStats.totalInterestEarned[res] || 0) + interestDelta;
        newHistory.unshift({
          id: uid(),
          type: 'LIQUIDATION_INTEREST',
          resource: res,
          amount: interestDelta,
          resultingBalance: newBalances[res],
          rate,
          timestamp: cycleTimestamp,
          desc: `Liquidación diaria de intereses (+${(rate * 100).toFixed(2)}%)`
        });
      } else if (interestDelta < 0) {
        // Interés negativo o coste de custodia
        const actualDeduction = Math.min(currentVal, Math.abs(interestDelta));
        newBalances[res] = Math.max(0, currentVal - actualDeduction);
        newStats.totalInterestPaid[res] = (newStats.totalInterestPaid[res] || 0) + actualDeduction;
        newHistory.unshift({
          id: uid(),
          type: 'LIQUIDATION_CUSTODY_FEE',
          resource: res,
          amount: -actualDeduction,
          resultingBalance: newBalances[res],
          rate,
          timestamp: cycleTimestamp,
          desc: `Coste diario de custodia y mantenimiento (${(rate * 100).toFixed(2)}%)`
        });
      }

      cycleReport.deltas[res] = interestDelta;
    }

    settlements.push(cycleReport);
  }

  const updatedLastLiquidation = lastLiquidation + (cyclesPassed * BANK_CYCLE_MS);
  const updatedNextLiquidation = updatedLastLiquidation + BANK_CYCLE_MS;

  // Cálculo acumulado de totalYield por recurso para auditoría y tests
  const totalYield = { metal: 0, crystal: 0, deuterium: 0, credits: 0 };
  for (const s of settlements) {
    for (const r of BANK_RESOURCES) {
      totalYield[r] += (s.deltas[r] || 0);
    }
  }

  return {
    bankState: {
      ...state,
      balances: newBalances,
      lastLiquidation: updatedLastLiquidation,
      nextLiquidation: updatedNextLiquidation,
      history: newHistory.slice(0, 100),
      stats: newStats
    },
    liquidationsProcessed: cyclesPassed,
    liquidationsCount: cyclesPassed,
    totalYield,
    settlements
  };
}

/**
 * Formatea una cuenta atrás hacia un timestamp objetivo
 */
export function formatCountdown(targetTimestamp, now = Date.now()) {
  const diff = targetTimestamp - now;
  if (diff <= 0) return '00:00:00 (Listo)';
  const totalSecs = Math.floor(diff / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
