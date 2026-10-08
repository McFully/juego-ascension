/**
 * bankActions.js — Acciones atómicas de la Banca Galáctica
 * 
 * Gestiona:
 * - BANK_DEPOSIT: Depósito real desde el planeta activo (o créditos del imperio) a la Banca Galáctica.
 * - BANK_WITHDRAW: Retirada real desde la Banca Galáctica al planeta activo (o créditos del imperio).
 * - BANK_SET_INTEREST_RATE: Configuración o ajuste paramétrico de la tasa de interés.
 * - BANK_PROCESS_LIQUIDATION: Forzado manual o programado del cierre de liquidación diaria.
 */

import { uid, fmt } from '../../core.jsx';
import {
  initGalacticBankState,
  validateDeposit,
  validateWithdraw,
  calcBankCapacity,
  processBankLiquidation,
  BANK_RESOURCES
} from '../../utils/galacticBankCore.js';

export const handleBankDeposit = (state, action) => {
  const payload = action.payload || action;
  const { resource, amount, planetId } = payload;
  const currentBank = initGalacticBankState(state.galacticBank);
  const targetPlanetId = planetId || state.currentPlanetId;

  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId);
  const currentPlanet = pIdx >= 0 ? planets[pIdx] : planets[0];

  if (!BANK_RESOURCES.includes(resource)) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: '🚫 Recurso no admitido por la Banca Galáctica.',
        timestamp: Date.now()
      }]
    };
  }

  // Comprobar saldo fuente disponible
  const availableSource = resource === 'credits'
    ? (state.credits || 0)
    : (currentPlanet?.resources?.[resource] || 0);

  const validation = validateDeposit({
    bankState: currentBank,
    resource,
    amount,
    availableSource
  });

  if (!validation.valid) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${validation.reason}`,
        timestamp: Date.now()
      }]
    };
  }

  const depositAmount = validation.amount;
  const capacity = calcBankCapacity(state, resource);
  const currentInBank = currentBank.balances[resource] || 0;
  const availableSpace = Math.max(0, capacity - currentInBank);

  if (depositAmount > availableSpace) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Capacidad bancaria insuficiente: espacio restante ${fmt(availableSpace)} para ${resource}.`,
        timestamp: Date.now()
      }]
    };
  }

  // Operación atómica de transferencia
  let newCredits = state.credits || 0;
  if (resource === 'credits') {
    newCredits = Math.max(0, newCredits - depositAmount);
  } else if (pIdx >= 0) {
    const planetRes = currentPlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };
    planets[pIdx] = {
      ...currentPlanet,
      resources: {
        ...planetRes,
        [resource]: Math.max(0, (planetRes[resource] || 0) - depositAmount)
      }
    };
  }

  const newBalance = currentInBank + depositAmount;
  const newBalances = {
    ...currentBank.balances,
    [resource]: newBalance
  };

  const newHistory = [
    {
      id: uid(),
      type: 'DEPOSIT',
      resource,
      amount: depositAmount,
      resultingBalance: newBalance,
      planetId: currentPlanet?.id,
      planetName: currentPlanet?.name || 'Imperio Central',
      timestamp: Date.now(),
      desc: `Depósito desde ${currentPlanet?.name || 'Imperio'}: +${fmt(depositAmount)} ${resource}`
    },
    ...currentBank.history
  ].slice(0, 100);

  const newStats = {
    ...currentBank.stats,
    totalDeposited: {
      ...currentBank.stats.totalDeposited,
      [resource]: (currentBank.stats.totalDeposited[resource] || 0) + depositAmount
    }
  };

  return {
    ...state,
    credits: newCredits,
    planets,
    galacticBank: {
      ...currentBank,
      balances: newBalances,
      history: newHistory,
      stats: newStats
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏦 Depósito confirmado: +${fmt(depositAmount)} ${resource} transferidos a la Banca Galáctica.`,
      timestamp: Date.now()
    }]
  };
};

export const handleBankWithdraw = (state, action) => {
  const payload = action.payload || action;
  const { resource, amount, planetId } = payload;
  const currentBank = initGalacticBankState(state.galacticBank);
  const targetPlanetId = planetId || state.currentPlanetId;

  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId);
  const currentPlanet = pIdx >= 0 ? planets[pIdx] : planets[0];

  const validation = validateWithdraw({
    bankState: currentBank,
    resource,
    amount
  });

  if (!validation.valid) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 ${validation.reason}`,
        timestamp: Date.now()
      }]
    };
  }

  const withdrawAmount = validation.amount;
  const currentInBank = currentBank.balances[resource] || 0;
  const newBalance = currentInBank - withdrawAmount;

  let newCredits = state.credits || 0;
  if (resource === 'credits') {
    newCredits += withdrawAmount;
  } else if (pIdx >= 0) {
    const planetRes = currentPlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };
    planets[pIdx] = {
      ...currentPlanet,
      resources: {
        ...planetRes,
        [resource]: (planetRes[resource] || 0) + withdrawAmount
      }
    };
  }

  const newBalances = {
    ...currentBank.balances,
    [resource]: newBalance
  };

  const newHistory = [
    {
      id: uid(),
      type: 'WITHDRAW',
      resource,
      amount: -withdrawAmount,
      resultingBalance: newBalance,
      planetId: currentPlanet?.id,
      planetName: currentPlanet?.name || 'Imperio Central',
      timestamp: Date.now(),
      desc: `Retirada hacia ${currentPlanet?.name || 'Imperio'}: -${fmt(withdrawAmount)} ${resource}`
    },
    ...currentBank.history
  ].slice(0, 100);

  const newStats = {
    ...currentBank.stats,
    totalWithdrawn: {
      ...currentBank.stats.totalWithdrawn,
      [resource]: (currentBank.stats.totalWithdrawn[resource] || 0) + withdrawAmount
    }
  };

  return {
    ...state,
    credits: newCredits,
    planets,
    galacticBank: {
      ...currentBank,
      balances: newBalances,
      history: newHistory,
      stats: newStats
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏦 Retirada confirmada: ${fmt(withdrawAmount)} ${resource} transferidos a ${currentPlanet?.name || 'tu reserva'}.`,
      timestamp: Date.now()
    }]
  };
};

export const handleBankSetRate = (state, action) => {
  const { resource, rate } = action;
  if (!BANK_RESOURCES.includes(resource)) return state;
  const numRate = Number(rate);
  if (!Number.isFinite(numRate) || isNaN(numRate)) return state;

  const currentBank = initGalacticBankState(state.galacticBank);
  return {
    ...state,
    galacticBank: {
      ...currentBank,
      interestRates: {
        ...currentBank.interestRates,
        [resource]: numRate
      }
    }
  };
};

export const handleBankProcessLiquidation = (state, action) => {
  const currentBank = initGalacticBankState(state.galacticBank);
  const timestamp = action?.now || Date.now();
  const { bankState, liquidationsProcessed, settlements } = processBankLiquidation(currentBank, timestamp);

  if (liquidationsProcessed <= 0) return state;

  const notifs = [...(state.notifications || [])];
  for (const s of settlements) {
    notifs.push({
      id: uid(),
      type: 'info',
      message: `💎 Liquidación Bancaria Diaria procesada (Ciclo ${s.cycle}). Intereses y costes aplicados a las cuentas de custodia.`,
      timestamp: s.timestamp
    });
  }

  return {
    ...state,
    galacticBank: bankState,
    notifications: notifs
  };
};
