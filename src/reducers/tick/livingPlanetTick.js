import { BIOME_THERMAL_PROFILES, MINISTERIAL_SUBTASKS } from '../../data/gameData.js';

/**
 * Procesa el tick de simulación física y ecológica del planeta vivo.
 * @param {Object} planet - Estado actual del planeta
 * @param {Object} state - Estado global del juego
 * @returns {Object} Planeta con biosfera, termodinámica y gobernanza actualizadas
 */
export const processLivingPlanetTick = (planet, state) => {
  const p = { ...planet };
  const biomeKey = p.biome || 'temperate';
  const thermalProfile = BIOME_THERMAL_PROFILES[biomeKey] || BIOME_THERMAL_PROFILES.temperate;

  // 1. Clonación e inicialización profunda de estructuras para inmutabilidad estricta
  p.biosphere = p.biosphere ? { ...p.biosphere } : {
    pressureAtm: biomeKey === 'barren' ? 0.05 : 1.0,
    o2Level: biomeKey === 'barren' || biomeKey === 'toxic' ? 0.02 : 0.21,
    waterReserveDays: 120,
    caloricSupplyRatio: 1.0,
    radiationShieldActive: true,
    pollutionLevel: 5.0,
  };

  p.thermalGrid = p.thermalGrid ? { ...p.thermalGrid } : {
    heatGeneratedMW: 1200,
    heatDissipatedMW: thermalProfile.dissipationMW,
    atmosphericTempC: thermalProfile.baseTempC,
    blackoutRisk: 0.0,
    coolingEfficiency: 1.0,
  };

  const totalPop = p.population || 50000;
  p.demographics = p.demographics ? { ...p.demographics } : {
    primaryLabor: Math.floor(totalPop * 0.50),
    technicians: Math.floor(totalPop * 0.35),
    intellectuals: Math.floor(totalPop * 0.15),
    morale: 85,
    healthIndex: 92,
    unrest: 3,
  };

  p.governance = p.governance ? {
    ...p.governance,
    localMinistries: p.governance.localMinistries ? { ...p.governance.localMinistries } : {
      infra: { budgetShare: 0.20, activeTasks: [] },
      energy: { budgetShare: 0.20, activeTasks: [] },
      economy: { budgetShare: 0.20, activeTasks: [] },
      welfare: { budgetShare: 0.20, activeTasks: [] },
      defense: { budgetShare: 0.20, activeTasks: [] },
    }
  } : {
    governor: null,
    localMinistries: {
      infra: { budgetShare: 0.20, activeTasks: [] },
      energy: { budgetShare: 0.20, activeTasks: [] },
      economy: { budgetShare: 0.20, activeTasks: [] },
      welfare: { budgetShare: 0.20, activeTasks: [] },
      defense: { budgetShare: 0.20, activeTasks: [] },
    }
  };

  // 2. Aplicar Subtareas Ministeriales Activas
  const activeTasks = [];
  Object.values(p.governance.localMinistries || {}).forEach(m => {
    if (Array.isArray(m.activeTasks)) {
      activeTasks.push(...m.activeTasks);
    }
  });

  let extraDissipation = 1.0;
  let activePollutionReduction = 0;
  let extraHeatMW = 0;

  if (activeTasks.includes('radiator_arrays')) extraDissipation += 0.25;
  if (activeTasks.includes('reactor_overdrive')) extraHeatMW += 500;
  if (activeTasks.includes('sludge_filtration')) {
    activePollutionReduction += 0.3;
  }

  // 3. Cálculo de Generación Térmica según Industria y Reactores
  const b = p.buildings || {};
  const industrialPowerMW = (b.metalMine || 0) * 80 + (b.crystalMine || 0) * 95 + (b.refinery || 0) * 300;
  const reactorPowerMW = (b.fusionReactor || 0) * 450 + (b.quantumReactor || 0) * 1200;
  
  const totalHeatGenerated = industrialPowerMW + reactorPowerMW + extraHeatMW;
  const totalDissipationCapacity = thermalProfile.dissipationMW * extraDissipation;

  p.thermalGrid.heatGeneratedMW = totalHeatGenerated;
  p.thermalGrid.heatDissipatedMW = totalDissipationCapacity;

  // Deriva de temperatura: si genera más calor del que disipa, la atmósfera se calienta
  const thermalDelta = (totalHeatGenerated - totalDissipationCapacity) / 1000;
  if (thermalDelta > 0) {
    p.thermalGrid.atmosphericTempC = Math.min(120, p.thermalGrid.atmosphericTempC + thermalDelta * 0.05);
  } else {
    // Retorno progresivo hacia la temperatura base del bioma
    p.thermalGrid.atmosphericTempC = p.thermalGrid.atmosphericTempC > thermalProfile.baseTempC
      ? Math.max(thermalProfile.baseTempC, p.thermalGrid.atmosphericTempC - 0.05)
      : Math.min(thermalProfile.baseTempC, p.thermalGrid.atmosphericTempC + 0.05);
  }

  // 4. Ciclo de Biosfera y Polución
  const miningPollution = ((b.metalMine || 0) + (b.refinery || 0) * 2 + (b.automatedMine || 0) * 1.5) * 0.02;
  const governorMod = p.governance.governor?.pollutionMod || 1.0;

  // Descontaminación por edificios y tecnologías especializadas
  const scrubbersClean = (b.pollutionScrubbers || 0) * 0.08;
  const waterClean = (b.waterTreatmentPlant || 0) * 0.04;
  const biomeDomeClean = (b.biomeDomeSimulation || 0) * 0.10;
  const ecoParkClean = (b.geosphericEcoPark || 0) * 0.06;
  const recycleTechBonus = 1 + (state.research?.wasteRecycleSystem || 0) * 0.08;
  const purifTechClean = (state.research?.purificationEngineer || 0) * 0.15;

  const totalCleaningPower = (activePollutionReduction + scrubbersClean + waterClean + biomeDomeClean + ecoParkClean + purifTechClean) * recycleTechBonus;
  const netPollutionDelta = (miningPollution * governorMod) - totalCleaningPower;

  p.biosphere.pollutionLevel = Math.max(0, Math.min(100, (p.biosphere.pollutionLevel || 0) + netPollutionDelta));

  // 5. Impacto en Moral, Salud Demográfica y Malestar Civil
  let healthPenalty = 0;
  if (p.biosphere.pollutionLevel > 50) healthPenalty += (p.biosphere.pollutionLevel - 50) * 0.4;
  if (p.thermalGrid.atmosphericTempC > 45) healthPenalty += (p.thermalGrid.atmosphericTempC - 45) * 0.5;

  // Detección de Fugas Atmosféricas: Si el bioma es hostil (barren, toxic, frozen) y no hay sellado activo
  const isHostileBiome = ['barren', 'toxic', 'frozen', 'volcanic'].includes(biomeKey);
  const isSealed = activeTasks.includes('seal_domes');
  if (isHostileBiome && !isSealed) {
    p.biosphere.leakDetected = true;
    healthPenalty += 15; // Penalización severa por fuga de presión
  } else {
    p.biosphere.leakDetected = false;
  }

  p.demographics.healthIndex = Math.max(10, Math.min(100, Math.round(95 - healthPenalty)));
  
  // La moral responde a la salud y al gobernador
  const govMoraleMod = p.governance.governor?.moraleMod || 1.0;
  const targetMorale = Math.round((p.demographics.healthIndex * 0.9) * govMoraleMod);
  p.demographics.morale = Math.max(5, Math.min(100, Math.round(p.demographics.morale * 0.95 + targetMorale * 0.05)));

  // Malestar social (unrest): aumenta si la moral cae por debajo de 50 o hay polución crítica
  const govUnrestMod = p.governance.governor?.unrestMod || 1.0;
  let targetUnrest = 0;
  if (p.demographics.morale < 50) targetUnrest += (50 - p.demographics.morale) * 1.5;
  if (p.biosphere.pollutionLevel > 60) targetUnrest += (p.biosphere.pollutionLevel - 60) * 0.8;
  if (p.biosphere.leakDetected) targetUnrest += 25;
  targetUnrest *= govUnrestMod;

  p.demographics.unrest = Math.max(0, Math.min(100, Math.round((p.demographics.unrest || 0) * 0.90 + targetUnrest * 0.10)));

  // Sincronizar población total con estratos
  p.demographics.primaryLabor = Math.floor(totalPop * 0.50);
  p.demographics.technicians = Math.floor(totalPop * 0.35);
  p.demographics.intellectuals = Math.floor(totalPop * 0.15);

  return p;
};