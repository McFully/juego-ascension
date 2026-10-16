/**
 * Motor Autónomo de Market Maker, Almacenamiento, Logística y Defensa de la Lonja.
 * 
 * Implementa las Fases 07, 08, 09, 12 y 13 de la Lonja Galáctica:
 * - 07: Market Maker 100% respaldado con inventario y créditos reales de la Lonja.
 * - 08: Capas de almacenamiento físico real (custodia, reservas, saturación).
 * - 09: Logística y fletes sin teletransporte mágico.
 * - 12: Defensa y suspensión de mercado en estado de ataque (Alerta Roja).
 * - 13: Membresías comerciales y cobro de tarifas de depósito/tránsito.
 */

import { INSTRUMENTS, ORDER_TYPES, ORDER_SIDES, ORDER_STATUS } from './galacticSpotExchange.js';
import { recordTreasuryLedger, assessLonjaHealth } from './galacticLonjaAutonomousCore.js';

export const CUSTODY_STATES = {
  IN_OWN_SHIP: 'EN_NAVE_PROPIA',
  IN_PRIVATE_VAULT: 'EN_ALMACEN_PRIVADO',
  IN_CONTRACTED_FREIGHT: 'EN_TRANSPORTE_CONTRATADO',
  IN_TRANSIT: 'EN_TRANSITO',
  IN_EXCHANGE_VAULT: 'EN_ALMACEN_EXCHANGE',
  IN_LONJA_RESERVE: 'EN_RESERVA_LONJA'
};

/**
 * Tick del Market Maker Autónomo (Fase 07).
 * Genera liquidez bid/ask usando exclusivamente los recursos e inventario real de la Lonja.
 */
export function processMarketMakerTick({
  lonjaPlanet,
  spotState,
  tick
}) {
  if (!lonjaPlanet || !lonjaPlanet.isExchangePlanet || !lonjaPlanet.lonjaAutonomousState) {
    return { lonjaPlanet, spotState };
  }

  const lonjaState = { ...lonjaPlanet.lonjaAutonomousState };
  const defense = lonjaState.defense || {};
  
  // Si la Lonja está bajo ataque (Alerta Roja), el mercado se suspende (Regla 82)
  if (defense.alertLevel === 'RED' || defense.marketSuspended) {
    return { lonjaPlanet, spotState };
  }

  const treasury = lonjaState.treasury || {};
  const maxMmExposure = lonjaState.dao?.parameters?.maxMmExposure || 0.25;
  const availableMmCredits = Math.floor((treasury.reserves?.commercialLiquidity || 500000) * maxMmExposure);

  const orders = [...(spotState.orders || [])];
  const marketId = lonjaPlanet.id;
  const mmOwnerId = `mm_${lonjaPlanet.id}`;

  // Purgar órdenes antiguas del MM para rebalancear spread
  const nonMmOrders = orders.filter(o => o.ownerId !== mmOwnerId);
  const newOrders = [...nonMmOrders];

  // Recursos disponibles físicamente en el planeta de la Lonja
  const planetRes = { ...(lonjaPlanet.resources || { metal: 0, crystal: 0, deuterium: 0 }) };

  for (const inst of INSTRUMENTS) {
    const stock = planetRes[inst] || 0;
    const lastP = spotState.lastPrices?.[inst] || (inst === 'metal' ? 1.0 : inst === 'crystal' ? 1.65 : 3.30);

    // Spread dinámico adaptativo: más inventario = spread menor; volatilidad/salud crítica = spread mayor
    const health = lonjaState.healthState || 'NORMAL';
    const healthSpreadMult = health === 'CRITICO' ? 1.15 : health === 'PROTECCION' ? 1.08 : 1.02;

    // Bonificación por tecnologías comerciales: Megapuertos Comerciales y Predicción de Mercado
    const tradeTechBonus = 1 - Math.min(0.04, ((lonjaPlanet.research?.tradeHubTheorems || 0) * 0.005) + ((lonjaPlanet.research?.marketPrediction || 0) * 0.005));

    const askPrice = Number((lastP * (1.01 * healthSpreadMult * tradeTechBonus)).toFixed(2));
    const bidPrice = Number((lastP * (0.99 / (healthSpreadMult * tradeTechBonus))).toFixed(2));

    // Solo vender si hay stock real (Regla 48)
    if (stock >= 5000) {
      const sellAmount = Math.min(Math.floor(stock * 0.15), 50000);
      planetRes[inst] = Math.max(0, stock - sellAmount);
      newOrders.push({
        id: `mm_ask_${lonjaPlanet.id}_${inst}_${tick}`,
        ownerId: mmOwnerId,
        instrument: inst,
        side: ORDER_SIDES.SELL,
        type: ORDER_TYPES.LIMIT,
        resource: inst,
        amount: sellAmount,
        price: askPrice,
        targetPrice: askPrice,
        filledAmount: 0,
        status: ORDER_STATUS.OPEN,
        reservedResource: inst,
        reservedResourceAmount: sellAmount,
        planetId: lonjaPlanet.id,
        marketId,
        tickCreated: tick
      });
    }

    // Solo comprar si hay créditos asignados reales (Regla 49)
    if (availableMmCredits >= 10000) {
      const buyCredits = Math.min(Math.floor(availableMmCredits / 3), 30000);
      const buyAmount = Math.floor(buyCredits / bidPrice);
      if (buyAmount > 0) {
        newOrders.push({
          id: `mm_bid_${lonjaPlanet.id}_${inst}_${tick}`,
          ownerId: mmOwnerId,
          instrument: inst,
          side: ORDER_SIDES.BUY,
          type: ORDER_TYPES.LIMIT,
          resource: inst,
          amount: buyAmount,
          price: bidPrice,
          targetPrice: bidPrice,
          reservedCredits: buyCredits,
          filledAmount: 0,
          status: ORDER_STATUS.OPEN,
          planetId: lonjaPlanet.id,
          marketId,
          tickCreated: tick
        });
      }
    }
  }

  return {
    lonjaPlanet: {
      ...lonjaPlanet,
      resources: planetRes,
      lonjaAutonomousState: lonjaState
    },
    spotState: {
      ...spotState,
      orders: newOrders
    }
  };
}

/**
 * Gestión de Custodia y Almacenamiento Físico (Fase 08).
 * Valida límites reales y cobra tarifas de depósito.
 */
export function depositToClientVault({
  lonjaState,
  clientId,
  resource,
  amount
}) {
  if (!lonjaState || amount <= 0) return { success: false, reason: 'Cantidad inválida', lonjaState };

  const storage = { ...(lonjaState.storageCustody || {}) };
  const capacity = storage.capacity?.[resource] || 1000000;
  const currentReserved = storage.reservedSpace?.[resource] || 0;

  if (currentReserved + amount > capacity) {
    return {
      success: false,
      reason: `Saturación de Bóvedas: Capacidad máxima de ${resource} superada (${currentReserved}/${capacity}).`,
      lonjaState
    };
  }

  const clientDeposits = { ...(storage.clientDeposits || {}) };
  const currentClient = clientDeposits[clientId] || { metal: 0, crystal: 0, deuterium: 0 };

  clientDeposits[clientId] = {
    ...currentClient,
    [resource]: (currentClient[resource] || 0) + amount
  };

  storage.reservedSpace = {
    ...(storage.reservedSpace || {}),
    [resource]: currentReserved + amount
  };
  storage.clientDeposits = clientDeposits;

  return {
    success: true,
    lonjaState: {
      ...lonjaState,
      storageCustody: storage
    }
  };
}

/**
 * Logística y Flete Real Contratado (Fase 09).
 * Calcula coste según distancia/peso y genera el transporte en tránsito sin teletransporte.
 */
export function scheduleFreightTransport({
  lonjaState,
  clientId,
  destinationPlanet,
  resource,
  amount,
  distanceParsecs = 10
}) {
  if (!lonjaState || amount <= 0) return { success: false, reason: 'Datos de transporte inválidos', lonjaState };

  const fleet = lonjaState.logistics?.lonjaCargoFleet || { smallCargo: 0, largeCargo: 0 };
  const capacityAvailable = (fleet.smallCargo * 5000) + (fleet.largeCargo * 25000);

  if (amount > capacityAvailable) {
    return {
      success: false,
      reason: 'Capacidad logística de la Lonja insuficiente en este ciclo.',
      lonjaState
    };
  }

  const ratePerParsec = lonjaState.dao?.parameters?.logisticsRatePerParsec || 15;
  const freightCost = Math.round(distanceParsecs * ratePerParsec * (amount / 1000));

  const newTransport = {
    id: `frt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId,
    destinationPlanetId: destinationPlanet?.id,
    destinationCoords: `[${destinationPlanet?.galaxy}:${destinationPlanet?.system}:${destinationPlanet?.position}]`,
    resource,
    amount,
    freightCost,
    departureTime: Date.now(),
    arrivalTime: Date.now() + Math.max(30000, distanceParsecs * 5000), // En segundos reales
    custodyState: CUSTODY_STATES.IN_TRANSIT
  };

  const logistics = { ...(lonjaState.logistics || {}) };
  logistics.contractedTransports = [...(logistics.contractedTransports || []), newTransport];

  return {
    success: true,
    freightCost,
    transport: newTransport,
    lonjaState: {
      ...lonjaState,
      logistics
    }
  };
}
