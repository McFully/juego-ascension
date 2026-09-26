export const ensureMinistries = (state) => {
  let newState = { ...state };
  if (!newState.ministries) {
    newState.ministries = {
      economy: { taxRate: 0.1, tradeSubsidies: false, treasury: 1000, gdp: 0, automationEnabled: false },
      defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false },
      science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false },
      culture: { propagandaLevel: 1, socialUnity: 80, eventsActive: [], automationEnabled: false },
      infra: { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false },
      intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false }
    };
  }
  if (!newState.ministries.economy) newState.ministries.economy = { taxRate: 0.1, treasury: 1000, gdp: 0, automationEnabled: false };
  if (!newState.ministries.defense) newState.ministries.defense = { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false };
  if (!newState.ministries.science) newState.ministries.science = { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false };
  if (!newState.ministries.culture) newState.ministries.culture = { propagandaLevel: 1, socialUnity: 80, eventsActive: [], automationEnabled: false };
  if (!newState.ministries.infra) newState.ministries.infra = { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false };
  if (!newState.ministries.intel) newState.ministries.intel = { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false };
  return newState;
};

export const processMinistriesTick = (state, newPlanets, prodCache) => {
  let newState = { ...state };
  const mins = newState.ministries || {};
  const taxRate = mins.economy?.taxRate || 0.1;
  
  // Economy: Tax collection based on metal production + civil businesses
  const totalMetalProd = newPlanets.reduce((acc, p) => {
    const pp = prodCache.get(p.id);
    return acc + ((pp ? pp.metal : 0) / 3600);
  }, 0);
  let businessTaxIncome = 0;
  newPlanets.forEach(p => {
    const b = p.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
    businessTaxIncome += (b.lowClass || 0) * 5 + (b.midClass || 0) * 15 + (b.highClass || 0) * 50;
  });
  const taxIncome = totalMetalProd * taxRate * 2.0 + businessTaxIncome;
  newState.ministries = {
    ...newState.ministries,
    economy: {
      ...newState.ministries.economy,
      treasury: (mins.economy.treasury || 0) + taxIncome,
      gdp: totalMetalProd * 3600,
    }
  };

  // Culture: Passive Reputation & Influence growth
  const unity = mins.culture?.socialUnity || 80;
  const propaganda = mins.culture?.propagandaLevel || 1;
  if (newState.gameTick % 60 === 0) {
    const hasAlliances = (newState.aiPlanets || []).some(ai => ai.alliance);
    const repGrowth = (unity > 70 ? 0.1 : 0) + (hasAlliances ? 0.2 : 0);
    newState.reputation = Math.min(100, (newState.reputation || 0) + repGrowth);
    
    // Influence growth
    const persuasion = (state.research?.persuasionSociology || 0) * 0.8;
    const stellarProp = (state.research?.stellarPropaganda || 0) * 0.6;
    const algoBurocracy = (state.research?.algorithmicBureaucracy || 0) * 0.5;
    const lawCode = (state.research?.galacticLawCode || 0) * 0.7;
    
    const govBonus = newPlanets.reduce((acc, pl) => {
      const b = pl.buildings || {};
      return acc + (b.sectorGovPalace || 0) * 0.2
                 + (b.financeMinistry || 0) * 0.15
                 + (b.permanentEmbassy || 0) * 0.25
                 + (b.councilChamber || 0) * 0.20
                 + (b.consulateHeadquarters || 0) * 0.18
                 + (b.colonySupremeCourt || 0) * 0.15;
    }, 0);
    
    const infGrowth = 1 + (propaganda * 0.5) + (unity > 90 ? 1 : 0) + persuasion + stellarProp + algoBurocracy + lawCode + govBonus;
    newState.influence = (newState.influence || 0) + infGrowth;
  }

  return newState;
};
