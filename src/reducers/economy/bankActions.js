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

// === OPERACIONES DE BANCA PLANETARIA LOCAL ===

export const handlePlanetaryBankDeposit = (state, action) => {
  const payload = action.payload || action;
  const { resource, amount, planetId } = payload;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId);
  if (pIdx < 0) return state;

  const currentPlanet = planets[pIdx];
  const bankLvl = currentPlanet.buildings?.financeMinistry || 0;
  if (bankLvl < 1) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: '🚫 Requiere Banca Planetaria nivel 1 para operar depósitos locales.',
        timestamp: Date.now()
      }]
    };
  }

  if (!BANK_RESOURCES.includes(resource)) return state;

  const numAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (numAmount <= 0) return state;

  const planetRes = currentPlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const available = resource === 'credits' ? (state.credits || 0) : (planetRes[resource] || 0);

  if (available < numAmount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Fondos insuficientes en ${currentPlanet.name}: ${fmt(available)} ${resource} disponibles.`,
        timestamp: Date.now()
      }]
    };
  }

  const existingBank = currentPlanet.bank || { balances: { metal: 0, crystal: 0, deuterium: 0, credits: 0 }, history: [] };
  const currentBalances = { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingBank.balances || {}) };
  const currentInBank = currentBalances[resource] || 0;
  const capacity = 1000000 * bankLvl;
  const availableSpace = Math.max(0, capacity - currentInBank);

  if (numAmount > availableSpace) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Capacidad de Banca Planetaria excedida en ${currentPlanet.name}: espacio restante ${fmt(availableSpace)}.`,
        timestamp: Date.now()
      }]
    };
  }

  // Descontar del planeta / créditos
  let newCredits = state.credits || 0;
  let newResources = { ...planetRes };
  if (resource === 'credits') {
    newCredits = Math.max(0, newCredits - numAmount);
  } else {
    newResources[resource] = Math.max(0, (planetRes[resource] || 0) - numAmount);
  }

  const newBalance = currentInBank + numAmount;
  const newBalances = { ...currentBalances, [resource]: newBalance };
  const newHistory = [
    {
      id: uid(),
      type: 'DEPOSIT',
      resource,
      amount: numAmount,
      resultingBalance: newBalance,
      timestamp: Date.now(),
      desc: `Depósito local en ${currentPlanet.name}: +${fmt(numAmount)} ${resource}`
    },
    ...(existingBank.history || [])
  ].slice(0, 50);

  planets[pIdx] = {
    ...currentPlanet,
    resources: newResources,
    bank: {
      balances: newBalances,
      history: newHistory
    }
  };

  return {
    ...state,
    credits: newCredits,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏦 Depósito confirmado en ${currentPlanet.name}: +${fmt(numAmount)} ${resource} a la Banca Planetaria.`,
      timestamp: Date.now()
    }]
  };
};

export const handlePlanetaryBankWithdraw = (state, action) => {
  const payload = action.payload || action;
  const { resource, amount, planetId } = payload;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId);
  if (pIdx < 0) return state;

  const currentPlanet = planets[pIdx];
  const existingBank = currentPlanet.bank || { balances: { metal: 0, crystal: 0, deuterium: 0, credits: 0 }, history: [] };
  const currentBalances = { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingBank.balances || {}) };
  const currentInBank = currentBalances[resource] || 0;

  const numAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (numAmount <= 0) return state;

  if (currentInBank < numAmount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Saldo insuficiente en la Banca Planetaria de ${currentPlanet.name}: ${fmt(currentInBank)} disponibles.`,
        timestamp: Date.now()
      }]
    };
  }

  const planetRes = currentPlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };
  let newCredits = state.credits || 0;
  let newResources = { ...planetRes };
  if (resource === 'credits') {
    newCredits += numAmount;
  } else {
    newResources[resource] = (planetRes[resource] || 0) + numAmount;
  }

  const newBalance = currentInBank - numAmount;
  const newBalances = { ...currentBalances, [resource]: newBalance };
  const newHistory = [
    {
      id: uid(),
      type: 'WITHDRAW',
      resource,
      amount: -numAmount,
      resultingBalance: newBalance,
      timestamp: Date.now(),
      desc: `Retirada local en ${currentPlanet.name}: -${fmt(numAmount)} ${resource}`
    },
    ...(existingBank.history || [])
  ].slice(0, 50);

  planets[pIdx] = {
    ...currentPlanet,
    resources: newResources,
    bank: {
      balances: newBalances,
      history: newHistory
    }
  };

  return {
    ...state,
    credits: newCredits,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `🏦 Retirada confirmada en ${currentPlanet.name}: ${fmt(numAmount)} ${resource} devueltos al almacén.`,
      timestamp: Date.now()
    }]
  };
};

export const handleTransferToGalacticBank = (state, action) => {
  const payload = action.payload || action;
  const { resource, amount, planetId } = payload;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId);
  if (pIdx < 0) return state;

  const currentPlanet = planets[pIdx];
  const exchangeBankLvl = currentPlanet.buildings?.exchangeBank || 0;
  if (exchangeBankLvl < 1) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Se requiere construir Banca Galáctica Central (nivel 1) en ${currentPlanet.name} para transferir fondos a nivel imperial.`,
        timestamp: Date.now()
      }]
    };
  }

  const existingLocalBank = currentPlanet.bank || { balances: { metal: 0, crystal: 0, deuterium: 0, credits: 0 }, history: [] };
  const localBalances = { metal: 0, crystal: 0, deuterium: 0, credits: 0, ...(existingLocalBank.balances || {}) };
  const currentInLocalBank = localBalances[resource] || 0;

  const numAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (numAmount <= 0) return state;

  if (currentInLocalBank < numAmount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Saldo insuficiente en la Banca Planetaria de ${currentPlanet.name} para transferir a la Banca Galáctica Central.`,
        timestamp: Date.now()
      }]
    };
  }

  const currentGalacticBank = initGalacticBankState(state.galacticBank);
  const galacticCapacity = calcBankCapacity(state, resource); // 20.000 por nivel de exchangeBank
  const galacticCurrent = currentGalacticBank.balances[resource] || 0;
  const galacticSpace = Math.max(0, galacticCapacity - galacticCurrent);

  if (numAmount > galacticSpace) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `🚫 Cupo de la Banca Galáctica Central excedido: límite disponible de ${fmt(galacticSpace)} ${resource} (Nv. ${exchangeBankLvl}).`,
        timestamp: Date.now()
      }]
    };
  }

  // Deducir de la banca planetaria
  const newLocalBalance = currentInLocalBank - numAmount;
  const newLocalBalances = { ...localBalances, [resource]: newLocalBalance };
  const newLocalHistory = [
    {
      id: uid(),
      type: 'TRANSFER_OUT',
      resource,
      amount: -numAmount,
      resultingBalance: newLocalBalance,
      timestamp: Date.now(),
      desc: `Transferido a Banca Galáctica Central: -${fmt(numAmount)} ${resource}`
    },
    ...(existingLocalBank.history || [])
  ].slice(0, 50);

  planets[pIdx] = {
    ...currentPlanet,
    bank: {
      balances: newLocalBalances,
      history: newLocalHistory
    }
  };

  // Acreditar a la banca galáctica central
  const newGalacticBalance = galacticCurrent + numAmount;
  const newGalacticBalances = {
    ...currentGalacticBank.balances,
    [resource]: newGalacticBalance
  };
  const newGalacticHistory = [
    {
      id: uid(),
      type: 'DEPOSIT',
      resource,
      amount: numAmount,
      resultingBalance: newGalacticBalance,
      planetId: currentPlanet.id,
      planetName: currentPlanet.name,
      timestamp: Date.now(),
      desc: `Transferencia recibida desde ${currentPlanet.name}: +${fmt(numAmount)} ${resource}`
    },
    ...currentGalacticBank.history
  ].slice(0, 100);

  return {
    ...state,
    planets,
    galacticBank: {
      ...currentGalacticBank,
      balances: newGalacticBalances,
      history: newGalacticHistory
    },
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: `💎 Transferencia exitosa: +${fmt(numAmount)} ${resource} transferidos a la Banca Galáctica Central.`,
      timestamp: Date.now()
    }]
  };
};
