import { uid } from '../../core.jsx';

/**
 * financialBalanceTick — Motor de Balance Financiero, Masa Salarial y Velocidad Monetaria.
 * 
 * Conecta los créditos del jugador y la tesorería imperial:
 * 1. Deduce salarios de ministros asignados según su nivel y competencia.
 * 2. Deduce costes logísticos y de mantenimiento de naves en hangares y patrullas.
 * 3. Recauda IRPF colonial sobre el censo de técnicos y patricios.
 * 4. Calcula la Velocidad Monetaria del imperio (V = PIB / Circulante).
 * 5. Genera el desglose contable de ingresos y gastos para telemetría en HUD.
 */
export const processFinancialBalanceTick = (state, now) => {
  let newState = { ...state };
  const mins = newState.ministries || {};
  const currentCredits = newState.credits ?? 10000;

  // 1. Masa Salarial Ministerial (Nóminas de Ministros nombrados)
  let totalSalariesHourly = 0;
  const assignedMinisters = [];

  // Recorrer ministerios globales y planetarios
  Object.entries(mins).forEach(([mId, data]) => {
    if (data?.minister) {
      const lvl = data.minister.level || 1;
      const salary = 80 + (lvl * 40); // 120 - 280 Cr/h
      totalSalariesHourly += salary;
      assignedMinisters.push({ id: mId, minister: data.minister.name, salary });
    }
  });

  // 2. Mantenimiento de Flota (Nóminas y avituallamiento por tripulante)
  let totalFleetUpkeepHourly = 0;
  (newState.planets || []).forEach(p => {
    const ships = p.ships || {};
    Object.entries(ships).forEach(([sId, qty]) => {
      if (qty > 0) {
        // Base de 0.5 Cr/h por nave ligera, 2.0 por nave pesada
        const shipUpkeepRate = sId.includes('Cruiser') || sId.includes('Battle') || sId.includes('Destroyer') ? 2.5 : 0.5;
        totalFleetUpkeepHourly += qty * shipUpkeepRate;
      }
    });
  });

  // Mantenimiento de misiones activas
  (newState.fleetMissions || []).forEach(m => {
    const ships = m.fleet || {};
    Object.entries(ships).forEach(([sId, qty]) => {
      if (qty > 0) {
        totalFleetUpkeepHourly += qty * 1.0;
      }
    });
  });

  // 3. IRPF y Tasas sobre el Censo Colonial
  let totalPopulationTaxesHourly = 0;
  (newState.planets || []).forEach(p => {
    const pop = p.population || 1000;
    const demo = p.demographics || {};
    const techs = demo.technicians || Math.floor(pop * 0.35);
    // 0.015 Cr/h por técnico calificado
    totalPopulationTaxesHourly += techs * 0.015;
  });

  // 4. Rentas de Negocios Civiles
  let businessTaxHourly = 0;
  (newState.planets || []).forEach(p => {
    const b = p.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
    businessTaxHourly += (b.lowClass || 0) * 10 + (b.midClass || 0) * 35 + (b.highClass || 0) * 120;
  });

  // 5. Tasa de Extracción Minera (del impuesto planetario actual)
  const metalGdp = mins.economy?.gdp || 50000;
  const miningTaxHourly = (metalGdp * 0.05);

  // 6. Cánones de Alquiler de Embajadas Extranjeras en la Capital
  let foreignEmbassiesRentHourly = 0;
  (newState.foreignEmbassiesInCapital || []).forEach(emb => {
    foreignEmbassiesRentHourly += (emb.rentHourly || 150);
  });

  // Totales horarios
  const totalIncomeHourly = totalPopulationTaxesHourly + businessTaxHourly + miningTaxHourly + foreignEmbassiesRentHourly;
  const totalExpensesHourly = totalSalariesHourly + totalFleetUpkeepHourly;
  const netHourlyBalance = totalIncomeHourly - totalExpensesHourly;

  // Variación por tick (1 segundo)
  const netPerTick = netHourlyBalance / 3600;
  const nextCredits = Math.max(0, currentCredits + netPerTick);

  // Si las arcas se vacían por completo, penalización de moral y aviso de huelga
  const isBankrupt = nextCredits <= 0 && netHourlyBalance < 0;
  if (isBankrupt && (newState.gameTick % 120 === 0)) {
    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'warning',
      message: '⚠️ QUIEBRA FINANCIERA: Fondos insuficientes para nóminas de ministros y mantenimiento naval.',
      timestamp: now
    }];
  }

  // 6. Cálculo de Velocidad Monetaria: V = (PIB mensual + Volumen comercial) / Masa Monetaria
  const moneySupply = Math.max(1000, nextCredits);
  const economicOutput = (totalIncomeHourly * 24) + (mins.economy?.gdp || 10000);
  const rawVelocity = economicOutput / moneySupply;
  const monetaryVelocity = Math.max(0.2, Math.min(5.0, Number(rawVelocity.toFixed(2))));

  // Guardar balance financiero estructurado para HUD y reducers
  newState.credits = nextCredits;
  newState.financialBalance = {
    income: {
      total: totalIncomeHourly,
      populationTax: totalPopulationTaxesHourly,
      businessTax: businessTaxHourly,
      miningTax: miningTaxHourly
    },
    expenses: {
      total: totalExpensesHourly,
      ministerSalaries: totalSalariesHourly,
      fleetUpkeep: totalFleetUpkeepHourly
    },
    netHourly: netHourlyBalance,
    monetaryVelocity,
    isBankrupt
  };

  // Sincronizar tesorería del ministerio de economía con los créditos globales
  if (newState.ministries?.economy) {
    newState.ministries.economy.treasury = Math.round(nextCredits);
  }

  return newState;
};
