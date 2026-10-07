/**
 * Sistema Autónomo Integral de la Lonja Galáctica (Ascensión).
 * 
 * Implementa las reglas del documento maestro:
 * - Fundación e irrevocabilidad del 10% del fundador (FOUNDER_PROTECTED vs ORDINARY_SHARES).
 * - Dilución matemática no manipulable ante aportaciones elegibles a Megaproyectos.
 * - Gobernanza DAO (Directorio Comercial) ponderada por acciones con participación IA/Humano.
 * - Mercado Secundario de Acciones Ordinarias (Trading entre participantes).
 * - Tesorería autónoma con prelación de pagos y prevención de quiebra (4 estados: NORMAL, PRECAUCIÓN, PROTECCIÓN, CRÍTICO).
 * - Almacenamiento y Custodia Física real en capas con tarifas de depósito.
 * - Logística y Fletes Reales sin teletransporte.
 * - Bastión de Seguridad y defensa neutral con suspensión de mercado en alerta roja.
 * - Cero generación artificial de recursos o créditos (100% respaldo real).
 */

export const LONJA_HEALTH_STATES = {
  NORMAL: 'NORMAL',
  PRECAUTION: 'PRECAUCION',
  PROTECTION: 'PROTECCION',
  CRITICAL: 'CRITICO'
};

export const SHARE_CLASSES = {
  FOUNDER_PROTECTED: 'FOUNDER_PROTECTED', // 10% intocable, inalienable, no diluible
  ORDINARY_SHARES: 'ORDINARY_SHARES'      // 90% diluible, comerciable, votante
};

export const FOUNDER_PROTECTED_PERCENT = 10; // 10% fijo

/**
 * Inicializa el estado integral de la Lonja Galáctica cuando se despliega el Arca Mercantil.
 */
export function initGalacticLonjaState(founderId = 'player', customName = 'Lonja Galáctica Central') {
  return {
    isAutonomousEntity: true,
    name: customName,
    founderId,
    healthState: LONJA_HEALTH_STATES.NORMAL,
    
    // Capitalización y Acciones
    capitalization: {
      totalOrdinaryShares: 1000,
      founderProtectedPercent: 10,
      shareholders: {
        [founderId]: {
          protectedSharesPercent: 10, // 10% absoluto garantizado
          ordinaryShares: 100         // Participación ordinaria inicial
        },
        'dao_reserve': {
          protectedSharesPercent: 0,
          ordinaryShares: 900
        }
      },
      shareOrderBook: {
        bids: [
          { id: 'sh_bid_init_1', buyerId: 'ai_syndicate_alpha', shares: 50, price: 24500, createdAt: Date.now() },
          { id: 'sh_bid_init_2', buyerId: 'ai_consortium_beta', shares: 100, price: 23800, createdAt: Date.now() }
        ],
        asks: [
          { id: 'sh_ask_init_1', sellerId: 'dao_reserve', shares: 50, price: 25500, createdAt: Date.now() },
          { id: 'sh_ask_init_2', sellerId: 'dao_reserve', shares: 100, price: 26200, createdAt: Date.now() }
        ]
      },
      lastSharePrice: 25000 // Valor base de referencia por acción
    },

    // Tesorería Autónoma y Contabilidad Trazable
    treasury: {
      credits: 2500000, // Capital operativo inicial propio
      reserves: {
        operational: 1000000, // Mantenimiento y sueldos
        strategic: 1000000,   // Emergencias y defensa
        commercialLiquidity: 500000 // Fondo para Market Maker
      },
      distributableProfits: 0,
      dividendDistributionRate: 0.30, // 30% del beneficio real por defecto (aprobado por DAO)
      ledger: [] // Historial de movimientos: { id, origin, destination, concept, amount, timestamp, status }
    },

    // DAO y Gobernanza (Directorio Comercial)
    dao: {
      activeProposals: [
        {
          id: 'prop_distrib_rate',
          title: 'Ajuste de Tasa de Reparto de Dividendos',
          description: 'Establecer el porcentaje de reparto de beneficios netos trimestrales al 35%.',
          proposerId: 'ai_syndicate_alpha',
          votesFor: 450,
          votesAgainst: 100,
          voters: { 'ai_syndicate_alpha': 'FOR' },
          createdAt: Date.now() - 86400000,
          expiresAt: Date.now() + (6 * 86400000), // 7 días en total
          status: 'VOTING',
          targetParameter: 'dividendDistributionRate',
          proposedValue: 0.35
        },
        {
          id: 'prop_mm_spread',
          title: 'Expansión de Liquidez en Market Maker',
          description: 'Aumentar el límite de reserva asignada a liquidez comercial al 30% para reducir el spread.',
          proposerId: 'dao_reserve',
          votesFor: 520,
          votesAgainst: 80,
          voters: { 'dao_reserve': 'FOR' },
          createdAt: Date.now() - 172800000,
          expiresAt: Date.now() + (5 * 86400000),
          status: 'VOTING',
          targetParameter: 'maxMmExposure',
          proposedValue: 0.30
        }
      ],
      passedProposals: [],
      parameters: {
        registrationFee: 50000,
        periodicFee: 5000,
        tradeCommissionRate: 0.01, // 1%
        storageFeePerTick: 2,
        logisticsRatePerParsec: 15,
        maxMmExposure: 0.25 // Máximo 25% de la liquidez en MM
      }
    },

    // Membresías Comerciales
    memberships: {
      [founderId]: {
        type: 'FOUNDING_PARTNER',
        validUntil: Infinity,
        reducedFees: true,
        registeredAt: Date.now()
      }
    },

    // Almacenamiento y Custodia de Terceros
    storageCustody: {
      capacity: {
        metal: 5000000,
        crystal: 3000000,
        deuterium: 1500000
      },
      reservedSpace: {
        metal: 0,
        crystal: 0,
        deuterium: 0
      },
      clientDeposits: {
        // [playerId]: { metal, crystal, deuterium }
      }
    },

    // Flota de Flete Comercial y Tránsitos
    logistics: {
      contractedTransports: [],
      lonjaCargoFleet: {
        smallCargo: 20,
        largeCargo: 10
      }
    },

    // Defensa Autónoma
    defense: {
      alertLevel: 'GREEN', // 'GREEN' | 'YELLOW' | 'RED' (RED suspende spot)
      marketSuspended: false,
      patrolHangarActive: true,
      autoRepairQueue: []
    }
  };
}

/**
 * Fórmula Matemática de Dilución y Emisión de Nuevas Acciones (Regla 6 y 7).
 */
export function calculateCapitalContribution({
  currentCapitalization,
  contributorId,
  contributionValue,
  valuationReference = 25000000
}) {
  if (!currentCapitalization || contributionValue <= 0) return currentCapitalization;

  const currentOrdinaryTotal = currentCapitalization.totalOrdinaryShares || 1000;
  const currentShareholders = { ...(currentCapitalization.shareholders || {}) };

  const postMoneyValuation = valuationReference + contributionValue;
  const contributionFraction = contributionValue / postMoneyValuation;

  const safeFraction = Math.min(0.85, Math.max(0.001, contributionFraction));
  const newSharesToEmit = Math.max(1, Math.round(currentOrdinaryTotal * (safeFraction / (1 - safeFraction))));

  const newTotalOrdinaryShares = currentOrdinaryTotal + newSharesToEmit;

  const existingContributor = currentShareholders[contributorId] || { protectedSharesPercent: 0, ordinaryShares: 0 };
  currentShareholders[contributorId] = {
    ...existingContributor,
    ordinaryShares: (existingContributor.ordinaryShares || 0) + newSharesToEmit
  };

  return {
    ...currentCapitalization,
    totalOrdinaryShares: newTotalOrdinaryShares,
    shareholders: currentShareholders,
    lastSharePrice: Math.round(postMoneyValuation / newTotalOrdinaryShares)
  };
}

/**
 * Votación DAO ponderada por acciones ordinarias (Reglas 9, 10, 11, 12, 13 y 14).
 */
export function castDaoVote({
  lonjaState,
  proposalId,
  voterId,
  voteChoice // 'FOR' | 'AGAINST'
}) {
  if (!lonjaState || !lonjaState.dao) return lonjaState;

  const activeProps = [...(lonjaState.dao.activeProposals || [])];
  const propIdx = activeProps.findIndex(p => p.id === proposalId);
  if (propIdx === -1) return lonjaState;

  const prop = { ...activeProps[propIdx] };
  if (prop.status !== 'VOTING' || Date.now() > prop.expiresAt) return lonjaState;

  const voterShares = lonjaState.capitalization?.shareholders?.[voterId]?.ordinaryShares || 0;
  if (voterShares <= 0) return lonjaState;

  const prevVote = prop.voters?.[voterId];
  if (prevVote === voteChoice) return lonjaState;

  let newVotesFor = prop.votesFor || 0;
  let newVotesAgainst = prop.votesAgainst || 0;

  if (prevVote === 'FOR') newVotesFor -= voterShares;
  if (prevVote === 'AGAINST') newVotesAgainst -= voterShares;

  if (voteChoice === 'FOR') newVotesFor += voterShares;
  if (voteChoice === 'AGAINST') newVotesAgainst += voterShares;

  prop.votesFor = Math.max(0, newVotesFor);
  prop.votesAgainst = Math.max(0, newVotesAgainst);
  prop.voters = { ...(prop.voters || {}), [voterId]: voteChoice };

  // Comprobar mayoría (>50% de las acciones totales en circulación)
  const totalShares = lonjaState.capitalization?.totalOrdinaryShares || 1000;
  let passedProps = [...(lonjaState.dao.passedProposals || [])];
  let parameters = { ...(lonjaState.dao.parameters || {}) };

  if (prop.votesFor > totalShares * 0.50) {
    prop.status = 'PASSED';
    prop.executedAt = Date.now();
    passedProps.push(prop);
    activeProps.splice(propIdx, 1);

    // Aplicar regla si modifica un parámetro económico permitido
    if (prop.targetParameter && prop.proposedValue !== undefined) {
      parameters[prop.targetParameter] = prop.proposedValue;
    }
  } else {
    activeProps[propIdx] = prop;
  }

  return {
    ...lonjaState,
    dao: {
      ...lonjaState.dao,
      activeProposals: activeProps,
      passedProposals: passedProps,
      parameters
    }
  };
}

/**
 * Mercado Secundario de Acciones Ordinarias (Regla 8 y 14).
 * Compra y venta de acciones con libro de órdenes.
 * El 10% protegido del fundador NUNCA puede venderse.
 */
export function placeShareOrder({
  lonjaState,
  traderId,
  side, // 'BUY' | 'SELL'
  shares,
  price,
  creditsAvailable = 0
}) {
  if (!lonjaState || shares <= 0 || price <= 0) {
    return { success: false, reason: 'Parámetros inválidos', lonjaState };
  }

  const capitalization = { ...lonjaState.capitalization };
  const shareholders = { ...(capitalization.shareholders || {}) };
  const traderHoldings = shareholders[traderId] || { protectedSharesPercent: 0, ordinaryShares: 0 };
  const orderBook = {
    bids: [...(capitalization.shareOrderBook?.bids || [])],
    asks: [...(capitalization.shareOrderBook?.asks || [])]
  };

  if (side === 'SELL') {
    // El 10% del fundador es inalienable
    if (traderHoldings.ordinaryShares < shares) {
      return { success: false, reason: 'Acciones ordinarias insuficientes para la venta. El 10% fundador está protegido.', lonjaState };
    }
    // Bloquear acciones en custodia
    shareholders[traderId] = {
      ...traderHoldings,
      ordinaryShares: traderHoldings.ordinaryShares - shares
    };
    orderBook.asks.push({
      id: `sh_ask_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sellerId: traderId,
      shares,
      price,
      createdAt: Date.now()
    });
  } else {
    const totalCost = shares * price;
    if (creditsAvailable < totalCost) {
      return { success: false, reason: 'Créditos insuficientes para comprar acciones.', lonjaState };
    }
    orderBook.bids.push({
      id: `sh_bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      buyerId: traderId,
      shares,
      price,
      createdAt: Date.now()
    });
  }

  return {
    success: true,
    lonjaState: {
      ...lonjaState,
      capitalization: {
        ...capitalization,
        shareholders,
        shareOrderBook: orderBook
      }
    }
  };
}

/**
 * Registro contable inmutable para la Tesorería de la Lonja.
 */
export function recordTreasuryLedger(treasury, { origin, destination, concept, amount, timestamp = Date.now() }) {
  const ledgerEntry = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    origin,
    destination,
    concept,
    amount,
    timestamp,
    status: 'SETTLED'
  };

  const newLedger = [ledgerEntry, ...(treasury.ledger || [])];
  if (newLedger.length > 200) newLedger.length = 200;

  return {
    ...treasury,
    ledger: newLedger
  };
}

/**
 * Evaluación de quiebra y estabilidad financiera (Reglas 20, 22 y 23).
 */
export function assessLonjaHealth(treasury) {
  const credits = treasury?.credits || 0;
  const strategicRes = treasury?.reserves?.strategic || 0;
  const totalLiquidity = credits + strategicRes;

  if (totalLiquidity < 100000) return LONJA_HEALTH_STATES.CRITICAL;
  if (totalLiquidity < 500000) return LONJA_HEALTH_STATES.PROTECTION;
  if (totalLiquidity < 1500000) return LONJA_HEALTH_STATES.PRECAUTION;
  return LONJA_HEALTH_STATES.NORMAL;
}
